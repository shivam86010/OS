import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Clock, StickyNote, X } from "lucide-react";
import { useOS, type Widget } from "../../../store/os";

function WidgetShell({
  w,
  children,
  accent,
}: {
  w: Widget;
  children: ReactNode;
  accent?: string;
}) {
  const move = useOS((s) => s.moveWidget);
  const remove = useOS((s) => s.removeWidget);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current) return;
      const { sx, sy, ox, oy } = drag.current;
      move(
        w.id,
        Math.max(0, ox + e.clientX - sx),
        Math.max(36, oy + e.clientY - sy),
      );
    };
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [w.id, move]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      ref={ref}
      style={{ left: w.x, top: w.y }}
      className="group absolute z-[5] select-none rounded-2xl glass shadow-window"
      onMouseDown={(e) => {
        if (
          (e.target as HTMLElement).closest("[data-widget-content]") ||
          (e.target as HTMLElement).tagName === "BUTTON" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        )
          return;
        drag.current = { sx: e.clientX, sy: e.clientY, ox: w.x, oy: w.y };
      }}
    >
      <button
        onClick={() => remove(w.id)}
        className="absolute -right-2 -top-2 z-10 grid h-5 w-5 place-items-center rounded-full bg-rose-500/90 opacity-0 transition group-hover:opacity-100"
        aria-label="Remove widget"
      >
        <X className="h-3 w-3 text-white" />
      </button>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ background: accent ?? "var(--accent)" }}
      />
      {children}
    </motion.div>
  );
}

function ClockWidget({ w }: { w: Widget }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sec = now.getSeconds(),
    min = now.getMinutes(),
    hr = now.getHours() % 12;
  const hand = (deg: number, len: number, w: number, c: string) => (
    <line
      x1="50"
      y1="50"
      x2={50 + len * Math.sin((deg * Math.PI) / 180)}
      y2={50 - len * Math.cos((deg * Math.PI) / 180)}
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
  return (
    <WidgetShell w={w}>
      <div
        data-widget-content
        className="flex w-44 cursor-grab flex-col items-center gap-1 p-3"
      >
        <svg viewBox="0 0 100 100" className="h-28 w-28">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="oklch(0.18 0.04 270 / 0.6)"
            stroke="var(--accent)"
            strokeWidth="2"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={50 + 40 * Math.sin(a)}
                cy={50 - 40 * Math.cos(a)}
                r={1.5}
                fill="var(--foreground)"
                opacity={0.5}
              />
            );
          })}
          {hand(hr * 30 + min * 0.5, 24, 3, "var(--foreground)")}
          {hand(min * 6, 32, 2, "var(--foreground)")}
          {hand(sec * 6, 36, 1, "var(--accent)")}
          <circle cx="50" cy="50" r="2.5" fill="var(--accent)" />
        </svg>
        <div className="font-mono text-sm tabular-nums">
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </WidgetShell>
  );
}

function StickyWidget({ w }: { w: Widget }) {
  const update = useOS((s) => s.updateWidget);
  return (
    <WidgetShell w={w} accent="oklch(0.85 0.18 90)">
      <div className="w-56 cursor-grab p-2">
        <div className="mb-1 flex items-center gap-1 px-1 text-[10px] font-semibold text-amber-200/80">
          <StickyNote className="h-3 w-3" /> Sticky Note
        </div>
        <textarea
          data-widget-content
          defaultValue={typeof w.data === "string" ? w.data : ""}
          onChange={(e) => update(w.id, e.target.value)}
          placeholder="Type a quick thought…"
          className="h-32 w-full resize-none rounded bg-amber-200/10 p-2 text-xs text-amber-50 outline-none placeholder:text-amber-200/40"
        />
      </div>
    </WidgetShell>
  );
}

function CpuWidget({ w }: { w: Widget }) {
  const [vals, setVals] = useState<number[]>(Array(20).fill(20));
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const t0 = performance.now();
      // Tiny busy loop to derive a pseudo-CPU signal from frame time variation
      for (let i = 0; i < 5e4; i++) Math.sqrt(i);
      const dt = performance.now() - t0;
      const val = Math.min(100, 15 + dt * 4 + Math.random() * 10);
      setVals((v) => [...v.slice(1), val]);
      rafId = requestAnimationFrame(() => setTimeout(tick, 220));
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
  const max = 100;
  const pts = vals
    .map((v, i) => `${(i / (vals.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ");
  return (
    <WidgetShell w={w} accent="oklch(0.78 0.2 195)">
      <div className="w-52 cursor-grab p-3">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-cyan-200/80">
          <span>CPU</span>
          <span className="tabular-nums">
            {vals[vals.length - 1].toFixed(0)}%
          </span>
        </div>
        <svg
          viewBox="0 0 100 60"
          className="h-16 w-full"
          preserveAspectRatio="none"
        >
          <polyline
            points={pts}
            fill="none"
            stroke="oklch(0.78 0.2 195)"
            strokeWidth="1.5"
          />
          <polyline
            points={`0,60 ${pts} 100,60`}
            fill="oklch(0.78 0.2 195 / 0.2)"
          />
        </svg>
      </div>
    </WidgetShell>
  );
}

export function WidgetsLayer() {
  const widgets = useOS((s) => s.widgets);
  return (
    <>
      {widgets.map((w) =>
        w.kind === "clock" ? (
          <ClockWidget key={w.id} w={w} />
        ) : w.kind === "sticky" ? (
          <StickyWidget key={w.id} w={w} />
        ) : w.kind === "cpu" ? (
          <CpuWidget key={w.id} w={w} />
        ) : null,
      )}
    </>
  );
}

export { Clock as ClockIcon };
