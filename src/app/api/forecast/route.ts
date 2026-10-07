import { NextRequest, NextResponse } from "next/server";
import { forecast, forecastConfidence } from "@/lib/forecastEngine";

export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId") || "central-delhi";
    const points = forecast(locationId);
    if (points.length === 0) {
      return NextResponse.json({ error: `Unknown locationId "${locationId}"` }, { status: 404 });
    }
    return NextResponse.json({
      locationId,
      points,
      confidence: forecastConfidence(points),
      modelLabel: "Baseline Forecast (trend + diurnal pattern)",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Forecast unavailable", detail: err.message }, { status: 500 });
  }
}
