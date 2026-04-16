// app/b1/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import Link from "next/link";

import KeyboardEmotions from "@/components/KeyboardEmotions";
import { EMOTIONS, type EmotionId } from "@/lib/emotions";
import { lhRootToNote } from "@/lib/emotionPracticeVoicings";
// Adjust this import path if your book data lives elsewhere.
import { emotionalBookDataMap } from "@/components/books/emotionBookData";

type BookEmotionId = EmotionId;
type PathId = "flow" | "color";
type ModeId = "canonical" | "variations" | "break_restore" | "transition";

type PatternData = {
  beats: string[];
  rh: string[];
  lh: string[];
};

type SequenceStep = {
  key: string;
  title: string;
  path: PathId;
  helperPattern: PatternData;
  rhBars: string[][];
  lhRoots: string[];
  emotionId: BookEmotionId;
};

type ScheduledEvent = {
  atMs: number;
  stepIndex: number;
  barIndex: number;
  beatIndex: number;
  rhToken: string;
  lhToken: string;
  beatMs: number;
  barRemainingMs: number;
};

type TimingConfig = {
  baseBeatMs: number;
  restBetweenChords: number;
  rhDurBeats: number;
  lhDurBeats: number;
};

const EMOTION_ORDER: BookEmotionId[] = [
  "calm",
  "playful",
  "sadness",
  "melancholy",
  "magic",
  "mystery",
  "wonder",
  "tension",
  "anger",
  "fear",
];

const MODE_LABELS: Record<ModeId, string> = {
  canonical: "Play Canonical",
  variations: "Variations",
  break_restore: "Break&Restore",
  transition: "Transition",
};
const EMOTIONS_WITHOUT_TRANSITION: BookEmotionId[] = ["tension", "anger", "fear"];

const TIMING_BY_EMOTION: Record<BookEmotionId, TimingConfig> = {
  calm: { baseBeatMs: 1071, restBetweenChords: 220, rhDurBeats: 0.9, lhDurBeats: 0.16 },
  playful: { baseBeatMs: 833, restBetweenChords: 180, rhDurBeats: 0.5, lhDurBeats: 0.14 },
  magic: { baseBeatMs: 1034, restBetweenChords: 260, rhDurBeats: 1.2, lhDurBeats: 0.18 },
  sadness: { baseBeatMs: 1154, restBetweenChords: 260, rhDurBeats: 0.9, lhDurBeats: 0.18 },
  mystery: { baseBeatMs: 1071, restBetweenChords: 260, rhDurBeats: 1.0, lhDurBeats: 0.16 },
  melancholy: { baseBeatMs: 1111, restBetweenChords: 260, rhDurBeats: 1.0, lhDurBeats: 0.18 },
  wonder: { baseBeatMs: 1000, restBetweenChords: 260, rhDurBeats: 1.2, lhDurBeats: 0.18 },
  tension: { baseBeatMs: 909, restBetweenChords: 200, rhDurBeats: 0.85, lhDurBeats: 0.16 },
  anger: { baseBeatMs: 714, restBetweenChords: 160, rhDurBeats: 4.1, lhDurBeats: 0.14 },
  fear: { baseBeatMs: 1000, restBetweenChords: 220, rhDurBeats: 4.1, lhDurBeats: 0.12 },
};

const BEAT_POSITIONS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];

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

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

function normalizeNote(note: string) {
  return note.replace(/♯/g, "#").replace(/♭/g, "b");
}

function pretty(note: string) {
  return note.replace(/#/g, "♯").replace(/b/g, "♭");
}

function stripOct(note: string) {
  return normalizeNote(note).replace(/\d+$/, "");
}

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
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

function noteUpOctave(note: string): string {
  const m = /^(.*?)(\d)$/.exec(note);
  if (!m) return note;
  return `${m[1]}${parseInt(m[2], 10) + 1}`;
}

function buildAscendingRhVoicing(tokens: string[]): string[] {
  if (!tokens.length) return [];
  const pcs = tokens.map((t) => NOTE_TO_SEMITONE[normalizeNote(t)] ?? 0);
  let firstMidi = 48 + pcs[0];
  while (firstMidi < 55) firstMidi += 12;
  if (Math.abs(firstMidi + 12 - 60) < Math.abs(firstMidi - 60)) firstMidi += 12;

  const midis = [firstMidi];
  for (let i = 1; i < pcs.length; i++) {
    let midi = 48 + pcs[i];
    while (midi <= midis[i - 1]) midi += 12;
    midis.push(midi);
  }
  return midis.map(midiToName);
}

function mapTokensToTemplate(tokens: string[], template: string[]): string[] {
  if (!tokens.length) return [];
  if (tokens.length === template.length) {
    return tokens.map((token, i) => {
      const match = /(\d+)$/.exec(template[i] || "");
      const oct = match ? match[1] : "4";
      return `${normalizeNote(token)}${oct}`;
    });
  }
  return buildAscendingRhVoicing(tokens);
}

function parseNoteBars(line: string | undefined): string[][] {
  if (!line || !line.includes("|")) return [];
  return line.split("|").map((bar) => {
    return bar
      .trim()
      .split(/\s+/)
      .map((part) => normalizeNote(part))
      .filter((part) => /^[A-G](?:#|b)?$/.test(part));
  });
}

function parseLhRoots(line: string | undefined): string[] {
  if (!line || !line.includes("|")) return [];
  return line.split("|").map((bar) => {
    const match = normalizeNote(bar).match(/[A-G](?:#|b)?/);
    return match ? match[0] : "C";
  });
}

function getEmotionPalette(id: EmotionId) {
  return EMOTIONS.find((e) => e.id === id)?.palette ?? EMOTIONS[0].palette;
}

function getTiming(id: BookEmotionId) {
  return TIMING_BY_EMOTION[id];
}

function getLhVisualMode(id: BookEmotionId) {
  switch (id) {
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

function getRhBarsForPath(data: any, path: PathId, line?: string) {
  const templates = (path === "flow" ? data.flowBars : data.colorBars).map((b: any) =>
    (b.activeNotes as string[]).map((n) => normalizeNote(n))
  );

  const fallbackLine = path === "flow" ? data.workingVoicing.flowRh : data.workingVoicing.colorRh;
  const parsed = parseNoteBars(line ?? fallbackLine);
  const bars = parsed.length === 4 ? parsed : parseNoteBars(fallbackLine);

  return bars.map((tokens, i) => mapTokensToTemplate(tokens, templates[i] ?? []));
}

function getLhRootsForPath(data: any, path: PathId, line?: string) {
  const fallbackLine = path === "flow" ? data.workingVoicing.flowLh : data.workingVoicing.colorLh;
  const parsed = parseLhRoots(line ?? fallbackLine);
  const roots = parsed.length === 4 ? parsed : parseLhRoots(fallbackLine);
  return roots;
}

function makeCanonicalStep(data: any, emotionId: BookEmotionId, path: PathId, title: string): SequenceStep {
  return {
    key: `${emotionId}-${path}-${title}`,
    title,
    path,
    helperPattern: data.basePattern,
    rhBars: getRhBarsForPath(data, path),
    lhRoots: getLhRootsForPath(data, path),
    emotionId,
  };
}

function makeVariationStep(
  data: any,
  emotionId: BookEmotionId,
  path: PathId,
  item: any,
  title: string
): SequenceStep {
  return {
    key: `${emotionId}-${path}-${title}`,
    title,
    path,
    helperPattern: item.pattern,
    rhBars: getRhBarsForPath(data, path, path === "flow" ? item.progressionLines.flowRh : item.progressionLines.colorRh),
    lhRoots: getLhRootsForPath(data, path, path === "flow" ? item.progressionLines.flowLh : item.progressionLines.colorLh),
    emotionId,
  };
}

function makeBreakStep(data: any, emotionId: BookEmotionId, path: PathId, title: string): SequenceStep {
  return {
    key: `${emotionId}-${path}-${title}`,
    title,
    path,
    helperPattern: data.hardBreak.pattern,
    rhBars: getRhBarsForPath(data, path, path === "flow" ? data.hardBreak.progressionLines.flowRh : data.hardBreak.progressionLines.colorRh),
    lhRoots: getLhRootsForPath(data, path, path === "flow" ? data.hardBreak.progressionLines.flowLh : data.hardBreak.progressionLines.colorLh),
    emotionId,
  };
}

function makeTransitionStep(data: any, emotionId: BookEmotionId, path: PathId, title: string): SequenceStep {
  const label = data.transition?.transitionLabel ?? title;
  const cleanLabel = label.replace(/^[^A-Za-z]+/, "");
  return {
    key: `${emotionId}-${path}-${title}`,
    title: `${path === "flow" ? "Flow" : "Color"} ${cleanLabel}`,
    path,
    helperPattern: data.transition.pattern,
    rhBars: getRhBarsForPath(data, path, path === "flow" ? data.transition.progressionLines.flowRh : data.transition.progressionLines.colorRh),
    lhRoots: getLhRootsForPath(data, path, path === "flow" ? data.transition.progressionLines.flowLh : data.transition.progressionLines.colorLh),
    emotionId,
  };
}

function buildSequence(emotionId: BookEmotionId, mode: ModeId): SequenceStep[] {
  const data = (emotionalBookDataMap as any)[emotionId];
  const variations = data.safeVariations?.items ?? [];

  if (mode === "canonical") {
    return [
      makeCanonicalStep(data, emotionId, "flow", "Flow · Cycle 1"),
      makeCanonicalStep(data, emotionId, "flow", "Flow · Cycle 2"),
      makeCanonicalStep(data, emotionId, "color", "Color · Cycle 1"),
      makeCanonicalStep(data, emotionId, "color", "Color · Cycle 2"),
    ];
  }

  if (mode === "variations") {
    const out: SequenceStep[] = [
      makeCanonicalStep(data, emotionId, "flow", "Flow Canonical"),
    ];
    if (variations[0]) out.push(makeVariationStep(data, emotionId, "flow", variations[0], "Flow Variation A"));
    if (variations[1]) out.push(makeVariationStep(data, emotionId, "flow", variations[1], "Flow Variation B"));
    out.push(makeCanonicalStep(data, emotionId, "color", "Color Canonical"));
    if (variations[0]) out.push(makeVariationStep(data, emotionId, "color", variations[0], "Color Variation A"));
    if (variations[1]) out.push(makeVariationStep(data, emotionId, "color", variations[1], "Color Variation B"));
    return out;
  }

  if (mode === "break_restore") {
    return [
      makeCanonicalStep(data, emotionId, "flow", "Flow Canonical"),
      makeBreakStep(data, emotionId, "flow", "Flow Break"),
      makeCanonicalStep(data, emotionId, "color", "Color Canonical"),
      makeBreakStep(data, emotionId, "color", "Color Break"),
      makeCanonicalStep(data, emotionId, "flow", "Restore"),
      makeCanonicalStep(data, emotionId, "color", "Color Canonical"),
      makeCanonicalStep(data, emotionId, "flow", "Flow Canonical"),
    ];
  }

  return [
    makeCanonicalStep(data, emotionId, "flow", "Flow Canonical"),
    makeTransitionStep(data, emotionId, "flow", "Flow Transition"),
    makeCanonicalStep(data, emotionId, "color", "Color Canonical"),
    makeTransitionStep(data, emotionId, "color", "Color Transition"),
  ];
}

function buildEvents(sequence: SequenceStep[]): ScheduledEvent[] {
  const events: ScheduledEvent[] = [];
  let cursor = 0;

  sequence.forEach((step, stepIndex) => {
    const timing = getTiming(step.emotionId);
    const beatMs = timing.baseBeatMs;

    for (let barIndex = 0; barIndex < 4; barIndex++) {
      const barStart = cursor;

      for (let beatIndex = 0; beatIndex < 8; beatIndex++) {
        events.push({
          atMs: barStart + Math.round(BEAT_POSITIONS[beatIndex] * beatMs),
          stepIndex,
          barIndex,
          beatIndex,
          rhToken: step.helperPattern.rh[beatIndex] ?? "",
          lhToken: step.helperPattern.lh[beatIndex] ?? "",
          beatMs,
          barRemainingMs: Math.max(120, Math.round((4 - BEAT_POSITIONS[beatIndex]) * beatMs) - 40),
        });
      }

      cursor = barStart + beatMs * 4 + timing.restBetweenChords;
    }
  });

  return events;
}

function getRhNotesForToken(token: string, barNotes: string[]) {
  switch (token) {
    case "Chord":
    case "Full":
      return barNotes;
    case "Partial":
    case "Top 2":
      return barNotes.slice(Math.max(0, barNotes.length - 2));
    case "Top":
      return barNotes.length ? [barNotes[barNotes.length - 1]] : [];
    case "Bottom":
      return barNotes.length ? [barNotes[0]] : [];
    case "Middle":
      return barNotes.length > 1 ? [barNotes[1]] : barNotes.length ? [barNotes[0]] : [];
    default:
      return [];
  }
}

function getLhNotesForToken(token: string, lhRoot: string, rhBar: string[]) {
  const upper = noteUpOctave(lhRoot);
  const chordTones = rhBar.map((n) => stripOct(n));
  const third = chordTones[1] ? lhRootToNote(chordTones[1]) : lhRoot;
  const fifth = chordTones[2] ? lhRootToNote(chordTones[2]) : lhRoot;

  switch (token) {
    case "Root":
      return [lhRoot];
    case "3rd":
      return [third];
    case "5th":
      return [fifth];
    case "Oct":
      return [lhRoot, upper];
    case "Upper":
      return [upper];
    case "Bottom":
      return [lhRoot];
    default:
      return [];
  }
}

function NotesProgressLine(props: {
  rhBars: string[][];
  lhRoots: string[];
  activeIndex: number | null;
}) {
  const { rhBars, lhRoots, activeIndex } = props;

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
        {rhBars.map((bar, i) => renderBar(bar.map((n) => pretty(stripOct(n))).join(" "), i))}
      </div>
      <div>
        <span style={{ fontWeight: 800, marginRight: 6 }}>LH:</span>
        {lhRoots.map((bar, i) => renderBar(pretty(bar), i))}
      </div>
    </div>
  );
}

function RhythmTable(props: {
  pattern: PatternData;
  activeBeatIndex: number | null;
}) {
  const { pattern, activeBeatIndex } = props;

  return (
    <div className="mt-4 overflow-x-auto rounded-xl bg-[#faf7f3] p-3 ring-1 ring-black/5">
      <div className="min-w-[620px]">
        <div className="grid grid-cols-9 gap-2 text-xs">
          <div className="font-semibold text-neutral-500">Beat</div>
          {pattern.beats.map((beat, i) => (
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

        <div className="mt-2 grid grid-cols-9 gap-2 text-xs">
          <div className="font-semibold text-neutral-500">RH</div>
          {pattern.rh.map((token, i) => (
            <div
              key={`rh-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center",
                activeBeatIndex === i ? "bg-black/10 text-neutral-900 font-semibold" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {token || "—"}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-9 gap-2 text-xs">
          <div className="font-semibold text-neutral-500">LH</div>
          {pattern.lh.map((token, i) => (
            <div
              key={`lh-${i}`}
              className={[
                "rounded-md px-2 py-1 text-center",
                activeBeatIndex === i ? "bg-black/10 text-neutral-900 font-semibold" : "bg-white text-neutral-700 ring-1 ring-black/5",
              ].join(" ")}
            >
              {token || "—"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BookCompanionPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<BookEmotionId>("playful");
  const [selectedMode, setSelectedMode] = useState<ModeId>("canonical");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
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

  const data = (emotionalBookDataMap as any)[selectedEmotion];
  const palette = getEmotionPalette(selectedEmotion);
  const emotionMeta = EMOTIONS.find((e) => e.id === selectedEmotion) ?? EMOTIONS[0];

  const sequence = useMemo(
    () => buildSequence(selectedEmotion, selectedMode),
    [selectedEmotion, selectedMode]
  );

  const currentStep = currentStepIndex != null ? sequence[currentStepIndex] : null;
  const nextStep = currentStepIndex != null ? sequence[currentStepIndex + 1] ?? null : null;

  const helperPattern = useMemo(() => {
    if (currentStep) return currentStep.helperPattern;

    if (selectedMode === "canonical") return data.basePattern;
    if (selectedMode === "variations") return data.safeVariations?.items?.[0]?.pattern ?? data.basePattern;
    if (selectedMode === "break_restore") return data.hardBreak.pattern;
    return data.transition.pattern;
  }, [currentStep, data, selectedMode]);

  const helperRhBars = currentStep?.rhBars ?? getRhBarsForPath(data, "flow");
  const helperLhRoots = currentStep?.lhRoots ?? getLhRootsForPath(data, "flow");

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
    setActiveBarIndex(null);
    setActiveBeatIndex(null);
    setPrimaryNotes([]);
    setSecondaryNotes([]);
  }, []);

  useEffect(() => {
    stop();
  }, [selectedEmotion, stop]);

  useEffect(() => {
  if (
    selectedMode === "transition" &&
    EMOTIONS_WITHOUT_TRANSITION.includes(selectedEmotion)
  ) {
    setSelectedMode("canonical");
    stop();
  }
}, [selectedEmotion, selectedMode, stop]);
  useEffect(() => () => stop(), [stop]);

  const schedule = useCallback((ms: number, fn: () => void) => {
    clearMainTimer();
    waitStartedAtRef.current = performance.now();
    waitMsRef.current = ms;
    timerRef.current = window.setTimeout(fn, ms);
  }, []);

  const runEvent = useCallback(
    (runId: number, events: ScheduledEvent[], eventIndex: number) => {
      if (runIdRef.current !== runId) return;
      if (isPausedRef.current) return;
      nextEventIndexRef.current = eventIndex;

      const ev = events[eventIndex];
      if (!ev) {
        schedule(120, () => stop());
        return;
      }

      const step = sequence[ev.stepIndex];
      const timing = getTiming(step.emotionId);
      const lhMode = getLhVisualMode(step.emotionId);
      const rhBar = step.rhBars[ev.barIndex];
      const lhRootToken = step.lhRoots[ev.barIndex];
      const lhRoot = lhRootToNote(lhRootToken);

      setCurrentStepIndex(ev.stepIndex);
      setActiveBarIndex(ev.barIndex);
      setActiveBeatIndex(ev.beatIndex);

      const rhToken = ev.rhToken;
      const lhToken = ev.lhToken;

      // RH
      if (rhToken === "–") {
        clearRhTimer();
        setPrimaryNotes([]);
      } else if (rhToken) {
        const rhNotes = getRhNotesForToken(rhToken, rhBar);
        const rhMs =
          (step.emotionId === "anger" || step.emotionId === "fear") && ev.beatIndex === 0
            ? Math.round(ev.beatMs * 4)
            : Math.max(100, Math.round(timing.rhDurBeats * ev.beatMs));

        setPrimaryNotes(rhNotes);
        clearRhTimer();
        rhTimerRef.current = window.setTimeout(() => {
          setPrimaryNotes([]);
          rhTimerRef.current = null;
        }, rhMs);

        if (samplerRef.current && rhNotes.length) {
          try {
            (samplerRef.current as any).triggerAttackRelease(
              rhNotes,
              rhMs / 1000,
              undefined,
              step.emotionId === "anger" ? 0.9 : step.emotionId === "fear" ? 0.78 : 0.86
            );
          } catch {}
        }
      }

      // LH
      if (lhMode === "pulse") {
        if (lhToken === "–") {
          clearLhTimer();
          setSecondaryNotes([]);
        } else if (lhToken) {
          const notes = getLhNotesForToken(lhToken, lhRoot, rhBar);
          const holdMs = Math.max(90, Math.round(timing.lhDurBeats * ev.beatMs));
          setSecondaryNotes(notes);
          clearLhTimer();
          lhTimerRef.current = window.setTimeout(() => {
            setSecondaryNotes([]);
            lhTimerRef.current = null;
          }, holdMs);

          if (samplerRef.current && notes.length) {
            try {
              (samplerRef.current as any).triggerAttackRelease(notes, holdMs / 1000, undefined, 0.8);
            } catch {}
          }
        }
      } else if (lhMode === "barHold") {
        if (lhToken) {
          const notes = getLhNotesForToken(lhToken, lhRoot, rhBar);
          setSecondaryNotes(notes);
          clearLhTimer();
          lhTimerRef.current = window.setTimeout(() => {
            setSecondaryNotes([]);
            lhTimerRef.current = null;
          }, ev.barRemainingMs);

          if (samplerRef.current && notes.length) {
            try {
              (samplerRef.current as any).triggerAttackRelease(notes, Math.max(0.2, timing.lhDurBeats * ev.beatMs / 1000), undefined, 0.78);
            } catch {}
          }
        }
      } else if (lhMode === "untilReleaseToken") {
        if (lhToken === "–") {
          clearLhTimer();
          setSecondaryNotes([]);
        } else if (lhToken) {
          const notes = getLhNotesForToken(lhToken, lhRoot, rhBar);
          setSecondaryNotes(notes);

          if (samplerRef.current && notes.length) {
            try {
              (samplerRef.current as any).triggerAttackRelease(notes, Math.max(0.2, timing.lhDurBeats * ev.beatMs / 1000), undefined, 0.78);
            } catch {}
          }
        }
      } else if (lhMode === "continuousRefresh") {
        if (lhToken === "–") {
          clearLhTimer();
          setSecondaryNotes([]);
        } else if (lhToken) {
          const notes = getLhNotesForToken(lhToken, lhRoot, rhBar);

          setSecondaryNotes([]);
          window.setTimeout(() => setSecondaryNotes(notes), 70);

          clearLhTimer();
          lhTimerRef.current = window.setTimeout(() => {
            setSecondaryNotes([]);
            lhTimerRef.current = null;
          }, ev.barRemainingMs);

          if (samplerRef.current && notes.length) {
            try {
              (samplerRef.current as any).triggerAttackRelease(notes, Math.max(0.2, timing.lhDurBeats * ev.beatMs / 1000), undefined, 0.78);
            } catch {}
          }
        }
      }

      const next = events[eventIndex + 1];
      if (!next) {
        schedule(160, () => stop());
        return;
      }

      schedule(Math.max(0, next.atMs - ev.atMs), () => runEvent(runId, events, eventIndex + 1));
    },
    [schedule, sequence, stop]
  );

  const startMode = useCallback(
    async (mode: ModeId) => {
      const seq = buildSequence(selectedEmotion, mode);
      setSelectedMode(mode);

      await Tone.start().catch(() => {});
      await ensureSampler(samplerRef).catch(() => {});

            stop();
      setIsPlaying(true);
      setIsPaused(false);
      isPausedRef.current = false;

      const events = buildEvents(seq);
      eventsRef.current = events;
      nextEventIndexRef.current = 0;

      const runId = ++runIdRef.current;

      if (!events.length) {
        stop();
        return;
      }

      schedule(events[0].atMs, () => runEvent(runId, events, 0));
    },
    [runEvent, schedule, selectedEmotion, stop]
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

    if (!events.length || !events[nextIndex]) {
      stop();
      return;
    }

    isPausedRef.current = false;
    setIsPaused(false);

    const remaining = Math.max(0, waitMsRef.current);

    schedule(remaining, () => {
      runEvent(runId, events, nextIndex);
    });
  }, [isPaused, isPlaying, runEvent, schedule, stop]);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Book Companion
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          <span className="bg-gradient-to-r from-[#87a8ff] via-[#c68bfe] to-[#ff80b5] bg-clip-text text-transparent">
            Hear and feel each emotion in motion
          </span>
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-700">
          The book shows what to play. This page shows how it lives over time.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Choose emotion
        </div>

        <div className="flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {EMOTION_ORDER.map((id) => {
            const active = id === selectedEmotion;
            const label = EMOTIONS.find((e) => e.id === id)?.label ?? id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedEmotion(id)}
                className={[
                  "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-black text-white"
                    : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                ].join(" ")}
              >
                <span className="font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Emotion
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
              {emotionMeta.emoji} {emotionMeta.label}
            </h2>
          </div>

          
        </div>

        <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {(Object.keys(MODE_LABELS) as ModeId[])
  .filter((mode) => {
    if (mode !== "transition") return true;
    return !EMOTIONS_WITHOUT_TRANSITION.includes(selectedEmotion);
  })
  .map((mode) => {
    const active = mode === selectedMode;
    return (
      <button
        key={mode}
        type="button"
        onClick={() => startMode(mode)}
        className={[
          "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm transition",
          active
            ? "bg-black text-white"
            : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
        ].join(" ")}
      >
        <span className="font-semibold">{MODE_LABELS[mode]}</span>
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
                          {currentStep ? `${currentStep.title}${isPaused ? " (paused)" : ""}` : "Ready"}
          </div>
          <div className="mt-1">
            <span className="font-semibold text-neutral-900">Next:</span>{" "}
            {nextStep ? `${nextStep.title} [${nextStep.path === "flow" ? "Flow" : "Color"}]` : "Stop"}
          </div>
        </div>

        <div className="mt-4">
          <KeyboardEmotions
            activeChordSymbol={null}
            emotion={palette}
            emotionLabel={`${emotionMeta.label} · ${currentStep ? currentStep.title : MODE_LABELS[selectedMode]}`}
            highlightNotesPrimary={primaryNotes}
            highlightNotesSecondary={secondaryNotes}
            highlightColorSecondary="rgba(17,24,39,0.22)"
          />

          <NotesProgressLine
            rhBars={helperRhBars}
            lhRoots={helperLhRoots}
            activeIndex={activeBarIndex}
          />

          <RhythmTable pattern={helperPattern} activeBeatIndex={activeBeatIndex} />
        </div>

        
      </section>
    </main>
  );
}
