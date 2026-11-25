# 🔧 AgriSense Hardware & Commissioning Hub

> **Navigation:** [Root README](../README.md) · [Firmware](../firmware/README.md) · [Docs Hub](../docs/README.md) · [System Status](../SYSTEM_STATUS.md) · [Test Results](../TEST_RESULTS.md)

**Target Node:** ESP32-DevKit-V1 (`ESP32-WROOM-32`) + ADS1115 + DS18B20 + MAX3485  
**Current Gate:** `Stage A — Unpowered Cold Verification` (Physical bench power-on remains gated until multimeter cold-check measurements pass)

---

## 📑 Table of Contents
- [1. Hardware Verification Hierarchy](#1-hardware-verification-hierarchy)
- [2. Verified ESP32-DevKit-V1 Pinout Reference](#2-verified-esp32-devkit-v1-pinout-reference)
- [3. Hardware Documentation Index](#3-hardware-documentation-index)
- [4. Prototype Unit 01 Commissioning Dossier](#4-prototype-unit-01-commissioning-dossier)
- [5. HIL Bench Test Harness](#5-hil-bench-test-harness)

---

## 1. Hardware Verification Hierarchy

All AgriSense hardware interfaces are tracked across six progressive verification levels in [AGRISENSE_HARDWARE_READINESS_MATRIX.md](AGRISENSE_HARDWARE_READINESS_MATRIX.md):

| Level | Gate | Current Status |
| :---: | :--- | :--- |
| **1** | **Code Verified** | ✅ Firmware compiles cleanly for `esp32dev` and `native` targets |
| **2** | **Software Simulated** | ✅ HIL ingestion harness, native unit tests & Wokwi simulation verified |
| **3** | **Electrical Design Reviewed** | ✅ 3.3V analog ceiling, GPIO 27 RS485 DE/RE pull-down & battery divider audited |
| **4** | **Bench Tested (Physical)** | ⏳ **Current Gate (`NOT TESTED` — Stage A Cold Checks Pending)** |
| **5** | **Calibrated Against Reference** | ⏳ `NOT TESTED` (NIST pH 4.01/7.00/10.01 & 1413 µS/cm KCl buffers) |
| **6** | **Field Validated** | ⏳ `NOT TESTED` (Planned multi-week field pilot) |

> **Honesty & Safety Rule:** Analog sensor acquisitions default to `DISABLED` in diagnostic firmware (`AgriSenseDiagnostics::HardwareBringup`) until physical voltage levels are measured within the `3.30V` ceiling. Zero physical test cells are pre-marked as passed.

---

## 2. Verified ESP32-DevKit-V1 Pinout Reference

Aligned strictly with [firmware/include/pins.h](../firmware/include/pins.h):

| Subsystem / Signal | Bus / Channel | ESP32 Pin / Addr | Electrical Safety Notes |
| :--- | :--- | :--- | :--- |
| **I2C SDA / SCL** | I2C | `GPIO 21` / `GPIO 22` | Shared bus; ADS1115 address `0x48`; combined pull-up band `2.0 kΩ – 4.8 kΩ` |
| **Soil Moisture (ADC)** | ADS1115 | `A0` (`Ch 0`) | 3.3V powered capacitive sensor (`1.1V – 3.0V`) |
| **Soil pH Conditioning** | ADS1115 | `A1` (`Ch 1`) | Centered ~2.5V; verify output stays `≤ 3.30V` before enabling |
| **Soil EC Conditioning** | ADS1115 | `A2` (`Ch 2`) | Temperature normalized to 25°C; verify `≤ 3.30V` ceiling |
| **DS18B20 Temperature** | 1-Wire Digital | `GPIO 4` | Requires `4.7 kΩ` external pull-up to `3.3V` |
| **RS485 NPK (MAX3485)** | UART2 | `RX 16` / `TX 17` / `DE_RE 27` | Non-strapping `GPIO 27` with mandatory `10 kΩ` pull-down to GND |
| **Battery Monitor** | ADC1_CH6 (or A3) | `GPIO 34` | `1:2` divider (`R1 = 100 kΩ`, `R2 = 100 kΩ`); `4.20V` scales to `2.10V` |
| **Sensor Power Gate** | P-MOSFET Gate | `GPIO 18` | `LOW` = Powered, `HIGH` = Disconnected during deep sleep |
| **Status / Net LEDs** | Digital Output | `GPIO 2` / `GPIO 15` | Transmission heartbeat & network connectivity indicators |

---

## 3. Hardware Documentation Index

| Document | Scope & Purpose |
| :--- | :--- |
| [AGRISENSE_BENCH_ASSEMBLY_GUIDE.md](AGRISENSE_BENCH_ASSEMBLY_GUIDE.md) | BOM, power distribution, decoupling layout & safe bench power-up sequence |
| [PRE_POWER_ELECTRICAL_CHECKLIST.md](PRE_POWER_ELECTRICAL_CHECKLIST.md) | Unpowered resistance/continuity checks & 3.3V/5.0V rail halt conditions |
| [SENSOR_BENCH_VALIDATION_PROTOCOL.md](SENSOR_BENCH_VALIDATION_PROTOCOL.md) | Step-by-step wet/dry, buffer, and temperature validation protocols |
| [AGRISENSE_SENSOR_CALIBRATION_RECORD.md](AGRISENSE_SENSOR_CALIBRATION_RECORD.md) | Physical calibration record sheet for reference buffers & raw ADC counts |
| [AGRISENSE_HARDWARE_READINESS_MATRIX.md](AGRISENSE_HARDWARE_READINESS_MATRIX.md) | 6-tier hardware & firmware readiness tracker |
| [AGRISENSE_INTEGRATION_CHECKLIST.md](AGRISENSE_INTEGRATION_CHECKLIST.md) | Mechanical, electrical, firmware & backend pre-deployment gate |
| [BENCH_TEST_RESULTS_TEMPLATE.md](BENCH_TEST_RESULTS_TEMPLATE.md) | Standardized lab test result template & engineering sign-offs |
| [PHASE_02_2_COMPLETION_REPORT.md](PHASE_02_2_COMPLETION_REPORT.md) | Phase 02.2 bench validation & electrical safety remediation report |

---

## 4. Prototype Unit 01 Commissioning Dossier

Located under [hardware/commissioning/](commissioning/PHASE_03_1_COMPLETION_REPORT.md):

| Document | Description |
| :--- | :--- |
| [PHASE_03_1_COMPLETION_REPORT.md](commissioning/PHASE_03_1_COMPLETION_REPORT.md) | Phase 03.1 electrical verification & controlled power-on readiness report |
| [UNIT_01_COMMISSIONING_LOG.md](commissioning/UNIT_01_COMMISSIONING_LOG.md) | Master tracking log for serial numbers, rails, I2C discovery & sign-offs |
| [UNIT_01_HARDWARE_CONFIGURATION.md](commissioning/UNIT_01_HARDWARE_CONFIGURATION.md) | Frozen GPIO, ADS1115 channel allocation & RS485 wiring configuration |
| [UNIT_01_MEASUREMENT_REGISTER.md](commissioning/UNIT_01_MEASUREMENT_REGISTER.md) | Formal multimeter cold-check register (Items 1.1–1.8) |
| [UNIT_01_POWER_ON_PROCEDURE.md](commissioning/UNIT_01_POWER_ON_PROCEDURE.md) | Staged bring-up SOP (`Stages A–G`, `150 mA` current limit) |
| [UNIT_01_TEST_RESULTS.md](commissioning/UNIT_01_TEST_RESULTS.md) | Discrete physical verification register across Phases 1–5 |

---

## 5. HIL Bench Test Harness

```bash
# Run HIL validation harness (software simulation mode)
python hardware/bench_test/hil_test_harness.py
```

- Script: `hardware/bench_test/hil_test_harness.py`
- Latest recorded report: `hardware/bench_test/hil_test_report.json`
- Diagnostic firmware bring-up tests: `.venv/bin/pytest tests/test_firmware_diagnostics_unit.py -v`
