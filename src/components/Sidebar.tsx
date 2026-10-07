"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Map,
  Radar,
  TrendingUp,
  Wind,
  Sliders,
  ShieldAlert,
  Bell,
  BarChart3,
  Bot,
  Database,
  Settings,
  Satellite,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/map", label: "Live Map", icon: Map },
      { href: "/dashboard/sources", label: "Source Intelligence", icon: Radar },
      { href: "/dashboard/forecast", label: "Forecast", icon: TrendingUp },
      { href: "/dashboard/flow", label: "Pollution Flow", icon: Wind },
      { href: "/dashboard/policy", label: "Policy Simulator", icon: Sliders },
      { href: "/dashboard/exposure", label: "Exposure Risk", icon: ShieldAlert },
      { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/assistant", label: "AI Assistant", icon: Bot },
      { href: "/dashboard/data-sources", label: "Data Sources", icon: Database },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-void-900/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400">
          <Satellite size={18} className="text-void-950" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-slate-50">AIRNEXUS AI</p>
          <p className="text-[10px] text-slate-500">Environmental Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS[0].items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active ? "bg-cyan-500/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-4 py-4">
        <p className="stat-label mb-2">System Status</p>
        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Data Engine Online
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> AI Engine Online
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Forecast Engine Online
          </div>
        </div>
      </div>
    </aside>
  );
}
