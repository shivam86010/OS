import { useEffect, useRef } from "react";

export function DoomApp() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const ctx: CanvasRenderingContext2D = g;
    const W = c.width,
      H = c.height;
    let raf = 0;
    let t = 0;
    const cols = 80,
      rows = 50;
    const px = new Uint8Array(cols * rows);
    for (let x = 0; x < cols; x++) px[(rows - 1) * cols + x] = 36;
    const palette = [
      "#070707",
      "#1f0707",
      "#2f0f07",
      "#470f07",
      "#571707",
      "#671f07",
      "#771f07",
      "#8f2707",
      "#9f2f07",
      "#af3f07",
      "#bf4707",
      "#c74707",
      "#df4f07",
      "#df5707",
      "#df5707",
      "#d75f07",
      "#d7670f",
      "#cf6f0f",
      "#cf770f",
      "#cf7f0f",
      "#cf8717",
      "#c78717",
      "#c78f17",
      "#c7971f",
      "#bf9f1f",
      "#bf9f1f",
      "#bfa727",
      "#bfa727",
      "#bfaf2f",
      "#b7af2f",
      "#b7b72f",
      "#b7b737",
      "#cfcf6f",
      "#dfdf9f",
      "#efefc7",
      "#ffffff",
    ];
    function step() {
      for (let x = 0; x < cols; x++) {
        for (let y = 1; y < rows; y++) {
          const src = y * cols + x;
          const v = px[src];
          const rand = Math.floor(Math.random() * 3);
          const dst = src - cols - rand + 1;
          if (dst >= 0 && dst < cols * rows)
            px[dst] = Math.max(0, v - (rand & 1));
        }
      }
    }
    function draw() {
      const cw = W / cols,
        ch = H / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.fillStyle = palette[px[y * cols + x]] ?? "#000";
          ctx.fillRect(x * cw, y * ch, cw + 1, ch + 1);
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, 60);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px 'Space Grotesk', system-ui";
      ctx.fillText("DOOM Retro — Eternal Demo", 16, 36);
      ctx.font = "11px monospace";
      ctx.fillStyle = "#ff6b3d";
      ctx.fillText(`HP: 100   AMMO: ∞   FRAME: ${t}`, 16, 52);
    }
    function loop() {
      step();
      draw();
      t++;
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="grid h-full place-items-center bg-black">
      <canvas ref={ref} width={620} height={400} className="h-full w-full" />
    </div>
  );
}
