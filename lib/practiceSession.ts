// lib/practiceSession.ts
import type { EmotionId } from "@/lib/emotions";

export type PracticePatternId =
  | "breathing"
  | "pulse"
  | "echo"
  | "freeze"
  | "wonder"
  | "magic"
  | "mystery";

// EXACT from your EmotionPracticeBoard.tsx
export function practicePatternForEmotion(id: EmotionId): PracticePatternId {
  if (id === "playful") return "echo";
  if (id === "fear") return "freeze";

  if (id === "sadness" || id === "melancholy" || id === "calm") return "breathing";

  if (id === "wonder") return "wonder";
  if (id === "magic") return "magic";
  if (id === "mystery") return "mystery";

  return "pulse"; // anger, tension
}

// EXACT from your EmotionPracticeBoard.tsx (used by Step 3 currently)
export function practiceStep3Speed(id: EmotionId) {
  if (id === "sadness") return { normalMul: 1.2, slowMul: 1.6 };
  if (id === "melancholy") return { normalMul: 1.1, slowMul: 1.5 };
  if (id === "calm") return { normalMul: 1.05, slowMul: 1.4 };

  if (id === "fear") return { normalMul: 1.0, slowMul: 1.35 };

  if (id === "playful") return { normalMul: 1.0, slowMul: 1.1 };

  if (id === "anger") return { normalMul: 1.0, slowMul: 1.35 };
  if (id === "tension") return { normalMul: 1.05, slowMul: 1.45 };

  return { normalMul: 0.9, slowMul: 1.3 };
}

// EXACT multipliers you currently use for Step 2 Flow
export function practiceStep2FlowSpeed(id: EmotionId) {
  return {
    normalMul: ["sadness", "calm", "melancholy", "mystery", "magic", "wonder"].includes(id)
      ? 2.3
      : ["fear"].includes(id)
      ? 1.3
      : 1.0,
    slowMul: ["sadness", "calm", "melancholy", "mystery", "magic", "wonder"].includes(id)
      ? 2.8
      : ["fear"].includes(id)
      ? 1.9
      : 1.5,
  };
}

// EXACT multipliers you currently use for Step 2 Color
export function practiceStep2ColorSpeed(id: EmotionId) {
  return {
    normalMul: ["sadness", "calm", "melancholy", "mystery", "magic", "wonder"].includes(id)
      ? 1.6
      : ["fear"].includes(id)
      ? 1.3
      : 1.0,
    slowMul: ["sadness", "calm", "melancholy", "mystery", "magic", "wonder"].includes(id)
      ? 2.3
      : ["fear"].includes(id)
      ? 1.9
      : 1.5,
  };
}