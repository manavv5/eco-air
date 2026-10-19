/**
 * EcoAir Core Application Logic
 * Telemetry ingestion, dynamic atmospheric engine, health risk evaluation,
 * clean commute calculator, and simulation studio.
 */

// Application State
const state = {
  currentCity: "San Francisco",
  aqi: 38,
  category: "Good",
  temp: "17°C",
  humidity: "68%",
  wind: "14 km/h WSW",
  dominantPollutant: "PM2.5",
  pollutants: {},
  activeProfile: "asthma",
  activeSimulation: null,
  transportMode: "cycling" // cycling | walking | transit
};

// SVG Gauge Constants
const GAUGE_RADIUS = 88;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initCitySelector();
  initProfileSelector();
  initSimulationControls();
  initRouteSelector();
  applyTelemetry(CITY_PRESETS[state.currentCity]);
  updateClock();
  setInterval(updateClock, 1000);
});

// Load preferences from localStorage
function loadSavedState() {
  const savedCity = localStorage.getItem("ecoair_city");
  const savedProfile = localStorage.getItem("ecoair_profile");

  if (savedCity && CITY_PRESETS[savedCity]) {
    state.currentCity = savedCity;
  }
  if (savedProfile && PROFILES[savedProfile]) {
    state.activeProfile = savedProfile;
  }
}

// Update clock display
function updateClock() {
  const el = document.getElementById("live-timestamp");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Local";
}

// Populate City Dropdown
function initCitySelector() {
  const select = document.getElementById("city-select");
  if (!select) return;

  select.innerHTML = "";
  Object.keys(CITY_PRESETS).forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = `${city}, ${CITY_PRESETS[city].country}`;
    if (city === state.currentCity) opt.selected = true;
    select.appendChild(opt);
  });

  select.addEventListener("change", (e) => {
    state.currentCity = e.target.value;
    state.activeSimulation = null;
    localStorage.setItem("ecoair_city", state.currentCity);
    clearSimulationActiveState();
    applyTelemetry(CITY_PRESETS[state.currentCity]);
  });
}

// Profile Switcher Controls
function initProfileSelector() {
  const container = document.getElementById("profile-selector-container");
  if (!container) return;

  container.innerHTML = "";
  Object.values(PROFILES).forEach(profile => {
    const btn = document.createElement("button");
    btn.className = `profile-pill ${profile.id === state.activeProfile ? 'active' : ''}`;
    btn.dataset.profileId = profile.id;
    btn.innerHTML = `
      <span class="font-semibold text-sm">${profile.name}</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".profile-pill").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      state.activeProfile = profile.id;
      localStorage.setItem("ecoair_profile", profile.id);
      renderHealthAdvisories();
      renderRouteAdvisor();
    });

    container.appendChild(btn);
  });
}

// Route Transit Mode Buttons
function initRouteSelector() {
  const modeButtons = document.querySelectorAll(".transit-btn");
  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modeButtons.forEach(b => b.classList.remove("bg-emerald-500/20", "text-emerald-400", "border-emerald-500"));
      btn.classList.add("bg-emerald-500/20", "text-emerald-400", "border-emerald-500");
      state.transportMode = btn.dataset.mode;
      renderRouteAdvisor();
    });
  });
}

// Simulation Controls
function initSimulationControls() {
  const simButtons = document.querySelectorAll(".sim-btn");
  simButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const simId = btn.dataset.sim;

      if (state.activeSimulation === simId) {
        // Toggle off
        resetSimulation();
      } else {
        // Activate simulation
        simButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeSimulation = simId;
        const scenario = SIMULATION_SCENARIOS[simId];
        showSimulationBanner(scenario);
        applyTelemetry({
          ...scenario,
          temp: CITY_PRESETS[state.currentCity].temp,
          humidity: CITY_PRESETS[state.currentCity].humidity,
          wind: "Variable"
        });
      }
    });
  });

  const resetBtn = document.getElementById("reset-sim-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetSimulation);
  }
}

function resetSimulation() {
  state.activeSimulation = null;
  clearSimulationActiveState();
  applyTelemetry(CITY_PRESETS[state.currentCity]);
}

function clearSimulationActiveState() {
  document.querySelectorAll(".sim-btn").forEach(b => b.classList.remove("active"));
  const banner = document.getElementById("sim-active-banner");
  if (banner) banner.classList.add("hidden");
}

function showSimulationBanner(scenario) {
  const banner = document.getElementById("sim-active-banner");
  const nameEl = document.getElementById("sim-banner-name");
  const descEl = document.getElementById("sim-banner-desc");
  if (banner && nameEl && descEl) {
    banner.classList.remove("hidden");
    nameEl.textContent = scenario.name;
    descEl.textContent = scenario.desc;
  }
}

// Ingest & Apply Telemetry
function applyTelemetry(data) {
  state.aqi = data.aqi;
  state.category = data.category || getCategoryFromAqi(data.aqi);
  state.dominantPollutant = data.dominantPollutant || "PM2.5";
  state.temp = data.temp || "20°C";
  state.humidity = data.humidity || "60%";
  state.wind = data.wind || "10 km/h";
  state.pollutants = JSON.parse(JSON.stringify(data.pollutants));

  updateAtmosphericTheme();
  renderHeroGauge();
  renderPollutants();
  renderHealthAdvisories();
  renderRouteAdvisor();
}

function getCategoryFromAqi(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  return "Hazardous";
}

// Dynamically Update Ambient Background and Glow
function updateAtmosphericTheme() {
  const body = document.body;
  body.classList.remove("theme-good", "theme-moderate", "theme-sensitive", "theme-hazardous");

  if (state.aqi <= 50) {
    body.classList.add("theme-good");
  } else if (state.aqi <= 100) {
    body.classList.add("theme-moderate");
  } else if (state.aqi <= 150) {
    body.classList.add("theme-sensitive");
  } else {
    body.classList.add("theme-hazardous");
  }
}

// Render SVG Radial Gauge
function renderHeroGauge() {
  const aqiValEl = document.getElementById("aqi-value");
  const aqiBadgeEl = document.getElementById("aqi-category-badge");
  const dominantEl = document.getElementById("dominant-pollutant-badge");
  const progressCircle = document.getElementById("gauge-progress-circle");
  const tempEl = document.getElementById("meta-temp");
  const humidityEl = document.getElementById("meta-humidity");
  const windEl = document.getElementById("meta-wind");

  if (aqiValEl) aqiValEl.textContent = state.aqi;
  if (aqiBadgeEl) aqiBadgeEl.textContent = state.category;
  if (dominantEl) dominantEl.textContent = `Dominant: ${state.dominantPollutant}`;
  if (tempEl) tempEl.textContent = state.temp;
  if (humidityEl) humidityEl.textContent = state.humidity;
  if (windEl) windEl.textContent = state.wind;

  if (progressCircle) {
    const cappedAqi = Math.min(Math.max(state.aqi, 0), 300);
    const progress = cappedAqi / 300;
    const offset = GAUGE_CIRCUMFERENCE * (1 - progress);
    progressCircle.style.strokeDasharray = `${GAUGE_CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = `${offset}`;
  }
}

// Render Pollutant Breakdown Grid
function renderPollutants() {
  const container = document.getElementById("pollutants-container");
  if (!container) return;

  container.innerHTML = "";

  const pollutantKeys = ['pm25', 'pm10', 'no2', 'o3', 'co'];
  pollutantKeys.forEach(key => {
    const p = state.pollutants[key];
    if (!p) return;

    const ratio = (p.value / p.whoLimit) * 100;
    const isExceeded = p.value > p.whoLimit;
    const percentWidth = Math.min(ratio, 100);

    const card = document.createElement("div");
    card.className = "glass-panel p-4 flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${p.name || key.toUpperCase()}</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium ${isExceeded ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
            ${isExceeded ? 'Exceeds WHO' : 'Safe Margin'}
          </span>
        </div>
        <div class="flex items-baseline gap-1 my-1">
          <span class="text-2xl font-extrabold text-white">${p.value}</span>
          <span class="text-xs text-slate-400">${p.unit}</span>
        </div>
        <p class="text-[11px] text-slate-400 leading-tight mt-1">${p.desc || 'Monitored ambient environmental metric.'}</p>
      </div>

      <div class="mt-4 pt-3 border-t border-white/5">
        <div class="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>WHO 24h Threshold</span>
          <span class="font-medium text-slate-300">${p.whoLimit} ${p.unit}</span>
        </div>
        <div class="who-progress-track">
          <div class="who-progress-fill ${isExceeded ? 'exceeded' : ''}" style="width: ${percentWidth}%;"></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Health Risk & Advisory Engine
function renderHealthAdvisories() {
  const riskTitleEl = document.getElementById("advisory-risk-title");
  const riskBadgeEl = document.getElementById("advisory-risk-badge");
  const tipsListEl = document.getElementById("advisory-tips-list");
  const ventWindowEl = document.getElementById("advisory-vent-window");
  const exertionTimerEl = document.getElementById("advisory-exertion-timer");

  const aqi = state.aqi;
  const profileId = state.activeProfile;
  const pm25 = state.pollutants.pm25 ? state.pollutants.pm25.value : 10;
  const o3 = state.pollutants.o3 ? state.pollutants.o3.value : 20;

  let riskLevel = "Low Hazard";
  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  let tips = [];
  let ventRecommendation = "Optimal: Safe for natural all-day cross-ventilation.";
  let exertionLimit = "Full outdoor aerobic duration recommended (>90 min).";

  if (profileId === "asthma") {
    if (aqi <= 50 && pm25 <= 15) {
      riskLevel = "Stable Respiratory Airway";
      tips = [
        "Particulate levels are within WHO clinical tolerance; outdoor activity is safe.",
        "Maintain routine preventative inhaler protocol as prescribed.",
        "Apartment cross-breeze ventilation is safe for opening windows."
      ];
      ventRecommendation = "Safe: Open windows during morning breeze (8:00 AM - 12:00 PM).";
      exertionLimit = "No restriction on outdoor activity.";
    } else if (aqi <= 100) {
      riskLevel = "Moderate Airway Sensitivity";
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Mild micro-particle penetration detected. Carry rescue bronchodilator.",
        "Consider avoiding prolonged outdoor exertion near major arterial roads.",
        "Indoor HEPA filtration recommended if symptoms begin."
      ];
      ventRecommendation = "Restricted: Limit natural ventilation to short 15-min intervals.";
      exertionLimit = "Cap intense outdoor exercise to under 45 minutes.";
    } else {
      riskLevel = "Critical Airway Risk Alert";
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
      tips = [
        "Particulates exceed cellular safety thresholds. Wear an N95/FFP2 mask outdoors.",
        "Keep fast-acting inhaler accessible at all times.",
        "Keep all windows tightly sealed and run indoor HEPA purifiers on continuous medium/high.",
        "Delay all outdoor physical workouts; switch to indoor air-filtered gym."
      ];
      ventRecommendation = "Closed: Keep windows shut; rely strictly on filtered recirculated air.";
      exertionLimit = "Avoid all outdoor aerobic exertion (< 10 min transit only).";
    }
  } else if (profileId === "athlete") {
    if (aqi <= 50) {
      riskLevel = "Optimal Training Window";
      tips = [
        "Minute-ventilation capacity is unobstructed. Ideal conditions for tempo runs and intervals.",
        "Hydration and normal electrolyte replenishment recommended."
      ];
      ventRecommendation = "Fresh air circulating freely.";
      exertionLimit = "Unlimited outdoor endurance training permitted.";
    } else if (aqi <= 100) {
      riskLevel = "Moderate Aerobic Strain";
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Hyperventilation will increase pollutant deposition in bronchioles by 4x.",
        "Shift long endurance runs to shaded greenway parks away from diesel exhaust.",
        "Schedule outdoor workouts before noon to avoid ground-level photochemical ozone."
      ];
      ventRecommendation = "Ventilate indoor gym spaces before 11:00 AM.";
      exertionLimit = "Limit outdoor strenuous cardio to 45–60 minutes.";
    } else {
      riskLevel = "Severe Pulmonary Stress Warning";
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
      tips = [
        "High particulate inhalation during aerobic breathing causes acute airway inflammation.",
        "Cancel outdoor interval sessions and long cycling rides immediately.",
        "Switch to indoor treadmill / stationary trainer in a HEPA-filtered environment."
      ];
      ventRecommendation = "Do not open gym windows; use mechanical HEPA filtering.";
      exertionLimit = "Zero outdoor cardio advised. Strict indoor training only.";
    }
  } else if (profileId === "caregiver") {
    if (aqi <= 50) {
      riskLevel = "Safe Developmental Environment";
      tips = [
        "Air quality is ideal for school playgrounds, strollers, and senior walks.",
        "Promote active outdoor play and fresh bedroom air circulation."
      ];
      ventRecommendation = "Excellent: All-day window airflow approved.";
      exertionLimit = "Unrestricted outdoor playground & recreation time.";
    } else if (aqi <= 100) {
      riskLevel = "Elevated Pediatric & Senior Caution";
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Children breathe 50% more air per pound of body weight than adults.",
        "Reduce high-intensity outdoor playground sports during peak afternoon hours.",
        "Monitor vulnerable elderly family members for early cough or shortness of breath."
      ];
      ventRecommendation = "Ventilate rooms early morning only; close by 1:00 PM.";
      exertionLimit = "Limit playground play to 30–45 minutes.";
    } else {
      riskLevel = "Urgent Sensitive Group Hazard";
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
      tips = [
        "High hazard for developing pediatric lungs and cardiovascular-sensitive seniors.",
        "Keep children and elderly indoors with air purification active.",
        "Ensure child-fitted N95 masks if transit to school/clinics is unavoidable.",
        "Maintain indoor humidity between 40-50% to soothe respiratory membranes."
      ];
      ventRecommendation = "Strictly closed windows; tape door drafts if smoke enters.";
      exertionLimit = "Remain indoors; zero prolonged outdoor exposure.";
    }
  } else { // Commuter
    if (aqi <= 50) {
      riskLevel = "Clean Transit Corridor";
      tips = [
        "Great air quality across all primary commute arteries.",
        "Biking or walking commute delivers maximum health & wellness benefits."
      ];
      ventRecommendation = "Fresh breeze across travel routes.";
      exertionLimit = "Ideal for walking or biking commutes.";
    } else if (aqi <= 100) {
      riskLevel = "Elevated Street-Canyon Exhaust";
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Heavy stop-and-go vehicle traffic creates elevated toxic micro-pockets along boulevards.",
        "Reroute your walking/cycling commute through residential backstreets and park corridors.",
        "Avoid standing directly behind diesel buses and idling utility trucks at intersections."
      ];
      ventRecommendation = "Keep car ventilation set to 'Cabin Recirculation' mode.";
      exertionLimit = "Use low-exposure greenway route to cut inhaled soot by 35%.";
    } else {
      riskLevel = "Hazardous Commute Smog";
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
      tips = [
        "Extremely high particulate concentrations along roadside corridors.",
        "Switch from active biking/walking to enclosed public metro or car with HEPA filtration.",
        "Wear an N95 respirator mask while waiting at above-ground transit stops."
      ];
      ventRecommendation = "Keep vehicle windows sealed; cabin air filter on MAX.";
      exertionLimit = "Avoid walking or biking along traffic corridors entirely.";
    }
  }

  if (riskTitleEl) riskTitleEl.textContent = riskLevel;
  if (riskBadgeEl) {
    riskBadgeEl.className = `status-badge ${badgeColor}`;
    riskBadgeEl.textContent = state.category;
  }
  if (ventWindowEl) ventWindowEl.textContent = ventRecommendation;
  if (exertionTimerEl) exertionTimerEl.textContent = exertionLimit;

  if (tipsListEl) {
    tipsListEl.innerHTML = "";
    tips.forEach(tip => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 text-sm text-slate-300";
      li.innerHTML = `
        <span class="text-emerald-400 mt-0.5">•</span>
        <span>${tip}</span>
      `;
      tipsListEl.appendChild(li);
    });
  }
}

// Clean Commute Advisor Calculations
function renderRouteAdvisor() {
  const arterialPmEl = document.getElementById("route-arterial-pm");
  const greenwayPmEl = document.getElementById("route-greenway-pm");
  const reductionPillEl = document.getElementById("route-reduction-pill");
  const savedMicrogramsEl = document.getElementById("route-saved-ug");

  const basePm25 = state.pollutants.pm25 ? state.pollutants.pm25.value : 20;

  // Arterial road exhaust penalty (+42% micro-particulates near diesel lanes)
  const arterialPm = Math.round(basePm25 * 1.42);
  // Greenway park reduction (-38% particulate load)
  const greenwayPm = Math.round(basePm25 * 0.62);
  const reductionPercent = 38;

  // Calculate estimated inhaled micrograms based on transit mode
  let ventilationMultiplier = 1.0;
  if (state.transportMode === "cycling") ventilationMultiplier = 2.4;
  if (state.transportMode === "walking") ventilationMultiplier = 1.6;

  const totalExposureDiff = Math.round((arterialPm - greenwayPm) * ventilationMultiplier);

  if (arterialPmEl) arterialPmEl.textContent = `${arterialPm} µg/m³`;
  if (greenwayPmEl) greenwayPmEl.textContent = `${greenwayPm} µg/m³`;
  if (reductionPillEl) reductionPillEl.textContent = `-${reductionPercent}% Particulate Load`;
  if (savedMicrogramsEl) savedMicrogramsEl.textContent = `~${totalExposureDiff} µg avoided per 30-min commute`;
}
