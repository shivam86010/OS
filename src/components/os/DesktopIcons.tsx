import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  User,
  FolderKanban,
  FileText,
  TerminalSquare,
  Bot,
  Mail,
  Activity,
  Settings,
  Trash2,
  Lock,
  Folder,
  Palette,
  ShieldCheck,
  Github,
  Music,
} from "lucide-react";
import { useOS, type AppId } from "../../store/os";
import { sfx } from "../../lib/sound";

type BaseIcon = {
  app: AppId;
  label: string;
  emoji?: string;
  Icon?: typeof User;
  color: string;
  removable?: boolean;
  gated?: boolean;
};

const coreIcons: BaseIcon[] = [
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
    app: "github",
    label: "GitCommit",
    Icon: Github,
    color: "from-zinc-700 to-emerald-700",
  },
  {
    app: "beats",
    label: "ShivamBeats",
    Icon: Music,
    color: "from-purple-500 to-fuchsia-600",
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
    Icon: Settings,
    color: "from-slate-400 to-slate-600",
  },
];

export function DesktopIcons() {
  const openApp = useOS((s) => s.openApp);
  const sortKey = useOS((s) => s.iconSortKey);
  const packages = useOS((s) => s.packages);
  const hidden = useOS((s) => s.hiddenExtras);
  const trashIcon = useOS((s) => s.trashIcon);
  const trash = useOS((s) => s.trash);
  const emptyTrash = useOS((s) => s.emptyTrash);
  const user = useOS((s) => s.user);
  const [dragOverTrash, setDragOverTrash] = useState(false);

  const icons = useMemo<BaseIcon[]>(() => {
    const installed = Object.values(packages)
      .filter((p) => p.installed && !hidden.includes(p.id))
      .map<BaseIcon>((p) => ({
        app: p.id as AppId,
        label: p.name,
        emoji: p.icon,
        color: "from-fuchsia-500 to-purple-600",
        removable: true,
      }));
    const vault: BaseIcon[] =
      user !== "guest"
        ? [
            {
              app: "secretvault",
              label: "🔒 Vault",
              Icon: Lock,
              color: "from-amber-500 to-rose-600",
              gated: true,
            },
          ]
        : [];
    const arr = [...coreIcons, ...vault, ...installed];
    if (sortKey === 0) return arr;
    return [...arr].sort((a, b) =>
      sortKey % 2 === 1
        ? a.label.localeCompare(b.label)
        : b.label.localeCompare(a.label),
    );
  }, [sortKey, packages, hidden, user]);

  return (
    <>
      <div className="absolute left-4 top-12 z-10 grid grid-cols-1 gap-3">
        {icons.map(({ app, label, emoji, Icon, color, removable }, i) => (
          <motion.button
            key={`${app}-${label}`}
            layout
            draggable={removable}
            onDragStart={(e) => {
              if (!removable) return;
              (e as unknown as React.DragEvent).dataTransfer.setData(
                "text/x-icon",
                app,
              );
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.04 }}
            onClick={() => sfx.click()}
            onDoubleClick={() => openApp(app)}
            className="group flex w-20 flex-col items-center gap-1 rounded-lg p-2 text-center hover:bg-white/10 focus:bg-white/15 focus:outline-none"
          >
            <div
              className={`grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${color} shadow-lg`}
            >
              {emoji ? (
                <span className="text-2xl">{emoji}</span>
              ) : Icon ? (
                <Icon className="h-6 w-6 text-white" />
              ) : null}
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-md">
              {label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Trash bin */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverTrash(true);
        }}
        onDragLeave={() => setDragOverTrash(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverTrash(false);
          const id = e.dataTransfer.getData("text/x-icon");
          if (id) trashIcon(id);
        }}
        onDoubleClick={() => {
          if (trash.length) emptyTrash();
        }}
        title={
          trash.length
            ? `${trash.length} item(s) — double-click to empty`
            : "Trash"
        }
        className={`absolute bottom-24 right-4 z-10 flex w-20 flex-col items-center gap-1 rounded-lg p-2 transition-all ${dragOverTrash ? "scale-110 bg-rose-500/20 ring-2 ring-rose-400" : "hover:bg-white/10"}`}
      >
        <div className="relative grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg">
          <Trash2 className="h-6 w-6 text-white" />
          {trash.length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {trash.length}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-white drop-shadow-md">
          Trash
        </span>
      </div>
    </>
  );
}
