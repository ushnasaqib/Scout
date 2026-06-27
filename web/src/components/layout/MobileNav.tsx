import { NavLink } from "react-router-dom";
import { LayoutList, LineChart, History, Settings as Cog } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Findings", icon: LayoutList, end: true },
  { to: "/monitoring", label: "Monitoring", icon: LineChart },
  { to: "/investigations", label: "Runs", icon: History },
  { to: "/settings", label: "Connect", icon: Cog },
];

export function MobileNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:hidden">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium",
              isActive ? "bg-elevated text-fg" : "text-muted",
            )
          }
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
