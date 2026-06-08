import { experience } from "../data/portfolio";
import { Building2 } from "lucide-react";

export function ExperienceApp() {
  return (
    <div className="p-5">
      <div className="mb-5">
        <div className="font-display text-lg font-semibold">
          Career Timeline
        </div>
        <div className="text-xs text-muted-foreground">Most recent first</div>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-glass-border" />
        {experience.map((job, i) => (
          <div key={i} className="relative mb-6">
            <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-accent ring-4 ring-background" />
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-accent" />
              <div className="font-display font-semibold">{job.company}</div>
              <div className="ml-auto font-mono text-[11px] text-muted-foreground">
                {job.period}
              </div>
            </div>
            <div className="mb-2 text-sm text-accent">{job.role}</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {job.bullets.map((b, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-accent">›</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
