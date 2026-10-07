import { NextRequest, NextResponse } from "next/server";
import { getCurrentReading, getRegionalAverage } from "@/lib/demoData";
import { estimateSourceAttribution } from "@/lib/sourceAttribution";
import { simulatePolicy, DEFAULT_SLIDERS } from "@/lib/policySimulation";
import { INDUSTRIAL_HEAVY_LOCATIONS } from "@/lib/dataSources";
import { PolicySliders } from "@/lib/types";

function clampSlider(v: unknown): number {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const locationId = typeof body.locationId === "string" ? body.locationId : "delhi-ncr";

    const sliders: PolicySliders = {
      trafficReduction: clampSlider(body.sliders?.trafficReduction ?? DEFAULT_SLIDERS.trafficReduction),
      industrialReduction: clampSlider(body.sliders?.industrialReduction ?? DEFAULT_SLIDERS.industrialReduction),
      constructionReduction: clampSlider(body.sliders?.constructionReduction ?? DEFAULT_SLIDERS.constructionReduction),
      cropBurningReduction: clampSlider(body.sliders?.cropBurningReduction ?? DEFAULT_SLIDERS.cropBurningReduction),
      wasteBurningReduction: clampSlider(body.sliders?.wasteBurningReduction ?? DEFAULT_SLIDERS.wasteBurningReduction),
    };

    const reading = locationId === "delhi-ncr" ? getRegionalAverage() : getCurrentReading(locationId);
    if (!reading) return NextResponse.json({ error: `Unknown locationId "${locationId}"` }, { status: 404 });

    const sources = estimateSourceAttribution(reading, INDUSTRIAL_HEAVY_LOCATIONS.has(locationId));
    const result = simulatePolicy(reading, sources, sliders);

    return NextResponse.json({ locationId, sliders, result, label: "AI Simulation" });
  } catch (err: any) {
    return NextResponse.json({ error: "Simulation failed", detail: err.message }, { status: 500 });
  }
}
