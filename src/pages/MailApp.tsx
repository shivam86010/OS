import { useState } from "react";
import {
  Inbox,
  FileEdit,
  Send,
  Star,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { profile } from "../data/portfolio";
import { useOS } from "../store/os";

interface Mail {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  folder: "inbox" | "drafts" | "sent";
  starred?: boolean;
}

const seed: Mail[] = [
  {
    id: "1",
    from: "Shivam Singh",
    fromEmail: profile.email,
    subject: "👋 Welcome to my OS",
    preview: "Thanks for booting Shivam OS — here's a quick tour…",
    body: `Hi there,\n\nWelcome to Shivam OS — my interactive portfolio.\n\nThings to try:\n  • Open Terminal and type 'help' (or 'sudo hire shivam')\n  • Right-click the desktop for context actions\n  • Open Task Manager to see live system stats\n  • Hit "New Message" below to actually email me\n\nLooking forward to hearing from you.\n— Shivam`,
    date: "Now",
    folder: "inbox",
    starred: true,
  },
  {
    id: "2",
    from: "Recruiter Hotline",
    fromEmail: "jobs@yourcompany.com",
    subject: "Frontend Engineer — interested?",
    preview: "We're building something special and your work caught our eye…",
    body: "Hey Shivam,\n\nWe loved your portfolio. Would you be open to a chat about a senior frontend role?\n\nBest,\nRecruiting Team",
    date: "Yesterday",
    folder: "inbox",
  },
];

export function MailApp() {
  const [mails, setMails] = useState<Mail[]>(seed);
  const [folder, setFolder] = useState<"inbox" | "drafts" | "sent">("inbox");
  const [selected, setSelected] = useState<string | null>("1");
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Job Opportunity",
    body: "",
  });
  const [sending, setSending] = useState(false);
  const unlock = useOS((s) => s.unlock);
  const notify = useOS((s) => s.notify);

  const visible = mails.filter((m) => m.folder === folder);
  const active = mails.find((m) => m.id === selected);

  const counts = {
    inbox: mails.filter((m) => m.folder === "inbox").length,
    drafts: mails.filter((m) => m.folder === "drafts").length,
    sent: mails.filter((m) => m.folder === "sent").length,
  };

  const saveDraft = () => {
    const draft: Mail = {
      id: `d-${Date.now()}`,
      from: form.name || "You",
      fromEmail: form.email || "you@example.com",
      subject: form.subject || "(no subject)",
      preview: form.body.slice(0, 60),
      body: form.body,
      date: "Draft",
      folder: "drafts",
    };
    setMails((m) => [draft, ...m]);
    setComposing(false);
    notify({ title: "Draft saved" });
  };

  const send = () => {
    if (!form.body.trim() || !form.email.trim()) return;
    setSending(true);
    // Open user's email client as a real fallback (no backend secret needed)
    const subj = encodeURIComponent(form.subject);
    const body = encodeURIComponent(
      `From: ${form.name} <${form.email}>\n\n${form.body}`,
    );
    setTimeout(() => {
      window.location.href = `mailto:${profile.email}?subject=${subj}&body=${body}`;
      const sent: Mail = {
        id: `s-${Date.now()}`,
        from: form.name,
        fromEmail: form.email,
        subject: form.subject,
        preview: form.body.slice(0, 60),
        body: form.body,
        date: "Just now",
        folder: "sent",
      };
      setMails((m) => [sent, ...m]);
      setSending(false);
      setComposing(false);
      setForm({ name: "", email: "", subject: "Job Opportunity", body: "" });
      unlock("contact");
      notify({ title: "Message sent ✉️", body: `To ${profile.email}` });
    }, 900);
  };

  return (
    <div className="flex h-full text-sm">
      {/* Sidebar */}
      <aside className="w-44 shrink-0 border-r border-glass-border bg-black/20 p-2">
        <button
          onClick={() => setComposing(true)}
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent py-2 text-xs font-semibold text-accent-foreground hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> New Message
        </button>
        {(
          [
            { id: "inbox", label: "Inbox", Icon: Inbox, n: counts.inbox },
            { id: "drafts", label: "Drafts", Icon: FileEdit, n: counts.drafts },
            { id: "sent", label: "Sent", Icon: Send, n: counts.sent },
          ] as const
        ).map(({ id, label, Icon, n }) => (
          <button
            key={id}
            onClick={() => {
              setFolder(id);
              setSelected(null);
            }}
            className={
              "mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs " +
              (folder === id ? "bg-accent/20 text-accent" : "hover:bg-white/5")
            }
          >
            <Icon className="h-3.5 w-3.5" /> {label}
            <span className="ml-auto rounded bg-white/10 px-1.5 text-[10px]">
              {n}
            </span>
          </button>
        ))}
        <div className="mt-4 border-t border-glass-border pt-2 text-[10px] text-muted-foreground">
          {profile.email}
        </div>
      </aside>

      {/* Mail list */}
      {!composing && (
        <div className="w-56 shrink-0 overflow-auto border-r border-glass-border">
          {visible.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No messages
            </div>
          )}
          {visible.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={
                "block w-full border-b border-glass-border/40 p-3 text-left text-xs hover:bg-white/5 " +
                (selected === m.id ? "bg-accent/10" : "")
              }
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate">{m.from}</span>
                <span className="text-[10px] text-muted-foreground">
                  {m.date}
                </span>
              </div>
              <div className="mt-0.5 truncate font-medium">{m.subject}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {m.preview}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Reader / Composer */}
      <div className="flex-1 overflow-auto">
        {composing ? (
          <div className="flex h-full flex-col p-4">
            <div className="mb-3 flex items-center gap-2">
              <button
                onClick={() => setComposing(false)}
                className="rounded p-1 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="font-display text-base font-semibold">
                New Message
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <Row label="To">
                <span className="rounded bg-accent/20 px-2 py-0.5 text-accent">
                  {profile.email}
                </span>
              </Row>
              <Row label="From">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full bg-transparent outline-none"
                />
              </Row>
              <Row label="Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-transparent outline-none"
                />
              </Row>
              <Row label="Subject">
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="w-full bg-transparent outline-none"
                />
              </Row>
            </div>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Tell me about the role…"
              className="mt-3 flex-1 resize-none rounded-md border border-glass-border bg-black/20 p-3 text-sm outline-none focus:border-accent"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={saveDraft}
                className="rounded-md border border-glass-border px-3 py-1.5 text-xs hover:bg-white/5"
              >
                Save Draft
              </button>
              <button
                onClick={send}
                disabled={sending || !form.body.trim()}
                className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" /> {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        ) : active ? (
          <article className="p-5">
            <h2 className="font-display text-lg font-semibold">
              {active.subject}
            </h2>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <b className="text-foreground">{active.from}</b> &lt;
                {active.fromEmail}&gt;
              </span>
              <span>{active.date}</span>
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
              {active.body}
            </div>
            <div className="mt-6 flex gap-2 text-xs">
              <button
                onClick={() => {
                  setComposing(true);
                  setForm((f) => ({ ...f, subject: "Re: " + active.subject }));
                }}
                className="rounded-md border border-glass-border px-3 py-1.5 hover:bg-white/5"
              >
                Reply
              </button>
              <button
                onClick={() =>
                  setMails((m) =>
                    m.map((x) =>
                      x.id === active.id ? { ...x, starred: !x.starred } : x,
                    ),
                  )
                }
                className="rounded-md border border-glass-border px-3 py-1.5 hover:bg-white/5"
              >
                <Star
                  className={
                    "inline h-3 w-3 " +
                    (active.starred ? "fill-yellow-400 text-yellow-400" : "")
                  }
                />
              </button>
              <button
                onClick={() =>
                  setMails((m) => m.filter((x) => x.id !== active.id))
                }
                className="rounded-md border border-glass-border px-3 py-1.5 hover:bg-white/5"
              >
                <Trash2 className="inline h-3 w-3" />
              </button>
            </div>
          </article>
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            Select a message
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-glass-border pb-1.5">
      <span className="w-14 text-muted-foreground">{label}:</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
