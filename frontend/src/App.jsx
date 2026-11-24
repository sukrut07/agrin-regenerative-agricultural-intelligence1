import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

// Core Pages
import Home from './pages/Home'
import FieldIntelligence from './pages/FieldIntelligence'
import CropExplorer from './pages/CropExplorer'
import CropPlanner from './pages/CropPlanner'
import SoilHealth from './pages/SoilHealth'
import AgriVision from './pages/AgriVision'
import RegenerativeScore from './pages/RegenerativeScore'
import AgriMarket from './pages/AgriMarket'
import FarmEconomics from './pages/FarmEconomics'

// Existing AgriN Pages
import FarmDetails from './pages/FarmDetails'
import SoilTest from './pages/SoilTest'
import Environment from './pages/Environment'
import Analysis from './pages/Analysis'
import Recommendations from './pages/Recommendations'
import CropDetails from './pages/CropDetails'
import IWantToGrow from './pages/IWantToGrow'
import WhatIf from './pages/WhatIf'
import Dashboard from './pages/Dashboard'
import DeviceMonitor from './pages/DeviceMonitor'
import DeviceRegistration from './pages/DeviceRegistration'

// Context Providers
import { AppProvider } from './context/AppContext'
import { LanguageProvider } from './context/LanguageContext'
import { UserModeProvider } from './context/UserModeContext'

export default function App() {
  return (
    <LanguageProvider>
      <UserModeProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Home />} />
              <Route path="/field-intelligence" element={<FieldIntelligence />} />

              {/* Scientific Modules */}
              <Route path="/soil-health" element={<SoilHealth />} />
              <Route path="/marketplace" element={<AgriMarket />} />
              <Route path="/economics" element={<FarmEconomics />} />
              <Route path="/crop-planner" element={<CropPlanner />} />
              <Route path="/crop-explorer" element={<CropExplorer />} />
              <Route path="/agrivision" element={<AgriVision />} />
              <Route path="/regenerative" element={<RegenerativeScore />} />

              {/* IoT & Telemetry */}
              <Route path="/devices" element={<DeviceMonitor />} />
              <Route path="/devices/register" element={<DeviceRegistration />} />

              {/* Analytics & Existing Workflows */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/what-if" element={<WhatIf />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/crop/:cropName" element={<CropDetails />} />
              <Route path="/farm-details" element={<FarmDetails />} />
              <Route path="/soil-test" element={<SoilTest />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/i-want-to-grow" element={<IWantToGrow />} />
              <Route path="/home-legacy" element={<Home />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/field-intelligence" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </UserModeProvider>
    </LanguageProvider>
  )
}
