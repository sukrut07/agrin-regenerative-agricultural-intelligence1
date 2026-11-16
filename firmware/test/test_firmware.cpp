#include <iostream>
#include <cassert>
#include <cmath>
#include <string>
#include <vector>
#include <fstream>
#include <cstdio>

#include "../include/config.h"
#include "../include/calibration.h"
#include "../include/sensor_types.h"
#include "../include/telemetry.h"
#include "../src/sensors/npk_sensor.h"
#include "../src/storage/telemetry_buffer.h"
#include "../src/core/diagnostics.h"

void test_calibration_math() {
    std::cout << "[TEST] Running CalibrationMath Tests..." << std::endl;

    // 1. Moisture Calibration: raw_dry = 2850, raw_wet = 1350
    MoistureCalibration m_cal;
    m_cal.raw_dry = 2850.0f;
    m_cal.raw_wet = 1350.0f;

    // At raw_dry -> moisture should be 0.0%
    float m_zero = CalibrationMath::rawToSoilMoisture(2850.0f, m_cal);
    assert(std::fabs(m_zero - 0.0f) < 0.1f);

    // At raw_wet -> moisture should be 100.0%
    float m_full = CalibrationMath::rawToSoilMoisture(1350.0f, m_cal);
    assert(std::fabs(m_full - 100.0f) < 0.1f);

    // Midpoint (2100) -> moisture should be 50.0%
    float m_mid = CalibrationMath::rawToSoilMoisture(2100.0f, m_cal);
    assert(std::fabs(m_mid - 50.0f) < 0.1f);

    // Clamping test
    float m_under = CalibrationMath::rawToSoilMoisture(3200.0f, m_cal);
    assert(m_under == 0.0f);
    float m_over = CalibrationMath::rawToSoilMoisture(1000.0f, m_cal);
    assert(m_over == 100.0f);

    // 2. pH Calibration: v_ph4 = 2.95V, v_ph7 = 2.45V
    PhCalibration ph_cal;
    ph_cal.v_ph4 = 2.95f;
    ph_cal.v_ph7 = 2.45f;

    // At v_ph7 at 25°C -> pH should be 7.00
    float ph_7 = CalibrationMath::voltageToPh(2.45f, ph_cal, 25.0f);
    assert(std::fabs(ph_7 - 7.00f) < 0.05f);

    // At v_ph4 at 25°C -> pH should be ~4.01
    float ph_4 = CalibrationMath::voltageToPh(2.95f, ph_cal, 25.0f);
    assert(std::fabs(ph_4 - 4.01f) < 0.05f);

    // 3. EC Calibration: v_calib_1413 = 1.45V -> standard 1.413 dS/m
    EcCalibration ec_cal;
    ec_cal.v_calib_1413 = 1.45f;
    ec_cal.standard_ec_dsm = 1.413f;
    ec_cal.temp_coefficient = 0.02f;

    // At 1.45V at 25°C -> EC should be 1.413 dS/m
    float ec_standard = CalibrationMath::voltageToEc(1.45f, ec_cal, 25.0f);
    assert(std::fabs(ec_standard - 1.413f) < 0.01f);

    // 4. Zero-division safeguards
    PhCalibration ph_zero_div;
    ph_zero_div.v_ph4 = 2.50f;
    ph_zero_div.v_ph7 = 2.50f; // Identical uncalibrated values
    float safe_ph = CalibrationMath::voltageToPh(2.50f, ph_zero_div, 25.0f);
    assert(safe_ph == 7.0f);

    // Temperature disconnect safeguard (-127°C)
    float safe_ec = CalibrationMath::voltageToEc(1.45f, ec_cal, -127.0f);
    assert(safe_ec >= 0.0f && safe_ec <= 20.0f);

    std::cout << "  -> CalibrationMath tests PASSED!" << std::endl;
}

void test_battery_piecewise_curve() {
    std::cout << "[TEST] Running Battery Piecewise OCV Model Tests..." << std::endl;

    float v100 = 0.0f, pct100 = 0.0f;
    CalibrationMath::computeBattery(2.10f, 2.0f, v100, pct100); // 4.20V
    assert(v100 == 4.20f && pct100 == 100.0f);

    float v70 = 0.0f, pct70 = 0.0f;
    CalibrationMath::computeBattery(1.93f, 2.0f, v70, pct70); // 3.86V
    assert(std::fabs(pct70 - 70.0f) < 1.0f);

    float v50 = 0.0f, pct50 = 0.0f;
    CalibrationMath::computeBattery(1.88f, 2.0f, v50, pct50); // 3.76V
    assert(std::fabs(pct50 - 50.0f) < 1.0f);

    float v0 = 0.0f, pct0 = 0.0f;
    CalibrationMath::computeBattery(1.55f, 2.0f, v0, pct0); // 3.10V
    assert(pct0 == 0.0f);

    std::cout << "  -> Battery Piecewise OCV Model tests PASSED!" << std::endl;
}

void test_modbus_crc16() {
    std::cout << "[TEST] Running Modbus RTU CRC-16 Tests..." << std::endl;

    uint8_t test_frame[] = {0x01, 0x03, 0x00, 0x1E, 0x00, 0x01};
    uint16_t crc = NpkSensor::calculateCrc16(test_frame, sizeof(test_frame));

    assert(crc != 0x0000);
    assert(crc != 0xFFFF);

    std::cout << "  -> Modbus RTU CRC-16 (0x" << std::hex << crc << std::dec << ") test PASSED!" << std::endl;
}

void test_telemetry_buffer_lifecycle() {
    std::cout << "[TEST] Running TelemetryBuffer FIFO Queue & Overflow Tests..." << std::endl;

    std::string test_file = "test_queue_temp.dat";
    std::remove(test_file.c_str());

    TelemetryBuffer buffer(3, test_file);
    buffer.init();
    assert(buffer.isEmpty());
    assert(buffer.count() == 0);

    TelemetryPacket p1, p2, p3, p4;
    p1.sequence_number = 1;
    p2.sequence_number = 2;
    p3.sequence_number = 3;
    p4.sequence_number = 4;

    buffer.push(p1);
    buffer.push(p2);
    buffer.push(p3);
    assert(buffer.isFull());
    assert(buffer.count() == 3);

    // Overflow test
    buffer.push(p4);
    assert(buffer.count() == 3);

    TelemetryPacket out;
    bool pop_res = buffer.pop(out);
    assert(pop_res == true);
    assert(out.sequence_number == 2); // p1 dropped, p2 is front

    buffer.pop(out);
    assert(out.sequence_number == 3);

    buffer.pop(out);
    assert(out.sequence_number == 4);

    assert(buffer.isEmpty());
    std::remove(test_file.c_str());
    std::cout << "  -> TelemetryBuffer lifecycle tests PASSED!" << std::endl;
}

void test_offline_queue_power_loss_recovery() {
    std::cout << "[TEST] Running Offline Queue Power-Loss Recovery Tests..." << std::endl;

    std::string test_file = "test_power_loss_queue.dat";
    std::remove(test_file.c_str());

    // 1. Simulate Session 1: Enqueue packets and unexpectedly power down
    {
        TelemetryBuffer session1(10, test_file);
        session1.init();

        TelemetryPacket p1;
        p1.sequence_number = 101;
        p1.device_id = "node-alpha";
        p1.farm_id = "farm-1";
        p1.field_id = "field-1";
        p1.timestamp_iso = "2026-11-17T01:00:00Z";
        p1.firmware_version = "2.0.0";
        p1.is_synthetic = false;
        p1.diagnostics.battery_voltage = 3.95f;

        SensorMeasurement m;
        m.sensor_type = SensorType::SOIL_MOISTURE;
        m.parameter_name = "soil_moisture";
        m.calibrated_value = 35.5f;
        m.raw_value = 2100.0f;
        m.unit = "%";
        m.quality = MeasurementQuality::GOOD;
        m.data_source = DataSource::SENSOR_MEASURED;
        m.sensor_id = "m-01";
        m.calibration_version = "v1";
        m.is_valid = true;
        p1.measurements.push_back(m);

        TelemetryPacket p2 = p1;
        p2.sequence_number = 102;

        session1.push(p1);
        session1.push(p2);
        assert(session1.count() == 2);
        // Session 1 terminates abruptly (power loss simulation)
    }

    // 2. Simulate Session 2: Device reboots, mounts storage, and initializes buffer
    {
        TelemetryBuffer session2(10, test_file);
        session2.init(); // Must reload unacknowledged packets from persistent storage!

        assert(session2.count() == 2);

        TelemetryPacket recovered;
        assert(session2.peek(recovered) == true);
        assert(recovered.sequence_number == 101);
        assert(recovered.measurements.size() == 1);
        assert(recovered.measurements[0].parameter_name == "soil_moisture");

        // Server acknowledges packet 101
        session2.removeFront();
        assert(session2.count() == 1);

        assert(session2.peek(recovered) == true);
        assert(recovered.sequence_number == 102);

        // Server acknowledges packet 102
        session2.removeFront();
        assert(session2.isEmpty());
    }

    // 3. Verify clean state after total drain
    {
        TelemetryBuffer session3(10, test_file);
        session3.init();
        assert(session3.isEmpty());
    }

    std::remove(test_file.c_str());
    std::cout << "  -> Offline Queue Power-Loss Recovery tests PASSED!" << std::endl;
}

void test_corrupted_packet_handling() {
    std::cout << "[TEST] Running Corrupted Flash Packet Fault Tolerance Tests..." << std::endl;

    std::string test_file = "test_corrupt_queue.dat";
    std::remove(test_file.c_str());

    // Inject 1 valid packet, 1 corrupted/truncated line, 1 valid packet
    std::ofstream ofs(test_file);
    ofs << "AGRIPKT|201|node-1|farm-1|field-1|2026-11-17T01:00:00Z|2.0.0|0|3.9|80|-65|0|ENDPKT\n";
    ofs << "AGRIPKT|202|TRUNCATED_CORRUPT_WRITE_DUE_TO_BROWNOUT\n"; // Incomplete write
    ofs << "RANDOM_GARBAGE_DATA_FROM_FLASH_WEAR\n"; // Bad line
    ofs << "AGRIPKT|203|node-1|farm-1|field-1|2026-11-17T01:00:05Z|2.0.0|0|3.9|80|-65|0|ENDPKT\n";
    ofs.close();

    TelemetryBuffer buffer(10, test_file);
    buffer.init();

    // Must successfully recover the 2 valid packets and gracefully discard the corrupted lines
    assert(buffer.count() == 2);

    TelemetryPacket p;
    buffer.pop(p);
    assert(p.sequence_number == 201);
    buffer.pop(p);
    assert(p.sequence_number == 203);

    std::remove(test_file.c_str());
    std::cout << "  -> Corrupted Flash Packet Fault Tolerance tests PASSED!" << std::endl;
}

void test_telemetry_json_serialization() {
    std::cout << "[TEST] Running Telemetry JSON Serialization Tests..." << std::endl;

    TelemetryPacket packet;
    packet.device_id = "test-device-uuid-001";
    packet.farm_id = "farm-parbhani-01";
    packet.field_id = "field-cotton-01";
    packet.timestamp_iso = "2026-11-17T00:00:00Z";
    packet.sequence_number = 101;
    packet.firmware_version = "2.0.0";
    packet.is_synthetic = false;

    SensorMeasurement m1;
    m1.sensor_type = SensorType::SOIL_MOISTURE;
    m1.parameter_name = "soil_moisture";
    m1.raw_value = 1850.0f;
    m1.calibrated_value = 42.5f;
    m1.unit = "%";
    m1.quality = MeasurementQuality::GOOD;
    m1.data_source = DataSource::SENSOR_MEASURED;
    m1.sensor_id = "moist-01";
    m1.calibration_version = "1.0.0";
    m1.is_valid = true;
    packet.measurements.push_back(m1);

    packet.diagnostics.battery_voltage = 3.92f;
    packet.diagnostics.battery_percent = 84.0f;
    packet.diagnostics.signal_rssi = -65;
    packet.diagnostics.signal_quality = 88.0f;
    packet.diagnostics.uptime_seconds = 3600;
    packet.diagnostics.free_memory_bytes = 182000;

    std::string json = packet.toJson();

    assert(json.find("\"device_id\": \"test-device-uuid-001\"") != std::string::npos);
    assert(json.find("\"farm_id\": \"farm-parbhani-01\"") != std::string::npos);
    assert(json.find("\"sequence_number\": 101") != std::string::npos);
    assert(json.find("\"sensor_type\": \"SOIL_MOISTURE\"") != std::string::npos);
    assert(json.find("\"parameter_name\": \"soil_moisture\"") != std::string::npos);
    assert(json.find("\"data_source\": \"SENSOR_MEASURED\"") != std::string::npos);
    assert(json.find("\"battery_voltage\": 3.92") != std::string::npos);

    std::cout << "  -> Telemetry JSON Serialization tests PASSED!" << std::endl;
}

int main() {
    std::cout << "==================================================================" << std::endl;
    std::cout << "AgriSense Firmware C++ Unit Tests (Host Native Verification)" << std::endl;
    std::cout << "==================================================================" << std::endl;

    test_calibration_math();
    test_battery_piecewise_curve();
    test_modbus_crc16();
    test_telemetry_buffer_lifecycle();
    test_offline_queue_power_loss_recovery();
    test_corrupted_packet_handling();
    test_telemetry_json_serialization();

    std::cout << "==================================================================" << std::endl;
    std::cout << "ALL FIRMWARE UNIT TESTS PASSED!" << std::endl;
    std::cout << "==================================================================" << std::endl;
    return 0;
}
