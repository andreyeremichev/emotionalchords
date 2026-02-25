"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import KeyboardPlaybook from "@/components/playbooks/KeyboardPlaybook";
import { buildStep2Timeline, type Step2Event } from "./step2Timeline";

function playNoteAudio(noteName: string) {
  const safeName = noteName.replace("#", "%23");
  const audio = new Audio(`/audio/notes/${safeName}.wav`);
  audio.currentTime = 0;
  audio.play().catch(() => {});
  return audio;
}

type Status = "IDLE" | "PLAYING" | "PAUSED" | "FINISHED";

function FormulaLine({ active }: { active: string | null }) {
  const seg = (id: string, text: string, arrow = true) => {
    const isOn = active === id;
    return (
      <span
        key={id}
        className={["transition", isOn ? "font-semibold opacity-100" : "opacity-60"].join(" ")}
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
      {seg("ACsE", "AC♯E ×10", false)}
    </div>
  );
}

export default function Step2AutoPlayer() {
  const events = useMemo(() => buildStep2Timeline(), []);
  const [status, setStatus] = useState<Status>("IDLE");
  const [i, setI] = useState(0);

  const timerRef = useRef<number | null>(null);
  const audiosRef = useRef<HTMLAudioElement[]>([]);
  const statusRef = useRef<Status>("IDLE");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const ev: Step2Event | null = events[i] ?? null;

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

  function tickFrom(index: number) {
    clearTimer();

    if (index >= events.length) {
      stopAudios();
      setStatus("FINISHED");
      return;
    }

    setI(index);
    const cur = events[index];

    stopAudios();

    if (cur.kind === "NOTE") {
      const keysToPlay: string[] = [];
      if (cur.lhKey) keysToPlay.push(cur.lhKey);
      if (cur.rhKeys.length) keysToPlay.push(...cur.rhKeys);

      if (keysToPlay.length) {
        audiosRef.current = keysToPlay.map((k) => playNoteAudio(k));
      }
    }

    timerRef.current = window.setTimeout(() => {
      if (statusRef.current === "PLAYING") tickFrom(index + 1);
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
      tickFrom(i); // simplest: restart current event
    }
  }

  useEffect(() => {
    return () => {
      stopAudios();
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChordId = ev ? ev.chordId : null;

  // IMPORTANT: highlight == played (no misleading highlights)
  const lhNow = ev?.kind === "NOTE" && ev.lhKey ? [ev.lhKey] : [];
  const rhNow = ev?.kind === "NOTE" ? ev.rhKeys : [];

  const labelMapOverride = useMemo(
    () => ({
      "A#2": "B♭",
      "A#3": "B♭",
      "A#4": "B♭",
      "A#5": "B♭",
      "C#2": "C♯",
      "C#3": "C♯",
      "C#4": "C♯",
      "C#5": "C♯",
    }),
    []
  );

  const headerRight = (
    <span>{ev ? ev.ruleText : "Now the right hand."}</span>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <FormulaLine active={activeChordId} />

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
            Replay
          </button>
        </div>
      </div>

      <KeyboardPlaybook
        activeChordSymbol={null}
        emotion={{
          gradientTop: "#2b2f36",
          gradientBottom: "#0f1115",
          trailColor: "#8fa3bf",
        }}
        emotionLabel="Cycling Descent"
        hideHeaderTitle
        headerRight={headerRight}
        // Primary = RH (labels allowed) ONLY when RH is actually played
        highlightNotesPrimary={rhNow}
        // Secondary = LH note ONLY when LH is actually played
        highlightNotesSecondary={lhNow}
        highlightColorSecondary="rgba(0,0,0,0.22)"
        noteLabelMapOverride={labelMapOverride}
      />
    </div>
  );
}