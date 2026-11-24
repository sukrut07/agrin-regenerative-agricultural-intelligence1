import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sprout, ArrowRight, CheckCircle2, AlertTriangle,
  FlaskConical, Cpu, Layers, FileText, ShieldCheck, ChevronRight
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'

const SUPPORTED_PARAMETERS_PREVIEW = [
  { name: 'Soil pH', sample: '6.8', unit: 'pH', range: '6.5 – 7.5 optimal', status: 'Optimal' },
  { name: 'Electrical Conductivity (EC)', sample: '0.42', unit: 'dS/m', range: '< 1.0 dS/m safe', status: 'Normal' },
  { name: 'Available Nitrogen (N)', sample: '280', unit: 'kg/ha', range: '280 – 560 kg/ha', status: 'Sufficient' },
  { name: 'Available Phosphorus (P)', sample: '18.5', unit: 'kg/ha', range: '10 – 25 kg/ha', status: 'Sufficient' },
  { name: 'Available Potassium (K)', sample: '240', unit: 'kg/ha', range: '108 – 280 kg/ha', status: 'Sufficient' },
  { name: 'Organic Carbon (OC)', sample: '0.64', unit: '%', range: '> 0.75% target', status: 'Moderate' },
  { name: 'Zinc & Sulphur (Zn / S)', sample: '0.85 / 14', unit: 'ppm', range: 'Zn ≥ 0.6 · S ≥ 10', status: 'Sufficient' },
]

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    /* Distinctive Olive Outer Frame inspired by agricultural editorial design */
      <div className="min-h-screen bg-[#77772B] p-2 sm:p-4 lg:p-6">
        {/* Main Warm Off-White Canvas */}
        <div className="max-w-[1340px] mx-auto bg-[#F7F7F2] text-[#171814] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5E5DC] shadow-sm">

          {/* ── SECTION A: MINIMAL EDITORIAL NAVIGATION BAR ─────────────────── */}
          <header className="bg-white/95 border-b border-[#E5E5DC] sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-18 flex items-center justify-between gap-4">
              {/* Left: AgriN Brand Wordmark */}
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#183B2A] flex items-center justify-center text-[#E7D927]">
                  <Sprout size={20} className="stroke-[2.2]" />
                </div>
                <div className="leading-tight">
                  <span className="font-extrabold text-lg tracking-tight text-[#171814] block">
                    {t('app_title', 'AgriN')}
                  </span>
                  <span className="text-[11px] font-medium text-[#77786F] block">
                    Soil &amp; Crop Intelligence
                  </span>
                </div>
              </Link>

                    {/* Right: Minimal Navigation Links */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#171814]" aria-label="Landing navigation">
                      <a href="#top" className="hover:text-[#398653] transition-colors">Home</a>
                      <a href="#how-it-works" className="hover:text-[#398653] transition-colors">How It Works</a>
                      <a href="#soil-intelligence" className="hover:text-[#398653] transition-colors">Soil Intelligence</a>
                      <a href="#about" className="hover:text-[#398653] transition-colors">About</a>
                    </nav>

                    <div className="flex items-center gap-3">
                      <LanguageSelector variant="light" />
                      <button
                        id="header-get-started-btn"
                        onClick={() => navigate('/farm-details')}
                        className="px-4 py-2.5 rounded-full bg-[#E7D927] hover:bg-[#D6C81E] text-[#171814] text-xs sm:text-sm font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Get Started</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
              </header>

                  {/* ── SECTION B: EDITORIAL HERO SECTION ───────────────────────────── */}
                  <section id="top" className="bg-white border-b border-[#E5E5DC]">
                    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-12 sm:pt-14 sm:pb-16">
                      {/* Oversized Editorial Headline + Supporting Description Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10">
                        <div className="lg:col-span-8">
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#77786F] mb-4">
                            ( SOIL-DRIVEN DECISION SUPPORT · ICAR BENCHMARKED )
                          </div>
                          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.02em] leading-[1.06] text-[#171814] uppercase">
                            YOUR SOIL HAS A STORY.
                            <br />
                            LET&apos;S UNDERSTAND IT.
                          </h1>
                        </div>

                          <div className="lg:col-span-4 space-y-5">
                            <p className="text-sm sm:text-base text-[#77786F] leading-relaxed">
                              Turn soil readings into meaningful crop decisions. Analyse your soil conditions, understand crop suitability and make more informed cultivation choices.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                id="start-analysis-btn"
                                onClick={() => navigate('/farm-details')}
                                className="px-6 py-3 rounded-full bg-[#E7D927] hover:bg-[#D6C81E] text-[#171814] text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-2"
                              >
                                <span>Analyse My Soil</span>
                                <ArrowRight size={16} />
                              </button>
                              <a
                                href="#how-it-works"
                                className="px-5 py-3 rounded-full bg-white hover:bg-[#F7F7F2] text-[#171814] border border-[#E5E5DC] text-sm font-semibold transition-colors inline-flex items-center gap-1.5"
                              >
                                <span>Explore How It Works</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Large Landscape Agricultural Photograph with Restrained Illustrative Soil Sample */}
                        <div className="relative rounded-2xl overflow-hidden border border-[#E5E5DC] bg-[#183B2A]">
                          <img
                            src="/images/hero-field.jpg"
                            alt="Sunlit agricultural crop rows and dark fertile soil furrows"
                            className="w-full h-[300px] sm:h-[420px] lg:h-[490px] object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                          />
                          {/* Subtle vignette only at bottom edge for legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

                            {/* Floating White Card — Strictly Labeled Illustrative Sample */}
                            <div className="sm:absolute sm:bottom-6 sm:left-6 m-4 sm:m-0 bg-white rounded-xl p-4 sm:p-5 border border-[#E5E5DC] max-w-xs shadow-sm">
                              <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#E5E5DC]">
                                <span className="text-xs font-bold text-[#171814]">Illustrative Soil Sample</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FDF6E2] text-[#92400E] border border-[#F3DFAA]">
                                  Sample Dataset
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <span className="text-[10px] text-[#77786F] block">Soil pH</span>
                                  <span className="font-bold text-sm text-[#183B2A]">6.7</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#77786F] block">Moisture*</span>
                                  <span className="font-bold text-sm text-[#183B2A]">28%</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#77786F] block">EC</span>
                                  <span className="font-bold text-sm text-[#183B2A]">0.42 dS/m</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-[#77786F] mt-2.5 leading-snug">
                                Source: Sample dataset — illustrative reference only, not live sensor telemetry.
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>

                        {/* ── SECTION C: HOW IT WORKS (4 STAGES) ──────────────────────────── */}
                        <section id="how-it-works" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 border-b border-[#E5E5DC]">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
                            <div className="lg:col-span-7">
                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#77786F] mb-3">
                                ( CORE WORKFLOW )
                              </div>
                              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171814] uppercase leading-tight">
                                FROM SOIL DATA TO BETTER DECISIONS
                              </h2>
                            </div>
                            <div className="lg:col-span-5">
                              <p className="text-sm text-[#77786F] leading-relaxed">
                                Today, farmers enter Soil Health Card or lab readings manually. The exact same backend pipeline is designed to accept verified ESP32 telemetry once hardware is connected.
                              </p>
                            </div>
                          </div>

                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Editorial List with Thin Hairlines */}
                                <div className="lg:col-span-7 divide-y divide-[#E5E5DC] border-t border-b border-[#E5E5DC]">
                                  {[
                                    {
                                      num: '01',
                                      title: 'Input Soil Data',
                                      desc: 'Enter your farm location, season, and available Soil Health Card readings manually, or test the workflow with a clearly labelled sample scenario.',
                                      icon: <FlaskConical size={18} className="text-[#183B2A]" />,
                                    },
                                    {
                                      num: '02',
                                      title: 'Analyse Soil Conditions',
                                      desc: 'The backend checks missing values, normalises agronomic units, validates physical bounds, and detects acidity, salinity, or nutrient deficits.',
                                      icon: <Layers size={18} className="text-[#183B2A]" />,
                                    },
                                    {
                                      num: '03',
                                      title: 'Evaluate Crop Suitability',
                                      desc: 'The trained Random Forest model and ICAR/TNAU rule-based suitability gates score 23 crops against your soil and local climate context.',
                                      icon: <Sprout size={18} className="text-[#183B2A]" />,
                                    },
                                    {
                                      num: '04',
                                      title: 'Understand the Recommendation',
                                      desc: 'Review supporting and limiting soil parameters, alternative suitable crops, confidence levels, missing data gaps, and practical next steps.',
                                      icon: <FileText size={18} className="text-[#183B2A]" />,
                                    },
                                  ].map((step) => (
                                    <div key={step.num} className="py-5 flex items-start gap-5">
                                      <div className="w-10 h-10 rounded-full bg-[#E7D927] text-[#171814] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                        {step.num}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          {step.icon}
                                          <h3 className="text-base font-bold text-[#171814]">{step.title}</h3>
                                        </div>
                                        <p className="text-sm text-[#77786F] leading-relaxed">{step.desc}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                      {/* Accompanying Soil Texture Photograph */}
                                      <div className="lg:col-span-5">
                                        <div className="rounded-2xl overflow-hidden border border-[#E5E5DC] bg-white">
                                          <img
                                            src="/images/soil-hands.jpg"
                                            alt="Fertile dark agricultural soil held in hands above a crop field"
                                            className="w-full h-64 sm:h-72 object-cover"
                                          />
                                          <div className="p-5 border-t border-[#E5E5DC] flex items-center justify-between gap-4">
                                            <div>
                                              <div className="text-xs font-bold uppercase tracking-wider text-[#183B2A]">
                                                Ready for Field or Lab Input
                                              </div>
                                                <p className="text-xs text-[#77786F] mt-1">
                                                  Optional parameters never silently default to fake numbers in your report.
                                                </p>
                                              </div>
                                              <button
                                                onClick={() => navigate('/farm-details')}
                                                className="w-10 h-10 rounded-full bg-[#183B2A] hover:bg-[#398653] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                                                aria-label="Begin soil input"
                                              >
                                                <ChevronRight size={18} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </section>

                                      {/* ── SECTION D: SOIL INTELLIGENCE PREVIEW ────────────────────────── */}
                                      <section id="soil-intelligence" className="bg-white border-b border-[#E5E5DC]">
                                        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
                                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                                            <div>
                                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#77786F] mb-2">
                                                ( MODEL &amp; SHC PARAMETER COVERAGE )
                                              </div>
                                              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171814] uppercase">
                                                SUPPORTED SOIL &amp; CLIMATE INPUTS
                                              </h2>
                                            </div>
                                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FDF6E2] text-[#92400E] border border-[#F3DFAA] self-start sm:self-auto">
                                              Illustrative Sample Values Only
                                            </span>
                                          </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                  {SUPPORTED_PARAMETERS_PREVIEW.map((item) => (
                <div
                  key={item.name}
                  className="p-5 rounded-xl bg-[#F7F7F2] border border-[#E5E5DC] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-[#171814]">{item.name}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-[#E5E5DC] text-[#398653]">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-[#183B2A]">{item.sample}</span>
                      <span className="text-xs font-medium text-[#77786F]">{item.unit}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#E5E5DC] text-[11px] text-[#77786F]">
                    ICAR reference: {item.range}
                  </div>
                </div>
              ))}

                                                    {/* Future IoT Hardware Tile */}
                                                    <div className="p-5 rounded-xl bg-[#183B2A] text-white flex flex-col justify-between">
                                                      <div>
                                                        <div className="flex items-center justify-between gap-2 mb-3">
                                                          <span className="text-xs font-bold text-[#E7D927]">ESP32 Hardware Readiness</span>
                                                          <Cpu size={16} className="text-[#E7D927]" />
                                                        </div>
                                                        <p className="text-xs text-[#F7F7F2]/85 leading-relaxed">
                                                          Hardware sensors are currently disconnected. Manual input runs first; when connected later, calibrated device telemetry enters the exact same backend pipeline.
                                                        </p>
                                                      </div>
                                                      <Link
                                                        to="/devices"
                                                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#E7D927] hover:underline"
                                                      >
                                                        <span>Inspect Hardware Readiness</span>
                                                        <ArrowRight size={13} />
                                                      </Link>
                                                    </div>
                                                  </div>
                                                </div>
                                              </section>

                                                {/* ── SECTION E: CROP SUITABILITY EXPLANATION PREVIEW ─────────────── */}
                                                <section id="about" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 border-b border-[#E5E5DC]">
                                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                                                    <div className="lg:col-span-5">
                                                      <div className="rounded-2xl overflow-hidden border border-[#E5E5DC]">
                                                        <img
                                                          src="/images/crop-rows.jpg"
                                                          alt="Healthy green crop rows growing in structured dark soil"
                                                          className="w-full h-72 sm:h-80 object-cover"
                                                        />
                                                      </div>
                                                    </div>

                                            <div className="lg:col-span-7 space-y-5">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#77786F]">
                                                  ( EXAMPLE REPORT STRUCTURE )
                                                </span>
                                                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#FDF6E2] text-[#92400E] border border-[#F3DFAA]">
                                                  Illustrative Assessment — Not Live Output
                                                </span>
                                              </div>

                                          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171814] uppercase">
                                            CLEAR, EXPLAINABLE CROP DECISIONS — NEVER A BLACK BOX
                                          </h2>

                                              <p className="text-sm text-[#77786F] leading-relaxed">
                                                Every soil assessment combines trained Random Forest classification (79.7% CV across 23 crops on multi-source open data) with transparent ICAR agronomic constraints so farmers see both why a crop fits and what limits yield.
                                              </p>

                                                        {/* Example Assessment Structure Box */}
                                                        <div className="bg-white rounded-2xl p-6 border border-[#E5E5DC] space-y-4">
                                                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E5DC]">
                                                            <div>
                                                              <span className="text-[11px] text-[#77786F] uppercase font-bold block">Example Crop</span>
                                                              <span className="text-lg font-extrabold text-[#171814]">Soybean (Kharif)</span>
                                                            </div>
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF5EE] text-[#2B7A4B] border border-[#C6E4D1]">
                                                              Suitability: Suitable / Moderate / Not Suitable
                                                            </span>
                                                          </div>

                                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                            <div className="space-y-2">
                                                              <div className="font-bold text-[#2B7A4B] flex items-center gap-1.5">
                                                                <CheckCircle2 size={15} />
                                                                <span>Supporting Soil Factors</span>
                                                              </div>
                                                              <ul className="space-y-1 text-[#77786F] pl-5 list-disc">
                                                                <li>Soil pH compatibility against crop tolerance band</li>
                                                                <li>Macronutrient (N, P, K) availability status</li>
                                                                <li>Seasonal temperature &amp; rainfall fit</li>
                                                              </ul>
                                                            </div>

                                                            <div className="space-y-2">
                                                              <div className="font-bold text-[#C88A14] flex items-center gap-1.5">
                                                                <AlertTriangle size={15} />
                                                                <span>Constraints &amp; Reliability</span>
                                                              </div>
                                                              <ul className="space-y-1 text-[#77786F] pl-5 list-disc">
                                                                <li>Identified acidity, salinity, or zinc deficits</li>
                                                                <li>Missing field readings disclosed openly</li>
                                                                <li>Practical soil improvement before sowing</li>
                                                              </ul>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
        </section>

                                        {/* ── SECTION F: FINAL CALL TO ACTION ─────────────────────────────── */}
                                        <section className="bg-[#183B2A] text-white px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
                                          <div className="max-w-4xl mx-auto text-center space-y-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7D927] text-xs font-bold uppercase tracking-wider">
                                              <ShieldCheck size={14} />
                                              <span>Evidence-Backed Agronomic Support</span>
                                            </div>
                                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight uppercase leading-tight">
                                              MAKE YOUR NEXT CROP DECISION WITH BETTER SOIL INSIGHT.
                                            </h2>
                                            <p className="text-sm sm:text-base text-[#F7F7F2]/80 max-w-2xl mx-auto leading-relaxed">
                                              Enter your Soil Health Card values or farm location now to generate an explainable crop suitability report.
                                            </p>
                                            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                                              <button
                                                onClick={() => navigate('/farm-details')}
                                                className="px-7 py-3.5 rounded-full bg-[#E7D927] hover:bg-[#D6C81E] text-[#171814] text-sm font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
                                              >
                                                <span>Start Soil Analysis</span>
                                                <ArrowRight size={16} />
                                              </button>
                                              <Link
                                                to="/dashboard"
                                                className="px-6 py-3.5 rounded-full border border-white/25 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
                                              >
                                                View My Reports
                                              </Link>
                                            </div>
                                          </div>
                                        </section>

                                        {/* ── CLEAN HONEST FOOTER ─────────────────────────────────────────── */}
                                        <footer className="bg-white border-t border-[#E5E5DC] px-5 sm:px-8 lg:px-12 py-10">
                                          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-1.5 max-w-md">
                                              <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-md bg-[#183B2A] flex items-center justify-center text-[#E7D927]">
                                                  <Sprout size={15} />
                                                </div>
                                                <span className="font-bold text-sm text-[#171814]">AgriN — Regenerative Agricultural Intelligence</span>
                                              </div>
                                              <p className="text-xs text-[#77786F] leading-relaxed">
                                                Soil intelligence and crop suitability decision-support platform built on ICAR/TNAU agronomic rules and verified open agricultural datasets. Does not replace local KVK lab testing.
                                              </p>
                                            </div>

                                          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-[#171814]">
                                            <Link to="/" className="hover:text-[#398653]">Home</Link>
                                            <Link to="/farm-details" className="hover:text-[#398653]">Soil Analysis</Link>
                                            <Link to="/soil-health" className="hover:text-[#398653]">Crop Suitability</Link>
                                            <Link to="/dashboard" className="hover:text-[#398653]">My Reports</Link>
                                            <Link to="/devices" className="hover:text-[#398653]">Device / Data Input</Link>
                                          </div>
                                        </div>

                                            <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-[#E5E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#77786F]">
                                              <span>© {new Date().getFullYear()} AgriN. All rights reserved.</span>
                                              <span>Decision support only — no guaranteed yield or financial outcome claims.</span>
                                            </div>
                                          </footer>
                                        </div>
                                    </div>
                                    )
}
