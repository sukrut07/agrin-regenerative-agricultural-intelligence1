"""
AgriN — Ecosystem API Test Suite
================================
Tests for Soil Intelligence (Fingerprint, Stratified Depth, Sampling Route,
Compaction, Treatment Outcome Tracker), AgriMarket, and AgriLedger.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_soil_fingerprint_endpoints():
    """Test creating and retrieving stratified soil health fingerprints."""
    payload = {
        "field_id": "test_field_01",
        "farm_id": "test_farm_01",
        "depth_layer": "0-15cm",
        "n_val": 220.0,
        "p_val": 15.0,
        "k_val": 320.0,
        "ph": 7.5,
        "ec": 0.45,
        "oc": 0.65,
        "moisture_pct": 42.5,
        "compaction_psi": 135.0,
        "infiltration_rate_mm_hr": 22.0,
        "data_source": "LAB_REPORT"
    }
    res = client.post("/api/soil-intelligence/fingerprints", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["field_id"] == "test_field_01"
    assert data["depth_layer"] == "0-15cm"
    assert data["n_val"] == 220.0

    # Retrieve all layers for field
    get_res = client.get("/api/soil-intelligence/fingerprints/test_field_01")
    assert get_res.status_code == 200
    layers = get_res.json()
    assert len(layers) >= 1


def test_soil_depth_analysis():
    """Test stratified depth comparative analysis and hardpan constraint detection."""
    res = client.get("/api/soil-intelligence/depth-analysis/test_field_depth_01")
    assert res.status_code == 200
    data = res.json()
    assert "layers" in data
    assert len(data["layers"]) >= 3
    assert "root_zone_evaluation" in data
    assert "subsoil_constraints" in data


def test_soil_sampling_route_planner():
    """Test generating a zoned soil sampling route with waypoints and collection toggles."""
    payload = {
        "field_id": "test_field_sample_01",
        "farm_id": "test_farm_01",
        "title": "Kharif Soil Health Grid",
        "num_zones": 5,
        "target_depth_cm": 15,
        "center_lat": 19.2608,
        "center_lon": 76.7748
    }
    res = client.post("/api/soil-intelligence/sampling-routes", json=payload)
    assert res.status_code == 200
    route = res.json()
    assert route["num_zones"] == 5
    assert len(route["waypoints"]) == 5
    assert route["waypoints"][0]["point_id"] == "SMP-01"

    # Mark first point collected
    route_id = route["id"]
    collect_res = client.post(f"/api/soil-intelligence/sampling-routes/{route_id}/collect/SMP-01")
    assert collect_res.status_code == 200
    collect_data = collect_res.json()
    assert collect_data["status"] == "SUCCESS"
    assert collect_data["waypoints"][0]["is_collected"] is True


def test_soil_treatment_outcome_tracker():
    """Test logging soil amendments and viewing before/after outcomes."""
    payload = {
        "field_id": "test_field_treat_01",
        "farm_id": "test_farm_01",
        "treatment_type": "GYPSUM",
        "amendment_name": "Agricultural Gypsum 85%",
        "quantity": 500.0,
        "unit": "kg",
        "cost_inr": 2400.0,
        "pre_treatment_ph": 8.4,
        "pre_treatment_oc": 0.42,
        "outcome_notes": "Applied before monsoon sowing to remediate high exchangeable sodium."
    }
    res = client.post("/api/soil-intelligence/treatments", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["treatment_type"] == "GYPSUM"
    assert data["pre_treatment_ph"] == 8.4

    # Get history
    hist_res = client.get("/api/soil-intelligence/treatments/test_field_treat_01")
    assert hist_res.status_code == 200
    treatments = hist_res.json()
    assert len(treatments) >= 1


def test_marketplace_listings_and_search():
    """Test marketplace listing retrieval, filtering, and creation."""
    # Retrieve default seed listings
    res = client.get("/api/marketplace/listings")
    assert res.status_code == 200
    listings = res.json()
    assert len(listings) >= 4

    # Filter by rental
    rentals = client.get("/api/marketplace/listings?is_rental=true").json()
    assert all(r["is_rental"] is True for r in rentals)

    # Filter by category
    amendments = client.get("/api/marketplace/listings?category=SOIL_AMENDMENTS").json()
    assert all(a["category"] == "SOIL_AMENDMENTS" for a in amendments)

    # Create new listing
    new_listing = {
        "seller_id": "farmer_test_10",
        "seller_name": "Anil Kadam",
        "seller_phone": "+91 99230 99887",
        "category": "SEEDS",
        "title": "Certified Pigeonpea BDN-711 Seeds",
        "price": 120.0,
        "pricing_unit": "per_kg",
        "available_quantity": 50.0,
        "quantity_unit": "kg",
        "location_district": "Parbhani",
        "location_state": "Maharashtra"
    }
    create_res = client.post("/api/marketplace/listings", json=new_listing)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["title"] == "Certified Pigeonpea BDN-711 Seeds"


def test_marketplace_enquiry_and_benchmarks():
    """Test buyer enquiry submission and APMC mandi price benchmarks."""
    # Price benchmarks
    bench_res = client.get("/api/marketplace/price-benchmarks")
    assert bench_res.status_code == 200
    data = bench_res.json()
    assert "benchmarks" in data
    assert len(data["benchmarks"]) >= 5

    # Soil-to-Market bridge
    match_res = client.get("/api/marketplace/soil-amendments-match?deficiency=ph_high")
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) >= 1


def test_farm_economics_agriledger():
    """Test farm expense tracking, sales recording, and P&L aggregation."""
    farm_id = "test_farm_econ_01"

    # Get expenses
    exp_res = client.get(f"/api/economics/expenses/{farm_id}")
    assert exp_res.status_code == 200
    expenses = exp_res.json()
    assert len(expenses) >= 1

    # Add expense
    add_res = client.post("/api/economics/expenses", json={
        "farm_id": farm_id,
        "category": "FERTILIZER",
        "description": "Neem Coated Urea (2 bags)",
        "amount_inr": 540.0
    })
    assert add_res.status_code == 200

    # Get PnL
    pnl_res = client.get(f"/api/economics/pnl/{farm_id}")
    assert pnl_res.status_code == 200
    pnl = pnl_res.json()
    assert "total_expenses_inr" in pnl
    assert "total_revenue_inr" in pnl
    assert "net_profit_inr" in pnl
