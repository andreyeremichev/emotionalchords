// lib/emotions.ts

export type EmotionId =
  | "calm"
  | "playful"
  | "magic"
  | "sadness"
  | "mystery"
  | "melancholy"
  | "wonder"
  | "tension"
  | "anger"
  | "fear";

export type EmotionPalette = {
  gradientTop: string;
  gradientBottom: string;
  trailColor: string; // key highlight color
};

export type EmotionRecipe = {
  chords: string[]; // chord symbols
};

export type EmotionMeta = {
  id: EmotionId;

  /**
   * Motion-first naming (new)
   * motion = mechanical label (primary)
   * emotion = human label (secondary, in parentheses)
   */
  motion: string;
  emotion: string;

  /**
   * Backwards-compatible label used across existing components.
   * Keep for now so older UI still compiles; it mirrors `emotion`.
   */
  label: string;

  emoji: string;
  keywords: string[];
  palette: EmotionPalette;

  // Two paths (for now)
  flow: EmotionRecipe;
  color: EmotionRecipe;
};

export function motionEmotionLabel(e: EmotionMeta) {
  return `${e.motion} (${e.emotion})`;
}

export const EMOTIONS: EmotionMeta[] = [
  {
    id: "calm",
    motion: "Settled Circulation",
    emotion: "Calm / Peace",
    label: "Calm / Peace",
    emoji: "🌿",
    keywords: [
      "settled circulation piano",
      "calm chords",
      "peaceful piano",
      "relaxing progression",
    ],
    palette: {
      gradientTop: "#2f5d4f",
      gradientBottom: "#6bbf8f",
      trailColor: "#6dd2a3",
    },
    flow: { chords: ["Bb", "F", "Gm", "Eb"] },
    color: { chords: ["C", "D", "F", "Eb"] },
  },
  {
    id: "playful",
    motion: "Light Return",
    emotion: "Playful",
    label: "Playful",
    emoji: "🎈",
    keywords: [
      "light return piano",
      "playful piano",
      "bright progression",
      "happy chords",
    ],
    palette: {
      gradientTop: "#f59e0b",
      gradientBottom: "#f97316",
      trailColor: "#ffb74d",
    },
    flow: { chords: ["Bb", "Cm", "F", "Bb"] },
    color: { chords: ["C", "Eb", "F#", "G#"] },
  },
  {
    id: "magic",
    motion: "Guided Departure",
    emotion: "Magic / Fantasy",
    label: "Magic / Fantasy",
    emoji: "✨",
    keywords: [
      "guided departure piano",
      "magical chords",
      "fantasy piano",
      "pixar chord progression",
    ],
    palette: {
      gradientTop: "#6d28d9",
      gradientBottom: "#a855f7",
      trailColor: "#c4a1ff",
    },
    flow: { chords: ["Eb", "Bb", "F", "Gm"] },
    color: { chords: ["C", "Ab", "E", "G"] },
  },
  {
    id: "sadness",
    motion: "Unresolved Descent",
    emotion: "Sadness",
    label: "Sadness",
    emoji: "😢",
    keywords: [
      "unresolved descent piano",
      "sad piano chords",
      "emotional piano",
      "sadness progression",
    ],
    palette: {
      gradientTop: "#2D3E68",
      gradientBottom: "#6076AF",
      trailColor: "#4A6FA5",
    },
    flow: { chords: ["Cm", "Ab", "Eb", "Bb"] },
    color: { chords: ["Cm", "Ab", "Fm", "Em"] },
  },
  {
    id: "mystery",
    motion: "Obscured Orientation",
    emotion: "Mystery",
    label: "Mystery",
    emoji: "🕵️‍♀️",
    keywords: [
      "obscured orientation piano",
      "mysterious chords",
      "mystery piano",
      "dark harmonic mood",
    ],
    palette: {
      gradientTop: "#272343",
      gradientBottom: "#4b4e91",
      trailColor: "#8fb3ff",
    },
    flow: { chords: ["Cm", "Fm", "Bb", "Cm"] },
    color: { chords: ["Cm", "D", "F°", "F#"] },
  },
  {
    id: "melancholy",
    motion: "Altered Return",
    emotion: "Melancholy",
    label: "Melancholy",
    emoji: "🌧️",
    keywords: [
      "altered return piano",
      "melancholy chords",
      "somber piano",
      "emotional minor",
    ],
    palette: {
      gradientTop: "#314159",
      gradientBottom: "#60738d",
      trailColor: "#5a7bbc",
    },
    flow: { chords: ["Ab", "Fm", "Cm", "G"] },
    color: { chords: ["Cm", "A", "C#m", "A#"] },
  },
  {
    id: "wonder",
    motion: "Upward Opening",
    emotion: "Wonder",
    label: "Wonder",
    emoji: "🌌",
    keywords: [
      "upward opening piano",
      "wonder chords",
      "beautiful piano",
      "inspirational chords",
    ],
    palette: {
      gradientTop: "#1d3557",
      gradientBottom: "#457b9d",
      trailColor: "#8ecae6",
    },
    flow: { chords: ["Cm", "Ab", "Eb", "F"] },
    color: { chords: ["Cm", "F", "G", "B"] },
  },
  {
    id: "tension",
    motion: "Held Pressure",
    emotion: "Tension",
    label: "Tension",
    emoji: "😬",
    keywords: [
      "held pressure piano",
      "tense chords",
      "suspense piano",
      "drama chords",
    ],
    palette: {
      gradientTop: "#4b5563",
      gradientBottom: "#9ca3af",
      trailColor: "#fbbf24",
    },
    flow: { chords: ["Cm", "D°", "G", "Cm"] },
    color: { chords: ["C", "C#m", "E°", "F#"] },
  },
  {
    id: "anger",
    motion: "Grinding Advance",
    emotion: "Anger",
    label: "Anger",
    emoji: "😡",
    keywords: [
      "grinding advance piano",
      "angry chords",
      "aggressive piano",
      "intense progression",
    ],
    palette: {
      gradientTop: "#6b1b25",
      gradientBottom: "#c0392b",
      trailColor: "#ff7373",
    },
    flow: { chords: ["Cm", "Fm", "Db", "G"] },
    color: { chords: ["Cm", "C#m", "E°", "F#"] },
  },
  {
    id: "fear",
    motion: "Loss of Ground",
    emotion: "Fear / Horror",
    label: "Fear / Horror",
    emoji: "😱",
    keywords: [
      "loss of ground piano",
      "fear chords",
      "horror piano",
      "scary progression",
    ],
    palette: {
      gradientTop: "#222933",
      gradientBottom: "#4a5568",
      trailColor: "#6bc1ff",
    },
    flow: { chords: ["Cm", "Db", "G", "Cm"] },
    color: { chords: ["Cm", "F#°", "G", "A#°"] },
  },
];

export const EMOTION_BY_ID = Object.fromEntries(
  EMOTIONS.map((e) => [e.id, e])
) as Record<EmotionId, EmotionMeta>;