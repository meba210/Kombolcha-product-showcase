"""FastAPI interface for the hybrid E5 + TF-IDF recommender."""

from __future__ import annotations

import logging
import os
from typing import List, Optional, Union

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()
from recommender import ProductRecommender

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Recommendation Service",
    description="Hybrid multilingual semantic and TF-IDF recommendations",
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = ProductRecommender()


class SearchHistoryItem(BaseModel):
    keyword: str = ""
    category: Optional[str] = None


class RecommendationRequest(BaseModel):
    # Public product search does not require a signed-in buyer. Existing
    # personalized requests continue passing their database buyer_id.
    buyer_id: int = Field(default=1, ge=1)
    search_history: List[SearchHistoryItem] = Field(default_factory=list)
    query: Optional[str] = None
    category_filter: Optional[Union[int, str]] = None
    factory_filter: Optional[Union[int, str]] = None
    top_n: Optional[int] = Field(default=None, ge=1, le=100)
    min_price: Optional[float] = Field(default=None, ge=0)
    max_price: Optional[float] = Field(default=None, ge=0)


class RecommendationResponse(BaseModel):
    buyer_id: int
    # Existing Express integration consumes integer product_ids. CSV development
    # SKUs are exposed separately and are never treated as production records.
    product_ids: List[int]
    product_keys: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    message: str


@app.on_event("startup")
def initialize_product_cache() -> None:
    try:
        count = recommender.refresh_products()
        logger.info("Recommendation service ready with %d eligible products", count)
    except Exception:
        # Let health and non-recommendation endpoints continue to work. A
        # production recommendation call returns 503 until MySQL is available.
        logger.exception("Could not initialize recommendation product cache")


@app.get("/health")
def health_check():
    return {"status": "OK", "service": "AI Recommendation Engine"}


@app.post("/recommend", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    """Keep the established endpoint fields while adding filters and top-N."""
    try:
        history = [item.model_dump() for item in request.search_history]
        if request.query and request.query.strip():
            history.insert(0, {"keyword": request.query.strip(), "category": None})
        ids, category = recommender.recommend(
            buyer_id=request.buyer_id,
            search_history=history,
            top_n=request.top_n,
            category_filter=request.category_filter,
            factory_filter=request.factory_filter,
            min_price=request.min_price,
            max_price=request.max_price,
        )
        product_ids: List[int] = []
        product_keys: List[str] = []
        for product_id in ids:
            try:
                product_ids.append(int(product_id))
            except (TypeError, ValueError):
                product_keys.append(str(product_id))

        return RecommendationResponse(
            buyer_id=request.buyer_id,
            product_ids=product_ids,
            product_keys=product_keys,
            category=category,
            message=f"Generated {len(ids)} recommendations",
        )
    except (ConnectionError, TimeoutError) as exc:
        logger.exception("Recommendation data source unavailable for buyer %s", request.buyer_id)
        raise HTTPException(status_code=503, detail="Recommendation data source is unavailable") from exc
    except RuntimeError as exc:
        logger.exception("Recommendation service unavailable for buyer %s", request.buyer_id)
        raise HTTPException(status_code=503, detail="Recommendation service is unavailable") from exc
    except Exception as exc:
        logger.exception("Recommendation error for buyer %s", request.buyer_id)
        raise HTTPException(status_code=500, detail="Failed to generate recommendations") from exc


@app.post("/retrain")
def retrain_model():
    """Reload MySQL/CSV products and rebuild the feature/embedding cache."""
    try:
        count = recommender.refresh_products(force_rebuild=True)
        return {"message": "Model retrained successfully", "product_count": count}
    except Exception as exc:
        logger.exception("Failed to retrain recommendation model")
        raise HTTPException(status_code=503, detail="Failed to refresh recommendation data") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
