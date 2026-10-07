"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useLocationContext } from "@/lib/locationContext";
import { StationReading } from "@/lib/types";
import { Wind, Flame } from "lucide-react";

export default function PollutionFlowPage() {
  const { locationId } = useLocationContext();
  const [reading, setReading] = useState<StationReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/air-quality/current?locationId=${locationId}`)
      .then((r) => r.json())
      .then((d) => setReading(d.reading))
      .finally(() => setLoading(false));
  }, [locationId]);

  const dispersion = reading ? (reading.windSpeed < 5 ? "LOW" : reading.windSpeed < 12 ? "MODERATE" : "HIGH") : "—";
  const fireAligned = reading ? reading.windDirection > 260 && reading.windDirection < 340 : false;
  const transportRisk = reading ? (fireAligned && reading.fireCount > 15 ? "HIGH" : reading.fireCount > 8 ? "MODERATE" : "LOW") : "—";

  const compass = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const dirLabel = reading ? compass[Math.round(reading.windDirection / 22.5) % 16] : "";

  return (
    <div>
      <TopBar title="Pollution Flow Intelligence" subtitle="Wind-driven regional pollution transport" />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="glass-card flex flex-col items-center justify-center p-8 lg:col-span-1">
          <p className="stat-label mb-6">Wind Direction</p>
          {loading || !reading ? (
            <div className="h-40 w-40 animate-pulse rounded-full bg-white/5" />
          ) : (
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-white/10">
              {["N", "E", "S", "W"].map((d, i) => (
                <span
                  key={d}
                  className="absolute text-[10px] text-slate-500"
                  style={{
                    top: i === 0 ? 4 : i === 2 ? undefined : "50%",
                    bottom: i === 2 ? 4 : undefined,
                    left: i === 3 ? 6 : i === 1 ? undefined : "50%",
                    right: i === 1 ? 6 : undefined,
                    transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)",
                  }}
                >
                  {d}
                </span>
              ))}
              <Wind
                size={40}
                className="text-cyan-400"
                style={{ transform: `rotate(${reading.windDirection}deg)`, transition: "transform 1s ease" }}
              />
            </div>
          )}
          {reading && (
            <p className="mt-6 text-center text-sm text-slate-300">
              <span className="text-2xl font-bold text-slate-50">{dirLabel}</span>
              <br />
              {reading.windDirection}° · {reading.windSpeed} km/h
            </p>
          )}
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <p className="stat-label mb-4">Regional Transport Status</p>
          {reading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Wind Speed" value={`${reading.windSpeed} km/h`} />
              <Stat label="Dispersion" value={dispersion} color={dispersion === "LOW" ? "#ef4444" : dispersion === "MODERATE" ? "#eab308" : "#22c55e"} />
              <Stat label="Fire Detections" value={String(reading.fireCount)} />
              <Stat label="Regional Transport Risk" value={transportRisk} color={transportRisk === "HIGH" ? "#ef4444" : transportRisk === "MODERATE" ? "#eab308" : "#22c55e"} />
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Flame size={16} className="text-orange-400" /> Transport Narrative
            </p>
            <p className="text-sm text-slate-400">
              {reading
                ? fireAligned && reading.fireCount > 10
                  ? `Wind is currently flowing from the ${dirLabel} at ${reading.windSpeed} km/h — a direction aligned with regional agricultural burning areas. Combined with ${reading.fireCount} active fire detections, this raises the estimated regional pollution transport contribution toward Delhi-NCR.`
                  : `Wind is currently flowing from the ${dirLabel} at ${reading.windSpeed} km/h. This direction is not strongly aligned with major regional fire activity, so long-range transport contribution is estimated to be limited right now.`
                : "Loading wind and transport data…"}
            </p>
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
            This is a simplified wind-alignment heuristic for decision support, not a physically exact atmospheric dispersion model
            (e.g. HYSPLIT trajectory analysis).
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] p-3 text-center">
      <p className="text-lg font-bold" style={{ color: color || "#f1f5f9" }}>
        {value}
      </p>
      <p className="stat-label mt-1">{label}</p>
    </div>
  );
}
