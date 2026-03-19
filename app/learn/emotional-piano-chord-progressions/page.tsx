// app/learn/emotional-piano-chord-progressions/page.tsx
import type { Metadata } from "next";
import EmotionalChordProgressionsClient from "./EmotionalChordProgressionsClient";

export const metadata: Metadata = {
  title: "Emotional Piano Chord Progressions (10 Emotions Explained)",
  description:
    "Explore emotional piano chord progressions for calm, sadness, tension, mystery, wonder, and more. Each emotion includes Flow and Color paths, motion logic, and guided links to the full playbooks.",
  alternates: {
    canonical: "/learn/emotional-piano-chord-progressions",
  },
  openGraph: {
    type: "article",
    url: "https://emotionalchords.app/learn/emotional-piano-chord-progressions",
    title: "Emotional Piano Chord Progressions (10 Emotions Explained)",
    description:
      "Emotion on piano comes from how chords move. Explore 10 emotional chord progressions, then open the full playbooks for hands, rhythm, and pedal.",
    images: ["/og/emotionalchords.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emotional Piano Chord Progressions (10 Emotions Explained)",
    description:
      "Emotion on piano comes from how chords move. Explore 10 emotional chord progressions and open the full playbooks.",
    images: ["/og/emotionalchords.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <EmotionalChordProgressionsClient />;
}