import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import {
  ArrowLeft, Wifi, WifiOff, AlertTriangle, Battery, BatteryLow,
  Thermometer, Droplets, FlaskConical, Zap, Leaf, RefreshCw,
  Signal, Clock, Cpu, Radio, ShieldCheck, Terminal, ExternalLink
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import SensorStatusBadge from '../components/SensorStatusBadge'
import { getDeviceStatus, getLatestTelemetry, getTelemetryHistory } from '../services/api'

// Calibrated Wokwi Virtual Lab Telemetry (matches firmware/wokwi/src/main_simulation.cpp)
const WOKWI_LAB_DEVICE = {
  device_id: 'wokwi-esp32-sim-01',
  name: 'Wokwi ESP32 Virtual Lab',
  status: 'ONLINE',
  firmware_version: 'v2.4.0-wokwi',
  battery_voltage: 3.30,
  battery_percent: 100,
  signal_rssi: -45,
  signal_quality: 'EXCELLENT',
  last_seen_at: new Date().toISOString(),
}

const WOKWI_LAB_MEASUREMENTS = [
  {
    sensor_type: 'SOIL_MOISTURE',
    parameter_name: 'Soil Moisture (Capacitive)',
    calibrated_value: 41.8,
    unit: '%',
    data_source: 'SYNTHETIC',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: 'ADC 2340 / Dry 3150 / Wet 1420'
  },
  {
    sensor_type: 'SOIL_TEMP',
    parameter_name: 'Soil Temperature (DS18B20)',
    calibrated_value: 27.4,
    unit: '°C',
    data_source: 'SYNTHETIC',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: '1-Wire GPIO 4 Calibrated'
  },
  {
    sensor_type: 'SOIL_PH',
    parameter_name: 'Soil pH (Analog Probe)',
    calibrated_value: 7.1,
    unit: 'pH',
    data_source: 'SYNTHETIC',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: 'Buffers pH 4.01 @ 2.03V, pH 6.86 @ 1.50V'
  },
  {
    sensor_type: 'SOIL_EC',
    parameter_name: 'Electrical Conductivity',
    calibrated_value: 0.38,
    unit: 'dS/m',
    data_source: 'SYNTHETIC',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: 'Standard KCl 1413 uS/cm @ 1.413V'
  },
  {
    sensor_type: 'NITROGEN',
    parameter_name: 'Nitrogen (N) - Estimated',
    calibrated_value: 195,
    unit: 'kg/ha',
    data_source: 'ESTIMATED',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: 'Derived from Vertisol SOC & EC correlation'
  },
  {
    sensor_type: 'PHOSPHORUS',
    parameter_name: 'Phosphorus (P) - Estimated',
    calibrated_value: 18.2,
    unit: 'kg/ha',
    data_source: 'ESTIMATED',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: 'Estimated from Olsen P equilibrium'
  },
  {
    sensor_type: 'POTASSIUM',
    parameter_name: 'Potassium (K) - Estimated',
    calibrated_value: 240,
    unit: 'kg/ha',
    data_source: 'ESTIMATED',
    quality: 'GOOD',
    timestamp: new Date().toISOString(),
    calibration_note: 'Estimated from Exchangeable K curve'
  },
]

// Deterministic baseline curve for Wokwi virtual lab (never randomized or labeled live)
const WOKWI_BASELINE_TREND = [
  { time: '00:00', moisture: 43.2 },
  { time: '04:00', moisture: 44.1 },
  { time: '08:00', moisture: 43.0 },
  { time: '12:00', moisture: 41.2 },
  { time: '16:00', moisture: 39.8 },
  { time: '20:00', moisture: 41.0 },
  { time: 'Now', moisture: 41.8 },
]

function isTelemetryStale(isoStr, thresholdMinutes = 15) {
  if (!isoStr) return true
  const diffMins = (Date.now() - new Date(isoStr).getTime()) / 60000
  return Number.isNaN(diffMins) || diffMins > thresholdMinutes
}

function minutesAgo(isoStr) {
  if (!isoStr) return 'unknown'
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff === 1) return '1 min ago'
  if (diff < 60) return `${diff} mins ago`
  const h = Math.floor(diff / 60)
  return `${h} hr${h > 1 ? 's' : ''} ago`
}

function sensorIcon(type) {
  const map = {
    SOIL_MOISTURE: <Droplets size={18} />,
    SOIL_TEMP: <Thermometer size={18} />,
    SOIL_PH: <FlaskConical size={18} />,
    SOIL_EC: <Zap size={18} />,
    NITROGEN: <Leaf size={18} />,
    PHOSPHORUS: <Leaf size={18} />,
    POTASSIUM: <Leaf size={18} />,
  }
  return map[type] || <Cpu size={18} />
}

export default function DeviceMonitor() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Default to 'physical' so we honestly report hardware disconnected unless real device telemetry exists
  const [hardwareMode, setHardwareMode] = useState('physical')
  const [registeredDevices] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('agrin_registered_devices') || '[]')
    } catch {
      return []
    }
  })
  const [selectedDevice, setSelectedDevice] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('agrin_registered_devices') || '[]')
      return saved[0]?.device_id || 'agrisense-001'
    } catch {
      return 'agrisense-001'
    }
  })
  const [device, setDevice] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(false)
  const [liveDeviceConnected, setLiveDeviceConnected] = useState(false)
  const [telemetryStale, setTelemetryStale] = useState(false)
  const [lastTelemetryAt, setLastTelemetryAt] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchData = useCallback(async () => {
    setLoading(true)
    if (hardwareMode === 'wokwi') {
      // Wokwi Virtual Simulator mode (strictly labeled synthetic)
      setDevice(WOKWI_LAB_DEVICE)
      setMeasurements(WOKWI_LAB_MEASUREMENTS)
      setTrendData(WOKWI_BASELINE_TREND)
      setLiveDeviceConnected(true)
      setTelemetryStale(false)
      setLastTelemetryAt(null)
      setLoading(false)
      setLastRefresh(new Date())
      return
    }

    // Physical Hardware mode: Query real backend device status, latest packet, and persisted history
    try {
      const [devRes, telRes, histRes] = await Promise.all([
        getDeviceStatus(selectedDevice),
        getLatestTelemetry(selectedDevice),
        getTelemetryHistory(selectedDevice, 1, 24).catch(() => null),
      ])
      if (devRes) {
        setDevice(devRes)
        const latestMeas = telRes?.measurements || []
        setMeasurements(latestMeas)
        setLastTelemetryAt(telRes?.timestamp || devRes.last_seen_at || null)
        const stale = !telRes?.timestamp || isTelemetryStale(telRes.timestamp, 15)
        setTelemetryStale(stale)
        setLiveDeviceConnected(latestMeas.length > 0)

        // Build real persisted moisture trend (oldest -> newest)
        const records = histRes?.records || []
        const moisturePoints = records
          .slice()
          .reverse()
          .map(rec => {
            const m = (rec.measurements || []).find(item => item.sensor_type === 'SOIL_MOISTURE')
            if (!m) return null
            return {
              time: new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              moisture: m.calibrated_value,
            }
          })
          .filter(Boolean)
        setTrendData(moisturePoints)
      } else {
        setDevice(null)
        setMeasurements([])
        setTrendData([])
        setLiveDeviceConnected(false)
        setTelemetryStale(false)
      }
    } catch (err) {
      // Honest state: No physical device connected
      setDevice(null)
      setMeasurements([])
      setTrendData([])
      setLiveDeviceConnected(false)
      setTelemetryStale(false)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [hardwareMode, selectedDevice])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
      <div className="min-h-screen bg-[#F7F7F2] text-[#171814]">
        <HeaderNav />

        {/* Header Banner */}
          <section className="bg-[#183B2A] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#E5E5DC]/15">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7D927] text-xs font-semibold mb-3 border border-white/15">
                    <Radio size={14} />
                    <span>Future ESP32 Hardware Readiness &amp; Data Input</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    {t('agrisense_title', 'AgriSense Hardware & Telemetry Monitor')}
                  </h1>
                    <p className="text-[#F7F7F2]/80 text-sm mt-1 max-w-2xl leading-relaxed">
                      {t('agrisense_subtitle', 'Hardware sensors are not currently connected. Enter soil readings manually for live ML analysis, or inspect the ESP32 Wokwi virtual bench.')}
                    </p>
                </div>

                {/* Mode Switcher Toggle */}
                  <div className="bg-white/10 p-1.5 rounded-2xl border border-white/15 self-start md:self-auto flex items-center gap-1.5">
                    <button
                onClick={() => setHardwareMode('physical')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${hardwareMode === 'physical'
                        ? 'bg-[#E7D927] text-[#171814]'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <Radio size={15} />
                      <span>Physical Hardware (ESP32)</span>
                    </button>
                    <button
                onClick={() => setHardwareMode('wokwi')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${hardwareMode === 'wokwi'
                        ? 'bg-[#E7D927] text-[#171814]'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <Cpu size={15} />
                      <span>Wokwi Lab (Synthetic)</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Main Container */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Device ID Selector in Physical Mode */}
                {hardwareMode === 'physical' && (
                  <div className="bg-white rounded-2xl p-4 border border-[#E5E5DC] shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#171814]">
                      <Radio size={15} className="text-[#183B2A]" />
                      <span>Monitored Physical Device ID:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {registeredDevices.length > 0 && (
                        <select
                          value={selectedDevice}
                          onChange={(e) => setSelectedDevice(e.target.value)}
                          className="farm-input text-xs font-semibold"
                          style={{ width: 'auto', minHeight: 38, padding: '6px 12px' }}
                        >
                          {registeredDevices.map(d => (
                            <option key={d.device_id} value={d.device_id}>
                              {d.name} ({d.device_id.slice(0, 8)}…)
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        placeholder="Enter registered Device UUID"
                        className="farm-input text-xs font-mono-num"
                        style={{ width: 240, minHeight: 38, padding: '6px 12px' }}
                      />
                      <button
                        type="button"
                        onClick={fetchData}
                        className="btn-agrin-dark"
                        style={{ padding: '9px 18px', fontSize: '12px' }}
                      >
                        Query Device
                      </button>
                    </div>
                  </div>
                )}

                {/* Banner based on Active Mode */}
                {hardwareMode === 'wokwi' ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <Cpu size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-900 flex items-center gap-2">
                          <span>WOKWI VIRTUAL LAB MODE ACTIVE</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-900 border border-purple-300">
                            SIMULATED WOKWI
                          </span>
                        </div>
                        <div className="text-xs text-purple-800 mt-0.5 leading-relaxed">
                          Displaying deterministic simulated calibration profile from the virtual ESP32 testbench (<code>firmware/wokwi/</code>). Strictly labeled <code>SYNTHETIC</code> — zero simulated data is written to live farm history.
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://wokwi.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors shrink-0"
                    >
                      <span>Open Wokwi</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : !liveDeviceConnected ? (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 mb-8 text-center max-w-2xl mx-auto space-y-3">
                    <WifiOff size={40} className="mx-auto text-amber-600" />
                    <h2 className="text-base font-black text-amber-950">
                      {t('no_live_data', 'NO LIVE SENSOR DATA — Connect AgriSense ESP32 or launch Wokwi Simulator')}
                    </h2>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      No telemetry packet received from <code>{selectedDevice}</code>. To connect real hardware, register a device, flash your ESP32 with <code>firmware/AGRISENSE_FIRMWARE_SPEC.md</code>, and authenticate using header <code>X-Device-Token</code>.
                    </p>
                      <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => navigate('/farm-details')}
                          className="btn-agrin-cta"
                          style={{ padding: '10px 20px', fontSize: '12px' }}
                        >
                          Enter Soil Readings Manually
                        </button>
                        <button
                          type="button"
                          onClick={() => setHardwareMode('wokwi')}
                          className="btn-agrin-dark"
                          style={{ padding: '10px 20px', fontSize: '12px' }}
                        >
                          Preview Wokwi Simulator (Synthetic)
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/devices/register')}
                          className="btn-agrin-outline"
                          style={{ padding: '9px 20px', fontSize: '12px', background: '#FFFFFF' }}
                        >
                          Register ESP32 Node
                        </button>
                      </div>
                    </div>
                    ) : telemetryStale ? (
                    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
                      <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900">
                        <div className="font-black uppercase tracking-wider text-[11px] text-amber-950">
                          STALE TELEMETRY — DEVICE OFFLINE / DISCONNECTED (&gt; 15 mins old)
                        </div>
                        <p className="mt-0.5">
                          Last successful telemetry packet received <strong>{minutesAgo(lastTelemetryAt)}</strong>. Historical measurements are shown below with preserved provenance and are NOT labeled as live readings.
                        </p>
                      </div>
                    </div>
          ) : null}

                    {/* Device Diagnostics Card */}
                    {device && (
                      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                              <Radio size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">{device.name}</h2>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {device.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                ID: {device.device_id} • FW: {device.firmware_version}
                              </div>
                            </div>
                          </div>

                          {/* Hardware Health Metrics */}
                          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Signal Strength</span>
                              <span className="text-slate-800 font-bold">{device.signal_rssi} dBm ({device.signal_quality})</span>
                            </div>
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Battery Level</span>
                              <span className="text-emerald-700 font-bold">{device.battery_percent}% ({device.battery_voltage}V)</span>
                            </div>
                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Last Heartbeat</span>
                              <span className="text-slate-800 font-bold">{minutesAgo(device.last_seen_at)}</span>
                            </div>
                            <button
                              onClick={fetchData}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Refresh Telemetry"
                            >
                              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sensor Measurements Grid */}
                    {measurements.length > 0 && (
                      <div className="space-y-6 mb-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Cpu size={16} className="text-emerald-600" />
                            <span>Calibrated Sensor Measurements</span>
                          </h3>
                          <span className="text-xs text-slate-500">
                            Updated {minutesAgo(lastRefresh.toISOString())}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {measurements.map((m, idx) => {
                            const isEstimated = m.data_source === 'ESTIMATED'
                            const isSynthetic = m.data_source === 'SYNTHETIC'

                            return (
                              <div
                                key={idx}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100">
                                      {sensorIcon(m.sensor_type)}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isSynthetic
                                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                                      : isEstimated
                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      }`}>
                                      {m.data_source}
                                    </span>
                                  </div>

                                  <div className="text-xs font-bold text-slate-600 mb-1">{m.parameter_name}</div>
                                  <div className="flex items-baseline gap-1.5 my-1">
                                    <span className="text-3xl font-black text-slate-900">{m.calibrated_value}</span>
                                    <span className="text-xs font-bold text-slate-500">{m.unit}</span>
                                  </div>
                                </div>

                                {m.calibration_note && (
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-mono leading-tight">
                                    {m.calibration_note}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* 24-Hour Trend Chart */}
                    {trendData.length > 0 && (
                      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Droplets size={18} className="text-cyan-600" />
                              <span>24-Hour Soil Moisture Dynamics</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Soil Moisture percentage recorded at root zone depth (15cm)
                            </p>
                          </div>
                          <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            Wokwi Virtual Stream
                          </span>
                        </div>

                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" domain={[20, 60]} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                                itemStyle={{ color: '#38bdf8' }}
                              />
                              <Line type="monotone" dataKey="moisture" stroke="#0284c7" strokeWidth={2.5} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Hardware Specification Reference */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                          <Terminal size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900">
                            AgriSense ESP32 Hardware Calibration Profile
                          </h3>
                          <p className="text-xs text-slate-500">
                            Official pinouts and calibration coefficients recorded in <code>firmware/hardware_profile.json</code>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-700 font-sans mb-1">Capacitive Moisture</div>
                          <div className="text-slate-600">ADC Pin: GPIO 34</div>
                          <div className="text-slate-500 text-[10px]">Dry: 3150 | Wet: 1420</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-700 font-sans mb-1">DS18B20 Temp</div>
                          <div className="text-slate-600">1-Wire Pin: GPIO 4</div>
                          <div className="text-slate-500 text-[10px]">Pullup: 4.7kΩ | Cal: 0.0°C</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-700 font-sans mb-1">Soil pH Probe</div>
                          <div className="text-slate-600">ADC Pin: GPIO 35</div>
                          <div className="text-slate-500 text-[10px]">pH4: 2.03V | pH7: 1.50V</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="font-bold text-slate-700 font-sans mb-1">RS485 NPK Sensor</div>
                          <div className="text-slate-600">UART2: RX16, TX17, DE18</div>
                          <div className="text-slate-500 text-[10px]">Baud: 9600 | Slave: 0x01</div>
                        </div>
                      </div>
                    </div>
                  </main>
      </div>
            )
  }
