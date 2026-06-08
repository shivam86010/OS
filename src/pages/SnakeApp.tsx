import { useEffect, useRef, useState } from "react";

const SIZE = 18;
const CELL = 18;

type Pt = { x: number; y: number };
type Dir = "U" | "D" | "L" | "R";

function newFood(snake: Pt[]): Pt {
  while (true) {
    const f = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export function SnakeApp() {
  const [snake, setSnake] = useState<Pt[]>([
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 7, y: 9 },
  ]);
  const [food, setFood] = useState<Pt>({ x: 14, y: 9 });
  const [dir, setDir] = useState<Dir>("R");
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const dirRef = useRef<Dir>("R");

  useEffect(() => {
    dirRef.current = dir;
  }, [dir]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if ((e.key === "ArrowUp" || e.key === "w") && d !== "D") setDir("U");
      else if ((e.key === "ArrowDown" || e.key === "s") && d !== "U")
        setDir("D");
      else if ((e.key === "ArrowLeft" || e.key === "a") && d !== "R")
        setDir("L");
      else if ((e.key === "ArrowRight" || e.key === "d") && d !== "L")
        setDir("R");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (dead) return;
    const id = setInterval(() => {
      setSnake((cur) => {
        const head = cur[0];
        const d = dirRef.current;
        const nh = {
          x: head.x + (d === "L" ? -1 : d === "R" ? 1 : 0),
          y: head.y + (d === "U" ? -1 : d === "D" ? 1 : 0),
        };
        if (
          nh.x < 0 ||
          nh.y < 0 ||
          nh.x >= SIZE ||
          nh.y >= SIZE ||
          cur.some((s) => s.x === nh.x && s.y === nh.y)
        ) {
          setDead(true);
          setBest((b) => Math.max(b, score));
          return cur;
        }
        const grew = nh.x === food.x && nh.y === food.y;
        const next = [nh, ...cur];
        if (grew) {
          setScore((s) => s + 1);
          setFood(newFood(next));
        } else next.pop();
        return next;
      });
    }, 110);
    return () => clearInterval(id);
  }, [dead, food, score]);

  function reset() {
    setSnake([
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ]);
    setFood({ x: 14, y: 9 });
    setDir("R");
    setScore(0);
    setDead(false);
  }

  return (
    <div className="flex h-full flex-col items-center bg-zinc-950 p-4 text-emerald-300">
      <div className="mb-3 flex w-full items-center justify-between font-mono text-sm">
        <div>
          SCORE: <span className="text-emerald-400">{score}</span>
        </div>
        <div>
          BEST: <span className="text-amber-300">{best}</span>
        </div>
      </div>
      <div
        className="relative rounded-md border border-emerald-500/30 bg-black p-2"
        style={{ width: SIZE * CELL + 16, height: SIZE * CELL + 16 }}
      >
        <div
          className="relative"
          style={{ width: SIZE * CELL, height: SIZE * CELL }}
        >
          {snake.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: s.x * CELL,
                top: s.y * CELL,
                width: CELL - 2,
                height: CELL - 2,
                background:
                  i === 0 ? "oklch(0.85 0.22 145)" : "oklch(0.7 0.18 145)",
              }}
            />
          ))}
          <div
            className="absolute rounded-full"
            style={{
              left: food.x * CELL + 2,
              top: food.y * CELL + 2,
              width: CELL - 6,
              height: CELL - 6,
              background: "oklch(0.7 0.25 25)",
            }}
          />
        </div>
      </div>
      {dead && (
        <div className="mt-4 text-center">
          <div className="font-display text-xl font-bold text-rose-400">
            GAME OVER
          </div>
          <button
            onClick={reset}
            className="mt-2 rounded-md border border-emerald-500/40 px-4 py-1.5 text-sm hover:bg-emerald-500/10"
          >
            Play again
          </button>
        </div>
      )}
      <div className="mt-3 text-[10px] text-emerald-300/60">
        ↑ ↓ ← → or WASD
      </div>
    </div>
  );
}
