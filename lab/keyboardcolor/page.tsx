// app/lab/keyboardcolor/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions from "@/components/KeyboardEmotions";

/* =========================
   Types
========================= */

type EmotionId =
  | "sadness"
  | "anger"
  | "fear"
  | "mystery"
  | "melancholy"
  | "calm"
  | "playful"
  | "magic"
  | "wonder"
  | "tension";

type ColorEmotionMeta = {
  id: EmotionId;
  label: string;
  emoji: string;
  gradientTop: string;
  gradientBottom: string;
  trailColor: string;
  tempo: number;
  colorChords: string; // e.g. "C Ab E G"
};

const COLOR_EMOTIONS: ColorEmotionMeta[] = [
  {
    id: "magic",
    label: "Magic",
    emoji: "✨",
    gradientTop: "#6d28d9",
    gradientBottom: "#a855f7",
    trailColor: "#c4a1ff",
    tempo: 1.0,
    colorChords: "C Ab E G",
  },
  {
    id: "mystery",
    label: "Mystery",
    emoji: "🕵️‍♀️",
    gradientTop: "#272343",
    gradientBottom: "#4b4e91",
    trailColor: "#8fb3ff",
    tempo: 1.0,
    colorChords: "Cm D F° F#",
  },
  {
    id: "wonder",
    label: "Wonder",
    emoji: "🌌",
    gradientTop: "#1d3557",
    gradientBottom: "#457b9d",
    trailColor: "#8ecae6",
    tempo: 1.0,
    colorChords: "Cm F G B",
  },
  {
    id: "playful",
    label: "Playful",
    emoji: "🎈",
    gradientTop: "#f59e0b",
    gradientBottom: "#f97316",
    trailColor: "#ffb74d",
    tempo: 1.0,
    colorChords: "C Eb F# G#",
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "🌿",
    gradientTop: "#2f5d4f",
    gradientBottom: "#6bbf8f",
    trailColor: "#6dd2a3",
    tempo: 1.0,
    colorChords: "C D F Eb",
  },
  {
    id: "tension",
    label: "Tension",
    emoji: "😬",
    gradientTop: "#4b5563",
    gradientBottom: "#9ca3af",
    trailColor: "#fbbf24",
    tempo: 1.0,
    colorChords: "C C#m E° F#",
  },
  {
    id: "fear",
    label: "Fear",
    emoji: "😱",
    gradientTop: "#222933",
    gradientBottom: "#4a5568",
    trailColor: "#6bc1ff",
    tempo: 1.0,
    colorChords: "Cm F#° G A#°",
  },
  {
    id: "sadness",
    label: "Sadness",
    emoji: "😢",
    gradientTop: "#2D3E68",
    gradientBottom: "#6076AF",
    trailColor: "#4A6FA5",
    tempo: 0.9,
    colorChords: "Cm Ab Fm Em",
  },
  {
    id: "anger",
    label: "Anger",
    emoji: "😡",
    gradientTop: "#6b1b25",
    gradientBottom: "#c0392b",
    trailColor: "#ff7373",
    tempo: 1.0,
    colorChords: "Cm C#m E° F#",
  },
  {
    id: "melancholy",
    label: "Melancholy",
    emoji: "🌧️",
    gradientTop: "#314159",
    gradientBottom: "#60738d",
    trailColor: "#5a7bbc",
    tempo: 1.0,
    colorChords: "Cm A C#m A#",
  },
];

const COLOR_EMOTIONS_BY_ID: Record<EmotionId, ColorEmotionMeta> = COLOR_EMOTIONS.reduce(
  (acc, e) => {
    acc[e.id] = e;
    return acc;
  },
  {} as Record<EmotionId, ColorEmotionMeta>
);

/* =========================
   Shared helpers (live + export)
========================= */

const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCHES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function midiToNoteName(midi: number): string {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

function triadFromChordName(name: string): string[] {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(name);
  if (!m) return [];
  const letter = m[1].toUpperCase();
  const acc = (m[2] || "").toLowerCase();
  const qual = (m[3] || "").toLowerCase();

  const basePCMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps = quality === "M" ? [0, 4, 7] : quality === "m" ? [0, 3, 7] : [0, 3, 6];

  // Keep triad within C4..B4 bucket
  const baseMidi = 60; // C4
  return steps.map((semi) => midiToNoteName(baseMidi + ((pc + semi) % 12)));
}
function chordToPitchClasses(symbol: string): { rootPc: number; pcs: number[] } {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(symbol);
  if (!m) return { rootPc: 0, pcs: [] };

  const letter = m[1].toUpperCase();
  const acc = (m[2] || "").toLowerCase();
  const qual = (m[3] || "").toLowerCase();

  const basePCMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps = quality === "M" ? [0, 4, 7] : quality === "m" ? [0, 3, 7] : [0, 3, 6];
  const pcs = steps.map((s) => (pc + s) % 12);
  return { rootPc: pc, pcs };
}

/** Step 1.3 RH: root-position triad in the C4 bucket */
function triadNamesInRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  if (!pcs.length) return [];
  const base = 60; // C4
  return pcs.map((pc) => midiToNoteName(base + ((pc - 0 + 12) % 12)));
}

/** Step 1.3 LH: root note in octave 3 */
function rootNameInLH(symbol: string): string {
  const { rootPc } = chordToPitchClasses(symbol);
  const midi = (3 + 1) * 12 + rootPc; // C3..B3
  return midiToNoteName(midi);
}

function noteNameToPc(note: string): number | null {
  const m = /^([A-G])(b|#)?(\d+)$/.exec(note);
  if (!m) return null;
  const letter = m[1];
  const acc = m[2] || "";
  const basePCMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1 + 12) % 12;
  if (acc === "b") pc = (pc - 1 + 12) % 12;
  return pc;
}
function chordRootPcFromSymbol(symbol: string): number | null {
  const notes = triadFromChordName(symbol);
  if (!notes.length) return null;
  return noteNameToPc(notes[0]);
}

// Special highlight colors for 100% chromatic "primary color" chords
function getChordHighlightColor(emotionId: EmotionId, chordName: string): string | null {
  switch (emotionId) {
    case "sadness":
      if (chordName === "Em") return "#3A7BBF";
      return null;
    case "anger":
      if (chordName === "C#m") return "#D84C3D";
      if (chordName === "E°") return "#FF6B3D";
      return null;
    case "fear":
      if (chordName === "F#°") return "#9A00FF";
      if (chordName === "A#°") return "#B600FF";
      return null;
    case "mystery":
      if (chordName === "F°") return "#634DFF";
      return null;
    case "melancholy":
      if (chordName === "A") return "#E6A857";
      return null;
    case "calm":
      if (chordName === "Eb") return "#EEC3B0";
      return null;
    case "playful":
      if (chordName === "F#") return "#FFE56E";
      return null;
    case "magic":
      if (chordName === "E") return "#FF8CF7";
      return null;
    case "wonder":
      if (chordName === "B") return "#FFD76A";
      return null;
    case "tension":
      if (chordName === "E°") return "#FF2E63";
      return null;
    default:
      return null;
  }
}

/* =========================
   Live audio: Tone sampler
========================= */

function buildFullPianoUrls(): Record<string, string> {
  const urls: Record<string, string> = {};

  for (const p of ["A", "A#", "B"] as const) {
    const name = `${p}0`;
    const safe = name.replace("#", "%23");
    urls[name] = `${safe}.wav`;
  }

  for (let oct = 1; oct <= 7; oct++) {
    for (const p of PITCHES) {
      const name = `${p}${oct}`;
      const safe = name.replace("#", "%23");
      urls[name] = `${safe}.wav`;
    }
  }

  {
    const name = "C8";
    const safe = name.replace("#", "%23");
    urls[name] = `${safe}.wav`;
  }

  return urls;
}

async function ensurePianoSampler(ref: React.MutableRefObject<Tone.Sampler | null>) {
  if (ref.current) return;
  const urls = buildFullPianoUrls();
  const sampler = new Tone.Sampler({
    urls,
    baseUrl: "/audio/notes/",
  }).toDestination();
  await Tone.loaded();
  ref.current = sampler;
}

/* =========================
   Live scheduling hook
   (single pass in live; export uses 2 passes)
========================= */

type UseEmotionPlaybackOptions = {
  onPlayChord?: (symbol: string) => void;
};

function useEmotionPlayback({ onPlayChord }: UseEmotionPlaybackOptions) {
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  const stop = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setIsPlaying(false);
    setActiveChordIndex(null);
    runIdRef.current += 1;
  }, []);

  const playSequence = useCallback(
    (chords: string[], stepMs: number) => {
      if (!chords.length) return;
      stop();
      setIsPlaying(true);
      const currentRun = ++runIdRef.current;
      const safeStepMs = Math.max(120, stepMs || 900);

      chords.forEach((chord, index) => {
        const t = window.setTimeout(() => {
          if (runIdRef.current !== currentRun) return;

          setActiveChordIndex(index);
          onPlayChord?.(chord);

          if (index === chords.length - 1) {
            const endId = window.setTimeout(() => {
              if (runIdRef.current !== currentRun) return;
              setIsPlaying(false);
              setActiveChordIndex(null);
            }, safeStepMs);
            timersRef.current.push(endId);
          }
        }, index * safeStepMs);
        timersRef.current.push(t);
      });
    },
    [onPlayChord, stop]
  );

  useEffect(() => () => stop(), [stop]);

  return { activeChordIndex, isPlaying, playSequence, stop };
}

/* =========================
   UI bits (live)
========================= */

function EmotionPillBar({
  selectedId,
  isPlaying,
  onSelect,
}: {
  selectedId: EmotionId;
  isPlaying: boolean;
  onSelect: (id: EmotionId) => void;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "6px 0 4px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ display: "flex", gap: 8, padding: "0 4px 4px", minWidth: 0 }}>
        {COLOR_EMOTIONS.map((e) => {
          const isActive = e.id === selectedId;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect(e.id)}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 13,
                lineHeight: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                cursor: "pointer",
                opacity: isPlaying && !isActive ? 0.6 : 1,
                background: isActive ? "rgba(17,24,39,0.92)" : "rgba(17,24,39,0.08)",
                color: isActive ? "#fff" : "#111827",
                boxShadow: isActive
                  ? "0 0 0 1px rgba(17,24,39,0.95)"
                  : "0 0 0 1px rgba(17,24,39,0.18)",
              }}
            >
              <span style={{ fontSize: 14 }}>{e.emoji}</span>
              <span>{e.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChordCaptionLine({ chords, activeIndex }: { chords: string[]; activeIndex: number | null }) {
  return (
    <div
      style={{
        marginTop: 12,
        fontSize: 14,
        textAlign: "center",
        minHeight: 22,
        padding: "0 8px",
      }}
    >
      {chords.map((chord, idx) => {
        const isActive = idx === activeIndex;
        return (
          <span key={idx} style={{ marginInline: 2 }}>
            {idx > 0 && <span style={{ opacity: 0.4, marginInline: 2 }}>·</span>}
            <span
              style={{
                fontWeight: isActive ? 700 : 400,
                opacity: isActive ? 1 : 0.65,
                textDecoration: isActive ? "underline" : "none",
                textUnderlineOffset: 3,
              }}
            >
              {chord}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* =========================
   Circle geometry (export + live-like)
========================= */

const CHROMA_LABELS: string[] = [
  "C",
  "C♯/D♭",
  "D",
  "E♭/D♯",
  "E",
  "F",
  "F♯/G♭",
  "G",
  "A♭/G♯",
  "A",
  "B♭/A♯",
  "B",
];

type Pt = { x: number; y: number };

function nodePosition(i: number, r = 33): Pt {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const xRaw = 50 + Math.cos(a) * r;
  const yRaw = 50 + Math.sin(a) * r;

  const x = Number.isFinite(xRaw) ? Number(xRaw.toFixed(3)) : 50;
  const y = Number.isFinite(yRaw) ? Number(yRaw.toFixed(3)) : 50;

  return { x, y };
}

function pathFromPcs(pcs: number[]): string | null {
  const uniq = Array.from(new Set(pcs.map((x) => ((x % 12) + 12) % 12))).sort((a, b) => a - b);
  if (!uniq.length) return null;
  const pts = uniq.map((i) => nodePosition(i, 28));
  const move = `M ${pts[0].x.toFixed(3)} ${pts[0].y.toFixed(3)}`;
  const rest = pts
    .slice(1)
    .map((p) => `L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`)
    .join(" ");
  return `${move} ${rest} Z`;
}

/* =========================
   Export-only: WebAudio + recorder helpers
========================= */

let _ctxExport: AudioContext | null = null;
const _buffers = new Map<string, AudioBuffer>();

function getCtxExport(): AudioContext {
  if (_ctxExport) return _ctxExport;
  const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
  _ctxExport = new AC({ latencyHint: "interactive" });
  return _ctxExport!;
}

async function loadBufferExport(noteName: string): Promise<AudioBuffer> {
  if (_buffers.has(noteName)) return _buffers.get(noteName)!;
  const safe = noteName.replace("#", "%23");
  const res = await fetch(`/audio/notes/${safe}.wav`);
  if (!res.ok) throw new Error(`fetch failed: ${safe}.wav`);
  const ctx = getCtxExport();
  const buf = await ctx.decodeAudioData(await res.arrayBuffer());
  _buffers.set(noteName, buf);
  return buf;
}

function pickRecorderMime(): string {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm",
  ];
  for (const t of candidates) {
    try {
      if ((window as any).MediaRecorder?.isTypeSupported?.(t)) return t;
    } catch {}
  }
  return "video/webm";
}

// Same as in your other toys: post webm to /api/convert-webm-to-mp4
async function convertToMp4Server(inputBlob: Blob): Promise<Blob> {
  if (inputBlob.type.includes("mp4")) return inputBlob;
  try {
    const resp = await fetch("/api/convert-webm-to-mp4", {
      method: "POST",
      headers: { "Content-Type": inputBlob.type || "application/octet-stream" },
      body: inputBlob,
    });
    if (!resp.ok) throw new Error(`server convert failed: ${resp.status}`);
    const out = await resp.blob();
    if (out.size === 0) throw new Error("server returned empty blob");
    return out;
  } catch {
    return inputBlob;
  }
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/* =========================
   Keyboard render (Canvas) — mirrors KeyboardEmotions.tsx
========================= */

type Oct = 3 | 4 | 5 | 6;
type WhiteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
type NoteName =
  | `${"C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"}${Oct}`
  | `${"Db" | "Eb" | "Gb" | "Ab" | "Bb"}${Oct}`;

const WHITE_W = 30;
const WHITE_H = 145;
const BLACK_W = 18;
const BLACK_H = 92;

type WhiteKey = { note: NoteName; x: number };
type BlackKey = { noteSharp: NoteName; noteFlat: NoteName; x: number };

function buildKeyboard() {
  const whiteCycle: WhiteLetter[] = ["C", "D", "E", "F", "G", "A", "B"];
  const hasBlackAfter = (wIdx: number) => ![2, 6].includes(wIdx); // no black after E or B

  const whites: WhiteKey[] = [];
  const blacks: BlackKey[] = [];

  let x = 0;
  for (let oct = 3 as Oct; oct <= 6; oct = (oct + 1) as Oct) {
    for (let wi = 0; wi < whiteCycle.length; wi++) {
      const letter = whiteCycle[wi];
      if (oct === 6 && letter !== "C") break; // only C6

      const note = `${letter}${oct}` as NoteName;
      whites.push({ note, x });

      if (hasBlackAfter(wi) && !(oct === 6 && letter === "C")) {
        const center = x + WHITE_W;
        const bx = center - BLACK_W / 2;

        const sharpMap: Record<WhiteLetter, string> = {
          C: "C#",
          D: "D#",
          E: "",
          F: "F#",
          G: "G#",
          A: "A#",
          B: "",
        };

        const flatPair: Record<string, string> = {
          "C#": "Db",
          "D#": "Eb",
          "F#": "Gb",
          "G#": "Ab",
          "A#": "Bb",
        };

        const sharpBase = sharpMap[letter];
        if (sharpBase && flatPair[sharpBase]) {
          const sharp = `${sharpBase}${oct}` as NoteName;
          const flat = `${flatPair[sharpBase]}${oct}` as NoteName;
          blacks.push({ noteSharp: sharp, noteFlat: flat, x: bx });
        }
      }

      x += WHITE_W;
    }
  }

  const width = whites.length * WHITE_W;
  return { whites, blacks, width };
}

const { whites: WHITE_KEYS, blacks: BLACK_KEYS, width: KEYBOARD_W } = buildKeyboard();

function stripOct(note: string) {
  return note.slice(0, -1);
}

function prettyBase(name: string) {
  return name.replace(/#/g, "♯").replace(/b/g, "♭");
}
function rootLabelFromChordSymbol(symbol: string): string {
  const m = /^([A-G])(b|#)?/i.exec(symbol.trim());
  if (!m) return "";
  const letter = m[1].toUpperCase();
  const acc = (m[2] || "").toLowerCase();

  if (acc === "#") return `${letter}♯`;
  if (acc === "b") return `${letter}♭`;
  return letter;
}

function chordPrefersFlats(chord: string) {
  const m = /^([A-G])([b#♭♯]?)(m|°|dim)?/i.exec(chord);
  if (!m) return false;

  const acc = m[2] || "";
  const qual = (m[3] || "").toLowerCase();

  if (acc === "b" || acc === "♭") return true;
  if (acc === "#" || acc === "♯") return false;

  if (qual === "m" || qual === "°" || qual === "dim") return true;
  return false;
}

function chordToPitchClassesOnly(name: string): number[] {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(name);
  if (!m) return [];
  const letter = m[1].toUpperCase();
  const acc = (m[2] || "").toLowerCase();
  const qual = (m[3] || "").toLowerCase();

  const basePCMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps = quality === "M" ? [0, 4, 7] : quality === "m" ? [0, 3, 7] : [0, 3, 6];
  return steps.map((s) => (pc + s) % 12);
}

function buildDisplayMapForChord(chord: string) {
  const pcs = chordToPitchClassesOnly(chord);
  const preferFlats = chordPrefersFlats(chord);
  const preferred = preferFlats ? PITCHES_FLAT : PITCHES;

  const map: Record<string, string> = {};
  for (const pc of pcs) {
    const preferredName = preferred[pc];
    for (const oct of [3, 4, 5, 6]) {
      map[`${PITCHES[pc]}${oct}`] = preferredName;
      map[`${PITCHES_FLAT[pc]}${oct}`] = preferredName;
    }
  }
  return map;
}

function parseRgbaOrHexToRgba(color: string, fallbackAlpha = 1): { r: number; g: number; b: number; a: number } {
  // rgba(...)
  const m = /^rgba?\(([^)]+)\)$/i.exec(color.trim());
  if (m) {
    const parts = m[1].split(",").map((s) => s.trim());
    const r = Math.max(0, Math.min(255, parseFloat(parts[0] || "0")));
    const g = Math.max(0, Math.min(255, parseFloat(parts[1] || "0")));
    const b = Math.max(0, Math.min(255, parseFloat(parts[2] || "0")));
    const a = parts.length >= 4 ? Math.max(0, Math.min(1, parseFloat(parts[3] || "1"))) : fallbackAlpha;
    return { r, g, b, a };
  }
  // #RRGGBB
  const h = color.replace("#", "");
  if (h.length === 6) {
    const num = parseInt(h, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return { r, g, b, a: fallbackAlpha };
  }
  return { r: 0, g: 0, b: 0, a: fallbackAlpha };
}

function rgbaString(c: { r: number; g: number; b: number; a: number }) {
  return `rgba(${c.r},${c.g},${c.b},${c.a})`;
}

function drawKeyboardCanvas(opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  emotion: ColorEmotionMeta;
  activeChordSymbol: string | null;
  highlightColorOverride?: string | null;
  highlightNotesPrimary?: string[];   // RH
  highlightNotesSecondary?: string[]; // LH
  highlightColorSecondary?: string;
}) {
  const { ctx, x, y, w, emotion, activeChordSymbol } = opts;
  const highlightColorOverride = opts.highlightColorOverride ?? null;

  // Visual frame matches KeyboardEmotions:
  // outer gradient box, inner white box, then keys.
  const outerPad = 8;
  const innerPad = 6;

  // Make the card wrap the keyboard (match live layout).
  // Keyboard aspect is KEYBOARD_W x WHITE_H (from KeyboardEmotions.tsx).
  const outerR = 12;
  const innerR = 10;

  const innerW = w - outerPad * 2;
  const keyboardW = innerW - innerPad * 2;
  const keyboardH = keyboardW * (WHITE_H / KEYBOARD_W);

  const outerH = outerPad * 2 + innerPad * 2 + keyboardH;

  // Outer gradient
  ctx.save();
  roundedRectPath(ctx, x, y, w, outerH, outerR);
  const g = ctx.createLinearGradient(x, y, x + w, y + outerH);
  g.addColorStop(0, emotion.gradientTop);
  g.addColorStop(1, emotion.gradientBottom);
  ctx.fillStyle = g;
  ctx.fill();

  // subtle shadow-like edge
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Inner white card
  const ix = x + outerPad;
  const iy = y + outerPad;
  const iw = w - outerPad * 2;
  const ih = outerH - outerPad * 2;

  roundedRectPath(ctx, ix, iy, iw, ih, innerR);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();

  // Keyboard viewport
  const kx = ix + innerPad;
  const ky = iy + innerPad;

  // Exact-fit scaling (no empty space): card height is computed from keyboard aspect.
  const s = keyboardW / KEYBOARD_W;
  const dx = kx;
  const dy = ky;

  const chordNotes = activeChordSymbol ? triadFromChordName(activeChordSymbol) : [];

const primaryNotes =
  opts.highlightNotesPrimary !== undefined ? opts.highlightNotesPrimary : chordNotes;
const secondaryNotes =
  opts.highlightNotesSecondary !== undefined ? opts.highlightNotesSecondary : [];

const highlightedPrimary = new Set<string>(primaryNotes);
const highlightedSecondary = new Set<string>(secondaryNotes);

const keyColor = highlightColorOverride ?? emotion.trailColor;
const keyColorSecondary = opts.highlightColorSecondary ?? "rgba(17,24,39,0.22)";
  const displayMap = activeChordSymbol ? buildDisplayMapForChord(activeChordSymbol) : null;

  // Transform to keyboard space
  ctx.save();
  ctx.translate(dx, dy);
  ctx.scale(s, s);

  // white keys
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000";

  for (const k of WHITE_KEYS) {
    const isPrimary = highlightedPrimary.has(k.note);
const isSecondary = highlightedSecondary.has(k.note);

const fill = isPrimary ? keyColor : isSecondary ? keyColorSecondary : "#ffffff";

    ctx.fillStyle = fill;
    ctx.fillRect(k.x, 0, WHITE_W, WHITE_H);
    ctx.strokeRect(k.x, 0, WHITE_W, WHITE_H);

    // C4 label always
    if (k.note === "C4") {
      ctx.fillStyle = "#111827";
      ctx.font = `10px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("C4", k.x + WHITE_W / 2, WHITE_H - 4);
    }

    // If primary, show note label (preferred spelling)
    if (isPrimary) {
      const baseLabel = displayMap?.[k.note] ?? stripOct(k.note);
      const labelText = prettyBase(baseLabel);
      ctx.fillStyle = "#111827";
      ctx.font = `9px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(labelText, k.x + WHITE_W / 2, WHITE_H - 20);
    }
  }

  // black keys (draw on top)
  for (const k of BLACK_KEYS) {
    const isPrimary = highlightedPrimary.has(k.noteSharp) || highlightedPrimary.has(k.noteFlat);
const isSecondary = highlightedSecondary.has(k.noteSharp) || highlightedSecondary.has(k.noteFlat);

const fill = isPrimary ? keyColor : isSecondary ? keyColorSecondary : "#000000";

    ctx.fillStyle = fill;
    // rounded corners not critical, but we can do a quick rounded rect
    const rx = 2;
    const x0 = k.x;
    const y0 = 0;
    const w0 = BLACK_W;
    const h0 = BLACK_H;
    ctx.beginPath();
    ctx.moveTo(x0 + rx, y0);
    ctx.arcTo(x0 + w0, y0, x0 + w0, y0 + h0, rx);
    ctx.arcTo(x0 + w0, y0 + h0, x0, y0 + h0, rx);
    ctx.arcTo(x0, y0 + h0, x0, y0, rx);
    ctx.arcTo(x0, y0, x0 + w0, y0, rx);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (isPrimary && displayMap) {
      const shown = highlightedPrimary.has(k.noteFlat) ? k.noteFlat : k.noteSharp;
      const baseLabel = displayMap[shown] ?? stripOct(shown);
      const labelText = prettyBase(baseLabel);
      ctx.fillStyle = "#111827";
      ctx.font = `9px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(labelText, k.x + BLACK_W / 2, BLACK_H + 10);
    }
  }

  ctx.restore(); // keyboard space
  ctx.restore(); // outer
}

/* =========================
   Export circle render (Canvas)
========================= */
function labelPlacementForNode(i: number, p: { x: number; y: number }) {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const ux = Math.cos(a);
  const uy = Math.sin(a);

  // push outward a bit from the node
  const x = p.x + 4.2 * ux;
  const y = p.y + 4.2 * uy;

  const ax = Math.abs(ux);
  const ay = Math.abs(uy);

  let align: CanvasTextAlign = "center";
  let baseline: CanvasTextBaseline = "middle";

  if (ax >= ay) {
    align = ux > 0 ? "left" : "right";
    baseline = "middle";
  } else {
    align = "center";
    baseline = uy > 0 ? "top" : "bottom";
  }

  return { x, y, align, baseline };
}

function drawColorCircleCanvas(opts: {
  ctx: CanvasRenderingContext2D;
  cx: number;
  cy: number;
  radiusPx: number;
  emotion: ColorEmotionMeta;
  activeChordSymbol: string | null;
}) {
  const { ctx, cx, cy, radiusPx, emotion, activeChordSymbol } = opts;

  // Determine chord pcs + root
  let pcs: number[] = [];
  let rootPc: number | null = null;

  if (activeChordSymbol) {
    const notes = triadFromChordName(activeChordSymbol);
    const pcsLocal: number[] = [];
    for (let i = 0; i < notes.length; i++) {
      const pc = noteNameToPc(notes[i]);
      if (pc != null) pcsLocal.push(pc);
    }
    pcs = pcsLocal;
  if (pcsLocal.length) rootPc = chordRootPcFromSymbol(activeChordSymbol);
  }

  const shapePathStr = pcs.length ? pathFromPcs(pcs) : null;
  const chordHighlightColor =
    activeChordSymbol && activeChordSymbol.length ? getChordHighlightColor(emotion.id, activeChordSymbol) : null;

  // Local 100x100 coordinate space like SVG
  ctx.save();
  ctx.translate(cx, cy);
  const s = radiusPx / 50; // because SVG viewBox is 0..100 (radius ~50). We'll fit a 36-r ring inside.
  ctx.scale(s, s);
  ctx.translate(-50, -50);

  // Circle background gradient (radial)
  const grad = ctx.createRadialGradient(35, 25, 5, 50, 50, 40);
  grad.addColorStop(0, emotion.gradientTop);
  grad.addColorStop(1, emotion.gradientBottom);

  // Fill only inside circle (r=36)
  ctx.beginPath();
  ctx.arc(50, 50, 36, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // ring stroke
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(50, 50, 38, 0, Math.PI * 2);
  ctx.stroke();

  // chord polygon
  if (shapePathStr) {
    const color = chordHighlightColor || emotion.trailColor;
    ctx.save();
    const p = new Path2D(shapePathStr.replace(/,/g, " "));
    const rgba = parseRgbaOrHexToRgba(color, 1);
    ctx.fillStyle = rgbaString({ ...rgba, a: 0.2 });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fill(p);
    ctx.stroke(p);
    ctx.restore();
  }

    // nodes + (single) label for active root only
  for (let i = 0; i < CHROMA_LABELS.length; i++) {
    const p = nodePosition(i, 33);
    const isActive = rootPc === i;
    const nodeColor = isActive && chordHighlightColor ? chordHighlightColor : emotion.trailColor;

    // node dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, isActive ? 3.2 : 2.4, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? nodeColor : "rgba(0,0,0,0.7)";
    ctx.fill();
    ctx.strokeStyle = isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)";
    ctx.lineWidth = isActive ? 1 : 0.5;
    ctx.stroke();

    // label near node — ONLY for active root
    if (isActive) {
      const lp = labelPlacementForNode(i, p);

      ctx.save();
      ctx.font = `700 6.2px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "#111827"; // same as keyboard note labels
      ctx.textAlign = lp.align;
      ctx.textBaseline = lp.baseline;
      const rootLabel = activeChordSymbol ? rootLabelFromChordSymbol(activeChordSymbol) : CHROMA_LABELS[i];
ctx.fillText(rootLabel, lp.x, lp.y);
      ctx.restore();
    }
  

;
  }

  ctx.restore();
}

/* =========================
   Export caption render (Canvas)
========================= */

function drawChordCaptionCanvas(opts: {
  ctx: CanvasRenderingContext2D;
  xCenter: number;
  y: number;
  chords: string[];
  activeIndex: number;
  scale: number;
}) {
  const { ctx, xCenter, y, chords, activeIndex, scale } = opts;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const fontBase = 28 * scale; // tuned for 1080x1920@SCALE=2
  const sep = " · ";

  // Measure segments to center align
  const widths: number[] = [];
  let total = 0;

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    const isActive = i === activeIndex;
    ctx.font = `${isActive ? "700" : "400"} ${fontBase}px system-ui, -apple-system, sans-serif`;
    const w = ctx.measureText(chord).width;
    widths.push(w);
    total += w;
    if (i < chords.length - 1) {
      ctx.font = `400 ${fontBase}px system-ui, -apple-system, sans-serif`;
      total += ctx.measureText(sep).width;
    }
  }

  let x = xCenter - total / 2;

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    const isActive = i === activeIndex;

    if (i > 0) {
      ctx.font = `400 ${fontBase}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = "rgba(17,24,39,0.45)";
      ctx.fillText(sep, x, y);
      x += ctx.measureText(sep).width;
    }

    ctx.font = `${isActive ? "700" : "400"} ${fontBase}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = isActive ? "rgba(17,24,39,1)" : "rgba(17,24,39,0.70)";
    ctx.fillText(chord, x, y);

    const w = widths[i];

    // underline if active
    if (isActive) {
      ctx.strokeStyle = "rgba(17,24,39,0.95)";
      ctx.lineWidth = Math.max(2, 2.2 * scale);
      ctx.beginPath();
      ctx.moveTo(x, y + 8 * scale);
      ctx.lineTo(x + w, y + 8 * scale);
      ctx.stroke();
    }

    x += w;
  }

  ctx.restore();
}

/* =========================
   Export pipeline
========================= */

async function exportEmotionClip(emotion: ColorEmotionMeta) {
  const chords = emotion.colorChords.trim().split(/\s+/).filter(Boolean);
  if (!chords.length) throw new Error("No chords");

  const baseStepSec = 0.9;
  const tempoMult = emotion.tempo || 1.0;
  const stepSec = baseStepSec / tempoMult;

  const passCount = 2;
  const stepsTotal = chords.length * passCount;
  const tailSec = 0.45;
  const totalSec = stepsTotal * stepSec + tailSec;

  const ac = getCtxExport();

  const FRAME_W = 1080;
  const FRAME_H = 1920;
  const SCALE = 2;
  const FPS = 30;

  const canvas = document.createElement("canvas");
  canvas.width = FRAME_W * SCALE;
  canvas.height = FRAME_H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2D ctx");

  // Media stream
  const exportDst = ac.createMediaStreamDestination();
  const stream = (canvas as any).captureStream(FPS) as MediaStream;
  const mixed = new MediaStream([...stream.getVideoTracks(), ...exportDst.stream.getAudioTracks()]);

  const mimeType = pickRecorderMime();
  const chunks: BlobPart[] = [];
  const rec = new MediaRecorder(mixed, { mimeType });
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  // Schedule audio deterministically
  const t0 = ac.currentTime + 0.5;

  for (let step = 0; step < stepsTotal; step++) {
    const idx = step % chords.length;
    const chordSymbol = chords[idx];
const rh = triadNamesInRH(chordSymbol);
const lh = rootNameInLH(chordSymbol);
const notes = [lh, ...rh].filter(Boolean);
const at = t0 + step * stepSec;

for (const name of notes) {
  loadBufferExport(name)
    .then((buf) => {
          const src = ac.createBufferSource();
          src.buffer = buf;

          const g = ac.createGain();
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(1.0, at + 0.01);
          g.gain.setTargetAtTime(0.0001, at + 0.7, 0.2);

          src.connect(g);
          g.connect(exportDst);

          try {
            src.start(at);
            src.stop(at + 1.5);
          } catch {}
        })
        .catch(() => {});
    }
  }

  // Render loop
  rec.start();
  const recordStart = performance.now();

  const drawFrame = () => {
    const t = (performance.now() - recordStart) / 1000; // seconds since start of recording
    const elapsed = Math.max(0, t);

    // Determine active step + chord (2 passes)
    const step = Math.min(stepsTotal - 1, Math.floor(elapsed / stepSec));
    const idx = step % chords.length;
    const chordSymbol = chords[idx] ?? null;

    // Chord highlight override (for both ring + keyboard)
    const highlightOverride = chordSymbol ? getChordHighlightColor(emotion.id, chordSymbol) : null;

    const Y_OFFSET = 40 * SCALE;
    // Background (match your live page vibe)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fdfcf8";
    ctx.fillRect(0, 0, FRAME_W * SCALE, FRAME_H * SCALE);

    const vignette = ctx.createRadialGradient(
      (FRAME_W * SCALE) / 2,
      (FRAME_H * SCALE) / 2,
      FRAME_W * SCALE * 0.35,
      (FRAME_W * SCALE) / 2,
      (FRAME_H * SCALE) / 2,
      FRAME_W * SCALE * 0.75
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.05)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, FRAME_W * SCALE, FRAME_H * SCALE);

    // Top label (emotion)
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111827";
    ctx.font = `700 ${54 * SCALE}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(
  `${emotion.emoji} ${emotion.label}`,
  (FRAME_W * SCALE) / 2,
  FRAME_H * SCALE * 0.13 + Y_OFFSET
);
    ctx.restore();

    // Circle placement
    const circleRadius = FRAME_W * SCALE * 0.23;
    const circleCx = (FRAME_W * SCALE) / 2;
    const circleCy = FRAME_H * SCALE * 0.33 + Y_OFFSET;

    drawColorCircleCanvas({
      ctx,
      cx: circleCx,
      cy: circleCy,
      radiusPx: circleRadius,
      emotion,
      activeChordSymbol: chordSymbol,
    });

    // Caption under circle
    drawChordCaptionCanvas({
      ctx,
      xCenter: (FRAME_W * SCALE) / 2,
      y: FRAME_H * SCALE * 0.47 + Y_OFFSET,
      chords,
      activeIndex: idx,
      scale: SCALE,
    });

    // Keyboard
    drawKeyboardCanvas({
  ctx,
  x: FRAME_W * SCALE * 0.04,
  y: FRAME_H * SCALE * 0.52 + Y_OFFSET,
  w: FRAME_W * SCALE * 0.92,
  emotion,
  activeChordSymbol: chordSymbol,
  highlightColorOverride: highlightOverride,
  highlightNotesPrimary: chordSymbol ? triadNamesInRH(chordSymbol) : [],
  highlightNotesSecondary: chordSymbol ? [rootNameInLH(chordSymbol)] : [],
  highlightColorSecondary: "rgba(17,24,39,0.22)",
});



    if (elapsed < totalSec) {
      requestAnimationFrame(drawFrame);
    } else {
      rec.stop();
    }
  };

  requestAnimationFrame(drawFrame);

  const recorded: Blob = await new Promise((res) => {
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || "video/webm" });
      res(blob);
    };
  });

  const outBlob = await convertToMp4Server(recorded);
  return outBlob;
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => {
    try {
      URL.revokeObjectURL(a.href);
    } catch {}
  }, 1000);
}

/* =========================
   Page: Live player + Export
========================= */

export default function KeyboardColorLabPage() {
  const [selectedId, setSelectedId] = useState<EmotionId>("sadness");
  const [currentChords, setCurrentChords] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const samplerRef = useRef<Tone.Sampler | null>(null);

  // Init sampler
  useEffect(() => {
    ensurePianoSampler(samplerRef).catch(() => {});
  }, []);

  const handlePlayChord = useCallback((symbol: string) => {
  const sampler = samplerRef.current;
  if (!sampler) return;

  const rh = triadNamesInRH(symbol);
  const lh = rootNameInLH(symbol);
  const toPlay = [lh, ...rh].filter(Boolean);

  if (!toPlay.length) return;

  try {
    (sampler as any).triggerAttackRelease(toPlay, 0.8);
  } catch {}
}, []);

  const { activeChordIndex, isPlaying, playSequence, stop } = useEmotionPlayback({
    onPlayChord: handlePlayChord,
  });

  const selectedMeta = COLOR_EMOTIONS_BY_ID[selectedId];

  const activeChordSymbol =
    activeChordIndex != null && currentChords[activeChordIndex] ? currentChords[activeChordIndex] : null;

  const chromaHighlightColor =
    activeChordSymbol && activeChordSymbol.length ? getChordHighlightColor(selectedMeta.id, activeChordSymbol) : null;

  const triggerEmotionLive = useCallback(
    async (id: EmotionId) => {
      await Tone.start().catch(() => {});
      const meta = COLOR_EMOTIONS_BY_ID[id];
      const chords = meta.colorChords.trim().split(/\s+/).filter(Boolean);
      setCurrentChords(chords);

      const baseStepSec = 0.9;
      const tempoMult = meta.tempo || 1.0;
      const stepMs = (baseStepSec / tempoMult) * 1000;

      playSequence(chords, stepMs);
      // eslint-disable-next-line no-console
      console.log(`[KeyboardColor LIVE] ${id}:`, chords.join(" → "));
    },
    [playSequence]
  );

  const handleSelectEmotion = (id: EmotionId) => {
    setSelectedId(id);
    triggerEmotionLive(id);
  };

  // Keep current chords in sync with selection (even before first play)
  useEffect(() => {
    const meta = COLOR_EMOTIONS_BY_ID[selectedId];
    const chords = meta.colorChords.trim().split(/\s+/).filter(Boolean);
    setCurrentChords(chords);
  }, [selectedId]);

  const onDownloadThis = useCallback(async () => {
    const emotion = selectedMeta;
    setIsExporting(true);
    setExportMsg(`Preparing ${emotion.label}…`);
    try {
      // Stop live playback to avoid user confusion
      stop();
      const blob = await exportEmotionClip(emotion);
      downloadBlob(blob, `color-emotion-${emotion.id}.mp4`);
      setExportMsg(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[export] failed", e);
      setExportMsg("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      window.setTimeout(() => setExportMsg(null), 1200);
    }
  }, [selectedMeta, stop]);

  const onDownloadAll = useCallback(async () => {
    setIsExporting(true);
    setExportMsg("Preparing all 10…");
    try {
      stop();
      // sequential downloads (one per emotion)
      for (let i = 0; i < COLOR_EMOTIONS.length; i++) {
        const e = COLOR_EMOTIONS[i];
        setExportMsg(`Preparing ${i + 1}/10 — ${e.label}…`);
        const blob = await exportEmotionClip(e);
        downloadBlob(blob, `color-emotion-${e.id}.mp4`);
        // small delay so downloads don’t collide visually
        await new Promise((r) => setTimeout(r, 350));
      }
      setExportMsg(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[export all] failed", e);
      setExportMsg("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      window.setTimeout(() => setExportMsg(null), 1200);
    }
  }, [stop]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #fdfcf8 0, #f5f1e8 55%, #ece5d8 100%)",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 12, boxSizing: "border-box" }}>
        <h3 style={{ margin: "18px 0 6px", fontSize: 18, lineHeight: 1.4, fontWeight: 800, textAlign: "center" }}>
          Lab — Keyboard + Color Ring (Export 10)
        </h3>
        <p style={{ margin: "0 0 12px", fontSize: 13, textAlign: "center", opacity: 0.8 }}>
          Live = 1 pass. Export = 2 passes. Ring + keyboard + audio stay synced.
        </p>

        {/* Live ring (simple: same component vibe, but we keep it minimal here by using the existing DOM pieces) */}
        <div style={{ width: "100%", maxWidth: 180, margin: "0 auto", aspectRatio: "1 / 1" }}>
          <button
            type="button"
            aria-label={`Color circle for ${selectedMeta.label}`}
            style={{
              background: `radial-gradient(circle at 30% 20%, ${selectedMeta.gradientTop}, ${selectedMeta.gradientBottom})`,
              width: "100%",
              height: "100%",
              borderRadius: "999px",
              border: "1px solid rgba(0,0,0,0.12)",
              padding: 0,
              overflow: "hidden",
              display: "block",
              cursor: "default",
            }}
          >
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <circle cx={50} cy={50} r={38} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
              {(() => {
                if (!activeChordSymbol) return null;
                const notes = triadFromChordName(activeChordSymbol);
                const pcs: number[] = [];
                for (const n of notes) {
                  const pc = noteNameToPc(n);
                  if (pc != null) pcs.push(pc);
                }
                const d = pcs.length ? pathFromPcs(pcs) : null;
                if (!d) return null;
                const highlight = getChordHighlightColor(selectedMeta.id, activeChordSymbol) || selectedMeta.trailColor;
                return (
                  <path
                    d={d}
                    fill={highlight + "33"}
                    stroke={highlight}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}
              {(() => {
  const rootPc =
    activeChordSymbol ? chordRootPcFromSymbol(activeChordSymbol) : null;

  const chordHighlight =
    activeChordSymbol && activeChordSymbol.length
      ? getChordHighlightColor(selectedMeta.id, activeChordSymbol)
      : null;

  return CHROMA_LABELS.map((_, i) => {
    const p = nodePosition(i, 33);
    const isActive = rootPc === i;
    const nodeColor =
      isActive && chordHighlight ? chordHighlight : selectedMeta.trailColor;

        const cx = Number.isFinite(p.x) ? p.x : 50;
    const cy = Number.isFinite(p.y) ? p.y : 50;
    const rr = isActive ? 3.2 : 2.4;

    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={rr}
        fill={isActive ? nodeColor : "rgba(0,0,0,0.7)"}
        stroke={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)"}
        strokeWidth={isActive ? 1 : 0.5}
      />
    );
  });
})()}
            </svg>
          </button>
        </div>

        {/* Live caption */}
        <ChordCaptionLine chords={currentChords} activeIndex={activeChordIndex} />

        {/* Live keyboard (source of truth) */}
        <KeyboardEmotions
  activeChordSymbol={activeChordSymbol}
  emotion={{
    gradientTop: selectedMeta.gradientTop,
    gradientBottom: selectedMeta.gradientBottom,
    trailColor: selectedMeta.trailColor,
  }}
  emotionLabel={selectedMeta.label}
  highlightColorOverride={chromaHighlightColor ?? undefined}
  highlightNotesPrimary={activeChordSymbol ? triadNamesInRH(activeChordSymbol) : []}
  highlightNotesSecondary={activeChordSymbol ? [rootNameInLH(activeChordSymbol)] : []}
  highlightColorSecondary={"rgba(17,24,39,0.22)"}
/>

        {/* Export buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onDownloadThis}
            disabled={isExporting}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: "none",
              fontSize: 13,
              fontWeight: 800,
              background: isExporting ? "#444" : "#111",
              color: "#fff",
              cursor: isExporting ? "default" : "pointer",
            }}
          >
            {isExporting ? "Preparing…" : "Download MP4 (this emotion, 2 passes)"}
          </button>

          <button
            onClick={onDownloadAll}
            disabled={isExporting}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.18)",
              fontSize: 13,
              fontWeight: 800,
              background: isExporting ? "#f0f0f0" : "#fff",
              color: "#111",
              cursor: isExporting ? "default" : "pointer",
            }}
          >
            {isExporting ? "Preparing…" : "Download all 10 (2 passes each)"}
          </button>
        </div>

        {exportMsg && (
          <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, opacity: 0.85 }}>
            {exportMsg}
          </div>
        )}

        {/* Emotion picker */}
        <EmotionPillBar selectedId={selectedId} isPlaying={isPlaying} onSelect={handleSelectEmotion} />
      </div>
    </main>
  );
}