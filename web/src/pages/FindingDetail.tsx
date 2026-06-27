import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, X, Minus, Sparkles, Wrench, Lightbulb, Search, FileCheck } from "lucide-react";
import { getFindings } from "@/lib/api";
import { useResource } from "@/lib/useResource";
import { severityForFinding } from "@/lib/findingMeta";
import { CAUSE_LABEL, STATUS, VERDICT_META } from "@/lib/tokens";
import { usd, pct, relativeTime } from "@/lib/format";
import { stepReveal } from "@/lib/motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CauseTag } from "@/components/findings/CauseTag";
import type { Evidence, InvestigatedHypothesis } from "@/lib/types";

export function FindingDetail() {
  const { id } = useParams();
  const { data: findings, loading } = useResource(getFindings);
  const finding = findings?.find((f) => String(f.id) === id);

  if (loading) return <CardSkeleton />;
  if (!finding)
    return (
      <div>
        <BackLink />
        <Card className="mt-4 p-8 text-center text-sm text-muted">Finding not found.</Card>
      </div>
    );

  const sev = severityForFinding(finding);
  const a = finding.anomaly;

  return (
    <div className="flex flex-col gap-5">
      <BackLink />

      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill severity={sev} />
        <CauseTag cause={finding.confirmed_cause} />
        <span className="text-xs text-muted">{relativeTime(finding.created_at)}</span>
        {finding.llm_mode !== "stub" && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
            <Sparkles size={12} /> written by {finding.llm_mode}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-tight tracking-tight">{finding.headline}</h1>

      {/* Recommended action CTA */}
      <Card className="border-primary/40 bg-primary/[0.06]">
        <CardBody className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Recommended action</p>
            <p className="mt-1 text-[15px] font-medium">{finding.recommended_action}</p>
          </div>
          <Button variant="primary" className="shrink-0">
            <Wrench size={15} /> Take action
          </Button>
        </CardBody>
      </Card>

      {/* Anomaly summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Observed" value={a?.metric === "revenue" ? usd(a.observed_value) : String(a?.observed_value)} />
        <Stat label="Baseline" value={a?.metric === "revenue" ? usd(a.baseline) : String(a?.baseline)} sub={`${a?.comparison_window?.length ?? 0} × ${a?.weekday ?? ""}`} />
        <Stat label="Deviation" value={pct(a?.deviation_pct ?? 0)} accent={(a?.deviation_pct ?? 0) < 0 ? STATUS.critical : STATUS.healthy} />
        <Stat label="Robust z" value={(a?.robust_z ?? 0).toFixed(2)} sub="median + MAD" />
      </div>

      {/* Investigation trail */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted" />
            <h2 className="text-sm font-semibold">Investigation trail</h2>
            <span className="ml-auto text-xs text-muted">{finding.investigated.length} hypotheses tested</span>
          </div>
        </CardHeader>
        <CardBody>
          <ol className="relative ml-2 flex flex-col gap-4 border-l border-border pl-6">
            <Step i={0} icon={Lightbulb} title="Anomaly ingested" muted>
              {a?.metric} on {a?.weekday} fell outside the same-weekday distribution (z {a?.robust_z?.toFixed(2)}).
            </Step>
            {finding.investigated.map((h, idx) => (
              <HypothesisStep key={h.hypothesis.cause_type} h={h} i={idx + 1} />
            ))}
            <Step i={finding.investigated.length + 1} icon={FileCheck} title="Finding synthesized" highlight>
              Confirmed cause:{" "}
              <strong>{finding.confirmed_cause ? CAUSE_LABEL[finding.confirmed_cause] : "inconclusive"}</strong>{" "}
              · confidence {finding.confidence.toFixed(2)}
            </Step>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
      <ArrowLeft size={16} /> Back to findings
    </Link>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="tnum mt-1 text-xl font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </Card>
  );
}

function Step({
  i,
  icon: Icon,
  title,
  children,
  muted,
  highlight,
}: {
  i: number;
  icon: typeof Lightbulb;
  title: string;
  children: React.ReactNode;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <motion.li custom={i} variants={stepReveal} initial="initial" animate="animate" className="relative">
      <span
        className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full border border-border"
        style={{ background: highlight ? "var(--primary)" : "var(--surface)", color: highlight ? "#fff" : "var(--muted)" }}
      >
        <Icon size={13} />
      </span>
      <p className={`text-sm font-semibold ${muted ? "text-muted" : ""}`}>{title}</p>
      <div className="mt-0.5 text-[13px] text-muted">{children}</div>
    </motion.li>
  );
}

function HypothesisStep({ h, i }: { h: InvestigatedHypothesis; i: number }) {
  const meta = VERDICT_META[h.verdict];
  return (
    <motion.li custom={i} variants={stepReveal} initial="initial" animate="animate" className="relative">
      <span
        className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full border"
        style={{ borderColor: `var(--${meta.severity})`, background: "var(--surface)", color: `var(--${meta.severity})` }}
      >
        {h.verdict === "CONFIRMED" ? <Check size={13} /> : h.verdict === "REFUTED" ? <X size={13} /> : <Minus size={13} />}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <CauseTag cause={h.hypothesis.cause_type} />
        <StatusPill severity={meta.severity} label={meta.label} />
        <span className="text-[11px] text-muted">conf {h.confidence.toFixed(2)}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted">{h.hypothesis.rationale}</p>
      <ul className="mt-2 flex flex-col gap-1">
        {h.evidence.map((e, idx) => (
          <EvidenceRow key={idx} e={e} />
        ))}
      </ul>
    </motion.li>
  );
}

function EvidenceRow({ e }: { e: Evidence }) {
  const Icon = e.supports === true ? Check : e.supports === false ? X : Minus;
  const color = e.supports === true ? STATUS.healthy : e.supports === false ? STATUS.critical : STATUS.info;
  return (
    <li className="flex items-start gap-2 rounded-lg bg-elevated/50 px-2.5 py-1.5 text-[13px]">
      <Icon size={14} className="mt-0.5 shrink-0" style={{ color }} />
      <span className="min-w-0">
        <code className="rounded bg-elevated px-1 py-0.5 text-[11px] text-muted">{e.tool}</code>{" "}
        <span className="text-fg/90">{e.result_summary}</span>
      </span>
    </li>
  );
}
