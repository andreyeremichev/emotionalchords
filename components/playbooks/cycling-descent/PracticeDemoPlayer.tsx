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

type Status = "IDLE" | "PLAYING" | "PAUSED" | "FINISHED";

type Event =
  | { kind: "NOTE"; keys: string[]; ms: number; chordId: string }
  | { kind: "GAP"; ms: number; chordId: string };

const NOTE_MS = 500; // you can tweak
const GAP_MS = 50;   // you can tweak

const HELPLESS_PALETTE = {
  gradientTop: "#2b2f36",
  gradientBottom: "#0f1115",
  trailColor: "#8fa3bf",
};

// Demo formula line (public-facing; no theory labels)
const FORMULA_LINE =
  "DFA ×4 → CEA ×4 → B♭DF ×4 → ACF ×4 → ACE ×2 → AC♯E ×6";
  function FormulaLine({ active }: { active: string | null }) {
  const seg = (id: string, text: string, arrow = true) => {
    const isOn = active === id;
    return (
      <span
        key={id}
        className={[
          "transition",
          isOn ? "font-semibold opacity-100" : "opacity-60",
        ].join(" ")}
      >
        {text}
        {arrow ? <span className="mx-2 opacity-40">→</span> : null}
      </span>
    );
  };

  return (
    <div className="text-sm">
      {seg("DFA", "DFA ×4")}
      {seg("CEA", "CEA ×4")}
      {seg("BbDF", "B♭DF ×4")}
      {seg("ACF", "ACF ×4")}
      {seg("ACE", "ACE ×2")}
      {seg("ACsE", "AC♯E ×6", false)}
    </div>
  );
}

// LH triads (canonical sharps for audio/keys)
const LH = {
  DFA: ["D3", "F3", "A3"],
  CEA: ["C3", "E3", "A3"],
  BbDF: ["A#2", "D3", "F3"], // IMPORTANT: your correction (A#2, not A#3)
  ACF: ["A2", "C3", "F3"],
  ACE: ["A2", "C3", "E3"],
  ACsE: ["A2", "C#3", "E3"],
} as const;

type ChordId = keyof typeof LH;

// RH “texture” deterministic plan for pass 2.
// We produce RH notes aligned to LH steps (bottom/middle/top).
// If a chord has “silence” on a step, return null.
// For AC#E we cycle A, A#, C#, D continuously across all LH steps.
function buildRhPlanner() {
  // DFA: one note per pass -> align to bottom step only
  const DFA_passNotes = ["D4", "F4", "A4", "F4"];

  // CEA: dyad on pass 1 (C,E) and pass 3 (E,A). Aligned to bottom/middle.
  // Passes 2 and 4 silent.
  const CEA_passDyads: Array<[string, string] | null> = [
    ["C4", "E4"],
    null,
    ["E4", "A4"],
    null,
  ];

  // BbDF: “block chord with two inversions”, but we keep “current note only”
  // by breaking into three notes aligned to bottom/middle/top.
  // Alternate inversions across passes:
  // inv1: F4, Bb4, D5  (Bb -> A#)
  // inv2: D5, F5, Bb5
  const BbDF_passTriads: Array<[string, string, string]> = [
    ["F4", "A#4", "D5"],
    ["D5", "F5", "A#5"],
    ["F4", "A#4", "D5"],
    ["D5", "F5", "A#5"],
  ];

  // ACF: sparse single notes on pass 2 and 4 only (bottom step)
  const ACF_passNote: Array<string | null> = [null, "A4", null, "C5"];

  // ACE: pass 1 plays A then E (bottom/middle); pass 2 silent
  const ACE_passDyads: Array<[string, string] | null> = [
    ["A4", "E5"],
    null,
  ];

  // AC#E: arpeggio figure A → A# → C# → D repeated across *steps* (not passes)
  
// AC#E: AA♯C♯D then backwards DC♯A♯A, repeat
const ACsE_cycle = ["A4", "A#4", "C#5", "D5", "D5", "C#5", "A#4", "A4"];

  return {
    DFA: (passIndex0: number, stepIndex0: number) => {
      // step 0=bottom,1=mid,2=top
      if (stepIndex0 !== 0) return null;
      return DFA_passNotes[passIndex0] ?? null;
    },

    CEA: (passIndex0: number, stepIndex0: number) => {
      const dyad = CEA_passDyads[passIndex0] ?? null;
      if (!dyad) return null;
      if (stepIndex0 === 0) return dyad[0];
      if (stepIndex0 === 1) return dyad[1];
      return null; // top step silent
    },

    BbDF: (passIndex0: number, stepIndex0: number) => {
      const tri = BbDF_passTriads[passIndex0];
      return tri?.[stepIndex0] ?? null;
    },

    ACF: (passIndex0: number, stepIndex0: number) => {
      if (stepIndex0 !== 0) return null;
      return ACF_passNote[passIndex0] ?? null;
    },

    ACE: (passIndex0: number, stepIndex0: number) => {
      const dyad = ACE_passDyads[passIndex0] ?? null;
      if (!dyad) return null;
      if (stepIndex0 === 0) return dyad[0];
      if (stepIndex0 === 1) return dyad[1];
      return null;
    },

    ACsE: (globalStepIndex0: number) => {
      return ACsE_cycle[globalStepIndex0 % ACsE_cycle.length];
    },
  };
}

function buildDemoEvents(): Event[] {
  const out: Event[] = [];
  const rh = buildRhPlanner();

  const pushChord = (
    chordId: ChordId,
    repeats: number,
    pass2Mode: boolean,
    opts?: { acsEGlobalStepStart?: number }
  ) => {
    const triad = LH[chordId];
    for (let pass = 0; pass < repeats; pass++) {
      for (let step = 0; step < 3; step++) {
        const lhKey = triad[step];

        let rhKey: string | null = null;

        if (pass2Mode) {
          if (chordId === "DFA") rhKey = rh.DFA(pass, step);
          if (chordId === "CEA") rhKey = rh.CEA(pass, step);
          if (chordId === "BbDF") rhKey = rh.BbDF(pass, step);
          if (chordId === "ACF") rhKey = rh.ACF(pass, step);
          if (chordId === "ACE") rhKey = rh.ACE(pass, step);
          if (chordId === "ACsE") {
            const base = opts?.acsEGlobalStepStart ?? 0;
            const globalStep = base + pass * 3 + step;
            rhKey = rh.ACsE(globalStep);
          }
        }

        const keys = rhKey ? [lhKey, rhKey] : [lhKey];

        out.push({
          kind: "NOTE",
          keys,
          ms: NOTE_MS,
          chordId,
        });
        out.push({
          kind: "GAP",
          ms: GAP_MS,
          chordId,
        });
      }
    }
  };

  // Pass 1: LH only (AC#E x6)
  pushChord("DFA", 4, false);
  pushChord("CEA", 4, false);
  pushChord("BbDF", 4, false);
  pushChord("ACF", 4, false);
  pushChord("ACE", 2, false);
  pushChord("ACsE", 6, false);

  // Pass 2: LH + RH texture (AC#E x6)
pushChord("DFA", 4, true);
pushChord("CEA", 4, true);
pushChord("BbDF", 4, true);
pushChord("ACF", 4, true);
pushChord("ACE", 2, true);
pushChord("ACsE", 6, true, { acsEGlobalStepStart: 0 });

// OUTRO (do NOT stop on AC♯E):
// 1) DFA ×3 with LH only (no RH)
pushChord("DFA", 3, false);

// 2) Final DFA with LH + RH arpeggio D4–F4–A4–D5
// We keep it simple and perfectly aligned to the LH bottom/middle/top,
// then add one extra RH-only note (D5) as the last “release”.
const finalLH = LH.DFA; // ["D3","F3","A3"]

// D3 + D4
out.push({ kind: "NOTE", keys: [finalLH[0], "D4"], ms: NOTE_MS, chordId: "DFA" });
out.push({ kind: "GAP", ms: GAP_MS, chordId: "DFA" });

// F3 + F4
out.push({ kind: "NOTE", keys: [finalLH[1], "F4"], ms: NOTE_MS, chordId: "DFA" });
out.push({ kind: "GAP", ms: GAP_MS, chordId: "DFA" });

// A3 + A4
out.push({ kind: "NOTE", keys: [finalLH[2], "A4"], ms: NOTE_MS, chordId: "DFA" });
out.push({ kind: "GAP", ms: GAP_MS, chordId: "DFA" });

// Extra RH-only D5 (final top)
out.push({ kind: "NOTE", keys: ["D5"], ms: NOTE_MS, chordId: "DFA" });
out.push({ kind: "GAP", ms: GAP_MS, chordId: "DFA" });

return out;
}

export default function PracticeDemoPlayer() {
  const events = useMemo(() => buildDemoEvents(), []);
  const [status, setStatus] = useState<Status>("IDLE");
  const [idx, setIdx] = useState(0);

  const timerRef = useRef<number | null>(null);
  const audiosRef = useRef<HTMLAudioElement[]>([]);

  const statusRef = useRef<Status>("IDLE");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const ev = events[idx] ?? null;

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopAudios() {
    for (const a of audiosRef.current) a.pause();
    audiosRef.current = [];
  }

  function tickFrom(nextIdx: number) {
    clearTimer();

    if (nextIdx >= events.length) {
      stopAudios();
      setStatus("FINISHED");
      return;
    }

    setIdx(nextIdx);
    const cur = events[nextIdx];

    if (cur.kind === "NOTE") {
      // Play LH and RH simultaneously (if present)
      stopAudios();
      audiosRef.current = cur.keys.map((k) => playNoteAudio(k));
    } else {
      // GAP: silence
      stopAudios();
    }

    timerRef.current = window.setTimeout(() => {
      if (statusRef.current === "PLAYING") tickFrom(nextIdx + 1);
    }, cur.ms);
  }

  function onReplay() {
    stopAudios();
    clearTimer();
    setStatus("PLAYING");
    tickFrom(0);
  }

  function onPauseResume() {
    if (status === "PLAYING") {
      setStatus("PAUSED");
      stopAudios();
      clearTimer();
      return;
    }
    if (status === "PAUSED") {
      setStatus("PLAYING");
      // Simple rule: restart current event
      tickFrom(idx);
    }
  }

  useEffect(() => {
    return () => {
      stopAudios();
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const highlightedNow = ev?.kind === "NOTE" ? ev.keys : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
<FormulaLine active={ev ? ev.chordId : null} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPauseResume}
            className="rounded-full border px-3 py-1 text-sm hover:bg-black/5 disabled:opacity-50"
            disabled={status === "IDLE" || status === "FINISHED"}
          >
            {status === "PLAYING" ? "Pause" : "Resume"}
          </button>

          <button
            type="button"
            onClick={onReplay}
            className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
          >
            Replay demo
          </button>
        </div>
      </div>
      

      <KeyboardPlaybook
        activeChordSymbol={null}
        emotion={HELPLESS_PALETTE}
        emotionLabel="Cycling Descent"
        // IMPORTANT: keep primary empty so no labels render
        highlightNotesPrimary={[]}
        // Highlight only currently sounding notes (LH + RH)
        highlightNotesSecondary={highlightedNow}
        highlightColorSecondary={HELPLESS_PALETTE.trailColor}
        // labels are not shown anyway (primary is empty); safe to omit overrides
      />
    </div>
  );
}