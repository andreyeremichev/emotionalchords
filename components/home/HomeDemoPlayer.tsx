"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

import KeyboardEmotions from "@/components/KeyboardEmotions";
import Step2RhythmPractice from "@/components/emotions/Step2RhythmPractice";

import type { EmotionMeta } from "@/lib/emotions";
import { PITCHES } from "@/lib/harmony/flow";
import {
  practicePatternForEmotion,
  practiceStep2ColorSpeed,
} from "@/lib/practiceSession";

type Phase = "idle" | "flowSmooth" | "colorSmooth" | "colorFeeling";

/* =========================
   Tiny sampler for “Smooth chords” phases only
========================= */

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

function midiToNoteName(midi: number): string {
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
  return midiToNoteName(midi);
}

// RH close voicing in C4 bucket (C4..B4)
function chordToCloseRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  const base = 60; // C4
  return pcs.map((pc) => midiToNoteName(base + pc));
}

/* =========================
   Component
========================= */

export default function HomeDemoPlayer({
  emotion,
  playToken,
}: {
  emotion: EmotionMeta;
  playToken: number; // increments on every pill tap (including same emotion)
}) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");

  // For Smooth phases only
  const [activeChordSymbol, setActiveChordSymbol] = useState<string | null>(null);
  const [primary, setPrimary] = useState<string[]>([]);
  const [secondary, setSecondary] = useState<string[]>([]);

  const flow = useMemo(() => emotion.flow.chords, [emotion.flow.chords]);
  const color = useMemo(() => emotion.color.chords, [emotion.color.chords]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const stop = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    setPhase("idle");
    setActiveChordSymbol(null);
    setPrimary([]);
    setSecondary([]);
  }, []);

  const schedule = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const playBothBlock = (chord: string, durSec: number) => {
    const lh = chordToRootLH(chord);
    const rh = chordToCloseRH(chord);

    setActiveChordSymbol(chord);
    setPrimary(rh);
    setSecondary([lh]);

    const sampler = samplerRef.current;
    if (sampler) {
      try {
        (sampler as any).triggerAttackRelease([lh, ...rh], durSec, undefined, 0.85);
      } catch {}
    }
  };

  const playDemo = useCallback(async () => {
    await Tone.start().catch(() => {});
    await ensureSampler(samplerRef).catch(() => {});

    stop();
    const runId = ++runIdRef.current;

    // Smooth blocks (short, one pass)
    const stepMs = 850;
    const gapMs = 180;

    // “With feeling” duration (we just leave the phase active long enough)
    // Practice engine will run one “full” drill and then stop.
    

    let t = 0;

    // 1) Flow Smooth
    setPhase("flowSmooth");
    flow.forEach((ch) => {
      schedule(t, () => {
        if (runIdRef.current !== runId) return;
        playBothBlock(ch, 0.65);
      });
      t += stepMs + gapMs;
    });

    // 2) Color Smooth
    schedule(t + 150, () => {
      if (runIdRef.current !== runId) return;
      setPhase("colorSmooth");
    });
    t += 250;

    color.forEach((ch) => {
      schedule(t, () => {
        if (runIdRef.current !== runId) return;
        playBothBlock(ch, 0.65);
      });
      t += stepMs + gapMs;
    });

    // 3) Color with feeling (PRACTICE ENGINE)
    schedule(t + 150, () => {
      if (runIdRef.current !== runId) return;
      // Clear the smooth highlights; Step2RhythmPractice will render its own keyboard.
      setActiveChordSymbol(null);
      setPrimary([]);
      setSecondary([]);
      setPhase("colorFeeling");
    });
    t += 250;

    
  }, [color, flow, stop]);

  useEffect(() => {
    if (playToken === 0) return; // no autoplay on first load
    playDemo();
    return stop;
  }, [playToken, playDemo, stop]);

  function Seg({ active, children }: { active: boolean; children: React.ReactNode }) {
    return (
      <span
        className={
          active
            ? "font-semibold text-neutral-900 underline underline-offset-2"
            : "text-neutral-500"
        }
      >
        {children}
      </span>
    );
  }

  const isFlow = phase === "flowSmooth";
  const isColor = phase === "colorSmooth";
  const isFeeling = phase === "colorFeeling";

  const practicePattern = practicePatternForEmotion(emotion.id);
  const practiceSpeed = practiceStep2ColorSpeed(emotion.id);

  return (
    <div>
      <div className="mb-2 text-[11px]">
        {phase === "idle" ? (
          <span className="text-neutral-500">
            Hear it played in:{" "}
            <span className="font-semibold">Flow → Color → With feeling</span>
          </span>
        ) : (
          <span>
            <span className="text-neutral-500">Now playing: </span>
            <Seg active={isFlow}>Flow</Seg>
            <span className="text-neutral-400"> → </span>
            <Seg active={isColor}>Color</Seg>
            <span className="text-neutral-400"> → </span>
            <Seg active={isFeeling}>With feeling</Seg>
          </span>
        )}
      </div>

      {/* Smooth phases: show the lightweight keyboard */}
      {phase !== "colorFeeling" && (
        <KeyboardEmotions
          activeChordSymbol={activeChordSymbol}
          emotion={emotion.palette}
          emotionLabel={emotion.label}
          highlightNotesPrimary={primary}
          highlightNotesSecondary={secondary}
          highlightColorSecondary="rgba(17,24,39,0.22)"
        />
      )}

      {/* Feeling phase: show EXACT practice engine (headless demo mode) */}
      {phase === "colorFeeling" && (
        <Step2RhythmPractice
          key={`${emotion.id}-${playToken}-colorFeeling`}
          emotionLabel={`${emotion.label} · With feeling`}
          emotionPalette={emotion.palette}
          chords={emotion.color.chords}
          pattern={practicePattern}
          {...practiceSpeed}
          autoPlay
          hideControls
          defaultDrill="full"
          defaultSlowMode={false}
          onFinished={() => stop()}
        />
      )}
    </div>
  );
}