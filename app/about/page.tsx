// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | EmotionalChords",
  description:
    "EmotionalChords helps beginners play emotions on piano in minutes — with guided steps, no sheet music, and no heavy theory.",
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
        EmotionalChords helps motivated beginners{" "}
        <strong>play emotions on piano in under 10 minutes</strong>.
        <br />
        Tap an emotion, hear it once, then play it step by step.
      </p>

      <ul className="mt-5 space-y-2 text-sm text-neutral-700">
        <li>✅ No sheet music</li>
        <li>✅ No music theory required</li>
        <li>
          ✅ Two styles: <strong>Flow</strong> (smooth, familiar) and{" "}
          <strong>Color</strong> (expressive, cinematic)
        </li>
      </ul>

      <p className="mt-6 text-sm text-neutral-700">
        Start here:{" "}
        <Link href="/emotions" className="underline underline-offset-2">
          choose an emotion
        </Link>
        .
      </p>
    </main>
  );
}