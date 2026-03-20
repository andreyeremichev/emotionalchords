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

/* =========================
   Types
========================= */

type Drill = "one" | "two" | "full";
type PathId = PracticePathId;
type PatternId = PracticeEmotionId;

type LHAction = "none" | "single" | "octave" | "upper";
type RHAction = "none" | "chord";

type PatternEventDef = {
  pos: number; // 0=beat1, 0.5=1&, 1=beat2, 1.5=2&, ...
  tokenIndex: number;
  lh: LHAction;
  rh: RHAction;
};

type Event = {
  delayMs: number;
  chordIndex: number;
  tokenIndex: number;
  lh: LHAction;
  rh: RHAction;
  pos: number;
};

type PatternConfig = {
  label: string;
  tokens: string[];
  explainer: string;
  baseBeatMs: number;
  restBetweenChords: number;
  events: PatternEventDef[];
  rhDurBeats: number;
  lhDurBeats: number;
  keepRhVisibleOnLhOnly?: boolean;
};

/* =========================
   UI data
========================= */

const DRILLS: { id: Drill; label: string; subtitle: string }[] = [
  { id: "one", label: "One chord rhythm", subtitle: "Lock the motion first." },
  { id: "two", label: "Two chords rhythm", subtitle: "Keep the motion while switching." },
  { id: "full", label: "Full progression", subtitle: "Now it becomes music." },
];

const PATTERNS: Record<PatternId, PatternConfig> = {
  calm: {
    label: "Settled circulation",
    tokens: ["1 T", "1& hold", "2 R", "2& L", "3 R", "4 R", "4& L"],
    explainer: "Together → hold → right → left → right → right → left",
    baseBeatMs: 900,
    restBetweenChords: 200,
        events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 0.5, tokenIndex: 1, lh: "none", rh: "none" },
      { pos: 1, tokenIndex: 2, lh: "none", rh: "chord" },
      { pos: 1.5, tokenIndex: 3, lh: "single", rh: "none" },
      { pos: 2, tokenIndex: 4, lh: "none", rh: "chord" },
      { pos: 3, tokenIndex: 5, lh: "none", rh: "chord" },
      { pos: 3.5, tokenIndex: 6, lh: "single", rh: "none" },
    ],
    rhDurBeats: 0.9,
    lhDurBeats: 0.16,
  },

  playful: {
    label: "Light return",
    tokens: ["1 T", "2 R", "2& L", "3 R", "3& L", "4 T"],
    explainer: "Together → right → left → right → left → together",
    baseBeatMs: 800,
    restBetweenChords: 180,
    events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "none", rh: "chord" },
      { pos: 1.5, tokenIndex: 2, lh: "single", rh: "none" },
      { pos: 2, tokenIndex: 3, lh: "none", rh: "chord" },
      { pos: 2.5, tokenIndex: 4, lh: "single", rh: "none" },
      { pos: 3, tokenIndex: 5, lh: "single", rh: "chord" },
    ],
    rhDurBeats: 0.5,
    lhDurBeats: 0.14,
  },

  magic: {
    label: "Guided departure",
    tokens: ["1 T", "2 R", "3 –", "4 R"],
    explainer: "Together → right → silence → right",
    baseBeatMs: 700,
    restBetweenChords: 180,
        events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "none", rh: "chord" },
      { pos: 2, tokenIndex: 2, lh: "none", rh: "none" },
      { pos: 3, tokenIndex: 3, lh: "none", rh: "chord" },
    ],
    rhDurBeats: 1.1,
    lhDurBeats: 0.18,
  },

  sadness: {
    label: "Unresolved descent",
    tokens: ["1 T", "2 R", "3 R", "4 –"],
    explainer: "Together → right → right → silence",
    baseBeatMs: 800,
    restBetweenChords: 150,
        events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "none", rh: "chord" },
      { pos: 2, tokenIndex: 2, lh: "none", rh: "chord" },
      { pos: 3, tokenIndex: 3, lh: "none", rh: "none" },
    ],
    rhDurBeats: 0.9,
    lhDurBeats: 0.18,
  },

  mystery: {
    label: "Obscured orientation",
    tokens: ["1 T", "2& R", "3 R", "4& L"],
    explainer: "Together → right → right → left",
    baseBeatMs: 700,
    restBetweenChords: 150,
    events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1.5, tokenIndex: 1, lh: "none", rh: "chord" },
      { pos: 2, tokenIndex: 2, lh: "none", rh: "chord" },
      { pos: 3.5, tokenIndex: 3, lh: "single", rh: "none" },
    ],
    rhDurBeats: 0.9,
    lhDurBeats: 0.16,
  },

  melancholy: {
    label: "Altered return",
    tokens: ["1 T", "2 R", "3 –", "4 R"],
    explainer: "Together → right → silence → right",
    baseBeatMs: 700,
    restBetweenChords: 160,
        events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "none", rh: "chord" },
      { pos: 2, tokenIndex: 2, lh: "none", rh: "none" },
      { pos: 3, tokenIndex: 3, lh: "none", rh: "chord" },
    ],
    rhDurBeats: 0.9,
    lhDurBeats: 0.18,
  },

  wonder: {
    label: "Upward opening",
    tokens: ["1 T", "2 –", "3 R", "4 R"],
    explainer: "Together → silence → right → right",
    baseBeatMs: 700,
    restBetweenChords: 160,
        events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "none", rh: "none" },
      { pos: 2, tokenIndex: 2, lh: "none", rh: "chord" },
      { pos: 3, tokenIndex: 3, lh: "none", rh: "chord" },
    ],
    rhDurBeats: 0.9,
    lhDurBeats: 0.18,
  },

  tension: {
    label: "Held pressure",
    tokens: ["1 T", "1& hold", "2 R", "2& L", "3 T", "4 R", "4& L"],
    explainer: "Together → hold → right → left → together → right → left",
    baseBeatMs: 900,
    restBetweenChords: 180,
    events: [
      { pos: 0, tokenIndex: 0, lh: "single", rh: "chord" },
      { pos: 1, tokenIndex: 2, lh: "none", rh: "chord" },
      { pos: 1.5, tokenIndex: 3, lh: "single", rh: "none" },
      { pos: 2, tokenIndex: 4, lh: "single", rh: "chord" },
      { pos: 3, tokenIndex: 5, lh: "none", rh: "chord" },
      { pos: 3.5, tokenIndex: 6, lh: "single", rh: "none" },
    ],
    rhDurBeats: 0.85,
    lhDurBeats: 0.16,
  },

  anger: {
    label: "Grinding advance",
    tokens: ["1 T", "2 L octave", "3 L octave", "4 L octave"],
    explainer: "Together, then left-hand octave pulses while right hand keeps holding",
    baseBeatMs: 714,
    restBetweenChords: 160,
    events: [
      { pos: 0, tokenIndex: 0, lh: "octave", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "octave", rh: "none" },
      { pos: 2, tokenIndex: 2, lh: "octave", rh: "none" },
      { pos: 3, tokenIndex: 3, lh: "octave", rh: "none" },
    ],
    rhDurBeats: 4.1,
    lhDurBeats: 0.14,
    keepRhVisibleOnLhOnly: true,
  },

  fear: {
    label: "Loss of ground",
    tokens: ["1 T", "2 LH upper", "3 – (nothing)", "4 LH upper"],
    explainer: "Together, then late upper-note support only",
    baseBeatMs: 900,
    restBetweenChords: 200,
        events: [
      { pos: 0, tokenIndex: 0, lh: "octave", rh: "chord" },
      { pos: 1, tokenIndex: 1, lh: "upper", rh: "none" },
      { pos: 2, tokenIndex: 2, lh: "none", rh: "none" },
      { pos: 3, tokenIndex: 3, lh: "upper", rh: "none" },
    ],
    rhDurBeats: 4.1,
    lhDurBeats: 0.12,
    keepRhVisibleOnLhOnly: true,
  },
};

/* =========================
   Helpers
========================= */

function noteUpOctave(note: string): string {
  const m = /^(.*?)(\d)$/.exec(note);
  if (!m) return note;
  const name = m[1];
  const oct = parseInt(m[2], 10);
  return `${name}${oct + 1}`;
}

function rootToOctave(root: string): [string, string] {
  return [root, noteUpOctave(root)];
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

function PatternHelper(props: {
  pattern: PatternId;
  activeTokenIndex: number | null;
  slowMode: boolean;
}) {
  const { pattern, activeTokenIndex, slowMode } = props;
  const p = PATTERNS[pattern];

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, color: "#374151", fontWeight: 700 }}>
        Pattern: <span style={{ fontWeight: 800 }}>{p.label}</span>{" "}
        <span style={{ fontWeight: 600, opacity: 0.7 }}>
          ({slowMode ? "Slow mode" : "Normal"})
        </span>
      </div>

      <div
        style={{
          marginTop: 6,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {p.tokens.map((t, i) => {
          const isOn = activeTokenIndex === i;
          const isSilent = t.includes("–");
          return (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: 999,
                background: isOn ? "#111" : isSilent ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.06)",
                color: isOn ? "#fff" : isSilent ? "#6B7280" : "#111",
                border: isSilent ? "1px dashed rgba(0,0,0,0.15)" : "none",
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

/* =========================
   Component
========================= */

export default function Step2RhythmPractice(props: {
  emotionLabel: string;
  emotionPalette: EmotionPalette;
  chords: string[];
  pattern: PatternId;
  path: PathId;
  normalMul?: number;
  slowMul?: number;

  autoPlay?: boolean;
  playToken?: number | null;
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
    path,
    normalMul = 1.0,
    slowMul = 1.18,

    autoPlay = false,
    playToken,
    hideControls = false,
    defaultDrill = "one",
    defaultSlowMode = false,
    onFinished,
  } = props;

  const samplerRef = useRef<Tone.Sampler | null>(null);
  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  const locked = getLockedPracticeVoicing(pattern, path);

  const rhVoicings = useMemo(() => {
    return locked.rh.map(buildAscendingRhVoicing);
  }, [locked.rh]);

  const lhRoots = useMemo(() => {
    return locked.lh.map(lhRootToNote);
  }, [locked.lh]);

  const [drill, setDrill] = useState<Drill>(defaultDrill);
  const [slowMode, setSlowMode] = useState<boolean>(defaultSlowMode);

  const [activeChord, setActiveChord] = useState<number | null>(null);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);

  const [primaryNotes, setPrimaryNotes] = useState<string[]>([]);
  const [secondaryNotes, setSecondaryNotes] = useState<string[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<number | null>(null);
  const rhHighlightTimerRef = useRef<number | null>(null);
  const lhHighlightTimerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const eventsRef = useRef<Event[]>([]);
  const eventIndexRef = useRef(0);

  const currentPrimaryRef = useRef<string[]>([]);
  const currentSecondaryRef = useRef<string[]>([]);

  

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearHighlightTimers = () => {
    if (rhHighlightTimerRef.current != null) {
      window.clearTimeout(rhHighlightTimerRef.current);
      rhHighlightTimerRef.current = null;
    }
    if (lhHighlightTimerRef.current != null) {
      window.clearTimeout(lhHighlightTimerRef.current);
      lhHighlightTimerRef.current = null;
    }
  };

  const clearRhHighlightTimer = () => {
    if (rhHighlightTimerRef.current != null) {
      window.clearTimeout(rhHighlightTimerRef.current);
      rhHighlightTimerRef.current = null;
    }
  };

  const clearLhHighlightTimer = () => {
    if (lhHighlightTimerRef.current != null) {
      window.clearTimeout(lhHighlightTimerRef.current);
      lhHighlightTimerRef.current = null;
    }
  };


  const stop = useCallback(() => {
    clearTimer();
    clearHighlightTimers();
    runIdRef.current += 1;

    setIsPlaying(false);
    setIsPaused(false);
    setActiveChord(null);
    setActiveTokenIndex(null);
    setPrimaryNotes([]);
    setSecondaryNotes([]);

    currentPrimaryRef.current = [];
    currentSecondaryRef.current = [];

    eventsRef.current = [];
    eventIndexRef.current = 0;
  }, []);

  function getLhVisualMode(pattern: PatternId) {
    switch (pattern) {
      case "playful":
      case "anger":
      case "fear":
        return "pulse";

      case "sadness":
        return "untilReleaseToken";

      case "magic":
      case "melancholy":
      case "wonder":
        return "barHold";

      case "calm":
      case "mystery":
      case "tension":
        return "continuousRefresh";

      default:
        return "pulse";
    }
  }



  function getRhHoldMs(args: {
    pattern: PatternId;
    ev: Event;
    beatMs: number;
    defaultMs: number;
    keepRhVisibleOnLhOnly?: boolean;
  }) {
    const { pattern, ev, beatMs, defaultMs, keepRhVisibleOnLhOnly } = args;

    // For Anger and Fear, RH visually stays held across the bar
    if (keepRhVisibleOnLhOnly && ev.rh === "chord") {
      return Math.max(120, Math.round((4 - ev.pos) * beatMs) - 40);
    }

    // Everything else: pulse visually
    return defaultMs;
  }

  const buildEvents = useCallback((): Event[] => {
    const p = PATTERNS[pattern];
    const mul = slowMode ? slowMul : normalMul;

    const beatMs = Math.round(p.baseBeatMs * mul);
    const restBetweenChords = Math.round(p.restBetweenChords * mul);

    const chordPlan: number[] =
      drill === "one" ? [0] : drill === "two" ? [0, 1] : [0, 1, 2, 3];

    const out: Event[] = [];
    let t = 0;

    for (const chordIndex of chordPlan) {
      const barStart = t;

      for (const ev of p.events) {
                out.push({
          delayMs: barStart + Math.round(ev.pos * beatMs),
          chordIndex,
          tokenIndex: ev.tokenIndex,
          lh: ev.lh,
          rh: ev.rh,
          pos: ev.pos,
        });
      }

      t = barStart + beatMs * 4 + restBetweenChords;
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
        scheduleNext(250, () => {
          stop();
          onFinished?.();
        });
        return;
      }

      const cfg = PATTERNS[pattern];
      const beatMs = Math.round(cfg.baseBeatMs * (slowMode ? slowMul : normalMul));
      const lhDurSec = (cfg.lhDurBeats * beatMs) / 1000;
      const rhDurSec = (cfg.rhDurBeats * beatMs) / 1000;

      const chordIdx = ev.chordIndex;
      const lhRoot = lhRoots[chordIdx];
      const rh = rhVoicings[chordIdx];

      const lhOctave = rootToOctave(lhRoot);
      const lhUpperOnly = [lhOctave[1]];

      const lhDefaultMs = Math.max(60, Math.round(lhDurSec * 1000));
      const rhDefaultMs = Math.max(80, Math.round(rhDurSec * 1000));

      // Start from currently-held visuals
      let secondary = currentSecondaryRef.current;
      let primary = currentPrimaryRef.current;
      let deferSecondaryVisualSet = false;
      // ---------- LH visual logic ----------
      const lhMode = getLhVisualMode(pattern);

      if (lhMode === "pulse") {
        if (ev.lh !== "none") {
          clearLhHighlightTimer();

          if (ev.lh === "single") secondary = [lhRoot];
          if (ev.lh === "octave") secondary = lhOctave;
          if (ev.lh === "upper") secondary = lhUpperOnly;

          lhHighlightTimerRef.current = window.setTimeout(() => {
            currentSecondaryRef.current = [];
            setSecondaryNotes([]);
            lhHighlightTimerRef.current = null;
          }, lhDefaultMs);
        } else if (ev.rh === "none") {
          secondary = [];
          clearLhHighlightTimer();
        }
      }

      if (lhMode === "barHold") {
        if (ev.lh !== "none") {
          if (ev.lh === "single") secondary = [lhRoot];
          if (ev.lh === "octave") secondary = lhOctave;
          if (ev.lh === "upper") secondary = lhUpperOnly;
        }
        // otherwise: keep currently held LH visible for the whole bar
      }

            if (lhMode === "continuousRefresh") {
        if (ev.lh !== "none") {
          if (ev.lh === "single") secondary = [lhRoot];
          if (ev.lh === "octave") secondary = lhOctave;
          if (ev.lh === "upper") secondary = lhUpperOnly;

          // Keep sustain state, but visually re-pulse the LH
          deferSecondaryVisualSet = true;
          const nextSecondary = [...secondary];

          setSecondaryNotes([]);

          window.setTimeout(() => {
            currentSecondaryRef.current = nextSecondary;
            setSecondaryNotes(nextSecondary);
          }, 70);
        }
        // RH-only and hold tokens do not clear LH; they keep the support alive
      }

      if (lhMode === "untilReleaseToken") {
        if (ev.lh !== "none") {
          if (ev.lh === "single") secondary = [lhRoot];
          if (ev.lh === "octave") secondary = lhOctave;
          if (ev.lh === "upper") secondary = lhUpperOnly;
        } else if (ev.lh === "none" && ev.rh === "none") {
          // explicit release token, e.g. sadness beat 4
          secondary = [];
          clearLhHighlightTimer();
        }
      }

      // ---------- RH visual logic ----------
      if (ev.rh === "chord") {
        clearRhHighlightTimer();

        primary = rh;

        const holdMs = getRhHoldMs({
          pattern,
          ev,
          beatMs,
          defaultMs: rhDefaultMs,
          keepRhVisibleOnLhOnly: cfg.keepRhVisibleOnLhOnly,
        });

        rhHighlightTimerRef.current = window.setTimeout(() => {
          currentPrimaryRef.current = [];
          setPrimaryNotes([]);
          rhHighlightTimerRef.current = null;
        }, holdMs);
      } else if (!cfg.keepRhVisibleOnLhOnly && ev.lh !== "none") {
        // For non-held RH patterns, LH-only events should not keep old RH visual notes
        primary = [];
        clearRhHighlightTimer();
      }

      // ---------- True silence ----------
      if (ev.lh === "none" && ev.rh === "none") {
        primary = [];

        // Only pulse-style LH should clear on generic silence.
        // Sadness uses an explicit release token above.
        const lhMode = getLhVisualMode(pattern);
        if (lhMode === "pulse") {
          secondary = [];
          clearLhHighlightTimer();
        }

        clearRhHighlightTimer();
      }

      currentPrimaryRef.current = primary;
      currentSecondaryRef.current = secondary;

      setActiveChord(chordIdx);
      setActiveTokenIndex(ev.tokenIndex);

      if (!deferSecondaryVisualSet) {
        setSecondaryNotes(secondary);
      }

      setPrimaryNotes(primary);



      const sampler = samplerRef.current;

      if (sampler) {
        try {
          if (ev.lh === "single") {
            (sampler as any).triggerAttackRelease(lhRoot, lhDurSec, undefined, 0.8);
          } else if (ev.lh === "octave") {
            (sampler as any).triggerAttackRelease(lhOctave, lhDurSec, undefined, 0.84);
          } else if (ev.lh === "upper") {
            (sampler as any).triggerAttackRelease(lhUpperOnly, lhDurSec, undefined, 0.68);
          }

          if (ev.rh === "chord") {
            const velocity =
              pattern === "anger" ? 0.9 : pattern === "fear" ? 0.78 : 0.86;
            (sampler as any).triggerAttackRelease(rh, rhDurSec, undefined, velocity);
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
    [lhRoots, normalMul, onFinished, pattern, rhVoicings, scheduleNext, slowMode, slowMul, stop]
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

    useEffect(() => {
    if (!autoPlay) return;
    play();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, pattern, path, chords.join("|")]);

    useEffect(() => {
    if (playToken == null) return;
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playToken]);

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
            Same locked notes. Now we add motion.
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
        <NotesProgressLine
          rhBars={locked.rh}
          lhBars={locked.lh}
          activeIndex={activeChord}
        />
      )}
    </div>
  );
}