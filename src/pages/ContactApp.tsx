import { useState } from "react";
import { Send } from "lucide-react";
import { profile } from "../data/portfolio";
import { useOS } from "../store/os";

export function ContactApp() {
  const [to] = useState(profile.name);
  const [subject, setSubject] = useState("Job Opportunity");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const unlock = useOS((s) => s.unlock);
  const notify = useOS((s) => s.notify);

  const send = () => {
    if (!body.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      unlock("contact");
      notify({
        title: "Message delivered",
        body: "Shivam will get back to you soon",
      });
    }, 1100);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3">
        <div className="font-display text-lg font-semibold">New Message</div>
        <div className="text-xs text-muted-foreground">
          From: you@recruiter.dev
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <Row label="To">
          <span className="rounded bg-accent/20 px-2 py-0.5 text-accent">
            {to}
          </span>
        </Row>
        <Row label="Subject">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </Row>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Tell me about the role…"
        className="mt-3 flex-1 resize-none rounded-md border border-glass-border bg-black/20 p-3 text-sm outline-none focus:border-accent"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground">
          Or reach me at <span className="text-accent">{profile.email}</span>
        </div>
        <button
          onClick={send}
          disabled={sending || sent}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:brightness-110 disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {sent ? "Sent ✓" : sending ? "Sending…" : "Send"}
        </button>
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
      <span className="w-16 text-xs text-muted-foreground">{label}:</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
