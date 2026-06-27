/** Mirrors the Scout backend Pydantic shapes (loosely; UI-friendly). */

export type CauseType =
  | "STOCKOUT"
  | "RETURN_SPIKE"
  | "PRICE_CHANGE"
  | "FULFILLMENT_DELAY"
  | "ORDER_VELOCITY_DROP"
  | "SINGLE_SKU_DRIVER";

export type Verdict = "CONFIRMED" | "REFUTED" | "INCONCLUSIVE";

export type Severity = "critical" | "warning" | "healthy" | "info";

export interface Evidence {
  tool: string;
  args?: Record<string, unknown>;
  result_summary: string;
  supports: boolean | null; // true confirms, false refutes, null inconclusive
}

export interface Hypothesis {
  cause_type: CauseType;
  rationale: string;
  specifics?: Record<string, unknown>;
  rank?: number;
}

export interface InvestigatedHypothesis {
  hypothesis: Hypothesis;
  evidence: Evidence[];
  verdict: Verdict;
  confidence: number;
}

export interface AnomalyEvent {
  store_id: string;
  metric: string;
  observed_value: number;
  baseline: number;
  deviation_pct: number;
  robust_z: number;
  weekday: string;
  comparison_window: string[];
  score: number;
  date: string;
}

export interface Finding {
  id: number;
  store_id: string;
  headline: string;
  confirmed_cause: CauseType | null;
  confidence: number;
  evidence: Evidence[];
  recommended_action: string;
  anomaly: AnomalyEvent;
  investigated: InvestigatedHypothesis[];
  created_at: string;
  llm_mode: string;
  inconclusive: boolean;
  /** small affected-metric series for the card sparkline */
  spark: number[];
}

export interface RevenuePoint {
  date: string;
  value: number;
  baseline: number | null;
  weekday: number;
}

export interface InventoryLevel {
  sku: string;
  title: string;
  available: number;
  daysLeft: number | null; // null = healthy / not computable
}

export interface InvestigationRun {
  id: string;
  trigger: "manual" | "webhook" | "schedule";
  status: "completed" | "running" | "failed" | "inconclusive";
  startedAt: string;
  durationMs: number;
  store_id: string;
  outcome: string;
  findingId: number | null;
}

export interface Kpi {
  label: string;
  value: string;
  deltaPct: number | null;
  hint: string;
  severity: Severity;
  spark?: number[];
}
