export type ShortsPreset = {
  id: string;
  title: string;
  mood: string;
  subtitle: string;
  progression: string;
  tempo: number;
  chordBeats: number;
  playMode: "chords" | "arpeggio";
  palette: {
    background: string;
    accent: string;
    text: string;
    glow: string;
  };
};

export const SHORTS_PRESETS: ShortsPreset[] = [
  {
    id: "floating-calm",
    title: "Floating Calm",
    mood: "Gentle suspension",
    subtitle: "Soft return without urgency",
    progression: "Cmaj7 Am7 Fmaj7 G",
    tempo: 72,
    chordBeats: 4,
    playMode: "arpeggio",
    palette: {
      background: "#0f172a",
      accent: "#7dd3fc",
      text: "#e2e8f0",
      glow: "rgba(125, 211, 252, 0.35)",
    },
  },
  {
    id: "wistful-descent",
    title: "Wistful Descent",
    mood: "Melancholy drift",
    subtitle: "Downward gravity with a quiet landing",
    progression: "Am Em F C",
    tempo: 68,
    chordBeats: 4,
    playMode: "chords",
    palette: {
      background: "#1f2937",
      accent: "#f9a8d4",
      text: "#fdf2f8",
      glow: "rgba(249, 168, 212, 0.32)",
    },
  },
  {
    id: "cinematic-lift",
    title: "Cinematic Lift",
    mood: "Open wonder",
    subtitle: "Wide, bright motion for short-form hooks",
    progression: "F C G Am",
    tempo: 80,
    chordBeats: 4,
    playMode: "chords",
    palette: {
      background: "#111827",
      accent: "#fbbf24",
      text: "#fffbeb",
      glow: "rgba(251, 191, 36, 0.32)",
    },
  },
];
