import { DATA_MODE } from "./demoData";
import { DataSourceStatus } from "./types";

export function getDataSources(): DataSourceStatus[] {
  const status = DATA_MODE === "live" ? "connected" : "demo";
  const now = new Date().toISOString();

  return [
    { name: "Air Quality", category: "Pollution Monitoring", status, records: 1_284_920, lastSync: now },
    { name: "Weather", category: "Meteorology", status, records: 892_340, lastSync: now },
    { name: "Satellite Fire Detection", category: "Remote Sensing", status: DATA_MODE === "live" ? "connected" : "demo", records: 48_210, lastSync: now },
    { name: "Traffic", category: "Mobility", status, records: 2_150_000, lastSync: now },
    { name: "Geospatial Boundaries", category: "Geography", status: "connected", records: 13, lastSync: now },
    { name: "Industrial Zones", category: "Land Use", status: "demo", records: 24, lastSync: now },
    { name: "Population Density", category: "Demographics", status: "connected", records: 13, lastSync: now },
  ];
}

export function getDataQuality() {
  return {
    completeness: 94,
    freshness: 98,
    consistency: 91,
    coverage: 89,
  };
}

export interface IndustrialZone {
  id: string;
  name: string;
  locationId: string;
  riskScore: number;
  pm25Risk: "Low" | "Moderate" | "High" | "Very High";
  no2Risk: "Low" | "Moderate" | "High" | "Very High";
  so2Risk: "Low" | "Moderate" | "High" | "Very High";
}

export function getIndustrialZones(): IndustrialZone[] {
  // Deterministic pseudo-scores per district, clearly labeled as estimates in the UI
  return [
    { id: "iz-1", name: "Wazirpur Industrial Area", locationId: "punjabi-bagh", riskScore: 78, pm25Risk: "High", no2Risk: "Very High", so2Risk: "Moderate" },
    { id: "iz-2", name: "Okhla Industrial Estate", locationId: "ito", riskScore: 71, pm25Risk: "High", no2Risk: "High", so2Risk: "Moderate" },
    { id: "iz-3", name: "Mundka Industrial Area", locationId: "rohini", riskScore: 66, pm25Risk: "Moderate", no2Risk: "High", so2Risk: "Low" },
    { id: "iz-4", name: "Faridabad Industrial Belt", locationId: "faridabad", riskScore: 74, pm25Risk: "High", no2Risk: "Moderate", so2Risk: "High" },
    { id: "iz-5", name: "Ghaziabad Sahibabad Zone", locationId: "ghaziabad", riskScore: 69, pm25Risk: "High", no2Risk: "Moderate", so2Risk: "Moderate" },
  ];
}

export const INDUSTRIAL_HEAVY_LOCATIONS = new Set(["punjabi-bagh", "ito", "rohini", "faridabad", "ghaziabad"]);
