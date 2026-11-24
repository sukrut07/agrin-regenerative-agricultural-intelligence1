import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'
import { getAnalytics, getModelInfo } from '../services/api'
import { BarChart2, BookOpen, Layers, TrendingUp, Sprout, Zap, FileText, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Dashboard() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAnalytics(), getModelInfo()])
      .then(([a, m]) => { setAnalytics(a); setModelInfo(m.model_info) })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="loader" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--ff-text-secondary)', fontSize: '0.9rem' }}>Loading analytics...</p>
      </div>
    </div>
  )

  const scoreData = analytics?.score_distribution
    ? Object.entries(analytics.score_distribution).map(([range, count]) => ({ range, count }))
    : []

  const allModels = modelInfo?.all_models || []
  const recentAssessments = analytics?.recent_assessments || []

  const metrics = [
    { label: 'Soil Assessments Completed', value: analytics?.total_analyses || 0,          icon: <BarChart2 size={22} />, color: '#183B2A', bg: '#EAF3EC' },
    { label: 'Specific Crop Checks',       value: analytics?.total_feasibility_checks || 0, icon: <Sprout size={22} />,    color: '#398653', bg: '#F2F5EE' },
    { label: 'What-If Simulations',        value: analytics?.total_whatif_runs || 0,        icon: <Zap size={22} />,       color: '#C88A14', bg: '#FDF6E2' },
  ]

  return (
    <div className="page-bg" style={{ minHeight: '100vh' }}>
      <HeaderNav />

      <div className="ff-container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: '#77786F', textTransform: 'uppercase' }}>
              Saved Assessments &amp; Model Provenance
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#171814', marginTop: 4 }}>
              My Reports &amp; Assessment History
            </h1>
          </div>
          <button
            onClick={() => navigate('/farm-details')}
            style={{
              padding: '10px 20px', borderRadius: 999, background: '#E7D927', color: '#171814',
              fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <span>Start New Soil Analysis</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* ── Usage stats ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="metrics-grid">
          {metrics.map(m => (
            <div key={m.label} className="metric-card" style={{ textAlign: 'center' }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', color: m.color,
              }}>
                {m.icon}
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--ff-text)', lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ff-text-secondary)', marginTop: 6 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── Saved Assessment Reports History ────────────────── */}
        <div className="ff-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} style={{ color: '#183B2A' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#171814' }}>Recent Soil &amp; Crop Suitability Assessments</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#77786F' }}>
              Persisted SQLite records (zero synthetic history)
            </span>
          </div>

          {recentAssessments.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', background: '#F7F7F2', borderRadius: 12, border: '1px dashed #E5E5DC' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#171814', marginBottom: 6 }}>
                No assessments yet. Start your first soil analysis.
              </p>
              <p style={{ fontSize: '0.78rem', color: '#77786F', marginBottom: 14 }}>
                Enter manual Soil Health Card readings to save your first field suitability report.
              </p>
              <button
                onClick={() => navigate('/farm-details')}
                className="btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 18px' }}
              >
                Analyse My Soil
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E5DC', color: '#77786F', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 8px' }}>Date</th>
                    <th style={{ padding: '10px 8px' }}>Location / Season</th>
                    <th style={{ padding: '10px 8px' }}>Top Suitable Crop</th>
                    <th style={{ padding: '10px 8px' }}>Score</th>
                    <th style={{ padding: '10px 8px' }}>Confidence</th>
                    <th style={{ padding: '10px 8px' }}>Model</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssessments.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F2F2EA' }}>
                      <td style={{ padding: '10px 8px', color: '#77786F' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#171814' }}>
                        {item.district || 'Field'}{item.state ? `, ${item.state}` : ''}{item.season ? ` · ${item.season}` : ''}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#183B2A', textTransform: 'capitalize' }}>
                        {item.top_crop || '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#398653' }}>
                        {item.top_score != null ? `${Math.round(item.top_score)}/100` : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700 }}>
                        {item.data_confidence || '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#77786F' }}>
                        {item.model_version || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── ML Model performance ──────────────────────────────── */}
        {modelInfo && (
          <div className="ff-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <BookOpen size={18} style={{ color: 'var(--ff-primary)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ff-text)' }}>ML Model Performance</h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--ff-text-muted)', marginBottom: 20 }}>
              {modelInfo.model_type} · Trained: {modelInfo.training_date?.split('T')[0]} ·
              {modelInfo.n_classes} crops · Synthetic/augmented dataset (ICAR/TNAU sourced)
            </p>

            {/* Key metrics */}
            {modelInfo.metrics ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }} className="model-metrics-grid">
                {[
                  { label: 'Accuracy', value: `${((modelInfo.metrics?.accuracy || 0) * 100).toFixed(1)}%`, color: 'var(--ff-primary)', bg: 'var(--ff-soft)' },
                  { label: 'Precision', value: `${((modelInfo.metrics?.precision_weighted || 0) * 100).toFixed(1)}%`, color: '#3978B8', bg: '#EDF4FF' },
                  { label: 'Recall', value: `${((modelInfo.metrics?.recall_weighted || 0) * 100).toFixed(1)}%`, color: '#7C3AED', bg: '#F5F0FF' },
                  { label: 'F1-Score', value: (modelInfo.metrics?.f1_weighted || 0).toFixed(3), color: '#D89B18', bg: '#FFF7E1' },
                ].map(m => (
                  <div key={m.label} style={{
                    background: m.bg, borderRadius: 14, padding: '16px 12px', textAlign: 'center',
                    border: `1px solid ${m.color}22`,
                  }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ff-text-secondary)', marginTop: 6 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '14px 16px', borderRadius: 12, marginBottom: 20,
                background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', fontSize: '0.82rem', fontWeight: 600,
              }}>
                Evaluation metrics unavailable ({modelInfo.reason || 'model_metadata.json not loaded'}).
              </div>
            )}

            {/* Model comparison bars */}
            {allModels.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ff-text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={14} /> Model Comparison (Training Run)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allModels.map(m => {
                    const score = m.f1_weighted ?? m.f1 ?? m.accuracy ?? 0
                    return (
                      <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 140, fontSize: '0.78rem', color: 'var(--ff-text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                          {m.name}
                        </div>
                        <div className="score-bar" style={{ flex: 1 }}>
                          <div
                            className="score-bar-fill"
                            style={{
                              width: `${score * 100}%`,
                              background: score >= 0.78 ? 'var(--ff-primary)' : score >= 0.70 ? 'var(--ff-warning)' : '#C0CCC4',
                            }}
                          />
                        </div>
                        <div style={{ width: 52, fontSize: '0.78rem', textAlign: 'right', fontWeight: 700, color: 'var(--ff-text)', flexShrink: 0 }}>
                          {(score * 100).toFixed(1)}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Score distribution chart ──────────────────────────── */}
        {scoreData.some(d => d.count > 0) && (
          <div className="ff-card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ff-text)', marginBottom: 20 }}>
              📊 Score Distribution
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreData} barSize={32}>
                <XAxis dataKey="range" tick={{ fill: 'var(--ff-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--ff-text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'white', border: '1px solid var(--ff-border)',
                    borderRadius: 10, fontSize: '0.85rem', color: 'var(--ff-text)',
                    boxShadow: '0 4px 20px rgba(20,50,30,0.10)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {scoreData.map((entry, i) => (
                    <Cell key={i} fill="var(--ff-primary)" opacity={0.75 + (i / scoreData.length) * 0.25} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── System architecture ───────────────────────────────── */}
        <div className="ff-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Layers size={18} style={{ color: '#3978B8' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ff-text)' }}>System Architecture</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="arch-grid">
            {[
              {
                title: 'ML Prediction Layer', color: 'var(--ff-primary)', bg: 'var(--ff-soft)',
                items: ['Random Forest Classifier v1', '15 biophysical features', '23 crops calibrated', 'Probabilistic evidence baseline', 'Never treated as sole truth'],
              },
              {
                title: 'Agronomic Rules & Gates', color: '#3978B8', bg: '#EDF4FF',
                items: ['15 ICAR Agro-Climatic Zones', '12 SHC threshold limits', 'Hard eligibility gates (pH/water/season)', 'Regional crop calendars', 'Data confidence tracking'],
              },
              {
                title: 'Regenerative & Advisory Engine', color: '#7C3AED', bg: '#F5F0FF',
                items: ['10+ verified regenerative practices', 'Standard AgriculturalAdvisory schema', 'Multi-source data provenance', 'Farmer outcome feedback loop', 'Pan-India & BRICS ready'],
              },
            ].map(col => (
              <div key={col.title} style={{ background: col.bg, borderRadius: 14, padding: 18, border: `1px solid ${col.color}20` }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.85rem', color: col.color, marginBottom: 10 }}>{col.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {col.items.map(item => (
                    <li key={item} style={{ fontSize: '0.8rem', color: 'var(--ff-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: col.color, flexShrink: 0, marginTop: 2 }}>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Track 4 Intelligence Architecture Overview ─────────────────── */}
        <div className="ff-card" style={{ padding: 24, marginBottom: 24, border: '1px solid #10B98130', background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.4rem' }}>🌾</span>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#065F46' }}>Pan-India Agricultural Intelligence & Readiness</h2>
                <p style={{ fontSize: '0.78rem', color: '#047857' }}>Phase 2.5 Hardened Multi-Modal Architecture — Ground Truth Without Fabrication</p>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
              Track 4 Foundation
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="arch-grid">
            {/* Box 1: Farm Health */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1.1rem' }}>🩺</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ff-text)' }}>Farm Health Snapshot</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#F9FAFB', borderRadius: 6 }}>
                  <span style={{ color: 'var(--ff-text-secondary)' }}>Soil Health (12 SHC Params)</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#F9FAFB', borderRadius: 6 }}>
                  <span style={{ color: 'var(--ff-text-secondary)' }}>Live Weather & Climatology</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#F9FAFB', borderRadius: 6 }}>
                  <span style={{ color: 'var(--ff-text-secondary)' }}>Water & Irrigation Balance</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#FFFBEB', borderRadius: 6 }}>
                  <span style={{ color: 'var(--ff-text-secondary)' }}>Vegetation (Sentinel-2 NDVI)</span>
                  <span style={{ color: '#D97706', fontWeight: 600 }}>Coming Soon (No Fake Data)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#FFFBEB', borderRadius: 6 }}>
                  <span style={{ color: 'var(--ff-text-secondary)' }}>Disease Risk Diagnosis</span>
                  <span style={{ color: '#D97706', fontWeight: 600 }}>Data Unavailable</span>
                </div>
              </div>
            </div>

            {/* Box 2: AI Agro-Advisories */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ff-text)' }}>AI Agro-Advisories</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
                <div style={{ padding: '8px', background: '#F0FDF4', borderRadius: 6, borderLeft: '3px solid #10B981' }}>
                  <strong style={{ color: '#065F46' }}>Crop Selection Advisory</strong>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--ff-text-secondary)' }}>Blends ML statistical probability with regional calendar and hard gates.</p>
                </div>
                <div style={{ padding: '8px', background: '#EFF6FF', borderRadius: 6, borderLeft: '3px solid #3B82F6' }}>
                  <strong style={{ color: '#1E40AF' }}>Soil Nutrient Balancing</strong>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--ff-text-secondary)' }}>Actionable corrections for soil pH, organic carbon, and micronutrients.</p>
                </div>
                <div style={{ padding: '8px', background: '#FEF3C7', borderRadius: 6, borderLeft: '3px solid #F59E0B' }}>
                  <strong style={{ color: '#92400E' }}>Extreme Weather Alerts</strong>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--ff-text-secondary)' }}>Real-time heat stress and precipitation anomaly warnings.</p>
                </div>
              </div>
            </div>

            {/* Box 3: Regenerative Agriculture */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '1.1rem' }}>♻️</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ff-text)' }}>Regenerative Agriculture</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem' }}>
                <div style={{ padding: '8px', background: '#F5F3FF', borderRadius: 6, borderLeft: '3px solid #8B5CF6' }}>
                  <strong style={{ color: '#5B21B6' }}>10+ Codified Practices</strong>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--ff-text-secondary)' }}>Legume rotation, cover crops, biochar, minimum tillage, Broad Bed Furrow.</p>
                </div>
                <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: 6, borderLeft: '3px solid #10B981' }}>
                  <strong style={{ color: '#065F46' }}>Carbon Deficit Targeting</strong>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--ff-text-secondary)' }}>Prioritizes organic carbon restoration when soil OC is below 0.75%.</p>
                </div>
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: 6, borderLeft: '3px solid #64748B' }}>
                  <strong style={{ color: '#334155' }}>Component Readiness Metrics</strong>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--ff-text-secondary)' }}>Clear indicators across 7 dimensions without fabricated composite scores.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ff-text-muted)' }}>
          AgriN — Pan-India Regenerative Agricultural Intelligence Platform · All 28 States & 8 UTs Supported · Results are scientific decision support estimates only
        </p>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
          .model-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .arch-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
