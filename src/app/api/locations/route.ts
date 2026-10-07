import { NextResponse } from "next/server";
import { LOCATIONS, DATA_MODE } from "@/lib/demoData";

export async function GET() {
  return NextResponse.json({ locations: LOCATIONS, dataMode: DATA_MODE });
}
