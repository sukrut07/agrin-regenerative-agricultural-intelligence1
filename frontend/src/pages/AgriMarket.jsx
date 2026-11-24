import React, { useState, useEffect, useMemo } from 'react'
import HeaderNav from '../components/HeaderNav'
import { useLanguage } from '../context/LanguageContext'
import { useUserMode } from '../context/UserModeContext'
import {
  getMarketplaceListings,
  createMarketplaceListing,
  submitMarketplaceEnquiry,
  getPriceBenchmarks
} from '../services/api'
import {
  ShoppingBag, Filter, Plus, Phone, MapPin, Tag, Calendar,
  CheckCircle2, Tractor, Wrench, Sparkles, TrendingUp, Volume2,
  X, ShieldCheck, Check, Search, AlertCircle, ArrowRight
} from 'lucide-react'

export default function AgriMarket() {
  const { t, currentLanguage } = useLanguage()
  const { isSimpleMode, speakText } = useUserMode()

  // State
  const [listings, setListings] = useState([])
  const [benchmarks, setBenchmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [rentalsOnly, setRentalsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showPostModal, setShowPostModal] = useState(false)
  const [selectedListingForEnquiry, setSelectedListingForEnquiry] = useState(null)

  // Form states
  const [postFormData, setPostFormData] = useState({
    title: '',
    category: 'PRODUCE',
    description: '',
    price: '',
    pricing_unit: 'PER_QUINTAL',
    is_rental: false,
    rental_duration_unit: 'PER_DAY',
    deposit_required: '',
    location_district: 'Parbhani',
    location_state: 'Maharashtra',
    contact_phone: '',
    equipment_specs: ''
  })
  const [postSubmitting, setPostSubmitting] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)

  const [enquiryFormData, setEnquiryFormData] = useState({
    buyer_name: '',
    buyer_phone: '',
    message: ''
  })
  const [enquirySubmitting, setEnquirySubmitting] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)

  // Categories config
  const categories = [
    { key: 'ALL', label: t('category_all', 'All Items') },
    { key: 'MACHINERY_RENTAL', label: t('category_rentals', 'Machinery Rentals') },
    { key: 'SOIL_AMENDMENTS', label: t('category_amendments', 'Soil Amendments (Gypsum/Lime)') },
    { key: 'BIO_INPUTS', label: t('category_fertilizers', 'Biofertilizers & Compost') },
    { key: 'SEEDS', label: t('category_seeds', 'Seeds & Saplings') },
    { key: 'PRODUCE', label: t('category_produce', 'Farm Produce') },
    { key: 'SERVICES', label: t('category_services', 'Drone & Field Services') }
  ]

  const districts = ['Parbhani', 'Nanded', 'Jalna', 'Aurangabad', 'Pune', 'Nashik', 'Amravati', 'Nagpur', 'Latur']

  // Load data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [listingsRes, benchmarksRes] = await Promise.all([
        getMarketplaceListings({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          district: selectedDistrict || undefined,
          is_rental: rentalsOnly ? true : undefined,
          search: searchQuery || undefined
        }),
        getPriceBenchmarks()
      ])

      setListings(Array.isArray(listingsRes) ? listingsRes : [])
      setBenchmarks(Array.isArray(benchmarksRes) ? benchmarksRes : [])
    } catch (err) {
      console.error('Failed to load marketplace data:', err)
      setError('Unable to load listings. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedCategory, selectedDistrict, rentalsOnly])

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchData()
  }

  // Handle Post Listing Submit
  const handlePostSubmit = async (e) => {
    e.preventDefault()
    setPostSubmitting(true)
    try {
      const payload = {
        ...postFormData,
        price: parseFloat(postFormData.price) || 0,
        deposit_required: postFormData.deposit_required ? parseFloat(postFormData.deposit_required) : null,
        equipment_specs: postFormData.equipment_specs ? { specs: postFormData.equipment_specs } : null
      }
      await createMarketplaceListing(payload)
      setPostSuccess(true)
      setTimeout(() => {
        setPostSuccess(false)
        setShowPostModal(false)
        fetchData()
      }, 1500)
    } catch (err) {
      console.error('Failed to post listing:', err)
      alert('Error creating listing. Please check inputs.')
    } finally {
      setPostSubmitting(false)
    }
  }

  // Handle Enquiry Submit
  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    if (!selectedListingForEnquiry) return
    setEnquirySubmitting(true)
    try {
      await submitMarketplaceEnquiry({
        listing_id: selectedListingForEnquiry.id,
        buyer_name: enquiryFormData.buyer_name,
        buyer_phone: enquiryFormData.buyer_phone,
        message: enquiryFormData.message
      })
      setEnquirySuccess(true)
      setTimeout(() => {
        setEnquirySuccess(false)
        setSelectedListingForEnquiry(null)
        setEnquiryFormData({ buyer_name: '', buyer_phone: '', message: '' })
      }, 1800)
    } catch (err) {
      console.error('Failed to send enquiry:', err)
      alert('Error sending enquiry. Please try again.')
    } finally {
      setEnquirySubmitting(false)
    }
  }

  // Voice narration helper
  const handleVoiceOverview = () => {
    const text = currentLanguage === 'mr'
      ? `अॅग्री-मार्केटमध्ये ${listings.length} कृषी वस्तू आणि अवजारे उपलब्ध आहेत. सोयाबीन बाजारभाव ४ हजार ४५० रुपये आहे.`
      : currentLanguage === 'hi'
      ? `एग्री-मार्केट में ${listings.length} कृषि उत्पाद और मशीनें उपलब्ध हैं। सोयाबीन मंडी भाव ४,४५० रुपये प्रति क्विंटल है।`
      : `Welcome to AgriMarket. Currently displaying ${listings.length} agricultural items and machinery rentals in your district.`
    const langCode = currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-US'
    speakText(text, langCode)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#171814]">
      <HeaderNav />

      {/* Top Banner */}
      <section className="bg-[#183B2A] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#E5E5DC]/15">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7D927] text-xs font-semibold mb-2 border border-white/15">
              <ShoppingBag size={14} />
              <span>{t('nav_agrimarket', 'AgriMarket Ecosystem')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('market_title', 'AgriMarket — Nearby Agricultural Marketplace')}
            </h1>
            <p className="text-[#F7F7F2]/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {t('market_subtitle', 'Buy produce, discover seeds & bio-inputs, and book nearby tractor & machinery rentals.')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleVoiceOverview}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#E7D927] text-xs font-bold flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
              title="Voice narration"
            >
              <Volume2 size={16} />
              <span>{isSimpleMode ? 'ऐका (Listen)' : 'Audio Summary'}</span>
            </button>

            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-full bg-[#E7D927] hover:bg-[#D6C81E] text-[#171814] text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>{t('btn_post_listing', 'Post Listing')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Mandi APMC Price Ticker */}
      {benchmarks.length > 0 && (
        <div className="bg-emerald-950/90 text-emerald-200 border-b border-emerald-800/40 py-2.5 px-4 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs whitespace-nowrap">
            <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-emerald-400 text-[11px] shrink-0">
              <TrendingUp size={14} />
              <span>{t('mandi_price_title', 'Agmarknet APMC Rates')}:</span>
            </div>
            <div className="flex items-center gap-5">
              {benchmarks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1 rounded-lg border border-emerald-700/50">
                  <span className="font-bold text-white">{item.crop}</span>
                  <span className="text-[10px] text-emerald-300">({item.market}):</span>
                  <span className="font-black text-amber-300">₹{item.modal_price}</span>
                  <span className="text-[9px] text-emerald-400">/{item.unit.replace('PER_', '').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tractor, gypsum, compost, seeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
              >
                Search
              </button>
            </form>

            {/* District & Rental Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Districts (महाराष्ट्र)</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={rentalsOnly}
                  onChange={(e) => setRentalsOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <Tractor size={15} className="text-emerald-700" />
                <span>{t('filter_rental_only', 'Rentals Only')}</span>
              </label>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100 no-scrollbar">
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c.key
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Section */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading marketplace items...
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-center text-xs">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <ShoppingBag size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No listings found in this category</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Be the first farmer or provider to post in this district!</p>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              {t('btn_post_listing', 'Post Listing')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category.replace('_', ' ')}
                    </span>
                    {item.is_rental && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Tractor size={12} />
                        Rental
                      </span>
                    )}
                    {item.is_verified_seller && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Equipment specs if rental */}
                  {item.equipment_specs && item.equipment_specs.specs && (
                    <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 mb-3">
                      <strong>Specs:</strong> {item.equipment_specs.specs}
                    </div>
                  )}

                  {/* Location & Deposit */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {item.location_district}, {item.location_state}
                    </span>
                    {item.deposit_required && (
                      <span className="text-amber-700 font-semibold">
                        Deposit: ₹{item.deposit_required}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-emerald-900">
                      ₹{item.price}
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        /{item.pricing_unit.replace('PER_', '').toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedListingForEnquiry(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Phone size={13} />
                    <span>{t('btn_contact_seller', 'Contact / Book')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Post Listing Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <span>{t('btn_post_listing', 'Post Listing')}</span>
              </h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {postSuccess ? (
              <div className="py-8 text-center text-emerald-700">
                <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-3" />
                <h4 className="text-base font-extrabold">Listing Published Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">Now visible to nearby farmers on AgriMarket.</p>
              </div>
            ) : (
              <form onSubmit={handlePostSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Deere 5050D Tractor with Rotavator / Organic Compost"
                    value={postFormData.title}
                    onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={postFormData.category}
                      onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="PRODUCE">Farm Produce</option>
                      <option value="MACHINERY_RENTAL">Machinery Rental</option>
                      <option value="SOIL_AMENDMENTS">Soil Amendments</option>
                      <option value="BIO_INPUTS">Bio-Inputs & Compost</option>
                      <option value="SEEDS">Seeds</option>
                      <option value="SERVICES">Field Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">District</label>
                    <select
                      value={postFormData.location_district}
                      onChange={(e) => setPostFormData({ ...postFormData, location_district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 800"
                      value={postFormData.price}
                      onChange={(e) => setPostFormData({ ...postFormData, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pricing Unit</label>
                    <select
                      value={postFormData.pricing_unit}
                      onChange={(e) => setPostFormData({ ...postFormData, pricing_unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="PER_HOUR">Per Hour</option>
                      <option value="PER_DAY">Per Day</option>
                      <option value="PER_ACRE">Per Acre</option>
                      <option value="PER_BAG">Per Bag (50kg)</option>
                      <option value="PER_QUINTAL">Per Quintal</option>
                      <option value="PER_KG">Per Kg</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_rental_chk"
                    checked={postFormData.is_rental}
                    onChange={(e) => setPostFormData({ ...postFormData, is_rental: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_rental_chk" className="font-bold text-slate-700 cursor-pointer">
                    This is equipment available for rental / hire
                  </label>
                </div>

                {postFormData.is_rental && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      value={postFormData.deposit_required}
                      onChange={(e) => setPostFormData({ ...postFormData, deposit_required: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={postFormData.contact_phone}
                    onChange={(e) => setPostFormData({ ...postFormData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description & Details</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details about condition, availability, or variety..."
                    value={postFormData.description}
                    onChange={(e) => setPostFormData({ ...postFormData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {postSubmitting ? 'Posting...' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {selectedListingForEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Phone size={18} className="text-emerald-600" />
                <span>{t('enquiry_modal_title', 'Send Inquiry to Seller')}</span>
              </h2>
              <button
                onClick={() => setSelectedListingForEnquiry(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs">
              <div className="font-bold text-slate-800">{selectedListingForEnquiry.title}</div>
              <div className="text-emerald-700 font-extrabold mt-0.5">
                ₹{selectedListingForEnquiry.price} /{selectedListingForEnquiry.pricing_unit.replace('PER_', '').toLowerCase()}
              </div>
            </div>

            {enquirySuccess ? (
              <div className="py-6 text-center text-emerald-700">
                <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-2" />
                <h4 className="text-sm font-extrabold">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">The seller has received your contact details.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={enquiryFormData.buyer_name}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, buyer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98220 12345"
                    value={enquiryFormData.buyer_phone}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, buyer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message / Dates Required</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Need tractor rental for 2 days next Monday in Parbhani taluka."
                    value={enquiryFormData.message}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedListingForEnquiry(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {enquirySubmitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
