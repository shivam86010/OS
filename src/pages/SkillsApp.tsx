import { skills } from "../data/portfolio";
import { motion } from "framer-motion";

export function SkillsApp() {
  return (
    <div className="p-5">
      <div className="mb-4">
        <div className="font-display text-lg font-semibold">
          Developer Dashboard
        </div>
        <div className="text-xs text-muted-foreground">
          Real-time skill metrics · last sync just now
        </div>
      </div>

      <div className="space-y-5">
        {skills.map((cat) => (
          <div key={cat.category}>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="font-mono text-sm font-semibold">
                {cat.category}
              </div>
              <div className="font-mono text-xs text-accent">{cat.value}%</div>
            </div>
            <Bar value={cat.value} thick />
            <div className="mt-3 space-y-2 pl-3 border-l border-glass-border">
              {cat.items.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-mono tabular-nums">{s.value}%</span>
                  </div>
                  <Bar value={s.value} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ value, thick }: { value: number; thick?: boolean }) {
  const blocks = Math.round(value / 5);
  return (
    <div className="flex items-center gap-2">
      <div className={"flex gap-[2px] flex-1 " + (thick ? "" : "")}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.02 }}
            className={
              "flex-1 rounded-[2px] " +
              (thick ? "h-2.5 " : "h-1.5 ") +
              (i < blocks
                ? "bg-accent shadow-[0_0_8px_-2px_var(--accent)]"
                : "bg-white/10")
            }
          />
        ))}
      </div>
    </div>
  );
}
