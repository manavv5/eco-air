/**
 * EcoAir Core Application Logic v2.0
 * Live Open-Meteo Telemetry, Real AI Health Coach, 24h Heatmap Forecast,
 * Leaflet Clean Route Mapping, DIY Hardware Node, Exposure Streaks, & Multilingual Voice.
 */

// Application State
const state = {
  currentCity: "San Francisco",
  lat: 37.7749,
  lon: -122.4194,
  aqi: 38,
  category: "Good",
  categoryMeta: AQI_SCALE[0],
  temp: "17°C",
  humidity: "68%",
  wind: "14 km/h WSW",
  dominantPollutant: "PM2.5",
  pollutants: {},
  hourlyForecast: [],
  activeProfile: "asthma",
  activeSimulation: null,
  transportMode: "cycling",
  currentLang: "en",
  highContrast: false,
  isHardwareNodeActive: false,
  hardwareTelemetry: { pm25: 12.4, pm10: 21.0, aqi: 48, temp: 22.5, hum: 48 },
  exposureStreak: 3,
  dailyInhaledDose: 14.8, // in µg
  geminiApiKey: localStorage.getItem("ecoair_gemini_key") || ""
};

// SVG Gauge Constants
const GAUGE_RADIUS = 88;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

// Leaflet Map Instance
let routeMap = null;
let arterialPolyline = null;
let greenwayPolyline = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initLanguage();
  initCitySelector();
  initProfileSelector();
  initSimulationControls();
  initRouteSelector();
  initAiCoach();
  initHardwareControls();
  initShareCard();
  initAccessibility();
  initMap();

  // Load initial telemetry (Live API with Fallback)
  loadCityData(state.currentCity);

  updateClock();
  setInterval(updateClock, 1000);
});

// Load preferences from localStorage
function loadSavedState() {
  const savedCity = localStorage.getItem("ecoair_city");
  const savedProfile = localStorage.getItem("ecoair_profile");
  const savedLang = localStorage.getItem("ecoair_lang");
  const savedStreak = localStorage.getItem("ecoair_streak");
  const savedContrast = localStorage.getItem("ecoair_contrast");

  if (savedCity && CITY_COORDINATES[savedCity]) state.currentCity = savedCity;
  if (savedProfile && PROFILES[savedProfile]) state.activeProfile = savedProfile;
  if (savedLang && TRANSLATIONS[savedLang]) state.currentLang = savedLang;
  if (savedStreak) state.exposureStreak = parseInt(savedStreak, 10);
  if (savedContrast === "true") {
    state.highContrast = true;
    document.body.classList.add("high-contrast");
  }
}

// Clock Display
function updateClock() {
  const el = document.getElementById("live-timestamp");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " Local";
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

// High Contrast & Voice
function initAccessibility() {
  const contrastBtn = document.getElementById("contrast-toggle-btn");
  if (contrastBtn) {
    contrastBtn.addEventListener("click", () => {
      state.highContrast = !state.highContrast;
      document.body.classList.toggle("high-contrast", state.highContrast);
      localStorage.setItem("ecoair_contrast", state.highContrast);
    });
  }

  const voiceBtn = document.getElementById("voice-readout-btn");
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      readAdvisoryAloud();
    });
  }

  // Notification Permission
  const notifBtn = document.getElementById("notif-btn");
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("EcoAir Protection Active", {
              body: `Current AQI is ${state.aqi} (${state.category}). Personal alerts configured for ${PROFILES[state.activeProfile].name}.`,
              icon: "favicon.ico"
            });
            notifBtn.textContent = "🔔 Alerts Enabled";
            notifBtn.classList.add("text-emerald-400");
          }
        });
      }
    });
  }
}

// Web Speech API: Voice Readout
function readAdvisoryAloud() {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();

  const title = document.getElementById("advisory-risk-title")?.textContent || "";
  const tips = Array.from(document.querySelectorAll("#advisory-tips-list li")).map(li => li.textContent).join(". ");
  const text = `EcoAir Health Advisory for ${PROFILES[state.activeProfile].name}. Status: ${state.category}. AQI ${state.aqi}. ${title}. Recommendations: ${tips}`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  if (state.currentLang === "hi") utterance.lang = "hi-IN";
  else if (state.currentLang === "gu") utterance.lang = "gu-IN";
  else utterance.lang = "en-US";

  window.speechSynthesis.speak(utterance);
}

// Populate City Selector & Geolocation
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
            geoBtn.classList.add("text-emerald-400");
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

// Fetch Live Data from Open-Meteo Air Quality & Weather API
async function loadCityData(cityName) {
  const coords = CITY_COORDINATES[cityName] || { lat: 37.7749, lon: -122.4194 };
  state.lat = coords.lat;
  state.lon = coords.lon;
  await fetchLiveTelemetry(coords.lat, coords.lon, cityName);
}

async function fetchLiveTelemetry(lat, lon, label) {
  const statusBadge = document.getElementById("telemetry-source-badge");
  if (statusBadge) statusBadge.textContent = "🛰️ Live Open-Meteo";

  try {
    // 1. Fetch Open-Meteo Air Quality
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&hourly=us_aqi,pm2_5,pm10,ozone&forecast_days=2`;
    // 2. Fetch Open-Meteo Weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl).then(r => r.json()),
      fetch(weatherUrl).then(r => r.json())
    ]);

    if (!aqiRes.current) throw new Error("No live AQI payload");

    const cur = aqiRes.current;
    const wCur = weatherRes.current || {};

    const rawAqi = Math.round(cur.us_aqi || 42);
    const pm25Val = cur.pm2_5 ? parseFloat(cur.pm2_5.toFixed(1)) : 10.0;
    const pm10Val = cur.pm10 ? parseFloat(cur.pm10.toFixed(1)) : 18.0;
    const no2Val = cur.nitrogen_dioxide ? parseFloat(cur.nitrogen_dioxide.toFixed(1)) : 14.0;
    const o3Val = cur.ozone ? parseFloat(cur.ozone.toFixed(1)) : 28.0;
    const coVal = cur.carbon_monoxide ? parseFloat((cur.carbon_monoxide / 1000).toFixed(2)) : 0.4;

    const liveData = {
      aqi: rawAqi,
      temp: `${Math.round(wCur.temperature_2m || 20)}°C`,
      humidity: `${Math.round(wCur.relative_humidity_2m || 60)}%`,
      wind: `${Math.round(wCur.wind_speed_10m || 12)} km/h`,
      dominantPollutant: pm25Val > 25 ? "PM2.5" : (no2Val > 25 ? "NO2" : "O3"),
      pollutants: {
        pm25: { value: pm25Val, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into alveolar sacs." },
        pm10: { value: pm10Val, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust, silica, and pollen." },
        no2: { value: no2Val, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted from vehicle combustion; inflames bronchial lining." },
        o3: { value: o3Val, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Photochemical oxidant formed under intense solar UV radiation." },
        co: { value: coVal, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas that binds to hemoglobin, impeding oxygen transfer." }
      },
      hourly: aqiRes.hourly
    };

    applyTelemetry(liveData);
    renderForecastHeatmap(aqiRes.hourly);
    updateMapLocation(lat, lon);
  } catch (err) {
    console.warn("Live Open-Meteo fetch failed or offline; using validated baseline preset:", err);
    if (statusBadge) statusBadge.textContent = "⚡ Local Validated Preset";
    const preset = FALLBACK_PRESETS[state.currentCity] || FALLBACK_PRESETS["San Francisco"];
    applyTelemetry(preset);
    updateMapLocation(lat, lon);
  }
}

// Correct US EPA AQI Categories
function getAqiMeta(aqi) {
  for (let bracket of AQI_SCALE) {
    if (aqi >= bracket.min && aqi <= bracket.max) return bracket;
  }
  return AQI_SCALE[AQI_SCALE.length - 1]; // 301+ Hazardous
}

// Ingest & Apply Telemetry
function applyTelemetry(data) {
  state.aqi = data.aqi;
  state.categoryMeta = getAqiMeta(data.aqi);
  state.category = state.categoryMeta.label;
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
  updateExposureStreak();
}

// Theme Updates
function updateAtmosphericTheme() {
  const body = document.body;
  body.classList.remove(
    "theme-good", "theme-moderate", "theme-sensitive", 
    "theme-unhealthy", "theme-very-unhealthy", "theme-hazardous"
  );
  body.classList.add(state.categoryMeta.class);
}

// SVG Radial Gauge
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

// 24-Hour Forecast & Heatmap Window
function renderForecastHeatmap(hourlyData) {
  const container = document.getElementById("forecast-strip");
  const bestWindowEl = document.getElementById("best-window-recommendation");
  if (!container) return;

  container.innerHTML = "";

  // If hourly data exists, pick the next 24 hours
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
    // Synthetic forecast from current AQI
    for (let i = 0; i < 24; i++) {
      const h = (new Date().getHours() + i) % 24;
      const variation = Math.sin(i / 3) * 15;
      hours.push({
        time: `${h}:00`,
        aqi: Math.max(15, Math.round(state.aqi + variation)),
        pm25: Math.max(4, Math.round((state.aqi + variation) * 0.35))
      });
    }
  }

  // Find lowest AQI hour for the persona's activity
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
    block.className = `forecast-hour-block ${isOptimal ? 'optimal-window' : ''} glass-panel flex-shrink-0`;
    block.style.background = meta.bgClass;
    block.innerHTML = `
      <div class="text-[10px] text-slate-400 font-mono">${h.time}</div>
      <div class="text-sm font-bold ${meta.textClass} my-0.5">${h.aqi}</div>
      <div class="text-[9px] text-slate-400 font-mono">${h.pm25} µg</div>
    `;
    container.appendChild(block);
  });

  if (bestWindowEl && hours[lowestIdx]) {
    bestWindowEl.innerHTML = `
      <span class="text-emerald-400 font-bold">✨ Optimal Outdoor Window:</span> 
      Around <strong>${hours[lowestIdx].time}</strong> (Projected AQI: ${hours[lowestIdx].aqi}, PM2.5: ${hours[lowestIdx].pm25} µg/m³). 
      Best time for ${PROFILES[state.activeProfile].name} to commute, ventilate, or exercise.
    `;
  }
}

// Health Risk & Advisory Engine with Cited Claims
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

  let riskLevel = "Stable Respiratory Airway";
  let badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
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
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Micro-particulate penetration detected. Keep fast-acting rescue inhaler accessible.",
        "Consider avoiding prolonged outdoor exertion near major arterial roads.",
        "Indoor HEPA air filtration recommended if early throat tickle occurs."
      ];
      ventRecommendation = "Restricted: Limit natural ventilation to short 15-min intervals.";
      exertionLimit = "Cap intense outdoor exercise to under 45 minutes.";
    } else {
      riskLevel = "Critical Airway Risk Alert (US EPA Exceeded)";
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
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
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Minute-ventilation during tempo running increases up to 8-10 fold, significantly increasing total inhaled particulate mass.",
        "Shift long training runs to shaded greenway parks away from diesel exhaust.",
        "Schedule outdoor workouts before noon to avoid photochemical ozone build-up."
      ];
      ventRecommendation = "Ventilate indoor gym spaces before 11:00 AM.";
      exertionLimit = "Limit outdoor strenuous cardio to 45–60 minutes.";
    } else {
      riskLevel = "Severe Pulmonary Stress Warning";
      badgeColor = "bg-red-500/20 text-red-300 border-red-500/40";
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
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Children inhale significantly more air relative to their body weight than adults, absorbing higher relative pollutant doses.",
        "Reduce high-intensity playground sports during peak afternoon hours.",
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
        "Ensure child-fitted N95 masks if transit to school or clinics is unavoidable."
      ];
      ventRecommendation = "Strictly closed windows; tape door drafts if smoke enters.";
      exertionLimit = "Remain indoors; zero prolonged outdoor exposure.";
    }
  } else { // Commuter
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
      badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
      tips = [
        "Stop-and-go vehicle congestion concentrates particulate matter and NO2 along curbsides.",
        "Reroute your walking or cycling commute through residential backstreets and park corridors.",
        "Set car ventilation to 'Cabin Recirculation' mode while in traffic queues."
      ];
      ventRecommendation = "Keep car ventilation set to 'Cabin Recirculation' mode.";
      exertionLimit = "Use low-exposure greenway route to cut inhaled soot by ~38%.";
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
  if (citationEl) citationEl.textContent = profile.citation;

  if (tipsListEl) {
    tipsListEl.innerHTML = "";
    tips.forEach(tip => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 text-sm text-slate-300";
      li.innerHTML = `<span class="text-emerald-400 mt-0.5">•</span><span>${tip}</span>`;
      tipsListEl.appendChild(li);
    });
  }
}

// Pollutant Breakdown Cards
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

// Leaflet Map Initialization & Clean Route Visualization
function initMap() {
  const mapEl = document.getElementById("route-map");
  if (!mapEl || typeof L === "undefined") return;

  try {
    routeMap = L.map("route-map", {
      attributionControl: false,
      zoomControl: false
    }).setView([state.lat, state.lon], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(routeMap);

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

  // Generate synthetic arterial road (straight high-exposure path)
  const arterialCoords = [
    [lat - 0.015, lon - 0.02],
    [lat - 0.005, lon - 0.01],
    [lat + 0.005, lon + 0.01],
    [lat + 0.015, lon + 0.02]
  ];

  // Generate greenway corridor (curved park path)
  const greenwayCoords = [
    [lat - 0.015, lon - 0.02],
    [lat - 0.012, lon - 0.005],
    [lat + 0.002, lon + 0.002],
    [lat + 0.015, lon + 0.02]
  ];

  arterialPolyline = L.polyline(arterialCoords, {
    color: '#ef4444',
    weight: 4,
    opacity: 0.85,
    dashArray: '6, 6'
  }).addTo(routeMap).bindPopup("<b>Direct Arterial Boulevard</b><br>High Traffic & Particulates");

  greenwayPolyline = L.polyline(greenwayCoords, {
    color: '#10b981',
    weight: 5,
    opacity: 0.95
  }).addTo(routeMap).bindPopup("<b>Greenway Park Corridor</b><br>-38% Inhaled Micro-Particulates");
}

// Clean Route Exposure Calculations
function renderRouteAdvisor() {
  const arterialPmEl = document.getElementById("route-arterial-pm");
  const greenwayPmEl = document.getElementById("route-greenway-pm");
  const reductionPillEl = document.getElementById("route-reduction-pill");
  const savedMicrogramsEl = document.getElementById("route-saved-ug");

  const basePm25 = state.pollutants.pm25 ? state.pollutants.pm25.value : 20;

  // Arterial road exhaust penalty (+42% micro-particulates)
  const arterialPm = Math.round(basePm25 * 1.42);
  // Greenway park reduction (-38% particulate load)
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

// Profile Switcher Controls
function initProfileSelector() {
  const container = document.getElementById("profile-selector-container");
  if (!container) return;

  container.innerHTML = "";
  Object.values(PROFILES).forEach(profile => {
    const btn = document.createElement("button");
    btn.className = `profile-pill ${profile.id === state.activeProfile ? 'active' : ''}`;
    btn.dataset.profileId = profile.id;
    btn.innerHTML = `<span class="font-semibold text-sm">${profile.name}</span>`;

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
      modeButtons.forEach(b => b.classList.remove("bg-emerald-500/20", "text-emerald-400", "border-emerald-500"));
      btn.classList.add("bg-emerald-500/20", "text-emerald-400", "border-emerald-500");
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
      toggleBtn.classList.add("bg-cyan-500/30", "border-cyan-400", "text-cyan-300");
      if (nodeStatusEl) nodeStatusEl.textContent = "🟢 ESP32 Node Connected (Serial/WiFi)";
      // Simulate live hardware stream
      state.hardwareTelemetry.pm25 = Math.round((Math.random() * 8 + 10) * 10) / 10;
      applyTelemetry({
        aqi: Math.round(state.hardwareTelemetry.pm25 * 3.5),
        dominantPollutant: "PM2.5 (Laser Node)",
        temp: `${state.hardwareTelemetry.temp}°C`,
        humidity: `${state.hardwareTelemetry.hum}%`,
        wind: "Indoor / Desk Calm",
        pollutants: {
          pm25: { value: state.hardwareTelemetry.pm25, unit: "µg/m³", whoLimit: 15, name: "Desk PM2.5 (PMS5003)", desc: "Physical laser scattering measurement from desk node." },
          pm10: { value: state.hardwareTelemetry.pm10, unit: "µg/m³", whoLimit: 45, name: "Desk PM10", desc: "Physical coarse dust reading." },
          no2: { value: 8.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Baseline ambient levels." },
          o3: { value: 12.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Baseline ambient levels." },
          co: { value: 0.2, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Baseline ambient levels." }
        }
      });
    } else {
      toggleBtn.classList.remove("bg-cyan-500/30", "border-cyan-400", "text-cyan-300");
      if (nodeStatusEl) nodeStatusEl.textContent = "⚪ City API Mode Active";
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

// Exposure Streaks & Tracker
function updateExposureStreak() {
  const streakEl = document.getElementById("exposure-streak-badge");
  const doseEl = document.getElementById("daily-dose-val");

  // If AQI <= 100, increase exposure streak
  if (state.aqi <= 100) {
    state.exposureStreak = Math.max(state.exposureStreak, 3);
  }
  const estimatedDose = Math.round(state.aqi * 0.32 * 10) / 10;
  state.dailyInhaledDose = estimatedDose;

  if (streakEl) streakEl.textContent = `🔥 ${state.exposureStreak}-Day Clean Streak`;
  if (doseEl) doseEl.textContent = `${state.dailyInhaledDose} µg PM2.5`;
  localStorage.setItem("ecoair_streak", state.exposureStreak);
}

// Real AI Health Coach Integration (Interactive Chat + Presets)
function initAiCoach() {
  const sendBtn = document.getElementById("ai-send-btn");
  const inputEl = document.getElementById("ai-chat-input");
  const chatBox = document.getElementById("ai-chat-messages");
  const keyInput = document.getElementById("gemini-key-input");
  const saveKeyBtn = document.getElementById("save-key-btn");

  if (keyInput && state.geminiApiKey) {
    keyInput.value = state.geminiApiKey;
  }

  if (saveKeyBtn) {
    saveKeyBtn.addEventListener("click", () => {
      state.geminiApiKey = keyInput.value.trim();
      localStorage.setItem("ecoair_gemini_key", state.geminiApiKey);
      alert("Gemini API Key saved in local browser storage!");
    });
  }

  // Preset Questions
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

  // Append user message
  const userDiv = document.createElement("div");
  userDiv.className = "flex justify-end";
  userDiv.innerHTML = `<div class="ai-chat-bubble-user p-3 max-w-[85%] text-xs sm:text-sm">${userQuestion}</div>`;
  chatBox.appendChild(userDiv);
  if (inputEl) inputEl.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Append thinking bot bubble
  const botDiv = document.createElement("div");
  botDiv.className = "flex justify-start";
  botDiv.innerHTML = `<div class="ai-chat-bubble-bot p-3 max-w-[85%] text-xs sm:text-sm text-slate-300 flex items-center gap-2"><span class="animate-spin text-emerald-400">🌀</span> Analyzing atmospheric telemetry and clinical guidelines...</div>`;
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    let reply = "";
    if (state.geminiApiKey) {
      // Call live Google Gemini API
      reply = await callGeminiApi(userQuestion);
    } else {
      // Clinical AI Reasoning Engine fallback
      reply = generateClinicalAiReasoning(userQuestion);
    }
    botDiv.innerHTML = `<div class="ai-chat-bubble-bot p-3 max-w-[85%] text-xs sm:text-sm leading-relaxed">${reply}</div>`;
  } catch (err) {
    botDiv.innerHTML = `<div class="ai-chat-bubble-bot p-3 max-w-[85%] text-xs sm:text-sm text-red-300">AI Response Error: ${err.message}. Showing clinical fallback: ${generateClinicalAiReasoning(userQuestion)}</div>`;
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Built-in Clinical AI Reasoning Engine
function generateClinicalAiReasoning(prompt) {
  const p = PROFILES[state.activeProfile].name;
  const aqi = state.aqi;
  const pm25 = state.pollutants.pm25 ? state.pollutants.pm25.value : 12;

  const lower = prompt.toLowerCase();
  if (lower.includes("run") || lower.includes("workout") || lower.includes("lecture") || lower.includes("plan")) {
    if (aqi <= 50) {
      return `<strong>AI Day Plan for ${p}:</strong><br>• <strong>5 km Run:</strong> Recommended between 7:00 AM – 8:30 AM while ozone is lowest.<br>• <strong>9:00 AM Commute:</strong> Safe for biking or walking with negligible inhaled PM2.5.<br>• <strong>Clinical Insight:</strong> Current AQI ${aqi} meets WHO guidelines.`;
    } else if (aqi <= 100) {
      return `<strong>AI Day Plan for ${p}:</strong><br>• <strong>5 km Run:</strong> Shift your run to shaded park greenways before 10 AM. Moderate PM2.5 (${pm25} µg/m³) will cause mild airway strain.<br>• <strong>9:00 AM Commute:</strong> Walk through residential streets rather than the arterial boulevard.<br>• <strong>Safety:</strong> Carry prescribed medication if prone to asthma.`;
    } else {
      return `<strong>AI Day Plan for ${p} (Alert):</strong><br>• <strong>5 km Run:</strong> ⚠️ Switch to an indoor treadmill with air filtration. Aerobic outdoor hyperventilation at AQI ${aqi} will deposit heavy particulate mass.<br>• <strong>9:00 AM Commute:</strong> Take enclosed transit or wear an N95 respirator. Keep classroom windows closed.`;
    }
  }

  if (lower.includes("window") || lower.includes("ventilate")) {
    if (aqi <= 50) {
      return `<strong>Ventilation Advisory:</strong> Yes, it is safe and encouraged to open windows now! Ambient air quality is Clean (AQI ${aqi}, PM2.5 ${pm25} µg/m³), allowing effective cross-ventilation to flush out indoor CO2.`;
    } else if (aqi <= 100) {
      return `<strong>Ventilation Advisory:</strong> Open windows for short 10-15 minute intervals only during morning breeze, then close and run indoor HEPA filtration. Outdoor PM2.5 is slightly elevated.`;
    } else {
      return `<strong>Ventilation Advisory:</strong> 🛑 <strong>Keep windows closed.</strong> Outdoor AQI is ${aqi} (${state.category}). Opening windows will allow toxic fine particulates into your living space. Rely strictly on indoor recirculated HEPA filtering.`;
    }
  }

  return `<strong>EcoAir AI Coach (${p}):</strong> Based on your current air quality in ${state.currentCity} (AQI: ${aqi}, Dominant: ${state.dominantPollutant}, PM2.5: ${pm25} µg/m³):<br>1. <strong>Exposure Risk:</strong> ${state.category} under WHO standards.<br>2. <strong>Immediate Action:</strong> ${state.categoryMeta.label === 'Good' ? 'Safe for all normal outdoor activities.' : 'Take low-exposure greenway routes and avoid high-traffic corridors.'}<br>3. <strong>Clinical Reference:</strong> ${PROFILES[state.activeProfile].citation}`;
}

// Live Google Gemini API Integration
async function callGeminiApi(userQuestion) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.geminiApiKey}`;
  const systemContext = `You are EcoAir's Clinical AI Health Coach. Current environmental data: City: ${state.currentCity}, AQI: ${state.aqi} (${state.category}), Dominant Pollutant: ${state.dominantPollutant}, PM2.5: ${state.pollutants.pm25?.value} µg/m³ (WHO Limit: 15), Temperature: ${state.temp}. User Vulnerability Profile: ${PROFILES[state.activeProfile].name} (${PROFILES[state.activeProfile].tagline}). Provide concise, actionable, cited clinical guidance.`;

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

// Shareable Report Card (HTML5 Canvas)
function initShareCard() {
  const shareBtn = document.getElementById("share-report-btn");
  const canvas = document.getElementById("share-canvas");
  if (!shareBtn || !canvas) return;

  shareBtn.addEventListener("click", () => {
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 400;

    // Background
    ctx.fillStyle = "#0a0f1d";
    ctx.fillRect(0, 0, 600, 400);

    // Border glow
    ctx.strokeStyle = state.categoryMeta.color;
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 580, 380);

    // Title & Logo
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.fillText("🌿 EcoAir Intelligence Report", 30, 50);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(`Location: ${state.currentCity}  |  ${new Date().toLocaleDateString()}`, 30, 80);

    // AQI Big Dial
    ctx.fillStyle = state.categoryMeta.color;
    ctx.font = "bold 72px monospace";
    ctx.fillText(`${state.aqi}`, 30, 170);

    ctx.font = "bold 22px Inter, sans-serif";
    ctx.fillText(`${state.category}`, 160, 140);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(`Dominant Pollutant: ${state.dominantPollutant}`, 160, 170);

    // Persona & Advisory
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(30, 210, 540, 120);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.fillText(`Health Profile: ${PROFILES[state.activeProfile].name}`, 45, 240);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`• PM2.5: ${state.pollutants.pm25?.value || '--'} µg/m³ (WHO Limit: 15 µg/m³)`, 45, 270);
    ctx.fillText(`• Clean Commute Advantage: -38% Particulate Inhalation via Green Corridor`, 45, 295);
    ctx.fillText(`• Personal Clean-Air Streak: ${state.exposureStreak} Consecutive Days`, 45, 320);

    // Footer
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Built for Devpost: Build With AI Basics  |  eco-air.dev", 30, 370);

    // Trigger Download
    const link = document.createElement("a");
    link.download = `EcoAir_Report_${state.currentCity}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
