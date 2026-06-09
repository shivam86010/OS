// Recursive virtual filesystem persisted to localStorage.
// Every node has an id; directories hold ordered children ids.

export type VNodeKind = "dir" | "file" | "image";

export interface VNode {
  id: string;
  name: string;
  kind: VNodeKind;
  parentId: string | null;
  content?: string; // text content or data-URL for images
  createdAt: number;
  updatedAt: number;
  children?: string[]; // for dirs
  system?: boolean; // can't delete
}

export interface VFS {
  rootId: string;
  nodes: Record<string, VNode>;
}

const STORAGE_KEY = "shivam-os:vfs:v1";

function uid() {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createDefaultVFS(): VFS {
  const root: VNode = {
    id: "root",
    name: "/",
    kind: "dir",
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    children: [],
    system: true,
  };
  const vfs: VFS = { rootId: "root", nodes: { root } };

  const mk = (name: string, parentId: string, system = true): VNode => {
    const n: VNode = {
      id: uid(),
      name,
      kind: "dir",
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      children: [],
      system,
    };
    vfs.nodes[n.id] = n;
    vfs.nodes[parentId].children!.push(n.id);
    return n;
  };
  const mkFile = (
    name: string,
    parentId: string,
    content: string,
    system = true,
  ): VNode => {
    const n: VNode = {
      id: uid(),
      name,
      kind: "file",
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content,
      system,
    };
    vfs.nodes[n.id] = n;
    vfs.nodes[parentId].children!.push(n.id);
    return n;
  };

  const desktop = mk("Desktop", root.id);
  mk("Documents", root.id);
  const pictures = mk("Pictures", root.id);
  mk("Downloads", root.id);
  mkFile(
    "README.txt",
    desktop.id,
    "Welcome to Shivam OS!\n\nRight-click anywhere in the Files app to create a new folder or text file.\nYour edits are saved to this virtual hard drive (localStorage) and will be here when you come back.\n\n— Shivam",
    false,
  );
  mkFile(
    "feedback.txt",
    desktop.id,
    "Type your thoughts about this portfolio here — they persist across visits.",
    false,
  );
  void pictures; // reserved for paint exports

  return vfs;
}

export function loadVFS(): VFS {
  if (typeof window === "undefined") return createDefaultVFS();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultVFS();
    const parsed = JSON.parse(raw) as VFS;
    if (!parsed.rootId || !parsed.nodes?.[parsed.rootId])
      return createDefaultVFS();
    return parsed;
  } catch {
    return createDefaultVFS();
  }
}
export function saveVFS(vfs: VFS) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vfs));
  } catch {
    /* quota */
  }
}

export function vfsCreate(
  vfs: VFS,
  parentId: string,
  name: string,
  kind: VNodeKind,
  content = "",
): VFS {
  const parent = vfs.nodes[parentId];
  if (!parent || parent.kind !== "dir") return vfs;
  let final = name;
  let i = 1;
  const taken = new Set(
    (parent.children ?? []).map((id) => vfs.nodes[id]?.name),
  );
  while (taken.has(final)) {
    const dot = name.lastIndexOf(".");
    final =
      dot > 0
        ? `${name.slice(0, dot)} (${i})${name.slice(dot)}`
        : `${name} (${i})`;
    i++;
  }
  const n: VNode = {
    id: uid(),
    name: final,
    kind,
    parentId,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...(kind === "dir" ? { children: [] } : {}),
  };
  const next: VFS = {
    ...vfs,
    nodes: {
      ...vfs.nodes,
      [n.id]: n,
      [parentId]: {
        ...parent,
        children: [...(parent.children ?? []), n.id],
        updatedAt: Date.now(),
      },
    },
  };
  saveVFS(next);
  return next;
}

export function vfsDelete(vfs: VFS, id: string): VFS {
  const n = vfs.nodes[id];
  if (!n || n.system) return vfs;
  const nodes = { ...vfs.nodes };
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    const node = nodes[cur];
    if (!node) continue;
    if (node.children) stack.push(...node.children);
    delete nodes[cur];
  }
  if (n.parentId && nodes[n.parentId]?.children) {
    nodes[n.parentId] = {
      ...nodes[n.parentId],
      children: nodes[n.parentId].children!.filter((c) => c !== id),
    };
  }
  const next: VFS = { ...vfs, nodes };
  saveVFS(next);
  return next;
}

export function vfsRename(vfs: VFS, id: string, name: string): VFS {
  const n = vfs.nodes[id];
  if (!n) return vfs;
  const next: VFS = {
    ...vfs,
    nodes: { ...vfs.nodes, [id]: { ...n, name, updatedAt: Date.now() } },
  };
  saveVFS(next);
  return next;
}

export function vfsWrite(vfs: VFS, id: string, content: string): VFS {
  const n = vfs.nodes[id];
  if (!n) return vfs;
  const next: VFS = {
    ...vfs,
    nodes: { ...vfs.nodes, [id]: { ...n, content, updatedAt: Date.now() } },
  };
  saveVFS(next);
  return next;
}

export function pathOf(vfs: VFS, id: string): string {
  const parts: string[] = [];
  let cur: VNode | undefined = vfs.nodes[id];
  while (cur && cur.parentId) {
    parts.unshift(cur.name);
    cur = vfs.nodes[cur.parentId];
  }
  return "/" + parts.join("/");
}

export function diskUsage(vfs: VFS): { used: number; total: number } {
  let used = 0;
  for (const n of Object.values(vfs.nodes))
    used += (n.content?.length ?? 0) + n.name.length + 64;
  return { used, total: 10 * 1024 * 1024 };
}
