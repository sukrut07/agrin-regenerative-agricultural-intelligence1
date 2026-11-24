/**
 * StepLayout — shared layout for multi-step soil assessment workflow pages
 * Matches the AgriN editorial aesthetic (#F7F7F2 canvas, #183B2A forest green, #E7D927 accent)
 */
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import HeaderNav from './HeaderNav'
import { useLanguage } from '../context/LanguageContext'

export default function StepLayout({ step, title, subtitle, children }) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const STEPS = [
    { num: 1, label: t('step_farm_details', 'Farm Details'), path: '/farm-details' },
    { num: 2, label: t('step_soil_test', 'Soil Test'), path: '/soil-test' },
    { num: 3, label: t('step_environment', 'Environment'), path: '/environment' },
    { num: 4, label: t('step_analysis', 'Analysis'), path: '/analysis' },
  ]

  const currentStep = STEPS.find((s) => s.num === step) || STEPS[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F2] text-[#171814]">
      {/* Unified Top Navigation Bar (includes Language Selector & Simple/Advanced Mode) */}
      <HeaderNav />

      {/* Centered Multi-Step Progress Strip */}
      <div className="bg-white border-b border-[#E5E5DC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between sm:justify-center gap-4">
          {/* Desktop / Tablet Horizontal Stepper */}
          <div className="hidden sm:flex items-center justify-center" aria-label="Assessment steps">
            {STEPS.map((s, i) => {
              const isActive = step === s.num
              const isCompleted = step > s.num
              const canNavigate = isCompleted && s.num < 4

              return (
                <div key={s.num} className="flex items-center">
                  <button
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => canNavigate && navigate(s.path)}
                    className={`flex items-center gap-2.5 px-2 py-1 rounded-full transition-colors ${
                      canNavigate ? 'cursor-pointer hover:bg-[#F7F7F2]' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`step-circle ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
                    >
                      {isCompleted ? <Check size={14} strokeWidth={2.75} /> : s.num}
                    </span>
                    <span
                      className={`step-label ${
                        isActive ? 'active' : isCompleted ? 'text-[#183B2A] font-semibold' : ''
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>

                  {i < STEPS.length - 1 && (
                    <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile Compact Stepper */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <span className="step-circle active">{step}</span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#77772B]">
                  Step {step} of {STEPS.length}
                </div>
                <div className="text-xs font-extrabold text-[#171814]">{currentStep.label}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <span
                  key={s.num}
                  className={`h-1.5 rounded-full transition-all ${
                    s.num === step
                      ? 'w-6 bg-[#183B2A]'
                      : s.num < step
                        ? 'w-3 bg-[#398653]'
                        : 'w-2 bg-[#E5E5DC]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Editorial Page Header */}
          <header className="mb-7">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77772B] mb-1.5">
              [ STEP 0{step} OF 04 · SOIL &amp; CROP ASSESSMENT ]
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171814]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-[#77786F] leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
          </header>

          {children}
        </div>
      </main>
    </div>
  )
}
