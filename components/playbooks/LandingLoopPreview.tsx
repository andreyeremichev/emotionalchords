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

type Event =
  | { kind: "NOTE"; key: string; chord: string[]; ms: number }
  | { kind: "GAP"; chord: string[]; ms: number };

const NOTE_MS = 500; // tweak
const GAP_MS = 50;   // tweak

const HELPLESS_PALETTE = {
  gradientTop: "#2b2f36",
  gradientBottom: "#0f1115",
  trailColor: "#8fa3bf",
};

const LH = {
  DFA: ["D3", "F3", "A3"],
  CEA: ["C3", "E3", "A3"],
  BbDF: ["A#2", "D3", "F3"], // display layer only; landing has no labels
  ACF: ["A2", "C3", "F3"],
  ACE: ["A2", "C3", "E3"],
  ACsE: ["A2", "C#3", "E3"],
} as const;

function buildLandingLoopEvents(): Event[] {
  const out: Event[] = [];

  const pushTriad = (triad: readonly string[], repeats: number) => {
    for (let i = 0; i < repeats; i++) {
      // bottom
      out.push({ kind: "NOTE", key: triad[0], chord: [...triad], ms: NOTE_MS });
      out.push({ kind: "GAP", chord: [...triad], ms: GAP_MS });
      // middle
      out.push({ kind: "NOTE", key: triad[1], chord: [...triad], ms: NOTE_MS });
      out.push({ kind: "GAP", chord: [...triad], ms: GAP_MS });
      // top
      out.push({ kind: "NOTE", key: triad[2], chord: [...triad], ms: NOTE_MS });
      out.push({ kind: "GAP", chord: [...triad], ms: GAP_MS });
    }
  };

  pushTriad(LH.DFA, 4);
  pushTriad(LH.CEA, 4);
  pushTriad(LH.BbDF, 4);
  pushTriad(LH.ACF, 4);
  pushTriad(LH.ACE, 2);
  pushTriad(LH.ACsE, 6);

  return out;
}

type Status = "IDLE" | "PLAYING" | "STOPPED";

export default function LandingLoopPreview() {
  const events = useMemo(() => buildLandingLoopEvents(), []);
  const [status, setStatus] = useState<Status>("IDLE");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeChord, setActiveChord] = useState<string[]>([]);

  const idxRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef<Status>("IDLE");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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

  function tick() {
    clearTimer();

    const ev = events[idxRef.current % events.length];
    idxRef.current = (idxRef.current + 1) % events.length;

    setActiveChord(ev.chord);

    if (ev.kind === "NOTE") {
      setActiveKey(ev.key);
      stopAudio();
      audioRef.current = playNoteAudio(ev.key);
    } else {
      setActiveKey(null);
    }

    timerRef.current = window.setTimeout(() => {
      if (statusRef.current === "PLAYING") tick();
    }, ev.ms);
  }

  function onPlay() {
    if (statusRef.current === "PLAYING") return;
    setStatus("PLAYING");
    tick();
  }

  function onStop() {
    setStatus("STOPPED");
    clearTimer();
    stopAudio();
    setActiveKey(null);
    setActiveChord([]);
  }

  useEffect(() => {
    return () => {
      clearTimer();
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={status === "PLAYING" ? onStop : onPlay}
          className="rounded-full border px-4 py-2 text-sm hover:bg-black/5"
        >
          {status === "PLAYING" ? "Stop" : "▶︎ Play left-hand loop"}
        </button>

        
      </div>

      <div className="mt-4">
        <KeyboardPlaybook
  activeChordSymbol={null}
  emotion={HELPLESS_PALETTE}
  emotionLabel="Cycling Descent"

  // IMPORTANT: keep primary empty so NO labels are rendered
  highlightNotesPrimary={[]}

  // Use secondary for highlighting only (no labels)
  // Option A: highlight only the currently played note
  highlightNotesSecondary={activeKey ? [activeKey] : []}

  // If you prefer the full triad lit, use this instead:
  // highlightNotesSecondary={activeChord}

  highlightColorSecondary={HELPLESS_PALETTE.trailColor}
  // You can remove noteLabelMapOverride entirely on landing since no labels render
/>
      </div>
    </div>
  );
}