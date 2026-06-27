# Scout — Web frontend (React)

A polished, AI-native analytics UI for Scout. Surfaces ranked **findings** (not raw
charts), visualizes the agent's investigation trail, and shows monitoring with the
same-weekday baseline. Talks to the Scout FastAPI backend over HTTP, with a **demo-data
fallback** so it runs standalone.

## Stack
React + TypeScript · Vite · Tailwind (CSS-variable design tokens) · Recharts ·
Framer Motion · lucide-react · React Router. Components are hand-rolled in the brief's
design language (no shadcn CLI dependency), so it builds anywhere.

## Run

```bash
cd web
npm install
cp .env.example .env.local     # optional; defaults to http://localhost:8000
npm run dev                    # http://localhost:5173
```

- With the **backend running** (`uvicorn scout.api.main:app --port 8000`, store
  `cortexium-sim`), the Findings Feed, Monitoring charts, and "Run investigation" button
  hit the real API.
- With **no backend**, every screen falls back to realistic mock data (the top bar shows
  "Demo data") so you can browse the whole product offline.

Config: `VITE_API_URL` (backend base URL), `VITE_STORE_ID` (which store to show).

## Pages
- **Findings** (`/`) — hero trust number + KPIs + ranked findings feed.
- **Finding detail** (`/findings/:id`) — recommended action + the investigation trail
  (hypotheses, evidence for/against, confirmed cause) as a step-by-step timeline.
- **Monitoring** (`/monitoring`) — revenue vs same-weekday baseline band, inventory risk.
- **Investigations** (`/investigations`) — sortable run history with drill-down.
- **Connections** (`/settings`) — store status, Slack/email, detection thresholds.

## Design system
- Dark-mode-first; both themes tuned independently via CSS variables (`src/index.css`),
  toggle in the top bar. Tokens surfaced to Tailwind in `tailwind.config.ts`.
- Functional color only — every status is **icon + label**, never color alone
  (colorblind-safe). Categorical palette leans on blue↔orange / purple↔teal pairs.
- Purposeful motion (page transitions, staggered cards, count-up KPIs, draw-in charts,
  step-by-step reasoning reveal); all respects `prefers-reduced-motion`.
- Loading = skeletons (no layout shift); every data view has an empty state.

This is the richer alternative to the simple Streamlit dashboard in `../frontend/`.
