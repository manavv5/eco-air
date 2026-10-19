---
doc: prd
status: approved
---

# EcoAir — Product Requirements Document

EcoAir is an intelligent clean-air and personalized health action companion that translates hyperlocal atmospheric telemetry into personalized health protection and proactive eco-actions.
Source: `scope.md > Who It's For`, `scope.md > The Unique Kernel`.

## The Core Journey
1. **Arrival**: The user opens EcoAir and immediately perceives the atmospheric state through dynamic ambient background illumination and an air quality index (AQI) dial.
2. **Profile Selection**: The user selects or confirms their vulnerability profile (Asthma/Respiratory, Outdoor Athlete, Child/Senior Caregiver, Urban Commuter).
3. **Actionable Health Advisory**: The app recalculates personalized risk levels and renders clear, plain-language protection actions (e.g., mask recommendation, optimal outdoor exercise window, window ventilation timer).
4. **Clean Commute Exploration**: The user reviews the Clean Commute Advisor, comparing their typical transit corridor against a lower-exposure park/residential alternative.
5. **Interactive Event Simulation**: The user tests simulated atmospheric events (e.g. Wildfire Inversion or Post-Rain Clearing) to observe real-time risk transitions, validating the system end-to-end for reviewers and video demonstration.
6. **Persistence**: The user's active profile and custom simulated adjustments persist across page refreshes via local browser storage.

## Screens and Layout
A unified, responsive single-page responsive dashboard composed of cohesive cards:
- **Hero Atmospheric Dial**: Central radial AQI gauge with qualitative badges (Good, Moderate, Unhealthy for Sensitive Groups, Hazardous) and live micro-data (Temperature, Humidity, Wind Speed, Dominant Pollutant).
- **Vulnerability Profile Switcher**: Interactive pill-selector switching between 4 persona engines.
- **Personal Health Action Card**: Tailored advice, exposure hazard meter, and outdoor activity countdown timer.
- **Pollutant Breakdown Grid**: 5 telemetry cards (PM2.5, PM10, NO2, O3, CO) with WHO benchmark comparison bars.
- **Clean Route Exposure Comparison**: Side-by-side card comparing a Main Arterial Boulevard vs Green Corridor with particulate exposure delta (-38% PM2.5).
- **Scenario Simulator Drawer / Bar**: Quick controls to inject atmospheric conditions (Wildfire Smoke Surge, Peak Traffic Inversion, Ocean Breeze Scrub) or select major world cities.

## Look and Feel
- **Theme**: Modern atmospheric glassmorphism with fluid, luminous backdrop blurs.
- **Dynamic Color Shifts**:
  - AQI 0–50 (Clean/Good): Emerald Green (`#10b981`)
  - AQI 51–100 (Moderate): Cyan/Amber glow (`#06b6d4` / `#f59e0b`)
  - AQI 101–150 (Sensitive): Vivid Orange (`#f97316`)
  - AQI 151–200+ (Hazardous): Crimson/Purple gradient (`#ef4444` to `#8b5cf6`)
- **Typography**: Clean, geometric sans-serif (Inter/system-ui) with high-contrast numerals for sensor telemetry.
- **Tone**: Scientific yet approachable, urgent when hazardous, never alarmist without clear mitigations.

## Features and Behavior

### 1. Atmospheric Telemetry Engine
- Displays AQI (0–500), categorized according to international EPA standards.
- Real-time breakdown of 5 core pollutants with metric values in $\mu\text{g/m}^3$ and ppm.
- Visual warning indicators if any individual pollutant breaches WHO 24h health limits.

### 2. Vulnerability-Based Health Intelligence
- Evaluates risk based on selected persona:
  - *Asthma / Respiratory*: Sensitive to particulate matter ($PM_{2.5} > 25\,\mu\text{g/m}^3$ triggers inhaler alert and mask notice).
  - *Outdoor Athlete*: Assesses hyperventilation exposure; advises whether aerobic runs are safe or indoor training is recommended.
  - *Child & Elderly Caregiver*: Strict caution thresholds; provides indoor air filtering and closed-window protocols.
  - *Urban Commuter*: Recommends transit modes and route adjustments.

### 3. Clean Route & Transit Advisor
- Visual path comparison showing estimated inhaled micro-particles between a heavy traffic artery vs a parallel green park corridor.
- Displays calculated reduction in toxic inhalation (e.g. 35–45% less particulate load).

### 4. Interactive Simulation Studio
- Enables immediate testing and validation of edge states (Wildfire haze, Clean mountain air, Industrial peak).
- Instant reactive feedback across all UI components without external API flakiness.

## States and Boundaries
- **Normal Live State**: Displays current default city telemetry with all cards populated.
- **City Switch State**: Instant transitions between global benchmark cities (Los Angeles, New Delhi, London, Tokyo, Paris).
- **Simulation Active State**: Distinct visual indicator showing simulated parameters with a one-click "Reset to Live" button.
- **Storage Persistence**: Active profile and preferred city stored in `localStorage`.

## Product Decisions
- **Zero-Dependency Setup**: Bundled high-fidelity baseline data with optional live fetch to guarantee instant reviewability by hackathon judges without broken API keys.
- **Single Page Architecture**: Eliminates page jumps, keeping the user experience cohesive and demo-video friendly.
- **Client-Side Simulation**: Allows reviewers and video viewers to inspect hazardous warning states immediately without waiting for bad weather.

## What We're Building
A complete, standalone, production-ready web application built with HTML5, CSS (Tailwind/Modern CSS variables), and vanilla JavaScript/modular components, runnable via standard local HTTP server or static hosting (GitHub Pages / Vercel).

## Deferred From the POC
- Multi-user authentication and cloud accounts.
- Physical hardware Bluetooth telemetry ingestion.
- Push notification service worker.

## Non-Goals
- Not replacing certified medical diagnosis equipment.
- Not requiring paid API keys or complicated backend installations.
