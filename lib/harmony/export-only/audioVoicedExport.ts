// lib/harmony/export-only/audioVoicedExport.ts
// Export-only WebAudio sampler + voice-led voicings (DO NOT use in Live pages)

import { type ParsedChord } from "@/lib/harmony/chords";
import { buildMinimalMotionMapping } from "./matchVoiceLeadingExport";

let ctx: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();

function safe(name: string) {
  return name.replace(/#/g, "%23");
}

function pcToSharpName(pc: number): string {
  const N = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return N[((pc % 12) + 12) % 12];
}

function midiToNoteNameSharp(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return pcToSharpName(pc) + String(oct);
}

async function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

async function loadBuffer(noteName: string) {
  const key = noteName;
  if (bufferCache.has(key)) return bufferCache.get(key)!;

  const url = `/audio/notes/${safe(noteName)}.wav`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audio file not found: ${url}`);
  const arr = await res.arrayBuffer();
  const ac = await getCtx();
  const buf = await ac.decodeAudioData(arr);
  bufferCache.set(key, buf);
  return buf;
}

function now(ac: AudioContext) {
  return ac.currentTime;
}

function clampMidi(m: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, m));
}

function pcToNearestMidi(pc: number, nearMidi: number): number {
  const base = Math.floor(nearMidi / 12) * 12 + pc;
  const cands = [base - 12, base, base + 12];
  let best = cands[0];
  let bestD = Math.abs(best - nearMidi);
  for (const m of cands.slice(1)) {
    const d = Math.abs(m - nearMidi);
    if (d < bestD) {
      best = m;
      bestD = d;
    }
  }
  return best;
}

/**
 * Voice-lead chord pcs into octave-qualified MIDI notes.
 * - minimal motion vs previous voiced chord
 * - clamps into a safe register
 */
export function voiceLeadChordToMidis(
  pcs: number[],
  prevMidis: number[] | null,
  opts?: { baseOctave?: number; minMidi?: number; maxMidi?: number }
): number[] {
  const baseOct = opts?.baseOctave ?? 4;
  const minMidi = opts?.minMidi ?? 48; // C3
  const maxMidi = opts?.maxMidi ?? 76; // E5-ish

  const targetPcs = Array.from(new Set(pcs.map((x) => ((x % 12) + 12) % 12)));

  // First chord: put pcs in base octave
  if (!prevMidis || !prevMidis.length) {
    const out = targetPcs
      .map((pc) => clampMidi((baseOct + 1) * 12 + pc, minMidi, maxMidi))
      .sort((a, b) => a - b);
    return out;
  }

  const prevPcs = prevMidis.map((m) => ((m % 12) + 12) % 12);
  const mapping = buildMinimalMotionMapping(prevPcs, targetPcs);

  const usedTargets = new Set<number>();
  const usedMidis: number[] = [];

  // Map existing voices
  for (const m of mapping) {
    if (m.from == null || m.to == null) continue;

    const fromIdx = prevPcs.indexOf(m.from);
    const near = fromIdx >= 0 ? prevMidis[fromIdx] : prevMidis[0];

    let cand = pcToNearestMidi(m.to, near);
    cand = clampMidi(cand, minMidi, maxMidi);

    usedMidis.push(cand);
    usedTargets.add(m.to);
  }

  // Add any new pcs (if chord size changes)
  const center = prevMidis.reduce((a, b) => a + b, 0) / prevMidis.length;
  for (const pc of targetPcs) {
    if (usedTargets.has(pc)) continue;
    let cand = pcToNearestMidi(pc, Math.round(center));
    cand = clampMidi(cand, minMidi, maxMidi);
    usedMidis.push(cand);
  }

  return Array.from(new Set(usedMidis)).sort((a, b) => a - b);
}

/**
 * Build voiced note names for each chord (single source of truth).
 */
export function buildVoicedNoteNamesForProgression(
  chords: ParsedChord[],
  opts?: { baseOctave?: number; minMidi?: number; maxMidi?: number }
): string[][] {
  let prev: number[] | null = null;
  const out: string[][] = [];
  for (const c of chords) {
    const midis = voiceLeadChordToMidis(c.pcs, prev, opts);
    out.push(midis.map(midiToNoteNameSharp));
    prev = midis;
  }
  return out;
}

/**
 * Play progression using voiced notes (export-only).
 * Keeps exact chordDur per chord.
 */
export async function playProgressionVoiced(
  chords: ParsedChord[],
  opts: {
    playMode: "chords" | "arpeggio";
    chordDur: number;
    arpeggioPattern?: "upDown";
    baseOctave?: number;
    minMidi?: number;
    maxMidi?: number;
    gain?: number;
  }
) {
  if (!chords.length) return;

  const ac = await getCtx();
  const chordDur = Math.max(0.1, opts.chordDur);
  const gain = opts.gain ?? 0.95;

  const voiced = buildVoicedNoteNamesForProgression(chords, {
    baseOctave: opts.baseOctave ?? 4,
    minMidi: opts.minMidi ?? 48,
    maxMidi: opts.maxMidi ?? 76,
  });

  let t = now(ac);

  for (let i = 0; i < chords.length; i++) {
    const notes = voiced[i] ?? [];
    const bufs = await Promise.all(notes.map((n) => loadBuffer(n)));

    if (opts.playMode === "chords") {
      const when = t;
      for (const buf of bufs) {
        const src = ac.createBufferSource();
        src.buffer = buf;
        const g = ac.createGain();
        g.gain.value = gain;
        src.connect(g).connect(ac.destination);
        src.start(when);
        src.stop(when + chordDur);
      }
      t += chordDur;
    } else {
      const seq = [...bufs, ...bufs.slice(0, -1).reverse()];
      const hits = Math.max(1, seq.length);
      const gap = chordDur / hits;

      let at = t;
      for (const buf of seq) {
        const src = ac.createBufferSource();
        src.buffer = buf;
        const g = ac.createGain();
        g.gain.value = gain;
        src.connect(g).connect(ac.destination);
        const dur = Math.min(gap * 0.95, 0.6);
        src.start(at);
        src.stop(at + dur);
        at += gap;
      }
      t += chordDur;
    }
  }
}