import { useEffect, useState } from "react";
import { Save, Copy, ClipboardPaste } from "lucide-react";
import { useOS } from "../store/os";

export function NotepadApp() {
  const fileId = useOS((s) => s.openFileId);
  const vfs = useOS((s) => s.vfs);
  const write = useOS((s) => s.vfsWrite);
  const clipboard = useOS((s) => s.clipboard);
  const copy = useOS((s) => s.copyToClipboard);
  const notify = useOS((s) => s.notify);

  const file = fileId ? vfs.nodes[fileId] : null;
  const [text, setText] = useState(file?.content ?? "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setText(file?.content ?? "");
    setDirty(false);
  }, [fileId, file?.id]);

  function save() {
    if (!file) return;
    write(file.id, text);
    setDirty(false);
    notify({ title: "💾 Saved", body: `${file.name} written to disk` });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!file) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
        Open a .txt file from{" "}
        <strong className="mx-1 text-foreground">Files</strong> to edit it here.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-window-border px-2 py-1.5 text-xs">
        <div className="flex-1 truncate font-mono">
          {file.name}
          {dirty && <span className="ml-1 text-warning">●</span>}
        </div>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(text);
            copy("text", text);
            notify({ title: "Copied" });
          }}
          title="Copy all"
          className="rounded p-1 hover:bg-white/10"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            if (
              clipboard.type === "text" &&
              typeof clipboard.data === "string"
            ) {
              setText((t) => t + clipboard.data);
              setDirty(true);
            }
          }}
          title="Paste from system clipboard"
          className="rounded p-1 hover:bg-white/10"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={save}
          className="ml-1 flex items-center gap-1 rounded bg-accent/30 px-2 py-1 text-xs hover:bg-accent/50"
        >
          <Save className="h-3 w-3" /> Save
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
        }}
        className="h-full w-full flex-1 resize-none bg-black/30 p-3 font-mono text-[12.5px] leading-relaxed outline-none"
        spellCheck={false}
      />
    </div>
  );
}
