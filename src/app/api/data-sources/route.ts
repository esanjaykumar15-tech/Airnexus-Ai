import { NextResponse } from "next/server";
import { getDataSources, getDataQuality } from "@/lib/dataSources";

export async function GET() {
  return NextResponse.json({ sources: getDataSources(), quality: getDataQuality() });
}
