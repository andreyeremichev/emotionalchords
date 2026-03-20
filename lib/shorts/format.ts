import { noteNameForPc, type ParsedChord } from "@/lib/harmony/chords";

export function prettyChordLabel(chord: ParsedChord) {
  if (!chord.pcs.length) return chord.label;
  return chord.label || chord.pcs.map((pc) => noteNameForPc(pc)).join(" ");
}

export function progressionDurationSec(opts: {
  chordCount: number;
  tempo: number;
  chordBeats: number;
  tailSec?: number;
}) {
  const beatSec = 60 / Math.max(1, opts.tempo);
  return opts.chordCount * Math.max(1, opts.chordBeats) * beatSec + (opts.tailSec ?? 1.25);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "");
  const full = cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
