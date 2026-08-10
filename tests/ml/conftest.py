"""pytest fixtures for the ML service tests.

Spins up the FastAPI app with a TestClient and seeds a small, deterministic
set of orders into an isolated test database, so the ML engines have data to
train on without touching the dev DB.
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

import pytest

# Make the ML package importable.
ML_ROOT = Path(__file__).resolve().parents[2] / "Restaurant_POS_ML"
sys.path.insert(0, str(ML_ROOT))

TEST_URI = os.environ.get(
    "TEST_MONGODB_URI", "mongodb://localhost:27017/pos-db-mltest"
)
os.environ["MONGODB_URI"] = TEST_URI


@pytest.fixture(scope="session")
def seeded_db():
    from pymongo import MongoClient

    client = MongoClient(TEST_URI, serverSelectionTimeoutMS=5000)
    db = client.get_default_database()
    if db is None:
        db = client["pos-db-mltest"]

    db["orders"].delete_many({})

    dishes = ["Butter Chicken", "Butter Naan", "Gulab Jamun", "Masala Chai"]
    docs = []
    base = datetime.utcnow() - timedelta(days=30)
    for d in range(30):
        day = base + timedelta(days=d)
        for _ in range(5):
            items = [
                {"name": "Butter Chicken", "quantity": 1, "price": 320,
                 "pricePerQuantity": 320},
                {"name": "Butter Naan", "quantity": 2, "price": 120,
                 "pricePerQuantity": 60},
            ]
            total = sum(i["price"] for i in items)
            docs.append(
                {
                    "customerDetails": {"name": "T", "phone": "9", "guests": 2},
                    "orderStatus": "Completed",
                    "orderDate": day,
                    "createdAt": day,
                    "bills": {"total": total, "tax": total * 0.05,
                              "totalWithTax": total * 1.05},
                    "items": items,
                    "paymentMethod": "Cash",
                }
            )
    db["orders"].insert_many(docs)
    yield db
    db["orders"].delete_many({})
    client.close()


@pytest.fixture(scope="session")
def client(seeded_db):
    from fastapi.testclient import TestClient
    from app.main import app

    return TestClient(app)
