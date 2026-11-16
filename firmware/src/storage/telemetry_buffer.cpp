#include "telemetry_buffer.h"
#include <sstream>
#include <iostream>

#ifdef ARDUINO
#include <Arduino.h>
#include <LittleFS.h>
#else
#include <fstream>
#include <cstdio>
#endif

TelemetryBuffer::TelemetryBuffer(size_t max_capacity, const std::string& storage_path)
    : m_max_capacity(max_capacity),
      m_storage_path(storage_path) {}

bool TelemetryBuffer::init() {
    m_queue.clear();
#ifdef ARDUINO
    if (!LittleFS.begin(true)) {
        return false;
    }
#endif
    loadFromPersistentStorage();
    return true;
}

bool TelemetryBuffer::push(const TelemetryPacket& packet) {
    if (m_queue.size() >= m_max_capacity) {
        // Drop oldest unacknowledged packet to honor flash wear and buffer limits
        m_queue.pop_front();
    }
    m_queue.push_back(packet);
    syncToPersistentStorage();
    return true;
}

bool TelemetryBuffer::pop(TelemetryPacket& out_packet) {
    if (m_queue.empty()) {
        return false;
    }
    out_packet = m_queue.front();
    m_queue.pop_front();
    syncToPersistentStorage();
    return true;
}

bool TelemetryBuffer::peek(TelemetryPacket& out_packet) const {
    if (m_queue.empty()) {
        return false;
    }
    out_packet = m_queue.front();
    return true;
}

void TelemetryBuffer::removeFront() {
    if (!m_queue.empty()) {
        m_queue.pop_front();
        syncToPersistentStorage();
    }
}

size_t TelemetryBuffer::count() const {
    return m_queue.size();
}

bool TelemetryBuffer::isFull() const {
    return m_queue.size() >= m_max_capacity;
}

bool TelemetryBuffer::isEmpty() const {
    return m_queue.empty();
}

void TelemetryBuffer::clear() {
    m_queue.clear();
    syncToPersistentStorage();
}

void TelemetryBuffer::persist() {
    syncToPersistentStorage();
}

bool TelemetryBuffer::reloadFromStorage() {
    m_queue.clear();
    loadFromPersistentStorage();
    return true;
}

// ----------------------------------------------------------------------------
// Internal Persistence & Recovery Engine
// ----------------------------------------------------------------------------

static std::string serializePacketCompact(const TelemetryPacket& p) {
    std::ostringstream ss;
    ss << "AGRIPKT|"
       << p.sequence_number << "|"
       << p.device_id << "|"
       << p.farm_id << "|"
       << p.field_id << "|"
       << p.timestamp_iso << "|"
       << p.firmware_version << "|"
       << (p.is_synthetic ? 1 : 0) << "|"
       << p.diagnostics.battery_voltage << "|"
       << p.diagnostics.battery_percent << "|"
       << p.diagnostics.signal_rssi << "|"
       << p.measurements.size();

    for (const auto& m : p.measurements) {
        ss << "|"
           << static_cast<int>(m.sensor_type) << "~"
           << m.parameter_name << "~"
           << m.raw_value << "~"
           << m.calibrated_value << "~"
           << m.unit << "~"
           << static_cast<int>(m.quality) << "~"
           << static_cast<int>(m.data_source) << "~"
           << m.sensor_id << "~"
           << m.calibration_version << "~"
           << (m.is_valid ? 1 : 0);
    }
    ss << "|ENDPKT\n";
    return ss.str();
}

static bool deserializePacketCompact(const std::string& line, TelemetryPacket& out_p) {
    if (line.size() < 16 || line.rfind("AGRIPKT|", 0) != 0) {
        return false;
    }
    if (line.find("|ENDPKT") == std::string::npos) {
        return false; // Corrupted / truncated write during power interruption
    }

    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(line);
    while (std::getline(tokenStream, token, '|')) {
        tokens.push_back(token);
    }

    if (tokens.size() < 12) {
        return false;
    }

    try {
        out_p.sequence_number = static_cast<uint32_t>(std::stoul(tokens[1]));
        out_p.device_id = tokens[2];
        out_p.farm_id = tokens[3];
        out_p.field_id = tokens[4];
        out_p.timestamp_iso = tokens[5];
        out_p.firmware_version = tokens[6];
        out_p.is_synthetic = (tokens[7] == "1");
        out_p.diagnostics.battery_voltage = std::stof(tokens[8]);
        out_p.diagnostics.battery_percent = std::stof(tokens[9]);
        out_p.diagnostics.signal_rssi = std::stoi(tokens[10]);

        size_t m_count = static_cast<size_t>(std::stoul(tokens[11]));
        out_p.measurements.clear();

        for (size_t i = 0; i < m_count && (12 + i) < tokens.size(); ++i) {
            const std::string& m_str = tokens[12 + i];
            if (m_str == "ENDPKT") break;

            std::vector<std::string> m_parts;
            std::string part;
            std::istringstream mStream(m_str);
            while (std::getline(mStream, part, '~')) {
                m_parts.push_back(part);
            }
            if (m_parts.size() >= 10) {
                SensorMeasurement m;
                m.sensor_type = static_cast<SensorType>(std::stoi(m_parts[0]));
                m.parameter_name = m_parts[1];
                m.raw_value = std::stof(m_parts[2]);
                m.calibrated_value = std::stof(m_parts[3]);
                m.unit = m_parts[4];
                m.quality = static_cast<MeasurementQuality>(std::stoi(m_parts[5]));
                m.data_source = static_cast<DataSource>(std::stoi(m_parts[6]));
                m.sensor_id = m_parts[7];
                m.calibration_version = m_parts[8];
                m.is_valid = (m_parts[9] == "1");
                out_p.measurements.push_back(m);
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}

void TelemetryBuffer::syncToPersistentStorage() {
#ifdef ARDUINO
    File f = LittleFS.open(m_storage_path.c_str(), "w");
    if (!f) return;
    for (const auto& p : m_queue) {
        std::string s = serializePacketCompact(p);
        f.print(s.c_str());
    }
    f.close();
#else
    std::ofstream ofs(m_storage_path, std::ios::trunc);
    if (!ofs.is_open()) return;
    for (const auto& p : m_queue) {
        ofs << serializePacketCompact(p);
    }
    ofs.close();
#endif
}

void TelemetryBuffer::loadFromPersistentStorage() {
#ifdef ARDUINO
    if (!LittleFS.exists(m_storage_path.c_str())) return;
    File f = LittleFS.open(m_storage_path.c_str(), "r");
    if (!f) return;

    while (f.available()) {
        String l = f.readStringUntil('\n');
        std::string line = l.c_str();
        TelemetryPacket p;
        if (deserializePacketCompact(line, p)) {
            m_queue.push_back(p);
        }
        // Corrupted records are safely discarded without throwing or hanging
    }
    f.close();
#else
    std::ifstream ifs(m_storage_path);
    if (!ifs.is_open()) return;

    std::string line;
    while (std::getline(ifs, line)) {
        if (line.empty()) continue;
        TelemetryPacket p;
        if (deserializePacketCompact(line, p)) {
            m_queue.push_back(p);
        }
        // Corrupted records are safely discarded without crashing
    }
    ifs.close();
#endif
}
