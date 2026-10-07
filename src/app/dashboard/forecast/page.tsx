"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useLocationContext } from "@/lib/locationContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart } from "recharts";
import { ForecastPoint, StationReading } from "@/lib/types";

function horizonLabel(h: number) {
  if (h < 24) return `${h}H`;
  if (h === 24) return "24H";
  return `${Math.round(h / 24)}D`;
}

export default function ForecastPage() {
  const { locationId } = useLocationContext();
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [current, setCurrent] = useState<StationReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const targetId = locationId === "delhi-ncr" ? "central-delhi" : locationId;
    Promise.all([
      fetch(`/api/forecast?locationId=${targetId}`).then((r) => r.json()),
      fetch(`/api/air-quality/current?locationId=${locationId}`).then((r) => r.json()),
    ])
      .then(([fc, cur]) => {
        setPoints(fc.points || []);
        setConfidence(fc.confidence || 0);
        setCurrent(cur.reading);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  const chartData = current
    ? [
        { label: "Now", predicted: current.aqi, lower: current.aqi, upper: current.aqi },
        ...points.map((p) => ({ label: horizonLabel(p.horizonHours), predicted: p.predictedAqi, lower: p.lowerBound, upper: p.upperBound })),
      ]
    : [];

  // Explainability: simple transparent feature-contribution estimate from current reading
  const explanation = current
    ? [
        { label: "PM2.5 level", value: Math.round((current.pm25 - 60) * 0.9) },
        { label: "Low wind speed", value: Math.round((8 - current.windSpeed) * 5) },
        { label: "Traffic intensity", value: Math.round((current.trafficIndex - 40) * 0.7) },
        { label: "Humidity", value: Math.round((current.humidity - 50) * 0.3) },
        { label: "Rainfall", value: current.rainfall > 0 ? -Math.round(current.rainfall * 4) : 0 },
      ]
    : [];
  const maxAbs = Math.max(1, ...explanation.map((e) => Math.abs(e.value)));

  return (
    <div>
      <TopBar title="AI Pollution Forecast" subtitle="Baseline statistical forecast — 6H to 7D horizon" />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="stat-label">Predicted AQI</p>
            <span className="text-xs text-slate-400">
              Forecast confidence: <span className="font-semibold text-cyan-400">{confidence}%</span>
            </span>
          </div>
          {loading ? (
            <div className="h-72 animate-pulse rounded-xl bg-white/5" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2330" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#22e0ea" fillOpacity={0.08} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#0a0e14" fillOpacity={1} />
                <Line type="monotone" dataKey="predicted" stroke="#22e0ea" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {points.map((p) => (
              <div key={p.horizonHours} className="rounded-lg bg-white/[0.03] p-3 text-center">
                <p className="stat-label">{horizonLabel(p.horizonHours)}</p>
                <p className="mt-1 text-lg font-bold text-slate-50">{p.predictedAqi}</p>
                <p className="text-[10px] text-slate-500">
                  {p.lowerBound}–{p.upperBound}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="stat-label mb-4">Why is AQI {current ? (current.aqi > 200 ? "high" : "at this level") : ""}?</p>
          <p className="mb-4 text-[11px] text-slate-500">Model Explanation — transparent feature contribution, not literal SHAP values.</p>
          <div className="space-y-3">
            {explanation.map((e) => {
              const width = (Math.abs(e.value) / maxAbs) * 100;
              const positive = e.value >= 0;
              return (
                <div key={e.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">{e.label}</span>
                    <span className={positive ? "text-red-400" : "text-emerald-400"}>
                      {positive ? "+" : ""}
                      {e.value}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5">
                    <div
                      className={`h-1.5 rounded-full ${positive ? "bg-red-400" : "bg-emerald-400"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
