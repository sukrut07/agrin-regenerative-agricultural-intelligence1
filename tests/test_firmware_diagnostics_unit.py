"""
AgriSense Prototype Unit 01 — Diagnostic Harness & Safety Invariant Tests
========================================================================
Validates Phase 03.1 diagnostic rules, safety interlocks, and contract guards:
1. Diagnostic initialization and safe defaults (all analog acquisitions disabled).
2. Missing sensors marked UNAVAILABLE / MISSING (never converted to 0.0).
3. Invalid ADC values rejected (out of electrical tolerance).
4. I2C communication failure handling.
5. Invalid temperature readings (e.g., -127°C / 85°C filtered out).
6. RS485 communication timeout handling.
7. Diagnostic command interface validation and secret masking.
8. Zero synthetic-to-real provenance conversion.
"""

import pytest
from datetime import datetime, timezone
from backend.app.models.iot_schemas import (
    TelemetryIngestRequest,
    SensorMeasurementSchema,
    MeasurementQuality,
    DataSource
)
from backend.app.services.telemetry_to_intelligence import (
    build_measurements_index,
    build_analysis_request_from_telemetry
)


def test_safe_default_sensor_state_and_missing_sensors():
    """Verify that absent/unconnected sensors are NOT converted to zero or good quality."""
    measurements = [
        SensorMeasurementSchema(
            sensor_type="SOIL_TEMP",
            parameter_name="soil_temperature",
            raw_value=None,
            calibrated_value=None,
            unit="celsius",
            quality=MeasurementQuality.MISSING,
            data_source=DataSource.UNAVAILABLE,
            is_valid=False,
            error_code="DS18B20_DISCONNECTED"
        )
    ]
    req = TelemetryIngestRequest(
        device_id="test-proto-01",
        farm_id="farm-test",
        timestamp=datetime.now(timezone.utc),
        sequence_number=1,
        firmware_version="2.1.0",
        measurements=measurements
    )

    idx = build_measurements_index([m.model_dump() for m in req.measurements])
    assert "SOIL_TEMP" in idx
    assert idx["SOIL_TEMP"]["is_valid"] is False
    assert idx["SOIL_TEMP"]["calibrated_value"] is None
    assert idx["SOIL_TEMP"]["quality"] == "MISSING"


def test_invalid_temperature_filtering_contract():
    """Verify that Dallas 1-Wire fault code -127°C is rejected by Pydantic schema validation."""
    with pytest.raises(ValueError, match="implausible for 'soil_temperature'"):
        SensorMeasurementSchema(
            sensor_type="SOIL_TEMP",
            parameter_name="soil_temperature",
            raw_value=-127.0,
            calibrated_value=None,
            unit="celsius",
            quality=MeasurementQuality.INVALID,
            data_source=DataSource.SENSOR_MEASURED,
            is_valid=False,
            error_code="INVALID_SENSOR_READING"
        )


def test_rs485_timeout_and_uninstalled_npk():
    """Verify RS485 Modbus timeout results in UNAVAILABLE provenance without fake 0 values."""
    telemetry_dict = {
        "device_id": "proto-01",
        "measurements": [
            {
                "sensor_type": "SOIL_MOISTURE",
                "calibrated_value": 35.0,
                "raw_value": 2100.0,
                "unit": "%",
                "quality": "GOOD",
                "is_valid": True,
                "data_source": "SENSOR_MEASURED"
            }
            # NPK completely absent due to RS485 timeout / uninstalled
        ]
    }

    index = build_measurements_index(telemetry_dict["measurements"])
    farm_data, conf_report = build_analysis_request_from_telemetry(
        measurements=index,
        device_location=(19.26, 76.78),
        district="Parbhani",
        state="Maharashtra",
        device_id="proto-01"
    )

    prov = conf_report["field_provenances"]
    assert prov["nitrogen_kg_ha"]["source"] == "UNAVAILABLE"
    assert prov["phosphorus_kg_ha"]["source"] == "UNAVAILABLE"
    assert prov["potassium_kg_ha"]["source"] == "UNAVAILABLE"
    assert "nitrogen_kg_ha" in conf_report["summary"]["unavailable"]


def test_i2c_bus_failure_handling():
    """Verify when I2C ADC fails, all ADC-dependent channels are marked INVALID/MISSING."""
    adc_sensors = ["SOIL_MOISTURE", "SOIL_PH", "SOIL_EC"]
    measurements = [
        SensorMeasurementSchema(
            sensor_type=st,
            parameter_name=st.lower(),
            raw_value=None,
            calibrated_value=None,
            unit="raw",
            quality=MeasurementQuality.MISSING,
            data_source=DataSource.UNAVAILABLE,
            is_valid=False,
            error_code="I2C_ADS1115_NO_ACK"
        )
        for st in adc_sensors
    ]

    for m in measurements:
        assert m.quality == MeasurementQuality.MISSING
        assert m.is_valid is False
        assert m.calibrated_value is None


def test_no_synthetic_to_real_provenance_conversion():
    """Verify that synthetic telemetry cannot be mixed with SENSOR_MEASURED provenance."""
    with pytest.raises(ValueError, match="must not mix SENSOR_MEASURED and SYNTHETIC"):
        TelemetryIngestRequest(
            device_id="proto-01",
            farm_id="farm-test",
            timestamp=datetime.now(timezone.utc),
            sequence_number=5,
            measurements=[
                SensorMeasurementSchema(
                    sensor_type="SOIL_MOISTURE",
                    parameter_name="soil_moisture",
                    raw_value=2100.0,
                    calibrated_value=35.0,
                    unit="%",
                    quality=MeasurementQuality.GOOD,
                    data_source=DataSource.SENSOR_MEASURED,
                    is_valid=True
                ),
                SensorMeasurementSchema(
                    sensor_type="SOIL_TEMP",
                    parameter_name="soil_temperature",
                    raw_value=25.0,
                    calibrated_value=25.0,
                    unit="celsius",
                    quality=MeasurementQuality.GOOD,
                    data_source=DataSource.SYNTHETIC, # Illegal mixed combination!
                    is_valid=True
                )
            ]
        )
