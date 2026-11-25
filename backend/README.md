# ⚙️ AgriN Backend — FastAPI Core Intelligence Service

> **Navigation:** [Root README](../README.md) · [Frontend](../frontend/README.md) · [Hardware](../hardware/README.md) · [Docs Hub](../docs/README.md) · [Test Results](../TEST_RESULTS.md)

The AgriN backend ([app/main.py](app/main.py)) is a modular FastAPI REST microservice backed by SQLAlchemy (SQLite by default) and `scikit-learn`. It serves crop suitability prediction, agronomic rule validation, Soil Health Card diagnostics, IoT device management and authenticated ingestion, synthetic agricultural data generation, AgriMarket & AgriLedger economics APIs, and BRICS interoperability schemas.

---

## 📑 Table of Contents
- [1. Directory Architecture](#1-directory-architecture)
- [2. IoT Security & Ingestion Model](#2-iot-security--ingestion-model)
- [3. Mounted API Routers](#3-mounted-api-routers)
- [4. Running Locally](#4-running-locally)
- [5. Testing](#5-testing)

---

## 1. Directory Architecture

```text
backend/app/
├── main.py                         # FastAPI app factory, strict CORS, lifespan model load, 13 routers
├── api/
│   ├── routes_ai.py                # Explainability & NLG summary routes (`/api`)
│   ├── routes_analytics.py         # Dashboard analytics, model metrics & assessment logs
│   ├── routes_crops.py             # 65+ crop catalogue, categories & crop comparison
│   ├── routes_farmer.py            # Core `/api/validate`, `/api/analyze`, `/api/weather`, etc.
│   ├── routes_farmer_economics.py  # AgriLedger seasonal economics & cost-benefit APIs
│   ├── routes_feedback.py          # Farmer outcome & advisory feedback submission
│   ├── routes_intelligence.py      # Deep agro-ecological & provenance endpoints
│   ├── routes_iot.py               # Device registration, heartbeat & telemetry ingestion
│   ├── routes_marketplace.py       # AgriMarket biological/input directory routes
│   ├── routes_prediction.py        # Direct ML prediction & target feasibility routes
│   ├── routes_soil_intelligence.py # Soil Health Card 12-parameter evaluation routes
│   ├── routes_synthetic.py         # Faker + ICAR synthetic data sampling & stress scenarios
│   └── routes_whatif.py            # What-if soil & climate sensitivity simulator
├── database/
│   ├── db.py                       # SQLAlchemy engine initialization & session dependency
│   ├── ecosystem_models.py         # Ecosystem, soil intelligence, marketplace & ledger ORM models
│   └── iot_models.py               # Device, Field & Telemetry ORM tables (`Device.api_key`)
├── models/
│   ├── canonical_agri_model.py     # Country-neutral BRICS Track 4 schema models
│   ├── ecosystem_schemas.py        # Marketplace, economics & soil intelligence contracts
│   ├── farm_profile.py             # Farm location & context structures
│   ├── intelligence_schemas.py     # Unified Farm Intelligence Report & resilience contracts
│   ├── iot_schemas.py              # Hardware telemetry packet & heartbeat Pydantic v2 schemas
│   └── schemas.py                  # Core validation, analysis & feedback request/response models
└── services/
    ├── agrin_intelligence.py       # Unified intelligence orchestrator
    ├── advisory_service.py         # Prioritized risk & biological advisory generation
    ├── agri_interoperability.py    # Country-neutral BRICS harmonization service
    ├── agricultural_risk_engine.py # Severity-ranked agronomic & weather risk scoring
    ├── confidence_engine.py        # Multi-dimension data completeness, freshness & rule coverage
    ├── crop_comparison.py          # Multi-crop trade-off comparison engine
    ├── crop_prediction.py          # Random Forest classifier wrapper
    ├── disease_service.py          # Plant pathology triage helper
    ├── farm_health_service.py      # Aggregate farm health snapshot logic
    ├── farm_memory.py              # Assessment history & telemetry recall
    ├── farm_resilience.py          # Decoupled 5-pillar biophysical resilience index
    ├── feasibility.py              # Target crop feasibility logic
    ├── geo_service.py              # Indian state/district & 15 ICAR agro-climatic zone resolver
    ├── iot_service.py              # Token auth, farm ownership matching, replay & duplicate defense
    ├── irrigation_intelligence.py  # Water balance & moisture deficit intelligence
    ├── knowledge_graph.py          # Expanded crop agronomic rules & relationships
    ├── nlg_explainer.py            # Farmer-readable What / Why / Based-On narrative builder
    ├── observability.py            # Structured JSON telemetry logging
    ├── regenerative_advisor.py     # Soil organic carbon & practice action plans
    ├── regenerative_service.py     # Practice recommendations & impact confidence tagging
    ├── satellite_service.py        # Sentinel-2 index provider abstraction
    ├── soil_intelligence.py        # 12-parameter SHC rating curves & constraint diagnostics
    ├── suitability_scorer.py       # Hybrid ML (50%) + ICAR agronomic rule (50%) scorer
    ├── telemetry_to_intelligence.py# Maps validated IoT readings into suitability features
    ├── unit_normalizer.py          # Physical unit normalization
    ├── validation.py               # Agronomic parameter range & completeness checking
    ├── weather_service.py          # Open-Meteo real-time fetcher & fallback cache
    └── what_if.py                  # Parameter perturbation simulation engine
```

---

## 2. IoT Security & Ingestion Model

The IoT ingestion pipeline (`backend/app/services/iot_service.py`) enforces device identity and replay protection:

1. **Per-Device API Token**: `POST /api/devices/register` issues a secure random token (`agrin_dev_*`) persisted in `Device.api_key`.
2. **Header / Payload Verification**: `POST /api/telemetry/ingest` and heartbeat routes require a valid token via `X-Device-Token` or `Authorization: Bearer` (or payload `api_key`); unauthenticated requests receive `HTTP 401 Unauthorized`.
3. **Farm Ownership Check**: Telemetry `farm_id` must match the registered device's farm assignment (`HTTP 403 Forbidden` on mismatch).
4. **Replay & Quality Filtering**: Timestamps more than 900 seconds in the future return `HTTP 422`; identical `(device_id, timestamp)` packets are flagged as duplicates; impossible values are rejected cleanly.

---

## 3. Mounted API Routers

All routers are mounted under `/api` inside [backend/app/main.py](app/main.py):

| Router Module | Tag / Scope | Key Capabilities |
| :--- | :--- | :--- |
| `routes_farmer.py` | Farm & Validation | `/api/validate`, `/api/analyze`, `/api/weather` |
| `routes_prediction.py` | Crop Prediction | `/api/model-info`, direct ML prediction endpoints |
| `routes_whatif.py` | What-If Simulation | `/api/whatif` soil/climate perturbation |
| `routes_crops.py` | Crop Catalogue | 65+ scientific crops, categories, `/api/crops/compare` |
| `routes_iot.py` | IoT & Hardware | Device registration, latest & paginated history, ingest, heartbeat |
| `routes_soil_intelligence.py` | Soil Intelligence | 12-parameter SHC diagnostics & zone benchmarks |
| `routes_synthetic.py` | Synthetic Engine | Synthetic metadata, sampled profiles, anomaly scenarios |
| `routes_analytics.py` | Analytics | Model metadata & aggregated analytics |
| `routes_intelligence.py` | Intelligence & Provenance | Unified farm intelligence, satellite/disease status |
| `routes_marketplace.py` | AgriMarket | Input & regenerative partner directory |
| `routes_farmer_economics.py` | Farm Economics | AgriLedger crop budget & ROI calculations |
| `routes_feedback.py` | Feedback | Farmer recommendation outcome logging |
| `routes_ai.py` | AI Explanation | Explainability summaries |

---

## 4. Running Locally

```bash
# Activate Python 3.12 virtual environment
source .venv/bin/activate

# Start Uvicorn development server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **OpenAPI JSON:** `http://127.0.0.1:8000/openapi.json`

---

## 5. Testing

```bash
.venv/bin/pytest tests/ -q
```

See [TEST_RESULTS.md](../TEST_RESULTS.md) for the full observed per-file log (`176 passed, 4 failed` on merged `main`, including the 4 upstream firmware contract tests missing `X-Device-Token` auth headers).
