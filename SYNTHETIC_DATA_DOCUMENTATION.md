# 🧬 AgriN — Synthetic Agronomic Data Engine Documentation

> **Navigation:** [Root README](README.md) · [Data README](data/README.md) · [Data Dictionary](DATA_DICTIONARY.md) · [Docs Hub](docs/README.md)

**Version:** `1.0`  
**Engine Module:** `data/synthetic/scripts/synthetic_engine.py`  
**CLI Interface:** `data/synthetic/scripts/run_synthetic_engine.py`  
**API Endpoints:** `/api/synthetic/metadata`, `/api/synthetic/sample`, `/api/synthetic/scenarios`

---

## 📑 Table of Contents
- [1. Purpose & Architectural Rationale](#1-purpose--architectural-rationale)
- [2. Codified Indian Soil Orders](#2-codified-indian-soil-orders)
- [3. Seasonal Climatic Modulation](#3-seasonal-climatic-modulation)
- [4. Deterministic Stress & Anomaly Scenarios](#4-deterministic-stress--anomaly-scenarios)
- [5. CLI & Python API Usage](#5-cli--python-api-usage)

---

## 1. Purpose & Architectural Rationale

Real-world farm sampling across India spans 3–6 month growing seasons and high lab/sensor deployment costs, yet purely random mock datasets generate biologically impossible soils and undermine scientific trust. To preserve empirical separation:

1. **Constrained Synthesis**: Uses **Python Faker** (`en_IN` / `hi_IN` locales) alongside **ICAR agronomic statistical distributions** per Indian soil order.
2. **Mandatory Provenance Tagging**: Every synthetic record includes:
   - `"is_synthetic": true`
   - `"synthetic_version": "v1.0"`
   - `"faker_seed": <int>`
   - `"soil_order": "<name>"`
   - `"generation_timestamp": "<ISO-8601>"`

---

## 2. Codified Indian Soil Orders

Defined in `data/synthetic/profiles/soil_profiles.json`:

| Soil Order | Dominant Regions | Texture | pH Range | Available N (kg/ha) | Available P (kg/ha) | Available K (kg/ha) | OC (%) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Vertisols (Black)** | Maharashtra, Gujarat, MP, Karnataka | 40–60% montmorillonite clay | 7.4 – 8.5 | 180 – 260 | 10 – 18 | 280 – 420 | 0.45 – 0.65 |
| **Alluvial Soils** | Punjab, Haryana, UP, Bihar, WB | Loam to silty loam | 6.8 – 7.8 | 220 – 320 | 15 – 26 | 160 – 240 | 0.40 – 0.55 |
| **Alfisols (Red)** | AP, Telangana, Tamil Nadu, Odisha | Coarse sandy loam | 6.0 – 7.0 | 140 – 220 | 8 – 15 | 120 – 180 | 0.30 – 0.48 |
| **Laterite Soils** | Western Ghats, Kerala, Assam | Kaolinite clay, porous | 4.8 – 5.8 | 180 – 250 | 5 – 10 | 90 – 150 | 0.70 – 1.10 |
| **Aridisols (Desert)** | Western Rajasthan, Kutch | Sandy, low cohesion | 7.8 – 8.8 | 100 – 160 | 6 – 12 | 140 – 220 | 0.15 – 0.30 |
| **Saline / Sodic** | Canal command & coastal pockets | Impermeable sodic clay | 8.2 – 9.4 | 120 – 190 | 8 – 14 | 180 – 260 | 0.20 – 0.35 |
| **Mountain / Forest** | Himachal, Uttarakhand, J&K | Humic loam | 5.2 – 6.5 | 240 – 360 | 12 – 22 | 150 – 240 | 1.00 – 2.20 |

---

## 3. Seasonal Climatic Modulation

Defined in `data/synthetic/profiles/seasonal_profiles.json`:
- **Kharif (June–October)**: High humidity (`65–90%`), monsoon precipitation, `24–34°C`.
- **Rabi (November–March)**: Mild temperatures (`12–28°C`), low rainfall, residual soil moisture / irrigation.
- **Zaid (April–May)**: High heat (`32–44°C`), low humidity (`20–40%`), high evapotranspiration.
- **Perennial (Year-round)**: Multi-season moving averages for orchard & plantation crops.

---

## 4. Deterministic Stress & Anomaly Scenarios

| Scenario ID | Simulated Stress Condition | Validation Purpose |
| :--- | :--- | :--- |
| **`extreme_drought`** | Rainfall `< 25%` of normal, moisture `< 14%`, temp `+3.5°C` | Tests irrigation deficits & drought-hardy crop shifts |
| **`salinity_flash`** | `EC` spike to `3.8 dS/m`, soil `pH 8.6` | Tests gypsum amendments & salt-tolerant crops |
| **`flash_flood`** | Soil moisture `94%` (anaerobic root zone) | Tests drainage alerts & waterlogging risk mitigation |
| **`severe_zinc_deficiency`** | Zinc collapses to `0.18 ppm` (`< 0.6 ppm` cutoff) | Tests micronutrient alerts (Khaira / white bud) |

---

## 5. CLI & Python API Usage

```bash
# Generate 1,000 synthetic records with stress scenarios
python data/synthetic/scripts/run_synthetic_engine.py \
  --records 1000 \
  --seed 12345 \
  --states Maharashtra Punjab Karnataka \
  --include-anomalies \
  --output data/synthetic/generated/benchmark_1000.json \
  --format json
```

```python
from data.synthetic.scripts.synthetic_engine import SyntheticAgronomicEngine

engine = SyntheticAgronomicEngine(seed=42)
farm_record = engine.generate_farm_record(state="Maharashtra", soil_order="Vertisol")
assert farm_record["is_synthetic"] is True
```
