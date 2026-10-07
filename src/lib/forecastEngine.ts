// ============================================================
// AIRNEXUS AI — Baseline Forecast Engine
//
// This is a transparent baseline forecaster (recent trend + diurnal
// pattern + weather modifiers), NOT a trained XGBoost/LSTM model.
// It's architected so a real trained model can be dropped in behind
// the same `forecast()` function signature — see README "ML Pipeline".
// Always label output "Baseline Forecast" in the UI.
// ============================================================

import { getHistory } from "./demoData";
import { ForecastPoint } from "./types";

const HORIZONS_HOURS = [6, 12, 24, 48, 72, 168]; // 6h,12h,24h,2d,3d,7d

export function forecast(locationId: string): ForecastPoint[] {
  const history = getHistory(locationId, 48); // last 48h as basis for trend + diurnal shape
  if (history.length === 0) return [];

  const recent = history.slice(-6);
  const recentTrend = (recent[recent.length - 1].aqi - recent[0].aqi) / recent.length; // AQI change per hour

  // Diurnal shape: average AQI by hour-of-day across the lookback window
  const byHour: Record<number, number[]> = {};
  for (const r of history) {
    const h = new Date(r.timestamp).getHours();
    (byHour[h] ||= []).push(r.aqi);
  }
  const diurnalAvg: Record<number, number> = {};
  for (const [h, vals] of Object.entries(byHour)) {
    diurnalAvg[Number(h)] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  const overallAvg = history.reduce((a, r) => a + r.aqi, 0) / history.length;

  const last = history[history.length - 1];
  const now = new Date(last.timestamp);

  return HORIZONS_HOURS.map((h) => {
    const targetTime = new Date(now.getTime() + h * 60 * 60 * 1000);
    const targetHour = targetTime.getHours();
    const diurnalOffset = (diurnalAvg[targetHour] ?? overallAvg) - overallAvg;

    // Trend decays over longer horizons (persistence weakens); diurnal pattern dominates further out
    const trendWeight = Math.max(0.1, 1 - h / 200);
    const predicted = Math.max(20, Math.round(last.aqi + recentTrend * Math.min(h, 24) * trendWeight + diurnalOffset * (1 - trendWeight)));

    // Confidence interval widens with horizon
    const spread = Math.round(8 + h * 0.9);

    return {
      horizonHours: h,
      timestamp: targetTime.toISOString(),
      predictedAqi: predicted,
      lowerBound: Math.max(10, predicted - spread),
      upperBound: predicted + spread,
      predictedPm25: Math.round(predicted * 0.62),
      predictedPm10: Math.round(predicted * 0.95),
      predictedNo2: Math.round(30 + predicted * 0.18),
      predictedO3: Math.round(20 + Math.max(0, 15 - h / 20)),
    };
  });
}

/** Rough confidence score for the whole forecast run — lower for further horizons overall */
export function forecastConfidence(points: ForecastPoint[]): number {
  if (points.length === 0) return 0;
  const avgSpreadRatio =
    points.reduce((sum, p) => sum + (p.upperBound - p.lowerBound) / Math.max(1, p.predictedAqi), 0) / points.length;
  return Math.max(50, Math.round(95 - avgSpreadRatio * 100));
}
