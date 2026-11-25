# 📖 AgriN — Agricultural, Sensor & Decision Data Dictionary

> **Navigation:** [Root README](README.md) · [Data README](data/README.md) · [Hardware README](hardware/README.md) · [Docs Hub](docs/README.md) · [System Status](SYSTEM_STATUS.md)

This dictionary defines all agronomic, Soil Health Card (SHC), AgriSense IoT telemetry, remote-sensing index, and Farm Intelligence Report output entities used across AgriN.

---

## 📑 Table of Contents
- [1. Soil Health Card (SHC) 12-Parameter Suite](#1-soil-health-card-shc-12-parameter-suite)
- [2. AgriSense IoT Telemetry Parameters](#2-agrisense-iot-telemetry-parameters)
- [3. Satellite Remote Sensing Indices](#3-satellite-remote-sensing-indices)
- [4. Crop & Field Structural Entities](#4-crop--field-structural-entities)
- [5. Farm Intelligence Report Output Contracts](#5-farm-intelligence-report-output-contracts)

---

## 1. Soil Health Card (SHC) 12-Parameter Suite

| Parameter Name | Key / Symbol | Physical Unit | Agricultural Range | ICAR Rating Boundaries | Diagnostic Significance & Biological Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Available Nitrogen** | `n` / `N` | kg/ha | 50 – 700 | Low `< 280` · Medium `280 – 560` · High `> 560` | Primary driver of vegetative growth, amino acid synthesis, and chlorophyll |
| **Available Phosphorus** | `p` / `P2O5` | kg/ha | 2 – 60 | Low `< 10` · Medium `10 – 25` · High `> 25` | Critical for root proliferation, ATP energy transfer, and flower initiation |
| **Available Potassium** | `k` / `K2O` | kg/ha | 50 – 600 | Low `< 108` · Medium `108 – 280` · High `> 280` | Regulates stomatal conductance, water stress tolerance, and disease immunity |
| **Available Sulphur** | `s` / `S` | ppm (mg/kg) | 2 – 40 | Deficient `< 10` · Sufficient `≥ 10` | Essential for cysteine/methionine amino acids and oil content in oilseeds |
| **Available Zinc** | `zn` / `Zn` | ppm (mg/kg) | 0.1 – 4.0 | Deficient `< 0.6` · Sufficient `≥ 0.6` | Auxin synthesis cofactor; prevents Khaira disease in paddy |
| **Available Iron** | `fe` / `Fe` | ppm (mg/kg) | 1.0 – 25.0 | Deficient `< 4.5` · Sufficient `≥ 4.5` | Chloroplast electron transport; commonly deficient in calcareous soils |
| **Available Copper** | `cu` / `Cu` | ppm (mg/kg) | 0.05 – 3.0 | Deficient `< 0.2` · Sufficient `≥ 0.2` | Respiratory enzymes and lignin synthesis in cell walls |
| **Available Manganese** | `mn` / `Mn` | ppm (mg/kg) | 0.5 – 15.0 | Deficient `< 2.0` · Sufficient `≥ 2.0` | Photosystem water-splitting catalyst |
| **Available Boron** | `b` / `B` | ppm (mg/kg) | 0.1 – 3.0 | Deficient `< 0.5` · Sufficient `≥ 0.5` | Pollen tube growth, grain setting, and calcium mobility |
| **Soil Reaction (pH)** | `ph` / `pH` | pH units | 4.5 – 9.5 | Acidic `< 6.5` · Optimal `6.5 – 7.8` · Alkaline `> 8.2` | Governs nutrient solubility and soil microbial activity (`confidence_engine.py` normalizes both `ph` and `pH`) |
| **Electrical Conductivity** | `ec` / `EC` | dS/m | 0.05 – 4.0 | Non-saline `< 1.0` · Slight `1.0 – 2.0` · Harmful `> 2.0` | Measures dissolved pore-water salts; excessive EC causes osmotic stress |
| **Soil Organic Carbon** | `oc` / `SOC` | % | 0.1 – 2.5 | Low `< 0.5%` · Medium `0.5 – 0.75%` · High `> 0.75%` | Master soil health indicator driving CEC, structure & water holding capacity |

---

## 2. AgriSense IoT Telemetry Parameters

Hardware assignments align with [firmware/include/pins.h](firmware/include/pins.h) and [hardware/README.md](hardware/README.md):

| Telemetry Field | Unit | Sensor / Pin Mapping | Operational Range | Ingestion Thresholds & Provenance Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`soil_moisture`** | % VWC | Capacitive sensor via ADS1115 `Ch 0` (`A0`) | 0.0 – 100.0% | Out-of-range values rejected/flagged by diagnostic filter |
| **`soil_temperature`** | °C | DS18B20 1-Wire (`GPIO 4`, 4.7 kΩ pull-up) | -10.0 – 65.0 °C | Filters DS18B20 `-127°C` fault & `85°C` transient codes |
| **`soil_ph`** | pH | Glass probe board via ADS1115 `Ch 1` (`A1`) | 3.5 – 10.5 | Nernst temperature-compensated curve (pH 4.01 / 6.86 buffers) |
| **`soil_ec`** | dS/m | EC board via ADS1115 `Ch 2` (`A2`) | 0.0 – 5.0 dS/m | 25°C normalized against `1413 µS/cm` KCl standard |
| **`nitrogen`** | kg/ha | RS485 Modbus (`RX 16 / TX 17 / DE_RE 27`) | 0 – 500 kg/ha | Marked `UNAVAILABLE` or `ESTIMATED` unless RS485 probe verified |
| **`phosphorus`** | kg/ha | RS485 Modbus (`RX 16 / TX 17 / DE_RE 27`) | 0 – 100 kg/ha | Marked `UNAVAILABLE` or `ESTIMATED` without physical NPK probe |
| **`potassium`** | kg/ha | RS485 Modbus (`RX 16 / TX 17 / DE_RE 27`) | 0 – 500 kg/ha | Marked `UNAVAILABLE` or `ESTIMATED` without physical NPK probe |
| **`battery_voltage`** | V | `GPIO 34` (`100kΩ / 100kΩ` 1:2 divider) | 3.0 – 4.25 V | Li-ion OCV curve; `< 3.3V` triggers low-battery warning |
| **`signal_rssi`** | dBm | ESP32 Wi-Fi RSSI | -120 – -30 dBm | Link quality monitoring (`≥ -65 dBm` strong) |

---

## 3. Satellite Remote Sensing Indices

| Index | Formula | Physical Meaning | Normal Range | Agronomic Interpretation |
| :--- | :--- | :--- | :--- | :--- |
| **NDVI** | `(NIR - Red) / (NIR + Red)` | Normalized Difference Vegetation Index | -0.1 – 0.9 | `< 0.2`: bare/fallow · `0.2 – 0.5`: emergence · `> 0.6`: dense canopy |
| **NDMI** | `(NIR - SWIR) / (NIR + SWIR)` | Normalized Difference Moisture Index | -0.2 – 0.6 | Foliage liquid moisture; negative values suggest moisture stress |
| **EVI** | `2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)` | Enhanced Vegetation Index | -0.1 – 1.0 | Atmospheric/soil-adjusted canopy density metric |

---

## 4. Crop & Field Structural Entities

| Entity / Property | Data Type | Permitted Values / Format | Description |
| :--- | :--- | :--- | :--- |
| **`crop_id`** | String | `snake_case` (e.g., `chickpea`, `soybean`) | Canonical crop identifier across catalogue & ML classifier |
| **`category`** | String | `cereal`, `pulse`, `oilseed`, `commercial`, `vegetable`, `fruit`, `spice`, `plantation`, `cover_fodder` | 9-category commodity classification |
| **`season`** | String | `Kharif`, `Rabi`, `Zaid`, `Perennial` | Indian seasonal cropping window |
| **`lifecycle`** | String | `annual`, `biennial`, `perennial` | Botanical duration cycle |
| **`water_requirement_mm`** | Float | `150.0 – 2500.0` mm | Seasonal water budget requirement |
| **`duration_days`** | Integer | `45 – 365` (or `null` for perennials) | Seed-to-harvest growth duration |
| **`is_synthetic`** | Boolean | `true` / `false` | Explicit provenance flag separating synthetic profiles from real records |

---

## 5. Farm Intelligence Report Output Contracts

Key response blocks produced by `POST /api/analyze` and rendered by `Recommendations.jsx` + `ReportCharts.jsx`:

| Output Object | Key Fields | Purpose |
| :--- | :--- | :--- |
| **`crop_suitability[]`** | `overall_score`, `ml_score`, `rule_score`, `soil_compatibility`, `weather_compatibility`, `water_compatibility`, `season_compatibility` | Blended `50%` ML + `50%` ICAR compatibility breakdown per cultivar |
| **`soil_health`** | `status`, `score`, `component_scores`, `nutrient_status`, `chemical_properties`, `organic_matter`, `soil_constraints` | Comprehensive SHC diagnostic score and remediable deficiencies |
| **`farm_resilience`** | `score`, `resilience_tier`, `components` (`soil_health`, `water_context`, `climate_context`, `crop_diversity`, `crop_suitability`), `weights` | 5-pillar biophysical resilience decoupled from data completeness |
| **`confidence` / `data_quality`** | `confidence_score`, `confidence_level`, `factors` (`completeness`, `freshness`, `geographic_precision`, `model_confidence`, `rule_coverage`), `metrics` | Assessment reliability and telemetry completeness metrics |
| **`prioritized_advisories[]`** | `priority` (`CRITICAL` > `HIGH` > `MEDIUM` > `LOW`), `category`, `recommendation`, `trigger`, `reason` | Severity-ranked action queue |
| **`regenerative_opportunities[]`** | `practice`, `confidence`, `trigger`, `why`, `objective` | Targeted soil carbon, moisture harvesting & ecological stewardship practices |
