// app/emotions/[emotion]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EmotionPracticeBoard from "@/components/emotions/EmotionPracticeBoard";
import { EMOTION_BY_ID, type EmotionId } from "@/lib/emotions";
import Link from "next/link";
type Params = { emotion: string };

const EMOTION_META: Record<

  EmotionId,
  {
    motion: string;
    focus: string;
    pedal: string;
  }
> = {
  calm: {
    motion: "Settled Circulation",
    focus: "keep it flowing",
    pedal: "Flow = light half-pedal with tiny carry; Color = lighter, cleaner, no real blur.",
  },
  playful: {
    motion: "Light Return",
    focus: "bounce and come back",
    pedal: "Dry, or only a tiny touch on beat 1 if the piano is very dry.",
  },
  magic: {
    motion: "Guided Departure",
    focus: "change the frame, then let it glow",
    pedal: "Flow = half-pedal each bar, slightly deeper on bar 4; Color = cleaner on bars 1–3, deeper on bar 4.",
  },
  sadness: {
    motion: "Unresolved Descent",
    focus: "move away and don’t recover",
    pedal: "Shallow half-pedal; release during beat 4.",
  },
  mystery: {
    motion: "Obscured Orientation",
    focus: "hide the explanation",
    pedal: "Mid half-pedal with slightly late changes; a little deeper on chord 3; in Color, chord 4 slightly cleaner than chord 3.",
  },
  melancholy: {
    motion: "Altered Return",
    focus: "come back, but changed",
    pedal: "Light-to-mid half-pedal with slight barline carry; deepest on the loop’s 4th chord.",
  },
  wonder: {
    motion: "Upward Opening",
    focus: "make space bigger",
    pedal: "Half-pedal per bar with clean after-attack changes; slightly more bloom on Flow chord 4, slightly cleaner on Color chord 4.",
  },
  tension: {
    motion: "Held Pressure",
    focus: "squeeze without release",
    pedal: "Shallow half-pedal; catch after 1; refresh on 3; change just after next beat 1.",
  },
  anger: {
    motion: "Grinding Advance",
    focus: "push through",
    pedal: "Dry.",
  },
  fear: {
    motion: "Loss of Ground",
    focus: "remove support",
    pedal: "Dry.",
  },
};
const SEARCH_LABEL: Record<EmotionId, string> = {
  calm: "calm piano chords",
  playful: "playful piano chords",
  magic: "magical piano chords",
  sadness: "sad piano chords",
  mystery: "mysterious piano chords",
  melancholy: "melancholic piano chords",
  wonder: "cinematic piano chords",
  tension: "tense piano chords",
  anger: "aggressive piano chords",
  fear: "dark piano chords",
};
function emotionHowToJsonLd(e: {
  id: string;
  label: string;
  motion: string;
}) {
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
      `Motion description: ${e.motion}. ` +
      "Two paths: Flow and Color. No sheet music. No music theory required.",
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
          "Play comfortable chord shapes slowly. Keep your hands relaxed and focus on an even sound.",
      },
      {
        "@type": "HowToStep",
        name: "Step 2 — Play with feeling",
        text:
          "Repeat the same chords with simple rhythm and touch so the emotion becomes clear.",
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

  const meta = EMOTION_META[id];

  const TITLE_LABEL: Record<EmotionId, string> = {
  calm: "Calm Piano Chords & Progressions",
  playful: "Playful Piano Chords & Progressions",
  magic: "Magical Piano Chords & Progressions",
  sadness: "Sad Piano Chords & Progressions",
  mystery: "Mysterious Piano Chords & Progressions",
  melancholy: "Melancholic Piano Chords & Progressions",
  wonder: "Cinematic Piano Chords & Progressions",
  tension: "Tense Piano Chords & Progressions",
  anger: "Aggressive Piano Chords & Progressions",
  fear: "Dark Piano Chords & Progressions",
};

const DESCRIPTION_LABEL: Record<EmotionId, string> = {
  calm: "Play calm piano chords and chord progressions step by step.",
  playful: "Play playful piano chords and chord progressions step by step.",
  magic: "Play magical piano chords and chord progressions step by step.",
  sadness: "Play sad piano chords and chord progressions step by step.",
  mystery: "Play mysterious piano chords and chord progressions step by step.",
  melancholy: "Play melancholic piano chords and chord progressions step by step.",
  wonder: "Play cinematic piano chords and chord progressions step by step.",
  tension: "Play tense piano chords and chord progressions step by step.",
  anger: "Play aggressive piano chords and chord progressions step by step.",
  fear: "Play dark piano chords and chord progressions step by step.",
};

const title = `${TITLE_LABEL[id]} | EmotionalChords`;
const description =
  `${DESCRIPTION_LABEL[id]} ` +
  `Motion description: ${meta.motion}. ` +
  "Two paths: Flow and Color. No sheet music. No music theory required.";

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

  const meta = EMOTION_META[id];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Emotion
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {e.emoji} {e.label}
        </h1>

        <div className="mt-2 space-y-1 text-sm text-neutral-700">
  <p>
    <strong>Motion:</strong> {meta.motion}
  </p>
  
</div>

        <p className="mt-3 text-sm text-neutral-700">
          Two paths for the same emotion: <strong>Flow</strong> and{" "}
          <strong>Color</strong>. The feeling comes from how the chords move.
        </p>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
  <p className="text-sm leading-relaxed text-neutral-800">
    <strong>
      How to play {e.label.toLowerCase()} on piano:
    </strong>{" "}
    start with <strong>smooth chords</strong>, then repeat them with a
    simple <strong>rhythm</strong>.
  </p>

  <div className="mt-4 space-y-2 text-sm text-neutral-800">
    <p>
      <span className="font-semibold text-neutral-900">Focus:</span>{" "}
      {meta.focus}
    </p>
    <p>
      <span className="font-semibold text-neutral-900">Pedal:</span>{" "}
      {meta.pedal}
    </p>
  </div>
</div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              emotionHowToJsonLd({
                id: e.id,
                label: e.label,
                motion: meta.motion,
              })
            ),
          }}
        />
      </header>

            <EmotionPracticeBoard emotion={e} />

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
  <p className="text-sm leading-relaxed text-neutral-800">
    This page helps you play <strong>{SEARCH_LABEL[id]}</strong> using simple,
    repeatable <strong>chord progressions</strong>.
  </p>

  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
    The feeling comes from how the chords move, not just which chords you
    play. These progressions are designed for beginners exploring emotional
    piano playing without sheet music or heavy theory.
  </p>
</div>

      <div className="mt-4">
        <Link
          href="/learn/emotional-piano-chord-progressions"
          className="text-sm font-medium underline underline-offset-2 hover:text-black"
        >
          See all emotional chord progressions →
        </Link>
      </div>
    </main>
    
  );
}