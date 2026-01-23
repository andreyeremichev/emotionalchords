"use client";

import React, { useMemo, useState } from "react";
import TextColorKeyboard from "@/components/TextColorKeyboard";

type EmotionId =
  | "sadness"
  | "anger"
  | "fear"
  | "mystery"
  | "melancholy"
  | "calm"
  | "playful"
  | "magic"
  | "wonder"
  | "tension";

type ColorEmotionMeta = {
  id: EmotionId;
  label: string;
  emoji: string;
  gradientTop: string;
  gradientBottom: string;
  trailColor: string;
  colorChords: string;
};

const COLOR_EMOTIONS: ColorEmotionMeta[] = [
  { id: "calm", label: "Calm", emoji: "🌿", gradientTop: "#2f5d4f", gradientBottom: "#6bbf8f", trailColor: "#6dd2a3", colorChords: "C D F Eb" },
  { id: "playful", label: "Playful", emoji: "🎈", gradientTop: "#f59e0b", gradientBottom: "#f97316", trailColor: "#ffb74d", colorChords: "C Eb F# G#" },
  { id: "magic", label: "Magic", emoji: "✨", gradientTop: "#6d28d9", gradientBottom: "#a855f7", trailColor: "#c4a1ff", colorChords: "C Ab E G" },
  { id: "sadness", label: "Sadness", emoji: "😢", gradientTop: "#2D3E68", gradientBottom: "#6076AF", trailColor: "#4A6FA5", colorChords: "Cm Ab Fm Em" },
  { id: "mystery", label: "Mystery", emoji: "🕵️‍♀️", gradientTop: "#272343", gradientBottom: "#4b4e91", trailColor: "#8fb3ff", colorChords: "Cm D F° F#" },
  { id: "melancholy", label: "Melancholy", emoji: "🌧️", gradientTop: "#314159", gradientBottom: "#60738d", trailColor: "#5a7bbc", colorChords: "Cm A C#m A#" },
  { id: "wonder", label: "Wonder", emoji: "🌌", gradientTop: "#1d3557", gradientBottom: "#457b9d", trailColor: "#8ecae6", colorChords: "Cm F G B" },
  { id: "tension", label: "Tension", emoji: "😬", gradientTop: "#4b5563", gradientBottom: "#9ca3af", trailColor: "#fbbf24", colorChords: "C C#m E° F#" },
  { id: "anger", label: "Anger", emoji: "😡", gradientTop: "#6b1b25", gradientBottom: "#c0392b", trailColor: "#ff7373", colorChords: "Cm C#m E° F#" },
  { id: "fear", label: "Fear", emoji: "😱", gradientTop: "#222933", gradientBottom: "#4a5568", trailColor: "#6bc1ff", colorChords: "Cm F#° G A#°" },
];

const COLOR_CHORD_TEXT: Record<EmotionId, [string, string, string, string]> = {
  calm: [
    "Sets a clear center, emotionally still.",
    "Steps upward and outward, widening the emotional space without creating pressure.",
    "Continues the expansion, now clearly away from the original center.",
    "Pulls gently downward, like an exhale. Calm is restored through contrast, not return.",
  ],
  playful: [
    "Sets a familiar reference point.",
    "Jumps sideways in color. Surprise appears, but nothing destabilizes.",
    "Leaps again, brighter and less grounded. The emotion is amused, not tense.",
    "Lands lightly in a new place. Playfulness survives because nothing insists on resolution.",
  ],
  magic: [
    "Establishes a grounded reference.",
    "Drops far away from that ground. The emotional floor disappears briefly.",
    "Flashes sharply upward. A new light appears with no preparation.",
    "Stabilizes just enough to let the brightness linger without resolving it.",
  ],
  sadness: [
    "Establishes the familiar center.",
    "Moves away gently, as expected.",
    "Introduces a brighter, foreign color. Hope appears briefly.",
    "Slips back down. The contrast makes the sadness feel sharper and more aware.",
  ],
  mystery: [
    "Establishes a recognizable base.",
    "Moves upward into unfamiliar territory.",
    "Removes tonal clarity. The emotion is suspended, searching for rules.",
    "Lands in an unexpected place. Resolution is implied, not confirmed.",
  ],
  melancholy: [
    "Sets a minor, inward-facing state.",
    "Jumps upward into unexpected brightness.",
    "Shifts again, now emotionally distant from the start.",
    "Stays unresolved. The emotion lingers as longing rather than sadness.",
  ],
  wonder: [
    "Sets a grounded reference.",
    "Moves upward with intent.",
    "Climbs further, now clearly outside the original space.",
    "Floats high without return. Wonder remains unresolved and open-ended.",
  ],
  tension: [
    "Sets an apparently stable ground.",
    "Tightens inward. Space disappears.",
    "Breaks structure. The emotion feels compressed and unstable.",
    "Pushes upward aggressively. Suspense remains because the ground never returns.",
  ],
  anger: [
    "Sets a tense but controlled base.",
    "Shifts upward abruptly. Stability cracks.",
    "Tightens further. The emotion is compressed and aggressive.",
    "Locks into strain. Anger refuses resolution.",
  ],
  fear: [
    "Sets a fragile reference.",
    "Removes stability completely. Orientation vanishes.",
    "Pushes upward without support. Panic replaces motion.",
    "Collapses into unresolved instability. Fear remains uncontained.",
  ],
};

export default function TextColorKeyboardSection() {
  const [selectedId, setSelectedId] = useState<EmotionId>("magic");
const [autoPlayKey, setAutoPlayKey] = useState<number | null>(null);

  const selectedMeta = useMemo(
    () => COLOR_EMOTIONS.find((e) => e.id === selectedId) ?? COLOR_EMOTIONS[0],
    [selectedId]
  );

  return (
    <section>
      <h2>Play Color on the keyboard, following the motion behind each chord.</h2>

      <div className="highlight-box">
        <TextColorKeyboard
          emotionId={selectedMeta.id}
          emotionLabel={selectedMeta.label}
          emotionEmoji={selectedMeta.emoji}
          palette={{
            gradientTop: selectedMeta.gradientTop,
            gradientBottom: selectedMeta.gradientBottom,
            trailColor: selectedMeta.trailColor,
          }}
          colorChords={selectedMeta.colorChords}
          phrases={COLOR_CHORD_TEXT[selectedMeta.id]}
          autoPlayKey={autoPlayKey}
        />
        <p>
          <strong>Pick an emotion below.</strong> This plays the Color progression
          in a smooth way (right-hand triad + left-hand root). Each chord is played twice so you can hear the step clearly. The sentence above
          the keyboard describes what the current chord is doing.
        </p>

        {/* simple picker (keeps your page styling) */}
        <div
  style={{
    display: "flex",
    gap: 8,
    margin: "10px 0 12px",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    paddingBottom: 4,
    flexWrap: "nowrap",
  }}
>
          {COLOR_EMOTIONS.map((e) => {
            const active = e.id === selectedId;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => {
  setSelectedId(e.id);
  setAutoPlayKey((k) => (k == null ? 1 : k + 1));
}}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  background: active ? "#111" : "rgba(0,0,0,0.06)",
                  color: active ? "#fff" : "#111",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ marginRight: 6 }}>{e.emoji}</span>
                {e.label}
              </button>
            );
          })}
        </div>

        
      </div>
    </section>
  );
}