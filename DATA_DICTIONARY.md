# 📖 AgriN — Comprehensive Agricultural & Sensor Data Dictionary

This dictionary defines all agronomic, physicochemical, IoT telemetry, and remote sensing parameters utilized within the AgriN platform, including their physical units, standard reference ranges, and ICAR diagnostic boundaries.

---

## 🧪 1. Soil Health Card (SHC) 12-Parameter Suite

| Parameter Name | Key / Symbol | Physical Unit | Agricultural Range | ICAR Rating Boundaries | Diagnostic Significance & Biological Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Available Nitrogen** | `n` / $N$ | kg/ha | 50 – 700 | • Low: `< 280`<br>• Medium: `280 – 560`<br>• High: `> 560` | Primary driver of vegetative growth, amino acid synthesis, and leaf chlorophyll. |
| **Available Phosphorus** | `p` / $P_2O_5$ | kg/ha | 2 – 60 | • Low: `< 10`<br>• Medium: `10 – 25`<br>• High: `> 25` | Critical for early root proliferation, energy transfer (ATP), and flower initiation. |
| **Available Potassium** | `k` / $K_2O$ | kg/ha | 50 – 600 | • Low: `< 108`<br>• Medium: `108 – 280`<br>• High: `> 280` | Regulates stomatal conductance, water stress tolerance, and disease immunity. |
| **Available Sulphur** | `s` / $S$ | ppm (mg/kg) | 2 – 40 | • Deficient: `< 10`<br>• Sufficient: `≥ 10` | Essential for methionine and cysteine amino acids; boosts oil percentage in oilseeds. |
| **Available Zinc** | `zn` / $Zn$ | ppm (mg/kg) | 0.1 – 4.0 | • Deficient: `< 0.6`<br>• Sufficient: `≥ 0.6` | Co-factor in auxin hormone synthesis; prevents "Khaira" disease in paddy. |
| **Available Iron** | `fe` / $Fe$ | ppm (mg/kg) | 1.0 – 25.0 | • Deficient: `< 4.5`<br>• Sufficient: `≥ 4.5` | Required for chlorophyll chloroplast electron transport; deficient in calcareous soils. |
| **Available Copper** | `cu` / $Cu$ | ppm (mg/kg) | 0.05 – 3.0 | • Deficient: `< 0.2`<br>• Sufficient: `≥ 0.2` | Catalyzes respiratory enzymes and lignin synthesis in plant cell walls. |
| **Available Manganese** | `mn` / $Mn$ | ppm (mg/kg) | 0.5 – 15.0 | • Deficient: `< 2.0`<br>• Sufficient: `≥ 2.0` | Involved in water-splitting reaction of photosynthesis. |
| **Available Boron** | `b` / $B$ | ppm (mg/kg) | 0.1 – 3.0 | • Deficient: `< 0.5`<br>• Sufficient: `≥ 0.5` | Crucial for pollen tube elongation, grain setting, and calcium mobility. |
| **Soil Reaction (pH)** | `ph` | pH units | 4.5 – 9.5 | • Acidic: `< 6.5`<br>• Neutral/Optimal: `6.5 – 7.8`<br>• Sodic/Alkaline: `> 8.2` | Governs availability of all essential nutrients and soil microbial populations. |
| **Electrical Conductivity**| `ec` | dS/m | 0.05 – 4.0 | • Non-saline: `< 1.0`<br>• Slightly Saline: `1.0 – 2.0`<br>• Harmful: `> 2.0` | Measures total dissolved salts in soil pore water; high EC induces osmotic drought. |
| **Soil Organic Carbon** | `oc` / $SOC$ | % | 0.1 – 2.5 | • Low: `< 0.5%`<br>• Medium: `0.5 – 0.75%`<br>• High: `> 0.75%` | The master indicator of soil health, microbial respiration, and water holding capacity. |

---

## 📡 2. AgriSense IoT Telemetry Parameters

| Telemetry Field | Unit | Sampling Sensor | Operational Range | Ingestion Thresholds & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`soil_moisture`** | % VWC | Capacitive Analog (GPIO 34) | 0.0 – 100.0% | Values `< 5%` or `> 98%` trigger diagnostic range alerts. |
| **`soil_temperature`**| °C | DS18B20 1-Wire (GPIO 4) | -10.0 – 65.0 °C | Root-zone temperature; values `< 5°C` or `> 48°C` trigger dormancy/heat alerts. |
| **`soil_ph`** | pH | Glass Electrode (GPIO 35) | 3.5 – 10.5 | Derived via calibrated ADC linear curve with pH 4.01/6.86 buffers. |
| **`soil_ec`** | dS/m | Conductivity Probe (GPIO 32) | 0.0 – 5.0 dS/m | Derived via 0.01M KCl reference standard. |
| **`nitrogen`** | kg/ha | Derived / Modbus NPK | 0 – 500 kg/ha | Flagged as `ESTIMATED` unless connected to lab-calibrated optical probe. |
| **`phosphorus`** | kg/ha | Derived / Modbus NPK | 0 – 100 kg/ha | Flagged as `ESTIMATED`. |
| **`potassium`** | kg/ha | Derived / Modbus NPK | 0 – 500 kg/ha | Flagged as `ESTIMATED`. |
| **`battery_voltage`** | V | 100kΩ/100kΩ Divider (GPIO 36) | 3.0 – 4.25 V | Nominal 3.7V Li-ion cell. Voltage `< 3.3V` triggers Low Battery Warning. |
| **`signal_rssi`** | dBm | ESP32 Wi-Fi / LoRaWAN RSSI | -120 – -30 dBm | `≥ -65 dBm` (Excellent), `-66 to -80` (Good), `< -85` (Weak). |

---

## 🛰 3. Satellite Remote Sensing Indices

| Index | Formula | Physical Meaning | Normal Range | Agronomic Interpretation |
| :--- | :--- | :--- | :--- | :--- |
| **NDVI** | $\frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$ | Normalized Difference Vegetation Index | -0.1 – 0.9 | • `< 0.2`: Bare soil / fallow<br>• `0.2 – 0.5`: Early vegetative emergence<br>• `> 0.6`: Dense green canopy / peak biomass |
| **NDMI** | $\frac{\text{NIR} - \text{SWIR}}{\text{NIR} + \text{SWIR}}$ | Normalized Difference Moisture Index | -0.2 – 0.6 | Directly measures liquid water in crop foliage. Negative values indicate drought stress. |
| **EVI** | $2.5 \cdot \frac{\text{NIR} - \text{Red}}{\text{NIR} + 6 \cdot \text{Red} - 7.5 \cdot \text{Blue} + 1}$ | Enhanced Vegetation Index | -0.1 – 1.0 | Corrects for atmospheric aerosols and soil background; prevents saturation in high-canopy sugarcane/orchards. |

---

## 🌾 4. Crop & Field Structural Entities

| Entity / Property | Data Type | Permitted Values / Format | Description |
| :--- | :--- | :--- | :--- |
| **`crop_id`** | String | snake_case (e.g. `chickpea`, `soybean`) | Unique canonical crop identifier. |
| **`category`** | String | `cereal`, `pulse`, `oilseed`, `commercial`, `vegetable`, `fruit`, `spice`, `plantation`, `cover_fodder` | Agricultural commodity grouping. |
| **`season`** | String | `Kharif`, `Rabi`, `Zaid`, `Perennial` | Primary Indian agricultural sowing window. |
| **`lifecycle`** | String | `annual`, `biennial`, `perennial` | Growth duration cycle. |
| **`water_requirement_mm`** | Float | 150.0 – 2500.0 mm | Total seasonal water requirement for optimal harvest yield. |
| **`duration_days`** | Integer | 45 – 365 (or null for perennials) | Days from seed germination to physiological maturity. |
| **`is_synthetic`** | Boolean | `true`, `false` | Unambiguous flag verifying whether the record was artificially generated. |
