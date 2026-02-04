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
        "Motion-first piano practice: choose a harmonic motion (emotion emerges), then practice it step by step in Flow (coherent motion) and Color (re-aligned motion). No sheet music. No heavy theory language.",
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
        "Interactive motion-first piano practice tool. Choose a motion (emotion emerges), then practice it step by step in two paths: Flow (coherent, readable motion) and Color (faster re-alignment). No sheet music. No heavy theory language.",
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
    default: "Motion (Emotion) — Piano States Through Harmony | EmotionalChords",
    template: "%s | EmotionalChords",
  },
  description:
    "Choose a harmonic motion and stay with it — emotion emerges. Practice each motion step by step in two paths: Flow (coherent motion) and Color (re-aligned motion). No sheet music. No heavy theory language.",
  applicationName: SITE_NAME,
  category: "Music",
  authors: [{ name: "EmotionalChords" }],

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Motion (Emotion) — Piano States Through Harmony | EmotionalChords",
    description:
      "Choose a harmonic motion and stay with it — emotion emerges. Practice in two paths: Flow (coherent motion) and Color (re-aligned motion). No sheet music. No heavy theory language.",
    images: [
      { url: OG_IMAGE, width: 1200, height: 630, alt: "EmotionalChords OG" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Motion (Emotion) — Piano States Through Harmony | EmotionalChords",
    description:
      "Choose a motion. Stay with it. Practice in Flow (coherent) and Color (re-aligned) paths. No sheet music. No heavy theory language.",
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