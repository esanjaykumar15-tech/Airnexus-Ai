"use client";

import { useEffect, useState, useCallback } from "react";
import { TopBar } from "@/components/TopBar";
import { PolicySlider } from "@/components/PolicySlider";
import { useLocationContext } from "@/lib/locationContext";
import { PolicySliders, PolicySimulationResult } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";

const DEFAULT: PolicySliders = {
  trafficReduction: 20,
  industrialReduction: 10,
  constructionReduction: 30,
  cropBurningReduction: 50,
  wasteBurningReduction: 20,
};

// Illustrative cost/difficulty weights per policy for the cost-vs-impact chart (demo assumption, disclosed in UI)
const COST_WEIGHTS: Record<keyof PolicySliders, number> = {
  trafficReduction: 55,
  industrialReduction: 70,
  constructionReduction: 40,
  cropBurningReduction: 85,
  wasteBurningReduction: 30,
};

const LABELS: Record<keyof PolicySliders, string> = {
  trafficReduction: "Traffic Reduction",
  industrialReduction: "Industrial Emission Reduction",
  constructionReduction: "Construction Activity Reduction",
  cropBurningReduction: "Crop Burning Reduction",
  wasteBurningReduction: "Waste Burning Reduction",
};

export default function PolicySimulatorPage() {
  const { locationId } = useLocationContext();
  const [sliders, setSliders] = useState<PolicySliders>(DEFAULT);
  const [result, setResult] = useState<PolicySimulationResult | null>(null);
  const [scenarios, setScenarios] = useState<any>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSimulation = useCallback(
    (s: PolicySliders) => {
      setLoading(true);
      fetch("/api/policy/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId, sliders: s }),
      })
        .then((r) => r.json())
        .then((d) => setResult(d.result))
        .finally(() => setLoading(false));
    },
    [locationId]
  );

  useEffect(() => {
    runSimulation(sliders);
    fetch(`/api/policy/scenarios?locationId=${locationId}`)
      .then((r) => r.json())
      .then(setScenarios);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  function updateSlider(key: keyof PolicySliders, value: number) {
    const next = { ...sliders, [key]: value };
    setSliders(next);
    runSimulation(next);
  }

  const costImpactData = scenarios?.ranked?.map((r: any, i: number) => ({
    name: r.name,
    cost: Object.values(COST_WEIGHTS)[i % 5],
    impact: r.improvement,
  }));

  return (
    <div>
      <TopBar title="Policy Impact Simulator" subtitle="What happens if we change the system?" />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-1">
          <p className="stat-label mb-5">Adjust Policies</p>
          <div className="space-y-5">
            <PolicySlider label="Traffic Reduction" value={sliders.trafficReduction} onChange={(v) => updateSlider("trafficReduction", v)} color="#22e0ea" />
            <PolicySlider label="Industrial Emission Reduction" value={sliders.industrialReduction} onChange={(v) => updateSlider("industrialReduction", v)} color="#a855f7" />
            <PolicySlider label="Construction Activity Reduction" value={sliders.constructionReduction} onChange={(v) => updateSlider("constructionReduction", v)} color="#eab308" />
            <PolicySlider label="Crop Burning Reduction" value={sliders.cropBurningReduction} onChange={(v) => updateSlider("cropBurningReduction", v)} color="#f97316" />
            <PolicySlider label="Waste Burning Reduction" value={sliders.wasteBurningReduction} onChange={(v) => updateSlider("wasteBurningReduction", v)} color="#ef4444" />
          </div>
          <button onClick={() => { setSliders(DEFAULT); runSimulation(DEFAULT); }} className="btn-secondary mt-6 w-full text-xs">
            Reset to Default Scenario
          </button>
        </div>

        <div className="glass-card-glow p-6 lg:col-span-2">
          <p className="stat-label mb-4">Simulated Outcome</p>
          {result ? (
            <>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-slate-300">{result.currentAqi}</p>
                  <p className="stat-label mt-1">Current AQI</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-cyan-400">{result.simulatedAqi}</p>
                  <p className="stat-label mt-1">Simulated AQI</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">{result.improvementPercent}%</p>
                  <p className="stat-label mt-1">Potential Improvement</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold text-slate-300">PM2.5 Contribution Before / After</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.breakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1b2330" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis type="category" dataKey="source" stroke="#64748b" fontSize={10} width={110} />
                    <Tooltip contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="before" fill="#37455a" name="Before" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="after" fill="#22e0ea" name="After" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <button onClick={() => setShowAssumptions((v) => !v)} className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
                {showAssumptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Simulation assumptions
              </button>
              {showAssumptions && (
                <ul className="mt-2 space-y-1 rounded-lg bg-white/5 p-3 text-[11px] text-slate-500">
                  {result.assumptions.map((a) => (
                    <li key={a}>• {a}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">{loading ? "Simulating…" : "Adjust sliders to run a simulation."}</p>
          )}
        </div>

        {scenarios && (
          <>
            <div className="glass-card p-6 lg:col-span-2">
              <p className="stat-label mb-4">Scenario Comparison</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">Scenario</th>
                    <th className="pb-2 font-medium">Predicted AQI</th>
                    <th className="pb-2 font-medium">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.rows.map((r: any) => (
                    <tr key={r.name} className="border-b border-white/5 last:border-0">
                      <td className="py-2 text-slate-300">{r.name}</td>
                      <td className="py-2 font-semibold text-slate-100">{r.predictedAqi}</td>
                      <td className="py-2 text-emerald-400">{r.improvement > 0 ? `${r.improvement}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="glass-card p-6 lg:col-span-1">
              <p className="stat-label mb-4">Policy Impact Ranking</p>
              <div className="space-y-3">
                {scenarios.ranked.map((r: any) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/15 text-xs font-bold text-cyan-300">
                      {String(r.rank).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-200">{r.name}</p>
                      <p className="text-[10px] text-slate-500">Estimated impact: {r.improvement > 15 ? "HIGH" : r.improvement > 7 ? "MEDIUM" : "LOW"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 lg:col-span-3">
              <p className="stat-label mb-1">Policy Cost vs. Impact</p>
              <p className="mb-4 text-[11px] text-slate-500">
                Cost axis uses illustrative implementation-difficulty weights (demo assumption) — not verified government budget figures.
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2330" />
                  <XAxis type="number" dataKey="cost" name="Implementation Cost" stroke="#64748b" fontSize={10} />
                  <YAxis type="number" dataKey="impact" name="Pollution Reduction %" stroke="#64748b" fontSize={10} />
                  <ZAxis range={[100, 100]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, name: string) => [name === "Implementation Cost" ? v : `${v}%`, name]}
                  />
                  <Scatter data={costImpactData} fill="#22e0ea" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
