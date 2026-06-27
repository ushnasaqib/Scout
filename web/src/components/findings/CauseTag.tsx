import { Boxes, RotateCcw, Tag, Truck, TrendingDown, Crosshair, HelpCircle, type LucideIcon } from "lucide-react";
import type { CauseType } from "@/lib/types";
import { CAUSE_LABEL } from "@/lib/tokens";
import { Badge } from "@/components/ui/Badge";

const ICON: Record<CauseType, LucideIcon> = {
  STOCKOUT: Boxes,
  RETURN_SPIKE: RotateCcw,
  PRICE_CHANGE: Tag,
  FULFILLMENT_DELAY: Truck,
  ORDER_VELOCITY_DROP: TrendingDown,
  SINGLE_SKU_DRIVER: Crosshair,
};

export function CauseTag({ cause }: { cause: CauseType | null }) {
  if (!cause)
    return (
      <Badge>
        <HelpCircle size={12} aria-hidden /> Inconclusive
      </Badge>
    );
  const Icon = ICON[cause];
  return (
    <Badge>
      <Icon size={12} aria-hidden /> {CAUSE_LABEL[cause]}
    </Badge>
  );
}
