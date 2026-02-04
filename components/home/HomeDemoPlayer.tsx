"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

import KeyboardEmotions from "@/components/KeyboardEmotions";
import type { EmotionMeta } from "@/lib/emotions";
import { PITCHES } from "@/lib/harmony/flow";

/* =========================
   Tiny sampler (same as before)
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

/** RH close voicing in C4 bucket (C4..B4). */
function chordToCloseRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  const base = 60; // C4
  return pcs.map((pc) => midiToNoteName(base + pc));
}

/* =========================
   Ritual player
========================= */

type RitualPath = "flow" | "color";

export default function HomeDemoPlayer({
  emotion,
  playToken,
  path,
  repeatsPerChord = 3,
  onBaseStepChange, // ✅ NEW
}: {
  emotion: EmotionMeta;
  playToken: number;
  path: RitualPath;
  repeatsPerChord?: number; // 3–4 recommended
  onBaseStepChange?: (step: number | null) => void; // ✅ NEW (0..3)
}) {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  const [activeChordSymbol, setActiveChordSymbol] = useState<string | null>(null);
  const [primary, setPrimary] = useState<string[]>([]);

  const baseChords = useMemo(() => {
    return path === "flow" ? emotion.flow.chords : emotion.color.chords;
  }, [emotion.flow.chords, emotion.color.chords, path]);

  const nRep = useMemo(() => {
    return Math.max(1, Math.min(6, Math.floor(repeatsPerChord)));
  }, [repeatsPerChord]);

  const chords = useMemo(() => {
    const out: string[] = [];
    for (const ch of baseChords) {
      for (let i = 0; i < nRep; i++) out.push(ch);
    }
    return out;
  }, [baseChords, nRep]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const stop = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    setActiveChordSymbol(null);
    setPrimary([]);
    onBaseStepChange?.(null); // ✅ NEW
  }, [onBaseStepChange]);

  const schedule = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const playRHBlock = (chord: string, durSec: number) => {
    const rh = chordToCloseRH(chord);
    setActiveChordSymbol(chord);
    setPrimary(rh);

    const sampler = samplerRef.current;
    if (sampler) {
      try {
        (sampler as any).triggerAttackRelease(rh, durSec, undefined, 0.85);
      } catch {}
    }
  };

  const playRitual = useCallback(async () => {
    await Tone.start().catch(() => {});
    await ensureSampler(samplerRef).catch(() => {});

    stop();
    const runId = ++runIdRef.current;

    const hitMs = 650;
    const gapMs = 120;

    let t = 0;

    chords.forEach((ch, i) => {
      const baseStep = Math.min(3, Math.floor(i / nRep)); // ✅ NEW (0..3)
      schedule(t, () => {
        if (runIdRef.current !== runId) return;
        onBaseStepChange?.(baseStep); // ✅ NEW
        playRHBlock(ch, 0.55);
      });
      t += hitMs + gapMs;
    });

    schedule(t + 150, () => {
      if (runIdRef.current !== runId) return;
      setActiveChordSymbol(null);
      setPrimary([]);
      onBaseStepChange?.(null); // ✅ NEW
    });
  }, [chords, nRep, onBaseStepChange, stop]);

  useEffect(() => {
    if (playToken === 0) return;
    playRitual();
    return stop;
  }, [playToken, playRitual, stop]);

  return (
    <KeyboardEmotions
      activeChordSymbol={activeChordSymbol}
      emotion={emotion.palette}
      emotionLabel=""
      highlightNotesPrimary={primary}
      highlightNotesSecondary={[]}
      highlightColorSecondary="rgba(17,24,39,0.22)"
    />
  );
}