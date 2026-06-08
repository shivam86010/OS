import { motion } from "framer-motion";
import {
  User,
  FolderKanban,
  BarChart3,
  Briefcase,
  FileText,
  TerminalSquare,
  Bot,
  Mail,
  Settings as SettingsIcon,
  Sparkles,
  Activity,
  Folder,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { useOS, type AppId } from "../../store/os";
import { cn } from "../../lib/utils";

const items: { app: AppId; label: string; Icon: typeof User; color: string }[] =
  [
    {
      app: "welcome",
      label: "Welcome",
      Icon: Sparkles,
      color: "from-pink-400 to-purple-500",
    },
    {
      app: "about",
      label: "About.exe",
      Icon: User,
      color: "from-sky-400 to-indigo-500",
    },
    {
      app: "files",
      label: "Files",
      Icon: Folder,
      color: "from-amber-300 to-yellow-500",
    },
    {
      app: "projects",
      label: "Projects",
      Icon: FolderKanban,
      color: "from-amber-400 to-orange-500",
    },
    {
      app: "skills",
      label: "Skills.exe",
      Icon: BarChart3,
      color: "from-emerald-400 to-teal-500",
    },
    {
      app: "experience",
      label: "Experience.exe",
      Icon: Briefcase,
      color: "from-violet-400 to-fuchsia-500",
    },
    {
      app: "resume",
      label: "Resume.pdf",
      Icon: FileText,
      color: "from-slate-300 to-slate-500",
    },
    {
      app: "terminal",
      label: "Terminal",
      Icon: TerminalSquare,
      color: "from-zinc-700 to-zinc-900",
    },
    {
      app: "paint",
      label: "Paint",
      Icon: Palette,
      color: "from-fuchsia-400 to-purple-600",
    },
    {
      app: "security",
      label: "Security",
      Icon: ShieldCheck,
      color: "from-emerald-500 to-cyan-500",
    },
    {
      app: "shivamgpt",
      label: "ShivamGPT",
      Icon: Bot,
      color: "from-emerald-400 to-cyan-500",
    },
    {
      app: "contact",
      label: "Mail",
      Icon: Mail,
      color: "from-rose-400 to-pink-500",
    },
    {
      app: "taskmanager",
      label: "Task Manager",
      Icon: Activity,
      color: "from-cyan-400 to-blue-500",
    },
    {
      app: "settings",
      label: "Settings",
      Icon: SettingsIcon,
      color: "from-slate-400 to-slate-600",
    },
  ];

export function Dock() {
  const openApp = useOS((s) => s.openApp);
  const windows = useOS((s) => s.windows);
  return (
    <div
      data-os-dock
      className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 18 }}
        className="pointer-events-auto flex items-end gap-2 rounded-2xl px-3 py-2 glass shadow-window"
        style={{ background: "var(--dock, var(--glass))" }}
      >
        {items.map(({ app, label, Icon, color }) => {
          const open = windows.some((w) => w.app === app);
          return (
            <motion.button
              key={app}
              whileHover={{ scale: 1.18, y: -8 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => openApp(app)}
              className="group relative flex flex-col items-center"
              title={label}
            >
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br shadow-lg",
                  color,
                )}
              >
                <Icon className="h-6 w-6 text-white drop-shadow" />
              </div>
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100">
                {label}
              </span>
              {open && (
                <span className="mt-1 h-1 w-1 rounded-full bg-foreground" />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
