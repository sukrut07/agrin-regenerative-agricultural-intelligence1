import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { getLiveWeather } from '../services/api'
import {
  Info, Thermometer, Droplets, CloudRain, Radio,
  MapPin, ArrowLeft, ArrowRight
} from 'lucide-react'
import StepLayout from '../components/StepLayout'

const ENV_PARAMS = [
  {
    key: 'temperature', label: 'Average Temperature',
    unit: '°C', min: -5, max: 50, step: 0.5, placeholder: 'e.g. 28',
    icon: <Thermometer size={17} style={{ color: '#C88A14' }} />,
    color: '#C88A14', bg: '#FDF6E2',
    tip: 'Average temperature during the growing season. Obtainable from IMD or local weather station.',
  },
  {
    key: 'humidity', label: 'Relative Humidity',
    unit: '%', min: 0, max: 100, step: 1, placeholder: 'e.g. 65',
    icon: <Droplets size={17} style={{ color: '#2E6CA4' }} />,
    color: '#2E6CA4', bg: '#EDF4FA',
    tip: 'Average relative humidity. Typical: Coastal 70–90%, Semi-arid 40–65%, Arid < 45%.',
  },
  {
    key: 'rainfall', label: 'Annual Rainfall',
    unit: 'mm/yr', min: 0, max: 5000, step: 10, placeholder: 'e.g. 750',
    icon: <CloudRain size={17} style={{ color: '#183B2A' }} />,
    color: '#183B2A', bg: '#EAF3EC',
    tip: 'Total annual rainfall in mm. Indian range: 150mm (Western Rajasthan) to 3500mm+ (Western Ghats / NE).',
  },
]

const TYPICAL_VALUES = [
  { region: 'Trans-Gangetic (Punjab/Haryana)', temp: 24, humidity: 60, rainfall: 650 },
  { region: 'Western Dry (Rajasthan)', temp: 27, humidity: 42, rainfall: 350 },
  { region: 'Middle Gangetic (UP/Bihar)', temp: 26, humidity: 68, rainfall: 1100 },
  { region: 'Western Plateau (Maharashtra/MP)', temp: 29, humidity: 55, rainfall: 750 },
  { region: 'Southern Plateau (Karnataka/AP)', temp: 26, humidity: 62, rainfall: 820 },
  { region: 'West Coast / Konkan / Kerala', temp: 28, humidity: 80, rainfall: 2800 },
]

export default function Environment() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { farmData, envData, setEnvData } = useApp()
  const [tooltip, setTooltip] = useState(null)
  const [fetchingLive, setFetchingLive] = useState(false)
  const [liveNotice, setLiveNotice] = useState(null)

  const update = (key, value) => setEnvData(prev => ({ ...prev, [key]: value }))
  const prefill = vals => setEnvData({ temperature: vals.temp, humidity: vals.humidity, rainfall: vals.rainfall })

  const handleFetchLiveWeather = async () => {
    setFetchingLive(true)
    setLiveNotice(null)
    try {
      const params = (farmData.latitude && farmData.longitude)
        ? { lat: farmData.latitude, lon: farmData.longitude, district: farmData.district, state: farmData.state }
        : { district: farmData.district || 'Parbhani', state: farmData.state || 'Maharashtra' }
      const res = await getLiveWeather(params)
      setEnvData({
        temperature: res.temperature,
        humidity: res.humidity,
        rainfall: res.rainfall
      })
      setLiveNotice(`Synced live weather for ${res.district}, ${res.state || 'India'} (${res.source}): ${res.temperature}°C · ${res.humidity}% RH`)
    } catch (err) {
      setLiveNotice('Failed to fetch live weather. Please enter values manually.')
    } finally {
      setFetchingLive(false)
    }
  }

  return (
    <StepLayout
      step={3}
      title={t('env_title', 'Environmental Conditions')}
      subtitle={t('env_subtitle', 'Temperature, relative humidity, and seasonal rainfall for your growing area')}
    >
      {/* Live Weather Sync Banner */}
      <div className="bg-[#EEF5EE] border border-[#C6DBC9] rounded-[18px] p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#183B2A] text-[#E7D927] flex items-center justify-center shrink-0">
              <Radio size={17} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#183B2A]">
                Live Open-Meteo Weather Sync
              </div>
              <div className="text-xs text-[#3C5B49] mt-0.5">
                Fetch current climate baseline for {farmData.district || 'your selected district'}, {farmData.state || 'India'}.
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-agrin-dark shrink-0"
            style={{ padding: '10px 20px', fontSize: '13px' }}
            onClick={handleFetchLiveWeather}
            disabled={fetchingLive}
          >
            <Radio size={14} className={fetchingLive ? 'animate-spin' : ''} />
            <span>{fetchingLive ? 'Fetching...' : 'Fetch Live Weather'}</span>
          </button>
        </div>

        {liveNotice && (
          <div className="mt-3 pt-3 border-t border-[#C6DBC9] text-xs font-semibold text-[#183B2A]">
            {liveNotice}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-[#EDF4FA] border border-[#C5DCED] rounded-[14px] px-4 py-3 mb-5 flex items-start gap-2.5 text-xs text-[#2E6CA4]">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Climate figures can be sourced from the{' '}
          <strong>India Meteorological Department (IMD)</strong> or district agricultural offices. All three fields are optional.
        </span>
      </div>

      {/* Quick-fill Region Pills */}
      <div className="ff-card p-5 mb-5">
        <div className="text-xs font-bold text-[#171814] mb-3">
          Quick-Fill Indian Agro-Climatic Zone Averages:
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPICAL_VALUES.map(v => (
            <button
              key={v.region}
              type="button"
              className="region-pill gap-1.5"
              onClick={() => prefill(v)}
            >
              <MapPin size={12} className="text-[#183B2A]" />
              <span>{v.region} ({v.rainfall}mm · {v.temp}°C)</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#9B9C92] mt-2.5">
          Regional averages only — enter measured local values when available.
        </p>
      </div>

      {/* Parameter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {ENV_PARAMS.map(param => (
          <div
            key={param.key}
            className="ff-card p-5 relative"
            style={{ borderTop: `3px solid ${param.color}` }}
          >
            <div className="flex items-center gap-2.5 mb-3.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: param.bg }}
              >
                {param.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#171814] truncate">{param.label}</div>
                <div className="text-[11px] text-[#9B9C92]">Optional</div>
              </div>
              <button
                type="button"
                aria-label={`Info about ${param.label}`}
                className="text-[#77786F] hover:text-[#183B2A] p-1 cursor-pointer"
                onMouseEnter={() => setTooltip(param.key)}
                onMouseLeave={() => setTooltip(null)}
              >
                <Info size={14} />
              </button>
            </div>

            {tooltip === param.key && (
              <div className="absolute z-20 bottom-full left-0 right-0 mb-2 bg-white border border-[#E5E5DC] rounded-xl p-3 text-xs text-[#77786F] shadow-lg leading-relaxed">
                {param.tip}
              </div>
            )}

            <div className="relative">
              <input
                id={`env-${param.key}`}
                className="farm-input font-mono-num"
                type="number"
                min={param.min} max={param.max} step={param.step}
                placeholder={param.placeholder}
                value={envData[param.key]}
                onChange={e => update(param.key, e.target.value)}
                style={{ paddingRight: 60 }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#77786F] pointer-events-none">
                {param.unit}
              </span>
            </div>

            {envData[param.key] !== '' && (
              <div className="mt-3">
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((parseFloat(envData[param.key]) - param.min) / (param.max - param.min)) * 100))}%`,
                      background: param.color,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-mono-num text-[#9B9C92]">
                  <span>{param.min}{param.unit}</span>
                  <span>{param.max}{param.unit}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button type="button" className="btn-agrin-outline" onClick={() => navigate('/soil-test')}>
          <ArrowLeft size={15} />
          <span>{t('btn_back', 'Back')}</span>
        </button>
        <button type="button" className="btn-agrin-cta" onClick={() => navigate('/analysis')}>
          <span>{t('btn_analyse_farm', 'Analyse My Farm')}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </StepLayout>
  )
}
