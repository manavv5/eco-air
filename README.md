# 🌿 EcoAir — Intelligent Clean-Air & Health Action Companion

> **Built for Devpost: Build With AI Basics Hackathon**  
> An intelligent atmospheric companion translating raw environmental indicators into personalized clinical health protection, eco-friendly transit routing, and proactive air quality actions.

---

## 🌟 Why EcoAir? (The Unique Kernel)

Most environmental applications stop at passive numbers: *"AQI is 115 (Moderate)"*. This leaves people uninformed about which specific pollutant is elevated, what it means for their specific biology, and how they should protect themselves.

**EcoAir changes this dynamic**:
1. **Hyperlocal Environmental Telemetry**: Instant breakdown of 5 core pollutants (PM2.5, PM10, NO2, O3, CO) evaluated against official World Health Organization (WHO) 24-hour clinical safety limits.
2. **Personalized Health Vulnerability Engine**: Dynamic risk evaluation tailored to specific sensitivity profiles:
   - **Asthma / Respiratory Sensitive**: Low particulate tolerance; triggers fast-acting bronchodilator reminders, N95/FFP2 respirator notices, and indoor HEPA air filtration alerts.
   - **Outdoor Athlete / Runner**: Accounts for 8–10x increased minute-ventilation lung load; prescribes safe outdoor cardio duration and timing.
   - **Child & Senior Caregiver**: Strict conservative thresholds protecting delicate pediatric airways and senior cardiovascular systems.
   - **Daily Urban Commuter**: Analyzes street-canyon exhaust levels to guide transit choices.
3. **Clean Commute Advisor**: Compares high-exposure arterial motorways against vegetative greenway park corridors, calculating exact micro-particulate inhalation savings (e.g., **-38% particulate load**).
4. **Atmospheric Simulation Studio**: Allows instant on-camera simulation of environmental events (Wildfire Smoke Surge, Peak Traffic Inversion, Post-Rain Oceanic Scrub) demonstrating reactive state changes for demonstration and testing.
5. **Dynamic Ambient Interface**: Zero generic AI styling. Features fluid glassmorphism where atmospheric color gradients automatically adjust to air severity (Clean Emerald, Moderate Amber, Hazardous Crimson).

---

## 🚀 Quick Start & How to Try

EcoAir is built with zero cumbersome runtime dependencies, ensuring immediate reviewability by hackathon judges and users.

### Run Locally:
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/eco-air.git
cd eco-air

# Option A: Open directly in your browser
open index.html # On macOS
start index.html # On Windows

# Option B: Run via any lightweight static server
npx serve .
# or
python -m http.server 3000
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

## 🔬 Tech Stack
- **Frontend Architecture**: Semantic HTML5, CSS3 Glassmorphism, Tailwind CSS (CDN).
- **Interactive Gauges**: Pure SVG stroke-dashoffset vector mathematics.
- **State & Logic**: Pure modular Vanilla JavaScript (ES6+), Web Storage API (`localStorage`).
- **Icons**: Handcrafted clean SVG vector icons.

---

## 🏆 Hackathon Submission Checklist
- [x] Functional proof-of-concept runnable with zero setup friction.
- [x] Comprehensive Devpost Learn planning artifacts in `/devpost`.
- [x] Public GitHub repository with clean commit history.
- [x] Demo video recording walkthrough ready for submission.
- [x] Human-authored Devpost submission Q&A.
