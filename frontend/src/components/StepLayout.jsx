/**
 * StepLayout — AGRARNOYE editorial style
 * Forest-green sticky nav · yellow active step · off-white canvas
 */
import { useNavigate } from 'react-router-dom'
import { Sprout, ArrowLeft } from 'lucide-react'

const STEPS = [
  { num: 1, label: 'Farm Details' },
  { num: 2, label: 'Soil Test' },
  { num: 3, label: 'Environment' },
  { num: 4, label: 'Analysis' },
]

/* ─── inline design tokens (same as Home.jsx) ─────────────────────── */
const C = {
  forest:  '#183B2A',
  yellow:  '#E7D927',
  olive:   '#77772B',
  bg:      '#F7F7F2',
  white:   '#FFFFFF',
  text:    '#171814',
  muted:   '#77786F',
  border:  '#E5E5DC',
  green:   '#398653',
  lightGreen: '#EAF5EE',
}

export default function StepLayout({ step, title, subtitle, children }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Manrope','Inter',system-ui,sans-serif", color: C.text, display: 'flex', flexDirection: 'column' }}>

      {/* ── FOREST GREEN STICKY NAV ─────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: C.forest, borderBottom: '1px solid rgba(229,229,220,0.14)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60, gap: 24 }}>

          {/* Brand */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest }}>
              <Sprout size={17} strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.3px' }}>AgriN</span>
          </div>

          {/* Step progress — centred */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {STEPS.map((s, i) => {
              const isActive    = step === s.num
              const isCompleted = step > s.num
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 68 }}>
                    {/* Circle */}
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      border: isActive ? `2px solid ${C.yellow}` : isCompleted ? `2px solid ${C.green}` : '2px solid rgba(229,229,220,0.3)',
                      background: isActive ? C.yellow : isCompleted ? C.green : 'rgba(255,255,255,0.08)',
                      color: isActive ? C.text : isCompleted ? '#fff' : 'rgba(255,255,255,0.45)',
                      transition: 'all 0.25s ease',
                    }}>
                      {isCompleted ? '✓' : s.num}
                    </div>
                    {/* Label */}
                    <span style={{
                      fontSize: 10, fontWeight: isActive ? 700 : 500, marginTop: 4,
                      color: isActive ? C.yellow : isCompleted ? '#A8D5B5' : 'rgba(255,255,255,0.4)',
                      whiteSpace: 'nowrap',
                    }} className="agrin-desktop-nav">
                      {s.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      width: 36, height: 2, margin: '0 2px',
                      marginBottom: 14,
                      background: isCompleted ? C.green : 'rgba(229,229,220,0.2)',
                      transition: 'background 0.25s ease',
                    }} className="agrin-desktop-nav" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile step counter */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} className="agrin-hamburger">
            Step {step} / {STEPS.length}
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 60px' }}>

          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: C.muted, marginBottom: 20, padding: 0, transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Page heading */}
          <div style={{ marginBottom: 28 }}>
            {/* Step tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: '#E7D92720', border: '1px solid #E7D92740', marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.yellow }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.olive }}>
                Step {step} of {STEPS.length} &nbsp;—&nbsp; {STEPS[step - 1]?.label}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.8px', color: C.text, margin: 0, lineHeight: 1.15 }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ marginTop: 6, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
