import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Wifi, FlaskConical, CheckCircle2, Loader2 } from "lucide-react";
import { runScout } from "@/lib/api";
import { useApp } from "@/lib/appState";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar() {
  const { source, bumpRefresh } = useApp();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onRun = async () => {
    setBusy(true);
    const res = await runScout();
    setBusy(false);
    setToast(`Investigation ${res.status}`);
    setTimeout(() => bumpRefresh(), 1200);
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-healthy" /> cortexium.myshopify.com
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            color: source === "live" ? "var(--healthy)" : "var(--info)",
            background: source === "live" ? "rgba(43,169,113,0.12)" : "rgba(107,119,135,0.13)",
          }}
          title={source === "live" ? "Connected to the Scout API" : "API unreachable — showing demo data"}
        >
          {source === "live" ? <Wifi size={13} /> : <FlaskConical size={13} />}
          {source === "live" ? "Live data" : "Demo data"}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onRun} disabled={busy}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
          {busy ? "Running…" : "Run investigation"}
        </Button>
        <ThemeToggle />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-4 top-16 inline-flex items-center gap-2 rounded-xl border border-border bg-elevated px-3 py-2 text-sm shadow-lift"
          >
            <CheckCircle2 size={16} className="text-healthy" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
