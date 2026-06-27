import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { Kpi as KpiT } from "@/lib/types";
import { STATUS } from "@/lib/tokens";
import { Card } from "./Card";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/cn";

export function KpiTile({ kpi }: { kpi: KpiT }) {
  const d = kpi.deltaPct;
  const dir = d == null ? "flat" : d > 0.05 ? "up" : d < -0.05 ? "down" : "flat";
  const DeltaIcon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const deltaColor =
    dir === "flat" ? "var(--muted)" : kpi.severity === "critical" ? STATUS.critical : kpi.severity === "warning" ? STATUS.warning : STATUS.healthy;

  return (
    <Card className="p-4 transition-shadow duration-150 hover:shadow-[var(--card-shadow)]">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-muted">{kpi.label}</p>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: `var(--${kpi.severity})` }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex items-end gap-2">
        <span className="tnum text-[28px] font-bold leading-none tracking-tight">{kpi.value}</span>
        {d != null && (
          <span className="mb-0.5 inline-flex items-center gap-0.5 text-[13px] font-semibold" style={{ color: deltaColor }}>
            <DeltaIcon size={14} strokeWidth={2.5} aria-hidden />
            {Math.abs(d).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className={cn("text-xs text-muted")}>{kpi.hint}</p>
        {kpi.spark && <Sparkline data={kpi.spark} width={72} height={26} color={deltaColor} />}
      </div>
    </Card>
  );
}
