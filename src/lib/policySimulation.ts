// ============================================================
// AIRNEXUS AI — Policy Simulation Engine
//
// Transparent, bounded simulation: each policy slider reduces the
// corresponding source's contribution to PM2.5, and the resulting
// PM2.5 is converted back to AQI. This is a decision-support
// heuristic, not a physically exact atmospheric chemistry model —
// labeled "AI Simulation" throughout the UI.
// ============================================================

import { StationReading, PolicySliders, PolicySimulationResult, SourceContribution } from "./types";

const SOURCE_KEY_MAP: Record<SourceContribution["source"], keyof PolicySliders> = {
  Traffic: "trafficReduction",
  "Crop Burning": "cropBurningReduction",
  Industrial: "industrialReduction",
  "Construction Dust": "constructionReduction",
  "Waste Burning": "wasteBurningReduction",
  Other: "trafficReduction", // "Other" is left unaffected by sliders; mapped but weight is zero below
};

function pm25ToAqiApprox(pm25: number): number {
  // Reuse same simplified conversion as demoData for consistency
  const bp: [number, number, number, number][] = [
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

export const DEFAULT_SLIDERS: PolicySliders = {
  trafficReduction: 0,
  industrialReduction: 0,
  constructionReduction: 0,
  cropBurningReduction: 0,
  wasteBurningReduction: 0,
};

export function simulatePolicy(
  reading: StationReading,
  sources: SourceContribution[],
  sliders: PolicySliders
): PolicySimulationResult {
  const currentPm25 = reading.pm25;
  const currentAqi = reading.aqi;

  const breakdown: { source: string; before: number; after: number }[] = [];
  let reducedPm25 = 0;

  for (const s of sources) {
    const sourcePm25 = currentPm25 * (s.percent / 100);
    const sliderKey = SOURCE_KEY_MAP[s.source];
    const reductionPercent = s.source === "Other" ? 0 : Math.min(100, Math.max(0, sliders[sliderKey] ?? 0));
    const afterPm25 = sourcePm25 * (1 - reductionPercent / 100);
    reducedPm25 += afterPm25;
    breakdown.push({
      source: s.source,
      before: Math.round(sourcePm25 * 10) / 10,
      after: Math.round(afterPm25 * 10) / 10,
    });
  }

  // Bound: pollution can't go below a realistic background floor (~8 µg/m³)
  const simulatedPm25 = Math.max(8, Math.round(reducedPm25));
  const simulatedAqi = Math.min(currentAqi, pm25ToAqiApprox(simulatedPm25));

  const improvementPercent = currentAqi > 0 ? Math.round(((currentAqi - simulatedAqi) / currentAqi) * 1000) / 10 : 0;

  return {
    currentAqi,
    simulatedAqi,
    improvementPercent: Math.max(0, improvementPercent),
    breakdown,
    assumptions: [
      "Each policy reduces its associated source's PM2.5 contribution proportionally (linear model).",
      "Secondary/atmospheric chemistry effects (e.g. NOx-O3 interactions) are not modeled.",
      "A realistic background pollution floor (~8 µg/m³) is enforced — pollution cannot simulate to zero.",
      "AQI is recalculated from simulated PM2.5 using the same conversion used for live readings.",
      "This is a decision-support estimate, not a certified regulatory impact assessment.",
    ],
  };
}

/** Named preset scenarios for the comparison table */
export function presetScenarios(): { name: string; sliders: PolicySliders }[] {
  return [
    { name: "Traffic -20%", sliders: { ...DEFAULT_SLIDERS, trafficReduction: 20 } },
    { name: "Construction -30%", sliders: { ...DEFAULT_SLIDERS, constructionReduction: 30 } },
    { name: "Crop Burning -50%", sliders: { ...DEFAULT_SLIDERS, cropBurningReduction: 50 } },
    {
      name: "Combined Policy",
      sliders: { trafficReduction: 20, industrialReduction: 10, constructionReduction: 30, cropBurningReduction: 50, wasteBurningReduction: 20 },
    },
  ];
}
