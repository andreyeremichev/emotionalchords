"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions, { EmotionPalette } from "@/components/KeyboardEmotions";
import { PITCHES } from "@/lib/harmony/flow";

/* =========================
   Types
========================= */

type Drill = "one" | "two" | "full";
type PatternId =
  | "breathing"
  | "pulse"
  | "echo"
  | "freeze"
  | "wonder"
  | "magic"
  | "mystery";

type Event = {
  delayMs: number;
  chordIndex: number;
  tokenIndex: number;
  doLH: boolean;
  doRHChord: boolean;
  doRHNoteIndex: number | null; // sparkle note index (magic)
};

/* =========================
   UI data
========================= */

const DRILLS: { id: Drill; label: string; subtitle: string }[] = [
  { id: "one", label: "One chord rhythm", subtitle: "Lock the motion first." },
  { id: "two", label: "Two chords rhythm", subtitle: "Keep the motion while switching." },
  { id: "full", label: "Full progression", subtitle: "Now it becomes music." },
];

const PATTERNS: Record<
  PatternId,
  {
    label: string;
    tokens: string[];
    explainer: string;
    baseGap: number;
    baseRestBetweenReps: number;
    baseRestBetweenChords: number;
  }
> = {
  breathing: {
    label: "Breathing",
    tokens: ["L", "R", "L", "R"],
    explainer: "Left → Right → Left → Right",
    // Heavy & slow sadness feel (locked)
    baseGap: 320,
    baseRestBetweenReps: 200,
    baseRestBetweenChords: 140,
  },

  wonder: {
    label: "Open suspension",
    tokens: ["L", "R", "…"],
    explainer: "Left → Right → (hold)",
    baseGap: 320,
    baseRestBetweenReps: 0,
    baseRestBetweenChords: 420,
  },

  magic: {
    label: "Shimmer",
    tokens: ["B", "…", "✨"],
    explainer: "Both → (hold) → sparkle",
    baseGap: 360,
    baseRestBetweenReps: 0,
    baseRestBetweenChords: 320,
  },

  mystery: {
    label: "Question",
    tokens: ["L", "R", "…", "R"],
    explainer: "Left → Right → (pause) → Right",
    baseGap: 300,
    baseRestBetweenReps: 0,
    baseRestBetweenChords: 360,
  },

  freeze: {
    label: "Freeze",
    tokens: ["L", "R", "…"],
    explainer: "Left → Right → (long silence)",
    baseGap: 360,
    baseRestBetweenReps: 0,
    baseRestBetweenChords: 900,
  },

  pulse: {
    label: "Pulse",
    tokens: ["B", "B", "B", "B"], // 2 hits per rep × 2 reps = 4 tokens
    explainer: "Both hands together (pulse)",
    baseGap: 210,
    baseRestBetweenReps: 220,
    baseRestBetweenChords: 210,
  },

  echo: {
    label: "Echo",
    tokens: ["L", "R", "·", "R", "L", "R", "·", "R"],
    explainer: "Left → Right → (pause) → Right",
    baseGap: 260,
    baseRestBetweenReps: 220,
    baseRestBetweenChords: 260,
  },
};

/* =========================
   Helpers
========================= */

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
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

// LH root in C3–B3
function chordToRootLH(symbol: string): string {
  const { rootPc } = chordToPitchClasses(symbol);
  const midi = (3 + 1) * 12 + rootPc;
  return midiToName(midi);
}

// RH close voicing in C4 bucket (C4..B4)
function chordToCloseRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  const base = 60; // C4
  return pcs.map((pc) => midiToName(base + pc));
}

function prettyChord(s: string) {
  return s.replace(/b/g, "♭").replace(/#/g, "♯");
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

function ChordProgressLine(props: { chords: string[]; activeIndex: number | null }) {
  const { chords, activeIndex } = props;
  return (
    <div style={{ marginTop: 6, textAlign: "center", fontSize: 13, color: "#111827", minHeight: 20 }}>
      {chords.map((c, i) => {
        const active = activeIndex === i;
        return (
          <span key={i} style={{ marginInline: 2 }}>
            {i > 0 && <span style={{ opacity: 0.35, marginInline: 4 }}>·</span>}
            <span
              style={{
                fontWeight: active ? 800 : 600,
                opacity: active ? 1 : 0.6,
                textDecoration: active ? "underline" : "none",
                textUnderlineOffset: 3,
              }}
            >
              {prettyChord(c)}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function PatternHelper(props: { pattern: PatternId; activeTokenIndex: number | null; slowMode: boolean }) {
  const { pattern, activeTokenIndex, slowMode } = props;
  const p = PATTERNS[pattern];

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, color: "#374151", fontWeight: 700 }}>
        Pattern: <span style={{ fontWeight: 800 }}>{p.label}</span>{" "}
        <span style={{ fontWeight: 600, opacity: 0.7 }}>({slowMode ? "Slow mode" : "Normal"})</span>
      </div>

      <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {p.tokens.map((t, i) => {
          const isOn = activeTokenIndex === i;
          return (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 999,
                background: isOn ? "#111" : "rgba(0,0,0,0.06)",
                color: isOn ? "#fff" : "#111",
              }}
            >
              {t}
            </span>
          );
        })}
        <span style={{ fontSize: 12, color: "#6B7280" }}>({p.explainer})</span>
      </div>
    </div>
  );
}

/* =========================
   Component
========================= */

export default function Step2RhythmPractice(props: {
  emotionLabel: string;
  emotionPalette: EmotionPalette;
  chords: string[];
  pattern: PatternId;
  normalMul?: number;
  slowMul?: number;
  rhOctaveShift?: number;

  // Demo mode (Home)
  autoPlay?: boolean;
  hideControls?: boolean;
  defaultDrill?: Drill;
  defaultSlowMode?: boolean;
    onFinished?: () => void;
}) {
  const {
    emotionLabel,
    emotionPalette,
    chords,
    pattern,
    normalMul = 1.0,
    slowMul = 1.6,
    rhOctaveShift = 0,

    autoPlay = false,
    hideControls = false,
    defaultDrill = "one",
    defaultSlowMode = false,
      onFinished,
  } = props;

  const samplerRef = useRef<Tone.Sampler | null>(null);
  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  const rhVoicings = useMemo(() => {
    return chords.map((chord) => {
      const base = chordToCloseRH(chord);

      if (rhOctaveShift === 0) return base;

      // shift RH notes up exactly one octave
      return base.map((note) => {
        const m = /^(.*?)(\d)$/.exec(note);
        if (!m) return note;
        const name = m[1];
        const oct = parseInt(m[2], 10);
        return `${name}${oct + 1}`;
      });
    });
  }, [chords, rhOctaveShift]);

  const lhRoots = useMemo(() => chords.map(chordToRootLH), [chords]);

  const [drill, setDrill] = useState<Drill>(defaultDrill);
  const [slowMode, setSlowMode] = useState<boolean>(defaultSlowMode);

  const [activeChord, setActiveChord] = useState<number | null>(null);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);

  const [primaryNotes, setPrimaryNotes] = useState<string[]>([]);
  const [secondaryNotes, setSecondaryNotes] = useState<string[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const eventsRef = useRef<Event[]>([]);
  const eventIndexRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    clearTimer();
    runIdRef.current += 1;

    setIsPlaying(false);
    setIsPaused(false);
    setActiveChord(null);
    setActiveTokenIndex(null);
    setPrimaryNotes([]);
    setSecondaryNotes([]);

    eventsRef.current = [];
    eventIndexRef.current = 0;
  }, []);

  const buildEvents = useCallback((): Event[] => {
    const p = PATTERNS[pattern];
    const mul = slowMode ? slowMul : normalMul;

    const gap = Math.round(p.baseGap * mul);
    const restBetweenReps = Math.round(p.baseRestBetweenReps * mul);
    const restBetweenChords = Math.round(p.baseRestBetweenChords * mul);

    const chordPlan: number[] = drill === "one" ? [0] : drill === "two" ? [0, 1] : [0, 1, 2, 3];

    const out: Event[] = [];
    let t = 0;

    for (const chordIndex of chordPlan) {
      const reps =
        pattern === "freeze" || pattern === "wonder" || pattern === "magic" || pattern === "mystery" ? 1 : 2;

      for (let rep = 0; rep < reps; rep++) {
        const repStart = t;

        if (pattern === "freeze") {
          out.push({ delayMs: repStart, chordIndex, tokenIndex: 0, doLH: true, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap, chordIndex, tokenIndex: 1, doLH: false, doRHChord: true, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 2, chordIndex, tokenIndex: 2, doLH: false, doRHChord: false, doRHNoteIndex: null });
          t = repStart + gap * 2 + restBetweenChords;
          continue;
        }

        if (pattern === "wonder") {
          out.push({ delayMs: repStart, chordIndex, tokenIndex: 0, doLH: true, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap, chordIndex, tokenIndex: 1, doLH: false, doRHChord: true, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 2, chordIndex, tokenIndex: 2, doLH: false, doRHChord: false, doRHNoteIndex: null });
          t = repStart + gap * 2 + restBetweenChords;
          continue;
        }

        if (pattern === "breathing") {
          const tokenBase = rep === 0 ? 0 : 2;
          out.push({ delayMs: repStart, chordIndex, tokenIndex: tokenBase + 0, doLH: true, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap, chordIndex, tokenIndex: tokenBase + 1, doLH: false, doRHChord: true, doRHNoteIndex: null });
          t = repStart + gap + restBetweenReps;
          continue;
        }

        if (pattern === "magic") {
          out.push({ delayMs: repStart, chordIndex, tokenIndex: 0, doLH: true, doRHChord: true, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap, chordIndex, tokenIndex: 1, doLH: false, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 2, chordIndex, tokenIndex: 2, doLH: false, doRHChord: false, doRHNoteIndex: 2 });
          t = repStart + gap * 2 + restBetweenChords;
          continue;
        }

        if (pattern === "mystery") {
          out.push({ delayMs: repStart, chordIndex, tokenIndex: 0, doLH: true, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap, chordIndex, tokenIndex: 1, doLH: false, doRHChord: true, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 2, chordIndex, tokenIndex: 2, doLH: false, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 3, chordIndex, tokenIndex: 3, doLH: false, doRHChord: true, doRHNoteIndex: null });
          t = repStart + gap * 3 + restBetweenChords;
          continue;
        }

        if (pattern === "echo") {
          const baseToken = rep === 0 ? 0 : 4;
          out.push({ delayMs: repStart, chordIndex, tokenIndex: baseToken + 0, doLH: true, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap, chordIndex, tokenIndex: baseToken + 1, doLH: false, doRHChord: true, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 2, chordIndex, tokenIndex: baseToken + 2, doLH: false, doRHChord: false, doRHNoteIndex: null });
          out.push({ delayMs: repStart + gap * 3, chordIndex, tokenIndex: baseToken + 3, doLH: false, doRHChord: true, doRHNoteIndex: null });
          t = repStart + gap * 3 + restBetweenReps;
          continue;
        }

        if (pattern === "pulse") {
          const tokenBase = rep === 0 ? 0 : 2;
          for (let k = 0; k < 2; k++) {
            out.push({
              delayMs: repStart + gap * k,
              chordIndex,
              tokenIndex: tokenBase + k,
              doLH: true,
              doRHChord: true,
              doRHNoteIndex: null,
            });
          }
          t = repStart + gap * 1 + restBetweenReps;
          continue;
        }
      }

      t += restBetweenChords;
    }

    return out;
  }, [drill, normalMul, pattern, slowMode, slowMul]);

  const scheduleNext = useCallback((ms: number, fn: () => void) => {
    clearTimer();
    timerRef.current = window.setTimeout(fn, ms);
  }, []);

  const runEvent = useCallback(
    (runId: number) => {
      if (runIdRef.current !== runId) return;

      const events = eventsRef.current;
      const idx = eventIndexRef.current;
      const ev = events[idx];

      if (!ev) {
        scheduleNext(250, () => stop());
        return;
      }

      const chordIdx = ev.chordIndex;
      const chordSym = chords[chordIdx];
      const lh = lhRoots[chordIdx];
      const rh = rhVoicings[chordIdx];

      let rhToPlay = rh;

      setActiveChord(chordIdx);
      setActiveTokenIndex(ev.tokenIndex);

      const sampler = samplerRef.current;

      const showLH = ev.doLH;
      const showRHChord = ev.doRHChord;
      const showRHNoteIndex = ev.doRHNoteIndex;

      setSecondaryNotes(showLH ? [lh] : []);

      if (showRHChord) {
        setPrimaryNotes(rhToPlay);
      } else if (showRHNoteIndex != null) {
        let sparkleHighlight = rhToPlay[showRHNoteIndex];

        // Magic special-case: Eb 5th highlight drops to octave 3
        if (pattern === "magic" && chordSym === "Eb" && sparkleHighlight === "A#4") {
          sparkleHighlight = "A#3";
        }

        setPrimaryNotes([sparkleHighlight]);
      } else {
        setPrimaryNotes([]);
      }

      if (sampler) {
        try {
          const holdy = pattern === "freeze" || pattern === "wonder" || pattern === "magic" || pattern === "mystery";
          const isMagic = pattern === "magic";

          const lhDur = isMagic ? 1.1 : holdy ? 1.0 : 0.45;
          const rhDur = isMagic ? 1.6 : holdy ? 1.4 : 0.55;
          const sparkleDur = isMagic ? 0.55 : holdy ? 0.5 : 0.35;

          const lhVel = isMagic ? 0.38 : 0.9;
          const rhVel = isMagic ? 0.35 : 0.9;
          const sparkleVel = isMagic ? 0.18 : 0.9;

          if (showLH) (sampler as any).triggerAttackRelease(lh, lhDur, undefined, lhVel);
          if (showRHChord) (sampler as any).triggerAttackRelease(rhToPlay, rhDur, undefined, rhVel);

          if (showRHNoteIndex != null) {
            let sparkleNote = rhToPlay[showRHNoteIndex];

            // Magic special-case: Eb 5th audio drops to octave 3
            if (pattern === "magic" && chordSym === "Eb" && sparkleNote === "A#4") {
              sparkleNote = "A#3";
            }

            (sampler as any).triggerAttackRelease(sparkleNote, sparkleDur, undefined, sparkleVel);
          }
        } catch {}
      }

      eventIndexRef.current += 1;

      const next = events[eventIndexRef.current];
if (!next) {
  scheduleNext(250, () => {
    stop();
    onFinished?.();
  });
  return;
}

      const delayToNext = Math.max(0, next.delayMs - ev.delayMs);
      scheduleNext(delayToNext, () => runEvent(runId));
    },
    [chords, lhRoots, rhVoicings, pattern, scheduleNext, stop]
  );

  const play = useCallback(async () => {
    await Tone.start().catch(() => {});
    stop();

    const evs = buildEvents();
    eventsRef.current = evs;
    eventIndexRef.current = 0;

    setIsPlaying(true);
    setIsPaused(false);

    const runId = ++runIdRef.current;

    const first = evs[0];
    if (!first) {
      stop();
      return;
    }

    scheduleNext(first.delayMs, () => runEvent(runId));
  }, [buildEvents, runEvent, scheduleNext, stop]);

  // ✅ Demo autoplay (single, correct useEffect)
  useEffect(() => {
    if (!autoPlay) return;
    play();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, pattern, chords.join("|")]);

  const pause = useCallback(() => {
    if (!isPlaying || isPaused) return;
    clearTimer();
    setIsPaused(true);
  }, [isPaused, isPlaying]);

  const resume = useCallback(() => {
    if (!isPlaying || !isPaused) return;
    setIsPaused(false);
    const runId = runIdRef.current;
    runEvent(runId);
  }, [isPaused, isPlaying, runEvent]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="mt-4">
  {!hideControls && (
    <>
      <div className="text-xs font-semibold text-neutral-700">
        Step 2 — Play with feeling
      </div>
      <div className="mt-1 text-xs font-neutral-600">
        Same smooth chords. Now we add motion.
      </div>

      <PatternHelper
        pattern={pattern}
        activeTokenIndex={activeTokenIndex}
        slowMode={slowMode}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {DRILLS.map((d) => {
          const active = drill === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setDrill(d.id)}
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                active
                  ? "bg-black text-white"
                  : "bg-black/5 text-neutral-800 hover:bg-black/10",
              ].join(" ")}
            >
              {d.label}
            </button>
          );
        })}

        <label className="ml-auto inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-neutral-800">
          <input
            type="checkbox"
            checked={slowMode}
            onChange={(e) => setSlowMode(e.target.checked)}
          />
          Slow mode
        </label>
      </div>

      <div className="mt-2 text-[11px] text-neutral-500">
        {DRILLS.find((d) => d.id === drill)?.subtitle}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!isPlaying && (
          <button
            type="button"
            onClick={play}
            className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
          >
            ▶ Play
          </button>
        )}

        {isPlaying && (
          <>
            <button
              type="button"
              onClick={() => (isPaused ? resume() : pause())}
              className="rounded-full bg-black/10 px-4 py-2 text-xs font-semibold text-neutral-900"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>

            <button
              type="button"
              onClick={stop}
              className="rounded-full bg-black/5 px-4 py-2 text-xs font-semibold text-neutral-900"
            >
              ⏹ Stop
            </button>
          </>
        )}
      </div>
    </>
  )}

  <KeyboardEmotions
    activeChordSymbol={activeChord != null ? chords[activeChord] : null}
    emotion={emotionPalette}
    emotionLabel={emotionLabel}
    highlightNotesPrimary={primaryNotes}
    highlightNotesSecondary={secondaryNotes}
    highlightColorSecondary="rgba(17,24,39,0.22)"
  />

  {!hideControls && (
    <ChordProgressLine chords={chords} activeIndex={activeChord} />
  )}
</div>
);
}
