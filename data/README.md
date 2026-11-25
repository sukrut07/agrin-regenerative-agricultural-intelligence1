# 📊 AgriN Data Pipeline, Provenance & Synthetic Engine

> **Navigation:** [Root README](../README.md) · [Data Dictionary](../DATA_DICTIONARY.md) · [Synthetic Docs](../SYNTHETIC_DATA_DOCUMENTATION.md) · [Docs Hub](../docs/README.md)

This directory houses the raw/processed training datasets, agricultural reference provenance, and reproducible constrained synthetic data generation engine for AgriN.

---

## 📑 Table of Contents
- [1. Directory Structure](#1-directory-structure)
- [2. Scientific Provenance & Sources](#2-scientific-provenance--sources)
- [3. Synthetic Data Engine](#3-synthetic-data-engine)
- [4. CLI Usage & Anomaly Scenarios](#4-cli-usage--anomaly-scenarios)
- [5. Complete Reference Links](#5-complete-reference-links)

---

## 1. Directory Structure

```text
data/
├── README.md                  # Pipeline & provenance guide (this file)
├── raw/                       # Upstream reference crop/soil datasets
├── processed/                 # Cleaned ML-ready feature sets & provenance JSON
├── scripts/                   # Training dataset builder (`build_training_dataset.py`)
└── synthetic/
    ├── profiles/              # `soil_profiles.json`, `seasonal_profiles.json`
    ├── scripts/               # `synthetic_engine.py`, `run_synthetic_engine.py`
    └── generated/             # Generated JSON/CSV records & manifest (`is_synthetic: true`)
```

---

## 2. Scientific Provenance & Sources

AgriN agronomic bounds and Soil Health Card evaluation curves are benchmarked against:
1. **Indian Council of Agricultural Research (ICAR)** — Handbook of Agriculture (7th Edition), 15 agro-climatic planning zones, and micronutrient deficiency cutoffs.
2. **Directorate of Economics and Statistics (DES)** — State- and district-level crop yields, cropping seasons, and production belts.
3. **National Soil Health Card (SHC) Scheme** — 12-parameter diagnostic thresholds (`N`, `P`, `K`, `S`, `Zn`, `Fe`, `Cu`, `Mn`, `B`, `pH`, `EC`, `OC`).
4. **Food and Agriculture Organization (FAO)** — Irrigation and Drainage Paper 56 (crop water requirements).

---

## 3. Synthetic Data Engine

Synthetic profiles are generated independently via **Python Faker** + **ICAR soil order constraints** across 7 major Indian soil orders (`Vertisols`, `Alluvial`, `Alfisols`, `Laterite`, `Aridisols`, `Saline/Alkaline`, `Mountain/Forest`):
- **Mandatory Provenance Tagging**: Every synthetic record carries `"is_synthetic": true`, `"synthetic_version": "v1.0"`, and `"faker_seed"`.
- **No Mixing Policy**: Synthetic data is never conflated with empirical holdout evaluations.

---

## 4. CLI Usage & Anomaly Scenarios

```bash
# Generate 500 validated synthetic farm records to JSON
python data/synthetic/scripts/run_synthetic_engine.py \
  --records 500 \
  --seed 42 \
  --states Maharashtra "Madhya Pradesh" Punjab Karnataka \
  --include-anomalies \
  --output data/synthetic/generated/synthetic_farms_500.json \
  --format json
```

Supported stress scenarios: `extreme_drought`, `salinity_flash`, `flash_flood`, and `severe_zinc_deficiency`.

---

## 5. Complete Reference Links
- [DATA_DICTIONARY.md](../DATA_DICTIONARY.md) — Complete 12-parameter soil, IoT telemetry, satellite & decision schema dictionary.
- [SYNTHETIC_DATA_DOCUMENTATION.md](../SYNTHETIC_DATA_DOCUMENTATION.md) — Detailed soil order parameters and Python API examples.
- [docs/dataset_card.md](../docs/dataset_card.md) — Dataset card & distribution caveats.
