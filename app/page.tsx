// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

import HomeDemoPlayer from "@/components/home/HomeDemoPlayer";
import { EMOTIONS, type EmotionId, type EmotionMeta } from "@/lib/emotions";

export default function HomePage() {
  const [activeEmotionId, setActiveEmotionId] = useState<EmotionId>("sadness");
  const [playToken, setPlayToken] = useState(0);

  const activeEmotion =
    EMOTIONS.find((e) => e.id === activeEmotionId) ?? EMOTIONS[0];

  const onPickEmotion = (id: EmotionId) => {
    setActiveEmotionId(id);
    setPlayToken((t) => t + 1); // force replay even if same emotion
  };

  return (
    <main className="min-h-screen bg-[#faf7f3] text-[#1c1c1c]">
      {/* =========================
          HERO
      ========================= */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:pt-16 sm:pb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111] sm:text-4xl">
  Play{" "}
  <span className="bg-gradient-to-r from-[#87a8ff] via-[#c68bfe] to-[#ff80b5] bg-clip-text text-transparent">
    emotion
  </span>{" "}
  on piano ✨
</h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-700">
            Tap an emotion. Hear it once.
            <br />
            Then play it step by step — in under 10 minutes.
          </p>
        </div>
      </section>

      {/* =========================
          DEMO BLOCK
      ========================= */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Demo
          </p>

          <p className="mt-2 max-w-xl text-sm text-neutral-700">
            Each emotion can be played in two styles:
            <br />
            <strong>Flow</strong> (smooth, familiar) and{" "}
            <strong>Color</strong> (sharper, expressive).
          </p>

          {/* Demo player */}
          <div className="mt-6">
            <HomeDemoPlayer
              emotion={activeEmotion}
              playToken={playToken}
            />
          </div>

          {/* Emotion picker */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Pick an emotion
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {EMOTIONS.map((e) => {
                const active = e.id === activeEmotionId;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onPickEmotion(e.id)}
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition",
                      active
                        ? "bg-black text-white"
                        : "bg-white text-neutral-700 ring-1 ring-black/10 hover:ring-black/30",
                    ].join(" ")}
                  >
                    <span>{e.emoji}</span>
                    <span>{e.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <Link
              href={`/emotions/${activeEmotion.id}`}
              className="inline-flex items-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Play {activeEmotion.label} step by step →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          EMOTION EXPLORER
      ========================= */}
      <section className="border-t border-black/10 bg-[#faf7f3]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-lg font-semibold tracking-tight">
            Explore all emotions
          </h2>

          <p className="mt-2 max-w-xl text-sm text-neutral-700">
            Each emotion has two styles (Flow + Color) and a guided practice
            session to master each — and then both together.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EMOTIONS.map((e) => (
              <Link
                key={e.id}
                href={`/emotions/${e.id}`}
                className="group flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10 hover:shadow-md hover:ring-black/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">
                    {e.emoji} {e.label}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-[2px] text-[10px] text-neutral-700">
                    Flow · Color · Feeling
                  </span>
                </div>

                <p className="mt-2 text-xs text-neutral-600">
                  A clear, step-by-step way to make this feeling appear on your
                  piano.
                </p>

                <span className="mt-3 text-[11px] font-medium text-neutral-700 group-hover:underline">
                  Play {e.label} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          LEARN TEASER
      ========================= */}
      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-lg font-semibold tracking-tight">
            Want to understand why it works?
          </h2>

          <p className="mt-2 max-w-xl text-sm text-neutral-700">
            After you’ve played a few emotions, explore the ideas behind them —
            without heavy theory language.
          </p>

          <ul className="mt-4 space-y-2 text-sm">
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

          <p className="mt-6 text-xs text-neutral-500">
            Emotions first. Theory later.
          </p>
        </div>
      </section>
    </main>
  );
}