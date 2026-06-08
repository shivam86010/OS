import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useOS } from "../../store/os";

// Matrix-rain screensaver triggered after 90s of inactivity.
export function Screensaver() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wake = useOS((s) => s.wake);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const cols = Math.floor(window.innerWidth / 14);
    const drops = Array(cols).fill(1);
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノ01<>{}[]/*";
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(8, 8, 16, 0.08)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#22d3ee";
      ctx.font = "14px monospace";
      for (let i = 0; i < drops.length; i++) {
        const t = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(t, i * 14, drops[i] * 14);
        if (drops[i] * 14 > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] cursor-pointer bg-black"
      onClick={wake}
      onMouseMove={wake}
      onKeyDown={wake}
      tabIndex={0}
    >
      <canvas ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-center font-mono text-cyan-200/80">
        <div className="text-3xl tracking-widest">SHIVAM OS — IDLE</div>
        <div className="mt-2 text-xs opacity-60">
          click or move mouse to resume
        </div>
      </div>
    </motion.div>
  );
}
