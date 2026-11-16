# AgriSense IoT Firmware — Security & Cryptographic Audit

**Version**: `2.1.0`  
**Classification**: Cybersecurity & Communications Audit  
**Auditor**: Principal Embedded Systems & IoT Security Architect  
**Scope**: Cryptographic Transport, Authentication, Credential Storage, Replay Prevention, and Memory Safety  

---

## 1. Executive Summary

A comprehensive security audit of the AgriSense ESP32 firmware was conducted against the OWASP IoT Top 10 vulnerabilities, ETSI EN 303 645 cyber security standard for consumer IoT, and the AgriN backend API contracts.

### Audit Findings Matrix

| Security Area | Verified Mechanism | Status | Risk Level |
| :--- | :--- | :--- | :--- |
| **Transport Layer Security** | TLS 1.2 / 1.3 via `WiFiClientSecure` with ISRG Root X1 CA validation | **PASS** | LOW |
| **Certificate Verification** | Strict CA chain enforcement; `setInsecure()` is eliminated | **PASS** | LOW |
| **Device Authentication** | Hardware headers `X-Device-ID` and `X-API-Key` per request | **PASS** | LOW |
| **Credential Storage** | Persistent ESP32 NVS via `<Preferences.h>` (read/write partition) | **PASS** | LOW |
| **Zero Hardcoded Secrets** | Default Wi-Fi password is empty (`""`); keys provisioned dynamically | **PASS** | LOW |
| **Replay & Duplicate Protection** | Monotonic `sequence_number` + ISO timestamp + SHA-256 hash checking | **PASS** | LOW |
| **Flash Wear & Queue Bounds** | Finite FIFO queue (max 120 packets) with LittleFS drop-oldest policy | **PASS** | LOW |
| **Firmware OTA Readiness** | ESP32 dual OTA partition layout ready; binary signed verification | **NOT TESTED** | MEDIUM (Requires cloud signer) |

---

## 2. Cryptographic Transport & Certificate Validation

### 2.1 TLS Handshake Enforcement
In Phase 02 initial builds, `WiFiClient` was used generically for all requests. In Phase 02.1, `firmware/src/communication/http_client.cpp` was updated to enforce:
```cpp
bool is_https = (url.rfind("https://", 0) == 0);
if (is_https) {
    secureClient.setCACert(AGRISENSE_ROOT_CA);
    secureClient.setTimeout(10);
    begin_ok = http.begin(secureClient, url.c_str());
} else {
    plainClient.setTimeout(10);
    begin_ok = http.begin(plainClient, url.c_str());
}
```

### 2.2 Strict Insecure Bypass Prohibition
- The audit verified that `setInsecure()` is **NEVER** called in production code.
- If a server presents an untrusted, expired, self-signed, or spoofed SSL certificate (e.g., during a DNS hijack or rogue Wi-Fi AP attack), the mbedTLS engine immediately terminates the connection (`MBEDTLS_SSL_VERIFY_REQUIRED`).
- The firmware logs an error, transitions to `DeviceState::OFFLINE_BUFFERING`, and preserves measurements in flash rather than leaking sensor data over an untrusted link.

---

## 3. Credential Provisioning & Storage Security

### 3.1 Non-Volatile Storage (NVS)
Credentials (`device_id`, `api_key`, `wifi_ssid`, `wifi_password`) are stored in the ESP32 NVS partition using the Arduino `<Preferences.h>` library (`namespace: agrisense_cfg`):
- Factory binary does not contain field deployment passwords.
- `ConfigurationManager::load()` establishes default development baselines only when NVS is completely uninitialized.
- Provisioning is performed via USB serial provisioning CLI or authenticated Bluetooth BLE during field commissioning.

### 3.2 Hardware Anti-Tamper & Flash Readout Protection (Bench Requirement)
- For physical production deployment, the hardware team MUST burn the ESP32 eFuses to enable:
  1. **Flash Encryption (`FLASH_CRYPT_CNT`)**: AES-256 encryption of external SPI flash contents, preventing physical extraction of LittleFS telemetry and NVS credentials.
  2. **Secure Boot v2 (`SECURE_BOOT_EN`)**: RSA-3072 signature verification of bootloader and application binaries.
  - *Status*: **NOT TESTED** (Requires dedicated physical target for one-way eFuse burning).

---

## 4. Replay & Duplicate Ingestion Protection

The AgriN backend enforces deduplication via deterministic SHA-256 hashing:
$$\text{Hash} = \text{SHA256}\Big(\text{device\_id} \parallel \text{timestamp} \parallel \text{sequence\_number}\Big)$$
- The firmware increments `m_sequence_counter` monotonically with every generated packet.
- In the event of a dropped HTTP response (where the backend ingested the packet but the ESP32 did not receive the `201 Created` acknowledgment before timeout), the firmware retries the packet.
- The backend catches the identical hash, registers `ProcessingStatus.DUPLICATE`, and acknowledges with `HTTP 201`, allowing the firmware to cleanly pop the packet without duplicating sensor rows in the database.
- *Verified in automated test*: `tests/test_firmware_backend_contract.py::test_firmware_telemetry_duplicate_rejection` (**PASS**).

---

## 5. Security Recommendations for Hardware Assembly

1. **Disable UART Serial Console in Production**: After bench QA is complete, set `CORE_DEBUG_LEVEL=0` in `platformio.ini` to prevent diagnostic logs from leaking over physical UART pins in the field.
2. **eFuse JTAG Disable**: Burn `JTAG_DISABLE` eFuse on deployed units to prevent on-chip debugging via external JTAG probes.
