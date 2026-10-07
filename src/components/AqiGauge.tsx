"use client";

import { aqiCategory, aqiColor } from "@/lib/demoData";

export function AqiHeroGauge({ aqi }: { aqi: number }) {
  const color = aqiColor(aqi);
  const pct = Math.min(100, (aqi / 500) * 100);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex h-64 w-64 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#1b2330" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease, stroke 1s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-extrabold text-slate-50">{aqi}</span>
        <span className="mt-1 text-sm font-bold uppercase tracking-widest" style={{ color }}>
          {aqiCategory(aqi)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">AQI Score</span>
      </div>
    </div>
  );
}

const SCALE: { label: string; color: string }[] = [
  { label: "Good", color: "#22c55e" },
  { label: "Satisfactory", color: "#84cc16" },
  { label: "Moderate", color: "#eab308" },
  { label: "Poor", color: "#f97316" },
  { label: "Very Poor", color: "#ef4444" },
  { label: "Severe", color: "#b91c1c" },
];

export function AqiScaleBar() {
  return (
    <div className="flex w-full max-w-md items-center gap-1">
      {SCALE.map((s) => (
        <div key={s.label} className="flex-1 text-center">
          <div className="h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
          <p className="mt-1 text-[9px] text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
