import { Lock, Download, Sparkles } from "lucide-react";
import { useOS } from "@/store/os";
import { profile } from "@/data/portfolio";
import resumeMeta from "@/assets/resume.pdf.asset.json";

export function SecretVaultApp() {
  const user = useOS((s) => s.user);
  const isRoot = useOS((s) => s.isRoot);

  if (user === "guest") {
    return (
      <div className="grid h-full place-items-center bg-black/50 p-6 text-center">
        <div>
          <Lock className="mx-auto h-10 w-10 text-rose-400" />
          <div className="mt-3 font-display text-lg font-semibold">
            Access denied
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            This vault is reserved for Recruiter & Admin sessions. Log out and
            unlock with the right password to reveal premium portfolio assets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold">
            Welcome, {user === "admin" ? "Root" : "Recruiter"} 👋
          </div>
          <div className="text-xs text-muted-foreground">
            A curated package of Shivam's premium hiring assets.
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={resumeMeta.url}
          download={`${profile.name}-Resume.pdf`}
          className="group flex items-center gap-3 rounded-xl border border-glass-border bg-white/5 p-4 hover:bg-white/10"
        >
          <Download className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="text-sm font-semibold">Premium Resume.pdf</div>
            <div className="text-[11px] text-muted-foreground">
              Full-color, single-page, recruiter edition
            </div>
          </div>
        </a>

        <a
          href={`mailto:${profile.email}?subject=Interview%20Request%20from%20Recruiter`}
          className="group flex items-center gap-3 rounded-xl border border-glass-border bg-white/5 p-4 hover:bg-white/10"
        >
          <Sparkles className="h-5 w-5 text-amber-400" />
          <div>
            <div className="text-sm font-semibold">Priority Email Channel</div>
            <div className="text-[11px] text-muted-foreground">
              Direct line — replies within 24h
            </div>
          </div>
        </a>
      </div>

      <div className="mt-6 rounded-xl border border-glass-border bg-black/30 p-4 font-mono text-xs">
        <div className="mb-2 text-muted-foreground">
          {user === "admin" ? "// ROOT SHELL" : "// recruiter brief"}
        </div>
        {user === "admin" ? (
          <>
            <div>
              ✓ Dev mode enabled — try typing{" "}
              <span className="text-emerald-400">sudo hire shivam</span> in
              terminal.
            </div>
            <div>✓ All achievements visible in Settings.</div>
            <div>
              ✓ Hidden command:{" "}
              <span className="text-emerald-400">react --version</span>
            </div>
          </>
        ) : (
          <>
            <div>
              • Available immediately —{" "}
              <span className="text-accent">{profile.status}</span>
            </div>
            <div>• Open to hybrid/remote roles, India + EU timezones.</div>
            <div>• Reach out via Mail.app for fastest reply.</div>
          </>
        )}
      </div>
    </div>
  );
}
