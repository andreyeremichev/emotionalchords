// app/emotions/[emotion]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EmotionPracticeBoard from "@/components/emotions/EmotionPracticeBoard";
import { EMOTION_BY_ID, type EmotionId } from "@/lib/emotions";

type Params = { emotion: string };

function motionHowToJsonLd(e: {
  id: string;
  motion: string;
  emotion: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["LearningResource", "HowTo"],
    name: `How to play ${e.motion} (${e.emotion}) on piano (beginner)`,
    url: `https://emotionalchords.app/emotions/${e.id}`,
    isPartOf: {
      "@type": "WebSite",
      name: "EmotionalChords",
      url: "https://emotionalchords.app",
    },
    description:
      `Beginner-friendly steps to practice ${e.motion.toLowerCase()} (${e.emotion.toLowerCase()}) on piano. ` +
      "Two paths: Flow (coherent, readable motion) and Color (faster re-alignment). " +
      "No sheet music. No music theory required.",
    educationalLevel: "Beginner",
    inLanguage: "en",
    supply: [{ "@type": "HowToSupply", name: "Piano or keyboard" }],
    tool: [{ "@type": "HowToTool", name: "EmotionalChords interactive practice" }],
    step: [
      {
        "@type": "HowToStep",
        name: "Step 1 — Smooth chords",
        text:
          "Play comfortable chord shapes slowly. Keep your hands relaxed and focus on an even sound.",
      },
      {
        "@type": "HowToStep",
        name: "Step 2 — Play with feeling",
        text:
          "Repeat the same chords with a simple rhythm and touch. Stay inside the motion long enough to notice what changes.",
      },
      {
        "@type": "HowToStep",
        name: "Step 3 — Lift it higher",
        text:
          "Play the same idea higher on the keyboard to change the intensity without changing the motion.",
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

  const title = `${e.motion} (${e.emotion}) Piano Chords (Beginner) | EmotionalChords`;
  const description =
    `Practice ${e.motion.toLowerCase()} (${e.emotion.toLowerCase()}) on piano step by step. ` +
    "Two paths: Flow (coherent motion) and Color (re-aligned motion). " +
    "No sheet music. No music theory required.";

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
          alt: `EmotionalChords — ${e.motion} (${e.emotion})`,
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
          Motion (Emotion)
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {e.emoji} {e.motion}{" "}
          <span className="text-base font-medium opacity-70">({e.emotion})</span>
        </h1>

        <p className="mt-2 text-sm text-neutral-700">
          Two paths for the same motion: <strong>Flow</strong> (coherent,
          readable motion) and <strong>Color</strong> (faster re-alignment).
          Practice it in three steps: <strong>smooth chords</strong>,{" "}
          <strong>play with feeling</strong>, and <strong>lift it higher</strong>.
        </p>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm leading-relaxed text-neutral-800">
            <strong>
              How to practice {e.motion.toLowerCase()} ({e.emotion.toLowerCase()}) on piano:
            </strong>{" "}
            start with <strong>smooth chords</strong>, then repeat them with a
            simple <strong>rhythm</strong>, and finally{" "}
            <strong>lift it higher</strong> by playing the same idea higher on
            the keyboard.
          </p>

          <ul className="mt-2 space-y-1 text-xs text-neutral-700">
            <li>✅ No sheet music</li>
            <li>✅ No music theory required</li>
            <li>✅ Two paths: Flow (coherent) and Color (re-aligned)</li>
          </ul>
        </div>

        {/* JSON-LD for AI engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              motionHowToJsonLd({ id: e.id, motion: e.motion, emotion: e.emotion })
            ),
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