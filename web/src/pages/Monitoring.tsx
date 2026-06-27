import { useState } from "react";
import { Boxes, LineChart as LineIcon } from "lucide-react";
import { getInventory, getRevenue } from "@/lib/api";
import { useResource } from "@/lib/useResource";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { RevenueBaselineChart } from "@/components/charts/RevenueBaselineChart";
import { InventoryBars } from "@/components/charts/InventoryBars";
import { cn } from "@/lib/cn";

const RANGES = [
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "6w", days: 42 },
];

export function Monitoring() {
  const { data: rev, loading } = useResource(getRevenue);
  const { data: inv } = useResource(getInventory);
  const [range, setRange] = useState(42);
  const sliced = rev ? rev.slice(-range) : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Monitoring</h1>
        <p className="mt-0.5 text-sm text-muted">
          Revenue against the same-weekday baseline band, plus looming-stockout risk.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineIcon size={16} className="text-muted" />
              <h2 className="text-sm font-semibold">Revenue vs same-weekday baseline</h2>
            </div>
            <div className="flex gap-1 rounded-lg border border-border bg-elevated p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setRange(r.days)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    range === r.days ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : sliced.length ? (
            <RevenueBaselineChart data={sliced} />
          ) : (
            <EmptyState icon={LineIcon} title="No revenue series yet" body="Seed or connect a store to chart the same-weekday baseline." />
          )}
          <p className="mt-3 text-[11px] text-muted">
            Shaded band = ±8% around the median of the prior 5 same-weekdays. Dashed line = baseline.
            Scout never reports a true conversion rate (Admin API has no sessions); volume figures are an
            explicit orders-based proxy.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Boxes size={16} className="text-muted" />
            <h2 className="text-sm font-semibold">Inventory · soonest stockout first</h2>
          </div>
        </CardHeader>
        <CardBody>
          {inv && inv.length ? (
            <InventoryBars items={inv} />
          ) : (
            <EmptyState icon={Boxes} title="No inventory data" body="Connect a Shopify store to see live stock levels and stockout risk." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
