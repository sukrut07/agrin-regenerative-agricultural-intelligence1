"""
AgriN — Synthetic Data Engine Verification Tests
================================================
Validates data integrity, agronomic consistency, Faker identity generation,
and reproducible seeds in the synthetic data generator.
"""

import pytest
from data.synthetic.scripts.synthetic_engine import SyntheticAgriculturalEngine


@pytest.fixture(scope="module")
def synthetic_engine():
    return SyntheticAgriculturalEngine(seed=123)


def test_reproducibility_with_fixed_seed():
    engine1 = SyntheticAgriculturalEngine(seed=999)
    rec1 = engine1.generate_single_record()

    engine2 = SyntheticAgriculturalEngine(seed=999)
    rec2 = engine2.generate_single_record()

    assert rec1["crop"]["crop_name"] == rec2["crop"]["crop_name"]
    assert rec1["farmer"]["district"] == rec2["farmer"]["district"]
    assert rec1["soil_parameters"]["N"] == rec2["soil_parameters"]["N"]
    assert rec1["weather_parameters"]["temperature"] == rec2["weather_parameters"]["temperature"]


def test_synthetic_provenance_flags(synthetic_engine):
    rec = synthetic_engine.generate_single_record()
    assert rec["is_synthetic"] is True
    assert "SYNTHETIC" in rec["provenance"]["source_type"]
    assert rec["generation_seed"] == 123


def test_agronomic_valid_bounds(synthetic_engine):
    records = synthetic_engine.generate_dataset(num_records=50, include_anomalies=False)
    for r in records:
        soil = r["soil_parameters"]
        weather = r["weather_parameters"]

        # Soil parameters
        assert soil["N"] >= 0, "Nitrogen cannot be negative"
        assert soil["P"] >= 0, "Phosphorus cannot be negative"
        assert soil["K"] >= 0, "Potassium cannot be negative"
        assert soil["S"] >= 0, "Sulfur cannot be negative"
        assert soil["ph"] >= 4.0 and soil["ph"] <= 10.5, f"Soil pH {soil['ph']} out of agronomic bounds"
        assert soil["EC"] >= 0, "Electrical conductivity cannot be negative"
        assert soil["OC"] >= 0, "Organic carbon cannot be negative"

        # Weather parameters
        assert -10.0 <= weather["temperature"] <= 55.0, f"Temperature {weather['temperature']} out of physical bounds"
        assert 0.0 <= weather["humidity"] <= 100.0, f"Humidity {weather['humidity']} out of bounds"
        assert weather["rainfall"] >= 0, "Rainfall cannot be negative"
        assert 0.0 <= weather["soil_moisture"] <= 100.0, "Soil moisture must be 0-100%"


def test_crop_season_compatibility(synthetic_engine):
    records = synthetic_engine.generate_dataset(num_records=40, include_anomalies=False)
    for r in records:
        crop_category = r["crop"]["category"]
        lifecycle = r["crop"]["lifecycle"]
        season = r["crop"]["season"]

        assert lifecycle in ["seasonal", "perennial"]
        assert crop_category in [
            "cereal", "pulse", "oilseed", "commercial",
            "vegetable", "fruit", "spice", "plantation", "cover_fodder"
        ]


def test_anomaly_scenarios(synthetic_engine):
    drought_rec = synthetic_engine.generate_single_record(anomaly_type="DROUGHT")
    assert drought_rec["anomaly_scenario"] == "DROUGHT"
    assert drought_rec["weather_parameters"]["soil_moisture"] < 25.0

    saline_rec = synthetic_engine.generate_single_record(anomaly_type="SALINITY_STRESS")
    assert saline_rec["anomaly_scenario"] == "SALINITY_STRESS"
    assert saline_rec["soil_parameters"]["EC"] > 4.0

    drift_rec = synthetic_engine.generate_single_record(anomaly_type="SENSOR_DRIFT")
    assert drift_rec["sensor_telemetry"]["quality"] == "DEGRADED"
