// ============================================================
// AIRNEXUS AI — Shared domain types
// ============================================================

export type AqiCategory = "Good" | "Satisfactory" | "Moderate" | "Poor" | "Very Poor" | "Severe";

export interface Location {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  populationDensity: number; // people per sq km, approximate
}

export interface StationReading {
  stationId: string;
  locationId: string;
  timestamp: string; // ISO
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees, 0 = N
  pressure: number; // hPa
  rainfall: number; // mm
  trafficIndex: number; // 0-100
  fireCount: number; // nearby fire detections
}

export interface SourceContribution {
  source: "Traffic" | "Crop Burning" | "Industrial" | "Construction Dust" | "Waste Burning" | "Other";
  percent: number;
  confidence: number; // 0-100
  trend: number; // percent change vs previous period
}

export interface ForecastPoint {
  horizonHours: number;
  timestamp: string;
  predictedAqi: number;
  lowerBound: number;
  upperBound: number;
  predictedPm25: number;
  predictedPm10: number;
  predictedNo2: number;
  predictedO3: number;
}

export interface Alert {
  id: string;
  type: "AQI Spike" | "PM2.5 Spike" | "Regional Fire Activity" | "Low Wind Dispersion" | "Pollution Transport" | "Extreme Pollution";
  severity: "moderate" | "high" | "critical";
  locationId: string;
  locationName: string;
  windowStart: string;
  windowEnd: string;
  predictedAqi: number;
  confidence: number;
  factors: string[];
}

export interface PolicySliders {
  trafficReduction: number; // 0-100
  industrialReduction: number;
  constructionReduction: number;
  cropBurningReduction: number;
  wasteBurningReduction: number;
}

export interface PolicySimulationResult {
  currentAqi: number;
  simulatedAqi: number;
  improvementPercent: number;
  breakdown: { source: string; before: number; after: number }[];
  assumptions: string[];
}

export interface DataSourceStatus {
  name: string;
  category: string;
  status: "connected" | "demo" | "unavailable";
  records: number;
  lastSync: string;
}
