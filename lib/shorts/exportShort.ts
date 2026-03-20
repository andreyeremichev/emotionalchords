"use client";

import { buildVoicedNoteNamesForProgression } from "@/lib/harmony/export-only/audioVoicedExport";
import { progressionDurationSec, clamp, hexToRgba } from "@/lib/shorts/format";
import type { ParsedChord } from "@/lib/harmony/chords";
import type { ShortsPreset } from "@/lib/shorts/presets";

function safe(name: string) {
  return name.replace(/#/g, "%23");
}

let ctx: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

async function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ latencyHint: "interactive" });
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

async function loadBuffer(noteName: string) {
  if (bufferCache.has(noteName)) return bufferCache.get(noteName)!;
  const res = await fetch(`/audio/notes/${safe(noteName)}.wav`);
  if (!res.ok) throw new Error(`Missing note sample: ${noteName}`);
  const arr = await res.arrayBuffer();
  const ac = await getCtx();
  const buf = await ac.decodeAudioData(arr);
  bufferCache.set(noteName, buf);
  return buf;
}

function pickRecorderMime() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
}

function drawFrame(opts: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  nowSec: number;
  totalSec: number;
  chords: ParsedChord[];
  preset: ShortsPreset;
  chordDurSec: number;
}) {
  const { ctx, width, height, nowSec, totalSec, chords, preset, chordDurSec } = opts;
  const palette = preset.palette;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, palette.background);
  bg.addColorStop(1, hexToRgba(palette.accent, 0.22));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const orbY = height * (0.26 + 0.06 * Math.sin(nowSec * 0.9));
  const orb = ctx.createRadialGradient(width / 2, orbY, 30, width / 2, orbY, width * 0.36);
  orb.addColorStop(0, hexToRgba(palette.accent, 0.78));
  orb.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, width, height);

  const cardX = width * 0.08;
  const cardY = height * 0.47;
  const cardW = width * 0.84;
  const cardH = height * 0.33;
  ctx.fillStyle = "rgba(15,23,42,0.5)";
  roundRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(palette.accent, 0.7);
  ctx.lineWidth = 4;
  ctx.stroke();

  const chordIndex = Math.min(chords.length - 1, Math.max(0, Math.floor(nowSec / chordDurSec)));
  const chord = chords[chordIndex];
  const localT = ((nowSec % chordDurSec) / chordDurSec);

  ctx.fillStyle = palette.text;
  ctx.textAlign = "center";
  ctx.font = "700 82px Arial";
  ctx.fillText(preset.title, width / 2, 180);
  ctx.font = "500 42px Arial";
  ctx.fillStyle = hexToRgba(palette.text, 0.9);
  ctx.fillText(preset.subtitle, width / 2, 238);

  ctx.font = "600 40px Arial";
  ctx.fillStyle = hexToRgba(palette.text, 0.76);
  ctx.fillText(preset.mood.toUpperCase(), width / 2, 320);

  ctx.font = "700 180px Arial";
  ctx.fillStyle = palette.text;
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 38;
  ctx.fillText(chord?.label ?? "—", width / 2, cardY + 176 + Math.sin(localT * Math.PI) * -10);
  ctx.shadowBlur = 0;

  ctx.font = "500 40px Arial";
  ctx.fillStyle = hexToRgba(palette.text, 0.86);
  ctx.fillText(`Tempo ${preset.tempo} • ${preset.playMode === "arpeggio" ? "Arpeggio" : "Block chords"}`, width / 2, cardY + 240);

  const progressY = height - 160;
  const progressW = width * 0.72;
  const progressX = (width - progressW) / 2;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, progressX, progressY, progressW, 20, 999);
  ctx.fill();
  ctx.fillStyle = palette.accent;
  roundRect(ctx, progressX, progressY, progressW * clamp(nowSec / totalSec, 0, 1), 20, 999);
  ctx.fill();

  const chipsY = height - 300;
  const chipW = Math.min(220, (width * 0.78) / Math.max(chords.length, 1));
  const gap = 14;
  const totalW = chords.length * chipW + Math.max(0, chords.length - 1) * gap;
  let x = (width - totalW) / 2;
  ctx.font = "600 34px Arial";
  for (let i = 0; i < chords.length; i++) {
    const active = i === chordIndex;
    ctx.fillStyle = active ? hexToRgba(palette.accent, 0.92) : "rgba(255,255,255,0.10)";
    roundRect(ctx, x, chipsY, chipW, 84, 24);
    ctx.fill();
    ctx.fillStyle = active ? palette.background : palette.text;
    ctx.fillText(chords[i]?.label ?? "", x + chipW / 2, chipsY + 53);
    x += chipW + gap;
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export async function exportShortVideo(opts: {
  preset: ShortsPreset;
  chords: ParsedChord[];
  tempo: number;
  chordBeats: number;
  playMode: "chords" | "arpeggio";
}) {
  const { preset, chords, tempo, chordBeats, playMode } = opts;
  if (!chords.length) throw new Error("No chords to export.");

  const ac = await getCtx();
  const width = 1080;
  const height = 1920;
  const fps = 30;
  const scale = 1;
  const chordDurSec = (60 / Math.max(1, tempo)) * Math.max(1, chordBeats);
  const totalSec = progressionDurationSec({ chordCount: chords.length, tempo, chordBeats });

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) throw new Error("Could not create canvas context.");

  const dst = ac.createMediaStreamDestination();
  const stream = canvas.captureStream(fps);
  const mixed = new MediaStream([...stream.getVideoTracks(), ...dst.stream.getAudioTracks()]);
  const rec = new MediaRecorder(mixed, { mimeType: pickRecorderMime() });
  const chunksOut: BlobPart[] = [];
  rec.ondataavailable = (e) => { if (e.data.size > 0) chunksOut.push(e.data); };

  const voiced = buildVoicedNoteNamesForProgression(chords, {
    baseOctave: 4,
    minMidi: 48,
    maxMidi: 76,
  });

  const t0 = ac.currentTime + 0.35;
  for (let i = 0; i < voiced.length; i++) {
    const notes = voiced[i] ?? [];
    const buffers = await Promise.all(notes.map((n) => loadBuffer(n)));
    const barStart = t0 + i * chordDurSec;
    if (playMode === "chords") {
      for (const buf of buffers) {
        const src = ac.createBufferSource();
        src.buffer = buf;
        const g = ac.createGain();
        g.gain.value = 0.92;
        src.connect(g).connect(dst);
        src.start(barStart);
        src.stop(Math.min(barStart + chordDurSec, barStart + Math.max(0.4, buf.duration)));
      }
    } else {
      const seq = [...buffers, ...buffers.slice(0, -1).reverse()];
      const gap = chordDurSec / Math.max(1, seq.length);
      seq.forEach((buf, idx) => {
        const src = ac.createBufferSource();
        src.buffer = buf;
        const g = ac.createGain();
        g.gain.value = 0.84;
        src.connect(g).connect(dst);
        const at = barStart + idx * gap;
        src.start(at);
        src.stop(Math.min(at + Math.min(gap * 0.94, 0.55), at + buf.duration));
      });
    }
  }

  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunksOut, { type: rec.mimeType || "video/webm" }));
  });

  rec.start(250);

  await new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = () => {
      const elapsed = (performance.now() - start) / 1000;
      const clamped = Math.min(elapsed, totalSec);
      drawFrame({
        ctx: ctx2d,
        width,
        height,
        nowSec: clamped,
        totalSec,
        chords,
        preset,
        chordDurSec,
      });
      if (elapsed < totalSec) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          rec.stop();
          resolve();
        }, 150);
      }
    };
    frame();
  });

  return done;
}
