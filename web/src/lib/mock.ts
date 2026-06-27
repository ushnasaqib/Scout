import type {
  Finding,
  InventoryLevel,
  InvestigationRun,
  Kpi,
  RevenuePoint,
} from "./types";

const iso = (daysAgo: number, h = 14): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const WEEKDAY_BASE = [900, 1000, 950, 1000, 1200, 700, 600]; // Mon..Sun

/** ~42 days of revenue with a weekly pattern + a stockout dip on the most recent Tuesday. */
export function mockRevenue(days = 42): RevenuePoint[] {
  const out: RevenuePoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const wd = (d.getDay() + 6) % 7; // 0=Mon
    const jitter = (((d.getTime() / 8.64e7) | 0) % 7) - 3;
    let value = WEEKDAY_BASE[wd] + jitter * 12;
    if (i === 0 || (wd === 1 && i <= 2)) {
      /* keep recent realistic */
    }
    out.push({ date: d.toISOString().slice(0, 10), value, baseline: null, weekday: wd });
  }
  // incident: most recent Tuesday down ~18%
  const lastTue = [...out].reverse().find((p) => p.weekday === 1);
  if (lastTue) lastTue.value = Math.round(WEEKDAY_BASE[1] * 0.82);
  // same-weekday baseline = median of prior 5 same weekdays
  out.forEach((p, idx) => {
    const priors = out
      .slice(0, idx)
      .filter((q) => q.weekday === p.weekday)
      .slice(-5)
      .map((q) => q.value)
      .sort((a, b) => a - b);
    p.baseline = priors.length ? priors[Math.floor(priors.length / 2)] : null;
  });
  return out;
}

const sparkFrom = (baseline: number, observed: number): number[] => {
  const base = Array.from({ length: 11 }, (_, i) => baseline * (0.96 + 0.01 * Math.sin(i)));
  base.push(observed);
  return base.map((n) => Math.round(n));
};

export const mockFindings: Finding[] = [
  {
    id: 3,
    store_id: "cortexium",
    headline:
      "Revenue dropped 18% Tuesday vs your last 5 Tuesdays — your top SKU (Black Tee) went out of stock at 2pm.",
    confirmed_cause: "STOCKOUT",
    confidence: 0.9,
    recommended_action:
      "Restock Black Tee now, and reorder Grey Tee too — it's ~3 days from its own stockout at current velocity (3.1/day).",
    created_at: iso(0, 15),
    llm_mode: "groq",
    inconclusive: false,
    spark: sparkFrom(1011, 804),
    anomaly: {
      store_id: "cortexium",
      metric: "revenue",
      observed_value: 804,
      baseline: 1011,
      deviation_pct: -18.1,
      robust_z: -4.92,
      weekday: "Tuesday",
      comparison_window: ["2026-06-16", "2026-06-09", "2026-06-02", "2026-05-26", "2026-05-19"],
      score: 4.92,
      date: "2026-06-23",
    },
    evidence: [
      { tool: "get_inventory_events", result_summary: "Black Tee hit 0 units at 14:00 on Jun 23", supports: true },
      { tool: "get_order_velocity", result_summary: "Black Tee averaged 8.5 units/day before the stockout", supports: true },
      { tool: "get_orders", result_summary: "vs Jun 16, Black Tee lost $175 = 100% of the day's revenue gap", supports: true },
      { tool: "get_orders", result_summary: "0/17 orders refunded (0%)", supports: false },
    ],
    investigated: [
      {
        hypothesis: { cause_type: "STOCKOUT", rationale: "A like-for-like weekday drop often traces to a top SKU going out of stock." },
        verdict: "CONFIRMED",
        confidence: 0.9,
        evidence: [
          { tool: "get_inventory_events", result_summary: "Black Tee hit 0 units at 14:00 on Jun 23", supports: true },
          { tool: "get_order_velocity", result_summary: "8.5 units/day before stockout", supports: true },
        ],
      },
      {
        hypothesis: { cause_type: "SINGLE_SKU_DRIVER", rationale: "A concentrated drop suggests one SKU drove most of the gap." },
        verdict: "CONFIRMED",
        confidence: 0.95,
        evidence: [{ tool: "get_orders", result_summary: "Black Tee = 100% of the revenue gap vs Jun 16", supports: true }],
      },
      {
        hypothesis: { cause_type: "ORDER_VELOCITY_DROP", rationale: "Fewer units of a key SKU lowers revenue." },
        verdict: "CONFIRMED",
        confidence: 0.5,
        evidence: [{ tool: "get_orders", result_summary: "Black Tee sold 7 vs 14 units (50% drop)", supports: true }],
      },
      {
        hypothesis: { cause_type: "RETURN_SPIKE", rationale: "A burst of refunds could depress net revenue." },
        verdict: "REFUTED",
        confidence: 0.2,
        evidence: [{ tool: "get_orders", result_summary: "0/17 orders refunded", supports: false }],
      },
    ],
  },
  {
    id: 2,
    store_id: "cortexium",
    headline:
      "Returns on “Premium Merino Wool Quarter-Zip Pullover — Heather Charcoal / XL” spiked to 22% Saturday.",
    confirmed_cause: "RETURN_SPIKE",
    confidence: 0.74,
    recommended_action:
      "Review sizing/photos for the Quarter-Zip — its return rate is 3.4× the store average this week.",
    created_at: iso(2, 11),
    llm_mode: "groq",
    inconclusive: false,
    spark: sparkFrom(420, 540),
    anomaly: {
      store_id: "cortexium",
      metric: "returns",
      observed_value: 540,
      baseline: 420,
      deviation_pct: 28.6,
      robust_z: 3.7,
      weekday: "Saturday",
      comparison_window: ["2026-06-20", "2026-06-13", "2026-06-06", "2026-05-30"],
      score: 3.7,
      date: "2026-06-27",
    },
    evidence: [
      { tool: "get_orders", result_summary: "11/50 Saturday orders refunded (22%) vs 6.5% baseline", supports: true },
      { tool: "get_product_metrics", result_summary: "Quarter-Zip return rate 3.4× store average", supports: true },
    ],
    investigated: [
      {
        hypothesis: { cause_type: "RETURN_SPIKE", rationale: "Refund rate far above the same-weekday baseline." },
        verdict: "CONFIRMED",
        confidence: 0.74,
        evidence: [{ tool: "get_orders", result_summary: "22% vs 6.5% baseline", supports: true }],
      },
    ],
  },
  {
    id: 1,
    store_id: "cortexium",
    headline:
      "Revenue was up 0% Sunday vs your last 4 Sundays — no single cause from the taxonomy was confirmed.",
    confirmed_cause: null,
    confidence: 0.2,
    recommended_action: "Review the day's orders and inventory manually.",
    created_at: iso(4, 9),
    llm_mode: "stub",
    inconclusive: true,
    spark: sparkFrom(600, 599),
    anomaly: {
      store_id: "cortexium",
      metric: "revenue",
      observed_value: 599,
      baseline: 600,
      deviation_pct: -0.2,
      robust_z: -0.3,
      weekday: "Sunday",
      comparison_window: ["2026-06-21", "2026-06-14", "2026-06-07"],
      score: 0.3,
      date: "2026-06-28",
    },
    evidence: [
      { tool: "get_orders", result_summary: "No SKU explained more than 12% of any gap", supports: null },
      { tool: "(none)", result_summary: "Fulfillment timing not captured in v1 — cannot confirm/refute", supports: null },
    ],
    investigated: [
      {
        hypothesis: { cause_type: "SINGLE_SKU_DRIVER", rationale: "Checked whether one SKU drove the move." },
        verdict: "REFUTED",
        confidence: 0.2,
        evidence: [{ tool: "get_orders", result_summary: "No dominant SKU", supports: false }],
      },
      {
        hypothesis: { cause_type: "FULFILLMENT_DELAY", rationale: "Fulfillment timing not captured in v1." },
        verdict: "INCONCLUSIVE",
        confidence: 0,
        evidence: [{ tool: "(none)", result_summary: "No fulfillment data", supports: null }],
      },
    ],
  },
];

export const mockInventory: InventoryLevel[] = [
  { sku: "TEE-BLK-M", title: "Black Tee", available: 0, daysLeft: 0 },
  { sku: "TEE-GRY-M", title: "Grey Tee", available: 10, daysLeft: 3 },
  { sku: "HOOD-BLK-L", title: "Black Hoodie", available: 40, daysLeft: 11 },
  { sku: "QZ-MER-XL", title: "Premium Merino Wool Quarter-Zip Pullover — Heather Charcoal / XL", available: 6, daysLeft: 4 },
  { sku: "CAP-RED", title: "Red Cap", available: 60, daysLeft: null },
  { sku: "SOCK-3PK", title: "Socks 3-pack", available: 80, daysLeft: null },
];

export function mockKpis(rev: RevenuePoint[]): Kpi[] {
  const today = rev[rev.length - 1];
  const baseline = today?.baseline ?? today?.value ?? 0;
  const delta = baseline ? ((today.value - baseline) / baseline) * 100 : 0;
  const trail = rev.slice(-10).map((p) => p.value);
  return [
    {
      label: "Open findings",
      value: "2",
      deltaPct: null,
      hint: "1 critical · 1 at-risk",
      severity: "critical",
    },
    {
      label: "Revenue today",
      value: usd0(today?.value ?? 0),
      deltaPct: delta,
      hint: "vs same-weekday baseline",
      severity: delta < -10 ? "critical" : delta < 0 ? "warning" : "healthy",
      spark: trail,
    },
    {
      label: "SKUs at risk",
      value: "2",
      deltaPct: null,
      hint: "≤ 3 days of stock left",
      severity: "warning",
    },
    {
      label: "Orders / hr (proxy)",
      value: "4.2",
      deltaPct: 0,
      hint: "orders-based proxy, not conversion",
      severity: "info",
    },
  ];
}

const usd0 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const mockRuns: InvestigationRun[] = [
  { id: "run_8f3a", trigger: "webhook", status: "completed", startedAt: iso(0, 15), durationMs: 4120, store_id: "cortexium", outcome: "STOCKOUT — Black Tee", findingId: 3 },
  { id: "run_8e21", trigger: "schedule", status: "completed", startedAt: iso(2, 11), durationMs: 3880, store_id: "cortexium", outcome: "RETURN_SPIKE — Quarter-Zip", findingId: 2 },
  { id: "run_8d04", trigger: "manual", status: "inconclusive", startedAt: iso(4, 9), durationMs: 2960, store_id: "cortexium", outcome: "No cause confirmed", findingId: 1 },
  { id: "run_8c77", trigger: "webhook", status: "failed", startedAt: iso(5, 17), durationMs: 510, store_id: "cortexium", outcome: "Shopify 429 — retried, gave up", findingId: null },
  { id: "run_8b90", trigger: "schedule", status: "completed", startedAt: iso(6, 6), durationMs: 4500, store_id: "cortexium", outcome: "No anomaly (all weekdays in range)", findingId: null },
];
