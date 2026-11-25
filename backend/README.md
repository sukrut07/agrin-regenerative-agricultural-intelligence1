# ⚙️ AgriN Backend — FastAPI Core Intelligence Service

The AgriN backend is a modular, high-performance REST microservice built on **FastAPI**, **SQLAlchemy**, and **scikit-learn**. It handles agricultural feasibility modeling, real-time IoT telemetry ingestion, Soil Health Card diagnostics, synthetic agronomic data generation, and BRICS country-neutral data interoperability.

---

## 🏗 Directory Architecture

```
backend/
├── app/
│   ├── main.py                     # FastAPI application factory, CORS, and router registration
│   ├── api/                        # Route controllers
│   │   ├── routes_farmer.py        # Core assessment, what-if, weather, and feasibility
│   │   ├── routes_iot.py           # Device registration, telemetry ingestion, device status
│   │   ├── routes_crops.py         # Expanded 65+ crop catalogue and categories
│   │   ├── routes_synthetic.py     # Faker + ICAR synthetic data sampling and scenario APIs
│   │   ├── routes_regenerative.py  # Regenerative advisory and resilience scoring
│   │   ├── routes_soil.py          # Soil Health Card 12-parameter diagnostic endpoints
│   │   └── routes_brics.py         # Country-neutral adapter mappings (Brazil, SA, etc.)
│   ├── core/                       # Core configuration, logging, and security constants
│   ├── database/                   # SQLite/PostgreSQL persistence
│   │   ├── db.py                   # Engine initialization and session dependency
│   │   ├── models.py               # Farm, Crop, SoilTest, and Feedback ORM models
│   │   └── iot_models.py           # Device, Field, and Telemetry ORM entities with api_key
│   ├── models/                     # Pydantic v2 schemas for request validation & response contracts
│   │   ├── farmer_schemas.py       # Assessment request/response models
│   │   └── iot_schemas.py          # Device registration and authenticated telemetry schemas
│   └── services/                   # Domain logic and intelligence orchestrator
│       ├── intelligence_orchestrator.py # Multi-source decision support aggregation
│       ├── iot_service.py          # Token authentication, farm matching, telemetry persistence
│       ├── soil_health_service.py  # 12-parameter SHC benchmark evaluator
│       ├── weather_service.py      # Open-Meteo live telemetry fetcher and cache
│       ├── advisory_service.py     # Tailored regenerative and fertilizer amendments
│       └── brics_adapter.py        # Canonical harmonization layer
```

---

## 🔑 IoT Security & Authentication Model

In response to the technical security audit, the IoT ingestion pipeline enforces strict device identity and replay protection:

1. **Unique Device API Key Generation**:
   - When a device is registered via `POST /api/devices/register`, the backend generates a cryptographically secure random token formatted as:
     `agrin_dev_<32_random_hex_characters>`
   - This key is stored in the `Device.api_key` column and returned in the registration response.

2. **Telemetry Ingestion Authentication**:
   - `POST /api/telemetry/ingest` requires the device token passed via either:
     - Header: `X-Device-Token: <token>`
     - Header: `Authorization: Bearer <token>`
     - Payload: `"api_key": "<token>"`
   - If missing or invalid, the request is rejected with `HTTP 401 Unauthorized`.

3. **Farm Ownership Verification**:
   - The payload `farm_id` must match the `farm_id` assigned to the device during registration. Cross-farm spoofing is rejected with `HTTP 403 Forbidden`.

4. **Temporal Replay Attack Mitigation**:
   - Telemetry timestamps are validated against server UTC time.
   - Any packet with a timestamp more than 900 seconds (15 minutes) in the future is rejected with `HTTP 422 Unprocessable Entity`.
   - Repeated identical timestamps for the same sensor node are rejected as duplicates.

---

## 📡 REST API Reference

### 1. Farm Assessment & Weather
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/weather` | Open-Meteo live weather telemetry for latitude/longitude or district |
| `POST` | `/api/validate` | Validates farm input bounds (pH, NPK, rainfall) |
| `POST` | `/api/analyze` | Full ML crop suitability assessment + agronomic rule filter |
| `POST` | `/api/whatif` | Dynamic soil/climate sensitivity simulation |
| `POST` | `/api/feasibility` | Evaluates target crop suitability against farm soil & climate |
| `GET` | `/api/model-info` | Exposes dynamic ML model evaluation metrics (accuracy, precision, recall) |

### 2. IoT Device & Telemetry Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/devices/register` | Registers a sensor node and issues an `api_key` |
| `GET` | `/api/devices/{device_id}` | Returns device connection status, firmware version, and battery |
| `POST` | `/api/telemetry/ingest` | Ingests authenticated sensor readings with `X-Device-Token` |
| `GET` | `/api/telemetry/{device_id}/latest` | Returns latest calibrated measurements and data source tags |
| `GET` | `/api/telemetry/{device_id}/history` | Paginated 24-hour historical telemetry records |

### 3. Expanded Crop Knowledge Base
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/crops/catalogue` | Returns 65+ scientific crops with filters (category, season, state) |
| `GET` | `/api/crops/categories` | Returns 9 crop categories with metadata and crop counts |
| `GET` | `/api/crops/{crop_id}` | Detailed agronomic profile, popular varieties, and ICAR bounds |

### 4. Synthetic Data & Profiling Engine
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/synthetic/metadata` | Engine version, seed, Faker locale, and supported soil orders |
| `GET` | `/api/synthetic/sample` | Generates a sample of synthetic farm records flagged `is_synthetic=True` |
| `GET` | `/api/synthetic/scenarios` | Preconfigured agricultural stress scenarios (drought, salinity, etc.) |

---

## 🛠 Running the Backend Locally

```bash
# Activate Python 3.12 virtual environment
source .venv/bin/activate

# Start Uvicorn development server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive documentation is automatically generated:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- OpenAPI JSON: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🧪 Testing

Run backend tests using pytest:
```bash
pytest tests/ -v
```
All 156 tests covering agricultural validation, IoT security, synthetic engine, and E2E intelligence execute with 100% pass rate.
