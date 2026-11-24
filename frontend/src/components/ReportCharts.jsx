import React, { useState, useMemo, useEffect, useRef } from 'react'
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
  PieChart,
  Pie,
} from 'recharts'
import {
  ArrowRight,
  Sprout,
  FlaskConical,
  Shield,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react'

const SERIES_COLORS = ['#183B2A', '#C88A14', '#2E6CA4', '#77772B']

const SEVERITY_META = {
  CRITICAL: { color: '#C93F3F', bg: '#FEE2E2', label: 'Critical' },
  HIGH: { color: '#C88A14', bg: '#FEF3C7', label: 'High' },
  MEDIUM: { color: '#2E6CA4', bg: '#E0F2FE', label: 'Medium' },
  LOW: { color: '#77786F', bg: '#F3F4F6', label: 'Low' },
}

const REGEN_FOCUS_META = [
  {
    id: 'Carbon & Biomass',
    color: '#183B2A',
    keywords: ['organic carbon', 'soc', 'humus', 'mulch', 'residue', 'cover crop', 'green manure', 'biomass'],
  },
  {
    id: 'Moisture & Runoff',
    color: '#2E6CA4',
    keywords: ['moisture', 'bbf', 'broad bed furrow', 'rainfed', 'runoff', 'percolation', 'water'],
  },
  {
    id: 'Nutrients & Tillage',
    color: '#C88A14',
    keywords: ['tillage', 'nutrient', 'inm', 'bio-priming', 'fertilizer', 'aggregate', 'hardpan'],
  },
  {
    id: 'Canopy & Biodiversity',
    color: '#398653',
    keywords: ['intercrop', 'polyculture', 'canopy', 'taproot', 'diversity'],
  },
]

export function classifyRegenFocus(opp) {
  const haystack = `${opp?.practice || ''} ${opp?.trigger || ''} ${opp?.why || ''} ${opp?.objective || ''}`.toLowerCase()
  for (const spec of REGEN_FOCUS_META) {
    if (spec.keywords.some((kw) => haystack.includes(kw))) {
      return spec.id
    }
  }
  return 'Ecological Stewardship'
}

function getScoreBarColor(score) {
  if (score >= 75) return '#183B2A'
  if (score >= 55) return '#398653'
  if (score >= 35) return '#C88A14'
  return '#C93F3F'
}

/**
 * Triggers animations right when the chart container scrolls into view
 * (so below-the-fold charts don't finish animating off-screen at mount time).
 */
function useInViewAnimation(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    )

    observer.observe(el)
    const fallback = setTimeout(() => setInView(true), 1400)
    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [threshold])

  return [ref, inView]
}

/** Smoothly counts a numeric KPI from 0 -> target when revealed */
function useCountUp(target, active, duration = 850) {
  const numericTarget = Number(target || 0)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(numericTarget)
      return
    }
    let rafId = null
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(numericTarget * eased)
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        setValue(numericTarget)
      }
    }
    rafId = requestAnimationFrame(step)
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [numericTarget, active, duration])

  return value
}

/** Shared Recharts tooltip styled to match AgriN editorial cards */
function EditorialTooltip({ active, payload, label, suffix = '', metaLookup }) {
  if (!active || !payload || payload.length === 0) return null
  const heading = label || payload[0]?.name || payload[0]?.payload?.name || ''
  const extra = metaLookup && heading ? metaLookup[heading] : payload[0]?.payload?.tooltipHint

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5DC',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(23, 24, 20, 0.14)',
        fontSize: '0.78rem',
        color: '#171814',
        minWidth: 165,
      }}
    >
      {heading && <div style={{ fontWeight: 800, color: '#183B2A', marginBottom: 4 }}>{heading}</div>}
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 2 }}>
          <span style={{ color: '#77786F', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: entry.color || entry.payload?.color || '#183B2A',
                display: 'inline-block',
              }}
            />
            {entry.name}
          </span>
          <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
            {typeof entry.value === 'number' ? Math.round(entry.value * 10) / 10 : entry.value}
            {suffix}
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

/** Compact circular SVG gauge with smooth stroke-draw & count-up animation */
function EditorialRing({ value = 0, max = 100, color = '#183B2A', size = 64, animate = true }) {
  const pct = Math.max(0, Math.min(100, (Number(value || 0) / max) * 100))
  const animatedDisplay = useCountUp(pct, animate, 950)
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const offset = animate ? c - (pct / 100) * c : c

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
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-extrabold font-mono-num text-xs sm:text-sm" style={{ color }}>
          {Math.round(animatedDisplay)}
        </span>
      </div>
    </div>
  )
}

function AnimatedKpiValue({ value, suffix = '', active }) {
  const animated = useCountUp(value, active, 900)
  return (
    <>
      {Math.round(animated)}
      {suffix}
    </>
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
  const [stripRef, inView] = useInViewAnimation(0.1)

  const kpis = [
    {
      label: 'Top Crop Fit',
      numericValue: topCropScore || 0,
      suffix: '%',
      sub: topCropName || 'Evaluated Crop',
      ringVal: topCropScore || 0,
      color: '#183B2A',
      icon: <Sprout size={14} />,
      anchor: '#section-crops',
    },
    {
      label: 'Soil Health Index',
      numericValue: soilScore || 0,
      suffix: '/100',
      sub: String(soilStatus || 'EVALUATED').replace(/_/g, ' '),
      ringVal: soilScore || 0,
      color: '#398653',
      icon: <FlaskConical size={14} />,
      anchor: '#section-soil',
    },
    {
      label: 'Farm Resilience',
      numericValue: resilienceScore || 0,
      suffix: '/100',
      sub: String(resilienceTier || 'MODERATE').replace(/_/g, ' '),
      ringVal: resilienceScore || 0,
      color: '#77772B',
      icon: <Shield size={14} />,
      anchor: '#section-resilience',
    },
    {
      label: 'Data Quality',
      numericValue: qualityPct || 0,
      suffix: '%',
      sub: `Confidence: ${confidenceLevel || 'MEDIUM'}`,
      ringVal: qualityPct || 0,
      color: '#2E6CA4',
      icon: <BarChart3 size={14} />,
      anchor: '#section-confidence',
    },
  ]

  return (
    <div ref={stripRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {kpis.map((item, idx) => (
        <a
          key={item.label}
          href={item.anchor}
          style={{ animationDelay: `${idx * 80}ms` }}
          className={`bg-[#F7F7F2] hover:bg-white border border-[#E5E5DC] rounded-2xl p-4 flex items-center gap-3.5 no-underline text-inherit agrin-interactive-card ${
            inView ? 'animate-chart-reveal' : 'opacity-0'
          }`}
        >
          <EditorialRing value={item.ringVal} color={item.color} size={58} animate={inView} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#77786F] flex items-center gap-1">
              <span style={{ color: item.color }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <div className="text-xl font-extrabold font-mono-num text-[#171814] leading-tight mt-0.5">
              <AnimatedKpiValue value={item.numericValue} suffix={item.suffix} active={inView} />
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
  const [containerRef, inView] = useInViewAnimation(0.15)

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
    <div
      ref={containerRef}
      className={`bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 sm:p-5 mb-5 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}
    >
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
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all duration-200 ${
                chartMode === m.id
                  ? 'bg-[#183B2A] text-[#E7D927] shadow-xs'
                  : 'text-[#77786F] hover:text-[#171814]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area (mounted on inView & keyed by mode for crisp animated sweep) */}
      <div style={{ width: '100%', height: 280 }}>
        {inView && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              key={chartMode}
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
              <Tooltip
                cursor={{ fill: 'rgba(24, 59, 42, 0.06)' }}
                content={<EditorialTooltip suffix="%" metaLookup={metaLookup} />}
              />

              {chartMode === 'overall' && (
                <>
                  <ReferenceLine y={55} stroke="#398653" strokeDasharray="4 4" />
                  <Bar
                    dataKey="overall"
                    name="Suitability Score"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={46}
                    cursor="pointer"
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
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
                  <Bar
                    dataKey="ruleScore"
                    name="ICAR Agronomic Rules (50%)"
                    fill="#183B2A"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                    isAnimationActive
                    animationDuration={850}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="mlScore"
                    name="Random Forest ML (50%)"
                    fill="#C88A14"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                    isAnimationActive
                    animationDuration={950}
                    animationBegin={140}
                    animationEasing="ease-out"
                  />
                </>
              )}

              {chartMode === 'factors' && (
                <>
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar dataKey="soil" name="Soil Fit" fill="#183B2A" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive animationDuration={800} />
                  <Bar dataKey="weather" name="Weather Fit" fill="#2E6CA4" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive animationDuration={850} animationBegin={80} />
                  <Bar dataKey="water" name="Water Fit" fill="#398653" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive animationDuration={900} animationBegin={160} />
                  <Bar dataKey="season" name="Season Fit" fill="#E7D927" radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive animationDuration={950} animationBegin={240} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
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
  const [containerRef, inView] = useInViewAnimation(0.15)
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
    <div ref={containerRef} className={`grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}>
      {/* Multi-axis Radar Comparison */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-4 agrin-interactive-card">
        <div className="text-xs font-extrabold text-[#171814] mb-1">Multi-Dimensional Suitability Radar</div>
        <div className="text-[11px] text-[#77786F] mb-2">Compare strengths across soil, climate, water &amp; season</div>
        <div style={{ width: '100%', height: 250 }}>
          {inView && (
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
                    dot={{ r: 3, fill: SERIES_COLORS[i % SERIES_COLORS.length] }}
                    activeDot={{ r: 5 }}
                    isAnimationActive
                    animationDuration={950}
                    animationBegin={i * 120}
                    animationEasing="ease-out"
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip content={<EditorialTooltip suffix="%" />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grouped Bar Comparison */}
      <div className="bg-white border border-[#E5E5DC] rounded-xl p-4 agrin-interactive-card">
        <div className="text-xs font-extrabold text-[#171814] mb-1">Side-by-Side Dimension Bars</div>
        <div className="text-[11px] text-[#77786F] mb-2">Hover bars to inspect exact trade-off values</div>
        <div style={{ width: '100%', height: 250 }}>
          {inView && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={radarData} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" vertical={false} />
                <XAxis dataKey="metric" tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix="%" />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {evaluations.map((ce, i) => (
                  <Bar
                    key={ce.crop_name}
                    dataKey={ce.crop_name}
                    name={ce.crop_name}
                    fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={22}
                    isAnimationActive
                    animationDuration={900}
                    animationBegin={i * 100}
                    animationEasing="ease-out"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 3B. Action Queue Severity + Domain Breakdown (click bar to filter queue)
 */
export function ActionQueueVisuals({ advisories = [], selectedPriority = 'ALL', onSelectPriority }) {
  const [containerRef, inView] = useInViewAnimation(0.15)

  const severityData = useMemo(() => {
    return ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => ({
      level,
      name: SEVERITY_META[level].label,
      count: advisories.filter((a) => (a.priority || '').toUpperCase() === level).length,
      color: SEVERITY_META[level].color,
      tooltipHint: 'Click bar to filter queue below',
    }))
  }, [advisories])

  const domainData = useMemo(() => {
    const counts = {}
    advisories.forEach((a) => {
      const raw = String(a.category || 'GENERAL').replace(/_/g, ' ')
      const clean = raw
        .toLowerCase()
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
        .replace('Regenerative Opportunity', 'Regenerative')
      counts[clean] = (counts[clean] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count], idx) => ({
        name,
        count,
        color: SERIES_COLORS[idx % SERIES_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count)
  }, [advisories])

  if (!advisories || advisories.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}
    >
      {/* Left: Clickable Severity Distribution */}
      <div className="lg:col-span-6 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
              [ SEVERITY PROFILE ]
            </div>
            <div className="text-sm font-extrabold text-[#171814]">
              Actions by Risk Severity (Click Bar to Filter)
            </div>
          </div>
          {selectedPriority !== 'ALL' && onSelectPriority && (
            <button
              type="button"
              onClick={() => onSelectPriority('ALL')}
              className="text-[11px] font-bold text-[#183B2A] underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div style={{ width: '100%', height: 165 }}>
          {inView && (
            <ResponsiveContainer width="100%" height={165}>
              <BarChart
                data={severityData}
                layout="vertical"
                margin={{ top: 6, right: 20, left: 4, bottom: 2 }}
                onClick={(state) => {
                  const clickedLabel = state?.activeLabel
                  const match = severityData.find((d) => d.name === clickedLabel)
                  if (match && onSelectPriority) {
                    onSelectPriority(selectedPriority === match.level ? 'ALL' : match.level)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={68} tick={{ fill: '#171814', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix=" items" />} />
                <Bar
                  dataKey="count"
                  name="Advisories"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                  cursor="pointer"
                  isAnimationActive
                  animationDuration={850}
                  animationEasing="ease-out"
                >
                  {severityData.map((entry) => {
                    const isSelected = selectedPriority === entry.level
                    return (
                      <Cell
                        key={entry.level}
                        fill={entry.color}
                        fillOpacity={selectedPriority === 'ALL' || isSelected ? 1 : 0.35}
                        stroke={isSelected ? '#171814' : 'none'}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Right: Action Domain Mix */}
      <div className="lg:col-span-6 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
          [ AGRONOMIC DOMAIN MIX ]
        </div>
        <div className="text-sm font-extrabold text-[#171814] mb-1">
          Recommendations by Operational Category
        </div>

        <div style={{ width: '100%', height: 165 }}>
          {inView && (
            <ResponsiveContainer width="100%" height={165}>
              <BarChart data={domainData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#171814', fontSize: 10.5, fontWeight: 600 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix=" actions" />} />
                <Bar
                  dataKey="count"
                  name="Action Count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                  isAnimationActive
                  animationDuration={950}
                  animationBegin={120}
                  animationEasing="ease-out"
                >
                  {domainData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 3C. Section 3 ("Why AgriN Recommends This") Hybrid Scoring & Evidence Chart
 */
export function WhyExplanationVisuals({ topCrop = {}, explanation = {}, confidence = {}, soilHealth = {} }) {
  const [view, setView] = useState('drivers')
  const [containerRef, inView] = useInViewAnimation(0.15)

  const driverData = useMemo(() => {
    const overall = topCrop?.overall_score ?? topCrop?.final_score
    const rule = topCrop?.rule_score
    const ml = topCrop?.ml_score ?? (topCrop?.ml_probability != null ? topCrop.ml_probability * 100 : null)
    const items = [
      { name: 'Final Blend', score: overall, color: '#183B2A', hint: '50% ICAR Rules + 50% ML Model' },
      { name: 'ICAR Rules', score: rule, color: '#398653', hint: 'Agronomic threshold match' },
      { name: 'Random Forest ML', score: ml, color: '#C88A14', hint: 'Trained statistical probability' },
      { name: 'Soil Fit', score: topCrop?.soil_compatibility, color: '#2E6CA4', hint: 'Soil chemistry & nutrient match' },
      { name: 'Climate Fit', score: topCrop?.weather_compatibility, color: '#77772B', hint: 'Temperature, humidity & rain alignment' },
      { name: 'Season Fit', score: topCrop?.season_compatibility, color: '#183B2A', hint: 'Seasonal cropping window fit' },
      { name: 'Water Fit', score: topCrop?.water_compatibility, color: '#398653', hint: 'Irrigation & rainfall demand match' },
    ]
    return items
      .filter((d) => d.score != null && !Number.isNaN(Number(d.score)))
      .map((d) => ({
        name: d.name,
        score: Math.round(Number(d.score) * 10) / 10,
        color: d.color,
        tooltipHint: d.hint,
      }))
  }, [topCrop])

  const supportingCount = Array.isArray(explanation?.why)
    ? explanation.why.length
    : Array.isArray(topCrop?.reason?.why)
      ? topCrop.reason.why.length
      : (explanation?.why ? 1 : 0)

  const constraintsCount =
    (Array.isArray(topCrop?.reason?.considerations) ? topCrop.reason.considerations.length : 0) +
    (Array.isArray(topCrop?.risk_factors) ? topCrop.risk_factors.length : 0) +
    (Array.isArray(soilHealth?.soil_constraints) ? soilHealth.soil_constraints.length : 0)

  const limitationsCount = Array.isArray(explanation?.limitations) ? explanation.limitations.length : 0
  const basedOnCount = Array.isArray(explanation?.based_on) ? explanation.based_on.length : 0

  const signalData = [
    { name: 'Supporting Signals', count: supportingCount, color: '#183B2A', tooltipHint: 'Favorable crop & soil drivers' },
    { name: 'Evidence Sources', count: basedOnCount, color: '#2E6CA4', tooltipHint: 'Evaluated telemetry / data layers' },
    { name: 'Risk / Constraints', count: constraintsCount, color: '#C88A14', tooltipHint: 'Active cautions & constraints' },
    { name: 'Model Caveats', count: limitationsCount, color: '#77786F', tooltipHint: 'Disclosed data gaps / unlinked feeds' },
  ]

  const reliabilityPct = Math.round(
    (confidence?.confidence_score != null
      ? confidence.confidence_score <= 1
        ? confidence.confidence_score * 100
        : confidence.confidence_score
      : 75)
  )

  const cropTitle = topCrop?.common_name || topCrop?.crop || 'Recommended Crop'

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}
    >
      {/* Left: Decision Engine & Compatibility Chart */}
      <div className="lg:col-span-8 bg-white border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
              [ EXPLAINABLE SCORING ENGINE ]
            </div>
            <div className="text-sm font-extrabold text-[#171814]">
              {view === 'drivers'
                ? `${cropTitle} — Why It Ranked #1`
                : 'Decision Evidence & Caveat Balance'}
            </div>
          </div>

          <div className="flex gap-1 bg-[#F7F7F2] p-1 rounded-full border border-[#E5E5DC]">
            <button
              type="button"
              onClick={() => setView('drivers')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                view === 'drivers' ? 'bg-[#183B2A] text-[#E7D927]' : 'text-[#77786F] hover:text-[#171814]'
              }`}
            >
              Score Breakdown
            </button>
            <button
              type="button"
              onClick={() => setView('signals')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                view === 'signals' ? 'bg-[#183B2A] text-[#E7D927]' : 'text-[#77786F] hover:text-[#171814]'
              }`}
            >
              Evidence Signals
            </button>
          </div>
        </div>

        <div style={{ width: '100%', height: 210 }}>
          {inView && view === 'drivers' && driverData.length > 0 && (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart key="drivers" data={driverData} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={118} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <ReferenceLine x={50} stroke="#183B2A" strokeDasharray="4 4" />
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix="%" />} />
                <Bar
                  dataKey="score"
                  name="Fit Score"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={18}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {driverData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {inView && view === 'signals' && (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart key="signals" data={signalData} margin={{ top: 8, right: 14, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix=" items" />} />
                <Bar
                  dataKey="count"
                  name="Signal Count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                  isAnimationActive
                  animationDuration={850}
                  animationEasing="ease-out"
                >
                  {signalData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Right: Assessment Reliability & Driver Snapshot */}
      <div className="lg:col-span-4 bg-white border border-[#E5E5DC] rounded-2xl p-4 flex flex-col justify-between gap-3 agrin-interactive-card">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
            [ ASSESSMENT RELIABILITY ]
          </div>
          <div className="text-sm font-extrabold text-[#171814] mb-3">
            Decision Trust Profile
          </div>

          <div className="flex items-center gap-3.5 bg-[#F7F7F2] border border-[#E5E5DC] rounded-xl p-3">
            <EditorialRing value={reliabilityPct} color="#183B2A" size={62} animate={inView} />
            <div>
              <div className="text-xs font-extrabold text-[#183B2A]">
                {confidence?.confidence_level || 'MODERATE'} RELIABILITY
              </div>
              <div className="text-[11px] text-[#77786F] mt-0.5 leading-snug">
                50% Random Forest ML + 50% ICAR Agronomic Rules
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#EAF5EE] border border-[#BBF7D0] rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#183B2A]">
              <CheckCircle2 size={12} />
              <span>Drivers</span>
            </div>
            <div className="text-lg font-extrabold font-mono-num text-[#183B2A] mt-0.5">
              <AnimatedKpiValue value={supportingCount} active={inView} />
            </div>
            <div className="text-[10px] text-[#398653] font-semibold">Supporting factors</div>
          </div>

          <div className="bg-[#FDF6E2] border border-[#FDE68A] rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#8A5D0A]">
              <AlertCircle size={12} />
              <span>Caveats</span>
            </div>
            <div className="text-lg font-extrabold font-mono-num text-[#8A5D0A] mt-0.5">
              <AnimatedKpiValue value={constraintsCount + limitationsCount} active={inView} />
            </div>
            <div className="text-[10px] text-[#9B6A00] font-semibold">Risks &amp; gaps noted</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 4. Soil Health Benchmark & Component Scores Charts
 */
export function SoilHealthCharts({ soilHealth = {}, soilData = {} }) {
  const [containerRef, inView] = useInViewAnimation(0.15)
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
    <div ref={containerRef} className={`grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}>
      {/* Left: Soil Component Bars + pH Spectrum Gauge */}
      <div className="lg:col-span-5 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 flex flex-col justify-between gap-4 agrin-interactive-card">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
            [ SOIL PILLARS ]
          </div>
          <div className="text-sm font-extrabold text-[#171814] mb-3">
            Component Health Breakdown
          </div>

          <div className="space-y-3">
            {componentBars.map((bar, idx) => (
              <div key={bar.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#171814]">{bar.name}</span>
                  <span className="font-mono-num font-bold text-[#183B2A]">
                    <AnimatedKpiValue value={bar.score} suffix="/100" active={inView} />
                  </span>
                </div>
                <div className="score-bar" style={{ height: 9 }}>
                  <div
                    className="score-bar-fill"
                    style={{
                      width: inView ? `${Math.min(100, Math.max(4, bar.score))}%` : '0%',
                      background: getScoreBarColor(bar.score),
                      transition: `width 0.95s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 100}ms`,
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
                style={{
                  left: inView ? `${Math.min(96, Math.max(4, ((phVal - 4) / 6) * 100))}%` : '50%',
                  transition: 'left 1s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
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
      <div className="lg:col-span-7 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
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
          {inView && (
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
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix="%" metaLookup={metaLookup} />} />
                <Bar
                  dataKey="pctOfBenchmark"
                  name="% of ICAR Optimal"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                  isAnimationActive
                  animationDuration={950}
                  animationEasing="ease-out"
                >
                  {benchmarkData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.pctOfBenchmark >= 100 ? '#183B2A' : entry.pctOfBenchmark >= 70 ? '#C88A14' : '#C93F3F'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 5. Regenerative Agriculture Opportunities Interactive Focus + Priority Donut Charts
 */
export function RegenerativeOpportunitiesVisuals({
  opportunities = [],
  activeFocus = 'ALL',
  activePriority = 'ALL',
  onSelectFocus,
  onSelectPriority,
}) {
  const [containerRef, inView] = useInViewAnimation(0.12)

  const focusData = useMemo(() => {
    const counts = {}
    const colorMap = {}
    REGEN_FOCUS_META.forEach((m) => {
      colorMap[m.id] = m.color
    })

    opportunities.forEach((opp) => {
      const focus = classifyRegenFocus(opp)
      counts[focus] = (counts[focus] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        shortName: name.split('&')[0].trim(),
        count,
        color: colorMap[name] || '#77772B',
        tooltipHint: 'Click bar to filter practices below',
      }))
      .sort((a, b) => b.count - a.count)
  }, [opportunities])

  const priorityData = useMemo(() => {
    const bucket = {}
    opportunities.forEach((opp) => {
      const p = String(opp.confidence || 'HIGH').toUpperCase()
      bucket[p] = (bucket[p] || 0) + 1
    })
    const palette = { HIGH: '#183B2A', MEDIUM: '#C88A14', LOW: '#77786F' }
    return Object.entries(bucket).map(([level, value]) => ({
      level,
      name: `${level.charAt(0)}${level.slice(1).toLowerCase()} Impact`,
      value,
      color: palette[level] || '#398653',
      tooltipHint: 'Click slice to filter by priority',
    }))
  }, [opportunities])

  if (!opportunities || opportunities.length === 0) return null

  return (
    <div ref={containerRef} className="mb-5">
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}>
        {/* Left: Ecological Pillar BarChart */}
        <div className="lg:col-span-7 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
                [ ECOLOGICAL LEVERAGE MIX ]
              </div>
              <div className="text-sm font-extrabold text-[#171814] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#183B2A]" />
                <span>Practices by Soil &amp; Microclimate Pillar (Click Bar to Filter)</span>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 195 }}>
            {inView && (
              <ResponsiveContainer width="100%" height={195}>
                <BarChart
                  data={focusData}
                  layout="vertical"
                  margin={{ top: 8, right: 20, left: 10, bottom: 2 }}
                  onClick={(state) => {
                    const clicked = state?.activeLabel
                    const match = focusData.find((d) => d.name === clicked)
                    if (match && onSelectFocus) {
                      onSelectFocus(activeFocus === match.name ? 'ALL' : match.name)
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={142} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix=" practices" />} />
                  <Bar
                    dataKey="count"
                    name="Recommended Practices"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                    cursor="pointer"
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {focusData.map((entry) => {
                      const isSelected = activeFocus === entry.name
                      return (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          fillOpacity={activeFocus === 'ALL' || isSelected ? 1 : 0.32}
                          stroke={isSelected ? '#E7D927' : 'none'}
                          strokeWidth={isSelected ? 2 : 0}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Impact Priority Donut */}
        <div className="lg:col-span-5 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 flex flex-col justify-between agrin-interactive-card">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
              [ INTERVENTION PRIORITY ]
            </div>
            <div className="text-sm font-extrabold text-[#171814]">
              Regenerative Action Split
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
            <div className="relative" style={{ width: '100%', height: 158 }}>
              {inView && (
                <ResponsiveContainer width="100%" height={158}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={66}
                      paddingAngle={4}
                      isAnimationActive
                      animationDuration={950}
                      animationEasing="ease-out"
                      onClick={(entry) => {
                        if (entry?.level && onSelectPriority) {
                          onSelectPriority(activePriority === entry.level ? 'ALL' : entry.level)
                        }
                      }}
                    >
                      {priorityData.map((entry) => {
                        const isSelected = activePriority === entry.level
                        return (
                          <Cell
                            key={entry.level}
                            fill={entry.color}
                            fillOpacity={activePriority === 'ALL' || isSelected ? 1 : 0.35}
                            stroke={isSelected ? '#E7D927' : '#FFFFFF'}
                            strokeWidth={isSelected ? 2.5 : 1.5}
                            style={{ cursor: 'pointer' }}
                          />
                        )
                      })}
                    </Pie>
                    <Tooltip content={<EditorialTooltip suffix=" practices" />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold font-mono-num text-[#183B2A] leading-none">
                  <AnimatedKpiValue value={opportunities.length} active={inView} />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#77786F] mt-0.5">Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {priorityData.map((item) => {
                const isSelected = activePriority === item.level
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => onSelectPriority && onSelectPriority(isSelected ? 'ALL' : item.level)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#183B2A] text-white border-[#183B2A]'
                        : 'bg-white text-[#171814] border-[#E5E5DC] hover:border-[#183B2A]/40'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono-num">{item.value}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter Pills Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#77786F] mr-1">
          <Filter size={12} />
          <span>Filter:</span>
        </span>

        {['ALL', ...focusData.map((f) => f.name)].map((focus) => {
          const active = activeFocus === focus
          return (
            <button
              key={focus}
              type="button"
              onClick={() => onSelectFocus && onSelectFocus(focus)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                active
                  ? 'bg-[#183B2A] text-[#E7D927] border-[#183B2A]'
                  : 'bg-[#F7F7F2] text-[#4C5340] border-[#E5E5DC] hover:bg-white'
              }`}
            >
              {focus === 'ALL' ? `All Practices (${opportunities.length})` : focus}
            </button>
          )
        })}

        {(activeFocus !== 'ALL' || activePriority !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              onSelectFocus && onSelectFocus('ALL')
              onSelectPriority && onSelectPriority('ALL')
            }}
            className="text-xs font-bold text-[#C93F3F] hover:underline ml-1 cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 6. Farm Resilience 5-Pillar Radar + Strengths/Vulnerability Bar Chart
 */
export function ResilienceVisuals({ components = {}, weights = {} }) {
  const [containerRef, inView] = useInViewAnimation(0.15)

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
    <div ref={containerRef} className={`grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}>
      <div className="lg:col-span-5 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
          [ 5-PILLAR BIOPHYSICAL BALANCE ]
        </div>
        <div className="text-sm font-extrabold text-[#171814] mb-1">Resilience Polygon</div>
        <div style={{ width: '100%', height: 230 }}>
          {inView && (
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
                  dot={{ r: 3.5, fill: '#183B2A' }}
                  activeDot={{ r: 6, fill: '#E7D927', stroke: '#183B2A', strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={950}
                  animationEasing="ease-out"
                />
                <Tooltip content={<EditorialTooltip suffix="/100" metaLookup={metaLookup} />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 bg-[#F7F7F2] border border-[#E5E5DC] rounded-2xl p-4 agrin-interactive-card">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#77772B]">
          [ PILLAR COMPARISON ]
        </div>
        <div className="text-sm font-extrabold text-[#171814] mb-1">
          Strengths vs Vulnerabilities by Pillar
        </div>
        <div style={{ width: '100%', height: 230 }}>
          {inView && (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={104} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <ReferenceLine x={70} stroke="#398653" strokeDasharray="4 4" />
                <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix="/100" metaLookup={metaLookup} />} />
                <Bar
                  dataKey="score"
                  name="Pillar Score"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                  isAnimationActive
                  animationDuration={950}
                  animationEasing="ease-out"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={getScoreBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 7. Interactive Data Confidence vs Data Quality Chart
 */
export function ConfidenceVisuals({ confidence = {}, dataQuality = {} }) {
  const [view, setView] = useState('confidence')
  const [containerRef, inView] = useInViewAnimation(0.15)

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
    <div ref={containerRef} className={`bg-white border border-[#E5E5DC] rounded-2xl p-4 mb-3 agrin-interactive-card ${inView ? 'animate-chart-reveal' : 'opacity-0'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs font-extrabold text-[#171814] flex items-center gap-1.5">
          <Layers size={14} className="text-[#183B2A]" />
          <span>{view === 'confidence' ? '5-Dimension Confidence Breakdown' : '4-Dimension Data Quality Breakdown'}</span>
        </div>

        <div className="flex gap-1 bg-[#F7F7F2] p-1 rounded-full border border-[#E5E5DC]">
          <button
            type="button"
            onClick={() => setView('confidence')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
              view === 'confidence' ? 'bg-[#183B2A] text-[#E7D927]' : 'text-[#77786F] hover:text-[#171814]'
            }`}
          >
            Confidence Factors
          </button>
          <button
            type="button"
            onClick={() => setView('quality')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
              view === 'quality' ? 'bg-[#183B2A] text-[#E7D927]' : 'text-[#77786F] hover:text-[#171814]'
            }`}
          >
            Data Quality Metrics
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 205 }}>
        {inView && (
          <ResponsiveContainer width="100%" height={205}>
            <BarChart key={view} data={activeData} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DC" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: '#77786F', fontSize: 10 }} axisLine={{ stroke: '#E5E5DC' }} tickLine={false} />
              <YAxis type="category" dataKey="name" width={114} tick={{ fill: '#171814', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <ReferenceLine x={75} stroke="#183B2A" strokeDasharray="4 4" />
              <Tooltip cursor={{ fill: 'rgba(24, 59, 42, 0.05)' }} content={<EditorialTooltip suffix="%" metaLookup={metaLookup} />} />
              <Bar
                dataKey="score"
                name="Score"
                radius={[0, 6, 6, 0]}
                maxBarSize={18}
                isAnimationActive
                animationDuration={850}
                animationEasing="ease-out"
              >
                {activeData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.score >= 75 ? '#183B2A' : entry.score >= 55 ? '#2E6CA4' : '#C88A14'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
