# 📚 AgriN Documentation Index

This directory contains technical architecture specifications, research papers, system audits, and compliance documentation for the **AgriN — Regenerative Agricultural Intelligence Network** (BRICS Track 4).

---

## 📑 Curated Document Index

### 1. System Architecture & Intelligence Design
- [AGRIN_TARGET_ARCHITECTURE.md](AGRIN_TARGET_ARCHITECTURE.md) — Target end-to-end multi-tier architecture.
- [AGRIN_INTELLIGENCE_ARCHITECTURE.md](AGRIN_INTELLIGENCE_ARCHITECTURE.md) — Decision support pipeline, explainability, and multi-crop scoring.
- [OBSERVATION_MODEL.md](OBSERVATION_MODEL.md) — Multi-tier observation hierarchy (Station, Satellite, IoT node, Soil Card).
- [MULTILINGUAL_ARCHITECTURE.md](MULTILINGUAL_ARCHITECTURE.md) — Architectural pattern for localized Indian language rendering.

### 2. Hardware, IoT & Calibration
- [AGRIN_HARDWARE_INTEGRATION_SPEC.md](AGRIN_HARDWARE_INTEGRATION_SPEC.md) — ESP32 hardware specifications, power budgets, and sensor buses.
- [AGRIN_SENSOR_CALIBRATION_GUIDE.md](AGRIN_SENSOR_CALIBRATION_GUIDE.md) — Laboratory buffer calibration procedures (pH, EC, ADC).
- [AGRIN_DEVICE_REGISTRATION_GUIDE.md](AGRIN_DEVICE_REGISTRATION_GUIDE.md) — Secure onboarding with `X-Device-Token`.
- [AGRIN_TELEMETRY_DATA_CONTRACT.md](AGRIN_TELEMETRY_DATA_CONTRACT.md) — JSON schema for telemetry ingestion.

### 3. Agronomic, Soil & Regenerative Science
- [SOIL_INTELLIGENCE.md](SOIL_INTELLIGENCE.md) — 12-parameter Soil Health Card diagnostic protocol.
- [REGENERATIVE_AGRICULTURE_ENGINE.md](REGENERATIVE_AGRICULTURE_ENGINE.md) — Soil Organic Carbon accumulation & biological Nitrogen models.
- [FARM_RESILIENCE_INDEX.md](FARM_RESILIENCE_INDEX.md) — Drought and climate buffering formulation.
- [ADVISORY_ENGINE.md](ADVISORY_ENGINE.md) — Decoupled agronomic advisory rules and amendment plans.
- [crop_calendar.md](crop_calendar.md) — Sowing and harvest calendar across Indian agro-climatic zones.

### 4. Satellite & Remote Sensing
- [SATELLITE_INTELLIGENCE_ARCHITECTURE.md](SATELLITE_INTELLIGENCE_ARCHITECTURE.md) — Sentinel-2 L2A ingestion, NDVI, NDMI, and EVI formulations.
- [DISEASE_INTELLIGENCE_ARCHITECTURE.md](DISEASE_INTELLIGENCE_ARCHITECTURE.md) — Plant disease vision screening triage guidelines.

### 5. BRICS Cooperation & Country-Neutral Interoperability
- [BRICS_INTEROPERABILITY_ARCHITECTURE.md](BRICS_INTEROPERABILITY_ARCHITECTURE.md) — Harmonization framework for BRICS Track 4.
- [INTEROPERABILITY_SPEC.md](INTEROPERABILITY_SPEC.md) — Adapter contract specifications for Brazil (EMBRAPA) and South Africa.

### 6. Verification, System Audits & Model Cards
- [SYSTEM_STATUS.md](../SYSTEM_STATUS.md) — Canonical feature status matrix (Verified, Synthetic, Planned).
- [model_card.md](model_card.md) — Random Forest classifier performance, hyper-parameters, and limitations.
- [dataset_card.md](dataset_card.md) — Provenance, feature distributions, and synthetic data boundaries.
- [AGRIN_COMPLETE_SYSTEM_AUDIT.md](AGRIN_COMPLETE_SYSTEM_AUDIT.md) — Initial technical audit findings.
