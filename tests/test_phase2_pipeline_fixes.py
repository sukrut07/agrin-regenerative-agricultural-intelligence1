"""
Phase 2 Core Pipeline, Metric Provenance & Security Verification Tests
======================================================================
Verifies:
1. POST /api/analyze invokes the unified agrin_intelligence orchestrator and returns
   pipeline_execution metadata plus non-empty feature_importance.
2. Orchestrator failures are surfaced with structured errors instead of silently falling back
   to the legacy prediction-only pipeline.
3. Unavailable ML metadata returns metrics=None and metrics_status="UNAVAILABLE" rather than
   fabricated/hardcoded accuracy or F1 scores.
4. IoT endpoints reject missing/invalid X-Device-Token and cross-farm field tampering.
5. CORS middleware does not configure wildcard "*" alongside allow_credentials=True.
"""

import os
import sys
import uuid
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.app.main import app, ALLOWED_ORIGINS
from backend.app.database.db import Base, engine

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def ensure_tables():
    Base.metadata.create_all(bind=engine)
    yield


def _sample_analysis_payload():
    return {
        "farm_data": {
            "state": "Maharashtra",
            "district": "Parbhani",
            "season": "kharif",
            "soil_type": "black",
            "irrigation_available": "yes",
            "drainage": "good",
        },
        "soil_data": {
            "N": 260.0, "P": 22.0, "K": 290.0, "S": 14.0,
            "Zn": 0.9, "Fe": 6.5, "Cu": 0.5, "Mn": 3.2, "B": 0.7,
            "ph": 7.2, "EC": 0.4, "OC": 0.65,
        },
        "env_data": {
            "temperature": 28.0,
            "humidity": 65.0,
            "rainfall": 780.0,
        },
    }


def test_analyze_uses_unified_orchestrator_and_returns_pipeline_execution():
    payload = _sample_analysis_payload()
    with patch(
        "backend.app.api.routes_farmer.run_full_agricultural_intelligence",
        wraps=__import__(
            "backend.app.services.agrin_intelligence",
            fromlist=["run_full_agricultural_intelligence"],
        ).run_full_agricultural_intelligence,
    ) as spy_orch:
        res = client.post("/api/analyze", json=payload)
        assert spy_orch.called, "/api/analyze must invoke run_full_agricultural_intelligence"

    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert len(body["feature_importance"]) > 0, "feature_importance must populate from predictor.get_feature_importance()"

    pipe = body.get("pipeline_execution")
    assert isinstance(pipe, dict)
    assert pipe["pipeline_id"].startswith("pipe-")
    assert pipe["session_id"] == body["session_id"]
    assert pipe["status"] in ("COMPLETE", "PARTIAL_DEGRADED")
    assert "soil" in pipe["subsystem_statuses"]
    assert "weather" in pipe["subsystem_statuses"]
    assert "crop_suitability" in pipe["subsystem_statuses"]


def test_analyze_does_not_silently_fallback_on_orchestrator_failure():
    payload = _sample_analysis_payload()
    with patch(
        "backend.app.api.routes_farmer.run_full_agricultural_intelligence",
        side_effect=RuntimeError("Simulated orchestrator outage"),
    ):
        res = client.post("/api/analyze", json=payload)

    assert res.status_code == 500
    detail = res.json()["detail"]
    assert "Unified agricultural intelligence pipeline failed" in detail["message"]


def test_analyze_reports_unavailable_metrics_when_metadata_missing():
    payload = _sample_analysis_payload()
    with patch("ml.predict.predictor.get_model_info", return_value={}):
        res = client.post("/api/analyze", json=payload)

    assert res.status_code == 200
    model_info = res.json()["model_info"]
    assert model_info["metrics"] is None
    assert model_info["metrics_status"] == "UNAVAILABLE"
    assert "reason" in model_info


def test_iot_auth_enforced_for_ingest_heartbeat_status_and_field_ownership():
    farm_a = f"farm-a-{uuid.uuid4().hex[:6]}"
    farm_b = f"farm-b-{uuid.uuid4().hex[:6]}"

    # Create a field in Farm B
    fld_b = client.post(
        "/api/fields",
        json={"farm_id": farm_b, "name": "Farm B Plot"},
    )
    assert fld_b.status_code == 201
    field_b_id = fld_b.json()["field_id"]

    # Register device in Farm A
    reg = client.post(
        "/api/devices/register",
        json={"farm_id": farm_a, "name": f"AuthNode-{uuid.uuid4().hex[:4]}"},
    )
    assert reg.status_code == 201
    dev = reg.json()
    device_id = dev["device_id"]
    api_key = dev["api_key"]

    telemetry_payload = {
        "device_id": device_id,
        "farm_id": farm_a,
        "sequence_number": 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "measurements": [
            {
                "sensor_type": "SOIL_MOISTURE",
                "parameter_name": "soil_moisture",
                "calibrated_value": 40.0,
                "unit": "%",
                "quality": "GOOD",
                "data_source": "SENSOR_MEASURED",
                "is_valid": True,
            }
        ],
    }

    # Missing token rejected (401)
    assert client.post("/api/telemetry/ingest", json=telemetry_payload).status_code == 401
    assert client.post(f"/api/devices/{device_id}/heartbeat", json={"battery_percent": 90}).status_code == 401
    assert client.put(f"/api/devices/{device_id}/status", json={"status": "OFFLINE"}).status_code == 401

    # Wrong token rejected (401)
    bad_headers = {"X-Device-Token": "wrong_token"}
    assert client.post("/api/telemetry/ingest", json=telemetry_payload, headers=bad_headers).status_code == 401

    # Cross-farm field association rejected (403)
    good_headers = {"X-Device-Token": api_key}
    cross_farm_payload = {**telemetry_payload, "field_id": field_b_id}
    assert client.post("/api/telemetry/ingest", json=cross_farm_payload, headers=good_headers).status_code == 403

    # Authorized status update succeeds
    status_res = client.put(
        f"/api/devices/{device_id}/status",
        json={"status": "ONLINE"},
        headers=good_headers,
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "ONLINE"


def test_cors_origins_no_wildcard_with_credentials():
    assert "*" not in ALLOWED_ORIGINS
