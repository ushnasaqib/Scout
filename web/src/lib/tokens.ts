/** Chart + status colors as literal values (Recharts needs concrete colors, not CSS vars).
 *  Colorblind-safe categorical palette, 6 hues max; blue↔orange & purple↔teal are the
 *  safe contrasting pairs for 2-series comparisons. */

export const CHART_PALETTE = [
  "#4F6BED", // blue
  "#E8893B", // orange
  "#2BB3A3", // teal
  "#9B6DD6", // purple
  "#E5C04B", // gold
  "#E5688A", // pink
] as const;

export const STATUS = {
  healthy: "#2BA971",
  warning: "#E0A030",
  critical: "#E0544E",
  info: "#6B7787",
  primary: "#4F6BED",
} as const;

import type { CauseType, Severity, Verdict } from "./types";

export const CAUSE_LABEL: Record<CauseType, string> = {
  STOCKOUT: "Stockout",
  RETURN_SPIKE: "Return spike",
  PRICE_CHANGE: "Price change",
  FULFILLMENT_DELAY: "Fulfillment delay",
  ORDER_VELOCITY_DROP: "Velocity drop",
  SINGLE_SKU_DRIVER: "Single-SKU driver",
};

export const VERDICT_META: Record<
  Verdict,
  { label: string; severity: Severity }
> = {
  CONFIRMED: { label: "Confirmed", severity: "critical" },
  REFUTED: { label: "Ruled out", severity: "info" },
  INCONCLUSIVE: { label: "Inconclusive", severity: "warning" },
};
