"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Tone from "tone";
import { parseProgression, type ParsedChord } from "@/lib/harmony/chords";
import {
  playProgressionVoiced,
  buildVoicedNoteNamesForProgression,
} from "@/lib/harmony/export-only/audioVoicedExport";

import {
  FLOW_PRESETS,
  buildFlowChordsForKey,
  pitchNameToPc,
  PITCHES,
  type FlowPreset,
} from "@/lib/harmony/flow";

import SpiralGesture from "@/components/SpiralGesture";
import { calibratedTurnsForDegree } from "@/lib/spiral";
import { buildAlignedSpiralPath } from "@/lib/spiral";
import FlowBubbleSpots from "@/components/FlowBubbleSpots";

// === Export-only Web Audio helpers (separate from Tone.js live sampler) ===
let _ctx: AudioContext | null = null;
const _buffers = new Map<string, AudioBuffer>();

function getCtxExport(): AudioContext {
  if (_ctx) return _ctx;
  const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
  _ctx = new AC({ latencyHint: "interactive" });
  return _ctx!;
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

// Same as in KeyClock: post webm to /api/convert-webm-to-mp4
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

function lighten(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const num = parseInt(h, 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));

  return "#" + r.toString(16).padStart(2, "0") +
               g.toString(16).padStart(2, "0") +
               b.toString(16).padStart(2, "0");
}

function triadToSymbol(notes: string[]): string {
  if (!notes || notes.length < 3) return "?";

  // Strip octave numbers from all notes (e.g. "C4" → "C")
  const n = notes.map(n => n.replace(/[0-9]/g, ""));

  const root = n[0];

  // Convert pitch class
  const pc = PITCHES.indexOf(root as any);
  if (pc < 0) return root;

  // Determine intervals from the root
  const i1 = (PITCHES.indexOf(n[1] as any) - pc + 12) % 12;
const i2 = (PITCHES.indexOf(n[2] as any) - pc + 12) % 12;

  let suffix = "";
  if (i1 === 4 && i2 === 7) suffix = "";      // Major
  else if (i1 === 3 && i2 === 7) suffix = "m"; // Minor
  else if (i1 === 3 && i2 === 6) suffix = "°"; // Diminished
  else suffix = "?";

  return root + suffix;
}

/* =========================
   Shared emotion model
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

type EmotionConfig = {
  id: EmotionId;
  label: string;
  emoji: string;
  // Flow side
  flowKey: "C minor" | "B♭ Major";
  flowDegrees: string;
  flowFormula: string;
  flowExample: string;
  // Color side
  colorFormula: string;
  colorChords: string;
  colorExampleKey: string;
  // Visual / timing
  gradientTop: string;
  gradientBottom: string;
  trailColor: string;
  glowColor: string;
  tempo: number;
};

const EMOTIONS: EmotionConfig[] = [
  {
    id: "magic",
    label: "Magic",
    emoji: "✨",
    flowKey: "B♭ Major",
    flowDegrees: "4 1 5 6",
    flowFormula: "4, 1, 5, 6",
    flowExample: "Eb → Bb → F → Gm",
    colorFormula: "M → M(+8) → M(–4) → M(+3)",
    colorChords: "C Ab E G",
    colorExampleKey: "C",
    gradientTop: "#6d28d9",
    gradientBottom: "#a855f7",
    trailColor: "#c4a1ff",
    glowColor: "#ead9ff",
    tempo: 1.0,
  },
  {
    id: "mystery",
    label: "Mystery",
    emoji: "🕵️‍♀️",
    flowKey: "C minor",
    flowDegrees: "1 4 7b 1",
    flowFormula: "1, 4, 7b, 1",
    flowExample: "Cm → Fm → Bb → Cm",
    colorFormula: "m → M(+2) → dim(+3) → M(+1)",
    colorChords: "Cm D F° F#",
    colorExampleKey: "C",
    gradientTop: "#272343",
    gradientBottom: "#4b4e91",
    trailColor: "#8fb3ff",
    glowColor: "#d0e1ff",
    tempo: 1.0,
  },
  {
    id: "wonder",
    label: "Wonder",
    emoji: "🌌",
    flowKey: "C minor",
    flowDegrees: "1 6b 3b 4",
    flowFormula: "1, 6b, 3b, 4",
    flowExample: "Cm → Ab → Eb → F",
    colorFormula: "m → M(+5) → M(+2) → M(+4)",
    colorChords: "Cm F G B",
    colorExampleKey: "C",
    gradientTop: "#1d3557",
    gradientBottom: "#457b9d",
    trailColor: "#8ecae6",
    glowColor: "#e0fbff",
    tempo: 1.0,
  },
  {
    id: "playful",
    label: "Playful",
    emoji: "🎈",
    flowKey: "B♭ Major",
    flowDegrees: "1 2 5 1",
    flowFormula: "1, 2, 5, 1",
    flowExample: "Bb → Cm → F → Bb",
    colorFormula: "M → M(+3) → M(+3) → M(+2)",
    colorChords: "C Eb F# G#",
    colorExampleKey: "C",
    gradientTop: "#f59e0b",
    gradientBottom: "#f97316",
    trailColor: "#ffb74d",
    glowColor: "#ffe0b2",
    tempo: 1.0,
  },
    {
    id: "calm",
    label: "Calm",
    emoji: "🌿",
    flowKey: "B♭ Major",
    flowDegrees: "1 5 6 4",
    flowFormula: "1, 5, 6, 4",
    flowExample: "Bb → F → Gm → Eb",
    colorFormula: "M → M(+2) → M(+3) → M(–2)",
    colorChords: "C D F Eb",
    colorExampleKey: "C",
    gradientTop: "#2f5d4f",
    gradientBottom: "#6bbf8f",
    trailColor: "#6dd2a3",
    glowColor: "#c7f2da",
    tempo: 1.0,
  },
  {
    id: "tension",
    label: "Tension",
    emoji: "😬",
    flowKey: "C minor",
    flowDegrees: "1 2 5 1",
    flowFormula: "1, 2, 5, 1",
    flowExample: "Cm → D° → G → Cm",
    colorFormula: "M → m(+1) → dim(+3) → M(+2)",
    colorChords: "C C#m E° F#",
    colorExampleKey: "C",
    gradientTop: "#4b5563",
    gradientBottom: "#9ca3af",
    trailColor: "#fbbf24",
    glowColor: "#fef3c7",
    tempo: 1.0,
  },
  {
    id: "fear",
    label: "Fear",
    emoji: "😱",
    flowKey: "C minor",
    flowDegrees: "1 2b 5 1",
    flowFormula: "1, 2b, 5, 1",
    flowExample: "Cm → Db → G → Cm",
    colorFormula: "m → dim(+6) → M(+1) → dim(+3)",
    colorChords: "Cm F#° G A#°",
    colorExampleKey: "C",
    gradientTop: "#222933",
    gradientBottom: "#4a5568",
    trailColor: "#6bc1ff",
    glowColor: "#c0e6ff",
    tempo: 1.0,
  },
  {
    id: "sadness",
    label: "Sadness",
    emoji: "😢",
    flowKey: "C minor",
    flowDegrees: "1 6b 3b 7b",
    flowFormula: "1, 6b, 3b, 7b",
    flowExample: "Cm → Ab → Eb → Bb",
    colorFormula: "m → M(–4) → m(–3) → m(–1)",
    colorChords: "Cm Ab Fm Em",
    colorExampleKey: "C",
    gradientTop: "#2D3E68",
    gradientBottom: "#6076AF",
    trailColor: "#4A6FA5",
    glowColor: "#A8C1E8",
    tempo: 0.9,
  },
  {
    id: "anger",
    label: "Anger",
    emoji: "😡",
    flowKey: "C minor",
    flowDegrees: "1 4 2b 5",
    flowFormula: "1, 4, 2b, 5",
    flowExample: "Cm → Fm → Db → G",
    colorFormula: "m → m(+1) → dim(+3) → M(+2)",
    colorChords: "Cm C#m E° F#",
    colorExampleKey: "C",
    gradientTop: "#6b1b25",
    gradientBottom: "#c0392b",
    trailColor: "#ff7373",
    glowColor: "#ffc4c4",
    tempo: 1.0,
  },
  {
    id: "melancholy",
    label: "Melancholy",
    emoji: "🌧️",
    flowKey: "C minor",
    flowDegrees: "6b 4 1 5",
    flowFormula: "6b, 4, 1, 5",
    flowExample: "Ab → Fm → Cm → G",
    colorFormula: "m → M(–3) → m(+4) → M(–3)",
    colorChords: "Cm A C#m A#",
    colorExampleKey: "C",
    gradientTop: "#314159",
    gradientBottom: "#60738d",
    trailColor: "#5a7bbc",
    glowColor: "#c4d4f6",
    tempo: 1.0,
  },
];
const FLOW_BORROW_COUNT: Record<EmotionId, 0 | 1 | 2> = {
  // 2 borrowed chords
  anger: 2,
  fear: 2,

  // 1 borrowed chord
  melancholy: 1,
  tension: 1,
  wonder: 1,

  // the rest are pure diatonic
  sadness: 0,
  mystery: 0,
  calm: 0,
  playful: 0,
  magic: 0,
};

type EmotionCopy = {
  introLine1: string;
  introLine2: string;
  flowLabel: string;
  colorLabel: string;
  outroLine1: string;
  outroLine2: string;
};


const EMOTION_COPY: Record<EmotionId, EmotionCopy> = {
  playful: {
    introLine1: "🎈 Playful",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = light bounce",
    colorLabel: "Color Path = playful spark",
    outroLine1: "Blend them 🎨",
    outroLine2: "to keep the fun moving",
  },
  anger: {
    introLine1: "⚡ Anger",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = rising pressure",
    colorLabel: "Color = sharp release",
    outroLine1: "Combine both ⚡️",
    outroLine2: "to control the energy",
  },
  mystery: {
    introLine1: "🕵️‍♀️ Mystery",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = quiet search",
    colorLabel: "Color Path = sudden shift",
    outroLine1: "Mix them 🌀",
    outroLine2: "to shape your story",
  },
  sadness: {
    introLine1: "😢 Sadness",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = gentle fall",
    colorLabel: "Color Path = soft ache",
    outroLine1: "Use both 💙",
    outroLine2: "to color the emotion deeply",
  },
  fear: {
    introLine1: "😨 Fear",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = creeping tension",
    colorLabel: "Color Path = sharp jolt",
    outroLine1: "Pair them 🧩",
    outroLine2: "to build and release tension",
  },
  melancholy: {
    introLine1: "🌫️ Melancholy",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = drifting thought",
    colorLabel: "Color Path = distant pull",
    outroLine1: "Let both paths 🌙",
    outroLine2: "shape the mood gently",
  },
  calm: {
    introLine1: "🌙 Calm",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = smooth breath",
    colorLabel: "Color Path = soft glow",
    outroLine1: "Balance the two ☯️",
    outroLine2: "to keep the peace",
  },
  tension: {
    introLine1: "🎭 Tension",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = slow build",
    colorLabel: "Color Path = unstable edge",
    outroLine1: "Use both 🪢",
    outroLine2: "to craft the pull-and-release",
  },
  magic: {
    introLine1: "✨ Magic",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = floating motion",
    colorLabel: "Color Path = shimmering turn",
    outroLine1: "Blend them ✨",
    outroLine2: "to make the moment glow",
  },
  wonder: {
    introLine1: "🌌 Wonder",
    introLine2: "Two parts, one mood",
    flowLabel: "Flow Path = open horizon",
    colorLabel: "Color Path = bright lift",
    outroLine1: "Combine both 🌠",
    outroLine2: "to open the space wider",
  },
};

/* =========================
   Flow side – degree model
========================= */

type Mode = "major" | "minor";
type DegreeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Acc = -1 | 0 | 1;

type DegToken = {
  base: DegreeNumber;
  acc: Acc;
  display: string;
};

const MAJOR_OFFSETS: Record<DegreeNumber, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
};

const MINOR_OFFSETS: Record<DegreeNumber, number> = {
  1: 0,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 8,
  7: 10,
};

const TRIAD_MAJOR = [0, 4, 7];
const TRIAD_MINOR = [0, 3, 7];
const TRIAD_DIM = [0, 3, 6];

const TONIC_PC_BB = 10;
const TONIC_PC_CM = 0;



function midiToNoteName(midi: number): string {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

const FLOW_CIRCLE_LABELS = [
  "I",
  "V",
  "ii",
  "vi",
  "iii",
  "vii°",
  "♯IV",
  "♭II",
  "♭VI",
  "♭III",
  "♭VII",
  "IV",
];

type Pt = { x: number; y: number };

function nodePosition(i: number, r = 36): Pt {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const xRaw = 50 + Math.cos(a) * r;
  const yRaw = 50 + Math.sin(a) * r;
  const x = Number(xRaw.toFixed(3));
  const y = Number(yRaw.toFixed(3));
  return { x, y };
}

function labelPlacement(i: number, p: Pt) {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const xRaw = p.x + 3.0 * ux;
  const yRaw = p.y + 3.0 * uy;
  const x = Number(xRaw.toFixed(3));
  const y = Number(yRaw.toFixed(3));

  const ax = Math.abs(ux);
  const ay = Math.abs(uy);
  let anchor: "start" | "middle" | "end" = "middle";
  let baseline: "alphabetic" | "middle" | "hanging" = "middle";
  if (ax >= ay) {
    anchor = ux > 0 ? "start" : "end";
    baseline = "middle";
  } else {
    anchor = "middle";
    baseline = uy > 0 ? "hanging" : "alphabetic";
  }
  return { x, y, anchor, baseline };
}

const NODE_INDEX_MAJOR_BASE: Record<DegreeNumber, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 11,
  5: 1,
  6: 3,
  7: 5,
};

const NODE_INDEX_MINOR_BASE: Record<DegreeNumber, number> = {
  1: 0,
  2: 2,
  3: 9,
  4: 11,
  5: 1,
  6: 8,
  7: 10,
};

const NODE_INDEX_CHROMA: Record<string, number> = {
  "2,-1": 7,
  "3,-1": 9,
  "4,1": 6,
  "6,-1": 8,
  "7,-1": 10,
};

function parseDegreeProgression(input: string): DegToken[] {
  const tokens: DegToken[] = [];
  const re = /([b#]?[1-7][b#]?)/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(input)) !== null) {
    const raw = m[1];
    const s = raw.trim();
    const m2 = /^([b#]?)([1-7])([b#]?)$/i.exec(s);
    if (!m2) continue;

    const pre = m2[1];
    const num = parseInt(m2[2], 10) as DegreeNumber;
    const post = m2[3];

    let acc: Acc = 0;
    if (pre === "b" || post === "b") acc = -1;
    else if (pre === "#" || post === "#") acc = 1;

    let display: string;
    if (acc === -1) display = `♭${num}`;
    else if (acc === 1) display = `♯${num}`;
    else display = `${num}`;

    tokens.push({ base: num, acc, display });
  }

  return tokens;
}

function triadMidiForToken(tok: DegToken, mode: Mode): string[] {
  // Pick the correct scale offsets and tonic
  const baseOffsets = mode === "major" ? MAJOR_OFFSETS : MINOR_OFFSETS;
  const tonicPC = mode === "major" ? TONIC_PC_BB : TONIC_PC_CM;

  // =====================================================
  // FIX: Prevent "double-flats" in minor for scale degrees
  // that are ALREADY flat (♭III, ♭VI, ♭VII).
  // So in minor: 3b, 6b, 7b → behave as 3, 6, 7.
  // =====================================================
  let acc: Acc = tok.acc;
  if (mode === "minor" && tok.acc === -1) {
    if (tok.base === 3 || tok.base === 6 || tok.base === 7) {
      acc = 0;
    }
  }

  // Compute pitch class
  const baseOff = baseOffsets[tok.base];
  const rootPC = (tonicPC + baseOff + acc + 12) % 12;

  // Pick a reasonable octave for triad roots
  const baseOct = 4;
  let rootMidi = (baseOct + 1) * 12 + rootPC;
  if (rootMidi < 48) rootMidi += 12;
  if (rootMidi > 72) rootMidi -= 12;

  // =====================================================
  // QUALITY LOGIC (unchanged from your original)
  // =====================================================
  let quality: "M" | "m" | "dim";

  if (tok.acc !== 0) {
    // Chromatic alterations default to major triads
    quality = "M";
  } else {
    if (mode === "major") {
      if (tok.base === 1 || tok.base === 4 || tok.base === 5) quality = "M";
      else if (tok.base === 7) quality = "dim";
      else quality = "m";
    } else {
      // natural minor (aeolian)
      if (tok.base === 1 || tok.base === 4 || tok.base === 5) quality = "m";
      else if (tok.base === 2) quality = "dim";
      else quality = "M"; // 3, 6, 7 → major triads
    }
  }

  // Triad intervals
  const triadSteps =
    quality === "M"
      ? TRIAD_MAJOR
      : quality === "dim"
      ? TRIAD_DIM
      : TRIAD_MINOR;

  // Build actual note names
  return triadSteps.map((semi) => midiToNoteName(rootMidi + semi));
}



function nodeIndexForToken(tok: DegToken, mode: Mode): number {
  if (tok.acc !== 0) {
    const key = `${tok.base},${tok.acc}`;
    if (key in NODE_INDEX_CHROMA) return NODE_INDEX_CHROMA[key];
  }

  if (mode === "major") {
    return NODE_INDEX_MAJOR_BASE[tok.base];
  } else {
    return NODE_INDEX_MINOR_BASE[tok.base];
  }
}



/* =========================
   Color-side helpers
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

function pathFromPcs(pcs: number[]): string {
  const uniq = Array.from(new Set(pcs.map((x) => ((x % 12) + 12) % 12))).sort(
    (a, b) => a - b
  );
  if (!uniq.length) return "";
  const pts = uniq.map((i) => nodePosition(i, 30));
  const move = `M ${pts[0].x} ${pts[0].y}`;
  const rest = pts
    .slice(1)
    .map((p) => `L ${p.x} ${p.y}`)
    .join(" ");
  return `${move} ${rest} Z`;
}

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

async function ensurePianoSampler(
  ref: React.MutableRefObject<Tone.Sampler | null>
) {
  if (ref.current) return;

  const urls = buildFullPianoUrls();
  const sampler = new Tone.Sampler({
    urls,
    baseUrl: "/audio/notes/",
  }).toDestination();

  await Tone.loaded();
  ref.current = sampler;
}
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

// Color audio (approx triads from chord names)
      function triadFromChordName(name: string): string[] {
        const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(name);
        if (!m) return [];
        const letter = m[1].toUpperCase();
        const acc = m[2] || "";
        const qual = (m[3] || "").toLowerCase();

        const basePCMap: Record<string, number> = {
          C: 0,
          D: 2,
          E: 4,
          F: 5,
          G: 7,
          A: 9,
          B: 11,
        };
        let pc = basePCMap[letter] ?? 0;
        if (acc === "#") pc = (pc + 1 + 12) % 12;
        if (acc === "b") pc = (pc - 1 + 12) % 12;

        let quality: "M" | "m" | "dim" = "M";
        if (qual === "m") quality = "m";
        if (qual === "°" || qual === "dim") quality = "dim";

        const steps =
          quality === "M"
            ? [0, 4, 7]
            : quality === "m"
            ? [0, 3, 7]
            : [0, 3, 6];

        const baseOct = 4;
        const rootMidi = (baseOct + 1) * 12 + pc;
        return steps.map((semi) => midiToNoteName(rootMidi + semi));
      }

/* =========================
   FLOW circle component (lab)
========================= */

type FlowCircleProps = {
  emotion: EmotionConfig;
  playToken: number;
  onFinished?: () => void;
  showTrails: boolean;
  showActiveLabels: boolean;
  showAllLabels: boolean;
  clearTrailsToken: number;
};



function lightenColor(hex: string, amount: number): string {
  // amount in [0,1], 0 = original, 1 = white
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const num = parseInt(h, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.round(r + (255 - r) * amount);
  g = Math.round(g + (255 - g) * amount);
  b = Math.round(b + (255 - b) * amount);

  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

// triadFromChordName must already exist in this file for Flow or Color;
// if not, paste your existing version here and share for both.

function FlowCircle({
  emotion,
  playToken,
  onFinished,
  showTrails,
  showActiveLabels,
  showAllLabels,
  clearTrailsToken,
}: FlowCircleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [heldStep, setHeldStep] = useState<number | null>(null);



  const timeoutsRef = useRef<number[]>([]);

  // FlowPreset for this emotion
  const preset = FLOW_PRESETS[emotion.id];
  const tonicPc =
    preset.mode === "minor" ? pitchNameToPc("C") : pitchNameToPc("Bb");
// NOTE: angles increase CCW in trig; use -1 for clockwise
const flowDir: 1 | -1 = preset.mode === "minor" ? 1 : -1;
const borrowCount = FLOW_BORROW_COUNT[emotion.id] ?? 0;

  const flowChordNames = useMemo(
    () => buildFlowChordsForKey(tonicPc, preset),
    [tonicPc, preset]
  );
  const flowParsed = useMemo(
  () => parseProgression(flowChordNames.join(" ")),
  [flowChordNames]
);

  // Degrees for node positioning
  const degreeTokens = useMemo(
  () => parseDegreeProgression(preset.degrees.join(" ")),
  [preset.degrees]
);
const flowDegrees = useMemo(() => {
  return degreeTokens.map((t) => t.base);
}, [degreeTokens]);
const flowProgressStops = useMemo(() => {
  // turns per chord from the calibrated rule
  const turns = flowDegrees.map((d) => calibratedTurnsForDegree(d));
  const total = turns.reduce((a, b) => a + b, 0) || 1;

  const stops: number[] = [];
  let acc = 0;
  for (let i = 0; i < turns.length; i++) {
    acc += turns[i];
    stops.push(acc / total); // 0..1
  }
  return stops;
}, [flowDegrees]);

  const flowNodeIndices = useMemo(
    () => degreeTokens.map((tok) => nodeIndexForToken(tok, preset.mode)),
    [degreeTokens, preset.mode]
  );
    const flowAngles = useMemo(() => {
    // map node index [0..11] -> angle, same orientation as your nodePosition
    return flowNodeIndices.map((ni) => (ni / 12) * Math.PI * 2 - Math.PI / 2);
  }, [flowNodeIndices]);

  const boundaryNodeIndices = useMemo(() => {
  // diatonic scale degrees 1..7 (no accidentals)
  const diatonic: DegToken[] = [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    base: d as any,
    acc: 0 as any,
    display: String(d),
  }));
  return diatonic.map((t) => nodeIndexForToken(t as any, preset.mode));
}, [preset.mode]);

const borrowedNodeIndices = useMemo(() => {
  const boundary = new Set(boundaryNodeIndices.map((n) => ((n % 12) + 12) % 12));
  return flowNodeIndices.filter((n) => !boundary.has(((n % 12) + 12) % 12));
}, [flowNodeIndices, boundaryNodeIndices]);
  

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const stopPlayback = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    setActiveNodeIndex(null);
    setActiveStep(null);
    setHeldStep(null);
  }, [clearTimers]);

  const startPlayback = useCallback(() => {
    if (!flowChordNames.length) return;

    // DEBUG: log chords
    console.log(
      `[Flow LIVE DEBUG] ${emotion.id} (${emotion.flowKey}):`,
      flowChordNames.join(" → ")
    );

    stopPlayback();
    setIsPlaying(true);
    setActiveNodeIndex(null);
    setActiveStep(null);
    setHeldStep(null);



    const baseStepSec = 0.9;
    const tempoMult = emotion.tempo || 1.0;
    const stepSec = baseStepSec / tempoMult;

    // Export-only voiced playback (Flow) — does not touch live audio.ts
    playProgressionVoiced(flowParsed, {
      playMode: "chords",
      chordDur: stepSec,
      baseOctave: 4,
      minMidi: 48,
      maxMidi: 76,
    }).catch(() => {});

    let accSec = 0;
    const now = Tone.now();

    flowChordNames.forEach((chName, idx) => {
      const startTime = now + accSec;
      void startTime;

      const nodeIdx = flowNodeIndices[idx];

      const tid = window.setTimeout(() => {
        setActiveStep(idx);
        setHeldStep(idx);
        setActiveNodeIndex(nodeIdx);

        if (showTrails) {
          const turns = idx + 1;
          

          

          const isLastChord = idx === flowChordNames.length - 1;
          if (!isLastChord) {
            const fadeDelayMs = stepSec * 1000 * 0.7;
            const fadeId = window.setTimeout(() => {
              
            }, fadeDelayMs);
            timeoutsRef.current.push(fadeId);
          }
        }
      }, accSec * 1000);
      timeoutsRef.current.push(tid);

      accSec += stepSec;
    });

    const totalSec = accSec;
    const endId = window.setTimeout(() => {
      setIsPlaying(false);
      setActiveNodeIndex(null);
      setActiveStep(null);
      // last spiral stays visible until clearTrailsToken
      onFinished?.();
    }, (totalSec + 0.5) * 1000);
    timeoutsRef.current.push(endId);
  }, [
    flowChordNames,
    emotion.id,
    emotion.flowKey,
    emotion.tempo,
    flowNodeIndices,
    onFinished,
    showTrails,
    stopPlayback,
  ]);

useEffect(() => {
  if (!playToken) return;
  try {
    startPlayback();
  } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [playToken]);

  // clear spiral when Color finishes and clearTrailsToken bumps
  useEffect(() => {
    if (!clearTrailsToken) return;
    
  }, [clearTrailsToken]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const activeLabelText =
    activeStep != null ? degreeTokens[activeStep]?.display ?? "" : "";

  return (
    <div
      style={{
        width: "180px",
        height: "180px",
        maxWidth: "100%",
      }}
    >
      <button
        type="button"
        className="two-paths-circle-btn"
        aria-label={`Flow circle for ${emotion.label}`}
        style={{
          background: `radial-gradient(circle at 30% 20%, ${emotion.gradientTop}, ${emotion.gradientBottom})`,
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
        <svg
          viewBox="0 0 100 100"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* ring */}
          <circle
            cx={50}
            cy={50}
            r={38}
            fill="none"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={1}
          />

          {/* Flow bubbles / giraffe-spots */}
{showTrails ? (
  (() => {
    const step = activeStep ?? heldStep;
    const nodesSlice = step == null ? [] : flowNodeIndices.slice(0, step + 1);

    return (
      <FlowBubbleSpots
        seedKey={`flow|${emotion.id}|${preset.degrees.join(" ")}`}
        chordNodeIndices={nodesSlice}
        fullChordNodeIndices={flowNodeIndices}
        boundaryNodeIndices={boundaryNodeIndices}
        borrowedNodeIndices={borrowedNodeIndices}
        borrowCount={borrowCount}
        ink={emotion.trailColor}
        ringClipR={36}
        boundaryR={33}
        centerR={24}
        res={256}
        shiftCoef={0.25}
        stepIndex={step}
      />
    );
  })()
) : null}

          {/* nodes */}
          {FLOW_CIRCLE_LABELS.map((_, i) => {
            const p = nodePosition(i, 33);
            const isActive = activeNodeIndex === i;
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isActive ? 3.2 : 2.4}
                fill={isActive ? emotion.trailColor : "rgba(0,0,0,0.7)"}
                stroke={isActive ? emotion.glowColor : "rgba(255,255,255,0.25)"}
                strokeWidth={isActive ? 1 : 0.5}
              />
            );
          })}

          {/* (optional) active degree text somewhere, if you use it */}
        </svg>
      </button>
    </div>
  );
}

/* =========================
   COLOR circle component
========================= */

type ColorCircleProps = {
  emotion: EmotionConfig;
  playToken: number;
  showTrails: boolean;
  showActiveLabels: boolean;
  showAllLabels: boolean;
  onFinished?: () => void;
  clearTrailsToken: number;
};

function ColorCircle({
  emotion,
  playToken,
  showTrails,
  showActiveLabels,
  showAllLabels,
  onFinished,
  clearTrailsToken,
}: ColorCircleProps) {
  const [playing, setPlaying] = useState(false);
const [activeRoot, setActiveRoot] = useState<number | null>(null);
const [currentChordColor, setCurrentChordColor] = useState<string | null>(null);

// Single shape path for current chord, plus color + opacity
const [shapePath, setShapePath] = useState<string | null>(null);
const [shapeColor, setShapeColor] = useState<string | null>(null);


const rafRef = useRef<number | null>(null);
const startRef = useRef<number>(0);
const totalMsRef = useRef<number>(0);

const chords = useMemo<ParsedChord[]>(
  () => parseProgression(emotion.colorChords),
  [emotion.colorChords]
);

const chordNames = useMemo(
  () => emotion.colorChords.trim().split(/\s+/).filter(Boolean),
  [emotion.colorChords]
);

const chordDurSec = useMemo(
  () => 0.9 / (emotion.tempo || 1.0),
  [emotion.tempo]
);

  const stopPlayback = useCallback(() => {
  setPlaying(false);
  if (rafRef.current) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
  setActiveRoot(null);
  setCurrentChordColor(null);
}, []);

  const startPlayback = useCallback(() => {
    if (!chords.length) return;

    stopPlayback();
    setPlaying(true);
setActiveRoot(chords[0]?.root ?? null);
setShapePath(null);
setCurrentChordColor(null);

    // 🔍 DEBUG — Print Color chords that will be played
const colorChordNames = emotion.colorChords.trim().split(/\s+/).filter(Boolean);
console.log(
  `%c[Color LIVE DEBUG] ${emotion.id}:`,
  "color:#5fc3ff; font-weight:bold",
  colorChordNames.join(" → ")
);

    const chordMs = chordDurSec * 1000;
    const totalMs = chordMs * chords.length;
    startRef.current = performance.now();
    totalMsRef.current = totalMs;

    playProgressionVoiced(chords, {
  playMode: "chords",
  chordDur: chordDurSec,
  baseOctave: 4,
  minMidi: 48,
  maxMidi: 76,
}).catch(() => {});

    const loop = () => {
  const now = performance.now();
  const elapsed = now - startRef.current;

  if (elapsed >= totalMsRef.current) {
    stopPlayback();
    onFinished?.();
    return;
  }

    const idx = Math.min(
    chords.length - 1,
    Math.floor(elapsed / chordMs)
  );
  const chord = chords[idx];
  setActiveRoot(chord.root ?? null);

  const chordName = chordNames[idx] ?? "";
  const highlight = getChordHighlightColor(emotion.id, chordName);
  const chordColor = highlight || emotion.trailColor;
  setCurrentChordColor(chordColor);

  // NEW: per-chord shape flash
  if (showTrails && chord.pcs && chord.pcs.length) {
    const p = pathFromPcs(chord.pcs);
    if (p) {
      setShapePath(p);
      setShapeColor(chordColor);
    

      const isLast = idx === chords.length - 1;
      if (!isLast) {
        const fadeDelayMs = chordMs * 0.7;
        window.setTimeout(() => {
          
        }, fadeDelayMs);
      }
    }
  }

  rafRef.current = requestAnimationFrame(loop);
};

    rafRef.current = requestAnimationFrame(loop);
  }, [chords, chordDurSec, showTrails, stopPlayback, onFinished]);

  useEffect(() => {
    if (!playToken) return;
    startPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playToken]);

    useEffect(() => {
  if (!clearTrailsToken) return;
  setShapePath(null);
  
  setCurrentChordColor(null);
}, [clearTrailsToken]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const activeLabelText =
    activeRoot != null ? CHROMA_LABELS[activeRoot] ?? "" : "";

  return (
    <div
      style={{
        width: "180px",
        height: "180px",
        maxWidth: "100%",
      }}
    >
      <button
        type="button"
        className="two-paths-circle-btn"
        aria-label={`Color circle for ${emotion.label}`}
        style={{
          background: `radial-gradient(circle at 30% 20%, ${emotion.gradientTop}, ${emotion.gradientBottom})`,
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
        <svg
          viewBox="0 0 100 100"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* Base ring */}
          <circle
            cx={50}
            cy={50}
            r={38}
            fill="none"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth={1}
          />

          {/* Single chord-shape trail (current or last) */}
{showTrails && shapePath && (
  <path
    d={shapePath}
    fill={(shapeColor || emotion.trailColor) + "33"}
    stroke={shapeColor || emotion.trailColor}
    strokeWidth={1}
strokeOpacity={0.9}
  />
)}

          {/* Nodes */}
          {CHROMA_LABELS.map((_, i) => {
  const p = nodePosition(i, 33);
  const isActive = activeRoot === i;
  const chordColor = currentChordColor || emotion.trailColor;

  return (
    <circle
      key={i}
      cx={p.x}
      cy={p.y}
      r={isActive ? 3.2 : 2.4}
      fill={isActive ? chordColor : "rgba(0,0,0,0.7)"}
      stroke={isActive ? chordColor : "rgba(255,255,255,0.25)"}
      strokeWidth={isActive ? 1 : 0.5}
    />
  );
})}

          {/* Full ring labels (flash) */}
          {showAllLabels &&
            CHROMA_LABELS.map((label, i) => {
              const p = nodePosition(i, 36);
              const { x, y, anchor, baseline } = labelPlacement(i, p);
              return (
                <text
                  key={`all-${i}`}
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  dominantBaseline={baseline}
                  fontSize={4.5}
                  fill="rgba(255,255,255,0.95)"
                  style={{ fontWeight: 500 }}
                >
                  {label}
                </text>
              );
            })}

          {/* Active node label only (during playback) */}
          {showActiveLabels &&
            !showAllLabels &&
            activeRoot != null &&
            activeLabelText && (
              <text
                x={nodePosition(activeRoot, 36).x}
                y={nodePosition(activeRoot, 36).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={6}
                fill="rgba(255,255,255,0.95)"
                style={{ fontWeight: 700 }}
              >
                {activeLabelText}
              </text>
            )}
        </svg>
      </button>
    </div>
  );
}

/* =========================
   Main comparison component (lab)
========================= */

export default function TwoPathsEmotionCompare() {
  const [emotionId, setEmotionId] = useState<EmotionId>("sadness");
  const [flowPlayToken, setFlowPlayToken] = useState(0);
  const [colorPlayToken, setColorPlayToken] = useState(0);

  const [showTrails, setShowTrails] = useState(true);
  const [flash12LabelsEnabled, setFlash12LabelsEnabled] = useState(true);
  const [flashLabelsActive, setFlashLabelsActive] = useState(false);

  const [showIntro, setShowIntro] = useState(false);
  const [showOutro, setShowOutro] = useState(false);
  const [clearTrailsToken, setClearTrailsToken] = useState(0);

  const [isExporting, setIsExporting] = useState(false);

  const active = EMOTIONS.find((e) => e.id === emotionId) ?? EMOTIONS[0];
  // DEBUG: print Flow chord symbols for all emotions
useEffect(() => {
  console.log("=== Flow SYMBOL Check via FlowPreset ===");

  (Object.values(FLOW_PRESETS) as FlowPreset[]).forEach((preset) => {
    // canonical key: minor → C, major → Bb
    const tonicName = preset.mode === "minor" ? "C" : "Bb";
    const tonicPc = pitchNameToPc(tonicName);

    const chordSymbols = buildFlowChordsForKey(tonicPc, preset);

    console.log(
      `[Flow SYMBOLS] ${preset.id} (${tonicName} ${preset.mode}):`,
      chordSymbols.join(" → ")
    );
  });
}, []);
  const copy = EMOTION_COPY[active.id];

  const handleEmotionClick = (id: EmotionId) => {
    // Reset visuals
    setShowIntro(true);
    setShowOutro(false);
    setFlashLabelsActive(false);

    // Update emotion and restart Flow → Color chain
    setEmotionId(id);
    setColorPlayToken(0);            // reset Color
    setFlowPlayToken((t) => t + 1);  // trigger Flow playback
  };

  const handleColorFinished = useCallback(() => {
  // Color finished → hide outro
  setShowOutro(false);

  if (!flash12LabelsEnabled) return;
  setFlashLabelsActive(true);
  window.setTimeout(() => {
    setFlashLabelsActive(false);
    // Clear all trails on both circles
    setClearTrailsToken((t) => t + 1);
  }, 250);
}, [flash12LabelsEnabled]);

    const onDownloadVideo = useCallback(async () => {
    const emotion = active;
    // === Trail color boosts for export (Sadness / Playful / Anger only) ===
let trailColorExport = emotion.trailColor;
let glowColorExport = emotion.glowColor;

switch (emotion.id) {
  case "sadness":
    trailColorExport = "#5FA4FF";   // boosted
    glowColorExport = "#BFDFFF";
    break;
  case "playful":
    trailColorExport = "#FFDA72";
    glowColorExport = "#FFF1B5";
    break;
  case "anger":
    trailColorExport = "#FF9B7B";
    glowColorExport = "#FFD6C7";
    break;
  default:
    break;
}
    const copyLocal = EMOTION_COPY[emotion.id];
    setIsExporting(true);
    
    const totalParts = EMOTIONS.length;
    const emotionIndex = EMOTIONS.findIndex((e) => e.id === emotion.id);
    const partNumber = emotionIndex >= 0 ? emotionIndex + 1 : 1;

    try {
      const ac = getCtxExport();

      const FRAME_W = 1080;
      const FRAME_H = 1920;
      const SCALE = 2;
      const FPS = 30;

      const canvas = document.createElement("canvas");
      canvas.width = FRAME_W * SCALE;
      canvas.height = FRAME_H * SCALE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2D context");
      const c = ctx as CanvasRenderingContext2D;

      const exportDst = ac.createMediaStreamDestination();
      const stream = (canvas as any).captureStream(FPS) as MediaStream;
      const mixed = new MediaStream([
        ...stream.getVideoTracks(),
        ...exportDst.stream.getAudioTracks(),
      ]);
      const mimeType = pickRecorderMime();
      const chunks: BlobPart[] = [];
      const rec = new MediaRecorder(mixed, { mimeType });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      // ===== Build Flow + Color schedules =====
      const baseStepSec = 0.9;
      const tempoMult = emotion.tempo || 1.0;
      const stepSec = baseStepSec / tempoMult;

      const flowDegTokens = parseDegreeProgression(emotion.flowDegrees);
      const flowCount = flowDegTokens.length;

      const colorChordNames = emotion.colorChords.trim()
        ? emotion.colorChords.trim().split(/\s+/).filter(Boolean)
        : [];
      const colorCount = colorChordNames.length;

      const flowSchedule: { startSec: number; idx: number }[] = [];
      let accSec = 0;
      for (let i = 0; i < flowCount; i++) {
        flowSchedule.push({ startSec: accSec, idx: i });
        accSec += stepSec;
      }

      const flowTotalSec = accSec;

      const colorSchedule: { startSec: number; idx: number }[] = [];
      for (let i = 0; i < colorCount; i++) {
        colorSchedule.push({ startSec: flowTotalSec + i * stepSec, idx: i });
      }
      const colorTotalSec = colorCount * stepSec;

      const totalSec = flowTotalSec + colorTotalSec;

      // ===== Precompute export harmony helpers =====
      const modeFlow: Mode = emotion.flowKey === "B♭ Major" ? "major" : "minor";
      const flowNodeIndicesExport = flowDegTokens.map((tok) =>
  nodeIndexForToken(tok, modeFlow)
);

const flowAnglesExport = flowNodeIndicesExport.map(
  (ni) => (ni / 12) * Math.PI * 2 - Math.PI / 2
);

const flowDegreesExport = flowDegTokens.map((t) => t.base);

const borrowCountExport = FLOW_BORROW_COUNT[emotion.id] ?? 0;
// NOTE: angles increase CCW in trig; use -1 for clockwise
const flowDirExport: 1 | -1 = modeFlow === "minor" ? 1 : -1;

const flowSpiralPathDsExport = flowNodeIndicesExport.map((_, i) => {
  const nodesPart = flowNodeIndicesExport.slice(0, i + 1);
  return buildAlignedSpiralPath({
    nodeIndices: nodesPart,
    dir: flowDirExport,
    borrowCount: borrowCountExport,
    stepsPerTurn: 42,
    ringR: 36,
    overshootPct: 0.10,
  }).pathD;
});

const flowSpiralFinalPathDExport =
  flowSpiralPathDsExport[flowSpiralPathDsExport.length - 1] ?? "";
      const colorChordsExport = parseProgression(emotion.colorChords);
      const colorVoicedNotesExport = buildVoicedNoteNamesForProgression(colorChordsExport, {
  baseOctave: 4,
  minMidi: 48,
  maxMidi: 76,
});
      // Build FlowPreset-based chords for export (same engine as live)
const flowPresetExport = FLOW_PRESETS[emotion.id as EmotionId];
const tonicNameFlowExport =
  flowPresetExport.mode === "minor" ? "C" : "Bb";
const tonicPcFlowExport = pitchNameToPc(tonicNameFlowExport);

// chord symbols from FlowPreset engine (what live uses)
const flowChordNamesExport = buildFlowChordsForKey(
  tonicPcFlowExport,
  flowPresetExport
);

const flowParsedExport = parseProgression(flowChordNamesExport.join(" "));
const flowVoicedNotesExport = buildVoicedNoteNamesForProgression(flowParsedExport, {
  baseOctave: 4,
  minMidi: 48,
  maxMidi: 76,
});
// 🔍 DEBUG — Flow export chords: expected (FlowPreset) vs actual (triadMidiForToken)
const flowPresetForExport = FLOW_PRESETS[emotion.id as EmotionId];
const tonicNameFlow = flowPresetForExport.mode === "minor" ? "C" : "Bb";
const tonicPcFlow = pitchNameToPc(tonicNameFlow);

// Expected chords from FlowPreset engine (what live uses)
const expectedFlowChordsExport = buildFlowChordsForKey(
  tonicPcFlow,
  flowPresetForExport
);

// ===== Flow export debug (voiced notes, not triads) =====

// Expected chord symbols (FlowPreset engine — harmonic intent)
console.log(
  `%c[Flow EXPORT EXPECTED] ${emotion.id} (${tonicNameFlow} ${flowPresetForExport.mode}):`,
  "color:#FBBF24;font-weight:bold",
  expectedFlowChordsExport.join(" → ")
);

// Actual voiced notes used for export audio (octave-qualified)
console.log(
  `%c[Flow EXPORT VOICED NOTES] ${emotion.id}:`,
  "color:#F97316;font-weight:bold",
  flowVoicedNotesExport
    .map((notes, i) => `${i + 1}: ${notes.join(", ")}`)
    .join(" | ")
);
      // ===== Schedule audio =====
      const t0 = ac.currentTime + 0.4;

      // Flow audio (using FlowPreset engine, same as live)
for (const { startSec, idx } of flowSchedule) {
  const notes = flowVoicedNotesExport[idx] ?? [];
  const at = t0 + startSec;
  for (const name of notes) {
    loadBufferExport(name)
      .then((buf) => {
        const src = ac.createBufferSource();
        src.buffer = buf;
        const g = ac.createGain();
        g.gain.setValueAtTime(1, at);
        g.gain.setTargetAtTime(0, at + 0.8, 0.2);
        src.connect(g);
        g.connect(exportDst);
        g.connect(ac.destination);
        try {
          src.start(at);
          src.stop(at + 1.5);
        } catch {}
      })
      .catch(() => {});
  }
}

      

      // 🔍 DEBUG — Print the Color chords used in export
console.log(
  `%c[Color EXPORT DEBUG] ${emotion.id}:`,
  "color:#ff8cf7; font-weight:bold",
  colorChordNames.join(" → ")
);

      for (const { startSec, idx } of colorSchedule) {
        const notes = colorVoicedNotesExport[idx] ?? [];
        const at = t0 + startSec;
        for (const name of notes) {
          loadBufferExport(name)
            .then((buf) => {
              const src = ac.createBufferSource();
              src.buffer = buf;
              const g = ac.createGain();
              g.gain.setValueAtTime(1, at);
              g.gain.setTargetAtTime(0, at + 0.8, 0.2);
              src.connect(g);
              g.connect(exportDst);
              g.connect(ac.destination);
              try {
                src.start(at);
                src.stop(at + 1.5);
              } catch {}
            })
            .catch(() => {});
        }
      }

      // ===== Start recording =====
      rec.start();
      const recordStart = performance.now();

      function renderFrame() {
        const elapsed = (performance.now() - recordStart) / 1000;

        // === Glow / pulse envelope for chord amplitude ===
// local time inside chord (0 → 1)
const chordDurMs = stepSec * 1000;
const chordPhase = ((elapsed * 1000) % chordDurMs) / chordDurMs;

// Shape of glow: strong attack (0–0.2), smooth decay (0.8–1)
let glow = 0;
if (chordPhase < 0.20) {
  // attack boost
  glow = 1.0 - chordPhase * 2.5;  // strong at attack
} else {
  // exponential decay
  const decayT = (chordPhase - 0.20) / 0.80;  
  glow = Math.pow(1.0 - decayT, 1.6);
}

// Scale final brightness
const glowStrength = glow * 0.60; // 0.6 is strong but tasteful

// === Parallax disabled ===
const driftX = 0;
const driftY = 0;
const driftY_color = 0;

       // === OPTION C: Light background + subtle emotion border ===

// Reset transform
c.setTransform(1, 0, 0, 1, 0, 0);

// 1) Background (milky, clean, high CTR)
const BG_LIGHT = "#fdfcf8";  // define it BEFORE using it
c.fillStyle = BG_LIGHT;
c.fillRect(0, 0, FRAME_W * SCALE, FRAME_H * SCALE);

// 2) Subtle vignette (very soft, keeps attention centered)
const vignette = c.createRadialGradient(
  (FRAME_W * SCALE) / 2,
  (FRAME_H * SCALE) / 2,
  FRAME_W * SCALE * 0.35,
  (FRAME_W * SCALE) / 2,
  (FRAME_H * SCALE) / 2,
  FRAME_W * SCALE * 0.65
);
vignette.addColorStop(0, "rgba(0,0,0,0)");
vignette.addColorStop(1, "rgba(0,0,0,0.04)");
c.fillStyle = vignette;
c.fillRect(0, 0, FRAME_W * SCALE, FRAME_H * SCALE);

// 3) Emotion border (Inset, subtle, premium)
c.save();

// How far inside from the canvas edge
const BORDER_INSET = 20 * SCALE;     // move border 20px inward (at SCALE=2 → 40px)
const BORDER_WIDTH = 8 * SCALE;      // border thickness
const BORDER_COLOR = emotion.trailColor;

// Soft alpha (adjust 0.25–0.45 depending on taste)
c.globalAlpha = 0.30;

c.strokeStyle = BORDER_COLOR;
c.lineWidth = BORDER_WIDTH;

// Draw inset border
c.strokeRect(
  BORDER_INSET + BORDER_WIDTH / 2,
  BORDER_INSET + BORDER_WIDTH / 2,
  FRAME_W * SCALE - 2 * BORDER_INSET - BORDER_WIDTH,
  FRAME_H * SCALE - 2 * BORDER_INSET - BORDER_WIDTH
);

c.restore();

        // === Determine phases ===
        const flowActive = elapsed >= 0 && elapsed < flowTotalSec + stepSec * 0.2;
        const colorActive =
          elapsed >= flowTotalSec && elapsed < totalSec + stepSec * 0.2;

        // === Determine active indices ===
        let flowIdx = -1;
        for (let i = 0; i < flowSchedule.length; i++) {
          const { startSec } = flowSchedule[i];
          const next = flowSchedule[i + 1]?.startSec ?? flowTotalSec + 999;
          if (elapsed >= startSec && elapsed < next) {
            flowIdx = flowSchedule[i].idx;
            break;
          }
          if (elapsed >= flowTotalSec && flowSchedule.length > 0) {
            flowIdx = flowSchedule[flowSchedule.length - 1].idx;
          }
        }

        let colorIdx = -1;
        for (let i = 0; i < colorSchedule.length; i++) {
          const { startSec } = colorSchedule[i];
          const next =
            colorSchedule[i + 1]?.startSec ??
            flowTotalSec + colorTotalSec + 999;
          if (elapsed >= startSec && elapsed < next) {
            colorIdx = colorSchedule[i].idx;
            break;
          }
          if (elapsed >= flowTotalSec + colorTotalSec && colorSchedule.length > 0) {
            colorIdx = colorSchedule[colorSchedule.length - 1].idx;
          }
        }

        // === TOP TEXT: Intro during Flow, Outro during Color ===
        c.save();
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#1B2430";
        c.font = `${60 * SCALE}px system-ui, -apple-system, sans-serif`;

        const topY = FRAME_H * SCALE * 0.12;

        if (flowActive) {
          c.fillText(
            copyLocal.introLine1,
            (FRAME_W * SCALE) / 2,
            topY - 22 * SCALE
          );
          c.fillText(
            copyLocal.introLine2,
            (FRAME_W * SCALE) / 2,
            topY + 18 * SCALE
          );
        } else if (colorActive) {
          c.fillText(
            copyLocal.outroLine1,
            (FRAME_W * SCALE) / 2,
            topY - 22 * SCALE
          );
          if (copyLocal.outroLine2) {
            c.fillText(
              copyLocal.outroLine2,
              (FRAME_W * SCALE) / 2,
              topY + 18 * SCALE
            );
          }
        }
        c.restore();
       
       // === Layout for circles (scaled x1.15) ===
const CARD_SCALE = 1.15;

const flowCenterX = (FRAME_W * SCALE) / 2 + driftX;
const colorCenterX = flowCenterX; // same horizontal sway

// Centers, shifted slightly down to avoid overlapping intro/outro text
const flowCenterY =
  FRAME_H * SCALE * 0.36 + 20 * SCALE + driftY;

const colorCenterY =
  FRAME_H * SCALE * 0.72 + 20 * SCALE + driftY_color;

const RING_CO_RADIUS = 36;
const targetRadiusPx = FRAME_W * SCALE * 0.22 * CARD_SCALE;
const SCALE_LIVE = targetRadiusPx / RING_CO_RADIUS;

        const radiusBase = 1.8;
        const pulseIntensity = 50;
        const pulseFactor = 0.8 + (pulseIntensity / 100) * 0.8;
        const activeRadius = radiusBase * pulseFactor;

        // === FLOW circle ===
        c.save();
        c.setTransform(
          SCALE_LIVE,
          0,
          0,
          SCALE_LIVE,
          flowCenterX - SCALE_LIVE * 50,
          flowCenterY - SCALE_LIVE * 50
        );

        // Circle background gradient (only inside the circle)
const flowBgGrad = c.createRadialGradient(35, 25, 5, 50, 50, 40);
flowBgGrad.addColorStop(0, emotion.gradientTop);
flowBgGrad.addColorStop(1, emotion.gradientBottom);

// Fill only the circular area, not the whole 100×100 square
c.beginPath();
c.arc(50, 50, 36, 0, Math.PI * 2);
c.fillStyle = flowBgGrad;
c.fill();

        // ring
        c.strokeStyle = "rgba(0,0,0,0.35)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(50, 50, 36, 0, Math.PI * 2);
        c.stroke();

        /// Flow spiral (final) — keep visible during BOTH Flow and Color for SN "filled" look
// Flow spiral: unfold chord-by-chord during Flow, then hold final spiral during Color
{
  const isFlowPhase = elapsed < flowTotalSec + stepSec * 0.2;

  let pathD = "";
  if (isFlowPhase) {
    // choose partial spiral based on current flowIdx
    if (flowIdx >= 0 && flowIdx < flowSpiralPathDsExport.length) {
      pathD = flowSpiralPathDsExport[flowIdx] ?? "";
    } else if (flowSpiralFinalPathDExport) {
      pathD = flowSpiralFinalPathDExport;
    }
  } else {
    // during Color: keep final spiral visible (filled circle)
    pathD = flowSpiralFinalPathDExport;
  }

  if (pathD) {
    const spiralPath = new Path2D(pathD.replace(/,/g, " "));

    // No whole-spiral pulsing; keep it stable.
    const alpha = isFlowPhase ? 0.85 : 0.85;

    // main stroke
    c.strokeStyle = trailColorExport;
    c.lineWidth = 1.4;
    c.globalAlpha = alpha;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.stroke(spiralPath);

    // glow (subtle, stable)
    c.strokeStyle = trailColorExport;
    c.lineWidth = 3.4;
    c.globalAlpha = alpha * 0.18;
    c.stroke(spiralPath);

    c.globalAlpha = 1;
  }
}

        // nodes
        const activeFlowNodeIndex =
          flowIdx >= 0 && flowIdx < flowDegTokens.length
            ? nodeIndexForToken(flowDegTokens[flowIdx], modeFlow)
            : -1;

        for (let i = 0; i < FLOW_CIRCLE_LABELS.length; i++) {
  const p = nodePosition(i, 33);
  const isActive = i === activeFlowNodeIndex;

  // glow only on active node
  if (isActive) {
    c.shadowBlur = 18 * SCALE * glowStrength;
    c.shadowColor =  glowColorExport;
  } else {
    c.shadowBlur = 0;
    c.shadowColor = "transparent";
  }

  c.beginPath();
  c.arc(p.x, p.y, isActive ? activeRadius : radiusBase, 0, Math.PI * 2);
c.fillStyle = isActive ? trailColorExport : "rgba(0,0,0,0.7)";  c.fill();
}

        c.restore();

        // Flow text label & progression (smaller)
c.save();
c.textAlign = "center";
c.textBaseline = "bottom";

const flowLabelY = flowCenterY - targetRadiusPx - 18 * SCALE;

// Label: dark, bold, highly readable
c.font = `bold ${32 * SCALE}px system-ui, -apple-system, sans-serif`;
c.fillStyle = "#1B2430"; // same family as Intro/Outro
c.fillText(copyLocal.flowLabel, flowCenterX, flowLabelY);

// Flow progression (chords only, smaller & slightly softer)
c.font = `${26 * SCALE}px system-ui, -apple-system, sans-serif`;
c.fillStyle = "#4B5563"; // softer dark gray
c.fillText(
  emotion.flowExample,
  flowCenterX,
  flowCenterY + targetRadiusPx + 32 * SCALE
);
c.restore();

        // === COLOR circle ===
        c.save();
        c.setTransform(
          SCALE_LIVE,
          0,
          0,
          SCALE_LIVE,
          colorCenterX - SCALE_LIVE * 50,
          colorCenterY - SCALE_LIVE * 50
        );

        // Circle background gradient (only inside the circle)
const colorBgGrad = c.createRadialGradient(35, 25, 5, 50, 50, 40);
colorBgGrad.addColorStop(0, emotion.gradientTop);
colorBgGrad.addColorStop(1, emotion.gradientBottom);

// Fill only the circular area
c.beginPath();
c.arc(50, 50, 36, 0, Math.PI * 2);
c.fillStyle = colorBgGrad;
c.fill();

        // ring
        c.strokeStyle = "rgba(0,0,0,0.35)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(50, 50, 36, 0, Math.PI * 2);
        c.stroke();

        // Single chord-shape trail (current chord only — no accumulation)
if (colorIdx >= 0 && colorIdx < colorChordsExport.length) {
  const chord = colorChordsExport[colorIdx];
  if (chord && chord.pcs && chord.pcs.length) {
    const d = pathFromPcs(chord.pcs);
    if (d) {
      const chordName = colorChordNames[colorIdx];
      const highlight =
        getChordHighlightColor(emotion.id, chordName) || trailColorExport;

      const path = new Path2D(d.replace(/,/g, " "));
      c.strokeStyle = highlight;
      c.fillStyle = highlight + "33";
      c.lineWidth = 1.2;
      c.globalAlpha = 0.95;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.fill(path);
      c.stroke(path);
      c.globalAlpha = 1;
    }
  }
}

        // nodes
        let activeColorRootIdx = -1;
        if (colorIdx >= 0 && colorIdx < colorChordsExport.length) {
          const chord = colorChordsExport[colorIdx];
          activeColorRootIdx = chord?.root ?? -1;
        }

        for (let i = 0; i < CHROMA_LABELS.length; i++) {
          const p = nodePosition(i, 33);
         const isActive = i === activeColorRootIdx;
let nodeColor = emotion.trailColor;

// chromatic highlight override
if (isActive && colorIdx >= 0) {
  const chordName = colorChordNames[colorIdx] ?? "";
  const highlight = getChordHighlightColor(emotion.id, chordName);
  if (highlight) nodeColor = highlight;
}

if (isActive) {
  c.shadowBlur = 18 * SCALE * glowStrength;
  c.shadowColor = nodeColor;
} else {
  c.shadowBlur = 0;
  c.shadowColor = "transparent";
}

c.beginPath();
c.arc(p.x, p.y, isActive ? activeRadius : radiusBase, 0, Math.PI * 2);
c.fillStyle = isActive ? nodeColor : "rgba(0,0,0,0.7)";
c.fill();
        }

        c.restore();

        // Color text label & progression (smaller)
c.save();
c.textAlign = "center";
c.textBaseline = "bottom";

const colorLabelY = colorCenterY - targetRadiusPx - 18 * SCALE;

// Label: dark, bold, highly readable
c.font = `bold ${32 * SCALE}px system-ui, -apple-system, sans-serif`;
c.fillStyle = "#1B2430";
c.fillText(copyLocal.colorLabel, colorCenterX, colorLabelY);

// Color progression (chords only, smaller & softer)
c.font = `${26 * SCALE}px system-ui, -apple-system, sans-serif`;
c.fillStyle = "#4B5563";
const colorProgText = emotion.colorChords.replace(/ /g, " → ");
c.fillText(
  colorProgText,
  colorCenterX,
  colorCenterY + targetRadiusPx + 32 * SCALE
);
c.restore();

// === Series stamp: Part X/10 + Emotion name (bottom) ===
// Only show during Color phase
/* if (colorActive) {
  // === Series stamp: "2/10 Emotion" + "Two Paths of Harmony" (bottom) ===
c.save();
c.textBaseline = "top";

const line1Text = `Part ${partNumber} / ${totalParts} - ${emotion.label}`;
const line2Text = "Two Paths of Harmony";

// Use your current vertical placement (you said +35 looks good)
const seriesY =
  colorCenterY + targetRadiusPx + 32 * SCALE + 32 * SCALE + 35 * SCALE;

// Fonts
const line1FontSize = 28 * SCALE;
const line2FontSize = 26 * SCALE;

// Measure widths to center the block while left-aligning both lines
c.font = `bold ${line1FontSize}px system-ui, -apple-system, sans-serif`;
const line1Width = c.measureText(line1Text).width;

c.font = `${line2FontSize}px system-ui, -apple-system, sans-serif`;
const line2Width = c.measureText(line2Text).width;

// Left edge of two-circles card:
const cardLeftX = flowCenterX - SCALE_LIVE * 50;
const startX = cardLeftX;  // align stamp with card's left edge

c.textAlign = "left";

// Line 1: "2/10 Magic"
c.font = `bold ${line1FontSize}px system-ui, -apple-system, sans-serif`;
c.fillStyle = "rgba(230,235,242,0.95)";
c.fillText(line1Text, startX, seriesY);

// Line 2: "Two Paths of Harmony"
c.font = `${line2FontSize}px system-ui, -apple-system, sans-serif`;
c.fillStyle = "rgba(230,235,242,0.9)";
c.fillText(line2Text, startX, seriesY + 30 * SCALE);

c.restore();
}
*/

        if (elapsed < totalSec + 0.5) {
          requestAnimationFrame(renderFrame);
        } else {
          rec.stop();
        }
      }

      renderFrame();

      const recorded: Blob = await new Promise((res) => {
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType || "video/webm" });
          res(blob);
        };
      });

      const outBlob = await convertToMp4Server(recorded);
      const safeName = `two-paths-${emotion.id}`.toLowerCase();

      const a = document.createElement("a");
      a.download = `${safeName}.mp4`;
      a.href = URL.createObjectURL(outBlob);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("[two-paths export] error", err);
      try {
        alert("Could not prepare video. Please try again.");
      } catch {}
    } finally {
      setIsExporting(false);
    }
  }, [active]);

  return (
    <div className="two-paths-compare">
      <style jsx>{`
        .two-paths-compare {
          margin-top: 10px;
        }
        .two-paths-compare-card {
          border-radius: 14px;
          padding: 12px 10px;
          background: #fffdf5;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .two-paths-compare-header {
          margin-bottom: 10px;
          text-align: center;
        }
        .two-paths-compare-title {
          font-size: 18px;
          font-weight: 800;
          line-height: 1.25;
          min-height: 36px; /* keep height stable (no bouncing) */
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .two-paths-circle-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }

        .two-paths-circle-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .two-paths-circle-label {
          font-size: 13px;
          font-weight: 700;
        }
        .two-paths-circle-meta {
          font-size: 10px;
          color: #444;
          line-height: 1.5;
          text-align: center;
          max-width: 260px;
        }

        .two-paths-compare-divider {
          border: none;
          border-top: 1px dashed rgba(0, 0, 0, 0.08);
          margin: 4px 0 0;
          width: 80%;
        }

        .two-paths-emotion-bar {
          margin-top: 10px;
        }
        .two-paths-emotion-label {
          font-size: 12px;
          margin-bottom: 4px;
          color: #444;
        }
        .two-paths-emotion-scroll {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .two-paths-emotion-scroll::-webkit-scrollbar {
          display: none;
        }
        .two-paths-emotion-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #f7f7f7;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }
        .two-paths-emotion-pill span.emoji {
          font-size: 14px;
        }
        .two-paths-emotion-pill.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .two-paths-toggles {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12px;
          color: #444;
          align-items: center;
        }
        .two-paths-toggle-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: #f7f7f7;
          cursor: pointer;
        }
        .two-paths-toggle-chip input {
          margin: 0;
        }
      `}</style>

      <div className="two-paths-compare-card">
        <div className="two-paths-compare-header">
          <div className="two-paths-compare-title">
            {showIntro ? (
              <>
                <div>{copy.introLine1}</div>
                <div>{copy.introLine2}</div>
              </>
            ) : showOutro ? (
  <>
    <div>{copy.outroLine1}</div>
    <div>{copy.outroLine2}</div>
  </>
) : null}
          </div>
        </div>

        <div className="two-paths-circle-wrapper">
          {/* Flow circle (top) */}
          <div className="two-paths-circle-block">
            <div className="two-paths-circle-label">{copy.flowLabel}</div>
            <FlowCircle
              emotion={active}
              playToken={flowPlayToken}
              onFinished={() => {
                // Flow done → hide intro, show outro, start Color
                setShowIntro(false);
                setShowOutro(true);
                setColorPlayToken((t) => t + 1);
              }}
              showTrails={showTrails}
              showActiveLabels={false}
              showAllLabels={flashLabelsActive}
              clearTrailsToken={clearTrailsToken}
            />
            <div className="two-paths-circle-meta">
              
              <div>
                Play: <code>{active.flowExample}</code>
              </div>
            </div>
          </div>

          <hr className="two-paths-compare-divider" />

          {/* Color circle (bottom) */}
          <div className="two-paths-circle-block">
            <div className="two-paths-circle-label">{copy.colorLabel}</div>
            <ColorCircle
  emotion={active}
  playToken={colorPlayToken}
  showTrails={showTrails}
  showActiveLabels={false}
  showAllLabels={flashLabelsActive}
  onFinished={handleColorFinished}
  clearTrailsToken={clearTrailsToken}
/>
            <div className="two-paths-circle-meta">
              
              <div>
                Play:{" "}
                <code>{active.colorChords.replace(/ /g, " → ")}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion bar (bottom) */}
      <div className="two-paths-emotion-bar">
        <div className="two-paths-emotion-label">
          <strong>Tap an emotion to hear Flow, then Color</strong>
        </div>
        <div className="two-paths-emotion-scroll">
          {EMOTIONS.map((e) => {
            const activeClass =
              e.id === active.id
                ? "two-paths-emotion-pill active"
                : "two-paths-emotion-pill";
            return (
              <button
                key={e.id}
                type="button"
                className={activeClass}
                onClick={() => handleEmotionClick(e.id)}
              >
                <span className="emoji">{e.emoji}</span>
                <span>{e.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
  onClick={onDownloadVideo}
  disabled={isExporting}
  style={{
    marginTop: 12,
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    background: isExporting ? "#444" : "#111",
    color: "#fff",
    cursor: isExporting ? "default" : "pointer",
  }}
>
  {isExporting ? "Preparing clip…" : "Download MP4 (SN)"}
</button>

      {/* Lab toggles */}
      <div className="two-paths-toggles">
        <label className="two-paths-toggle-chip">
          <input
            type="checkbox"
            checked={showTrails}
            onChange={(e) => setShowTrails(e.target.checked)}
          />
          <span>Show trails (web & chord shapes)</span>
        </label>
        <label className="two-paths-toggle-chip">
          <input
            type="checkbox"
            checked={flash12LabelsEnabled}
            onChange={(e) => setFlash12LabelsEnabled(e.target.checked)}
          />
          <span>Flash all 12 labels at end</span>
        </label>
      </div>
    </div>
  );
}