"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TimelineEvent } from "./step1Timeline";

// Reuse your existing note audio convention (public/audio/notes/*.wav)
function playNoteAudio(noteName: string) {
  const safeName = noteName.replace("#", "%23");
  const audio = new Audio(`/audio/notes/${safeName}.wav`);
  audio.currentTime = 0;
  audio.play().catch(() => {});
  return audio;
}

type Status = "IDLE" | "PLAYING" | "PAUSED" | "FINISHED";

export default function Step1AutoPlayer({
  timeline,
  renderKeyboard,
}: {
  timeline: TimelineEvent[];
  renderKeyboard: (props: {
    highlightedKeys: string[]; // canonical keys (sharps)
    activeKey: string | null; // canonical key (sharps)
    labelMapOverride: Record<string, string>; // label layer override
    headerRight: React.ReactNode; // NEW: text that should appear next to the keyboard title
  }) => React.ReactNode;
}) {
  const [status, setStatus] = useState<Status>("IDLE");
  const [i, setI] = useState(0);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ev = timeline[i] ?? null;

  const highlightedKeys = useMemo(() => (ev ? ev.chord : []), [ev]);
  const activeKey = ev?.kind === "NOTE" ? ev.key ?? null : null;

  const topText = ev?.topText ?? "Set the left hand. Start in the D3 octave.";
  const passLabel = ev?.passLabel ?? "";
  const underText = ev?.kind === "NOTE" ? ev.bottomText ?? "" : "";

  const labelMapOverride = useMemo(() => {
    // Keep this simple and explicit for Cycling Descent:
    // - audio/highlight stays sharps
    // - labels show B♭ and ♯ glyph
    // The keyboard will only use this for drawing labels, not audio.
    return {
      "A#2": "B♭",
      "A#3": "B♭",
      "A#4": "B♭",
      "A#5": "B♭",
      "C#2": "C♯",
      "C#3": "C♯",
      "C#4": "C♯",
      "C#5": "C♯",
    };
  }, []);

  const headerRight = useMemo(() => {
    // Keep it compact, one line when possible.
    // Example: "Fingering is 4–2–1 · Pass 3"
    return (
      <span>
        {topText}
        {passLabel ? <span className="opacity-60"> · {passLabel}</span> : null}
      </span>
    );
  }, [topText, passLabel]);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopAudio() {
    const a = audioRef.current;
    if (a) {
      a.pause();
      audioRef.current = null;
    }
  }

  function tickFrom(index: number) {
    clearTimer();

    if (index >= timeline.length) {
      setStatus("FINISHED");
      return;
    }

    setI(index);
    const cur = timeline[index];

    // Simple pause model:
    // - stop immediately
    // - resume restarts the current event
    if (cur.kind === "NOTE" && cur.key) {
      stopAudio();
      audioRef.current = playNoteAudio(cur.key);
    }

    timerRef.current = window.setTimeout(() => {
      tickFrom(index + 1);
    }, cur.ms);
  }

  function onReplay() {
    stopAudio();
    clearTimer();
    setStatus("PLAYING");
    tickFrom(0);
  }

  function onPauseResume() {
    if (status === "PLAYING") {
      setStatus("PAUSED");
      stopAudio();
      clearTimer();
      return;
    }
    if (status === "PAUSED") {
      setStatus("PLAYING");
      tickFrom(i);
    }
  }

  useEffect(() => {
    return () => {
      stopAudio();
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fingeringLine = useMemo(() => buildFingeringLine(ev), [ev]);

  return (
    <div>
      {/* Controls stay above the keyboard; text moves into the keyboard header via headerRight */}
      <div className="mb-3 flex justify-end gap-2">
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
          Replay
        </button>
      </div>

      <div className="rounded-2xl border p-3">
        {renderKeyboard({
          highlightedKeys,
          activeKey,
          labelMapOverride,
          headerRight,
        })}
      </div>

      {/* Reserve space so layout doesn't bounce */}
<div className="mt-3 text-sm">
  <div className="min-h-[3.25rem]">
    <div className="opacity-80">{underText || "\u00A0"}</div>
    <div className="mt-1 opacity-70">{fingeringLine || "\u00A0"}</div>
  </div>
</div>

<div className="mt-4 text-xs opacity-70">
  {status === "IDLE" && "Press Replay to start Step 1."}
  {status === "PLAYING" && "Guided induction is running."}
  {status === "PAUSED" && "Paused."}
  {status === "FINISHED" && "Step 1 finished. Close the page. Play."}
</div>
    </div>
  );
}

function buildFingeringLine(ev: TimelineEvent | null): string {
  if (!ev) return "";

  const top = (ev.topText ?? "").toLowerCase();
const key = `${ev.chord[0]}-${ev.chord[1]}-${ev.chord[2]}`;

// Show fingering when:
// - the timeline explicitly says "fingering", OR
// - we're in the AC♯E section (always show), OR
// - we're in the loop-back DFA section ("Loop to …")
const wants =
  top.includes("fingering") ||
  key === "A2-C#3-E3" ||
  top.includes("loop to");

if (!wants) return "";

  const [b, m, t] = ev.chord; // canonical keys
  const [bl, ml, tl] = ev.chordLabels; // label layer

  

  const fing =
    key === "D3-F3-A3"
      ? ["4", "2", "1"]
      : key === "C3-E3-A3"
      ? ["5", "3", "1"]
      : key === "A#2-D3-F3"
      ? ["4", "2", "1"]
      : key === "A2-C3-F3"
      ? ["5", "3", "1"]
      : key === "A2-C3-E3"
      ? ["5", "3", "1"]
      : key === "A2-C#3-E3"
      ? ["5", "3", "1"]
      : null;

  if (!fing) return "";

  const base = (s: string) => s.replace(/[0-9]/g, "");

return `${base(bl)} – ${fing[0]}   ${base(ml)} – ${fing[1]}   ${base(tl)} – ${fing[2]}`;
}