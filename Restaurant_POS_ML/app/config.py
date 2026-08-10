"""Central configuration loaded from environment / .env file."""
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/pos-db")
ML_PORT = int(os.getenv("ML_PORT", "8100"))
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:8000"
    ).split(",")
    if o.strip()
]
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "models"))

os.makedirs(MODEL_DIR, exist_ok=True)
