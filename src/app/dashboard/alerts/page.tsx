"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { AlertTriangle } from "lucide-react";
import { Alert } from "@/lib/types";

const SEVERITY_COLOR: Record<string, string> = {
  moderate: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="Pollution Alerts" subtitle="Early warning system, computed from current conditions and forecast" />
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-slate-400">No active alerts across Delhi-NCR right now.</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((a) => {
              const color = SEVERITY_COLOR[a.severity];
              return (
                <div key={a.id} className="glass-card border-l-2 p-5" style={{ borderLeftColor: color }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} style={{ color }} />
                      <p className="text-sm font-bold uppercase tracking-wide" style={{ color }}>
                        {a.type}
                      </p>
                    </div>
                    <span className="badge" style={{ backgroundColor: `${color}22`, color }}>
                      {a.severity}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                      <p className="stat-label">Location</p>
                      <p className="text-slate-200">{a.locationName}</p>
                    </div>
                    <div>
                      <p className="stat-label">Expected Window</p>
                      <p className="text-slate-200">
                        {new Date(a.windowStart).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="stat-label">Predicted AQI</p>
                      <p className="text-slate-200">{a.predictedAqi}</p>
                    </div>
                    <div>
                      <p className="stat-label">Confidence</p>
                      <p className="text-slate-200">{a.confidence}%</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="stat-label mb-1">Likely Factors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.factors.map((f) => (
                        <span key={f} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
