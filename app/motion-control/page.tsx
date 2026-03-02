"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import KeyboardMotionControl from "@/components/playbooks/KeyboardMotionControl";
import Link from "next/link";
import { useRouter } from "next/navigation";


type Status = "IDLE" | "PLAYING" | "PAUSED" | "STOPPED" | "FINISHED";
type Tonic = "C" | "D" | "Eb" | "F";
type MotionCharacter = "STRUCTURAL" | "ELASTIC" | "INTERWOVEN" | "ATMOSPHERIC";

const HELD_PRESSURE_PALETTE = {
  gradientTop: "#2b2f36",
  gradientBottom: "#0f1115",
  trailColor: "#8fa3bf",
};

// Distinct hand colors (tweak later if you want)
const RH_COLOR = "#8fa3bf"; // cool steel
const LH_COLOR = "rgba(0,0,0,0.22)"; // darker underlay

const BPM = 72;
const BEATS_PER_BAR = 4;
const BEAT_MS = 60_000 / BPM; // 833.33ms
const CELL_MS = BEAT_MS * BEATS_PER_BAR; // 3333.33ms
const DEMO_SPEED = 0.75; // 25% faster (same as full-arc export)
const DEMO_BEAT_MS = BEAT_MS * DEMO_SPEED;
const DEMO_CELL_MS = CELL_MS * DEMO_SPEED;
const END_SILENCE_MS = 3000;

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
    for (const [sh, fl] of Object.entries(base)) {
      map[`${sh}${oct}`] = fl;
    }
  }
  return map;
})();
// ------------------------------
// Audio helper (your existing style)
// ------------------------------
function playNoteAudio(noteNameSharp: string) {
  const safeName = noteNameSharp.replace("#", "%23");
  const audio = new Audio(`/audio/notes/${safeName}.wav`);
  audio.currentTime = 0;
  audio.play().catch(() => {});
  return audio;
}

// ------------------------------
// Note utilities (sharps for audio filenames)
// ------------------------------
const PITCHES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function pcFromBase(base: string): number {
  const flatMap: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  const norm = flatMap[base] ?? base;
  const idx = PITCHES_SHARP.indexOf(norm as any);
  return idx >= 0 ? idx : 0;
}

function midiFromNote(note: string): number {
  // supports C2, C#3, Eb4, etc.
  const m = /^([A-G])([b#])?(\d)$/.exec(note);
  if (!m) return 60;
  const letter = m[1];
  const acc = m[2] ?? "";
  const oct = Number(m[3]);
  const base = `${letter}${acc}`; // "Eb"
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

function tonicToSemis(tonic: Tonic): number {
  if (tonic === "C") return 0;
  if (tonic === "D") return 2;
  if (tonic === "Eb") return 3;
  if (tonic === "F") return 5;
  return 0;
}
function fixedNoteLabelForTonic(tonic: Tonic): string {
  const semis = tonicToSemis(tonic);
  // Fixed note is D in the base (tonic=C) version.
  const midiD4 = midiFromNote("D4");
  const out = noteFromMidiSharp(midiD4 + semis); // e.g. "E4", "F4", "G4", "D#4"
  // Convert to base label without octave, using flats for display where applicable.
  const m = /^([A-G])(#)?\d$/.exec(out);
  if (!m) return out.replace(/\d$/, "");
  const base = `${m[1]}${m[2] ?? ""}`; // "D#"
  const sharpToFlat: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };
  return sharpToFlat[base] ?? base;
}

function toSharpForAudio(note: string): string {
  const flatToSharp: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
  const m = /^([A-G])([b#])?(\d)$/.exec(note);
  if (!m) return note;
  const letter = m[1];
  const acc = m[2] ?? "";
  const oct = m[3];
  const base = `${letter}${acc}`; // Eb
  const sharpBase = flatToSharp[base] ?? base;
  return `${sharpBase}${oct}`;
}

function normalizeToSharps(notes: string[]): string[] {
  return notes.map(toSharpForAudio);
}

// ------------------------------
// Motion definition (base tonic = C)
// ------------------------------
type Cell = {
  id: string;
  loop: "LOOP_1" | "LOOP_2" | "ENDING";
  lh: string[]; // octave dyad
  rh: string[]; // triad
  motionLine: string;
};

function buildBaseCells(): { loop1: Cell[]; loop2: Cell[] } {
  const LH_SEQ = [
    ["C2", "C3"],
    ["D2", "D3"],
    ["Eb2", "Eb3"],
    ["D2", "D3"],
    ["D2", "D3"],
    ["D2", "D3"],
  ];

  const LOOP1_RH = [
    ["D4", "Eb4", "G4"],
    ["D4", "F4", "Ab4"],
    ["D4", "Eb4", "Ab4"],
    ["D4", "G4", "Bb4"],
    ["D4", "A4", "Bb4"],
    ["D4", "G4", "Bb4"],
  ];

  const LOOP2_RH = [
    ["Eb4", "G4", "D5"],
    ["F4", "Ab4", "D5"],
    ["Eb4", "Ab4", "D5"],
    ["G4", "Bb4", "D5"],
    ["A4", "Bb4", "D5"],
    ["A4", "C5", "Eb5"], // spike
  ];

  const LOOP1_LINES = [
    "Inner voices rotate above a fixed floor.",
    "Inner voices climb above a fixed floor.",
    "Minor-second friction appears above a fixed floor.",
    "Inner voices rotate above a fixed floor.",
    "Inner voices climb above a fixed floor.",
    "Minor-second friction appears above a fixed floor.",
  ];

  const LOOP2_LINES = [
    "Inner voices rotate under a fixed ceiling.",
    "Inner voices climb under a fixed ceiling.",
    "Minor-second friction appears under a fixed ceiling.",
    "Inner voices rotate under a fixed ceiling.",
    "Inner voices climb under a fixed ceiling.",
    "Spike compresses upward under the fixed ceiling.",
  ];

  const loop1: Cell[] = LH_SEQ.map((lh, i) => ({
    id: `L1_${i + 1}`,
    loop: "LOOP_1",
    lh,
    rh: LOOP1_RH[i],
    motionLine: LOOP1_LINES[i],
  }));

  const loop2: Cell[] = LH_SEQ.map((lh, i) => ({
    id: `L2_${i + 1}`,
    loop: "LOOP_2",
    lh,
    rh: LOOP2_RH[i],
    motionLine: LOOP2_LINES[i],
  }));

  return { loop1, loop2 };
}
function lhPracticeInstruction(character: MotionCharacter): string {
  if (character === "STRUCTURAL") return "LH: octave pulse (4 beats).";
  if (character === "ELASTIC") return "LH: upper floor, beat 1 & 3.";
  if (character === "INTERWOVEN") return "LH: upper floor, beat 1 & 3.";
  if (character === "ATMOSPHERIC") return "LH: upper floor, beat 1 only.";
  return "LH: pulse.";
}

function rhPracticeInstruction(
  loop: "LOOP_1" | "LOOP_2" | "ENDING" | null,
  character: MotionCharacter
): string {
  const baseLoop1 = "RH: keep bottom fixed. Move inner and top stepwise.";
  const baseLoop2 = "RH: keep top fixed. Lift bottom and inner. End on the spike.";

  if (character === "INTERWOVEN") {
    if (loop === "LOOP_2") return "RH: keep top fixed. Split bottom→inner upward. End on the spike.";
    return "RH: keep bottom fixed. Split inner→top stepwise.";
  }

  if (loop === "LOOP_2") return baseLoop2;
  return baseLoop1;
}

type ScheduledCell = {
  cell: Cell;
  cellMs: number;
  beatMs: number;
  lhNotes: string[]; // sharps
  rhNotes: string[]; // sharps
};

function buildDemoSchedule(tonic: Tonic): { seq: ScheduledCell[]; endSilenceMs: number } {
  const semis = tonicToSemis(tonic);
  const { loop1, loop2 } = buildBaseCells();

  const pass = [...loop1, ...loop2];
  const twoPasses = [...pass, ...pass];
  const partial = loop1.slice(0, 2);

  const endingC: Cell = {
    id: "END_C",
    loop: "ENDING",
    lh: ["C2", "C3"],
    rh: [],
    motionLine: "Containment remains. No resolution.",
  };
  const endingD: Cell = {
    id: "END_D",
    loop: "ENDING",
    lh: ["D2", "D3"],
    rh: [],
    motionLine: "Containment suspends into silence.",
  };

  const full = [...twoPasses, ...partial, endingC, endingD];

  const scheduled: ScheduledCell[] = full.map((c) => {
    const lhSharp = normalizeToSharps(transposeNotesSharp(c.lh, semis));
    const rhSharp = normalizeToSharps(transposeNotesSharp(c.rh, semis));
    return { cell: c, cellMs: DEMO_CELL_MS, beatMs: DEMO_BEAT_MS, lhNotes: lhSharp, rhNotes: rhSharp };
  });

  return { seq: scheduled, endSilenceMs: END_SILENCE_MS };
}

function buildPracticeLoopSchedule(tonic: Tonic): ScheduledCell[] {
  const semis = tonicToSemis(tonic);
  const { loop1, loop2 } = buildBaseCells();
  const loop = [...loop1, ...loop2];

  return loop.map((c) => {
    const lhSharp = normalizeToSharps(transposeNotesSharp(c.lh, semis));
    const rhSharp = normalizeToSharps(transposeNotesSharp(c.rh, semis));
    return { cell: c, cellMs: CELL_MS, beatMs: BEAT_MS, lhNotes: lhSharp, rhNotes: rhSharp };
  });
}

// ------------------------------
// Player: bar-based + LH pulse within bar
// Pedal model: hard reset at bar boundary (stop audios), then play RH + start LH pulses.
// ------------------------------
type PlayerMode = "DEMO" | "PRACTICE";

function useHeldPressurePlayer(args: {
  mode: PlayerMode;
  schedule: ScheduledCell[];
  loop: boolean;
  endSilenceMs?: number;
  character?: MotionCharacter;
  onRhPulse?: (notes: string[]) => void;
onRhClear?: () => void;
onLhPulse?: (notes: string[]) => void;
onLhClear?: () => void;
  onTick?: (info: { idx: number; item: ScheduledCell | null }) => void;
}) {
const {
  schedule,
  loop,
  endSilenceMs = 0,
  onTick,
  character = "STRUCTURAL",
  onRhPulse,
  onRhClear,
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
    for (const a of audiosRef.current) a.pause();
    audiosRef.current = [];
  }

  function hardStop(to: Status) {
    stopAudios();
    clearBeatTimers();
    clearCellTimer();
    setStatus(to);
    onRhClear?.();
onLhClear?.();
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

  function scheduleLHPulses(lhNotes: string[], beatMs: number) {
  // Notes: lhNotes is usually [lowOct, highOct]
  const low = lhNotes[0] ? [lhNotes[0]] : [];
  const high = lhNotes[1] ? [lhNotes[1]] : low;
  const octave = lhNotes;

  // STRUCTURAL: 4-beat octave pulse (current behavior)
  if (character === "STRUCTURAL") {
    for (let b = 0; b < 4; b++) {
      const t = window.setTimeout(() => {
        if (statusRef.current !== "PLAYING") return;
        audiosRef.current.push(...octave.map((n) => playNoteAudio(n)));
flashLH(octave, 140);
      }, b * beatMs);
      beatTimersRef.current.push(t);
    }
    return;
  }

  // ELASTIC: “breath floor” (beat 1 low, beat 3 high)
  if (character === "ELASTIC") {
    const t1 = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...low.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 0);
    const t3 = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...high.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 2 * beatMs);
    beatTimersRef.current.push(t1, t3);
    return;
  }

  // INTERWOVEN: same as Elastic, but stagger low/high by 60ms for “voice separation”
  if (character === "INTERWOVEN") {
    const t1a = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...low.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 0);
    const t1b = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...high.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 60);

    const t3a = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...low.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 2 * beatMs);
    const t3b = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...high.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 2 * beatMs + 60);

    beatTimersRef.current.push(t1a, t1b, t3a, t3b);
    return;
  }

  // ATMOSPHERIC: one pulse per bar (beat 1 only)
  if (character === "ATMOSPHERIC") {
    const t1 = window.setTimeout(() => {
      if (statusRef.current !== "PLAYING") return;
      audiosRef.current.push(...octave.map((n) => playNoteAudio(n)));
      flashLH(high, 140);
    }, 0);
    beatTimersRef.current.push(t1);
    return;
  }
}

  function playCell(cur: ScheduledCell) {
    // Pedal reset at bar boundary: cut everything, then play new bar content.
    stopAudios();
    clearBeatTimers();

    // RH: start of bar (sustain via sample decay)
    // RH: start of bar
if (cur.rhNotes.length) {
  if (character === "INTERWOVEN") {
    // Stagger bottom → inner → top for clarity (and highlight each strike)
    const offsets = [0, 60, 120]; // ms
    cur.rhNotes.forEach((note, i) => {
      const t = window.setTimeout(() => {
        if (statusRef.current !== "PLAYING") return;
        audiosRef.current.push(playNoteAudio(note));
        flashRH([note], 140);
      }, offsets[i] ?? 0);
      beatTimersRef.current.push(t);
    });
  } else {
    // Strike as block + hold highlight across the bar
    audiosRef.current.push(...cur.rhNotes.map((n) => playNoteAudio(n)));
    flashRH(cur.rhNotes, Math.max(120, cur.cellMs - 40));
  }
}

    // LH: pulses each beat
    if (cur.lhNotes.length) {
      scheduleLHPulses(cur.lhNotes, cur.beatMs);
    }
  }

  function tickFrom(nextIdx: number) {
    clearCellTimer();

    if (nextIdx >= schedule.length) {
      if (loop) {
        setIdx(0);
        onTick?.({ idx: 0, item: schedule[0] ?? null });
        if (schedule[0]) playCell(schedule[0]);
        cellTimerRef.current = window.setTimeout(() => {
          if (statusRef.current === "PLAYING") tickFrom(1);
        }, schedule[0]?.cellMs ?? 0);
        return;
      }

      // Demo end: do NOT cut immediately; allow natural decay, then silence, then stop.
      onTick?.({ idx: schedule.length, item: null });

      // We intentionally do not stopAudios() here — let the last bar ring out.
      clearBeatTimers();
      clearCellTimer();

      cellTimerRef.current = window.setTimeout(() => {
        // now in silence
        cellTimerRef.current = window.setTimeout(() => {
          hardStop("FINISHED");
        }, endSilenceMs);
      }, 0);

      return;
    }

    setIdx(nextIdx);
    const cur = schedule[nextIdx];
    onTick?.({ idx: nextIdx, item: cur });

    playCell(cur);

    cellTimerRef.current = window.setTimeout(() => {
      if (statusRef.current === "PLAYING") tickFrom(nextIdx + 1);
    }, cur.cellMs);
  }

  function playFromStart() {
    hardStop("STOPPED"); // ensures cleanup
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
      // Pause = stop sounding notes and timers; resume restarts current bar
      stopAudios();
clearBeatTimers();
clearCellTimer();
onRhClear?.();
onLhClear?.();
return;
    }

    if (status === "PAUSED") {
      setStatus("PLAYING");
      tickFrom(idx);
      return;
    }

    // IDLE/STOPPED/FINISHED -> start from beginning
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

// ------------------------------
// Practice grid: 6 cells left-to-right, no octave labels
// ------------------------------
function toFlatDisplayBase(noteSharp: string) {
  // input like "D#4" -> "Eb"
  const m = /^([A-G])(#)?(\d)$/.exec(noteSharp);
  if (!m) return noteSharp;
  const base = `${m[1]}${m[2] ?? ""}`; // "D#"
  const sharpToFlat: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };
  return sharpToFlat[base] ?? base;
}

function triadLabelNoOct(notesSharp: string[]) {
  // e.g. ["D4","D#4","G4"] -> "DEbG"
  const bases = notesSharp.map(toFlatDisplayBase);
  return bases.join("");
}

function lhLabelForCharacter(lhSharp: string[], character: MotionCharacter) {
  // Use upper note (e.g. C3 -> "C") for single-note modes
  const upper = lhSharp[1] ? toFlatDisplayBase(lhSharp[1]) : (lhSharp[0] ? toFlatDisplayBase(lhSharp[0]) : "");

  // Structural uses octave pair label (no octave digits) + ×4
  if (character === "STRUCTURAL") {
    const pair = lhSharp.map(toFlatDisplayBase).join(""); // e.g. CC / EbEb
    return `${pair} ×4`;
  }

  // Atmospheric: beat 1 only
  if (character === "ATMOSPHERIC") {
    return `${upper} (1)`;
  }

  // Elastic + Interwoven: beat 1 & 3
  return `${upper} (1&3)`;
}

function LoopGrid({
  title,
  cells,
  activeId,
  character,
}: {
  title: string;
  cells: ScheduledCell[];
  activeId: string | null;
  character: MotionCharacter;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>

      <div className="grid grid-cols-6 gap-2">
        {cells.map((c) => {
          const isOn = c.cell.id === activeId;
          return (
            <div
  key={c.cell.id}
  className={[
    // musical “bar” feel: only vertical separators
    "px-2 py-2 text-center text-sm border-l border-r",
    isOn ? "bg-black/5 opacity-100" : "opacity-80",
  ].join(" ")}
>
              <div className="text-xs opacity-60">RH</div>
              <div className="font-medium">{triadLabelNoOct(c.rhNotes)}</div>
              <div className="mt-2 text-xs opacity-60">LH</div>
              <div className="font-medium">{lhLabelForCharacter(c.lhNotes, character)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------
// Page
// ------------------------------
export default function MotionControlPage() {
  const [tonic, setTonic] = useState<Tonic>("C");
  const [character, setCharacter] = useState<MotionCharacter>("STRUCTURAL");

// Load persisted character AFTER mount to avoid hydration mismatch
useEffect(() => {
  try {
    const v = localStorage.getItem("motionCharacter") as MotionCharacter | null;
    if (v === "STRUCTURAL" || v === "ELASTIC" || v === "INTERWOVEN" || v === "ATMOSPHERIC") {
      setCharacter(v);
    }
  } catch {}
}, []);

useEffect(() => {
  try {
    localStorage.setItem("motionCharacter", character);
  } catch {}
}, [character]);
const [practiceStartLoop, setPracticeStartLoop] = useState<"LOOP_1" | "LOOP_2">("LOOP_1");

  const demoSchedule = useMemo(() => buildDemoSchedule(tonic), [tonic]);
  // Base order is always Loop 1 then Loop 2 (used for UI grids + labels)
const practiceBaseSchedule = useMemo(() => buildPracticeLoopSchedule(tonic), [tonic]);

// Playback order depends on selector: Loop 1→Loop 2 or Loop 2→Loop 1
const practicePlaybackSchedule = useMemo(() => {
  if (practiceStartLoop === "LOOP_2") {
    return [...practiceBaseSchedule.slice(6), ...practiceBaseSchedule.slice(0, 6)];
  }
  return practiceBaseSchedule;
}, [practiceBaseSchedule, practiceStartLoop]);

  const [demoUI, setDemoUI] = useState<{
  loop: "LOOP_1" | "LOOP_2" | "ENDING" | null;
  line: string;

  // RH highlight should reflect what actually strikes
  rhPulse: string[];
  // LH highlight should reflect what actually strikes
  lhPulse: string[];

  // Optional: keep a stable RH reference for non-interwoven modes
  rhHeld: string[];
}>({ loop: null, line: "", rhPulse: [], lhPulse: [], rhHeld: [] });

  const [practiceUI, setPracticeUI] = useState<{
  activeId: string | null;
  loop: "LOOP_1" | "LOOP_2" | "ENDING" | null;

  // Pulse highlights driven by audio timers (strike-accurate)
  rhPulse: string[];
  lhPulse: string[];

  // Held RH reference for non-interwoven modes
  rhHeld: string[];
}>({ activeId: null, loop: null, rhPulse: [], lhPulse: [], rhHeld: [] });

  const demoPlayer = useHeldPressurePlayer({
  mode: "DEMO",
  schedule: demoSchedule.seq,
  loop: false,
  endSilenceMs: demoSchedule.endSilenceMs,
  character,

  // NEW: beat-accurate highlights driven by the audio timers
  onRhPulse: (notes) => setDemoUI((s) => ({ ...s, rhPulse: notes })),
  onRhClear: () => setDemoUI((s) => ({ ...s, rhPulse: [] })),
  onLhPulse: (notes) => setDemoUI((s) => ({ ...s, lhPulse: notes })),
  onLhClear: () => setDemoUI((s) => ({ ...s, lhPulse: [] })),

  onTick: ({ item }) => {
    if (!item) {
      setDemoUI((s) => ({
        ...s,
        loop: null,
        line: "Containment suspends into silence.",
        rhHeld: [],
        rhPulse: [],
        lhPulse: [],
      }));
      return;
    }

    // Keep loop + line updated per bar.
    // Also store the RH chord as a “held reference” (used in non-interwoven modes if you want it).
    setDemoUI((s) => ({
      ...s,
      loop: item.cell.loop,
      line: item.cell.motionLine,
      rhHeld: item.rhNotes,
      // IMPORTANT: do not overwrite rhPulse/lhPulse here; timers control them
    }));
  },
});

  const practicePlayer = useHeldPressurePlayer({
  mode: "PRACTICE",
  schedule: practicePlaybackSchedule, // or whatever your practice schedule variable is
  loop: true, // or your current practice loop behavior
  character,

  // NEW: strike-accurate highlights
  onRhPulse: (notes) => setPracticeUI((s) => ({ ...s, rhPulse: notes })),
  onRhClear: () => setPracticeUI((s) => ({ ...s, rhPulse: [] })),
  onLhPulse: (notes) => setPracticeUI((s) => ({ ...s, lhPulse: notes })),
  onLhClear: () => setPracticeUI((s) => ({ ...s, lhPulse: [] })),

  onTick: ({ item }) => {
    if (!item) {
      setPracticeUI((s) => ({
        ...s,
        activeId: null,
        loop: null,
        rhHeld: [],
        rhPulse: [],
        lhPulse: [],
      }));
      return;
    }

    setPracticeUI((s) => ({
      ...s,
      activeId: item.cell.id,
      loop: item.cell.loop,
      rhHeld: item.rhNotes,
      // IMPORTANT: do not overwrite rhPulse/lhPulse here
    }));
  },
});

  useEffect(() => {
  practicePlayer.stop();
  demoPlayer.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [tonic, practiceStartLoop, character]);



  const demoGuardrail =
    demoUI.loop === "LOOP_1"
      ? "Loop 1 — RH: Bottom note fixed."
      : demoUI.loop === "LOOP_2"
      ? "Loop 2 — RH: Top note fixed. Spike at the end."
      : "";

  const fixed = fixedNoteLabelForTonic(tonic);

const practiceMechanics = `${lhPracticeInstruction(character)} ${rhPracticeInstruction(practiceUI.loop, character)}`;

  const loop1Grid = practiceBaseSchedule.slice(0, 6);
const loop2Grid = practiceBaseSchedule.slice(6, 12);
  

  
    const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">
  Motion Control — Containment
</h1>
        <p className="mt-2 text-sm opacity-80">
  Sustain harmonic pressure without resolving or widening.
</p>
      </header>

      {/* SECTION 1 — DEMO */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-medium">Demo</div>
<div className="flex items-center gap-2">
    <div className="text-sm opacity-70">Character</div>
    <select
      value={character}
      onChange={(e) => setCharacter(e.target.value as MotionCharacter)}
      className="rounded-xl border px-3 py-2 text-sm bg-transparent"
    >
      <option value="STRUCTURAL">Structural</option>
      <option value="ELASTIC">Elastic</option>
      <option value="INTERWOVEN">Interwoven</option>
      <option value="ATMOSPHERIC">Atmospheric</option>
    </select>
  </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={demoPlayer.pauseResume}
              className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
            >
              {demoPlayer.status === "PLAYING"
                ? "Pause"
                : demoPlayer.status === "PAUSED"
                ? "Resume"
                : "Play"}
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

        {/* Layer 1: only one guardrail line visible */}
        {/* Layer 1: only one guardrail line visible */}
<div className="mb-2 text-sm opacity-90">{demoGuardrail || " "}</div>



        <KeyboardMotionControl
          activeChordSymbol={null}
          emotion={HELD_PRESSURE_PALETTE}
          emotionLabel="Containment"
          hideHeaderTitle
          // RH = primary, LH = secondary (two colors)
          highlightColorOverride={RH_COLOR}
          highlightNotesPrimary={demoUI.rhPulse.length ? demoUI.rhPulse : demoUI.rhHeld}
highlightNotesSecondary={demoUI.lhPulse}
          highlightColorSecondary={LH_COLOR}
          // Demo: no labels
          showPrimaryLabels={false}
          showSecondaryLabels={false}
          
        />

        {/* Layer 2: active motion line */}
        <div className="mt-2 text-sm opacity-90">{demoUI.line || " "}</div>

        {demoPlayer.status === "FINISHED" ? (
          <div className="mt-2 text-sm opacity-70">
            Ended in silence. Press Play to start again.
          </div>
        ) : null}
      </section>

      {/* SECTION 2 — PRACTICE */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-medium">Practice</div>

          <div className="flex items-center gap-2">
  {/* Loop selector */}
  <div className="mr-2 flex items-center gap-1 rounded-full border p-1">
    <button
      type="button"
      onClick={() => setPracticeStartLoop("LOOP_1")}
      className={[
        "rounded-full px-2 py-1 text-sm transition",
        practiceStartLoop === "LOOP_1" ? "bg-white/10" : "opacity-70 hover:opacity-100",
      ].join(" ")}
    >
      Loop 1
    </button>
    <button
      type="button"
      onClick={() => setPracticeStartLoop("LOOP_2")}
      className={[
        "rounded-full px-2 py-1 text-sm transition",
        practiceStartLoop === "LOOP_2" ? "bg-white/10" : "opacity-70 hover:opacity-100",
      ].join(" ")}
    >
      Loop 2
    </button>
  </div>

  {/* Transport */}
  <button
    type="button"
    onClick={practicePlayer.pauseResume}
    className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
  >
    {practicePlayer.status === "PLAYING"
      ? "Pause"
      : practicePlayer.status === "PAUSED"
      ? "Resume"
      : "Play"}
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

        {/* Layer 1: mechanics */}
        <div className="mb-2 text-sm opacity-90">{practiceMechanics}</div>

        <KeyboardMotionControl
          activeChordSymbol={null}
          emotion={HELD_PRESSURE_PALETTE}
          emotionLabel="Containment"
          hideHeaderTitle
          highlightColorOverride={RH_COLOR}
          highlightNotesPrimary={practiceUI.rhPulse.length ? practiceUI.rhPulse : practiceUI.rhHeld}
highlightNotesSecondary={practiceUI.lhPulse}
          highlightColorSecondary={LH_COLOR}
          // Practice: show labels for both hands (no octaves, keyboard already does base labels)
          showPrimaryLabels
          showSecondaryLabels
          noteLabelMapOverride={SHARP_TO_FLAT_LABELS}
        />

        {/* Clean loop grids (6 cells left->right) */}
       <div className="mt-4 space-y-5">
  {practiceUI.loop === "LOOP_2" ? (
    <LoopGrid title="Loop 2" cells={loop2Grid} activeId={practiceUI.activeId} character={character} />
  ) : (
    <LoopGrid title="Loop 1" cells={loop1Grid} activeId={practiceUI.activeId} character={character} />

  )}
</div>
      </section>

      {/* SECTION 3 — TONIC PICKER  */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 text-lg font-medium">Start position</div>

        <div className="flex flex-wrap items-center gap-2">
          {(["C", "D", "Eb", "F"] as Tonic[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTonic(t)}
              className={[
                "rounded-full px-3 py-1 text-sm transition",
                tonic === t ? "border bg-white/10" : "border opacity-70 hover:opacity-100",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
          
        </div>

        
        <div className="mt-6 space-y-5">
  <LoopGrid title="Loop 1" cells={loop1Grid} activeId={null} character={character} />
<LoopGrid title="Loop 2" cells={loop2Grid} activeId={null} character={character} />
</div>
      </section>
{/* SECTION 4 — Unlock Full Arc */}
<section className="mt-10 rounded-2xl border p-4">
  <div className="text-sm uppercase tracking-wide opacity-70">Beyond One Motion</div>

  <h2 className="mt-2 text-xl font-semibold">Unlock Full Arc (PWYW survey, $0 ok)</h2>
<p className="mt-3 leading-6 opacity-90">
  Instant access after a quick pricing survey (no checkout yet).

</p>
  <p className="mt-3 leading-6 opacity-90">
  If your playing keeps resolving early, the problem usually isn’t chords — it’s motion control.
  Full Arc gives you repeatable ways to sustain, widen, thin, and land on purpose.
</p>

  <div className="mt-4 space-y-2 leading-6 opacity-90">
    <div><span className="font-medium">Full Arc fixes three common intermediate failures:</span></div>
    <ul className="list-disc pl-5">
  <li><span className="font-medium">You resolve too early</span> → learn to sustain intensity (Containment)</li>
  <li><span className="font-medium">You drift and lose direction</span> → widen without losing the thread (Expansion)</li>
  <li><span className="font-medium">You can’t change intensity cleanly</span> → thin or land on purpose (Dissolve → Arrival)</li>
</ul>
  </div>

  <div className="mt-4 leading-6 opacity-90">
  Seven fixed arcs. No randomness. No “try ideas.”
  <br />
  You follow the mechanics and the motion holds.
</div>

  <div className="font-medium">Not for beginners.</div>
<div className="mt-1 text-sm leading-6 opacity-80">
  For intermediate players who already play triads, but keep falling back into the same resolution.
</div>

<div className="mt-5 flex flex-col gap-2">
  <button
  type="button"
  onClick={() => {
    const qs = typeof window !== "undefined" ? window.location.search : "";
    router.push(`/motion-control/unlock${qs}`);
  }}
  className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium"
>
  Unlock Full Arc (PWYW survey, $0 ok)
</button>

  <div className="text-xs opacity-70">
    Instant access after a quick pricing survey (no checkout yet).
  </div>
</div>
</section>
    </main>
  );
}