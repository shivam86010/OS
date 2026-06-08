// Tiny Web Audio synth — no external assets, respects mute.
let ctx: AudioContext | null = null;
let muted = false;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(v: boolean) {
  muted = v;
}
export function isMuted() {
  return muted;
}

function blip(opts: {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  sweep?: number;
}) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, a.currentTime);
  if (opts.sweep)
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, opts.freq + opts.sweep),
      a.currentTime + opts.dur,
    );
  g.gain.setValueAtTime(0, a.currentTime);
  g.gain.linearRampToValueAtTime(opts.gain ?? 0.06, a.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + opts.dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + opts.dur + 0.02);
}

export const sfx = {
  click: () => blip({ freq: 880, dur: 0.05, type: "square", gain: 0.04 }),
  key: () =>
    blip({
      freq: 1200 + Math.random() * 400,
      dur: 0.03,
      type: "square",
      gain: 0.03,
    }),
  open: () =>
    blip({ freq: 520, dur: 0.18, type: "sine", sweep: 400, gain: 0.07 }),
  close: () =>
    blip({ freq: 600, dur: 0.14, type: "sine", sweep: -300, gain: 0.06 }),
  notify: () => {
    blip({ freq: 880, dur: 0.1, type: "triangle", gain: 0.06 });
    setTimeout(
      () => blip({ freq: 1320, dur: 0.12, type: "triangle", gain: 0.06 }),
      90,
    );
  },
  crash: () =>
    blip({ freq: 200, dur: 0.6, type: "sawtooth", sweep: -160, gain: 0.12 }),
  boot: () => {
    blip({ freq: 220, dur: 0.2, type: "sine", sweep: 600, gain: 0.08 });
    setTimeout(
      () => blip({ freq: 660, dur: 0.25, type: "triangle", gain: 0.07 }),
      180,
    );
  },
};
