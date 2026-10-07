import { NextRequest, NextResponse } from "next/server";
import { getCurrentReading, getRegionalAverage } from "@/lib/demoData";
import { estimateSourceAttribution } from "@/lib/sourceAttribution";
import { simulatePolicy, presetScenarios, DEFAULT_SLIDERS } from "@/lib/policySimulation";
import { INDUSTRIAL_HEAVY_LOCATIONS } from "@/lib/dataSources";

export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId") || "delhi-ncr";
    const reading = locationId === "delhi-ncr" ? getRegionalAverage() : getCurrentReading(locationId);
    if (!reading) return NextResponse.json({ error: `Unknown locationId "${locationId}"` }, { status: 404 });

    const sources = estimateSourceAttribution(reading, INDUSTRIAL_HEAVY_LOCATIONS.has(locationId));
    const scenarios = presetScenarios();

    const rows = [
      { name: "Current", predictedAqi: reading.aqi, improvement: 0 },
      ...scenarios.map((sc) => {
        const result = simulatePolicy(reading, sources, sc.sliders);
        return { name: sc.name, predictedAqi: result.simulatedAqi, improvement: result.improvementPercent };
      }),
    ];

    // Rank the individual (non-combined) policies by estimated impact for the ranking view
    const ranked = rows
      .filter((r) => r.name !== "Current" && r.name !== "Combined Policy")
      .sort((a, b) => b.improvement - a.improvement)
      .map((r, i) => ({ rank: i + 1, ...r }));

    return NextResponse.json({ locationId, rows, ranked, baselineAqi: reading.aqi });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to compute scenarios", detail: err.message }, { status: 500 });
  }
}
