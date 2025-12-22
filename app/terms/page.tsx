// app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Privacy | EmotionalChords",
  description:
    "Terms of use and privacy information for EmotionalChords.",
  alternates: { canonical: "/terms" },
};

export default function TermsPrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Terms & Privacy
      </p>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
        Terms of Use & Privacy
      </h1>

      <section className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-700">
        <p>
          EmotionalChords is a free, interactive piano practice website. By using
          this site, you agree to use it responsibly and lawfully.
        </p>

        <h2 className="pt-2 text-base font-semibold text-neutral-900">
          Terms of use
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The site is provided “as is”, without warranties of any kind.
          </li>
          <li>
            You are responsible for how you use the content and any outcomes
            from practicing.
          </li>
          <li>
            You may not abuse, scrape, or attempt to disrupt the site.
          </li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-neutral-900">
          Privacy
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We do not ask you to create an account.
          </li>
          <li>
            If analytics are enabled, we may collect basic, anonymous usage data
            (for example: page views, device type, and performance) to improve
            the product.
          </li>
          <li>
            We do not sell personal information.
          </li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-neutral-900">
          Contact
        </h2>
        <p>
          For privacy questions, email{" "}
          <a
            className="underline underline-offset-2"
            href="mailto:hello@pianotrainer.app?subject=EmotionalChords%20—%20Privacy"
          >
            hello@pianotrainer.app
          </a>
          .
        </p>

        <p className="text-xs text-neutral-500">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
      </section>
    </main>
  );
}