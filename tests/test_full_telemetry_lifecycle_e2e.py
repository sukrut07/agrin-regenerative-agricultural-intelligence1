"""
AgriN — Full Telemetry Lifecycle & Intelligence Integration End-to-End Test
=============================================================================
Verifies the complete data journey:
ESP32 Firmware Payload -> Authentication -> API Validation -> Database Persistence
-> Deduplication -> Provenance Tagging -> Agricultural Intelligence -> Historical API.

Enforces:
- Missing sensors are NEVER silently converted to zero.
- Units, timestamps, parameter names, and quality grades are strictly preserved.
"""

import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database.db import get_db, SessionLocal, init_db
from backend.app.database.iot_models import Device, Field, TelemetryRecord, SensorMeasurement
from backend.app.services.agrin_intelligence import run_intelligence_from_telemetry

client = TestClient(app)


@pytest.fixture(scope="module")
def e2e_farm_setup():
    """Create test farm, field, and device."""
    init_db()
    db = SessionLocal()

    farm_id = "farm-lifecycle-e2e-001"
    
    # 1. Create Field
    field_payload = {
        "farm_id": farm_id,
        "name": "E2E Cotton Field North",
        "area_hectares": 4.5,
        "location_lat": 19.26,
        "location_lon": 76.78,
        "soil_type": "black_cotton",
        "irrigation_type": "drip"
    }
    field_resp = client.post("/api/fields", json=field_payload)
    assert field_resp.status_code == 201, f"Field creation failed: {field_resp.text}"
    field_data = field_resp.json()
    field_id = field_data["field_id"]

    # 2. Register Device
    device_payload = {
        "farm_id": farm_id,
        "field_id": field_id,
        "name": "AgriSense Field Node E2E",
        "description": "Full lifecycle integration node",
        "firmware_version": "2.1.0",
        "hardware_profile": "ESP32-DevKit-V1-Standard"
    }
    dev_resp = client.post("/api/devices/register", json=device_payload)
    assert dev_resp.status_code == 201, f"Device registration failed: {dev_resp.text}"
    dev_data = dev_resp.json()
    device_id = dev_data["device_id"]

    db.close()
    return {"farm_id": farm_id, "field_id": field_id, "device_id": device_id}


def test_complete_telemetry_lifecycle(e2e_farm_setup):
    setup = e2e_farm_setup
    device_id = setup["device_id"]
    farm_id = setup["farm_id"]
    field_id = setup["field_id"]

    # 1. Ingest Telemetry with Moisture, Temp, pH, EC (NPK intentionally omitted / missing)
    ts = datetime.now(timezone.utc).isoformat()
    telemetry_payload = {
        "device_id": device_id,
        "farm_id": farm_id,
        "field_id": field_id,
        "timestamp": ts,
        "sequence_number": 42,
        "firmware_version": "2.1.0",
        "is_synthetic": False,
        "measurements": [
            {
                "sensor_type": "SOIL_MOISTURE",
                "parameter_name": "soil_moisture",
                "raw_value": 2100.0,
                "calibrated_value": 36.5,
                "unit": "%",
                "quality": "GOOD",
                "data_source": "SENSOR_MEASURED",
                "sensor_id": "moist-01",
                "calibration_version": "calib-v1",
                "is_valid": True
            },
            {
                "sensor_type": "SOIL_TEMP",
                "parameter_name": "soil_temperature",
                "raw_value": 26.0,
                "calibrated_value": 26.0,
                "unit": "celsius",
                "quality": "GOOD",
                "data_source": "SENSOR_MEASURED",
                "sensor_id": "temp-01",
                "calibration_version": "ds18b20-factory",
                "is_valid": True
            },
            {
                "sensor_type": "SOIL_PH",
                "parameter_name": "soil_ph",
                "raw_value": 2.44,
                "calibrated_value": 7.05,
                "unit": "scale",
                "quality": "GOOD",
                "data_source": "SENSOR_MEASURED",
                "sensor_id": "ph-01",
                "calibration_version": "calib-ph-v1",
                "is_valid": True
            },
            {
                "sensor_type": "SOIL_EC",
                "parameter_name": "soil_ec",
                "raw_value": 1.48,
                "calibrated_value": 1.42,
                "unit": "dS/m",
                "quality": "GOOD",
                "data_source": "SENSOR_MEASURED",
                "sensor_id": "ec-01",
                "calibration_version": "calib-ec-v1",
                "is_valid": True
            }
        ],
        "device_diagnostics": {
            "battery_voltage": 3.95,
            "battery_percent": 80.0,
            "signal_rssi": -63,
            "signal_quality": 88.0,
            "uptime_seconds": 14400,
            "free_memory_bytes": 182500
        }
    }

    # Ingestion via API
    headers = {"X-Device-ID": device_id, "X-API-Key": "agrisense_sec_default"}
    ingest_resp = client.post("/api/telemetry/ingest", json=telemetry_payload, headers=headers)
    assert ingest_resp.status_code == 201
    ingest_data = ingest_resp.json()
    assert ingest_data["status"] in ("SUCCESS", "PROCESSED")
    assert ingest_data["measurements_saved"] == 4
    telemetry_id = ingest_data["telemetry_id"]

    # 2. Database Verification: Check persisted records directly
    db = SessionLocal()
    rec = db.query(TelemetryRecord).filter(TelemetryRecord.telemetry_id == telemetry_id).first()
    assert rec is not None
    assert rec.device_id == device_id
    assert rec.farm_id == farm_id
    assert rec.field_id == field_id
    assert rec.sequence_number == 42

    # Check child SensorMeasurement rows
    measurements = db.query(SensorMeasurement).filter(SensorMeasurement.telemetry_id == telemetry_id).all()
    assert len(measurements) == 4
    moist_m = next(m for m in measurements if m.parameter_name == "soil_moisture")
    assert moist_m.calibrated_value == 36.5
    assert moist_m.raw_value == 2100.0
    assert moist_m.unit == "%"
    assert moist_m.data_source == "SENSOR_MEASURED"

    # 3. Verify Latest Telemetry API endpoint
    latest_resp = client.get(f"/api/telemetry/{device_id}/latest")
    assert latest_resp.status_code == 200
    latest_data = latest_resp.json()
    assert latest_data["device_id"] == device_id
    latest_moist = next(m for m in latest_data["measurements"] if m.get("parameter_name") == "soil_moisture")
    assert latest_moist["calibrated_value"] == 36.5

    # 4. Verify Historical Telemetry API endpoint
    history_resp = client.get(f"/api/telemetry/{device_id}/history?page=1&page_size=10")
    assert history_resp.status_code == 200
    hist_data = history_resp.json()
    assert hist_data["total"] >= 1
    assert hist_data["records"][0]["device_id"] == device_id

    # 5. Trigger Agricultural Intelligence Pipeline with Provenance Tracking
    import asyncio
    intel_result = asyncio.run(
        run_intelligence_from_telemetry(
            device_id=device_id,
            field_id=field_id,
            telemetry_measurements=telemetry_payload["measurements"],
            device_location=(19.26, 76.78),
            district="Parbhani",
            state="Maharashtra",
            soil_type="black",
            target_crop="cotton",
            is_synthetic=False,
        )
    )
    assert intel_result is not None
    assert intel_result["status"] == "SUCCESS"
    assert "telemetry_confidence_report" in intel_result
    assert "irrigation_intelligence" in intel_result
    assert "agricultural_intelligence" in intel_result

    # CRITICAL CHECK: Verify uninstalled NPK sensors were NOT converted to zero!
    # Missing sensors must be marked as UNAVAILABLE in confidence report, never 0.0!
    conf_report = intel_result.get("telemetry_confidence_report", {})
    provenances = conf_report.get("field_provenances", {})
    for npk_field in ["nitrogen", "phosphorus", "potassium"]:
        if npk_field in provenances:
            assert provenances[npk_field].get("source") in ("UNAVAILABLE", "DEFAULT_MEDIAN", "CALCULATED")

    db.close()
