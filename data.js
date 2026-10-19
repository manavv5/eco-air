/**
 * EcoAir Data Engine
 * Real-time API coordinates, WHO clinical benchmarks, cited medical criteria,
 * multilingual translations, and DIY hardware protocols.
 */

// City Coordinates for Live Open-Meteo Air Quality API
const CITY_COORDINATES = {
  "San Francisco": { lat: 37.7749, lon: -122.4194, country: "USA" },
  "London": { lat: 51.5074, lon: -0.1278, country: "UK" },
  "New York": { lat: 40.7128, lon: -74.0060, country: "USA" },
  "New Delhi": { lat: 28.6139, lon: 77.2090, country: "India" },
  "Tokyo": { lat: 35.6762, lon: 139.6503, country: "Japan" },
  "Paris": { lat: 48.8566, lon: 2.3522, country: "France" },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714, country: "India" },
  "Mumbai": { lat: 19.0760, lon: 72.8777, country: "India" }
};

// Standard US EPA AQI Categories (Corrected Scale)
const AQI_SCALE = [
  { min: 0, max: 50, label: "Good", color: "#10b981", class: "theme-good", textClass: "text-emerald-400", bgClass: "bg-emerald-500/20" },
  { min: 51, max: 100, label: "Moderate", color: "#f59e0b", class: "theme-moderate", textClass: "text-amber-400", bgClass: "bg-amber-500/20" },
  { min: 101, max: 150, label: "Unhealthy for Sensitive Groups", color: "#f97316", class: "theme-sensitive", textClass: "text-orange-400", bgClass: "bg-orange-500/20" },
  { min: 151, max: 200, label: "Unhealthy", color: "#ef4444", class: "theme-unhealthy", textClass: "text-red-400", bgClass: "bg-red-500/20" },
  { min: 201, max: 300, label: "Very Unhealthy", color: "#a855f7", class: "theme-very-unhealthy", textClass: "text-purple-400", bgClass: "bg-purple-500/20" },
  { min: 301, max: 500, label: "Hazardous", color: "#881337", class: "theme-hazardous", textClass: "text-rose-500", bgClass: "bg-rose-950/40" }
];

// Offline Fallback Presets
const FALLBACK_PRESETS = {
  "San Francisco": {
    country: "USA",
    aqi: 38,
    category: "Good",
    temp: "17°C",
    humidity: "68%",
    wind: "14 km/h WSW",
    dominantPollutant: "PM2.5",
    pollutants: {
      pm25: { value: 8.5, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into alveolar sacs." },
      pm10: { value: 16.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust, silica, and pollen." },
      no2: { value: 12.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted from vehicle combustion; inflames bronchial lining." },
      o3: { value: 24.5, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Photochemical oxidant formed under intense solar UV radiation." },
      co: { value: 0.3, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas that binds to hemoglobin, impeding oxygen transfer." }
    }
  },
  "New Delhi": {
    country: "India",
    aqi: 265,
    category: "Very Unhealthy",
    temp: "29°C",
    humidity: "45%",
    wind: "6 km/h Calm",
    dominantPollutant: "PM2.5",
    pollutants: {
      pm25: { value: 185.0, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into alveolar sacs." },
      pm10: { value: 290.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust, silica, and pollen." },
      no2: { value: 48.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted from vehicle combustion; inflames bronchial lining." },
      o3: { value: 42.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Photochemical oxidant formed under intense solar UV radiation." },
      co: { value: 2.8, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas that binds to hemoglobin, impeding oxygen transfer." }
    }
  }
};

// Cited Clinical Vulnerability Personas
const PROFILES = {
  asthma: {
    id: "asthma",
    name: "Asthma / Respiratory Sensitive",
    tagline: "Heightened bronchial sensitivity to micro-particulates & NO2",
    description: "Prioritizes airway protection, timely bronchodilator reminders, and strictly filtered micro-climates.",
    citation: "Source: Global Initiative for Asthma (GINA) 2023 Guidelines & WHO Global Air Quality Guidelines (2021)."
  },
  athlete: {
    id: "athlete",
    name: "Outdoor Athlete / Runner",
    tagline: "Elevated minute-ventilation & deep aerobic particulate intake",
    description: "During strenuous aerobic exercise, pulmonary ventilation can increase up to 8-10 fold, multiplying inhaled particulate mass.",
    citation: "Source: American Thoracic Society (ATS) / Carlisle & Sharp, Sports Medicine 2001 on Exercise-Induced Pulmonary Ventilation."
  },
  caregiver: {
    id: "caregiver",
    name: "Child & Senior Caregiver",
    tagline: "Vulnerable lung volumes & developing immune barriers",
    description: "Pediatric airways have narrower calibers and higher resting respiratory rates relative to body mass, increasing micro-pollutant absorption.",
    citation: "Source: US EPA Child-Specific Exposure Factors Handbook & WHO Children's Environmental Health (2020)."
  },
  commuter: {
    id: "commuter",
    name: "Daily Urban Commuter",
    tagline: "Direct exposure to roadside exhaust plumes and brake dust",
    description: "Proximity to vehicle tailpipes creates localized toxic corridors up to 40% higher in PM2.5 and ultrafine particles than surrounding greenways.",
    citation: "Source: Health Effects Institute (HEI) Special Report 17 on Traffic-Related Air Pollution (TRAP)."
  }
};

// Interactive Simulations
const SIMULATION_SCENARIOS = {
  wildfire: {
    id: "wildfire",
    name: "Wildfire Smoke Inversion",
    badge: "Extreme Event",
    desc: "Simulates an abrupt wildfire plume with severe fine particulate surge (PM2.5 spike to 215 µg/m³).",
    aqi: 278,
    category: "Very Unhealthy",
    dominantPollutant: "PM2.5",
    pollutants: {
      pm25: { value: 215.0, unit: "µg/m³", whoLimit: 15 },
      pm10: { value: 285.0, unit: "µg/m³", whoLimit: 45 },
      no2: { value: 36.0, unit: "ppb", whoLimit: 25 },
      o3: { value: 45.0, unit: "ppb", whoLimit: 50 },
      co: { value: 3.2, unit: "ppm", whoLimit: 4.0 }
    }
  },
  rushHour: {
    id: "rushHour",
    name: "Peak Traffic Inversion",
    badge: "Urban Rush",
    desc: "Simulates weekday arterial congestion trapping exhaust gases (NO2 and PM10 spike).",
    aqi: 135,
    category: "Unhealthy for Sensitive Groups",
    dominantPollutant: "NO2",
    pollutants: {
      pm25: { value: 48.0, unit: "µg/m³", whoLimit: 15 },
      pm10: { value: 78.0, unit: "µg/m³", whoLimit: 45 },
      no2: { value: 52.0, unit: "ppb", whoLimit: 25 },
      o3: { value: 38.0, unit: "ppb", whoLimit: 50 },
      co: { value: 1.8, unit: "ppm", whoLimit: 4.0 }
    }
  },
  rainScrub: {
    id: "rainScrub",
    name: "Post-Rain Oceanic Scrub",
    badge: "Clean Air Window",
    desc: "Simulates precipitation scrubbing airborne particulates, creating an optimal outdoor window.",
    aqi: 24,
    category: "Good",
    dominantPollutant: "O3",
    pollutants: {
      pm25: { value: 4.2, unit: "µg/m³", whoLimit: 15 },
      pm10: { value: 8.5, unit: "µg/m³", whoLimit: 45 },
      no2: { value: 6.0, unit: "ppb", whoLimit: 25 },
      o3: { value: 18.0, unit: "ppb", whoLimit: 50 },
      co: { value: 0.1, unit: "ppm", whoLimit: 4.0 }
    }
  }
};

// Multilingual Dictionary (English, Hindi, Gujarati)
const TRANSLATIONS = {
  en: {
    brandSubtitle: "Intelligent Clean-Air & Health Action Companion",
    liveTelemetry: "Live Satellite & Station Telemetry",
    personalProfile: "Personal Health Vulnerability Profile",
    aqiLabel: "Air Quality Index",
    dominantLabel: "Dominant",
    healthAdvisory: "Clinical & Lifestyle Health Advisory",
    windowVent: "Window Ventilation Window",
    outdoorLimit: "Outdoor Aerobic Limit",
    indicators: "Granular Atmospheric Indicators",
    whoComparison: "vs WHO 24h Clinical Safety Guidelines",
    cleanCommute: "Clean Commute & Route Exposure Advisor",
    arterialRoute: "Direct Arterial Boulevard",
    greenwayRoute: "Park & Residential Greenway",
    scenarioStudio: "Atmospheric Scenario Simulator",
    aiCoach: "AI Air Health Coach",
    aiPlaceholder: "Ask anything about your air, workout, or commute...",
    bestTimeTitle: "24-Hour Forecast & Best Time To Go Out",
    hardwareNode: "DIY Desk Sensor Node",
    streakLabel: "Low-Exposure Streak"
  },
  hi: {
    brandSubtitle: "बुद्धिमान स्वच्छ-वायु और स्वास्थ्य साथी",
    liveTelemetry: "लाइव उपग्रह और स्टेशन डेटा",
    personalProfile: "व्यक्तिगत स्वास्थ्य संवेदनशीलता प्रोफ़ाइल",
    aqiLabel: "वायु गुणवत्ता सूचकांक (AQI)",
    dominantLabel: "प्रमुख प्रदूषक",
    healthAdvisory: "चिकित्सीय और जीवनशैली स्वास्थ्य परामर्श",
    windowVent: "खिड़की वेंटिलेशन समय",
    outdoorLimit: "बाहरी व्यायाम सीमा",
    indicators: "विस्तृत वायुमंडलीय संकेतक",
    whoComparison: "WHO 24 घंटे के सुरक्षा मानकों की तुलना में",
    cleanCommute: "स्वच्छ मार्ग और प्रदूषण जोखिम सलाहकार",
    arterialRoute: "मुख्य राजमार्ग (अधिक प्रदूषण)",
    greenwayRoute: "हरित उद्यान मार्ग (सुरक्षित)",
    scenarioStudio: "वायुमंडलीय परिदृश्य सिम्युलेटर",
    aiCoach: "एआई वायु स्वास्थ्य सलाहकार",
    aiPlaceholder: "अपनी वायु गुणवत्ता, व्यायाम या यात्रा के बारे में पूछें...",
    bestTimeTitle: "24-घंटे का पूर्वानुमान और बाहर जाने का सबसे अच्छा समय",
    hardwareNode: "डीआईवाई डेस्क सेंसर नोड",
    streakLabel: "कम प्रदूषण स्ट्रीक"
  },
  gu: {
    brandSubtitle: "બુદ્ધિશાળી સ્વચ્છ-હવા અને સ્વાસ્થ્ય સાથી",
    liveTelemetry: "લાઈવ સેટેલાઇટ અને સ્ટેશન ડેટા",
    personalProfile: "વ્યક્તિગત આરોગ્ય સંવેદનશીલતા પ્રોફાઇલ",
    aqiLabel: "હવાની ગુણવત્તા સૂચકાંક (AQI)",
    dominantLabel: "મુખ્ય પ્રદૂષક",
    healthAdvisory: "તબીબી અને જીવનશૈલી આરોગ્ય સલાહ",
    windowVent: "બારી વેન્ટિલેશન સમય",
    outdoorLimit: "બહાર કસરત મર્યાદા",
    indicators: "વિગતવાર વાતાવરણીય સૂચકાંકો",
    whoComparison: "WHO ૨૪ કલાકના સુરક્ષા ધોરણોની સરખામણીમાં",
    cleanCommute: "સ્વચ્છ માર્ગ અને પ્રદૂષણ જોખમ સલાહકાર",
    arterialRoute: "મુખ્ય હાઇવે (વધુ પ્રદૂષણ)",
    greenwayRoute: "ગ્રીનવે બગીચા માર્ગ (સુરક્ષિત)",
    scenarioStudio: "વાતાવરણીય પરિસ્થિતિ સિમ્યુલેટર",
    aiCoach: "એઆઈ વાયુ સ્વાસ્થ્ય કોચ",
    aiPlaceholder: "તમારી હવા, કસરત અથવા મુસાફરી વિશે પૂછો...",
    bestTimeTitle: "૨૪-કલાકની આગાહી અને બહાર જવાનો શ્રેષ્ઠ સમય",
    hardwareNode: "DIY ડેસ્ક સેન્સર નોડ",
    streakLabel: "ઓછા પ્રદૂષણની સ્ટ્રીક"
  }
};
