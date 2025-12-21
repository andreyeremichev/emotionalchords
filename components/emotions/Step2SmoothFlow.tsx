// components/emotions/Step2SmoothFlow.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

import KeyboardEmotions from "@/components/KeyboardEmotions";
import {
  FLOW_PRESETS,
  buildFlowChordsForKey,
  pitchNameToPc,
  PITCHES,
  type EmotionId,
} from "@/lib/harmony/flow";

type EmotionPalette = {
  gradientTop: string;
  gradientBottom: string;
  trailColor: string;
};

type Step2SmoothFlowProps = {
  emotionId?: EmotionId; // default sadness
  emotionLabel?: string; // default "Sadness"
  emotionPalette: EmotionPalette;
  stepMs?: number; // default 1000 (~4s total)
};

/* ---------- utils ---------- */

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
  urls["C8"] = `C8.wav`;
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

function chordToPitchClasses(symbol: string): { rootPc: number; pcs: number[] } {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(symbol);
  if (!m) return { rootPc: 0, pcs: [] };

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
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps =
    quality === "M" ? [0, 4, 7] : quality === "m" ? [0, 3, 7] : [0, 3, 6];

  const pcs = steps.map((s) => (pc + s) % 12);
  return { rootPc: pc, pcs };
}

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

/**
 * Choose a RH voicing (3 notes) that stays in a comfy range and moves minimally.
 * We generate candidates across octaves 4–5 and pick the one closest to previous.
 */
function chooseSmoothRH(
  pcs: number[],
  prev: number[] | null
): number[] {
  // generate candidates: pick an ordering (root, third, fifth) but allow octave shifts
  const baseOctaves = [4, 5]; // RH range anchor
  const candidates: number[][] = [];

  // permutations of 3 pcs (inversions)
  const perms: number[][] = [
    [pcs[0], pcs[1], pcs[2]],
    [pcs[1], pcs[2], pcs[0]],
    [pcs[2], pcs[0], pcs[1]],
  ];

  for (const order of perms) {
    for (const o0 of baseOctaves) {
      for (const o1 of baseOctaves) {
        for (const o2 of baseOctaves) {
          const m0 = (o0 + 1) * 12 + order[0];
          let m1 = (o1 + 1) * 12 + order[1];
          let m2 = (o2 + 1) * 12 + order[2];

          // enforce ascending-ish (avoid crossed voicings)
          while (m1 < m0) m1 += 12;
          while (m2 < m1) m2 += 12;

          // keep within C4..C6-ish (60..84)
          if (m0 < 60 || m2 > 84) continue;

          candidates.push([m0, m1, m2]);
        }
      }
    }
  }

  if (!candidates.length) {
    // fallback: root position around C4
    const rootMidi = 60 + ((pcs[0] - 0 + 12) % 12);
    return [rootMidi, rootMidi + 3, rootMidi + 7];
  }

  if (!prev) {
    // pick the most centered candidate near C5
    const center = 72;
    candidates.sort(
      (a, b) =>
        Math.abs((a[0] + a[1] + a[2]) / 3 - center) -
        Math.abs((b[0] + b[1] + b[2]) / 3 - center)
    );
    return candidates[0];
  }

  // pick minimal movement (sum abs diff)
  candidates.sort((a, b) => {
    const da =
      Math.abs(a[0] - prev[0]) + Math.abs(a[1] - prev[1]) + Math.abs(a[2] - prev[2]);
    const db =
      Math.abs(b[0] - prev[0]) + Math.abs(b[1] - prev[1]) + Math.abs(b[2] - prev[2]);
    return da - db;
  });

  return candidates[0];
}

/* ---------- component ---------- */

export default function Step2SmoothFlow({
  emotionId = "sadness",
  emotionLabel = "Sadness",
  emotionPalette,
  stepMs = 1000,
}: Step2SmoothFlowProps) {
  const samplerRef = useRef<Tone.Sampler | null>(null);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentChordSymbol, setCurrentChordSymbol] = useState<string | null>(null);
  const [rhNotes, setRhNotes] = useState<string[]>([]);
  const [lhNotes, setLhNotes] = useState<string[]>([]);

  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  const chords = useMemo(() => {
    const preset = FLOW_PRESETS[emotionId];
    const tonicName = preset.mode === "minor" ? "C" : "Bb";
    const tonicPc = pitchNameToPc(tonicName);
    return buildFlowChordsForKey(tonicPc, preset);
  }, [emotionId]);

  const stop = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    runIdRef.current += 1;
    setIsPlaying(false);
    setActiveIdx(null);
    setCurrentChordSymbol(null);
    setRhNotes([]);
    setLhNotes([]);
  }, []);

  const play = useCallback(async () => {
    if (!chords.length) return;

    await Tone.start().catch(() => {});
    stop();

    setIsPlaying(true);
    const runId = ++runIdRef.current;

    let prevRH: number[] | null = null;

    chords.forEach((symbol, idx) => {
      const t = window.setTimeout(() => {
        if (runIdRef.current !== runId) return;

        const { rootPc, pcs } = chordToPitchClasses(symbol);
        if (!pcs.length) return;

        // LH: single low root (C3 range)
        const lhMidi = (3 + 1) * 12 + rootPc; // octave 3
        const lh = [midiToName(lhMidi)];

        // RH: smooth voicing near C4–C6
        const rhMidi = chooseSmoothRH(pcs, prevRH);
        prevRH = rhMidi;
        const rh = rhMidi.map(midiToName);

        setActiveIdx(idx);
        setCurrentChordSymbol(symbol);
        setRhNotes(rh);
        setLhNotes(lh);

        const sampler = samplerRef.current;
        if (sampler) {
          try {
            (sampler as any).triggerAttackRelease([...lh, ...rh], 0.85);
          } catch {
            // ignore
          }
        }

        // end
        if (idx === chords.length - 1) {
          const end = window.setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setIsPlaying(false);
            setActiveIdx(null);
          }, stepMs);
          timersRef.current.push(end);
        }
      }, idx * stepMs);

      timersRef.current.push(t);
    });
  }, [chords, stepMs, stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div>
      {/* You can control play from parent later; for now we expose a simple button */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
        <button
          type="button"
          onClick={isPlaying ? stop : play}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "8px 14px",
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {isPlaying ? "Stop" : "Play smoother"}
        </button>
      </div>

      <KeyboardEmotions
        activeChordSymbol={currentChordSymbol}
        emotion={emotionPalette}
        emotionLabel={emotionLabel}
        // Step 2 highlights:
        highlightNotesPrimary={rhNotes}
        highlightNotesSecondary={lhNotes}
        // LH is subtle charcoal overlay (still readable on white/black keys)
        highlightColorSecondary={"rgba(17,24,39,0.22)"}
      />

      {/* Optional tiny caption line */}
      <div style={{ textAlign: "center", fontSize: 12, color: "#374151", opacity: 0.9 }}>
        {activeIdx != null && currentChordSymbol ? (
          <>
            LH: <strong>{lhNotes[0]}</strong> · RH:{" "}
            <strong>{rhNotes.join(" ")}</strong>
          </>
        ) : (
          <>Right hand stays close. Left hand holds the root.</>
        )}
      </div>
    </div>
  );
}