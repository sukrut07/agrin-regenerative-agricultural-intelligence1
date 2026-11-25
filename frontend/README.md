# 🎨 AgriN Frontend — React 19 + Vite Web Application

The AgriN frontend is a responsive, modern single-page application built on **React 19**, **Vite**, **Tailwind CSS**, and **Recharts**. It provides an intuitive interface for farmers, agronomists, and researchers to explore field intelligence, analyze soil health, plan crop rotations, and monitor IoT telemetry.

---

## 🌐 Multilingual i18n Architecture

The entire user interface supports dynamic runtime language switching across:
- 🇬🇧 **English (en)**
- 🇮🇳 **Hindi (`हिन्दी` - hi)**
- 🇮🇳 **Marathi (`मराठी` - mr)**

### Implementation:
- **`src/i18n/translations.js`**: Centralized trilingual dictionary covering all navigation items, page headers, KPI labels, buttons, badges, categories, and agronomic disclaimers.
- **`src/context/LanguageContext.jsx`**: Global React Context providing:
  - `language`: Currently selected language code (`'en'`, `'hi'`, `'mr'`).
  - `setLanguage(lang)`: Updates active language and persists preference in `localStorage`.
  - `t(key, fallback)`: Translation helper resolving nested keys with safe fallbacks.
- **`src/components/LanguageSelector.jsx`**: Accessible dropdown component available in both the top navigation bar and mobile drawer.

---

## 📱 Page & Component Hierarchy

```
frontend/src/
├── components/
│   ├── HeaderNav.jsx              # Forest-green top navigation with trilingual selector & Add Field button
│   ├── LanguageSelector.jsx       # Language dropdown (EN, HI, MR)
│   ├── AddYourFieldModal.jsx      # 3-step guided field onboarding modal
│   ├── FactorBadges.jsx           # Supporting vs Limiting factor visual pills
│   ├── SensorStatusBadge.jsx      # Sensor source tags (LIVE, SIMULATED, ESTIMATED)
│   └── SuitabilityMeter.jsx       # Visual gauge for crop suitability score
│
├── pages/
│   ├── FieldIntelligence.jsx      # Primary field workspace: SVG boundary map, soil cards, weather telemetry
│   ├── CropExplorer.jsx           # Pan-India 65+ crop catalogue with 9 category chips and search
│   ├── CropPlanner.jsx            # Multi-season rotation optimizer with N credits & water budget
│   ├── SoilHealth.jsx             # 12-parameter Soil Health Card diagnostic and organic remedies
│   ├── AgriVision.jsx             # Sentinel-2 vegetation indices (NDVI/NDMI/EVI) & leaf disease triage
│   ├── RegenerativeScore.jsx      # 5-pillar regenerative score and carbon credit estimator
│   ├── DeviceMonitor.jsx          # AgriSense IoT monitor with Wokwi virtual lab vs physical mode
│   ├── DeviceRegistration.jsx     # ESP32 device onboarding and token issuance
│   ├── Dashboard.jsx              # Analytics, model accuracy, and telemetry charts
│   └── WhatIf.jsx                 # Interactive soil and weather sensitivity simulator
│
├── services/
│   └── api.js                     # Unified REST API client with error handling
└── context/
    ├── AppContext.jsx             # Global farm assessment state
    └── LanguageContext.jsx        # Trilingual state & translation hook
```

---

## 🌟 Key Application Pages

### 1. Field Intelligence Workspace (`/field-intelligence`)
The primary operational dashboard for farmers:
- **Interactive SVG Field Map**: Visual plot polygon displaying sensor node placements and canopy moisture gradients.
- **Real-Time KPIs**: Soil moisture (%), temperature (°C), pH, and organic carbon.
- **Dynamic Weather Telemetry**: 4-day rainfall forecast with rain probability alerts.
- **Actionable Agronomic Advisories**: Immediate notices on irrigation requirements and micro-nutrient deficits.

### 2. Crop Explorer (`/crop-explorer`)
Comprehensive catalogue of **65+ scientific crops** spanning 9 agricultural categories:
- Instant search across English, Hindi, Marathi, and botanical names.
- Filters by Category (Cereals, Pulses, Oilseeds, Commercial, Vegetables, Fruits, Spices, Plantation, Cover/Fodder).
- Filter by Season (Kharif, Rabi, Zaid, Perennial) and Indian State.
- In-depth modal with duration, water requirements, optimal pH range, popular varieties, and regenerative benefits.

### 3. Multi-Season Crop Planner (`/crop-planner`)
Multi-season rotation optimizer designed around ICAR agronomic principles:
- 3-season cycle (Kharif → Rabi → Zaid).
- Calculates biological nitrogen credits (e.g. Chickpea or Cowpea fixes +60 to +75 kg N/ha).
- Water budget balance preventing aquifer over-extraction.
- Biological pest break targeting nematodes and soil-borne fungal pathogens.

### 4. Soil Health Card Diagnostics (`/soil-health`)
Complete 12-parameter diagnostic based on the Government of India Soil Health Card scheme:
- Evaluates N, P, K, S, Zn, Fe, Cu, Mn, B, pH, EC, and SOC against ICAR rating curves.
- Instant preset loading for 4 major Indian Soil Orders (Vertisols, Alluvial, Alfisols, Laterite).
- Generates tailored biological amendments (Gypsum, Lime, Daincha green manuring, Rhizobium/PSB biofertilizers).

### 5. AgriSense IoT Monitor (`/devices`)
Honest hardware telemetry hub:
- **Mode Switcher**: Easily toggle between **Wokwi Virtual Lab (Simulated)** and **Physical Hardware (ESP32)**.
- **Honest States**: Displays unambiguous `SIMULATED WOKWI LAB` indicator in simulation mode and clear `NO LIVE SENSOR DATA` when physical hardware is disconnected.
- Shows calibrated readings and 24-hour root-zone moisture trends.

---

## 💻 Development & Build Commands

```bash
cd frontend

# Install dependencies
npm install

# Start local development server with Hot Module Replacement (HMR)
npm run dev

# Run TypeScript checking and Vite production build
npm run build

# Preview production build locally
npm run preview
```

Production builds compile in ~1.0 second into optimized static assets under `frontend/dist/`.
