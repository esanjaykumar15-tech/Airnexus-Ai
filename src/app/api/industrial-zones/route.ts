import { NextResponse } from "next/server";
import { getIndustrialZones } from "@/lib/dataSources";

export async function GET() {
  return NextResponse.json({ zones: getIndustrialZones() });
}
