import { create } from "zustand";
import { achievements as ACHIEVEMENTS } from "@/data/portfolio";
import { sfx, setMuted } from "@/lib/sound";
import { loadVFS, vfsCreate as _create, vfsDelete as _delete, vfsRename as _rename, vfsWrite as _write, type VFS, type VNodeKind } from "@/lib/vfs";

import wallpaperIndigo from "@/assets/wallpaper-indigo.jpg";
import wallpaperMint from "@/assets/wallpaper-mint.jpg";
import wallpaperEmber from "@/assets/wallpaper-ember.jpg";

export type AppId =
  | "welcome" | "about" | "projects" | "skills" | "experience"
  | "resume" | "terminal" | "shivamgpt" | "contact" | "settings" | "taskmanager"
  | "doom" | "snake" | "secretvault"
  | "files" | "notepad" | "paint" | "security"
  | "github" | "beats";

export type UserKind = "guest" | "recruiter" | "admin";

export interface WindowState {
  id: string;
  app: AppId;
  title: string;
  x: number; y: number; w: number; h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  workspace: number;
  prev?: { x: number; y: number; w: number; h: number };
}

export type ThemeId = "indigo" | "mint" | "ember" | "retro";
export const WALLPAPERS: Record<string, string> = {
  indigo: wallpaperIndigo,
  mint: wallpaperMint,
  ember: wallpaperEmber,
  none: "",
};

export interface Notification { id: string; title: string; body?: string; ts: number; }

export interface InstallableApp {
  id: AppId;
  name: string;
  icon: string;
  description: string;
  installed: boolean;
}

export type WidgetKind = "clock" | "sticky" | "cpu";
export interface Widget { id: string; kind: WidgetKind; x: number; y: number; data?: unknown; }

export interface Clipboard { type: "text" | "file" | null; data: string | null; }

const WIDGETS_KEY = "shivam-os:widgets:v1";
function loadWidgets(): Widget[] {
  if (typeof window === "undefined") return defaultWidgets();
  try {
    const raw = localStorage.getItem(WIDGETS_KEY);
    if (!raw) return defaultWidgets();
    return JSON.parse(raw) as Widget[];
  } catch { return defaultWidgets(); }
}
function defaultWidgets(): Widget[] {
  return [
    { id: "w-clock", kind: "clock", x: 24, y: 80 },
    { id: "w-cpu", kind: "cpu", x: 24, y: 320 },
  ];
}
function persistWidgets(ws: Widget[]) { try { localStorage.setItem(WIDGETS_KEY, JSON.stringify(ws)); } catch { /* noop */ } }

interface OSState {
  user: UserKind | null;
  username: string | null;
  isRoot: boolean;
  booted: boolean;
  crashed: boolean;
  muted: boolean;
  windows: WindowState[];
  topZ: number;
  focused: string | null;
  theme: ThemeId;
  wallpaper: keyof typeof WALLPAPERS;
  wallpaperAuto: boolean;
  accentHue: number;
  unlocked: string[];
  notifications: Notification[];
  iconSortKey: number;
  activeWorkspace: number;
  packages: Record<string, InstallableApp>;
  trash: string[];
  hiddenExtras: string[];
  // new
  vfs: VFS;
  openFileId: string | null;
  widgets: Widget[];
  clipboard: Clipboard;
  isIdle: boolean;
  lastActivity: number;
  // actions
  login: (u: UserKind, username?: string, root?: boolean) => void;
  logout: () => void;
  setBooted: (b: boolean) => void;
  triggerCrash: () => void;
  rebootFromCrash: () => void;
  toggleMute: () => void;
  openApp: (app: AppId, opts?: { title?: string }) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  setTheme: (t: ThemeId) => void;
  setWallpaper: (w: keyof typeof WALLPAPERS) => void;
  setWallpaperAuto: (auto: boolean) => void;
  cycleWallpaper: () => void;
  sortIcons: () => void;
  setAccentHue: (h: number) => void;
  unlock: (id: string) => void;
  notify: (n: Omit<Notification, "id" | "ts">) => void;
  dismissNotification: (id: string) => void;
  setWorkspace: (i: number) => void;
  moveWindowToWorkspace: (id: string, i: number) => void;
  installPackage: (id: string) => void;
  trashIcon: (id: string) => void;
  emptyTrash: () => void;
  // VFS
  vfsCreate: (parentId: string, name: string, kind: VNodeKind, content?: string) => void;
  vfsDelete: (id: string) => void;
  vfsRename: (id: string, name: string) => void;
  vfsWrite: (id: string, content: string) => void;
  openFile: (id: string) => void;
  // widgets
  addWidget: (kind: WidgetKind) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, x: number, y: number) => void;
  updateWidget: (id: string, data: unknown) => void;
  // clipboard
  copyToClipboard: (type: "text" | "file", data: string) => void;
  // idle
  setIdle: (idle: boolean) => void;
  wake: () => void;
  // snap
  snapPreview: { x: number; y: number; w: number; h: number } | null;
  setSnapPreview: (s: { x: number; y: number; w: number; h: number } | null) => void;
  snapWindow: (id: string, side: "left" | "right" | "max" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight") => void;
}

const APP_TITLES: Record<AppId, string> = {
  welcome: "Welcome",
  about: "About.exe",
  projects: "Projects — Finder",
  skills: "Skills.exe",
  experience: "Experience.exe",
  resume: "Resume.pdf",
  terminal: "Terminal — zsh",
  shivamgpt: "ShivamGPT",
  contact: "Mail",
  settings: "System Settings",
  taskmanager: "Task Manager",
  doom: "DOOM Retro",
  snake: "Snake",
  secretvault: "🔒 Vault — Recruiter Only",
  files: "Files — Explorer",
  notepad: "Notepad",
  paint: "Paint Studio",
  security: "Security Center",
  github: "GitCommit.exe — GitHub Activity",
  beats: "ShivamBeats — Media Player",
};

const APP_SIZES: Partial<Record<AppId, { w: number; h: number }>> = {
  welcome: { w: 640, h: 460 },
  about: { w: 620, h: 520 },
  projects: { w: 820, h: 560 },
  skills: { w: 680, h: 560 },
  experience: { w: 720, h: 560 },
  resume: { w: 760, h: 640 },
  terminal: { w: 720, h: 480 },
  shivamgpt: { w: 620, h: 580 },
  contact: { w: 820, h: 560 },
  settings: { w: 820, h: 580 },
  taskmanager: { w: 720, h: 520 },
  doom: { w: 640, h: 480 },
  snake: { w: 520, h: 560 },
  secretvault: { w: 600, h: 460 },
  files: { w: 780, h: 540 },
  notepad: { w: 620, h: 500 },
  paint: { w: 920, h: 620 },
  security: { w: 640, h: 520 },
  github: { w: 820, h: 600 },
  beats: { w: 560, h: 460 },
};

function autoWallpaperFromHour(): keyof typeof WALLPAPERS {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "mint";
  if (h >= 12 && h < 18) return "indigo";
  return "ember";
}

export const useOS = create<OSState>((set, get) => ({
  user: null,
  username: null,
  isRoot: false,
  booted: false,
  crashed: false,
  muted: false,
  windows: [],
  topZ: 10,
  focused: null,
  theme: "indigo",
  wallpaper: autoWallpaperFromHour(),
  wallpaperAuto: true,
  accentHue: 290,
  unlocked: [],
  notifications: [],
  iconSortKey: 0,
  activeWorkspace: 0,
  packages: {
    doom: { id: "doom", name: "DOOM Retro", icon: "🎮", description: "Retro shooter demo", installed: false },
    snake: { id: "snake", name: "Snake", icon: "🐍", description: "Classic snake game", installed: false },
  },
  trash: [],
  hiddenExtras: [],
  vfs: loadVFS(),
  openFileId: null,
  widgets: loadWidgets(),
  clipboard: { type: null, data: null },
  isIdle: false,
  lastActivity: Date.now(),
  snapPreview: null,

  setSnapPreview: (s) => set({ snapPreview: s }),
  snapWindow: (id, side) => {
    const W = typeof window !== "undefined" ? window.innerWidth : 1280;
    const H = (typeof window !== "undefined" ? window.innerHeight : 800) - 96;
    const half = Math.floor(W / 2);
    const halfH = Math.floor(H / 2);
    const targets: Record<typeof side, { x: number; y: number; w: number; h: number }> = {
      left:        { x: 0,    y: 40, w: half, h: H },
      right:       { x: half, y: 40, w: W - half, h: H },
      max:         { x: 0,    y: 40, w: W, h: H },
      topLeft:     { x: 0,    y: 40, w: half, h: halfH },
      topRight:    { x: half, y: 40, w: W - half, h: halfH },
      bottomLeft:  { x: 0,    y: 40 + halfH, w: half, h: H - halfH },
      bottomRight: { x: half, y: 40 + halfH, w: W - half, h: H - halfH },
    };
    const t = targets[side];
    set({ windows: get().windows.map((w) => w.id === id ? { ...w, ...t, maximized: side === "max" } : w), snapPreview: null });
  },

  login: (u, username, root = false) => {
    set({ user: u, username: username ?? u, isRoot: root });
    if (root) get().unlock("easter");
  },
  logout: () => set({ user: null, isRoot: false, booted: false, windows: [], activeWorkspace: 0 }),

  setBooted: (b) => set({ booted: b }),

  triggerCrash: () => {
    sfx.crash();
    set({ crashed: true });
    get().unlock("crash");
    setTimeout(() => get().rebootFromCrash(), 5200);
  },
  rebootFromCrash: () => {
    set({ crashed: false, windows: [] });
    sfx.boot();
  },

  toggleMute: () => { const next = !get().muted; setMuted(next); set({ muted: next }); },

  openApp: (app, opts) => {
    sfx.open();
    const existing = get().windows.find((w) => w.app === app);
    if (existing) {
      get().focusWindow(existing.id);
      set({
        activeWorkspace: existing.workspace,
        windows: get().windows.map((w) => w.id === existing.id ? { ...w, minimized: false } : w),
      });
      return;
    }
    const size = APP_SIZES[app] ?? { w: 640, h: 480 };
    const z = get().topZ + 1;
    const offset = get().windows.length * 28;
    const winW = typeof window !== "undefined" ? window.innerWidth : 1280;
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    const x = Math.max(20, (winW - size.w) / 2 + offset - 60);
    const y = Math.max(48, (winH - size.h) / 2 + offset - 80);
    const id = `${app}-${Date.now()}`;
    set({
      topZ: z, focused: id,
      windows: [...get().windows, {
        id, app, title: opts?.title ?? APP_TITLES[app],
        x, y, w: size.w, h: size.h, z, minimized: false, maximized: false,
        workspace: get().activeWorkspace,
      }],
    });
    if (app === "terminal") get().unlock("terminal");
    if (app === "about") get().unlock("about");
    if (app === "projects") get().unlock("projects");
    if (app === "contact") get().unlock("contact");
    if (app === "taskmanager") get().unlock("taskmanager");
  },

  closeWindow: (id) => { sfx.close(); set({ windows: get().windows.filter((w) => w.id !== id) }); },
  closeAllWindows: () => { sfx.close(); set({ windows: [] }); },

  focusWindow: (id) => {
    const z = get().topZ + 1;
    set({ topZ: z, focused: id, windows: get().windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)) });
  },

  moveWindow: (id, x, y) => set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) }),
  resizeWindow: (id, w, h) => set({ windows: get().windows.map((win) => (win.id === id ? { ...win, w, h } : win)) }),
  minimizeWindow: (id) => { sfx.close(); set({ windows: get().windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) }); },

  toggleMaximize: (id) => {
    const win = get().windows.find((w) => w.id === id);
    if (!win) return;
    if (win.maximized && win.prev) {
      set({ windows: get().windows.map((w) => w.id === id ? { ...w, ...win.prev!, maximized: false, prev: undefined } : w) });
    } else {
      const winW = window.innerWidth, winH = window.innerHeight;
      set({ windows: get().windows.map((w) => w.id === id
        ? { ...w, prev: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 8, y: 40, w: winW - 16, h: winH - 120, maximized: true }
        : w) });
    }
  },

  setTheme: (t) => { document.documentElement.setAttribute("data-theme", t); set({ theme: t }); get().unlock("theme"); },
  setWallpaper: (w) => set({ wallpaper: w, wallpaperAuto: false }),
  setWallpaperAuto: (auto) => set({ wallpaperAuto: auto, wallpaper: auto ? autoWallpaperFromHour() : get().wallpaper }),
  cycleWallpaper: () => {
    const keys = Object.keys(WALLPAPERS) as Array<keyof typeof WALLPAPERS>;
    const idx = keys.indexOf(get().wallpaper);
    set({ wallpaper: keys[(idx + 1) % keys.length], wallpaperAuto: false });
  },
  sortIcons: () => set({ iconSortKey: get().iconSortKey + 1 }),

  setAccentHue: (h) => {
    document.documentElement.style.setProperty("--accent", `oklch(0.7 0.2 ${h})`);
    document.documentElement.style.setProperty("--primary", `oklch(0.65 0.21 ${h - 5})`);
    document.documentElement.style.setProperty("--ring", `oklch(0.7 0.2 ${h})`);
    set({ accentHue: h });
  },

  unlock: (id) => {
    if (get().unlocked.includes(id)) return;
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    set({ unlocked: [...get().unlocked, id] });
    if (ach) get().notify({ title: "Achievement unlocked", body: ach.label });
  },

  notify: (n) => {
    sfx.notify();
    const id = `n-${Date.now()}-${Math.random()}`;
    set({ notifications: [...get().notifications, { ...n, id, ts: Date.now() }] });
    setTimeout(() => get().dismissNotification(id), 4200);
  },
  dismissNotification: (id) => set({ notifications: get().notifications.filter((n) => n.id !== id) }),

  setWorkspace: (i) => set({ activeWorkspace: i }),
  moveWindowToWorkspace: (id, i) =>
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, workspace: i } : w)) }),

  installPackage: (id) => {
    const pkg = get().packages[id];
    if (!pkg || pkg.installed) return;
    set({ packages: { ...get().packages, [id]: { ...pkg, installed: true } } });
    get().notify({ title: "📦 Package installed", body: `${pkg.name} added to desktop` });
  },

  trashIcon: (id) => {
    set({ hiddenExtras: [...get().hiddenExtras, id], trash: [...get().trash, id] });
    sfx.close();
  },
  emptyTrash: () => {
    sfx.crash();
    set({ trash: [] });
  },

  // VFS
  vfsCreate: (parentId, name, kind, content = "") => {
    set({ vfs: _create(get().vfs, parentId, name, kind, content) });
  },
  vfsDelete: (id) => set({ vfs: _delete(get().vfs, id) }),
  vfsRename: (id, name) => set({ vfs: _rename(get().vfs, id, name) }),
  vfsWrite: (id, content) => set({ vfs: _write(get().vfs, id, content) }),
  openFile: (id) => {
    const node = get().vfs.nodes[id];
    if (!node) return;
    set({ openFileId: id });
    if (node.kind === "image") get().openApp("paint");
    else get().openApp("notepad", { title: `${node.name} — Notepad` });
  },

  // widgets
  addWidget: (kind) => {
    const w: Widget = { id: `w-${Date.now()}`, kind, x: 60 + Math.random() * 200, y: 100 + Math.random() * 200 };
    const next = [...get().widgets, w]; persistWidgets(next); set({ widgets: next });
  },
  removeWidget: (id) => { const next = get().widgets.filter((w) => w.id !== id); persistWidgets(next); set({ widgets: next }); },
  moveWidget: (id, x, y) => { const next = get().widgets.map((w) => w.id === id ? { ...w, x, y } : w); persistWidgets(next); set({ widgets: next }); },
  updateWidget: (id, data) => { const next = get().widgets.map((w) => w.id === id ? { ...w, data } : w); persistWidgets(next); set({ widgets: next }); },

  // clipboard
  copyToClipboard: (type, data) => set({ clipboard: { type, data } }),

  // idle
  setIdle: (idle) => set({ isIdle: idle }),
  wake: () => set({ isIdle: false, lastActivity: Date.now() }),
}));

if (typeof window !== "undefined") {
  setInterval(() => {
    const s = useOS.getState();
    if (s.wallpaperAuto) {
      const next = autoWallpaperFromHour();
      if (next !== s.wallpaper) useOS.setState({ wallpaper: next });
    }
  }, 60_000);
}
