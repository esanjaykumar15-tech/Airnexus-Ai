import { NextRequest, NextResponse } from "next/server";
import { getHistory, DATA_MODE } from "@/lib/demoData";

export async function GET(req: NextRequest) {
  try {
    const locationId = req.nextUrl.searchParams.get("locationId") || "central-delhi";
    const hoursParam = req.nextUrl.searchParams.get("hours");
    const hours = Math.min(720, Math.max(6, Number(hoursParam) || 24)); // cap at 30 days

    const history = getHistory(locationId, hours);
    return NextResponse.json({ dataMode: DATA_MODE, locationId, history });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch history", detail: err.message }, { status: 500 });
  }
}
