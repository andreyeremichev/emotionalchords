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
    "Establishes a stable reference point with no directional pull.",
    "Expands upward, increasing space without introducing pressure.",
    "Continues outward movement, increasing distance while staying smooth.",
    "Returns gently, settling the motion without resolving tension.",
  ],

  playful: [
    "Establishes a familiar reference point.",
    "Jumps away lightly, introducing motion without consequence.",
    "Leaps again, increasing distance while keeping balance.",
    "Returns loosely, landing without commitment or weight.",
  ],

  magic: [
    "Sets a grounded starting frame.",
    "Breaks far away from that frame, removing orientation.",
    "Flashes upward suddenly, creating a sense of appearance rather than travel.",
    "Stabilizes briefly, allowing the new space to linger without explanation.",
  ],

  sadness: [
    "Establishes a familiar center.",
    "Moves downward and away, initiating withdrawal.",
    "Introduces a brief upward contrast that does not redirect the motion.",
    "Falls back down, reinforcing descent without recovery.",
  ],

  mystery: [
    "Establishes a guarded but readable reference.",
    "Moves upward into unfamiliar alignment.",
    "Removes positional clarity, suspending orientation.",
    "Re-enters the frame unexpectedly, without explaining what happened.",
  ],

  melancholy: [
    "Establishes an inward-facing starting point.",
    "Moves upward into brightness without releasing the center.",
    "Shifts again, increasing distance while preserving connection.",
    "Returns altered, with the center no longer feeling neutral.",
  ],

  wonder: [
    "Establishes a grounded reference.",
    "Opens upward, expanding vertical space.",
    "Continues rising, extending beyond the original frame.",
    "Remains elevated, leaving the space open rather than returning.",
  ],

  tension: [
    "Establishes an apparently stable ground.",
    "Tightens inward, reducing available space.",
    "Breaks structural balance, compressing motion.",
    "Pushes upward while refusing release, keeping pressure active.",
  ],

  anger: [
    "Establishes a controlled but resistant base.",
    "Forces upward motion, breaking stability.",
    "Continues pushing forward, increasing strain.",
    "Locks into resistance, maintaining force without resolution.",
  ],

  fear: [
    "Establishes a fragile reference point.",
    "Removes the sense of ground entirely.",
    "Attempts upward motion without support.",
    "Collapses back into instability, offering no safe footing.",
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
          autoPlayKey={autoPlayKey ?? undefined}
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