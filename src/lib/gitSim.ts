// Lightweight git simulator persisted to localStorage, keyed by terminal cwd path.
export interface GitCommit {
  hash: string;
  message: string;
  timestamp: string;
  snapshot: Record<string, string>;
}
export interface GitRepo {
  initialized: true;
  staging: Record<string, string>;
  commits: GitCommit[];
}

const KEY = "shivam-os:gitsim:v1";

function load(): Record<string, GitRepo> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function save(data: Record<string, GitRepo>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* noop */
  }
}

export function getRepo(path: string): GitRepo | null {
  return load()[path] ?? null;
}
export function initRepo(path: string): boolean {
  const d = load();
  if (d[path]) return false;
  d[path] = { initialized: true, staging: {}, commits: [] };
  save(d);
  return true;
}
export function stageFiles(
  path: string,
  files: Record<string, string>,
): number {
  const d = load();
  const r = d[path];
  if (!r) return -1;
  Object.assign(r.staging, files);
  save(d);
  return Object.keys(files).length;
}
export function commit(path: string, message: string): GitCommit | null {
  const d = load();
  const r = d[path];
  if (!r) return null;
  if (Object.keys(r.staging).length === 0) return null;
  const c: GitCommit = {
    hash: Math.random().toString(36).slice(2, 9),
    message,
    timestamp: new Date().toLocaleString(),
    snapshot: { ...r.staging },
  };
  r.commits.push(c);
  r.staging = {};
  save(d);
  return c;
}
export function log(path: string): GitCommit[] {
  return load()[path]?.commits ?? [];
}
export function status(path: string): { staged: string[] } | null {
  const r = load()[path];
  if (!r) return null;
  return { staged: Object.keys(r.staging) };
}
