"""
AgriN — Synthetic Data Engine API Routes
=========================================
Exposes metadata, data manifests, provenance disclosures, and sample queries
for the AgriN Synthetic Agricultural Engine.
"""

import os
import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
GENERATED_DIR = os.path.join(BASE_DIR, "data", "synthetic", "generated")
MANIFEST_PATH = os.path.join(GENERATED_DIR, "data_manifest.json")
DATASET_PATH = os.path.join(GENERATED_DIR, "synthetic_agricultural_dataset.json")


@router.get("/synthetic/metadata", summary="Get synthetic dataset manifest and provenance")
def get_synthetic_metadata():
    if not os.path.exists(MANIFEST_PATH):
        return {
            "status": "NOT_GENERATED",
            "message": "Synthetic dataset not yet generated. Run python data/synthetic/scripts/run_synthetic_engine.py",
            "is_synthetic": True,
            "disclaimer": "Synthetic data is generated for software UI verification and testing only."
        }
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    return manifest


@router.get("/synthetic/sample", summary="Get sample synthetic records for demo/testing")
def get_synthetic_sample(limit: int = Query(10, ge=1, le=100)):
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(status_code=404, detail="Synthetic dataset not generated yet.")
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {
        "is_synthetic": True,
        "disclaimer": "SYNTHETIC OBSERVATIONS FOR UI DEMO ONLY — DO NOT USE AS FIELD VALIDATION",
        "total_records": len(data),
        "sample": data[:limit]
    }


@router.get("/synthetic/scenarios", summary="List supported anomaly test scenarios")
def get_synthetic_scenarios():
    return {
        "scenarios": [
            {"id": "NORMAL", "description": "Within regular agronomic and seasonal bounds"},
            {"id": "DROUGHT", "description": "Severe rainfall deficit (<15%) and depleted soil moisture (<20%)"},
            {"id": "WATERLOGGING", "description": "Excess rainfall (>200%) and near-saturated soil moisture (>90%) with poor drainage"},
            {"id": "SALINITY_STRESS", "description": "Elevated Electrical Conductivity (EC > 4.5 dS/m) and alkaline pH (> 8.8)"},
            {"id": "NUTRIENT_DEFICIENCY", "description": "Severe N-P-Zn deficit triggering critical advisory warnings"},
            {"id": "HEAT_STRESS", "description": "Extreme ambient temperature (>41°C) with dry atmospheric humidity"},
            {"id": "SENSOR_DRIFT", "description": "Uncalibrated hardware sensor drift (pH 12.8, status DEGRADED)"},
            {"id": "SENSOR_STUCK", "description": "Hardware probe shorted/stuck at 99.9% moisture (status INVALID)"}
        ]
    }
