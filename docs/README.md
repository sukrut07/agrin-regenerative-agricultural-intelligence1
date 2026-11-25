# 📚 AgriN Master Documentation Index

> **Navigation:** [Root README](../README.md) · [System Status](../SYSTEM_STATUS.md) · [Test Results](../TEST_RESULTS.md) · [Implementation Report](../IMPLEMENTATION_REPORT.md) · [Data Dictionary](../DATA_DICTIONARY.md)

Master catalogue of architecture specs, scientific references, hardware/firmware guides, model cards, audits, and archived phase completion reports for **AgriN — Regenerative Agricultural Intelligence Network (BRICS Track 4)**.

---

## 📑 Table of Contents
- [1. Subsystem Entrypoints](#1-subsystem-entrypoints)
- [2. System Architecture & Intelligence Design](#2-system-architecture--intelligence-design)
- [3. Agronomic, Soil & Regenerative Science](#3-agronomic-soil--regenerative-science)
- [4. Machine Learning, Data & Validation](#4-machine-learning-data--validation)
- [5. IoT Telemetry, Firmware & Hardware Integration](#5-iot-telemetry-firmware--hardware-integration)
- [6. Remote Sensing & Plant Pathology](#6-remote-sensing--plant-pathology)
- [7. BRICS Interoperability & Governance](#7-brics-interoperability--governance)
- [8. Project Handover, Roadmaps & Audits](#8-project-handover-roadmaps--audits)
- [9. Phase Completion & Audit Archive (`docs/reports/`)](#9-phase-completion--audit-archive-docsreports)

---

## 1. Subsystem Entrypoints
- [Root Overview & Quick Start](../README.md)
- [Backend API & Services (`backend/`)](../backend/README.md)
- [Frontend UI & ReportCharts (`frontend/`)](../frontend/README.md)
- [AgriSense ESP32 Firmware (`firmware/`)](../firmware/README.md)
- [Wokwi Virtual Hardware Lab (`firmware/wokwi/`)](../firmware/wokwi/README.md)
- [Hardware Bench & Commissioning (`hardware/`)](../hardware/README.md)
- [Data Provenance & Synthetic Engine (`data/`)](../data/README.md)

---

## 2. System Architecture & Intelligence Design
- [AGRIN_TARGET_ARCHITECTURE.md](AGRIN_TARGET_ARCHITECTURE.md) — Target end-to-end multi-tier system architecture.
- [AGRIN_INTELLIGENCE_ARCHITECTURE.md](AGRIN_INTELLIGENCE_ARCHITECTURE.md) — Decision support orchestrator, explainability, and multi-crop ranking.
- [PHASE_2_5_ARCHITECTURE.md](PHASE_2_5_ARCHITECTURE.md) — Hardened Pan-India intelligence pipeline design.
- [PROJECT_COMPLETE_REPORT_AND_ARCHITECTURE.md](PROJECT_COMPLETE_REPORT_AND_ARCHITECTURE.md) — Full architectural synthesis across subsystems.
- [OBSERVATION_MODEL.md](OBSERVATION_MODEL.md) — Observation provenance tiers (IoT probe, SHC assay, station weather, satellite).
- [MULTILINGUAL_ARCHITECTURE.md](MULTILINGUAL_ARCHITECTURE.md) — Runtime trilingual i18n (`EN` / `HI` / `MR`) design pattern.

---

## 3. Agronomic, Soil & Regenerative Science
- [SOIL_INTELLIGENCE.md](SOIL_INTELLIGENCE.md) — 12-parameter Soil Health Card diagnostic rules and biological remedies.
- [REGENERATIVE_AGRICULTURE_ENGINE.md](REGENERATIVE_AGRICULTURE_ENGINE.md) — SOC rebuilding, legume nitrogen credits, and practice scoring.
- [REGENERATIVE_INTELLIGENCE_ARCHITECTURE.md](REGENERATIVE_INTELLIGENCE_ARCHITECTURE.md) — Ecological advisory & regenerative architecture.
- [FARM_RESILIENCE_INDEX.md](FARM_RESILIENCE_INDEX.md) — 5-pillar biophysical resilience index decoupled from data completeness.
- [ADVISORY_ENGINE.md](ADVISORY_ENGINE.md) — Prioritized agricultural risk & severity queue rules.
- [crop_calendar.md](crop_calendar.md) — Kharif / Rabi / Zaid crop calendars across agro-climatic zones.
- [crop_catalogue.md](crop_catalogue.md) — Structural design for the 65+ scientific crop variety catalogue.
- [agricultural_knowledge_sources.md](agricultural_knowledge_sources.md) & [agricultural_sources.md](agricultural_sources.md) — ICAR, DES, FAO, and SHC literature attributions.

---

## 4. Machine Learning, Data & Validation
- [DATA_DICTIONARY.md](../DATA_DICTIONARY.md) — Canonical 12-parameter soil, IoT telemetry, satellite & decision schema reference.
- [SYNTHETIC_DATA_DOCUMENTATION.md](../SYNTHETIC_DATA_DOCUMENTATION.md) — Faker + ICAR constrained synthetic farm generator & stress scenarios.
- [model_card.md](model_card.md) — Random Forest classifier metrics, inputs, feature expectations, and failure modes.
- [dataset_card.md](dataset_card.md) — Training dataset provenance, distribution bounds, and synthetic decoupling rules.
- [MODEL_VALIDATION_REPORT.md](MODEL_VALIDATION_REPORT.md) & [model_validation.md](model_validation.md) — Cross-validation & model evaluation analysis.
- [DATA_CONFIDENCE.md](DATA_CONFIDENCE.md) — 5-dimension confidence scoring (`completeness`, `freshness`, `geo`, `model`, `rules`).
- [DATA_PROVENANCE.md](DATA_PROVENANCE.md) & [DATA_QUALITY_REPORT.md](DATA_QUALITY_REPORT.md) — Sensor source tags & quality metrics.
- [data_catalog.md](data_catalog.md) — Inventory of raw, processed, knowledge, and synthetic data assets.
- [reproducibility.md](reproducibility.md) — Deterministic training, seeding, and evaluation reproduction instructions.
- [known_limitations.md](known_limitations.md) — Explicit disclosure of current empirical, hardware, and remote-sensing limits.

---

## 5. IoT Telemetry, Firmware & Hardware Integration
- [AGRIN_HARDWARE_INTEGRATION_SPEC.md](AGRIN_HARDWARE_INTEGRATION_SPEC.md) — ESP32 pinouts, electrical rails, power budget & sensor buses.
- [AGRIN_SENSOR_CALIBRATION_GUIDE.md](AGRIN_SENSOR_CALIBRATION_GUIDE.md) — Laboratory calibration procedures (moisture ADC, pH, EC).
- [AGRIN_DEVICE_REGISTRATION_GUIDE.md](AGRIN_DEVICE_REGISTRATION_GUIDE.md) — Secure device onboarding and `X-Device-Token` management.
- [AGRIN_TELEMETRY_DATA_CONTRACT.md](AGRIN_TELEMETRY_DATA_CONTRACT.md) — Canonical telemetry ingest & heartbeat payload contract.
- [feedback_system.md](feedback_system.md) — Real-world farmer outcome collection & closed-loop accountability.

---

## 6. Remote Sensing & Plant Pathology
- [SATELLITE_INTELLIGENCE_ARCHITECTURE.md](SATELLITE_INTELLIGENCE_ARCHITECTURE.md) — Sentinel-2 L2A abstraction, NDVI, NDMI, and EVI formulations.
- [SATELLITE_INTEGRATION_ARCHITECTURE.md](SATELLITE_INTEGRATION_ARCHITECTURE.md) — EO provider interface & unlinked-feed fallback policy.
- [CROP_HEALTH_ARCHITECTURE.md](CROP_HEALTH_ARCHITECTURE.md) — Canopy stress & vegetation health monitoring flow.
- [DISEASE_INTELLIGENCE_ARCHITECTURE.md](DISEASE_INTELLIGENCE_ARCHITECTURE.md) — Plant leaf disease vision triage & explicit caveat disclosure.

---

## 7. BRICS Interoperability & Governance
- [BRICS_INTEROPERABILITY_ARCHITECTURE.md](BRICS_INTEROPERABILITY_ARCHITECTURE.md) — Country-neutral harmonization architecture for BRICS Track 4.
- [INTEROPERABILITY_SPEC.md](INTEROPERABILITY_SPEC.md) — Normalization contracts and EMBRAPA (Brazil) / ARC (South Africa) adapters.

---

## 8. Project Handover, Roadmaps & Audits
- [SYSTEM_STATUS.md](../SYSTEM_STATUS.md) — Canonical subsystem maturity & live verification matrix.
- [TEST_RESULTS.md](../TEST_RESULTS.md) — Latest backend pytest & frontend build report.
- [PRODUCT_HANDOVER.md](PRODUCT_HANDOVER.md) — Operational deployment, testing, and maintenance handover notes.
- [AGRIN_API_INTEGRATION_GUIDE.md](AGRIN_API_INTEGRATION_GUIDE.md) — REST request/response integration examples.
- [AGRIN_PHASED_DEVELOPMENT_ROADMAP.md](AGRIN_PHASED_DEVELOPMENT_ROADMAP.md) — Multi-phase engineering delivery roadmap.
- [AGRIN_IMPLEMENTATION_GAP_MATRIX.md](AGRIN_IMPLEMENTATION_GAP_MATRIX.md) — Implementation gap analysis across specs vs code.
- [AGRIN_COMPLETE_SYSTEM_AUDIT.md](AGRIN_COMPLETE_SYSTEM_AUDIT.md) — Baseline end-to-end technical audit.
- [current_system_audit.md](current_system_audit.md) — Architecture & verification review snapshot.
- [FINAL_QA_REPORT.md](FINAL_QA_REPORT.md) & [final_validation_report.md](final_validation_report.md) — Historical QA sign-offs.
- [AGRIN_PHASE_01_COMPLETION_REPORT.md](AGRIN_PHASE_01_COMPLETION_REPORT.md) — Phase 01 completion summary (docs copy).
- [SHOWCASE_DEMO.md](SHOWCASE_DEMO.md), [SIH_7_SLIDE_PRESENTATION.md](SIH_7_SLIDE_PRESENTATION.md) & [screenshot_result_audit.md](screenshot_result_audit.md) — Demo walkthroughs and presentation outlines.

---

## 9. Phase Completion & Audit Archive (`docs/reports/`)
Historical milestone reports, phase quality gates, and regional migration audits moved from repository root for clarity:

| Category | Reports |
| :--- | :--- |
| **Phase 01–04 Completion & Audits** | [AGRIN_PHASE_01_COMPLETION_REPORT.md](reports/AGRIN_PHASE_01_COMPLETION_REPORT.md) · [PHASE_2_5_AUDIT.md](reports/PHASE_2_5_AUDIT.md) · [PHASE_2_5_COMPLETION_REPORT.md](reports/PHASE_2_5_COMPLETION_REPORT.md) · [PHASE3_INTELLIGENCE_AUDIT.md](reports/PHASE3_INTELLIGENCE_AUDIT.md) · [PHASE3_QUALITY_GATE.md](reports/PHASE3_QUALITY_GATE.md) · [PHASE4_REAL_INTELLIGENCE_AUDIT.md](reports/PHASE4_REAL_INTELLIGENCE_AUDIT.md) · [PHASE4_QUALITY_GATE.md](reports/PHASE4_QUALITY_GATE.md) · [PHASE4_COMPLETION_REPORT.md](reports/PHASE4_COMPLETION_REPORT.md) |
| **Pan-India Migration** | [INDIA_AGRICULTURAL_COVERAGE.md](reports/INDIA_AGRICULTURAL_COVERAGE.md) · [INDIA_MIGRATION_AUDIT.md](reports/INDIA_MIGRATION_AUDIT.md) · [INDIA_MIGRATION_COMPLETION_REPORT.md](reports/INDIA_MIGRATION_COMPLETION_REPORT.md) |
| **End-to-End Audits & Baselines** | [END_TO_END_INTEGRATION_AUDIT.md](reports/END_TO_END_INTEGRATION_AUDIT.md) · [FINAL_SYSTEM_AUDIT.md](reports/FINAL_SYSTEM_AUDIT.md) · [FINAL_PRODUCTION_READINESS_REPORT.md](reports/FINAL_PRODUCTION_READINESS_REPORT.md) · [PERFORMANCE_BASELINE.md](reports/PERFORMANCE_BASELINE.md) |
| **BRICS Track 4 Reports** | [TRACK_4_ALIGNMENT.md](reports/TRACK_4_ALIGNMENT.md) · [TRACK4_GAP_ANALYSIS.md](reports/TRACK4_GAP_ANALYSIS.md) · [TRACK4_FINAL_AUDIT.md](reports/TRACK4_FINAL_AUDIT.md) · [TRACK4_FINAL_IMPLEMENTATION_STATUS.md](reports/TRACK4_FINAL_IMPLEMENTATION_STATUS.md) · [TRACK4_FINAL_QUALITY_GATE.md](reports/TRACK4_FINAL_QUALITY_GATE.md) |
