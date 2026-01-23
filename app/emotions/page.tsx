import type { Metadata } from "next";
import Link from "next/link";
import { EMOTIONS } from "@/lib/emotions";

export const metadata: Metadata = {
  title: "Emotions to Play on Piano (Beginner) | EmotionalChords",
  description:
    "Choose an emotion and play it on piano step by step. Two styles per emotion: Flow (smooth, familiar) and Color (expressive, cinematic). No sheet music. No music theory required.",
  alternates: { canonical: "/emotions" },
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app/emotions",
    title: "Emotions to Play on Piano (Beginner) | EmotionalChords",
    description:
      "Pick an emotion and play it on piano step by step. Two styles: Flow (smooth, familiar) and Color (expressive, cinematic). No sheet music. No music theory required.",
    images: [
      { url: "/og/emotions.jpg", width: 1200, height: 630, alt: "EmotionalChords — Emotions" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotions to Play on Piano (Beginner) | EmotionalChords",
    description:
      "Pick an emotion and play it step by step in Flow (smooth) and Color (cinematic) styles.",
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
    Each emotion has two styles: <strong>Flow</strong> (smooth, familiar) and{" "}
    <strong>Color</strong> (expressive, cinematic). Start with Step 1.
  </p>

  {/* =========================
      AI + Human Quick Answer
  ========================= */}
  <div className="mt-5 max-w-2xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
    <p className="text-sm leading-relaxed text-neutral-800">
      <strong>EmotionalChords is a beginner-friendly piano practice tool.</strong>{" "}
      Pick a feeling, hear it, then play it step by step —{" "}
      <strong>no sheet music</strong> and <strong>no music theory required</strong>.
    </p>
    <p className="mt-2 text-xs text-neutral-600">
      Good for questions like: “How do I play sadness on piano?” or “What chords
      sound calm?”
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
        name: "Emotions to Play on Piano (Beginner)",
        url: "https://emotionalchords.app/emotions",
        isPartOf: {
          "@type": "WebSite",
          name: "EmotionalChords",
          url: "https://emotionalchords.app",
        },
        description:
          "A collection of beginner-friendly emotion practice pages for piano. Each emotion includes two styles: Flow (smooth, familiar) and Color (expressive, cinematic). No sheet music. No music theory required.",
        educationalLevel: "Beginner",
        teaches: ["Play emotions on piano", "Emotional piano chords", "Flow and Color styles"],
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
                  {e.label}
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
              Practice {e.label} <span className="opacity-60">→</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              Start with Step 1 (smooth), then Step 2 (feeling). Step 3 (lift the emotion) is optional and can be combined with Step 2 only if you feel ready.
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}