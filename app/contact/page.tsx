// app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | EmotionalChords",
  description:
    "Contact EmotionalChords. This project is powered by PianoTrainer.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Contact
      </p>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
        Say hello
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-neutral-700">
        Questions, feedback, or collaboration ideas — email:
      </p>

      <p className="mt-3 text-sm">
        <a
          className="underline underline-offset-2"
          href="mailto:hello@pianotrainer.app?subject=EmotionalChords%20—%20Hello"
        >
          hello@pianotrainer.app
        </a>
      </p>

      <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
        <p className="text-sm text-neutral-700">
          EmotionalChords is powered by{" "}
          <a
            className="underline underline-offset-2"
            href="https://pianotrainer.app"
            target="_blank"
            rel="noreferrer"
          >
            PianoTrainer
          </a>
          :
          <br />
beginner-friendly ear and notation trainers.
        </p>
      </div>

      <p className="mt-8 text-xs text-neutral-500">
        Looking for practice?{" "}
        <Link href="/emotions" className="underline underline-offset-2">
          Pick an emotion
        </Link>
        .
      </p>
    </main>
  );
}