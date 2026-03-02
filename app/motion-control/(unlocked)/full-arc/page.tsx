"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import KeyboardMotionControl from "@/components/playbooks/KeyboardMotionControl";
import { playLiveNote, stopLiveAudios, warmupLiveAudio } from "@/lib/audio/liveAudio";
import Link from "next/link";


/**
 * /motion-control/full-arc
 *
 * Strict system page:
 * - No marketing copy
 * - No theory words
 * - Motion-only wording
 *
 * Sections:
 * 1) Selector (Control one / Control few) — simplified, no Root here
 * 2) Immersion (Demo) — plays full selected sequence once
 * 3) Execution (Practice) — choose start loop; play from there to end once (no looping)
 * 4) Architecture — full non-interactive map + Root selector
 */

type Mode = "ONE" | "FEW";
type Root = "C" | "D" | "Eb" | "F";
type MotionCharacter = "STRUCTURAL" | "ELASTIC" | "INTERWOVEN" | "ATMOSPHERIC";
type Status = "IDLE" | "PLAYING" | "PAUSED" | "STOPPED" | "FINISHED";

type BlockId = "PRESSURE" | "EXPANSION" | "DISSOLVE" | "ARRIVAL";
type ArcId =
  | "FULL_ARC"
  | "P_TO_E"
  | "P_TO_D"
  | "P_TO_A"
  | "E_TO_D"
  | "D_TO_A"
  | "P_TO_E_TO_D";

type ChunkKind = "LOOP" | "TRANSITION";
type LhMode = "PULSE_OCTAVES" | "BREATH_OCTAVES" | "HOLD_OCTAVES" | "HOLD_FIFTH";

function lhModeForBlockTitle(blockTitle: string): LhMode {
  if (blockTitle === "Containment") return "PULSE_OCTAVES";
  if (blockTitle === "Expansion") return "BREATH_OCTAVES";
  if (blockTitle === "Dissolve") return "HOLD_OCTAVES";
  if (blockTitle === "Arrival") return "HOLD_FIFTH";
  // Transition / unknown
  return "BREATH_OCTAVES";
}

// Used for HOLD_* engines: restrike only at loop boundary (cellId ends with _1)
function isLoopBoundaryCell(cellId: string) {
  return /_1$/.test(cellId);
}

function fifthAbove(note: string): string {
  // note is like "D2" or "D#2"
  const m = midiFromNote(note);
  return noteFromMidiSharp(m + 7);
}

const BPM = 72;
const BEATS_PER_BAR = 4;
const BEAT_MS = 60_000 / BPM;
const CELL_MS = BEAT_MS * BEATS_PER_BAR;
const DEMO_SPEED = 0.75; // 25% faster
const DEMO_BEAT_MS = BEAT_MS * DEMO_SPEED;
const DEMO_CELL_MS = CELL_MS * DEMO_SPEED;
const END_SILENCE_MS = 2500;

const RH_COLOR = "#8fa3bf";
const LH_COLOR = "rgba(0,0,0,0.22)";

const PALETTE = {
  gradientTop: "#2b2f36",
  gradientBottom: "#0f1115",
  trailColor: "#8fa3bf",
};

// ---------- Audio ----------
function playNoteAudio(noteNameSharp: string) {
  // Live playback: cached HTMLAudio for stability
  return playLiveNote(noteNameSharp);
}

// ---------- Root offsets ----------
function rootToSemis(root: Root): number {
  if (root === "C") return 0;
  if (root === "D") return 2;
  if (root === "Eb") return 3;
  if (root === "F") return 5;
  return 0;
}

// ---------- Note utils (audio-safe sharps) ----------
const PITCHES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function pcFromBase(base: string): number {
  const flatMap: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  const norm = flatMap[base] ?? base;
  const idx = PITCHES_SHARP.indexOf(norm as any);
  return idx >= 0 ? idx : 0;
}

function midiFromNote(note: string): number {
  const m = /^([A-G])([b#])?(\d)$/.exec(note);
  if (!m) return 60;
  const letter = m[1];
  const acc = m[2] ?? "";
  const oct = Number(m[3]);
  const base = `${letter}${acc}`;
  const pc = pcFromBase(base);
  return (oct + 1) * 12 + pc;
}

function noteFromMidiSharp(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${PITCHES_SHARP[pc]}${oct}`;
}

function transposeNoteSharp(note: string, semis: number): string {
  return noteFromMidiSharp(midiFromNote(note) + semis);
}

function transposeNotesSharp(notes: string[], semis: number): string[] {
  return notes.map((n) => transposeNoteSharp(n, semis));
}

function toSharpForAudio(note: string): string {
  const flatToSharp: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  const m = /^([A-G])([b#])?(\d)$/.exec(note);
  if (!m) return note;
  const letter = m[1];
  const acc = m[2] ?? "";
  const oct = m[3];
  const base = `${letter}${acc}`;
  const sharpBase = flatToSharp[base] ?? base;
  return `${sharpBase}${oct}`;
}

function normalizeToSharps(notes: string[]): string[] {
  return notes.map(toSharpForAudio);
}
function cellIndexFromId(cellId: string): number | null {
  // e.g. "A1_3" -> 3
  const m = /_(\d+)$/.exec(cellId);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function upOct(note: string): string {
  return noteFromMidiSharp(midiFromNote(note) + 12);
}

/* =========================
   Export-only: WebAudio + recorder helpers (copied from your lab)
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

async function convertToMp4Server(inputBlob: Blob): Promise<Blob> {
  if (inputBlob.type.includes("mp4")) return inputBlob;
  const resp = await fetch("/api/convert-webm-to-mp4", {
    method: "POST",
    headers: { "Content-Type": inputBlob.type || "application/octet-stream" },
    body: inputBlob,
  });
  if (!resp.ok) throw new Error(`server convert failed: ${resp.status}`);
  const out = await resp.blob();
  if (out.size === 0) throw new Error("server returned empty blob");
  return out;
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
   Export render: Keyboard (Canvas) — C2..C6 (motion-control)
========================= */

type OctMC = 2 | 3 | 4 | 5 | 6;
type WhiteLetterMC = "C" | "D" | "E" | "F" | "G" | "A" | "B";
type NoteNameMC =
  | `${"C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"}${OctMC}`
  | `${"Db" | "Eb" | "Gb" | "Ab" | "Bb"}${OctMC}`;

const WHITE_W_MC = 30;
const WHITE_H_MC = 145;
const BLACK_W_MC = 18;
const BLACK_H_MC = 92;

type WhiteKeyMC = { note: NoteNameMC; x: number };
type BlackKeyMC = { noteSharp: NoteNameMC; noteFlat: NoteNameMC; x: number };

function buildKeyboardMC() {
  const whiteCycle: WhiteLetterMC[] = ["C", "D", "E", "F", "G", "A", "B"];
  const hasBlackAfter = (wIdx: number) => ![2, 6].includes(wIdx); // no black after E or B

  const whites: WhiteKeyMC[] = [];
  const blacks: BlackKeyMC[] = [];

  let x = 0;
  for (let oct = 2 as OctMC; oct <= 6; oct = (oct + 1) as OctMC) {
    for (let wi = 0; wi < whiteCycle.length; wi++) {
      const letter = whiteCycle[wi];
      if (oct === 6 && letter !== "C") break; // only C6
      const note = `${letter}${oct}` as NoteNameMC;
      whites.push({ note, x });

      if (hasBlackAfter(wi) && !(oct === 6 && letter === "C")) {
        const center = x + WHITE_W_MC;
        const bx = center - BLACK_W_MC / 2;

        const sharpMap: Record<WhiteLetterMC, string> = {
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
          const sharp = `${sharpBase}${oct}` as NoteNameMC;
          const flat = `${flatPair[sharpBase]}${oct}` as NoteNameMC;
          blacks.push({ noteSharp: sharp, noteFlat: flat, x: bx });
        }
      }

      x += WHITE_W_MC;
    }
  }

  const width = whites.length * WHITE_W_MC;
  return { whites, blacks, width };
}

const { whites: WHITE_KEYS_MC, blacks: BLACK_KEYS_MC, width: KEYBOARD_W_MC } = buildKeyboardMC();

function stripOct(note: string) {
  return note.slice(0, -1);
}
function prettyBase(name: string) {
  return name.replace(/#/g, "♯").replace(/b/g, "♭");
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
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

function drawKeyboardCanvasMC(opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  // highlights
  rhNotes: string[];
  lhNotes: string[];
  // label behavior
  showLabels: boolean;
}) {
  const { ctx, x, y, w, rhNotes, lhNotes, showLabels } = opts;

  const outerPad = 8;
  const innerPad = 6;
  const outerR = 12;
  const innerR = 10;

  const innerW = w - outerPad * 2;
  const keyboardW = innerW - innerPad * 2;
  const keyboardH = keyboardW * (WHITE_H_MC / KEYBOARD_W_MC);
  const outerH = outerPad * 2 + innerPad * 2 + keyboardH;

  // Outer card
  ctx.save();
  roundedRectPath(ctx, x, y, w, outerH, outerR);
  const g = ctx.createLinearGradient(x, y, x + w, y + outerH);
  g.addColorStop(0, PALETTE.gradientTop);
  g.addColorStop(1, PALETTE.gradientBottom);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Inner
  const ix = x + outerPad;
  const iy = y + outerPad;
  const iw = w - outerPad * 2;
  const ih = outerH - outerPad * 2;

  roundedRectPath(ctx, ix, iy, iw, ih, innerR);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fill();

  const kx = ix + innerPad;
  const ky = iy + innerPad;

  const s = keyboardW / KEYBOARD_W_MC;

  const highlightedPrimary = new Set<string>(rhNotes);
  const highlightedSecondary = new Set<string>(lhNotes);

  ctx.save();
  ctx.translate(kx, ky);
  ctx.scale(s, s);

  // White keys
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000";

  for (const k of WHITE_KEYS_MC) {
    const isPrimary = highlightedPrimary.has(k.note);
    const isSecondary = highlightedSecondary.has(k.note);

    const fill = isPrimary ? RH_COLOR : isSecondary ? LH_COLOR : "#ffffff";
    ctx.fillStyle = fill;
    ctx.fillRect(k.x, 0, WHITE_W_MC, WHITE_H_MC);
    ctx.strokeRect(k.x, 0, WHITE_W_MC, WHITE_H_MC);

    // C4 always
    if (k.note === "C4") {
      ctx.fillStyle = "rgba(17,24,39,0.75)";
      ctx.font = `10px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("C4", k.x + WHITE_W_MC / 2, WHITE_H_MC - 4);
    }

    // Labels only if enabled and key is highlighted
    if (showLabels && (isPrimary || isSecondary)) {
      const baseLabel = SHARP_TO_FLAT_LABELS[k.note] ?? stripOct(k.note);
      const labelText = prettyBase(baseLabel);
      ctx.fillStyle = "#111827";
      ctx.font = `9px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(labelText, k.x + WHITE_W_MC / 2, WHITE_H_MC - 20);
    }
  }

  // Black keys
  for (const k of BLACK_KEYS_MC) {
    const isPrimary =
      highlightedPrimary.has(k.noteSharp) || highlightedPrimary.has(k.noteFlat);
    const isSecondary =
      highlightedSecondary.has(k.noteSharp) || highlightedSecondary.has(k.noteFlat);

    const fill = isPrimary ? RH_COLOR : isSecondary ? LH_COLOR : "#000000";
    ctx.fillStyle = fill;

    const rx = 2;
    const x0 = k.x;
    const y0 = 0;
    const w0 = BLACK_W_MC;
    const h0 = BLACK_H_MC;
    ctx.beginPath();
    ctx.moveTo(x0 + rx, y0);
    ctx.arcTo(x0 + w0, y0, x0 + w0, y0 + h0, rx);
    ctx.arcTo(x0 + w0, y0 + h0, x0, y0 + h0, rx);
    ctx.arcTo(x0, y0 + h0, x0, y0, rx);
    ctx.arcTo(x0, y0, x0 + w0, y0, rx);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (showLabels && (isPrimary || isSecondary)) {
      const shown = highlightedPrimary.has(k.noteFlat) ? k.noteFlat : k.noteSharp;
      const baseLabel = SHARP_TO_FLAT_LABELS[shown] ?? stripOct(shown);
      const labelText = prettyBase(baseLabel);
      ctx.fillStyle = "#111827";
      ctx.font = `9px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(labelText, k.x + BLACK_W_MC / 2, BLACK_H_MC + 10);
    }
  }

  ctx.restore(); // keyboard space
  ctx.restore(); // outer
}
function toFlatBase(noteSharp: string) {
  const m = /^([A-G])(#)?(\d)$/.exec(noteSharp);
  if (!m) return noteSharp;
  const base = `${m[1]}${m[2] ?? ""}`;
  const sharpToFlat: Record<string, string> = {
    "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb",
  };
  return sharpToFlat[base] ?? base;
}

function triadNoOct(rh: string[]) {
  return rh.map(toFlatBase).join("");
}
function lhNoOct(lh: string[]) {
  return lh.map(toFlatBase).join("");
}

function drawCellRowCanvas(opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  cells: ScheduledCell[];
  activeCellId: string | null;
  scale: number;
  character: MotionCharacter;
}) {
  const { ctx, x, y, w, cells, activeCellId, scale, character } = opts;
  if (!cells.length) return;

  const n = cells.length;
  const gap = 8 * scale;
  const cellW = (w - gap * (n - 1)) / n;
  const cellH = 130 * scale;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = 0; i < n; i++) {
    const c = cells[i];
    const cx = x + i * (cellW + gap);
    const on = c.cellId === activeCellId;

    // Only vertical separators + subtle active fill
    if (on) {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(cx, y, cellW, cellH);
    }

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + cellH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + cellW, y);
    ctx.lineTo(cx + cellW, y + cellH);
    ctx.stroke();

    // Text
    const rhDisplay = displayRhNotesForCell(c, character, i);
const rhText = triadNoOct(rhDisplay);
const lhText = displayLhLabelForCell(c, character);

    ctx.fillStyle = "rgba(17,24,39,0.6)";
    ctx.font = `700 ${18 * scale}px system-ui, -apple-system, sans-serif`;
    ctx.fillText("RH", cx + cellW / 2, y + 8 * scale);
    ctx.fillStyle = "rgba(17,24,39,0.92)";
    ctx.font = `800 ${22 * scale}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(rhText, cx + cellW / 2, y + 30 * scale);

    ctx.fillStyle = "rgba(17,24,39,0.6)";
    ctx.font = `700 ${18 * scale}px system-ui, -apple-system, sans-serif`;
    ctx.fillText("LH", cx + cellW / 2, y + 68 * scale);
    ctx.fillStyle = "rgba(17,24,39,0.92)";
    ctx.font = `800 ${22 * scale}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(lhText, cx + cellW / 2, y + 90 * scale);
  }

  ctx.restore();
}

// ---------- Keyboard label override: show flats for sharps ----------
const SHARP_TO_FLAT_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const base: Record<string, string> = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  };
  for (const oct of [2, 3, 4, 5, 6]) {
    for (const [sh, fl] of Object.entries(base)) map[`${sh}${oct}`] = fl;
  }
  return map;
})();

// ---------- Motion model ----------
type Cell = { id: string; lh: string[]; rh: string[] };

type LoopDef = { name: string; caption: string; cells: Cell[] };

type BlockDef = { id: BlockId; title: string; loops: LoopDef[] };

type TransitionDef = {
  id: string;
  title: string;
  caption: string;
  cells: Cell[];
  loopable: boolean; // bridge transitions are not selectable for practice
};

type ScheduledCell = {
  lhNotes: string[];
  rhNotes: string[];
  blockTitle: string; // "Containment" | "Expansion" | "Dissolve" | "Arrival" | "Transition"
  chunkKey: string;
  cellId: string;
};

type Chunk = {
  kind: ChunkKind;
  key: string;
  label: string;     // shown above keyboard (Loop/Transition label)
  caption: string;   // shown under keyboard
  blockTitle: string; // used near Demo/Practice headings
  cells: ScheduledCell[];
  selectableInPractice: boolean;
};

// ---------- Block definitions (locked) ----------
function buildBlocks(): Record<BlockId, BlockDef> {
  const pressureLoop1: LoopDef = {
    name: "Loop 1",
    caption: "Keep the bottom fixed. Move the inner and top stepwise.",
    cells: [
      { id: "P1_1", lh: ["C2", "C3"], rh: ["D4", "Eb4", "G4"] },
      { id: "P1_2", lh: ["D2", "D3"], rh: ["D4", "F4", "Ab4"] },
      { id: "P1_3", lh: ["Eb2", "Eb3"], rh: ["D4", "Eb4", "Ab4"] },
      { id: "P1_4", lh: ["D2", "D3"], rh: ["D4", "G4", "Bb4"] },
      { id: "P1_5", lh: ["D2", "D3"], rh: ["D4", "A4", "Bb4"] },
      { id: "P1_6", lh: ["D2", "D3"], rh: ["D4", "G4", "Bb4"] },
    ],
  };

  const pressureLoop2: LoopDef = {
    name: "Loop 2",
    caption: "Keep the top fixed. Lift the bottom and inner upward. End on the tight spike.",
    cells: [
      { id: "P2_1", lh: ["C2", "C3"], rh: ["Eb4", "G4", "D5"] },
      { id: "P2_2", lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
      { id: "P2_3", lh: ["Eb2", "Eb3"], rh: ["Eb4", "Ab4", "D5"] },
      { id: "P2_4", lh: ["D2", "D3"], rh: ["G4", "Bb4", "D5"] },
      { id: "P2_5", lh: ["D2", "D3"], rh: ["A4", "Bb4", "D5"] },
      { id: "P2_6", lh: ["D2", "D3"], rh: ["A4", "C5", "Eb5"] },
    ],
  };

  const expansionLoop1: LoopDef = {
    name: "Loop 1",
    caption: "Keep the bottom steady. Raise inner, then top. Shift floor only when full.",
    cells: [
      { id: "E1_1", lh: ["C2", "C3"], rh: ["C4", "Eb4", "G4"] },
      { id: "E1_2", lh: ["C2", "C3"], rh: ["C4", "F4", "Ab4"] },
      { id: "E1_3", lh: ["C2", "C3"], rh: ["C4", "G4", "Bb4"] },
      { id: "E1_4", lh: ["C2", "C3"], rh: ["C4", "Ab4", "C5"] },
      { id: "E1_5", lh: ["C2", "C3"], rh: ["C4", "Bb4", "D5"] },
      { id: "E1_6", lh: ["C2", "C3"], rh: ["C4", "B4", "D5"] },
      { id: "E1_7", lh: ["C2", "C3"], rh: ["Eb4", "G4", "C5"] },
    ],
  };

  const expansionLoop2: LoopDef = {
    name: "Loop 2",
    caption: "Move the bottom up one step. Keep upper shape rising.",
    cells: [
      { id: "E2_1", lh: ["D2", "D3"], rh: ["D4", "F4", "Ab4"] },
      { id: "E2_2", lh: ["D2", "D3"], rh: ["D4", "G4", "Bb4"] },
      { id: "E2_3", lh: ["D2", "D3"], rh: ["D4", "A4", "C5"] },
      { id: "E2_4", lh: ["D2", "D3"], rh: ["D4", "Bb4", "D5"] },
      { id: "E2_5", lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
    ],
  };

  const expansionLoop3: LoopDef = {
    name: "Loop 3",
    caption: "Hold bottom. Let the top climb before widening.",
    cells: [
      { id: "E3_1", lh: ["Eb2", "Eb3"], rh: ["Eb4", "G4", "Bb4"] },
      { id: "E3_2", lh: ["Eb2", "Eb3"], rh: ["Eb4", "Ab4", "C5"] },
      { id: "E3_3", lh: ["Eb2", "Eb3"], rh: ["Eb4", "Bb4", "D5"] },
      { id: "E3_4", lh: ["Eb2", "Eb3"], rh: ["Eb4", "Bb4", "Eb5"] },
      { id: "E3_5", lh: ["Eb2", "Eb3"], rh: ["G4", "Bb4", "Eb5"] },
    ],
  };

  const expansionLoop4: LoopDef = {
    name: "Loop 4",
    caption: "Keep top fixed. Raise bottom stepwise.",
    cells: [
      { id: "E4_1", lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
      { id: "E4_2", lh: ["D2", "D3"], rh: ["G4", "Bb4", "D5"] },
      { id: "E4_3", lh: ["D2", "D3"], rh: ["A4", "C5", "D5"] },
      { id: "E4_4", lh: ["D2", "D3"], rh: ["Bb4", "C5", "D5"] },
    ],
  };

  const dissolveLoop1: LoopDef = {
    name: "Loop 1",
    caption: "Hold bottom and top. Slide only the inner.",
    cells: [
      { id: "D1_1", lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
      { id: "D1_2", lh: ["D2", "D3"], rh: ["F4", "G4", "D5"] },
      { id: "D1_3", lh: ["D2", "D3"], rh: ["F4", "A4", "D5"] },
      { id: "D1_4", lh: ["D2", "D3"], rh: ["F4", "Bb4", "D5"] },
      { id: "D1_5", lh: ["D2", "D3"], rh: ["F4", "C5", "D5"] },
      { id: "D1_6", lh: ["D2", "D3"], rh: ["F4", "C#5", "D5"] },
    ],
  };

  const dissolveLoop2: LoopDef = {
    name: "Loop 2",
  caption: "Hold bottom and top. Slide the inner by semitone, then release inner and top stepwise until only the anchor remains.",
    cells: [
      { id: "D2_1", lh: ["D2", "D3"], rh: ["F4", "C5", "D5"] },
      { id: "D2_2", lh: ["D2", "D3"], rh: ["F4", "C#5", "D5"] },
      { id: "D2_3", lh: ["D2", "D3"], rh: ["C5", "D5"] },
      { id: "D2_4", lh: ["D2", "D3"], rh: ["D5"] },
    ],
  };

  const arrivalWide: LoopDef = {
    name: "Loop 1",
    caption: "Keep bottom steady. Raise inner stepwise. Let space widen.",
    cells: [
      { id: "A1_1", lh: ["D2", "D3"], rh: ["D4", "A4", "D5"] },
      { id: "A1_2", lh: ["D2", "D3"], rh: ["D4", "E4", "A4"] },
      { id: "A1_3", lh: ["D2", "D3"], rh: ["D4", "F4", "A4"] },
      { id: "A1_4", lh: ["D2", "D3"], rh: ["D4", "G4", "B4"] },
      { id: "A1_5", lh: ["D2", "D3"], rh: ["D4", "A4", "D5"] },
    ],
  };

  return {
    PRESSURE: { id: "PRESSURE", title: "Containment", loops: [pressureLoop1, pressureLoop2] },
    EXPANSION: { id: "EXPANSION", title: "Expansion", loops: [expansionLoop1, expansionLoop2, expansionLoop3, expansionLoop4] },
    DISSOLVE: { id: "DISSOLVE", title: "Dissolve", loops: [dissolveLoop1, dissolveLoop2] },
    ARRIVAL: { id: "ARRIVAL", title: "Arrival", loops: [arrivalWide] },
  };
}

// ---------- Transitions (locked) ----------
function buildTransitions(): Record<string, TransitionDef> {
  return {
    T_P_E: {
      id: "T_P_E",
      title: "Transition: Containment → Expansion",
      caption: "Release spike. Widen frame. Shift floor.",
      loopable: false,
      cells: [
        { id: "TPE_1", lh: ["D2", "D3"], rh: ["A4", "C5", "Eb5"] },
        { id: "TPE_2", lh: ["D2", "D3"], rh: ["G4", "Bb4", "D5"] },
        { id: "TPE_3", lh: ["C2", "C3"], rh: ["C4", "Eb4", "G4"] },
      ],
    },
    T_E_D: {
      id: "T_E_D",
      title: "Transition: Expansion → Dissolve",
      caption: "Reduce span. Begin one-note drift.",
      loopable: false,
      cells: [
        { id: "TED_1", lh: ["D2", "D3"], rh: ["D4", "A4", "C5"] },
        { id: "TED_2", lh: ["D2", "D3"], rh: ["F4", "A4", "D5"] },
        { id: "TED_3", lh: ["D2", "D3"], rh: ["F4", "C5", "D5"] },
      ],
    },
    T_D_A: {
      id: "T_D_A",
      title: "Transition: Dissolve → Arrival",
      caption: "Stop drifting. Rebuild stable stack.",
      loopable: false,
      cells: [{ id: "TDA_1", lh: ["D2", "D3"], rh: ["A4", "D5", "F5"] }],
    },
  };
}

// ---------- Scheduling ----------
function scheduleCells(
  cells: Cell[],
  root: Root,
  chunkKey: string,
  blockTitle: string
): ScheduledCell[] {
  const semis = rootToSemis(root);
  const lhMode = lhModeForBlockTitle(blockTitle);

  return cells.map((c) => {
    // base LH from definition
    let lh = normalizeToSharps(transposeNotesSharp(c.lh, semis));
    const rh = normalizeToSharps(transposeNotesSharp(c.rh, semis));

    // Arrival LH engine: held open fifth
    if (lhMode === "HOLD_FIFTH") {
      // Use low anchor from the first LH note (e.g., transposed D2)
      const low = lh[0] ?? transposeNoteSharp("D2", semis);
      const fifth = fifthAbove(low); // D2 -> A2 (or equivalent)
      lh = [low, fifth];
    }

    return { lhNotes: lh, rhNotes: rh, blockTitle, chunkKey, cellId: c.id };
  });
}

// ---------- Presets (finite universe) ----------
const FEW_PRESETS: Array<{ id: ArcId; name: string; desc: string }> = [
  { id: "FULL_ARC", name: "Containment → Expansion → Dissolve → Arrival", desc: "Sustain tension, widen the space, thin the structure, then land." },
  { id: "P_TO_E", name: "Containment → Expansion", desc: "Sustain pressure, then widen the frame." },
  { id: "P_TO_D", name: "Containment → Dissolve", desc: "Hold pressure, then begin one-note drift." },
  { id: "P_TO_A", name: "Containment → Arrival", desc: "Hold pressure, then rebuild a stable stack." },
  { id: "E_TO_D", name: "Expansion → Dissolve", desc: "Widen the frame, then thin the structure." },
  { id: "D_TO_A", name: "Dissolve → Arrival", desc: "Stop drifting, then land into a stable stack." },
  { id: "P_TO_E_TO_D", name: "Containment → Expansion → Dissolve", desc: "Sustain tension, widen the space, then begin drift." },
];

const ONE_PRESETS: Array<{ id: BlockId; name: string; desc: string }> = [
  { id: "PRESSURE", name: "Containment", desc: "Sustain tension." },
  { id: "EXPANSION", name: "Expansion", desc: "Widen the frame." },
  { id: "DISSOLVE", name: "Dissolve", desc: "Thin the structure." },
  { id: "ARRIVAL", name: "Arrival", desc: "Rebuild a stable stack." },
];

// ---------- Build chunks for current preset ----------
function buildChunksForArc(arc: ArcId, root: Root): Chunk[] {
  const blocks = buildBlocks();
  const trs = buildTransitions();
  const out: Chunk[] = [];

  const addAllLoops = (block: BlockId) => {
    const b = blocks[block];
    b.loops.forEach((lp, i) => {
      const key = `${block}_${i + 1}`;
      out.push({
        kind: "LOOP",
        key,
        label: `${b.title} — ${lp.name}`,
        caption: lp.caption,
        blockTitle: b.title,
        cells: scheduleCells(lp.cells, root, key, b.title),
        selectableInPractice: true,
      });
    });
  };

  const addTransition = (tid: keyof ReturnType<typeof buildTransitions>) => {
    const t = trs[tid];
    const key = t.id;
    out.push({
      kind: "TRANSITION",
      key,
      label: t.title,
      caption: t.caption,
      blockTitle: "Transition",
      cells: scheduleCells(t.cells, root, key, "Transition"),
      selectableInPractice: t.loopable,
    });
  };

  if (arc === "FULL_ARC") {
    addAllLoops("PRESSURE");
    addTransition("T_P_E");
    addAllLoops("EXPANSION");
    addTransition("T_E_D");
    addAllLoops("DISSOLVE");
    addTransition("T_D_A");
    addAllLoops("ARRIVAL");
  } else if (arc === "P_TO_E") {
    addAllLoops("PRESSURE");
    addTransition("T_P_E");
    addAllLoops("EXPANSION");
  } else if (arc === "P_TO_D") {
    addAllLoops("PRESSURE");
    addAllLoops("DISSOLVE");
  } else if (arc === "P_TO_A") {
    addAllLoops("PRESSURE");
    addAllLoops("ARRIVAL");
  } else if (arc === "E_TO_D") {
    addAllLoops("EXPANSION");
    addTransition("T_E_D");
    addAllLoops("DISSOLVE");
  } else if (arc === "D_TO_A") {
    addAllLoops("DISSOLVE");
    addTransition("T_D_A");
    addAllLoops("ARRIVAL");
  } else if (arc === "P_TO_E_TO_D") {
    addAllLoops("PRESSURE");
    addTransition("T_P_E");
    addAllLoops("EXPANSION");
    addTransition("T_E_D");
    addAllLoops("DISSOLVE");
  }

  return out;
}

function buildChunksForBlock(block: BlockId, root: Root): Chunk[] {
  const blocks = buildBlocks();
  const b = blocks[block];
  return b.loops.map((lp, i) => {
    const key = `${block}_${i + 1}`;
    return {
      kind: "LOOP",
      key,
      label: `${b.title} — ${lp.name}`,
      caption: lp.caption,
      blockTitle: b.title,
      cells: scheduleCells(lp.cells, root, key, b.title),
      selectableInPractice: true,
    };
  });
}

function usePulsePlayer(args: {
  schedule: ScheduledCell[];
  loop: boolean;
  endSilenceMs?: number;
    beatMs?: number;
  cellMs?: number;

  // NEW
  character?: MotionCharacter;
  onRhPulse?: (notes: string[]) => void;
  onRhClear?: () => void;

  onTick?: (t: { idx: number; item: ScheduledCell | null }) => void;
  onLhPulse?: (notes: string[]) => void;
  onLhClear?: () => void;
}) {
  const {
  schedule,
  loop,
  endSilenceMs = 0,
  character = "STRUCTURAL",
  beatMs = BEAT_MS,
  cellMs = CELL_MS,
  
  onRhPulse,
  onRhClear,
  onTick,
  onLhPulse,
  onLhClear,
} = args;
  const [status, setStatus] = useState<Status>("IDLE");
  const [idx, setIdx] = useState(0);

  const cellTimerRef = useRef<number | null>(null);
  const beatTimersRef = useRef<number[]>([]);
  const audiosRef = useRef<HTMLAudioElement[]>([]);

  const statusRef = useRef<Status>("IDLE");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  
  useEffect(() => {
  const onFirstGesture = () => warmupLiveAudio();
  window.addEventListener("pointerdown", onFirstGesture, { once: true });
  return () => window.removeEventListener("pointerdown", onFirstGesture as any);
}, []);

  function clearCellTimer() {
    if (cellTimerRef.current !== null) {
      window.clearTimeout(cellTimerRef.current);
      cellTimerRef.current = null;
    }
  }

  function clearBeatTimers() {
    for (const t of beatTimersRef.current) window.clearTimeout(t);
    beatTimersRef.current = [];
  }

  function stopAudios() {
  stopLiveAudios(audiosRef.current);
  audiosRef.current = [];
}

  function hardStop(to: Status) {
    stopAudios();
    clearBeatTimers();
    clearCellTimer();
    onLhClear?.();
    setStatus(to);
  }
  function flashRH(notes: string[], holdMs = 140) {
  onRhPulse?.(notes);
  const t = window.setTimeout(() => {
    if (statusRef.current !== "PLAYING") return;
    onRhClear?.();
  }, holdMs);
  beatTimersRef.current.push(t);
}

function flashLH(notes: string[], holdMs = 140) {
  onLhPulse?.(notes);
  const t = window.setTimeout(() => {
    if (statusRef.current !== "PLAYING") return;
    onLhClear?.();
  }, holdMs);
  beatTimersRef.current.push(t);
}

  // LH engine pulses per block (deterministic)
  function lhPulsePlan(cur: ScheduledCell): Array<{ atBeat: number; notes: string[] }> {
  const title = cur.blockTitle;

  const lh = cur.lhNotes;

  const low = lh[0] ? [lh[0]] : [];
  const high = lh[1] ? [lh[1]] : low;
  const octave = lh.length ? lh : [];

    // --------------------
// Containment (Character-driven)
// --------------------
if (title === "Containment") {
  if (character === "STRUCTURAL") {
    return [
      { atBeat: 0, notes: octave },
      { atBeat: 1, notes: octave },
      { atBeat: 2, notes: octave },
      { atBeat: 3, notes: octave },
    ];
  }

  if (character === "ATMOSPHERIC") {
    return [{ atBeat: 0, notes: high }]; // upper floor, beat 1 only
  }

  // ELASTIC + INTERWOVEN
  return [
    { atBeat: 0, notes: high }, // beat 1
    { atBeat: 2, notes: high }, // beat 3
  ];
}

// --------------------
// Expansion (keep state identity, Character changes density)
// --------------------
if (title === "Expansion" || title === "Transition") {
  if (character === "STRUCTURAL") {
    // Stronger floor: 4-beat octave pulse (engine feel)
    return [
      { atBeat: 0, notes: octave },
      { atBeat: 1, notes: octave },
      { atBeat: 2, notes: octave },
      { atBeat: 3, notes: octave },
    ];
  }

  if (character === "ATMOSPHERIC") {
    // Minimal lift: beat 1 only (upper floor)
    return [{ atBeat: 0, notes: high }];
  }

  // ELASTIC + INTERWOVEN: breath floor (beat 1 low, beat 3 high)
  return [
    { atBeat: 0, notes: low },
    { atBeat: 2, notes: high },
  ];
}

// --------------------
// Dissolve (thinning): Character shifts pulse density
// --------------------
if (title === "Dissolve") {
  if (character === "STRUCTURAL") {
    // Clear suspended engine: upper anchor on beat 1 & 3
    return [
      { atBeat: 0, notes: high },
      { atBeat: 2, notes: high },
    ];
  }

  if (character === "ELASTIC") {
    // Breathier dissolve: only beat 3 (your suggested variant)
    return [{ atBeat: 2, notes: high }];
  }

  if (character === "ATMOSPHERIC") {
    // Minimal: beat 1 only
    return [{ atBeat: 0, notes: high }];
  }

  // INTERWOVEN: keep the anchor (same as Structural)
  return [
    { atBeat: 0, notes: high },
    { atBeat: 2, notes: high },
  ];
}

// --------------------
// Arrival (keep destination feel): one hit per bar
// (Arrival voicing per Character is Step 4)
// --------------------
if (title === "Arrival") {
  if (character === "STRUCTURAL") {
    return [{ atBeat: 0, notes: octave }];
  }

  if (character === "ELASTIC") {
    // Elastic Arrival LH: D3–D4 (use the upper floor and octave-up)
    const upper = lh[1] ?? lh[0];
    if (!upper) return [{ atBeat: 0, notes: high }];
    return [{ atBeat: 0, notes: [upper, upOct(upper)] }];
  }

  // Interwoven + Atmospheric: upper floor beat 1 only
  return [{ atBeat: 0, notes: high }];
}

// Fallback
return [
  { atBeat: 0, notes: low },
  { atBeat: 2, notes: high },
];
  }

  function flashOrHoldLh(notes: string[], holdMs: number) {
  onLhPulse?.(notes);

  // holdMs controls how long highlight stays visible
  const t = window.setTimeout(() => {
    if (statusRef.current !== "PLAYING") return;
    onLhClear?.();
  }, holdMs);

  beatTimersRef.current.push(t);
}

  function playCell(cur: ScheduledCell, curIdx: number) {
    // No pedal simulation here — deterministic strikes only.
    // Clean slate each bar: stop any ringing samples.
    stopAudios();
    clearBeatTimers();
    onLhClear?.();

    // RH strike
if (cur.rhNotes.length) {
  const isArrival = cur.blockTitle.includes("Arrival");
  let rhNotes = cur.rhNotes;

  // -------- Arrival overrides --------
  if (isArrival) {
    if (character === "ELASTIC") {
      rhNotes = ["A4", "D5", "F5"];
    }

    if (character === "ATMOSPHERIC") {
      const n = cellIndexFromId(cur.cellId) ?? (curIdx + 1);
      const isLast = n === 5;
      const useDA = isLast || n % 2 === 0;
      rhNotes = useDA ? ["D4", "A4"] : ["A4", "D5"];
    }
  }

  // -------- INTERWOVEN articulation --------
  if (character === "INTERWOVEN") {
    const offsets = [0, 60, 120];
    rhNotes.forEach((note, i) => {
      const t = window.setTimeout(() => {
        if (statusRef.current !== "PLAYING") return;
        audiosRef.current.push(playNoteAudio(note));
        flashRH([note], 140);
      }, offsets[i] ?? 0);
      beatTimersRef.current.push(t);
    });
  }

  // -------- ELASTIC + DISSOLVE alternation --------
  else if (character === "ELASTIC" && cur.blockTitle.includes("Dissolve")) {
    const isEvenCell = curIdx % 2 === 1;
    const notesToPlay = isEvenCell ? rhNotes.slice(0, 2) : rhNotes;
    audiosRef.current.push(...notesToPlay.map((n) => playNoteAudio(n)));
    flashRH(notesToPlay, Math.max(120, cellMs - 40));
  }

  // -------- Default block strike --------
  else {
    audiosRef.current.push(...rhNotes.map((n) => playNoteAudio(n)));
    flashRH(rhNotes, Math.max(120, cellMs - 40));
  }
}

    // LH: schedule strikes according to block engine
    const plan = lhPulsePlan(cur);
    for (const p of plan) {
      const t = window.setTimeout(() => {
        if (statusRef.current !== "PLAYING") return;
        if (p.notes.length) {
  audiosRef.current.push(...p.notes.map((n) => playNoteAudio(n)));

  // Visual behavior:
  // - Arrival: hold highlight for the full bar when striking on beat 1
  // - Others: short flash (percussive)
  const isArrival = cur.blockTitle === "Arrival";
  const shouldHoldFullBar = isArrival && p.atBeat === 0;

  const ARRIVAL_HOLD_MS = 3.5 * beatMs;// from beat 1 through "4 &"
flashOrHoldLh(p.notes, shouldHoldFullBar ? ARRIVAL_HOLD_MS : 140);
}
      }, p.atBeat * beatMs);
      beatTimersRef.current.push(t);
    }
  }

  function tickFrom(nextIdx: number) {
    clearCellTimer();

    if (nextIdx >= schedule.length) {
      if (loop) {
        setIdx(0);
        onTick?.({ idx: 0, item: schedule[0] ?? null });
        if (schedule[0]) playCell(schedule[0], 0);
        cellTimerRef.current = window.setTimeout(() => {
          if (statusRef.current === "PLAYING") tickFrom(1);
        }, schedule[0] ? cellMs : 0);
        return;
      }

      onTick?.({ idx: schedule.length, item: null });
      clearBeatTimers();
      clearCellTimer();

      cellTimerRef.current = window.setTimeout(() => {
        cellTimerRef.current = window.setTimeout(() => {
          hardStop("FINISHED");
        }, endSilenceMs);
      }, 0);

      return;
    }

    setIdx(nextIdx);
    const cur = schedule[nextIdx];
    onTick?.({ idx: nextIdx, item: cur });
    playCell(cur, nextIdx);

    cellTimerRef.current = window.setTimeout(() => {
      if (statusRef.current === "PLAYING") tickFrom(nextIdx + 1);
    }, cellMs);
  }

  function playFromStart() {
    hardStop("STOPPED");
    setStatus("PLAYING");
    tickFrom(0);
  }

  function stop() {
    hardStop("STOPPED");
    setIdx(0);
    onTick?.({ idx: 0, item: schedule[0] ?? null });
  }

  function pauseResume() {
    if (status === "PLAYING") {
      setStatus("PAUSED");
      stopAudios();
      clearBeatTimers();
      clearCellTimer();
      onLhClear?.();
      return;
    }
    if (status === "PAUSED") {
      setStatus("PLAYING");
      tickFrom(idx);
      return;
    }
    playFromStart();
  }

  useEffect(() => {
    return () => {
      stopAudios();
      clearBeatTimers();
      clearCellTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, idx, playFromStart, stop, pauseResume };
}

// ---------- Architecture row renderer (vertical separators, no octaves) ----------

function ChunkRow({
  cells,
  activeCellId,
  character,
}: {
  cells: ScheduledCell[];
  activeCellId: string | null;
  character: MotionCharacter;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
      {cells.map((c, i) => {
        const on = c.cellId === activeCellId;

        const rhDisplay = displayRhNotesForCell(c, character, i);
        const rhText = triadNoOct(rhDisplay);
        const lhText = displayLhLabelForCell(c, character);

        return (
          <div
            key={c.cellId}
            className={["px-2 py-2 text-center text-sm border-l border-r", on ? "bg-black/5 opacity-100" : "opacity-80"].join(" ")}
          >
            <div className="text-xs opacity-60">RH</div>
            <div className="font-medium">{rhText}</div>
            <div className="mt-2 text-xs opacity-60">LH</div>
            <div className="font-medium">{lhText}</div>
          </div>
        );
      })}
    </div>
  );
}


function displayRhNotesForCell(c: ScheduledCell, character: MotionCharacter, absoluteIdx: number) {
  // Default: scheduled RH
  let notes = c.rhNotes;

  // Arrival overrides (match live playCell)
  if (c.blockTitle.includes("Arrival")) {
    if (character === "ELASTIC") {
      return ["A4", "D5", "F5"];
    }
    if (character === "ATMOSPHERIC") {
      const n = cellIndexFromId(c.cellId) ?? (absoluteIdx + 1);
      const isLast = n === 5;
      const useDA = isLast || n % 2 === 0;
      return useDA ? ["D4", "A4"] : ["A4", "D5"];
    }
    // Structural / Interwoven: keep scheduled notes
    return notes;
  }

  // Dissolve + Elastic alternation (triad/dyad)
  if (character === "ELASTIC" && c.blockTitle.includes("Dissolve")) {
    const n = cellIndexFromId(c.cellId) ?? (absoluteIdx + 1);
    const isEvenCell = n % 2 === 0; // 2,4,...
    return isEvenCell ? notes.slice(0, 2) : notes;
  }

  return notes;
}

function displayLhLabelForCell(c: ScheduledCell, character: MotionCharacter) {
  // Uses the same conceptual LH engine as lhPulsePlan (but compact for grid).
  const lh = c.lhNotes;
  const upper = lh[1] ? toFlatBase(lh[1]) : (lh[0] ? toFlatBase(lh[0]) : "");
  const pair = lhNoOct(lh); // e.g. "DD" or "EbEb"

  if (c.blockTitle.includes("Containment")) {
    if (character === "STRUCTURAL") return `${pair} ×4`;
    if (character === "ATMOSPHERIC") return `${upper} (1)`;
    return `${upper} (1&3)`; // Elastic + Interwoven
  }

  if (c.blockTitle.includes("Expansion") || c.blockTitle.includes("Transition")) {
    if (character === "STRUCTURAL") return `${pair} ×4`;
    if (character === "ATMOSPHERIC") return `${upper} (1)`;
    return `${toFlatBase(lh[0] ?? "")} (1) · ${upper} (3)`; // breath floor low@1 high@3
  }

  if (c.blockTitle.includes("Dissolve")) {
    if (character === "ELASTIC") return `${upper} (3)`;
    if (character === "ATMOSPHERIC") return `${upper} (1)`;
    return `${upper} (1&3)`; // Structural + Interwoven
  }

  if (c.blockTitle.includes("Arrival")) {
    if (character === "STRUCTURAL") return `${pair} (1)`;
    if (character === "ELASTIC") return `${upper}${upper} (1)`; // indicates octave feel without digits
    return `${upper} (1)`; // Interwoven + Atmospheric
  }

  return pair;
}

function lhPracticeLabelForBlock(blockTitle: string, character: MotionCharacter): string {
  // Keep labels minimal and playable; no timing jargon beyond beats.

  if (blockTitle.includes("Containment")) {
    if (character === "STRUCTURAL") return "LH: octave pulse (4 beats).";
    if (character === "ATMOSPHERIC") return "LH: upper floor (beat 1).";
    return "LH: upper floor (beat 1 & 3)."; // Elastic + Interwoven
  }

  if (blockTitle.includes("Expansion") || blockTitle.includes("Transition")) {
    if (character === "STRUCTURAL") return "LH: octave pulse (4 beats).";
    if (character === "ATMOSPHERIC") return "LH: upper floor (beat 1).";
    return "LH: breath floor (low on 1, high on 3)."; // Elastic + Interwoven
  }

  if (blockTitle.includes("Dissolve")) {
    if (character === "ELASTIC") return "LH: upper anchor (beat 3).";
    if (character === "ATMOSPHERIC") return "LH: upper anchor (beat 1).";
    return "LH: upper anchor (beat 1 & 3)."; // Structural + Interwoven
  }

  if (blockTitle.includes("Arrival")) {
    if (character === "STRUCTURAL") return "LH: octave anchor (beat 1).";
    if (character === "ELASTIC") return "LH: octave anchor (beat 1)."; // D3–D4 feel
    return "LH: upper floor (beat 1)."; // Interwoven + Atmospheric
  }

  return "LH: pulse.";
}
async function exportMotionControlClip(opts: {
  title: string;
  schedule: ScheduledCell[];
  chunks: Chunk[];
  kind: "DEMO" | "PRACTICE";
  layout?: "FULL" | "DEMO_MIN";
  character: MotionCharacter;
}) {
  const { title, schedule, chunks, kind, layout = "FULL", character } = opts;
  if (!schedule.length) throw new Error("No schedule");

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

  // media streams
  const exportDst = ac.createMediaStreamDestination();
  const stream = (canvas as any).captureStream(FPS) as MediaStream;
  const mixed = new MediaStream([...stream.getVideoTracks(), ...exportDst.stream.getAudioTracks()]);

  const mimeType = pickRecorderMime();
  const chunksOut: BlobPart[] = [];
  const rec = new MediaRecorder(mixed, { mimeType });
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunksOut.push(e.data);
  };

  const DEMO_SPEED = kind === "DEMO" ? 0.75 : 1; 
// 0.75 = 25% faster (lower time per bar)

const CELL_SEC = (CELL_MS / 1000) * DEMO_SPEED;
const BEAT_SEC = (BEAT_MS / 1000) * DEMO_SPEED;
const contentSec = schedule.length * CELL_SEC;
const tailSec = 2.0; // keep video alive while audio decays
const totalSec = contentSec + tailSec;

  // ----- schedule audio deterministically -----
  const t0 = ac.currentTime + 0.5;
  const t0Wall = performance.now() + 500; // must match the +0.5s audio offset
function exportRhNotesForCell(cell: ScheduledCell, idxInSequence: number): string[] {
  let rhNotes = cell.rhNotes;

  // Arrival overrides (match live)
  if (cell.blockTitle.includes("Arrival")) {
    if (character === "ELASTIC") {
      return ["A4", "D5", "F5"];
    }
    if (character === "ATMOSPHERIC") {
      // AD ↔ DA with final grounding (DA on last)
      const n = cellIndexFromId(cell.cellId) ?? (idxInSequence + 1);
      const isLast = n === 5; // A1_5
      const useDA = isLast || n % 2 === 0;
      return useDA ? ["D4", "A4"] : ["A4", "D5"];
    }
    return rhNotes; // Structural / Interwoven
  }

  // Dissolve + Elastic alternation (triad/dyad)
  if (character === "ELASTIC" && cell.blockTitle.includes("Dissolve")) {
    const n = cellIndexFromId(cell.cellId) ?? (idxInSequence + 1);
    const isEven = n % 2 === 0; // 2,4,...
    return isEven ? rhNotes.slice(0, 2) : rhNotes;
  }

  return rhNotes;
}
// Export-time chunks (static map should reflect RH overrides)
const chunksForExport: Chunk[] = chunks.map((ch) => ({
  ...ch,
  cells: ch.cells.map((c, i) => ({
    ...c,
    rhNotes: exportRhNotesForCell(c, i),
  })),
}));
  // LH engine: strikes list per bar (seconds from bar start) + which notes
  function lhPlanForCell(item: ScheduledCell): Array<{ atSec: number; notes: string[] }> {
    const title = item.blockTitle;
    const lh = item.lhNotes;

    const low = lh[0] ? [lh[0]] : [];
    const high = lh[1] ? [lh[1]] : low;
    const octave = lh;

    // Containment — LH per Character (match stand-alone behavior)
if (title === "Containment") {
  if (character === "STRUCTURAL") {
    return [
      { atSec: 0 * BEAT_SEC, notes: octave },
      { atSec: 1 * BEAT_SEC, notes: octave },
      { atSec: 2 * BEAT_SEC, notes: octave },
      { atSec: 3 * BEAT_SEC, notes: octave },
    ];
  }

  // Atmospheric: upper floor, beat 1 only
  if (character === "ATMOSPHERIC") {
    return [{ atSec: 0 * BEAT_SEC, notes: high }];
  }

  // Elastic + Interwoven: upper floor, beat 1 & 3
  return [
    { atSec: 0 * BEAT_SEC, notes: high },
    { atSec: 2 * BEAT_SEC, notes: high },
  ];
}

    // Expansion + Transition: beat 1 low, beat 3 high
    if (title === "Expansion" || title === "Transition") {
      return [
        { atSec: 0 * BEAT_SEC, notes: low },
        { atSec: 2 * BEAT_SEC, notes: high },
      ];
    }

    // Dissolve: single note (upper) beat 1 + beat 3
    if (title === "Dissolve") {
      return [
        { atSec: 0 * BEAT_SEC, notes: high },
        { atSec: 2 * BEAT_SEC, notes: high },
      ];
    }

    // Arrival: octave once on beat 1
    if (title === "Arrival") {
      return [{ atSec: 0 * BEAT_SEC, notes: octave }];
    }

    return [{ atSec: 0, notes: low }];
  }

  // schedule buffers
  for (let i = 0; i < schedule.length; i++) {
    const cell = schedule[i];
    const isDemoMin = layout === "DEMO_MIN";
    const barStart = t0 + i * CELL_SEC;

    
    // RH: strike at bar start (Interwoven staggers like Live)
const rhNotes = exportRhNotesForCell(cell, i);
const rhOffsetsSec =
  character === "INTERWOVEN" ? [0, 0.06, 0.12] : [0, 0, 0]; // 60ms/120ms

for (let k = 0; k < rhNotes.length; k++) {
  const n = rhNotes[k];
  const off = rhOffsetsSec[k] ?? 0;
  const at = barStart + off;

  loadBufferExport(n).then((buf) => {
    const src = ac.createBufferSource();
    src.buffer = buf;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(1.0, at + 0.01);
    g.gain.setTargetAtTime(0.0001, at + 0.35, 0.2);

    src.connect(g);
    g.connect(exportDst);

    try {
      src.start(at);
      src.stop(at + 1.0);
    } catch {}
  });
}

    // LH: strikes per plan
    const plan = lhPlanForCell(cell);
    for (const p of plan) {
      const at = barStart + p.atSec;
      for (const n of p.notes) {
        loadBufferExport(n).then((buf) => {
          const src = ac.createBufferSource();
          src.buffer = buf;
          const g = ac.createGain();
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(1.0, at + 0.01);
          g.gain.setTargetAtTime(0.0001, at + 0.35, 0.2);
          src.connect(g);
          g.connect(exportDst);
          try {
            src.start(at);
            src.stop(at + 1.0);
          } catch {}
        });
      }
    }
  }

  function wrapIntoTwoLinesCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): [string, string] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return ["", ""];

  let line1 = "";
  let cut = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line1 ? `${line1} ${words[i]}` : words[i];
    if (ctx.measureText(test).width <= maxWidth) {
      line1 = test;
      cut = i + 1;
    } else {
      break;
    }
  }

  const line2 = words.slice(cut).join(" ");
  return [line1, line2];
}
function buildArchitectureLines(allChunks: Chunk[]): string[] {
  // Compact static architecture view
  // Example line: "Held Containment — Loop 1"
  return allChunks.map((c) => c.label);
}

  // ----- render loop -----
  rec.start();
  

  const drawFrame = () => {
    const isDemoMin = layout === "DEMO_MIN";
  const elapsed = Math.max(0, (performance.now() - t0Wall) / 1000);

  const activeTime = Math.min(elapsed, Math.max(0, contentSec - 1e-6));
const cellIdx = Math.min(schedule.length - 1, Math.floor(activeTime / CELL_SEC));
  const cell = schedule[cellIdx];
  const withinBar = activeTime - cellIdx * CELL_SEC;

  // Owning chunk (single source of truth, always correct)
  const owningChunk =
    chunks.find((c) => c.cells.some((cc) => cc.cellId === cell.cellId)) ?? null;

  // RH highlight held for whole bar
  const rhBase = exportRhNotesForCell(cell, cellIdx);

// RH highlight: Interwoven flashes note-by-note, others show full chord
const rhHighlight = (() => {
  if (character !== "INTERWOVEN") return rhBase;

  // match offsets above (0, 60ms, 120ms) with a short flash window
  const flash = 0.14; // sec
  const offs = [0, 0.06, 0.12];

  for (let k = offs.length - 1; k >= 0; k--) {
    const start = offs[k];
    const end = start + flash;
    if (withinBar >= start && withinBar < end) {
      const note = rhBase[k];
      return note ? [note] : [];
    }
  }
  return [];
})();

  // LH highlight windows (Arrival holds through 4&)
  // LH highlight windows (derived from the SAME lhPlanForCell used for audio)
const lhHighlight = (() => {
  const flash = 0.14; // seconds
  const arrivalHold = 3.5 * BEAT_SEC; // beat 1 → 4&

  // Build windows from the exact strike plan (character-aware)
  const plan = lhPlanForCell(cell); // returns [{ atSec, notes }, ...]
  const windows = plan.map((p) => {
    const isArrival = cell.blockTitle.includes("Arrival");
    const hold = isArrival && p.atSec === 0 ? arrivalHold : flash;
    return { start: p.atSec, end: p.atSec + hold, notes: p.notes };
  });

  // Find the last matching window (most recent strike wins)
  for (let i = windows.length - 1; i >= 0; i--) {
    const w = windows[i];
    if (withinBar >= w.start && withinBar < w.end) return w.notes;
  }
  return [];
})();

  // ----- draw background -----
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

  const Y_OFFSET = 40 * SCALE;

  // Title (wrap max 2 lines if needed)
ctx.save();
ctx.fillStyle = "#111827";
ctx.font = `800 ${54 * SCALE}px system-ui, -apple-system, sans-serif`;
ctx.textBaseline = "top";

const titleMaxW = FRAME_W * SCALE * 0.9;
const centerX = (FRAME_W * SCALE) / 2;
const titleY = FRAME_H * SCALE * 0.08 + Y_OFFSET;

// measure in left mode for wrapping
ctx.textAlign = "left";
const [t1, t2] = wrapIntoTwoLinesCanvas(ctx, title, titleMaxW);

// center line 1
const w1 = ctx.measureText(t1).width;
ctx.fillText(t1, centerX - w1 / 2, titleY);

// center line 2 (if exists)
if (t2) {
  const w2 = ctx.measureText(t2).width;
  ctx.fillText(t2, centerX - w2 / 2, titleY + 60 * SCALE);
}

ctx.restore();

  // Synced Loop / Transition label (ONE line)
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(17,24,39,0.85)";
  ctx.font = `800 ${34 * SCALE}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(owningChunk?.label ?? "", (FRAME_W * SCALE) / 2, FRAME_H * SCALE * 0.17 + Y_OFFSET);
  ctx.restore();

  if (!isDemoMin) {
  // Caption (wrap 2 lines, safe width)
  const caption =
    kind === "PRACTICE"
      ? `LH: ${lhPracticeLabelForBlock(cell.blockTitle, character).replace(/^LH:\s*/, "")} RH: ${owningChunk?.caption ?? ""}`
      : owningChunk?.caption ?? "";

  ctx.save();
  ctx.fillStyle = "rgba(17,24,39,0.75)";
  ctx.font = `700 ${28 * SCALE}px system-ui, -apple-system, sans-serif`;

  const capY = FRAME_H * SCALE * 0.22 + Y_OFFSET;
  const capMaxW = FRAME_W * SCALE * 0.88;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const [l1, l2] = wrapIntoTwoLinesCanvas(ctx, caption, capMaxW);

  const capW1 = ctx.measureText(l1).width;
  const capX1 = (FRAME_W * SCALE) / 2 - capW1 / 2;
  ctx.fillText(l1, capX1, capY);

  if (l2) {
    const capW2 = ctx.measureText(l2).width;
    const capX2 = (FRAME_W * SCALE) / 2 - capW2 / 2;
    ctx.fillText(l2, capX2, capY + 34 * SCALE);
  }

  ctx.restore();
}

  // Keyboard
  // Keyboard
const KEYBOARD_Y = (isDemoMin ? FRAME_H * SCALE * 0.26 : FRAME_H * SCALE * 0.3) + Y_OFFSET;

drawKeyboardCanvasMC({
  ctx,
  x: FRAME_W * SCALE * 0.04,
  y: KEYBOARD_Y,
  w: FRAME_W * SCALE * 0.92,
  rhNotes: rhHighlight,
  lhNotes: lhHighlight,
  showLabels: !isDemoMin && kind === "PRACTICE",
});

// Under-keyboard caption for DEMO_MIN
if (isDemoMin) {
  const demoCaption = owningChunk?.caption ?? "";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(17,24,39,0.78)";
  ctx.font = `800 ${30 * SCALE}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(demoCaption, (FRAME_W * SCALE) / 2, KEYBOARD_Y + 360 * SCALE);
  ctx.restore();
}

if (!isDemoMin) {
  // Current chunk row (highlighted)
  const baseRowCells = owningChunk?.cells ?? [];
const rowCells = baseRowCells.map((c, i) => ({
  ...c,
  rhNotes: exportRhNotesForCell(c, i),
}));
  const ROW_Y = KEYBOARD_Y + 260 * SCALE;
  drawCellRowCanvas({
    ctx,
    x: FRAME_W * SCALE * 0.06,
    y: ROW_Y,
    w: FRAME_W * SCALE * 0.88,
    cells: rowCells,
    activeCellId: cell.cellId,
    scale: SCALE,
    character,
  });

  // Full architecture map (STATIC)
  
}

  if (elapsed < totalSec) {
    requestAnimationFrame(drawFrame);
  } else {
    rec.stop();
  }
};
  function drawFullArchitectureMapCanvas(opts: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  chunks: Chunk[];
  activeCellId: string | null;
  scale: number;
  character: MotionCharacter;
}) {
  const { ctx, x, y, w, chunks, activeCellId, scale, character } = opts;

  // Layout
  const rowGap = 14 * scale;
  const labelH = 22 * scale;
  const cellsH = 78 * scale;

  let cy = y;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  for (const ch of chunks) {
    // Chunk label
    ctx.fillStyle = "rgba(17,24,39,0.55)";
    ctx.font = `700 ${22 * scale}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(ch.label, x, cy);

    cy += labelH;

    
    // Cells row
const cells = ch.cells;
const n = Math.max(1, cells.length);
const gap = 6 * scale;

// New: reserve a small label column for "RH"/"LH"
const labelColW = 34 * scale;

// cells start after label column
const cellsX = x + labelColW;
const cellW = (w - labelColW - gap * (n - 1)) / n;

// Row labels (once)
ctx.fillStyle = "rgba(17,24,39,0.60)";
ctx.font = `700 ${18 * scale}px system-ui, -apple-system, sans-serif`;
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.fillText("RH", x, cy + 10 * scale);
ctx.fillText("LH", x, cy + 42 * scale);

// Vertical separators + optional active fill (activeCellId is null in static export)
for (let i = 0; i < cells.length; i++) {
  const c = cells[i];
  const cx = cellsX + i * (cellW + gap);
  const on = c.cellId === activeCellId;

  if (on) {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(cx, cy, cellW, cellsH);
  }

  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + cellsH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + cellW, cy);
  ctx.lineTo(cx + cellW, cy + cellsH);
  ctx.stroke();
}

// Values inside cells (two lines: RH value, LH value)
ctx.fillStyle = "rgba(17,24,39,0.90)";
ctx.font = `800 ${22 * scale}px system-ui, -apple-system, sans-serif`;
ctx.textAlign = "center";
ctx.textBaseline = "top";

for (let i = 0; i < cells.length; i++) {
  const c = cells[i];
  const cx = cellsX + i * (cellW + gap);
  const centerX = cx + cellW / 2;

  const rhText = triadNoOct(c.rhNotes);
  const lhText = displayLhLabelForCell(c, character);

  ctx.fillText(rhText, centerX, cy + 10 * scale);
  ctx.fillText(lhText, centerX, cy + 42 * scale);
}

    ctx.textAlign = "left";
    cy += cellsH + rowGap;
  }

  ctx.restore();
}

  requestAnimationFrame(drawFrame);

  const recorded: Blob = await new Promise((res) => {
    rec.onstop = () => {
      const blob = new Blob(chunksOut, { type: mimeType || "video/webm" });
      res(blob);
    };
  });

  const outBlob = await convertToMp4Server(recorded);
  return outBlob;
}

// ---------- Page ----------
export default function MotionControlFullArcPage() {
  

  // Section 1
  const [mode, setMode] = useState<Mode>("FEW");
  const [oneIdx, setOneIdx] = useState(0);
  const [fewIdx, setFewIdx] = useState(0);

  // Section 4 root selector
  const [root, setRoot] = useState<Root>("C");
  const [character, setCharacter] = useState<MotionCharacter>("STRUCTURAL");
const CHARACTERS: MotionCharacter[] = ["STRUCTURAL", "ELASTIC", "INTERWOVEN", "ATMOSPHERIC"];

function characterLabel(c: MotionCharacter) {
  if (c === "STRUCTURAL") return "Structural";
  if (c === "ELASTIC") return "Elastic";
  if (c === "INTERWOVEN") return "Interwoven";
  return "Atmospheric";
}

function prevCharacter() {
  const i = Math.max(0, CHARACTERS.indexOf(character));
  const next = (i - 1 + CHARACTERS.length) % CHARACTERS.length;
  setCharacter(CHARACTERS[next]);
}

function nextCharacter() {
  const i = Math.max(0, CHARACTERS.indexOf(character));
  const next = (i + 1) % CHARACTERS.length;
  setCharacter(CHARACTERS[next]);
}


  
  const [isExporting, setIsExporting] = useState(false);
const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Practice: user selects start loop (loops only)
  const [practiceStartLoopIdx, setPracticeStartLoopIdx] = useState(0);

  const activePreset = mode === "ONE" ? ONE_PRESETS[oneIdx] : FEW_PRESETS[fewIdx];
const presetLabel = activePreset.name;
  // Build full chunk list for current preset (single source of truth)
  const chunks: Chunk[] = useMemo(() => {
    if (mode === "ONE") return buildChunksForBlock(activePreset.id as BlockId, root);
    return buildChunksForArc(activePreset.id as ArcId, root);
  }, [mode, activePreset.id, root]);

  // Flatten full sequence (for Demo + Practice run-to-end)
  const fullSequence: ScheduledCell[] = useMemo(() => chunks.flatMap((c) => c.cells), [chunks]);

  // Selectable loops (no transitions)
  const selectableLoops: Chunk[] = useMemo(() => chunks.filter((c) => c.selectableInPractice), [chunks]);

  // Keep practiceStartLoopIdx valid
  useEffect(() => {
    if (!selectableLoops.length) {
      setPracticeStartLoopIdx(0);
      return;
    }
    if (practiceStartLoopIdx >= selectableLoops.length) setPracticeStartLoopIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oneIdx, fewIdx, root]);

  const selectedStartLoop = selectableLoops[practiceStartLoopIdx] ?? null;

  // Compute start index into fullSequence
  const practiceStartIndex = useMemo(() => {
    if (!selectedStartLoop?.cells?.length) return 0;
    const firstCellId = selectedStartLoop.cells[0].cellId;
    const idx = fullSequence.findIndex((c) => c.cellId === firstCellId);
    return idx >= 0 ? idx : 0;
  }, [selectedStartLoop, fullSequence]);

  // Practice schedule: from selected loop → end (ONE PASS)
  const practiceSchedule = useMemo(() => {
    return fullSequence.slice(practiceStartIndex);
  }, [fullSequence, practiceStartIndex]);

  // Demo schedule: full sequence (ONE PASS)
  const demoSchedule = fullSequence;

  // Demo UI state (follows owning chunk)
  const [demoUI, setDemoUI] = useState<{
  motionName: string;
  chunkLabel: string;
  caption: string;

  // strike-driven highlight channels
  rhPulse: string[];
  lhPulse: string[];

  // stable reference for non-interwoven modes
  rhHeld: string[];

  activeCellId: string | null;
}>({
  motionName: "",
  chunkLabel: "",
  caption: "",
  rhPulse: [],
  lhPulse: [],
  rhHeld: [],
  activeCellId: null,
});

  // Practice UI state (also follows owning chunk while running to end)
  const [practiceUI, setPracticeUI] = useState<{
  motionName: string;
  chunkLabel: string;
  caption: string;
  lhPulse: string[]; // NEW
  rh: string[];
  activeCellId: string | null;
  isTransitionActive: boolean;
}>({ motionName: "", chunkLabel: "", caption: "", lhPulse: [], rh: [], activeCellId: null, isTransitionActive: false });

  // Players
  const demoPlayer = usePulsePlayer({
  schedule: demoSchedule,
  loop: false,
  endSilenceMs: END_SILENCE_MS,
  character,
  beatMs: DEMO_BEAT_MS,
cellMs: DEMO_CELL_MS,


onRhPulse: (notes) => setDemoUI((s) => ({ ...s, rhPulse: notes })),
onRhClear: () => setDemoUI((s) => ({ ...s, rhPulse: [] })),
onLhPulse: (notes) => setDemoUI((s) => ({ ...s, lhPulse: notes })),
onLhClear: () => setDemoUI((s) => ({ ...s, lhPulse: [] })),

  
  onTick: ({ item }) => {
  if (!item) {
    setDemoUI((s) => ({
      ...s,
      motionName: "",
      chunkLabel: "",
      caption: "",
      rhHeld: [],
      rhPulse: [],
      lhPulse: [],
      activeCellId: null,
    }));
    return;
  }

  const owningChunk =
  chunks.find((c) => c.cells.some((cc) => cc.cellId === item.cellId)) ?? null;

  setDemoUI((s) => ({
    ...s,
    motionName: owningChunk?.blockTitle ?? "",
    chunkLabel: owningChunk?.label ?? "",
    caption: owningChunk?.caption ?? "",
    rhHeld: item.rhNotes,
    activeCellId: item.cellId,
  }));
},
});

  const practicePlayer = usePulsePlayer({
  schedule: practiceSchedule,
  loop: false,
  endSilenceMs: END_SILENCE_MS,
  character,

  onLhPulse: (notes) =>
    setPracticeUI((s) => ({ ...s, lhPulse: notes })),

  onLhClear: () =>
    setPracticeUI((s) => ({ ...s, lhPulse: [] })),

  onTick: ({ item }) => {
    if (!item) {
      setPracticeUI((s) => ({
        ...s,
        rh: [],
        lhPulse: [],
        activeCellId: null,
        isTransitionActive: false,
      }));
      return;
    }

    // ✅ Declare owningChunk BEFORE using it
    const owningChunk =
      chunks.find((c) => c.key === item.chunkKey) ?? null;

    const blockTitle = owningChunk?.blockTitle ?? "Transition";
    const rhCaption = owningChunk?.caption ?? "";
    const lhCaption = lhPracticeLabelForBlock(blockTitle, character);
    const isTransition = owningChunk?.kind === "TRANSITION";

    setPracticeUI((s) => ({
      ...s,
      motionName: blockTitle,
      chunkLabel: owningChunk?.label ?? "",
      caption: `${lhCaption} RH: ${rhCaption}`,
      rh: item.rhNotes,
      activeCellId: item.cellId,
      isTransitionActive: Boolean(isTransition),
    }));
  },
});

  // Stop both players when preset/root/start-loop changes (no autoplay)
  useEffect(() => {
    demoPlayer.stop();
    practicePlayer.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, oneIdx, fewIdx, root, practiceStartLoopIdx]);

  // Section 1 preset navigation
  function prevPreset() {
    if (mode === "ONE") setOneIdx((v) => (v - 1 + ONE_PRESETS.length) % ONE_PRESETS.length);
    else setFewIdx((v) => (v - 1 + FEW_PRESETS.length) % FEW_PRESETS.length);
    setPracticeStartLoopIdx(0);
  }
  function nextPreset() {
    if (mode === "ONE") setOneIdx((v) => (v + 1) % ONE_PRESETS.length);
    else setFewIdx((v) => (v + 1) % FEW_PRESETS.length);
    setPracticeStartLoopIdx(0);
  }

  // Practice: start loop navigation (loops only)
  function prevLoop() {
    if (!selectableLoops.length) return;
    setPracticeStartLoopIdx((v) => (v - 1 + selectableLoops.length) % selectableLoops.length);
    practicePlayer.stop();
  }
  function nextLoop() {
    if (!selectableLoops.length) return;
    setPracticeStartLoopIdx((v) => (v + 1) % selectableLoops.length);
    practicePlayer.stop();
  }
async function onDownloadDemo() {
  if (isExporting) return;
  setIsExporting(true);
  setExportMsg("Preparing Demo…");

  try {
    demoPlayer.stop();
    practicePlayer.stop();

    const safeRoot = root;
    const title = `Demo — ${presetLabel} — ${safeRoot}`;

    const blob = await exportMotionControlClip({
      title,
      schedule: demoSchedule,
      chunks,
      kind: "DEMO",
      layout: "DEMO_MIN",
      character,
    });

    downloadBlob(blob, `${title}.mp4`);
    setExportMsg(null);
  } catch (e) {
    console.error("[export demo] failed", e);
    setExportMsg("Export failed. Please try again.");
  } finally {
    setIsExporting(false);
    window.setTimeout(() => setExportMsg(null), 1200);
  }
}

  async function onDownloadPractice() {
  if (isExporting) return;
  setIsExporting(true);
  setExportMsg("Preparing Practice…");

  try {
    // Stop live playback to avoid confusion
    demoPlayer.stop();
    practicePlayer.stop();

    const safeRoot = root;
    const title = `Practice — ${presetLabel} — ${characterLabel(character)} — ${safeRoot}`;


    const practiceBlob = await exportMotionControlClip({
      title,
      schedule: practiceSchedule,
      chunks,
      kind: "PRACTICE",
      character,
    });

    downloadBlob(practiceBlob, `${title}.mp4`);
    setExportMsg(null);
  } catch (e) {
    console.error("[export] failed", e);
    setExportMsg("Export failed. Please try again.");
  } finally {
    setIsExporting(false);
    window.setTimeout(() => setExportMsg(null), 1200);
  }
}

  // Architecture: active chunk for highlighting while playing Practice/Demo
  const practiceActiveChunk = useMemo(() => {
    if (!practiceUI.activeCellId) return null;
    return chunks.find((ch) => ch.cells.some((c) => c.cellId === practiceUI.activeCellId)) ?? null;
  }, [chunks, practiceUI.activeCellId]);

  const demoActiveChunk = useMemo(() => {
    if (!demoUI.activeCellId) return null;
    return chunks.find((ch) => ch.cells.some((c) => c.cellId === demoUI.activeCellId)) ?? null;
  }, [chunks, demoUI.activeCellId]);

  const ROOTS: Root[] = ["C", "D", "Eb", "F"];
    // Gate is query-param only (no cookies/localStorage)
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [gateAmt, setGateAmt] = useState("");
  const [gateIntent, setGateIntent] = useState("");
  const [gateUnlockHref, setGateUnlockHref] = useState("/motion-control/unlock");

  useEffect(() => {
    const qs = typeof window !== "undefined" ? window.location.search : "";
    const p = new URLSearchParams(qs);

    setGateUnlocked(p.get("unlocked") === "1");
    setGateAmt(p.get("amt") ?? "");
    setGateIntent(p.get("intent") ?? "");
    setGateUnlockHref(`/motion-control/unlock${qs}`);
  }, []);

    if (!gateUnlocked) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="text-sm uppercase tracking-wide opacity-70">Motion Control</div>
        <h1 className="mt-2 text-3xl font-semibold">Full Arc</h1>
        <p className="mt-3 leading-7 opacity-90">
          Four motion states. Seven fixed arcs. Controlled transitions.
        </p>

        <section className="mt-6 rounded-2xl border p-5">
          <div className="text-sm uppercase tracking-wide opacity-70">Locked</div>
          <h2 className="mt-2 text-xl font-semibold">Unlock required</h2>
          <p className="mt-2 leading-7 opacity-90">
            This page contains the complete system: all states, all transitions, and the full architecture map.
          </p>

          <div className="mt-4 flex flex-col gap-2">
  <Link
    href={gateUnlockHref}
    className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium"
  >
    Go to Unlock
  </Link>

            <Link href="/motion-control" className="text-sm underline opacity-80">
              Back to Containment
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
            <header className="mb-8">
        <div className="text-sm uppercase tracking-wide opacity-70">Motion Control</div>
        <h1 className="mt-2 text-3xl font-semibold">Full Arc</h1>
        <p className="mt-3 leading-7 opacity-90">
          Four motion states. Seven fixed arcs. Controlled transitions.
        </p>
      </header>
      {/* SECTION 1 — Selector (simplified) */}
      <section className="mb-8 rounded-2xl border p-4">
        


        <div className="flex flex-wrap items-center gap-2">
  <button
    type="button"
    onClick={() => { setMode("ONE"); setPracticeStartLoopIdx(0); }}
    className={[
      "rounded-full px-3 py-1 text-sm transition border",
      mode === "ONE" ? "bg-white/15 border-white/20 opacity-100" : "opacity-70 hover:opacity-100",
    ].join(" ")}
  >
    Control one
  </button>

  <button
    type="button"
    onClick={() => { setMode("FEW"); setPracticeStartLoopIdx(0); }}
    className={[
      "rounded-full px-3 py-1 text-sm transition border",
      mode === "FEW" ? "bg-white/15 border-white/20 opacity-100" : "opacity-70 hover:opacity-100",
    ].join(" ")}
  >
    Control few
  </button>

  
</div>
        <div className="mt-4 space-y-2">
          <div className="text-sm opacity-70">Preset</div>
          <div className="text-lg font-medium">{activePreset.name}</div>
          <div className="text-sm opacity-85">{activePreset.desc}</div>

          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={prevPreset} className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5">
              ◀
            </button>

            <div className="text-sm opacity-80">
              {mode === "ONE"
                ? `${oneIdx + 1} / ${ONE_PRESETS.length}`
                : `${fewIdx + 1} / ${FEW_PRESETS.length}`}
            </div>

            <button type="button" onClick={nextPreset} className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5">
              ▶
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Immersion (Demo) */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="mt-2 text-xs text-neutral-500">
  <span className="font-medium">Audio note:</span>{" "}
  If playback feels uneven, press Stop and refresh once.
</div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-medium">
  Demo — {presetLabel}
</div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={demoPlayer.pauseResume}
              className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
            >
              {demoPlayer.status === "PLAYING" ? "Pause" : demoPlayer.status === "PAUSED" ? "Resume" : "Play once"}
            </button>

            <button
              type="button"
              onClick={demoPlayer.stop}
              className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
            >
              Stop
            </button>
          </div>
        </div>

        {/* Above keyboard: active Loop / Transition label */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
  <div className="text-sm opacity-90">
    {demoUI.chunkLabel || " "}
  </div>

  
</div>

        <KeyboardMotionControl
          activeChordSymbol={null}
          emotion={PALETTE}
          emotionLabel="Motion Control"
          hideHeaderTitle
          highlightColorOverride={RH_COLOR}
          highlightNotesPrimary={demoUI.rhPulse.length ? demoUI.rhPulse : demoUI.rhHeld}
highlightNotesSecondary={demoUI.lhPulse}
          highlightColorSecondary={LH_COLOR}
          noteLabelMapOverride={SHARP_TO_FLAT_LABELS}
          showPrimaryLabels={false}
          showSecondaryLabels={false}
        />

        {/* Under keyboard: active chunk caption */}
        <div className="mt-2 text-sm opacity-90">{demoUI.caption || " "}</div>

        <div className="ml-auto flex items-center gap-3">
  <div className="text-sm opacity-70">Character</div>

  <button
    type="button"
    onClick={prevCharacter}
    className="rounded-xl border px-2 py-1 text-sm hover:bg-black/5"
    aria-label="Previous character"
  >
    ◀
  </button>

  <div className="min-w-[100px] text-center text-sm font-medium">
    {characterLabel(character)}
  </div>

  <button
    type="button"
    onClick={nextCharacter}
    className="rounded-xl border px-2 py-1 text-sm hover:bg-black/5"
    aria-label="Next character"
  >
    ▶
  </button>
</div>
      </section>

      {/* SECTION 3 — Execution (Practice) */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="mt-2 text-xs text-neutral-500">
  <span className="font-medium">Audio note:</span>{" "}
  If playback feels uneven, press Stop and refresh once.
</div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-medium">
  Practice — {presetLabel}
</div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={practicePlayer.pauseResume}
              className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
            >
              {practicePlayer.status === "PLAYING" ? "Pause" : practicePlayer.status === "PAUSED" ? "Resume" : "Play once"}
            </button>

            <button
              type="button"
              onClick={practicePlayer.stop}
              className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-2">
  <button
    type="button"
    onClick={prevLoop}
    className="rounded-xl border px-3 py-1 text-sm hover:bg-black/5"
  >
    ◀
  </button>

  <div className="text-sm font-medium opacity-90 px-2">
    {practiceUI.chunkLabel || selectedStartLoop?.label || " "}
  </div>

  <button
    type="button"
    onClick={nextLoop}
    className="rounded-xl border px-3 py-1 text-sm hover:bg-black/5"
  >
    ▶
  </button>
</div>

        {practicePlayer.status === "STOPPED" || practicePlayer.status === "IDLE" ? (
  <div className="mb-2 text-sm opacity-80">
    Start: {selectedStartLoop?.label ?? " "}
  </div>
) : null}

        <KeyboardMotionControl
          activeChordSymbol={null}
          emotion={PALETTE}
          emotionLabel="Motion Control"
          hideHeaderTitle
          highlightColorOverride={RH_COLOR}
          highlightNotesPrimary={practiceUI.rh}
          highlightNotesSecondary={practiceUI.lhPulse}
          highlightColorSecondary={LH_COLOR}
          noteLabelMapOverride={SHARP_TO_FLAT_LABELS}
          showPrimaryLabels
          showSecondaryLabels
        />

        {/* Cells: show current active chunk grid (updates across boundaries, including transitions) */}
        <div className="mt-4">
          {practiceActiveChunk?.cells?.length ? (
            <ChunkRow cells={practiceActiveChunk.cells} activeCellId={practiceUI.activeCellId} character={character} />
          ) : (
            <div className="text-sm opacity-70">No chunk.</div>
          )}
        </div>

        {/* Caption follows active chunk while running */}
        <div className="mt-3 text-sm opacity-90">{practiceUI.caption || " "}</div>
      </section>

      {/* SECTION 4 — Architecture Map + Root selector */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 text-lg font-medium">Architecture</div>

        <div className="space-y-6">
          {chunks.map((ch) => (
            <div key={ch.key} className="space-y-2">
              <div className="text-sm font-medium opacity-90">{ch.label}</div>
              <div className="text-sm opacity-80">{ch.caption}</div>
              <ChunkRow cells={ch.cells} activeCellId={null} character={character}/>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="mb-2 text-sm opacity-70">Root: {root}</div>
          <div className="flex flex-wrap items-center gap-2">
            {ROOTS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoot(r)}
                className={[
  "rounded-full px-3 py-1 text-sm transition border",
  root === r
    ? "bg-white/15 border-white/30 ring-1 ring-white/20 opacity-100"
    : "opacity-70 hover:opacity-100",
].join(" ")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </section>
            {/* DOWNLOAD */}
      <section className="mt-10 rounded-2xl border p-4">
        <div className="mb-3 text-lg font-medium">Download</div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onDownloadPractice}
            disabled={isExporting}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
          >
            Download Practice (MP4)
          </button>
           <button
            type="button"
            onClick={onDownloadDemo}
            disabled={isExporting}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
          >
            Download Demo (MP4)
          </button>

          {exportMsg ? (
            <div className="text-sm opacity-80">{exportMsg}</div>
          ) : (
            <div className="text-sm opacity-70">Exports current selection for Root {root}.</div>
          )}
        </div>
<div className="mt-8 border-t pt-4">
  <div className="text-sm uppercase tracking-wide opacity-70">
    System Blueprint
  </div>

  <Link
    href="/motion-control/full-arc-blueprint"
    className="mt-2 inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium hover:bg-black/5"
  >
    View Full Arc Blueprint (PDF Guide)
  </Link>
</div>
        
      </section>
    </main>
  );
}