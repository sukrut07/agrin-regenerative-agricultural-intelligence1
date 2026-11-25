# 🌾 AgriN — Regenerative Agricultural Intelligence Network

> **Navigation:** [Docs Hub](docs/README.md) · [System Status](SYSTEM_STATUS.md) · [Test Results](TEST_RESULTS.md) · [Implementation Report](IMPLEMENTATION_REPORT.md) · [Data Dictionary](DATA_DICTIONARY.md)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB.svg?style=flat&logo=python)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Pytest](https://img.shields.io/badge/Pytest-176%20Passed%20%7C%204%20Failed-yellow.svg)](TEST_RESULTS.md)
[![Wokwi Simulator](https://img.shields.io/badge/IoT-Wokwi%20Virtual%20Lab-blueviolet.svg)](firmware/wokwi/README.md)
[![Crops](https://img.shields.io/badge/Crops-65%2B%20Scientific%20Varieties-emerald.svg)](frontend/README.md)
[![i18n](https://img.shields.io/badge/Languages-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80%20%7C%20%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80-orange.svg)](frontend/README.md)
[![BRICS Interoperability](https://img.shields.io/badge/BRICS_Track_4-Hardened-blue.svg)](docs/BRICS_INTEROPERABILITY_ARCHITECTURE.md)
[![License](https://img.shields.io/badge/License-MIT-gray.svg)]()

> **"BRICS Track 4 — AgriN & Regenerative Agricultural Intelligence Network."**  
> A soil-data-driven, scientifically grounded, and sensor-ready agronomic decision-support platform designed across all 28 Indian States and 8 Union Territories (15 ICAR Agro-Climatic Zones). AgriN unifies Random Forest crop suitability prediction (`50%`) with deterministic ICAR agronomic rules (`50%`), animated interactive Recharts analytics, 12-parameter Soil Health Card diagnostics, multi-season rotation planning, authenticated ESP32 telemetry & hardware commissioning workflows, and a country-neutral BRICS interoperability schema.

---

## 📑 Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture](#2-system-architecture)
- [3. Repository Layout & Subsystems](#3-repository-layout--subsystems)
- [4. Documentation Map](#4-documentation-map)
- [5. Quick Start Guide](#5-quick-start-guide)
- [6. Testing & Verification Summary](#6-testing--verification-summary)
- [7. Scientific Integrity & Honesty Manifesto](#7-scientific-integrity--honesty-manifesto)
- [8. License & Acknowledgments](#8-license--acknowledgments)

---

## 1. Executive Summary

AgriN bridges field-level soil physics, hardware telemetry readiness, and evidence-backed agronomic intelligence:

- **Soil-Driven Farm Intelligence Report & Interactive Charts (`/recommendations`)**: Unified suitability dashboard blending `50%` Random Forest ML + `50%` ICAR agronomic feasibility bounds, rendered through scroll-animated Recharts visualizations (`frontend/src/components/ReportCharts.jsx`): Executive KPI gauges, Crop Suitability mode switcher, Multi-Crop Radar & Bar comparisons, clickable Action Queue severity bars, Explainable Why drivers & caveats, ICAR soil nutrient benchmarks + pH gauge, Regenerative Practice focus & impact donut, 5-Pillar Resilience polygon, and Confidence vs Data Quality metrics.
- **Pan-India Crop Explorer (`/crop-explorer`) & Rotation Planner (`/crop-planner`)**: **65+ crop varieties** across 9 categories with pH, nutrient, and water bounds alongside a 3-season (`Kharif → Rabi → Zaid`) rotation optimizer.
- **12-Parameter Soil Health Card Engine (`/soil-health`)**: Diagnostics for N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, and SOC with targeted biological amendments.
- **AgriSense IoT, Bring-Up Firmware & Bench Readiness**: Authenticated telemetry (`X-Device-Token`), analog-safe `HardwareBringup` firmware (`firmware/`), Wokwi virtual lab (`firmware/wokwi/`), and Prototype Unit 01 cold-check dossier (`hardware/commissioning/`).
- **AgriVision (`/agrivision`), AgriMarket (`/marketplace`) & AgriLedger (`/economics`)**: Satellite index workflows (with explicit unlinked-provider disclosure), regenerative input directories, and seasonal crop margin planning.
- **Multilingual & Adaptive UX**: Runtime **English / Hindi (`हिन्दी`) / Marathi (`मराठी`)** translation plus Simple vs Advanced farmer modes.

---

## 2. System Architecture

```text
                                  +---------------------------------------------------+
                                  |             AGRIN FRONTEND (REACT 19)             |
                                  |  - Editorial Landing & 4-Step Soil Assessment     |
                                  |  - Unified Report + Animated Recharts Suite       |
                                  |  - Crop Explorer (65+) & 3-Season Planner         |
                                  |  - Soil Health Card (12-Param) & What-If Sim      |
                                  |  - AgriMarket, AgriLedger Economics & AgriVision  |
                                  |  - AgriSense IoT Monitor & EN/HI/MR i18n          |
                                  +-------------------------+-------------------------+
                                                            | HTTP / JSON REST
                                                            v
+---------------------------------------------------------------------------------------------------------------+
|                                    FASTAPI BACKEND CORE ENGINE (13 ROUTERS)                                   |
|                                                                                                               |
|  +------------------------+  +--------------------------+  +----------------------+  +---------------------+  |
|  |   IoT & Telemetry      |  |  Expanded Crop Engine    |  |  Synthetic Engine    |  |  Hybrid Scoring     |  |
|  | - X-Device-Token Auth  |  | - 65+ ICAR Crops         |  | - Faker + Agronomics |  | - Random Forest 50% |  |
|  | - Temporal Replay Gate |  | - 9 Crop Categories      |  | - 7 Indian Soil Prof |  | - ICAR Rules 50%    |  |
|  | - Farm Ownership Check |  | - Trade-Off Comparison   |  | - Anomaly Scenarios  |  | - Explainable XAI   |  |
|  +------------------------+  +--------------------------+  +----------------------+  +---------------------+  |
|                                                                                                               |
|  +---------------------------------------------------------------------------------------------------------+  |
|  |                            UNIFIED INTELLIGENCE ORCHESTRATOR (agrin_intelligence.py)                    |  |
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

## 3. Repository Layout & Subsystems

```text
Agrin/
├── backend/                  # FastAPI core service (13 routers, SQLAlchemy, hybrid intelligence)
├── frontend/                 # React 19 + Vite + Tailwind v4 app & Recharts ReportCharts suite
├── firmware/                 # PlatformIO ESP32 firmware, diagnostic bring-up & Wokwi virtual lab
├── hardware/                 # Bench assembly guides, HIL harness & Unit 01 commissioning dossier
├── data/                     # Raw/processed agronomic datasets & Faker + ICAR synthetic engine
├── ml/                       # Training dataset builder & Random Forest inference wrappers
├── knowledge/                # Structured crop catalogue, calendars, SHC standards & BRICS units
├── docs/                     # Architecture specs, science docs, model cards & archived phase reports
│   └── reports/              # Phase 01–04, India migration & Track 4 audit archive
├── tests/                    # Pytest unit, integration, contract & E2E suites
├── README.md                 # Project overview & quick start (this file)
├── SYSTEM_STATUS.md          # Canonical subsystem maturity & verification matrix
├── TEST_RESULTS.md           # Observed pytest & Vite build log
├── IMPLEMENTATION_REPORT.md  # Engineering & UI modernization report
├── DATA_DICTIONARY.md        # 12-parameter SHC, IoT telemetry, satellite & decision field dictionary
└── SYNTHETIC_DATA_DOCUMENTATION.md  # Synthetic engine architecture & stress scenarios
```

| Subsystem | Description | Documentation |
| :--- | :--- | :--- |
| **`backend/`** | FastAPI REST service (13 routers), hybrid ML + ICAR scorer, `X-Device-Token` IoT auth | [backend/README.md](backend/README.md) |
| **`frontend/`** | React 19 + Vite + Tailwind v4 editorial UI, interactive `ReportCharts.jsx` suite, EN/HI/MR i18n | [frontend/README.md](frontend/README.md) |
| **`firmware/`** | AgriSense ESP32 PlatformIO firmware, analog bring-up safety gate & Wokwi simulator | [firmware/README.md](firmware/README.md) |
| **`hardware/`** | Bench assembly checklists, HIL validation & Prototype Unit 01 commissioning logs | [hardware/README.md](hardware/README.md) |
| **`data/`** | ICAR/DES/FAO data provenance & constrained synthetic dataset engine | [data/README.md](data/README.md) |
| **`docs/`** | Complete specification directory & archived milestone reports (`docs/reports/`) | [docs/README.md](docs/README.md) |

---

## 4. Documentation Map

| Category | Core Documents |
| :--- | :--- |
| **Platform Entrypoints** | [README.md](README.md) · [docs/README.md](docs/README.md) · [SYSTEM_STATUS.md](SYSTEM_STATUS.md) |
| **Verification & Audits** | [TEST_RESULTS.md](TEST_RESULTS.md) · [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) · [docs/reports/](docs/README.md#9-phase-completion--audit-archive-docsreports) |
| **Data & Schemas** | [DATA_DICTIONARY.md](DATA_DICTIONARY.md) · [SYNTHETIC_DATA_DOCUMENTATION.md](SYNTHETIC_DATA_DOCUMENTATION.md) · [docs/model_card.md](docs/model_card.md) · [docs/dataset_card.md](docs/dataset_card.md) |
| **Hardware & Commissioning** | [hardware/README.md](hardware/README.md) · [hardware/commissioning/PHASE_03_1_COMPLETION_REPORT.md](hardware/commissioning/PHASE_03_1_COMPLETION_REPORT.md) |

---

## 5. Quick Start Guide

### Prerequisites
- **Python**: `3.11` or `3.12` (`uv` or `venv`)
- **Node.js**: `v18+` (verified on Node `v24.13.0`, npm `11.6.2`)

### 1. Clone & Python Environment
```bash
git clone https://github.com/Sushrut-Kale/AgriN-Regenerative-Agricultural-Intelligence.git
cd AgriN-Regenerative-Agricultural-Intelligence

uv venv .venv --python 3.12
source .venv/bin/activate
uv pip install -r requirements.txt
```

### 2. Optional Model Training & Backend Tests
```bash
# Rebuild dataset & retrain Random Forest artifacts (if regenerating)
python data/scripts/build_training_dataset.py
python ml/train.py

# Run pytest suite
.venv/bin/pytest tests/ -q
```

### 3. Run Frontend & Backend Locally
```bash
# Terminal 1: FastAPI backend (Swagger at http://127.0.0.1:8000/docs)
source .venv/bin/activate
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: React 19 + Vite frontend (http://127.0.0.1:5173)
cd frontend
npm install
npm run build   # TypeScript check + production bundle verification
npm run dev
```

---

## 6. Testing & Verification Summary

- **Backend Test Suite** (`.venv/bin/pytest --tb=no -r a`): **`176 passed, 4 failed`** across `180` collected tests (`27.39s`). All core intelligence, agronomic sensitivity, API, soil health, BRICS interoperability, synthetic engine, IoT token management (`13/13`), and firmware diagnostic unit (`5/5`) suites pass; the 4 failures are in upstream firmware-contract/lifecycle tests (`tests/test_firmware_backend_contract.py` and `tests/test_full_telemetry_lifecycle_e2e.py`) whose requests omit the required `X-Device-Token` header.
- **Frontend Production Build** (`cd frontend && npm run build`): `tsc && vite build` succeeded with `0` errors (`2,409` modules bundled in `283ms`).

See [TEST_RESULTS.md](TEST_RESULTS.md) and [SYSTEM_STATUS.md](SYSTEM_STATUS.md) for full details.

---

## 7. Scientific Integrity & Honesty Manifesto

1. **Unambiguous Source Labeling**: Manually entered soil readings, sample regional archetypes, Wokwi simulation telemetry, and authenticated ESP32 readings remain explicitly badged and separated.
2. **Synthetic Data Boundary**: Faker + ICAR generated records always carry `is_synthetic = true` and are kept separate from empirical benchmarks.
3. **Dynamic Model Reporting**: Accuracy and evaluation figures come dynamically from `predictor.get_model_info()` without hardcoded claims.
4. **Hardware Safety Gating**: Physical Unit 01 commissioning starts in `Stage A (Unpowered Cold Verification)` with analog sensor channels disabled on boot until verified below the `3.30V` rail limit.

---

## 8. License & Acknowledgments
Released under the **MIT License**. Agronomic bounds, soil orders, and crop classifications are benchmarked against publications from the **Indian Council of Agricultural Research (ICAR)**, **Directorate of Economics and Statistics (DES)**, and the **Soil Health Card (SHC)** scheme, Government of India.
