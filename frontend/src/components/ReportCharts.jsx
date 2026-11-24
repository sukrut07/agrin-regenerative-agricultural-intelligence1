import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { ArrowRight, Sprout, FlaskConical, Shield, BarChart3, Layers } from 'lucide-react'

const SERIES_COLORS = ['#183B2A', '#C88A14', '#2E6CA4', '#77772B']

function getScoreBarColor(score) {
  if (score >= 75) return '#183B2A'
  if (score >= 55) return '#398653'
  if (score >= 35) return '#C88A14'
  return '#C93F3F'
}

/** Shared Recharts tooltip styled to match AgriN editorial cards */
function EditorialTooltip({ active, payload, label, suffix = '', metaLookup }) {
  if (!active || !payload || payload.length === 0) return null
  const extra = metaLookup && label ? metaLookup[label] : null

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5DC',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(23, 24, 20, 0.12)',
        fontSize: '0.78rem',
        color: '#171814',
        minWidth: 165,
      }}
    >
      <div style={{ fontWeight: 800, color: '#183B2A', marginBottom: 4 }}>{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
          <span style={{ color: '#77786F', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || '#183B2A', display: 'inline-block' }} />
            {entry.name}
          </span>
          <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
            {typeof entry.value === 'number' ? Math.round(entry.value * 10) / 10 : entry.value}{suffix}
          </span>
        </div>
      ))}
      {extra && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #F0F0E8', fontSize: '0.72rem', color: '#77786F' }}>
          {extra}
        </div>
      )}
    </div>
  )
}

/** Compact circular SVG gauge matching AgriN editorial palette */
function EditorialRing({ value = 0, max = 100, color = '#183B2A', size = 64 }) {
  const pct = Math.max(0, Math.min(100, (Number(value || 0) / max) * 100))
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E5DC" strokeWidth={5.5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5.5}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-extrabold font-mono-num text-xs sm:text-sm" style={{ color }}>
          {Math.round(pct)}
        </span>
      </div>
    </div>
  )
}

/**
 * 1. Executive Visual KPI Strip (Top of Report)
 */
export function ReportKpiVisualStrip({
  topCropName,
  topCropScore,
  soilScore,
  soilStatus,
  resilienceScore,
  resilienceTier,
  qualityPct,
  confidenceLevel,
}) {
  const kpis = [
    {
      label: 'Top Crop Fit',
      value: `${Math.round(topCropScore || 0)}%`,
      sub: topCropName || 'Evaluated Crop',
      ringVal: topCropScore || 0,
      color: '#183B2A',
      icon: <Sprout size={14} />,
      anchor: '#section-crops',
    },
    {
      label: 'Soil Health Index',
      value: `${Math.round(soilScore || 0)}/100`,
      sub: String(soilStatus || 'EVALUATED').replace(/_/g, ' '),
      ringVal: soilScore || 0,
      color: '#398653',
      icon: <FlaskConical size={14} />,
      anchor: '#section-soil',
    },
    {
      label: 'Farm Resilience',
      value: `${Math.round(resilienceScore || 0)}/100`,
      sub: String(resilienceTier || 'MODERATE').replace(/_/g, ' '),
      ringVal: resilienceScore || 0,
      color: '#77772B',
      icon: <Shield size={14} />,
      anchor: '#section-resilience',
    },
    {
      label: 'Data Quality',
      value: `${Math.round(qualityPct || 0)}%`,
      sub: `Confidence: ${confidenceLevel || 'MEDIUM'}`,
      ringVal: qualityPct || 0,
      color: '#2E6CA4',
      icon: <BarChart3 size={14} />,
      anchor: '#section-confidence',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {kpis.map((item) => (
        <a
          key={item.label}
          href={item.anchor}
          className="bg-[#F7F7F2] hover:bg-white border border-[#E5E5DC] hover:border-[#183B2A]/40 rounded-2xl p-4 flex items-center gap-3.5 transition-all no-underline text-inherit"
        >
          <EditorialRing value={item.ringVal} color={item.color} size={58} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#77786F] flex items-center gap-1">
              <span style={{ color: item.color }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <div className="text-xl font-extrabold font-mono-num text-[#171814] leading-tight mt-0.5">
              {item.value}
            </div>
            <div className="text-[11px] font-semibold text-[#77786F] truncate mt-0.5" title={item.sub}>
              {item.sub}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

/**
 * 2. Interactive Crop Suitability Bar Chart (Overall / ML vs Rule / 4-Dimension Fit)
 */
export function CropSuitabilityChartCard({ crops = [], onSelectCrop }) {
  const [chartMode, setChartMode] = useState('overall')
  const [activeCropKey, setActiveCropKey] = useState(() => crops[0]?.crop || null)

  const chartData = useMemo(() => {
    return crops.slice(0, 8).map((c) => {
      const score = c.overall_score != null ? c.overall_score : (c.final_score ?? 0)
      const mlScore = c.ml_score != null ? c.ml_score : Math.round((c.ml_probability || 0) * 100)
      const ruleScore = c.rule_score != null ? c.rule_score : score
      return {
        key: c.crop,
        name: (c.common_name || c.crop || '').split('/')[0].trim(),
        fullName: c.common_name || c.crop,
        overall: Math.round(score * 10) / 10,
        mlScore: Math.round(mlScore * 10) / 10,
        ruleScore: Math.round(ruleScore * 10) / 10,
        soil: Math.round((c.soil_compatibility ?? 0) * 10) / 10,
        weather: Math.round((c.weather_compatibility ?? 0) * 10) / 10,
        water: Math.round((c.water_compatibility ?? 0) * 10) / 10,
        season: Math.round((c.season_compatibility ?? 0) * 10) / 10,
        classification: c.classification || 'Evaluated',
        raw: c,
      }
    })
  }, [crops])

  const metaLookup = useMemo(() => {
    const map = {}
    chartData.forEach((d) => {
      map[d.name] = `${d.classification} · Soil ${d.soil}% · Weather ${d.weather}%`
    })
    return map
  }, [chartData])

  const selectedEntry = chartData.find((d) => d.key === activeCropKey) || chartData[0]

  if (chartData.length === 0) return null

  const MODES = [
    { id: 'overall', label: 'Overall Score' },
    { id: 'decomposition', label: 'Rule Engine vs ML' },
    { id: 'factors', label: 'Soil / Climate / Water / Season' },
  ]

  return (
    <div className="bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 sm:p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
            [ INTERACTIVE VISUALIZATION ]
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#171814]">
            Top {chartData.length} Crop Suitability Comparison
          </h3>
        </div>

        {/* Mode Switcher */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-full border border-[#E5E5DC]">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setChartMode(m.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                chartMode === m.id
                  ? 'bg-[#183B2A] text-[#E7D927]'
                  : 'text-[#77786F] hover:text-[#171814]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
            onClick={(state) => {
              const clickedName = state?.activeLabel
              const match = chartData.find((d) => d.name === clickedName)
              if (match) setActiveCropKey(match.key)
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#E5E5DC' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#77786F', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<EditorialTooltip suffix="%" metaLookup={metaLookup} />} />

            {chartMode === 'overall' && (
              <>
                <ReferenceLine y={55} stroke="#398653" strokeDasharray="4 4" />
                <Bar dataKey="overall" name="Suitability Score" radius={[8, 8, 0, 0]} maxBarSize={46} cursor="pointer">
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.key === activeCropKey ? '#E7D927' : getScoreBarColor(entry.overall)}
                      stroke={entry.key === activeCropKey ? '#183B2A' : 'none'}
                      strokeWidth={entry.key === activeCropKey ? 2 : 0}
                    />
                  ))}
                </Bar>
              </>
            )}

            {chartMode === 'decomposition' && (
              <>
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar dataKey="ruleScore" name="ICAR Agronomic Rules (50%)" fill="#183B2A" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="mlScore" name="Random Forest ML (50%)" fill="#C88A14" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </>
            )}

            {chartMode === 'factors' && (
              <>
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar dataKey="soil" name="Soil Fit" fill="#183B2A" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="weather" name="Weather Fit" fill="#2E6CA4" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="water" name="Water Fit" fill="#398653" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="season" name="Season Fit" fill="#E7D927" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Selected Crop Inspector */}
      {selectedEntry && (
        <div className="mt-3 pt-3 border-t border-[#E5E5DC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-extrabold text-[#183B2A]">{selectedEntry.fullName}</span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E5DC] font-mono-num font-bold text-[#171814]">
              Final: {selectedEntry.overall}%
            </span>
            <span className="text-[#77786F] font-mono-num">
              Rule: <strong className="text-[#183B2A]">{selectedEntry.ruleScore}%</strong> · ML:{' '}
              <strong className="text-[#C88A14]">{selectedEntry.mlScore}%</strong> · Soil:{' '}
              <strong className="text-[#171814]">{selectedEntry.soil}%</strong>
            </span>
          </div>
          {onSelectCrop && (
            <button
              type="button"
              onClick={() => onSelectCrop(selectedEntry.raw)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#183B2A] hover:underline cursor-pointer"
            >
              <span>Inspect Parameter Audit</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 3. Side-by-Side Candidate Crop Radar + Grouped Bar Chart
 */
export function CropComparisonCharts({ evaluations = [] }) {
  if (!evaluations || evaluations.length < 2) return null

  const radarData = [
    {
      metric: 'Overall',
      ...Object.fromEntries(evaluations.map((e) => [e.crop_name, Math.round(e.overall_score || 0)])),
    },
    {
      metric: 'Soil Fit',
      ...Object.fromEntries(evaluations.map((e) => [e.crop_name, Math.round(e.soil_compatibility || 0)])),
    },
    {
      metric: 'Climate Fit',
      ...Object.fromEntries(evaluations.map((e) => [e.crop_name, Math.round(e.weather_compatibility || 0)])),
    },
    {
      metric: 'Water Fit',
      ...Object.fromEntries(evaluations.map((e) => [e.crop_name, Math.round(e.water_compatibility || 0)])),
    },
    {
      metric: 'Season Fit',
      ...Object.fromEntries(evaluations.map((e) => [e.crop_name, Math.round(e.season_compatibility || 0)])),
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      {/* Multi-axis Radar Comparison */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-4">
        <div className="text-xs font-extrabold text-[#171814] mb-1">Multi-Dimensional Suitability Radar</div>
        <div className="text-[11px] text-[#77786F] mb-2">Compare strengths across soil, climate, water &amp; season</div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="#E5E5DC" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9B9C92', fontSize: 9 }} />
              {evaluations.map((ce, i) => (
                <Radar
                  key={ce.crop_name}
                  name={ce.crop_name}
                  dataKey={ce.crop_name}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip content={<EditorialTooltip suffix="%" />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped Bar Comparison */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-4">
        <div className="text-xs font-extrabold text-[#171814] mb-1">Side-by-Side Dimension Bars</div>
        <div className="text-[11px] text-[#77786F] mb-2">Hover bars to inspect exact trade-off values</div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={radarData} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" vertical={false} />
              <XAxis dataKey="metric" tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip content={<EditorialTooltip suffix="%" />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {evaluations.map((ce, i) => (
                <Bar
                  key={ce.crop_name}
                  dataKey={ce.crop_name}
                  name={ce.crop_name}
                  fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={22}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/**
 * 4. Soil Health Benchmark & Component Scores Charts
 */
export function SoilHealthCharts({ soilHealth = {}, soilData = {} }) {
  const componentScores = soilHealth?.component_scores || {}
  const nutrientStatus = soilHealth?.nutrient_status || {}
  const micronutrients = soilHealth?.micronutrient_status || {}
  const chem = soilHealth?.chemical_properties || {}
  const om = soilHealth?.organic_matter || {}

  const componentBars = [
    { name: 'Macronutrients (NPK)', score: componentScores.macronutrients },
    { name: 'Chemical Balance (pH/EC)', score: componentScores.chemical_balance },
    { name: 'Organic Matter (OC)', score: componentScores.organic_matter },
  ].filter((item) => item.score != null)

  // Normalize key soil readings against ICAR optimal target (= 100%)
  const benchmarkSpecs = [
    {
      name: 'Nitrogen (N)',
      val: nutrientStatus.N?.value ?? (soilData.N !== '' ? Number(soilData.N) : null),
      target: 280,
      unit: 'kg/ha',
      status: nutrientStatus.N?.status || 'MEASURED',
    },
    {
      name: 'Phosphorus (P)',
      val: nutrientStatus.P?.value ?? (soilData.P !== '' ? Number(soilData.P) : null),
      target: 15,
      unit: 'kg/ha',
      status: nutrientStatus.P?.status || 'MEASURED',
    },
    {
      name: 'Potassium (K)',
      val: nutrientStatus.K?.value ?? (soilData.K !== '' ? Number(soilData.K) : null),
      target: 180,
      unit: 'kg/ha',
      status: nutrientStatus.K?.status || 'MEASURED',
    },
    {
      name: 'Org. Carbon',
      val: om?.value ?? (soilData.OC !== '' ? Number(soilData.OC) : null),
      target: 0.75,
      unit: '%',
      status: om?.classification || 'MEASURED',
    },
    {
      name: 'Zinc (Zn)',
      val: micronutrients.Zn?.value ?? (soilData.Zn !== '' ? Number(soilData.Zn) : null),
      target: 0.6,
      unit: 'ppm',
      status: micronutrients.Zn?.status || 'MEASURED',
    },
    {
      name: 'Sulphur (S)',
      val: micronutrients.S?.value ?? (soilData.S !== '' ? Number(soilData.S) : null),
      target: 10,
      unit: 'ppm',
      status: micronutrients.S?.status || 'MEASURED',
    },
  ]

  const benchmarkData = benchmarkSpecs
    .filter((b) => b.val != null && !Number.isNaN(Number(b.val)))
    .map((b) => {
      const pct = Math.min(200, Math.round((Number(b.val) / b.target) * 100))
      return {
        name: b.name,
        pctOfBenchmark: pct,
        measuredText: `${b.val} ${b.unit} (Target ≥ ${b.target} ${b.unit}) · ${String(b.status).replace(/_/g, ' ')}`,
      }
    })

  const metaLookup = Object.fromEntries(benchmarkData.map((d) => [d.name, d.measuredText]))
  const phVal = chem?.pH?.value ?? (soilData.ph !== '' ? Number(soilData.ph) : null)

  if (componentBars.length === 0 && benchmarkData.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
      {/* Left: Soil Component Bars + pH Spectrum Gauge */}
      <div className="lg:col-span-5 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 flex flex-col justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
            [ SOIL PILLARS ]
          </div>
          <div className="text-sm font-extrabold text-[#171814] mb-3">
            Component Health Breakdown
          </div>

          <div className="space-y-3">
            {componentBars.map((bar) => (
              <div key={bar.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#171814]">{bar.name}</span>
                  <span className="font-mono-num font-bold text-[#183B2A]">{Math.round(bar.score)}/100</span>
                </div>
                <div className="score-bar" style={{ height: 9 }}>
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(4, bar.score))}%`,
                      background: getScoreBarColor(bar.score),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual pH Scale Bar */}
        {phVal != null && !Number.isNaN(phVal) && (
          <div className="bg-white border border-[#E5E5DC] rounded-xl p-3">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-[#171814]">Soil pH Spectrum</span>
              <span className="font-mono-num font-extrabold text-[#183B2A]">
                pH {phVal} ({chem?.pH?.classification || 'Evaluated'})
              </span>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-[#C93F3F]/80" title="Acidic (<5.5)" />
              <div className="flex-1 bg-[#C88A14]/75" title="Slightly Acidic (5.5-6.5)" />
              <div className="flex-1 bg-[#2B7A4B]" title="Neutral Ideal (6.5-7.5)" />
              <div className="flex-1 bg-[#C88A14]/75" title="Mild Alkaline (7.5-8.5)" />
              <div className="flex-1 bg-[#C93F3F]/80" title="Strongly Alkaline (>8.5)" />
            </div>
            <div className="relative h-4 mt-0.5">
              <div
                className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${Math.min(96, Math.max(4, ((phVal - 4) / 6) * 100))}%` }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#183B2A] border-2 border-[#E7D927] block shadow-xs" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono-num text-[#9B9C92]">
              <span>4.0 Acidic</span>
              <span className="text-[#183B2A] font-bold">6.5–7.5 Optimal</span>
              <span>10.0 Alkaline</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: ICAR Nutrient Benchmark Bar Chart */}
      <div className="lg:col-span-7 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
              [ ICAR BENCHMARK RATIO ]
            </div>
            <div className="text-sm font-extrabold text-[#171814]">
              Supplied Nutrients vs Optimal Threshold (100%)
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 225 }}>
          <ResponsiveContainer width="100%" height={225}>
            <BarChart
              data={benchmarkData}
              layout="vertical"
              margin={{ top: 6, right: 20, left: 12, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
              <XAxis type="number" domain={[0, 200]} unit="%" tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
              <YAxis type="category" dataKey="name" width={92} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <ReferenceLine x={100} stroke="#183B2A" strokeDasharray="4 4" strokeWidth={1.5} />
              <Tooltip content={<EditorialTooltip suffix="%" metaLookup={metaLookup} />} />
              <Bar dataKey="pctOfBenchmark" name="% of ICAR Optimal" radius={[0, 6, 6, 0]} maxBarSize={20}>
                {benchmarkData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.pctOfBenchmark >= 100 ? '#183B2A' : entry.pctOfBenchmark >= 70 ? '#C88A14' : '#C93F3F'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/**
 * 5. Farm Resilience 5-Pillar Radar + Strengths/Vulnerability Bar Chart
 */
export function ResilienceVisuals({ components = {}, weights = {} }) {
  const pillars = [
    { name: 'Soil Health', key: 'soil_health', weight: weights.soil_health ?? 0.25 },
    { name: 'Water Context', key: 'water_context', weight: weights.water_context ?? 0.25 },
    { name: 'Climate Context', key: 'climate_context', weight: weights.climate_context ?? 0.20 },
    { name: 'Crop Diversity', key: 'crop_diversity', weight: weights.crop_diversity ?? 0.15 },
    { name: 'Crop Suitability', key: 'crop_suitability', weight: weights.crop_suitability ?? 0.15 },
  ]

  const data = pillars.map((p) => ({
    name: p.name,
    shortName: p.name.replace(' Context', '').replace('Crop ', ''),
    score: Math.round((components[p.key] ?? 65) * 10) / 10,
    weightLabel: `Weight: ${Math.round(p.weight * 100)}%`,
  }))

  const metaLookup = Object.fromEntries(data.map((d) => [d.name, d.weightLabel]))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
      <div className="lg:col-span-5 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
          [ 5-PILLAR BIOPHYSICAL BALANCE ]
        </div>
        <div className="text-sm font-extrabold text-[#171814] mb-1">Resilience Polygon</div>
        <div style={{ width: '100%', height: 230 }}>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#E5E5DC" />
              <PolarAngleAxis dataKey="shortName" tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9B9C92', fontSize: 9 }} />
              <Radar
                name="Resilience Score"
                dataKey="score"
                stroke="#183B2A"
                fill="#398653"
                fillOpacity={0.28}
                strokeWidth={2}
              />
              <Tooltip content={<EditorialTooltip suffix="/100" metaLookup={metaLookup} />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-7 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
          [ PILLAR COMPARISON ]
        </div>
        <div className="text-sm font-extrabold text-[#171814] mb-1">
          Strengths vs Vulnerabilities by Pillar
        </div>
        <div style={{ width: '100%', height: 230 }}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
              <YAxis type="category" dataKey="name" width={104} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <ReferenceLine x={70} stroke="#398653" strokeDasharray="4 4" />
              <Tooltip content={<EditorialTooltip suffix="/100" metaLookup={metaLookup} />} />
              <Bar dataKey="score" name="Pillar Score" radius={[0, 6, 6, 0]} maxBarSize={20}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={getScoreBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/**
 * 6. Interactive Data Confidence vs Data Quality Chart
 */
export function ConfidenceVisuals({ confidence = {}, dataQuality = {} }) {
  const [view, setView] = useState('confidence')

  const confFactors = confidence?.factors || {}
  const qualityMetrics = dataQuality?.metrics || {}

  const confData = [
    { name: 'Completeness', weight: '30% weight', score: Math.round((confFactors.completeness ?? confidence?.dimensions?.input_completeness ?? 0.75) * 100) },
    { name: 'Data Freshness', weight: '20% weight', score: Math.round((confFactors.freshness ?? confidence?.dimensions?.sensor_freshness ?? 0.7) * 100) },
    { name: 'Geo Precision', weight: '20% weight', score: Math.round((confFactors.geographic_precision ?? confidence?.dimensions?.geographic_resolution ?? 0.7) * 100) },
    { name: 'Model Evidence', weight: '15% weight', score: Math.round((confFactors.model_confidence ?? confidence?.dimensions?.model_calibration ?? 0.5) * 100) },
    { name: 'Rule Coverage', weight: '15% weight', score: Math.round((confFactors.rule_coverage ?? 1.0) * 100) },
  ]

  const qualData = [
    { name: 'Completeness', weight: '35% weight', score: Math.round((qualityMetrics.completeness ?? 0.75) * 100) },
    { name: 'Weather Freshness', weight: '25% weight', score: Math.round((qualityMetrics.freshness ?? 0.8) * 100) },
    { name: 'Geo Resolution', weight: '20% weight', score: Math.round((qualityMetrics.geographic_precision ?? 0.6) * 100) },
    { name: 'Source Reliability', weight: '20% weight', score: Math.round((qualityMetrics.source_reliability ?? 0.85) * 100) },
  ]

  const activeData = view === 'confidence' ? confData : qualData
  const metaLookup = Object.fromEntries(activeData.map((d) => [d.name, d.weight]))

  return (
    <div className="bg-white border border-[#E5E5DC] rounded-2xl p-4 mb-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs font-extrabold text-[#171814] flex items-center gap-1.5">
          <Layers size={14} className="text-[#183B2A]" />
          <span>{view === 'confidence' ? '5-Dimension Confidence Breakdown' : '4-Dimension Data Quality Breakdown'}</span>
        </div>

        <div className="flex gap-1 bg-[#F7F7F2] p-1 rounded-full border border-[#E5E5DC]">
          <button
            type="button"
            onClick={() => setView('confidence')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
              view === 'confidence' ? 'bg-[#183B2A] text-[#E7D927]' : 'text-[#77786F]'
            }`}
          >
            Confidence Factors
          </button>
          <button
            type="button"
            onClick={() => setView('quality')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
              view === 'quality' ? 'bg-[#183B2A] text-[#E7D927]' : 'text-[#77786F]'
            }`}
          >
            Data Quality Metrics
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 205 }}>
        <ResponsiveContainer width="100%" height={205}>
          <BarChart data={activeData} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={114} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <ReferenceLine x={75} stroke="#183B2A" strokeDasharray="4 4" />
            <Tooltip content={<EditorialTooltip suffix="%" metaLookup={metaLookup} />} />
            <Bar dataKey="score" name="Score" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {activeData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.score >= 75 ? '#183B2A' : entry.score >= 55 ? '#2E6CA4' : '#C88A14'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
