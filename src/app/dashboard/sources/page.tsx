"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SourceDonut, SOURCE_COLORS } from "@/components/SourceDonut";
import { useLocationContext } from "@/lib/locationContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SourceRow {
  source: string;
  percent: number;
  confidence: number;
  trend: number;
  evidence: string[];
}

export default function SourceIntelligencePage() {
  const { locationId } = useLocationContext();
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [timelineWindow, setTimelineWindow] = useState<"6H" | "24H" | "7D">("24H");
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/source-attribution?locationId=${locationId}`)
      .then((r) => r.json())
      .then((d) => {
        setSources(d.sources || []);
        setSelected(null);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  useEffect(() => {
    const hours = timelineWindow === "6H" ? 6 : timelineWindow === "24H" ? 24 : 168;
    const step = timelineWindow === "7D" ? 6 : 1;
    fetch(`/api/air-quality/history?locationId=${locationId === "delhi-ncr" ? "central-delhi" : locationId}&hours=${hours}`)
      .then((r) => r.json())
      .then((d) => {
        const history = (d.history || []).filter((_: any, i: number) => i % step === 0);
        // Derive a rough per-point source split proportional to the same signals used server-side,
        // just for timeline visualization (illustrative trend shape, not a new model).
        const rows = history.map((h: any) => {
          const traffic = Math.round((h.trafficIndex / 100) * 34);
          const crop = Math.round(Math.min(30, (h.fireCount / 40) * 32));
          const industrial = Math.round((h.so2 / 20) * 20);
          const dust = Math.round(Math.min(20, (h.pm10 / (h.pm25 * 2.2)) * 20));
          const waste = Math.round(8 + h.co);
          return {
            time: new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            Traffic: traffic,
            "Crop Burning": crop,
            Industrial: industrial,
            "Construction Dust": dust,
            "Waste Burning": Math.min(15, waste),
          };
        });
        setTimeline(rows);
      });
  }, [locationId, timelineWindow]);

  const selectedRow = sources.find((s) => s.source === selected);

  return (
    <div>
      <TopBar title="Source Intelligence" subtitle="AI-estimated pollution source contributions" />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-1">
          <p className="stat-label mb-4">Estimated Pollution Sources</p>
          {loading ? (
            <div className="h-64 animate-pulse rounded-xl bg-white/5" />
          ) : (
            <>
              <SourceDonut data={sources} onSelect={setSelected} selected={selected} />
              <div className="mt-4 space-y-2">
                {sources.map((s) => (
                  <button
                    key={s.source}
                    onClick={() => setSelected(s.source)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.source] }} />
                      {s.source}
                    </span>
                    <span className="font-semibold text-slate-100">{s.percent}%</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <p className="stat-label mb-4">{selectedRow ? selectedRow.source : "Select a source"}</p>
          {selectedRow ? (
            <div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-slate-50">{selectedRow.percent}%</p>
                  <p className="stat-label mt-1">Estimated Contribution</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-cyan-400">{selectedRow.confidence}%</p>
                  <p className="stat-label mt-1">Confidence</p>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${selectedRow.trend >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {selectedRow.trend >= 0 ? "+" : ""}
                    {selectedRow.trend}%
                  </p>
                  <p className="stat-label mt-1">Trend</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold text-slate-300">Evidence</p>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {selectedRow.evidence.map((e) => (
                    <li key={e} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-400">✓</span> {e}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-6 rounded-lg bg-white/5 p-3 text-[11px] text-slate-500">
                Model estimates elevated {selectedRow.source.toLowerCase()} contribution based on the evidence above. This is a
                probabilistic estimate, not a confirmed causal attribution.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Click a source in the donut chart or list to see confidence, evidence, and trend.</p>
          )}
        </div>

        <div className="glass-card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="stat-label">Source Contribution Timeline</p>
            <div className="flex gap-1">
              {(["6H", "24H", "7D"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setTimelineWindow(w)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${timelineWindow === w ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-white/5"}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2330" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              {Object.keys(SOURCE_COLORS)
                .filter((k) => k !== "Other")
                .map((key) => (
                  <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={SOURCE_COLORS[key]} fill={SOURCE_COLORS[key]} fillOpacity={0.5} />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
