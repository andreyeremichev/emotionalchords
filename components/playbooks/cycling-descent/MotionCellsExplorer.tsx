"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import KeyboardPlaybook from "@/components/playbooks/KeyboardPlaybook";

function playNoteAudio(noteName: string) {
  const safeName = noteName.replace("#", "%23");
  const audio = new Audio(`/audio/notes/${safeName}.wav`);
  audio.currentTime = 0;
  audio.play().catch(() => {});
  return audio;
}

type ChordId = "DFA" | "CEA" | "BbDF" | "ACF" | "ACE" | "ACsE";

type Event =
  | { kind: "NOTE"; chordId: ChordId; keys: string[]; ms: number }
  | { kind: "GAP"; chordId: ChordId; keys: string[]; ms: number };

const NOTE_MS = 900; // tweak as you like
const GAP_MS = 200;

const PALETTE = {
  gradientTop: "#2b2f36",
  gradientBottom: "#0f1115",
  trailColor: "#8fa3bf",
};

// LH triads (canonical sharps for audio identity)
const LH: Record<ChordId, [string, string, string]> = {
  DFA: ["D3", "F3", "A3"],
  CEA: ["C3", "E3", "A3"],
  BbDF: ["A#2", "D3", "F3"], // B♭2–D3–F3
  ACF: ["A2", "C3", "F3"],
  ACE: ["A2", "C3", "E3"],
  ACsE: ["A2", "C#3", "E3"],
};

// Caption progression (chunks)
const FORMULA = [
  { id: "DFA" as const, text: "DFA ×4" },
  { id: "CEA" as const, text: "CEA ×4" },
  { id: "BbDF" as const, text: "B♭DF ×4" },
  { id: "ACF" as const, text: "ACF ×4" },
  { id: "ACE" as const, text: "ACE ×2" },
  { id: "ACsE" as const, text: "AC♯E ×6" },
];

// Motion sentence per chunk (compressed)
const MOTION_TEXT: Record<ChordId, string> = {
  DFA: "Establishes the engine and introduces downward gravity.",
  CEA: "Reorients the same motion without changing its direction.",
  BbDF: "Increases distance and weight, making the descent harder to escape.",
  ACF: "Shifts the frame closer without allowing arrival.",
  ACE: "Briefly stabilizes the motion without stopping it.",
  ACsE: "Locks the motion into a brighter, tighter pull that refuses to resolve.",
};

function buildLHOnlyEvents(): Event[] {
  const out: Event[] = [];

  const pushChord = (chordId: ChordId, repeats: number) => {
    const triad = LH[chordId];
    for (let pass = 0; pass < repeats; pass++) {
      for (let step = 0; step < 3; step++) {
        const k = triad[step];
        out.push({ kind: "NOTE", chordId, keys: [k], ms: NOTE_MS });
        out.push({ kind: "GAP", chordId, keys: [], ms: GAP_MS });
      }
    }
  };

  pushChord("DFA", 4);
  pushChord("CEA", 4);
  pushChord("BbDF", 4);
  pushChord("ACF", 4);
  pushChord("ACE", 2);
  pushChord("ACsE", 6);

  return out;
}

function FormulaLine({ active }: { active: ChordId | null }) {
  return (
    <div className="text-sm">
      {FORMULA.map((s, idx) => {
        const isOn = active === s.id;
        const isLast = idx === FORMULA.length - 1;
        return (
          <span
            key={s.id}
            className={["transition", isOn ? "font-semibold opacity-100" : "opacity-60"].join(" ")}
          >
            {s.text}
            {!isLast ? <span className="mx-2 opacity-40">→</span> : null}
          </span>
        );
      })}
    </div>
  );
}

export default function MotionCellsExplorer() {
  const events = useMemo(() => buildLHOnlyEvents(), []);
  const [open, setOpen] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [i, setI] = useState(0);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const ev = open ? events[i] ?? null : null;
  const activeChordId: ChordId | null = ev ? ev.chordId : null;

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }

  function tickFrom(next: number) {
    clearTimer();

    if (next >= events.length) {
      setPlaying(false);
      stopAudio();
      return;
    }

    setI(next);
    const cur = events[next];

    if (cur.kind === "NOTE" && cur.keys[0]) {
      stopAudio();
      audioRef.current = playNoteAudio(cur.keys[0]);
    } else {
      stopAudio();
    }

    timerRef.current = window.setTimeout(() => {
      if (playingRef.current) tickFrom(next + 1);
    }, cur.ms);
  }

  function onReplay() {
    setPlaying(true);
    tickFrom(0);
  }

  function onStop() {
    setPlaying(false);
    clearTimer();
    stopAudio();
  }

  useEffect(() => {
    return () => {
      setPlaying(false);
      clearTimer();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight only the currently played note (LH only)
  const activeKeys = ev?.kind === "NOTE" ? ev.keys : [];

  const headerRight = useMemo(() => {
    if (!activeChordId) return "Explore what this motion does.";
    return MOTION_TEXT[activeChordId];
  }, [activeChordId]);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
      >
        Explore what each chord motion does&nbsp;&nbsp;←
      </button>

      {open ? (
        <div className="mt-3 rounded-2xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <FormulaLine active={activeChordId} />

            <button
              type="button"
              onClick={playing ? onStop : onReplay}
              className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
            >
              {playing ? "Stop" : "Replay"}
            </button>
          </div>

          <div className="mt-4">
            <KeyboardPlaybook
              activeChordSymbol={null}
              emotion={PALETTE}
              emotionLabel=""
              hideHeaderTitle
              // motion sentence synced to active chunk
              headerRight={<span>{headerRight}</span>}
              // Labels OFF
              highlightNotesPrimary={[]}
              // Highlight only what is played now
              highlightNotesSecondary={activeKeys}
              highlightColorSecondary={PALETTE.trailColor}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}