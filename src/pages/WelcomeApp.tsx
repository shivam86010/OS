import shivam from "../assets/shivam-welcome.jpeg";
import { profile } from "../data/portfolio";
import { useOS } from "../store/os";
import { ArrowRight } from "lucide-react";

export function WelcomeApp() {
  const openApp = useOS((s) => s.openApp);
  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 h-48 md:h-full overflow-hidden">
        <img
          src={shivam}
          alt="Shivam waving hello"
          className="h-full w-full object-cover"
          width={768}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:bg-gradient-to-r" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-accent">
          welcome to shivam os
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight">
          Hey, I'm {profile.name.split(" ")[0]}.{" "}
          <span className="text-accent">👋</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          You're not on a portfolio. You're inside my operating system. Every
          part of my career is an app on this desktop — open one, drag it, break
          it, hire me.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => openApp("about")}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:brightness-110"
          >
            Open About.exe <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => openApp("terminal")}
            className="rounded-md border border-glass-border px-3 py-2 text-xs font-medium hover:bg-white/5"
          >
            Try Terminal
          </button>
          <button
            onClick={() => openApp("projects")}
            className="rounded-md border border-glass-border px-3 py-2 text-xs font-medium hover:bg-white/5"
          >
            Explore Projects
          </button>
        </div>
        <div className="pt-3 text-[11px] text-muted-foreground">
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono">Tip</kbd>{" "}
          Type <code className="text-accent">help</code> in the Terminal for
          hidden commands.
        </div>
      </div>
    </div>
  );
}
