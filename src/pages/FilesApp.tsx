import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  FilePlus,
  Trash2,
  RefreshCw,
  Home,
  Folder,
  FileText as FileTextIcon,
  ImageIcon,
} from "lucide-react";
import { useOS } from "../store/os";
import { pathOf, diskUsage, type VNode } from "@/lib/vfs";

export function FilesApp() {
  const vfs = useOS((s) => s.vfs);
  const create = useOS((s) => s.vfsCreate);
  const del = useOS((s) => s.vfsDelete);
  const openFile = useOS((s) => s.openFile);
  const [cwdId, setCwdId] = useState(vfs.rootId);
  const [history, setHistory] = useState<string[]>([vfs.rootId]);
  const [hIdx, setHIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    targetId: string | null;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const cwd = vfs.nodes[cwdId];
  const items = (cwd?.children ?? [])
    .map((id) => vfs.nodes[id])
    .filter(Boolean) as VNode[];
  const { used, total } = diskUsage(vfs);
  const usedPct = Math.min(100, Math.round((used / total) * 100));

  function navigate(id: string) {
    if (!vfs.nodes[id]) return;
    const newHist = history.slice(0, hIdx + 1).concat(id);
    setHistory(newHist);
    setHIdx(newHist.length - 1);
    setCwdId(id);
    setSelected(null);
  }
  function back() {
    if (hIdx > 0) {
      setHIdx(hIdx - 1);
      setCwdId(history[hIdx - 1]);
    }
  }
  function fwd() {
    if (hIdx < history.length - 1) {
      setHIdx(hIdx + 1);
      setCwdId(history[hIdx + 1]);
    }
  }

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  function openItem(n: VNode) {
    if (n.kind === "dir") navigate(n.id);
    else openFile(n.id);
  }

  function newFolder() {
    const name = prompt("New folder name:", "New Folder");
    if (!name) return;
    create(cwdId, name.trim(), "dir");
  }
  function newTextFile() {
    const name = prompt("New file name:", "untitled.txt");
    if (!name) return;
    create(cwdId, name.trim(), "file", "");
  }

  return (
    <div className="flex h-full flex-col bg-background/40">
      {/* toolbar */}
      <div className="flex items-center gap-1 border-b border-window-border px-2 py-1.5 text-xs">
        <button
          onClick={back}
          disabled={hIdx === 0}
          className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={fwd}
          disabled={hIdx >= history.length - 1}
          className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => navigate(vfs.rootId)}
          className="rounded p-1 hover:bg-white/10"
        >
          <Home className="h-3.5 w-3.5" />
        </button>
        <div className="ml-2 flex-1 truncate rounded-md bg-black/30 px-2 py-1 font-mono text-[11px]">
          {pathOf(vfs, cwdId)}
        </div>
        <button
          onClick={newFolder}
          title="New folder"
          className="rounded p-1 hover:bg-white/10"
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={newTextFile}
          title="New text file"
          className="rounded p-1 hover:bg-white/10"
        >
          <FilePlus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => selected && del(selected)}
          disabled={!selected}
          title="Delete"
          className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setSelected(null)}
          title="Refresh"
          className="rounded p-1 hover:bg-white/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* body */}
      <div
        ref={ref}
        className="relative flex-1 overflow-auto p-3 scrollbar-thin"
        onClick={() => setSelected(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenu({
            x: e.nativeEvent.offsetX + (ref.current?.offsetLeft ?? 0),
            y: e.nativeEvent.offsetY + 36,
            targetId: null,
          });
        }}
      >
        {items.length === 0 ? (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            <div className="text-center">
              <Folder className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p>This folder is empty.</p>
              <p className="mt-1 opacity-70">
                Right-click to create a folder or file.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
            <AnimatePresence>
              {items.map((n) => {
                const Icon =
                  n.kind === "dir"
                    ? Folder
                    : n.kind === "image"
                      ? ImageIcon
                      : FileTextIcon;
                const isSel = selected === n.id;
                return (
                  <motion.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(n.id);
                    }}
                    onDoubleClick={() => openItem(n)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelected(n.id);
                      setMenu({
                        x:
                          e.clientX -
                          (ref.current?.getBoundingClientRect().left ?? 0),
                        y:
                          e.clientY -
                          (ref.current?.getBoundingClientRect().top ?? 0),
                        targetId: n.id,
                      });
                    }}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors ${isSel ? "bg-accent/30 ring-1 ring-accent" : "hover:bg-white/10"}`}
                  >
                    {n.kind === "image" && n.content ? (
                      <img
                        src={n.content}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <Icon
                        className={`h-10 w-10 ${n.kind === "dir" ? "text-amber-400" : "text-sky-300"}`}
                      />
                    )}
                    <span className="line-clamp-2 break-words text-[10.5px] font-medium">
                      {n.name}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {menu && (
          <div
            className="absolute z-50 w-48 overflow-hidden rounded-lg glass-strong p-1 text-xs shadow-window"
            style={{ left: menu.x, top: menu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {menu.targetId ? (
              <>
                <button
                  onClick={() => {
                    openItem(vfs.nodes[menu.targetId!]);
                    setMenu(null);
                  }}
                  className="block w-full rounded px-3 py-1.5 text-left hover:bg-accent/20"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    const n = vfs.nodes[menu.targetId!];
                    const name = prompt("Rename to:", n.name);
                    if (name) useOS.getState().vfsRename(n.id, name.trim());
                    setMenu(null);
                  }}
                  className="block w-full rounded px-3 py-1.5 text-left hover:bg-accent/20"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    del(menu.targetId!);
                    setMenu(null);
                  }}
                  disabled={vfs.nodes[menu.targetId]?.system}
                  className="block w-full rounded px-3 py-1.5 text-left text-rose-300 hover:bg-rose-500/20 disabled:opacity-30"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    newFolder();
                    setMenu(null);
                  }}
                  className="block w-full rounded px-3 py-1.5 text-left hover:bg-accent/20"
                >
                  New Folder
                </button>
                <button
                  onClick={() => {
                    newTextFile();
                    setMenu(null);
                  }}
                  className="block w-full rounded px-3 py-1.5 text-left hover:bg-accent/20"
                >
                  New Text File (.txt)
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* status bar with disk usage */}
      <div className="flex items-center gap-3 border-t border-window-border px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>{items.length} item(s)</span>
        <div className="flex flex-1 items-center gap-2">
          <span>Local Disk (C:)</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-accent transition-all"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <span className="tabular-nums">
            {(used / 1024).toFixed(1)} KB / 10 MB
          </span>
        </div>
      </div>
    </div>
  );
}
