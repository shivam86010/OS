import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User as UserIcon,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useOS, type UserKind } from "../../store/os";
import { sfx } from "../../lib/sound";

const PROFILES: {
  id: UserKind;
  name: string;
  subtitle: string;
  icon: typeof UserIcon;
  gradient: string;
  needsPassword: boolean;
  hint?: string;
}[] = [
  {
    id: "guest",
    name: "Guest",
    subtitle: "Standard access",
    icon: UserIcon,
    gradient: "from-sky-400 to-indigo-500",
    needsPassword: false,
  },
  {
    id: "recruiter",
    name: "Recruiter",
    subtitle: "Hire mode • password required",
    icon: Briefcase,
    gradient: "from-amber-400 to-rose-500",
    needsPassword: true,
    hint: "Try RECRUITER or HIREME",
  },
  {
    id: "admin",
    name: "Admin",
    subtitle: "Root developer mode",
    icon: ShieldCheck,
    gradient: "from-emerald-400 to-cyan-500",
    needsPassword: true,
    hint: "// hint: every root command starts with this 4-letter word",
  },
];

export function LockScreen() {
  const login = useOS((s) => s.login);
  const [now, setNow] = useState<Date | null>(null);
  const [selected, setSelected] = useState<UserKind | null>(null);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const profile = PROFILES.find((p) => p.id === selected) ?? null;

  function submit() {
    if (!profile) return;
    sfx.click();
    if (!profile.needsPassword) {
      finish(profile.id, false);
      return;
    }
    const v = pwd.trim().toUpperCase();
    if (profile.id === "recruiter" && (v === "RECRUITER" || v === "HIREME")) {
      finish("recruiter", false);
    } else if (profile.id === "admin" && (v === "SUDO" || v === "ROOT")) {
      finish("admin", true);
    } else {
      setError("Access denied. Permission check failed.");
      sfx.crash();
      setTimeout(() => setError(null), 1800);
    }
  }

  function finish(u: UserKind, root: boolean) {
    setUnlocking(true);
    sfx.boot();
    setTimeout(
      () =>
        login(
          u,
          u === "guest" ? "Guest" : u === "recruiter" ? "Recruiter" : "Root",
          root,
        ),
      600,
    );
  }

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden bg-black">
      {/* Dynamic gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.35_0.18_290/0.6),transparent_55%),radial-gradient(circle_at_80%_85%,oklch(0.4_0.2_200/0.45),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,oklch(0_0_0/0.5))]" />
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1_0_0/0.6) 1px,transparent 1px),linear-gradient(90deg,oklch(1_0_0/0.6) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <AnimatePresence mode="wait">
        {unlocking && (
          <motion.div
            key="unlock"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 grid place-items-center bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-mono text-emerald-300"
            >
              Unlocking session…
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col">
        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center pt-20 text-white"
        >
          <div className="font-display text-[96px] font-light leading-none tabular-nums tracking-tight drop-shadow-2xl">
            {now
              ? now.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "--:--"}
          </div>
          <div className="mt-2 text-sm font-medium uppercase tracking-[0.4em] text-white/70">
            {now
              ? now.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "\u00a0"}
          </div>
        </motion.div>

        {/* Profiles */}
        <div className="flex flex-1 items-center justify-center px-4">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {PROFILES.map((p) => (
                  <motion.button
                    key={p.id}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      sfx.click();
                      setSelected(p.id);
                      setError(null);
                      setPwd("");
                    }}
                    className="group flex w-56 flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-colors hover:bg-white/10"
                  >
                    <div
                      className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${p.gradient} shadow-2xl ring-2 ring-white/30`}
                    >
                      <p.icon className="h-9 w-9 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-display text-lg font-semibold text-white">
                        {p.name}
                      </div>
                      <div className="text-xs text-white/60">{p.subtitle}</div>
                    </div>
                    {p.needsPassword && (
                      <Lock className="h-3.5 w-3.5 text-white/40" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={selected}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-[360px] rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
              >
                {(() => {
                  const Icon = profile!.icon;
                  return (
                    <div
                      className={`mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${profile!.gradient} shadow-2xl ring-2 ring-white/30`}
                    >
                      <Icon className="h-9 w-9 text-white" />
                    </div>
                  );
                })()}
                <div className="mt-3 font-display text-xl font-semibold text-white">
                  {profile!.name}
                </div>
                <div className="text-xs text-white/60">{profile!.subtitle}</div>

                {profile!.needsPassword ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                    className="mt-6"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2">
                      <Lock className="h-4 w-4 text-white/60" />
                      <input
                        autoFocus
                        type="password"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="Enter password"
                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                      />
                      <button
                        type="submit"
                        className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {profile!.hint && (
                      <div className="mt-3 font-mono text-[10px] text-white/40">
                        {profile!.hint}
                      </div>
                    )}
                    {error && (
                      <div className="mt-2 text-xs text-rose-300">{error}</div>
                    )}
                  </form>
                ) : (
                  <button
                    onClick={submit}
                    className="mt-6 w-full rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
                  >
                    Log in →
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="mt-4 text-xs text-white/50 hover:text-white"
                >
                  ← Switch user
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pb-6 text-center text-[11px] uppercase tracking-[0.3em] text-white/40">
          Shivam OS · v3.14 · swipe up to unlock
        </div>
      </div>
    </div>
  );
}
