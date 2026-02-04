// app/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import HomeDemoPlayer from "@/components/home/HomeDemoPlayer";
import { EMOTIONS, type EmotionId } from "@/lib/emotions";

type RitualId = "HELD_PRESSURE" | "MOVING_RETURN" | "OBSCURED_ORIENTATION";

type Ritual = {
  id: RitualId;
  label: string;
  shortLabel: string;
  emotionId: EmotionId;
  hint: string;
  exploreLines: [string, string, string, string];
  path: "flow" | "color";
  repeatsPerChord: number;
};

// --- Locked ritual trio (reuse existing motions; no emotion names shown) ---
const RITUALS: Ritual[] = [
  {
    id: "HELD_PRESSURE",
    label: "Held Pressure",
    shortLabel: "Pressure",
    emotionId: "tension",
    hint: "Stay. Don’t fix it.",
    exploreLines: [
      "Establishes an apparently stable ground.",
      "Tightens inward, reducing available space.",
      "Breaks structural balance, compressing motion.",
      "Pushes upward while refusing release, keeping pressure active.",
    ],
    path: "color" as const,
    repeatsPerChord: 4,
  },
  {
    id: "MOVING_RETURN",
    label: "Altered Return",
    shortLabel: "Return",
    emotionId: "melancholy",
    hint: "Leave lightly. Always return.",
    exploreLines: [
       "Establishes an inward-facing reference.",
    "Turns inward further, slowing and thickening motion.",
    "Revisits the center, now carrying accumulated change.",
    "Introduces contrast that alters the return without breaking it.",
    ],
    path: "flow" as const,
    repeatsPerChord: 3,
  },
  {
    id: "OBSCURED_ORIENTATION",
    label: "Obscured Orientation",
    shortLabel: "Obscured",
    emotionId: "mystery",
    hint: "Let orientation blur.",
    exploreLines: [
      "Establishes a guarded but readable reference.",
      "Moves upward into unfamiliar alignment.",
      "Removes positional clarity, suspending orientation.",
      "Re-enters the frame unexpectedly, without explaining what happened.",
    ],
    path: "color" as const,
    repeatsPerChord: 4,
  },
];

// --- Motion (Emotion) labels for the free map cards (all 10) ---
const MOTION_LABEL: Record<EmotionId, { motion: string; emotion: string }> = {
  calm: { motion: "Settled Circulation", emotion: "Calm / Peace" },
  playful: { motion: "Light Return", emotion: "Playful" },
  magic: { motion: "Guided Departure", emotion: "Magic / Fantasy" },
  sadness: { motion: "Unresolved Descent", emotion: "Sadness" },
  mystery: { motion: "Obscured Orientation", emotion: "Mystery" },
  melancholy: { motion: "Altered Return", emotion: "Melancholy" },
  wonder: { motion: "Upward Opening", emotion: "Wonder" },
  tension: { motion: "Held Pressure", emotion: "Tension / Suspense" },
  anger: { motion: "Grinding Advance", emotion: "Anger" },
  fear: { motion: "Loss of Ground", emotion: "Fear / Horror" },
};

export default function HomePage() {
  const [activeRitualId, setActiveRitualId] =
    useState<RitualId>("HELD_PRESSURE");
  const [playToken, setPlayToken] = useState(0);

  const [exploreOpen, setExploreOpen] = useState(false);
const [activeBaseStep, setActiveBaseStep] = useState<number | null>(null);

  const activeRitual = useMemo(
    () => RITUALS.find((r) => r.id === activeRitualId) ?? RITUALS[0],
    [activeRitualId]
  );

  const activeEmotion =
    EMOTIONS.find((e) => e.id === activeRitual.emotionId) ?? EMOTIONS[0];

  const onPickRitual = (id: RitualId) => {
  setActiveRitualId(id);
  setExploreOpen(false);
  setActiveBaseStep(null);
  setPlayToken((t) => t + 1);
};

  return (
    <div className="bg-[#faf7f3] text-[#1c1c1c] overflow-x-hidden">
      

      {/* =========================
          HERO + RITUAL
      ========================= */}
      <section className="mx-auto max-w-5xl px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111] sm:text-4xl">
            Choose a{" "}
            <span className="bg-gradient-to-r from-[#87a8ff] via-[#c68bfe] to-[#ff80b5] bg-clip-text text-transparent">
              motion
            </span>
            . Stay with it.
          </h1>

          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-700">
            You don’t aim for a feeling.
            <br />
            You choose how harmony moves — and stay until something emerges.
          </p>
        </div>

        {/* Ritual pills */}
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Start with a motion
          </p>

          {/* One-line pills row (scrolls horizontally if needed) */}
          <div className="mt-2 flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pb-1">
            {RITUALS.map((r) => {
              const active = r.id === activeRitualId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onPickRitual(r.id)}
                  className={[
                    "inline-flex items-center rounded-full px-4 py-2 text-sm transition shrink-0",
                    active
                      ? "bg-black text-white"
                      : "bg-white text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                  ].join(" ")}
                >
                  <span className="font-semibold sm:hidden">{r.shortLabel}</span>
                  <span className="font-semibold hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Full motion label (always shown above keyboard) */}
          <div className="mt-3 text-sm font-semibold text-neutral-900">
            {activeRitual.label}
          </div>

          {/* Keyboard / playback (immediately below pills) */}
          <div className="mt-2 rounded-2xl border border-black/10 bg-white p-4">
            {exploreOpen && (
  <div className="mb-3 text-sm text-neutral-900">
    {activeRitual.exploreLines[(activeBaseStep ?? 0) as 0 | 1 | 2 | 3]}
  </div>
)}
           <HomeDemoPlayer
  emotion={activeEmotion}
  playToken={playToken}
  path={activeRitual.path}
  repeatsPerChord={activeRitual.repeatsPerChord}
  onBaseStepChange={setActiveBaseStep}
/>

            {/* Hint + Explore under keyboard */}
            <div className="mt-3 text-sm text-neutral-700">
              {activeRitual.hint}
            </div>

            <div className="mt-1 text-sm">
  <button
    type="button"
    onClick={() => setExploreOpen((v) => !v)}
    className="text-neutral-700 underline underline-offset-2 opacity-80 hover:opacity-100"
  >
    {exploreOpen ? "Hide motion detail" : "Show motion detail"}
  </button>
</div>
          </div>
        </div>
      </section>

      {/* =========================
          MOTION MAP (free playbooks)
      ========================= */}
      <section className="border-t border-black/10 bg-[#faf7f3]">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-8">
          <h2 className="text-lg font-semibold tracking-tight">
            Explore the motion map
          </h2>

          <p className="mt-2 max-w-xl text-sm text-neutral-700">
            Each motion can be entered in two paths: <strong>Flow</strong>{" "}
            (coherent, readable motion) and <strong>Color</strong> (faster
            re-alignment).
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EMOTIONS.map((e) => {
              const m = MOTION_LABEL[e.id];
              return (
                <Link
                  key={e.id}
                  href={`/emotions/${e.id}`}
                  className="group flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10 hover:shadow-md hover:ring-black/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold">
                      {m.motion}
                      <span className="ml-2 text-xs font-medium opacity-70">
                        ({m.emotion})
                      </span>
                    </span>

                    <span className="rounded-full bg-neutral-100 px-2 py-[2px] text-[10px] text-neutral-700">
                      Flow · Color · Guided Practice
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-neutral-600">
                    A clear way to enter and explore this motion at the piano.
                  </p>

                  <span className="mt-3 text-[11px] font-medium text-neutral-700 group-hover:underline">
                    Open playbook →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================
          LEARN TEASER
      ========================= */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-8">
          <h2 className="text-lg font-semibold tracking-tight">
            Want to understand why it works?
          </h2>

          <p className="mt-2 max-w-xl text-sm text-neutral-700">
            Explore Flow vs Color — without heavy theory language.
          </p>

          <ul className="mt-3 space-y-2 text-sm">
            <li>
              🧭{" "}
              <Link
                href="/learn/paths-of-harmony"
                className="underline underline-offset-2 hover:text-black"
              >
                Paths of Harmony
              </Link>{" "}
              — Flow vs Color
            </li>
          </ul>

          <p className="mt-4 text-xs text-neutral-500">
            Motion first. Labels later.
          </p>
        </div>
      </section>

      <div className="h-20" aria-hidden="true" />
    </div>
  );
}