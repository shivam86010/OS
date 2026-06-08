import type { ComponentType } from "react";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useOS, WALLPAPERS, type AppId } from "../../store/os";
import { TopBar } from "./TopBar";
import { Dock } from "./Dock";
import { DesktopIcons } from "./DesktopIcons";
import { Notifications } from "./Notifications";
import { Window } from "./Window";
import { DesktopContextMenu } from "./DesktopContextMenu";
import { CrashScreen } from "./CrashScreen";
import { Screensaver } from "./Screensaver";
import { WidgetsLayer } from "./widgets/WidgetsLayer";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

import { WelcomeApp } from "../../pages/WelcomeApp";
import { AboutApp } from "../../pages/AboutApp";
import { ProjectsApp } from "../../pages/ProjectsApp";
import { SkillsApp } from "../../pages/SkillsApp";
import { ExperienceApp } from "../../pages/ExperienceApp";
import { ResumeApp } from "../../pages/ResumeApp";
import { TerminalApp } from "../../pages/TerminalApp";
import { MailApp } from "../../pages/MailApp";
import { ShivamGPT } from "../../pages/ShivamGPT";
import { SettingsApp } from "../../pages/SettingsApp";
import { TaskManagerApp } from "../../pages/TaskManagerApp";
import { DoomApp } from "../../pages/DoomApp";
import { SnakeApp } from "../../pages/SnakeApp";
import { SecretVaultApp } from "../../pages/SecretVaultApp";
import { FilesApp } from "../../pages/FilesApp";
import { NotepadApp } from "../../pages/NotepadApp";
import { PaintApp } from "../../pages/PaintApp";
import { SecurityApp } from "../../pages/SecurityApp";
import { GitHubApp } from "../../pages/GitHubApp";
import { BeatsApp } from "../../pages/BeatsApp";

const apps: Record<AppId, ComponentType> = {
  welcome: WelcomeApp,
  about: AboutApp,
  projects: ProjectsApp,
  skills: SkillsApp,
  experience: ExperienceApp,
  resume: ResumeApp,
  terminal: TerminalApp,
  shivamgpt: ShivamGPT,
  contact: MailApp,
  settings: SettingsApp,
  taskmanager: TaskManagerApp,
  doom: DoomApp,
  snake: SnakeApp,
  secretvault: SecretVaultApp,
  files: FilesApp,
  notepad: NotepadApp,
  paint: PaintApp,
  security: SecurityApp,
  github: GitHubApp,
  beats: BeatsApp,
};

const IDLE_MS = 120_000;

export function Desktop() {
  const windows = useOS((s) => s.windows);
  const wallpaper = useOS((s) => s.wallpaper);
  const crashed = useOS((s) => s.crashed);
  const activeWorkspace = useOS((s) => s.activeWorkspace);
  const setWorkspace = useOS((s) => s.setWorkspace);
  const isIdle = useOS((s) => s.isIdle);
  const setIdle = useOS((s) => s.setIdle);
  const wake = useOS((s) => s.wake);
  const snapPreview = useOS((s) => s.snapPreview);
  const wallpaperSrc = WALLPAPERS[wallpaper];

  useEffect(() => {
    const onActivity = () => wake();
    ["mousemove", "keydown", "pointerdown"].forEach((e) =>
      window.addEventListener(e, onActivity),
    );
    const id = setInterval(() => {
      const last = useOS.getState().lastActivity;
      if (Date.now() - last > IDLE_MS && !useOS.getState().isIdle)
        setIdle(true);
    }, 5000);
    return () => {
      ["mousemove", "keydown", "pointerdown"].forEach((e) =>
        window.removeEventListener(e, onActivity),
      );
      clearInterval(id);
    };
  }, [wake, setIdle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "1" || e.key === "2")) {
        e.preventDefault();
        setWorkspace(e.key === "1" ? 0 : 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setWorkspace]);

  const visibleWindows = windows.filter((w) => w.workspace === activeWorkspace);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {wallpaperSrc ? (
        <img
          src={wallpaperSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          key={wallpaper}
        />
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <TopBar />
      <WidgetsLayer />
      <DesktopIcons />
      <Notifications />
      <DesktopContextMenu />

      <AnimatePresence>
        {visibleWindows.map((win) => {
          const App = apps[win.app];
          return (
            <Window key={win.id} win={win}>
              <App />
            </Window>
          );
        })}
      </AnimatePresence>

      {/* Aero Snap ghost preview */}
      {snapPreview && (
        <div
          className="pointer-events-none absolute z-[5] rounded-xl border-2 border-accent/70 bg-accent/15 backdrop-blur-sm transition-all duration-150"
          style={{
            left: snapPreview.x,
            top: snapPreview.y,
            width: snapPreview.w,
            height: snapPreview.h,
          }}
        />
      )}

      <Dock />
      <WorkspaceSwitcher />

      <AnimatePresence>{crashed && <CrashScreen />}</AnimatePresence>
      <AnimatePresence>{isIdle && <Screensaver />}</AnimatePresence>
    </div>
  );
}
