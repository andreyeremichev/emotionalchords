// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Analytics } from "@vercel/analytics/next";

const SITE_NAME = "EmotionalChords";
const SITE_URL = "https://emotionalchords.app";
const OG_IMAGE = "/og/emotionalchords.jpg";

function SiteJsonLd() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      email: "hello@pianotrainer.app",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description:
  "Beginner-friendly emotional piano practice. Play emotions on piano using chord progressions, guided examples, and step-by-step practice. No sheet music. No heavy theory language.",
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "MusicApplication",
      operatingSystem: "Web",
      description:
  "Interactive emotional piano chord progressions practice tool for beginners. Explore emotional piano chord progressions, guided examples, and step-by-step practice for calm, sadness, tension, mystery, wonder, and more.",
      isBasedOn:
        "Co-created with AI assistance: AI-generated code and progression drafts refined through human testing, iteration, and musical feedback.",
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Emotional Piano Chord Progressions | EmotionalChords",
    template: "%s | EmotionalChords",
  },

  description:
    "Play emotional piano chord progressions for calm, sadness, tension, mystery, and more. Beginner-friendly, step-by-step practice. No sheet music. No heavy theory.",

  applicationName: SITE_NAME,
  category: "Music",
  authors: [{ name: "EmotionalChords" }],

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Emotional Piano Chord Progressions | EmotionalChords",
    description:
      "Explore emotional piano chord progressions for calm, sadness, tension, mystery, and more. Beginner-friendly, step-by-step practice.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "EmotionalChords — Emotional Piano Chords",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Emotional Piano Chord Progressions | EmotionalChords",
    description:
      "Play emotional piano chord progressions step by step. Explore calm, sadness, tension, and more.",
    images: [OG_IMAGE],
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] bg-[#faf7f3] text-[#222] antialiased">
        <SiteJsonLd />

        <div className="flex min-h-[100dvh] flex-col">
          <SiteHeader />

          {/* Reserve space so content doesn't sit under the sticky footer */}
          <main className="flex-1 pb-[calc(3.25rem+env(safe-area-inset-bottom))]">
            {children}
          </main>

          <SiteFooter />
          <Analytics />
        </div>
      </body>
    </html>
  );
}