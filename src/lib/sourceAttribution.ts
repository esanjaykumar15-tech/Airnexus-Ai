// ============================================================
// AIRNEXUS AI — Source Attribution (heuristic, demo mode)
//
// This is NOT a scientific source-apportionment model (e.g. CMB, PMF).
// It's a transparent, explainable heuristic that estimates likely
// contribution shares from observable correlates already present in
// the reading (traffic intensity, fire activity + wind alignment,
// district industrial density, season). Every UI surface must label
// this "AI Estimated" — never present as ground truth.
// ============================================================

import { StationReading, SourceContribution } from "./types";

export function estimateSourceAttribution(reading: StationReading, districtIsIndustrialHeavy: boolean): SourceContribution[] {
  const month = new Date(reading.timestamp).getMonth();
  const stubbleSeason = month === 9 || month === 10; // Oct/Nov

  // Raw signal strengths (0-1), each grounded in an observable field
  const trafficSignal = reading.trafficIndex / 100;
  const fireWindAligned = reading.windDirection > 260 && reading.windDirection < 340; // NW carrying Punjab/Haryana smoke
  const fireSignal = Math.min(1, (reading.fireCount / 40) * (fireWindAligned ? 1 : 0.35)) * (stubbleSeason ? 1.3 : 0.6);
  const industrialSignal = (districtIsIndustrialHeavy ? 0.65 : 0.35) * Math.min(1, reading.so2 / 20);
  const dustSignal = Math.min(1, reading.pm10 / (reading.pm25 * 2.2)); // coarse-to-fine ratio proxy for dust/construction
  const wasteSignal = 0.25 + Math.min(0.3, reading.co / 6);

  const raw = {
    Traffic: trafficSignal * 34,
    "Crop Burning": Math.min(45, fireSignal * 32),
    Industrial: industrialSignal * 26,
    "Construction Dust": dustSignal * 20,
    "Waste Burning": wasteSignal * 12,
    Other: 6,
  };

  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const normalized = Object.entries(raw).map(([source, val]) => ({
    source: source as SourceContribution["source"],
    percent: Math.round((val / total) * 1000) / 10,
  }));

  // Confidence: higher when signals are strong/unambiguous, lower in mixed conditions
  return normalized.map(({ source, percent }) => {
    let confidence = 60;
    let trend = 0;
    if (source === "Crop Burning") {
      confidence = fireWindAligned ? 78 + Math.min(15, reading.fireCount / 3) : 45;
      trend = stubbleSeason ? 12 : -8;
    } else if (source === "Traffic") {
      confidence = 70 + trafficSignal * 15;
      trend = reading.trafficIndex > 60 ? 4 : -3;
    } else if (source === "Industrial") {
      confidence = districtIsIndustrialHeavy ? 68 : 50;
      trend = 1;
    } else if (source === "Construction Dust") {
      confidence = 55;
      trend = 2;
    } else if (source === "Waste Burning") {
      confidence = 48;
      trend = -1;
    } else {
      confidence = 40;
      trend = 0;
    }
    return { source, percent, confidence: Math.round(Math.min(95, confidence)), trend };
  });
}

export function evidenceFor(source: SourceContribution["source"], reading: StationReading): string[] {
  switch (source) {
    case "Traffic":
      return [
        `Traffic intensity index at ${reading.trafficIndex}/100`,
        `NO₂ concentration of ${reading.no2} µg/m³ (traffic-linked pollutant)`,
        "Road proximity of monitoring station",
        "Historical correlation between traffic index and NO₂",
      ];
    case "Crop Burning":
      return [
        `${reading.fireCount} regional fire detections in the current window`,
        `Wind direction ${reading.windDirection}° ${reading.windDirection > 260 && reading.windDirection < 340 ? "(aligned with Punjab/Haryana transport corridor)" : "(not strongly aligned with fire regions)"}`,
        "Seasonal stubble-burning activity pattern",
        "Historical PM2.5 spike correlation during Oct–Nov",
      ];
    case "Industrial":
      return [
        `SO₂ concentration of ${reading.so2} µg/m³`,
        "Proximity to industrial zones",
        "District industrial density classification",
      ];
    case "Construction Dust":
      return [`Coarse/fine particulate ratio (PM10:PM2.5 ≈ ${(reading.pm10 / reading.pm25).toFixed(2)})`, "Regional construction activity level"];
    case "Waste Burning":
      return [`CO concentration of ${reading.co} ppm`, "Localized burning pattern signature"];
    default:
      return ["Residual/unattributed contribution after other source signals"];
  }
}
