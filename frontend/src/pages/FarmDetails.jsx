import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { getReferenceData, getLiveWeather } from '../services/api'
import StepLayout from '../components/StepLayout'
import {
  MapPin, Calendar, Trees, Droplets, Navigation,
  CheckCircle, AlertCircle, Sparkles, ArrowLeft, ArrowRight, XCircle
} from 'lucide-react'
import { DEMO_SCENARIOS } from '../services/demoScenarios'

export default function FarmDetails() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { farmData, setFarmData, setSoilData, setEnvData, dataSource, setDataSource } = useApp()
  const [refData, setRefData] = useState({
    states: [], districts: [], seasons: [], soil_types: [],
    water_sources: [], drainage_conditions: [], previous_crops: [],
  })
  const [loading, setLoading] = useState(true)
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)
  const [geoMessage, setGeoMessage] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const currentState = farmData.state || 'Maharashtra'
    getReferenceData(currentState)
      .then(data => {
        setRefData(data)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  const handleStateChange = async (newState) => {
    update('state', newState)
    update('district', '')
    update('sub_district', '')
    setDistrictsLoading(true)
    try {
      const data = await getReferenceData(newState)
      setRefData(prev => ({
        ...prev,
        districts: data.districts || [],
        selected_state: newState
      }))
    } catch (e) {
      console.error('Failed to load districts for state:', e)
    } finally {
      setDistrictsLoading(false)
    }
  }

  const update = (field, value) => {
    setFarmData(prev => ({ ...prev, [field]: value }))
    setDataSource('manual')
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage({ type: 'error', text: 'Geolocation is not supported by your browser.' })
      return
    }

    setGeoLocating(true)
    setGeoMessage(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const locInfo = await getLiveWeather({ lat: latitude, lon: longitude })
          const detectedDistrict = locInfo.district
          const detectedState = locInfo.state || farmData.state || 'Maharashtra'

          const stateData = await getReferenceData(detectedState)
          setRefData(prev => ({
            ...prev,
            districts: stateData.districts || [],
            selected_state: detectedState
          }))

          setFarmData(prev => ({
            ...prev,
            latitude: Number(latitude.toFixed(4)),
            longitude: Number(longitude.toFixed(4)),
            state: detectedState,
            district: detectedDistrict,
            agro_climatic_zone: locInfo.region || ''
          }))

          setGeoMessage({
            type: 'success',
            text: `GPS Detected: ${detectedDistrict}, ${detectedState} (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`
          })
        } catch (err) {
          setFarmData(prev => ({
            ...prev,
            latitude: Number(latitude.toFixed(4)),
            longitude: Number(longitude.toFixed(4)),
          }))
          setGeoMessage({
            type: 'success',
            text: `GPS Captured: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`
          })
        } finally {
          setGeoLocating(false)
        }
      },
      (err) => {
        setGeoLocating(false)
        setGeoMessage({ type: 'error', text: `Unable to retrieve GPS: ${err.message}` })
      },
      { timeout: 8000 }
    )
  }

  const handleSelectDemoScenario = (scId) => {
    if (!scId) return
    const sc = DEMO_SCENARIOS.find(s => s.id === scId)
    if (!sc) return
    setFarmData(sc.farmData)
    setSoilData(sc.soilData)
    setEnvData(sc.envData)
    setDataSource('sample')
  }

  const validate = () => {
    const errs = {}
    if (!farmData.state) errs.state = 'Please select your state'
    if (!farmData.district && !farmData.latitude) errs.district = 'Please select your district or use GPS'
    if (!farmData.season) errs.season = 'Please select the farming season'
    return errs
  }

  const handleNext = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    navigate('/soil-test')
  }

  if (loading) return (
    <StepLayout
      step={1}
      title={t('farm_details_title', 'Farm Details')}
      subtitle={t('farm_details_subtitle', 'Tell us about your farm location and growing conditions across India')}
    >
      <div className="flex justify-center py-16">
        <div className="loader" />
      </div>
    </StepLayout>
  )

  const statesList = refData.states && refData.states.length > 0
    ? refData.states
    : [{ name: 'Maharashtra', type: 'State' }]

  const isDemo = dataSource === 'sample' || Boolean(farmData?.farm_id?.startsWith('DEMO-'))

  return (
    <StepLayout
      step={1}
      title={t('farm_details_title', 'Farm Details')}
      subtitle={t('farm_details_subtitle', 'Tell us about your farm location and growing conditions across India')}
    >
      {/* Sample / Illustrative Scenario Bar */}
      <div
        className={`rounded-[18px] p-4 sm:p-5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isDemo
            ? 'bg-[#FDF6E2] border-2 border-dashed border-[#C88A14]'
            : 'bg-white border border-[#E5E5DC] shadow-xs'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDemo ? 'bg-[#C88A14] text-white' : 'bg-[#F2F5EE] text-[#77772B]'
            }`}
          >
            <Sparkles size={17} />
          </div>
          <div>
            <div className={`text-sm font-bold ${isDemo ? 'text-[#8A5D0A]' : 'text-[#171814]'}`}>
              {isDemo
                ? 'Sample Regional Profile Active — Illustrative Data Only'
                : 'Sample Regional Farm Profiles'}
            </div>
            <div className={`text-xs mt-0.5 ${isDemo ? 'text-[#9B6A00]' : 'text-[#77786F]'}`}>
              Optional: pre-fill with representative ICAR archetypes (Punjab, Rajasthan, Kerala, Maharashtra).
            </div>
          </div>
        </div>

        <select
          aria-label="Select a sample farm profile"
          onChange={(e) => handleSelectDemoScenario(e.target.value)}
          className="farm-input sm:w-64 shrink-0 text-sm"
          defaultValue=""
        >
          <option value="">Load a sample profile...</option>
          {DEMO_SCENARIOS.map(sc => (
            <option key={sc.id} value={sc.id}>{sc.title}</option>
          ))}
        </select>
      </div>

      {/* Pan-India GPS Location Banner */}
      <div className="bg-[#EEF5EE] border border-[#C6DBC9] rounded-[18px] p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#183B2A] text-[#E7D927] flex items-center justify-center shrink-0">
            <MapPin size={17} />
          </div>
          <div>
            <div className="text-sm font-bold text-[#183B2A]">
              Pan-India Location Auto-Detection
            </div>
            <div className="text-xs text-[#3C5B49] mt-0.5">
              Detect district and agro-climate automatically via GPS, or select manually below.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={geoLocating}
          className="btn-agrin-dark shrink-0"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          <Navigation size={14} className={geoLocating ? 'animate-spin' : ''} />
          <span>{geoLocating ? 'Locating...' : 'Use My Location (GPS)'}</span>
        </button>
      </div>

      {/* GPS Feedback Notice */}
      {geoMessage && (
        <div
          className={`rounded-xl px-4 py-3 mb-6 text-xs font-semibold flex items-center gap-2.5 border ${
            geoMessage.type === 'success'
              ? 'bg-[#EAF5EE] text-[#183B2A] border-[#C6E2CE]'
              : 'bg-[#FDECEC] text-[#C93F3F] border-[#F5C6C6]'
          }`}
        >
          {geoMessage.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{geoMessage.text}</span>
        </div>
      )}

      {/* Card 1: Administrative Location */}
      <section className="ff-card p-6 sm:p-7 mb-5">
        <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3.5 mb-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77772B]">
              [ 01 · LOCATION ]
            </div>
            <h2 className="text-base font-extrabold text-[#171814] mt-0.5">
              Farm Location &amp; Administrative Region
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-[#77786F] hidden sm:inline">
            28 States &amp; 8 Union Territories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="State / Union Territory" required icon={<MapPin size={14} />} error={errors.state}>
            <select
              className="farm-input"
              value={farmData.state || 'Maharashtra'}
              onChange={e => handleStateChange(e.target.value)}
            >
              {statesList.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name} {s.type === 'Union Territory' ? '(UT)' : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="District" required icon={<MapPin size={14} />} error={errors.district}>
            <select
              className="farm-input"
              value={farmData.district || ''}
              onChange={e => update('district', e.target.value)}
              disabled={districtsLoading}
            >
              <option value="">{districtsLoading ? 'Loading districts...' : 'Select district...'}</option>
              {refData.districts && refData.districts.map(d => (
                <option key={d.id} value={d.id || d.name}>{d.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Taluka / Tehsil / Block" hint="Sub-District">
            <input
              className="farm-input"
              placeholder="e.g. Haveli, Sangamner, Abohar, Pollachi"
              value={farmData.sub_district || ''}
              onChange={e => update('sub_district', e.target.value)}
            />
          </Field>

          <Field label="Village / Locality" hint="Optional">
            <input
              className="farm-input"
              placeholder="e.g. Nimgaon, Rampur"
              value={farmData.village || ''}
              onChange={e => update('village', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Card 2: Growing Season & Field Conditions */}
      <section className="ff-card p-6 sm:p-7 mb-7">
        <div className="border-b border-[#E5E5DC] pb-3.5 mb-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77772B]">
            [ 02 · FIELD &amp; WATER ]
          </div>
          <h2 className="text-base font-extrabold text-[#171814] mt-0.5">
            Cropping Season, Soil &amp; Irrigation Conditions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Farming Season" required icon={<Calendar size={14} />} error={errors.season}>
            <select className="farm-input" value={farmData.season || ''} onChange={e => update('season', e.target.value)}>
              <option value="">Select season...</option>
              {refData.seasons.map(s => <option key={s.id} value={s.id}>{s.name} — {s.period}</option>)}
            </select>
          </Field>

          <Field label="Farm Area" hint="Optional">
            <div className="relative">
              <input
                className="farm-input"
                style={{ paddingRight: 64 }}
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 2.5"
                value={farmData.farm_area || ''}
                onChange={e => update('farm_area', e.target.value)}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#77786F] pointer-events-none">
                acres
              </span>
            </div>
          </Field>

          <Field label="Soil Type" hint="Optional" icon={<Trees size={14} />}>
            <select className="farm-input" value={farmData.soil_type || ''} onChange={e => update('soil_type', e.target.value)}>
              <option value="">Select soil type...</option>
              {refData.soil_types.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>

          <Field label="Irrigation Available?" icon={<Droplets size={14} />}>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { val: 'yes', label: 'Yes, irrigated', icon: <CheckCircle size={14} /> },
                { val: 'no', label: 'Rainfed only', icon: <XCircle size={14} /> },
              ].map(({ val, label, icon }) => {
                const selected = farmData.irrigation_available === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update('irrigation_available', val)}
                    className={`min-h-[44px] px-3 rounded-[12px] text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      selected
                        ? 'border-2 border-[#183B2A] bg-[#EAF3EC] text-[#183B2A] font-bold'
                        : 'border border-[#E5E5DC] bg-white text-[#77786F] font-medium hover:border-[#183B2A]/40'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="Water Source" hint="Optional">
            <select className="farm-input" value={farmData.water_source || ''} onChange={e => update('water_source', e.target.value)}>
              <option value="">Select water source...</option>
              {refData.water_sources.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Field>

          <Field label="Field Drainage Condition">
            <select className="farm-input" value={farmData.drainage || 'unknown'} onChange={e => update('drainage', e.target.value)}>
              {refData.drainage_conditions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Previous Crop" hint="Optional — helps suggest crop rotation benefits">
              <select className="farm-input" value={farmData.previous_crop || ''} onChange={e => update('previous_crop', e.target.value)}>
                <option value="">Select previous crop...</option>
                {refData.previous_crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <button type="button" className="btn-agrin-outline" onClick={() => navigate('/')}>
          <ArrowLeft size={15} />
          <span>{t('btn_back_home', 'Back to Home')}</span>
        </button>
        <button type="button" className="btn-agrin-cta" onClick={handleNext}>
          <span>{t('btn_next_soil', 'Next: Soil Test')}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </StepLayout>
  )
}

function Field({ label, required, hint, error, icon, children }) {
  return (
    <div>
      <label className="ff-label">
        <span className="flex items-center gap-1.5">
          {icon && <span className="text-[#183B2A]">{icon}</span>}
          <span>{label}</span>
          {required && <span className="text-[#C93F3F]">*</span>}
          {hint && <span className="text-xs text-[#9B9C92] font-normal ml-1">({hint})</span>}
        </span>
      </label>
      {children}
      {error && (
        <p className="text-[#C93F3F] text-xs font-semibold mt-1.5 flex items-center gap-1">
          <AlertCircle size={12} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
