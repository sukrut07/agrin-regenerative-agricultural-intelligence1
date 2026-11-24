import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import { getCropCatalogue, getCropCategories } from '../services/api'
import {
  Search, Filter, Sprout, Droplets, Calendar, Sparkles,
  ChevronRight, ShieldCheck, MapPin, Layers, Award, Info, X
} from 'lucide-react'

export default function CropExplorer() {
  const { t, language } = useLanguage()
  const [crops, setCrops] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSeason, setSelectedSeason] = useState('all')
  const [selectedState, setSelectedState] = useState('all')
  const [selectedCropModal, setSelectedCropModal] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [catData, cropData] = await Promise.all([
          getCropCategories(),
          getCropCatalogue()
        ])
        setCategories(catData.categories || [])
        setCrops(cropData.crops || [])
      } catch (err) {
        console.error('Failed to load crop catalogue:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter crops
  const filteredCrops = useMemo(() => {
    return crops.filter(c => {
      // Category filter
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false

      // Season filter
      if (selectedSeason !== 'all') {
        const seasons = c.seasons || [c.season]
        if (!seasons.includes(selectedSeason) && c.season !== selectedSeason) return false
      }

      // State filter
      if (selectedState !== 'all') {
        if (!c.major_states?.includes(selectedState)) return false
      }

      // Search query (English, Hindi, Marathi, scientific name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = c.name?.toLowerCase().includes(q)
        const matchHindi = c.hindi_name?.toLowerCase().includes(q)
        const matchMarathi = c.marathi_name?.toLowerCase().includes(q)
        const matchSci = c.scientific_name?.toLowerCase().includes(q)
        const matchCat = c.category?.toLowerCase().includes(q)
        if (!matchName && !matchHindi && !matchMarathi && !matchSci && !matchCat) {
          return false
        }
      }

      return true
    })
  }, [crops, selectedCategory, selectedSeason, selectedState, searchQuery])

  // Extract unique states for filter
  const allStates = useMemo(() => {
    const s = new Set()
    crops.forEach(c => (c.major_states || []).forEach(st => s.add(st)))
    return Array.from(s).sort()
  }, [crops])

  const getCropDisplayName = (crop) => {
    if (language === 'hi' && crop.hindi_name) return crop.hindi_name
    if (language === 'mr' && crop.marathi_name) return crop.marathi_name
    return crop.name
  }

  const getCategoryLabel = (catId) => {
    const key = `cat_${catId}`
    return t(key, catId.charAt(0).toUpperCase() + catId.slice(1))
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#171814]">
      <HeaderNav />

      {/* Hero Header */}
      <section className="bg-[#183B2A] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#E5E5DC]/15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7D927] text-xs font-semibold mb-3 border border-white/15">
                <Sprout size={14} />
                <span>65+ ICAR-Benchmarked Crops Across 15 Agro-Climatic Zones</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {t('crop_explorer_title', 'Pan-India Crop Knowledge Explorer')}
              </h1>
              <p className="text-[#F7F7F2]/80 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {t('crop_explorer_subtitle', 'Explore scientific agronomic bounds, soil compatibility, water needs, and regenerative benefits for crops across India.')}
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-2xl border border-white/15 self-start md:self-auto">
              <div className="text-center px-3 border-r border-white/15">
                <div className="text-2xl font-black text-[#E7D927] font-mono-num">{crops.length || 65}</div>
                <div className="text-[11px] text-[#F7F7F2]/80 font-medium">Total Crops</div>
              </div>
              <div className="text-center px-3 border-r border-white/15">
                <div className="text-2xl font-black text-[#E7D927] font-mono-num">{categories.length || 9}</div>
                <div className="text-[11px] text-[#F7F7F2]/80 font-medium">Categories</div>
              </div>
              <div className="text-center px-3">
                <div className="text-2xl font-black text-white font-mono-num">100%</div>
                <div className="text-[11px] text-[#F7F7F2]/80 font-medium">Verified ICAR</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-3xl">
            <Search className="absolute left-4 top-3.5 text-emerald-300/70" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_crop_placeholder', 'Search crop by English, Hindi, or Marathi name...')}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-emerald-300 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-8 space-y-4">
          {/* Category Chips */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={14} />
              <span>Category Filter</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('filter_all_categories', 'All Categories')} ({crops.length})
              </button>
              {categories.map(cat => {
                const count = crops.filter(c => c.category === cat.id).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {getCategoryLabel(cat.id)} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Secondary Filters: Season & State */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Season Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Season:</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 text-slate-700 py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">{t('filter_all_seasons', 'All Seasons')}</option>
                  <option value="Kharif">Kharif (Monsoon / खरीप)</option>
                  <option value="Rabi">Rabi (Winter / रब्बी)</option>
                  <option value="Zaid">Zaid (Summer / उन्हाळी)</option>
                  <option value="Perennial">Perennial (बहुवार्षिक)</option>
                </select>
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 text-slate-700 py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[180px]"
                >
                  <option value="all">{t('filter_all_states', 'All States')}</option>
                  {allStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-emerald-700 font-bold">{filteredCrops.length}</span> of {crops.length} crops
            </div>
          </div>
        </div>

        {/* Crops Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-500">Loading scientific crop catalogue…</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <Sprout size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching crops found</h3>
            <p className="text-xs text-slate-500 mt-1">Try loosening search keywords or clearing filters.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedSeason('all')
                setSelectedState('all')
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all hover:border-emerald-300 overflow-hidden flex flex-col group"
              >
                {/* Card Top Banner */}
                <div className="p-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mb-1.5">
                        {getCategoryLabel(crop.category)}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                        {getCropDisplayName(crop)}
                      </h3>
                      {language !== 'en' && (
                        <p className="text-xs text-slate-500 font-medium">{crop.name} • <i>{crop.scientific_name}</i></p>
                      )}
                      {language === 'en' && (
                        <p className="text-xs text-slate-400 font-mono italic">{crop.scientific_name}</p>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                      <Sprout size={20} />
                    </div>
                  </div>
                </div>

                {/* Card Agronomic Metrics */}
                <div className="p-5 flex-1 space-y-3.5 text-xs">
                  {/* Duration & Water Needs */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-0.5">
                        <Calendar size={13} className="text-emerald-600" />
                        <span>{t('duration_label', 'Duration')}</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {crop.duration_days ? `${crop.duration_days} ${t('days_unit', 'days')}` : 'Perennial'}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-0.5">
                        <Droplets size={13} className="text-cyan-600" />
                        <span>{t('water_needs_label', 'Water Needs')}</span>
                      </div>
                      <div className="font-bold text-slate-800">
                        {crop.water_requirement_mm ? `${crop.water_requirement_mm} mm` : 'Moderate'}
                      </div>
                    </div>
                  </div>

                  {/* Season & Soil Types */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1">Suitable Soils & Season:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                        {crop.season}
                      </span>
                      {(crop.soil_types || []).slice(0, 3).map((st, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Regenerative Benefit Highlight */}
                  {crop.regenerative_benefits && crop.regenerative_benefits.length > 0 && (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-bold mb-1">
                        <Sparkles size={13} className="text-emerald-600" />
                        <span>{t('regenerative_value_label', 'Regenerative Benefits')}</span>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-snug">
                        {crop.regenerative_benefits[0]}
                      </p>
                    </div>
                  )}

                  {/* Major Producing States */}
                  {crop.major_states && crop.major_states.length > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{crop.major_states.slice(0, 4).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {crop.suitability_tier || 'ICAR Tier 1'}
                  </span>
                  <button
                    onClick={() => setSelectedCropModal(crop)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>{t('btn_details', 'View Details')}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedCropModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <button
              onClick={() => setSelectedCropModal(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <Sprout size={26} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mb-1">
                  {getCategoryLabel(selectedCropModal.category)}
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {getCropDisplayName(selectedCropModal)}
                </h2>
                <p className="text-xs text-slate-500 font-mono italic">
                  {selectedCropModal.scientific_name} • {selectedCropModal.name}
                </p>
              </div>
            </div>

            {/* Agronomic Bounds Matrix */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-bold">Duration</div>
                  <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {selectedCropModal.duration_days ? `${selectedCropModal.duration_days} days` : 'Perennial'}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-bold">Water Requirement</div>
                  <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {selectedCropModal.water_requirement_mm ? `${selectedCropModal.water_requirement_mm} mm` : 'Variable'}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-bold">Optimal pH Range</div>
                  <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {selectedCropModal.soil_ph_min || 6.0} – {selectedCropModal.soil_ph_max || 7.5}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-bold">Target Yield</div>
                  <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {selectedCropModal.target_yield_q_per_ha ? `${selectedCropModal.target_yield_q_per_ha} q/ha` : 'High'}
                  </div>
                </div>
              </div>

              {/* Varieties */}
              {selectedCropModal.popular_varieties && selectedCropModal.popular_varieties.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500" />
                    <span>Popular Recommended Varieties</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCropModal.popular_varieties.map((v, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Regenerative Benefits */}
              {selectedCropModal.regenerative_benefits && selectedCropModal.regenerative_benefits.length > 0 && (
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                  <div className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-emerald-600" />
                    <span>Regenerative Agriculture Value</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800 font-medium">
                    {selectedCropModal.regenerative_benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* States & Zones */}
              {selectedCropModal.major_states && selectedCropModal.major_states.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-700 mb-1">Major Growing States:</div>
                  <p className="text-slate-600">{selectedCropModal.major_states.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">
                ICAR Agronomic Dataset • Track 4
              </span>
              <button
                onClick={() => setSelectedCropModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
