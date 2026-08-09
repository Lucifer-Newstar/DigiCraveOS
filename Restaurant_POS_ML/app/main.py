"""Restaurant POS ML microservice (FastAPI).

Exposes prediction endpoints consumed by the POS Node backend (which
proxies them under /api/ml/*). Reads directly from the existing MongoDB
so it always reflects the live POS data & schema.
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import demand, forecasting, recommender
from .config import CORS_ORIGINS
from .db import count_orders, ping

app = FastAPI(
    title="Restaurant POS ML Service",
    version="1.0.0",
    description="Sales forecasting, dish recommendations, and demand prediction "
    "for the DigiCraveOS Restaurant POS.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    items: list[str] = []
    limit: int = 5


@app.get("/health")
def health():
    db_ok = ping()
    return {
        "status": "ok" if db_ok else "degraded",
        "database_connected": db_ok,
        "orders_in_db": count_orders() if db_ok else 0,
    }


@app.get("/forecast")
def get_forecast(horizon_days: int = Query(7, ge=1, le=60)):
    """Predict upcoming daily revenue and order volume."""
    return forecasting.forecast(horizon_days=horizon_days)


@app.get("/demand")
def get_demand(
    target_date: str | None = Query(None, description="YYYY-MM-DD"),
    top: int = Query(12, ge=1, le=100),
):
    """Predict per-dish demand for a given day (default: next day)."""
    return demand.predict(target_date=target_date, top=top)


@app.get("/popular")
def get_popular(limit: int = Query(10, ge=1, le=100)):
    """Most-ordered dishes (from real line-item history)."""
    return {"dishes": recommender.top_dishes(limit=limit)}


@app.post("/recommend")
def post_recommend(req: RecommendRequest):
    """Recommend dishes to pair with the current cart."""
    return recommender.recommend(req.items, limit=req.limit)


@app.get("/recommend")
def get_recommend(
    items: str = Query("", description="Comma-separated dish names in the cart"),
    limit: int = Query(5, ge=1, le=50),
):
    cart = [i.strip() for i in items.split(",") if i.strip()]
    return recommender.recommend(cart, limit=limit)


@app.get("/")
def root():
    return {
        "service": "Restaurant POS ML",
        "endpoints": ["/health", "/forecast", "/demand", "/popular", "/recommend"],
    }
