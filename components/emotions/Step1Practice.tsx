"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions, { EmotionPalette } from "@/components/KeyboardEmotions";
import { PITCHES } from "@/lib/harmony/flow";

/**
 * Step 1 (revamped):
 * - One keyboard only
 * - Pass A: RH triads, each chord x4
 * - Pass B: LH roots, each chord x4
 * - Pause/Resume freezes the current highlighted chord (very useful for practice)
 */

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

function chordToPitchClasses(symbol: string): { rootPc: number; pcs: number[] } {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(symbol);
  if (!m) return { rootPc: 0, pcs: [] };

  const letter = m[1].toUpperCase();
  const acc = m[2] || "";
  const qual = (m[3] || "").toLowerCase();

  const basePCMap: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  };

  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps =
    quality === "M" ? [0, 4, 7] :
    quality === "m" ? [0, 3, 7] :
    [0, 3, 6];

  const pcs = steps.map((s) => (pc + s) % 12);
  return { rootPc: pc, pcs };
}

function buildFullPianoUrls(): Record<string, string> {
  const urls: Record<string, string> = {};

  for (const p of ["A", "A#", "B"] as const) {
    const name = `${p}0`;
    urls[name] = `${name.replace("#", "%23")}.wav`;
  }

  for (let oct = 1; oct <= 7; oct++) {
    for (const p of PITCHES) {
      const name = `${p}${oct}`;
      urls[name] = `${name.replace("#", "%23")}.wav`;
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

/** RH triad in C4 bucket */
function triadNamesInRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  if (!pcs.length) return [];
  const base = 60; // C4
  return pcs.map((pc) => midiToName(base + ((pc - 0 + 12) % 12)));
}

/** LH root note in octave 3 */
function rootNameInLH(symbol: string): string {
  const { rootPc } = chordToPitchClasses(symbol);
  const midi = (3 + 1) * 12 + rootPc; // octave 3
  return midiToName(midi);
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
              {c.replace("b", "♭").replace("#", "♯")}
            </span>
          </span>
        );
      })}
    </div>
  );
}

type Step1Phase = "IDLE" | "RH" | "LH";

type Event = {
  atMs: number;
  phase: Step1Phase; // RH or LH
  chordIndex: number;
  chordSymbol: string;
  notes: string[]; // what we actually play + highlight
};

export default function Step1Practice(props: {
  emotionLabel: string;
  emotionPalette: EmotionPalette;
  chords?: string[];
}) {
  const { emotionLabel, emotionPalette, chords = [] } = props;

  const samplerRef = useRef<Tone.Sampler | null>(null);
  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  // Playback control
  const timerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const startAtRef = useRef<number>(0);      // performance.now() when timeline started
const elapsedRef = useRef<number>(0);      // frozen elapsed for pause
const nextIndexRef = useRef<number>(0);    // next event index to schedule
const isPausedRef = useRef<boolean>(false); // <-- scheduler-safe pause flag

  const [phase, setPhase] = useState<Step1Phase>("IDLE");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);
  const [primaryNotes, setPrimaryNotes] = useState<string[]>([]);
  const [secondaryNotes, setSecondaryNotes] = useState<string[]>([]);

  const chordLabel = useMemo(
    () => chords.map((c) => c.replace("b", "♭").replace("#", "♯")).join(" · "),
    [chords]
  );

  const timeline = useMemo<Event[]>(() => {
    // --- LOCKED: Step 1 plays each chord x4 ---
    const REPEATS = 4;

    // Timing tuned for clarity
    const HIT_MS = 650;
    const GAP_MS = 120;

    let t = 0;
    const events: Event[] = [];

    // Pass A — RH
    chords.forEach((ch, chordIdx) => {
      for (let r = 0; r < REPEATS; r++) {
        const notes = triadNamesInRH(ch);
        events.push({
          atMs: t,
          phase: "RH",
          chordIndex: chordIdx,
          chordSymbol: ch,
          notes,
        });
        t += HIT_MS + GAP_MS;
      }
    });

    // Separator
    t += 220;

    // Pass B — LH
    chords.forEach((ch, chordIdx) => {
      for (let r = 0; r < REPEATS; r++) {
        const notes = [rootNameInLH(ch)];
        events.push({
          atMs: t,
          phase: "LH",
          chordIndex: chordIdx,
          chordSymbol: ch,
          notes,
        });
        t += HIT_MS + GAP_MS;
      }
    });

    return events;
  }, [chords]);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const hardStop = useCallback(() => {
    clearTimer();
    runIdRef.current += 1;

    startAtRef.current = 0;
    elapsedRef.current = 0;
    nextIndexRef.current = 0;

    setIsPlaying(false);
setIsPaused(false);
isPausedRef.current = false;
setPhase("IDLE");

    setActiveChordIndex(null);
    setPrimaryNotes([]);
    setSecondaryNotes([]);
  }, []);

  const fireEvent = useCallback((ev: Event) => {
    const sampler = samplerRef.current;

    setPhase(ev.phase);
    setActiveChordIndex(ev.chordIndex);

    // One keyboard: show only primary notes (RH triad or LH single note)
    setPrimaryNotes(ev.notes);
    setSecondaryNotes([]);

    if (sampler) {
      try {
        // short hit; keeps it clean
        (sampler as any).triggerAttackRelease(ev.notes, 0.55);
      } catch {}
    }
  }, []);

  const scheduleFrom = useCallback((runId: number) => {
    clearTimer();
    if (!timeline.length) {
      hardStop();
      return;
    }

    // If done, stop cleanly but DO NOT flash / clear during pause behavior
    if (nextIndexRef.current >= timeline.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setPhase("IDLE");
      setActiveChordIndex(null);
      setPrimaryNotes([]);
      setSecondaryNotes([]);
      return;
    }

    const now = performance.now();
    const elapsed = now - startAtRef.current;
    const ev = timeline[nextIndexRef.current];
    const waitMs = Math.max(0, ev.atMs - elapsed);

    timerRef.current = window.setTimeout(() => {
      if (runIdRef.current !== runId) return;
      if (isPausedRef.current) return;

      const ev2 = timeline[nextIndexRef.current];
      if (!ev2) return;

      fireEvent(ev2);
      nextIndexRef.current += 1;
      scheduleFrom(runId);
    }, waitMs);
  }, [fireEvent, hardStop, timeline]);

  const playStep1 = useCallback(async () => {
    if (!timeline.length) return;

    await Tone.start().catch(() => {});
    await ensureSampler(samplerRef).catch(() => {});

    hardStop();
    const runId = ++runIdRef.current;

    setIsPlaying(true);
    setIsPaused(false);

    // start timeline
    startAtRef.current = performance.now();
    elapsedRef.current = 0;
    nextIndexRef.current = 0;

    // schedule first event
    scheduleFrom(runId);
  }, [hardStop, scheduleFrom, timeline.length]);

  const pause = useCallback(() => {
  if (!isPlaying || isPaused) return;

  // Freeze elapsed and stop scheduling; keep highlights as-is
  elapsedRef.current = performance.now() - startAtRef.current;
  clearTimer();
  isPausedRef.current = true;
  setIsPaused(true);
}, [isPlaying, isPaused]);

  const resume = useCallback(() => {
  if (!isPlaying || !isPaused) return;

  const runId = runIdRef.current;

  // Re-anchor start time so elapsed continues smoothly
  startAtRef.current = performance.now() - elapsedRef.current;
  isPausedRef.current = false;
  setIsPaused(false);

  scheduleFrom(runId);
}, [isPlaying, isPaused, scheduleFrom]);

  // Cleanup on unmount
  useEffect(() => () => hardStop(), [hardStop]);

  return (
    <div style={{ marginTop: 8 }}>
      <section style={{ marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
              Step 1 — Set the motion
            </p>
            <p style={{ marginTop: 6, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
              Right-hand chords (×4 each), then left-hand root notes (×4 each).
              Pause freezes the current chord.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isPlaying ? (
              <button
                type="button"
                onClick={playStep1}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Play Step 1
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={isPaused ? resume : pause}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    background: "rgba(0,0,0,0.10)",
                    color: "#111",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>

                <button
                  type="button"
                  onClick={hardStop}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    background: "rgba(0,0,0,0.06)",
                    color: "#111",
                    whiteSpace: "nowrap",
                  }}
                >
                  ⏹ Stop
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <KeyboardEmotions
            activeChordSymbol={activeChordIndex != null ? chords[activeChordIndex] : null}
            emotion={emotionPalette}
            emotionLabel={emotionLabel}
            highlightNotesPrimary={primaryNotes}
            highlightNotesSecondary={secondaryNotes}
            highlightColorSecondary={"rgba(17,24,39,0.22)"}
          />

          <ChordProgressLine chords={chords} activeIndex={activeChordIndex} />

          <div style={{ textAlign: "center", fontSize: 12, color: "#374151" }}>
            {isPlaying ? (
              <span>
                Now:{" "}
                <strong>
                  {phase === "RH"
                    ? isPaused
                      ? "Right hand (paused)"
                      : "Right hand"
                    : isPaused
                    ? "Left hand (paused)"
                    : "Left hand"}
                </strong>
              </span>
            ) : (
              <span>
                Chords in this recipe: <strong>{chordLabel}</strong>
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}