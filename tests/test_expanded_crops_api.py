"""
AgriN — Crop Catalogue & Synthetic API Tests
=============================================
Tests for /api/crops/catalogue, /api/crops/categories, /api/synthetic/metadata,
and /api/synthetic/scenarios.
"""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_get_crop_catalogue():
    resp = client.get("/api/crops/catalogue")
    assert resp.status_code == 200
    data = resp.json()
    assert "crops" in data
    assert data["total_results"] >= 50
    # Check that a well-known crop is present with all metadata
    crop_names = [c["crop_id"] for c in data["crops"]]
    assert "rice" in crop_names
    assert "chickpea" in crop_names
    assert "cotton" in crop_names
    assert "mango" in crop_names


def test_crop_catalogue_filtering():
    # Filter by category
    resp_pulses = client.get("/api/crops/catalogue?category=pulse")
    assert resp_pulses.status_code == 200
    pulses = resp_pulses.json()["crops"]
    for p in pulses:
        assert p["category"] == "pulse"

    # Filter by season
    resp_rabi = client.get("/api/crops/catalogue?season=rabi")
    assert resp_rabi.status_code == 200
    rabi_crops = resp_rabi.json()["crops"]
    for rc in rabi_crops:
        assert "rabi" in rc["growing_seasons"] or "perennial" in rc["growing_seasons"]

    # Filter by search in Hindi/English
    resp_search = client.get("/api/crops/catalogue?search=गेहूं")
    assert resp_search.status_code == 200
    assert any(c["crop_id"] == "wheat" for c in resp_search.json()["crops"])


def test_crop_categories_endpoint():
    resp = client.get("/api/crops/categories")
    assert resp.status_code == 200
    data = resp.json()
    assert "cereal" in data["categories"]
    assert "pulse" in data["categories"]
    assert "fruit" in data["categories"]
    assert data["counts"]["cereal"] >= 5


def test_synthetic_metadata_and_scenarios():
    resp_meta = client.get("/api/synthetic/metadata")
    assert resp_meta.status_code == 200
    meta = resp_meta.json()
    assert meta.get("synthetic_flag", True) is True

    resp_scenarios = client.get("/api/synthetic/scenarios")
    assert resp_scenarios.status_code == 200
    scenarios = resp_scenarios.json()["scenarios"]
    ids = [s["id"] for s in scenarios]
    assert "DROUGHT" in ids
    assert "SALINITY_STRESS" in ids
    assert "SENSOR_DRIFT" in ids
