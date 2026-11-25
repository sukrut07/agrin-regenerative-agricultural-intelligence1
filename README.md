# 🌾 AgriN — Regenerative Agricultural Intelligence Network

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg?style=flat&logo=python)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Pytest-176%20Passed%20%7C%204%20Failed-yellow.svg)](TEST_RESULTS.md)
[![Wokwi Simulator](https://img.shields.io/badge/IoT-Wokwi%20Virtual%20Lab-blueviolet.svg)](https://wokwi.com)
[![Crops](https://img.shields.io/badge/Crops-65%2B%20Scientific%20Varieties-emerald.svg)]()
[![i18n](https://img.shields.io/badge/Languages-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80%20%7C%20%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80-orange.svg)]()
[![BRICS Interoperability](https://img.shields.io/badge/BRICS_Track_4-Hardened-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-gray.svg)]()

> **"BRICS Track 4 — AgriN & Regenerative Agricultural Intelligence Network."**  
> An end-to-end, scientifically grounded, and sensor-ready agronomic decision-support platform designed for localized agricultural intelligence across all 28 Indian States and 8 Union Territories (15 ICAR Agro-Climatic Zones). AgriN integrates hybrid Random Forest + ICAR rule-based crop suitability scoring, explainable interactive Recharts analytics, 12-parameter Soil Health Card (SHC) diagnostics, multi-season crop rotation optimization, calibrated ESP32 hardware & Wokwi simulation, Sentinel-2 remote-sensing abstractions, AgriMarket & AgriLedger economics workflows, and a country-neutral BRICS interoperability schema.

---

## 🧭 Executive Summary

Modern agriculture faces severe volatility: climate unpredictability, soil organic carbon (SOC) depletion, groundwater stress, and chemical fertilizer cost inflation. AgriN bridges field-level soil physics, hardware telemetry readiness, and evidence-backed agronomic intelligence:

- **Soil-Driven Suitability Report & Interactive Recharts Suite (`/recommendations`)**: Unified Farm Intelligence Report combining `50%` Random Forest ML + `50%` deterministic ICAR agronomic rules with scroll-animated Recharts visualizations (`ReportCharts.jsx`): Executive KPI gauges, Crop Suitability mode switcher (Overall / Rule vs ML / Soil-Climate-Water-Season), Multi-Crop Radar & Bar comparison, clickable Action Queue severity & domain bars, Explainable Why drivers & reliability signals, ICAR Nutrient Benchmark bars + pH spectrum gauge, Regenerative Practice focus & impact donut, 5-Pillar Farm Resilience polygon, and Data Confidence vs Data Quality metrics.
- **Field Intelligence Workspace (`/field-intelligence`)**: Operational cockpit displaying plot boundaries, ambient and soil parameters, seasonal weather signals, and localized biological advisories.
- **Pan-India Crop Explorer (`/crop-explorer`)**: Catalogue of **65+ crop varieties** across 9 categories (Cereals, Pulses, Oilseeds, Commercial, Vegetables, Fruits, Spices, Plantation, Cover/Fodder) with ICAR nutrient, water, and pH bounds.
- **Multi-Season Crop Rotation Planner (`/crop-planner`)**: 3-season optimizer (Kharif → Rabi → Zaid) estimating biological legume nitrogen credits, water budgets, and pest breaks.
- **12-Parameter Soil Health Diagnostics (`/soil-health`)**: Evaluates N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, and SOC against National Soil Health Card standards with organic amendment guidance.
- **AgriSense IoT, Firmware Diagnostics & Unit 01 Bench Readiness**: Authenticated ESP32 telemetry pipeline (`X-Device-Token`), PlatformIO firmware with `HardwareBringup` analog boot safety gating (`firmware/`), Wokwi virtual lab (`firmware/wokwi/`), and hardware commissioning documentation (`hardware/commissioning/`).
- **AgriVision (`/agrivision`), AgriMarket (`/marketplace`) & Farm Economics (`/economics`)**: Satellite vegetation index workflows, local crop input/market directories, and AgriLedger seasonal margin analysis.
- **Multilingual UI & Simple/Advanced Navigation Modes**: Runtime switching across English, Hindi (`हिन्दी`), and Marathi (`मराठी`), paired with Simple and Advanced farmer navigation modes.

---

## 🏛 System Architecture

```
                                  +---------------------------------------------------+
                                  |             AGRIN FRONTEND (REACT 19)             |
                                  |  - Guided 4-Step Assessment & Editorial Landing   |
                                  |  - Farm Intelligence Report + Animated Recharts   |
                                  |  - Crop Explorer (65+ Varieties) & 3-Szn Planner  |
                                  |  - Soil Health Card (12-Param) & What-If Sim      |
                                  |  - AgriMarket, AgriLedger Economics & AgriVision  |
                                  |  - AgriSense IoT Monitor & Trilingual i18n        |
                                  +-------------------------+-------------------------+
                                                            | HTTP / JSON REST
                                                            v
+---------------------------------------------------------------------------------------------------------------+
|                                         FASTAPI BACKEND CORE ENGINE                                           |
|                                                                                                               |
|  +------------------------+  +--------------------------+  +----------------------+  +---------------------+  |
|  |   IoT & Telemetry      |  |  Expanded Crop Engine    |  |  Synthetic Engine    |  |  Hybrid Scoring     |  |
|  | - X-Device-Token Auth  |  | - 65+ ICAR Crops         |  | - Faker + Agronomics |  | - Random Forest 50% |  |
|  | - Temporal Replay Gate |  | - 9 Crop Categories      |  | - 7 Indian Soil Prof |  | - ICAR Rules 50%    |  |
|  | - Farm Ownership Check |  | - Trade-Off Comparison   |  | - Anomaly Scenarios  |  | - Explainable XAI   |  |
|  +------------------------+  +--------------------------+  +----------------------+  +---------------------+  |
|                                                                                                               |
|  +---------------------------------------------------------------------------------------------------------+  |
|  |                            UNIFIED INTELLIGENCE ORCHESTRATOR (`agrin_intelligence.py`)                  |  |
|  | - Soil Health Card Diagnostics (12 Params)        - Regenerative Advisory & 5-Pillar Resilience         |  |
|  | - Open-Meteo Real-time Weather + Fallbacks        - BRICS Country-Neutral Schema & Confidence Engine    |  |
|  +---------------------------------------------------------------------------------------------------------+  |
+---------------------------------------------------+-----------------------------------------------------------+
                                                    |
                       +----------------------------+----------------------------+
                       |                                                         |
                       v                                                         v
        +------------------------------+                          +------------------------------+
        |   AGRISENSE PHYSICAL NODE    |                          |      WOKWI VIRTUAL LAB       |
        | - ESP32 DevKit V1 (240 MHz)  |                          | - Virtual ESP32 Testbench    |
        | - ADS1115 + DS18B20 + RS485  |                          | - Potentiometer Probes       |
        | - Stage A Cold Verification  |                          | - Authenticated Telemetry Loop |
        | - hardware/commissioning/    |                          | - firmware/wokwi/            |
        +------------------------------+                          +------------------------------+
```

---

## 📑 Repository Structure & Subsystem Documentation

| Directory | Subsystem Description | Dedicated Documentation |
| :--- | :--- | :--- |
| **`backend/`** | FastAPI REST service (13 routers), hybrid ML + ICAR scorer, IoT token auth, SQLite persistence | [backend/README.md](backend/README.md) |
| **`frontend/`** | React 19 + Vite + Tailwind v4 editorial UI, interactive `ReportCharts.jsx` Recharts suite, EN/HI/MR i18n | [frontend/README.md](frontend/README.md) |
| **`firmware/`** | AgriSense ESP32 PlatformIO firmware, analog bring-up safety gate, Wokwi virtual lab | [firmware/README.md](firmware/README.md) |
| **`hardware/`** | Bench assembly guide, HIL harness, Unit 01 cold-check & commissioning dossier | [hardware/AGRISENSE_BENCH_ASSEMBLY_GUIDE.md](hardware/AGRISENSE_BENCH_ASSEMBLY_GUIDE.md) |
| **`data/`** | ICAR/DES/FAO provenance, Faker + agronomic synthetic generation engine | [data/README.md](data/README.md) |
| **`docs/`** | Architecture specifications, BRICS compliance specs, model & dataset cards | [docs/README.md](docs/README.md) |
| **`tests/`** | Pytest suite covering agronomic validation, APIs, IoT auth, firmware diagnostics, E2E pipelines | [TEST_RESULTS.md](TEST_RESULTS.md) |

Canonical feature maturity classification is maintained in [SYSTEM_STATUS.md](SYSTEM_STATUS.md).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.11 or 3.12 (`uv` or `venv`)
- **Node.js**: v18+ (verified on Node v24.13.0, npm 11.6.2)
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
```

### 2. Model Artifacts & Backend Tests
```bash
# Optional: rebuild dataset & retrain Random Forest artifacts
python data/scripts/build_training_dataset.py
python ml/train.py

# Run backend test suite
.venv/bin/pytest tests/ -q
```
> **Current Test Status**: On the merged `main` branch (`2026-11-26`), `176 passed, 4 failed` across 180 collected tests. All core intelligence, agronomic validation, API, IoT security, soil health, synthetic engine, BRICS interoperability, and firmware diagnostic tests pass; the 4 failures are in upstream firmware-backend contract/lifecycle tests (`tests/test_firmware_backend_contract.py` and `tests/test_full_telemetry_lifecycle_e2e.py`) whose requests omit the enforced `X-Device-Token` header. See [TEST_RESULTS.md](TEST_RESULTS.md).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build   # TypeScript check + Vite production bundle (2,409 modules)
npm run dev     # Starts local Vite development server at http://localhost:5173
```

### 4. Running Backend Service
```bash
# From repository root
source .venv/bin/activate
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation when running locally:
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc UI**: `http://127.0.0.1:8000/redoc`

---

## 🔒 Scientific Integrity & Honesty Manifesto

AgriN adheres to strict principles of **agricultural and engineering honesty**:
1. **Honest Telemetry & Sample Labeling**: Manual readings, sample regional archetypes, simulated Wokwi streams, and live authenticated ESP32 telemetry are kept explicitly distinct in UI state and backend provenance metadata.
2. **Synthetic Data Separation**: Synthetic records generated via Faker + ICAR profiles carry `is_synthetic = True` and are separated from empirical evaluation benchmarks.
3. **No Fabricated Accuracy Claims**: Model metrics come dynamically from `predictor.get_model_info()` and underlying metadata rather than hardcoded accuracy banners.
4. **Hardware Safety Gating**: Unit 01 physical commissioning starts in **Stage A (Unpowered Cold Verification)** with sensor channels disabled on boot until analog voltage safety checks are recorded (`hardware/commissioning/PHASE_03_1_COMPLETION_REPORT.md`).

---

## 📜 Documentation Deliverables
- [SYSTEM_STATUS.md](SYSTEM_STATUS.md) — Canonical feature implementation matrix.
- [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) — Technical implementation & UI modernization report.
- [SYNTHETIC_DATA_DOCUMENTATION.md](SYNTHETIC_DATA_DOCUMENTATION.md) — Synthetic data engine, soil profiles, and anomaly scenarios.
- [DATA_DICTIONARY.md](DATA_DICTIONARY.md) — Complete 12-parameter soil and sensor dictionary.
- [TEST_RESULTS.md](TEST_RESULTS.md) — Latest observed pytest & Vite build verification log.
- [hardware/commissioning/PHASE_03_1_COMPLETION_REPORT.md](hardware/commissioning/PHASE_03_1_COMPLETION_REPORT.md) — Prototype Unit 01 commissioning readiness report.

---

## ⚖️ License & Acknowledgments
Released under the **MIT License**. Agronomic bounds, soil orders, and crop classifications are benchmarked against official publications from the **Indian Council of Agricultural Research (ICAR)**, **Directorate of Economics and Statistics (DES)**, and the **Soil Health Card (SHC)** scheme, Government of India.
