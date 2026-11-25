# 🧬 AgriN — Synthetic Agronomic Data Engine Documentation

**Version**: 1.0  
**Engine Module**: `data/synthetic/scripts/synthetic_engine.py`  
**CLI Interface**: `data/synthetic/scripts/run_synthetic_engine.py`  
**API Endpoints**: `/api/synthetic/metadata`, `/api/synthetic/sample`, `/api/synthetic/scenarios`

---

## 🧭 Purpose & Architectural Rationale

In agricultural machine learning and IoT development, real-world farm data collection is bottlenecked by seasonal growing cycles (3-6 months per season), high sensor deployment costs, and geographic fragmentation. However, training or benchmarking systems on purely random numbers produces biologically absurd records (e.g. rice growing in arid desert soil at pH 9.5 without irrigation). Conversely, conflating synthetic test data with empirical holdouts destroys scientific credibility.

To resolve **Flaw 01 (ML Data Credibility)**, AgriN implements a **Constrained Synthetic Agronomic Engine**:
1. Uses **Python Faker** (`en_IN` / `hi_IN` locales) to generate realistic farmer names, village names, and geospatial coordinates within verified district boundaries.
2. Constrains soil physicochemical parameters (N, P, K, pH, EC, OC, Micronutrients) to statistical distributions established by the **Indian Council of Agricultural Research (ICAR)** for the specific soil order of that region.
3. Strict Provenance Tagging: **Every generated record carries explicit metadata**:
   - `"is_synthetic": true`
   - `"synthetic_version": "v1.0"`
   - `"faker_seed": <int>`
   - `"soil_order": "<name>"`
   - `"generation_timestamp": "<ISO-8601>"`

---

## 🌾 Codified Soil Orders (`soil_profiles.json`)

The engine models 7 major Indian Soil Orders:

| Soil Order | Dominant Regions | Typical Clay / Texture | pH Range | Available N (kg/ha) | Available P (kg/ha) | Available K (kg/ha) | OC (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Vertisols (Black Soil)** | Maharashtra, Gujarat, MP, Karnataka | 40-60% montmorillonite clay | 7.4 – 8.5 | 180 – 260 | 10 – 18 | 280 – 420 | 0.45 – 0.65 |
| **Alluvial Soils** | Punjab, Haryana, UP, Bihar, WB | Loam to silty loam | 6.8 – 7.8 | 220 – 320 | 15 – 26 | 160 – 240 | 0.40 – 0.55 |
| **Alfisols (Red Soil)** | AP, Telangana, Tamil Nadu, Odisha | Coarse sandy loam | 6.0 – 7.0 | 140 – 220 | 8 – 15 | 120 – 180 | 0.30 – 0.48 |
| **Laterite Soils** | Western Ghats, Kerala, Assam | Kaolinite clay, porous | 4.8 – 5.8 | 180 – 250 | 5 – 10 | 90 – 150 | 0.70 – 1.10 |
| **Aridisols (Desert)** | Western Rajasthan, Kutch | Sandy, low cohesion | 7.8 – 8.8 | 100 – 160 | 6 – 12 | 140 – 220 | 0.15 – 0.30 |
| **Saline / Sodic** | Command canal areas, coastal pockets | Impermeable sodic clay | 8.2 – 9.4 | 120 – 190 | 8 – 14 | 180 – 260 | 0.20 – 0.35 |
| **Mountain / Forest** | Himachal, Uttarakhand, J&K | High humic loam | 5.2 – 6.5 | 240 – 360 | 12 – 22 | 150 – 240 | 1.00 – 2.20 |

---

## 🌦 Seasonal Climatic Modulation (`seasonal_profiles.json`)

Climatic parameters are dynamically modulated based on the growing season:
- **Kharif (Monsoon - June to October)**: High ambient humidity (65-90%), frequent rainfall events, temperatures 24-34°C.
- **Rabi (Winter - November to March)**: Mild temperatures (12-28°C), low precipitation, root-zone moisture dependent on residual soil moisture or irrigation.
- **Zaid (Summer - April to May)**: High heat (32-44°C), low relative humidity (20-40%), rapid evapotranspiration.
- **Perennial (Year-round)**: Multi-season moving averages tailored for orchard and plantation crops (Mango, Coconut, Coffee).

---

## ⚠️ Anomaly Injection Scenarios

The engine includes deterministic anomaly generators to stress-test farm resilience models and emergency advisory alerts:

### 1. `extreme_drought`
- Rainfall reduced to < 25% of seasonal normal.
- Soil moisture drops below 14% (permanent wilting point for loams).
- Ambient temperature elevated by +3.5°C.
- Tests early-warning irrigation advisories and drought-tolerant crop switching.

### 2. `salinity_flash`
- Electrical Conductivity (EC) spikes to 3.8 dS/m.
- Soil pH elevated to 8.6.
- Tests gypsum remediation recommendations and salt-tolerant crop selection (e.g. Barley, Mustard).

### 3. `flash_flood`
- Soil moisture hits 94% (anaerobic waterlogging).
- Simulates monsoon cloudburst events.
- Tests drainage advisory generation and root rot risk prevention.

### 4. `severe_zinc_deficiency`
- Available Zinc collapses to 0.18 ppm (critical threshold is 0.6 ppm).
- Triggers micronutrient alert for Khaira disease in rice and white bud in maize.

---

## 💻 CLI Commands & Code Examples

### Command Line Generation:
```bash
# Generate 1,000 synthetic records with anomalies in JSON format
python data/synthetic/scripts/run_synthetic_engine.py \
  --records 1000 \
  --seed 12345 \
  --states Maharashtra Punjab Karnataka \
  --include-anomalies \
  --output data/synthetic/generated/benchmark_1000.json \
  --format json
```

### Python API Usage:
```python
from data.synthetic.scripts.synthetic_engine import SyntheticAgronomicEngine

engine = SyntheticAgronomicEngine(seed=42)

# Generate a single realistic farm record
farm_record = engine.generate_farm_record(state="Maharashtra", soil_order="Vertisol")
assert farm_record["is_synthetic"] is True
assert 7.4 <= farm_record["soil_health"]["ph"] <= 8.5
```
