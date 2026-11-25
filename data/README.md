# 📊 AgriN Data Pipeline, Provenance & Synthetic Engine

This directory houses the foundational datasets, agricultural reference models, and the reproducible synthetic data generation engine for the AgriN platform.

---

## 🏛 Scientific Provenance & Sources

AgriN’s agronomic rules, crop suitability thresholds, and soil diagnostic curves are benchmarked against official agricultural repositories:

1. **Indian Council of Agricultural Research (ICAR)**:
   - Handbook of Agriculture (7th Edition)
   - Agro-climatic zone classifications across 15 distinct planning regions
   - Micronutrient deficiency thresholds for Indian soils
2. **Directorate of Economics and Statistics (DES)**, Ministry of Agriculture & Farmers Welfare:
   - Historical state-wise and district-wise crop yields, sowing seasons, and major producing belts
3. **National Soil Health Card (SHC) Scheme**, Department of Agriculture & Cooperation:
   - 12-parameter diagnostic boundaries (Low, Medium, High / Deficient vs. Sufficient)
4. **Food and Agriculture Organization (FAO)**:
   - Irrigation and Drainage Paper 56 (Crop Evapotranspiration and Water Requirements)

---

## 🔬 Synthetic Data Engine (`data/synthetic/`)

To solve **Flaw 01 (ML Data Credibility)** identified in the technical review, AgriN clearly decouples empirical field observations from generated test data. Synthetic data is generated using a reproducible engine combining **Python Faker** (for realistic farmer identities and farm parcels) with **ICAR agronomic constraints**.

### Key Rules:
- **Zero Confusion**: Every generated record explicitly contains:
  `"is_synthetic": true`, `"synthetic_version": "v1.0"`, `"faker_seed": <int>`
- **Agronomic Validity**: Sensor readings are not purely random; they conform to statistical distributions established for the 7 major Indian soil orders.

### Soil Profiles (`data/synthetic/profiles/soil_profiles.json`):
1. **Vertisols (Black Soils)**: Central & Western India (Maharashtra, Gujarat, MP) — high montmorillonite clay, high potassium, alkaline pH tendency.
2. **Alluvial Soils**: Indo-Gangetic Plains (Punjab, Haryana, UP, Bihar) — balanced NPK, low zinc, neutral pH.
3. **Alfisols (Red Soils)**: Southern & Eastern India (AP, Karnataka, Odisha) — coarse texture, low phosphorus, slightly acidic.
4. **Laterite Soils**: Coastal & high-rainfall belts (Konkan, Kerala, Assam) — high acidity (pH 4.8 - 5.8), phosphorus-fixing, low bases.
5. **Aridisols (Desert Soils)**: Rajasthan, Northern Gujarat — low nitrogen and organic matter, high salinity risk.
6. **Saline & Alkaline Soils**: Sodic pockets in canal command areas — high EC (>2.0 dS/m) or high pH (>8.2).
7. **Mountain / Forest Soils**: Himalayan belt — high organic carbon (>1.0%), acidic, shallow depth.

---

## 💻 CLI Usage: Generating Synthetic Data

```bash
# Generate 500 validated synthetic farm records to CSV and JSON
python data/synthetic/scripts/run_synthetic_engine.py \
  --records 500 \
  --seed 42 \
  --states Maharashtra "Madhya Pradesh" Punjab Karnataka \
  --include-anomalies \
  --output data/synthetic/generated/synthetic_farms_500.json \
  --format json
```

### Supported Anomaly Scenarios:
- `extreme_drought`: Simulates rainfall < 30% of normal with depleted soil moisture (<15%).
- `salinity_flash`: High EC spike (>3.5 dS/m) simulating saline groundwater intrusion.
- `flash_flood`: Water-logged anaerobic root zone (moisture > 90%).
- `severe_zinc_deficiency`: Micronutrient collapse (<0.2 ppm) triggering agronomic alerts.

---

## 📖 Complete Data Dictionary
Refer to [DATA_DICTIONARY.md](../DATA_DICTIONARY.md) for full parameter definitions, physical units, acceptable ranges, and ICAR rating curves.
