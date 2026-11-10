from pathlib import Path
from tempfile import TemporaryDirectory
import os
import unittest
from unittest.mock import patch

import numpy as np
import pandas as pd

from recommender import MYSQL_QUERY, ProductRecommender, normalize_scores
from recommender import ProductSourceUnavailable
import main as api


CSV_PATH = Path(__file__).parents[1] / "data" / "kombolcha_factories_products_500.csv"


class DeterministicEncoder:
    """Small test double: avoids downloading/loading the pretrained model."""

    def __init__(self):
        self.inputs = []

    def encode(self, texts, **_kwargs):
        self.inputs.extend(texts)
        vocabulary = ("cotton", "steel", "bedding", "rebar", "textile", "metal")
        vectors = []
        for text in texts:
            lowered = text.casefold()
            vectors.append([float(token in lowered) for token in vocabulary])
        vectors = np.asarray(vectors, dtype=np.float32)
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        return vectors / np.maximum(norms, 1e-12)


def make_csv_recommender():
    model = DeterministicEncoder()
    recommender = ProductRecommender(data_source="csv", csv_path=CSV_PATH, model=model)
    recommender.refresh_products()
    return recommender, model


class ProductRecommenderTests(unittest.TestCase):
    def test_csv_uses_real_columns_and_returns_real_dataset_skus(self):
        frame = pd.read_csv(CSV_PATH, encoding="utf-8-sig")
        self.assertTrue({
            "product_id", "product_name", "description", "category_name",
            "factory_name", "availability", "stock_quantity", "price_etb",
        }.issubset(frame.columns))

        recommender, model = make_csv_recommender()
        ids, _category = recommender.recommend(
            buyer_id=23,
            search_history=[{"keyword": "cotton bedding", "category": "Home Textiles"}],
            top_n=5,
        )

        self.assertGreater(len(ids), 0)
        self.assertLessEqual(len(ids), 5)
        self.assertTrue(all(isinstance(product_id, str) and product_id.startswith("KMB-") for product_id in ids))
        self.assertTrue(any(text.startswith("passage: ") for text in model.inputs))
        self.assertTrue(any(text.startswith("query: ") for text in model.inputs))
        self.assertGreater(recommender.last_scores["tfidf"].max(), 0)

    def test_category_factory_filters_and_top_n_apply_to_csv(self):
        frame = pd.read_csv(CSV_PATH, encoding="utf-8-sig")
        category = frame.iloc[0]["category_name"]
        factory = frame.iloc[0]["factory_name"]
        expected = frame[
            (frame["category_name"] == category)
            & (frame["factory_name"] == factory)
            & (frame["stock_quantity"] > 0)
            & (frame["availability"].str.casefold().isin({"in stock", "available"}))
        ]

        recommender, _model = make_csv_recommender()
        ids, _category = recommender.recommend(
            buyer_id=1,
            search_history=[{"keyword": "textile"}],
            top_n=3,
            category_filter=category,
            factory_filter=factory,
        )

        self.assertLessEqual(len(ids), 3)
        self.assertTrue(set(ids).issubset(set(expected["product_id"].tolist())))

    def test_product_embeddings_are_reused_when_catalog_text_is_unchanged(self):
        recommender, model = make_csv_recommender()
        passage_count = sum(text.startswith("passage: ") for text in model.inputs)

        recommender.refresh_products()
        recommender.recommend(buyer_id=1, search_history=[{"keyword": "cotton"}])

        self.assertEqual(
            sum(text.startswith("passage: ") for text in model.inputs),
            passage_count,
        )
        self.assertEqual(sum(text.startswith("query: ") for text in model.inputs), 1)

    def test_min_max_normalization_handles_zero_and_constant_scores(self):
        np.testing.assert_array_equal(normalize_scores([0, 0, 0]), [0, 0, 0])
        np.testing.assert_array_equal(normalize_scores([0.5, 0.5]), [1, 1])
        np.testing.assert_allclose(normalize_scores([1, 2, 3]), [0, 0.5, 1])

    def test_mysql_source_only_selects_current_available_stock(self):
        self.assertIn("p.availability_status = 'AVAILABLE'", MYSQL_QUERY)
        self.assertIn("p.stock_quantity > 0", MYSQL_QUERY)
        self.assertIn("LEFT JOIN category", MYSQL_QUERY)
        self.assertIn("LEFT JOIN factory", MYSQL_QUERY)

    def test_invalid_weights_are_rejected(self):
        with patch.dict(os.environ, {"E5_WEIGHT": "0", "TFIDF_WEIGHT": "0"}):
            with self.assertRaisesRegex(ValueError, "not both zero"):
                ProductRecommender(data_source="csv", csv_path=CSV_PATH, model=DeterministicEncoder())

    def test_csv_schema_errors_report_missing_actual_fields(self):
        with TemporaryDirectory() as temp_dir:
            broken_csv = Path(temp_dir) / "broken.csv"
            broken_csv.write_text("product_id,product_name\n1,Sample\n", encoding="utf-8")
            recommender = ProductRecommender(data_source="csv", csv_path=broken_csv, model=DeterministicEncoder())

            with self.assertRaisesRegex(ValueError, "description"):
                recommender.refresh_products()

    def test_compatible_api_fields_and_csv_product_keys(self):
        class StubRecommender:
            def recommend(self, **kwargs):
                self.request = kwargs
                return ["KMB-HTX-0001", 17], "Home Textiles"

        stub = StubRecommender()
        with patch.object(api, "recommender", stub):
            response = api.get_recommendations(
                api.RecommendationRequest(
                    buyer_id=7,
                    search_history=[{"keyword": "linen", "category": "Home Textiles"}],
                    category_filter=3,
                    factory_filter=4,
                    top_n=6,
                )
            )

        self.assertEqual(response.product_ids, [17])
        self.assertEqual(response.product_keys, ["KMB-HTX-0001"])
        self.assertEqual(response.category, "Home Textiles")
        self.assertEqual(stub.request["category_filter"], 3)
        self.assertEqual(stub.request["factory_filter"], 4)
        self.assertEqual(stub.request["top_n"], 6)

    def test_data_source_errors_return_service_unavailable(self):
        class FailingRecommender:
            def recommend(self, **_kwargs):
                raise ProductSourceUnavailable("database unavailable")

        with patch.object(api, "recommender", FailingRecommender()):
            with self.assertRaises(api.HTTPException) as raised:
                api.get_recommendations(api.RecommendationRequest(buyer_id=2))

        self.assertEqual(raised.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main()
