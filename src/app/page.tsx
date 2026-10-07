"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Radar, TrendingUp, Sliders, Wind, ShieldAlert } from "lucide-react";

const FEATURES = [
  { icon: Radar, title: "Source Attribution", desc: "Estimated pollution source contributions with confidence scoring and evidence." },
  { icon: TrendingUp, title: "Forecasting", desc: "6h to 7-day AQI forecasts with confidence intervals." },
  { icon: Sliders, title: "Policy Simulation", desc: "Model the impact of traffic, industrial, and crop-burning interventions." },
  { icon: Wind, title: "Pollution Flow", desc: "Wind-driven regional pollution transport visualization." },
  { icon: ShieldAlert, title: "Exposure Intelligence", desc: "Population exposure risk mapped across Delhi-NCR districts." },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          AI-Driven Environmental Intelligence for Delhi-NCR
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-6xl"
        >
          SEE THE SOURCE.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">PREDICT THE FUTURE.</span>
          <br />
          SIMULATE THE SOLUTION.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base text-slate-400"
        >
          AIRNEXUS AI doesn&apos;t just show today&apos;s AQI. It estimates probable pollution sources, forecasts what&apos;s coming, and
          simulates which interventions could have the greatest impact.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex justify-center gap-4">
          <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">
            Launch Dashboard <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="mt-24 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="glass-card p-5"
            >
              <Icon size={20} className="text-cyan-400" />
              <p className="mt-3 text-sm font-semibold text-slate-100">{title}</p>
              <p className="mt-1 text-xs text-slate-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <footer className="relative border-t border-white/5 py-6 text-center text-xs text-slate-500">
        AIRNEXUS AI provides model-based environmental analysis and decision-support insights. Estimates should not be interpreted as
        definitive causal attribution or official government guidance.
      </footer>
    </main>
  );
}
