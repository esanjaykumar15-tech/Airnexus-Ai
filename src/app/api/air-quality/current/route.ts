import { NextRequest, NextResponse } from "next/server";
import { getAllCurrentReadings, getCurrentReading, getRegionalAverage, DATA_MODE } from "@/lib/demoData";

export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId");

    if (!locationId || locationId === "delhi-ncr") {
      return NextResponse.json({
        dataMode: DATA_MODE,
        reading: getRegionalAverage(),
        allStations: getAllCurrentReadings(),
      });
    }

    const reading = getCurrentReading(locationId);
    if (!reading) {
      return NextResponse.json({ error: `Unknown locationId "${locationId}"` }, { status: 404 });
    }
    return NextResponse.json({ dataMode: DATA_MODE, reading, allStations: getAllCurrentReadings() });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch current air quality", detail: err.message }, { status: 500 });
  }
}
