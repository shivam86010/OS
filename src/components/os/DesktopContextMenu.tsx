import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  RotateCw,
  X,
  LayoutGrid,
  Volume2,
  VolumeX,
  Clock,
  StickyNote,
  Activity,
} from "lucide-react";
import { useOS } from "../../store/os";

interface MenuState {
  x: number;
  y: number;
}

export function DesktopContextMenu() {
  const [pos, setPos] = useState<MenuState | null>(null);
  const cycleWallpaper = useOS((s) => s.cycleWallpaper);
  const closeAllWindows = useOS((s) => s.closeAllWindows);
  const sortIcons = useOS((s) => s.sortIcons);
  const muted = useOS((s) => s.muted);
  const toggleMute = useOS((s) => s.toggleMute);
  const notify = useOS((s) => s.notify);
  const addWidget = useOS((s) => s.addWidget);

  useEffect(() => {
    const onCtx = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.closest("[data-os-window]") ||
        el.closest("[data-os-dock]") ||
        el.closest("[data-os-topbar]")
      )
        return;
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - 220);
      const y = Math.min(e.clientY, window.innerHeight - 240);
      setPos({ x, y });
    };
    const onClick = () => setPos(null);
    window.addEventListener("contextmenu", onCtx);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onClick, true);
    return () => {
      window.removeEventListener("contextmenu", onCtx);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onClick, true);
    };
  }, []);

  const items = [
    {
      icon: Clock,
      label: "Pin Clock Widget",
      action: () => addWidget("clock"),
    },
    {
      icon: StickyNote,
      label: "Add Sticky Note",
      action: () => addWidget("sticky"),
    },
    { icon: Activity, label: "Pin CPU Widget", action: () => addWidget("cpu") },
    {
      icon: ImageIcon,
      label: "Change Wallpaper",
      action: () => {
        cycleWallpaper();
        notify({ title: "Wallpaper changed" });
      },
    },
    {
      icon: RotateCw,
      label: "Refresh System",
      action: () => location.reload(),
    },
    { icon: X, label: "Close All Windows", action: closeAllWindows },
    {
      icon: LayoutGrid,
      label: "Sort Icons",
      action: () => {
        sortIcons();
        notify({ title: "Icons sorted" });
      },
    },
    {
      icon: muted ? VolumeX : Volume2,
      label: muted ? "Unmute System" : "Mute System",
      action: toggleMute,
    },
  ];

  return (
    <AnimatePresence>
      {pos && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          style={{ left: pos.x, top: pos.y }}
          className="fixed z-[100] w-56 overflow-hidden rounded-xl glass-strong p-1 shadow-window text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={() => {
                action();
                setPos(null);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left hover:bg-accent/20"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
