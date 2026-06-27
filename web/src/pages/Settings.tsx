import { useState } from "react";
import { CheckCircle2, Slack, Mail, SlidersHorizontal, Store, Save } from "lucide-react";
import { API_URL, STORE_ID } from "@/lib/api";
import { useApp } from "@/lib/appState";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-primary" : "bg-elevated border border-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "h-9 rounded-lg border border-border bg-elevated px-3 text-sm text-fg outline-none focus:border-primary";

export function Settings() {
  const { source } = useApp();
  const [slack, setSlack] = useState(false);
  const [email, setEmail] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thr, setThr] = useState({ weekdays: 5, z: 3.5, minHist: 3, debounce: 10 });

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Connections</h1>
        <p className="mt-0.5 text-sm text-muted">Store connection, notifications, and detection tuning.</p>
      </div>

      {/* Shopify connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store size={16} className="text-muted" />
            <h2 className="text-sm font-semibold">Shopify store</h2>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-elevated/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">cortexium.myshopify.com</p>
              <p className="text-xs text-muted">Admin API · scopes: orders, products, inventory, locations</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-healthy">
              <CheckCircle2 size={16} /> Connected
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Backend API URL"><input className={inputCls} value={API_URL} readOnly /></Field>
            <Field label="Store id" hint={`Data source: ${source === "live" ? "live API" : "demo fallback"}`}>
              <input className={inputCls} value={STORE_ID} readOnly />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Notifications</h2>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Slack size={18} className="text-muted" />
            <div className="flex-1">
              <p className="text-sm font-medium">Slack</p>
              <p className="text-xs text-muted">Post each new finding to a channel</p>
            </div>
            <Toggle on={slack} onChange={setSlack} label="Enable Slack" />
          </div>
          {slack && (
            <Field label="Channel"><input className={inputCls} placeholder="#scout-findings" /></Field>
          )}
          <div className="flex items-center gap-3 border-t border-border pt-3">
            <Mail size={18} className="text-muted" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email (SendGrid)</p>
              <p className="text-xs text-muted">Send findings to a mailbox</p>
            </div>
            <Toggle on={email} onChange={setEmail} label="Enable email" />
          </div>
          {email && <Field label="Recipient"><input className={inputCls} placeholder="you@example.com" type="email" /></Field>}
        </CardBody>
      </Card>

      {/* Detection thresholds */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted" />
            <h2 className="text-sm font-semibold">Detection thresholds</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Baseline same-weekdays" hint="how many prior same-weekdays form the baseline">
              <input type="number" className={inputCls} value={thr.weekdays} onChange={(e) => setThr({ ...thr, weekdays: +e.target.value })} />
            </Field>
            <Field label="Robust-z threshold" hint="flag when |z| (median + MAD) exceeds this">
              <input type="number" step="0.1" className={inputCls} value={thr.z} onChange={(e) => setThr({ ...thr, z: +e.target.value })} />
            </Field>
            <Field label="Minimum history" hint="no anomaly fired below this many same-weekdays">
              <input type="number" className={inputCls} value={thr.minHist} onChange={(e) => setThr({ ...thr, minHist: +e.target.value })} />
            </Field>
            <Field label="Debounce (minutes)" hint="at most one run per store per window">
              <input type="number" className={inputCls} value={thr.debounce} onChange={(e) => setThr({ ...thr, debounce: +e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="primary" onClick={save}>
              <Save size={15} /> Save settings
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-healthy">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
