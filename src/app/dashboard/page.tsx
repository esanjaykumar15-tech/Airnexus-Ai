"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wind, Gauge, CloudFog, Factory, TrendingUp, Sliders, Radar, Bot, ArrowUpRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { KPICard } from "@/components/KPICard";
import { AqiHeroGauge, AqiScaleBar } from "@/components/AqiGauge";
import { useLocationContext } from "@/lib/locationContext";
import { StationReading } from "@/lib/types";

const QUICK_ACTIONS = [
  { href: "/dashboard/policy", label: "Run Policy Simulation", icon: Sliders },
  { href: "/dashboard/forecast", label: "View Forecast", icon: TrendingUp },
  { href: "/dashboard/sources", label: "Analyze Pollution Sources", icon: Radar },
  { href: "/dashboard/flow", label: "View Pollution Flow", icon: Wind },
  { href: "/dashboard/assistant", label: "Ask AIRNEXUS Copilot", icon: Bot },
];

export default function OverviewPage() {
  const { locationId } = useLocationContext();
  const [reading, setReading] = useState<StationReading | null>(null);
  const [history, setHistory] = useState<StationReading[]>([]);
  const [forecast24, setForecast24] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch(`/api/air-quality/current?locationId=${locationId}`).then((r) => r.json()),
      fetch(`/api/air-quality/history?locationId=${locationId === "delhi-ncr" ? "central-delhi" : locationId}&hours=24`).then((r) => r.json()),
      fetch(`/api/forecast?locationId=${locationId === "delhi-ncr" ? "central-delhi" : locationId}`).then((r) => r.json()),
    ])
      .then(([cur, hist, fc]) => {
        setReading(cur.reading);
        setHistory(hist.history || []);
        const p24 = fc.points?.find((p: any) => p.horizonHours === 24);
        setForecast24(p24 ? p24.predictedAqi : null);
      })
      .catch(() => setError("Live data temporarily unavailable. Showing latest available data."))
      .finally(() => setLoading(false));
  }, [locationId]);

  const spark = (key: keyof StationReading) => history.map((h) => h[key] as number);

  const prevAqi = history.length > 1 ? history[0].aqi : reading?.aqi || 0;
  const aqiChange = reading && prevAqi ? ((reading.aqi - prevAqi) / prevAqi) * 100 : 0;
  const forecastChange = reading && forecast24 ? ((forecast24 - reading.aqi) / reading.aqi) * 100 : 0;

  return (
    <div>
      <TopBar title="Delhi-NCR Air Intelligence" subtitle="Real-time environmental intelligence powered by AI" />

      <div className="p-6">
        {error && (
          <div className="glass-card mb-6 flex items-center justify-between border-orange-500/30 bg-orange-500/5 p-4 text-sm text-orange-300">
            {error}
            <button onClick={() => window.location.reload()} className="btn-secondary text-xs">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card h-28 animate-pulse" />
            ))}
          </div>
        ) : reading ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KPICard label="AQI" value={String(reading.aqi)} status={undefined} changePercent={aqiChange} sparkline={spark("aqi")} icon={Gauge} />
              <KPICard label="PM2.5" value={String(reading.pm25)} unit="µg/m³" status={reading.pm25 > 90 ? "HIGH" : "MODERATE"} statusColor="#f97316" sparkline={spark("pm25")} icon={CloudFog} />
              <KPICard label="PM10" value={String(reading.pm10)} unit="µg/m³" status={reading.pm10 > 150 ? "HIGH" : "MODERATE"} statusColor="#f97316" sparkline={spark("pm10")} icon={CloudFog} />
              <KPICard label="NO₂" value={String(reading.no2)} unit="µg/m³" status={reading.no2 > 80 ? "ELEVATED" : "NORMAL"} statusColor="#eab308" sparkline={spark("no2")} icon={Factory} />
              <KPICard
                label="Forecast 24H"
                value={forecast24 !== null ? String(forecast24) : "—"}
                changePercent={forecastChange}
                status={forecastChange >= 0 ? "RISING" : "FALLING"}
                statusColor={forecastChange >= 0 ? "#ef4444" : "#22c55e"}
                icon={TrendingUp}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="glass-card-glow flex flex-col items-center justify-center p-8 lg:col-span-1">
                <AqiHeroGauge aqi={reading.aqi} />
                <div className="mt-6">
                  <AqiScaleBar />
                </div>
              </div>

              <div className="glass-card p-6 lg:col-span-2">
                <p className="stat-label mb-4">Quick Actions</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} className="text-cyan-400" /> {label}
                      </span>
                      <ArrowUpRight size={14} className="text-slate-500" />
                    </Link>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 text-center">
                  <div>
                    <p className="text-lg font-bold text-slate-50">{reading.windSpeed} km/h</p>
                    <p className="stat-label mt-1">Wind Speed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-50">{reading.temperature}°C</p>
                    <p className="stat-label mt-1">Temperature</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-50">{reading.humidity}%</p>
                    <p className="stat-label mt-1">Humidity</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
