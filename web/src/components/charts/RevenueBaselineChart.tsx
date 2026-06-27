import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenuePoint } from "@/lib/types";
import { STATUS } from "@/lib/tokens";
import { usd, shortDate } from "@/lib/format";

export function RevenueBaselineChart({ data, height = 280 }: { data: RevenuePoint[]; height?: number }) {
  // baseline band: ±8% around the same-weekday median, so a number has context.
  const rows = data.map((p) => ({
    ...p,
    bandLow: p.baseline != null ? p.baseline * 0.92 : null,
    bandSpan: p.baseline != null ? p.baseline * 0.16 : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={STATUS.primary} stopOpacity={0.25} />
            <stop offset="100%" stopColor={STATUS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "var(--grid)" }}
          minTickGap={28}
        />
        <YAxis
          tickFormatter={(v) => usd(v as number)}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: "var(--elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--fg)",
            fontSize: 12,
          }}
          labelFormatter={(l) => shortDate(l as string)}
          formatter={(value, name) => [usd(value as number), name === "value" ? "Revenue" : "Baseline"]}
        />
        {/* same-weekday baseline band (stacked invisible base + visible span) */}
        <Area dataKey="bandLow" stackId="band" stroke="none" fill="transparent" isAnimationActive={false} />
        <Area dataKey="bandSpan" stackId="band" stroke="none" fill="var(--grid)" isAnimationActive={false} name="baseline band" />
        <Line
          dataKey="baseline"
          stroke="var(--muted)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          isAnimationActive={false}
          name="baseline"
        />
        <Area
          dataKey="value"
          stroke={STATUS.primary}
          strokeWidth={2.4}
          fill="url(#rev)"
          dot={false}
          animationDuration={600}
          name="value"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
