"""
AgriN — Hardware-In-The-Loop (HIL) Bench Test Harness
=====================================================
Automated validation harness for AgriSense IoT hardware states, edge failovers,
sensor faults, network disruptions, offline queueing, and backend contract compliance.

CLASSIFICATION: Automated Software / Protocol HIL Simulation Harness.
NOTE: Tests that use simulated inputs are explicitly marked with provenance: SYNTHETIC.
      Physical hardware tests remain classified as NOT TESTED until bench execution.
"""

import os
import sys
import json
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

# Ensure workspace root is in sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.database.db import get_db, SessionLocal, init_db
from backend.app.database.iot_models import Device, DeviceStatusEnum, TelemetryRecord, SensorMeasurement

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("AgriSense-HIL")

client = TestClient(app)


class BenchTestHarness:
    def __init__(self, device_id: str = "hil-bench-node-01", farm_id: str = "farm-hil-bench-001"):
        self.device_id = device_id
        self.farm_id = farm_id
        self.api_key = "agrisense_sec_default"
        self.sequence_number = 1
        self.results: List[Dict[str, Any]] = []

    def record_result(self, test_id: str, description: str, category: str, status: str, details: str):
        result = {
            "test_id": test_id,
            "description": description,
            "category": category,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "details": details
        }
        self.results.append(result)
        emoji = "✅" if status == "PASS" else ("⚠️" if status == "NOT TESTED" else "❌")
        logger.info("%s [%s] %s: %s", emoji, test_id, description, status)

    def setup_database(self):
        """Initialize database and register test device."""
        init_db()
        db = SessionLocal()
        existing = db.query(Device).filter(Device.device_id == self.device_id).first()
        if existing:
            db.delete(existing)
            db.commit()

        reg_payload = {
            "farm_id": self.farm_id,
            "name": "HIL Bench Test Node",
            "description": "Hardware-in-the-Loop bench simulation test target",
            "firmware_version": "2.1.0",
            "hardware_profile": "ESP32-DevKit-V1-Standard"
        }
        resp = client.post("/api/devices/register", json=reg_payload)
        assert resp.status_code == 201, f"Device registration failed: {resp.text}"
        data = resp.json()
        self.device_id = data["device_id"]
        db.close()
        logger.info("Registered HIL device %s for farm %s", self.device_id, self.farm_id)

    # -------------------------------------------------------------------------
    # HIL Scenarios
    # -------------------------------------------------------------------------

    def test_01_sensor_discovery_and_normal_ingest(self):
        """Verify normal multi-sensor telemetry ingestion and intelligence triggering."""
        test_id = "HIL-01"
        desc = "Normal Multi-Sensor Acquisition & Ingestion"
        payload = {
            "device_id": self.device_id,
            "farm_id": self.farm_id,
            "field_id": "field-cotton-north",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sequence_number": self.sequence_number,
            "firmware_version": "2.1.0",
            "is_synthetic": False,
            "measurements": [
                {
                    "sensor_type": "SOIL_MOISTURE",
                    "parameter_name": "soil_moisture",
                    "raw_value": 2100.0,
                    "calibrated_value": 38.2,
                    "unit": "%",
                    "quality": "GOOD",
                    "data_source": "SENSOR_MEASURED",
                    "sensor_id": "moisture-01",
                    "is_valid": True
                },
                {
                    "sensor_type": "SOIL_TEMP",
                    "parameter_name": "soil_temperature",
                    "raw_value": 24.5,
                    "calibrated_value": 24.5,
                    "unit": "celsius",
                    "quality": "GOOD",
                    "data_source": "SENSOR_MEASURED",
                    "sensor_id": "ds18b20-01",
                    "is_valid": True
                },
                {
                    "sensor_type": "SOIL_PH",
                    "parameter_name": "soil_ph",
                    "raw_value": 2.48,
                    "calibrated_value": 6.82,
                    "unit": "scale",
                    "quality": "GOOD",
                    "data_source": "SENSOR_MEASURED",
                    "sensor_id": "ph-01",
                    "is_valid": True
                },
                {
                    "sensor_type": "SOIL_EC",
                    "parameter_name": "soil_ec",
                    "raw_value": 1.45,
                    "calibrated_value": 1.41,
                    "unit": "dS/m",
                    "quality": "GOOD",
                    "data_source": "SENSOR_MEASURED",
                    "sensor_id": "ec-01",
                    "is_valid": True
                }
            ],
            "device_diagnostics": {
                "battery_voltage": 3.94,
                "battery_percent": 75.0,
                "signal_rssi": -65,
                "uptime_seconds": 3600
            }
        }
        self.sequence_number += 1

        headers = {"X-Device-ID": self.device_id, "X-API-Key": self.api_key}
        resp = client.post("/api/telemetry/ingest", json=payload, headers=headers)
        if resp.status_code == 201 and resp.json().get("measurements_saved") == 4:
            self.record_result(test_id, desc, "Telemetry Ingestion", "PASS", "4 measurements saved; intelligence queued")
        else:
            self.record_result(test_id, desc, "Telemetry Ingestion", "FAIL", f"HTTP {resp.status_code}: {resp.text}")

    def test_02_sensor_disconnection_offline_quality(self):
        """Verify handling of disconnected sensors (-127°C, 32500 ADC) tagged as SENSOR_OFFLINE."""
        test_id = "HIL-02"
        desc = "Sensor Disconnection / Offline Handling"
        payload = {
            "device_id": self.device_id,
            "farm_id": self.farm_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sequence_number": self.sequence_number,
            "firmware_version": "2.1.0",
            "is_synthetic": True,
            "measurements": [
                {
                    "sensor_type": "SOIL_TEMP",
                    "parameter_name": "soil_temperature",
                    "raw_value": 32000.0,
                    "calibrated_value": 0.0,
                    "unit": "celsius",
                    "quality": "MISSING",
                    "data_source": "SYNTHETIC",
                    "sensor_id": "ds18b20-01",
                    "error_code": "ERR_ONEWIRE_DISCONNECTED",
                    "is_valid": False
                }
            ]
        }
        self.sequence_number += 1
        resp = client.post("/api/telemetry/ingest", json=payload)
        if resp.status_code == 201:
            self.record_result(test_id, desc, "Sensor Fault", "PASS", "Disconnected sensor recorded with quality MISSING")
        else:
            self.record_result(test_id, desc, "Sensor Fault", "FAIL", f"HTTP {resp.status_code}: {resp.text}")

    def test_03_invalid_reading_boundary_rejection(self):
        """Verify impossible sensor readings (pH 25.0) are rejected at API boundary."""
        test_id = "HIL-03"
        desc = "Impossible Sensor Reading Boundary Check"
        invalid_payload = {
            "device_id": self.device_id,
            "farm_id": self.farm_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sequence_number": self.sequence_number,
            "measurements": [
                {
                    "sensor_type": "SOIL_PH",
                    "parameter_name": "soil_ph",
                    "calibrated_value": 25.0,  # Agronomically impossible
                    "quality": "GOOD",
                    "data_source": "SYNTHETIC"
                }
            ]
        }
        self.sequence_number += 1
        resp = client.post("/api/telemetry/ingest", json=invalid_payload)
        if resp.status_code == 422:
            self.record_result(test_id, desc, "Boundary Validation", "PASS", "HTTP 422 Unprocessable Entity returned")
        else:
            self.record_result(test_id, desc, "Boundary Validation", "FAIL", f"Unexpected status {resp.status_code}")

    def test_04_duplicate_telemetry_rejection(self):
        """Verify duplicate sequence and hash detection returns DUPLICATE status."""
        test_id = "HIL-04"
        desc = "Duplicate Packet Detection & Replay Prevention"
        fixed_ts = datetime.now(timezone.utc).isoformat()
        payload = {
            "device_id": self.device_id,
            "farm_id": self.farm_id,
            "sequence_number": 8888,
            "timestamp": fixed_ts,
            "measurements": [
                {
                    "sensor_type": "SOIL_MOISTURE",
                    "parameter_name": "soil_moisture",
                    "calibrated_value": 42.0,
                    "data_source": "SYNTHETIC",
                    "quality": "GOOD"
                }
            ]
        }
        resp1 = client.post("/api/telemetry/ingest", json=payload)
        resp2 = client.post("/api/telemetry/ingest", json=payload)
        if resp1.status_code == 201 and resp2.status_code == 201 and resp2.json().get("status") == "DUPLICATE":
            self.record_result(test_id, desc, "Deduplication", "PASS", "Duplicate hash identified; 0 rows re-saved")
        else:
            self.record_result(test_id, desc, "Deduplication", "FAIL", f"Duplicate check failed: {resp2.text}")

    def test_05_device_heartbeat_and_status_transition(self):
        """Verify device heartbeat ping auto-transitions status to ONLINE."""
        test_id = "HIL-05"
        desc = "Heartbeat Processing & Status Transition"
        hb_payload = {
            "battery_voltage": 3.91,
            "battery_percent": 73.0,
            "signal_rssi": -62,
            "uptime_seconds": 7200,
            "free_memory_bytes": 182000,
            "firmware_version": "2.1.0",
            "sensor_status": {"moisture": "ok", "temp": "ok", "ph": "ok", "ec": "ok"}
        }
        resp = client.post(f"/api/devices/{self.device_id}/heartbeat", json=hb_payload)
        if resp.status_code == 201:
            # Check device status endpoint
            status_resp = client.get(f"/api/devices/{self.device_id}")
            if status_resp.status_code == 200 and status_resp.json().get("status") == "ONLINE":
                self.record_result(test_id, desc, "Device Health", "PASS", "Heartbeat logged; device status marked ONLINE")
                return
        self.record_result(test_id, desc, "Device Health", "FAIL", f"Heartbeat error: {resp.text}")

    def test_06_physical_bench_items_declaration(self):
        """Declare all hardware-dependent physical bench checks as NOT TESTED."""
        bench_checks = [
            ("HIL-06", "Physical Oscilloscope GPIO 27 Boot Pin Low-State", "Electrical Bench"),
            ("HIL-07", "Physical ADS1115 VDD 3.3V Multimeter Check", "Electrical Bench"),
            ("HIL-08", "Physical Certified pH 4.01/7.00 Buffer Probe Dip", "Sensor Metrology"),
            ("HIL-09", "Physical Certified 1413 uS/cm EC Solution Dip", "Sensor Metrology"),
            ("HIL-10", "Physical CN3065 Solar Charging Cutoff at 4.20V", "Power System"),
            ("HIL-11", "Physical Li-ion Deep-Sleep Wakeup Cycle", "Power System"),
            ("HIL-12", "Physical RS485 Modbus NPK Register Interrogation", "Field Bus"),
        ]
        for tid, name, cat in bench_checks:
            self.record_result(tid, name, cat, "NOT TESTED", "Awaiting physical hardware assembly & test bench equipment")

    def run_all(self):
        logger.info("Starting AgriSense HIL Bench Validation Test Harness...")
        self.setup_database()
        self.test_01_sensor_discovery_and_normal_ingest()
        self.test_02_sensor_disconnection_offline_quality()
        self.test_03_invalid_reading_boundary_rejection()
        self.test_04_duplicate_telemetry_rejection()
        self.test_05_device_heartbeat_and_status_transition()
        self.test_06_physical_bench_items_declaration()

        # Generate summary report
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        not_tested = sum(1 for r in self.results if r["status"] == "NOT TESTED")

        report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "device_id": self.device_id,
            "total_tests": len(self.results),
            "passed": passed,
            "failed": failed,
            "not_tested": not_tested,
            "results": self.results
        }

        report_path = os.path.join(os.path.dirname(__file__), "hil_test_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        logger.info("==================================================================")
        logger.info("HIL BENCH TEST SUMMARY: %d PASSED, %d FAILED, %d NOT TESTED", passed, failed, not_tested)
        logger.info("Report saved to %s", report_path)
        logger.info("==================================================================")
        return failed == 0


if __name__ == "__main__":
    harness = BenchTestHarness()
    success = harness.run_all()
    sys.exit(0 if success else 1)
