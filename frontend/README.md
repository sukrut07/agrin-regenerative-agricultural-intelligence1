# 🎨 AgriN Frontend — React 19 + Vite Web Application

The AgriN frontend is a responsive single-page application built on **React 19**, **Vite v8**, **Tailwind CSS v4**, and **Recharts v3**. It pairs an agricultural editorial design system (`Manrope` + `JetBrains Mono`, warm `#F7F7F2` canvas, `#183B2A` forest green, `#E7D927` harvest yellow accents) with interactive data visualizations across all core farmer decision workflows.

---

## 🌐 Multilingual i18n & User Modes

- **Trilingual UI Support**: Runtime language switching across **English (`en`)**, **Hindi (`हिन्दी` - `hi`)**, and **Marathi (`मराठी` - `mr`)** via `src/i18n/translations.js`, `src/context/LanguageContext.jsx`, and `src/components/LanguageSelector.jsx`.
- **Simple vs Advanced Mode**: Controlled via `src/context/UserModeContext.jsx` to let farmers focus on essential workflows or inspect deeper agronomic and technical diagnostics.

---

## 📊 Interactive Visualization Suite (`src/components/ReportCharts.jsx`)

The unified **AgriN Farm Intelligence Report** (`src/pages/Recommendations.jsx`) embeds scroll-triggered, animated Recharts visualizations built directly from `/api/analyze` and `/api/crops/compare` responses:

- **`ReportKpiVisualStrip`**: Animated SVG progress rings (`EditorialRing`) and count-up counters (`useCountUp`) linking directly to report sections.
- **`CropSuitabilityChartCard`**: Interactive top-crop bar chart switching between **Overall Score**, **Rule Engine vs ML (50/50)**, and **Soil / Climate / Water / Season** factors, with bar click-to-inspect.
- **`CropComparisonCharts`**: Side-by-side multi-dimensional `RadarChart` and grouped `BarChart` comparing 2–4 candidate crops.
- **`ActionQueueVisuals`**: Clickable risk severity horizontal `BarChart` (`Critical`, `High`, `Medium`, `Low`) synchronized with the advisory queue filter pills, plus an agronomic domain mix bar chart.
- **`WhyExplanationVisuals`**: Explainable hybrid score breakdown + evidence vs caveat signal counters and assessment trust profile for Section 3.
- **`SoilHealthCharts`**: Animated component breakdown bars, pH spectrum position indicator, and horizontal ICAR nutrient benchmark comparison chart (`% of ICAR Optimal`).
- **`RegenerativeOpportunitiesVisuals`**: Ecological pillar bar chart + interactive intervention priority `PieChart` donut (`High`, `Medium`, `Low`) synchronized with practice filters.
- **`ResilienceVisuals` & `ConfidenceVisuals`**: 5-pillar biophysical resilience `RadarChart` + bar chart, and interactive switcher between 5-dimension Confidence Factors and 4-dimension Data Quality Metrics.

Viewport scroll reveals use `IntersectionObserver` (`useInViewAnimation`) and honor `@media (prefers-reduced-motion: reduce)` in `src/index.css`.

---

## 📱 Page & Component Hierarchy

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

## 💻 Development & Build Commands

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

Latest verified build (`tsc && vite build`): `2,409 modules transformed`, `0` errors (`283ms`).
