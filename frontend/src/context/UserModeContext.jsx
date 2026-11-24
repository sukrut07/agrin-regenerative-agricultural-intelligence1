import React, { createContext, useContext, useState, useEffect } from 'react'

const UserModeContext = createContext()

export function UserModeProvider({ children }) {
  const [uiMode, setUiMode] = useState(() => {
    return localStorage.getItem('agrin_ui_mode') || 'simple'
  })

  useEffect(() => {
    localStorage.setItem('agrin_ui_mode', uiMode)
  }, [uiMode])

  const toggleMode = () => {
    setUiMode(prev => (prev === 'simple' ? 'advanced' : 'simple'))
  }

  // Voice narration helper using browser Web Speech API
  const speakText = (text, lang = 'hi-IN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  return (
    <UserModeContext.Provider value={{
      uiMode,
      setUiMode,
      toggleMode,
      isSimpleMode: uiMode === 'simple',
      isAdvancedMode: uiMode === 'advanced',
      speakText,
      stopSpeaking
    }}>
      {children}
    </UserModeContext.Provider>
  )
}

export function useUserMode() {
  const ctx = useContext(UserModeContext)
  if (!ctx) {
    throw new Error('useUserMode must be used within a UserModeProvider')
  }
  return ctx
}
