// app/emotions/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { EMOTIONS } from "@/lib/emotions";

export const metadata: Metadata = {
  title: "Motion (Emotion) — Emotions to Play on Piano (Beginner) | EmotionalChords",
  description:
    "Choose a motion (emotion) and play it on piano step by step. Two paths per motion: Flow (coherent, readable motion) and Color (faster re-alignment). No sheet music. No music theory required.",
  alternates: { canonical: "/emotions" },
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app/emotions",
    title:
      "Motion (Emotion) — Emotions to Play on Piano (Beginner) | EmotionalChords",
    description:
      "Pick a motion (emotion) and practice it step by step on piano. Two paths: Flow (coherent) and Color (re-aligned). No sheet music. No music theory required.",
    images: [
      {
        url: "/og/emotions.jpg",
        width: 1200,
        height: 630,
        alt: "EmotionalChords — Motion (Emotion)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Motion (Emotion) — Emotions to Play on Piano (Beginner) | EmotionalChords",
    description:
      "Pick a motion (emotion) and practice it step by step in Flow (coherent) and Color (re-aligned) paths.",
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
          Choose a motion
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Motion (Emotion)
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-neutral-700">
          Each motion is paired with an emotion label in parentheses. Enter it
          in two paths: <strong>Flow</strong> (coherent, readable motion) and{" "}
          <strong>Color</strong> (faster re-alignment). Start with Step 1.
        </p>

        {/* =========================
            AI + Human Quick Answer
        ========================= */}
        <div className="mt-5 max-w-2xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm leading-relaxed text-neutral-800">
            <strong>EmotionalChords is a beginner-friendly piano practice tool.</strong>{" "}
            Pick a motion, hear it, then practice it step by step —{" "}
            <strong>no sheet music</strong> and{" "}
            <strong>no music theory required</strong>.
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Good for questions like: “Why do these chords feel tense?” or “What
            motion creates calm?”
          </p>
        </div>

        {/* =========================
            JSON-LD for AI engines
        ========================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["CollectionPage", "LearningResource"],
              name: "Motion (Emotion) — Emotions to Play on Piano (Beginner)",
              url: "https://emotionalchords.app/emotions",
              isPartOf: {
                "@type": "WebSite",
                name: "EmotionalChords",
                url: "https://emotionalchords.app",
              },
              description:
                "A collection of beginner-friendly motion (emotion) practice pages for piano. Each motion includes two paths: Flow (coherent motion) and Color (re-aligned motion). No sheet music. No music theory required.",
              educationalLevel: "Beginner",
              teaches: [
                "Motion (Emotion) piano practice",
                "Harmonic motion and feeling",
                "Flow and Color paths",
              ],
              inLanguage: "en",
            }),
          }}
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMOTIONS.map((e) => (
          <Link
            key={e.id}
            href={`/emotions/${e.id}`}
            className="group rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-black/20 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-neutral-900">
                  <span className="mr-2">{e.emoji}</span>
                  {e.motion}{" "}
                  <span className="text-sm font-medium opacity-70">
                    ({e.emotion})
                  </span>
                </div>

                <div className="mt-1 text-xs text-neutral-600">
                  Flow:{" "}
                  <span className="font-mono">
                    {e.flow.chords
                      .join(" · ")
                      .replace(/b/g, "♭")
                      .replace(/#/g, "♯")}
                  </span>
                </div>

                <div className="mt-1 text-xs text-neutral-600">
                  Color:{" "}
                  <span className="font-mono">
                    {e.color.chords
                      .join(" · ")
                      .replace(/b/g, "♭")
                      .replace(/#/g, "♯")}
                  </span>
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

            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-neutral-800">
              Practice {e.motion} <span className="opacity-60">→</span>
            </div>

            <p className="mt-1 text-[11px] text-neutral-500">
              Start with Step 1 (smooth), then Step 2 (feeling). Step 3 (lift it
              higher) is optional.
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}