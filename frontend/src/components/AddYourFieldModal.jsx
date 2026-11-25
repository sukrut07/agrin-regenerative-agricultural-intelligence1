import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { createField } from '../services/api'
import { X, Sprout, CheckCircle2, AlertCircle, Droplets, Mountain } from 'lucide-react'

export default function AddYourFieldModal({ isOpen, onClose, onFieldCreated, defaultFarmId = 'farm-parbhani-01' }) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    farm_id: defaultFarmId,
    name: '',
    area_hectares: 2.0,
    land_ownership: 'owned',
    soil_type: 'black',
    current_crop: 'Cotton',
    previous_crop: 'Soybean',
    season: 'kharif',
    irrigation_type: 'drip',
    soil_data_method: 'manual',
    location_lat: 19.26,
    location_lon: 76.78
  })

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        farm_id: formData.farm_id,
        name: formData.name || 'Field ' + Math.floor(Math.random() * 900 + 100),
        area_hectares: parseFloat(formData.area_hectares) || 1.5,
        location_lat: formData.location_lat,
        location_lon: formData.location_lon,
        soil_type: formData.soil_type,
        irrigation_type: formData.irrigation_type
      }
      const res = await createField(payload)
      setSuccess(true)
      setTimeout(() => {
        if (onFieldCreated) onFieldCreated(res)
        onClose()
        setSuccess(false)
        setStep(1)
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to create field')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-300">
              <Sprout size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">{t('add_field_modal_title', 'Add Your Field')}</h2>
              <p className="text-xs text-emerald-200">AgriN Guided Field Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${step === 1 ? 'border-emerald-600 text-emerald-800 bg-white font-bold' : 'border-transparent text-gray-500'}`}
          >
            {t('step_basics', '1. Basic Details')}
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${step === 2 ? 'border-emerald-600 text-emerald-800 bg-white font-bold' : 'border-transparent text-gray-500'}`}
          >
            {t('step_crop', '2. Crop & Season')}
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${step === 3 ? 'border-emerald-600 text-emerald-800 bg-white font-bold' : 'border-transparent text-gray-500'}`}
          >
            {t('step_soil', '3. Soil & Water')}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-gray-700">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center flex flex-col items-center gap-2">
              <CheckCircle2 size={32} className="text-emerald-600 animate-bounce" />
              <p className="font-bold">Field Registered Successfully!</p>
              <p className="text-xs text-emerald-700">Linking plot boundaries and telemetry sensors...</p>
            </div>
          )}

          {!success && step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('field_name_label', 'Field Name')} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Acre Cotton Plot"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('field_area_label', 'Area (Hectares)')} *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.area_hectares}
                    onChange={e => handleChange('area_hectares', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('land_ownership_label', 'Land Ownership')}
                  </label>
                  <select
                    value={formData.land_ownership}
                    onChange={e => handleChange('land_ownership', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm bg-white"
                  >
                    <option value="owned">{t('ownership_owned', 'Owned')}</option>
                    <option value="leased">{t('ownership_leased', 'Leased / Sharecrop')}</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <Mountain size={16} className="text-emerald-700 mt-0.5 shrink-0" />
                <span>
                  <strong>Tip:</strong> You can enter approximate boundaries now. Satellite Sentinel-2 resolution will calibrate vegetation index automatically.
                </span>
              </div>
            </div>
          )}

          {!success && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('growing_season_label', 'Growing Season')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['kharif', 'rabi', 'zaid'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleChange('season', s)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${formData.season === s ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('current_crop_label', 'Current Crop')}
                  </label>
                  <input
                    type="text"
                    value={formData.current_crop}
                    onChange={e => handleChange('current_crop', e.target.value)}
                    placeholder="e.g. Cotton, Soybean, Wheat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('previous_crop_label', 'Previous Season Crop')}
                  </label>
                  <input
                    type="text"
                    value={formData.previous_crop}
                    onChange={e => handleChange('previous_crop', e.target.value)}
                    placeholder="e.g. Chickpea, Fallow"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {!success && step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('soil_type_label', 'Soil Type')}
                  </label>
                  <select
                    value={formData.soil_type}
                    onChange={e => handleChange('soil_type', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm bg-white"
                  >
                    <option value="black">Black Soil / Regur</option>
                    <option value="alluvial">Alluvial Soil</option>
                    <option value="red_loam">Red & Yellow Soil</option>
                    <option value="laterite">Laterite Soil</option>
                    <option value="sandy_loam">Sandy Loam</option>
                    <option value="clay_loam">Clay Loam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('irrigation_method_label', 'Irrigation Method')}
                  </label>
                  <select
                    value={formData.irrigation_type}
                    onChange={e => handleChange('irrigation_type', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-sm bg-white"
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler Irrigation</option>
                    <option value="flood">Flood / Furrow</option>
                    <option value="rainfed">Rainfed (Dryland)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  {t('soil_data_method_label', 'How will you provide soil data?')}
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'manual', label: t('method_manual', 'Enter Soil Parameters Manually'), desc: 'N, P, K, pH, EC, Organic Carbon' },
                    { id: 'shc', label: t('method_shc', 'Upload Soil Health Card (SHC)'), desc: 'Official government test report' },
                    { id: 'sensor', label: t('method_sensor', 'Connect AgriSense ESP32 Node'), desc: 'Real-time telemetry / Wokwi Simulator' },
                    { id: 'estimate', label: t('method_estimate', 'Use District Reference Estimate'), desc: 'ICAR regional benchmark (labeled ESTIMATED)' }
                  ].map(m => (
                    <label
                      key={m.id}
                      onClick={() => handleChange('soil_data_method', m.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.soil_data_method === m.id ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 font-semibold' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                    >
                      <input
                        type="radio"
                        name="soil_method"
                        checked={formData.soil_data_method === m.id}
                        onChange={() => {}}
                        className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div>
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[11px] text-gray-500 font-normal">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {t('btn_back', 'Back')}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all shadow-sm"
            >
              {t('btn_next', 'Next Step')}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || success}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
            >
              {submitting ? 'Creating Field...' : t('btn_save', 'Create Field')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
