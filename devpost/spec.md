---
doc: spec
status: approved
---

# EcoAir — Technical Specification

## How This Works, In Plain Language
EcoAir is structured as an interactive, highly responsive client-side web application. It takes raw environmental indicators (AQI, PM2.5, PM10, NO2, O3, CO) and feeds them into a client-side Health Advisory & Routing Engine. The engine correlates the telemetry against the active vulnerability profile and determines risk factors, medical notices, and exposure deltas in real time. Because all logic runs client-side with zero external credentials required, anyone—including Devpost hackathon judges—can clone the repo, double click or run a single local server command, and experience the full application without configuration barriers.

## The Core Journey Through the System
1. **Bootstrap & State Load**: The app mounts, initializes state, checks `localStorage` for any saved user profile and city choice, and renders the default telemetry.
2. **Dynamic UI Painting**: The atmospheric background tint updates to match the current AQI bracket (Emerald for Good, Amber for Moderate, Crimson for Unhealthy/Hazardous).
3. **Profile Calculation**: When the user clicks a profile (e.g. Asthma), the Health Advisory Engine evaluates the current particulate concentrations against clinical thresholds and updates the recommendations list and risk badge.
4. **Clean Route Metric Evaluation**: The Commute Advisor computes the inhalation delta between baseline traffic routes and greenway corridors.
5. **Scenario Injection**: When a simulation scenario is triggered (e.g. Wildfire Event), state dispatches a synthetic telemetry packet, animating the dials, triggering hazard alerts, and demonstrating the complete risk mitigation workflow.

## Stack
- **HTML5 & CSS3**: Native semantic HTML with modern CSS custom properties and Flexbox/Grid for glassmorphism.
- **Tailwind CSS CDN**: Utility-first styling for fast, responsive, zero-build-step rendering.
- **Lucide Icons**: Crisp, lightweight SVG iconography for health and environmental indicators.
- **Modern ES6+ JavaScript**: Clean modular state management, zero build lock-in, lightning-fast instant loading.
- **Local Persistence**: Standard Web Storage API (`localStorage`).

## Where It Runs and How Someone Tries It
- **Runtime**: Any modern web browser (Chrome, Edge, Firefox, Safari).
- **Execution**: Can be opened directly as `index.html` via file protocol or served via any static HTTP server:
  ```bash
  npx serve .
  # or
  python -m http.server 3000
  ```
- **Optional Static Deployment**: GitHub Pages or Vercel static site (zero server config needed).
- **Required Demo Artifacts**: Short demo video (< 3 minutes) walking through the 5 core capabilities, and public GitHub repository link.

## Look and Feel
- **Visual Style**: Clean glassmorphism with dynamic ambient background glow that shifts with AQI severity.
- **Color Codes**:
  - AQI 0–50: `#10B981` (Emerald Green)
  - AQI 51–100: `#F59E0B` (Warm Amber)
  - AQI 101–150: `#F97316` (Vivid Orange)
  - AQI 151+: `#EF4444` (Hazardous Crimson)
- **Typography**: Modern system sans-serif font stack (`Inter`, system-ui, -apple-system, sans-serif).
- **Interactions**: Smooth scale transforms, micro-animations on sensor gauges, and responsive tap feedback.

## Components

### 1. `HeaderNav`
Brand identity, current timestamp, location selector (presets for global cities + live GPS simulation), and reset control.

### 2. `HeroAqiGauge`
Circular SVG stroke gauge displaying overall AQI number, qualitative badge, dominant pollutant banner, and ambient color coordinator.

### 3. `ProfileSelector`
Interactive card selector allowing the user to switch between Asthma/Respiratory, Outdoor Athlete, Child/Elderly, and Urban Commuter personas.

### 4. `HealthAdvisoryCard`
Dynamically computed personalized risk card displaying exposure rating, specific protective guidelines, and indoor air mitigation recommendations.

### 5. `PollutantGrid`
Five metric cards covering PM2.5, PM10, NO2, O3, and CO with current values, WHO limits, and qualitative status tags.

### 6. `CleanRouteAdvisor`
Interactive route exposure comparison module demonstrating the particulate reduction achieved by taking greenway corridors instead of arterial highways.

### 7. `SimulationStudio`
Interactive control panel enabling reviewers to simulate wildfire smoke, rush-hour spikes, or rain scrub events in real time.

## Data Model
```javascript
{
  city: "San Francisco",
  aqi: 42,
  category: "Good", // Good | Moderate | Unhealthy for Sensitive | Hazardous
  dominantPollutant: "PM2.5",
  pollutants: {
    pm25: { value: 9.8, unit: "µg/m³", whoLimit: 15, status: "Normal" },
    pm10: { value: 18.2, unit: "µg/m³", whoLimit: 45, status: "Normal" },
    no2: { value: 14.5, unit: "ppb", whoLimit: 25, status: "Normal" },
    o3: { value: 28.0, unit: "ppb", whoLimit: 50, status: "Normal" },
    co: { value: 0.4, unit: "ppm", whoLimit: 4, status: "Normal" }
  },
  activeProfile: "asthma", // asthma | athlete | caregiver | commuter
  activeSimulation: null // null | 'wildfire' | 'rushHour' | 'rainScrub'
}
```

## File Structure
```
eco-air/
├── index.html               # Main application entry point & layout
├── styles.css               # Atmospheric design, glassmorphism, animations
├── app.js                   # Application state, telemetry engine, UI renderer
├── data.js                  # City presets, profile criteria, WHO benchmarks
├── README.md                # Submission guide, architecture, how-to-run
├── devpost/
│   ├── learner-profile.md   # Step 1: Learner profile (gitignore protected)
│   ├── scope.md             # Step 2: Approved scope
│   ├── prd.md               # Step 3: Approved PRD
│   ├── spec.md              # Step 4: Approved technical spec
│   ├── checklist.md         # Step 5: Build slices & verification
│   └── app-map.html         # Interactive architecture & code tour
└── skills/                  # Official Devpost Learn skill pack
```
