import React, { useState, useMemo } from 'react'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import {
  Calendar, Sprout, ArrowRight, Sparkles, Droplets,
  ShieldCheck, RefreshCw, Layers, CheckCircle2, AlertCircle, Info, Zap
} from 'lucide-react'

// Predefined rotation templates backed by ICAR agronomic research
const ROTATION_PATTERNS = [
  {
    id: 'cotton_chickpea_sesame',
    name: 'Cotton → Chickpea → Sesame / Mung',
    soil_type: 'Medium to Deep Black Vertisol',
    region: 'Maharashtra, Gujarat, MP (Central India)',
    seasons: [
      {
        season: 'Kharif (Monsoon)',
        crop: 'Cotton (कपास)',
        type: 'Exhaustive Fiber',
        water_mm: 750,
        nitrogen_balance: -80,
        soil_impact: 'High nutrient uptake, tap root opens subsoil'
      },
      {
        season: 'Rabi (Winter)',
        crop: 'Chickpea (चना / हरभरा)',
        type: 'Legume / N-Fixing',
        water_mm: 350,
        nitrogen_balance: +65,
        soil_impact: 'Fixes atmospheric N (60-70 kg N/ha credit), mobilizes soil P'
      },
      {
        season: 'Zaid (Summer)',
        crop: 'Green Gram / Sesame (मूंग / तीळ)',
        type: 'Short Cover Pulse',
        water_mm: 280,
        nitrogen_balance: +35,
        soil_impact: 'Summer ground cover, prevents soil baking, adds organic biomass'
      }
    ],
    net_n_credit: '+20 kg N/ha (Net positive)',
    water_saving_pct: '28% reduction vs continuous cotton-wheat',
    disease_break: 'Breaks Cotton Root Rot & Wilt lifecycle',
    carbon_sequestration: '+0.85 t CO2e/ha/yr'
  },
  {
    id: 'paddy_mustard_mung',
    name: 'Paddy → Mustard → Summer Mung',
    soil_type: 'Alluvial Loam',
    region: 'Punjab, Haryana, UP, Bihar (Indo-Gangetic)',
    seasons: [
      {
        season: 'Kharif (Monsoon)',
        crop: 'Paddy / Basmati (चावल)',
        type: 'Cereal (High Water)',
        water_mm: 1200,
        nitrogen_balance: -110,
        soil_impact: 'Anaerobic puddling depletes soil aeration'
      },
      {
        season: 'Rabi (Winter)',
        crop: 'Mustard (सरसों / मोहरी)',
        type: 'Oilseed',
        water_mm: 380,
        nitrogen_balance: -30,
        soil_impact: 'Deep taproot scavenges residual nitrates; glucosinolates suppress nematodes'
      },
      {
        season: 'Zaid (Summer)',
        crop: 'Green Gram (मूंग)',
        type: 'Legume Green Manure',
        water_mm: 250,
        nitrogen_balance: +75,
        soil_impact: 'Restores soil microbial flora after intensive paddy cycle'
      }
    ],
    net_n_credit: '-65 kg N/ha (Requires minimal basal starter only)',
    water_saving_pct: '35% less water than Paddy-Wheat-Maize',
    disease_break: 'Suppresses root-knot nematodes via biofumigation',
    carbon_sequestration: '+1.10 t CO2e/ha/yr'
  },
  {
    id: 'soybean_wheat_cowpea',
    name: 'Soybean → Wheat → Cowpea (Fodder)',
    soil_type: 'Black / Red Loam',
    region: 'Madhya Pradesh, Maharashtra, Rajasthan',
    seasons: [
      {
        season: 'Kharif (Monsoon)',
        crop: 'Soybean (सोयाबीन)',
        type: 'Oilseed Legume',
        water_mm: 500,
        nitrogen_balance: +45,
        soil_impact: 'Symbiotic nodulation fixes N; leaf fall enriches humus'
      },
      {
        season: 'Rabi (Winter)',
        crop: 'Wheat (गेहूं)',
        type: 'Cereal (Exhaustive)',
        water_mm: 450,
        nitrogen_balance: -90,
        soil_impact: 'Utilizes biological N left by soybean; high straw residue'
      },
      {
        season: 'Zaid (Summer)',
        crop: 'Cowpea (चवळी / लोबिया)',
        type: 'Cover & Fodder Legume',
        water_mm: 220,
        nitrogen_balance: +55,
        soil_impact: 'Complete ground shade, prevents soil erosion, 4 t biomass returned'
      }
    ],
    net_n_credit: '+10 kg N/ha (Self-sustaining N balance)',
    water_saving_pct: '22% water efficiency gain',
    disease_break: 'Prevents wheat rust buildup and cereal cyst nematodes',
    carbon_sequestration: '+1.25 t CO2e/ha/yr'
  },
  {
    id: 'maize_chickpea_sunflower',
    name: 'Maize → Chickpea → Sunflower',
    soil_type: 'Red Sandy Loam / Alfisols',
    region: 'Karnataka, Andhra Pradesh, Telangana',
    seasons: [
      {
        season: 'Kharif (Monsoon)',
        crop: 'Maize (मक्का)',
        type: 'Cereal (High Biomass)',
        water_mm: 550,
        nitrogen_balance: -100,
        soil_impact: 'Leaves high root biomass, requires balanced potash'
      },
      {
        season: 'Rabi (Winter)',
        crop: 'Chickpea (चना)',
        type: 'Grain Legume',
        water_mm: 320,
        nitrogen_balance: +60,
        soil_impact: 'Enriches nitrogen, low irrigation requirement'
      },
      {
        season: 'Zaid (Summer)',
        crop: 'Sunflower (सूर्यमुखी)',
        type: 'Deep Rooted Oilseed',
        water_mm: 380,
        nitrogen_balance: -20,
        soil_impact: 'Deep roots extract nutrients below the plow layer'
      }
    ],
    net_n_credit: '-60 kg N/ha (Balanced fertilizer savings)',
    water_saving_pct: '30% savings vs double cereal rotation',
    disease_break: 'Disrupts Maize Fall Armyworm pupae in soil',
    carbon_sequestration: '+0.95 t CO2e/ha/yr'
  }
]

export default function CropPlanner() {
  const { t } = useLanguage()
  const [selectedPlanId, setSelectedPlanId] = useState(ROTATION_PATTERNS[0].id)
  const [farmSoil, setFarmSoil] = useState('Medium Black Vertisol')
  const [irrigationStatus, setIrrigationStatus] = useState('Drip / Micro-irrigation')

  const activePlan = useMemo(() => {
    return ROTATION_PATTERNS.find(p => p.id === selectedPlanId) || ROTATION_PATTERNS[0]
  }, [selectedPlanId])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HeaderNav />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#103420] to-[#18462b] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Calendar size={14} />
            <span>3-Season Regenerative Rotation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t('crop_planner_title', 'Multi-Season Crop Rotation Optimizer')}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            {t('crop_planner_subtitle', 'Plan nutrient-balancing rotations over 3 seasons to minimize chemical fertilizer, break pest cycles, and rebuild soil organic carbon.')}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls: Template Selector & Farm Params */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Rotation Selector */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers size={16} className="text-emerald-600" />
                <span>Select Proven ICAR Rotation Blueprint:</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Scientific Agro-ecological Zones
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROTATION_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    selectedPlanId === p.id
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-1 flex items-center justify-between">
                    <span>{p.name}</span>
                    {selectedPlanId === p.id && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{p.region}</div>
                  <div className="text-[10px] text-emerald-800 font-semibold mt-1 bg-white px-2 py-0.5 rounded inline-block border border-slate-100">
                    {p.soil_type}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Farm Setup Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>Field Conditions</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Current Soil Order</label>
              <select
                value={farmSoil}
                onChange={(e) => setFarmSoil(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Medium Black Vertisol">Medium Black Soil (Vertisol - 60% clay)</option>
                <option value="Alluvial Loam">Indo-Gangetic Alluvial Loam</option>
                <option value="Red Sandy Loam">Red Sandy Loam (Alfisol)</option>
                <option value="Laterite Acidic">Laterite Acidic Soil (pH 5.2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Water Source / Method</label>
              <select
                value={irrigationStatus}
                onChange={(e) => setIrrigationStatus(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Drip / Micro-irrigation">Drip / Micro-irrigation (High efficiency)</option>
                <option value="Canal / Flood">Canal Surface Irrigation</option>
                <option value="Borewell Sprinkler">Borewell Sprinkler</option>
                <option value="Rainfed Only">Rainfed Only (Monsoon dependent)</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
              <strong>Agronomic Rule:</strong> Never rotate cereal after cereal (e.g. Maize → Wheat) without an intervening pulse or green manure. Continuous cereals exhaust nitrogen and foster stubborn root fungal pathogens.
            </div>
          </div>
        </div>

        {/* 3-Season Visual Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Active 1-Year Rotation Cycle: <span className="text-emerald-700">{activePlan.name}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Agro-climatic Zone: {activePlan.region}
              </p>
            </div>

            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto border border-emerald-200">
              {activePlan.net_n_credit}
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {activePlan.seasons.map((item, idx) => {
              const isPositiveN = item.nitrogen_balance > 0
              return (
                <div
                  key={idx}
                  className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 transition-all relative flex flex-col justify-between"
                >
                  {/* Step header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Season {idx + 1}: {item.season}
                      </span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${
                        isPositiveN ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.nitrogen_balance > 0 ? `+${item.nitrogen_balance}` : item.nitrogen_balance} kg N/ha
                      </span>
                    </div>

                    <div className="flex items-start gap-3 my-3">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-700 font-black shrink-0">
                        <Sprout size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{item.crop}</h3>
                        <div className="text-[11px] text-slate-500 font-semibold">{item.type}</div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2 text-xs mt-4">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <Droplets size={13} className="text-cyan-600" />
                          <span>Estimated Water:</span>
                        </span>
                        <span className="font-bold text-slate-800">{item.water_mm} mm</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Soil & Root Impact:</span>
                        <span className="text-[11px] text-slate-700 leading-snug block">{item.soil_impact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seasonal Tip */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-600 shrink-0" />
                    <span>{idx === 1 ? 'Peak atmospheric nitrogen fixation window' : idx === 2 ? 'Cover crop prevents soil moisture loss' : 'Deep soil aeration phase'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scientific Impact & Carbon Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Water Balance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
              <Droplets size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Water Budget Optimization</h3>
            <div className="text-2xl font-black text-cyan-600 mb-1">{activePlan.water_saving_pct}</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Balancing high-water Kharif crops with drought-hardy legumes prevents underground aquifer depletion and optimizes surface moisture.
            </p>
          </div>

          {/* Card 2: Pest & Disease Interruption */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Pest & Pathogen Break</h3>
            <div className="text-sm font-black text-amber-800 mb-1">{activePlan.disease_break}</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interrupting continuous monoculture removes the biological host plant, starving target pest larvae and soil nematodes without pesticides.
            </p>
          </div>

          {/* Card 3: Carbon Sequestration */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Soil Carbon Sequestration</h3>
            <div className="text-2xl font-black text-emerald-600 mb-1">{activePlan.carbon_sequestration}</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Roots remaining in soil plus summer legume biomass convert atmospheric carbon into stable humus, building long-term drought resilience.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
