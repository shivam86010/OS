import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  GitFork,
  GitBranch,
  Activity,
  RefreshCw,
  GitCommit,
  ExternalLink,
  Settings,
  GitPullRequest,
  CircleDot,
  Save,
} from "lucide-react";
import { profile } from "../data/portfolio";

interface Repo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}
interface Commit {
  repo: string;
  message: string;
  sha: string;
  date: string;
  url: string;
}
interface PR {
  id: string;
  repo: string;
  title: string;
  action: string;
  url: string;
  date: string;
  number: number;
  state: string;
}
interface Issue {
  id: string;
  repo: string;
  title: string;
  action: string;
  url: string;
  date: string;
  number: number;
}
interface GHUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
}
interface GHData {
  repos: Repo[];
  commits: Commit[];
  prs: PR[];
  issues: Issue[];
  user: GHUser | null;
}

interface Prefs {
  username: string;
  refreshMins: number;
  useCache: boolean;
}
const PREFS_KEY = "shivam-os:gh:prefs:v1";
const cacheKey = (u: string) => `shivam-os:gh:v2:${u.toLowerCase()}`;

const defaultPrefs = (): Prefs => {
  try {
    const v = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if (v?.username) return v;
  } catch {
    /* noop */
  }
  return {
    username: profile.github || "shivamsingh",
    refreshMins: 5,
    useCache: true,
  };
};

async function fetchGH(prefs: Prefs): Promise<GHData> {
  const username = prefs.username.trim() || "shivamsingh";
  const TTL = Math.max(1, prefs.refreshMins) * 60 * 1000;
  const key = cacheKey(username);
  if (prefs.useCache) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      if (v && Date.now() - v.ts < TTL) return v.data as GHData;
    } catch {
      /* noop */
    }
  }
  const [userRes, repoRes, evRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
    ),
    fetch(`https://api.github.com/users/${username}/events/public?per_page=50`),
  ]);
  if (!repoRes.ok)
    throw new Error(
      `GitHub API ${repoRes.status}: user '${username}' not found or rate-limited`,
    );
  const user = userRes.ok ? await userRes.json() : null;
  const repos: Repo[] = await repoRes.json();
  const events = evRes.ok ? await evRes.json() : [];
  type Ev = {
    id: string;
    type: string;
    repo: { name: string };
    created_at: string;
    payload?: {
      commits?: Array<{ message: string; sha: string; url: string }>;
      pull_request?: {
        title: string;
        html_url: string;
        number: number;
        state: string;
      };
      issue?: { title: string; html_url: string; number: number };
      action?: string;
    };
  };
  const evs = events as Ev[];
  const commits: Commit[] = evs
    .filter((e) => e.type === "PushEvent")
    .flatMap((e) =>
      (e.payload?.commits ?? []).map((c) => ({
        repo: e.repo.name,
        message: c.message,
        sha: c.sha,
        date: e.created_at,
        url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
      })),
    )
    .slice(0, 30);
  const prs: PR[] = evs
    .filter((e) => e.type === "PullRequestEvent" && e.payload?.pull_request)
    .map((e) => ({
      id: e.id,
      repo: e.repo.name,
      title: e.payload!.pull_request!.title,
      action: e.payload!.action || "opened",
      url: e.payload!.pull_request!.html_url,
      date: e.created_at,
      number: e.payload!.pull_request!.number,
      state: e.payload!.pull_request!.state,
    }))
    .slice(0, 20);
  const issues: Issue[] = evs
    .filter(
      (e) =>
        (e.type === "IssuesEvent" || e.type === "IssueCommentEvent") &&
        e.payload?.issue,
    )
    .map((e) => ({
      id: e.id,
      repo: e.repo.name,
      title: e.payload!.issue!.title,
      action:
        e.type === "IssueCommentEvent"
          ? "commented"
          : e.payload!.action || "opened",
      url: e.payload!.issue!.html_url,
      date: e.created_at,
      number: e.payload!.issue!.number,
    }))
    .slice(0, 20);
  const data: GHData = { repos, commits, prs, issues, user };
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* noop */
  }
  return data;
}

function generateGrid(seed = 7): { date: string; count: number }[][] {
  const weeks: { date: string; count: number }[][] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 52 * 7);
  let r = seed;
  for (let w = 0; w < 53; w++) {
    const days: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      r = (r * 9301 + 49297) % 233280;
      const v = r / 233280;
      const count = v > 0.78 ? 4 : v > 0.6 ? 3 : v > 0.42 ? 2 : v > 0.2 ? 1 : 0;
      const dt = new Date(start);
      dt.setDate(start.getDate() + w * 7 + d);
      days.push({ date: dt.toISOString().slice(0, 10), count });
    }
    weeks.push(days);
  }
  return weeks;
}

const cell = (c: number) =>
  c === 0
    ? "bg-white/5"
    : c === 1
      ? "bg-emerald-900"
      : c === 2
        ? "bg-emerald-700"
        : c === 3
          ? "bg-emerald-500"
          : "bg-emerald-300";

type Tab = "pulse" | "repos" | "commits" | "prs" | "issues" | "settings";

export function GitHubApp() {
  const [prefs, setPrefs] = useState<Prefs>(() => defaultPrefs());
  const [draftPrefs, setDraftPrefs] = useState<Prefs>(prefs);
  const [data, setData] = useState<GHData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pulse");
  const [savedFlash, setSavedFlash] = useState(false);
  const grid = useMemo(
    () =>
      generateGrid(
        prefs.username.split("").reduce((a, c) => a + c.charCodeAt(0), 7),
      ),
    [prefs.username],
  );

  const load = useCallback(async (p: Prefs) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchGH(p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(prefs);
  }, [load, prefs]);

  // auto refresh on interval
  useEffect(() => {
    const ms = Math.max(1, prefs.refreshMins) * 60 * 1000;
    const id = window.setInterval(() => {
      void load(prefs);
    }, ms);
    return () => window.clearInterval(id);
  }, [prefs, load]);

  const savePrefs = () => {
    const next: Prefs = {
      username: draftPrefs.username.trim() || "shivamsingh",
      refreshMins: Math.min(
        60,
        Math.max(1, Number(draftPrefs.refreshMins) || 5),
      ),
      useCache: !!draftPrefs.useCache,
    };
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    setPrefs(next);
    setDraftPrefs(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(cacheKey(prefs.username));
    } catch {
      /* noop */
    }
    void load({ ...prefs, useCache: false });
  };

  const total = grid.flat().reduce((s, d) => s + d.count, 0);

  const tabs: { id: Tab; label: string; icon?: React.ReactNode }[] = [
    { id: "pulse", label: "Pulse" },
    { id: "repos", label: "Repos" },
    { id: "commits", label: "Commits" },
    { id: "prs", label: "Pull Requests" },
    { id: "issues", label: "Issues" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="flex h-full flex-col bg-[oklch(0.18_0.02_270)] text-white">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/70">
            GitCommit.exe
          </span>
          <span className="ml-2 text-xs text-emerald-400">
            ● {error ? "offline" : "connected"}
          </span>
          <span className="ml-2 text-[10px] text-white/40">
            @{prefs.username} · {prefs.refreshMins}m
          </span>
        </div>
        <button
          onClick={() => load(prefs)}
          className="grid h-7 w-7 place-items-center rounded-md hover:bg-white/10"
          title="Refresh"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 text-lg font-bold">
          {data?.user?.avatar_url ? (
            <img
              src={data.user.avatar_url}
              alt=""
              className="h-12 w-12 rounded-full"
            />
          ) : (
            (prefs.username[0] || "S").toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="font-display text-sm font-semibold">
            {data?.user?.name || prefs.username}{" "}
            <span className="text-white/40">@{prefs.username}</span>
          </div>
          <div className="text-[11px] text-white/60">
            {data?.user?.bio || "Frontend Developer • React • Next.js"}
          </div>
        </div>
        {data?.user && (
          <div className="text-right text-[11px] text-white/60">
            <div>
              <strong className="text-white">{data.user.public_repos}</strong>{" "}
              repos
            </div>
            <div>
              <strong className="text-white">{data.user.followers}</strong>{" "}
              followers
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap border-b border-white/10 text-xs">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === "settings") setDraftPrefs(prefs);
              setTab(t.id);
            }}
            className={`px-3 py-2 font-medium uppercase tracking-wider transition-colors ${tab === t.id ? "bg-white/5 text-emerald-300 border-b-2 border-emerald-400" : "text-white/50 hover:text-white"}`}
          >
            {t.id === "settings" ? (
              <span className="inline-flex items-center gap-1">
                <Settings className="h-3 w-3" /> {t.label}
              </span>
            ) : (
              t.label
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-4">
        {tab === "pulse" && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-white/70">
                🟢 {total} contributions in the last year
              </span>
              <span className="font-mono text-white/40">53 weeks</span>
            </div>
            <div className="flex gap-[3px] overflow-x-auto">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((d, di) => (
                    <motion.div
                      key={di}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (wi * 7 + di) * 0.002 }}
                      title={`${d.date}: ${d.count} contributions`}
                      className={`h-[11px] w-[11px] rounded-sm ${cell(d.count)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-white/50">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((c) => (
                <div
                  key={c}
                  className={`h-[10px] w-[10px] rounded-sm ${cell(c)}`}
                />
              ))}
              <span>More</span>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Activity className="h-3 w-3" /> Live Commit Pipeline
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 animate-pulse rounded bg-white/5"
                    />
                  ))}
                {!loading &&
                  data?.commits.slice(0, 6).map((c) => (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={c.sha}
                      className="flex items-center gap-2 hover:text-emerald-300"
                    >
                      <span className="text-purple-400">
                        [{c.repo.split("/")[1]}]
                      </span>
                      <span className="text-amber-400">
                        {c.sha.slice(0, 7)}
                      </span>
                      <span className="truncate text-white/70">
                        {c.message}
                      </span>
                    </a>
                  ))}
                {!loading && !data?.commits.length && (
                  <div className="text-white/40">No recent push events.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "repos" && (
          <div className="grid grid-cols-1 gap-2">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            {!loading &&
              data?.repos.map((r) => (
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={r.id}
                  className="group rounded-lg border border-white/10 bg-black/30 p-3 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300 group-hover:text-emerald-200">
                        📁 {r.name}{" "}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/60 line-clamp-2">
                        {r.description || "No description provided."}
                      </div>
                    </div>
                    {r.language && (
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                        {r.language}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-white/50">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" /> {r.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" /> {r.forks_count}
                    </span>
                    <span>
                      updated {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            {error && (
              <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}
          </div>
        )}

        {tab === "commits" && (
          <div className="space-y-1.5 font-mono text-xs">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-white/5" />
              ))}
            {!loading &&
              data?.commits.map((c) => (
                <a
                  key={c.sha + c.date}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 rounded p-1.5 hover:bg-white/5"
                >
                  <GitCommit className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">
                      <span className="text-amber-400">
                        {c.sha.slice(0, 7)}
                      </span>{" "}
                      <span className="text-white/90">{c.message}</span>
                    </div>
                    <div className="text-[10px] text-white/40">
                      {c.repo} • {new Date(c.date).toLocaleString()}
                    </div>
                  </div>
                </a>
              ))}
            {!loading && !data?.commits.length && (
              <div className="text-white/40">No recent commits.</div>
            )}
          </div>
        )}

        {tab === "prs" && (
          <div className="space-y-2">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            {!loading &&
              data?.prs.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-white/10 bg-black/30 p-3 hover:border-purple-400/40 hover:bg-purple-400/5"
                >
                  <div className="flex items-start gap-2">
                    <GitPullRequest
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${p.state === "open" ? "text-emerald-400" : "text-purple-400"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white/90">
                        {p.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
                        <span className="text-purple-300">{p.repo}</span>
                        <span>#{p.number}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${p.action === "opened" ? "bg-emerald-500/20 text-emerald-300" : p.action === "closed" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"}`}
                        >
                          {p.action}
                        </span>
                        <span>{new Date(p.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            {!loading && !data?.prs.length && (
              <div className="rounded border border-white/10 bg-black/20 p-4 text-center text-xs text-white/40">
                No pull request activity in recent public events.
              </div>
            )}
          </div>
        )}

        {tab === "issues" && (
          <div className="space-y-2">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-white/5"
                />
              ))}
            {!loading &&
              data?.issues.map((it) => (
                <a
                  key={it.id}
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-white/10 bg-black/30 p-3 hover:border-amber-400/40 hover:bg-amber-400/5"
                >
                  <div className="flex items-start gap-2">
                    <CircleDot className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white/90">
                        {it.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
                        <span className="text-purple-300">{it.repo}</span>
                        <span>#{it.number}</span>
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] uppercase text-amber-300">
                          {it.action}
                        </span>
                        <span>{new Date(it.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            {!loading && !data?.issues.length && (
              <div className="rounded border border-white/10 bg-black/20 p-4 text-center text-xs text-white/40">
                No issue activity in recent public events.
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="mx-auto max-w-md space-y-5">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Settings className="h-3 w-3" /> GitCommit.exe Preferences
              </div>
              <p className="text-[11px] text-white/50">
                Configure which GitHub identity feeds this app and how often it
                polls the public API.
              </p>
            </div>

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/60">
                GitHub Username
              </span>
              <input
                type="text"
                value={draftPrefs.username}
                onChange={(e) =>
                  setDraftPrefs({ ...draftPrefs, username: e.target.value })
                }
                placeholder="octocat"
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-emerald-400/60"
              />
              <span className="mt-1 block text-[10px] text-white/40">
                Public profile — no token needed. Rate limit: 60 req/hr
                unauthenticated.
              </span>
            </label>

            <label className="block">
              <span className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-white/60">
                <span>Refresh Frequency</span>
                <span className="font-mono text-emerald-300">
                  {draftPrefs.refreshMins} min
                </span>
              </span>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={draftPrefs.refreshMins}
                onChange={(e) =>
                  setDraftPrefs({
                    ...draftPrefs,
                    refreshMins: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-400"
              />
              <div className="mt-1 flex justify-between text-[10px] text-white/40">
                <span>1m</span>
                <span>30m</span>
                <span>60m</span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3">
              <input
                type="checkbox"
                checked={draftPrefs.useCache}
                onChange={(e) =>
                  setDraftPrefs({ ...draftPrefs, useCache: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 accent-emerald-400"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white/90">
                  Cached Loading
                </div>
                <div className="text-[11px] text-white/50">
                  Serve from localStorage within the refresh window. Disable for
                  always-fresh data (burns rate limit faster).
                </div>
              </div>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={savePrefs}
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400"
              >
                <Save className="h-3 w-3" /> Save & Reload
              </button>
              <button
                onClick={clearCache}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
              >
                Clear Cache
              </button>
              <button
                onClick={() =>
                  setDraftPrefs({
                    username: "shivamsingh",
                    refreshMins: 5,
                    useCache: true,
                  })
                }
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
              >
                Reset Defaults
              </button>
              {savedFlash && (
                <span className="text-[11px] text-emerald-300">✓ Saved</span>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] text-white/60">
              <div className="mb-1 font-bold uppercase tracking-wider text-white/70">
                Status
              </div>
              <div>
                Active user:{" "}
                <span className="font-mono text-emerald-300">
                  @{prefs.username}
                </span>
              </div>
              <div>
                Auto-refresh: every{" "}
                <span className="text-emerald-300">{prefs.refreshMins}</span>{" "}
                minute(s)
              </div>
              <div>
                Cache:{" "}
                <span
                  className={
                    prefs.useCache ? "text-emerald-300" : "text-rose-300"
                  }
                >
                  {prefs.useCache ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              {error && <div className="mt-2 text-rose-300">⚠ {error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
