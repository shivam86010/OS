import { useEffect, useRef, useState } from "react";
import { Bot, Send, User, Hash, Sparkles } from "lucide-react";
import {
  profile,
  projects,
  skills,
  experience,
  accolades,
  education,
} from "@/data/portfolio";
import { sfx } from "@/lib/sound";

type Msg = { role: "user" | "bot"; content: string; ts: number };

const KB: { match: RegExp; reply: () => string }[] = [
  {
    match: /availab|notice|join|when can/i,
    reply: () =>
      `${profile.name} is ${profile.status.toLowerCase()}. Typical notice period: immediate to 30 days. Open to remote, hybrid, or relocation across India / EU timezones.`,
  },
  {
    match: /salary|ctc|compensation|expect/i,
    reply: () =>
      `Compensation expectations are flexible and role-dependent — happy to share a number on a quick intro call. Reach out via Mail.app.`,
  },
  {
    match: /hello|hi|hey|yo/i,
    reply: () =>
      `Hey 👋 — I'm ShivamGPT, a digital clone of ${profile.name}. Ask me about projects, stack, experience, availability, or how to hire him.`,
  },
  { match: /who|about|tell.*shivam|background/i, reply: () => profile.bio },
  {
    match: /project|portfolio|build|shipped/i,
    reply: () =>
      "Featured projects:\n" +
      projects
        .map(
          (p) =>
            `• ${p.name} (${p.stack.slice(0, 3).join(", ")}) — ${p.result}`,
        )
        .join("\n"),
  },
  {
    match: /stack|skill|tech|framework/i,
    reply: () =>
      "Top skills (by depth):\n" +
      skills
        .flatMap((c) => c.items.map((i) => `• ${i.name} — ${i.value}%`))
        .slice(0, 8)
        .join("\n"),
  },
  {
    match: /experience|work|company|job|role/i,
    reply: () =>
      experience
        .map((e) => `${e.period} — ${e.role} @ ${e.company}`)
        .join("\n\n"),
  },
  {
    match: /resume|cv|download/i,
    reply: () =>
      "Open Resume.pdf from the dock to view, or visit the Vault (Recruiter login) for the premium edition.",
  },
  {
    match: /contact|email|reach|hire|call|interview/i,
    reply: () =>
      `📬 Best route: open Mail.app on the dock, or write to ${profile.email}. Replies usually within 24h.`,
  },
  {
    match: /react|next\.?js|frontend/i,
    reply: () =>
      `Strong React/Next.js: ${skills[0].items
        .slice(0, 3)
        .map((s) => `${s.name} ${s.value}%`)
        .join(
          " · ",
        )}. Shipped production dashboards with Redux Toolkit, Socket.IO realtime, and Framer Motion micro-interactions.`,
  },
  {
    match: /leetcode|dsa|algorithm|problem solving/i,
    reply: () => accolades.slice(0, 2).join(" · "),
  },
  {
    match: /education|degree|college|school/i,
    reply: () =>
      education.map((e) => `${e.degree} — ${e.school} (${e.year})`).join("\n"),
  },
  {
    match: /favourite|favorite|love|enjoy/i,
    reply: () =>
      "Favourite stack moment: shipping a real-time analytics dashboard with Socket.IO + Recharts that felt as fluid as a native app.",
  },
  {
    match: /weakness|improve|learn/i,
    reply: () =>
      "Actively leveling up in: server components, edge runtime patterns, and design systems at scale.",
  },
];

function reply(q: string): string {
  for (const k of KB) if (k.match.test(q)) return k.reply();
  return `I don't have a canned answer for that. Try a quick chip below, or email ${profile.email} — Shivam will reply personally.`;
}

const CHANNELS = [
  { id: "intro", name: "intro" },
  { id: "projects", name: "projects" },
  { id: "skills", name: "skills" },
  { id: "hiring", name: "hiring" },
];

const PROMPTS: Record<string, string[]> = {
  intro: ["Who is Shivam?", "What's his current role?", "Where is he based?"],
  projects: [
    "Show featured projects",
    "Tell me about Test Portal",
    "What's the HRM project?",
  ],
  skills: ["React experience?", "What's his stack?", "LeetCode/DSA?"],
  hiring: ["Is he available?", "Salary expectations?", "How to contact?"],
};

export function ShivamGPT() {
  const [channel, setChannel] = useState("intro");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      content: `Welcome to #intro — I'm ShivamGPT, ${profile.name}'s AI companion. Pick a channel on the left, or click a quick prompt below to start chatting.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, typing]);

  function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t) return;
    sfx.click();
    setMessages((m) => [...m, { role: "user", content: t, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    const delay = 500 + Math.min(t.length * 18, 1400);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "bot", content: reply(t), ts: Date.now() },
      ]);
      setTyping(false);
    }, delay);
  }

  return (
    <div className="flex h-full bg-[oklch(0.14_0.03_270)]">
      {/* Sidebar — Slack-style */}
      <aside className="flex w-44 flex-col border-r border-glass-border bg-black/40">
        <div className="flex items-center gap-2 border-b border-glass-border p-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold">ShivamGPT</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{" "}
              online
            </div>
          </div>
        </div>
        <div className="px-2 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Channels
        </div>
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setChannel(c.id);
              sfx.click();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-white/5 ${channel === c.id ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
          >
            <Hash className="h-3.5 w-3.5" />
            {c.name}
          </button>
        ))}
        <div className="mt-auto border-t border-glass-border p-3 text-[10px] text-muted-foreground">
          <Sparkles className="mb-1 h-3 w-3 text-amber-400" />
          Local rules-engine — no AI key required.
        </div>
      </aside>

      {/* Chat */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-glass-border px-4 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Hash className="h-4 w-4 text-muted-foreground" />
            {channel}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Direct line to {profile.name}'s digital twin
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-auto scrollbar-thin p-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                "flex gap-2 " + (m.role === "user" ? "justify-end" : "")
              }
            >
              {m.role === "bot" && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className="max-w-[78%]">
                <div className="mb-0.5 text-[10px] text-muted-foreground">
                  {m.role === "user" ? "You" : "ShivamGPT"} ·{" "}
                  {new Date(m.ts).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <div
                  className={
                    "whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed " +
                    (m.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-white/5 text-foreground")
                  }
                >
                  {m.content}
                </div>
              </div>
              {m.role === "user" && (
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                <span className="inline-block animate-pulse">●</span>
                <span className="inline-block animate-pulse [animation-delay:120ms]">
                  ●
                </span>
                <span className="inline-block animate-pulse [animation-delay:240ms]">
                  ●
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-glass-border p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {(PROMPTS[channel] ?? []).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-glass-border bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-glass-border bg-black/30 px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Message #${channel}…`}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
