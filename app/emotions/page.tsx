// app/emotions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { EMOTIONS, type EmotionId } from "@/lib/emotions";

const EMOTION_META: Record<
  EmotionId,
  {
    motion: string;
    focus: string;
  }
> = {
  calm: {
    motion: "Settled Circulation",
    focus: "keep it flowing",
  },
  playful: {
    motion: "Light Return",
    focus: "bounce and come back",
  },
  magic: {
    motion: "Guided Departure",
    focus: "change the frame, then let it glow",
  },
  sadness: {
    motion: "Unresolved Descent",
    focus: "move away and don’t recover",
  },
  mystery: {
    motion: "Obscured Orientation",
    focus: "hide the explanation",
  },
  melancholy: {
    motion: "Altered Return",
    focus: "come back, but changed",
  },
  wonder: {
    motion: "Upward Opening",
    focus: "make space bigger",
  },
  tension: {
    motion: "Held Pressure",
    focus: "squeeze without release",
  },
  anger: {
    motion: "Grinding Advance",
    focus: "push through",
  },
  fear: {
    motion: "Loss of Ground",
    focus: "remove support",
  },
};

export const metadata: Metadata = {
  title: "Emotions to Play on Piano (Beginner) | EmotionalChords",
  description:
    "Explore emotional piano chord progressions for calm, sadness, tension, mystery, wonder, and more. Each emotion includes playable chord progressions, motion description, and guided practice.",
  alternates: { canonical: "/emotions" },
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app/emotions",
    title: "Emotions to Play on Piano (Beginner) | EmotionalChords",
    description:
      "Pick an emotion and practice it step by step on piano. Each emotion includes playable chord progressions, motion logic, and guided practice.",
    images: [
      {
        url: "/og/emotions.jpg",
        width: 1200,
        height: 630,
        alt: "EmotionalChords — Emotions to Play on Piano",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotions to Play on Piano (Beginner) | EmotionalChords",
    description:
      "Pick an emotion and practice it step by step on piano using playable chord progressions.",
    images: ["/og/emotions.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function EmotionsHubPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Choose an emotion
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Emotions
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-neutral-700">
          Explore emotional piano chord progressions for calm, sadness, tension,
          mystery, wonder, and more. Each emotion has a motion shape underneath
          it — and a guided playbook to help you hear it and play it clearly.
        </p>

        <div className="mt-5 max-w-2xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm leading-relaxed text-neutral-800">
            <strong>EmotionalChords is a beginner-friendly piano practice tool.</strong>{" "}
            Pick an emotion, hear it, then practice it step by step —{" "}
            <strong>no sheet music</strong> and{" "}
            <strong>no music theory required</strong>.
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Good for questions like: “What chord progression sounds sad?” or
            “How do I play calm on piano?”
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["CollectionPage", "LearningResource"],
              name: "Emotions to Play on Piano (Beginner)",
              url: "https://emotionalchords.app/emotions",
              isPartOf: {
                "@type": "WebSite",
                name: "EmotionalChords",
                url: "https://emotionalchords.app",
              },
              description:
                "A collection of beginner-friendly emotion pages for piano. Each emotion includes playable chord progressions, motion description, and guided practice. No sheet music. No music theory required.",
              educationalLevel: "Beginner",
              teaches: [
                "Emotional piano chord progressions",
                "How chords create feeling",
                "Emotion-first piano practice",
              ],
              inLanguage: "en",
            }),
          }}
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMOTIONS.map((e) => {
          const meta = EMOTION_META[e.id];

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
              className="group flex flex-col rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-black/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-neutral-900">
                    <span className="mr-2">{e.emoji}</span>
                    {e.label}
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      Playable chord progressions
                    </div>

                    <div className="mt-2 text-xs text-neutral-700">
                      {flowProgression}
                    </div>
                    <div className="mt-1 text-xs text-neutral-700">
                      {colorProgression}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-neutral-600">
                    Motion: {meta.motion}
                  </div>

                  <div className="mt-1 text-xs text-neutral-600">
                    Focus while playing: {meta.focus}
                  </div>
                </div>

                <div
                  className="h-10 w-10 shrink-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${e.palette.gradientTop}, ${e.palette.gradientBottom})`,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                  aria-hidden="true"
                />
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800">
                Open {e.label} playbook <span className="opacity-60">→</span>
              </div>

              <p className="mt-1 text-[11px] text-neutral-500">
                Start with Step 1, then move into feeling, rhythm, and lift.
              </p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}