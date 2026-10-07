// ============================================================
// AIRNEXUS AI — Copilot (rule-based fallback assistant)
//
// If LLM_API_KEY is configured, /api/ai/chat can route to a real LLM
// with this same context payload injected as system context. Without
// a key, this rule-based engine answers using live application data
// so responses are always grounded in what's actually on screen.
// ============================================================

import { StationReading, SourceContribution, ForecastPoint, Alert } from "./types";
import { aqiCategory } from "./demoData";

export interface AssistantContext {
  locationName: string;
  reading: StationReading;
  sources: SourceContribution[];
  forecastPoints: ForecastPoint[];
  alerts: Alert[];
}

export function answerQuestion(question: string, ctx: AssistantContext): string {
  const q = question.toLowerCase();
  const { reading, sources, forecastPoints, alerts, locationName } = ctx;
  const topSource = [...sources].sort((a, b) => b.percent - a.percent)[0];
  const next24 = forecastPoints.find((p) => p.horizonHours === 24);
  const next6 = forecastPoints.find((p) => p.horizonHours === 6);

  if (/why.*(high|bad|pollut|severe|worse)/.test(q) || /reason/.test(q)) {
    const factors: string[] = [];
    if (reading.windSpeed < 6) factors.push(`weak atmospheric dispersion (wind speed only ${reading.windSpeed} km/h)`);
    if (reading.trafficIndex > 55) factors.push(`elevated traffic activity (index ${reading.trafficIndex}/100)`);
    if (reading.fireCount > 15) factors.push(`${reading.fireCount} regional fire detections influencing PM2.5`);
    if (reading.humidity > 70) factors.push(`high humidity (${reading.humidity}%) promoting particulate accumulation`);
    return `Current AQI in ${locationName} is ${reading.aqi} (${aqiCategory(reading.aqi)}). The model estimates this is driven mainly by ${
      factors.length ? factors.join(", ") : "typical seasonal and traffic patterns"
    }. Estimated top source contribution: ${topSource.source} at ${topSource.percent}% (confidence ${topSource.confidence}%).`;
  }

  if (/policy|impact|intervention|reduce/.test(q) && /highest|best|top|most/.test(q)) {
    const ranked = [...sources].sort((a, b) => b.percent * (b.confidence / 100) - a.percent * (a.confidence / 100));
    return `Based on current source attribution, the highest-leverage intervention is likely to target ${ranked[0].source} (estimated ${ranked[0].percent}% of current pollution, ${ranked[0].confidence}% confidence). Try the Policy Simulator to quantify a specific reduction scenario.`;
  }

  if (/tomorrow|forecast|predict|will.*aqi|next day/.test(q)) {
    if (!next24) return "Forecast data isn't available for this location right now.";
    return `The current forecast estimates an AQI of approximately ${next24.predictedAqi} in 24 hours (range ${next24.lowerBound}–${next24.upperBound}), compared to ${reading.aqi} now. This is a baseline statistical forecast, not a certified prediction — treat it as directional.`;
  }

  if (/6.hour|next few hours|short.term/.test(q)) {
    if (!next6) return "Short-term forecast isn't available right now.";
    return `Over the next 6 hours, AQI is estimated to move from ${reading.aqi} to approximately ${next6.predictedAqi}.`;
  }

  if (/alert|warning|spike/.test(q)) {
    if (alerts.length === 0) return "There are no active alerts for the selected region right now.";
    const a = alerts[0];
    return `The most significant active alert is a ${a.type} for ${a.locationName}, expected between ${new Date(a.windowStart).toLocaleString()} and ${new Date(a.windowEnd).toLocaleString()}, with a predicted AQI of ${a.predictedAqi} (${a.confidence}% confidence). Contributing factors: ${a.factors.join(", ")}.`;
  }

  if (/source|contribut|cause/.test(q)) {
    return `Estimated source contributions for ${locationName}: ${sources
      .map((s) => `${s.source} ${s.percent}%`)
      .join(", ")}. These are model-based estimates, not confirmed causal attribution.`;
  }

  if (/wind/.test(q)) {
    return `Current wind speed is ${reading.windSpeed} km/h from ${reading.windDirection}°. ${
      reading.windSpeed < 6 ? "This is low, meaning pollutants are dispersing poorly and accumulating locally." : "This is helping disperse pollutants."
    }`;
  }

  if (/pm2\.5|pm 2\.5/.test(q)) {
    return `Current PM2.5 in ${locationName} is ${reading.pm25} µg/m³, which is ${
      reading.pm25 > 90 ? "well above" : "near"
    } the WHO 24-hour guideline of 15 µg/m³.`;
  }

  return `Current conditions in ${locationName}: AQI ${reading.aqi} (${aqiCategory(reading.aqi)}), PM2.5 ${reading.pm25} µg/m³, PM10 ${reading.pm10} µg/m³. Top estimated source: ${topSource.source} (${topSource.percent}%). Ask me about the reason for current pollution, tomorrow's forecast, active alerts, or which policy would help most.`;
}
