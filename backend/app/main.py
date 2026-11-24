"""
FarmFriend AI — FastAPI Main Application
==========================================
"""

import os
import sys

# Ensure project root is on path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.database.db import init_db
from backend.app.api import (
    routes_farmer, routes_prediction, routes_whatif,
    routes_ai, routes_analytics, routes_feedback, routes_intelligence,
    routes_iot, routes_crops, routes_synthetic,
    routes_soil_intelligence, routes_marketplace, routes_farmer_economics
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB and pre-load ML model."""
    print("FarmFriend AI — Starting up...")
    init_db()
    try:
        from ml.predict import predictor
        predictor.load()
        print("ML model loaded successfully.")
    except FileNotFoundError as e:
        print(f"WARNING: {e}")
        print("Run 'python data/scripts/build_training_dataset.py && python ml/train.py' first.")
    yield
    print("FarmFriend AI — Shutting down.")


app = FastAPI(
    title="AgriN — Regenerative Agricultural Intelligence",
    description=(
        "Pan-India AI-powered agricultural intelligence and regenerative decision support. "
        "Provides localized crop recommendations, Soil Health Card diagnostics, multi-source weather telemetry, "
        "satellite remote sensing abstraction, plant pathology triage, farm resilience scoring, and BRICS interoperability."
    ),
    version="2.0.0",
    lifespan=lifespan
)

# CORS — explicit trusted origins only (never wildcard "*" alongside allow_credentials=True)
_EXTRA_ORIGINS = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
]
ALLOWED_ORIGINS = list(dict.fromkeys([
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    *_EXTRA_ORIGINS,
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Device-Token", "X-Request-ID"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(routes_farmer.router, prefix="/api", tags=["Farm & Validation"])
app.include_router(routes_prediction.router, prefix="/api", tags=["Crop Prediction"])
app.include_router(routes_whatif.router, prefix="/api", tags=["What-If Simulation"])
app.include_router(routes_ai.router, prefix="/api", tags=["AI Explanation"])
app.include_router(routes_analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(routes_feedback.router, prefix="/api", tags=["Feedback"])
app.include_router(routes_intelligence.router, prefix="/api", tags=["Agricultural Intelligence & Provenance"])
app.include_router(routes_iot.router, prefix="/api", tags=["IoT & Hardware"])
app.include_router(routes_crops.router, prefix="/api", tags=["Crop Catalogue & Knowledge"])
app.include_router(routes_synthetic.router, prefix="/api", tags=["Synthetic Data Engine"])
app.include_router(routes_soil_intelligence.router, prefix="/api", tags=["Soil Intelligence"])
app.include_router(routes_marketplace.router, prefix="/api", tags=["AgriMarket"])
app.include_router(routes_farmer_economics.router, prefix="/api", tags=["Farm Economics (AgriLedger)"])


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "AgriN — Regenerative Agricultural Intelligence",
        "version": "2.0.0",
        "track": "BRICS Track 4 — AgriN & Regenerative Agricultural Intelligence",
        "tagline": "Localized Agricultural Intelligence, Multi-Source Fusion & BRICS Cooperation",
        "status": "running",
        "disclaimer": (
            "AgriN provides data-driven agronomic decision support. "
            "It does not replace professional agricultural extension services or laboratory soil assays."
        )
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
