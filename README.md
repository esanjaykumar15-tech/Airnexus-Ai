# 🌍 AIRNEXUS AI

**AI-Driven Pollution Source Identification, Forecasting & Policy Intelligence Platform for Delhi-NCR**

> "See the Source. Predict the Future. Simulate the Solution."

A working, interactive environmental intelligence dashboard — not a static mockup. Every number on screen comes from a real API route backed by a deterministic data engine; every button does something (navigates, computes, filters, or simulates).

---

## Honest scope note — read this first

This is a **complete, runnable demo-mode platform** covering the full user journey (Observe → Understand → Predict → Simulate → Decide). It is **not** a platform with trained ML models, a PostGIS database, or a separate FastAPI microservice — building those responsibly requires real historical data and infrastructure decisions only you can make. Here's exactly what's real vs. illustrative:

| Capability | What's actually implemented |
|---|---|
| Data | Deterministic, internally-correlated demo generator (seeded PRNG) — no hardcoded numbers, no external API dependency. Traffic→NO₂, wind→dispersion, rain→washout, fire+wind→transport are all modeled relationships, not random noise. |
| Forecast | A transparent **baseline** forecaster (recent trend + diurnal pattern + confidence widening with horizon). Labeled "Baseline Forecast" in the UI. Architected so a trained XGBoost/LSTM model can replace `lib/forecastEngine.ts` behind the same function signature. |
| Source Attribution | A transparent **heuristic** (traffic intensity, fire+wind alignment, SO₂/industrial proximity, PM10:PM2.5 dust ratio) — not a scientific source-apportionment model (CMB/PMF). Labeled "AI Estimated" everywhere, with per-source confidence and evidence. |
| Policy Simulator | A **real, live-computing** simulation: sliders proportionally reduce each source's PM2.5 contribution, bounded by a realistic background floor, then reconverted to AQI. Assumptions are disclosed in an expandable panel. This is genuinely interactive, not decorative. |
| AI Assistant | A **rule-based** assistant that reads real current/forecast/source/alert data for the selected location and answers accordingly (see `lib/aiAssistant.ts`). If you set `LLM_API_KEY`, `/api/ai/chat` has a clear hook point to route to a real LLM with the same context payload — not implemented by default, since that requires your own API key and provider choice. |
| Model Performance page metrics | `/api/model/metrics` returns explicitly-labeled **sample** MAE/RMSE/R² figures. These are not from an actually-trained model — swap this route once you train one. |
| Map | Real Leaflet map with live markers/popups/click-to-select, dark CARTO basemap. Layer *switching* is UI-functional (buttons highlight/state changes) but all layers currently render the same AQI-colored markers — wiring distinct visual layers per pollutant is a natural next step. |
| Database / Docker / FastAPI / PostGIS / tests | **Not included.** The app runs entirely as a single Next.js app (frontend + API routes) with zero external services required. This was a deliberate scope decision so the project is genuinely runnable with `npm install && npm run dev` — adding a real Postgres/PostGIS layer, a Python ML service, and Docker orchestration is a substantial follow-up project once you're ready to train real models on real data. |

Nothing here fabricates real-world scientific claims: source contributions, forecasts, and policy impacts are all explicitly labeled as model-based estimates in the UI and in a footer disclaimer, per the "no false precision" principle this kind of tool needs.

---

## Tech stack (as built)

- **Next.js 14** (App Router) + React + TypeScript
- **Tailwind CSS** — dark glassmorphism theme, no component library dependency
- **Recharts** — all charts (KPI sparklines, donut, area, scatter, composed)
- **Leaflet / react-leaflet** — interactive map
- **Framer Motion** — landing page animations
- **Lucide React** — icons

No database, no Docker, no separate backend required to run this. See "What's not included" above for the path to a fuller production architecture.

---

## Quick start

```bash
npm install
npm run dev
```

Visit **http://localhost:3000** — you'll land on the marketing page; click "Launch Dashboard" to enter AIRNEXUS AI.

No environment variables are required. The app runs entirely in **DEMO MODE** out of the box (you'll see a "● Demo Data" badge in the top bar).

### Production build

```bash
npm run build
npm start
```

---

## Project structure

```
airnexus-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           # Sidebar + location context
│   │   │   ├── page.tsx             # Overview (KPI cards, AQI gauge, quick actions)
│   │   │   ├── map/                 # Live Map (Leaflet)
│   │   │   ├── sources/             # Source Intelligence (donut, confidence, timeline)
│   │   │   ├── forecast/            # Forecast + explainability
│   │   │   ├── flow/                # Pollution Flow (wind/transport)
│   │   │   ├── policy/              # Policy Simulator (sliders, ranking, cost-vs-impact)
│   │   │   ├── exposure/            # Exposure Risk
│   │   │   ├── alerts/              # Early Warning System
│   │   │   ├── analytics/           # Historical Analytics
│   │   │   ├── assistant/           # AIRNEXUS Copilot chat UI
│   │   │   ├── data-sources/        # Data provenance + quality
│   │   │   └── settings/            # Preferences (demo: local state only)
│   │   └── api/                     # All REST endpoints (see below)
│   ├── components/                  # Reusable UI: KPICard, AqiGauge, SourceDonut, PolicySlider, Sidebar, TopBar...
│   └── lib/
│       ├── demoData.ts              # ⭐ Core deterministic data engine
│       ├── sourceAttribution.ts     # Heuristic source attribution
│       ├── forecastEngine.ts        # Baseline forecaster
│       ├── policySimulation.ts      # Policy simulation logic
│       ├── alertsEngine.ts          # Alert generation
│       ├── aiAssistant.ts           # Rule-based Copilot
│       ├── dataSources.ts           # Data provenance + industrial zones
│       └── types.ts                 # Shared domain types
├── .env.example
└── README.md
```

---

## API reference

All routes return JSON and handle errors gracefully (never throw a raw 500 to the client without a message).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/locations` | All 13 Delhi-NCR monitoring locations + current data mode |
| GET | `/api/air-quality/current?locationId=` | Current reading for a location (or regional average) |
| GET | `/api/air-quality/history?locationId=&hours=` | Historical hourly readings |
| GET | `/api/source-attribution?locationId=` | Estimated source contributions + evidence |
| GET | `/api/forecast?locationId=` | 6H–7D forecast with confidence intervals |
| POST | `/api/policy/simulate` | `{ locationId, sliders }` → simulated AQI + breakdown |
| GET | `/api/policy/scenarios?locationId=` | Preset scenario comparison + ranking |
| GET | `/api/alerts` | Active alerts across all locations |
| POST | `/api/ai/chat` | `{ question, locationId }` → context-grounded answer (rate-limited) |
| GET | `/api/data-sources` | Data provenance + quality metrics |
| GET | `/api/exposure-risk` | Population exposure risk by district |
| GET | `/api/industrial-zones` | Industrial risk zones |
| GET | `/api/model/metrics` | Sample model evaluation metrics (clearly labeled) |

---

## How the demo data engine works

`lib/demoData.ts` generates a reading for `(location, timestamp)` using a **seeded PRNG** (mulberry32, seeded from a hash of `locationId:hourBucket`). This means:

- The same location + hour always returns the same reading — no database needed, yet "historical" data is stable across requests.
- Variables are **correlated**, not independent noise: rush-hour traffic drives NO₂ and PM2.5 up; low night-time wind speed reduces dispersion and raises PM2.5; October/November gets a stubble-burning season boost tied to fire counts; rain events wash out particulates; regional fire activity only strongly influences PM2.5 when wind direction aligns with the Punjab/Haryana corridor (NW).

To move to **LIVE MODE**: set `AIR_QUALITY_API_KEY` (or any of the other provider keys) and replace the body of `getCurrentReading`/`getHistory` in `lib/demoData.ts` with real API/database calls, keeping the same return shape (`StationReading`). Nothing downstream — components, other lib files, API routes — needs to change, since they all consume this one module.

---

## Extending toward the full production vision

The original spec calls for PostGIS, a Python ML pipeline (XGBoost/LSTM + SHAP), a FastAPI service, and Docker orchestration. Suggested path once you're ready:

1. **Database**: stand up PostgreSQL (+ PostGIS extension), create tables mirroring `lib/types.ts` (locations, station readings, forecasts, alerts, policy scenarios), and swap `demoData.ts` to read/write there.
2. **Real ML**: build the `ml/forecasting` and `ml/attribution` pipelines in Python per the original spec's structure, train on real historical CPCB/state pollution board data, expose predictions via a FastAPI service, and point `forecastEngine.ts`/`sourceAttribution.ts` at it.
3. **Real SHAP explainability**: replace the transparent heuristic in the Forecast page's explainability panel with actual SHAP values from the trained model.
4. **LLM-powered Copilot**: implement the `LLM_API_KEY` branch in `/api/ai/chat`, passing the same `AssistantContext` object as system context to your LLM provider of choice.
5. **Docker**: containerize the Next.js app, the FastAPI service, and Postgres with a `docker-compose.yml`.
6. **Tests**: add API route tests (policy simulation bounds, forecast horizon shape) and component tests for critical interactions.

---

## Scientific disclaimer

AIRNEXUS AI provides model-based environmental analysis and decision-support insights. Source contributions, forecasts, and policy simulations are estimates and should not be interpreted as definitive causal attribution or official government guidance.
