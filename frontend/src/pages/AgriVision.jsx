import React, { useState } from 'react'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import {
  Satellite, Eye, UploadCloud, AlertCircle, CheckCircle2,
  Sparkles, Layers, ShieldCheck, Info, RefreshCw, ZoomIn, Camera
} from 'lucide-react'

// Demo Leaf Disease Samples backed by PlantVillage CNN classification benchmarks
const SAMPLE_DISEASE_CASES = [
  {
    id: 'cotton_blight',
    crop: 'Cotton (कपास)',
    condition: 'Bacterial Blight (Xanthomonas citri pv. malvacearum)',
    confidence: '89.4%',
    severity: 'MODERATE (Grade 2/4)',
    color: 'amber',
    symptoms: 'Angular, water-soaked lesions on leaves turning reddish-brown, vein necrosis.',
    biological_control: 'Spray Pseudomonas fluorescens (0.2% @ 2g/L) or Copper Oxychloride 50 WP (2.5 g/L). Avoid overhead flood irrigation to prevent water droplet splashing.',
    regenerative_ipm: 'Incorporate crop residue post-harvest; seed treatment with Trichoderma viride (4g/kg seed).'
  },
  {
    id: 'tomato_early_blight',
    crop: 'Tomato (टमाटर)',
    condition: 'Early Blight (Alternaria solani)',
    confidence: '93.1%',
    severity: 'HIGH (Grade 3/4)',
    color: 'rose',
    symptoms: 'Concentric "target board" rings on older lower leaves surrounded by yellow chlorotic halos.',
    biological_control: 'Remove infected bottom leaves immediately. Spray Bacillus subtilis (2g/L) or Neem oil (10,000 ppm @ 3ml/L). Maintain proper spacing for canopy airflow.',
    regenerative_ipm: 'Apply straw mulch to prevent soil-borne fungal spores from splashing onto lower leaves during rainfall.'
  },
  {
    id: 'rice_brown_spot',
    crop: 'Paddy / Rice (धान)',
    condition: 'Brown Spot (Bipolaris oryzae)',
    confidence: '86.7%',
    severity: 'MILD (Grade 1/4)',
    color: 'amber',
    symptoms: 'Small circular to oval dark brown lesions with yellow halo, associated with soil potassium/silicon deficit.',
    biological_control: 'Correct soil potash deficiency with wood ash or bio-potash (Frateuria aurantia). Seed soaking in 1% salt solution before sowing.',
    regenerative_ipm: 'Silicon amendment (diatomaceous earth) strengthens cell walls against fungal appressoria penetration.'
  },
  {
    id: 'wheat_healthy',
    crop: 'Wheat (गेहूं)',
    condition: 'Healthy Leaf Canopy (No Pathogens Detected)',
    confidence: '96.2%',
    severity: 'NONE',
    color: 'emerald',
    symptoms: 'Uniform chlorophyll distribution, optimal leaf angle, zero necrosis or pustules.',
    biological_control: 'Maintain current agronomic practices; scout weekly for yellow stripe rust if humidity exceeds 85%.',
    regenerative_ipm: 'Balanced mycorrhizal inoculation supports natural systemic acquired resistance (SAR).'
  }
]

export default function AgriVision() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('satellite') // 'satellite' | 'disease'
  const [selectedSatelliteIndex, setSelectedSatelliteIndex] = useState('NDVI') // NDVI, NDMI, EVI
  const [selectedDiseaseCase, setSelectedDiseaseCase] = useState(SAMPLE_DISEASE_CASES[0])
  const [customImageUploaded, setCustomImageUploaded] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#103420] to-[#18462b] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Satellite size={14} />
            <span>Copernicus Sentinel-2 & Plant-Level Computer Vision</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t('nav_agrivision', 'AgriVision Remote & Plant Intelligence')}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Multi-spectral satellite field observation combined with on-device computer vision screening for leaf anomalies.
          </p>

          {/* Mode Tabs */}
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('satellite')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'satellite'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Satellite size={16} />
              <span>Sentinel-2 Satellite Indices</span>
            </button>
            <button
              onClick={() => setActiveTab('disease')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'disease'
                  ? 'bg-emerald-500 text-emerald-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Camera size={16} />
              <span>Leaf Disease Vision Screening</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'satellite' ? (
          /* Satellite View */
          <div className="space-y-8">
            {/* Satellite Metadata Bar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                  <Satellite size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>Copernicus Sentinel-2 Constellation</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      LIVE ORBIT FEED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    GSD: 10m Ground Resolution • Cloud Cover: &lt; 8.2% • Last Pass: Yesterday 11:20 IST
                  </div>
                </div>
              </div>

              {/* Index Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                {[
                  { id: 'NDVI', label: 'NDVI (Vegetation Vigor)' },
                  { id: 'NDMI', label: 'NDMI (Canopy Moisture)' },
                  { id: 'EVI', label: 'EVI (Enhanced Index)' },
                ].map(idx => (
                  <button
                    key={idx.id}
                    onClick={() => setSelectedSatelliteIndex(idx.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedSatelliteIndex === idx.id
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {idx.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Multi-spectral Map Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Field Multi-spectral Heatmap — {selectedSatelliteIndex}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Target Field: Parbhani Plot 01 (Soybean-Chickpea rotation, 2.4 ha)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                  <Sparkles size={14} />
                  <span>Mean Index: 0.68 (Optimal Health)</span>
                </div>
              </div>

              {/* Synthetic/Simulated Sentinel Heatmap Visualizer */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-[420px] flex items-center justify-center">
                {/* SVG Visual Representation */}
                <svg className="w-full h-full" viewBox="0 0 800 450">
                  <defs>
                    <radialGradient id="fieldHealthGrad" cx="50%" cy="50%" r="65%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#15803d" stopOpacity="0.75" />
                      <stop offset="80%" stopColor="#ca8a04" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                    </radialGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    </pattern>
                  </defs>

                  {/* Satellite background texture */}
                  <rect width="100%" height="100%" fill="#0f172a" />
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Field polygon boundary with gradient fill */}
                  <polygon
                    points="160,80 640,110 680,360 220,380"
                    fill="url(#fieldHealthGrad)"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />

                  {/* Sensor Node markers */}
                  <circle cx="340" cy="200" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                  <text x="355" y="205" fill="#ffffff" fontSize="12" fontWeight="bold">Node 1 (AgriSense-001)</text>

                  <circle cx="520" cy="270" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                  <text x="535" y="275" fill="#ffffff" fontSize="12" fontWeight="bold">Node 2 (Virtual Wokwi)</text>

                  {/* Water Stress pocket */}
                  <ellipse cx="600" cy="220" rx="45" ry="30" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="570" y="225" fill="#fca5a5" fontSize="10" fontWeight="bold">Canopy Dry Zone</text>
                </svg>

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur p-3 rounded-xl border border-white/20 text-white text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Sentinel-2B Tile 43QDF</span>
                  </div>
                  <div className="text-[11px] text-slate-300">Observation: Lat 19.26° N, Lon 76.77° E</div>
                  <div className="text-[11px] text-slate-300">Atmospheric Correction: Sen2Cor 2.10</div>
                </div>

                {/* Color Legend */}
                <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur p-3 rounded-xl border border-white/20 text-white text-xs">
                  <div className="font-bold mb-1 text-[11px]">Vegetation Index Scale</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-rose-400">0.1 (Bare)</span>
                    <div className="w-32 h-2.5 rounded bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
                    <span className="text-[10px] text-emerald-400">0.9 (Dense)</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Index Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-1">NDVI (Normalized Difference Vegetation)</h4>
                  <p className="text-slate-600 leading-snug">
                    Calculated as (NIR - Red) / (NIR + Red). Quantifies photosynthetic chlorophyll absorption. Values above 0.6 indicate vigorous vegetative development.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-1">NDMI (Normalized Difference Moisture)</h4>
                  <p className="text-slate-600 leading-snug">
                    Calculated as (NIR - SWIR) / (NIR + SWIR). Directly correlates with leaf water content and detects incipient drought stress 4 days before visible wilting.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-1">EVI (Enhanced Vegetation Index)</h4>
                  <p className="text-slate-600 leading-snug">
                    Corrects for atmospheric aerosols and soil background reflections, preventing saturation in dense closed-canopy crops like Sugarcane and Banana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Disease Vision Screening */
          <div className="space-y-8">
            {/* Disclaimer Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-700 mb-0.5">
                  Scientific Integrity & Field Protocol
                </span>
                Computer vision models trained on PlantVillage datasets provide rapid screening triage. They are not absolute guarantees. High-value fungicide or biological applications should always be corroborated by local Krishi Vigyan Kendra (KVK) extension officers.
              </div>
            </div>

            {/* Main Screening Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sample Cases Selector */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Benchmark Disease Case:
                </h3>
                {SAMPLE_DISEASE_CASES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDiseaseCase(item)}
                    className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                      selectedDiseaseCase.id === item.id
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{item.crop}</span>
                      <span className="text-[10px] font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.confidence}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-1">{item.condition}</div>
                  </button>
                ))}

                {/* Upload Custom Leaf Button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => alert('Leaf photo screening: Mobile camera upload is active. To test custom leaves, connect via mobile browser or camera interface.')}
                    className="w-full py-2.5 rounded-xl border border-dashed border-emerald-500 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <UploadCloud size={16} />
                    <span>Upload Leaf Photo</span>
                  </button>
                </div>
              </div>

              {/* Diagnosis & IPM Recommendations Panel */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mb-1">
                      {selectedDiseaseCase.crop}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {selectedDiseaseCase.condition}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Confidence: <strong className="text-emerald-700">{selectedDiseaseCase.confidence}</strong>
                    </span>
                  </div>
                </div>

                {/* Visual Symptoms */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Field Pathology & Symptoms:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {selectedDiseaseCase.symptoms}
                  </p>
                </div>

                {/* Biological Control Recommendation */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                    <Sparkles size={16} className="text-emerald-600" />
                    <span>Safe Biological & Organic Remediation:</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {selectedDiseaseCase.biological_control}
                  </p>
                </div>

                {/* Regenerative Soil & Crop Immunity Practice */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Regenerative IPM & Soil Immunity:</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedDiseaseCase.regenerative_ipm}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
