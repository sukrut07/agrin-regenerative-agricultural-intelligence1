# AgriN — Phase 03.1 Completion Report
## Prototype Unit 01: Electrical Verification & Controlled Power-On Readiness

> **Document ID:** AGRIN-REP-PHASE-03-1  
> **Status:** Software & Commissioning Harness Complete (Physical Power-On Gated)  
> **Target:** AgriSense Prototype Unit 01  
> **Date:** 2026-11-17  

---

## 1. Executive Summary

Phase 03.1 ("Prototype Unit 01: Electrical Verification & Controlled Power-On") prepares the physical and software environment for safe hardware commissioning of the first AgriSense IoT prototype node.

In strict compliance with engineering safety principles:
- **Zero Data Fabrication:** No physical measurement is marked as passed without real laboratory instruments. All test entries in the measurement registers remain explicitly designated `NOT MEASURED` or `NOT TESTED`.
- **Pre-Power Electrical Gate:** Power-on is strictly gated behind unpowered cold-check resistance and continuity verification.
- **Fail-Safe Firmware Defaults:** Diagnostic firmware boots with **all analog sensor acquisitions disabled**. Sensors cannot be activated until the hardware engineer physically validates that conditioning module outputs do not exceed the $3.30\text{V}$ ceiling.
- **Automated Validation:** 100% of firmware builds (ESP32 and Native), native unit tests, Python diagnostic contract tests, backend regression tests (157 passing tests), and React frontend production builds compile and pass without defect.

---

## 2. Directory of Phase 03.1 Deliverables

| Deliverable Artifact | File Location | Purpose & Scope |
| :--- | :--- | :--- |
| **Measurement Register** | `hardware/commissioning/UNIT_01_MEASUREMENT_REGISTER.md` | Formal cold-check verification register (Items 1.1–1.8) with expected ranges and technical justifications. |
| **Controlled Power-On SOP** | `hardware/commissioning/UNIT_01_POWER_ON_PROCEDURE.md` | Staged bring-up procedure (Stages A–G) with calculated current limits (150 mA), rail checks, and shutdown triggers. |
| **Master Commissioning Log** | `hardware/commissioning/UNIT_01_COMMISSIONING_LOG.md` | Master unit dossier tracking serials, cold checks, power rails, serial logs, I2C discovery, and sign-offs. |
| **Hardware Configuration** | `hardware/commissioning/UNIT_01_HARDWARE_CONFIGURATION.md` | Complete GPIO pinout allocation, ADS1115 mapping, decoupling capacitors, and RS485 schematic wiring. |
| **Bench Test Results Log** | `hardware/commissioning/UNIT_01_TEST_RESULTS.md` | Physical test results register with discrete verification statuses across Phases 1–5. |
| **Diagnostic Firmware Header** | `firmware/include/diagnostics/hardware_bringup.h` | C++ diagnostic harness header with controlled sensor activation states and command interface. |
| **Diagnostic Firmware Source** | `firmware/src/diagnostics/hardware_bringup.cpp` | C++ diagnostic implementation supporting chip diagnostics, I2C scan, 1-Wire discovery, and serial CLI. |
| **Diagnostic Pytest Suite** | `tests/test_firmware_diagnostics_unit.py` | Pytest verification suite covering safe defaults, missing sensors, invalid ADC/temp filtering, and provenance. |

---

## 3. Defects Discovered & Engineering Corrections Made

### 3.1 Inconsistent Battery Voltage Divider Documentation
- **Defect:** In earlier draft notes, the battery voltage divider was inconsistently described with either $R_1 = 100\text{ k}\Omega, R_2 = 75\text{ k}\Omega$ (GPIO 35) or $R_1 = 100\text{ k}\Omega, R_2 = 100\text{ k}\Omega$ (GPIO 34).
- **Resolution:** Standardized on the BOM in [AGRISENSE_BENCH_ASSEMBLY_GUIDE.md](../AGRISENSE_BENCH_ASSEMBLY_GUIDE.md) and [pins.h](../../firmware/include/pins.h):
  - **Pin:** `GPIO 34` (`PIN_BATTERY_ADC`, ADC1_CH6, input-only).
  - **Resistors:** $R_1 = 100\text{ k}\Omega$ (1%), $R_2 = 100\text{ k}\Omega$ (1%).
  - **Divider Ratio:** $K = \frac{100\text{k} + 100\text{k}}{100\text{k}} = 2.000$.
  - **Voltage at Pin:** At maximum 4.20V Li-Ion charge, voltage presented to GPIO 34 is exactly $2.10\text{V}$, well within the linear range of ESP32 ADC1 with 11dB attenuation ($0\text{V} - 2.6\text{V}$).

### 3.2 I2C Bus Pull-Up Resistance in Parallel
- **Defect:** Adding external 4.7 kΩ pull-ups when commercial ADS1115 breakout boards already incorporate 10 kΩ pull-ups creates a parallel resistance of $\approx 3.2\text{ k}\Omega$. If multiple modules with pull-ups are added, effective resistance could drop below 1.5 kΩ, overloading the open-drain drivers.
- **Resolution:** Documented in [UNIT_01_MEASUREMENT_REGISTER.md](UNIT_01_MEASUREMENT_REGISTER.md) Section 4. Established an acceptable resistance band of $2.0\text{ k}\Omega \le R \le 4.8\text{ k}\Omega$.

### 3.3 Premature Analog Sensor Excitation on Boot
- **Defect:** Standard firmware initialized all sensor drivers and sampled ADC channels immediately on startup before the operator could verify that sensor board outputs stayed within safe limits.
- **Resolution:** Implemented `AgriSenseDiagnostics::HardwareBringup`. All analog sensor acquisitions default to `DISABLED` and `AWAITING_VOLTAGE_VERIFICATION`. Enabling requires explicit operator confirmation (`SENSOR_VERIFY` followed by `SENSOR_ENABLE <NAME> CONFIRM_VOLTAGE_VERIFIED`).

---

## 4. Automated Verification Results

All automated verification gates were executed and confirmed 100% operational:

```
========================================================================================
AGRISENSE AUTOMATED VERIFICATION MATRIX — PHASE 03.1
========================================================================================
Test Suite                             Scope                               Result
----------------------------------------------------------------------------------------
1. Native C++ Unit Tests (MinGW/Clang)   Bring-up diagnostics & calibration  100% PASS
2. PlatformIO 'esp32dev' Target Build   Embedded ESP32-WROOM-32 firmware    SUCCESS (Flash: 65.1%, RAM: 16.7%)
3. PlatformIO 'native' Target Build     Host unit testing harness           SUCCESS (1.42s)
4. Diagnostic Invariant Pytest Suite    Missing sensors, range, provenance  100% PASS (5/5 tests)
5. Backend Contract Pytest Suite        Firmware-to-FastAPI data contract   100% PASS (4/4 tests)
6. Master Backend Pytest Suite          Complete AgriN backend engine       157 PASSED, 0 FAILED
7. React Farmer Dashboard Build         Vite + TypeScript frontend build    100% SUCCESS
========================================================================================
```

---

## 5. Instructions for Physical Commissioning

### 5.1 Flashing Diagnostic Firmware to ESP32
Connect the ESP32 DevKit to your PC via USB cable (with CP2102 or CH340 driver installed):
```bash
# Build and flash diagnostic firmware to ESP32
python -m platformio run -d firmware -e esp32dev --target upload

# Open the serial diagnostic console at 115200 baud
python -m platformio device monitor -d firmware -b 115200
```

### 5.2 Interactive Serial Command Interface
Upon opening the serial monitor, press `EN` (Reset) on the ESP32. You will be greeted by the AgriSense Bring-Up Banner. You can issue the following commands in the serial monitor:
- `HELP`: Lists all available diagnostic commands.
- `INFO`: Reports ESP32 chip revision, CPU frequency, MAC address, reset reason, and free heap.
- `STATUS`: Displays safety state and fault status of every sensor channel.
- `I2C_SCAN`: Real-time scan of I2C bus on GPIO 21 (SDA) and GPIO 22 (SCL).
- `ADS_STATUS`: Checks ADS1115 ADC communication at address `0x48`.
- `TEMP_STATUS`: Queries DS18B20 on GPIO 4 and displays its 64-bit ROM ID.
- `RS485_STATUS`: Confirms MAX3485 DE/RE is held in Receiver mode.
- `BATTERY_STATUS`: Samples battery voltage on GPIO 34.
- `SENSOR_VERIFY <NAME>`: Marks a sensor electrically verified after DMM check.
- `SENSOR_ENABLE <NAME> CONFIRM_VOLTAGE_VERIFIED`: Unlocks sensor acquisition.

---

## 6. Current Commissioning Status & Next Physical Step

> [!CAUTION]
> **Phase 03.1 is a software and procedural readiness milestone. It is NOT permission to apply power to the physical board.**

The board is currently in **Stage A (Unpowered Cold Verification)**.

### Immediate Action Required from Hardware Team:
1. Keep the prototype board **completely disconnected from power**.
2. Set your multimeter to **Resistance ($\Omega$) / Continuity mode**.
3. Measure and record the actual values for **Items 1.1 through 1.8** in [UNIT_01_MEASUREMENT_REGISTER.md](UNIT_01_MEASUREMENT_REGISTER.md):
   - **1.1:** Star Ground Continuity ($< 0.5\ \Omega$)
   - **1.2:** 3.3V Rail to GND Resistance ($> 1\text{ k}\Omega$)
   - **1.3:** 5.0V Rail to GND Resistance ($> 5\text{ k}\Omega$)
   - **1.4:** 3.3V Rail to 5.0V Rail Resistance ($> 5\text{ k}\Omega$)
   - **1.5:** GPIO 27 to GND Resistance ($10\text{ k}\Omega \pm 2\%$)
   - **1.6:** GPIO 4 to 3.3V Resistance ($4.7\text{ k}\Omega \pm 2\%$)
   - **1.7:** GPIO 21 (SDA) & GPIO 22 (SCL) to 3.3V ($2.0\text{ k}\Omega - 4.8\text{ k}\Omega$)
   - **1.8:** Battery Divider R1 & R2 Resistance ($100\text{ k}\Omega \pm 2\%$)
4. Report the recorded values. Once reviewed and approved by the lead engineer (Stage B), we will authorize controlled power-on (Stage C) with a current limit of **150 mA**.
