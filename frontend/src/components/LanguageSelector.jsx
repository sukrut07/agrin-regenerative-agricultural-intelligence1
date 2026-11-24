import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Globe, ChevronDown, Check } from 'lucide-react'

export default function LanguageSelector({ variant = 'default' }) {
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ zIndex: 50 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
        style={{
          background: variant === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'var(--ff-soft, #f0f7f2)',
          border: '1px solid var(--ff-border, #d2e4d6)',
          color: variant === 'dark' ? '#ffffff' : 'var(--ff-primary, #1e5e3a)',
          cursor: 'pointer'
        }}
        title="Select Language / भाषा निवडा / भाषा चुनें"
      >
        <Globe size={14} className="opacity-80" />
        <span>{currentLang.native}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-36 rounded-xl shadow-lg py-1 border transition-all animate-in fade-in slide-in-from-top-1"
          style={{
            background: '#ffffff',
            borderColor: 'var(--ff-border, #d2e4d6)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === language
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors hover:bg-emerald-50"
                style={{
                  color: isSelected ? 'var(--ff-primary, #1e5e3a)' : '#374151',
                  fontWeight: isSelected ? '700' : '500'
                }}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                </span>
                {isSelected && <Check size={14} style={{ color: 'var(--ff-primary, #1e5e3a)' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
