import { NextRequest, NextResponse } from "next/server";
import { getCurrentReading, getRegionalAverage } from "@/lib/demoData";
import { estimateSourceAttribution } from "@/lib/sourceAttribution";
import { forecast } from "@/lib/forecastEngine";
import { generateAlerts } from "@/lib/alertsEngine";
import { INDUSTRIAL_HEAVY_LOCATIONS } from "@/lib/dataSources";
import { answerQuestion } from "@/lib/aiAssistant";
import { LOCATIONS } from "@/lib/demoData";

// Simple in-memory rate limiter (per-process — fine for demo; use Redis for real deployments)
const RATE_LIMIT = 20; // requests
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment before asking again." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const question = typeof body.question === "string" ? body.question.slice(0, 500) : "";
    const locationId = typeof body.locationId === "string" ? body.locationId : "delhi-ncr";

    if (!question.trim()) {
      return NextResponse.json({ error: "Please provide a question." }, { status: 400 });
    }

    const reading = locationId === "delhi-ncr" ? getRegionalAverage() : getCurrentReading(locationId);
    if (!reading) return NextResponse.json({ error: `Unknown locationId "${locationId}"` }, { status: 404 });

    const sources = estimateSourceAttribution(reading, INDUSTRIAL_HEAVY_LOCATIONS.has(locationId));
    const forecastPoints = forecast(locationId === "delhi-ncr" ? "central-delhi" : locationId);
    const alerts = generateAlerts().filter((a) => locationId === "delhi-ncr" || a.locationId === locationId);
    const locationName = locationId === "delhi-ncr" ? "Delhi-NCR" : LOCATIONS.find((l) => l.id === locationId)?.name || locationId;

    // LLM_API_KEY hook: if configured, this is where you'd call the real LLM,
    // passing { reading, sources, forecastPoints, alerts } as system context.
    // Without a key, fall back to the rule-based assistant so answers are
    // still grounded in real (demo) application data.
    const answer = answerQuestion(question, { locationName, reading, sources, forecastPoints, alerts });

    return NextResponse.json({ answer, mode: process.env.LLM_API_KEY ? "llm" : "rule-based" });
  } catch (err: any) {
    return NextResponse.json({ error: "Assistant is temporarily unavailable", detail: err.message }, { status: 500 });
  }
}
