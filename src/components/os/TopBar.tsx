import { useEffect, useState } from "react";
import {
  Bell,
  Wifi,
  BatteryFull,
  Search,
  Apple,
  Volume2,
  VolumeX,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { useOS } from "../../store/os";

export function TopBar() {
  const [now, setNow] = useState(new Date());
  const focused = useOS((s) => s.windows.find((w) => w.id === s.focused));
  const notifications = useOS((s) => s.notifications);
  const muted = useOS((s) => s.muted);
  const toggleMute = useOS((s) => s.toggleMute);
  const activeWorkspace = useOS((s) => s.activeWorkspace);
  const setWorkspace = useOS((s) => s.setWorkspace);
  const username = useOS((s) => s.username);
  const isRoot = useOS((s) => s.isRoot);
  const logout = useOS((s) => s.logout);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-os-topbar
      className="absolute inset-x-0 top-0 z-50 flex h-8 items-center justify-between px-3 text-xs font-medium glass border-b border-glass-border"
    >
      <div className="flex items-center gap-4">
        <Apple className="h-4 w-4" />
        <span className="font-display font-semibold tracking-tight">
          Shivam OS
        </span>
        <span className="text-muted-foreground">
          {focused?.title ?? "Desktop"}
        </span>
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        {/* Workspace switcher */}
        <div className="flex items-center gap-1 rounded-full border border-glass-border bg-black/20 px-1 py-0.5">
          <LayoutGrid className="ml-1 h-3 w-3" />
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setWorkspace(i)}
              className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${activeWorkspace === i ? "bg-accent text-accent-foreground" : "hover:bg-white/10"}`}
              title={`Workspace ${i + 1} (Ctrl+${i + 1})`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Search className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-3.5 w-3.5" />
        <button
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
          className="hover:text-foreground"
        >
          {muted ? (
            <VolumeX className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
        <div className="relative">
          <Bell className="h-3.5 w-3.5" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-3 w-3 place-items-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground">
              {notifications.length}
            </span>
          )}
        </div>
        {username && (
          <button
            onClick={logout}
            title="Log out"
            className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 hover:bg-white/15 hover:text-foreground"
          >
            <span className={isRoot ? "text-emerald-300" : "text-foreground"}>
              {isRoot ? "root@" : ""}
              {username}
            </span>
            <LogOut className="h-3 w-3" />
          </button>
        )}
        <span className="tabular-nums text-foreground">
          {now.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {"  "}
          {now.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
