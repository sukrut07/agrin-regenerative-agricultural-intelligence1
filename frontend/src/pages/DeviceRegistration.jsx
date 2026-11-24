import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'
import {
  ArrowLeft, Cpu, Key, Copy, Check, CheckCircle2,
  AlertCircle, ShieldCheck
} from 'lucide-react'
import { registerDevice } from '../services/api'

export default function DeviceRegistration() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: 'AgriSense-Field-01',
    farm_id: 'farm-parbhani-01',
    field_id: 'field-cotton-north',
    hardware_profile: 'ESP32-DevKit-V1-Standard',
    firmware_version: '1.0.0',
    wifi_ssid: 'AgriNet-Farm-WiFi',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const resp = await registerDevice(formData)
      const registered = resp.data || resp
      setResult(registered)
      try {
        const existing = JSON.parse(localStorage.getItem('agrin_registered_devices') || '[]')
        const entry = {
          device_id: registered.device_id,
          name: registered.name,
          farm_id: registered.farm_id,
          field_id: registered.field_id,
        }
        const filtered = existing.filter(d => d.device_id !== entry.device_id)
        localStorage.setItem('agrin_registered_devices', JSON.stringify([entry, ...filtered].slice(0, 10)))
      } catch { }
    } catch (err) {
      console.error('Registration error:', err)
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Registration failed. Ensure backend API is operational.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'id') {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } else {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#171814]">
      <HeaderNav />

      {/* Editorial Forest Banner */}
      <section className="bg-[#183B2A] text-white py-8 px-4 sm:px-6 border-b border-[#E5E5DC]/15">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/devices')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E7D927] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Device Monitor
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E7D927] text-[#183B2A] flex items-center justify-center shrink-0">
              <Cpu size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Register AgriSense IoT Node
              </h1>
              <p className="text-[#F7F7F2]/75 text-xs sm:text-sm mt-0.5">
                Provision device credentials (`X-Device-Token`) and bind to an agricultural plot
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FDECEC] border border-[#F5C6C6] text-[#C93F3F] text-xs sm:text-sm font-semibold flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="ff-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E5E5DC] pb-3.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77772B]">
                [ ESP32 NODE PROVISIONING ]
              </div>
              <h2 className="text-base font-extrabold text-[#171814] mt-0.5">
                Hardware &amp; Field Binding Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="ff-label">Device Node Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. AgriSense-South-Plot"
                  className="farm-input"
                />
              </div>

              <div>
                <label className="ff-label">Farm ID *</label>
                <input
                  type="text"
                  name="farm_id"
                  value={formData.farm_id}
                  onChange={handleChange}
                  required
                  className="farm-input font-mono-num"
                />
              </div>

              <div>
                <label className="ff-label">Field / Plot Identifier</label>
                <input
                  type="text"
                  name="field_id"
                  value={formData.field_id}
                  onChange={handleChange}
                  placeholder="Optional field ID"
                  className="farm-input font-mono-num"
                />
              </div>

              <div>
                <label className="ff-label">Hardware Profile</label>
                <select
                  name="hardware_profile"
                  value={formData.hardware_profile}
                  onChange={handleChange}
                  className="farm-input"
                >
                  <option value="ESP32-DevKit-V1-Standard">ESP32 DevKit V1 (Standard Sensor BOM)</option>
                  <option value="ESP32-S3-Cellular">ESP32-S3 + SIM7080G (Cellular / NB-IoT)</option>
                  <option value="ESP32-LoRaWAN">ESP32 + SX1262 (LoRaWAN 868/915 MHz)</option>
                </select>
              </div>

              <div>
                <label className="ff-label">Firmware Version</label>
                <input
                  type="text"
                  name="firmware_version"
                  value={formData.firmware_version}
                  onChange={handleChange}
                  className="farm-input font-mono-num"
                />
              </div>

              <div>
                <label className="ff-label">Wi-Fi SSID (Optional)</label>
                <input
                  type="text"
                  name="wifi_ssid"
                  value={formData.wifi_ssid}
                  onChange={handleChange}
                  placeholder="e.g. FarmNet_2G"
                  className="farm-input"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5DC] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/devices')}
                className="btn-agrin-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-agrin-cta"
              >
                {submitting ? 'Registering Node...' : 'Register Device'}
              </button>
            </div>
          </form>
        ) : (
          <div className="ff-card p-6 sm:p-8 border-[#183B2A]/30">
            <div className="flex items-center gap-3 text-[#183B2A] mb-6 pb-4 border-b border-[#E5E5DC]">
              <div className="w-11 h-11 rounded-xl bg-[#EAF5EE] text-[#2B7A4B] flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#171814]">Device Registered Successfully</h2>
                <p className="text-[#77786F] text-xs">Configure your ESP32 firmware with the credentials below.</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-[#F7F7F2] border border-[#E5E5DC]">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#77786F] mb-1.5">
                  <span>DEVICE ID (UUID)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.device_id, 'id')}
                    className="flex items-center gap-1 text-[#183B2A] hover:underline cursor-pointer"
                  >
                    {copiedId ? <Check size={13} /> : <Copy size={13} />} {copiedId ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <code className="text-sm font-mono-num font-bold text-[#183B2A] break-all">{result.device_id}</code>
              </div>

              {result.api_key && (
                <div className="p-4 rounded-xl bg-[#FDF6E2] border border-[#E6D39A]">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8A5D0A] mb-1.5">
                    <span className="flex items-center gap-1"><Key size={13} /> DEVICE API KEY (Save Now — Shown Once)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.api_key, 'key')}
                      className="flex items-center gap-1 text-[#8A5D0A] hover:underline cursor-pointer"
                    >
                      {copiedKey ? <Check size={13} /> : <Copy size={13} />} {copiedKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="text-sm font-mono-num font-bold text-[#171814] break-all">{result.api_key}</code>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#F7F7F2] border border-[#E5E5DC] mb-6 text-xs text-[#77786F] space-y-2">
              <div className="font-bold text-[#171814] flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#183B2A]" /> Firmware Configuration Step
              </div>
              <p>Add these credentials into your ESP32 <code className="font-mono-num text-[#183B2A]">hardware_profile.json</code>:</p>
              <pre className="p-3.5 rounded-xl bg-[#183B2A] font-mono-num text-[#F7F7F2] text-[11px] overflow-x-auto">
                {`"backend": {
  "device_id": "${result.device_id}",
  "api_base_url": "http://YOUR_SERVER_IP:8000",
  "telemetry_endpoint": "/api/telemetry/ingest",
  "auth_header": "X-Device-Token: <YOUR_COPIED_API_KEY>"
}`}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/devices')}
                className="btn-agrin-cta flex-1 justify-center"
              >
                Go to Device Monitor
              </button>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="btn-agrin-outline"
              >
                Register Another Node
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
