import type { Metadata } from "next";
import Link from "next/link";
import { EMOTIONS } from "@/lib/emotions";

export const metadata: Metadata = {
  title: "Emotions • EmotionalChords",
  description:
    "Pick an emotion and practice two chord recipes: Flow (familiar) and Color (surprising). Step-by-step, beginner-friendly.",
  alternates: { canonical: "/emotions" },
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app/emotions",
    title: "Emotions • EmotionalChords",
    description:
      "Pick an emotion and practice two chord recipes: Flow and Color. Step-by-step, beginner-friendly.",
    images: ["/og/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotions • EmotionalChords",
    description:
      "Pick an emotion and practice two chord recipes: Flow and Color.",
    images: ["/og/og-image.png"],
  },
  robots: { index: true, follow: true },
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
          Each emotion has two chord recipes: <strong>Flow</strong> (familiar)
          and <strong>Color</strong> (surprising). Start with Step 1 (root
          positions). Smooth shapes and rhythm come next.
        </p>
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
              Step 1 is available now. Step 2 (smooth) and Step 3 (feeling) are
              coming next.
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}