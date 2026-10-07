"use client";

import { useEffect, useState } from "react";
import { useLocationContext } from "@/lib/locationContext";
import { DataModeBadge } from "@/components/Badges";

const LOCATION_OPTIONS = [
  { id: "delhi-ncr", name: "Delhi NCR (All)" },
  { id: "central-delhi", name: "Central Delhi" },
  { id: "anand-vihar", name: "Anand Vihar" },
  { id: "rohini", name: "Rohini" },
  { id: "dwarka", name: "Dwarka" },
  { id: "noida", name: "Noida" },
  { id: "ghaziabad", name: "Ghaziabad" },
  { id: "gurugram", name: "Gurugram" },
  { id: "faridabad", name: "Faridabad" },
];

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { locationId, setLocationId } = useLocationContext();
  const [now, setNow] = useState<string>("");
  const [dataMode, setDataMode] = useState<"live" | "demo">("demo");

  useEffect(() => {
    setNow(new Date().toLocaleString());
    fetch("/api/locations")
      .then((r) => r.json())
      .then((d) => setDataMode(d.dataMode))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-50">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        <p className="mt-1 text-xs text-slate-500">Last updated: {now}</p>
      </div>
      <div className="flex items-center gap-3">
        <DataModeBadge mode={dataMode} />
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="input-dark w-48 py-1.5 text-xs"
        >
          {LOCATION_OPTIONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
