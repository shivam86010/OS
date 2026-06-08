import { profile } from "../data/portfolio";
import { Cpu, HardDrive, Wifi, Activity } from "lucide-react";

const rows = [
  { label: "Name", value: profile.name },
  { label: "Role", value: profile.role },
  { label: "Location", value: profile.location },
  { label: "Email", value: profile.email },
  { label: "GitHub", value: "@" + profile.github },
  { label: "Status", value: profile.status, accent: true },
];

export function AboutApp() {
  return (
    <div className="flex h-full flex-col gap-4 p-5 font-mono text-sm">
      <div className="flex items-center gap-3 border-b border-glass-border pb-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent/20 text-accent">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-base font-semibold">
            System Information
          </div>
          <div className="text-xs text-muted-foreground">about://shivam</div>
        </div>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-y-2">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <div className="text-muted-foreground">{r.label}:</div>
            <div className={r.accent ? "text-accent" : ""}>{r.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-glass-border p-3 text-xs leading-relaxed text-muted-foreground">
        {profile.bio}
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Primary stack
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-glass-border bg-white/5 px-2 py-1 text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-glass-border pt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <HardDrive className="h-3 w-3 text-accent" /> 10y XP
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-success" /> Online
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-accent" /> Remote-ready
        </div>
      </div>
    </div>
  );
}
