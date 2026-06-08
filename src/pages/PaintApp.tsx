import { useEffect, useRef, useState } from "react";
import { Brush, Eraser, Save, Trash2 } from "lucide-react";
import { useOS } from "@/store/os";

const COLORS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#a855f7");
  const [size, setSize] = useState(6);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const drawing = useRef(false);
  const vfs = useOS((s) => s.vfs);
  const create = useOS((s) => s.vfsCreate);
  const notify = useOS((s) => s.notify);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  function start(e: React.MouseEvent<HTMLCanvasElement>) {
    drawing.current = true;
    draw(e);
  }
  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    ctx.fillStyle = tool === "eraser" ? "#0f172a" : color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  function stop() {
    drawing.current = false;
  }

  function clear() {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, c.width, c.height);
  }

  function saveToDesktop() {
    const c = canvasRef.current!;
    const dataUrl = c.toDataURL("image/png");
    // Find Desktop dir id
    const desktop = Object.values(vfs.nodes).find(
      (n) =>
        n.kind === "dir" && n.parentId === vfs.rootId && n.name === "Desktop",
    );
    const target = desktop?.id ?? vfs.rootId;
    create(target, `painting-${Date.now()}.png`, "image", dataUrl);
    notify({
      title: "🎨 Saved to Desktop",
      body: "Your painting is now a file you can re-open.",
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-window-border px-3 py-2 text-xs">
        <button
          onClick={() => setTool("brush")}
          className={`flex items-center gap-1 rounded px-2 py-1 ${tool === "brush" ? "bg-accent/40" : "hover:bg-white/10"}`}
        >
          <Brush className="h-3.5 w-3.5" /> Brush
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`flex items-center gap-1 rounded px-2 py-1 ${tool === "eraser" ? "bg-accent/40" : "hover:bg-white/10"}`}
        >
          <Eraser className="h-3.5 w-3.5" /> Eraser
        </button>
        <div className="ml-2 flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("brush");
              }}
              className={`h-5 w-5 rounded-full ring-2 ${color === c ? "ring-foreground" : "ring-transparent"}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="ml-2 flex items-center gap-2 text-muted-foreground">
          Size{" "}
          <input
            type="range"
            min={1}
            max={40}
            value={size}
            onChange={(e) => setSize(+e.target.value)}
            className="accent-accent"
          />
          <span className="w-6 tabular-nums">{size}</span>
        </label>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 hover:bg-white/20"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            onClick={saveToDesktop}
            className="flex items-center gap-1 rounded bg-accent/40 px-2 py-1 hover:bg-accent/60"
          >
            <Save className="h-3.5 w-3.5" /> Save to Desktop
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-black/40 p-2">
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          className="h-full w-full rounded border border-window-border"
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
        />
      </div>
    </div>
  );
}
