// app/b2/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions, { type EmotionPalette } from "@/components/KeyboardEmotions";

// If you keep the schema in another file, replace this constant import accordingly.
// For now this page assumes the schema object below is available in this file scope.
// You can move it to /lib or /components/books later if you want.

const HYPNOTIC_COMPANION_SCHEMA_V1_1 = {
  schemaVersion: "1.1",
  global: {
    keyboardRange: "C2–C6",
    suggestedBpmRange: [70, 90],
    countingModel: {
      units: ["passes", "attacks", "bars"] as const,
      definitions: {
        pass: "One full execution of the LH engine pattern (BMT=3 notes, BMTM=4 notes).",
        attacks: "Single alternating hits (used by BT rocking).",
        bar: "Musical bar used for break/restore ritual timing.",
      },
    },
    breakPattern: {
      type: "strong",
      durationBars: 1,
      instruction:
        "For exactly one bar, both hands go dense (double subdivision 8ths→16ths OR fast arpeggio attacks in both hands).",
    },
    restorePattern: {
      durationBars: 2,
      instruction:
        "LH only on the platform cell for exactly two bars, even, no accents, no tempo change. RH silent (or single held tone only).",
    },
    rhModes: [
      { id: "hold", name: "Hold", description: "One RH tone held per bar (or per full cell)." },
      { id: "touch", name: "Touch", description: "One RH tone touched once per bar/cell, then hold/silence." },
      { id: "pulse", name: "Pulse", description: "Repeat the same RH tone in 8ths along with LH (single-tone only)." },
    ] as const,
    companionModes: [
      {
        id: "enter",
        name: "Enter",
        contract: [
          "LH-only Entry: play first 2 cells using Demo counts",
          "RH Layer: replay same 2 cells with RH Layer 2 (Hold mode)",
          "LH-only Re-center: platform cell for 2 bars",
          "STOP",
        ],
      },
      {
        id: "variations",
        name: "Variations",
        contract: [
          "Select ONE variation (never autoplay multiple)",
          "LH-only entry: first 2 cells (Demo)",
          "Play ONE full cycle with that variation's RH behavior",
          "LH-only re-center: platform cell for 2 bars",
          "STOP",
        ],
      },
      {
        id: "break_restore",
        name: "Break + Restore",
        contract: [
          "LH-only entry: first 2 cells (Demo)",
          "RH layer: 1 cell (Hold mode) to confirm state",
          "STRONG BREAK: 1 bar (global strong break definition)",
          "RESTORE: platform cell LH-only for 2 bars (global restore definition)",
          "STOP",
        ],
      },
      {
        id: "transitions",
        name: "Transitions",
        contract: [
          "Select ONE destination transition",
          "Play the bridge (exact notes specified)",
          "Play destination platform cell LH-only for 2 bars",
          "Optionally: play destination first 1–2 cells LH-only (Demo)",
          "STOP",
        ],
      },
    ] as const,
  },

  progressions: [
    {
      id: "cycling_descent",
      name: "Cycling Descent",
      lhEngine: { type: "BMT", notesPerPass: 3, pattern: ["B", "M", "T"] as const },
      platformCellId: "DFA",
      demoPreset: { entryCounts: { DFA: 2, CEA: 2 } },
      practiceCycle: [
        { cellId: "DFA", notes: ["D", "F", "A"], count: 4, countUnit: "passes" },
        { cellId: "CEA", notes: ["C", "E", "A"], count: 4, countUnit: "passes" },
        { cellId: "A#DF", notes: ["A#", "D", "F"], displayNotes: ["Bb", "D", "F"], count: 4, countUnit: "passes" },
        { cellId: "ACF", notes: ["A", "C", "F"], count: 4, countUnit: "passes" },
        { cellId: "ACE", notes: ["A", "C", "E"], count: 2, countUnit: "passes" },
        { cellId: "AC#E", notes: ["A", "C#", "E"], count: 8, countUnit: "passes" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH becomes automatic. RH is lighting, not melody.",
        allowedModes: ["hold", "touch"] as const,
        signature: {
          onlyOnCellId: "AC#E",
          description: "Lock shimmer (forward/back): A→A#→C#→D then D→C#→A#→A (light).",
        },
      },
      transitions: [
        {
          toId: "gravity_halo",
          label: "to Gravity Halo",
          bridge: [{ engine: "BMTM", notes: ["A", "E", "A"], count: 2, countUnit: "bars" }],
          destinationPlatformCellId: "AEA",
          destinationEntryCells: ["AEA", "GDG"],
        },
        {
          toId: "tritone_latch",
          label: "to Tritone Latch",
          bridge: [{ engine: "BMT", notes: ["C", "D#", "G"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "bite",
          destinationEntryCells: ["bite", "answer"],
        },
      ],
    },
    {
      id: "gravity_halo",
      name: "Gravity Halo",
      lhEngine: { type: "BMTM", notesPerPass: 4, pattern: ["B", "M", "T", "M"] as const },
      platformCellId: "AEA",
      demoPreset: { entryCounts: { AEA: 2, GDG: 2 } },
      practiceCycle: [
        { cellId: "AEA", notes: ["A", "E", "A"], count: 4, countUnit: "passes" },
        { cellId: "GDG", notes: ["G", "D", "G"], count: 4, countUnit: "passes" },
        { cellId: "FCF", notes: ["F", "C", "F"], count: 4, countUnit: "passes" },
        { cellId: "EBE", notes: ["E", "B", "E"], count: 4, countUnit: "passes" },
        { cellId: "BFB", notes: ["B", "F", "B"], count: 2, countUnit: "passes", optional: true },
        { cellId: "AEA_return", notes: ["A", "E", "A"], count: 2, countUnit: "passes" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH is automatic. RH is a halo layer.",
        allowedModes: ["hold", "pulse"] as const,
        palette: { id: "DEAB", notes: ["D", "E", "A", "B"], description: "Locked palette; variants DE/AB or AB/DE." },
      },
      transitions: [
        {
          toId: "cycling_descent",
          label: "to Cycling Descent",
          bridge: [{ engine: "BMT", notes: ["D", "F", "A"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "DFA",
          destinationEntryCells: ["DFA", "CEA"],
        },
        {
          toId: "held_return",
          label: "to Held Return",
          bridge: [{ engine: "BMTM", notes: ["A", "C", "E"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "ACE_platform",
          destinationEntryCells: ["ADF", "ACF"],
        },
      ],
    },
    {
      id: "tritone_latch",
      name: "Tritone Latch",
      lhEngine: { type: "BMT", notesPerPass: 3, pattern: ["B", "M", "T"] as const },
      platformCellId: "bite",
      demoPreset: { entryCounts: { bite: 2, answer: 2 } },
      structure: { kind: "pair_repeat_then_tag", pairRepeatCount: 4 },
      practiceCycle: [
        { cellId: "bite", notes: ["C", "D#", "G"], count: 4, countUnit: "passes" },
        { cellId: "answer", notes: ["D", "G", "A#"], count: 4, countUnit: "passes" },
        { cellId: "tag", notes: ["D", "F", "A#"], count: 4, countUnit: "passes" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH is automatic. RH must not explain chords; it’s shimmer.",
        allowedModes: ["hold", "pulse"] as const,
        palettes: [
          { id: "DD#G", notes: ["D", "D#", "G"] },
          { id: "AA#D", notes: ["A", "A#", "D"] },
        ],
      },
      transitions: [
        {
          toId: "rocking_pressure",
          label: "to Rocking Pressure",
          bridge: [{ engine: "BT", notes: ["D#", "G"], count: 8, countUnit: "attacks" }],
          destinationPlatformCellId: "CG",
          destinationEntryCells: ["CG", "DG"],
        },
        {
          toId: "cycling_descent",
          label: "to Cycling Descent",
          bridge: [{ engine: "BMT", notes: ["D", "F", "A"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "DFA",
          destinationEntryCells: ["DFA", "CEA"],
        },
      ],
    },
    {
      id: "rocking_pressure",
      name: "Rocking Pressure",
      lhEngine: { type: "BT", notesPerPass: 2, pattern: ["B", "T"] as const },
      platformCellId: "CG",
      demoPreset: { entryCounts: { CG: 8, DG: 8 }, entryCountUnit: "attacks" },
      practiceCycle: [
        { cellId: "CG", notes: ["C", "G"], count: 8, countUnit: "attacks" },
        { cellId: "DG", notes: ["D", "G"], count: 8, countUnit: "attacks" },
        { cellId: "D#G_bite", notes: ["D#", "G"], count: 8, countUnit: "attacks" },
        { cellId: "DG_return", notes: ["D", "G"], count: 8, countUnit: "attacks" },
        { cellId: "CG_return", notes: ["C", "G"], count: 8, countUnit: "attacks" },
        { cellId: "A#G", notes: ["A#", "G"], displayNotes: ["Bb", "G"], count: 8, countUnit: "attacks" },
        { cellId: "G#G", notes: ["G#", "G"], displayNotes: ["Ab", "G"], count: 8, countUnit: "attacks" },
        { cellId: "GG_lock", notes: ["G", "G"], count: 8, countUnit: "attacks" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH is automatic. RH is single-tone lighting.",
        allowedModes: ["hold", "pulse"] as const,
        palette: { id: "CDD#G", notes: ["C", "D", "D#", "G"] },
      },
      transitions: [
        {
          toId: "tritone_latch",
          label: "to Tritone Latch",
          bridge: [{ engine: "BMT", notes: ["C", "D#", "G"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "bite",
          destinationEntryCells: ["bite", "answer"],
        },
        {
          toId: "gravity_halo",
          label: "to Gravity Halo",
          bridge: [{ engine: "BMTM", notes: ["A", "E", "A"], count: 2, countUnit: "bars" }],
          destinationPlatformCellId: "AEA",
          destinationEntryCells: ["AEA", "GDG"],
        },
      ],
    },
    {
      id: "held_horizon",
      name: "Held Horizon",
      lhEngine: { type: "BMTM", notesPerPass: 4, pattern: ["B", "M", "T", "M"] as const },
      platformCellId: "AEA_platform",
      demoPreset: { entryCounts: { CEG: 1, BEG: 1 } },
      practiceCycle: [
        { cellId: "CEG", notes: ["C", "E", "G"], count: 2, countUnit: "passes" },
        { cellId: "BEG", notes: ["B", "E", "G"], count: 2, countUnit: "passes" },
        { cellId: "AEA_platform", notes: ["A", "E", "A"], count: 4, countUnit: "passes" },
        { cellId: "A#EA", notes: ["A#", "E", "A"], displayNotes: ["Bb", "E", "A"], count: 2, countUnit: "passes" },
        { cellId: "AEG", notes: ["A", "E", "G"], count: 2, countUnit: "passes" },
        { cellId: "GEG", notes: ["G", "E", "G"], count: 2, countUnit: "passes" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH is automatic. Use E as the thread.",
        allowedModes: ["hold", "touch"] as const,
        palette: { id: "thread_E", notes: ["E"] },
      },
      transitions: [
        {
          toId: "held_return",
          label: "to Held Return",
          bridge: [{ engine: "BMTM", notes: ["A", "C", "E"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "ACE_platform",
          destinationEntryCells: ["ADF", "ACF"],
        },
        {
          toId: "cycling_descent",
          label: "to Cycling Descent",
          bridge: [{ engine: "BMT", notes: ["D", "F", "A"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "DFA",
          destinationEntryCells: ["DFA", "CEA"],
        },
      ],
    },
    {
      id: "anchored_drift",
      name: "Anchored Drift",
      lhEngine: { type: "BMTM", notesPerPass: 4, pattern: ["B", "M", "T", "M"] as const },
      platformCellId: "DFA",
      demoPreset: { entryCounts: { DFA: 1, DEA: 1 } },
      practiceCycle: [
        { cellId: "DFA", notes: ["D", "F", "A"], count: 2, countUnit: "passes" },
        { cellId: "DEA", notes: ["D", "E", "A"], count: 2, countUnit: "passes" },
        { cellId: "DEG", notes: ["D", "E", "G"], count: 2, countUnit: "passes" },
        { cellId: "DF#A", notes: ["D", "F#", "A"], count: 2, countUnit: "passes" },
        { cellId: "DFA_settle", notes: ["D", "F", "A"], count: 2, countUnit: "passes" },
        { cellId: "DFA#_tooth", notes: ["D", "F", "A#"], count: 1, countUnit: "passes" },
        { cellId: "DFA_return", notes: ["D", "F", "A"], count: 2, countUnit: "passes" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH is automatic. Tooth is a single touch only.",
        allowedModes: ["hold", "touch"] as const,
        palette: { id: "thread_A_or_E", notes: ["A", "E"] },
      },
      transitions: [
        {
          toId: "held_horizon",
          label: "to Held Horizon",
          bridge: [{ engine: "BMTM", notes: ["C", "E", "G"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "AEA_platform",
          destinationEntryCells: ["CEG", "BEG"],
        },
        {
          toId: "cycling_descent",
          label: "to Cycling Descent",
          bridge: [{ engine: "BMT", notes: ["D", "F", "A"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "DFA",
          destinationEntryCells: ["DFA", "CEA"],
        },
      ],
    },
    {
      id: "held_return",
      name: "Held Return",
      lhEngine: { type: "BMTM", notesPerPass: 4, pattern: ["B", "M", "T", "M"] as const },
      platformCellId: "ACE_platform",
      demoPreset: { entryCounts: { ADF: 2, ACF: 2 } },
      practiceCycle: [
        { cellId: "ADF", notes: ["A", "D", "F"], count: 4, countUnit: "passes" },
        { cellId: "ACF", notes: ["A", "C", "F"], count: 4, countUnit: "passes" },
        { cellId: "ACE", notes: ["A", "C", "E"], count: 4, countUnit: "passes" },
        { cellId: "GCE_air", notes: ["G", "C", "E"], count: 2, countUnit: "passes" },
        { cellId: "ACE_platform", notes: ["A", "C", "E"], count: 4, countUnit: "passes" },
      ],
      rhLayer2: {
        introRule: "Introduce RH after LH is automatic. Use E as thread; G only on air cell.",
        allowedModes: ["hold", "touch"] as const,
        palette: { id: "thread_E", notes: ["E"] },
      },
      transitions: [
        {
          toId: "held_horizon",
          label: "to Held Horizon",
          bridge: [{ engine: "BMTM", notes: ["C", "E", "G"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "AEA_platform",
          destinationEntryCells: ["CEG", "BEG"],
        },
        {
          toId: "cycling_descent",
          label: "to Cycling Descent",
          bridge: [{ engine: "BMT", notes: ["D", "F", "A"], count: 2, countUnit: "passes" }],
          destinationPlatformCellId: "DFA",
          destinationEntryCells: ["DFA", "CEA"],
        },
      ],
    },
  ],
} as const;

type Schema = typeof HYPNOTIC_COMPANION_SCHEMA_V1_1;
type Progression = Schema["progressions"][number];
type ProgressionId = Progression["id"];
type ModeId = "enter" | "variations" | "break_restore" | "transitions";
type RhMode = "hold" | "touch" | "pulse";

type Cell = {
  cellId: string;
  notes: readonly string[];
  displayNotes?: readonly string[];
  count: number;
  countUnit: string;
  optional?: boolean;
};

type SequenceStep = {
  key: string;
  title: string;
  pathLabel: string;
  cellId: string;
  lhNotes: string[];
  lhDisplay: string;
  beatCount: number;
  enginePattern: readonly string[];
  rhHits: Array<{ beatIndex: number; notes: string[] }>;
  rhSummary?: string;
};

type ScheduledEvent = {
  atMs: number;
  stepIndex: number;
  beatIndex: number;
};

type VariationOption = {
  id: string;
  label: string;
  rhMode: RhMode;
};

const PAGE_PALETTE: EmotionPalette = {
  gradientTop: "#eff5ff",
  gradientBottom: "#dae7ff",
  trailColor: "rgba(102, 126, 234, 0.72)",
};

const MODE_LABELS: Record<ModeId, string> = {
  enter: "Enter",
  variations: "Variations",
  break_restore: "Break + Restore",
  transitions: "Transitions",
};

const BEAT_MS = 560;
const STEP_GAP_MS = 40;

const LH_DUR_BEATS = 1.08; // smooth like Love companion
const RH_DUR_HOLD = 2.8;
const RH_DUR_TOUCH = 0.9;
const RH_DUR_PULSE = 0.45;
const LH_VELOCITY = 0.56;
const RH_VELOCITY = 0.9;
const BREAK_VELOCITY = 0.93;

const NOTE_TO_PC: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function pretty(note: string) {
  return note.replace(/#/g, "♯");
}

function normalizeNote(note: string) {
  return note.replace(/♯/g, "#").replace(/♭/g, "b");
}

function stripOct(note: string) {
  return normalizeNote(note).replace(/\d+$/, "");
}

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

function noteTokenToPc(note: string) {
  return NOTE_TO_PC[normalizeNote(note)] ?? 0;
}

function noteToMidiInOctave(note: string, octave: number) {

  const pc = noteTokenToPc(note);

  return midiToName((octave + 1) * 12 + pc);

}

function buildAscendingRhVoicing(notes: readonly string[]) {
  if (!notes.length) return [];
  const out: number[] = [];
  for (let i = 0; i < notes.length; i++) {
    const pc = noteTokenToPc(notes[i]);
    let midi = 48 + pc;
    while (i > 0 && midi <= out[i - 1]) midi += 12;
    while (i === 0 && midi < 55) midi += 12;
    out.push(midi);
  }
  return out.map(midiToName);
}
function forceRhToUpperRegister(note: string) {
  const base = normalizeNote(note);
  const pc = noteTokenToPc(base);

  let midi = 60 + pc; // start at C4

  // ensure clearly above LH (avoid overlap around C3)
  if (midi < 60) midi += 12;
  if (midi < 64) midi += 12; // push a bit higher for clarity

  return midiToName(midi);
}

function buildSingleRhNote(cell: Cell, prog: Progression): string {
  if (prog.id === "cycling_descent") {
    if (cell.cellId === "DFA") return "A4";
    if (cell.cellId === "CEA") return "A4";
    if (cell.cellId === "A#DF") return "F4";
    if (cell.cellId === "ACF") return "F4";
    if (cell.cellId === "ACE") return "E4";
    if (cell.cellId === "AC#E") return "A#4";
  }

  if (prog.id === "gravity_halo") {
    if (cell.cellId.startsWith("AEA")) return "E4";
    if (cell.cellId === "GDG") return "D4";
    if (cell.cellId === "FCF") return "C4";
    if (cell.cellId === "EBE") return "E4";
    if (cell.cellId === "BFB") return "F4";
    return "E4";
  }

  if (prog.id === "tritone_latch") {
    if (cell.cellId === "bite") return "D#4";
    if (cell.cellId === "answer") return "D4";
    if (cell.cellId === "tag") return "F4";
    return "D#4";
  }

  if (prog.id === "rocking_pressure") {
    if (cell.cellId.includes("CG")) return "G4";
    if (cell.cellId.includes("DG")) return "G4";
    if (cell.cellId === "D#G_bite") return "D#4";
    if (cell.cellId === "A#G") return "A#4";
    if (cell.cellId === "G#G") return "G#4";
    return "G4";
  }

  if (prog.id === "held_horizon") {
    if (cell.cellId === "CEG") return "E4";
    if (cell.cellId === "BEG") return "E4";
    if (cell.cellId === "AEA_platform") return "E4";
    if (cell.cellId === "A#EA") return "E4";
    if (cell.cellId === "AEG") return "E4";
    if (cell.cellId === "GEG") return "E4";
    return "E4";
  }

  if (prog.id === "anchored_drift") {
    if (cell.cellId === "DFA") return "A4";
    if (cell.cellId === "DEA") return "A4";
    if (cell.cellId === "DEG") return "G4";
    if (cell.cellId === "DF#A") return "A4";
    if (cell.cellId === "DFA_settle") return "A4";
    if (cell.cellId === "DFA#_tooth") return "A#4";
    if (cell.cellId === "DFA_return") return "A4";
    return "A4";
  }

  if (prog.id === "held_return") {
    if (cell.cellId === "ADF") return "F4";
    if (cell.cellId === "ACF") return "F4";
    if (cell.cellId === "ACE") return "E4";
    if (cell.cellId === "GCE_air") return "G4";
    if (cell.cellId === "ACE_platform") return "E4";
    return "E4";
  }

  const display = cell.notes;
  return buildAscendingRhVoicing([display[display.length - 1] ?? display[0]])[0];
}

function simplifyNotes(notes: readonly string[]) {
  return Array.from(new Set(notes.map((n) => pretty(stripOct(n))))).join(" ");
}

function buildFullPianoUrls(): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const p of ["A", "A#", "B"] as const) {
    const n = `${p}0`;
    urls[n] = `${n.replace("#", "%23")}.wav`;
  }
  for (let oct = 1; oct <= 7; oct++) {
    for (const p of PITCHES) {
      const n = `${p}${oct}`;
      urls[n] = `${n.replace("#", "%23")}.wav`;
    }
  }
  urls["C8"] = "C8.wav";
  return urls;
}

async function ensureSampler(ref: React.MutableRefObject<Tone.Sampler | null>) {
  if (ref.current) return;
  const sampler = new Tone.Sampler({
    urls: buildFullPianoUrls(),
    baseUrl: "/audio/notes/",
  }).toDestination();
  await Tone.loaded();
  ref.current = sampler;
}

function getProgressionById(id: ProgressionId): Progression {
  return HYPNOTIC_COMPANION_SCHEMA_V1_1.progressions.find((p) => p.id === id)!;
}

function getCellMap(prog: Progression) {
  return new Map(prog.practiceCycle.map((c) => [c.cellId, c]));
}

function getPlatformCell(prog: Progression): Cell {
  const map = getCellMap(prog);
  const direct = map.get(prog.platformCellId);
  if (direct) return direct;
  const alt = Array.from(map.values()).find((c) => c.cellId.startsWith(prog.platformCellId));
  if (alt) return alt;
  return prog.practiceCycle[0];
}
function getTransitionDepartureCell(prog: Progression): Cell {
  const map = getCellMap(prog);

  if (prog.id === "cycling_descent") {
    return map.get("ACE") ?? prog.practiceCycle[0];
  }

  if (prog.id === "gravity_halo") {
    return map.get("AEA") ?? prog.practiceCycle[0];
  }

  if (prog.id === "tritone_latch") {
    return map.get("answer") ?? prog.practiceCycle[0];
  }

  if (prog.id === "rocking_pressure") {
    return map.get("DG") ?? prog.practiceCycle[0];
  }

  if (prog.id === "held_horizon") {
    return map.get("AEA_platform") ?? prog.practiceCycle[0];
  }

  if (prog.id === "anchored_drift") {
    return map.get("DFA") ?? prog.practiceCycle[0];
  }

  return map.get("ACE_platform") ?? map.get("ACE") ?? prog.practiceCycle[0];
}

function getEntryCells(prog: Progression): Cell[] {
  const entry = prog.demoPreset.entryCounts;
  const ids = Object.keys(entry).slice(0, 2);
  const map = getCellMap(prog);

  return ids
    .map((id) => map.get(id as keyof typeof entry))
    .filter(Boolean) as Cell[];
}

function getAllowedVariationModes(prog: Progression): VariationOption[] {
  if (prog.id === "held_horizon") {
    return [
      { id: "hold", label: "Split Halo", rhMode: "hold" },
      { id: "touch", label: "Delayed Halo", rhMode: "touch" },
    ];
  }

  if (prog.id === "anchored_drift") {
    return [
      { id: "hold", label: "Top Drift", rhMode: "hold" },
      { id: "touch", label: "Inner Drift", rhMode: "touch" },
    ];
  }

  if (prog.id === "held_return") {
    return [
      { id: "hold", label: "Memory Echo", rhMode: "hold" },
      { id: "touch", label: "Shifted Return", rhMode: "touch" },
    ];
  }

  const modes = prog.rhLayer2?.allowedModes ?? ["hold"];
  return modes.map((m) => ({
    id: m,
    label: m === "hold" ? "Hold" : m === "touch" ? "Touch" : "Pulse",
    rhMode: m,
  }));
}

function getVariationBehavior(prog: Progression, variationId: string) {
  if (prog.id === "held_horizon") {
    if (variationId === "hold") return "split_halo";
    if (variationId === "touch") return "delayed_halo";
  }

  if (prog.id === "anchored_drift") {
    if (variationId === "hold") return "top_drift";
    if (variationId === "touch") return "inner_drift";
  }

  if (prog.id === "held_return") {
    if (variationId === "hold") return "memory_echo";
    if (variationId === "touch") return "shifted_return";
  }

  return variationId;
}

function getTransitionOptions(prog: Progression) {
  return prog.transitions ?? [];
}

function buildRhHitsForCell(cell: Cell, rhMode: string, prog: Progression, beatCount: number) {
  const rhNote = buildSingleRhNote(cell, prog);

  // ---------- progression-specific variation behaviors ----------
  if (rhMode === "split_halo") {
    // Held Horizon Variation A
    const noteA = "E4";
    const noteB = "D#4";
    const hits: Array<{ beatIndex: number; notes: string[] }> = [];
    for (let i = 0; i < beatCount; i++) {
      const pos = i % 4;
      if (pos === 0) hits.push({ beatIndex: i, notes: [noteA] }); // B
      if (pos === 2) hits.push({ beatIndex: i, notes: [noteB] }); // T
    }
    return hits;
  }

  if (rhMode === "delayed_halo") {
    // Held Horizon Variation B
    return [{ beatIndex: Math.max(0, beatCount - 1), notes: ["E4"] }];
  }

  if (rhMode === "top_drift") {
    // Anchored Drift Variation A
    const top = cell.displayNotes?.[cell.displayNotes.length - 1] ?? cell.notes[cell.notes.length - 1];
const topNote = forceRhToUpperRegister(top);
    const hits: Array<{ beatIndex: number; notes: string[] }> = [];
    for (let i = 0; i < beatCount; i++) {
      const pos = i % 4;
      if (pos === 2) hits.push({ beatIndex: i, notes: [topNote] }); // T
    }
    return hits;
  }

  if (rhMode === "inner_drift") {
    // Anchored Drift Variation B
    const inner = cell.displayNotes?.[1] ?? cell.notes[1] ?? cell.notes[0];
const innerNote = forceRhToUpperRegister(inner);
    const hits: Array<{ beatIndex: number; notes: string[] }> = [];
    for (let i = 0; i < beatCount; i++) {
      const pos = i % 4;
      if (pos === 0) hits.push({ beatIndex: i, notes: [innerNote] }); // B
    }
    return hits;
  }

  if (rhMode === "memory_echo") {
    // Held Return Variation A
    const note =
      cell.cellId === "GCE_air"
        ? "G4"
        : "E4";

    const hits: Array<{ beatIndex: number; notes: string[] }> = [];
    hits.push({ beatIndex: 0, notes: [note] }); // beat 1
    if (beatCount >= 4) {
      hits.push({ beatIndex: 3, notes: [note] }); // beat 4
    }
    return hits;
  }

  if (rhMode === "shifted_return") {
    // Held Return Variation B
    const note =
      cell.cellId === "GCE_air"
        ? "G4"
        : "E4";

    return [{ beatIndex: Math.min(1, beatCount - 1), notes: [note] }]; // first M / delayed arrival
  }

  // ---------- generic modes ----------
  if (rhMode === "hold") {
    return [{ beatIndex: 0, notes: [rhNote] }];
  }

  if (rhMode === "touch") {
    return [{ beatIndex: Math.max(0, beatCount - 1), notes: [rhNote] }];
  }

  // pulse = structural pulse, not every LH note
  const engine = prog.lhEngine.type;
  const hits: Array<{ beatIndex: number; notes: string[] }> = [];

  for (let i = 0; i < beatCount; i++) {
    if (engine === "BT") {
      if (i % 2 === 0) {
        hits.push({ beatIndex: i, notes: [rhNote] });
      }
    } else if (engine === "BMT") {
      const pos = i % 3;
      if (pos === 0 || pos === 2) {
        hits.push({ beatIndex: i, notes: [rhNote] });
      }
    } else {
      const pos = i % 4;
      if (pos === 0 || pos === 2) {
        hits.push({ beatIndex: i, notes: [rhNote] });
      }
    }
  }

  return hits;
}

function buildLhNotes(notes: readonly string[], prog: Progression, cell?: Cell) {
  // Gravity Halo stays octave-spread
  if (prog.id === "gravity_halo") {
    return [
      noteToMidiInOctave(notes[0], 2),
      noteToMidiInOctave(notes[1], 3),
      noteToMidiInOctave(notes[2], 3),
    ];
  }

  // Held Return stays good as-is
  if (prog.id === "held_return") {
    return [
      noteToMidiInOctave(notes[0], 2),
      noteToMidiInOctave(notes[1], 3),
      noteToMidiInOctave(notes[2], 3),
    ];
  }

  // Held Horizon needs cell-specific LH shapes
  if (prog.id === "held_horizon" && cell) {
    if (cell.cellId === "CEG") {
      return [
        noteToMidiInOctave(notes[0], 3), // C3
        noteToMidiInOctave(notes[1], 3), // E3
        noteToMidiInOctave(notes[2], 3), // G3
      ];
    }

    if (cell.cellId === "BEG") {
      return [
        noteToMidiInOctave(notes[0], 2), // B2
        noteToMidiInOctave(notes[1], 3), // E3
        noteToMidiInOctave(notes[2], 3), // G3
      ];
    }

    if (cell.cellId === "AEA_platform") {
      return [
        noteToMidiInOctave(notes[0], 2), // A2
        noteToMidiInOctave(notes[1], 3), // E3
        noteToMidiInOctave(notes[2], 3), // A3
      ];
    }

    if (cell.cellId === "A#EA" || cell.cellId === "AEG" || cell.cellId === "GEG") {
      return [
        noteToMidiInOctave(notes[0], 2),
        noteToMidiInOctave(notes[1], 3),
        noteToMidiInOctave(notes[2], 3),
      ];
    }
  }

  // Default = compact mid-register triads
  return notes.map((note) => noteToMidiInOctave(note, 3));
}
function buildBridgeLhNotes(notes: readonly string[]) {
  if (notes.length === 2) {
    return [
      noteToMidiInOctave(notes[0], 3),
      noteToMidiInOctave(notes[1], 3),
    ];
  }

  if (notes.length === 3) {
    return [
      noteToMidiInOctave(notes[0], 3),
      noteToMidiInOctave(notes[1], 3),
      noteToMidiInOctave(notes[2], 3),
    ];
  }

  if (notes.length === 4) {
    return [
      noteToMidiInOctave(notes[0], 3),
      noteToMidiInOctave(notes[1], 3),
      noteToMidiInOctave(notes[2], 3),
      noteToMidiInOctave(notes[3], 3),
    ];
  }

  return notes.map((note) => noteToMidiInOctave(note, 3));
}
function getDisplayedLhOrder(cell: Cell, prog: Progression): readonly string[] {
  // Companion display must match actual played order, not abstract schema order

  if (prog.id === "cycling_descent" && cell.cellId === "A#DF") {
    return ["A#", "D", "F"];
  }

  if (prog.id === "cycling_descent" && cell.cellId === "ACF") {
    return ["A", "C", "F"];
  }

  if (prog.id === "cycling_descent" && cell.cellId === "ACE") {
    return ["A", "C", "E"];
  }

  if (prog.id === "cycling_descent" && cell.cellId === "AC#E") {
    return ["A", "C#", "E"];
  }

  if (prog.id === "rocking_pressure" && cell.cellId === "A#G") {
    return ["A#", "G"];
  }

  if (prog.id === "rocking_pressure" && cell.cellId === "G#G") {
    return ["G#", "G"];
  }

  return cell.notes;
}

function buildStepFromCell(
  key: string,
  title: string,
  pathLabel: string,
  cell: Cell,
  prog: Progression,
  beatCount: number,
  rhMode?: string
): SequenceStep {
  const display = cell.displayNotes ?? cell.notes;
  return {
    key,
    title,
    pathLabel,
    cellId: cell.cellId,
    lhNotes: buildLhNotes(cell.notes, prog, cell),
    lhDisplay: getDisplayedLhOrder(cell, prog).map(pretty).join(" "),
    beatCount,
    enginePattern: prog.lhEngine.pattern,
    rhHits: rhMode ? buildRhHitsForCell(cell, rhMode, prog, beatCount) : [],
    rhSummary: rhMode ? simplifyNotes(buildRhHitsForCell(cell, rhMode, prog, beatCount).flatMap((h) => h.notes)) : "—",
  };
}

function buildBreakStep(key: string, prog: Progression): SequenceStep {
  const platform = getPlatformCell(prog);
  const lhBase = buildLhNotes(platform.notes, prog, platform);

  let beatCount = 8;
  let enginePattern: readonly string[] = prog.lhEngine.type === "BT"
    ? ["B", "T"]
    : prog.lhEngine.type === "BMT"
    ? ["B", "M", "T"]
    : ["B", "M", "T", "M"];

  let rhHits: Array<{ beatIndex: number; notes: string[] }> = [];
  let rhSummary = "—";

  if (prog.id === "cycling_descent") {
    // rupture: fast directional sweep
    const sweep = ["A4", "A#4", "C#5", "D5"];
    const down = [...sweep].reverse();
    rhHits = [
      { beatIndex: 0, notes: [sweep[0]] },
      { beatIndex: 1, notes: [sweep[1]] },
      { beatIndex: 2, notes: [sweep[2]] },
      { beatIndex: 3, notes: [sweep[3]] },
      { beatIndex: 4, notes: [down[0]] },
      { beatIndex: 5, notes: [down[1]] },
      { beatIndex: 6, notes: [down[2]] },
      { beatIndex: 7, notes: [down[3]] },
    ];
    rhSummary = "A A♯ C♯ D";
  } else if (prog.id === "gravity_halo") {
    // overload: dense cluster pulses
    const cluster = ["D4", "E4", "A4"];
    rhHits = Array.from({ length: 8 }, (_, i) => ({
      beatIndex: i,
      notes: i % 2 === 0 ? cluster : ["E4", "A4"],
    }));
    rhSummary = "D E A";
  } else if (prog.id === "tritone_latch") {
    // seizure: rapid two-note oscillation
    rhHits = Array.from({ length: 8 }, (_, i) => ({
      beatIndex: i,
      notes: [i % 2 === 0 ? "D#4" : "G4"],
    }));
    rhSummary = "D♯ G";
  } else if (prog.id === "rocking_pressure") {
    // insistence: one-note hammer
    rhHits = Array.from({ length: 8 }, (_, i) => ({
      beatIndex: i,
      notes: ["G4"],
    }));
    rhSummary = "G";
  } else if (prog.id === "held_horizon") {
    // collapse of space: wide jumps
    const jumps = ["E4", "E5", "E3", "E5", "E4", "E5", "E3", "E5"];
    rhHits = jumps.map((note, i) => ({
      beatIndex: i,
      notes: [note],
    }));
    rhSummary = "E";
  } else if (prog.id === "anchored_drift") {
    // forced instability: LH corruption + light RH
    enginePattern = ["T", "B", "M", "B"];
    rhHits = [
      { beatIndex: 1, notes: ["A4"] },
      { beatIndex: 3, notes: ["G4"] },
      { beatIndex: 5, notes: ["A#4"] },
      { beatIndex: 7, notes: ["A4"] },
    ];
    rhSummary = "A G A♯";
  } else if (prog.id === "held_return") {
    // broken return: late re-attacks
    rhHits = [
      { beatIndex: 2, notes: ["E4"] },
      { beatIndex: 4, notes: ["F4"] },
      { beatIndex: 6, notes: ["E4"] },
      { beatIndex: 7, notes: ["E4"] },
    ];
    rhSummary = "E F E";
  } else {
    // fallback
    const fallback = buildAscendingRhVoicing(platform.displayNotes ?? platform.notes);
    rhHits = Array.from({ length: 8 }, (_, i) => ({
      beatIndex: i,
      notes: [fallback[i % fallback.length] ?? fallback[0]],
    }));
    rhSummary = simplifyNotes(fallback);
  }

  return {
    key,
    title: "Strong Break",
    pathLabel: "Break",
    cellId: platform.cellId,
    lhNotes: lhBase,
    lhDisplay: (platform.displayNotes ?? platform.notes).map(pretty).join(" "),
    beatCount,
    enginePattern,
    rhHits,
    rhSummary,
  };
}

function buildEnterSequence(prog: Progression): SequenceStep[] {
  const entryCells = getEntryCells(prog);
  const platform = getPlatformCell(prog);

  if (prog.id === "gravity_halo") {
    const aea = entryCells[0];
    const gdg = entryCells[1];

    return [
      buildStepFromCell("enter-gh-0", "AEA (LH)", "Entry", aea, prog, 4),
      buildStepFromCell("enter-gh-1", "GDG (LH)", "Entry", gdg, prog, 4),

      buildStepFromCell("enter-gh-2", "AEA + RH", "RH Layer", aea, prog, 4, "hold"),
      buildStepFromCell("enter-gh-3", "AEA + RH", "RH Layer", aea, prog, 4, "hold"),
      buildStepFromCell("enter-gh-4", "GDG + RH", "RH Layer", gdg, prog, 4, "hold"),
      buildStepFromCell("enter-gh-5", "GDG + RH", "RH Layer", gdg, prog, 4, "hold"),

      buildStepFromCell("enter-gh-6", "AEA Restore", "Re-center", platform, prog, 4),
      buildStepFromCell("enter-gh-7", "AEA Restore", "Re-center", platform, prog, 4),
    ];
  }

  const lhOnly = entryCells.map((cell, i) =>
    buildStepFromCell(`enter-lh-${i}`, `${cell.cellId} (LH)`, "Entry", cell, prog, 6)
  );
  const rhLayer = entryCells.map((cell, i) =>
    buildStepFromCell(`enter-rh-${i}`, `${cell.cellId} + RH`, "RH Layer", cell, prog, 6, "hold")
  );
  const restore = Array.from({ length: 2 }, (_, i) =>
    buildStepFromCell(`enter-restore-${i}`, `${platform.cellId} Restore`, "Re-center", platform, prog, 4)
  );

  return [...lhOnly, ...rhLayer, ...restore];
}

function buildVariationSequence(prog: Progression, rhMode: RhMode): SequenceStep[] {
  const entryCells = getEntryCells(prog);
  const platform = getPlatformCell(prog);
  const resolvedMode = getVariationBehavior(prog, rhMode);

  const entry = entryCells.map((cell, i) =>
    buildStepFromCell(`var-entry-${i}`, `${cell.cellId} (LH)`, "Entry", cell, prog, 6)
  );
  const cycle = prog.practiceCycle.map((cell, i) =>
    buildStepFromCell(`var-cycle-${i}`, `${cell.cellId}`, "Variation", cell, prog, 6, resolvedMode)
  );
  const restore = Array.from({ length: 2 }, (_, i) =>
    buildStepFromCell(`var-restore-${i}`, `${platform.cellId} Restore`, "Re-center", platform, prog, 4)
  );
  return [...entry, ...cycle, ...restore];
}

function buildBreakRestoreSequence(prog: Progression): SequenceStep[] {
  const entryCells = getEntryCells(prog);
  const platform = getPlatformCell(prog);

  const entry = entryCells.map((cell, i) =>
    buildStepFromCell(`br-entry-${i}`, `${cell.cellId} (LH)`, "Entry", cell, prog, 6)
  );
  const confirm = [
    buildStepFromCell(`br-confirm-0`, `${entryCells[0]?.cellId ?? platform.cellId} + RH`, "Confirm", entryCells[0] ?? platform, prog, 6, "hold"),
  ];
  const strongBreak = [buildBreakStep("br-break-0", prog)];
  const restore = Array.from({ length: 2 }, (_, i) =>
    buildStepFromCell(`br-restore-${i}`, `${platform.cellId} Restore`, "Restore", platform, prog, 4)
  );

  return [...entry, ...confirm, ...strongBreak, ...restore];
}

function buildTransitionSequence(prog: Progression, transitionLabel: string): SequenceStep[] {
  const transition = getTransitionOptions(prog).find((t) => t.label === transitionLabel);
  if (!transition) return [];

  const destination = getProgressionById(transition.toId as ProgressionId);
  const destinationMap = getCellMap(destination);
  const destPlatform =
    destinationMap.get(transition.destinationPlatformCellId) ??
    Array.from(destinationMap.values()).find((c) => c.cellId.startsWith(transition.destinationPlatformCellId)) ??
    destination.practiceCycle[0];

  const departureCell = getTransitionDepartureCell(prog);

  // 1) source departure cell — source engine
  const departure: SequenceStep[] = [
    buildStepFromCell(
      "tr-departure-0",
      `${departureCell.cellId} (From ${prog.name})`,
      "Departure",
      departureCell,
      prog,
      prog.id === "gravity_halo" ? 4 : 6
    ),
  ];

  // 2) bridge — bridge engine
  const bridge: SequenceStep[] = transition.bridge.map((segment, i) => {
    const pseudoCell: Cell = {
      cellId: `bridge-${i}`,
      notes: segment.notes as unknown as string[],
      count: segment.count,
      countUnit: segment.countUnit,
    };

    const beatCount =
      segment.engine === "BMTM"
        ? 4
        : segment.engine === "BT"
        ? 4
        : 6;

    const enginePattern =
      segment.engine === "BMTM"
        ? (["B", "M", "T", "M"] as const)
        : segment.engine === "BT"
        ? (["B", "T"] as const)
        : (["B", "M", "T"] as const);

        const baseStep = buildStepFromCell(
      `tr-bridge-${i}`,
      `Bridge ${i + 1}`,
      "Bridge",
      pseudoCell,
      prog,
      beatCount
    );

    return {
      ...baseStep,
      lhNotes: buildBridgeLhNotes(pseudoCell.notes),
      lhDisplay: pseudoCell.notes.map(pretty).join(" "),
      enginePattern,
    };
  });

  // 3) destination platform — destination engine, 2 bars
  const destinationBeatCount = destination.id === "gravity_halo" ? 4 : 4;

  const platform = Array.from({ length: 2 }, (_, i) =>
    buildStepFromCell(
      `tr-platform-${i}`,
      `${destination.name} Platform`,
      "Destination",
      destPlatform,
      destination,
      destinationBeatCount
    )
  );

  return [...departure, ...bridge, ...platform];
}

function buildSequence(prog: Progression, mode: ModeId, variationRhMode: RhMode, transitionLabel: string): SequenceStep[] {
  if (mode === "enter") return buildEnterSequence(prog);
  if (mode === "variations") return buildVariationSequence(prog, variationRhMode);
  if (mode === "break_restore") return buildBreakRestoreSequence(prog);
  return buildTransitionSequence(prog, transitionLabel);
}

function buildEvents(steps: SequenceStep[]): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  let cursor = 0;

  steps.forEach((step, stepIndex) => {
    for (let beatIndex = 0; beatIndex < step.beatCount; beatIndex++) {
      events.push({
        atMs: cursor + beatIndex * BEAT_MS,
        stepIndex,
        beatIndex,
      });
    }
    cursor += step.beatCount * BEAT_MS + STEP_GAP_MS;
  });

  return events;
}

function getLhNotesForBeat(step: SequenceStep, beatIndex: number) {
  const pattern = step.enginePattern;
  if (!pattern.length) return [];
  const token = pattern[beatIndex % pattern.length];
  const idx = token === "B" ? 0 : token === "M" ? 1 : step.lhNotes.length - 1;
  return [step.lhNotes[Math.max(0, Math.min(idx, step.lhNotes.length - 1))]];
}

function getRhHit(step: SequenceStep, beatIndex: number) {
  return step.rhHits.find((hit) => hit.beatIndex === beatIndex)?.notes ?? [];
}

function NotesProgressLine(props: {
  steps: SequenceStep[];
  activeIndex: number | null;
}) {
  const { steps, activeIndex } = props;

  const renderStep = (content: React.ReactNode, i: number) => {
    const active = activeIndex === i;
    return (
      <span key={i} style={{ marginInline: 2 }}>
        {i > 0 && <span style={{ opacity: 0.35, marginInline: 4 }}>|</span>}
        <span
          style={{
            fontWeight: active ? 800 : 600,
            opacity: active ? 1 : 0.7,
            textDecoration: active ? "underline" : "none",
            textUnderlineOffset: 3,
          }}
        >
          {content}
        </span>
      </span>
    );
  };

  return (
    <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#111827", lineHeight: 1.7 }}>
      <div>
        <span style={{ fontWeight: 800, marginRight: 6 }}>RH:</span>
        {steps.map((step, i) => renderStep(step.rhSummary || "—", i))}
      </div>
      <div>
        <span style={{ fontWeight: 800, marginRight: 6 }}>LH:</span>
        {steps.map((step, i) => renderStep(step.lhDisplay, i))}
      </div>
    </div>
  );
}
function getDisplayedRhythmRow(step: SequenceStep) {
  const defaultRow = Array.from({ length: step.beatCount }, (_, i) => {
    const token = step.enginePattern[i % step.enginePattern.length];
    return token;
  });

  // Cycling Descent variation cells currently sound like T B M
  if (
    step.pathLabel === "Variation" &&
    ["A#DF", "ACF", "ACE", "AC#E"].includes(step.cellId)
  ) {
    const cycle = ["T", "B", "M"];
    return Array.from({ length: step.beatCount }, (_, i) => cycle[i % cycle.length]);
  }

  // Rocking Pressure variation cells currently sound like T B
  if (
    step.pathLabel === "Variation" &&
    ["A#G", "G#G", "GG_lock"].includes(step.cellId)
  ) {
    const cycle =
      step.cellId === "GG_lock"
        ? ["T", "T"]
        : ["T", "B"];

    return Array.from({ length: step.beatCount }, (_, i) => cycle[i % cycle.length]);
  }

  return defaultRow;
}

function RhythmTable(props: {
  step: SequenceStep | null;
  activeBeatIndex: number | null;
}) {
  const { step, activeBeatIndex } = props;
  if (!step) return null;

  const beatLabels = Array.from({ length: step.beatCount }, (_, i) => `${i + 1}`);
  const lhRow = getDisplayedRhythmRow(step);
  const rhRow = Array.from({ length: step.beatCount }, (_, i) => {
    const hit = getRhHit(step, i);
    return hit.length ? simplifyNotes(hit) : "—";
  });

  return (
    <div className="mt-4 overflow-x-auto rounded-xl bg-[#faf7f3] p-3 ring-1 ring-black/5">
      <div className="min-w-[760px]">
        <div className="grid gap-2 text-xs" style={{ gridTemplateColumns: `90px repeat(${step.beatCount}, minmax(0, 1fr))` }}>
          <div className="font-semibold text-neutral-500">Beat</div>
          {beatLabels.map((beat, i) => (
            <div
              key={`beat-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center font-semibold",
                activeBeatIndex === i ? "bg-black text-white" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {beat}
            </div>
          ))}
        </div>

        <div className="mt-2 grid gap-2 text-xs" style={{ gridTemplateColumns: `90px repeat(${step.beatCount}, minmax(0, 1fr))` }}>
          <div className="font-semibold text-neutral-500">RH</div>
          {rhRow.map((token, i) => (
            <div
              key={`rh-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center",
                activeBeatIndex === i ? "bg-black/10 text-neutral-900 font-semibold" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {token}
            </div>
          ))}
        </div>

        <div className="mt-2 grid gap-2 text-xs" style={{ gridTemplateColumns: `90px repeat(${step.beatCount}, minmax(0, 1fr))` }}>
          <div className="font-semibold text-neutral-500">LH</div>
          {lhRow.map((token, i) => (
            <div
              key={`lh-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center",
                activeBeatIndex === i ? "bg-black/10 text-neutral-900 font-semibold" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {token}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function B2CompanionPage() {
  const [selectedProgressionId, setSelectedProgressionId] = useState<ProgressionId>("cycling_descent");
  const [selectedMode, setSelectedMode] = useState<ModeId>("enter");
  const [selectedVariationId, setSelectedVariationId] = useState<string>("hold");
  const [selectedTransitionLabel, setSelectedTransitionLabel] = useState<string>("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);

  const [primaryNotes, setPrimaryNotes] = useState<string[]>([]);
  const [secondaryNotes, setSecondaryNotes] = useState<string[]>([]);

  const samplerRef = useRef<Tone.Sampler | null>(null);
  const timerRef = useRef<number | null>(null);
  const rhTimerRef = useRef<number | null>(null);
  const lhTimerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const eventsRef = useRef<ScheduledEvent[]>([]);
  const nextEventIndexRef = useRef(0);
  const waitStartedAtRef = useRef<number | null>(null);
  const waitMsRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  const progression = useMemo(() => getProgressionById(selectedProgressionId), [selectedProgressionId]);
  const variationOptions = useMemo(() => getAllowedVariationModes(progression), [progression]);
  const transitionOptions = useMemo(() => getTransitionOptions(progression), [progression]);

  useEffect(() => {
    if (!variationOptions.find((v) => v.id === selectedVariationId)) {
      setSelectedVariationId(variationOptions[0]?.id ?? "hold");
    }
  }, [variationOptions, selectedVariationId]);

  useEffect(() => {
    if (!transitionOptions.find((t) => t.label === selectedTransitionLabel)) {
      setSelectedTransitionLabel(transitionOptions[0]?.label ?? "");
    }
  }, [transitionOptions, selectedTransitionLabel]);

  const sequence = useMemo(
    () =>
      buildSequence(
        progression,
        selectedMode,
        (variationOptions.find((v) => v.id === selectedVariationId)?.rhMode ?? "hold") as RhMode,
        selectedTransitionLabel
      ),
    [progression, selectedMode, selectedVariationId, selectedTransitionLabel, variationOptions]
  );

  const currentStep = currentStepIndex != null ? sequence[currentStepIndex] ?? null : null;
  const nextStep = currentStepIndex != null ? sequence[currentStepIndex + 1] ?? null : null;

  const clearMainTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearRhTimer = () => {
    if (rhTimerRef.current != null) {
      window.clearTimeout(rhTimerRef.current);
      rhTimerRef.current = null;
    }
  };

  const clearLhTimer = () => {
    if (lhTimerRef.current != null) {
      window.clearTimeout(lhTimerRef.current);
      lhTimerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    runIdRef.current += 1;
    clearMainTimer();
    clearRhTimer();
    clearLhTimer();

    eventsRef.current = [];
    nextEventIndexRef.current = 0;
    waitStartedAtRef.current = null;
    waitMsRef.current = 0;
    isPausedRef.current = false;

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStepIndex(null);
    setActiveBeatIndex(null);
    setPrimaryNotes([]);
    setSecondaryNotes([]);
  }, []);

  useEffect(() => {
    stop();
  }, [selectedProgressionId, selectedMode, selectedVariationId, selectedTransitionLabel, stop]);

  useEffect(() => () => stop(), [stop]);

  const schedule = useCallback((ms: number, fn: () => void) => {
    clearMainTimer();
    waitStartedAtRef.current = performance.now();
    waitMsRef.current = ms;
    timerRef.current = window.setTimeout(fn, ms);
  }, []);

  const runEvent = useCallback(
    (runId: number, events: ScheduledEvent[], eventIndex: number, steps: SequenceStep[]) => {
      if (runIdRef.current !== runId) return;
      if (isPausedRef.current) return;

      nextEventIndexRef.current = eventIndex;

      const ev = events[eventIndex];
      if (!ev) {
        schedule(120, () => stop());
        return;
      }

      const step = steps[ev.stepIndex];
      const lhNotes = getLhNotesForBeat(step, ev.beatIndex);
      const rhNotes = getRhHit(step, ev.beatIndex);

      setCurrentStepIndex(ev.stepIndex);
      setActiveBeatIndex(ev.beatIndex);

      // smooth LH engine
      setSecondaryNotes(lhNotes);
      clearLhTimer();
      lhTimerRef.current = window.setTimeout(() => {
        setSecondaryNotes([]);
        lhTimerRef.current = null;
      }, Math.max(180, Math.round(LH_DUR_BEATS * BEAT_MS)));

      if (samplerRef.current && lhNotes.length) {
        try {
          (samplerRef.current as any).triggerAttackRelease(
            lhNotes,
            Math.max(0.18, (LH_DUR_BEATS * BEAT_MS) / 1000),
            undefined,
            LH_VELOCITY
          );
        } catch {}
      }

      if (rhNotes.length) {
        const rhDurBeats =
          selectedMode === "break_restore" && step.pathLabel === "Break"
            ? RH_DUR_PULSE
            : selectedMode === "variations" && (variationOptions.find((v) => v.id === selectedVariationId)?.rhMode === "pulse")
            ? RH_DUR_PULSE
            : selectedMode === "variations" && (variationOptions.find((v) => v.id === selectedVariationId)?.rhMode === "touch")
            ? RH_DUR_TOUCH
            : step.pathLabel === "Bridge"
            ? RH_DUR_TOUCH
            : RH_DUR_HOLD;

        setPrimaryNotes(rhNotes);
        clearRhTimer();
        rhTimerRef.current = window.setTimeout(() => {
          setPrimaryNotes([]);
          rhTimerRef.current = null;
        }, Math.max(120, Math.round(rhDurBeats * BEAT_MS)));

        if (samplerRef.current) {
          try {
            (samplerRef.current as any).triggerAttackRelease(
              rhNotes,
              Math.max(0.12, (rhDurBeats * BEAT_MS) / 1000),
              undefined,
              selectedMode === "break_restore" && step.pathLabel === "Break" ? BREAK_VELOCITY : RH_VELOCITY
            );
          } catch {}
        }
      }

      const next = events[eventIndex + 1];
      if (!next) {
        schedule(160, () => stop());
        return;
      }

      schedule(Math.max(0, next.atMs - ev.atMs), () => runEvent(runId, events, eventIndex + 1, steps));
    },
    [schedule, selectedMode, selectedVariationId, stop, variationOptions]
  );

  const startPlayback = useCallback(async () => {
    await Tone.start().catch(() => {});
    await ensureSampler(samplerRef).catch(() => {});

    const events = buildEvents(sequence);

    stop();
    setIsPlaying(true);
    setIsPaused(false);
    isPausedRef.current = false;

    eventsRef.current = events;
    nextEventIndexRef.current = 0;

    const runId = ++runIdRef.current;
    if (!events.length) {
      stop();
      return;
    }

    schedule(events[0].atMs, () => runEvent(runId, events, 0, sequence));
  }, [runEvent, schedule, sequence, stop]);

  const pausePlayback = useCallback(() => {
    if (!isPlaying || isPaused) return;

    clearMainTimer();

    if (waitStartedAtRef.current != null) {
      const elapsed = performance.now() - waitStartedAtRef.current;
      waitMsRef.current = Math.max(0, waitMsRef.current - elapsed);
    }

    isPausedRef.current = true;
    setIsPaused(true);
  }, [isPaused, isPlaying]);

  const resumePlayback = useCallback(() => {
    if (!isPlaying || !isPaused) return;

    const events = eventsRef.current;
    const nextIndex = nextEventIndexRef.current;
    const runId = runIdRef.current;

    if (!events.length || !events[nextIndex]) {
      stop();
      return;
    }

    isPausedRef.current = false;
    setIsPaused(false);

    const remaining = Math.max(0, waitMsRef.current);
    schedule(remaining, () => runEvent(runId, events, nextIndex, sequence));
  }, [isPaused, isPlaying, runEvent, schedule, sequence, stop]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Book Companion
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          <span className="bg-gradient-to-r from-[#87a8ff] via-[#c68bfe] to-[#7ebdff] bg-clip-text text-transparent">
            Hypnotic Arcs
          </span>
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-700">
          Enter the state quickly, test one variation at a time, break it on purpose,
          then restore or transition without losing the center.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Choose a progression
        </div>

        <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {HYPNOTIC_COMPANION_SCHEMA_V1_1.progressions.map((prog) => {
            const active = prog.id === selectedProgressionId;
            return (
              <button
                key={prog.id}
                type="button"
                onClick={() => setSelectedProgressionId(prog.id)}
                className={[
                  "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-black text-white"
                    : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                ].join(" ")}
              >
                <span className="font-semibold">{prog.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-sm font-semibold text-neutral-900">{progression.name}</div>

        <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {(Object.keys(MODE_LABELS) as ModeId[]).map((mode) => {
            const active = mode === selectedMode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={[
                  "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-black text-white"
                    : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                ].join(" ")}
              >
                <span className="font-semibold">{MODE_LABELS[mode]}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={startPlayback}
            className="inline-flex shrink-0 items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            ▶ Play
          </button>

          {isPlaying && (
            <>
              <button
                type="button"
                onClick={isPaused ? resumePlayback : pausePlayback}
                className="inline-flex shrink-0 items-center rounded-full bg-black/10 px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>

              <button
                type="button"
                onClick={stop}
                className="inline-flex shrink-0 items-center rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                ⏹ Stop
              </button>
            </>
          )}
        </div>

        {selectedMode === "variations" && variationOptions.length > 0 ? (
          <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
            {variationOptions.map((opt) => {
              const active = opt.id === selectedVariationId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedVariationId(opt.id)}
                  className={[
                    "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs transition",
                    active
                      ? "bg-black text-white"
                      : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {selectedMode === "transitions" && transitionOptions.length > 0 ? (
          <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
            {transitionOptions.map((opt) => {
              const active = opt.label === selectedTransitionLabel;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedTransitionLabel(opt.label)}
                  className={[
                    "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs transition",
                    active
                      ? "bg-black text-white"
                      : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                  ].join(" ")}
                >
                  {opt.label.replace(/^to\s+/i, "")}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-4 rounded-xl bg-[#faf7f3] p-3 text-sm text-neutral-800 ring-1 ring-black/5">
          <div>
            <span className="font-semibold text-neutral-900">Now playing:</span>{" "}
            {currentStep ? `${currentStep.title}${isPaused ? " (paused)" : ""}` : "Ready"}
          </div>
          <div className="mt-1">
            <span className="font-semibold text-neutral-900">Next:</span>{" "}
            {nextStep ? `${nextStep.title} [${nextStep.pathLabel}]` : "Stop"}
          </div>
        </div>

        <div className="mt-6">
          <KeyboardEmotions
            activeChordSymbol={null}
            emotion={PAGE_PALETTE}
            emotionLabel={progression.name}
            highlightNotesPrimary={primaryNotes}
            highlightNotesSecondary={secondaryNotes}
            highlightColorSecondary="rgba(17,24,39,0.22)"
          />

          <NotesProgressLine steps={sequence} activeIndex={currentStepIndex} />

          <RhythmTable step={currentStep} activeBeatIndex={activeBeatIndex} />
        </div>
      </section>
    </main>
  );
}