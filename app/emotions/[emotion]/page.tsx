// app/emotions/[emotion]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EmotionPracticeBoard from "@/components/emotions/EmotionPracticeBoard";
import { EMOTION_BY_ID, type EmotionId } from "@/lib/emotions";

type Params = { emotion: string };

function emotionHowToJsonLd(e: { id: string; label: string }) {
  return {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "HowTo"],
    name: `How to play ${e.label} on piano (beginner)`,
    url: `https://emotionalchords.app/emotions/${e.id}`,
    isPartOf: {
      "@type": "WebSite",
      name: "EmotionalChords",
      url: "https://emotionalchords.app",
    },
    description:
      `Beginner-friendly steps to play ${e.label.toLowerCase()} on piano. ` +
      "Two styles: Flow (smooth, familiar) and Color (expressive, cinematic). " +
      "No sheet music. No music theory required.",
    educationalLevel: "Beginner",
    inLanguage: "en",
    supply: [{ "@type": "HowToSupply", name: "Piano or keyboard" }],
    tool: [
      { "@type": "HowToTool", name: "EmotionalChords interactive practice" },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Step 1 — Smooth chords",
        text:
          "Play comfortable chord shapes slowly. Keep your hands relaxed and focus on a clean, even sound.",
      },
      {
        "@type": "HowToStep",
        name: "Step 2 — Play with feeling",
        text:
          "Add rhythm and touch. Repeat the same chords with a simple pattern to make the emotion feel real.",
      },
      {
        "@type": "HowToStep",
        name: "Step 3 — Lift the emotion",
        text:
          "Play the same idea higher on the keyboard to lift the feeling (brighter, lighter, or more intense).",
      },
    ],
  };
}

// Next 16 (Turbopack) may treat params as a Promise → await it
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { emotion } = await params;
  const id = emotion as EmotionId;
  const e = EMOTION_BY_ID[id];
  if (!e) return {};

  const title = `${e.label} Piano Chords (Beginner) | EmotionalChords`;
  const description = `Learn how to play ${e.label.toLowerCase()} on piano step by step. Two styles: Flow (smooth, familiar) and Color (expressive, cinematic). No sheet music. No music theory required.`;

  return {
    title,
    description,
    alternates: { canonical: `/emotions/${e.id}` },
    openGraph: {
      type: "article",
      url: `https://emotionalchords.app/emotions/${e.id}`,
      title,
      description,
      images: [
        {
          url: "/og/emotionalchords.jpg",
          width: 1200,
          height: 630,
          alt: `EmotionalChords — ${e.label}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/emotionalchords.jpg"],
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
}

export default async function EmotionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { emotion } = await params;
  const id = emotion as EmotionId;

  const e = EMOTION_BY_ID[id];
  if (!e) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Emotion recipe
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {e.emoji} {e.label}
        </h1>

        <p className="mt-2 text-sm text-neutral-700">
          Two ways to play the same feeling: <strong>Flow</strong> (smooth,
          familiar) and <strong>Color</strong> (expressive, cinematic). You’ll
          practice it in three steps: <strong>smooth chords</strong>,{" "}
          <strong>play with feeling</strong> (rhythm + touch), and{" "}
          <strong>lift it higher</strong>.
        </p>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm leading-relaxed text-neutral-800">
            <strong>
              How to play {e.label.toLowerCase()} on piano (beginner):
            </strong>{" "}
            start with <strong>smooth chords</strong>, then repeat them with a
            simple <strong>rhythm</strong>, and finally{" "}
            <strong>lift the emotion</strong> by playing the same idea higher on
            the keyboard.
          </p>

          <ul className="mt-2 space-y-1 text-xs text-neutral-700">
            <li>✅ No sheet music</li>
            <li>✅ No music theory required</li>
            <li>✅ Two styles: Flow (smooth) and Color (cinematic)</li>
          </ul>
        </div>

        {/* JSON-LD for AI engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(emotionHowToJsonLd(e)),
          }}
        />
      </header>

      <EmotionPracticeBoard emotion={e} />

      <p className="mt-8 text-xs text-neutral-500">
        Next: Step 2 (play with feeling) and Step 3 (lift it higher).
      </p>
    </main>
  );
}