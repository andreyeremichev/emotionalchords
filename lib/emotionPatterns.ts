// lib/emotionPatterns.ts
import type { EmotionId } from "@/lib/emotions";

export type PatternId =
  | "breathing"
  | "pulse"
  | "echo"
  | "freeze"
  | "wonder"
  | "magic"
  | "mystery";

export function patternForEmotion(id: EmotionId): PatternId {
  if (id === "playful") return "echo";
  if (id === "fear") return "freeze";

  if (id === "sadness" || id === "melancholy" || id === "calm") {
    return "breathing";
  }

  if (id === "wonder") return "wonder";
  if (id === "magic") return "magic";
  if (id === "mystery") return "mystery";

  return "pulse"; // anger, tension
}