// app/learn/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn Emotional Piano | EmotionalChords",
  description:
    "Learn emotional piano in two ways: understand why chords feel emotional, or play emotional piano chord progressions directly. Clear, human, and beginner-friendly.",
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app/learn",
    title: "Learn Emotional Piano | EmotionalChords",
    description:
      "Understand why chords feel emotional, or play emotional piano chord progressions directly.",
    images: ["/og/emotionalchords.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Learn Emotional Piano | EmotionalChords",
    description:
      "Understand why chords feel emotional, or play emotional piano chord progressions directly.",
    images: ["/og/emotionalchords.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function LearnHubPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Learn
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Learn emotional piano
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
          There are two good ways to begin.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
          You can start with the question{" "}
          <strong>“why do some chords feel emotional?”</strong>
          <br />
          or you can start by{" "}
          <strong>playing emotional chord progressions directly</strong>.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
          Both lead to the same place. One starts with understanding. The other
          starts with sound.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/learn/paths-of-harmony"
          className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 transition hover:shadow-md hover:ring-black/20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Explanation
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
            Why chords feel emotional
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            Explore how harmony creates emotion through motion, using{" "}
            <strong>Flow</strong> and <strong>Color</strong>.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            This is the page to open when you want to understand why one chord
            movement feels calm, another feels tense, and another feels open or
            mysterious.
          </p>

          <span className="mt-4 inline-block text-sm font-medium text-neutral-800 group-hover:underline">
            Open Paths of Harmony →
          </span>
        </Link>

        <Link
          href="/learn/emotional-piano-chord-progressions"
          className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10 transition hover:shadow-md hover:ring-black/20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Playbook
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
            Emotional piano chord progressions
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            Play 10 emotions using ready-to-use chord progressions, with motion
            descriptions, focus cues, rhythm, pedal, and full links to the
            emotion playbooks.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            This is the page to open when you want something practical on the
            piano right away.
          </p>

          <span className="mt-4 inline-block text-sm font-medium text-neutral-800 group-hover:underline">
            Open emotional chord progressions →
          </span>
        </Link>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          Where to start
        </h2>

        <div className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
          <p>
            Start with <strong>Paths of Harmony</strong> if you want the deeper
            explanation first.
          </p>

          <p>
            Start with <strong>Emotional piano chord progressions</strong> if
            you want to play first and understand afterward.
          </p>
        </div>
      </section>
    </main>
  );
}