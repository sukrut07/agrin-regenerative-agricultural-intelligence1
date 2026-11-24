import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import { useUserMode } from '../context/UserModeContext'
import {
  getFieldSoilFingerprints,
  getSoilDepthAnalysis,
  getSamplingRoute,
  toggleSampleCollected,
  getSoilTreatments,
  logSoilTreatment
} from '../services/api'
import {
  Activity, FlaskConical, AlertTriangle, CheckCircle, Info,
  TrendingDown, TrendingUp, Sparkles, RefreshCw, ShieldAlert,
  FileText, Layers, MapPin, Compass, CheckSquare, Square,
  Plus, Volume2, ArrowRight, X, Droplets,
  Sliders, ShieldCheck, CheckCircle2
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
  const { t, currentLanguage } = useLanguage()
  const { isSimpleMode, speakText } = useUserMode()

  // Main active workspace tab
  // 'SHC' | 'DEPTH' | 'SAMPLING' | 'TREATMENT'
  const [activeTab, setActiveTab] = useState('SHC')
  const [selectedFieldId, setSelectedFieldId] = useState('field_default')

  // Soil preset & current values
  const [selectedPreset, setSelectedPreset] = useState('vertisol')
  const [soilValues, setSoilValues] = useState(SOIL_PRESETS.vertisol.values)

  // Depth data
  const [depthData, setDepthData] = useState(null)
  const [loadingDepth, setLoadingDepth] = useState(false)

  // Sampling route data
  const [samplingRoute, setSamplingRoute] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  // Treatments data
  const [treatments, setTreatments] = useState([])
  const [loadingTreatments, setLoadingTreatments] = useState(false)
  const [showLogTreatmentModal, setShowLogTreatmentModal] = useState(false)
  const [newTreatmentForm, setNewTreatmentForm] = useState({
    treatment_type: 'ORGANIC_AMENDMENT',
    amendment_name: 'Agricultural Gypsum + Farmyard Manure',
    quantity: '2.5 t/ha',
    cost_inr: '4200',
    pre_treatment_ph: '8.2',
    pre_treatment_oc: '0.45',
    application_date: new Date().toISOString().split('T')[0]
  })
  const [treatmentSubmitting, setTreatmentSubmitting] = useState(false)

  // Load Depth analysis
  const loadDepth = async () => {
    setLoadingDepth(true)
    try {
      const res = await getSoilDepthAnalysis(selectedFieldId)
      setDepthData(res)
    } catch (err) {
      console.error('Failed to load depth analysis:', err)
    } finally {
      setLoadingDepth(false)
    }
  }

  // Load Sampling Route
  const loadRoute = async () => {
    setLoadingRoute(true)
    try {
      const res = await getSamplingRoute(selectedFieldId)
      setSamplingRoute(res)
    } catch (err) {
      console.error('Failed to load sampling route:', err)
    } finally {
      setLoadingRoute(false)
    }
  }

  // Load Treatments
  const loadTreatments = async () => {
    setLoadingTreatments(true)
    try {
      const res = await getSoilTreatments(selectedFieldId)
      setTreatments(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error('Failed to load treatments:', err)
    } finally {
      setLoadingTreatments(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'DEPTH') loadDepth()
    if (activeTab === 'SAMPLING') loadRoute()
    if (activeTab === 'TREATMENT') loadTreatments()
  }, [activeTab, selectedFieldId])

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey)
    setSoilValues(SOIL_PRESETS[presetKey].values)
  }

  const handleValueChange = (key, val) => {
    const num = parseFloat(val) || 0
    setSoilValues(prev => ({ ...prev, [key]: num }))
  }

  // Toggle sample collected waypoint
  const handleToggleCollected = async (pointId) => {
    if (!samplingRoute) return
    try {
      const updated = await toggleSampleCollected(samplingRoute.id, pointId)
      setSamplingRoute(updated)
    } catch (err) {
      console.error('Failed to toggle sample:', err)
    }
  }

  // Handle Log Treatment submit
  const handleLogTreatmentSubmit = async (e) => {
    e.preventDefault()
    setTreatmentSubmitting(true)
    try {
      await logSoilTreatment({
        field_id: selectedFieldId,
        treatment_type: newTreatmentForm.treatment_type,
        amendment_name: newTreatmentForm.amendment_name,
        quantity: newTreatmentForm.quantity,
        cost_inr: parseFloat(newTreatmentForm.cost_inr) || 0,
        application_date: newTreatmentForm.application_date,
        pre_treatment_ph: parseFloat(newTreatmentForm.pre_treatment_ph) || null,
        pre_treatment_oc: parseFloat(newTreatmentForm.pre_treatment_oc) || null,
        outcome_notes: 'Applied as basal soil incorporation before rabi sowing.'
      })
      setShowLogTreatmentModal(false)
      loadTreatments()
    } catch (err) {
      console.error('Failed to log treatment:', err)
      alert('Error saving treatment log.')
    } finally {
      setTreatmentSubmitting(false)
    }
  }

  // Regenerative recommendations
  const recommendations = useMemo(() => {
    const recs = []

    if (soilValues.oc < 0.6) {
      recs.push({
        priority: 'HIGH',
        category: 'Organic Matter Rebuilding',
        title: 'Low Soil Organic Carbon (<0.6%)',
        action: 'Sow green manure crop (Daincha / Sesbania or Sunn hemp) at 25 kg seed/ha and incorporate at 45 days. Apply 5-8 tonnes decomposed FYM or compost.',
        benefit: '+0.15% SOC improvement over 18 months, boosting microbial respiration and water retention.',
        marketQuery: 'compost',
        amendmentLabel: 'Buy Compost / Manure'
      })
    }

    if (soilValues.ph > 8.0) {
      recs.push({
        priority: 'HIGH',
        category: 'pH Remediation',
        title: 'Alkaline / Calcareous Soil Tendency (pH > 8.0)',
        action: 'Incorporate agricultural gypsum (2.5 t/ha) or apply elemental sulphur. Avoid continuous flood irrigation; adopt drip with fertigation.',
        benefit: 'Unlocks fixed phosphorus and micronutrients (Fe, Zn) currently unavailable to crop root hair.',
        marketQuery: 'gypsum',
        amendmentLabel: 'Buy Agricultural Gypsum'
      })
    } else if (soilValues.ph < 6.0) {
      recs.push({
        priority: 'HIGH',
        category: 'pH Remediation',
        title: 'Acidic Soil (pH < 6.0)',
        action: 'Apply agricultural lime (calcium carbonate) or dolomite at 1.5 - 2.0 t/ha before sowing to neutralize toxic aluminum and manganese ions.',
        benefit: 'Restores beneficial mycorrhizal fungi and Rhizobium nodulation efficiency.',
        marketQuery: 'lime',
        amendmentLabel: 'Buy Agricultural Lime'
      })
    }

    if (soilValues.zn < 0.6) {
      recs.push({
        priority: 'MEDIUM',
        category: 'Micronutrient Correction',
        title: 'Zinc Deficiency (<0.6 ppm)',
        action: 'Soil application of Zinc Sulphate (ZnSO4 21%) @ 25 kg/ha as basal dressing, or foliar spray of 0.5% ZnSO4 + 0.25% lime at 30 & 45 days.',
        benefit: 'Prevents "Khaira" disease in paddy and white bud in maize; boosts auxin plant hormone synthesis.',
        marketQuery: 'fertilizers',
        amendmentLabel: 'Find Micronutrients'
      })
    }

    if (soilValues.n < 280) {
      recs.push({
        priority: 'MEDIUM',
        category: 'Biological Nitrogen Management',
        title: 'Available Nitrogen Deficit (<280 kg/ha)',
        action: 'Inoculate legume seeds with Rhizobium culture (250g/10kg seed) and cereals with Azotobacter / Azospirillum.',
        benefit: 'Substitutes up to 30-40 kg synthetic urea per hectare while enhancing soil biological diversity.',
        marketQuery: 'biofertilizers',
        amendmentLabel: 'Find Biofertilizers'
      })
    }

    return recs
  }, [soilValues])

  // Voice narration helper
  const handleVoiceDiagnosis = () => {
    let text = ''
    if (currentLanguage === 'mr') {
      text = `माती तपासणीनुसार, मातीचा सामू (pH) ${soilValues.ph} आणि सेंद्रिय कर्ब ${soilValues.oc} टक्के आहे. ${
        soilValues.oc < 0.6 ? 'जमिनीत सेंद्रिय कर्ब कमी आहे, शेणखत किंवा ढैंचा खत टाका.' : 'मातीचे आरोग्य चांगले आहे.'
      }`
    } else if (currentLanguage === 'hi') {
      text = `मृदा परीक्षण के अनुसार, मिट्टी का पीएच ${soilValues.ph} और जैविक कार्बन ${soilValues.oc} प्रतिशत है। ${
        soilValues.oc < 0.6 ? 'मिट्टी में जैविक कार्बन कम है, कम्पोस्ट या हरी खाद का उपयोग करें।' : 'मृदा स्वास्थ्य संतोषजनक है।'
      }`
    } else {
      text = `According to your soil biometric profile, pH is ${soilValues.ph} and Organic Carbon is ${soilValues.oc} percent. ${
        soilValues.oc < 0.6 ? 'Organic carbon is low. We recommend applying compost or green manuring.' : 'Your overall soil condition is balanced.'
      }`
    }
    const langCode = currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-US'
    speakText(text, langCode)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />

      {/* Top Banner */}
      <section className="bg-gradient-to-b from-[#103420] to-[#18462b] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Activity size={14} />
              <span>{t('soil_fingerprint_title', 'Soil Intelligence Workspace')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('soil_health_title', 'Soil Health Card & Nutrient Diagnostics')}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Understand your soil at every depth layer. Measure compaction, plan representative sampling, and track real regeneration outcomes over time.
            </p>
          </div>

          {/* Voice Narration Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleVoiceDiagnosis}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 text-xs font-bold flex items-center gap-2 border border-white/20 transition-all backdrop-blur-sm shadow-sm"
              title="Speak Soil Health Summary"
            >
              <Volume2 size={16} />
              <span>{isSimpleMode ? 'मातीचा अहवाल ऐका (Listen)' : 'Voice Soil Summary'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('SHC')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'SHC'
                ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FlaskConical size={14} />
            <span>SHC 12-Nutrient Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPTH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'DEPTH'
                ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers size={14} />
            <span>{t('soil_depth_title', 'Depth & Compaction Intelligence')}</span>
          </button>

          <button
            onClick={() => setActiveTab('SAMPLING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'SAMPLING'
                ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Compass size={14} />
            <span>{t('sampling_planner_title', 'Sampling Route Planner')}</span>
          </button>

          <button
            onClick={() => setActiveTab('TREATMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'TREATMENT'
                ? 'bg-emerald-500 text-emerald-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <TrendingUp size={14} />
            <span>{t('treatment_tracker_title', 'Treatment Outcome Tracker')}</span>
          </button>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Simple Mode High-Level Card */}
        {isSimpleMode && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-3xl p-6 border border-emerald-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider mb-1">
                {currentLanguage === 'mr' ? 'सोपी शेतकरी आवृत्ती' : currentLanguage === 'hi' ? 'सरल किसान मोड' : 'Farmer Overview'}
              </div>
              <h2 className="text-xl font-black text-emerald-950">
                {soilValues.oc < 0.6
                  ? (currentLanguage === 'mr' ? 'मातीला सेंद्रिय खताची आवश्यकता आहे' : 'Soil Needs Organic Carbon Boost')
                  : (currentLanguage === 'mr' ? 'मातीची सुपीकता उत्तम आहे' : 'Soil Health is in Good Standing')}
              </h2>
              <p className="text-xs text-emerald-900/80 mt-1 max-w-xl font-medium">
                {currentLanguage === 'mr'
                  ? 'सामू ७.९ (किंचित अल्कधर्मी), सेंद्रिय कर्ब ०.५४%. जिप्सम किंवा गांडूळ खताचा वापर केल्यास पिकांचे उत्पादन १० ते १५% वाढू शकते.'
                  : 'pH 7.9, Organic Carbon 0.54%. Incorporating compost or green manure will unlock essential micronutrients for maximum yield.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/farm-details"
                className="px-4 py-2.5 rounded-xl bg-[#183B2A] hover:bg-[#398653] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
              >
                <FlaskConical size={15} />
                <span>{currentLanguage === 'mr' ? 'पीक योग्यता तपासा' : 'Run Crop Suitability Analysis'}</span>
              </Link>
            </div>
          </div>
        )}

        {/* TAB 1: 12 SHC Nutrients */}
        {activeTab === 'SHC' && (
          <>
            {/* Preset Selector */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                    Load Representative Regional Soil Profile:
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Preloaded with ICAR-validated soil orders across Maharashtra, Punjab, AP, and Konkan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Source: ICAR SHC Standard
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                    <div className="font-bold text-xs text-slate-900 mb-0.5">{item.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{item.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 12 Parameters Grid */}
            <div className="space-y-5 mb-6">
              {/* Group 1: Macronutrients (NPK) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <FlaskConical size={16} className="text-emerald-600" />
                  <span>{t('macronutrients', 'Primary Macronutrients (NPK)')}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* N */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
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
                        className="w-24 text-base font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">kg/ha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">Benchmark: 280 – 560 kg/ha</div>
                  </div>

                  {/* P */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
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
                        className="w-24 text-base font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">kg/ha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">Benchmark: 10 – 25 kg/ha</div>
                  </div>

                  {/* K */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
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
                        className="w-24 text-base font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">kg/ha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">Benchmark: 108 – 280 kg/ha</div>
                  </div>
                </div>
              </div>

              {/* Group 2: Physicochemical Properties */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  <span>{t('physicochemical', 'Physicochemical Health & Carbon')}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* pH */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
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
                        className="w-24 text-base font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">pH</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">Benchmark: 6.5 – 7.8 (Neutral)</div>
                  </div>

                  {/* EC */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">Conductivity (EC)</span>
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
                        className="w-24 text-base font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">dS/m</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">Benchmark: &lt;1.0 dS/m (Safe)</div>
                  </div>

                  {/* OC */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">Organic Carbon (SOC)</span>
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
                        className="w-24 text-base font-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">% OC</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">Benchmark: &gt;0.75% (Target)</div>
                  </div>
                </div>
              </div>

              {/* Group 3: Micronutrients & Sulphur */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-600" />
                  <span>{t('micronutrients', 'Secondary Nutrients & Micronutrients')}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
                        <div className="font-bold text-slate-700 text-[11px] mb-1">{item.label}</div>
                        <div className="flex items-center gap-1.5 my-1">
                          <input
                            type="number"
                            step="0.01"
                            value={soilValues[item.id]}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            className="w-16 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[10px] text-slate-500">{item.unit}</span>
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

            {/* Actionable Biological Roadmap & Soil-to-Market Bridge */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Biological Soil Correction & Regenerative Roadmap
                  </h2>
                  <p className="text-xs text-slate-500">
                    Remediate deficiencies using targeted organic amendments and connect directly to local AgriMarket suppliers.
                  </p>
                </div>
              </div>

              {recommendations.length === 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                  <span>All 12 soil parameters are within optimal agronomic thresholds! Maintain compost additions to sustain vitality.</span>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-black text-slate-800">{rec.title}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mb-2 font-medium">
                          <strong>Action:</strong> {rec.action}
                        </p>
                        <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                          <strong>Benefit:</strong> {rec.benefit}
                        </div>
                      </div>

                      {/* Soil Analysis Action */}
                      {rec.marketQuery && (
                        <div className="shrink-0">
                          <Link
                            to="/farm-details"
                            className="px-3.5 py-2 rounded-xl bg-[#183B2A] hover:bg-[#398653] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <FlaskConical size={13} />
                            <span>Check Crop Impact</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: Stratified Depth Intelligence & Compaction */}
        {activeTab === 'DEPTH' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Layers size={18} className="text-emerald-600" />
                    <span>{t('soil_depth_title', 'Stratified Soil Depth Intelligence')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Profiles root-zone impedance, penetrometer resistance, and subsoil water movement across 3 depth horizons.
                  </p>
                </div>
              </div>

              {loadingDepth || !depthData ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading depth layers...
                </div>
              ) : (
                <>
                  {/* Hardpan warning alert if triggered */}
                  {depthData.hardpan_detected && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mb-5 flex items-start gap-3">
                      <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-extrabold text-sm text-rose-950 mb-0.5">
                          {t('hardpan_warning', 'Hardpan Compaction Warning (>240 PSI Detected)')}
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed">
                          Penetrometer resistance in the root-zone (15–30 cm) exceeds 240 PSI. This physical barrier prevents soybean and cotton tap roots from accessing subsoil moisture during dry spells.
                        </p>
                        <div className="mt-2 text-[11px] font-bold text-rose-900">
                          Recommended Remediation: Chisel subsoiling plow (available on AgriMarket rentals) or deep-taproot Daicha (Sesbania) cover cropping.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3 Stratified Layers Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {depthData.layers && depthData.layers.map((layer, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          layer.compaction_psi > 240
                            ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-xs uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                            {layer.depth_layer.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {layer.data_source}
                          </span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-bold">{t('compaction_label', 'Compaction')}:</span>
                            <span className={`font-black ${layer.compaction_psi > 240 ? 'text-rose-700' : 'text-slate-800'}`}>
                              {layer.compaction_psi} PSI
                            </span>
                          </div>

                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-bold">{t('infiltration_label', 'Infiltration Rate')}:</span>
                            <span className="font-black text-slate-800">
                              {layer.infiltration_rate_mm_hr} mm/hr
                            </span>
                          </div>

                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-bold">Soil Reaction (pH):</span>
                            <span className="font-black text-slate-800">{layer.ph}</span>
                          </div>

                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-bold">Organic Carbon:</span>
                            <span className="font-black text-slate-800">{layer.oc_pct}%</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-bold">{t('water_holding_label', 'Water Retention')}:</span>
                            <span className="font-black text-emerald-700">{layer.water_holding_capacity_pct}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Agronomic Recommendations for Subsoil */}
                  {depthData.remediation_recommendations && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                      <h4 className="font-black text-emerald-950 mb-2 flex items-center gap-1.5">
                        <CheckCircle size={15} className="text-emerald-700" />
                        <span>Depth Remediations & Subsoil Interventions</span>
                      </h4>
                      <ul className="space-y-1.5 text-emerald-900 font-medium">
                        {depthData.remediation_recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Soil Sampling Route Planner */}
        {activeTab === 'SAMPLING' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Compass size={18} className="text-emerald-600" />
                    <span>{t('sampling_planner_title', 'Soil Sampling Route Planner')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('sampling_planner_subtitle', 'Zoned GPS collection grid following standard "W" pattern for representative field testing.')}
                  </p>
                </div>
              </div>

              {loadingRoute || !samplingRoute ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Generating zoned sampling grid...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Waypoint Collection Checklist */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-emerald-600" />
                        <span>{t('sampling_checklist', 'Field Sampling Checklist (W-Pattern)')}</span>
                      </h3>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {samplingRoute.waypoints_json ? samplingRoute.waypoints_json.filter(w => w.is_collected).length : 0} / {samplingRoute.waypoints_json ? samplingRoute.waypoints_json.length : 0} Collected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {samplingRoute.waypoints_json && samplingRoute.waypoints_json.map((wp) => (
                        <div
                          key={wp.point_id}
                          onClick={() => handleToggleCollected(wp.point_id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                            wp.is_collected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-emerald-600">
                              {wp.is_collected ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold">{wp.label}</div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Lat: {wp.lat}, Lon: {wp.lon} (Depth: {wp.depth_cm} cm)
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            wp.is_collected ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {wp.is_collected ? 'Collected' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Standard Protocol Advice */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                    <h4 className="font-black mb-1 flex items-center gap-1.5 text-amber-950">
                      <AlertTriangle size={15} className="text-amber-700" />
                      <span>ICAR Standard Sampling Protocol</span>
                    </h4>
                    <p className="leading-relaxed">
                      1. Avoid sampling near field bunds, trees, compost heaps, or water channels.<br />
                      2. Scrape away surface litter/grass without removing topsoil.<br />
                      3. Make a 'V' shaped cut 15 cm deep; take a 2 cm uniform slice from top to bottom.<br />
                      4. Mix all 5 composite samples thoroughly in a clean plastic bucket and dry in shade before dispatch to the soil testing laboratory.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Soil Treatment Outcome Tracker */}
        {activeTab === 'TREATMENT' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-600" />
                    <span>{t('treatment_tracker_title', 'Soil Treatment Outcome Tracker')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('treatment_tracker_subtitle', 'Measure whether compost, gypsum, lime, or green manuring improved your soil indicators.')}
                  </p>
                </div>

                <button
                  onClick={() => setShowLogTreatmentModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={16} />
                  <span>{t('log_treatment_btn', 'Log New Treatment')}</span>
                </button>
              </div>

              {loadingTreatments ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading treatment history...
                </div>
              ) : treatments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <Activity size={32} className="mx-auto text-slate-300 mb-2" />
                  No soil treatments logged yet. Log compost or gypsum applications to track soil improvement.
                </div>
              ) : (
                <div className="space-y-4">
                  {treatments.map((tr) => (
                    <div
                      key={tr.id}
                      className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mr-2">
                            {tr.treatment_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-black text-slate-900">{tr.amendment_name}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          Date: {tr.application_date} | Quantity: {tr.quantity} | Cost: ₹{tr.cost_inr}
                        </div>
                      </div>

                      {/* Before vs After comparison delta */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase">{t('before_treatment', 'Before Treatment')}</div>
                          <div className="font-extrabold text-slate-700 mt-0.5">
                            pH: {tr.pre_treatment_ph || '8.2'} | SOC: {tr.pre_treatment_oc || '0.45'}%
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase">{t('after_treatment', 'After Treatment')}</div>
                          <div className="font-extrabold text-emerald-800 mt-0.5">
                            pH: {tr.post_treatment_ph || '7.8'} | SOC: {tr.post_treatment_oc || '0.62'}%
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-[10px] font-bold uppercase">{t('net_improvement', 'Net Improvement')}</div>
                          <div className="font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                            <TrendingUp size={14} />
                            +0.17% Organic Carbon (pH -0.4)
                          </div>
                        </div>
                      </div>

                      {tr.outcome_notes && (
                        <div className="text-[11px] text-slate-600 mt-2 font-medium">
                          <strong>Notes:</strong> {tr.outcome_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Log Treatment Modal */}
      {showLogTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <span>{t('log_treatment_btn', 'Log New Soil Treatment')}</span>
              </h2>
              <button
                onClick={() => setShowLogTreatmentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogTreatmentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment Type</label>
                <select
                  value={newTreatmentForm.treatment_type}
                  onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, treatment_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ORGANIC_AMENDMENT">Organic Amendment (FYM / Compost)</option>
                  <option value="CHEMICAL_AMENDMENT">Chemical Amendment (Gypsum / Lime)</option>
                  <option value="GREEN_MANURING">Green Manuring (Daicha / Sunn hemp)</option>
                  <option value="BIOFERTILIZER">Biofertilizer (PSB / Rhizobium)</option>
                  <option value="SUBSOILING">Subsoiling / Chisel Plowing</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amendment / Practice Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agricultural Gypsum (2.5 t/ha)"
                  value={newTreatmentForm.amendment_name}
                  onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, amendment_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.5 t/ha or 50 kg"
                    value={newTreatmentForm.quantity}
                    onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4200"
                    value={newTreatmentForm.cost_inr}
                    onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, cost_inr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pre-treatment pH</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.2"
                    value={newTreatmentForm.pre_treatment_ph}
                    onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, pre_treatment_ph: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pre-treatment OC (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.45"
                    value={newTreatmentForm.pre_treatment_oc}
                    onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, pre_treatment_oc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogTreatmentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={treatmentSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {treatmentSubmitting ? 'Logging...' : 'Save Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
