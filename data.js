/**
 * EcoAir Data Engine v3.0 (Urban Air Intelligence & CAAQMS Integration)
 * SEE -> UNDERSTAND -> PREDICT -> ACT -> MEASURE
 */

// City Coordinates for Live Open-Meteo Air Quality API
const CITY_COORDINATES = {
  "Nagpur (CAAQMS Network)": { lat: 21.1458, lon: 79.0882, country: "India" },
  "San Francisco": { lat: 37.7749, lon: -122.4194, country: "USA" },
  "London": { lat: 51.5074, lon: -0.1278, country: "UK" },
  "New York": { lat: 40.7128, lon: -74.0060, country: "USA" },
  "New Delhi": { lat: 28.6139, lon: 77.2090, country: "India" },
  "Tokyo": { lat: 35.6762, lon: 139.6503, country: "Japan" },
  "Paris": { lat: 48.8566, lon: 2.3522, country: "France" },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714, country: "India" }
};

// Real CAAQMS Network Stations (Nagpur Network Ground Truth)
const CAAQMS_STATIONS = [
  {
    name: "Civil Lines",
    location: "RO Office Nagpur Premises",
    type: "Residential",
    lat: 21.1558,
    lon: 79.0760,
    aqi: 137,
    rspm: 156.0,
    nox: 11.0,
    so2: 5.0,
    status: "Moderate",
    dominant: "PM10 / Dust"
  },
  {
    name: "Central Junction Ring Road",
    location: "Major Arterial Highway Intersection",
    type: "Traffic Hotspot",
    lat: 21.1400,
    lon: 79.0850,
    aqi: 148,
    rspm: 168.0,
    nox: 67.0,
    so2: 12.0,
    status: "Unhealthy for Sensitive",
    dominant: "NO2 / Diesel Exhaust",
    isHotspot: true,
    hotspotReason: "Vehicular Stop-and-Go Congestion (48.2% contribution)"
  },
  {
    name: "Hingna Road MIDC",
    location: "MIDC Industrial Complex",
    type: "Industrial",
    lat: 21.1020,
    lon: 78.9850,
    aqi: 180,
    rspm: 220.0,
    nox: 44.0,
    so2: 14.0,
    status: "Unhealthy",
    dominant: "SO2 & Coarse Dust",
    isHotspot: true,
    hotspotReason: "Boiler emissions & heavy freight transport"
  },
  {
    name: "VNIT Campus",
    location: "Visvesvaraya National Institute of Tech",
    type: "Educational / Green Buffer",
    lat: 21.1250,
    lon: 79.0510,
    aqi: 93,
    rspm: 93.0,
    nox: 22.0,
    so2: 23.0,
    status: "Moderate",
    dominant: "Vegetative Buffered PM2.5"
  },
  {
    name: "Town Hall Mahal",
    location: "Old City High Density Commercial Core",
    type: "Commercial / High Density",
    lat: 21.1440,
    lon: 79.1120,
    aqi: 148,
    rspm: 172.0,
    nox: 38.0,
    so2: 54.0,
    status: "Unhealthy for Sensitive",
    dominant: "Vehicular & Commercial Combustion"
  },
  {
    name: "Laxminarayan Institute (LIT)",
    location: "Amravati Road Arterial",
    type: "Residential / Transit",
    lat: 21.1480,
    lon: 79.0430,
    aqi: 129,
    rspm: 143.0,
    nox: 25.0,
    so2: 18.0,
    status: "Moderate",
    dominant: "Highway Exhaust"
  }
];

// Standard US EPA AQI Categories (Corrected Scale)
const AQI_SCALE = [
  { min: 0, max: 50, label: "Good", color: "#10b981", class: "theme-good", textClass: "text-emerald-700 dark:text-emerald-400", bgClass: "bg-emerald-100 dark:bg-emerald-500/20" },
  { min: 51, max: 100, label: "Moderate", color: "#f59e0b", class: "theme-moderate", textClass: "text-amber-700 dark:text-amber-400", bgClass: "bg-amber-100 dark:bg-amber-500/20" },
  { min: 101, max: 150, label: "Unhealthy for Sensitive Groups", color: "#f97316", class: "theme-sensitive", textClass: "text-orange-700 dark:text-orange-400", bgClass: "bg-orange-100 dark:bg-orange-500/20" },
  { min: 151, max: 200, label: "Unhealthy", color: "#ef4444", class: "theme-unhealthy", textClass: "text-rose-700 dark:text-rose-400", bgClass: "bg-rose-100 dark:bg-red-500/20" },
  { min: 201, max: 300, label: "Very Unhealthy", color: "#a855f7", class: "theme-very-unhealthy", textClass: "text-purple-700 dark:text-purple-400", bgClass: "bg-purple-100 dark:bg-purple-500/20" },
  { min: 301, max: 500, label: "Hazardous", color: "#881337", class: "theme-hazardous", textClass: "text-rose-900 dark:text-rose-400", bgClass: "bg-rose-200 dark:bg-rose-950/40" }
];

// Explainable AI: Source Attribution Breakdown Model
const SOURCE_ATTRIBUTION = {
  overall: [
    { source: "Vehicular Traffic", percent: 48, color: "#ef4444", icon: "🚗", desc: "Idling, tailpipe emissions, diesel particulate, brake wear" },
    { source: "Construction & Road Dust", percent: 21, color: "#f59e0b", icon: "🏗️", desc: "Unpaved road dust, earth movement, silica particles" },
    { source: "Industrial & Manufacturing", percent: 17, color: "#8b5cf6", icon: "🏭", desc: "Boiler exhausts, point-source emissions, smelting" },
    { source: "Weather Inversion & Stagnation", percent: 9, color: "#06b6d4", icon: "🌫️", desc: "Low planetary boundary layer, calm winds trapping pollutants" },
    { source: "Biomass & Waste Burning", percent: 5, color: "#ec4899", icon: "🔥", desc: "Local refuse combustion and domestic solid fuel" }
  ],
  stoichiometricRatios: {
    no2_co: "0.22 (High diesel combustion signature)",
    so2_pm25: "0.14 (Moderate industrial sulfur signature)",
    pm25_pm10: "0.58 (Secondary aerosol & combustion dominance)"
  }
};

// Multi-Horizon Predictive Forecast Engine
const FORECAST_HORIZONS = [
  { horizon: "Now", aqi: 148, change: "0%", status: "High", explanation: "Peak evening commuter rush starting." },
  { horizon: "+15 Min", aqi: 155, change: "+5%", status: "Unhealthy", explanation: "Congestion intensifying at ring road bottlenecks." },
  { horizon: "+30 Min", aqi: 164, change: "+11%", status: "Unhealthy", explanation: "Wind speed dropping to 3 km/h; dispersion decelerates." },
  { horizon: "+1 Hour", aqi: 171, change: "+16%", status: "Unhealthy", explanation: "Planetary boundary layer compressing; nocturnal inversion peak." },
  { horizon: "+2 Hours", aqi: 158, change: "+7%", status: "Unhealthy", explanation: "Traffic density subsiding after evening peak." },
  { horizon: "+4 Hours", aqi: 132, change: "-11%", status: "Moderate", explanation: "Cooling ambient temperatures and midnight traffic cessation." },
  { horizon: "+6 Hours", aqi: 110, change: "-26%", status: "Moderate", explanation: "Light night breeze clearing surface layer." }
];

// Decision Engine: Action & Intervention Catalog
const INTERVENTIONS_CATALOG = [
  {
    id: "traffic-opt",
    category: "Traffic Optimization",
    title: "Adaptive Traffic Signal Synchronization",
    target: "Central Junction Ring Road",
    expectedImpact: "↓ 12-16% PM2.5 & NO2 Exposure",
    affectedPop: "18,500 residents",
    feasibility: "Immediate (Software actuation)",
    cost: "Low",
    active: true
  },
  {
    id: "freight-bypass",
    category: "Traffic Routing",
    title: "Heavy Commercial Vehicle Outer Bypass Divert",
    target: "Inner Ring Road Corridor",
    expectedImpact: "↓ 18-22% Diesel Black Carbon",
    affectedPop: "34,000 residents",
    feasibility: "Medium (Police traffic routing)",
    cost: "Low",
    active: false
  },
  {
    id: "dust-suppress",
    category: "Construction & Dust",
    title: "Atomized Water Mist Cannon Spraying",
    target: "Hingna Road & Metro Construction Corridor",
    expectedImpact: "↓ 25-30% Coarse PM10 Settling",
    affectedPop: "12,000 residents",
    feasibility: "Immediate",
    cost: "Medium",
    active: false
  },
  {
    id: "green-buffer",
    category: "Urban Planning",
    title: "Vegetative Foliage Buffer Development",
    target: "School & Hospital Perimeters (VNIT & Sadar)",
    expectedImpact: "↓ 15-20% Localized Barrier Infiltration",
    affectedPop: "8,500 students & patients",
    feasibility: "Long-term Infrastructure",
    cost: "Moderate",
    active: false
  }
];

// 9-Step Walkthrough Demonstration Story
const DEMO_TOUR_STEPS = [
  {
    step: 1,
    title: "1. SEE: Baseline Urban Air Quality",
    desc: "ECOAIR monitors baseline city air. City-wide AQI is 82 (Moderate). Normal background levels.",
    action: { aqi: 82, category: "Moderate", hotspot: false }
  },
  {
    step: 2,
    title: "2. SEE: GIS Hotspot Detected",
    desc: "Spatial clustering flags an emerging emission plume at Central Junction Ring Road.",
    action: { aqi: 124, category: "Unhealthy for Sensitive Groups", hotspot: true, hotspotName: "Central Junction" }
  },
  {
    step: 3,
    title: "3. UNDERSTAND: Inspect Hotspot Telemetry",
    desc: "Sensors detect AQI 148, PM2.5 82 µg/m³, NO2 67 µg/m³. Nitrogen dioxide spike indicates active combustion.",
    action: { aqi: 148, category: "Unhealthy for Sensitive Groups", pm25: 82, no2: 67 }
  },
  {
    step: 4,
    title: "4. UNDERSTAND: AI Source Attribution",
    desc: "The Explainable AI model attributes 48.2% to vehicular congestion and 21.0% to construction dust.",
    action: { showAttribution: true }
  },
  {
    step: 5,
    title: "5. PREDICT: Multi-Horizon Forecasting",
    desc: "Atmospheric AI forecasts pollution will climb to 171 (Unhealthy) within 60 minutes if left unmitigated.",
    action: { showForecast: true, futureAqi: 171 }
  },
  {
    step: 6,
    title: "6. ACT: Decision Engine Interventions",
    desc: "Action Center recommends adaptive traffic signal retiming and heavy commercial vehicle bypass divert.",
    action: { showInterventions: true }
  },
  {
    step: 7,
    title: "7. ACT: ECO Simulator — What-If Sandbox",
    desc: "We simulate policy levers: -20% traffic congestion, +15% green buffer filtration.",
    action: { showSimulator: true, trafficCurtailed: 20 }
  },
  {
    step: 8,
    title: "8. MEASURE: Counterfactual Outcome",
    desc: "Without intervention: AQI reaches 171. With ECOAIR intervention: AQI drops to 143 (↓ 28 AQI points).",
    action: { beforeAqi: 171, afterAqi: 143 }
  },
  {
    step: 9,
    title: "9. MEASURE: Quantified Environmental Impact",
    desc: "Impact measured: 16% PM2.5 exposure reduction, ~18,500 population protected, 184 kg/day toxic mass avoided.",
    action: { showImpact: true }
  }
];

// Health Vulnerability Personas
const PROFILES = {
  asthma: {
    id: "asthma",
    name: "Asthma / Respiratory Sensitive",
    tagline: "Heightened bronchial sensitivity to micro-particulates & NO2",
    description: "Prioritizes airway protection, timely bronchodilator reminders, and strictly filtered micro-climates.",
    citation: "Source: Global Initiative for Asthma (GINA 2023) & WHO Air Quality Guidelines (2021)."
  },
  athlete: {
    id: "athlete",
    name: "Outdoor Athlete / Runner",
    tagline: "Elevated minute-ventilation & deep aerobic particulate intake",
    description: "During strenuous aerobic exercise, pulmonary ventilation can increase up to 8-10 fold, multiplying inhaled particulate mass.",
    citation: "Source: American Thoracic Society (ATS) / Carlisle & Sharp, Sports Medicine 2001."
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

// Simulation Scenarios
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

// Multilingual Dictionary
const TRANSLATIONS = {
  en: {
    brandSubtitle: "AI Urban Air Intelligence Platform • SEE → UNDERSTAND → PREDICT → ACT → MEASURE",
    liveTelemetry: "Live Satellite, Station & CAAQMS Telemetry",
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
    brandSubtitle: "एआई शहरी वायु गुणवत्ता इंटेलिजेंस प्लेटफॉर्म • SEE → UNDERSTAND → PREDICT → ACT → MEASURE",
    liveTelemetry: "लाइव उपग्रह, स्टेशन और CAAQMS डेटा",
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
    brandSubtitle: "એઆઈ શહેરી વાયુ ગુણવત્તા ઇન્ટેલિજન્સ પ્લેટફોર્મ • SEE → UNDERSTAND → PREDICT → ACT → MEASURE",
    liveTelemetry: "લાઈવ સેટેલાઇટ, સ્ટેશન અને CAAQMS ડેટા",
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
