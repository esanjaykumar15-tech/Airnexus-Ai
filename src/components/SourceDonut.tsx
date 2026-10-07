"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  Traffic: "#22e0ea",
  "Crop Burning": "#f97316",
  Industrial: "#a855f7",
  "Construction Dust": "#eab308",
  "Waste Burning": "#ef4444",
  Other: "#64748b",
};

export function SourceDonut({ data, onSelect, selected }: { data: { source: string; percent: number }[]; onSelect?: (s: string) => void; selected?: string | null }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="percent"
          nameKey="source"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          onClick={(d: any) => onSelect?.(d.source)}
          cursor="pointer"
        >
          {data.map((d) => (
            <Cell key={d.source} fill={COLORS[d.source] || "#64748b"} opacity={!selected || selected === d.source ? 1 : 0.35} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#0e131b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
          formatter={(v: number, name: string) => [`${v}%`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { COLORS as SOURCE_COLORS };
