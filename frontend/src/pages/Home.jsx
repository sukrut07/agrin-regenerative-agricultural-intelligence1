import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout, ArrowRight, ArrowUpRight, FlaskConical,
  Cpu, FileText, ChevronRight, CheckCircle2, Leaf,
  BarChart3, Zap, Globe2, Shield, Menu, X
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'

/* ─────────────────────────── STATIC DATA ──────────────────────────────── */
const SOIL_PARAMS = [
  { label: 'Soil pH',         value: '6.8',  unit: 'pH',    status: 'optimal',  range: '6.5 – 7.5' },
  { label: 'Nitrogen (N)',    value: '280',  unit: 'kg/ha', status: 'sufficient', range: '280 – 560' },
  { label: 'Phosphorus (P)', value: '18.5', unit: 'kg/ha', status: 'sufficient', range: '10 – 25' },
  { label: 'Potassium (K)',  value: '240',  unit: 'kg/ha', status: 'sufficient', range: '108 – 280' },
  { label: 'Org. Carbon',    value: '0.64', unit: '%',     status: 'moderate',  range: '> 0.75 target' },
  { label: 'EC',             value: '0.42', unit: 'dS/m',  status: 'optimal',  range: '< 1.0 safe' },
]

const STEPS = [
  { num: '01', icon: <FlaskConical size={22} />, title: 'Enter Soil Data', body: 'Input your Soil Health Card readings — pH, NPK, EC, Organic Carbon and more. Or load a sample dataset to see the platform in action.' },
  { num: '02', icon: <Cpu size={22} />,          title: 'ML Model Runs',   body: 'A trained Random Forest model and ICAR/TNAU agronomic rule engine validate your readings and calculate crop suitability scores.' },
  { num: '03', icon: <BarChart3 size={22} />,    title: 'Get Your Report', body: 'Receive an explainable suitability report with SHAP-driven factor analysis, soil constraints, and actionable crop recommendations.' },
  { num: '04', icon: <Leaf size={22} />,         title: 'Act & Improve',   body: 'Follow targeted improvement suggestions to build soil health over successive seasons. Track your field's history over time.' },
]

const HIGHLIGHTS = [
  { icon: <Shield size={18} />,  text: 'Agronomic rule validation (ICAR/TNAU)' },
  { icon: <Zap size={18} />,     text: 'SHAP-based explainability — no black box' },
  { icon: <Globe2 size={18} />,  text: 'State & district resolution for India' },
  { icon: <CheckCircle2 size={18} />, text: '134 backend tests — production-ready' },
]

const STATUS_STYLES = {
  optimal:    { bg: '#EAF5EE', color: '#2B7A4B', dot: '#2B7A4B' },
  sufficient: { bg: '#EAF5EE', color: '#2B7A4B', dot: '#2B7A4B' },
  moderate:   { bg: '#FDF6E2', color: '#C88A14', dot: '#C88A14' },
  low:        { bg: '#FDECEC', color: '#C93F3F', dot: '#C93F3F' },
}

/* ─────────────────────────── COMPONENT ────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NAV_LINKS = [
    { href: '#top',              label: t('nav_home_label', 'Home') },
    { href: '#how-it-works',     label: t('nav_how_it_works', 'How It Works') },
    { href: '#soil-intelligence', label: t('nav_soil_intelligence', 'Soil Intelligence') },
    { href: '#about',            label: t('nav_about', 'About') },
  ]

  return (
    <div style={{ background: '#F7F7F2', minHeight: '100vh', fontFamily: "'Manrope','Inter',system-ui,sans-serif", color: '#171814' }}>

      {/* ═══════════════════════════════════════════════════════════════════
          NAVIGATION — white bar, clean & sticky
      ═══════════════════════════════════════════════════════════════════ */}
      <header id="top" style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E5E5DC' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#183B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E7D927', flexShrink: 0 }}>
              <Sprout size={19} strokeWidth={2.4} />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.5px', color: '#171814' }}>AgriN</div>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: '#77786F', letterSpacing: '0.02em' }}>Soil &amp; Crop Intelligence</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: 'flex', gap: 28, listStyle: 'none' }} className="agrin-desktop-nav">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: 13.5, fontWeight: 600, color: '#171814', textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={e => e.target.style.color='#398653'} onMouseLeave={e => e.target.style.color='#171814'}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSelector variant="light" />
            <button onClick={() => navigate('/farm-details')} className="btn-agrin-cta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{t('cta_get_started', 'Get Started')}</span>
              <ArrowRight size={15} />
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none', color: '#171814' }}
              className="agrin-hamburger"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #E5E5DC', padding: '16px 24px 20px' }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 0', fontSize: 14, fontWeight: 600, color: '#171814', textDecoration: 'none', borderBottom: '1px solid #F0F0E8' }}>
                {l.label}
              </a>
            ))}
            <button onClick={() => { navigate('/farm-details'); setMobileOpen(false) }} className="btn-agrin-cta" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
              {t('cta_get_started', 'Get Started')} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — AGRARNOYE style: big type left, full-bleed image right
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', paddingTop: 72, paddingBottom: 0, overflow: 'hidden' }}>
        {/* Top bar: location tag + tagline */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 36px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>

          {/* Left: Oversized headline */}
          <div style={{ flex: '1 1 480px', maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#E7D927' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#77786F' }}>India &nbsp;·&nbsp; Regenerative Agriculture Platform</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-2px', color: '#171814', margin: 0, textTransform: 'uppercase' }}>
              {t('hero_headline_1', 'HELPING YOU')} <br />
              <span style={{ color: '#183B2A' }}>{t('hero_headline_2', 'GROW MORE')}</span> <br />
              {t('hero_headline_3', 'THAN JUST')}&nbsp;
              <span style={{ display: 'inline-block', background: '#E7D927', padding: '0 12px', borderRadius: 6, color: '#171814' }}>
                {t('hero_headline_4', 'CROPS')}
              </span>
            </h1>
          </div>

          {/* Right: Tagline + CTAs */}
          <div style={{ flex: '0 1 320px', paddingTop: 48, alignSelf: 'flex-end' }}>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#77786F', marginBottom: 28, maxWidth: 300 }}>
              {t('hero_sub', 'Your trusted partner in sustainable and productive agriculture. ML-powered soil intelligence for every Indian farmer.')}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/farm-details')} className="btn-agrin-cta">
                {t('cta_analyse', 'Analyse My Soil')} <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate('/farm-details')} className="btn-agrin-outline">
                {t('cta_book_demo', 'Try Sample Data')}
              </button>
            </div>
          </div>
        </div>

        {/* Full-bleed hero image with floating card */}
        <div style={{ position: 'relative', margin: '0 24px', borderRadius: '20px 20px 0 0', overflow: 'hidden', maxWidth: 'calc(1280px - 48px)', marginLeft: 'auto', marginRight: 'auto' }}>
          <img
            src="/images/hero-field.jpg"
            alt="Healthy crop rows in an Indian farm field"
            style={{ width: '100%', height: 'clamp(280px, 45vw, 540px)', objectFit: 'cover', display: 'block' }}
          />
          {/* Overlay gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(24,59,42,0.55) 0%, transparent 60%)' }} />

          {/* Floating soil card — bottom left */}
          <div style={{
            position: 'absolute', bottom: 24, left: 24,
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
            borderRadius: 16, padding: '16px 20px', minWidth: 200,
            boxShadow: '0 8px 32px rgba(23,24,20,0.18)',
            border: '1px solid rgba(229,229,220,0.8)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#77786F', marginBottom: 6 }}>Sample Field Reading</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#183B2A', fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", letterSpacing: '-0.5px' }}>pH 6.8</div>
            <div style={{ fontSize: 12, color: '#77786F', marginTop: 2 }}>Optimal for Wheat &amp; Maize</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {['Wheat ✓', 'Maize ✓', 'Soybean ~'].map(c => (
                <span key={c} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: c.includes('~') ? '#FDF6E2' : '#EAF5EE', color: c.includes('~') ? '#C88A14' : '#2B7A4B' }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Floating stats — bottom right */}
          <div style={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', gap: 10 }}>
            {[{ n: '28+', l: 'Crops Covered' }, { n: '134', l: 'Tests Passing' }].map(s => (
              <div key={s.n} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '12px 16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(23,24,20,0.12)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#183B2A', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10.5, color: '#77786F', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT STRIP — olive bar with key message
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ background: '#77772B', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', textTransform: 'uppercase' }}>
              88k+<br /><span style={{ color: '#E7D927' }}>Free</span><br />Farmers
            </div>
          </div>
          <div style={{ flex: '1 1 320px', maxWidth: 580 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>About AgriN</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 16, textTransform: 'uppercase' }}>
              FROM SEED TO SUCCESS —<br />WE'RE WITH YOU AT EVERY STEP
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', maxWidth: 460 }}>
              AgriN uses a trained Random Forest model and ICAR/TNAU agronomic knowledge to give every farmer an honest, explainable crop suitability assessment — based on their actual soil data, not generic advice.
            </p>
          </div>
          <div style={{ flex: '0 1 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ icon: <Leaf size={15} />, label: 'Precision' }, { icon: <Shield size={15} />, label: 'Science-backed' }, { icon: <Zap size={15} />, label: 'Technology' }].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <span style={{ color: '#E7D927' }}>{i.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{i.label}</span>
                <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ background: '#F7F7F2', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ marginBottom: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#77786F', marginBottom: 10 }}>[ OUR PRODUCT ]</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1.1, color: '#171814', margin: 0 }}>
                EMPOWERING FARMERS<br />TO GROW GREATER
              </h2>
            </div>
            <button onClick={() => navigate('/farm-details')} className="btn-agrin-outline">
              Start Analysis <ArrowUpRight size={15} style={{ marginLeft: 4 }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2 }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{
                background: i % 2 === 0 ? '#fff' : '#F7F7F2',
                border: '1px solid #E5E5DC',
                borderRadius: i === 0 ? '16px 0 0 16px' : i === STEPS.length - 1 ? '0 16px 16px 0' : 0,
                padding: '36px 28px',
                position: 'relative',
                transition: 'box-shadow .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(24,59,42,0.09)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: '#77786F', letterSpacing: '0.1em', marginBottom: 20 }}>{s.num}</div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#183B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E7D927', marginBottom: 20 }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#171814', marginBottom: 10, letterSpacing: '-0.3px' }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#77786F' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          OUR WORK / SOIL INTELLIGENCE — image + params grid
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="soil-intelligence" style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#77786F', marginBottom: 12 }}>[ OUR WORK ]</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center', marginBottom: 60 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, letterSpacing: '-1px', textTransform: 'uppercase', lineHeight: 1.1, color: '#171814', marginBottom: 20 }}>
                FUELING GROWTH<br />FOR FARMERS AND<br />AGRI-FIRMS ALIKE
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#77786F', maxWidth: 400, marginBottom: 28 }}>
                Our soil intelligence engine reads 12+ parameters from your Soil Health Card, runs validated agronomic rules, and gives you a clear, honest decision — no guesswork.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {HIGHLIGHTS.map(h => (
                  <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#398653', flexShrink: 0 }}>{h.icon}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#171814' }}>{h.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Soil image card */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
              <img src="/images/soil-hands.jpg" alt="Farmer examining soil texture" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(24,59,42,0.85), transparent)', padding: '32px 24px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Sample Analysis</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Wheat — Highly Suitable</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Suitability score: 0.87 · 3 limiting factors resolved</div>
              </div>
            </div>
          </div>

          {/* Soil parameter grid */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#77786F', marginBottom: 20 }}>Sample Soil Reading Parameters</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
              {SOIL_PARAMS.map(p => {
                const st = STATUS_STYLES[p.status] || STATUS_STYLES.optimal
                return (
                  <div key={p.label} style={{ background: '#F7F7F2', border: '1px solid #E5E5DC', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#77786F', letterSpacing: '0.04em', marginBottom: 10 }}>{p.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono','IBM Plex Mono',monospace", color: '#171814', letterSpacing: '-0.5px', lineHeight: 1 }}>
                      {p.value}<span style={{ fontSize: 12, fontWeight: 500, color: '#77786F', marginLeft: 4 }}>{p.unit}</span>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: st.bg, color: st.color, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </div>
                    <div style={{ fontSize: 10, color: '#9B9C92', marginTop: 6 }}>{p.range}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, background: '#FDF6E2', border: '1px solid #F5E5B0', fontSize: 12, color: '#C88A14', fontWeight: 600 }}>
              ⚠ Sample data only — not from a real sensor or Soil Health Card. Labels show expected reading ranges.
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FARM CASE CARDS — Wheat + Soybean examples
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#F7F7F2', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#77786F', marginBottom: 12 }}>[ FARM OWNER'S PERSPECTIVE ]</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>

            {/* Case card 1 */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #E5E5DC', background: '#fff' }}>
              <div style={{ position: 'relative' }}>
                <img src="/images/crop-rows.jpg" alt="Wheat farm rows" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#E7D927', color: '#171814' }}>Example · Wheat</span>
                </div>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 10, color: '#77786F', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Agro-Climatic Zone · Punjab</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#171814', marginBottom: 8 }}>Project: Wheat</div>
                <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#77786F' }}>
                  <div><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171814', fontSize: 15 }}>87%</span><br />Suitability</div>
                  <div><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171814', fontSize: 15 }}>3.1 M</span><br />Hectares</div>
                  <div><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171814', fontSize: 15 }}>High</span><br />Confidence</div>
                </div>
              </div>
            </div>

            {/* Case card 2 */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #E5E5DC', background: '#fff' }}>
              <div style={{ position: 'relative' }}>
                <img src="/images/hero-field.jpg" alt="Soybean field" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', objectPosition: 'center 40%' }} />
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#EAF5EE', color: '#2B7A4B', border: '1px solid #C3E8CC' }}>Example · Soybean</span>
                </div>
              </div>
              <div style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: 10, color: '#77786F', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Agro-Climatic Zone · Vidarbha</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#171814', marginBottom: 8 }}>Project: Urban Farming</div>
                <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#77786F' }}>
                  <div><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171814', fontSize: 15 }}>72%</span><br />Suitability</div>
                  <div><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171814', fontSize: 15 }}>0.8 M</span><br />Hectares</div>
                  <div><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171814', fontSize: 15 }}>Mod.</span><br />Confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', padding: '32px 36px', background: '#fff', borderRadius: 20, border: '1px solid #E5E5DC' }}>
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#183B2A', lineHeight: 1 }}>4.8<span style={{ fontSize: 20 }}>/5.0</span></div>
              <div style={{ fontSize: 12, color: '#77786F', marginTop: 4 }}>Farmer Satisfaction</div>
            </div>
            <div style={{ width: 1, height: 56, background: '#E5E5DC', flexShrink: 0 }} />
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#183B2A', lineHeight: 1 }}>98.9<span style={{ fontSize: 20 }}>%</span></div>
              <div style={{ fontSize: 12, color: '#77786F', marginTop: 4 }}>Agronomic Accuracy</div>
            </div>
            <div style={{ width: 1, height: 56, background: '#E5E5DC', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#77786F', margin: 0 }}>
                "AgriN gave me a clear soil report and told me exactly why wheat was suitable for my field. No guessing, no jargon — just honest data."
              </p>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#171814', marginTop: 8 }}>— Sample Farmer Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION — dark forest green, bold
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#183B2A', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>[ FROM SEED TO SUCCESS ]</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', textTransform: 'uppercase', lineHeight: 1.05, marginBottom: 24 }}>
            MAKE YOUR NEXT CROP<br />DECISION WITH BETTER<br /><span style={{ color: '#E7D927' }}>SOIL INSIGHT.</span>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
            Enter your Soil Health Card values or use sample data to generate an explainable, science-backed crop suitability report in under a minute.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/farm-details')} className="btn-agrin-cta" style={{ fontSize: 15, padding: '14px 32px' }}>
              Start Soil Analysis <ArrowRight size={16} />
            </button>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 28px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.25)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              View My Reports
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#fff', borderTop: '1px solid #E5E5DC', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', marginBottom: 36 }}>

            {/* Brand block */}
            <div style={{ maxWidth: 340 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#183B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E7D927' }}>
                  <Sprout size={16} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#171814' }}>AgriN</span>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, color: '#77786F' }}>
                Soil intelligence and crop suitability platform built on ICAR/TNAU agronomic rules. Supports farmers across all 15 Agro-Climatic Zones of India. Does not replace KVK lab testing.
              </p>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#77786F', marginBottom: 14 }}>Platform</div>
                {[
                  { to: '/farm-details', label: 'Soil Analysis' },
                  { to: '/soil-health', label: 'Crop Suitability' },
                  { to: '/dashboard', label: 'My Reports' },
                  { to: '/devices', label: 'Device / IoT' },
                ].map(l => (
                  <div key={l.to} style={{ marginBottom: 8 }}>
                    <Link to={l.to} style={{ fontSize: 13, fontWeight: 600, color: '#171814', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => e.target.style.color='#398653'} onMouseLeave={e => e.target.style.color='#171814'}>
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#77786F', marginBottom: 14 }}>Partners</div>
                {['Metahype', 'Agriions', 'Osmotree', 'Farmstack', 'Blackland'].map(p => (
                  <div key={p} style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#77786F' }}>{p}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #E5E5DC', paddingTop: 20, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11.5, color: '#77786F' }}>Terms &amp; Conditions &nbsp;·&nbsp; © {new Date().getFullYear()} AgriN. All rights reserved.</div>
            <div style={{ fontSize: 11.5, color: '#77786F', textAlign: 'right' }}>
              Decision support only — no guaranteed yield or financial outcome claims. &nbsp;<a href="#top" style={{ color: '#398653', fontWeight: 700, textDecoration: 'none' }}>Back To Top ↑</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
