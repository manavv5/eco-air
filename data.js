/**
 * EcoAir Data Engine
 * Curated environmental presets, WHO thresholds, clinical vulnerability profiles,
 * route exposure models, and atmospheric simulation scenarios.
 */

const CITY_PRESETS = {
  "San Francisco": {
    country: "USA",
    aqi: 38,
    category: "Good",
    temp: "17°C",
    humidity: "68%",
    wind: "14 km/h WSW",
    dominantPollutant: "PM2.5",
    pollutants: {
      pm25: { value: 8.5, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into lungs." },
      pm10: { value: 16.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust and pollen." },
      no2: { value: 12.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted primarily from vehicles and power stations." },
      o3: { value: 24.5, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Formed when pollutants react chemically in sunlight." },
      co: { value: 0.3, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines and heating." }
    }
  },
  "London": {
    country: "UK",
    aqi: 58,
    category: "Moderate",
    temp: "14°C",
    humidity: "75%",
    wind: "11 km/h E",
    dominantPollutant: "NO2",
    pollutants: {
      pm25: { value: 16.2, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into lungs." },
      pm10: { value: 24.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust and pollen." },
      no2: { value: 28.5, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted primarily from vehicles and power stations." },
      o3: { value: 21.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Formed when pollutants react chemically in sunlight." },
      co: { value: 0.5, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines and heating." }
    }
  },
  "New York": {
    country: "USA",
    aqi: 74,
    category: "Moderate",
    temp: "19°C",
    humidity: "60%",
    wind: "16 km/h SW",
    dominantPollutant: "PM2.5",
    pollutants: {
      pm25: { value: 22.8, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into lungs." },
      pm10: { value: 34.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust and pollen." },
      no2: { value: 24.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted primarily from vehicles and power stations." },
      o3: { value: 32.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Formed when pollutants react chemically in sunlight." },
      co: { value: 0.6, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines and heating." }
    }
  },
  "New Delhi": {
    country: "India",
    aqi: 265,
    category: "Hazardous",
    temp: "29°C",
    humidity: "45%",
    wind: "6 km/h Calm",
    dominantPollutant: "PM2.5",
    pollutants: {
      pm25: { value: 185.0, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into lungs." },
      pm10: { value: 290.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust and pollen." },
      no2: { value: 48.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted primarily from vehicles and power stations." },
      o3: { value: 42.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Formed when pollutants react chemically in sunlight." },
      co: { value: 2.8, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines and heating." }
    }
  },
  "Tokyo": {
    country: "Japan",
    aqi: 32,
    category: "Good",
    temp: "21°C",
    humidity: "55%",
    wind: "9 km/h S",
    dominantPollutant: "O3",
    pollutants: {
      pm25: { value: 7.2, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into lungs." },
      pm10: { value: 14.5, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust and pollen." },
      no2: { value: 10.5, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted primarily from vehicles and power stations." },
      o3: { value: 27.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Formed when pollutants react chemically in sunlight." },
      co: { value: 0.2, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines and heating." }
    }
  },
  "Paris": {
    country: "France",
    aqi: 64,
    category: "Moderate",
    temp: "16°C",
    humidity: "65%",
    wind: "13 km/h NW",
    dominantPollutant: "PM10",
    pollutants: {
      pm25: { value: 18.0, unit: "µg/m³", whoLimit: 15, name: "PM 2.5", desc: "Fine particulate matter capable of penetrating deep into lungs." },
      pm10: { value: 38.0, unit: "µg/m³", whoLimit: 45, name: "PM 10", desc: "Inhalable coarse particles like dust and pollen." },
      no2: { value: 22.0, unit: "ppb", whoLimit: 25, name: "Nitrogen Dioxide", desc: "Emitted primarily from vehicles and power stations." },
      o3: { value: 29.0, unit: "ppb", whoLimit: 50, name: "Ground Ozone", desc: "Formed when pollutants react chemically in sunlight." },
      co: { value: 0.4, unit: "ppm", whoLimit: 4.0, name: "Carbon Monoxide", desc: "Combustion gas from motor engines and heating." }
    }
  }
};

const PROFILES = {
  asthma: {
    id: "asthma",
    name: "Asthma / Respiratory Sensitive",
    icon: "lungs",
    tagline: "Ultra-sensitive to micro-particulates & nitrogen oxides",
    description: "Prioritizes bronchial airway protection, timely bronchodilator reminders, and strictly filtered micro-climates."
  },
  athlete: {
    id: "athlete",
    name: "Outdoor Athlete / Runner",
    icon: "activity",
    tagline: "Elevated minute-ventilation & deep aerobic intake",
    description: "Evaluates hyperventilation lung load to prescribe optimal outdoor training windows and avoid peak ozone."
  },
  caregiver: {
    id: "caregiver",
    name: "Child & Senior Caregiver",
    icon: "shield",
    tagline: "Vulnerable lung volumes & developing immune systems",
    description: "Guards delicate respiratory systems with conservative safety margins and strict indoor air guidance."
  },
  commuter: {
    id: "commuter",
    name: "Daily Urban Commuter",
    icon: "navigation",
    tagline: "High street-level exhaust & particulate exposure",
    description: "Optimizes travel corridors, recommending low-traffic greenways and transit times that cut inhaled toxins."
  }
};

const SIMULATION_SCENARIOS = {
  wildfire: {
    id: "wildfire",
    name: "Wildfire Smoke Inversion",
    badge: "Extreme Event",
    desc: "Simulates an abrupt wildfire plume with severe fine particulate surge (PM2.5 spike to 210 µg/m³).",
    aqi: 278,
    category: "Hazardous",
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
    category: "Unhealthy for Sensitive",
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
    desc: "Simulates heavy coastal rain washing away particulates, opening an ideal ventilation window.",
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
