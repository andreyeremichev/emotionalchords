"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Step2RhythmPractice from "@/components/emotions/Step2RhythmPractice";
import { EMOTIONS, type EmotionId } from "@/lib/emotions";

type DemoPath = "flow" | "color";

const MOTION_LABEL: Record<
  EmotionId,
  { motion: string; emotion: string; focus: string }
> = {
  calm: {
    motion: "Settled Circulation",
    emotion: "Calm",
    focus: "keep it flowing",
  },
  playful: {
    motion: "Light Return",
    emotion: "Playful",
    focus: "bounce and come back",
  },
  magic: {
    motion: "Guided Departure",
    emotion: "Magic",
    focus: "change the frame, then let it glow",
  },
  sadness: {
    motion: "Unresolved Descent",
    emotion: "Sadness",
    focus: "move away and don’t recover",
  },
  mystery: {
    motion: "Obscured Orientation",
    emotion: "Mystery",
    focus: "hide the explanation",
  },
  melancholy: {
    motion: "Altered Return",
    emotion: "Melancholy",
    focus: "return, but changed",
  },
  wonder: {
    motion: "Upward Opening",
    emotion: "Wonder",
    focus: "make space bigger",
  },
  tension: {
    motion: "Held Pressure",
    emotion: "Tension",
    focus: "squeeze without release",
  },
  anger: {
    motion: "Grinding Advance",
    emotion: "Anger",
    focus: "force through",
  },
  fear: {
    motion: "Loss of Ground",
    emotion: "Fear",
    focus: "remove support",
  },
};

export default function HomePage() {
  const [activeDemoPath, setActiveDemoPath] = useState<DemoPath>("flow");
  const [playToken, setPlayToken] = useState<number | null>(null);

  const tensionEmotion =
    EMOTIONS.find((e) => e.id === "tension") ?? EMOTIONS[0];

  const tensionMeta = MOTION_LABEL[tensionEmotion.id];

  const pathSubtitle = useMemo(() => {
    return activeDemoPath === "flow"
      ? "Flow — coherent, readable pressure."
      : "Color — faster re-alignment, less stable footing.";
  }, [activeDemoPath]);

  const onPickPath = (path: DemoPath) => {
    setActiveDemoPath(path);
    setPlayToken(null);
  };

    const onPlayDemo = () => {
    setPlayToken((t) => (t === null ? 1 : t + 1));
  };

  return (
    <div className="overflow-x-hidden bg-[#faf7f3] text-[#1c1c1c]">
      {/* =========================
          HERO + FEATURED DEMO
      ========================= */}
      <section className="mx-auto max-w-5xl px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111] sm:text-4xl">
            <span className="bg-gradient-to-r from-[#87a8ff] via-[#c68bfe] to-[#ff80b5] bg-clip-text text-transparent">
              Emotional chord progressions
            </span>{" "}
            you can play on your piano in minutes
          </h1>

          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-700">
            Play emotional piano chord progressions for sadness, calm, tension,
            wonder, and more.
            <br />
            Hear the feeling, then play it step by step.
          </p>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Start with Tension progression
          </p>

          <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {tensionEmotion.emoji} {tensionEmotion.label}
                </div>
                <div className="mt-1 text-sm text-neutral-700">
                  Hear how the same emotion moves through two paths:{" "}
                  <strong>Flow</strong> and <strong>Color</strong>.
                </div>
              </div>

              <Link
                href="/emotions/tension"
                className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-black"
              >
                Open Tension playbook →
              </Link>
            </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
              {(["flow", "color"] as const).map((path) => {
                const active = path === activeDemoPath;
                return (
                  <button
                    key={path}
                    type="button"
                    onClick={() => onPickPath(path)}
                    className={[
                      "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm transition",
                      active
                        ? "bg-black text-white"
                        : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                    ].join(" ")}
                  >
                    <span className="font-semibold">
                      {path === "flow" ? "Flow" : "Color"}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onPlayDemo}
                className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                ▶ Play
              </button>
            </div>

            <div className="mt-3 text-sm text-neutral-700">
              {pathSubtitle}
            </div>

            <div className="mt-4">
              <Step2RhythmPractice
                key={activeDemoPath}
                emotionLabel={`${tensionMeta.motion} (${tensionMeta.emotion}) · ${
                  activeDemoPath === "flow" ? "Flow" : "Color"
                }`}
                emotionPalette={tensionEmotion.palette}
                chords={
                  activeDemoPath === "flow"
                    ? tensionEmotion.flow.chords
                    : tensionEmotion.color.chords
                }
                pattern="tension"
                path={activeDemoPath}
                playToken={playToken}
                hideControls
                defaultDrill="full"
                defaultSlowMode={false}
              />
            </div>

            <div className="mt-3 text-sm text-neutral-700">
              Motion: {tensionMeta.motion}
            </div>

            <div className="mt-1 text-sm text-neutral-700">
              Focus while playing: {tensionMeta.focus}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          WHAT MAKES IT FEEL EMOTIONAL
      ========================= */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-7">
          <h2 className="text-lg font-semibold tracking-tight">
            What makes piano chords feel emotional?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700">
            Emotion on piano is not something you add on top.
            <br />
            It comes from how the chords move, which notes stand out, how the
            bar unfolds, and how long the sound stays.
          </p>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-700">
            That is why the same piano can feel calm, sad, tense, mysterious, or
            open. Each emotion here is a playable chord progression with a clear
            emotional shape.
          </p>
        </div>
      </section>

      {/* =========================
          EMOTION MAP
      ========================= */}
      <section className="border-t border-black/10 bg-[#faf7f3]">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-8">
          <h2 className="text-lg font-semibold tracking-tight">
            Explore emotional piano chord progressions
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-neutral-700">
            Each emotion has its own playable chord progressions, motion logic,
            and guided practice.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EMOTIONS.map((e) => {
              const m = MOTION_LABEL[e.id];

              const flowProgression = e.flow.chords
                .join("–")
                .replace(/b/g, "♭")
                .replace(/#/g, "♯");

              const colorProgression = e.color.chords
                .join("–")
                .replace(/b/g, "♭")
                .replace(/#/g, "♯");

              return (
                <Link
                  key={e.id}
                  href={`/emotions/${e.id}`}
                  className="group flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10 hover:shadow-md hover:ring-black/20"
                >
                  <span className="text-base font-semibold">{m.emotion}</span>

                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Playable chord progressions
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-neutral-700">
  <div>
    {flowProgression} <span className="text-neutral-500">(Flow)</span>
  </div>
  <div>
    {colorProgression} <span className="text-neutral-500">(Color)</span>
  </div>
</div>
                  </div>

                  <div className="mt-3 text-xs text-neutral-600">
                    Motion: {m.motion}
                  </div>

                  <div className="mt-1 text-xs text-neutral-600">
                    Focus while playing: {m.focus}
                  </div>

                  <span className="mt-4 text-[11px] font-medium text-neutral-700 group-hover:underline">
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
            Why do some piano chords feel emotional?
          </h2>

          <p className="mt-2 max-w-xl text-sm text-neutral-700">
            Explore how chord movement creates feeling — without heavy theory.
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

          <div className="mt-6 border-t border-black/10 pt-6">
            <h2 className="text-lg font-semibold tracking-tight">
              Want to go deeper?
            </h2>

            <p className="mt-2 max-w-xl text-sm text-neutral-700">
              Explore the piano playbooks for emotional chord progressions and
              hypnotic loops.
            </p>

            <div className="mt-3">
              <Link
                href="/playbooks"
                className="text-sm font-medium underline underline-offset-2 hover:text-black"
              >
                Explore piano playbooks →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-20" aria-hidden="true" />
    </div>
  );
}