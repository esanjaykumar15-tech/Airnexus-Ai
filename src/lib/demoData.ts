// ============================================================
// AIRNEXUS AI — Demo Data Engine
//
// Generates realistic, internally-correlated Delhi-NCR pollution data
// with NO external API calls and NO database required. Everything is
// deterministic: the same (location, timestamp) always produces the
// same reading, computed from a seeded PRNG — so the "dataset" behaves
// like a real historical record without needing persistent storage.
//
// Swap-out point for LIVE MODE: replace the functions in this file
// with real calls to your DB / air-quality API / weather API, keeping
// the same return shapes so nothing downstream has to change.
// ============================================================

import { Location, StationReading, AqiCategory } from "./types";

export const DATA_MODE: "demo" | "live" = process.env.AIR_QUALITY_API_KEY ? "live" : "demo";

// ---------------------------------------------------------------
// Seeded PRNG (mulberry32) — deterministic per (locationId, hourBucket)
// ---------------------------------------------------------------
function hashString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(locationId: string, timestamp: Date): () => number {
  const bucket = Math.floor(timestamp.getTime() / (60 * 60 * 1000)); // hourly bucket
  return mulberry32(hashString(`${locationId}:${bucket}`));
}

// ---------------------------------------------------------------
// Locations — Delhi-NCR districts (approximate public coordinates)
// ---------------------------------------------------------------
export const LOCATIONS: Location[] = [
  { id: "central-delhi", name: "Central Delhi", district: "Delhi", lat: 28.6519, lng: 77.2315, populationDensity: 27730 },
  { id: "anand-vihar", name: "Anand Vihar", district: "Delhi", lat: 28.6469, lng: 77.3157, populationDensity: 21500 },
  { id: "rohini", name: "Rohini", district: "Delhi", lat: 28.7392, lng: 77.0722, populationDensity: 18900 },
  { id: "dwarka", name: "Dwarka", district: "Delhi", lat: 28.5921, lng: 77.0460, populationDensity: 15200 },
  { id: "punjabi-bagh", name: "Punjabi Bagh", district: "Delhi", lat: 28.6740, lng: 77.1310, populationDensity: 19800 },
  { id: "ito", name: "ITO", district: "Delhi", lat: 28.6289, lng: 77.2410, populationDensity: 24100 },
  { id: "noida", name: "Noida", district: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, populationDensity: 9600 },
  { id: "greater-noida", name: "Greater Noida", district: "Uttar Pradesh", lat: 28.4744, lng: 77.5040, populationDensity: 5400 },
  { id: "ghaziabad", name: "Ghaziabad", district: "Uttar Pradesh", lat: 28.6692, lng: 77.4538, populationDensity: 13600 },
  { id: "gurugram", name: "Gurugram", district: "Haryana", lat: 28.4595, lng: 77.0266, populationDensity: 8200 },
  { id: "faridabad", name: "Faridabad", district: "Haryana", lat: 28.4089, lng: 77.3178, populationDensity: 11300 },
  { id: "sonipat", name: "Sonipat", district: "Haryana", lat: 28.9931, lng: 77.0151, populationDensity: 4100 },
  { id: "bahadurgarh", name: "Bahadurgarh", district: "Haryana", lat: 28.6939, lng: 76.9349, populationDensity: 6700 },
];

export function getLocation(id: string): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

// ---------------------------------------------------------------
// AQI category + color (Indian CPCB-style breakpoints, simplified)
// ---------------------------------------------------------------
export function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export function aqiColor(aqi: number): string {
  const cat = aqiCategory(aqi);
  const map: Record<AqiCategory, string> = {
    Good: "#22c55e",
    Satisfactory: "#84cc16",
    Moderate: "#eab308",
    Poor: "#f97316",
    "Very Poor": "#ef4444",
    Severe: "#b91c1c",
  };
  return map[cat];
}

// Simplified PM2.5 -> AQI conversion (Indian sub-index style, linear interpolation)
function pm25ToAqi(pm25: number): number {
  const bp = [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [251, 500, 401, 500],
  ];
  for (const [cLo, cHi, aLo, aHi] of bp) {
    if (pm25 >= cLo && pm25 <= cHi) {
      return Math.round(aLo + ((aHi - aLo) / (cHi - cLo)) * (pm25 - cLo));
    }
  }
  return pm25 > 500 ? 500 : 0;
}

/**
 * Generates one deterministic, internally-correlated reading for a
 * location at a given hour. This is the single source of truth that
 * every API route derives its numbers from — nothing downstream
 * hard-codes a pollution value.
 */
export function generateReading(location: Location, timestamp: Date): StationReading {
  const rng = rngFor(location.id, timestamp);
  const hour = timestamp.getHours();
  const month = timestamp.getMonth(); // 0=Jan

  // --- Seasonal baseline: Oct-Jan (stubble burning + winter inversion) is worse ---
  const seasonalFactor = [1.35, 1.2, 0.85, 0.6, 0.55, 0.6, 0.5, 0.5, 0.6, 1.3, 1.6, 1.5][month];

  // --- Diurnal traffic pattern: rush hours 8-10 & 18-21 ---
  const rushHour = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21);
  const nightLull = hour >= 1 && hour <= 4;
  const trafficIndex = Math.min(
    100,
    Math.max(5, (rushHour ? 78 : nightLull ? 18 : 45) + (rng() - 0.5) * 20)
  );

  // --- Weather: monthly average temperature + diurnal swing (peak ~2-3pm, low ~4-5am) ---
  const monthlyAvgTemp = [14, 17, 23, 29, 33, 34, 31, 30, 29, 26, 20, 15][month];
  const diurnalSwing = 7 * Math.cos(((hour - 15) / 24) * Math.PI * 2);
  const temperature = Math.round((monthlyAvgTemp + diurnalSwing + (rng() - 0.5) * 3) * 10) / 10;
  const humidity = Math.min(95, Math.max(15, 60 - (temperature - 25) * 1.3 + (rng() - 0.5) * 15));

  // Low wind at night/early morning -> pollution accumulates (classic Delhi winter pattern)
  const windSpeed = Math.max(1, (nightLull || hour < 7 ? 3.5 : 9) * seasonalFactor * 0.7 + (rng() - 0.5) * 4);
  const windDirection = Math.round((300 + (rng() - 0.5) * 90 + month * 5) % 360); // roughly NW in winter

  // Occasional rain event reduces pollution sharply
  const rainRoll = rng();
  const rainfall = rainRoll > 0.93 ? Math.round(rng() * 12 * 10) / 10 : 0;

  // Fire activity: high Oct-Nov (crop burning season) with day-to-day noise
  const fireSeasonFactor = month === 9 || month === 10 ? 1 : month === 0 || month === 8 ? 0.4 : 0.1;
  const fireCount = Math.round(Math.max(0, fireSeasonFactor * 30 + (rng() - 0.3) * 20));

  // --- Core pollutant model: combine traffic, season, wind dispersion, rain washout ---
  const dispersionFactor = Math.max(0.35, 1 - windSpeed / 25); // low wind -> poor dispersion -> higher factor
  const rainWashout = rainfall > 0 ? Math.max(0.4, 1 - rainfall / 15) : 1;
  const fireInfluence = 1 + (fireCount / 60) * (windDirection > 260 && windDirection < 340 ? 1 : 0.3);

  const basePm25 = 55 * seasonalFactor * dispersionFactor * rainWashout * fireInfluence;
  const trafficPm25 = (trafficIndex / 100) * 40 * dispersionFactor;
  const pm25 = Math.max(8, Math.round(basePm25 + trafficPm25 + (rng() - 0.5) * 15));

  const pm10 = Math.round(pm25 * (1.55 + (rng() - 0.5) * 0.2));
  const no2 = Math.round(18 + (trafficIndex / 100) * 85 * dispersionFactor + (rng() - 0.5) * 10);
  const so2 = Math.round(8 + (rng() - 0.5) * 6 + (location.district !== "Delhi" ? 4 : 0)); // slightly higher near industrial belts
  const co = Math.round((0.6 + (trafficIndex / 100) * 1.8 * dispersionFactor) * 10) / 10;
  const o3 = Math.round(Math.max(5, 40 - dispersionFactor * 10 + (hour > 11 && hour < 16 ? 25 : 0) + (rng() - 0.5) * 10));

  const aqi = Math.max(pm25ToAqi(pm25), Math.round(pm25ToAqi(pm10 * 0.6)));

  return {
    stationId: `STN-${location.id}`,
    locationId: location.id,
    timestamp: timestamp.toISOString(),
    aqi,
    pm25,
    pm10,
    no2,
    so2,
    co,
    o3,
    temperature,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    windDirection,
    pressure: Math.round(1008 + (rng() - 0.5) * 10),
    rainfall,
    trafficIndex: Math.round(trafficIndex),
    fireCount,
  };
}

export function getCurrentReading(locationId: string): StationReading | null {
  const location = getLocation(locationId);
  if (!location) return null;
  return generateReading(location, new Date());
}

export function getAllCurrentReadings(): StationReading[] {
  const now = new Date();
  return LOCATIONS.map((loc) => generateReading(loc, now));
}

export function getHistory(locationId: string, hours: number): StationReading[] {
  const location = getLocation(locationId);
  if (!location) return [];
  const now = new Date();
  const points: StationReading[] = [];
  for (let i = hours; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000);
    points.push(generateReading(location, ts));
  }
  return points;
}

/** Regional average — used for Delhi-NCR "all locations" selector */
export function getRegionalAverage(hours = 0): StationReading {
  const now = new Date(Date.now() - hours * 60 * 60 * 1000);
  const readings = LOCATIONS.map((loc) => generateReading(loc, now));
  const avg = (key: keyof StationReading) =>
    readings.reduce((sum, r) => sum + (r[key] as number), 0) / readings.length;

  return {
    stationId: "STN-REGIONAL",
    locationId: "delhi-ncr",
    timestamp: now.toISOString(),
    aqi: Math.round(avg("aqi")),
    pm25: Math.round(avg("pm25")),
    pm10: Math.round(avg("pm10")),
    no2: Math.round(avg("no2")),
    so2: Math.round(avg("so2")),
    co: Math.round(avg("co") * 10) / 10,
    o3: Math.round(avg("o3")),
    temperature: Math.round(avg("temperature") * 10) / 10,
    humidity: Math.round(avg("humidity")),
    windSpeed: Math.round(avg("windSpeed") * 10) / 10,
    windDirection: Math.round(avg("windDirection")),
    pressure: Math.round(avg("pressure")),
    rainfall: Math.round(avg("rainfall") * 10) / 10,
    trafficIndex: Math.round(avg("trafficIndex")),
    fireCount: Math.round(avg("fireCount")),
  };
}
