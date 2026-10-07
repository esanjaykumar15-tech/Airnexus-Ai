import { NextResponse } from "next/server";
import { generateAlerts } from "@/lib/alertsEngine";

export async function GET() {
  try {
    return NextResponse.json({ alerts: generateAlerts() });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate alerts", detail: err.message }, { status: 500 });
  }
}
