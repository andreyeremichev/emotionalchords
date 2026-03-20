import type { Metadata } from "next";
import ShortsRendererClient from "@/components/shorts/ShortsRendererClient";

export const metadata: Metadata = {
  title: "Lab Shorts Renderer | Emotional Chords",
  description: "Render vertical chord progression shorts with piano audio.",
};

export default function ShortsRendererPage() {
  return <ShortsRendererClient />;
}
