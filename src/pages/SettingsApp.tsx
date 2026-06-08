import { useOS, WALLPAPERS, type ThemeId } from "@/store/os";
import { achievements, profile } from "@/data/portfolio";
import {
  Check,
  Trophy,
  User as UserIcon,
  RefreshCw,
  HardDrive,
  Share2,
  LogIn,
  Globe,
  Calendar,
  Monitor,
  Volume2,
  VolumeX,
  Palette,
  Wallpaper as WallIcon,
  Bell,
  ShieldCheck,
  Cpu,
  Search,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import shivamWelcome from "@/assets/shivam-welcome.jpg";

type SectionId =
  | "appearance"
  | "wallpaper"
  | "accent"
  | "sound"
  | "notifications"
  | "privacy"
  | "about"
  | "software-update"
  | "storage"
  | "airdrop"
  | "login"
  | "language"
  | "datetime"
  | "sharing"
  | "achievements";

const themes: { id: ThemeId; name: string; swatch: string[] }[] = [
  {
    id: "indigo",
    name: "Midnight Indigo",
    swatch: ["#0a0a1a", "#141432", "#4f46e5", "#a78bfa"],
  },
  {
    id: "mint",
    name: "Neon Mint",
    swatch: ["#0d1b2a", "#1b4332", "#2dd4a8", "#73ffb8"],
  },
  {
    id: "ember",
    name: "Charcoal Ember",
    swatch: ["#1a1a1a", "#2d2d2d", "#e85d3a", "#f7931e"],
  },
  {
    id: "retro",
    name: "Retro Terminal",
    swatch: ["#000000", "#0a0a0a", "#00ff88", "#aaffcc"],
  },
];

const accents = [290, 250, 200, 160, 80, 40, 20, 340];

const groups: {
  items: {
    id: SectionId;
    label: string;
    Icon: typeof UserIcon;
    color: string;
  }[];
}[] = [
  {
    items: [
      { id: "about", label: "About", Icon: Cpu, color: "bg-gray-500" },
      {
        id: "software-update",
        label: "Software Update",
        Icon: RefreshCw,
        color: "bg-blue-500",
      },
      {
        id: "storage",
        label: "Storage",
        Icon: HardDrive,
        color: "bg-blue-500",
      },
      {
        id: "airdrop",
        label: "AirDrop & Handoff",
        Icon: Share2,
        color: "bg-blue-500",
      },
      { id: "login", label: "Login Items", Icon: LogIn, color: "bg-gray-500" },
    ],
  },
  {
    items: [
      {
        id: "language",
        label: "Language & Region",
        Icon: Globe,
        color: "bg-gray-500",
      },
      {
        id: "datetime",
        label: "Date & Time",
        Icon: Calendar,
        color: "bg-gray-500",
      },
      { id: "sharing", label: "Sharing", Icon: Share2, color: "bg-blue-500" },
    ],
  },
  {
    items: [
      {
        id: "appearance",
        label: "Appearance",
        Icon: Monitor,
        color: "bg-black",
      },
      {
        id: "wallpaper",
        label: "Wallpaper",
        Icon: WallIcon,
        color: "bg-indigo-500",
      },
      {
        id: "accent",
        label: "Accent Color",
        Icon: Palette,
        color: "bg-pink-500",
      },
      { id: "sound", label: "Sound", Icon: Volume2, color: "bg-pink-500" },
      {
        id: "notifications",
        label: "Notifications",
        Icon: Bell,
        color: "bg-red-500",
      },
      {
        id: "privacy",
        label: "Privacy & Security",
        Icon: ShieldCheck,
        color: "bg-blue-600",
      },
      {
        id: "achievements",
        label: "Achievements",
        Icon: Trophy,
        color: "bg-amber-500",
      },
    ],
  },
];

export function SettingsApp() {
  const [section, setSection] = useState<SectionId>("about");
  const [query, setQuery] = useState("");
  const filtered = groups
    .map((g) => ({
      items: g.items.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length);

  return (
    <div className="flex h-full bg-titlebar/40">
      <aside className="w-56 shrink-0 overflow-auto border-r border-glass-border bg-black/30 p-2">
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/5 p-2">
          <img
            src={shivamWelcome}
            alt={profile.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{profile.name}</div>
            <div className="truncate text-[10px] text-muted-foreground">
              Apple ID, iCloud…
            </div>
          </div>
        </div>

        <div className="mb-2 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 text-xs">
          <Search className="h-3 w-3 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none"
          />
        </div>

        {filtered.map((g, gi) => (
          <div
            key={gi}
            className={gi > 0 ? "mt-2 border-t border-glass-border pt-2" : ""}
          >
            {g.items.map((it) => {
              const active = section === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setSection(it.id)}
                  className={
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs " +
                    (active
                      ? "bg-accent/80 text-accent-foreground"
                      : "hover:bg-white/5")
                  }
                >
                  <span
                    className={
                      "grid h-5 w-5 place-items-center rounded text-white " +
                      it.color
                    }
                  >
                    <it.Icon className="h-3 w-3" />
                  </span>
                  <span>{it.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      <div className="flex-1 overflow-auto p-6">
        <Content section={section} />
      </div>
    </div>
  );
}

function Content({ section }: { section: SectionId }) {
  const theme = useOS((s) => s.theme);
  const setTheme = useOS((s) => s.setTheme);
  const wallpaper = useOS((s) => s.wallpaper);
  const setWallpaper = useOS((s) => s.setWallpaper);
  const accent = useOS((s) => s.accentHue);
  const setAccent = useOS((s) => s.setAccentHue);
  const unlocked = useOS((s) => s.unlocked);
  const muted = useOS((s) => s.muted);
  const toggleMute = useOS((s) => s.toggleMute);

  switch (section) {
    case "about":
      return (
        <Section title="About">
          <Card>
            <Row k="Name" v="Shivam OS" />
            <Row k="Version" v="3.14.1 (Glassmorphism)" />
            <Row k="Chip" v="Apple M-Shivam React Edition" />
            <Row k="Memory" v="16 GB (Heap-allocated)" />
            <Row k="Startup Disk" v="Macintosh HD" />
            <Row k="Serial Number" v="SHIVAM-2026-OS" />
          </Card>
          <Card title="System Report">
            <p className="text-xs text-muted-foreground">
              Built with React 19, TypeScript, Tailwind, Zustand & Framer
              Motion. Designed and engineered by Shivam Singh.
            </p>
          </Card>
        </Section>
      );
    case "software-update":
      return (
        <Section title="Software Update">
          <Card>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-accent" />
              <div>
                <div className="font-semibold">Your system is up to date.</div>
                <div className="text-xs text-muted-foreground">
                  Shivam OS 3.14.1 — last checked just now
                </div>
              </div>
              <button className="ml-auto rounded-md border border-glass-border px-3 py-1.5 text-xs hover:bg-white/5">
                Check Again
              </button>
            </div>
          </Card>
        </Section>
      );
    case "storage":
      return (
        <Section title="Storage">
          <Card>
            <div className="h-4 w-full overflow-hidden rounded-full bg-white/10">
              <div className="flex h-full">
                <div className="bg-blue-500" style={{ width: "32%" }} />
                <div className="bg-emerald-500" style={{ width: "18%" }} />
                <div className="bg-amber-500" style={{ width: "12%" }} />
                <div className="bg-pink-500" style={{ width: "8%" }} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
              <Bar c="bg-blue-500" l="Applications" v="82.4 GB" />
              <Bar c="bg-emerald-500" l="Documents" v="46.1 GB" />
              <Bar c="bg-amber-500" l="Photos" v="30.8 GB" />
              <Bar c="bg-pink-500" l="System Data" v="20.5 GB" />
              <Bar c="bg-white/30" l="Available" v="332 GB" />
            </div>
          </Card>
        </Section>
      );
    case "airdrop":
      return (
        <Section title="AirDrop & Handoff">
          <Card>
            <Toggle label="AirDrop" hint="Contacts Only" />
            <Toggle label="Handoff between this Mac and your iCloud devices" />
          </Card>
        </Section>
      );
    case "login":
      return (
        <Section title="Login Items">
          <Card>
            <Row k="Open at Login" v="Welcome.app" />
            <Row k="Open at Login" v="Terminal" />
          </Card>
        </Section>
      );
    case "language":
      return (
        <Section title="Language & Region">
          <Card>
            <Row k="Preferred Language" v="English (India)" />
            <Row k="Region" v="India" />
            <Row k="Time Format" v="24-Hour" />
          </Card>
        </Section>
      );
    case "datetime":
      return (
        <Section title="Date & Time">
          <Card>
            <Row k="Set automatically" v="On" />
            <Row k="Time Zone" v="Asia/Kolkata (GMT+5:30)" />
            <Row k="Current Time" v={new Date().toLocaleString()} />
          </Card>
        </Section>
      );
    case "sharing":
      return (
        <Section title="Sharing">
          <Card>
            <Toggle label="Screen Sharing" />
            <Toggle label="File Sharing" />
            <Toggle label="Printer Sharing" />
          </Card>
        </Section>
      );
    case "appearance":
      return (
        <Section title="Appearance">
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={
                  "flex items-center gap-2 rounded-lg border p-3 text-left text-xs hover:bg-white/5 " +
                  (theme === t.id ? "border-accent" : "border-glass-border")
                }
              >
                <div className="flex h-10 w-10 overflow-hidden rounded-md">
                  {t.swatch.map((c, i) => (
                    <div key={i} style={{ background: c }} className="flex-1" />
                  ))}
                </div>
                <span className="font-medium">{t.name}</span>
                {theme === t.id && (
                  <Check className="ml-auto h-3 w-3 text-accent" />
                )}
              </button>
            ))}
          </div>
        </Section>
      );
    case "wallpaper":
      return (
        <Section title="Wallpaper">
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(WALLPAPERS).map(([k, src]) => (
              <button
                key={k}
                onClick={() => setWallpaper(k as keyof typeof WALLPAPERS)}
                className={
                  "relative aspect-video overflow-hidden rounded-lg border " +
                  (wallpaper === k
                    ? "border-accent ring-2 ring-accent/50"
                    : "border-glass-border")
                }
              >
                {src ? (
                  <img
                    src={src}
                    alt={k}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-background text-[10px] text-muted-foreground">
                    Solid
                  </div>
                )}
                <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] capitalize">
                  {k}
                </span>
              </button>
            ))}
          </div>
        </Section>
      );
    case "accent":
      return (
        <Section title="Accent Color">
          <Card>
            <div className="flex flex-wrap gap-3">
              {accents.map((h) => (
                <button
                  key={h}
                  onClick={() => setAccent(h)}
                  className={
                    "h-10 w-10 rounded-full border-2 transition " +
                    (accent === h
                      ? "border-foreground scale-110"
                      : "border-transparent")
                  }
                  style={{ background: `oklch(0.7 0.2 ${h})` }}
                  title={`hue ${h}`}
                />
              ))}
            </div>
          </Card>
        </Section>
      );
    case "sound":
      return (
        <Section title="Sound">
          <Card>
            <div className="flex items-center gap-3">
              {muted ? (
                <VolumeX className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Volume2 className="h-8 w-8 text-accent" />
              )}
              <div>
                <div className="font-semibold">System Sound Effects</div>
                <div className="text-xs text-muted-foreground">
                  Click, key, and notification sounds
                </div>
              </div>
              <button
                onClick={toggleMute}
                className="ml-auto rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110"
              >
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
          </Card>
        </Section>
      );
    case "notifications":
      return (
        <Section title="Notifications">
          <Card>
            <Toggle label="Allow notifications" defaultOn />
            <Toggle label="Show previews" defaultOn />
            <Toggle label="Play sound for notifications" defaultOn />
          </Card>
        </Section>
      );
    case "privacy":
      return (
        <Section title="Privacy & Security">
          <Card>
            <Row k="FileVault" v="On" />
            <Row k="Firewall" v="Active" />
            <Row k="Lockdown Mode" v="Off" />
          </Card>
        </Section>
      );
    case "achievements":
      return (
        <Section title="Achievements">
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => {
              const got = unlocked.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={
                    "flex items-center gap-2 rounded-md border p-2 text-xs " +
                    (got
                      ? "border-accent/50 bg-accent/10"
                      : "border-glass-border opacity-50")
                  }
                >
                  <Trophy
                    className={
                      "h-3.5 w-3.5 " +
                      (got ? "text-accent" : "text-muted-foreground")
                    }
                  />
                  <span>{a.label}</span>
                  {got && <Check className="ml-auto h-3 w-3 text-accent" />}
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {unlocked.length} / {achievements.length} unlocked
          </div>
        </Section>
      );
  }
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-glass-border bg-white/5 p-4">
      {title && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-glass-border/50 py-2 text-xs last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{v}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
      </div>
    </div>
  );
}

function Bar({ c, l, v }: { c: string; l: string; v: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={"h-2.5 w-2.5 rounded-sm " + c} />
      <span>{l}</span>
      <span className="ml-auto text-muted-foreground">{v}</span>
    </div>
  );
}

function Toggle({
  label,
  hint,
  defaultOn,
}: {
  label: string;
  hint?: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between border-b border-glass-border/50 py-2 text-xs last:border-0">
      <div>
        <div>{label}</div>
        {hint && (
          <div className="text-[10px] text-muted-foreground">{hint}</div>
        )}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={
          "relative h-5 w-9 rounded-full transition " +
          (on ? "bg-emerald-500" : "bg-white/15")
        }
      >
        <span
          className={
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition " +
            (on ? "left-4" : "left-0.5")
          }
        />
      </button>
    </div>
  );
}
