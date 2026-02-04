// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | EmotionalChords",
  description:
    "EmotionalChords helps piano players enter states through harmonic motion. Choose a motion, stay with it, and let emotion emerge. Two paths: Flow (coherent motion) and Color (re-aligned motion).",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        About
      </p>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
        EmotionalChords
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-neutral-700">
        EmotionalChords is a motion-first piano practice space.
        <br />
        You don’t aim for a feeling — you choose how harmony moves,{" "}
        <strong>stay with it</strong>, and let emotion emerge.
      </p>

      <ul className="mt-5 space-y-2 text-sm text-neutral-700">
        <li>✅ No sheet music</li>
        <li>✅ No heavy theory language</li>
        <li>
          ✅ Two paths for the same motion: <strong>Flow</strong> (coherent,
          readable motion) and <strong>Color</strong> (faster re-alignment)
        </li>
        <li>✅ Guided practice for players (not a course)</li>
      </ul>

      <p className="mt-6 text-sm text-neutral-700">
        Start here:{" "}
        <Link href="/emotions" className="underline underline-offset-2">
          choose a motion (emotion)
        </Link>
        .
      </p>

      <p className="mt-3 text-sm text-neutral-700">
        If you want the underlying idea:{" "}
        <Link
          href="/learn/paths-of-harmony"
          className="underline underline-offset-2"
        >
          Why it works
        </Link>
        .
      </p>
    </main>
  );
}