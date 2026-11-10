"""Hybrid E5 and TF-IDF product recommendations."""

from __future__ import annotations

import hashlib
import logging
import os
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple, Union
from urllib.parse import unquote, urlparse

os.environ.setdefault("OMP_NUM_THREADS", os.getenv("E5_CPU_THREADS", "2"))
os.environ.setdefault("MKL_NUM_THREADS", os.getenv("E5_CPU_THREADS", "2"))
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

import mysql.connector
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)
ProductId = Union[int, str]


class ProductSourceUnavailable(RuntimeError):
    """Production product data could not be read from MySQL."""

DEFAULT_CSV_PATH = Path(__file__).parent / "data" / "kombolcha_factories_products_500.csv"
MYSQL_QUERY = """
    SELECT
        p.product_id,
        p.product_name,
        COALESCE(p.description, '') AS description,
        p.price,
        p.stock_quantity,
        p.availability_status,
        p.category_id,
        c.category_name,
        p.factory_id,
        COALESCE(f.factory_name, 'Platform') AS factory_name,
        p.created_at
    FROM product AS p
    LEFT JOIN category AS c ON c.category_id = p.category_id
    LEFT JOIN factory AS f ON f.factory_id = p.factory_id
    WHERE p.availability_status = 'AVAILABLE'
      AND p.stock_quantity > 0
    ORDER BY p.created_at DESC, p.product_id DESC
"""


def normalize_scores(scores: Sequence[float]) -> np.ndarray:
    """Min-max normalize one similarity vector, preserving all-zero vectors."""
    values = np.asarray(scores, dtype=np.float32)
    if values.size == 0:
        return values
    low = float(np.min(values))
    high = float(np.max(values))
    if high <= 1e-12:
        return np.zeros_like(values)
    if high - low <= 1e-12:
        return np.ones_like(values)
    return (values - low) / (high - low)


class ProductRecommender:
    """Build recommendation scores from current products and customer history.

    Production defaults to MySQL. CSV mode is opt-in for local development and
    tests because the supplied CSV contains estimated variant pricing/stock and
    SKU strings that do not correspond to production database product IDs.
    """

    MODEL_NAME = "intfloat/multilingual-e5-small"

    def __init__(
        self,
        data_source: Optional[str] = None,
        csv_path: Optional[Union[str, Path]] = None,
        model=None,
    ) -> None:
        self.data_source = (data_source or os.getenv("AI_DATA_SOURCE", "mysql")).lower()
        if self.data_source not in {"mysql", "csv"}:
            raise ValueError("AI_DATA_SOURCE must be 'mysql' or 'csv'")
        self.csv_path = Path(csv_path or os.getenv("PRODUCTS_CSV_PATH", DEFAULT_CSV_PATH))
        self.default_top_n = int(os.getenv("RECOMMENDATION_TOP_N", "8"))
        self.e5_weight = float(os.getenv("E5_WEIGHT", "0.70"))
        self.tfidf_weight = float(os.getenv("TFIDF_WEIGHT", "0.30"))
        if self.e5_weight < 0 or self.tfidf_weight < 0 or self.e5_weight + self.tfidf_weight <= 0:
            raise ValueError("E5_WEIGHT and TFIDF_WEIGHT must be nonnegative and not both zero")
        weight_sum = self.e5_weight + self.tfidf_weight
        self.e5_weight /= weight_sum
        self.tfidf_weight /= weight_sum

        self.products_df = pd.DataFrame()
        self.tfidf_matrix = None
        self.product_embeddings: Optional[np.ndarray] = None
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000,
            min_df=1,
        )
        self._model = model
        self._product_fingerprint: Optional[str] = None
        self._features: List[str] = []
        self.last_scores: Dict[str, np.ndarray] = {}

    def _get_embedding_model(self):
        """Load the CPU model lazily and retain one instance per service process."""
        if self._model is None:
            try:
                import torch
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise RuntimeError(
                    "Sentence Transformers is not installed. Install ai-service/requirements.txt."
                ) from exc

            torch.set_num_threads(max(1, int(os.getenv("E5_CPU_THREADS", "2"))))
            self._model = SentenceTransformer(self.MODEL_NAME, device="cpu")
            self._model.max_seq_length = 256
            logger.info("Loaded %s on CPU", self.MODEL_NAME)
        return self._model

    def _read_mysql_products(self) -> pd.DataFrame:
        database_url = os.getenv("DATABASE_URL", "").strip()
        if not database_url:
            raise RuntimeError("DATABASE_URL is required when AI_DATA_SOURCE=mysql")
        parsed = urlparse(database_url)
        if parsed.scheme not in {"mysql", "mysql+mysqlconnector"}:
            raise RuntimeError("DATABASE_URL must use mysql:// or mysql+mysqlconnector://")
        if not parsed.hostname or not parsed.path.strip("/"):
            raise RuntimeError("DATABASE_URL must include a MySQL host and database name")

        connection = mysql.connector.connect(
            host=parsed.hostname,
            port=parsed.port or 3306,
            user=unquote(parsed.username or ""),
            password=unquote(parsed.password or ""),
            database=unquote(parsed.path.lstrip("/")),
            connection_timeout=5,
        )
        try:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(MYSQL_QUERY)
                rows = cursor.fetchall()
            finally:
                cursor.close()
        finally:
            connection.close()
        return pd.DataFrame(rows)

    def _read_csv_products(self) -> pd.DataFrame:
        if not self.csv_path.is_file():
            raise FileNotFoundError(f"Development product CSV not found: {self.csv_path}")
        frame = pd.read_csv(self.csv_path, encoding="utf-8-sig")
        required_columns = {"product_id", "product_name", "description", "category_name", "factory_name"}
        missing = sorted(required_columns - set(frame.columns))
        if missing:
            raise ValueError(f"CSV is missing required columns: {', '.join(missing)}")

        # This dataset labels its stock as estimates; it is used only to build
        # development rankings, never returned as authoritative product data.
        if "availability" in frame.columns:
            frame = frame[frame["availability"].astype(str).str.casefold().isin({"in stock", "available"})]
        if "stock_quantity" in frame.columns:
            stock = pd.to_numeric(frame["stock_quantity"], errors="coerce").fillna(0)
            frame = frame[stock > 0]
        return frame.reset_index(drop=True)

    def _load_products(self) -> pd.DataFrame:
        if self.data_source == "csv":
            return self._read_csv_products()
        return self._read_mysql_products()

    @staticmethod
    def _value(row: pd.Series, column: str) -> str:
        value = row.get(column, "")
        if pd.isna(value):
            return ""
        return str(value).strip()

    def _feature_text(self, row: pd.Series) -> str:
        fields = [
            self._value(row, "product_name"),
            self._value(row, "category_name"),
            self._value(row, "description"),
            self._value(row, "factory_name"),
            self._value(row, "material"),
            self._value(row, "color"),
            self._value(row, "size_or_specification"),
            self._value(row, "unit"),
            self._value(row, "tags"),
            self._value(row, "target_market"),
        ]
        return " ".join(field for field in fields if field).lower()

    def _fingerprint(self, frame: pd.DataFrame, features: List[str]) -> str:
        identity_columns = ["product_id"]
        identity = []
        for _, row in frame.iterrows():
            identity.append("|".join(self._value(row, column) for column in identity_columns))
        raw = "\n".join(f"{item}|{feature}" for item, feature in zip(identity, features))
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def refresh_products(self, force_rebuild: bool = False) -> int:
        """Refresh current product truth, reusing embeddings when rows are unchanged."""
        try:
            frame = self._load_products()
        except Exception as exc:
            if self.data_source == "mysql":
                logger.exception("Could not read current MySQL product data")
                raise ProductSourceUnavailable("MySQL product source unavailable") from exc
            raise
        if frame.empty:
            self.products_df = frame
            self.tfidf_matrix = None
            self.product_embeddings = None
            self._features = []
            self._product_fingerprint = None
            logger.info("No eligible products were found in %s", self.data_source)
            return 0

        required = {"product_id", "product_name", "category_name", "factory_name"}
        missing = sorted(required - set(frame.columns))
        if missing:
            raise ValueError(f"Product source is missing columns: {', '.join(missing)}")

        frame = frame.reset_index(drop=True)
        features = [self._feature_text(row) for _, row in frame.iterrows()]
        fingerprint = self._fingerprint(frame, features)
        self.products_df = frame
        if force_rebuild or fingerprint != self._product_fingerprint:
            self._features = features
            self._product_fingerprint = fingerprint
            self.tfidf_matrix = self.vectorizer.fit_transform(features)
            product_passages = [f"passage: {feature}" for feature in features]
            model = self._get_embedding_model()
            self.product_embeddings = model.encode(
                product_passages,
                batch_size=32,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,
                device="cpu",
            )
            self.product_embeddings = np.asarray(self.product_embeddings, dtype=np.float32)
            logger.info("Built TF-IDF and E5 product cache for %d products", len(frame))
        return len(frame)

    def _matches_filter(self, frame: pd.DataFrame, column: str, value: Optional[Union[int, str]]) -> pd.Series:
        if value is None or str(value).strip() == "":
            return pd.Series(True, index=frame.index)
        id_column = f"{column}_id"
        if id_column in frame.columns and str(value).isdigit():
            return pd.to_numeric(frame[id_column], errors="coerce") == int(value)
        name_column = "category_name" if column == "category" else "factory_name"
        if name_column not in frame.columns:
            return pd.Series(False, index=frame.index)
        return frame[name_column].fillna("").astype(str).str.casefold() == str(value).strip().casefold()

    def recommend(
        self,
        buyer_id: int,
        search_history: List[Dict],
        top_n: Optional[int] = None,
        category_filter: Optional[Union[int, str]] = None,
        factory_filter: Optional[Union[int, str]] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
    ) -> Tuple[List[ProductId], Optional[str]]:
        """Rank products for customer history and optional category/factory filters."""
        if top_n is None:
            top_n = self.default_top_n
        top_n = max(1, min(int(top_n), 100))

        # Pull production rows on every request so availability and stock
        # changes take effect immediately. Feature embeddings remain cached.
        if self.data_source == "mysql" or self.products_df.empty:
            self.refresh_products()
        if self.products_df.empty or self.tfidf_matrix is None or self.product_embeddings is None:
            return [], None

        frame = self.products_df
        eligible_mask = self._matches_filter(frame, "category", category_filter)
        eligible_mask &= self._matches_filter(frame, "factory", factory_filter)
        price_column = "price" if "price" in frame.columns else "price_etb"
        if min_price is not None:
            eligible_mask &= pd.to_numeric(frame[price_column], errors="coerce") >= min_price
        if max_price is not None:
            eligible_mask &= pd.to_numeric(frame[price_column], errors="coerce") <= max_price
        eligible_indices = np.flatnonzero(eligible_mask.to_numpy())
        if eligible_indices.size == 0:
            return [], None

        history = [item for item in search_history if isinstance(item, dict)]
        query_parts: List[str] = []
        categories: List[str] = []
        for item in history:
            keyword = str(item.get("keyword") or "").strip()
            category = str(item.get("category") or "").strip()
            if keyword:
                query_parts.append(keyword)
            if category:
                query_parts.append(category)
                categories.append(category)

        if not query_parts:
            self.last_scores = {"e5": np.zeros(len(eligible_indices)), "tfidf": np.zeros(len(eligible_indices)), "hybrid": np.zeros(len(eligible_indices))}
            return frame.iloc[eligible_indices[:top_n]]["product_id"].tolist(), None

        query_text = " ".join(query_parts).lower()
        query_embedding = self._get_embedding_model().encode(
            [f"query: {query_text}"],
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,
            device="cpu",
        )
        e5_scores = cosine_similarity(
            np.asarray(query_embedding, dtype=np.float32),
            self.product_embeddings[eligible_indices],
        ).flatten()
        tfidf_query = self.vectorizer.transform([query_text])
        tfidf_scores = cosine_similarity(
            tfidf_query,
            self.tfidf_matrix[eligible_indices],
        ).flatten()

        normalized_e5 = normalize_scores(e5_scores)
        normalized_tfidf = normalize_scores(tfidf_scores)
        hybrid_scores = self.e5_weight * normalized_e5 + self.tfidf_weight * normalized_tfidf
        self.last_scores = {"e5": normalized_e5, "tfidf": normalized_tfidf, "hybrid": hybrid_scores}

        ranked_local = np.argsort(-hybrid_scores, kind="stable")[:top_n]
        ranked_indices = eligible_indices[ranked_local]
        dominant_category = Counter(categories).most_common(1)[0][0] if categories else None
        ids = frame.iloc[ranked_indices]["product_id"].tolist()
        logger.info(
            "Generated %d hybrid recommendations (buyer_id=%s, candidates=%d)",
            len(ids), buyer_id, len(eligible_indices),
        )
        return ids, dominant_category
