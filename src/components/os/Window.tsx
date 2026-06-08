import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Minus, Square, X } from "lucide-react";
import { useOS, type WindowState } from "../../store/os";
import { cn } from "../../lib/utils";

interface Props {
  win: WindowState;
  children: ReactNode;
}

export function Window({ win, children }: Props) {
  const focused = useOS((s) => s.focused === win.id);
  const focus = useOS((s) => s.focusWindow);
  const close = useOS((s) => s.closeWindow);
  const move = useOS((s) => s.moveWindow);
  const resize = useOS((s) => s.resizeWindow);
  const minimize = useOS((s) => s.minimizeWindow);
  const toggleMax = useOS((s) => s.toggleMaximize);
  const setSnapPreview = useOS((s) => s.setSnapPreview);
  const snapWindow = useOS((s) => s.snapWindow);

  const dragRef = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);
  const resizeRef = useRef<{
    sx: number;
    sy: number;
    ow: number;
    oh: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const pendingSnap = useRef<
    | "left"
    | "right"
    | "max"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | null
  >(null);

  useEffect(() => {
    const SNAP_EDGE = 18;
    function detectSnap(x: number, y: number): typeof pendingSnap.current {
      const W = window.innerWidth,
        H = window.innerHeight;
      const top = y <= SNAP_EDGE + 32;
      const left = x <= SNAP_EDGE;
      const right = x >= W - SNAP_EDGE - 80;
      if (top && left) return "topLeft";
      if (top && right) return "topRight";
      if (top) return "max";
      if (left) return "left";
      if (right) return "right";
      if (y >= H - SNAP_EDGE - 100 && left) return "bottomLeft";
      if (y >= H - SNAP_EDGE - 100 && right) return "bottomRight";
      return null;
    }
    function onMove(e: MouseEvent) {
      if (dragRef.current) {
        const { sx, sy, ox, oy } = dragRef.current;
        const nx = Math.max(0, ox + e.clientX - sx);
        const ny = Math.max(32, oy + e.clientY - sy);
        move(win.id, nx, ny);
        const snap = detectSnap(e.clientX, e.clientY);
        pendingSnap.current = snap;
        if (snap) {
          const W = window.innerWidth,
            H = window.innerHeight - 96;
          const half = Math.floor(W / 2),
            halfH = Math.floor(H / 2);
          const map = {
            left: { x: 0, y: 40, w: half, h: H },
            right: { x: half, y: 40, w: W - half, h: H },
            max: { x: 0, y: 40, w: W, h: H },
            topLeft: { x: 0, y: 40, w: half, h: halfH },
            topRight: { x: half, y: 40, w: W - half, h: halfH },
            bottomLeft: { x: 0, y: 40 + halfH, w: half, h: H - halfH },
            bottomRight: { x: half, y: 40 + halfH, w: W - half, h: H - halfH },
          };
          setSnapPreview(map[snap]);
        } else {
          setSnapPreview(null);
        }
      }
      if (resizeRef.current) {
        const { sx, sy, ow, oh } = resizeRef.current;
        resize(
          win.id,
          Math.max(360, ow + e.clientX - sx),
          Math.max(280, oh + e.clientY - sy),
        );
      }
    }
    function onUp() {
      if (dragRef.current && pendingSnap.current) {
        snapWindow(win.id, pendingSnap.current);
      }
      pendingSnap.current = null;
      setSnapPreview(null);
      dragRef.current = null;
      resizeRef.current = null;
      setDragging(false);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [win.id, move, resize, setSnapPreview, snapWindow]);

  if (win.minimized) return null;

  return (
    <motion.div
      data-os-window
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className={cn(
        "absolute overflow-hidden rounded-xl shadow-window glass-strong",
        focused ? "ring-1 ring-accent/40" : "opacity-95",
        dragging && "cursor-grabbing select-none",
      )}
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
      }}
      onMouseDown={() => focus(win.id)}
    >
      {/* title bar */}
      <div
        className="flex h-9 items-center justify-between gap-2 border-b border-window-border px-3 cursor-grab"
        style={{ background: "var(--titlebar)" }}
        onMouseDown={(e) => {
          if (win.maximized) return;
          setDragging(true);
          dragRef.current = {
            sx: e.clientX,
            sy: e.clientY,
            ox: win.x,
            oy: win.y,
          };
        }}
        onDoubleClick={() => toggleMax(win.id)}
      >
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              close(win.id);
            }}
            className="grid h-3 w-3 place-items-center rounded-full bg-[oklch(0.65_0.22_25)] hover:brightness-110"
          >
            <X
              className="h-2 w-2 text-black/60 opacity-0 group-hover:opacity-100"
              strokeWidth={3}
            />
          </button>
          <button
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimize(win.id);
            }}
            className="h-3 w-3 rounded-full bg-[oklch(0.78_0.17_75)] hover:brightness-110"
          >
            <Minus className="h-2 w-2 hidden" />
          </button>
          <button
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              toggleMax(win.id);
            }}
            className="h-3 w-3 rounded-full bg-[oklch(0.72_0.18_150)] hover:brightness-110"
          >
            <Square className="h-2 w-2 hidden" />
          </button>
        </div>
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-foreground/80">
          {win.title}
        </div>
        <div className="w-12" />
      </div>

      {/* content */}
      <div className="h-[calc(100%-2.25rem)] overflow-auto scrollbar-thin">
        {children}
      </div>

      {/* resize handle */}
      {!win.maximized && (
        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            resizeRef.current = {
              sx: e.clientX,
              sy: e.clientY,
              ow: win.w,
              oh: win.h,
            };
          }}
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, oklch(1 0 0 / 0.3) 50%)",
          }}
        />
      )}
    </motion.div>
  );
}
