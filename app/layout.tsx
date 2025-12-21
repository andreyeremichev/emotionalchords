// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://emotionalchords.app"),
  title: {
    default: "Emotional Chords",
    template: "%s • Emotional Chords",
  },
  description: "Piano chord recipes for ten emotions.",
  openGraph: {
    type: "website",
    url: "https://emotionalchords.app",
    title: "Emotional Chords",
    description: "Piano chord recipes for ten emotions.",
    images: ["/og/og-image.png"], // use your current OG file path
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotional Chords",
    description: "Piano chord recipes for ten emotions.",
    images: ["/og/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#faf7f3] text-[#222] antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}