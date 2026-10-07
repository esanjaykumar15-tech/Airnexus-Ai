"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  unit?: string;
  status?: string;
  statusColor?: string;
  changePercent?: number;
  sparkline?: number[];
  icon?: LucideIcon;
}

export function KPICard({ label, value, unit, status, statusColor, changePercent, sparkline, icon: Icon }: KPICardProps) {
  const data = (sparkline || []).map((v, i) => ({ i, v }));
  const rising = (changePercent ?? 0) >= 0;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <p className="stat-label">{label}</p>
        {Icon && <Icon size={16} className="text-slate-500" />}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-50">
            {value}
            {unit && <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {status && (
              <span className="text-xs font-semibold" style={{ color: statusColor || "#94a3b8" }}>
                {status}
              </span>
            )}
            {changePercent !== undefined && (
              <span className={`text-xs font-medium ${rising ? "text-red-400" : "text-emerald-400"}`}>
                {rising ? "↑" : "↓"} {Math.abs(changePercent).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {data.length > 1 && (
          <div className="h-10 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="v" stroke={rising ? "#f97316" : "#22e0ea"} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
