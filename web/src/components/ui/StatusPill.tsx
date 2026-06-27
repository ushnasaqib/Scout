import { Check, TriangleAlert, CircleDot, Info, type LucideIcon } from "lucide-react";
import type { Severity } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Status is ALWAYS icon + label, never color alone (colorblind-safe). */
const META: Record<Severity, { label: string; Icon: LucideIcon; color: string; tint: string }> = {
  healthy: { label: "On track", Icon: Check, color: "var(--healthy)", tint: "rgba(43,169,113,0.12)" },
  warning: { label: "At risk", Icon: TriangleAlert, color: "var(--warning)", tint: "rgba(224,160,48,0.13)" },
  critical: { label: "Anomaly", Icon: CircleDot, color: "var(--critical)", tint: "rgba(224,84,78,0.13)" },
  info: { label: "Info", Icon: Info, color: "var(--info)", tint: "rgba(107,119,135,0.13)" },
};

export function StatusPill({
  severity,
  label,
  className,
}: {
  severity: Severity;
  label?: string;
  className?: string;
}) {
  const m = META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{ color: m.color, background: m.tint }}
    >
      <m.Icon size={13} strokeWidth={2.5} aria-hidden />
      {label ?? m.label}
    </span>
  );
}
