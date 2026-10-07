"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Database, CheckCircle2 } from "lucide-react";

interface Source {
  name: string;
  category: string;
  status: "connected" | "demo" | "unavailable";
  records: number;
  lastSync: string;
}

const STATUS_STYLE: Record<string, string> = {
  connected: "text-emerald-400 bg-emerald-500/15",
  demo: "text-cyan-400 bg-cyan-500/15",
  unavailable: "text-red-400 bg-red-500/15",
};

export default function DataSourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [quality, setQuality] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data-sources")
      .then((r) => r.json())
      .then((d) => {
        setSources(d.sources);
        setQuality(d.quality);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="Data Sources" subtitle="Transparent data provenance across every input feeding AIRNEXUS AI" />
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sources.map((s) => (
                <div key={s.name} className="glass-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-slate-500" />
                      <p className="text-sm font-semibold text-slate-100">{s.name}</p>
                    </div>
                    <span className={`badge ${STATUS_STYLE[s.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {s.status === "connected" ? "Connected" : s.status === "demo" ? "Demo Source" : "Unavailable"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{s.category}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-slate-500">Records</p>
                      <p className="font-semibold text-slate-200">{s.records.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500">Last sync</p>
                      <p className="font-semibold text-slate-200">{new Date(s.lastSync).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {quality && (
              <div className="glass-card mt-6 p-6">
                <p className="stat-label mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Data Quality
                </p>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {Object.entries(quality).map(([key, value]) => (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="capitalize text-slate-400">{key}</span>
                        <span className="text-slate-200">{value}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5">
                        <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
