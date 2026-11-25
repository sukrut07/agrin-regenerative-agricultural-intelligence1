# 🌾 AgriN — Regenerative Agricultural Intelligence Network

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg?style=flat&logo=python)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-156%20Passed-brightgreen.svg)]()
[![Wokwi Simulator](https://img.shields.io/badge/IoT-Wokwi%20Virtual%20Lab-blueviolet.svg)](https://wokwi.com)
[![Crops](https://img.shields.io/badge/Crops-65%2B%20Scientific%20Varieties-emerald.svg)]()
[![i18n](https://img.shields.io/badge/Languages-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80%20%7C%20%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80-orange.svg)]()
[![BRICS Interoperability](https://img.shields.io/badge/BRICS_Track_4-Hardened-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-gray.svg)]()

> **"BRICS Track 4 — AgriN & Regenerative Agricultural Intelligence Network."**  
> An end-to-end, scientifically validated, and sensor-driven agronomic decision-support platform designed for localized agricultural intelligence across all 28 Indian States and 8 Union Territories (15 ICAR Agro-Climatic Zones). AgriN integrates calibrated IoT soil sensors, Wokwi virtual hardware simulation, Sentinel-2 multi-spectral satellite imagery, Soil Health Card (SHC) diagnostics, multi-season crop rotation optimization, and plant disease vision screening within a canonical country-neutral data exchange architecture.

---

## 🧭 Executive Summary

Modern agriculture faces unprecedented volatility: climate unpredictability, soil organic carbon (SOC) depletion, ground water table collapse, and chemical fertilizer cost inflation. AgriN bridges the gap between field-level soil physics, IoT sensing, and evidence-backed agronomic intelligence.

Unlike generic chatbots or disconnected crop classifiers, AgriN operates as an **actionable, sensor-connected, and regenerative agricultural intelligence system**:
- **Field Intelligence Workspace**: The primary operational cockpit displaying multi-plot boundary maps, real-time soil and ambient telemetry, dynamic weather risk alerts, and biological soil amendments.
- **Pan-India Crop Explorer (65+ Varieties)**: Scientific crop catalogue across 9 categories (Cereals, Pulses, Oilseeds, Commercial, Vegetables, Fruits, Spices, Plantation, Cover/Fodder) with ICAR-benchmarked nutrient, water, and pH bounds.
- **Multi-Season Crop Rotation Planner**: 3-season optimizer (Kharif → Rabi → Zaid) calculating legume nitrogen credits (+40 to +75 kg N/ha), water consumption balancing, and biological pest interruption.
- **12-Parameter Soil Health Diagnostics**: Evaluates available N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, and SOC against National Soil Health Card (SHC) standards with tailored organic amendments (Gypsum, Lime, Daincha green manuring, biofertilizers).
- **AgriSense IoT & Wokwi Virtual Lab**: Production-grade ESP32 firmware architecture with calibrated sensor transfer functions (Capacitive Moisture, DS18B20 1-Wire, Analog pH, RS485 Modbus NPK) and a ready-to-run Wokwi simulation testbench.
- **AgriVision Multi-Spectral & Plant Health**: Sentinel-2 NDVI, NDMI, and EVI vegetation layers alongside plant disease vision screening triage.
- **Multilingual UI (Trilingual)**: Comprehensive English, Hindi (`हिन्दी`), and Marathi (`मराठी`) language support across all pages, navigation, and badges.

---

## 🏛 System Architecture

```
                                  +---------------------------------------------+
                                  |            AGRIN FRONTEND (REACT 19)        |
                                  |  - Field Intelligence Primary Workspace     |
                                  |  - Crop Explorer (65+ Varieties)            |
                                  |  - 3-Season Rotation Planner                |
                                  |  - Soil Health Card (12-Parameter Engine)   |
                                  |  - AgriSense IoT Monitor & Wokwi Lab        |
                                  |  - AgriVision (Satellite & Vision Triage)   |
                                  |  - Multilingual i18n (EN, HI, MR)           |
                                  +----------------------+----------------------+
                                                         | HTTP / JSON REST
                                                         v
+---------------------------------------------------------------------------------------------------------------+
|                                         FASTAPI BACKEND CORE ENGINE                                           |
|                                                                                                               |
|  +------------------------+  +--------------------------+  +----------------------+  +---------------------+  |
|  |   IoT & Telemetry      |  |  Expanded Crop Engine    |  |  Synthetic Engine    |  |  ML Suitability     |  |
|  | - X-Device-Token Auth  |  | - 65+ ICAR Crops         |  | - Faker + Agronomics |  | - Random Forest     |  |
|  | - Temporal Replay Gate |  | - 9 Crop Categories      |  | - 7 Indian Soil Prof |  | - SHAP Explain      |  |
|  | - Farm Ownership Check |  | - Agronomic Bounds       |  | - Anomaly Scenarios  |  | - Dynamic Accuracy  |  |
|  +------------------------+  +--------------------------+  +----------------------+  +---------------------+  |
|                                                                                                               |
|  +---------------------------------------------------------------------------------------------------------+  |
|  |                                  AGRONOMIC INTELLIGENCE ORCHESTRATOR                                     |  |
|  | - Soil Health Card Diagnostics (12 Params)          - Regenerative Advisory & Resilience Scoring        |  |
|  | - Open-Meteo Real-time Weather Telemetry            - BRICS Country-Neutral Harmonization Layer         |  |
|  +---------------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------+-----------------------------------------------------------+
                                                    |
                       +----------------------------+----------------------------+
                       |                                                         |
                       v                                                         v
        +------------------------------+                          +------------------------------+
        |   AGRISENSE PHYSICAL SENSOR  |                          |      WOKWI VIRTUAL LAB       |
        | - ESP32 240MHz Microcontroller |                         | - Virtual ESP32 Testbench    |
        | - Capacitive ADC Moisture     |                         | - Potentiometer Probes       |
        | - DS18B20 1-Wire Temperature  |                         | - Simulated Telemetry Loop   |
        | - pH & EC Signal Conditioning |                         | - Authenticated Bearer Token |
        | - RS485 Modbus NPK Probe     |                         | - firmware/wokwi/            |
        +------------------------------+                          +------------------------------+
```

---

## 📑 Repository Structure & Subsystem READMEs

The repository is modularly structured into self-contained engineering subsystems, each documented with dedicated technical guides:

| Directory | Subsystem Description | Dedicated README |
| :--- | :--- | :--- |
| **`backend/`** | FastAPI REST service, ML predictors, IoT authentication, agronomic rules | [backend/README.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/backend/README.md) |
| **`frontend/`** | React 19 + Vite dashboard, Field Intelligence, Crop Explorer, trilingual i18n | [frontend/README.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/frontend/README.md) |
| **`firmware/`** | AgriSense ESP32 firmware, hardware pinout calibration, Wokwi virtual lab | [firmware/README.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/firmware/README.md) |
| **`data/`** | ICAR/DES/FAO provenance, Faker + agronomic synthetic generation engine | [data/README.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/data/README.md) |
| **`docs/`** | Architecture specifications, BRICS compliance documents, audit logs | [docs/README.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/docs/README.md) |
| **`tests/`** | Pytest test suite covering 156 unit, integration, and E2E scenarios | [TEST_RESULTS.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/TEST_RESULTS.md) |

Canonical feature classification is maintained in [SYSTEM_STATUS.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/SYSTEM_STATUS.md).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.11 or 3.12 (using `uv` or `venv`)
- **Node.js**: v18+ (tested on Node v24.13.0, npm 11.6.2)
- **Git**

### 1. Clone & Environment Setup
```bash
git clone https://github.com/Sushrut-Kale/AgriN-Regenerative-Agricultural-Intelligence.git
cd AgriN-Regenerative-Agricultural-Intelligence

# Setup Python Virtual Environment using uv
uv venv .venv --python 3.12
source .venv/bin/activate

# Install Python backend dependencies
uv pip install -r requirements.txt
uv pip install faker
```

### 2. Train Model & Initialize Database
```bash
# Build training dataset and train Random Forest model
python data/scripts/build_training_dataset.py
python ml/train.py

# Verify backend test suite (156 passing tests)
pytest tests/ -v
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build   # Production build verification
npm run dev     # Starts local Vite development server at http://localhost:5173
```

### 4. Running Backend Service
```bash
# From repository root
source .venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

## 🔒 Scientific Integrity & Honesty Manifesto

AgriN adheres to strict architectural principles of **agricultural and technological honesty**:
1. **Unmistakable Telemetry Badges**: Simulated data is clearly badged as `SIMULATED WOKWI LAB`, estimated values are marked as `ESTIMATED`, and live physical data requires genuine authenticated ESP32 connection.
2. **Synthetic Data Separation**: All synthetic records generated by Faker and agronomic profiles carry `is_synthetic = True` and are never combined with empirical ICAR/DES datasets.
3. **No Fabricated ML Metrics**: Opaque claims of "99.3% accuracy" have been replaced with live metadata extracted directly from `predictor.get_model_info()`.
4. **Honest Fallbacks**: API and model errors are logged via `logger.error` with stack traces rather than swallowed by silent print statements.

---

## 📜 Documentation Deliverables
- [SYSTEM_STATUS.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/SYSTEM_STATUS.md) — Canonical feature implementation matrix.
- [IMPLEMENTATION_REPORT.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/IMPLEMENTATION_REPORT.md) — Comprehensive technical implementation report.
- [SYNTHETIC_DATA_DOCUMENTATION.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/SYNTHETIC_DATA_DOCUMENTATION.md) — Engine architecture, soil profiles, and anomaly generators.
- [DATA_DICTIONARY.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/DATA_DICTIONARY.md) — Complete 12-parameter soil and sensor dictionary.
- [TEST_RESULTS.md](file:///Users/sukrutdusane/Documents/Projects/SY/Agrin/TEST_RESULTS.md) — Verification run log (156 tests passing, 0 build errors).

---

## ⚖️ License & Acknowledgments
Released under the **MIT License**. Agronomic bounds, soil orders, and crop classifications are benchmarked against official publications from the **Indian Council of Agricultural Research (ICAR)**, **Directorate of Economics and Statistics (DES)**, and the **Soil Health Card (SHC)** scheme, Government of India.
