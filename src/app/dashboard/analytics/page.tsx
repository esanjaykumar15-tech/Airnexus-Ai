"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useLocationContext } from "@/lib/locationContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, Legend } from "recharts";

const RANGES = [
  { label: "7D", hours: 168 },
  { label: "30D", hours: 720 },
];

export default function AnalyticsPage() {
  const { locationId } = useLocationContext();
  const [range, setRange] = useState(RANGES[0]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const targetId = locationId === "delhi-ncr" ? "central-delhi" : locationId;
    fetch(`/api/air-quality/history?locationId=${targetId}&hours=${range.hours}`)
      .then((r) => r.json())
      .then((d) => {
        const step = range.hours > 200 ? 6 : 2;
        const points = (d.history || [])
          .filter((_: any, i: number) => i % step === 0)
          .map((h: any) => ({
            time: new Date(h.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }),
            aqi: h.aqi,
            pm25: h.pm25,
            pm10: h.pm10,
            no2: h.no2,
            traffic: h.trafficIndex,
          }));
        setHistory(points);
      })
      .finally(() => setLoading(false));
  }, [locationId, range]);

  return (
    <div>
      <TopBar title="Historical Analytics" subtitle="Trend analysis across pollutants, weather, and traffic" />
      <div className="p-6">
        <div className="mb-4 flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${range.label === r.label ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[
            { key: "aqi", label: "AQI Trend", color: "#22e0ea" },
            { key: "pm25", label: "PM2.5 Trend (µg/m³)", color: "#f97316" },
            { key: "pm10", label: "PM10 Trend (µg/m³)", color: "#eab308" },
            { key: "no2", label: "NO₂ Trend (µg/m³)", color: "#a855f7" },
          ].map((chart) => (
            <div key={chart.key} className="glass-card p-6">
              <p className="stat-label mb-4">{chart.label}</p>
              {loading ? (
                <div className="h-56 animate-pulse rounded-xl bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1b2330" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          ))}

          <div className="glass-card p-6 lg:col-span-2">
            <p className="stat-label mb-1">Traffic Density vs NO₂</p>
            <p className="mb-4 text-[11px] text-slate-500">Correlation reflects a modeled relationship in demo data, not causal proof.</p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2330" />
                <XAxis type="number" dataKey="traffic" name="Traffic Index" stroke="#64748b" fontSize={10} />
                <YAxis type="number" dataKey="no2" name="NO₂" stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter data={history} fill="#22e0ea" name="Traffic vs NO₂" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
