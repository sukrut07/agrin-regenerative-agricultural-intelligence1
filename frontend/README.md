# 🎨 AgriN Frontend — React 19 + Vite Web Application

> **Navigation:** [Root README](../README.md) · [Backend](../backend/README.md) · [Hardware](../hardware/README.md) · [Docs Hub](../docs/README.md) · [Test Results](../TEST_RESULTS.md)

The AgriN frontend is a responsive single-page application built on **React 19**, **Vite v8**, **Tailwind CSS v4**, and **Recharts v3**. It pairs an editorial visual system (`Manrope` + `JetBrains Mono`, warm `#F7F7F2` canvas, `#183B2A` forest green, `#E7D927` harvest yellow accents) with interactive data visualizations across all core farmer workflows.

---

## 📑 Table of Contents
- [1. Multilingual i18n & User Modes](#1-multilingual-i18n--user-modes)
- [2. Interactive Visualization Suite (`ReportCharts.jsx`)](#2-interactive-visualization-suite-reportchartsjsx)
- [3. Page & Component Hierarchy](#3-page--component-hierarchy)
- [4. Development & Build Commands](#4-development--build-commands)

---

## 1. Multilingual i18n & User Modes

- **Trilingual UI Support**: Runtime language switching across **English (`en`)**, **Hindi (`हिन्दी` - `hi`)**, and **Marathi (`मराठी` - `mr`)** via `src/i18n/translations.js`, `src/context/LanguageContext.jsx`, and `src/components/LanguageSelector.jsx`.
- **Simple vs Advanced Mode**: Managed via `src/context/UserModeContext.jsx` so farmers can switch between core decision views and deeper agronomic telemetry panels.

---

## 2. Interactive Visualization Suite (`ReportCharts.jsx`)

The unified **AgriN Farm Intelligence Report** (`src/pages/Recommendations.jsx`) embeds scroll-triggered, animated Recharts visualizations powered by live `/api/analyze` and `/api/crops/compare` data:

| Exported Component | Visual Role | Interactive Behavior |
| :--- | :--- | :--- |
| **`ReportKpiVisualStrip`** | Executive KPI cards & rings | Animated `EditorialRing` & `useCountUp` metrics jumping to report sections |
| **`CropSuitabilityChartCard`** | Top cultivar suitability bar chart | Mode switcher (`Overall Score`, `Rule Engine vs ML`, `Soil/Climate/Water/Season`) + click-to-inspect |
| **`CropComparisonCharts`** | 2–4 candidate crop trade-offs | Multi-dimensional `RadarChart` + grouped comparison `BarChart` |
| **`ActionQueueVisuals`** | Risk severity & domain mix | Clickable horizontal severity bars synchronized with `priorityFilter` pills |
| **`WhyExplanationVisuals`** | Section 3 hybrid decision audit | Switches between `Score Breakdown` (`Final`, `Rules`, `ML`, `Fits`) and `Evidence Signals` |
| **`SoilHealthCharts`** | SHC pillars & benchmark ratios | Animated pillar bars, pH spectrum marker & horizontal ICAR optimal percentage chart |
| **`RegenerativeOpportunitiesVisuals`** | Section 5 ecological practices | Clickable Soil/Microclimate Pillar bars + Priority Impact `PieChart` donut filtering cards |
| **`ResilienceVisuals`** | 5-pillar biophysical resilience | Animated resilience polygon `RadarChart` + pillar comparison bar chart |
| **`ConfidenceVisuals`** | Data confidence vs data quality | Toggles between 5-dimension `Confidence Factors` and 4-dimension `Data Quality Metrics` |

Scroll-triggered reveals use `IntersectionObserver` (`useInViewAnimation`) and honor `@media (prefers-reduced-motion: reduce)` in `src/index.css`.

---

## 3. Page & Component Hierarchy

```text
frontend/src/
├── components/
│   ├── AddYourFieldModal.jsx      # Guided 3-step field onboarding modal
│   ├── FactorBadges.jsx           # Supporting vs limiting factor indicators
│   ├── HeaderNav.jsx              # Editorial sticky header, navigation, mode toggle, EN/HI/MR selector
│   ├── LanguageSelector.jsx       # Trilingual switcher component
│   ├── ReportCharts.jsx           # Interactive scroll-animated Recharts visualization suite
│   ├── SensorStatusBadge.jsx      # Provenance tags (MEASURED, SIMULATED, ESTIMATED)
│   ├── StepLayout.jsx             # 4-step soil & crop assessment flow wrapper
│   └── SuitabilityMeter.jsx       # Circular crop suitability score gauge
│
├── pages/
│   ├── Home.jsx                   # Editorial landing page & sample scenarios launcher
│   ├── FarmDetails.jsx            # Step 1: Pan-India state/district/season & sample profiles
│   ├── SoilTest.jsx               # Step 2: 12-parameter Soil Health Card inputs
│   ├── Environment.jsx            # Step 3: Live weather & seasonal parameters
│   ├── Analysis.jsx               # Step 4: Validation summary & pipeline run trigger
│   ├── Recommendations.jsx        # Unified Farm Intelligence Report + interactive charts
│   ├── CropDetails.jsx            # Individual crop parameter audit & suitability breakdown
│   ├── IWantToGrow.jsx            # Target crop feasibility checker
│   ├── WhatIf.jsx                 # Dynamic soil/weather sensitivity simulator
│   ├── FieldIntelligence.jsx      # Plot cockpit, boundary view, ambient & weather signals
│   ├── CropExplorer.jsx           # 65+ scientific crops across 9 categories & filters
│   ├── CropPlanner.jsx            # 3-season (Kharif → Rabi → Zaid) rotation planner
│   ├── SoilHealth.jsx             # Soil Health Card analyzer with soil order presets
│   ├── AgriVision.jsx             # Sentinel-2 vegetation indices & leaf disease screening
│   ├── RegenerativeScore.jsx      # 5-pillar regenerative scorecard & practice simulator
│   ├── AgriMarket.jsx             # Agricultural inputs & local market listings
│   ├── FarmEconomics.jsx          # AgriLedger crop cost, yield & margin estimation
│   ├── DeviceMonitor.jsx          # AgriSense ESP32 vs Wokwi telemetry console
│   ├── DeviceRegistration.jsx     # Sensor node onboarding & API token issuance
│   └── Dashboard.jsx              # System analytics, model metadata & telemetry charts
│
├── context/
│   ├── AppContext.jsx             # Global soil assessment & session state
│   ├── LanguageContext.jsx        # Trilingual i18n context & persistence
│   └── UserModeContext.jsx        # Simple vs Advanced interface mode
│
└── services/
    ├── api.js                     # FastAPI REST client (`/api/*`)
    └── demoScenarios.js           # Representative Indian regional farm archetypes
```

---

## 4. Development & Build Commands

```bash
cd frontend

# Install dependencies
npm install

# Start local dev server with HMR (http://localhost:5173)
npm run dev

# Run TypeScript checking and Vite production build
npm run build

# Preview production build locally
npm run preview
```

Latest verified production build (`tsc && vite build`): `2,409 modules transformed`, `0` errors (`283ms`).
