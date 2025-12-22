// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

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
        "Beginner-friendly emotional piano practice tool. Play emotions on piano in under 10 minutes — no sheet music, no music theory required.",
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
        "Interactive emotional piano practice tool for beginners. Two styles per emotion: Flow (smooth, familiar) and Color (expressive, cinematic). No sheet music. No music theory required.",
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
    default: "Play Emotions on Piano in 10 Minutes | EmotionalChords",
    template: "%s | EmotionalChords",
  },
  description:
    "Play emotions on piano in under 10 minutes. Tap an emotion, hear it once, then play it step by step — no sheet music, no music theory. Flow (smooth) and Color (cinematic) styles.",
  applicationName: SITE_NAME,
  category: "Music",
  authors: [{ name: "EmotionalChords" }],
  
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Play Emotions on Piano in 10 Minutes | EmotionalChords",
    description:
      "A beginner-friendly emotional piano practice tool. No sheet music. No music theory. Learn emotions step by step in Flow (smooth) and Color (cinematic) styles.",
    images: [
      { url: OG_IMAGE, width: 1200, height: 630, alt: "EmotionalChords OG" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Emotions on Piano in 10 Minutes | EmotionalChords",
    description:
      "Tap an emotion → hear it → play it step by step. No sheet music. No music theory.",
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
        </div>
      </body>
    </html>
  );
}