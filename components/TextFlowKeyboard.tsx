// components/TextFlowKeyboard.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions from "@/components/KeyboardEmotions";

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

export type TextFlowKeyboardProps = {
  emotionId: EmotionId;
  emotionLabel: string;
  emotionEmoji: string;
  palette: {
    gradientTop: string;
    gradientBottom: string;
    trailColor: string;
  };
  flowChords: string; // e.g. "Bb F Gm Eb" or "Cm Ab Eb Bb"
    displayChords?: string[];
  phrases: [string, string, string, string];
  autoPlayKey?: number; // bump to retrigger
};

const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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

/** RH triad in the C4 bucket */
function triadNamesInRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  if (!pcs.length) return [];
  const base = 60; // C4
  return pcs.map((pc) => midiToNoteName(base + ((pc - 0 + 12) % 12)));
}

/** LH root note in octave 3 */
function rootNameInLH(symbol: string): string {
  const { rootPc } = chordToPitchClasses(symbol);
  const midi = (3 + 1) * 12 + rootPc; // C3..B3
  return midiToNoteName(midi);
}

function buildFullPianoUrls(): Record<string, string> {
  const urls: Record<string, string> = {};

  // A0, A#0, B0
  for (const p of ["A", "A#", "B"] as const) {
    const name = `${p}0`;
    const safe = name.replace("#", "%23");
    urls[name] = `${safe}.wav`;
  }

  // C1..B7
  for (let oct = 1; oct <= 7; oct++) {
    for (const p of PITCHES) {
      const name = `${p}${oct}`;
      const safe = name.replace("#", "%23");
      urls[name] = `${safe}.wav`;
    }
  }

  // C8
  {
    const name = "C8";
    const safe = name.replace("#", "%23");
    urls[name] = `${safe}.wav`;
  }

  return urls;
}

async function ensurePianoSampler(ref: React.MutableRefObject<Tone.Sampler | null>) {
  if (ref.current) return;
  const sampler = new Tone.Sampler({ urls: buildFullPianoUrls(), baseUrl: "/audio/notes/" }).toDestination();
  await Tone.loaded();
  ref.current = sampler;
}

const HIT_MS = 1200;
const REPEATS = 2;
const LABELS = ["One", "Two", "Three", "Four"] as const;

export default function TextFlowKeyboard({
  emotionId,
  emotionLabel,
  emotionEmoji,
  palette,
  flowChords,
  displayChords,
  phrases,
  autoPlayKey,
}: TextFlowKeyboardProps) {
  const samplerRef = useRef<Tone.Sampler | null>(null);

  const [hitIndex, setHitIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  const chords = useMemo(() => flowChords.trim().split(/\s+/).filter(Boolean), [flowChords]);
  const stepsTotal = useMemo(() => chords.length * REPEATS, [chords.length]);

  useEffect(() => {
    ensurePianoSampler(samplerRef).catch(() => {});
  }, []);

  const stop = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    runIdRef.current += 1;
    setIsPlaying(false);
    setHitIndex(null);
  }, []);

  const play = useCallback(async () => {
    if (!chords.length) return;

    await Tone.start().catch(() => {});
    await ensurePianoSampler(samplerRef);

    stop();
    setIsPlaying(true);
    const runId = ++runIdRef.current;

    for (let step = 0; step < stepsTotal; step++) {
      const t = window.setTimeout(() => {
        if (runIdRef.current !== runId) return;

        setHitIndex(step);

        const chordIdx = Math.min(chords.length - 1, Math.floor(step / REPEATS));
        const chord = chords[chordIdx] ?? "";

        const rh = triadNamesInRH(chord);
        const lh = rootNameInLH(chord);
        const toPlay = [lh, ...rh].filter(Boolean);

        const sampler = samplerRef.current;
        if (sampler && toPlay.length) {
          try {
            (sampler as any).triggerAttackRelease(toPlay, 0.45);
          } catch {}
        }
      }, step * HIT_MS);

      timersRef.current.push(t);
    }

    const endId = window.setTimeout(() => {
      if (runIdRef.current !== runId) return;
      setIsPlaying(false);
      setHitIndex(null);
    }, stepsTotal * HIT_MS + 30);

    timersRef.current.push(endId);
  }, [chords, stepsTotal, stop]);

  useEffect(() => {
    if (autoPlayKey == null) return;
    if (!chords.length) return;
    play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayKey]);

  useEffect(() => () => stop(), [stop]);

  const chordIdx = hitIndex == null ? null : Math.min(chords.length - 1, Math.floor(hitIndex / REPEATS));
  const activeChordSymbol = chordIdx == null ? null : chords[chordIdx] ?? null;

  const label = chordIdx == null ? "" : (LABELS[chordIdx] ?? "");
  const phrase = chordIdx == null ? "" : (phrases[chordIdx] ?? "");

  return (
    <section
      style={{
        borderRadius: 16,
        padding: 12,
        background: "#fffdf5",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        
      </div>

      {/* Description (single active) */}
      <div
        style={{
          marginTop: 6,
          marginBottom: 10,
          padding: "0 6px",
          color: "rgba(17,24,39,0.75)",
          fontSize: 16,
          lineHeight: 1.35,
          minHeight: 44,
          textAlign: "left",
        }}
      >
        {activeChordSymbol ? (
          <>
            <span style={{ fontWeight: 800, marginRight: 6, fontSize: 14 }}>{label}:</span>
            <span style={{ fontWeight: 700 }}>{phrase}</span>
          </>
        ) : (
          <span style={{ opacity: 0.6 }}>Tap an emotion to play Flow.</span>
        )}
      </div>

      <KeyboardEmotions
        activeChordSymbol={activeChordSymbol}
        emotion={palette}
        emotionLabel={emotionLabel}
        highlightNotesPrimary={activeChordSymbol ? triadNamesInRH(activeChordSymbol) : []}
        highlightNotesSecondary={activeChordSymbol ? [rootNameInLH(activeChordSymbol)] : []}
        highlightColorSecondary={"rgba(17,24,39,0.22)"}
      />

      <div style={{ marginTop: 6, textAlign: "center", fontWeight: 800, color: "rgba(17,24,39,0.72)" }}>
        {activeChordSymbol
  ? (displayChords?.[chordIdx ?? -1] ?? activeChordSymbol)
  : "\u00A0"}
      </div>

      {/* No Play / Stop buttons: parent triggers via autoPlayKey */}
      <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, color: "rgba(17,24,39,0.45)" }}>
        {emotionId} · {(displayChords?.length ? displayChords : chords).join(" → ")}
      </div>
    </section>
  );
}