import { TriangleAlert, PackageX } from "lucide-react";
import type { InventoryLevel } from "@/lib/types";
import { STATUS } from "@/lib/tokens";
import { truncate } from "@/lib/format";

/** Horizontal inventory bars with looming-stockout warnings (icon + label, not color alone). */
export function InventoryBars({ items }: { items: InventoryLevel[] }) {
  const max = Math.max(1, ...items.map((i) => i.available));
  const sorted = [...items].sort((a, b) => {
    const da = a.daysLeft ?? 999;
    const db = b.daysLeft ?? 999;
    return da - db;
  });

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((it) => {
        const out = it.available <= 0;
        const atRisk = !out && it.daysLeft != null && it.daysLeft <= 3;
        const color = out ? STATUS.critical : atRisk ? STATUS.warning : STATUS.primary;
        return (
          <li key={it.sku}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium" title={it.title}>
                {truncate(it.title, 40)}
              </span>
              <span className="tnum shrink-0 text-muted">{it.available} left</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${Math.max(2, (it.available / max) * 100)}%`, background: color }}
                />
              </div>
              {out && (
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold" style={{ color: STATUS.critical }}>
                  <PackageX size={12} /> Out
                </span>
              )}
              {atRisk && (
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold" style={{ color: STATUS.warning }}>
                  <TriangleAlert size={12} /> ~{it.daysLeft}d
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
