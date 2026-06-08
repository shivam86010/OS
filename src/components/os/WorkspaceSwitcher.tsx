import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOS, WALLPAPERS } from "../../store/os";

const WORKSPACES = [0, 1];

export function WorkspaceSwitcher() {
  const windows = useOS((s) => s.windows);
  const active = useOS((s) => s.activeWorkspace);
  const setWorkspace = useOS((s) => s.setWorkspace);
  const wallpaper = useOS((s) => s.wallpaper);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(active);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.ctrlKey &&
        e.altKey &&
        (e.key === "ArrowRight" || e.key === "ArrowLeft")
      ) {
        e.preventDefault();
        const next =
          e.key === "ArrowRight"
            ? Math.min(WORKSPACES.length - 1, (open ? sel : active) + 1)
            : Math.max(0, (open ? sel : active) - 1);
        setSel(next);
        setOpen(true);
      } else if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setSel(active);
        setOpen((v) => !v);
      } else if (open && e.key === "Enter") {
        e.preventDefault();
        setWorkspace(sel);
        setOpen(false);
      } else if (open && e.key === "Escape") {
        setOpen(false);
      }
    }
    function onUp(e: KeyboardEvent) {
      if (open && (e.key === "Control" || e.key === "Alt")) {
        setWorkspace(sel);
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, [open, sel, active, setWorkspace]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[180] grid place-items-center bg-black/60 backdrop-blur-xl"
          onClick={() => setOpen(false)}
        >
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-white/70">
              Mission Control · Ctrl+Alt+← →
            </div>
            <div className="flex items-center justify-center gap-6">
              {WORKSPACES.map((i) => {
                const wins = windows.filter(
                  (w) => w.workspace === i && !w.minimized,
                );
                const isSel = sel === i;
                return (
                  <motion.button
                    key={i}
                    layout
                    onClick={() => {
                      setWorkspace(i);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setSel(i)}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                      isSel
                        ? "border-accent shadow-[0_0_40px_-5px_oklch(var(--accent)/0.6)] scale-105"
                        : "border-white/20 opacity-70 hover:opacity-100"
                    }`}
                    style={{ width: 280, height: 175 }}
                  >
                    <img
                      src={WALLPAPERS[wallpaper]}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    {/* mini windows */}
                    {wins.map((w) => {
                      const scale = 280 / window.innerWidth;
                      return (
                        <div
                          key={w.id}
                          className="absolute rounded border border-white/40 bg-white/20 backdrop-blur-sm shadow-md"
                          style={{
                            left: w.x * scale,
                            top: w.y * scale,
                            width: w.w * scale,
                            height: w.h * scale,
                          }}
                        >
                          <div className="h-1.5 w-full rounded-t bg-white/40" />
                          <div className="px-1 pt-0.5 text-[6px] font-medium text-white/90 truncate">
                            {w.title}
                          </div>
                        </div>
                      );
                    })}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-white/90">
                        Desktop {i + 1}
                      </span>
                      <span className="text-white/60">
                        {wins.length} app{wins.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {i === active && (
                      <div className="absolute top-2 right-2 rounded-full bg-accent/90 px-2 py-0.5 text-[9px] font-bold text-accent-foreground">
                        ACTIVE
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-6 font-mono text-[10px] text-white/50">
              Enter to switch · Esc to cancel · release Ctrl+Alt to commit
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
