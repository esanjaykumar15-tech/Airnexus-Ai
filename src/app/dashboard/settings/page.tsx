"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Save } from "lucide-react";

const MAP_LAYERS = ["AQI", "PM2.5", "PM10", "NO₂", "Traffic", "Fire Detection", "Industrial Areas"];

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [defaultLocation, setDefaultLocation] = useState("delhi-ncr");
  const [forecastHorizon, setForecastHorizon] = useState("24");
  const [alertThreshold, setAlertThreshold] = useState(300);
  const [enabledLayers, setEnabledLayers] = useState<string[]>(["AQI", "PM2.5"]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  function toggleLayer(l: string) {
    setEnabledLayers((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  function handleSave() {
    // Demo mode: persisted to component state only. In LIVE MODE this would
    // POST to a /api/settings endpoint and persist per-user in the database.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <TopBar title="Settings" subtitle="Configure your AIRNEXUS AI experience" />
      <div className="max-w-2xl space-y-6 p-6">
        <div className="glass-card p-6">
          <p className="stat-label mb-4">Appearance</p>
          <div className="flex gap-2">
            {["dark", "light"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${theme === t ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-slate-400"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Light theme is a placeholder toggle in this demo build — the UI is designed dark-first.</p>
        </div>

        <div className="glass-card p-6">
          <p className="stat-label mb-4">Defaults</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Default Location</label>
              <select value={defaultLocation} onChange={(e) => setDefaultLocation(e.target.value)} className="input-dark">
                <option value="delhi-ncr">Delhi NCR (All)</option>
                <option value="central-delhi">Central Delhi</option>
                <option value="noida">Noida</option>
                <option value="gurugram">Gurugram</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Default Forecast Horizon</label>
              <select value={forecastHorizon} onChange={(e) => setForecastHorizon(e.target.value)} className="input-dark">
                <option value="6">6 hours</option>
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
                <option value="168">7 days</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Alert Threshold (AQI ≥)</label>
              <input
                type="number"
                min={100}
                max={500}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="input-dark"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="stat-label mb-4">Default Map Layers</p>
          <div className="flex flex-wrap gap-2">
            {MAP_LAYERS.map((l) => (
              <button
                key={l}
                onClick={() => toggleLayer(l)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${enabledLayers.includes(l) ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-slate-400"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="stat-label mb-4">Notifications</p>
          <label className="flex items-center justify-between text-sm text-slate-300">
            Email me when an alert is triggered
            <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="h-4 w-4 accent-cyan-400" />
          </label>
        </div>

        <button onClick={handleSave} className="btn-primary gap-2">
          <Save size={15} /> {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
