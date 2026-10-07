import { NextRequest, NextResponse } from "next/server";
import { getCurrentReading, getRegionalAverage } from "@/lib/demoData";
import { estimateSourceAttribution, evidenceFor } from "@/lib/sourceAttribution";
import { INDUSTRIAL_HEAVY_LOCATIONS } from "@/lib/dataSources";

export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId") || "delhi-ncr";
    const reading = locationId === "delhi-ncr" ? getRegionalAverage() : getCurrentReading(locationId);
    if (!reading) return NextResponse.json({ error: `Unknown locationId "${locationId}"` }, { status: 404 });

    const industrialHeavy = INDUSTRIAL_HEAVY_LOCATIONS.has(locationId);
    const sources = estimateSourceAttribution(reading, industrialHeavy);
    const withEvidence = sources.map((s) => ({ ...s, evidence: evidenceFor(s.source, reading) }));

    return NextResponse.json({ locationId, reading, sources: withEvidence, label: "AI Estimated Source Contribution" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to compute source attribution", detail: err.message }, { status: 500 });
  }
}
