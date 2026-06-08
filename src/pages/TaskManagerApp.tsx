import { useEffect, useRef, useState } from "react";
import { Cpu, MemoryStick, Activity, X, Wifi as WifiIcon } from "lucide-react";
import { useOS } from "@/store/os";

const APP_LABELS: Record<string, string> = {
  welcome: "Welcome.app",
  about: "About.app",
  projects: "Finder",
  skills: "Skills.app",
  experience: "Experience.app",
  resume: "Preview.app",
  terminal: "Terminal",
  shivamgpt: "ShivamGPT.app",
  contact: "Mail.app",
  settings: "System Settings",
  taskmanager: "Activity Monitor",
};

interface PerfMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function TaskManagerApp() {
  const windows = useOS((s) => s.windows);
  const closeWindow = useOS((s) => s.closeWindow);

  const [cpu, setCpu] = useState<number[]>(Array(40).fill(0));
  const [mem, setMem] = useState<number[]>(Array(40).fill(0));
  const [net, setNet] = useState<number[]>(Array(40).fill(0));
  const frame = useRef<number>(0);

  // Pseudo-CPU = how many frames per measurement window deviate from 16.6ms
  useEffect(() => {
    let last = performance.now();
    let count = 0;
    const tick = () => {
      count++;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      const expected = elapsed / 16.6667;
      const load = Math.max(
        2,
        Math.min(100, 100 - (count / expected) * 90 + Math.random() * 20),
      );
      last = now;
      count = 0;

      const m = (performance as Performance & { memory?: PerfMemory }).memory;
      const memPct = m
        ? (m.usedJSHeapSize / m.jsHeapSizeLimit) * 100
        : 20 + Math.random() * 30;
      const netSpeed = Math.max(
        0,
        30 + Math.sin(Date.now() / 1500) * 25 + Math.random() * 20,
      );

      setCpu((p) => [...p.slice(1), load]);
      setMem((p) => [...p.slice(1), memPct]);
      setNet((p) => [...p.slice(1), netSpeed]);
    }, 500);
    return () => {
      cancelAnimationFrame(frame.current);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-black/40 text-xs">
      <div className="grid grid-cols-3 gap-2 border-b border-glass-border p-3">
        <Graph
          label="CPU"
          data={cpu}
          unit="%"
          icon={<Cpu className="h-3.5 w-3.5" />}
          color="oklch(0.75 0.2 290)"
        />
        <Graph
          label="Memory"
          data={mem}
          unit="%"
          icon={<MemoryStick className="h-3.5 w-3.5" />}
          color="oklch(0.78 0.18 160)"
        />
        <Graph
          label="Network"
          data={net}
          unit="MB/s"
          icon={<WifiIcon className="h-3.5 w-3.5" />}
          color="oklch(0.75 0.2 40)"
        />
      </div>
      <div className="border-b border-glass-border bg-titlebar/60 px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Activity className="mr-1 inline h-3 w-3" /> Running Processes (
        {windows.length})
      </div>
      <div className="flex-1 overflow-auto">
        {windows.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            No active processes
          </div>
        )}
        {windows.map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-2 border-b border-glass-border/50 px-3 py-2 hover:bg-white/5"
          >
            <div className="grid h-6 w-6 place-items-center rounded bg-accent/20 text-[10px] font-bold text-accent">
              {w.app[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium">{APP_LABELS[w.app] ?? w.app}</div>
              <div className="text-[10px] text-muted-foreground">
                PID{" "}
                {Math.abs(w.id.split("-")[1].slice(-4) as unknown as number)} ·{" "}
                {w.minimized ? "minimized" : "running"}
              </div>
            </div>
            <div className="tabular-nums text-muted-foreground">
              {(Math.random() * 12 + 2).toFixed(1)}%
            </div>
            <button
              onClick={() => closeWindow(w.id)}
              className="inline-flex items-center gap-1 rounded-md bg-destructive/80 px-2 py-1 text-[10px] font-semibold text-destructive-foreground hover:bg-destructive"
            >
              <X className="h-3 w-3" /> End Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Graph({
  label,
  data,
  unit,
  icon,
  color,
}: {
  label: string;
  data: number[];
  unit: string;
  icon: React.ReactNode;
  color: string;
}) {
  const max = 100;
  const w = 200,
    h = 70;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  const current = data[data.length - 1] ?? 0;
  return (
    <div className="rounded-lg border border-glass-border bg-black/30 p-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          {icon} {label}
        </span>
        <span className="tabular-nums font-semibold" style={{ color }}>
          {current.toFixed(1)} {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-16 w-full">
        <polygon points={area} fill={color} fillOpacity="0.15" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
