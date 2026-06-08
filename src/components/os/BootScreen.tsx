import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOS } from '../../store/os'

const lines = [
  "BOOT v3.14 — Shivam OS",
  "POST: CPU OK · MEM OK · GPU OK",
  "Loading kernel modules...",
  "Mounting /experience...",
  "Loading React Runtime 19.0...",
  "Initializing components...",
  "Connecting Experience Database...",
  "Loading Projects (4)...",
  "Hydrating Skills.exe...",
  "Starting WindowManager...",
  "Welcome, recruiter.",
];

export function BootScreen() {
  const setBooted = useOS((s) => s.setBooted);
  const openApp = useOS((s) => s.openApp);
  const unlock = useOS((s) => s.unlock);
  const [shown, setShown] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setShown((s) => [...s, lines[i]]);
      setProgress(((i + 1) / lines.length) * 100);
      i++;
      if (i >= lines.length) {
        clearInterval(id);
        setTimeout(() => {
          setBooted(true);
          unlock("boot");
          openApp("welcome");
        }, 600);
      }
    }, 220);
    return () => clearInterval(id);
  }, [setBooted, openApp, unlock]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.3_0.1_290/0.4),transparent_60%)]" />
      <div className="relative w-[560px] max-w-[92vw] font-mono text-sm">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-md border border-glass-border bg-accent/20 text-accent">
            <span className="font-display text-lg font-bold">S</span>
          </div>
          <div>
            <div className="font-display text-xl font-semibold tracking-tight">
              Shivam OS
            </div>
            <div className="text-xs text-muted-foreground">
              version 3.14 · build {new Date().getFullYear()}
            </div>
          </div>
        </motion.div>

        <div className="min-h-[220px] space-y-1">
          {shown.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-muted-foreground"
            >
              <span className="text-accent">›</span> {l}
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Loading</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
