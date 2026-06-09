import { useEffect, useRef, useState } from "react";
import { useOS } from "../store/os";
import { profile, projects, skills, experience } from "../data/portfolio";
import { sfx } from "../lib/sound";
import {
  initRepo,
  stageFiles,
  commit as gitCommit,
  log as gitLog,
  status as gitStatus,
  getRepo,
} from "../lib/gitSim";

type Line = { kind: "in" | "out"; text: string };
type Node = { type: "dir" | "file"; children?: Record<string, Node> };

const initialFS: Node = {
  type: "dir",
  children: {
    about: { type: "file" },
    "resume.pdf": { type: "file" },
    projects: {
      type: "dir",
      children: Object.fromEntries(
        projects.map((p) => [
          p.name.toLowerCase().replace(/\s+/g, "-"),
          { type: "dir", children: { "README.md": { type: "file" } } },
        ]),
      ),
    },
    skills: {
      type: "dir",
      children: Object.fromEntries(
        skills.map((c) => [
          c.category.toLowerCase().replace(/\s|&/g, "-"),
          { type: "file" },
        ]),
      ),
    },
  },
};

function getNode(root: Node, path: string[]): Node | null {
  let cur: Node = root;
  for (const p of path) {
    if (!cur.children?.[p]) return null;
    cur = cur.children[p];
  }
  return cur;
}

export function TerminalApp() {
  const openApp = useOS((s) => s.openApp);
  const unlock = useOS((s) => s.unlock);
  const notify = useOS((s) => s.notify);
  const triggerCrash = useOS((s) => s.triggerCrash);
  const installPackage = useOS((s) => s.installPackage);
  const packages = useOS((s) => s.packages);
  const clipboard = useOS((s) => s.clipboard);
  const addWidget = useOS((s) => s.addWidget);
  const [fs, setFs] = useState<Node>(initialFS);
  const [cwd, setCwd] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "Shivam OS Terminal — zsh 5.9" },
    { kind: "out", text: "Type 'help' for available commands." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo(0, scrollerRef.current.scrollHeight);
  }, [lines]);

  function print(text: string) {
    setLines((l) => [...l, { kind: "out", text }]);
  }
  function prompt() {
    return `shivam@os:/${cwd.join("/")}$`;
  }

  function tryOpenVSCode(target: string) {
    // Try the vscode:// URL handler. If VS Code is installed it opens; otherwise nothing happens.
    print(`code: requesting OS to open '${target}' in VS Code…`);
    const before = Date.now();
    const url = `vscode://file/${target.replace(/^\.?\//, "")}`;
    // Use hidden iframe approach to avoid navigation
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    // Detect: if the tab loses focus within 1.2s, VS Code likely launched
    let opened = false;
    const onBlur = () => {
      opened = true;
    };
    window.addEventListener("blur", onBlur, { once: true });
    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      document.body.removeChild(iframe);
      if (opened || Date.now() - before > 1500) {
        print(`✓ Launched VS Code (${target})`);
        unlock("easter");
      } else {
        print(`✗ VS Code is not installed on this system.`);
        print(
          `  Install it from https://code.visualstudio.com — or open the folder manually.`,
        );
      }
    }, 1400);
  }

  async function installFlow(pkgId: string) {
    const pkg = packages[pkgId];
    if (!pkg) return;
    setBusy(true);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    print(`ℹ Fetching registry metadata for "${pkgId}"...`);
    await sleep(600);
    print(`📡 Connecting to virtual mirrors...`);
    await sleep(500);
    for (let p = 0; p <= 100; p += 10) {
      const filled = Math.round(p / 10);
      const bar = "█".repeat(filled) + "░".repeat(10 - filled);
      // replace last line if it's a progress bar
      setLines((l) => {
        const last = l[l.length - 1];
        const next = `🚚 Downloading [${bar}] ${p.toString().padStart(3, " ")}%`;
        if (
          last &&
          last.kind === "out" &&
          last.text.startsWith("🚚 Downloading")
        ) {
          return [...l.slice(0, -1), { kind: "out", text: next }];
        }
        return [...l, { kind: "out", text: next }];
      });
      await sleep(150);
    }
    print(`📦 Unpacking binaries and verifying checksums...`);
    await sleep(450);
    print(`🔗 Linking '${pkgId}' shortcut to /desktop...`);
    await sleep(350);
    installPackage(pkgId);
    print(
      `🎉 Success! "${pkg.name}" installed. Shortcut added to your desktop. Double-click to launch.`,
    );
    unlock("easter");
    setBusy(false);
  }

  function exec(raw: string) {
    if (busy) return;
    const trimmed = raw.trim();
    setLines((l) => [...l, { kind: "in", text: `${prompt()} ${raw}` }]);
    if (!trimmed) return;
    setHistory((h) => [...h, trimmed]);
    setHIdx(-1);

    // CATASTROPHIC commands → BSOD
    if (
      /^\s*(sudo\s+)?rm\s+-rf\s+\/(\s|$)/.test(trimmed) ||
      trimmed === ":(){ :|:& };:"
    ) {
      print("rm: removing /System ... ⚠️");
      print("rm: removing /Users ... ⚠️");
      print("rm: removing /kernel ... 💀");
      setTimeout(triggerCrash, 600);
      return;
    }

    const [cmd, ...args] = trimmed.split(/\s+/);

    // npm-style package manager
    if (cmd === "npm" || cmd === "pkg" || cmd === "brew") {
      const sub = args[0];
      if (sub === "list" || sub === "ls") {
        print("Available packages:");
        Object.values(packages).forEach((p) =>
          print(
            `  ${p.id.padEnd(10)} ${p.installed ? "✓ installed" : "○ available"}  — ${p.description}`,
          ),
        );
        return;
      }
      if (sub !== "install" && sub !== "i") {
        print(`${cmd}: try '${cmd} install <pkg>' or '${cmd} list'`);
        return;
      }
      const pkgId = args[1];
      if (!pkgId) {
        print(
          `${cmd} ERR! Please specify a package. Example: ${cmd} install doom`,
        );
        return;
      }
      const pkg = packages[pkgId];
      if (!pkg) {
        print(
          `${cmd} ERR! 404 Package not found: "${pkgId}" is not in the Shivam OS repository.`,
        );
        return;
      }
      if (pkg.installed) {
        print(
          `${cmd}: "${pkgId}" is already installed. Find it on your desktop.`,
        );
        return;
      }
      void installFlow(pkgId);
      return;
    }

    // ping <host> — real network latency via fetch
    if (cmd === "ping") {
      const host = args[0] || "google.com";
      void (async () => {
        setBusy(true);
        const url = `https://${host.replace(/^https?:\/\//, "")}/favicon.ico`;
        print(`PING ${host} — sending 4 packets via fetch()...`);
        const times: number[] = [];
        for (let i = 1; i <= 4; i++) {
          const t0 = performance.now();
          try {
            await fetch(url, { mode: "no-cors", cache: "no-store" });
            const ms = performance.now() - t0;
            times.push(ms);
            print(
              `64 bytes from ${host}: icmp_seq=${i} time=${ms.toFixed(1)} ms`,
            );
          } catch {
            print(
              `Request timeout for icmp_seq ${i} (host unreachable from browser)`,
            );
          }
          await new Promise((r) => setTimeout(r, 400));
        }
        if (times.length) {
          const min = Math.min(...times),
            max = Math.max(...times),
            avg = times.reduce((a, b) => a + b, 0) / times.length;
          print(`--- ${host} ping statistics ---`);
          print(
            `${times.length} packets transmitted, ${times.length} received, 0% packet loss`,
          );
          print(
            `round-trip min/avg/max = ${min.toFixed(1)}/${avg.toFixed(1)}/${max.toFixed(1)} ms`,
          );
        }
        setBusy(false);
      })();
      return;
    }

    // clipboard
    if (cmd === "paste") {
      if (clipboard.type === "text" && typeof clipboard.data === "string") {
        clipboard.data.split("\n").forEach((line) => print(line));
      } else print("paste: clipboard is empty.");
      return;
    }

    // widgets
    if (cmd === "widget") {
      const sub = args[0];
      if (
        sub === "add" &&
        (args[1] === "clock" || args[1] === "sticky" || args[1] === "cpu")
      ) {
        addWidget(args[1]);
        print(`✓ Pinned ${args[1]} widget to desktop.`);
      } else {
        print("Usage: widget add <clock|sticky|cpu>");
      }
      return;
    }

    // git simulation (per-cwd repositories)
    if (cmd === "git") {
      const repoKey = "/" + cwd.join("/");
      const sub = args[0];
      if (!sub) {
        print("usage: git <init|status|add|commit|log>");
        return;
      }
      if (sub === "init") {
        const ok = initRepo(repoKey);
        print(
          ok
            ? `Initialized empty Git repository in ${repoKey}/.git/`
            : "Already a git repository.",
        );
        return;
      }
      const repo = getRepo(repoKey);
      if (!repo) {
        print("fatal: not a git repository (use 'git init' here first)");
        return;
      }
      if (sub === "status") {
        const s = gitStatus(repoKey)!;
        if (!s.staged.length)
          print("On branch master\nnothing to commit, working tree clean");
        else
          print(
            "On branch master\nChanges to be committed:\n  " +
              s.staged.map((f) => `modified:   ${f}`).join("\n  "),
          );
        return;
      }
      if (sub === "add") {
        // snapshot files inside current cwd dir of VFS
        const target = args[1] || ".";
        const node = getNode(fs, cwd);
        const files: Record<string, string> = {};
        if (node?.children) {
          Object.entries(node.children).forEach(([n, v]) => {
            if (v.type === "file" && (target === "." || target === n))
              files[n] = `[snapshot of ${n} @ ${Date.now()}]`;
          });
        }
        const count = stageFiles(repoKey, files);
        print(count > 0 ? `staged ${count} file(s)` : "nothing to stage");
        return;
      }
      if (sub === "commit") {
        const mIdx = args.indexOf("-m");
        const msg =
          mIdx >= 0
            ? args
                .slice(mIdx + 1)
                .join(" ")
                .replace(/['"]/g, "")
            : "update";
        const c = gitCommit(repoKey, msg);
        if (!c) print("nothing to commit (run 'git add' first)");
        else {
          print(`[master ${c.hash}] ${c.message}`);
          print(` ${Object.keys(c.snapshot).length} file(s) tracked`);
          unlock("easter");
        }
        return;
      }
      if (sub === "log") {
        const commits = gitLog(repoKey);
        if (!commits.length) {
          print("fatal: branch 'master' has no commits yet");
          return;
        }
        commits
          .slice()
          .reverse()
          .forEach((c) => {
            print(`commit ${c.hash}`);
            print(`Author: recruiter@shivam-os`);
            print(`Date:   ${c.timestamp}`);
            print(`\n    ${c.message}\n`);
          });
        return;
      }
      print(`git: '${sub}' is not a git command`);
      return;
    }

    switch (cmd) {
      case "help":
        print(
          "Commands: help, about, experience, skills, projects, resume, contact, ls, cd <dir>, pwd, mkdir <name>, code <dir>, ping <host>, paste, widget add <type>, npm install <pkg>, git <init|status|add|commit|log>, clear, whoami, date, neofetch, react --version, sudo hire shivam",
        );
        break;
      case "about":
        print(`${profile.name} — ${profile.role}\n${profile.bio}`);
        break;
      case "experience":
        print(
          experience
            .map((e) => `${e.period}  ${e.role} @ ${e.company}`)
            .join("\n"),
        );
        break;
      case "skills":
        print(
          skills
            .flatMap((c) =>
              c.items.map(
                (i) =>
                  `${i.name.padEnd(20)} ${"█".repeat(Math.round(i.value / 10))} ${i.value}%`,
              ),
            )
            .join("\n"),
        );
        break;
      case "projects":
        print(
          projects
            .map((p, i) => `${i + 1}. ${p.name}  —  ${p.result}`)
            .join("\n"),
        );
        openApp("projects");
        break;
      case "resume":
        print("Opening resume.pdf...");
        openApp("resume");
        unlock("resume");
        break;
      case "contact":
        print(
          `Email:    ${profile.email}\nPhone:    ${profile.phone}\nGitHub:   github.com/${profile.github}`,
        );
        openApp("contact");
        break;
      case "ls": {
        const node = getNode(fs, cwd);
        if (!node?.children) {
          print("");
          break;
        }
        print(
          Object.entries(node.children)
            .map(([n, v]) => (v.type === "dir" ? `${n}/` : n))
            .join("  "),
        );
        break;
      }
      case "pwd":
        print(`/${cwd.join("/")}`);
        break;
      case "cd": {
        const target = args[0];
        if (!target || target === "~" || target === "/") {
          setCwd([]);
          break;
        }
        if (target === "..") {
          setCwd((c) => c.slice(0, -1));
          break;
        }
        const parts = target.split("/").filter(Boolean);
        const next = [...cwd, ...parts];
        const node = getNode(fs, next);
        if (!node || node.type !== "dir") {
          print(`cd: ${target}: No such directory`);
          break;
        }
        setCwd(next);
        break;
      }
      case "mkdir": {
        const name = args[0];
        if (!name) {
          print("mkdir: missing operand");
          break;
        }
        const newFs = structuredClone(fs);
        const parent = getNode(newFs, cwd);
        if (!parent || parent.type !== "dir") {
          print("mkdir: cwd error");
          break;
        }
        parent.children = parent.children || {};
        if (parent.children[name]) {
          print(`mkdir: '${name}' exists`);
          break;
        }
        parent.children[name] = { type: "dir", children: {} };
        setFs(newFs);
        print(`created directory '${name}'`);
        break;
      }
      case "code": {
        const target = args[0] || ".";
        tryOpenVSCode(target);
        break;
      }
      case "clear":
        setLines([]);
        break;
      case "whoami":
        print("recruiter@shivam-os  (welcome, friend)");
        break;
      case "date":
        print(new Date().toString());
        break;
      case "neofetch":
        print(
          `         /\\\n        /  \\         shivam@os\n       /    \\        ───────────\n      /  /\\  \\       OS:    Shivam OS 3.14\n     /  /  \\  \\      Host:  Frontend Engineer\n    /  /____\\  \\     Kernel: React 19\n   /____________\\    Shell: zsh 5.9\n                     Stack: ${profile.stack.slice(0, 4).join(", ")}`,
        );
        break;
      case "react":
        if (args[0] === "--version")
          print("React Expertise: ADVANCED  (v19.0.0)");
        else print("react: try 'react --version'");
        break;
      case "sudo":
        if (args.join(" ") === "hire shivam") {
          print("[sudo] password for recruiter: ********");
          setTimeout(
            () => print("Permission Granted. Excellent decision. ✨"),
            350,
          );
          notify({ title: "🏆 Easter egg found", body: "sudo hire shivam" });
          unlock("easter");
        } else print(`sudo: '${args.join(" ")}': permission denied`);
        break;
      default:
        print(`zsh: command not found: ${cmd}`);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex h-full flex-col bg-black/80 p-3 font-mono text-[13px] leading-relaxed text-emerald-300"
    >
      <div
        ref={scrollerRef}
        className="flex-1 overflow-auto scrollbar-thin whitespace-pre-wrap"
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === "in" ? "text-emerald-400" : "text-emerald-200/90"
            }
          >
            {l.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-emerald-400">{prompt()}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            sfx.key();
            if (e.key === "Enter") {
              exec(input);
              setInput("");
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              if (!history.length) return;
              const i = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
              setHIdx(i);
              setInput(history[i]);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              if (hIdx < 0) return;
              const i = hIdx + 1;
              if (i >= history.length) {
                setHIdx(-1);
                setInput("");
              } else {
                setHIdx(i);
                setInput(history[i]);
              }
            } else if (e.key === "l" && e.ctrlKey) {
              e.preventDefault();
              setLines([]);
            } else if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
              // IPC pipe: fall back to in-app clipboard slice if browser clipboard is empty
              if (
                clipboard.type === "text" &&
                typeof clipboard.data === "string"
              ) {
                e.preventDefault();
                setInput((v) => v + clipboard.data);
              }
            }
          }}
          className="flex-1 bg-transparent outline-none caret-emerald-300"
          autoFocus
          spellCheck={false}
        />
      </div>
    </div>
  );
}
