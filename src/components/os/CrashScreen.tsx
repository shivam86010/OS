import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const lines = [
  ":( Your Mac ran into a problem and needs to restart.",
  "We're just collecting some error info, and then we'll restart for you.",
  "",
  "STOP CODE: 0x000DEADBEEF — SHIVAM_OS_PANIC",
  "Module: file_system_destroyer.kext",
  "Reason: User executed `rm -rf /`. Bold move.",
  "",
  "If you'd like to know more, you can search online later for this error: SHIVAM_OS_PANIC",
  "",
  "Don't worry — no real files were harmed. Rebooting in 5 seconds…",
];

export function CrashScreen() {
  const [shown, setShown] = useState(0);
  const [count, setCount] = useState(5);

  useEffect(() => {
    const t = setInterval(
      () => setShown((s) => Math.min(lines.length, s + 1)),
      220,
    );
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-start justify-center px-12 font-mono text-[15px] leading-relaxed text-white"
      style={{
        background:
          "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #831843 100%)",
      }}
    >
      <motion.div
        animate={{ x: [0, -3, 3, -2, 2, 0] }}
        transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
        className="text-7xl font-display font-bold tracking-tight"
      >
        :(
      </motion.div>
      <div className="mt-6 max-w-2xl space-y-1">
        {lines.slice(0, shown).map((l, i) => (
          <div
            key={i}
            className={
              l.startsWith("STOP")
                ? "text-pink-300 font-semibold"
                : "text-white/90"
            }
          >
            {l || "\u00A0"}
          </div>
        ))}
      </div>
      <div className="mt-8 text-3xl font-mono tabular-nums text-fuchsia-200">
        REBOOT IN {count}s
      </div>
      <div className="absolute bottom-8 left-12 right-12 h-1 overflow-hidden rounded bg-white/10">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-fuchsia-300"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0 1px, transparent 1px 3px)",
        }}
      />
    </motion.div>
  );
}
