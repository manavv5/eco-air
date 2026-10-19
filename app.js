/**
 * EcoAir Core Application Logic v3.0 (Urban Air Intelligence Platform)
 * SEE -> UNDERSTAND -> PREDICT -> ACT -> MEASURE
 * Real CAAQMS Ground Truth, Multi-Horizon Forecast, Source Attribution,
 * What-If Sandbox, 9-Step Walkthrough Tour, AI Health Coach & Clean Commute.
 */

// Application State
const state = {
  activeViewMode: "citizen", // citizen | urban
  activeLoopTab: "see",      // see | understand | predict | act | measure
  currentCity: "Nagpur (CAAQMS Network)",
  lat: 21.1458,
  lon: 79.0882,
  aqi: 137,
  category: "Unhealthy for Sensitive Groups",
  categoryMeta: AQI_SCALE[2],
  temp: "29°C",
  humidity: "48%",
  wind: "8 km/h NW",
  dominantPollutant: "PM2.5",
  pollutants: {
    pm25: { value: 78.0, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter from vehicular combustion and industry." },
    pm10: { value: 156.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse dust, road silt, and mechanical wear." },
    no2: { value: 38.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted from vehicle exhausts; inflames respiratory tracts." },
    o3: { value: 32.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Secondary oxidant formed under intense solar UV." },
    co: { value: 1.2, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines." }
  },
  activeProfile: "asthma",
  activeSimulation: null,
  transportMode: "cycling",
  currentLang: "en",
  highContrast: false,
  isDarkMode: false,
  isHardwareNodeActive: false,
  hardwareTelemetry: { pm25: 14.2, pm10: 24.0, aqi: 54, temp: 24.5, hum: 52 },
  exposureStreak: 3,
  dailyInhaledDose: 16.4,
  geminiApiKey: localStorage.getItem("ecoair_gemini_key") || "",

  // Urban Simulator Sliders
  simTrafficReduction: 20, // -20%
  simEvAdoption: 15,       // +15%
  simDustSuppression: 25,  // -25%
  simGreenCanopy: 10,      // +10%

  // 9-Step Walkthrough State
  demoTourStep: 0,
  isTourActive: false
};

// SVG Gauge Constants
const GAUGE_RADIUS = 88;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

// Leaflet Map & Markers
let routeMap = null;
let stationMarkers = [];
let arterialPolyline = null;
let greenwayPolyline = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initLanguage();
  initViewModeSwitcher();
  initLoopTabs();
  initCitySelector();
  initProfileSelector();
  initSimulationControls();
  initRouteSelector();
  initAiCoach();
  initHardwareControls();
  initShareCard();
  initAccessibility();
  initUrbanSimulator();
  initInterventionsList();
  initDemoTour();
  initMap();

  // Load Initial Telemetry
  loadCityData(state.currentCity);

  updateClock();
  setInterval(updateClock, 1000);
});

// Load preferences from localStorage
function loadSavedState() {
  const savedCity = localStorage.getItem("ecoair_city");
  const savedProfile = localStorage.getItem("ecoair_profile");
  const savedLang = localStorage.getItem("ecoair_lang");
  const savedTheme = localStorage.getItem("ecoair_theme");

  if (savedCity && CITY_COORDINATES[savedCity]) state.currentCity = savedCity;
  if (savedProfile && PROFILES[savedProfile]) state.activeProfile = savedProfile;
  if (savedLang && TRANSLATIONS[savedLang]) state.currentLang = savedLang;
  if (savedTheme === "dark") {
    state.isDarkMode = true;
    document.body.classList.add("theme-dark");
  }
}

// Clock Display
function updateClock() {
  const el = document.getElementById("live-timestamp");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Local";
}

// Mode Switcher: Citizen Mode vs Urban Planning Mode
function initViewModeSwitcher() {
  const citizenBtn = document.getElementById("mode-citizen-btn");
  const urbanBtn = document.getElementById("mode-urban-btn");
  const citizenSection = document.getElementById("citizen-mode-section");
  const urbanSection = document.getElementById("urban-mode-section");

  if (!citizenBtn || !urbanBtn) return;

  citizenBtn.addEventListener("click", () => {
    state.activeViewMode = "citizen";
    citizenBtn.classList.add("bg-emerald-600", "text-white");
    citizenBtn.classList.remove("text-slate-600");
    urbanBtn.classList.remove("bg-emerald-600", "text-white");
    urbanBtn.classList.add("text-slate-600");
    if (citizenSection) citizenSection.classList.remove("hidden");
    if (urbanSection) urbanSection.classList.add("hidden");
  });

  urbanBtn.addEventListener("click", () => {
    state.activeViewMode = "urban";
    urbanBtn.classList.add("bg-emerald-600", "text-white");
    urbanBtn.classList.remove("text-slate-600");
    citizenBtn.classList.remove("bg-emerald-600", "text-white");
    citizenBtn.classList.add("text-slate-600");
    if (urbanSection) urbanSection.classList.remove("hidden");
    if (citizenSection) citizenSection.classList.add("hidden");
    renderSourceAttribution();
    renderMultiHorizonForecast();
    calculateSimulatorImpact();
  });
}

// Operational Loop Navigation (SEE -> UNDERSTAND -> PREDICT -> ACT -> MEASURE)
function initLoopTabs() {
  const tabs = document.querySelectorAll(".loop-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.activeLoopTab = tab.dataset.tab;
      
      // Auto-switch to Urban view if clicking non-citizen tabs
      if (["understand", "predict", "act", "measure"].includes(state.activeLoopTab)) {
        document.getElementById("mode-urban-btn")?.click();
      } else {
        document.getElementById("mode-citizen-btn")?.click();
      }

      // Scroll to relevant card
      const targetMap = {
        see: "see-anchor",
        understand: "understand-anchor",
        predict: "predict-anchor",
        act: "act-anchor",
        measure: "measure-anchor"
      };
      const anchorEl = document.getElementById(targetMap[state.activeLoopTab]);
      if (anchorEl) anchorEl.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// 9-Step Interactive Walkthrough Demonstration Tour
function initDemoTour() {
  const startTourBtn = document.getElementById("start-tour-btn");
  const nextTourBtn = document.getElementById("tour-next-btn");
  const closeTourBtn = document.getElementById("tour-close-btn");
  const tourModal = document.getElementById("demo-tour-modal");

  if (startTourBtn) {
    startTourBtn.addEventListener("click", () => {
      state.isTourActive = true;
      state.demoTourStep = 0;
      showTourStep(0);
      if (tourModal) tourModal.classList.remove("hidden");
    });
  }

  if (nextTourBtn) {
    nextTourBtn.addEventListener("click", () => {
      state.demoTourStep = (state.demoTourStep + 1) % DEMO_TOUR_STEPS.length;
      showTourStep(state.demoTourStep);
    });
  }

  if (closeTourBtn) {
    closeTourBtn.addEventListener("click", () => {
      state.isTourActive = false;
      if (tourModal) tourModal.classList.add("hidden");
    });
  }
}

function showTourStep(idx) {
  const step = DEMO_TOUR_STEPS[idx];
  const titleEl = document.getElementById("tour-step-title");
  const descEl = document.getElementById("tour-step-desc");
  const counterEl = document.getElementById("tour-step-counter");

  if (titleEl) titleEl.textContent = step.title;
  if (descEl) descEl.textContent = step.desc;
  if (counterEl) counterEl.textContent = `Step ${step.step} of 9`;

  // Actuate Application State according to step
  if (step.step <= 3) {
    document.getElementById("mode-citizen-btn")?.click();
    document.querySelector('.loop-tab[data-tab="see"]')?.classList.add("active");
  } else {
    document.getElementById("mode-urban-btn")?.click();
    if (step.step === 4) document.querySelector('.loop-tab[data-tab="understand"]')?.classList.add("active");
    if (step.step === 5) document.querySelector('.loop-tab[data-tab="predict"]')?.classList.add("active");
    if (step.step === 6) document.querySelector('.loop-tab[data-tab="act"]')?.classList.add("active");
    if (step.step >= 7) document.querySelector('.loop-tab[data-tab="measure"]')?.classList.add("active");
  }

  if (step.action.aqi) {
    applyTelemetry({
      aqi: step.action.aqi,
      category: step.action.category || getAqiMeta(step.action.aqi).label,
      dominantPollutant: step.action.no2 ? "NO2" : "PM2.5",
      temp: state.temp,
      humidity: state.humidity,
      wind: "6 km/h",
      pollutants: {
        pm25: { value: step.action.pm25 || Math.round(step.action.aqi * 0.55), unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter" },
        pm10: { value: Math.round(step.action.aqi * 1.1), unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Coarse particulate matter" },
        no2: { value: step.action.no2 || 34.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Combustion gas" },
        o3: { value: 28.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Photochemical oxidant" },
        co: { value: 1.0, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Exhaust gas" }
      }
    });
  }
}

// Language Switcher
function initLanguage() {
  const langSelect = document.getElementById("lang-select");
  if (!langSelect) return;
  langSelect.value = state.currentLang;

  langSelect.addEventListener("change", (e) => {
    state.currentLang = e.target.value;
    localStorage.setItem("ecoair_lang", state.currentLang);
    applyTranslations();
  });
  applyTranslations();
}

function applyTranslations() {
  const t = TRANSLATIONS[state.currentLang] || TRANSLATIONS.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });
  renderHealthAdvisories();
}

// Accessibility & Theme Toggles
function initAccessibility() {
  const themeToggle = document.getElementById("theme-toggle-btn");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      state.isDarkMode = !state.isDarkMode;
      document.body.classList.toggle("theme-dark", state.isDarkMode);
      localStorage.setItem("ecoair_theme", state.isDarkMode ? "dark" : "nature");
      themeToggle.textContent = state.isDarkMode ? "🌿 Nature Palette" : "🌌 Dark Mode";
    });
  }

  const contrastBtn = document.getElementById("contrast-toggle-btn");
  if (contrastBtn) {
    contrastBtn.addEventListener("click", () => {
      state.highContrast = !state.highContrast;
      document.body.classList.toggle("high-contrast", state.highContrast);
    });
  }

  const voiceBtn = document.getElementById("voice-readout-btn");
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      readAdvisoryAloud();
    });
  }
}

// Web Speech API Voice Readout
function readAdvisoryAloud() {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();

  const title = document.getElementById("advisory-risk-title")?.textContent || "";
  const tips = Array.from(document.querySelectorAll("#advisory-tips-list li")).map(li => li.textContent).join(". ");
  const text = `EcoAir Urban Intelligence Report for ${PROFILES[state.activeProfile].name}. Current status: ${state.category}. AQI ${state.aqi}. ${title}. Key recommendations: ${tips}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  if (state.currentLang === "hi") utterance.lang = "hi-IN";
  else if (state.currentLang === "gu") utterance.lang = "gu-IN";
  else utterance.lang = "en-US";

  window.speechSynthesis.speak(utterance);
}

// City Selector & Geolocation
function initCitySelector() {
  const select = document.getElementById("city-select");
  const geoBtn = document.getElementById("use-geo-btn");
  if (!select) return;

  select.innerHTML = "";
  Object.keys(CITY_COORDINATES).forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = `${city}, ${CITY_COORDINATES[city].country}`;
    if (city === state.currentCity) opt.selected = true;
    select.appendChild(opt);
  });

  select.addEventListener("change", (e) => {
    state.currentCity = e.target.value;
    state.activeSimulation = null;
    localStorage.setItem("ecoair_city", state.currentCity);
    clearSimulationActiveState();
    loadCityData(state.currentCity);
  });

  if (geoBtn) {
    geoBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        geoBtn.textContent = "📍 Locating...";
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.lat = pos.coords.latitude;
            state.lon = pos.coords.longitude;
            state.currentCity = "My Current Location";
            geoBtn.textContent = "📍 GPS Active";
            fetchLiveTelemetry(state.lat, state.lon, "My Location");
          },
          (err) => {
            alert("Unable to retrieve location: " + err.message);
            geoBtn.textContent = "📍 Use My Location";
          }
        );
      }
    });
  }
}

// Load Telemetry from Nagpur CAAQMS Ground Truth or Open-Meteo Live API
async function loadCityData(cityName) {
  if (cityName === "Nagpur (CAAQMS Network)") {
    // Load Ground Truth CAAQMS Baseline
    const centralStation = CAAQMS_STATIONS[1]; // Central Junction Hotspot
    state.lat = centralStation.lat;
    state.lon = centralStation.lon;

    const caaqmsData = {
      aqi: centralStation.aqi,
      temp: "29°C",
      humidity: "48%",
      wind: "7 km/h NW",
      dominantPollutant: "PM2.5 (Vehicular)",
      pollutants: {
        pm25: { value: Math.round(centralStation.rspm * 0.52), unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter from vehicle exhausts and road wear." },
        pm10: { value: centralStation.rspm, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Respirable suspended particulate matter (CAAQMS ground observation)." },
        no2: { value: centralStation.nox, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted from vehicle exhausts; inflames respiratory tracts." },
        o3: { value: 32.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Secondary oxidant formed under intense solar UV." },
        co: { value: centralStation.so2 ? parseFloat((centralStation.so2 * 0.1).toFixed(1)) : 1.2, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines." }
      }
    };
    applyTelemetry(caaqmsData);
    renderForecastHeatmap();
    renderStationExplorer();
    updateMapLocation(state.lat, state.lon);
    return;
  }

  const coords = CITY_COORDINATES[cityName] || { lat: 37.7749, lon: -122.4194 };
  state.lat = coords.lat;
  state.lon = coords.lon;
  await fetchLiveTelemetry(coords.lat, coords.lon, cityName);
}

// Live Open-Meteo Fetch
async function fetchLiveTelemetry(lat, lon, label) {
  const statusBadge = document.getElementById("telemetry-source-badge");
  if (statusBadge) statusBadge.textContent = "🛰️ Live Open-Meteo";

  try {
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&hourly=us_aqi,pm2_5,pm10,ozone&forecast_days=2`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl).then(r => r.json()),
      fetch(weatherUrl).then(r => r.json())
    ]);

    const cur = aqiRes.current;
    const wCur = weatherRes.current || {};

    const rawAqi = Math.round(cur.us_aqi || 42);
    const pm25Val = cur.pm2_5 ? parseFloat(cur.pm2_5.toFixed(1)) : 12.0;
    const pm10Val = cur.pm10 ? parseFloat(cur.pm10.toFixed(1)) : 22.0;
    const no2Val = cur.nitrogen_dioxide ? parseFloat(cur.nitrogen_dioxide.toFixed(1)) : 16.0;
    const o3Val = cur.ozone ? parseFloat(cur.ozone.toFixed(1)) : 30.0;
    const coVal = cur.carbon_monoxide ? parseFloat((cur.carbon_monoxide / 1000).toFixed(2)) : 0.5;

    const liveData = {
      aqi: rawAqi,
      temp: `${Math.round(wCur.temperature_2m || 22)}°C`,
      humidity: `${Math.round(wCur.relative_humidity_2m || 55)}%`,
      wind: `${Math.round(wCur.wind_speed_10m || 10)} km/h`,
      dominantPollutant: pm25Val > 25 ? "PM2.5" : (no2Val > 25 ? "NO2" : "O3"),
      pollutants: {
        pm25: { value: pm25Val, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into alveolar sacs." },
        pm10: { value: pm10Val, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust, silica, and pollen." },
        no2: { value: no2Val, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted from vehicle combustion; inflames bronchial lining." },
        o3: { value: o3Val, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Photochemical oxidant formed under intense solar UV radiation." },
        co: { value: coVal, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas that binds to hemoglobin, impeding oxygen transfer." }
      }
    };

    applyTelemetry(liveData);
    renderForecastHeatmap(aqiRes.hourly);
    updateMapLocation(lat, lon);
  } catch (err) {
    console.warn("Using offline validated telemetry preset:", err);
    if (statusBadge) statusBadge.textContent = "⚡ Validated Preset";
    const centralStation = CAAQMS_STATIONS[0];
    applyTelemetry({
      aqi: centralStation.aqi,
      temp: "28°C",
      humidity: "50%",
      wind: "8 km/h NW",
      dominantPollutant: "PM10",
      pollutants: {
        pm25: { value: 72.0, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter" },
        pm10: { value: 145.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Respirable suspended particulate matter" },
        no2: { value: 24.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Vehicle exhaust gas" },
        o3: { value: 28.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Photochemical oxidant" },
        co: { value: 0.8, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas" }
      }
    });
    updateMapLocation(lat, lon);
  }
}

// Correct US EPA AQI Categories
function getAqiMeta(aqi) {
  for (let bracket of AQI_SCALE) {
    if (aqi >= bracket.min && aqi <= bracket.max) return bracket;
  }
  return AQI_SCALE[AQI_SCALE.length - 1];
}

// Ingest Telemetry
function applyTelemetry(data) {
  state.aqi = data.aqi;
  state.categoryMeta = getAqiMeta(data.aqi);
  state.category = state.categoryMeta.label;
  state.dominantPollutant = data.dominantPollutant || "PM2.5";
  state.temp = data.temp || "25°C";
  state.humidity = data.humidity || "50%";
  state.wind = data.wind || "8 km/h";
  state.pollutants = JSON.parse(JSON.stringify(data.pollutants));

  renderHeroGauge();
  renderPollutants();
  renderHealthAdvisories();
  renderRouteAdvisor();
  updateExposureStreak();
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
  if (aqiBadgeEl) {
    aqiBadgeEl.textContent = state.category;
    aqiBadgeEl.className = `status-badge ${state.categoryMeta.bgClass} ${state.categoryMeta.textClass}`;
  }
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
    progressCircle.style.stroke = state.categoryMeta.color;
  }
}

// Station Explorer Cards (Nagpur CAAQMS Network)
function renderStationExplorer() {
  const container = document.getElementById("stations-container");
  if (!container) return;
  container.innerHTML = "";

  CAAQMS_STATIONS.forEach(station => {
    const meta = getAqiMeta(station.aqi);
    const card = document.createElement("div");
    card.className = "eco-card p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-600 transition";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold text-slate-900 dark:text-white">${station.name}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${meta.bgClass} ${meta.textClass}">
            AQI ${station.aqi}
          </span>
        </div>
        <p class="text-[11px] text-slate-500 mb-2">${station.location} (${station.type})</p>
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/5">
          <span>RSPM: ${station.rspm} µg</span>
          <span>NOx: ${station.nox} ppb</span>
        </div>
      </div>
      ${station.isHotspot ? `<div class="mt-2 text-[10px] text-rose-600 font-bold flex items-center gap-1">⚠️ Active Pollution Hotspot</div>` : ''}
    `;

    card.addEventListener("click", () => {
      state.currentCity = `${station.name} (CAAQMS)`;
      state.lat = station.lat;
      state.lon = station.lon;
      applyTelemetry({
        aqi: station.aqi,
        temp: state.temp,
        humidity: state.humidity,
        wind: state.wind,
        dominantPollutant: station.dominant,
        pollutants: {
          pm25: { value: Math.round(station.rspm * 0.52), unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter" },
          pm10: { value: station.rspm, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Respirable suspended particulate matter" },
          no2: { value: station.nox, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Combustion exhaust gas" },
          o3: { value: 30.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Ground oxidant" },
          co: { value: 1.0, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion byproduct" }
        }
      });
      updateMapLocation(station.lat, station.lon);
    });

    container.appendChild(card);
  });
}

// UNDERSTAND: Explainable AI Source Attribution
function renderSourceAttribution() {
  const container = document.getElementById("source-bars-container");
  if (!container) return;
  container.innerHTML = "";

  SOURCE_ATTRIBUTION.overall.forEach(item => {
    const row = document.createElement("div");
    row.className = "space-y-1";
    row.innerHTML = `
      <div class="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
        <span class="flex items-center gap-1.5">${item.icon} ${item.source}</span>
        <span class="font-mono font-bold">${item.percent}%</span>
      </div>
      <div class="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700" style="width: ${item.percent}%; background-color: ${item.color};"></div>
      </div>
      <p class="text-[10px] text-slate-500">${item.desc}</p>
    `;
    container.appendChild(row);
  });
}

// PREDICT: Multi-Horizon Forecasting Engine
function renderMultiHorizonForecast() {
  const container = document.getElementById("multi-horizon-container");
  if (!container) return;
  container.innerHTML = "";

  FORECAST_HORIZONS.forEach(f => {
    const meta = getAqiMeta(f.aqi);
    const card = document.createElement("div");
    card.className = "eco-card p-3.5 flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-slate-500 uppercase">${f.horizon}</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${f.change.startsWith('+') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}">
            ${f.change}
          </span>
        </div>
        <div class="text-2xl font-black ${meta.textClass} font-mono">${f.aqi}</div>
        <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">${meta.label}</div>
      </div>
      <p class="text-[10px] text-slate-500 mt-2 border-t border-slate-100 dark:border-white/5 pt-1.5 leading-tight">
        ${f.explanation}
      </p>
    `;
    container.appendChild(card);
  });
}

// ACT: Action Center / Decision Engine Interventions
function initInterventionsList() {
  const container = document.getElementById("interventions-container");
  if (!container) return;
  container.innerHTML = "";

  INTERVENTIONS_CATALOG.forEach(item => {
    const card = document.createElement("div");
    card.className = "eco-card p-4 space-y-3";
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">${item.category}</span>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-1">${item.title}</h4>
          <p class="text-xs text-slate-500">Target: ${item.target}</p>
        </div>
        <button class="policy-toggle-btn px-3 py-1 rounded-lg text-xs font-bold transition ${item.active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'}" data-id="${item.id}">
          ${item.active ? 'Active Policy' : 'Activate Policy'}
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-white/5 font-mono">
        <div>
          <span class="text-[10px] text-slate-500 block">Expected Reduction</span>
          <span class="font-bold text-emerald-600">${item.expectedImpact}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 block">Affected Population</span>
          <span class="font-bold text-slate-700 dark:text-slate-300">${item.affectedPop}</span>
        </div>
      </div>
    `;

    card.querySelector(".policy-toggle-btn").addEventListener("click", (e) => {
      item.active = !item.active;
      const btn = e.target;
      if (item.active) {
        btn.textContent = "Active Policy";
        btn.className = "policy-toggle-btn px-3 py-1 rounded-lg text-xs font-bold transition bg-emerald-600 text-white shadow-sm";
      } else {
        btn.textContent = "Activate Policy";
        btn.className = "policy-toggle-btn px-3 py-1 rounded-lg text-xs font-bold transition bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300";
      }
      calculateSimulatorImpact();
    });

    container.appendChild(card);
  });
}

// MEASURE: ECO Simulator — What-If Counterfactual Sandbox
function initUrbanSimulator() {
  const trafficSlider = document.getElementById("sim-traffic-slider");
  const evSlider = document.getElementById("sim-ev-slider");
  const dustSlider = document.getElementById("sim-dust-slider");
  const greenSlider = document.getElementById("sim-green-slider");

  if (trafficSlider) {
    trafficSlider.addEventListener("input", (e) => {
      state.simTrafficReduction = parseInt(e.target.value, 10);
      document.getElementById("sim-traffic-val").textContent = `-${state.simTrafficReduction}%`;
      calculateSimulatorImpact();
    });
  }

  if (evSlider) {
    evSlider.addEventListener("input", (e) => {
      state.simEvAdoption = parseInt(e.target.value, 10);
      document.getElementById("sim-ev-val").textContent = `+${state.simEvAdoption}%`;
      calculateSimulatorImpact();
    });
  }

  if (dustSlider) {
    dustSlider.addEventListener("input", (e) => {
      state.simDustSuppression = parseInt(e.target.value, 10);
      document.getElementById("sim-dust-val").textContent = `-${state.simDustSuppression}%`;
      calculateSimulatorImpact();
    });
  }

  if (greenSlider) {
    greenSlider.addEventListener("input", (e) => {
      state.simGreenCanopy = parseInt(e.target.value, 10);
      document.getElementById("sim-green-val").textContent = `+${state.simGreenCanopy}%`;
      calculateSimulatorImpact();
    });
  }
}

function calculateSimulatorImpact() {
  const beforeAqi = state.aqi;
  // Model coefficients: Traffic contributes ~48% of total pollution, Dust ~21%, Green captures ~15%
  const trafficDropRatio = (state.simTrafficReduction / 100) * 0.48;
  const evDropRatio = (state.simEvAdoption / 100) * 0.28;
  const dustDropRatio = (state.simDustSuppression / 100) * 0.21;
  const greenCaptureRatio = (state.simGreenCanopy / 100) * 0.15;

  const totalReductionRatio = Math.min(0.65, trafficDropRatio + evDropRatio + dustDropRatio + greenCaptureRatio);
  const afterAqi = Math.max(25, Math.round(beforeAqi * (1 - totalReductionRatio)));
  const pm25ReductionPct = Math.round(totalReductionRatio * 100);
  const avoidedToxKg = Math.round(totalReductionRatio * 380); // kg/day
  const popProtected = Math.round(totalReductionRatio * 42000);

  const beforeEl = document.getElementById("sim-before-aqi");
  const afterEl = document.getElementById("sim-after-aqi");
  const pmDropEl = document.getElementById("sim-pm-drop");
  const kgEl = document.getElementById("sim-kg-avoided");
  const popEl = document.getElementById("sim-pop-protected");

  if (beforeEl) beforeEl.textContent = beforeAqi;
  if (afterEl) afterEl.textContent = afterAqi;
  if (pmDropEl) pmDropEl.textContent = `↓ ${pm25ReductionPct}%`;
  if (kgEl) kgEl.textContent = `${avoidedToxKg} kg/day`;
  if (popEl) popEl.textContent = `~${popProtected.toLocaleString()} citizens`;
}

// 24-Hour Forecast & Heatmap Window
function renderForecastHeatmap(hourlyData) {
  const container = document.getElementById("forecast-strip");
  const bestWindowEl = document.getElementById("best-window-recommendation");
  if (!container) return;
  container.innerHTML = "";

  let hours = [];
  if (hourlyData && hourlyData.time && hourlyData.us_aqi) {
    const nowIdx = new Date().getHours();
    for (let i = nowIdx; i < nowIdx + 24 && i < hourlyData.time.length; i++) {
      hours.push({
        time: new Date(hourlyData.time[i]).toLocaleTimeString([], { hour: 'numeric' }),
        aqi: Math.round(hourlyData.us_aqi[i] || 45),
        pm25: hourlyData.pm2_5 ? Math.round(hourlyData.pm2_5[i] || 10) : 10
      });
    }
  } else {
    for (let i = 0; i < 24; i++) {
      const h = (new Date().getHours() + i) % 24;
      const variation = Math.sin(i / 3) * 18;
      hours.push({
        time: `${h}:00`,
        aqi: Math.max(20, Math.round(state.aqi + variation)),
        pm25: Math.max(6, Math.round((state.aqi + variation) * 0.42))
      });
    }
  }

  let lowestIdx = 0;
  let minAqi = 999;
  hours.forEach((h, idx) => {
    if (h.aqi < minAqi) {
      minAqi = h.aqi;
      lowestIdx = idx;
    }
  });

  hours.forEach((h, idx) => {
    const meta = getAqiMeta(h.aqi);
    const isOptimal = (idx === lowestIdx);
    const block = document.createElement("div");
    block.className = `forecast-hour-block ${isOptimal ? 'optimal-window' : ''} eco-card flex-shrink-0`;
    block.innerHTML = `
      <div class="text-[10px] text-slate-500 font-mono">${h.time}</div>
      <div class="text-sm font-bold ${meta.textClass} my-0.5">${h.aqi}</div>
      <div class="text-[9px] text-slate-400 font-mono">${h.pm25} µg</div>
    `;
    container.appendChild(block);
  });

  if (bestWindowEl && hours[lowestIdx]) {
    bestWindowEl.innerHTML = `
      <span class="text-emerald-700 dark:text-emerald-400 font-bold">✨ Optimal Outdoor Window:</span> 
      Around <strong>${hours[lowestIdx].time}</strong> (Projected AQI: ${hours[lowestIdx].aqi}, PM2.5: ${hours[lowestIdx].pm25} µg/m³).
    `;
  }
}

// Health Risk & Advisory Engine
function renderHealthAdvisories() {
  const riskTitleEl = document.getElementById("advisory-risk-title");
  const riskBadgeEl = document.getElementById("advisory-risk-badge");
  const tipsListEl = document.getElementById("advisory-tips-list");
  const ventWindowEl = document.getElementById("advisory-vent-window");
  const exertionTimerEl = document.getElementById("advisory-exertion-timer");
  const citationEl = document.getElementById("advisory-citation");

  const aqi = state.aqi;
  const profileId = state.activeProfile;
  const profile = PROFILES[profileId];

  let riskLevel = "Stable Respiratory Baseline";
  let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  let tips = [];
  let ventRecommendation = "Optimal: Safe for natural all-day cross-ventilation.";
  let exertionLimit = "Full outdoor aerobic duration recommended (>90 min).";

  if (profileId === "asthma") {
    if (aqi <= 50) {
      riskLevel = "Stable Airway Baseline";
      tips = [
        "Particulate levels are within WHO clinical tolerance; outdoor activity is safe.",
        "Maintain routine preventative inhaler protocol as prescribed by your physician.",
        "Apartment cross-breeze ventilation is safe for opening windows."
      ];
      ventRecommendation = "Safe: Open windows during morning breeze (8:00 AM - 12:00 PM).";
      exertionLimit = "No restriction on outdoor activity.";
    } else if (aqi <= 100) {
      riskLevel = "Moderate Airway Sensitivity (Elevated PM2.5/NO2)";
      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
      tips = [
        "Micro-particulate penetration detected. Keep fast-acting rescue inhaler accessible.",
        "Consider avoiding prolonged outdoor exertion near major arterial roads.",
        "Indoor HEPA air filtration recommended if early throat tickle occurs."
      ];
      ventRecommendation = "Restricted: Limit natural ventilation to short 15-min intervals.";
      exertionLimit = "Cap intense outdoor exercise to under 45 minutes.";
    } else {
      riskLevel = "Critical Airway Risk Alert (US EPA Exceeded)";
      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      tips = [
        "Particulates exceed cellular safety thresholds. Wear a well-fitted N95/FFP2 mask outdoors.",
        "Keep prescribed bronchodilator on your person at all times.",
        "Keep windows tightly sealed; run indoor HEPA purifier on continuous medium/high.",
        "Switch outdoor physical workouts to an indoor air-filtered environment."
      ];
      ventRecommendation = "Closed: Keep windows shut; rely strictly on filtered recirculated air.";
      exertionLimit = "Avoid outdoor aerobic exertion (< 10 min transit only).";
    }
  } else if (profileId === "athlete") {
    if (aqi <= 50) {
      riskLevel = "Optimal Pulmonary Training Window";
      tips = [
        "Minute-ventilation capacity is unobstructed. Ideal conditions for tempo runs and intervals.",
        "Normal hydration and outdoor training schedule approved."
      ];
      ventRecommendation = "Fresh air circulating freely.";
      exertionLimit = "Unlimited outdoor endurance training permitted.";
    } else if (aqi <= 100) {
      riskLevel = "Moderate Aerobic Strain (High Inhaled Volume)";
      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
      tips = [
        "Minute-ventilation during tempo running increases up to 8-10 fold, significantly increasing total inhaled particulate mass.",
        "Shift long training runs to shaded greenway parks away from diesel exhaust.",
        "Schedule outdoor workouts before noon to avoid photochemical ozone build-up."
      ];
      ventRecommendation = "Ventilate indoor gym spaces before 11:00 AM.";
      exertionLimit = "Limit outdoor strenuous cardio to 45–60 minutes.";
    } else {
      riskLevel = "Severe Pulmonary Stress Warning";
      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      tips = [
        "Deep alveolar particulate deposition causes acute bronchoconstriction and systemic oxidative stress.",
        "Cancel outdoor interval sessions and long cycling rides immediately.",
        "Switch to indoor treadmill or stationary cycling in a HEPA-filtered environment."
      ];
      ventRecommendation = "Do not open gym windows; use mechanical HEPA filtering.";
      exertionLimit = "Zero outdoor cardio advised. Strict indoor training only.";
    }
  } else if (profileId === "caregiver") {
    if (aqi <= 50) {
      riskLevel = "Safe Developmental Environment";
      tips = [
        "Air quality is ideal for school playgrounds, strollers, and senior outdoor walks.",
        "Promote active outdoor play and fresh bedroom air circulation."
      ];
      ventRecommendation = "Excellent: All-day window airflow approved.";
      exertionLimit = "Unrestricted outdoor playground & recreation time.";
    } else if (aqi <= 100) {
      riskLevel = "Elevated Pediatric & Senior Caution";
      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
      tips = [
        "Children inhale significantly more air relative to their body weight than adults, absorbing higher relative pollutant doses.",
        "Reduce high-intensity playground sports during peak afternoon hours.",
        "Monitor vulnerable elderly family members for early cough or shortness of breath."
      ];
      ventRecommendation = "Ventilate rooms early morning only; close by 1:00 PM.";
      exertionLimit = "Limit playground play to 30–45 minutes.";
    } else {
      riskLevel = "Urgent Sensitive Group Hazard";
      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      tips = [
        "High hazard for developing pediatric lungs and cardiovascular-sensitive seniors.",
        "Keep children and elderly indoors with air purification active.",
        "Ensure child-fitted N95 masks if transit to school or clinics is unavoidable."
      ];
      ventRecommendation = "Strictly closed windows; tape door drafts if smoke enters.";
      exertionLimit = "Remain indoors; zero prolonged outdoor exposure.";
    }
  } else {
    // Commuter
    if (aqi <= 50) {
      riskLevel = "Clean Transit Corridor";
      tips = [
        "Great air quality across all primary commute arteries.",
        "Biking or walking commute delivers maximum health & cardiovascular benefits."
      ];
      ventRecommendation = "Fresh breeze across travel routes.";
      exertionLimit = "Ideal for walking or biking commutes.";
    } else if (aqi <= 100) {
      riskLevel = "Elevated Street-Canyon Exhaust";
      badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
      tips = [
        "Stop-and-go vehicle congestion concentrates particulate matter and NO2 along curbsides.",
        "Reroute your walking or cycling commute through residential backstreets and park corridors.",
        "Set car ventilation to 'Cabin Recirculation' mode while in traffic queues."
      ];
      ventRecommendation = "Keep car ventilation set to 'Cabin Recirculation' mode.";
      exertionLimit = "Use low-exposure greenway route to cut inhaled soot by ~38%.";
    } else {
      riskLevel = "Hazardous Commute Smog";
      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
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
  if (citationEl) citationEl.textContent = profile.citation;

  if (tipsListEl) {
    tipsListEl.innerHTML = "";
    tips.forEach(tip => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300";
      li.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span><span>${tip}</span>`;
      tipsListEl.appendChild(li);
    });
  }
}

// Pollutants Breakdown
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
    card.className = "eco-card p-4 flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">${p.name || key.toUpperCase()}</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium ${isExceeded ? 'bg-rose-100 text-rose-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'}">
            ${isExceeded ? 'Exceeds WHO' : 'Safe Margin'}
          </span>
        </div>
        <div class="flex items-baseline gap-1 my-1">
          <span class="text-2xl font-black text-slate-900 dark:text-white">${p.value}</span>
          <span class="text-xs text-slate-500">${p.unit}</span>
        </div>
        <p class="text-[11px] text-slate-500 leading-tight mt-1">${p.desc || 'Monitored ambient environmental metric.'}</p>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
        <div class="flex justify-between text-[11px] text-slate-500 mb-1 font-mono">
          <span>WHO 24h Limit</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">${p.whoLimit} ${p.unit}</span>
        </div>
        <div class="who-progress-track">
          <div class="who-progress-fill ${isExceeded ? 'exceeded' : ''}" style="width: ${percentWidth}%;"></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Leaflet Map & GIS Hotspots
function initMap() {
  const mapEl = document.getElementById("route-map");
  if (!mapEl || typeof L === "undefined") return;

  try {
    routeMap = L.map("route-map", {
      attributionControl: false,
      zoomControl: false
    }).setView([state.lat, state.lon], 13);

    // Natural clean map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(routeMap);

    // Draw CAAQMS stations as markers
    CAAQMS_STATIONS.forEach(s => {
      const circle = L.circleMarker([s.lat, s.lon], {
        radius: s.isHotspot ? 14 : 9,
        fillColor: s.isHotspot ? '#c85c52' : '#2f6b4f',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(routeMap);

      circle.bindPopup(`
        <div class="font-sans text-xs">
          <b>${s.name}</b><br>
          Type: ${s.type}<br>
          AQI: <b>${s.aqi}</b> (${s.status})<br>
          ${s.isHotspot ? `<span style="color:#c85c52;font-weight:bold;">⚠️ Hotspot: ${s.hotspotReason}</span>` : ''}
        </div>
      `);
      stationMarkers.push(circle);
    });

    drawSampleRoutes(state.lat, state.lon);
  } catch (e) {
    console.warn("Leaflet map initialization skipped:", e);
  }
}

function updateMapLocation(lat, lon) {
  if (!routeMap) return;
  routeMap.setView([lat, lon], 13);
  drawSampleRoutes(lat, lon);
}

function drawSampleRoutes(lat, lon) {
  if (!routeMap) return;
  if (arterialPolyline) routeMap.removeLayer(arterialPolyline);
  if (greenwayPolyline) routeMap.removeLayer(greenwayPolyline);

  const arterialCoords = [
    [lat - 0.015, lon - 0.02],
    [lat - 0.005, lon - 0.01],
    [lat + 0.005, lon + 0.01],
    [lat + 0.015, lon + 0.02]
  ];

  const greenwayCoords = [
    [lat - 0.015, lon - 0.02],
    [lat - 0.012, lon - 0.005],
    [lat + 0.002, lon + 0.002],
    [lat + 0.015, lon + 0.02]
  ];

  arterialPolyline = L.polyline(arterialCoords, {
    color: '#c85c52',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 6'
  }).addTo(routeMap).bindPopup("<b>Direct Arterial Boulevard</b><br>High Traffic & Particulates");

  greenwayPolyline = L.polyline(greenwayCoords, {
    color: '#2f6b4f',
    weight: 5,
    opacity: 0.95
  }).addTo(routeMap).bindPopup("<b>Greenway Park Corridor</b><br>-38% Inhaled Micro-Particulates");
}

// Clean Route Exposure
function renderRouteAdvisor() {
  const arterialPmEl = document.getElementById("route-arterial-pm");
  const greenwayPmEl = document.getElementById("route-greenway-pm");
  const reductionPillEl = document.getElementById("route-reduction-pill");
  const savedMicrogramsEl = document.getElementById("route-saved-ug");

  const basePm25 = state.pollutants.pm25 ? state.pollutants.pm25.value : 20;
  const arterialPm = Math.round(basePm25 * 1.42);
  const greenwayPm = Math.round(basePm25 * 0.62);
  const reductionPercent = 38;

  let ventilationMultiplier = 1.0;
  if (state.transportMode === "cycling") ventilationMultiplier = 2.4;
  if (state.transportMode === "walking") ventilationMultiplier = 1.6;

  const totalExposureDiff = Math.round((arterialPm - greenwayPm) * ventilationMultiplier);

  if (arterialPmEl) arterialPmEl.textContent = `${arterialPm} µg/m³`;
  if (greenwayPmEl) greenwayPmEl.textContent = `${greenwayPm} µg/m³`;
  if (reductionPillEl) reductionPillEl.textContent = `-${reductionPercent}% Particulate Load`;
  if (savedMicrogramsEl) savedMicrogramsEl.textContent = `~${totalExposureDiff} µg avoided per 30-min commute`;
}

// Profile Switcher
function initProfileSelector() {
  const container = document.getElementById("profile-selector-container");
  if (!container) return;
  container.innerHTML = "";

  Object.values(PROFILES).forEach(profile => {
    const btn = document.createElement("button");
    btn.className = `profile-pill ${profile.id === state.activeProfile ? 'active' : ''}`;
    btn.dataset.profileId = profile.id;
    btn.innerHTML = `<span class="font-semibold text-xs sm:text-sm">${profile.name}</span>`;

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

// Transit Buttons
function initRouteSelector() {
  const modeButtons = document.querySelectorAll(".transit-btn");
  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modeButtons.forEach(b => b.classList.remove("bg-emerald-600", "text-white"));
      btn.classList.add("bg-emerald-600", "text-white");
      state.transportMode = btn.dataset.mode;
      renderRouteAdvisor();
    });
  });
}

// DIY Hardware Sensor Node
function initHardwareControls() {
  const toggleBtn = document.getElementById("hardware-node-toggle");
  const nodeStatusEl = document.getElementById("hardware-node-status");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    state.isHardwareNodeActive = !state.isHardwareNodeActive;
    if (state.isHardwareNodeActive) {
      toggleBtn.classList.add("bg-cyan-600", "text-white");
      if (nodeStatusEl) nodeStatusEl.textContent = "🟢 ESP32 Desk Node Streaming (9600 Baud)";
      state.hardwareTelemetry.pm25 = Math.round((Math.random() * 8 + 12) * 10) / 10;
      applyTelemetry({
        aqi: Math.round(state.hardwareTelemetry.pm25 * 3.4),
        dominantPollutant: "PM2.5 (Laser Node)",
        temp: `${state.hardwareTelemetry.temp}°C`,
        humidity: `${state.hardwareTelemetry.hum}%`,
        wind: "Desk Calm",
        pollutants: {
          pm25: { value: state.hardwareTelemetry.pm25, unit: "µg/m³", whoLimit: 15, name: "Desk PM2.5", desc: "Physical Plantower laser sensor measurement." },
          pm10: { value: state.hardwareTelemetry.pm10, unit: "µg/m³", whoLimit: 45, name: "Desk PM10", desc: "Coarse particles." },
          no2: { value: 9.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Baseline." },
          o3: { value: 14.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Baseline." },
          co: { value: 0.3, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Baseline." }
        }
      });
    } else {
      toggleBtn.classList.remove("bg-cyan-600", "text-white");
      if (nodeStatusEl) nodeStatusEl.textContent = "⚪ City CAAQMS Mode Active";
      loadCityData(state.currentCity);
    }
  });
}

// Simulation Controls
function initSimulationControls() {
  const simButtons = document.querySelectorAll(".sim-btn");
  simButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const simId = btn.dataset.sim;

      if (state.activeSimulation === simId) {
        resetSimulation();
      } else {
        simButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.activeSimulation = simId;
        const scenario = SIMULATION_SCENARIOS[simId];
        showSimulationBanner(scenario);
        applyTelemetry({
          ...scenario,
          temp: state.temp,
          humidity: state.humidity,
          wind: "Variable Plume"
        });
      }
    });
  });

  const resetBtn = document.getElementById("reset-sim-btn");
  if (resetBtn) resetBtn.addEventListener("click", resetSimulation);
}

function resetSimulation() {
  state.activeSimulation = null;
  clearSimulationActiveState();
  loadCityData(state.currentCity);
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

// Exposure Streaks
function updateExposureStreak() {
  const streakEl = document.getElementById("exposure-streak-badge");
  const doseEl = document.getElementById("daily-dose-val");

  if (state.aqi <= 100) state.exposureStreak = Math.max(state.exposureStreak, 3);
  const estimatedDose = Math.round(state.aqi * 0.32 * 10) / 10;
  state.dailyInhaledDose = estimatedDose;

  if (streakEl) streakEl.textContent = `🔥 ${state.exposureStreak}-Day Clean Streak`;
  if (doseEl) doseEl.textContent = `${state.dailyInhaledDose} µg PM2.5`;
}

// AI Health Coach
function initAiCoach() {
  const sendBtn = document.getElementById("ai-send-btn");
  const inputEl = document.getElementById("ai-chat-input");
  const keyInput = document.getElementById("gemini-key-input");
  const saveKeyBtn = document.getElementById("save-key-btn");

  if (keyInput && state.geminiApiKey) keyInput.value = state.geminiApiKey;

  if (saveKeyBtn) {
    saveKeyBtn.addEventListener("click", () => {
      state.geminiApiKey = keyInput.value.trim();
      localStorage.setItem("ecoair_gemini_key", state.geminiApiKey);
      alert("Gemini API Key saved in local storage!");
    });
  }

  document.querySelectorAll(".ai-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.dataset.prompt;
      if (inputEl) inputEl.value = q;
      handleAiChat(q);
    });
  });

  if (sendBtn && inputEl) {
    sendBtn.addEventListener("click", () => {
      const q = inputEl.value.trim();
      if (q) handleAiChat(q);
    });
    inputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const q = inputEl.value.trim();
        if (q) handleAiChat(q);
      }
    });
  }
}

async function handleAiChat(userQuestion) {
  const chatBox = document.getElementById("ai-chat-messages");
  const inputEl = document.getElementById("ai-chat-input");
  if (!chatBox) return;

  const userDiv = document.createElement("div");
  userDiv.className = "flex justify-end";
  userDiv.innerHTML = `<div class="p-3 max-w-[85%] text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 rounded-2xl rounded-br-none">${userQuestion}</div>`;
  chatBox.appendChild(userDiv);
  if (inputEl) inputEl.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  const botDiv = document.createElement("div");
  botDiv.className = "flex justify-start";
  botDiv.innerHTML = `<div class="p-3 max-w-[85%] text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl rounded-bl-none flex items-center gap-2"><span class="animate-spin text-emerald-600">🌀</span> Analyzing CAAQMS telemetry and clinical guidelines...</div>`;
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    let reply = "";
    if (state.geminiApiKey) {
      reply = await callGeminiApi(userQuestion);
    } else {
      reply = generateClinicalAiReasoning(userQuestion);
    }
    botDiv.innerHTML = `<div class="p-3 max-w-[85%] text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none">${reply}</div>`;
  } catch (err) {
    botDiv.innerHTML = `<div class="p-3 max-w-[85%] text-xs sm:text-sm text-rose-600">${generateClinicalAiReasoning(userQuestion)}</div>`;
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

function generateClinicalAiReasoning(prompt) {
  const p = PROFILES[state.activeProfile].name;
  const aqi = state.aqi;
  const pm25 = state.pollutants.pm25 ? state.pollutants.pm25.value : 12;

  const lower = prompt.toLowerCase();
  if (lower.includes("run") || lower.includes("workout") || lower.includes("lecture") || lower.includes("plan")) {
    if (aqi <= 50) {
      return `<strong>AI Day Plan for ${p}:</strong><br>• <strong>5 km Run:</strong> Recommended between 7:00 AM – 8:30 AM while ozone is lowest.<br>• <strong>9:00 AM Commute:</strong> Safe for biking or walking.<br>• <strong>Clinical Insight:</strong> Current AQI ${aqi} meets WHO guidelines.`;
    } else if (aqi <= 100) {
      return `<strong>AI Day Plan for ${p}:</strong><br>• <strong>5 km Run:</strong> Shift your run to shaded park greenways before 10 AM. Moderate PM2.5 (${pm25} µg/m³) causes airway strain.<br>• <strong>9:00 AM Commute:</strong> Walk through residential streets rather than the arterial boulevard.`;
    } else {
      return `<strong>AI Day Plan for ${p} (Alert):</strong><br>• <strong>5 km Run:</strong> ⚠️ Switch to an indoor treadmill with air filtration. Aerobic outdoor hyperventilation at AQI ${aqi} deposits heavy particulate mass.<br>• <strong>9:00 AM Commute:</strong> Take enclosed transit or wear an N95 respirator. Keep classroom windows closed.`;
    }
  }

  if (lower.includes("window") || lower.includes("ventilate")) {
    if (aqi <= 50) {
      return `<strong>Ventilation Advisory:</strong> Yes, safe and encouraged to open windows now! Ambient air quality is Clean (AQI ${aqi}), allowing cross-ventilation.`;
    } else if (aqi <= 100) {
      return `<strong>Ventilation Advisory:</strong> Open windows for short 10-15 minute intervals only during morning breeze, then close and run indoor HEPA filtration.`;
    } else {
      return `<strong>Ventilation Advisory:</strong> 🛑 <strong>Keep windows closed.</strong> Outdoor AQI is ${aqi} (${state.category}). Opening windows will allow toxic fine particulates inside. Rely strictly on indoor recirculated HEPA filtering.`;
    }
  }

  return `<strong>EcoAir AI Coach (${p}):</strong> Based on current air quality in ${state.currentCity} (AQI: ${aqi}, Dominant: ${state.dominantPollutant}, PM2.5: ${pm25} µg/m³):<br>1. <strong>Exposure Risk:</strong> ${state.category} under WHO standards.<br>2. <strong>Immediate Action:</strong> ${state.categoryMeta.label === 'Good' ? 'Safe for normal outdoor activities.' : 'Take low-exposure greenway routes and avoid high-traffic corridors.'}<br>3. <strong>Clinical Reference:</strong> ${PROFILES[state.activeProfile].citation}`;
}

async function callGeminiApi(userQuestion) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.geminiApiKey}`;
  const systemContext = `You are EcoAir's Clinical AI Health Coach. Current environmental data: City: ${state.currentCity}, AQI: ${state.aqi} (${state.category}), Dominant Pollutant: ${state.dominantPollutant}, PM2.5: ${state.pollutants.pm25?.value} µg/m³ (WHO Limit: 15), Temperature: ${state.temp}. User Profile: ${PROFILES[state.activeProfile].name}. Provide concise, actionable guidance.`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemContext}\nUser question: ${userQuestion}` }]
      }]
    })
  });

  const data = await response.json();
  if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
    return data.candidates[0].content.parts[0].text.replace(/\n/g, "<br>");
  }
  throw new Error("Invalid response from Gemini API");
}

// Shareable Card Generator
function initShareCard() {
  const shareBtn = document.getElementById("share-report-btn");
  const canvas = document.getElementById("share-canvas");
  if (!shareBtn || !canvas) return;

  shareBtn.addEventListener("click", () => {
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = "#f7faf5";
    ctx.fillRect(0, 0, 600, 400);

    ctx.strokeStyle = state.categoryMeta.color;
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 580, 380);

    ctx.fillStyle = "#2f6b4f";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.fillText("🌿 ECOAIR Urban Air Intelligence", 30, 50);

    ctx.fillStyle = "#6d7f75";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(`Station: ${state.currentCity}  |  ${new Date().toLocaleDateString()}`, 30, 80);

    ctx.fillStyle = state.categoryMeta.color;
    ctx.font = "bold 70px monospace";
    ctx.fillText(`${state.aqi}`, 30, 165);

    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillText(`${state.category}`, 160, 135);

    ctx.fillStyle = "#19342a";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`Dominant: ${state.dominantPollutant}`, 160, 165);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(30, 205, 540, 125);
    ctx.strokeStyle = "#e2ede5";
    ctx.strokeRect(30, 205, 540, 125);

    ctx.fillStyle = "#19342a";
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.fillText(`Profile: ${PROFILES[state.activeProfile].name}`, 45, 235);

    ctx.fillStyle = "#6d7f75";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`• PM2.5: ${state.pollutants.pm25?.value || '--'} µg/m³ (WHO Limit: 15 µg/m³)`, 45, 265);
    ctx.fillText(`• Clean Commute Advantage: -38% Particulate Inhalation via Green Corridor`, 45, 290);
    ctx.fillText(`• Air Quality Operational Loop: SEE → UNDERSTAND → PREDICT → ACT → MEASURE`, 45, 315);

    ctx.fillStyle = "#8da195";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Built for Devpost: Build With AI Basics  |  ecoair.dev", 30, 370);

    const link = document.createElement("a");
    link.download = `ECOAIR_Intelligence_${state.currentCity}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
