import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { runAnalysis } from '../services/api'
import HeaderNav from '../components/HeaderNav'
import { Leaf, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

const ANALYSIS_STEPS = [
  { text: 'Validating soil readings, units & farm parameters...', code: '01' },
  { text: 'Processing soil characteristics & ICAR thresholds...', code: '02' },
  { text: 'Evaluating crop suitability via Random Forest ML (23 crops)...', code: '03' },
  { text: 'Calculating suitability rationale, constraints & confidence...', code: '04' },
  { text: 'Preparing your Crop Suitability Report...', code: '05' },
]

export default function Analysis() {
  const navigate = useNavigate()
  const { getApiPayload, setAnalysisResult, setSessionId, dataSource } = useApp()
  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)
  const submittedRef = useRef(false)

  useEffect(() => {
    if (submittedRef.current) return
    submittedRef.current = true

    const interval = setInterval(() => {
      setStep(s => s < ANALYSIS_STEPS.length - 1 ? s + 1 : s)
    }, 550)

    const payload = getApiPayload()
    runAnalysis(payload)
      .then(result => {
        clearInterval(interval)
        setAnalysisResult(result)
        setSessionId(result.session_id)
        navigate('/recommendations')
      })
      .catch(err => {
        clearInterval(interval)
        setError(err.message)
      })

    return () => clearInterval(interval)
  }, [])

  if (error) return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F2] text-[#171814]">
      <HeaderNav />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="ff-card animate-fade-in max-w-md w-full p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FDECEC] text-[#C93F3F] flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={28} />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77772B] mb-1.5">
            [ ANALYSIS INTERRUPTED ]
          </div>
          <h2 className="text-xl font-extrabold text-[#171814] mb-2.5">
            We couldn&apos;t complete the analysis
          </h2>
          <p className="text-sm text-[#77786F] mb-3 leading-relaxed">
            {error}
          </p>
          <p className="text-xs text-[#9B9C92] mb-6">
            Please check your soil and farm inputs and try again.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button type="button" className="btn-agrin-outline" onClick={() => navigate('/soil-test')}>
              <ArrowLeft size={14} /> Edit Inputs
            </button>
            <button type="button" className="btn-agrin-cta" onClick={() => window.location.reload()}>
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const progress = ((step + 1) / ANALYSIS_STEPS.length) * 100

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F2] text-[#171814]">
      <HeaderNav />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="ff-card animate-fade-in max-w-md w-full p-8 sm:p-10 text-center">
          {/* Animated forest emblem */}
          <div className="relative w-24 h-24 mx-auto mb-7">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(24, 59, 42, 0.08)', animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div className="absolute inset-2.5 rounded-full bg-[#183B2A] text-[#E7D927] flex items-center justify-center shadow-md">
              <Leaf size={34} style={{ animation: 'leafPulse 1.8s ease-in-out infinite' }} />
            </div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#77772B] mb-1.5">
            [ STEP 04 OF 04 · INTELLIGENCE ENGINE ]
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#171814] mb-2">
            Analysing Your Soil
          </h2>
          <p className="text-xs sm:text-sm text-[#77786F] mb-4 leading-relaxed">
            Evaluating 23 crops using trained Random Forest ML + ICAR agronomic rules
          </p>

          <div className="mb-6">
            <span className={`ff-badge ${dataSource === 'sample' ? 'ff-badge-amber' : 'ff-badge-green'}`}>
              Source: {dataSource === 'sample' ? 'Sample Dataset' : 'Manual Input'}
            </span>
          </div>

          {/* Current step status */}
          <div className="min-h-[52px] flex items-center justify-center gap-2.5 bg-[#F2F5EE] border border-[#E5E5DC] rounded-xl px-4 py-2.5 mb-5">
            <span className="text-[11px] font-extrabold font-mono-num px-2 py-0.5 rounded bg-[#183B2A] text-[#E7D927] shrink-0">
              {ANALYSIS_STEPS[step].code}
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#183B2A] text-left">
              {ANALYSIS_STEPS[step].text}
            </p>
          </div>

          {/* Progress bar */}
          <div className="score-bar">
            <div
              className="score-bar-fill"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #183B2A, #398653)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-mono-num">
            <span className="text-[#9B9C92]">Step {step + 1} of {ANALYSIS_STEPS.length}</span>
            <span className="text-[#183B2A] font-bold">{Math.round(progress)}%</span>
          </div>

          <p className="text-[11px] text-[#9B9C92] mt-5">
            No external AI API called — analysis runs directly on your farm data
          </p>
        </div>
      </div>
    </div>
  )
}
