"""
Content-Based Product Recommendation Engine
Uses TF-IDF vectorization on product features + cosine similarity
"""

import os
import logging
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import mysql.connector
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class ProductRecommender:
    """
    Content-based filtering recommender.
    Builds a TF-IDF matrix from product features (name, description, category)
    and recommends products similar to the buyer's search history.
    """

    def __init__(self):
        self.products_df: Optional[pd.DataFrame] = None
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000,
            min_df=1,
        )
        self.load_products()
        self.build_model()

    def _get_db_connection(self):
        """Create a MySQL database connection."""
        db_url = os.getenv("DATABASE_URL", "")
        # Parse mysql+mysqlconnector://user:pass@host:port/db
        try:
            parts = db_url.replace("mysql+mysqlconnector://", "").split("@")
            user_pass = parts[0].split(":")
            host_db = parts[1].split("/")
            host_port = host_db[0].split(":")
            return mysql.connector.connect(
                host=host_port[0],
                port=int(host_port[1]) if len(host_port) > 1 else 3306,
                user=user_pass[0],
                password=user_pass[1] if len(user_pass) > 1 else "",
                database=host_db[1],
            )
        except Exception as e:
            logger.error(f"DB connection error: {e}")
            return None

    def load_products(self):
        """Load product data from the database."""
        try:
            conn = self._get_db_connection()
            if conn is None:
                logger.warning("Using sample data (DB unavailable)")
                self._load_sample_data()
                return

            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT
                    p.product_id,
                    p.product_name,
                    COALESCE(p.description, '') AS description,
                    p.price,
                    p.stock_quantity,
                    p.availability_status,
                    c.category_name,
                    f.factory_name
                FROM Product p
                JOIN Category c ON p.category_id = c.category_id
                JOIN Factory f ON p.factory_id = f.factory_id
                WHERE p.availability_status = 'AVAILABLE'
            """)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            if rows:
                self.products_df = pd.DataFrame(rows)
                logger.info(f"Loaded {len(self.products_df)} products from DB")
            else:
                logger.warning("No products in DB, using sample data")
                self._load_sample_data()

        except Exception as e:
            logger.error(f"Failed to load products: {e}")
            self._load_sample_data()

    def _load_sample_data(self):
        """Fallback sample product data for development."""
        self.products_df = pd.DataFrame([
            {"product_id": 1, "product_name": "Cotton Fabric Roll", "description": "High quality cotton fabric", "price": 450, "category_name": "Textiles", "factory_name": "Kombolcha Textile"},
            {"product_id": 2, "product_name": "Polyester Blend Fabric", "description": "Durable polyester cotton blend", "price": 320, "category_name": "Textiles", "factory_name": "Kombolcha Textile"},
            {"product_id": 3, "product_name": "Steel Rebar 12mm", "description": "High strength deformed steel rebar", "price": 1200, "category_name": "Steel & Metal", "factory_name": "Ethio Steel"},
            {"product_id": 4, "product_name": "Galvanized Steel Sheet", "description": "Zinc coated galvanized steel sheet", "price": 2800, "category_name": "Steel & Metal", "factory_name": "Ethio Steel"},
            {"product_id": 5, "product_name": "Hollow Concrete Block", "description": "Standard hollow concrete block", "price": 25, "category_name": "Construction Materials", "factory_name": "Kombolcha Textile"},
        ])

    def build_model(self):
        """Build the TF-IDF model from product features."""
        if self.products_df is None or len(self.products_df) == 0:
            logger.warning("No products to build model from")
            return

        # Combine features into a single text representation
        self.products_df['features'] = (
            self.products_df['product_name'].fillna('') + ' ' +
            self.products_df['category_name'].fillna('') + ' ' +
            self.products_df['description'].fillna('') + ' ' +
            self.products_df['factory_name'].fillna('')
        ).str.lower()

        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df['features'])
            logger.info(f"TF-IDF matrix built: {self.tfidf_matrix.shape}")
        except Exception as e:
            logger.error(f"Failed to build TF-IDF model: {e}")

    def recommend(
        self,
        buyer_id: int,
        search_history: List[Dict],
        top_n: int = 8
    ) -> Tuple[List[int], Optional[str]]:
        """
        Generate product recommendations based on buyer's search history.

        Args:
            buyer_id: The buyer's ID
            search_history: List of {keyword, category} dicts
            top_n: Number of recommendations to return

        Returns:
            Tuple of (product_ids, dominant_category)
        """
        if self.products_df is None or self.tfidf_matrix is None:
            return [], None

        if not search_history:
            # Return popular/recent products if no history
            return self.products_df['product_id'].head(top_n).tolist(), None

        # Build query from search history
        query_parts = []
        categories = []

        for item in search_history:
            if item.get('keyword'):
                query_parts.append(item['keyword'])
            if item.get('category'):
                query_parts.append(item['category'])
                categories.append(item['category'])

        if not query_parts:
            return self.products_df['product_id'].head(top_n).tolist(), None

        query = ' '.join(query_parts).lower()

        # Determine dominant category from history
        dominant_category = None
        if categories:
            from collections import Counter
            dominant_category = Counter(categories).most_common(1)[0][0]

        try:
            # Vectorize the query
            query_vector = self.vectorizer.transform([query])

            # Compute cosine similarity
            similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

            # Get top N indices
            top_indices = np.argsort(similarities)[::-1][:top_n]

            # Filter out zero-similarity results
            top_indices = [i for i in top_indices if similarities[i] > 0]

            if not top_indices:
                # Fallback: return products from dominant category
                if dominant_category:
                    cat_products = self.products_df[
                        self.products_df['category_name'].str.lower() == dominant_category.lower()
                    ]
                    return cat_products['product_id'].head(top_n).tolist(), dominant_category
                return self.products_df['product_id'].head(top_n).tolist(), None

            product_ids = self.products_df.iloc[top_indices]['product_id'].tolist()
            return product_ids, dominant_category

        except Exception as e:
            logger.error(f"Recommendation computation error: {e}")
            return [], None
