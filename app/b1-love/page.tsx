// app/b1-love/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

import KeyboardEmotions, { type EmotionPalette } from "@/components/KeyboardEmotions";

type ModeId =
  | "canonical"
  | "variation_a"
  | "variation_b"
  | "break"
  | "to_sadness"
  | "to_melancholy";

type StepSpec = {
  key: string;
  label: string;
  lhNotes: string[];
  lhDisplay: string;
  rhSummary?: string;
  beatCount: 6 | 12;
  rhHits: Array<{
    beatIndex: number;
    notes: string[];
  }>;
};

type ModeSpec = {
  id: ModeId;
  label: string;
  steps: StepSpec[];
  helperTitle: string;
};

type ScheduledEvent = {
  atMs: number;
  stepIndex: number;
  beatIndex: number;
  beatCount: 6 | 12;
};

const LOVE_PALETTE: EmotionPalette = {
  gradientTop: "#fff3cf",
  gradientBottom: "#ffe3a6",
  trailColor: "rgba(236, 179, 54, 0.72)",
};

const MODE_LABELS: Record<ModeId, string> = {
  canonical: "Canonical",
  variation_a: "Variation A",
  variation_b: "Variation B",
  break: "Break",
  to_sadness: "To Sadness",
  to_melancholy: "To Melancholy",
};

const LOVE_BEAT_MS = 480;
const LOVE_REST_BETWEEN_STEPS = 20;

const LOVE_LH_DUR_BEATS = 0.92;
const LOVE_RH_DUR_BEATS_CANONICAL = 2.6;
const LOVE_RH_DUR_BEATS_VARIATION_A = 1.8;
const LOVE_RH_DUR_BEATS_VARIATION_B = 2.0;
const LOVE_RH_DUR_BEATS_BREAK = 0.8;
const LOVE_RH_DUR_BEATS_TRANSITION = 4.8;

const LOVE_BASE_STEPS: Array<{
  label: string;
  lhNotes: string[];
  lhDisplay: string;
}> = [
  { label: "ACE ×2", lhNotes: ["A2", "C3", "E3"], lhDisplay: "A C E" },
  { label: "ACF ×2", lhNotes: ["A2", "C3", "F3"], lhDisplay: "A C F" },
  { label: "CEG ×2", lhNotes: ["C3", "E3", "G3"], lhDisplay: "C E G" },
  { label: "CEA ×2", lhNotes: ["C3", "E3", "A3"], lhDisplay: "C E A" },
  { label: "DFA ×2", lhNotes: ["D3", "F3", "A3"], lhDisplay: "D F A" },
  { label: "CEG ×2", lhNotes: ["C3", "E3", "G3"], lhDisplay: "C E G" },
  { label: "CEA ×2", lhNotes: ["C3", "E3", "A3"], lhDisplay: "C E A" },
  { label: "CEG ×2", lhNotes: ["C3", "E3", "G3"], lhDisplay: "C E G" },
  { label: "ACE ×2", lhNotes: ["A2", "C3", "E3"], lhDisplay: "A C E" },
];

const LOVE_VARIATION_B_BASE_STEPS: Array<{
  label: string;
  lhNotes: string[];
  lhDisplay: string;
}> = [
  { label: "ACE ×2", lhNotes: ["A2", "C3", "E3"], lhDisplay: "A C E" },
  { label: "ACF ×2", lhNotes: ["A2", "C3", "F3"], lhDisplay: "A C F" },
  { label: "CEG ×2", lhNotes: ["C3", "E3", "G3"], lhDisplay: "C E G" },
  { label: "CEA ×2", lhNotes: ["C3", "E3", "A3"], lhDisplay: "C E A" },
  { label: "DFA ×2", lhNotes: ["D3", "F3", "A3"], lhDisplay: "D F A" },
  { label: "EGC ×2", lhNotes: ["E3", "G3", "C4"], lhDisplay: "E G C" },
  { label: "EAC ×2", lhNotes: ["E3", "A3", "C4"], lhDisplay: "E A C" },
  { label: "CEG ×2", lhNotes: ["C3", "E3", "G3"], lhDisplay: "C E G" },
  { label: "ACE ×2", lhNotes: ["A2", "C3", "E3"], lhDisplay: "A C E" },
];

function repeatRhHits(notesByGroup: string[][]): Array<{ beatIndex: number; notes: string[] }> {
  const starts = [0, 3, 6, 9];
  return starts
    .map((beatIndex, i) => ({
      beatIndex,
      notes: notesByGroup[i] ?? [],
    }))
    .filter((hit) => hit.notes.length > 0);
}

const LOVE_CANONICAL_STEPS: StepSpec[] = LOVE_BASE_STEPS.map((step, i) => {
  const groups: string[][][] = [
    [["E4"], ["E4"], ["A4"], []],
    [["F4"], ["F4"], ["C5"], []],
    [["E4"], ["E4"], ["G4"], []],
    [["E4"], ["A4"], ["E4"], []],
    [["D4"], ["D4"], ["F4"], []],
    [["G4"], ["G4"], ["E4"], []],
    [["E4"], ["E4"], ["A4"], []],
    [["E4"], ["G4"], ["E4"], []],
    [["E4"], [], [], []],
  ];

  const summaries = [
    "E · E · A · —",
    "F · F · C · —",
    "E · E · G · —",
    "E · A · E · —",
    "D · D · F · —",
    "G · G · E · —",
    "E · E · A · —",
    "E · G · E · —",
    "E",
  ];

  return {
    key: `canonical-${i}`,
    label: step.label,
    lhNotes: step.lhNotes,
    lhDisplay: step.lhDisplay,
    rhSummary: summaries[i],
    beatCount: 12,
    rhHits: repeatRhHits(groups[i]),
  };
});

const LOVE_VARIATION_A_STEPS: StepSpec[] = LOVE_BASE_STEPS.map((step, i) => {
  const octavePairs: string[][][] = [
    [["C4", "C5"], [], ["C4", "C5"], []],
    [["C4", "C5"], [], ["C4", "C5"], []],
    [["C4", "C5"], [], ["C4", "C5"], []],
    [["D4", "D5"], [], ["D4", "D5"], []],
    [["E4", "E5"], [], ["E4", "E5"], []],
    [["E4", "E5"], [], ["E4", "E5"], []],
    [["G4", "G5"], [], ["G4", "G5"], []],
    [["E4", "E5"], [], ["E4", "E5"], []],
    [["E4", "E5"], [], [], []],
  ];

  const summaries = [
    "oct C · — · oct C · —",
    "oct C · — · oct C · —",
    "oct C · — · oct C · —",
    "oct D · — · oct D · —",
    "oct E · — · oct E · —",
    "oct E · — · oct E · —",
    "oct G · — · oct G · —",
    "oct E · — · oct E · —",
    "oct E",
  ];

  return {
    key: `variation-a-${i}`,
    label: step.label,
    lhNotes: step.lhNotes,
    lhDisplay: step.lhDisplay,
    rhSummary: summaries[i],
    beatCount: 12,
    rhHits: repeatRhHits(octavePairs[i]),
  };
});

const LOVE_VARIATION_B_STEPS: StepSpec[] = LOVE_VARIATION_B_BASE_STEPS.map((step, i) => {
  const groups: string[][][] = [
    [["E4"], ["A4"], ["C5"], []],
    [["F4"], ["A4"], ["C5"], []],
    [["E4"], ["G4"], ["C5"], []],
    [["E4"], ["A4"], ["C5"], []],
    [["D4"], ["A4"], ["D5"], []],
    [["G4"], ["C5"], ["E5"], []],
    [["A4"], ["C5"], ["E5"], []],
    [["E4"], ["G4"], ["C5"], []],
    [["E4"], [], [], []],
  ];

  const summaries = [
    "E · A · C5 · —",
    "F · A · C5 · —",
    "E · G · C5 · —",
    "E · A · C5 · —",
    "D · A · D5 · —",
    "G · C5 · E5 · —",
    "A · C5 · E5 · —",
    "E · G · C5 · —",
    "E",
  ];

  return {
    key: `variation-b-${i}`,
    label: step.label,
    lhNotes: step.lhNotes,
    lhDisplay: step.lhDisplay,
    rhSummary: summaries[i],
    beatCount: 12,
    rhHits: repeatRhHits(groups[i]),
  };
});

const LOVE_BREAK_STEPS: StepSpec[] = LOVE_BASE_STEPS.map((step, i) => {
  const breakAnchorByStep: string[][] = [
    ["E4", "E5"],
    ["F4", "F5"],
    ["G4", "G5"],
    ["A4", "A5"],
    ["F4", "F5"],
    ["G4", "G5"],
    ["A4", "A5"],
    ["E4", "E5"],
    ["E4", "E5"],
  ];

  return {
    key: `break-${i}`,
    label: step.label,
    lhNotes: step.lhNotes,
    lhDisplay: step.lhDisplay,
    
    beatCount: 12,
    rhHits: repeatRhHits([
      breakAnchorByStep[i],
      breakAnchorByStep[i],
      breakAnchorByStep[i],
      breakAnchorByStep[i],
    ]),
  };
});

const LOVE_TO_SADNESS_STEPS: StepSpec[] = LOVE_BASE_STEPS.map((step, i) => {
  const notes = [["E4"], ["F4"], ["E4"], ["C4"], ["F4"], ["E4"], ["C4"], ["E4"], ["E4"]];
  return {
    key: `to-sadness-${i}`,
    label: step.label.replace("×2", ""),
    lhNotes: step.lhNotes,
    lhDisplay: step.lhDisplay,
    rhSummary: pretty(stripOct(notes[i][0])),
    beatCount: 6,
    rhHits: [{ beatIndex: 0, notes: notes[i] }],
  };
});

const LOVE_TO_MELANCHOLY_STEPS: StepSpec[] = LOVE_BASE_STEPS.map((step, i) => {
  const notes = [["E4"], ["C4"], ["G4"], ["A4"], ["F4"], ["G4"], ["E4"], ["E4"], ["E4"]];
  return {
    key: `to-melancholy-${i}`,
    label: step.label.replace("×2", ""),
    lhNotes: step.lhNotes,
    lhDisplay: step.lhDisplay,
    rhSummary: pretty(stripOct(notes[i][0])),
    beatCount: 6,
    rhHits: [
      { beatIndex: 0, notes: notes[i] }, // beat 1
      { beatIndex: 5, notes: notes[i] }, // beat 6 (return)
    ],
  };
});

const LOVE_MODES: Record<ModeId, ModeSpec> = {
  canonical: {
    id: "canonical",
    label: "Canonical",
    helperTitle: "Canonical",
    steps: LOVE_CANONICAL_STEPS,
  },
  variation_a: {
    id: "variation_a",
    label: "Variation A",
    helperTitle: "Variation A",
    steps: LOVE_VARIATION_A_STEPS,
  },
  variation_b: {
    id: "variation_b",
    label: "Variation B",
    helperTitle: "Variation B",
    steps: LOVE_VARIATION_B_STEPS,
  },
  break: {
    id: "break",
    label: "Break",
    helperTitle: "Break",
    steps: [...LOVE_CANONICAL_STEPS, ...LOVE_BREAK_STEPS],
  },
  to_sadness: {
    id: "to_sadness",
    label: "To Sadness",
    helperTitle: "To Sadness",
    steps: [...LOVE_CANONICAL_STEPS, ...LOVE_TO_SADNESS_STEPS],
  },
  to_melancholy: {
    id: "to_melancholy",
    label: "To Melancholy",
    helperTitle: "To Melancholy",
    steps: [...LOVE_CANONICAL_STEPS, ...LOVE_TO_MELANCHOLY_STEPS],
  },
};

function pretty(note: string) {
  return note.replace(/#/g, "♯").replace(/b/g, "♭");
}

function normalizeNote(note: string) {
  return note.replace(/♯/g, "#").replace(/♭/g, "b");
}

function stripOct(note: string) {
  return normalizeNote(note).replace(/\d+$/, "");
}

function simplifyRhSummary(step: StepSpec): string {
  // collect all RH notes used in this step
  const allNotes = step.rhHits.flatMap((h) => h.notes);

  if (!allNotes.length) return "—";

  // reduce to pitch class (remove octave)
  const unique = Array.from(
    new Set(allNotes.map((n) => pretty(stripOct(n))))
  );

  // special case: octave hits (same note repeated)
  if (unique.length === 1) {
    return `${unique[0]}`;
  }

  return unique.join(" ");
}

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

const PITCHES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

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

function buildEvents(steps: StepSpec[]): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  let cursor = 0;

  steps.forEach((step, stepIndex) => {
    for (let beatIndex = 0; beatIndex < step.beatCount; beatIndex++) {
      events.push({
        atMs: cursor + beatIndex * LOVE_BEAT_MS,
        stepIndex,
        beatIndex,
        beatCount: step.beatCount,
      });
    }
    cursor += step.beatCount * LOVE_BEAT_MS + LOVE_REST_BETWEEN_STEPS;
  });

  return events;
}

function getLhNotesForBeat(step: StepSpec, beatIndex: number) {
  const triad = step.lhNotes;
  if (step.beatCount === 12) {
    const cycle = [triad[0], triad[1], triad[2], triad[0], triad[1], triad[2], triad[0], triad[1], triad[2], triad[0], triad[1], triad[2]];
    return [cycle[beatIndex]];
  }
  const cycle = [triad[0], triad[1], triad[2], triad[0], triad[1], triad[2]];
  return [cycle[beatIndex]];
}

function getRhHit(step: StepSpec, beatIndex: number) {
  return step.rhHits.find((hit) => hit.beatIndex === beatIndex)?.notes ?? [];
}

function NotesProgressLine(props: {
  steps: StepSpec[];
  activeIndex: number | null;
}) {
  const { steps, activeIndex } = props;

  const renderStep = (content: React.ReactNode, i: number) => {
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
        {steps.map((step, i) =>
  renderStep(simplifyRhSummary(step), i)
)}
      </div>
      <div>
        <span style={{ fontWeight: 800, marginRight: 6 }}>LH:</span>
        {steps.map((step, i) => renderStep(step.lhDisplay, i))}
      </div>
    </div>
  );
}

function LoveRhythmTable(props: {
  step: StepSpec | null;
  activeBeatIndex: number | null;
}) {
  const { step, activeBeatIndex } = props;

  if (!step) return null;

  const beatLabels =
    step.beatCount === 12
      ? ["1", "2", "3", "4", "5", "6", "1", "2", "3", "4", "5", "6"]
      : ["1", "2", "3", "4", "5", "6"];

  const lhRow = Array.from({ length: step.beatCount }, (_, i) => {
    const pos = i % 3;
    return pos === 0 ? "Bottom" : pos === 1 ? "Middle" : "Top";
  });

  const rhRow = Array.from({ length: step.beatCount }, (_, i) => {
    const hit = getRhHit(step, i);
    return hit.length ? hit.map((n) => pretty(stripOct(n))).join(" / ") : "—";
  });

  return (
    <div className="mt-4 overflow-x-auto rounded-xl bg-[#faf7f3] p-3 ring-1 ring-black/5">
      <div className={step.beatCount === 12 ? "min-w-[920px]" : "min-w-[620px]"}>
        <div className={`grid gap-2 text-xs`} style={{ gridTemplateColumns: `90px repeat(${step.beatCount}, minmax(0, 1fr))` }}>
          <div className="font-semibold text-neutral-500">Beat</div>
          {beatLabels.map((beat, i) => (
            <div
              key={`beat-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center font-semibold",
                activeBeatIndex === i ? "bg-black text-white" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {beat}
            </div>
          ))}
        </div>

        <div className={`mt-2 grid gap-2 text-xs`} style={{ gridTemplateColumns: `90px repeat(${step.beatCount}, minmax(0, 1fr))` }}>
          <div className="font-semibold text-neutral-500">RH</div>
          {rhRow.map((token, i) => (
            <div
              key={`rh-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center",
                activeBeatIndex === i ? "bg-black/10 text-neutral-900 font-semibold" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {token}
            </div>
          ))}
        </div>

        <div className={`mt-2 grid gap-2 text-xs`} style={{ gridTemplateColumns: `90px repeat(${step.beatCount}, minmax(0, 1fr))` }}>
          <div className="font-semibold text-neutral-500">LH</div>
          {lhRow.map((token, i) => (
            <div
              key={`lh-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center",
                activeBeatIndex === i ? "bg-black/10 text-neutral-900 font-semibold" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {token}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoveCompanionPage() {
  const [selectedMode, setSelectedMode] = useState<ModeId>("canonical");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);

  const [primaryNotes, setPrimaryNotes] = useState<string[]>([]);
  const [secondaryNotes, setSecondaryNotes] = useState<string[]>([]);

  const samplerRef = useRef<Tone.Sampler | null>(null);
  const timerRef = useRef<number | null>(null);
  const rhTimerRef = useRef<number | null>(null);
  const lhTimerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  const eventsRef = useRef<ScheduledEvent[]>([]);
  const nextEventIndexRef = useRef(0);
  const waitStartedAtRef = useRef<number | null>(null);
  const waitMsRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    ensureSampler(samplerRef).catch(() => {});
  }, []);

  const mode = LOVE_MODES[selectedMode];
  const currentStep = currentStepIndex != null ? mode.steps[currentStepIndex] ?? null : null;
  const nextStep = currentStepIndex != null ? mode.steps[currentStepIndex + 1] ?? null : null;

  const clearMainTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearRhTimer = () => {
    if (rhTimerRef.current != null) {
      window.clearTimeout(rhTimerRef.current);
      rhTimerRef.current = null;
    }
  };

  const clearLhTimer = () => {
    if (lhTimerRef.current != null) {
      window.clearTimeout(lhTimerRef.current);
      lhTimerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    runIdRef.current += 1;
    clearMainTimer();
    clearRhTimer();
    clearLhTimer();

    eventsRef.current = [];
    nextEventIndexRef.current = 0;
    waitStartedAtRef.current = null;
    waitMsRef.current = 0;
    isPausedRef.current = false;

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStepIndex(null);
    setActiveBeatIndex(null);
    setPrimaryNotes([]);
    setSecondaryNotes([]);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const schedule = useCallback((ms: number, fn: () => void) => {
    clearMainTimer();
    waitStartedAtRef.current = performance.now();
    waitMsRef.current = ms;
    timerRef.current = window.setTimeout(fn, ms);
  }, []);

  const runEvent = useCallback(
    (runId: number, events: ScheduledEvent[], eventIndex: number, steps: StepSpec[]) => {
      if (runIdRef.current !== runId) return;
      if (isPausedRef.current) return;

      nextEventIndexRef.current = eventIndex;

      const ev = events[eventIndex];
      if (!ev) {
        schedule(120, () => stop());
        return;
      }

      const step = steps[ev.stepIndex];
      const rhNotes = getRhHit(step, ev.beatIndex);
      const lhNotes = getLhNotesForBeat(step, ev.beatIndex);

      setCurrentStepIndex(ev.stepIndex);
      setActiveBeatIndex(ev.beatIndex);

      // LH pulse every beat
      setSecondaryNotes(lhNotes);
      clearLhTimer();
      lhTimerRef.current = window.setTimeout(() => {
        setSecondaryNotes([]);
        lhTimerRef.current = null;
      }, Math.max(180, Math.round(LOVE_LH_DUR_BEATS * LOVE_BEAT_MS)));

      if (samplerRef.current && lhNotes.length) {
        try {
          (samplerRef.current as any).triggerAttackRelease(
            lhNotes,
            Math.max(0.18, (LOVE_LH_DUR_BEATS * LOVE_BEAT_MS) / 1000),
            undefined,
            0.56
          );
        } catch {}
      }

      // RH only on hit beats
      if (rhNotes.length) {
        const rhDurBeats =
          selectedMode === "canonical"
            ? LOVE_RH_DUR_BEATS_CANONICAL
            : selectedMode === "variation_a"
            ? LOVE_RH_DUR_BEATS_VARIATION_A
            : selectedMode === "variation_b"
            ? LOVE_RH_DUR_BEATS_VARIATION_B
            : selectedMode === "break"
            ? LOVE_RH_DUR_BEATS_BREAK
            : LOVE_RH_DUR_BEATS_TRANSITION;

        setPrimaryNotes(rhNotes);
        clearRhTimer();
        rhTimerRef.current = window.setTimeout(() => {
          setPrimaryNotes([]);
          rhTimerRef.current = null;
        }, Math.max(120, Math.round(rhDurBeats * LOVE_BEAT_MS)));

        if (samplerRef.current) {
          try {
            const rhVelocity =
              selectedMode === "break"
                ? 0.94
                : selectedMode === "variation_a"
                ? 0.88
                : selectedMode === "variation_b"
                ? 0.9
                : selectedMode === "canonical"
                ? 0.86
                : 0.87;

            const isReturn = ev.beatIndex === 5;

(samplerRef.current as any).triggerAttackRelease(
  rhNotes,
  Math.max(0.12, (rhDurBeats * LOVE_BEAT_MS) / 1000),
  undefined,
  isReturn ? rhVelocity * 0.75 : rhVelocity
);
          } catch {}
        }
      }

      const next = events[eventIndex + 1];
      if (!next) {
        schedule(160, () => stop());
        return;
      }

      schedule(Math.max(0, next.atMs - ev.atMs), () => runEvent(runId, events, eventIndex + 1, steps));
    },
    [schedule, selectedMode, stop]
  );

  const startMode = useCallback(
    async (modeId: ModeId) => {
      setSelectedMode(modeId);

      await Tone.start().catch(() => {});
      await ensureSampler(samplerRef).catch(() => {});

      const nextMode = LOVE_MODES[modeId];
      const events = buildEvents(nextMode.steps);

      stop();
      setIsPlaying(true);
      setIsPaused(false);
      isPausedRef.current = false;

      eventsRef.current = events;
      nextEventIndexRef.current = 0;

      const runId = ++runIdRef.current;

      if (!events.length) {
        stop();
        return;
      }

      schedule(events[0].atMs, () => runEvent(runId, events, 0, nextMode.steps));
    },
    [runEvent, schedule, stop]
  );

  const pausePlayback = useCallback(() => {
    if (!isPlaying || isPaused) return;

    clearMainTimer();

    if (waitStartedAtRef.current != null) {
      const elapsed = performance.now() - waitStartedAtRef.current;
      waitMsRef.current = Math.max(0, waitMsRef.current - elapsed);
    }

    isPausedRef.current = true;
    setIsPaused(true);
  }, [isPaused, isPlaying]);

  const resumePlayback = useCallback(() => {
    if (!isPlaying || !isPaused) return;

    const events = eventsRef.current;
    const nextIndex = nextEventIndexRef.current;
    const runId = runIdRef.current;
    const steps = LOVE_MODES[selectedMode].steps;

    if (!events.length || !events[nextIndex]) {
      stop();
      return;
    }

    isPausedRef.current = false;
    setIsPaused(false);

    const remaining = Math.max(0, waitMsRef.current);
    schedule(remaining, () => runEvent(runId, events, nextIndex, steps));
  }, [isPaused, isPlaying, runEvent, schedule, selectedMode, stop]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Book Companion
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          <span className="bg-gradient-to-r from-[#e4b64a] via-[#efc86f] to-[#d99f3c] bg-clip-text text-transparent">
            Love Arc
          </span>
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-700">
          Wings, roots, and reason to stay. Listen to the arc, hear how it opens,
          and practice how it shifts into other emotions.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Love Arc
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
              💛 Love
            </h2>
          </div>
        </div>

        <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {(Object.keys(MODE_LABELS) as ModeId[]).map((modeId) => {
            const active = modeId === selectedMode;
            return (
              <button
                key={modeId}
                type="button"
                onClick={() => startMode(modeId)}
                className={[
                  "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-black text-white"
                    : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                ].join(" ")}
              >
                <span className="font-semibold">{MODE_LABELS[modeId]}</span>
              </button>
            );
          })}

          {isPlaying && (
            <>
              <button
                type="button"
                onClick={isPaused ? resumePlayback : pausePlayback}
                className="inline-flex shrink-0 items-center rounded-full bg-black/10 px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>

              <button
                type="button"
                onClick={stop}
                className="inline-flex shrink-0 items-center rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                ⏹ Stop
              </button>
            </>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-[#faf7f3] p-3 text-sm text-neutral-800 ring-1 ring-black/5">
          <div>
            <span className="font-semibold text-neutral-900">Now playing:</span>{" "}
            {currentStep ? `${currentStep.label}${isPaused ? " (paused)" : ""}` : "Ready"}
          </div>
          <div className="mt-1">
            <span className="font-semibold text-neutral-900">Next:</span>{" "}
            {nextStep ? nextStep.label : "Stop"}
          </div>
        </div>

        <div className="mt-6">
          <KeyboardEmotions
            activeChordSymbol={null}
            emotion={LOVE_PALETTE}
            emotionLabel={`Love · ${mode.helperTitle}`}
            highlightNotesPrimary={primaryNotes}
            highlightNotesSecondary={secondaryNotes}
            highlightColorSecondary="rgba(17,24,39,0.22)"
          />

          <NotesProgressLine steps={mode.steps} activeIndex={currentStepIndex} />

          <LoveRhythmTable step={currentStep} activeBeatIndex={activeBeatIndex} />
        </div>
      </section>
    </main>
  );
}