"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/TopBar";
import { AqiBadge } from "@/components/Badges";
import { StationReading, Location } from "@/lib/types";
import clsx from "clsx";

const PollutionMap = dynamic(() => import("@/components/PollutionMap"), { ssr: false });

const LAYERS = ["AQI", "PM2.5", "PM10", "NO₂", "Traffic", "Fire Detection"];

export default function LiveMapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [readings, setReadings] = useState<StationReading[]>([]);
  const [layer, setLayer] = useState("AQI");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/locations").then((r) => r.json()), fetch("/api/air-quality/current").then((r) => r.json())])
      .then(([locData, aqData]) => {
        setLocations(locData.locations);
        setReadings(aqData.allStations);
      })
      .finally(() => setLoading(false));
  }, []);

  const selected = readings.find((r) => r.locationId === selectedId);
  const selectedLocation = locations.find((l) => l.id === selectedId);

  return (
    <div>
      <TopBar title="Live Delhi-NCR Map" subtitle="Interactive pollution monitoring across the region" />
      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {LAYERS.map((l) => (
              <button
                key={l}
                onClick={() => setLayer(l)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  layer === l ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-slate-400 hover:bg-white/10"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="glass-card h-[560px] overflow-hidden p-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading map…</div>
            ) : (
              <PollutionMap locations={locations} readings={readings} onSelect={setSelectedId} />
            )}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Currently viewing the <span className="text-slate-300">{layer}</span> layer. Marker size and color reflect AQI severity at each monitoring point.
          </p>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <p className="stat-label mb-3">Legend</p>
            <div className="space-y-2 text-xs">
              {[
                ["Good", "#22c55e"],
                ["Satisfactory", "#84cc16"],
                ["Moderate", "#eab308"],
                ["Poor", "#f97316"],
                ["Very Poor", "#ef4444"],
                ["Severe", "#b91c1c"],
              ].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <p className="stat-label mb-3">Station Detail</p>
            {selected && selectedLocation ? (
              <div className="space-y-2 text-sm">
                <p className="text-base font-semibold text-slate-100">{selectedLocation.name}</p>
                <AqiBadge aqi={selected.aqi} />
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>AQI: <span className="text-slate-200">{selected.aqi}</span></p>
                  <p>PM2.5: <span className="text-slate-200">{selected.pm25}</span></p>
                  <p>PM10: <span className="text-slate-200">{selected.pm10}</span></p>
                  <p>NO₂: <span className="text-slate-200">{selected.no2}</span></p>
                  <p>Temp: <span className="text-slate-200">{selected.temperature}°C</span></p>
                  <p>Wind: <span className="text-slate-200">{selected.windSpeed} km/h</span></p>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">Updated {new Date(selected.timestamp).toLocaleTimeString()}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click a station on the map to see details here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
