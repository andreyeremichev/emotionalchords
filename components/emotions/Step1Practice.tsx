"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions, { EmotionPalette } from "@/components/KeyboardEmotions";
import { PITCHES } from "@/lib/harmony/flow";
import {
  buildAscendingRhVoicing,
  getLockedPracticeVoicing,
  lhRootToNote,
  prettyNote,
  type PracticeEmotionId,
  type PracticePathId,
} from "@/lib/emotionPracticeVoicings";

/**
 * Step 1
 * - One keyboard only
 * - Pass A: RH locked voicings, each chord x4
 * - Pass B: LH locked roots, each chord x4
 * - Pause/Resume freezes the current highlighted chord
 * - Uses the same locked source as Step 2
 */

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

function NotesProgressLine(props: {
  rhBars: string[][];
  lhBars: string[];
  activeIndex: number | null;
}) {
  const { rhBars, lhBars, activeIndex } = props;

  const renderBar = (content: React.ReactNode, i: number) => {
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
        {rhBars.map((bar, i) => renderBar(bar.map(prettyNote).join(" "), i))}
      </div>
      <div>
        <span style={{ fontWeight: 800, marginRight: 6 }}>LH:</span>
        {lhBars.map((bar, i) => renderBar(prettyNote(bar), i))}
      </div>
    </div>
  );
}

type Step1Phase = "IDLE" | "RH" | "LH";

type Event = {
  atMs: number;
  phase: Step1Phase;
  chordIndex: number;
  notes: string[];
};

export default function Step1Practice(props: {
  emotionId: PracticeEmotionId;
  path: PracticePathId;
  emotionLabel: string;
  emotionPalette: EmotionPalette;
  chords?: string[];
}) {
  const { emotionId, path, emotionLabel, emotionPalette } = props;

  const samplerRef = useRef<Tone.Sampler | null>(null);
  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  const locked = useMemo(() => getLockedPracticeVoicing(emotionId, path), [emotionId, path]);

  const rhBars = useMemo(() => locked.rh, [locked.rh]);
  const lhBars = useMemo(() => locked.lh, [locked.lh]);

  const rhVoicings = useMemo(() => {
    return locked.rh.map(buildAscendingRhVoicing);
  }, [locked.rh]);

  const lhRoots = useMemo(() => {
    return locked.lh.map(lhRootToNote);
  }, [locked.lh]);

  const timerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const startAtRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const nextIndexRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  const [phase, setPhase] = useState<Step1Phase>("IDLE");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);
  const [primaryNotes, setPrimaryNotes] = useState<string[]>([]);
  const [secondaryNotes, setSecondaryNotes] = useState<string[]>([]);

  const timeline = useMemo<Event[]>(() => {
    const REPEATS = 4;
    const HIT_MS = 650;
    const GAP_MS = 120;

    let t = 0;
    const events: Event[] = [];

    // Pass A — RH
    rhVoicings.forEach((notes, chordIdx) => {
      for (let r = 0; r < REPEATS; r++) {
        events.push({
          atMs: t,
          phase: "RH",
          chordIndex: chordIdx,
          notes,
        });
        t += HIT_MS + GAP_MS;
      }
    });

    // Separator
    t += 220;

    // Pass B — LH
    lhRoots.forEach((root, chordIdx) => {
      for (let r = 0; r < REPEATS; r++) {
        events.push({
          atMs: t,
          phase: "LH",
          chordIndex: chordIdx,
          notes: [root],
        });
        t += HIT_MS + GAP_MS;
      }
    });

    return events;
  }, [rhVoicings, lhRoots]);

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

    setPrimaryNotes(ev.notes);
    setSecondaryNotes([]);

    if (sampler) {
      try {
        (sampler as any).triggerAttackRelease(ev.notes, 0.55);
      } catch {}
    }
  }, []);

  const scheduleFrom = useCallback(
    (runId: number) => {
      clearTimer();
      if (!timeline.length) {
        hardStop();
        return;
      }

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
    },
    [fireEvent, hardStop, timeline]
  );

  const playStep1 = useCallback(async () => {
    if (!timeline.length) return;

    await Tone.start().catch(() => {});
    await ensureSampler(samplerRef).catch(() => {});

    hardStop();
    const runId = ++runIdRef.current;

    setIsPlaying(true);
    setIsPaused(false);

    startAtRef.current = performance.now();
    elapsedRef.current = 0;
    nextIndexRef.current = 0;

    scheduleFrom(runId);
  }, [hardStop, scheduleFrom, timeline.length]);

  const pause = useCallback(() => {
    if (!isPlaying || isPaused) return;

    elapsedRef.current = performance.now() - startAtRef.current;
    clearTimer();
    isPausedRef.current = true;
    setIsPaused(true);
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (!isPlaying || !isPaused) return;

    const runId = runIdRef.current;
    startAtRef.current = performance.now() - elapsedRef.current;
    isPausedRef.current = false;
    setIsPaused(false);

    scheduleFrom(runId);
  }, [isPlaying, isPaused, scheduleFrom]);

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
              Right-hand locked voicings (×4 each), then left-hand locked roots (×4 each).
              Pause freezes the current highlighted notes.
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
            activeChordSymbol={activeChordIndex != null ? props.chords?.[activeChordIndex] ?? null : null}
            emotion={emotionPalette}
            emotionLabel={emotionLabel}
            highlightNotesPrimary={primaryNotes}
            highlightNotesSecondary={secondaryNotes}
            highlightColorSecondary={"rgba(17,24,39,0.22)"}
          />

          <NotesProgressLine
            rhBars={rhBars}
            lhBars={lhBars}
            activeIndex={activeChordIndex}
          />

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
                Locked notes ready for practice.
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}