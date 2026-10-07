import { aqiCategory, aqiColor } from "@/lib/demoData";

export function AqiBadge({ aqi }: { aqi: number }) {
  const category = aqiCategory(aqi);
  const color = aqiColor(aqi);
  return (
    <span className="badge" style={{ backgroundColor: `${color}22`, color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}

export function DataModeBadge({ mode }: { mode: "live" | "demo" }) {
  return (
    <span className={`badge ${mode === "live" ? "bg-emerald-500/15 text-emerald-400" : "bg-cyan-500/15 text-cyan-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${mode === "live" ? "bg-emerald-400" : "bg-cyan-400"} animate-pulse`} />
      {mode === "live" ? "Live Data" : "Demo Data"}
    </span>
  );
}
