---
doc: scope
status: approved
---

# EcoAir — Intelligent Clean-Air & Personal Health Companion

Hyperlocal atmospheric intelligence that translates raw air quality data into personalized health protection and proactive eco-actions.

## The Unique Kernel
Instead of displaying a passive, detached AQI number, EcoAir correlates hyperlocal multi-pollutant telemetry (PM2.5, PM10, NO2, O3, CO) with a user's specific health vulnerability profile (Asthma/Respiratory, Outdoor Athlete, Child/Elderly, Daily Commuter) to provide proactive, minute-by-minute hazard mitigation, clean-air transit advice, and indoor ventilation timing.

## Who It's For
Urban residents living in pollution-impacted cities who need actionable answers, not just sensor readings.
- **Example persona**: Sarah, an active city commuter with mild asthma.
- **Today's workaround**: She checks a standard weather app, sees "AQI 115 - Moderate", has no idea what pollutant is elevated, doesn't know if she should run outside or take an inhaler, and commutes down smoggy traffic corridors unaware.
- **With EcoAir**: She opens the app in 3 seconds, sees elevated PM2.5 requires an N95 or delaying her run until 7 PM, gets a recommended low-exposure park route for her commute, and sees the optimal 20-minute window to ventilate her apartment.

## The Core Loop
1. **Open & Glance**: User sees the live atmospheric status through a dynamic ambient interface that shifts color and tone with air severity.
2. **Personalized Risk Assessment**: User selects or views their vulnerability profile and receives immediate health impact ratings and protective action prompts.
3. **Action & Routing**: User checks the Clean Route Advisor comparing high-exposure arterial roads vs clean-air green corridors, or follows indoor air tips.
4. **Interactive Scenario Testing**: User can trigger the Simulation Studio (Wildfire Smoke, Traffic Rush, Rain Scrub) to evaluate preparedness and test system behavior.

## Inspiration & Identity
- **Visual Feel**: Atmospheric glassmorphism, fluid ambient backgrounds shifting from Clean Emerald (#10b981) to Warning Amber (#f59e0b) to Hazardous Crimson (#ef4444).
- **Tone**: Reassuring, scientific, empowering, and crisp. No generic dark-dashboard clutter.

## Why This Matters to the Learner
Demonstrating that AI-driven environmental computing can transform raw open environmental telemetry into life-saving, daily micro-actions that empower vulnerable communities.

## What "Working" Looks Like
A responsive web application running locally and deployable to the web:
- Instant interactive pollutant dial & AQI gauge with live metric breakdowns.
- 4 dynamic health vulnerability profiles with customized risk calculations.
- Clean Route & Action planner showing pollution delta and commute exposure scores.
- Interactive Scenario Studio simulating atmospheric shifts with real-time UI updates (perfect for the required video demo).

## The POC Boundary
- **Included**:
  - Live & curated multi-city telemetry (e.g. New Delhi, Los Angeles, London, Tokyo, Beijing, Paris) plus custom location input.
  - Granular pollutant index: PM2.5, PM10, NO2, O3, CO with WHO threshold indicators.
  - 4 tailored health profiles with dynamic medical/lifestyle advisories.
  - Clean Route comparison module (Standard vs Low-Exposure Route).
  - Atmospheric Event Simulator (Wildfire haze, Peak rush-hour, Post-rain clearing).
  - Saved local preferences surviving reloads (via localStorage).
- **Later (Post-Hackathon)**:
  - Bluetooth physical air sensor pairing (e.g. Sensirion/BME680).
  - Multi-user authentication & community clean-air mapping network.
- **Explicitly Cut**:
  - Global user login / backend database (unneeded for standalone PoC and adds setup friction).
  - Paid API key dependencies (app includes bundled offline telemetry presets and open live weather/AQI fallback).
