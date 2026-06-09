import { Download, ExternalLink } from "lucide-react";
import { useOS } from "@/store/os";
import {
  profile,
  experience,
  skills,
  projects,
  education,
  accolades,
} from "../data/portfolio";
import resumeAsset from "@/assets/resume.pdf.asset.json";

export function ResumeApp() {
  const unlock = useOS((s) => s.unlock);
  const notify = useOS((s) => s.notify);

  const handleDownload = () => {
    unlock("resume");
    notify({ title: "Resume downloaded", body: "ShivamSingh-Resume.pdf" });
  };

  return (
    <div className="flex h-full flex-col bg-neutral-900/40">
      <div className="flex items-center gap-2 border-b border-glass-border bg-titlebar/60 px-3 py-2 text-xs">
        <span className="font-display font-semibold">
          ShivamSingh-Resume.pdf
        </span>
        <span className="text-muted-foreground">· 240 KB · 1 page</span>
        <a
          href={resumeAsset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open
        </a>
        <a
          href={resumeAsset.url}
          download="ShivamSingh-Resume.pdf"
          onClick={handleDownload}
          className="inline-flex items-center gap-1 rounded bg-accent px-2.5 py-1 font-semibold text-accent-foreground hover:brightness-110"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[1fr_260px]">
        <object
          data={resumeAsset.url}
          type="application/pdf"
          className="h-full w-full bg-white"
        >
          <iframe
            src={resumeAsset.url}
            title="Resume PDF"
            className="h-full w-full"
          />
        </object>

        <aside className="overflow-auto border-l border-glass-border p-4 text-xs">
          <div className="font-display text-base font-bold">{profile.name}</div>
          <div className="text-accent">{profile.role}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {profile.email}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {profile.phone}
          </div>

          <H>Experience</H>
          {experience.map((e) => (
            <div key={e.company} className="mt-1.5">
              <div className="font-semibold">{e.role}</div>
              <div className="text-[10px] text-muted-foreground">
                {e.company} · {e.period}
              </div>
            </div>
          ))}

          <H>Top Projects</H>
          {projects.map((p) => (
            <div key={p.id} className="mt-1">
              • <b>{p.name}</b>{" "}
              <span className="text-muted-foreground">— {p.result}</span>
            </div>
          ))}

          <H>Education</H>
          {education.map((e) => (
            <div key={e.degree} className="mt-1 text-[11px]">
              {e.degree}{" "}
              <span className="text-muted-foreground">
                — {e.school} ({e.cgpa})
              </span>
            </div>
          ))}

          <H>Skills</H>
          <div className="mt-1 flex flex-wrap gap-1">
            {skills
              .flatMap((c) => c.items)
              .map((s) => (
                <span
                  key={s.name}
                  className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent"
                >
                  {s.name}
                </span>
              ))}
          </div>

          <H>Achievements</H>
          <ul className="mt-1 list-disc pl-4 text-[11px] text-muted-foreground">
            {accolades.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-4 font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </h4>
  );
}
