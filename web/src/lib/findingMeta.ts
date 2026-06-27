import type { Finding, Severity } from "./types";
import { STATUS } from "./tokens";

export function severityForFinding(f: Finding): Severity {
  if (f.inconclusive || !f.confirmed_cause) return "info";
  if (f.confidence >= 0.8) return "critical";
  return "warning";
}

export function sparkColor(f: Finding): string {
  const dev = f.anomaly?.deviation_pct ?? 0;
  return dev < 0 ? STATUS.critical : STATUS.healthy;
}

/** Highest-impact + newest first. */
export function rankFindings(list: Finding[]): Finding[] {
  const sevRank: Record<Severity, number> = { critical: 0, warning: 1, info: 2, healthy: 3 };
  return [...list].sort((a, b) => {
    const s = sevRank[severityForFinding(a)] - sevRank[severityForFinding(b)];
    if (s !== 0) return s;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
