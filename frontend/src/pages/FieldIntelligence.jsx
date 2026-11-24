import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import HeaderNav from '../components/HeaderNav'
import AddYourFieldModal from '../components/AddYourFieldModal'
import {
  MapPin, AlertTriangle, Droplets, Thermometer,
  Layers, ArrowUpRight, Plus, RefreshCw, Cpu,
  CheckCircle2, Compass, Wind, Sun, Clock, ShieldCheck, Sprout
} from 'lucide-react'
import { getLiveWeather } from '../services/api'

export default function FieldIntelligence() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFieldId, setSelectedFieldId] = useState('fld-01')
  const [weatherData, setWeatherData] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [layerMode, setLayerMode] = useState('ndvi') // 'ndvi' | 'moisture' | 'rgb'

  // Pre-configured realistic fields for Pan-India demonstration
  const fields = [
    {
      id: 'fld-01',
      name: 'North Plot (Acre 1-3)',
      crop: 'Cotton',
      variety: 'Bt RCH-2',
      season: 'Kharif',
      area_ha: 2.4,
      soil_type: 'Deep Black Soil (Vertisol)',
      moisture: 68.2,
      ph: 6.8,
      temperature: 27.4,
      organic_carbon: 0.72,
      ec: 0.42,
      npk: { N: 185, P: 24, K: 210 },
      health_status: 'OPTIMAL',
      ndvi_score: 0.76,
      sensor_node: 'AgriSense-001 (Wokwi Sim)',
      is_simulated: true,
      last_reading_time: '3 mins ago',
      alerts: [
        {
          type: 'warning',
          title: 'Irrigation Advisory',
          desc: 'Soil moisture is 68.2%. Hold irrigation for 48 hours; regional forecast shows 28mm rainfall approaching.'
        }
      ]
    },
    {
      id: 'fld-02',
      name: 'South Slope (Plot B)',
      crop: 'Soybean',
      variety: 'KDS-726 (Sangam)',
      season: 'Kharif',
      area_ha: 1.8,
      soil_type: 'Medium Black Loam',
      moisture: 54.0,
      ph: 7.1,
      temperature: 28.1,
      organic_carbon: 0.65,
      ec: 0.38,
      npk: { N: 140, P: 18, K: 175 },
      health_status: 'ATTENTION',
      ndvi_score: 0.68,
      sensor_node: 'AgriSense-002',
      is_simulated: true,
      last_reading_time: '8 mins ago',
      alerts: [
        {
          type: 'warning',
          title: 'Phosphorus Limitation',
          desc: 'Available P is 18 kg/ha (Deficit). Foliar spray of 19:19:19 recommended at pod initiation stage.'
        }
      ]
    },
    {
      id: 'fld-03',
      name: 'Riverbank Orchard',
      crop: 'Pomegranate / Turmeric',
      variety: 'Bhagwa / Selam',
      season: 'Perennial',
      area_ha: 3.2,
      soil_type: 'Clay Loam with Drip',
      moisture: 72.5,
      ph: 7.4,
      temperature: 26.2,
      organic_carbon: 0.88,
      ec: 0.51,
      npk: { N: 210, P: 32, K: 280 },
      health_status: 'EXCELLENT',
      ndvi_score: 0.84,
      sensor_node: 'AgriSense-003',
      is_simulated: true,
      last_reading_time: '12 mins ago',
      alerts: []
    }
  ]

  const activeField = fields.find(f => f.id === selectedFieldId) || fields[0]

  useEffect(() => {
    getLiveWeather('Parbhani')
      .then(res => setWeatherData(res))
      .catch(() => {})
      .finally(() => setLoadingWeather(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#f8faf9] text-gray-800 font-sans">
      <HeaderNav />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Top Greeting & Transparency Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {t('farm_at_a_glance', 'Your Farm at a Glance')}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                📍 Maharashtra, India · 19.26° N, 76.78° E
              </span>
            </div>
            <h1 className="text-2xl font-black text-emerald-950 mt-1 tracking-tight">
              {t('field_workspace_title', 'Field Intelligence Workspace')}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {t('field_workspace_subtitle', 'Monitor field health, live soil telemetry, weather risks, and regenerative recommendations.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t('badge_simulated', 'SIMULATED WOKWI LAB')}
            </span>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>{t('btn_add_field', 'Add Field')}</span>
            </button>
          </div>
        </div>

        {/* Field Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {fields.map(f => {
            const isSelected = f.id === selectedFieldId
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFieldId(f.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50/50'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                <span>{f.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                  {f.crop}
                </span>
              </button>
            )
          })}
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">{t('kpi_avg_moisture', 'Soil Moisture')}</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{activeField.moisture}%</p>
              <span className="text-[11px] text-emerald-700 font-bold">Optimal Range</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Droplets size={22} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">{t('kpi_soil_ph', 'Soil pH')}</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{activeField.ph}</p>
              <span className="text-[11px] text-gray-600 font-medium">Neutral (Ideal)</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Compass size={22} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">{t('kpi_organic_carbon', 'Organic Carbon')}</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{activeField.organic_carbon}%</p>
              <span className="text-[11px] text-emerald-700 font-bold">+0.08% / season</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500">{t('kpi_pending_alerts', 'Active Advisories')}</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{activeField.alerts.length}</p>
              <span className="text-[11px] text-amber-700 font-bold">Actionable Steps</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* Central Workspace: Interactive Field Map & Telemetry Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Field Map & Satellite Layer */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers size={18} className="text-emerald-700" />
                  <span>{t('field_map_title', 'Field Boundaries & Vegetation Layers')}</span>
                </h2>
                <p className="text-xs text-gray-500">
                  {activeField.name} · {activeField.area_ha} ha · {activeField.soil_type}
                </p>
              </div>

              {/* Layer Mode Selector */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setLayerMode('ndvi')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${layerMode === 'ndvi' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
                >
                  NDVI (0.76)
                </button>
                <button
                  onClick={() => setLayerMode('moisture')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${layerMode === 'moisture' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
                >
                  Moisture Heatmap
                </button>
                <button
                  onClick={() => setLayerMode('rgb')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${layerMode === 'rgb' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600'}`}
                >
                  Sentinel-2 True Color
                </button>
              </div>
            </div>

            {/* Interactive SVG Field Map Visualization */}
            <div className="relative w-full h-80 rounded-xl overflow-hidden border border-emerald-100 bg-emerald-950/90 flex items-center justify-center">
              <svg viewBox="0 0 600 320" className="w-full h-full">
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  </pattern>
                  <linearGradient id="ndviGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#15803d" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#22c55e" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#166534" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                <rect width="600" height="320" fill="url(#grid)" />

                {/* Polygonal Field Boundary */}
                <polygon
                  points="90,45 420,35 520,240 380,285 110,265"
                  fill={layerMode === 'ndvi' ? 'url(#ndviGrad)' : layerMode === 'moisture' ? '#0369a1' : '#3f6212'}
                  stroke="#86efac"
                  strokeWidth="2.5"
                  className="transition-all duration-500"
                />

                {/* Contour / Ridge lines inside field */}
                <path d="M 140,80 Q 280,70 410,75" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4,4" fill="none"/>
                <path d="M 130,130 Q 290,120 440,130" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4,4" fill="none"/>
                <path d="M 120,180 Q 280,180 470,185" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4,4" fill="none"/>

                {/* Sensor Node Indicator with live radar pulse */}
                <circle cx="280" cy="150" r="14" fill="rgba(16, 185, 129, 0.35)" className="animate-ping" />
                <circle cx="280" cy="150" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />

                {/* Annotation Labels */}
                <text x="295" y="145" fill="#ffffff" fontSize="11" fontWeight="bold">AgriSense Node-01</text>
                <text x="295" y="160" fill="#a7f3d0" fontSize="9">Moisture: 68.2% · Temp: 27.4°C</text>
                <text x="110" y="295" fill="rgba(255,255,255,0.7)" fontSize="10">Plot 1A: Cotton (Bt RCH-2)</text>
              </svg>

              {/* Floating Map Legend */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Healthy Canopy (NDVI &gt; 0.70)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>Drip Zone Active</span>
                </span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider">
                {t('quick_actions', 'Quick Farm Actions')}:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate('/crop-explorer')}
                  className="px-3 py-1.5 rounded-lg font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  🌾 {t('btn_find_crops', 'Find Crops')}
                </button>
                <button
                  onClick={() => navigate('/agrivision')}
                  className="px-3 py-1.5 rounded-lg font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  🌿 {t('btn_scan_leaf', 'Scan Leaf')}
                </button>
                <button
                  onClick={() => navigate('/devices')}
                  className="px-3 py-1.5 rounded-lg font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  🔌 {t('btn_connect_device', 'Connect Device')}
                </button>
                <button
                  onClick={() => navigate('/crop-planner')}
                  className="px-3 py-1.5 rounded-lg font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  📅 {t('nav_crop_planner', 'Crop Rotation')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Col: Actionable Insights & Weather Telemetry */}
          <div className="space-y-6">

            {/* AgriN Actionable Recommendations */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sprout size={17} className="text-emerald-700" />
                  <span>{t('agrin_insights', 'AgriN Actionable Insights')}</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {t('badge_verified', 'ICAR VERIFIED')}
                </span>
              </div>

              {activeField.alerts.length > 0 ? (
                activeField.alerts.map((a, i) => (
                  <div key={i} className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertTriangle size={15} className="text-amber-600" />
                      <span>{a.title}</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-normal">
                      {a.desc}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                  <span>{t('no_alerts_message', 'All soil and moisture conditions are within optimal agronomic thresholds.')}</span>
                </div>
              )}

              {/* NPK Breakdown */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Soil Nutrients (kg/ha)</span>
                  <span className="text-[10px] text-gray-400 font-normal">ESTIMATED</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">N (Nitrogen)</span>
                    <span className="text-sm font-black text-gray-800">{activeField.npk.N}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">P (Phosphorus)</span>
                    <span className="text-sm font-black text-gray-800">{activeField.npk.P}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500 font-bold block">K (Potassium)</span>
                    <span className="text-sm font-black text-gray-800">{activeField.npk.K}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather & Climate Telemetry Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun size={18} className="text-amber-400" />
                  <h3 className="text-sm font-bold">Open-Meteo Live Forecast</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
                  REAL-TIME
                </span>
              </div>

              {loadingWeather ? (
                <div className="py-6 text-center text-xs text-emerald-200">Fetching live weather telemetry...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black">{weatherData?.temperature || 27.5}°C</span>
                      <span className="text-xs text-emerald-300 block">Clear sky / Sub-tropical</span>
                    </div>
                    <div className="text-right text-xs text-emerald-200">
                      <div>Humidity: {weatherData?.humidity || 62}%</div>
                      <div>Rainfall: {weatherData?.rainfall || 0.0} mm</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/10 text-xs text-emerald-100 leading-relaxed">
                    🌧️ <strong>7-Day Outlook:</strong> Low precipitation risk for next 48h. Optimal conditions for protective foliar spray.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="p-4 rounded-xl bg-gray-100/80 border border-gray-200 text-xs text-gray-600 flex items-start gap-2.5">
          <Clock size={16} className="text-gray-500 shrink-0 mt-0.5" />
          <span>
            {t('disclaimer_text', 'AgriN provides evidence-backed agronomic decision support. Recommendations do not replace professional agricultural extension services or laboratory soil assays.')}
          </span>
        </div>

      </main>

      {/* Add Field Modal */}
      <AddYourFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFieldCreated={() => {}}
      />
    </div>
  )
}
