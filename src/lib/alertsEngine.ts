// ============================================================
// AIRNEXUS AI — Early Warning / Alerts Engine
// Generates alerts from actual forecast + reading data — nothing hardcoded.
// ============================================================

import { LOCATIONS, getCurrentReading } from "./demoData";
import { forecast } from "./forecastEngine";
import { Alert } from "./types";

export function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];

  for (const loc of LOCATIONS) {
    const current = getCurrentReading(loc.id);
    if (!current) continue;
    const points = forecast(loc.id);
    const next24 = points.find((p) => p.horizonHours === 24);

    if (next24 && next24.predictedAqi >= 350) {
      alerts.push({
        id: `aqi-spike-${loc.id}`,
        type: "AQI Spike",
        severity: next24.predictedAqi >= 420 ? "critical" : "high",
        locationId: loc.id,
        locationName: loc.name,
        windowStart: next24.timestamp,
        windowEnd: new Date(new Date(next24.timestamp).getTime() + 5 * 3600 * 1000).toISOString(),
        predictedAqi: next24.predictedAqi,
        confidence: Math.max(55, 90 - Math.round((next24.upperBound - next24.lowerBound) / 4)),
        factors: [
          current.windSpeed < 6 ? "Low wind dispersion" : "Moderate wind",
          current.trafficIndex > 60 ? "High traffic load" : "Normal traffic",
          current.fireCount > 15 ? "Elevated regional fire activity" : "Low regional fire activity",
        ],
      });
    }

    if (current.windSpeed < 4 && current.aqi > 250) {
      alerts.push({
        id: `low-wind-${loc.id}`,
        type: "Low Wind Dispersion",
        severity: "moderate",
        locationId: loc.id,
        locationName: loc.name,
        windowStart: current.timestamp,
        windowEnd: new Date(new Date(current.timestamp).getTime() + 6 * 3600 * 1000).toISOString(),
        predictedAqi: current.aqi,
        confidence: 72,
        factors: [`Wind speed ${current.windSpeed} km/h`, "Pollution accumulation likely to continue"],
      });
    }

    if (current.fireCount > 25) {
      alerts.push({
        id: `fire-${loc.id}`,
        type: "Regional Fire Activity",
        severity: current.fireCount > 40 ? "high" : "moderate",
        locationId: loc.id,
        locationName: loc.name,
        windowStart: current.timestamp,
        windowEnd: new Date(new Date(current.timestamp).getTime() + 12 * 3600 * 1000).toISOString(),
        predictedAqi: current.aqi,
        confidence: 68,
        factors: [`${current.fireCount} regional fire detections`, `Wind direction ${current.windDirection}°`],
      });
    }
  }

  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
}
