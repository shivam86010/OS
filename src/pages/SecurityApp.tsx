import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ScanLine, BugPlay, Trash2 } from "lucide-react";
import { useOS } from "@/store/os";

const FAKE_FILES = [
  "/system/kernel.dll",
  "/usr/lib/react.so",
  "/usr/local/zustand.js",
  "/system/tailwind.css",
  "/var/log/console.log",
  "/etc/portfolio.conf",
  "/home/recruiter/notes.txt",
  "/system/framer-motion.bin",
  "/temp/internet_explorer.exe",
  "/temp/spaghetti_code.legacy",
  "/system/typescript.ts",
  "/var/cache/dom-fiber.cache",
];

const THREATS = [
  {
    name: "internet_explorer.exe",
    severity: "🔴 CRITICAL",
    note: "Legacy 1995 malware. Recommended: Delete.",
  },
  {
    name: "spaghetti_code.legacy",
    severity: "🟠 HIGH",
    note: "Unmaintainable nested if-statements detected.",
  },
];

type Phase = "idle" | "scanning" | "done";

export function SecurityApp() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [quarantined, setQuarantined] = useState<string[]>([]);
  const unlock = useOS((s) => s.unlock);
  const notify = useOS((s) => s.notify);

  async function startScan() {
    setPhase("scanning");
    setProgress(0);
    setQuarantined([]);
    for (let i = 0; i < FAKE_FILES.length; i++) {
      setCurrentFile(FAKE_FILES[i]);
      setProgress(Math.round(((i + 1) / FAKE_FILES.length) * 100));
      await new Promise((r) => setTimeout(r, 220));
    }
    setPhase("done");
    notify({
      title: "🛡️ Scan complete",
      body: `${THREATS.length} threats detected`,
    });
  }

  function quarantine(name: string) {
    setQuarantined((q) => [...q, name]);
    if (name === "internet_explorer.exe") {
      unlock("easter");
      notify({
        title: "🏆 Achievement",
        body: "Quarantined Internet Explorer (the world thanks you)",
      });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-window-border bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 px-4 py-3">
        <ShieldCheck className="h-7 w-7 text-emerald-300" />
        <div>
          <h2 className="font-display text-base font-semibold">
            Shivam OS Security Center
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Real-time protection against bugs, legacy code, and bad UX.
          </p>
        </div>
        <button
          onClick={startScan}
          disabled={phase === "scanning"}
          className="ml-auto flex items-center gap-2 rounded-lg bg-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/50 disabled:opacity-50"
        >
          <ScanLine className="h-3.5 w-3.5" />{" "}
          {phase === "scanning"
            ? "Scanning…"
            : phase === "done"
              ? "Rescan"
              : "Scan System"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 scrollbar-thin">
        {phase === "idle" && (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <ShieldCheck className="mx-auto mb-2 h-14 w-14 text-emerald-400/70" />
              <p>
                System status: <span className="text-emerald-300">Healthy</span>
              </p>
              <p className="mt-1 text-xs">
                Click <strong className="text-foreground">Scan System</strong>{" "}
                to check 12,847 files.
              </p>
            </div>
          </div>
        )}

        {phase === "scanning" && (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs">
              <span>Scanning files…</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400"
              />
            </div>
            <div className="rounded-lg bg-black/40 p-3 font-mono text-[11px] text-emerald-200/80">
              <div>→ Checking {currentFile}</div>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              {THREATS.length} threats detected:
            </h3>
            {THREATS.map((t) => {
              const isGone = quarantined.includes(t.name);
              return (
                <div
                  key={t.name}
                  className={`flex items-center gap-3 rounded-lg border border-window-border p-3 ${isGone ? "opacity-50" : "bg-rose-500/10"}`}
                >
                  <BugPlay
                    className={`h-5 w-5 ${isGone ? "text-emerald-400" : "text-rose-300"}`}
                  />
                  <div className="flex-1">
                    <p className="font-mono text-xs">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.severity} — {t.note}
                    </p>
                  </div>
                  {isGone ? (
                    <span className="text-xs text-emerald-300">
                      ✓ Quarantined
                    </span>
                  ) : (
                    <button
                      onClick={() => quarantine(t.name)}
                      className="flex items-center gap-1 rounded bg-rose-500/30 px-2 py-1 text-xs hover:bg-rose-500/50"
                    >
                      <Trash2 className="h-3 w-3" /> Quarantine
                    </button>
                  )}
                </div>
              );
            })}
            {quarantined.length === THREATS.length && (
              <p className="rounded-lg bg-emerald-500/20 p-3 text-xs text-emerald-200">
                ✨ All threats neutralized. Your system is now spaghetti-free.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
