import { useState } from "react";
import {
  Folder,
  FileCode2,
  ChevronLeft,
  Users,
  Wrench,
  Lightbulb,
  Sparkles,
  Copy,
} from "lucide-react";
import { projects } from "@/data/portfolio";
import { useOS } from "@/store/os";

export function ProjectsApp() {
  const [openId, setOpenId] = useState<string | null>(null);
  const current = projects.find((p) => p.id === openId);
  const copyToClipboard = useOS((s) => s.copyToClipboard);
  const notify = useOS((s) => s.notify);

  function ipcCopy(payload: string) {
    copyToClipboard("text", payload);
    void navigator.clipboard?.writeText(payload);
    notify({
      title: "📋 Copied via IPC",
      body: "Paste into Terminal or ShivamGPT (Ctrl+V)",
    });
  }

  return (
    <div className="flex h-full">
      <aside className="w-44 shrink-0 border-r border-glass-border p-2 text-sm">
        <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Favorites
        </div>
        <div className="px-2 py-1.5 rounded-md bg-white/5">📁 Projects</div>
        <div className="mt-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Tags
        </div>
        {["React", "Next.js", "TypeScript", "Performance"].map((t) => (
          <div
            key={t}
            className="px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            # {t}
          </div>
        ))}
      </aside>

      <div className="flex-1 overflow-auto p-4">
        {!current ? (
          <>
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Folder className="h-3.5 w-3.5" />
              ~/Projects
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onDoubleClick={() => setOpenId(p.id)}
                  onClick={(e) => e.detail === 2 && setOpenId(p.id)}
                  className="group flex flex-col items-center gap-2 rounded-lg p-3 text-center hover:bg-white/10"
                >
                  <Folder
                    className="h-12 w-12 text-amber-400 group-hover:text-amber-300"
                    fill="currentColor"
                  />
                  <span className="text-xs">{p.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 text-[11px] text-muted-foreground">
              Double-click a folder to open.
            </div>
          </>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setOpenId(null)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
              <button
                onClick={() =>
                  ipcCopy(
                    `# ${current.name}\nRole: ${current.role}\nStack: ${current.stack.join(", ")}\nUsers: ${current.users}\nProblem: ${current.problem}\nSolution: ${current.solution}\nResult: ${current.result}`,
                  )
                }
                className="inline-flex items-center gap-1 rounded-md border border-glass-border bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10"
                title="Copy project metrics (IPC pipe)"
              >
                <Copy className="h-3 w-3" /> Copy metrics
              </button>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <FileCode2 className="h-8 w-8 text-accent" />
              <div>
                <div className="font-display text-lg font-semibold">
                  {current.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {current.role}
                </div>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {current.stack.map((s) => (
                <span
                  key={s}
                  className="rounded border border-glass-border bg-white/5 px-2 py-0.5 text-[11px]"
                >
                  {s}
                </span>
              ))}
            </div>

            <Field icon={Users} label="Users" value={current.users} />
            <Field icon={Lightbulb} label="Problem" value={current.problem} />
            <Field icon={Wrench} label="Solution" value={current.solution} />
            <Field
              icon={Sparkles}
              label="Result"
              value={current.result}
              accent
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Folder;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="mb-3 rounded-md border border-glass-border p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={"text-sm " + (accent ? "text-accent font-semibold" : "")}>
        {value}
      </div>
    </div>
  );
}
