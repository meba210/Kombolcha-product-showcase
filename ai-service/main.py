"""
AI Recommendation Service
Content-Based Filtering using scikit-learn TF-IDF + Cosine Similarity
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from dotenv import load_dotenv

from recommender import ProductRecommender

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Recommendation Service",
    description="Content-based product recommendation engine for Kombolcha Showcase",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommender
recommender = ProductRecommender()


class SearchHistoryItem(BaseModel):
    keyword: str
    category: Optional[str] = None


class RecommendationRequest(BaseModel):
    buyer_id: int
    search_history: List[SearchHistoryItem] = []


class RecommendationResponse(BaseModel):
    buyer_id: int
    product_ids: List[int]
    category: Optional[str] = None
    message: str


@app.get("/health")
def health_check():
    return {"status": "OK", "service": "AI Recommendation Engine"}


@app.post("/recommend", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    """
    Generate personalized product recommendations based on buyer's search history.
    Uses content-based filtering with TF-IDF vectorization and cosine similarity.
    """
    try:
        logger.info(f"Generating recommendations for buyer {request.buyer_id}")

        product_ids, category = recommender.recommend(
            buyer_id=request.buyer_id,
            search_history=[
                {"keyword": item.keyword, "category": item.category}
                for item in request.search_history
            ]
        )

        return RecommendationResponse(
            buyer_id=request.buyer_id,
            product_ids=product_ids,
            category=category,
            message=f"Generated {len(product_ids)} recommendations"
        )

    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/retrain")
def retrain_model():
    """Retrain the recommendation model with latest data."""
    try:
        recommender.load_products()
        recommender.build_model()
        return {"message": "Model retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
