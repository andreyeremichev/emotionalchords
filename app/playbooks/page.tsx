// app/playbooks/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Piano Playbooks",
  description:
    "Explore two piano playbooks: Play Emotions on Piano and Hypnotic Piano Loops. Beginner-friendly books for emotional chord progressions and hypnotic loop practice.",
  alternates: { canonical: "/playbooks" },
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app/playbooks",
    title: "Piano Playbooks | EmotionalChords",
    description:
      "Two piano playbooks: Play Emotions on Piano and Hypnotic Piano Loops.",
    images: ["/og/emotionalchords.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piano Playbooks | EmotionalChords",
    description:
      "Explore two piano playbooks: emotional chord progressions and hypnotic loops.",
    images: ["/og/emotionalchords.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function PlaybooksPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 max-w-3xl">
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
    Playbooks
  </p>

  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
    Piano playbooks
  </h1>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    The site gives you free interactive emotion pages you can hear and practice
    immediately.
  </p>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    The playbooks go further. They add deeper structures, more advanced guided
    practice, and material that is not available on the free pages.
  </p>
</header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
    Play Emotions on Piano
  </h2>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    A practical guide for players who want emotions to emerge under their hands
    — not just play chords that sound nice.
  </p>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    On the free site, you can already explore the ten emotions through guided
    interactive pages. The book goes further.
  </p>

  <div className="mt-4 space-y-2 text-sm text-neutral-700">
    <p>Inside the book, you get:</p>
    <ul className="space-y-1">
      <li>• a canonical pattern for each emotion</li>
      <li>• variations that change the feeling without changing the progression</li>
      <li>• how to break the emotion on purpose — and bring it back under control</li>
      <li>• how to switch between emotions without changing the chords, by changing only the way you play</li>
      <li>• the Love Arc — a separate longer-form chapter not available on the free emotion pages</li>
      <li>• a more advanced Book Companion than the current free practice sessions</li>
    </ul>
  </div>

  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
    Built for self-taught pianists and beginner-to-intermediate players who want
    emotional chord progressions that are playable, clear, and worth returning to.
  </p>

  <div className="mt-4">
    <a
      href="https://www.amazon.com/dp/B0GXSHWSBX"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-sm font-medium underline underline-offset-2 hover:text-black"
    >
      View on Amazon →
    </a>
  </div>
</article>

        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
  <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
    Hypnotic Piano Loops
  </h2>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    A looping piano chord book for intermediate players who want to sit down,
    start playing, and drop into a timeless groove — without composing,
    analyzing, or choosing what comes next.
  </p>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    This is different from the free emotion pages on the site. Those pages teach
    distinct emotional states. This book is about entering and sustaining a
    repeatable loop state.
  </p>

  <div className="mt-4 space-y-2 text-sm text-neutral-700">
    <p>Inside the book, you get:</p>
    <ul className="space-y-1">
      <li>• 7 tested looping piano progressions designed for long repetition</li>
      <li>• clear left-hand engines that become automatic under the fingers</li>
      <li>• a right-hand layer added only after the left hand locks in</li>
      <li>• Break &amp; Restore control to deliberately disturb and re-center the state</li>
      <li>• transitions between arcs so you can move without stopping to decide</li>
      <li>• a dedicated Book Companion for playback, variations, break/restore, and transitions</li>
    </ul>
  </div>

  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
    Built for intermediate players who enjoy hypnotic piano, meditative
    repetition, and patterns that are easy to stay inside.
  </p>

  <div className="mt-4">
    <a
      href="https://www.amazon.com/dp/B0GXYS5LFZ"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-sm font-medium underline underline-offset-2 hover:text-black"
    >
      View on Amazon →
    </a>
  </div>
</article>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
  <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
    How these relate to the free site
  </h2>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    The free site is the place to hear and practice emotions interactively.
  </p>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    <strong>Play Emotions on Piano</strong> adds deeper control: variations,
    breaking and restoring emotion, switching emotions without changing chords,
    and the Love Arc.
  </p>

  <p className="mt-3 text-sm leading-relaxed text-neutral-700">
    <strong>Hypnotic Piano Loops</strong> is a separate lane: not emotion
    switching, but timeless repeating arcs built for staying inside a state.
  </p>

  <div className="mt-4">
    <Link
      href="/emotions"
      className="text-sm font-medium underline underline-offset-2 hover:text-black"
    >
      Explore the free interactive emotions →
    </Link>
  </div>
</section>
    </main>
  );
}