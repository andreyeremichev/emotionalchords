// app/emotions/[emotion]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EmotionPracticeBoard from "@/components/emotions/EmotionPracticeBoard";
import { EMOTION_BY_ID, type EmotionId } from "@/lib/emotions";

type Params = { emotion: string };

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

  const title = `${e.label} – Two chord recipes (Flow & Color) • EmotionalChords`;
  const description = `Practice ${e.label} with two chord recipes: Flow (familiar) and Color (surprising). Step-by-step, beginner-friendly.`;

  return {
    title,
    description,
    alternates: { canonical: `/emotions/${e.id}` },
    openGraph: {
      type: "article",
      url: `https://emotionalchords.app/emotions/${e.id}`,
      title,
      description,
      images: ["/og/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/og-image.png"],
    },
    robots: { index: true, follow: true },
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
          Two ways to play the same feeling: <strong>Flow</strong> (familiar) and{" "}
          <strong>Color</strong> (surprising). Start with root-position chords.
          Smooth shapes and rhythm come next.
        </p>
      </header>

      {/* Two-tier mobile-first practice board (client component) */}
      <EmotionPracticeBoard emotion={e} />

      <p className="mt-8 text-xs text-neutral-500">
        Next: Step 2 (smooth shapes) and Step 3 (play with feeling).
      </p>
    </main>
  );
}