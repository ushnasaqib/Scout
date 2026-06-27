import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Finding } from "@/lib/types";
import { listItem } from "@/lib/motion";
import { severityForFinding, sparkColor } from "@/lib/findingMeta";
import { relativeTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Sparkline } from "@/components/ui/Sparkline";
import { Button } from "@/components/ui/Button";
import { CauseTag } from "./CauseTag";

export function FindingCard({ finding, isNew = false }: { finding: Finding; isNew?: boolean }) {
  const nav = useNavigate();
  const sev = severityForFinding(finding);
  const go = () => nav(`/findings/${finding.id}`);

  return (
    <motion.div variants={listItem}>
      <Card
        onClick={go}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go()}
        className={`group cursor-pointer p-5 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift ${
          isNew ? "animate-pulseRing" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <StatusPill severity={sev} />
          <CauseTag cause={finding.confirmed_cause} />
          {finding.llm_mode !== "stub" && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted">
              <Sparkles size={12} /> {finding.llm_mode}
            </span>
          )}
          <span className={finding.llm_mode === "stub" ? "ml-auto text-xs text-muted" : "text-xs text-muted"}>
            {relativeTime(finding.created_at)}
          </span>
        </div>

        <h3 className="mt-3 text-[15px] font-semibold leading-snug text-fg">{finding.headline}</h3>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted">Affected: {finding.anomaly?.metric ?? "metric"}</p>
            <div className="mt-1">
              <Sparkline data={finding.spark} color={sparkColor(finding)} width={132} height={38} />
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="shrink-0 group-hover:translate-x-0.5 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              go();
            }}
          >
            View action <ArrowRight size={15} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
