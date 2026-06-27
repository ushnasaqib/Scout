export const usd = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const pct = (n: number, withSign = true): string =>
  `${withSign && n > 0 ? "+" : ""}${n.toFixed(1)}%`;

export const compactNum = (n: number): string =>
  new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Long product names need truncation; keep a readable middle-truncate for SKUs. */
export function truncate(s: string, max = 42): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}
