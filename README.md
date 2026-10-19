# 🌿 EcoAir — Intelligent Clean-Air & Health Action Companion

> **Built for Devpost: Build With AI Basics Hackathon**  
> An intelligent atmospheric companion translating raw environmental indicators into personalized clinical health protection, eco-friendly transit routing, and proactive air quality actions.

---

## 🌟 Why EcoAir? (The Standout Differentiators)

Most environmental applications stop at passive numbers: *"AQI is 115 (Moderate)"*. This leaves people uninformed about which specific pollutant is elevated, what it means for their specific biology, and how they should protect themselves.

**EcoAir changes this dynamic with 8 standout pillars**:
1. **Real AI Air Health Coach**: Interactive clinical AI coach powered by Google Gemini (with offline reasoning fallback) answering questions like *"Plan my day: 5 km run and 9 AM commute"* or *"Is it safe to open windows now?"*.
2. **Real Live Telemetry via Open-Meteo**: Pulls live satellite & station telemetry for any city or via browser GPS (`navigator.geolocation`) with zero paid API keys needed, retaining offline presets as fallback.
3. **24-Hour Forecast & Heatmap**: Analyzes hourly atmospheric predictions to automatically detect and prescribe the single **Best 1-Hour Activity Window** for the user's specific persona.
4. **Real Map-Based Clean Route (Leaflet + OpenStreetMap)**: Side-by-side interactive routing comparing high-pollution arterial boulevards vs tree-lined greenway corridors, calculating microgram particulate savings (**-38% inhaled dose**).
5. **DIY Hardware Sensor Node (ESP32 + Plantower PMS5003)**: Includes ready-to-flash Arduino firmware in [`hardware/esp32_air_node.ino`](hardware/esp32_air_node.ino) allowing demoers to showcase an actual physical laser sensor on their table against city station data.
6. **Clinically Cited Health Personas**: Dynamic risk assessment for Asthma, Outdoor Athletes, Caregivers, and Commuters with citations from WHO 2021, GINA 2023, and the American Thoracic Society.
7. **Personal Clean-Air Streaks & Inhaled Dose**: Tracks daily inhaled PM2.5 in micrograms and awards consecutive low-exposure streak badges.
8. **Accessibility & Multilingual Voice Readout**: Multilingual support (English, Hindi, Gujarati), Web Speech API audio narration, high-contrast mode, and PWA mobile installation.

---

## 🚀 Quick Start & How to Try

EcoAir is built with zero cumbersome runtime dependencies, ensuring immediate reviewability by hackathon judges and users.

### Run Locally:
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/eco-air.git
cd eco-air

# Option A: Open directly in your browser
start index.html # On Windows
open index.html  # On macOS

# Option B: Run via any lightweight static server
npx serve .
# or
python -m http.server 8080
```

---

## 📐 Devpost Learn Planning Documents

Following the official **Devpost Learn 6-Step Curriculum**:

- [x] **Step 1 (`1-start`)**: [`devpost/learner-profile.md`](devpost/learner-profile.md) *(kept private via .gitignore)*
- [x] **Step 2 (`2-scope`)**: [`devpost/scope.md`](devpost/scope.md) — Core kernel, persona discovery, and PoC boundaries.
- [x] **Step 3 (`3-prd`)**: [`devpost/prd.md`](devpost/prd.md) — Product requirements, clinical advisory rules, and UI layout.
- [x] **Step 4 (`4-spec`)**: [`devpost/spec.md`](devpost/spec.md) — Architecture, client-side state schema, and component structure.
- [x] **Step 5 (`5-build`)**: [`devpost/checklist.md`](devpost/checklist.md) — Verified incremental build slices and review gates.
- [x] **Interactive App Map**: [`devpost/app-map.html`](devpost/app-map.html) — Visual architecture companion.
- [x] **Step 6 (`6-ship`)**: Prepared submission assets, demo script, and public repository structure.

---

## 🔌 Hardware Sensor Node (ESP32 + PMS5003)
See [`hardware/README.md`](hardware/README.md) and [`hardware/esp32_air_node.ino`](hardware/esp32_air_node.ino) for the full wiring schematic, BOM, and Arduino source code.
