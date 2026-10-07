"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Users, ShieldAlert, TriangleAlert } from "lucide-react";

interface ExposureZone {
  locationId: string;
  locationName: string;
  aqi: number;
  aqiCategory: string;
  riskLevel: string;
  estimatedExposedPopulation: number;
}

const RISK_COLOR: Record<string, string> = {
  Low: "#22c55e",
  Moderate: "#84cc16",
  High: "#f97316",
  "Very High": "#ef4444",
  Critical: "#b91c1c",
};

export default function ExposureRiskPage() {
  const [zones, setZones] = useState<ExposureZone[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exposure-risk")
      .then((r) => r.json())
      .then((d) => {
        setZones(d.zones);
        setSummary(d.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="Exposure Intelligence" subtitle="Estimated population exposure risk across Delhi-NCR" />
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="glass-card flex items-center gap-4 p-5">
                <Users size={22} className="text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold text-slate-50">{(summary.totalEstimatedExposedPopulation / 1_000_000).toFixed(1)}M</p>
                  <p className="stat-label mt-1">Estimated Population Exposure</p>
                </div>
              </div>
              <div className="glass-card flex items-center gap-4 p-5">
                <ShieldAlert size={22} className="text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-slate-50">{summary.highExposureAreas}</p>
                  <p className="stat-label mt-1">High Exposure Areas</p>
                </div>
              </div>
              <div className="glass-card flex items-center gap-4 p-5">
                <TriangleAlert size={22} className="text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-slate-50">{summary.criticalExposureZones}</p>
                  <p className="stat-label mt-1">Critical Exposure Zones</p>
                </div>
              </div>
            </div>

            <div className="glass-card mt-6 overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-left text-xs text-slate-500">
                    <th className="px-4 py-3 font-medium">District</th>
                    <th className="px-4 py-3 font-medium">AQI</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Est. Exposed Population</th>
                    <th className="px-4 py-3 font-medium">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z) => (
                    <tr key={z.locationId} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 text-slate-200">{z.locationName}</td>
                      <td className="px-4 py-3 text-slate-300">{z.aqi}</td>
                      <td className="px-4 py-3 text-slate-400">{z.aqiCategory}</td>
                      <td className="px-4 py-3 text-slate-300">{z.estimatedExposedPopulation.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="badge" style={{ backgroundColor: `${RISK_COLOR[z.riskLevel]}22`, color: RISK_COLOR[z.riskLevel] }}>
                          {z.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Exposure figures are estimated from population density and current AQI severity — a decision-support proxy, not
              epidemiological measurement.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
