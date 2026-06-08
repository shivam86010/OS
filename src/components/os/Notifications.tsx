import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useOS } from "../../store/os";

export function Notifications() {
  const notifications = useOS((s) => s.notifications);
  const dismiss = useOS((s) => s.dismissNotification);
  return (
    <div className="pointer-events-none absolute right-3 top-10 z-50 flex w-72 flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.button
            key={n.id}
            layout
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            onClick={() => dismiss(n.id)}
            className="pointer-events-auto flex items-start gap-3 rounded-xl p-3 text-left glass-strong shadow-window"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/20 text-accent">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{n.title}</div>
              {n.body && (
                <div className="truncate text-xs text-muted-foreground">
                  {n.body}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
