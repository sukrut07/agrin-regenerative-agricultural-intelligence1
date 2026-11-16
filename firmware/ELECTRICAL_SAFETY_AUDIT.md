# AgriSense IoT Node — Electrical Safety & Hardware Interface Audit

**Version**: `2.1.0`  
**Classification**: Electrical Engineering & Hardware Validation Report  
**Auditor**: Principal IoT Hardware Validation Specialist  
**Target Board**: ESP32 DevKit V1 (ESP-WROOM-32, 30-pin & 36-pin)  

---

## 1. Executive Summary

A deep electrical review of all GPIO assignments, peripheral buses, voltage rails, and signal conditioning interfaces was conducted. Critical silicon hazards were identified, corrected at the pin assignment level, and documented for bench test verification.

### Master Electrical Status Table

| Interface / Signal | Pin Assigned | Voltage Level | Electrical Finding / Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| **RS485 Direction (DE/RE)** | **GPIO 27** *(Reassigned from GPIO 5)* | 3.3V Logic | **CRITICAL DEFECT RESOLVED**: GPIO 5 is an ESP32 strapping pin with boot PWM/pull-up that forced MAX3485 into transmit mode during reset. Reassigned to GPIO 27. | **PASS** |
| **I2C Bus (SDA / SCL)** | GPIO 21 / GPIO 22 | 3.3V Logic | Shared bus; requires 4.7 kΩ pull-ups to 3.3V. Verified safe. | **PASS** |
| **OneWire Bus (DS18B20)** | GPIO 4 | 3.3V Logic | **MANDATORY**: 4.7 kΩ pull-up must tie to 3.3V rail, NEVER 5V. | **PASS** |
| **Battery ADC Input** | GPIO 34 | 0.0V–2.10V Max | Input-only pin (ADC1_CH6); dual 100 kΩ divider cuts 4.2V to 2.10V. | **PASS** |
| **Sensor Power Gate** | GPIO 18 | 3.3V Logic | Controls P-MOSFET high-side switch to depower sensors during sleep. | **PASS** |
| **ADS1115 ADC Supply** | VDD Pin | 3.3V Regulated | Absolute maximum analog input is $VDD + 0.3\text{V} = 3.6\text{V}$. | **PASS** |
| **Physical Bench Checks** | All Pins | Multimeter / Scope| Bench test verification on actual assembled PCB. | **NOT TESTED** |

---

## 2. In-Depth Defect Analysis: GPIO 5 Strapping Pin Hazard

### The Hazard on ESP32 Silicon
During ESP32 power-on and bootloader execution, **GPIO 5** functions as a hardware bootstrap/strapping pin (controlling SDIO slave timing). 
- At power-up, GPIO 5 has an **internal weak pull-up resistor** enabled by ROM bootloader and outputs a high-frequency clock/PWM burst.
- If GPIO 5 is connected directly to the `DE` (Driver Enable, active HIGH) and `\RE` (Receiver Enable, active LOW) pins of the MAX3485 transceiver:
  1. The transceiver is forced into **TRANSMIT MODE** during power-up before any firmware instructions run.
  2. The transceiver actively drives the differential RS485 bus lines (A and B), creating line contention and data corruption for any other devices on the bus.
  3. If an external pull-down resistor is added to force GPIO 5 LOW at boot, pulling GPIO 5 LOW alters the internal SDIO timing strap, which can prevent the ESP32 from booting from external SPI flash on certain silicon revisions.

### The Corrective Resolution
In `firmware/include/pins.h`:
```c
// REASSIGNED: GPIO 27 is a standard general-purpose output with no bootstrap function
#define PIN_RS485_DE_RE             (27)
```
- **Hardware Requirement**: An external **10 kΩ pull-down resistor** to GND must be placed on GPIO 27 / MAX3485 `DE+RE`. This ensures the transceiver powers up in high-impedance listening mode (`DE=0, RE=0`) until the firmware explicitly asserts `HIGH` to transmit.

---

## 3. Voltage Rail Boundaries & 3.3V Isolation

```
           +-----------------------------------------------+
           |                ESP32 DevKit V1                |
           +-----------------------------------------------+
             | (3.3V Regulated)         | (0.0 - 2.1V)
             v                          v
       +-----------+             +-------------+
       |  ADS1115  |             | Batt Divider| (100k / 100k)
       |  16-Bit   |             +-------------+
       +-----------+                    ^
        |    |    |                     |
       (A0) (A1) (A2)             +---------------+
        |    |    |               | 3.7V Li-ion   |
        |    |    +-- EC Probe    | (3.2V - 4.2V) |
        |    +------- pH Board    +---------------+
        +------------ Moist Probe
```

### 3.1 ADS1115 Supply & Maximum Analog Input
- **Supply Voltage**: Must be powered from the regulated 3.3V rail.
- **Input Limits**: The absolute maximum analog input voltage on analog pins A0–A3 is $VDD + 0.3\text{V} = 3.60\text{V}$.
- **Conditioning Boards Warning**: Many commercial hobby pH and EC conditioning boards are sold with 5.0V operational ratings. If supplied with 5.0V, their analog output swing can reach 4.2V, which will permanently destroy the ADS1115 input multiplexer!
- **Rule**: All sensor conditioning boards must be powered from the 3.3V rail. If a specific board strictly requires 5.0V, a precision unity-gain op-amp buffer or resistive divider MUST step down the output to $<3.3\text{V}$ before entering the ADS1115.

### 3.2 OneWire Pull-up Voltage Integrity
- The DS18B20 digital temperature sensor requires an external $4.7\text{ k}\Omega$ pull-up resistor on GPIO 4.
- **Hardware Rule**: Confirm via multimeter that this resistor is connected between GPIO 4 and the **3.3V rail**. Never connect to 5V (VIN / VBUS).

---

## 4. Battery Voltage Divider Network Audit

- **Resistor Values**: $R_1 = 100\text{ k}\Omega \pm 1\%$, $R_2 = 100\text{ k}\Omega \pm 1\%$.
- **Divider Ratio**: $K = \frac{100 + 100}{100} = 2.000$.
- **Voltage Calculations**:
  - Maximum Li-ion voltage (full charge): $4.20\text{ V} \rightarrow V_{\text{GPIO34}} = 2.10\text{ V}$.
  - Nominal Li-ion voltage: $3.70\text{ V} \rightarrow V_{\text{GPIO34}} = 1.85\text{ V}$.
  - Cutoff voltage (empty): $3.20\text{ V} \rightarrow V_{\text{GPIO34}} = 1.60\text{ V}$.
- **ADC Configuration**: GPIO 34 configured with `ADC_ATTEN_DB_11` (full-scale range up to 2.6V–3.1V), placing 2.10V comfortably in the calibrated region.
- **Anti-Aliasing Filter**: A **100 nF ceramic capacitor** in parallel with $R_2$ (GPIO 34 to GND) is mandatory to filter high-impedance SAR ADC switching noise.

---

## 5. Hardware Team Bench Verification Checklist

Prior to field deployment, the hardware assembly team must verify with a calibrated multimeter and oscilloscope:

- [ ] **Rail Voltage**: Measure 3V3 pin on ESP32 DevKit under load $\rightarrow$ must measure $3.30\text{ V} \pm 0.05\text{ V}$.
- [ ] **GPIO 27 State at Boot**: Probe GPIO 27 with oscilloscope during power-on $\rightarrow$ must remain strictly LOW ($<0.4\text{ V}$) throughout boot.
- [ ] **ADS1115 Supply**: Verify VDD of ADS1115 measures $3.3\text{ V}$, NOT $5.0\text{ V}$.
- [ ] **OneWire Pull-up**: Measure open-circuit voltage on GPIO 4 $\rightarrow$ must measure $3.3\text{ V} \pm 0.05\text{ V}$.
- [ ] **Battery Divider Test**: Apply 4.00V from DC bench supply to battery pads $\rightarrow$ measure voltage at GPIO 34 test point $\rightarrow$ must measure $2.00\text{ V} \pm 0.02\text{ V}$.
- [ ] **Solar Charge Controller Cutoff**: Verify CN3065 / TP4056 terminates charge at exactly $4.20\text{ V} \pm 0.03\text{ V}$.
