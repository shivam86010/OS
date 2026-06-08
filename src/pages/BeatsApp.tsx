import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
} from "lucide-react";

// Pure WebAudio synth tracks — no external mp3 files, runs in the sandbox.
type Track = {
  title: string;
  artist: string;
  bpm: number;
  bass: number;
  pad: number[];
};
const TRACKS: Track[] = [
  {
    title: "Synthwave Coding",
    artist: "Shivam AI",
    bpm: 110,
    bass: 55,
    pad: [220, 277, 330, 415],
  },
  {
    title: "Lo-Fi Deep Focus",
    artist: "Desktop Beats",
    bpm: 78,
    bass: 49,
    pad: [196, 247, 294, 370],
  },
  {
    title: "Cyber Pulse",
    artist: "Neon Engine",
    bpm: 128,
    bass: 65,
    pad: [262, 330, 392, 523],
  },
];

export function BeatsApp() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.45);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);
  const rafRef = useRef<number | null>(null);

  const track = TRACKS[idx];

  function ensureAudio() {
    if (ctxRef.current) return ctxRef.current;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 128;
    const master = ctx.createGain();
    master.gain.value = vol;
    master.connect(analyzer);
    analyzer.connect(ctx.destination);
    ctxRef.current = ctx;
    analyzerRef.current = analyzer;
    masterRef.current = master;
    return ctx;
  }

  function startTrack() {
    const ctx = ensureAudio();
    if (ctx.state === "suspended") void ctx.resume();
    const master = masterRef.current!;
    const beatLen = 60 / track.bpm;

    // Pad: 4 detuned sine voices
    const oscs = track.pad.map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(master);
      o.start();
      return { o, g };
    });
    // Bass pulse via LFO on gain
    const bass = ctx.createOscillator();
    bass.type = "sawtooth";
    bass.frequency.value = track.bass;
    const bg = ctx.createGain();
    bg.gain.value = 0;
    bass.connect(bg);
    bg.connect(master);
    bass.start();
    let beat = 0;
    const interval = window.setInterval(() => {
      const t = ctx.currentTime;
      bg.gain.cancelScheduledValues(t);
      bg.gain.setValueAtTime(0.22, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.45);
      // hi-hat on offbeats
      if (beat % 2 === 1) {
        const noise = ctx.createBufferSource();
        const buf = ctx.createBuffer(1, 2048, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        noise.buffer = buf;
        const hg = ctx.createGain();
        hg.gain.value = 0.06;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 6000;
        noise.connect(hp);
        hp.connect(hg);
        hg.connect(master);
        noise.start();
        noise.stop(t + 0.05);
      }
      beat++;
    }, beatLen * 1000);

    nodesRef.current = {
      stop: () => {
        clearInterval(interval);
        oscs.forEach(({ o, g }) => {
          g.gain.value = 0;
          try {
            o.stop();
          } catch {
            /* noop */
          }
        });
        bg.gain.value = 0;
        try {
          bass.stop();
        } catch {
          /* noop */
        }
      },
    };
    runVisualizer();
  }

  function stopTrack() {
    nodesRef.current?.stop();
    nodesRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function runVisualizer() {
    const canvas = canvasRef.current,
      analyzer = analyzerRef.current;
    if (!canvas || !analyzer) return;
    const c = canvas.getContext("2d")!;
    const data = new Uint8Array(analyzer.frequencyBinCount);
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(data);
      c.clearRect(0, 0, canvas.width, canvas.height);
      const bw = (canvas.width / data.length) * 1.5;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const bh = (data[i] / 255) * canvas.height * 0.9;
        const grad = c.createLinearGradient(
          0,
          canvas.height,
          0,
          canvas.height - bh,
        );
        grad.addColorStop(0, "rgb(168,85,247)");
        grad.addColorStop(0.6, "rgb(56,189,248)");
        grad.addColorStop(1, "rgb(74,222,128)");
        c.fillStyle = grad;
        c.fillRect(x, canvas.height - bh, bw - 2, bh);
        x += bw;
      }
    };
    draw();
  }

  useEffect(() => () => stopTrack(), []);
  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = vol;
  }, [vol]);
  useEffect(() => {
    stopTrack();
    if (playing) startTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, idx]);

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-[oklch(0.15_0.05_300)] to-[oklch(0.12_0.05_240)] p-4 text-white">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-purple-300">
        <Music className="h-4 w-4" /> ShivamBeats — synth visualizer
      </div>
      <div className="relative flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/60">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="absolute inset-0 h-full w-full"
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-5 text-center">
          <div className="font-display text-2xl font-semibold drop-shadow-lg">
            🎵 {track.title}
          </div>
          <div className="text-sm text-white/70">
            {track.artist} • {track.bpm} BPM
          </div>
          <div className="mt-2 rounded-full bg-purple-500/30 px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
            Winamp 2099
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/40 transition active:scale-95"
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" />
          )}
        </button>
        <button
          onClick={() => setIdx((i) => (i + 1) % TRACKS.length)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
        <Volume2 className="h-3.5 w-3.5" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={vol}
          onChange={(e) => setVol(parseFloat(e.target.value))}
          className="flex-1 accent-purple-400"
        />
        <span className="w-8 text-right font-mono">
          {Math.round(vol * 100)}
        </span>
      </div>
    </div>
  );
}
