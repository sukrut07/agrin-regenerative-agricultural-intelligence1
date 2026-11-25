import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import {
  Info, Cpu, AlertCircle, ArrowLeft, ArrowRight,
  Sprout, Droplets, FlaskConical, Sliders
} from 'lucide-react'
import StepLayout from '../components/StepLayout'

const SAMPLE_SOIL_PRESET = {
  N: '260', P: '18.5', K: '240', S: '12',
  Zn: '0.85', Fe: '6.2', Cu: '0.5', Mn: '3.1', B: '0.65',
  ph: '6.9', EC: '0.42', OC: '0.64'
}

const SOIL_PARAMS = [
  {
    code: '01',
    section: 'Macronutrients',
    accent: '#183B2A',
    icon: <Sprout size={16} />,
    params: [
      { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 800, placeholder: 'e.g. 280', tip: 'Available nitrogen. Alkaline KMnO₄ method. Low <240, Medium 240–480, High >480 kg/ha (ICAR)' },
      { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', min: 0, max: 300, placeholder: 'e.g. 15', tip: 'Available phosphorus. Olsen method. Low <11, Medium 11–22, High >22 kg/ha (ICAR)' },
      { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', min: 0, max: 1200, placeholder: 'e.g. 180', tip: 'Available potassium. NH₄OAc method. Low <110, Medium 110–280, High >280 kg/ha (ICAR)' },
    ],
  },
  {
    code: '02',
    section: 'Secondary Nutrient',
    accent: '#2E6CA4',
    icon: <Droplets size={16} />,
    params: [
      { key: 'S', label: 'Sulphur (S)', unit: 'ppm', min: 0, max: 100, placeholder: 'e.g. 12', tip: 'Available sulphur. Critical level: 10 ppm. Below 10 = deficient (ICAR SHC)' },
    ],
  },
  {
    code: '03',
    section: 'Micronutrients',
    accent: '#77772B',
    icon: <FlaskConical size={16} />,
    params: [
      { key: 'Zn', label: 'Zinc (Zn)', unit: 'ppm', min: 0, max: 20, placeholder: 'e.g. 0.8', tip: 'DTPA-extractable zinc. Critical level: 0.6 ppm (ICAR)' },
      { key: 'Fe', label: 'Iron (Fe)', unit: 'ppm', min: 0, max: 100, placeholder: 'e.g. 6.5', tip: 'DTPA-extractable iron. Critical level: 4.5 ppm (ICAR SHC)' },
      { key: 'Cu', label: 'Copper (Cu)', unit: 'ppm', min: 0, max: 20, placeholder: 'e.g. 0.5', tip: 'DTPA-extractable copper. Critical level: 0.2 ppm (ICAR SHC)' },
      { key: 'Mn', label: 'Manganese (Mn)', unit: 'ppm', min: 0, max: 50, placeholder: 'e.g. 3.2', tip: 'DTPA-extractable manganese. Critical level: 2.0 ppm (ICAR SHC)' },
      { key: 'B', label: 'Boron (B)', unit: 'ppm', min: 0, max: 10, placeholder: 'e.g. 0.7', tip: 'Hot water extractable boron. Critical level: 0.5 ppm (ICAR SHC)' },
    ],
  },
  {
    code: '04',
    section: 'Soil Properties',
    accent: '#C88A14',
    icon: <Sliders size={16} />,
    params: [
      { key: 'ph', label: 'Soil pH', unit: '', min: 3.0, max: 11.0, placeholder: 'e.g. 7.2', step: 0.1, tip: 'pH in 1:2 soil:water. Optimal 6.5–7.5. <6 acidic, >8.5 alkaline (ICAR)' },
      { key: 'EC', label: 'Electrical Conductivity (EC)', unit: 'dS/m', min: 0, max: 20, placeholder: 'e.g. 0.4', step: 0.01, tip: 'Soil salinity. Normal <1.0 dS/m. >4 dS/m injurious to most crops (ICAR)' },
      { key: 'OC', label: 'Organic Carbon (OC)', unit: '%', min: 0, max: 5, placeholder: 'e.g. 0.45', step: 0.01, tip: 'Walkley-Black method. Low <0.5%, Medium 0.5–0.75%, High >0.75% (ICAR)' },
    ],
  },
]

export default function SoilTest() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { soilData, setSoilData, dataSource, setDataSource } = useApp()
  const [tooltip, setTooltip] = useState(null)

  const update = (key, value) => {
    setSoilData(prev => ({ ...prev, [key]: value }))
    setDataSource('manual')
  }

  const handleLoadSampleSoil = () => {
    setSoilData(SAMPLE_SOIL_PRESET)
    setDataSource('sample')
  }

  const hasInvalidValues = SOIL_PARAMS.some(section =>
    section.params.some(p => {
      const raw = soilData[p.key]
      if (raw === '' || raw === null || raw === undefined) return false
      const num = parseFloat(raw)
      return Number.isNaN(num) || num < p.min || num > p.max
    })
  )

  const filledCount = Object.values(soilData).filter(v => v !== '' && v !== null).length
  const totalCount = 12
  const pct = (filledCount / totalCount) * 100

  return (
    <StepLayout
      step={2}
      title={t('soil_test_title', 'Soil Test Values')}
      subtitle={t('soil_test_subtitle', 'Enter values from your Soil Health Card, lab assay report, or soil-testing kit')}
    >
      {/* Data Source Selector */}
      <div className="ff-card p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
              Data Entry Source
            </div>
            <div className="text-sm font-bold text-[#171814] mt-0.5">
              Active Source:{' '}
              <span className={dataSource === 'sample' ? 'text-[#8A5D0A]' : 'text-[#183B2A]'}>
                {dataSource === 'sample' ? 'Sample Dataset (Illustrative Only)' : 'Manual Soil Data Entry'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDataSource('manual')}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
                dataSource === 'manual'
                  ? 'bg-[#183B2A] text-[#E7D927] border-[#183B2A]'
                  : 'bg-white text-[#171814] border-[#E5E5DC] hover:bg-[#F7F7F2]'
              }`}
            >
              Manual Input
            </button>
            <button
              type="button"
              onClick={handleLoadSampleSoil}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
                dataSource === 'sample'
                  ? 'bg-[#E7D927] text-[#171814] border-[#D6C81E]'
                  : 'bg-white text-[#171814] border-[#E5E5DC] hover:bg-[#F7F7F2]'
              }`}
            >
              Load Sample Dataset
            </button>
            <button
              type="button"
              disabled
              title="ESP32 hardware device is not currently connected"
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F7F7F2] text-[#77786F] border border-dashed border-[#D5D5C8] cursor-not-allowed inline-flex items-center gap-1.5"
            >
              <Cpu size={13} />
              <span>ESP32 Sensor (Not Connected)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator Card */}
      <div className="ff-card p-5 mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77786F]">
              Parameters Entered
            </span>
            <span className="text-sm font-extrabold font-mono-num text-[#183B2A]">
              {filledCount} / {totalCount}
            </span>
          </div>
          <div className="score-bar">
            <div
              className="score-bar-fill"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #183B2A, #398653)' }}
            />
          </div>
        </div>
        <p className="text-xs text-[#77786F] sm:max-w-[230px] leading-relaxed">
          More readings improve model confidence. Missing values are flagged honestly, never penalized.
        </p>
      </div>

      {/* Source Info Notice */}
      <div className="bg-[#FDF6E2] border border-[#E8D59B] rounded-[14px] px-4 py-3 mb-6 flex items-start gap-2.5 text-xs text-[#8A5D0A]">
        <Info size={16} className="shrink-0 mt-0.5 text-[#C88A14]" />
        <span className="leading-relaxed">
          <strong>Recommended Source:</strong> Copy readings from your official{' '}
          <strong>Soil Health Card</strong> (soilhealth.dac.gov.in) or soil laboratory report. Avoid guessing parameters.
        </span>
      </div>

      {/* Soil Parameter Cards */}
      <div className="space-y-4">
        {SOIL_PARAMS.map(section => (
          <section
            key={section.section}
            className="ff-card p-6"
            style={{ borderLeft: `4px solid ${section.accent}` }}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span style={{ color: section.accent }}>{section.icon}</span>
                <span
                  className="text-xs font-extrabold uppercase tracking-[0.08em]"
                  style={{ color: section.accent }}
                >
                  [ {section.code} · {section.section} ]
                </span>
              </div>
              <span className="text-[11px] font-mono-num text-[#9B9C92]">
                {section.params.length} parameter{section.params.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.params.map(param => {
                const raw = soilData[param.key]
                const num = parseFloat(raw)
                const isOutOfRange = raw !== '' && raw !== null && (Number.isNaN(num) || num < param.min || num > param.max)

                return (
                  <div key={param.key} className="relative">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <label htmlFor={`soil-${param.key}`} className="text-xs font-bold text-[#171814] flex-1">
                        {param.label}
                      </label>
                      <button
                        type="button"
                        aria-label={`Info about ${param.label}`}
                        className="p-0.5 text-[#77786F] hover:text-[#183B2A] cursor-pointer"
                        onMouseEnter={() => setTooltip(param.key)}
                        onMouseLeave={() => setTooltip(null)}
                        onFocus={() => setTooltip(param.key)}
                        onBlur={() => setTooltip(null)}
                      >
                        <Info size={13} />
                      </button>
                    </div>

                    {tooltip === param.key && (
                      <div className="absolute z-30 bottom-full left-0 mb-2 w-60 bg-white border border-[#E5E5DC] rounded-xl p-3 text-xs text-[#77786F] shadow-lg leading-relaxed">
                        {param.tip}
                      </div>
                    )}

                    <div className="relative">
                      <input
                        id={`soil-${param.key}`}
                        className="farm-input font-mono-num"
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step || 0.1}
                        placeholder={param.placeholder}
                        value={soilData[param.key]}
                        onChange={e => update(param.key, e.target.value)}
                        style={{
                          paddingRight: param.unit ? 62 : 14,
                          borderColor: isOutOfRange ? 'var(--ff-error)' : undefined,
                        }}
                      />
                      {param.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#77786F] pointer-events-none">
                          {param.unit}
                        </span>
                      )}
                    </div>

                    {isOutOfRange ? (
                      <p className="text-[11px] text-[#C93F3F] mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> Valid range: {param.min} – {param.max} {param.unit}
                      </p>
                    ) : soilData[param.key] === '' ? (
                      <p className="text-[11px] text-[#9B9C92] mt-1">
                        Optional ({param.min}–{param.max}{param.unit ? ` ${param.unit}` : ''})
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 mt-8">
        <button type="button" className="btn-agrin-outline" onClick={() => navigate('/farm-details')}>
          <ArrowLeft size={15} />
          <span>{t('btn_back', 'Back')}</span>
        </button>
        <button
          type="button"
          className="btn-agrin-cta"
          disabled={hasInvalidValues}
          onClick={() => navigate('/environment')}
          title={hasInvalidValues ? 'Please fix out-of-range soil values before continuing' : ''}
        >
          <span>{t('btn_next_env', 'Next: Environment')}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </StepLayout>
  )
}
