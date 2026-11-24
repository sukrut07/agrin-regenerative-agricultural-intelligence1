import React, { useState, useMemo } from 'react'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import {
  Activity, FlaskConical, AlertTriangle, CheckCircle, Info,
  TrendingDown, TrendingUp, Sparkles, RefreshCw, ShieldAlert, FileText
} from 'lucide-react'

// Soil presets representing 4 common Indian agricultural soil orders
const SOIL_PRESETS = {
  vertisol: {
    name: 'Medium Black Vertisol (Maharashtra/MP)',
    description: 'Montmorillonite clay, high water-holding capacity, alkaline pH tendency.',
    values: {
      n: 210, p: 14.5, k: 340, s: 9.2,
      zn: 0.52, fe: 4.1, cu: 0.85, mn: 3.4, b: 0.42,
      ph: 7.9, ec: 0.45, oc: 0.54
    }
  },
  alluvial: {
    name: 'Indo-Gangetic Alluvial (Punjab/UP)',
    description: 'Deep loam, intensive cropping, historically high potash, zinc deficiency risk.',
    values: {
      n: 260, p: 22.0, k: 180, s: 12.5,
      zn: 0.48, fe: 6.2, cu: 0.72, mn: 4.8, b: 0.58,
      ph: 7.3, ec: 0.35, oc: 0.48
    }
  },
  alfisol: {
    name: 'Red Sandy Loam / Alfisol (AP/Karnataka)',
    description: 'Coarse texture, prone to leaching, low phosphorus fixation, needs organic matter.',
    values: {
      n: 175, p: 9.8, k: 130, s: 7.8,
      zn: 0.65, fe: 5.5, cu: 0.45, mn: 2.8, b: 0.38,
      ph: 6.4, ec: 0.22, oc: 0.38
    }
  },
  laterite: {
    name: 'Laterite Acidic Soil (Konkan/Kerala/Assam)',
    description: 'High rainfall leaching, iron-rich, acidic pH, high phosphorus fixation.',
    values: {
      n: 220, p: 7.2, k: 110, s: 8.5,
      zn: 0.70, fe: 14.2, cu: 0.60, mn: 5.1, b: 0.35,
      ph: 5.3, ec: 0.18, oc: 0.82
    }
  }
}

// ICAR 12-Parameter Soil Health Card (SHC) evaluation rules
function evaluateParameter(id, val) {
  switch (id) {
    case 'n':
      if (val < 280) return { status: 'DEFICIT', label: 'Low', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      if (val <= 560) return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      return { status: 'EXCESS', label: 'High', color: 'text-blue-700 bg-blue-50 border-blue-200' }
    case 'p':
      if (val < 10) return { status: 'DEFICIT', label: 'Low', color: 'text-rose-700 bg-rose-50 border-rose-200' }
      if (val <= 25) return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      return { status: 'EXCESS', label: 'High', color: 'text-blue-700 bg-blue-50 border-blue-200' }
    case 'k':
      if (val < 108) return { status: 'DEFICIT', label: 'Low', color: 'text-rose-700 bg-rose-50 border-rose-200' }
      if (val <= 280) return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      return { status: 'EXCESS', label: 'Excessive', color: 'text-purple-700 bg-purple-50 border-purple-200' }
    case 's':
      if (val < 10) return { status: 'DEFICIT', label: 'Deficient', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'zn':
      if (val < 0.6) return { status: 'DEFICIT', label: 'Deficient', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'fe':
      if (val < 4.5) return { status: 'DEFICIT', label: 'Deficient', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'cu':
      if (val < 0.2) return { status: 'DEFICIT', label: 'Deficient', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'mn':
      if (val < 2.0) return { status: 'DEFICIT', label: 'Deficient', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'b':
      if (val < 0.5) return { status: 'DEFICIT', label: 'Deficient', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'Sufficient', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    case 'ph':
      if (val < 6.5) return { status: 'ACIDIC', label: 'Acidic', color: 'text-rose-700 bg-rose-50 border-rose-200' }
      if (val <= 7.8) return { status: 'OPTIMAL', label: 'Optimal / Neutral', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      return { status: 'ALKALINE', label: 'Alkaline / Sodic', color: 'text-amber-700 bg-amber-50 border-amber-200' }
    case 'ec':
      if (val <= 1.0) return { status: 'OPTIMAL', label: 'Non-saline', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      if (val <= 2.0) return { status: 'WARNING', label: 'Slightly Saline', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'CRITICAL', label: 'Harmful Salinity', color: 'text-rose-700 bg-rose-50 border-rose-200' }
    case 'oc':
      if (val < 0.5) return { status: 'DEFICIT', label: 'Low (<0.5%)', color: 'text-rose-700 bg-rose-50 border-rose-200' }
      if (val <= 0.75) return { status: 'MEDIUM', label: 'Medium (0.5-0.75%)', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      return { status: 'OPTIMAL', label: 'High (>0.75%)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
    default:
      return { status: 'NORMAL', label: 'Normal', color: 'text-slate-700 bg-slate-50 border-slate-200' }
  }
}

export default function SoilHealth() {
  const { t } = useLanguage()
  const [selectedPreset, setSelectedPreset] = useState('vertisol')
  const [soilValues, setSoilValues] = useState(SOIL_PRESETS.vertisol.values)

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey)
    setSoilValues(SOIL_PRESETS[presetKey].values)
  }

  const handleValueChange = (key, val) => {
    const num = parseFloat(val) || 0
    setSoilValues(prev => ({ ...prev, [key]: num }))
  }

  // Calculate regenerative action plan
  const recommendations = useMemo(() => {
    const recs = []

    if (soilValues.oc < 0.6) {
      recs.push({
        priority: 'HIGH',
        category: 'Organic Matter Rebuilding',
        title: 'Low Soil Organic Carbon (<0.6%)',
        action: 'Sow green manure crop (Daincha / Sesbania or Sunn hemp) at 25 kg seed/ha and incorporate at 45 days before flowering. Apply 5-8 tonnes well-decomposed FYM/compost per hectare.',
        benefit: '+0.15% SOC improvement over 18 months, boosting microbial respiration and water retention.'
      })
    }

    if (soilValues.ph > 8.0) {
      recs.push({
        priority: 'HIGH',
        category: 'pH Remediation',
        title: 'Alkaline / Calcareous Soil Tendency (pH > 8.0)',
        action: 'Incorporate agricultural gypsum (2.5 t/ha) or apply elemental sulphur. Avoid continuous flood irrigation; adopt drip with fertigation to prevent sodium carbonate precipitation.',
        benefit: 'Unlocks fixed phosphorus and micronutrients (Fe, Zn) currently unavailable to crop root hair.'
      })
    } else if (soilValues.ph < 6.0) {
      recs.push({
        priority: 'HIGH',
        category: 'pH Remediation',
        title: 'Acidic Soil (pH < 6.0)',
        action: 'Apply agricultural lime (calcium carbonate) or dolomite at 1.5 - 2.0 t/ha before sowing to neutralize toxic aluminum and manganese ions.',
        benefit: 'Restores beneficial mycorrhizal fungi and Rhizobium nodulation efficiency.'
      })
    }

    if (soilValues.zn < 0.6) {
      recs.push({
        priority: 'MEDIUM',
        category: 'Micronutrient Correction',
        title: 'Zinc Deficiency (<0.6 ppm)',
        action: 'Soil application of Zinc Sulphate (ZnSO4 21%) @ 25 kg/ha as basal dressing, or foliar spray of 0.5% ZnSO4 + 0.25% lime at 30 & 45 days after emergence.',
        benefit: 'Prevents "Khaira" disease in paddy and white bud in maize; boosts auxin plant hormone synthesis.'
      })
    }

    if (soilValues.n < 280) {
      recs.push({
        priority: 'MEDIUM',
        category: 'Biological Nitrogen Management',
        title: 'Available Nitrogen Deficit (<280 kg/ha)',
        action: 'Inoculate legume seeds with Rhizobium culture (250g/10kg seed) and cereals with Azotobacter / Azospirillum. Integrate a short-duration pulse in the upcoming rotation.',
        benefit: 'Substitutes up to 30-40 kg synthetic urea per hectare while enhancing soil biological diversity.'
      })
    }

    if (soilValues.p < 12) {
      recs.push({
        priority: 'MEDIUM',
        category: 'Phosphorus Mobilization',
        title: 'Low Available Phosphorus (<12 kg/ha)',
        action: 'Apply Phosphate Solubilizing Bacteria (PSB) biofertilizer @ 2.5 kg/ha mixed in compost. In alkaline soils, use rock phosphate combined with compost.',
        benefit: 'Converts insoluble soil phosphates into plant-absorbable orthophosphate ions.'
      })
    }

    return recs
  }, [soilValues])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />

      {/* Banner */}
      <section className="bg-gradient-to-b from-[#103420] to-[#18462b] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Activity size={14} />
            <span>National Soil Health Card (SHC) Diagnostic Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t('soil_health_title', 'Soil Health Card & Nutrient Diagnostics')}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            {t('soil_health_subtitle', 'Comprehensive 12-parameter diagnostic based on Indian Soil Health Card (SHC) standards with regenerative biological amendments.')}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Preset Selector */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Load Representative Soil Order:
              </h2>
              <p className="text-xs text-slate-500">
                Choose a regional soil archetype or directly edit any parameter below.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-auto">
              ICAR Validated Benchmarks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(SOIL_PRESETS).map(([key, item]) => (
              <button
                key={key}
                onClick={() => handlePresetChange(key)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedPreset === key
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-1">{item.name}</div>
                <div className="text-[11px] text-slate-500 line-clamp-2 leading-tight">{item.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 12 Parameters Grid */}
        <div className="space-y-6 mb-8">
          {/* Group 1: Macronutrients (NPK) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FlaskConical size={16} className="text-emerald-600" />
              <span>{t('macronutrients', 'Primary Macronutrients (NPK)')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* N */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Available Nitrogen (N)</span>
                  {(() => {
                    const ev = evaluateParameter('n', soilValues.n)
                    return <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${ev.color}`}>{ev.label}</span>
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={soilValues.n}
                    onChange={(e) => handleValueChange('n', e.target.value)}
                    className="w-24 text-lg font-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">kg/ha</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">SHC Benchmark: 280 – 560 kg/ha</div>
              </div>

              {/* P */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Available Phosphorus (P)</span>
                  {(() => {
                    const ev = evaluateParameter('p', soilValues.p)
                    return <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${ev.color}`}>{ev.label}</span>
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={soilValues.p}
                    onChange={(e) => handleValueChange('p', e.target.value)}
                    className="w-24 text-lg font-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">kg/ha</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">SHC Benchmark: 10 – 25 kg/ha</div>
              </div>

              {/* K */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Available Potassium (K)</span>
                  {(() => {
                    const ev = evaluateParameter('k', soilValues.k)
                    return <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${ev.color}`}>{ev.label}</span>
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={soilValues.k}
                    onChange={(e) => handleValueChange('k', e.target.value)}
                    className="w-24 text-lg font-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">kg/ha</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">SHC Benchmark: 108 – 280 kg/ha</div>
              </div>
            </div>
          </div>

          {/* Group 2: Physicochemical Properties (pH, EC, SOC) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              <span>{t('physicochemical', 'Physicochemical Health & Carbon')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* pH */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Soil Reaction (pH)</span>
                  {(() => {
                    const ev = evaluateParameter('ph', soilValues.ph)
                    return <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${ev.color}`}>{ev.label}</span>
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={soilValues.ph}
                    onChange={(e) => handleValueChange('ph', e.target.value)}
                    className="w-24 text-lg font-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">pH</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">SHC Benchmark: 6.5 – 7.8 (Neutral)</div>
              </div>

              {/* EC */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Electrical Conductivity (EC)</span>
                  {(() => {
                    const ev = evaluateParameter('ec', soilValues.ec)
                    return <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${ev.color}`}>{ev.label}</span>
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={soilValues.ec}
                    onChange={(e) => handleValueChange('ec', e.target.value)}
                    className="w-24 text-lg font-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">dS/m</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">SHC Benchmark: &lt;1.0 dS/m (Safe)</div>
              </div>

              {/* OC */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Soil Organic Carbon (SOC)</span>
                  {(() => {
                    const ev = evaluateParameter('oc', soilValues.oc)
                    return <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${ev.color}`}>{ev.label}</span>
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={soilValues.oc}
                    onChange={(e) => handleValueChange('oc', e.target.value)}
                    className="w-24 text-lg font-black bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">% OC</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">SHC Benchmark: &gt;0.75% (Target)</div>
              </div>
            </div>
          </div>

          {/* Group 3: Micronutrients & Sulphur */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-600" />
              <span>{t('micronutrients', 'Secondary Nutrients & Micronutrients')}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { id: 's', label: 'Sulphur (S)', unit: 'ppm', threshold: '≥ 10' },
                { id: 'zn', label: 'Zinc (Zn)', unit: 'ppm', threshold: '≥ 0.6' },
                { id: 'fe', label: 'Iron (Fe)', unit: 'ppm', threshold: '≥ 4.5' },
                { id: 'cu', label: 'Copper (Cu)', unit: 'ppm', threshold: '≥ 0.2' },
                { id: 'mn', label: 'Manganese (Mn)', unit: 'ppm', threshold: '≥ 2.0' },
                { id: 'b', label: 'Boron (B)', unit: 'ppm', threshold: '≥ 0.5' },
              ].map(item => {
                const ev = evaluateParameter(item.id, soilValues[item.id])
                return (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 my-1">
                      <input
                        type="number"
                        step="0.01"
                        value={soilValues[item.id]}
                        onChange={(e) => handleValueChange(item.id, e.target.value)}
                        className="w-16 font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-slate-500">{item.unit}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${ev.color}`}>{ev.label}</span>
                      <span className="text-[9px] text-slate-400">{item.threshold}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actionable Regenerative Amendments */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Biological Soil Correction & Regenerative Roadmap
              </h2>
              <p className="text-xs text-slate-500">
                Tailored organic and biological interventions to restore soil fertility without chemical over-reliance.
              </p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <span>All 12 soil parameters are within optimal agronomic thresholds! Maintain organic matter additions to sustain biological vitality.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-slate-800">{rec.title}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mb-2 font-medium">
                    <strong>Action:</strong> {rec.action}
                  </p>
                  <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block">
                    <strong>Expected Benefit:</strong> {rec.benefit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
