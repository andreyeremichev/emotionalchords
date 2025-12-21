"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import KeyboardEmotions, { EmotionPalette } from "@/components/KeyboardEmotions";
import { PITCHES } from "@/lib/harmony/flow";

type TempoMode = "verySlow" | "slow" | "normal";

const TEMPO_MAP: Record<TempoMode, { label: string; playMs: number; restMs: number }> = {
  verySlow: { label: "🐢 Very slow", playMs: 4500, restMs: 300 },
  slow: { label: "🚶 Slow", playMs: 2700, restMs: 300 },
  normal: { label: "🏃 Normal", playMs: 1200, restMs: 300 },
};

type StationMode = "RH" | "LH" | "BOTH";

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

/** Root-position RH triad in C4–C6 range (we use octave 4 for clarity) */
function triadNamesInRH(symbol: string): string[] {
  const { pcs } = chordToPitchClasses(symbol);
  if (!pcs.length) return [];
  const base = 60; // C4
  return pcs.map((pc) => midiToName(base + ((pc - 0 + 12) % 12)));
}

/** LH root note in C3–B3 */
function rootNameInLH(symbol: string): string {
  const { rootPc } = chordToPitchClasses(symbol);
  const midi = (3 + 1) * 12 + rootPc; // octave 3
  return midiToName(midi);
}

/* =========================================================
   Hook: practice station playback with Pause/Resume
   ========================================================= */

type PracticeState = {
  isPlaying: boolean;
  isPaused: boolean;
  activeIndex: number | null;
  primaryNotes: string[];
  secondaryNotes: string[];
};

function usePracticeStation(params: {
  chords: string[];
  mode: StationMode;
  samplerRef: React.MutableRefObject<Tone.Sampler | null>;
}) {
  const { chords, mode, samplerRef } = params;

  const [state, setState] = useState<PracticeState>({
    isPlaying: false,
    isPaused: false,
    activeIndex: null,
    primaryNotes: [],
    secondaryNotes: [],
  });

  const timerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const phaseRef = useRef<"play" | "rest">("play");
  const idxRef = useRef(0);
  const remainMsRef = useRef<number | null>(null);
  const phaseStartedAtRef = useRef<number>(0);
  const phaseDurationRef = useRef<number>(0);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    clearTimer();
    runIdRef.current += 1;
    phaseRef.current = "play";
    idxRef.current = 0;
    remainMsRef.current = null;

    setState({
      isPlaying: false,
      isPaused: false,
      activeIndex: null,
      primaryNotes: [],
      secondaryNotes: [],
    });
  }, []);

  const scheduleNext = useCallback((ms: number, fn: () => void) => {
    clearTimer();
    timerRef.current = window.setTimeout(fn, ms);
  }, []);

  const tick = useCallback(
    (playMs: number, restMs: number, runId: number) => {
      if (runIdRef.current !== runId) return;

      const i = idxRef.current;
      const chord = chords[i];
      if (!chord) {
        setState((s) => ({ ...s, isPlaying: false, isPaused: false, activeIndex: null }));
        return;
      }

      const sampler = samplerRef.current;

      if (phaseRef.current === "play") {
        const rh = triadNamesInRH(chord);
        const lh = rootNameInLH(chord);

        const primary = mode === "RH" ? rh : mode === "LH" ? [lh] : rh;
        const secondary = mode === "BOTH" ? [lh] : [];

        setState({
          isPlaying: true,
          isPaused: false,
          activeIndex: i,
          primaryNotes: primary,
          secondaryNotes: secondary,
        });

        if (sampler) {
          try {
            const toPlay = mode === "RH" ? rh : mode === "LH" ? [lh] : [lh, ...rh];
            (sampler as any).triggerAttackRelease(toPlay, Math.max(0.2, playMs / 1000 - 0.05));
          } catch {}
        }

        phaseRef.current = "rest";
        phaseStartedAtRef.current = performance.now();
        phaseDurationRef.current = playMs;

        scheduleNext(playMs, () => tick(playMs, restMs, runId));
        return;
      }

      // rest phase: clear highlights, keep chord index null (short 300ms)
      setState((s) => ({
        ...s,
        isPlaying: true,
        isPaused: false,
        activeIndex: null,
        primaryNotes: [],
        secondaryNotes: [],
      }));

      phaseRef.current = "play";
      idxRef.current = i + 1;

      phaseStartedAtRef.current = performance.now();
      phaseDurationRef.current = restMs;

      scheduleNext(restMs, () => tick(playMs, restMs, runId));
    },
    [chords, mode, samplerRef, scheduleNext]
  );

  const start = useCallback(
    async (tempo: TempoMode) => {
      await Tone.start().catch(() => {});
      const { playMs, restMs } = TEMPO_MAP[tempo];

      stop();
      const runId = ++runIdRef.current;

      phaseRef.current = "play";
      idxRef.current = 0;
      remainMsRef.current = null;

      setState((s) => ({ ...s, isPlaying: true, isPaused: false }));
      tick(playMs, restMs, runId);
    },
    [stop, tick]
  );

  const pause = useCallback(() => {
    if (!state.isPlaying || state.isPaused) return;
    const elapsed = performance.now() - phaseStartedAtRef.current;
    const remaining = Math.max(0, phaseDurationRef.current - elapsed);

    remainMsRef.current = remaining;
    clearTimer();
    setState((s) => ({ ...s, isPaused: true }));
  }, [state.isPlaying, state.isPaused]);

  const resumeWithTempo = useCallback(
    (playMs: number, restMs: number) => {
      if (!state.isPlaying || !state.isPaused) return;

      const remaining = remainMsRef.current ?? 0;
      const runId = runIdRef.current;

      phaseStartedAtRef.current = performance.now();
      phaseDurationRef.current = remaining;

      scheduleNext(remaining, () => tick(playMs, restMs, runId));
      setState((s) => ({ ...s, isPaused: false }));
    },
    [scheduleNext, state.isPlaying, state.isPaused, tick]
  );

  useEffect(() => () => stop(), [stop]);

  return { state, start, pause, resumeWithTempo, stop };
}

/* =========================================================
   Step 1.0 note-by-note demo
   ========================================================= */

type DemoState = {
  isPlaying: boolean;
  activeChordIndex: number | null;
  primaryNotes: string[];
};

function useNoteByNoteDemo(params: {
  chords: string[];
  samplerRef: React.MutableRefObject<Tone.Sampler | null>;
}) {
  const { chords, samplerRef } = params;
  const [demo, setDemo] = useState<DemoState>({
    isPlaying: false,
    activeChordIndex: null,
    primaryNotes: [],
  });

  const timerIds = useRef<number[]>([]);
  const runIdRef = useRef(0);

  const clear = () => {
    timerIds.current.forEach((t) => window.clearTimeout(t));
    timerIds.current = [];
  };

  const stop = useCallback(() => {
    clear();
    runIdRef.current += 1;
    setDemo({ isPlaying: false, activeChordIndex: null, primaryNotes: [] });
  }, []);

  const play = useCallback(async () => {
    await Tone.start().catch(() => {});
    stop();

    const runId = ++runIdRef.current;
    setDemo({ isPlaying: true, activeChordIndex: 0, primaryNotes: [] });

    const noteMs = 1000;
    const restMs = 1000;
    let t = 0;

    chords.forEach((symbol, chordIdx) => {
      const rhTriad = triadNamesInRH(symbol);
      const events: { notes: string[]; dur: number; highlight: string[]; restAfter: number }[] = [
        { notes: [rhTriad[0]], dur: noteMs, highlight: [rhTriad[0]], restAfter: restMs },
        { notes: [rhTriad[1]], dur: noteMs, highlight: [rhTriad[1]], restAfter: restMs },
        { notes: [rhTriad[2]], dur: noteMs, highlight: [rhTriad[2]], restAfter: restMs },
        { notes: rhTriad, dur: noteMs, highlight: rhTriad, restAfter: 0 },
      ];

      events.forEach((ev, evIdx) => {
        const id = window.setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setDemo({ isPlaying: true, activeChordIndex: chordIdx, primaryNotes: ev.highlight });

          const sampler = samplerRef.current;
          if (sampler) {
            try {
              (sampler as any).triggerAttackRelease(ev.notes, Math.max(0.2, ev.dur / 1000 - 0.05));
            } catch {}
          }
        }, t);
        timerIds.current.push(id);
        t += ev.dur;

        if (ev.restAfter > 0) {
          const id2 = window.setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setDemo({ isPlaying: true, activeChordIndex: chordIdx, primaryNotes: [] });
          }, t);
          timerIds.current.push(id2);
          t += ev.restAfter;
        }

        if (chordIdx === chords.length - 1 && evIdx === events.length - 1) {
          const endId = window.setTimeout(() => {
            if (runIdRef.current !== runId) return;
            setDemo({ isPlaying: false, activeChordIndex: null, primaryNotes: [] });
          }, t + 50);
          timerIds.current.push(endId);
        }
      });
    });
  }, [chords, samplerRef, stop]);

  useEffect(() => () => stop(), [stop]);

  return { demo, play, stop };
}

/* =========================================================
   UI
   ========================================================= */

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

function TempoControls(props: {
  activeTempo: TempoMode | null;
  isPlaying: boolean;
  isPaused: boolean;
  onStart: (t: TempoMode) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const { activeTempo, isPlaying, isPaused, onStart, onPause, onResume, onStop } = props;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
      {(["verySlow", "slow", "normal"] as const).map((t) => {
        const isActive = activeTempo === t && isPlaying && !isPaused;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onStart(t)}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: isActive ? "#111" : "rgba(0,0,0,0.06)",
              color: isActive ? "#fff" : "#111",
            }}
          >
            {TEMPO_MAP[t].label}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => (isPaused ? onResume() : onPause())}
        disabled={!isPlaying}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 700,
          cursor: isPlaying ? "pointer" : "not-allowed",
          background: isPlaying ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.04)",
          color: "#111",
          opacity: isPlaying ? 1 : 0.5,
        }}
      >
        {isPaused ? "▶ Resume" : "⏸ Pause"}
      </button>

      <button
        type="button"
        onClick={onStop}
        disabled={!isPlaying}
        style={{
          border: "none",
          borderRadius: 999,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 700,
          cursor: isPlaying ? "pointer" : "not-allowed",
          background: "rgba(0,0,0,0.06)",
          color: "#111",
          opacity: isPlaying ? 1 : 0.5,
        }}
      >
        ⏹ Stop
      </button>
    </div>
  );
}

/* =========================================================
   Component
   ========================================================= */

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

  const { demo, play: playDemo, stop: stopDemo } = useNoteByNoteDemo({ chords, samplerRef });

  const rhStation = usePracticeStation({ chords, mode: "RH", samplerRef });
  const lhStation = usePracticeStation({ chords, mode: "LH", samplerRef });
  const bothStation = usePracticeStation({ chords, mode: "BOTH", samplerRef });

  const [rhTempo, setRhTempo] = useState<TempoMode | null>(null);
  const [lhTempo, setLhTempo] = useState<TempoMode | null>(null);
  const [bothTempo, setBothTempo] = useState<TempoMode | null>(null);

  const startRH = useCallback((t: TempoMode) => { setRhTempo(t); rhStation.start(t); }, [rhStation]);
  const startLH = useCallback((t: TempoMode) => { setLhTempo(t); lhStation.start(t); }, [lhStation]);
  const startBoth = useCallback((t: TempoMode) => { setBothTempo(t); bothStation.start(t); }, [bothStation]);

  const resumeRH = useCallback(() => {
    const t = rhTempo ?? "normal";
    rhStation.resumeWithTempo(TEMPO_MAP[t].playMs, TEMPO_MAP[t].restMs);
  }, [rhStation, rhTempo]);

  const resumeLH = useCallback(() => {
    const t = lhTempo ?? "normal";
    lhStation.resumeWithTempo(TEMPO_MAP[t].playMs, TEMPO_MAP[t].restMs);
  }, [lhStation, lhTempo]);

  const resumeBoth = useCallback(() => {
    const t = bothTempo ?? "normal";
    bothStation.resumeWithTempo(TEMPO_MAP[t].playMs, TEMPO_MAP[t].restMs);
  }, [bothStation, bothTempo]);

  const chordLabel = (list: string[]) =>
    list.map((c) => c.replace("b", "♭").replace("#", "♯")).join(" · ");

  return (
    <div style={{ marginTop: 8 }}>
      {/* Step 1.0 */}
      <section style={{ marginTop: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
          Smooth chords · Part 1 — See the chord
        </p>
        <p style={{ marginTop: 6, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
          We reveal each chord note-by-note (root → third → fifth), then play the full chord.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
          <button
            type="button"
            onClick={demo.isPlaying ? stopDemo : playDemo}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              background: "#111",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {demo.isPlaying ? "Stop demo" : "Play note-by-note"}
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          <KeyboardEmotions
            activeChordSymbol={demo.activeChordIndex != null ? chords[demo.activeChordIndex] : null}
            emotion={emotionPalette}
            emotionLabel={emotionLabel}
            highlightNotesPrimary={demo.primaryNotes}
            highlightNotesSecondary={[]}
          />
          <ChordProgressLine chords={chords} activeIndex={demo.activeChordIndex} />
          <div style={{ textAlign: "center", fontSize: 12, color: "#374151" }}>
            {demo.isPlaying ? (
              <span>Listen for the chord building… then the full chord.</span>
            ) : (
              <span>
                Chords in this recipe: <strong>{chordLabel(chords)}</strong>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Step 1.1 RH */}
      <section style={{ marginTop: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
          Smooth chords · Part 2 — Right hand
        </p>
        <p style={{ marginTop: 6, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
          Play the chords with your right hand only. Take your time — let your hand learn the shapes.
        </p>

        <TempoControls
          activeTempo={rhTempo}
          isPlaying={rhStation.state.isPlaying}
          isPaused={rhStation.state.isPaused}
          onStart={startRH}
          onPause={rhStation.pause}
          onResume={resumeRH}
          onStop={rhStation.stop}
        />

        <KeyboardEmotions
          activeChordSymbol={rhStation.state.activeIndex != null ? chords[rhStation.state.activeIndex] : null}
          emotion={emotionPalette}
          emotionLabel={emotionLabel}
          highlightNotesPrimary={rhStation.state.primaryNotes}
          highlightNotesSecondary={[]}
        />
        <ChordProgressLine chords={chords} activeIndex={rhStation.state.activeIndex} />
      </section>

      {/* Step 1.2 LH */}
      <section style={{ marginTop: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
          Smooth chords · Part 3 — Left hand
        </p>
        <p style={{ marginTop: 6, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
          Now anchor the emotion with your left hand. One note per chord. Stay grounded.
        </p>

        <TempoControls
          activeTempo={lhTempo}
          isPlaying={lhStation.state.isPlaying}
          isPaused={lhStation.state.isPaused}
          onStart={startLH}
          onPause={lhStation.pause}
          onResume={resumeLH}
          onStop={lhStation.stop}
        />

        <KeyboardEmotions
          activeChordSymbol={lhStation.state.activeIndex != null ? chords[lhStation.state.activeIndex] : null}
          emotion={emotionPalette}
          emotionLabel={emotionLabel}
          highlightNotesPrimary={lhStation.state.primaryNotes}
          highlightNotesSecondary={[]}
        />
        <ChordProgressLine chords={chords} activeIndex={lhStation.state.activeIndex} />
      </section>

      {/* Step 1.3 BOTH */}
      <section style={{ marginTop: 22 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
          Smooth chords · Part 4 — Together
        </p>
        <p style={{ marginTop: 6, fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
          Bring both hands together. Same chords. Same emotion.
        </p>

        <TempoControls
          activeTempo={bothTempo}
          isPlaying={bothStation.state.isPlaying}
          isPaused={bothStation.state.isPaused}
          onStart={startBoth}
          onPause={bothStation.pause}
          onResume={resumeBoth}
          onStop={bothStation.stop}
        />

        <KeyboardEmotions
          activeChordSymbol={bothStation.state.activeIndex != null ? chords[bothStation.state.activeIndex] : null}

          emotion={emotionPalette}
          emotionLabel={emotionLabel}
          highlightNotesPrimary={bothStation.state.primaryNotes}
          highlightNotesSecondary={bothStation.state.secondaryNotes}
          highlightColorSecondary={"rgba(17,24,39,0.22)"}
        />
        {/* IMPORTANT FIX: was rhStation before; must be bothStation */}
        <ChordProgressLine chords={chords} activeIndex={bothStation.state.activeIndex} />
      </section>
    </div>
  );
}