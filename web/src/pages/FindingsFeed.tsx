import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { getFindings, getInventory, getRevenue } from "@/lib/api";
import { useResource } from "@/lib/useResource";
import { rankFindings } from "@/lib/findingMeta";
import type { Kpi } from "@/lib/types";
import { usd, pct } from "@/lib/format";
import { listParent } from "@/lib/motion";
import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { KpiTile } from "@/components/ui/Kpi";
import { CountUp } from "@/components/ui/CountUp";
import { StatusPill } from "@/components/ui/StatusPill";
import { Sparkline } from "@/components/ui/Sparkline";
import { EmptyState } from "@/components/ui/EmptyState";
import { FindingCard } from "@/components/findings/FindingCard";
import { STATUS } from "@/lib/tokens";

export function FindingsFeed() {
  const { data: findings, loading } = useResource(getFindings);
  const { data: rev } = useResource(getRevenue);
  const { data: inv } = useResource(getInventory);

  const today = rev?.[rev.length - 1];
  const baseline = today?.baseline ?? today?.value ?? 0;
  const delta = baseline ? ((today!.value - baseline) / baseline) * 100 : 0;
  const ranked = findings ? rankFindings(findings) : [];

  const kpis: Kpi[] = [
    {
      label: "Open findings",
      value: String(findings?.filter((f) => !f.inconclusive).length ?? 0),
      deltaPct: null,
      hint: `${ranked.filter((f) => f.confidence >= 0.8 && f.confirmed_cause).length} critical · ${ranked.filter((f) => f.inconclusive).length} info`,
      severity: ranked.some((f) => f.confidence >= 0.8 && f.confirmed_cause) ? "critical" : "info",
    },
    {
      label: "Revenue today",
      value: usd(today?.value ?? 0),
      deltaPct: delta,
      hint: "vs same-weekday baseline",
      severity: delta < -10 ? "critical" : delta < 0 ? "warning" : "healthy",
      spark: rev?.slice(-10).map((p) => p.value),
    },
    {
      label: "SKUs at risk",
      value: String(inv?.filter((i) => i.available === 0 || (i.daysLeft != null && i.daysLeft <= 3)).length ?? 0),
      deltaPct: null,
      hint: "out of stock or ≤ 3 days left",
      severity: "warning",
    },
    {
      label: "Same-weekday baseline",
      value: usd(baseline),
      deltaPct: null,
      hint: today ? `median of last ${today ? 5 : 0} ${dayName(today.weekday)}s` : "—",
      severity: "info",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero trust number */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[13px] font-medium text-muted">Revenue today vs same-weekday baseline</p>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="text-[44px] font-extrabold leading-none tracking-tight">
                <CountUp value={today?.value ?? 0} format={(n) => usd(n)} />
              </h1>
              <span
                className="inline-flex items-center gap-1 text-base font-semibold"
                style={{ color: delta < 0 ? STATUS.critical : STATUS.healthy }}
              >
                {pct(delta)}
              </span>
            </div>
            <div className="mt-2">
              <StatusPill
                severity={delta < -10 ? "critical" : delta < 0 ? "warning" : "healthy"}
                label={delta < -10 ? "Anomaly detected" : delta < 0 ? "Below baseline" : "On track"}
              />
            </div>
          </div>
          <div className="sm:pr-2">
            <Sparkline data={rev?.slice(-14).map((p) => p.value) ?? []} width={220} height={64} color={delta < 0 ? STATUS.critical : STATUS.primary} />
          </div>
        </div>
      </Card>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiTile key={k.label} kpi={k} />
        ))}
      </div>

      {/* Findings feed */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Findings · ranked by impact</h2>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : ranked.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No findings yet"
            body="Scout will surface a finding here the moment it detects a meaningful anomaly. Trigger a run from the top bar to investigate now."
          />
        ) : (
          <motion.div variants={listParent} initial="initial" animate="animate" className="flex flex-col gap-3">
            {ranked.map((f, i) => (
              <FindingCard key={f.id} finding={f} isNew={i === 0} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function dayName(wd: number): string {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][wd] ?? "day";
}
