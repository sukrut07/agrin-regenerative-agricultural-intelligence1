import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🚩' }
]

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('agrin_language')
      return saved && translations[saved] ? saved : 'en'
    } catch (e) {
      return 'en'
    }
  })

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode)
      try {
        localStorage.setItem('agrin_language', langCode)
      } catch (e) {}
    }
  }

  const t = (key, fallback) => {
    const langDict = translations[language] || translations.en
    if (langDict && langDict[key] !== undefined) {
      return langDict[key]
    }
    // Fallback to English
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key]
    }
    return fallback !== undefined ? fallback : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
