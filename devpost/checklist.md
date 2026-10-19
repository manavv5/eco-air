---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Project Scaffold, Data Model, and Atmospheric Gauge**
  - **Becomes usable**: Running dashboard showing the primary AQI dial, atmospheric ambient color shifting, and live city selector.
  - **Why now**: Proves the fundamental end-to-end rendering pipeline and dynamic aesthetic immediately.
  - **PRD ref**: `prd.md > The Core Journey` (Step 1), `prd.md > Screens and Layout`
  - **Spec ref**: `spec.md > Components > HeroAqiGauge`, `spec.md > Data Model`
  - **Build**: Implement `index.html`, `styles.css`, `data.js`, and `app.js` with initial SVG radial gauge and city switcher.
  - **Verify (mechanical)**: Launch local HTTP server, verify gauge renders with accurate stroke-dashoffset and color according to AQI score.
  - **Learner check**: Open in browser, switch between cities, verify AQI numbers and background tone change dynamically.
  - **Commit**: `Add project scaffold, atmospheric gauge, and city telemetry`

- [x] **2. Multi-Pollutant Telemetry Grid and WHO Health Thresholds**
  - **Becomes usable**: Detailed 5-card pollutant telemetry grid (PM2.5, PM10, NO2, O3, CO) with progress bars and WHO risk badges.
  - **Why now**: Unpacks raw AQI into clinical atmospheric components that drive personalized health recommendations.
  - **PRD ref**: `prd.md > Features and Behavior > 1. Atmospheric Telemetry Engine`
  - **Spec ref**: `spec.md > Components > PollutantGrid`
  - **Build**: Add pollutant card generation, WHO threshold comparisons, and dynamic health warning tags.
  - **Verify (mechanical)**: Check that values for all 5 pollutants accurately display corresponding WHO safety margins.
  - **Learner check**: Verify each pollutant card displays clear values, units, and danger alerts when limits are exceeded.
  - **Commit**: `Implement pollutant telemetry grid with WHO health benchmarks`

- [x] **3. Personalized Vulnerability Engine and Health Advisory Cards**
  - **Becomes usable**: 4 interactive persona profiles (Asthma/Respiratory, Outdoor Athlete, Child/Senior, Urban Commuter) generating personalized risk ratings and action checklists.
  - **Why now**: Delivers the core unique kernel of EcoAir—transforming generic weather data into tailored personal protection.
  - **PRD ref**: `prd.md > Features and Behavior > 2. Vulnerability-Based Health Intelligence`
  - **Spec ref**: `spec.md > Components > ProfileSelector`, `spec.md > Components > HealthAdvisoryCard`
  - **Build**: Implement persona selector, rule-based clinical risk evaluation matrix, and dynamic mitigation advice generator.
  - **Verify (mechanical)**: Switch profiles under elevated AQI; verify asthma profile advises medication/N95 while athlete profile evaluates lung hyperventilation risk.
  - **Learner check**: Click each of the 4 profile tabs and verify tailored advice updates instantaneously.
  - **Commit**: `Add personalized vulnerability engine and health advisory cards`

- [x] **4. Clean Commute Advisor and Route Exposure Comparison**
  - **Becomes usable**: Side-by-side commute comparison showing high-pollution arterial route vs clean-air green corridor with calculated inhalation savings.
  - **Why now**: Provides immediate proactive action to reduce daily exposure instead of only passive warnings.
  - **PRD ref**: `prd.md > Features and Behavior > 3. Clean Route & Transit Advisor`
  - **Spec ref**: `spec.md > Components > CleanRouteAdvisor`
  - **Build**: Implement interactive commute comparison component with route exposure percentages, transit mode toggles, and indoor ventilation advisor.
  - **Verify (mechanical)**: Confirm particulate exposure savings correctly calculate based on current atmospheric levels.
  - **Learner check**: Review route comparison card and confirm clear visual distinction between arterial road and greenway.
  - **Commit**: `Implement clean commute advisor and route exposure comparison`

- [x] **5. Scenario Simulation Studio & State Persistence**
  - **Becomes usable**: Real-time atmospheric simulator (Wildfire Smoke, Peak Rush Hour, Post-Rain Scrub) and local storage persistence.
  - **Why now**: Critical for the hackathon demo video—allows reviewers and judges to see dramatic state transitions on camera in seconds.
  - **PRD ref**: `prd.md > Features and Behavior > 4. Interactive Simulation Studio`, `prd.md > States and Boundaries`
  - **Spec ref**: `spec.md > Components > SimulationStudio`, `spec.md > Data Model`
  - **Build**: Implement simulation triggers, synthetic telemetry generator, reset controls, and `localStorage` sync.
  - **Verify (mechanical)**: Click "Wildfire Inversion", verify AQI jumps to 240+ (Hazardous), alert banners fire, and UI switches to crimson theme.
  - **Learner check**: Run through all 3 simulation presets and test browser reload persistence.
  - **Commit**: `Add scenario simulation studio and local persistence`

## Hands-on Checkpoints
- [x] **Checkpoint A (Core Experience)**: Verify AQI gauge, pollutant telemetry, and profile switching work harmoniously.
- [x] **Checkpoint B (Action & Simulation)**: Verify route advisor, scenario studio, and visual transitions are ready for video recording.

## Final Review
- [x] All features from approved PRD verified end-to-end.
- [x] Code formatted, responsive across desktop and mobile screens.
- [x] Zero console errors or broken links.

## Code Tour and App Map
- [x] Generated interactive `devpost/app-map.html` providing visual architecture and code tour.
