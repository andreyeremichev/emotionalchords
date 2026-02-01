// app/learn/paths-of-harmony/TextFlowKeyboardSection.tsx
"use client";

import React, { useMemo, useState } from "react";
import TextFlowKeyboard from "@/components/TextFlowKeyboard";
import { FLOW_PRESETS, buildFlowChordsForKey, pitchNameToPc } from "@/lib/harmony/flow";

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

type EmotionMeta = {
  id: EmotionId;
  label: string;
  emoji: string;
  gradientTop: string;
  gradientBottom: string;
  trailColor: string;
};

const EMOTIONS: EmotionMeta[] = [
  { id: "calm", label: "Calm", emoji: "🌿", gradientTop: "#2f5d4f", gradientBottom: "#6bbf8f", trailColor: "#6dd2a3" },
  { id: "playful", label: "Playful", emoji: "🎈", gradientTop: "#f59e0b", gradientBottom: "#f97316", trailColor: "#ffb74d" },
  { id: "magic", label: "Magic", emoji: "✨", gradientTop: "#6d28d9", gradientBottom: "#a855f7", trailColor: "#c4a1ff" },
  { id: "sadness", label: "Sadness", emoji: "😢", gradientTop: "#2D3E68", gradientBottom: "#6076AF", trailColor: "#4A6FA5" },
  { id: "mystery", label: "Mystery", emoji: "🕵️‍♀️", gradientTop: "#272343", gradientBottom: "#4b4e91", trailColor: "#8fb3ff" },
  { id: "melancholy", label: "Melancholy", emoji: "🌧️", gradientTop: "#314159", gradientBottom: "#60738d", trailColor: "#5a7bbc" },
  { id: "wonder", label: "Wonder", emoji: "🌌", gradientTop: "#1d3557", gradientBottom: "#457b9d", trailColor: "#8ecae6" },
  { id: "tension", label: "Tension", emoji: "😬", gradientTop: "#4b5563", gradientBottom: "#9ca3af", trailColor: "#fbbf24" },
  { id: "anger", label: "Anger", emoji: "😡", gradientTop: "#6b1b25", gradientBottom: "#c0392b", trailColor: "#ff7373" },
  { id: "fear", label: "Fear", emoji: "😱", gradientTop: "#222933", gradientBottom: "#4a5568", trailColor: "#6bc1ff" },
];

const FLOW_CHORD_TEXT: Record<EmotionId, [string, string, string, string]> = {
  calm: [
    "Establishes a stable reference with no directional pull.",
    "Moves outward smoothly, expanding space without resistance.",
    "Softens the motion, reducing weight without changing direction.",
    "Returns gently, settling the circulation without urgency.",
  ],

  playful: [
    "Establishes a stable reference point.",
    "Steps away lightly, introducing motion without risk.",
    "Adds momentum, increasing movement without pressure.",
    "Returns easily, completing the loop without consequence.",
  ],

  magic: [
    "Begins slightly away from the center.",
    "Re-establishes orientation, restoring a readable frame.",
    "Moves forward along a clear path rather than drifting.",
    "Lifts into a suspended state, maintaining openness without closure.",
  ],

  sadness: [
    "Establishes a neutral starting point.",
    "Moves downward and away, initiating withdrawal.",
    "Continues retreat, increasing distance without redirection.",
    "Remains unresolved, allowing the descent to persist.",
  ],

  mystery: [
    "Establishes a stable but shadowed reference.",
    "Shifts alignment slightly, introducing uncertainty.",
    "Removes positional clarity, suspending orientation.",
    "Returns to the reference, restoring structure without explanation.",
  ],

  melancholy: [
    "Establishes an inward-facing reference.",
    "Turns inward further, slowing and thickening motion.",
    "Revisits the center, now carrying accumulated change.",
    "Introduces contrast that alters the return without breaking it.",
  ],

  wonder: [
    "Establishes a quiet, contained base.",
    "Opens upward, expanding vertical space.",
    "Continues rising, extending beyond the original frame.",
    "Remains elevated, holding the opening without tension.",
  ],

  tension: [
    "Establishes an apparently stable ground.",
    "Introduces instability while keeping it contained.",
    "Compresses inward, increasing pressure sharply.",
    "Returns to the starting point, resetting pressure without release.",
  ],

  anger: [
    "Establishes a restrained but resistant base.",
    "Forces upward motion, breaking stability.",
    "Continues pushing forward, increasing strain.",
    "Maintains force, refusing resolution or retreat.",
  ],

  fear: [
    "Establishes a fragile reference point.",
    "Removes the sense of ground entirely.",
    "Attempts upward motion without support.",
    "Falls back into instability, offering no secure footing.",
  ],
};

const SHARP_TO_FLAT_ROOT: Record<string, string> = {
  "A#": "Bb",
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
};

function preferFlatsChordSymbol(sym: string): string {
  // Match: Root letter + optional accidental, then suffix (m, °, dim) if any
  const m = /^([A-G])(#)?(m|°|dim)?$/i.exec(sym.trim());
  if (!m) return sym;

  const letter = m[1].toUpperCase();
  const sharp = m[2] === "#";
  const suffix = m[3] ?? "";

  if (!sharp) return letter + suffix;

  const sharpRoot = `${letter}#`; // e.g. A#
  const flatRoot = SHARP_TO_FLAT_ROOT[sharpRoot] ?? sharpRoot;

  // Preserve suffix exactly ("m", "°", "dim")
  return `${flatRoot}${suffix}`;
}

export default function TextFlowKeyboardSection() {
  const [selectedId, setSelectedId] = useState<EmotionId>("magic");
  const [autoPlayKey, setAutoPlayKey] = useState<number | null>(null);

  const selectedMeta = useMemo(
    () => EMOTIONS.find((e) => e.id === selectedId) ?? EMOTIONS[0],
    [selectedId]
  );

  const flowChordsRaw = useMemo(() => {
  const preset = FLOW_PRESETS[selectedMeta.id];
  const tonicPc = preset.mode === "minor" ? pitchNameToPc("C") : pitchNameToPc("Bb");
  return buildFlowChordsForKey(tonicPc, preset); // keep sharps for audio
}, [selectedMeta.id]);

const flowChordsDisplay = useMemo(() => {
  return flowChordsRaw.map(preferFlatsChordSymbol); // flats for labels only
}, [flowChordsRaw]);

  return (
    <section>
      <h2>Play Flow on the keyboard, with each chord’s motion made clear.</h2>

      <div className="highlight-box">
        <TextFlowKeyboard
          emotionId={selectedMeta.id}
          emotionLabel={selectedMeta.label}
          emotionEmoji={selectedMeta.emoji}
          palette={{
            gradientTop: selectedMeta.gradientTop,
            gradientBottom: selectedMeta.gradientBottom,
            trailColor: selectedMeta.trailColor,
          }}
          flowChords={flowChordsRaw.join(" ")}
displayChords={flowChordsDisplay}
          phrases={FLOW_CHORD_TEXT[selectedMeta.id]}
          autoPlayKey={autoPlayKey ?? undefined}
        />
        <p>
          <strong>Tap an emotion below.</strong> This plays the Flow progression
          (right-hand triad + left-hand root). Each chord is played twice so you can hear the step clearly. The sentence above the keyboard
          tells you what the current chord is doing.
        </p>

        {/* Pills (single-line scroll) */}
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
          {EMOTIONS.map((e) => {
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