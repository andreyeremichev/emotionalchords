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
  "Establishes a neutral emotional ground without direction or demand.",
  "Moves away smoothly, opening space while remaining fully stable.",
  "Softens the state, releasing weight rather than increasing depth.",
  "Gathers the space back together, settling without urgency or tension.",
],

playful: [
  "Establishes a friendly and stable baseline.",
  "Introduces a small lift that creates curiosity without uncertainty.",
  "Adds momentum, feeling like a hop rather than a push.",
  "Returns cleanly, resolving play without consequence.",
],

magic: [
  "Begins slightly off-center, placing the listener gently off-ground.",
  "Brings orientation back, making the emotional space readable again.",
  "Pushes forward with intent, guiding motion rather than drifting.",
  "Lifts into a softened state, ending suspended between reality and imagination.",
],

sadness: [
  "Sets a neutral emotional ground with no weight yet.",
  "Pulls downward and away, introducing heaviness without shock.",
  "Continues retreat, turning the emotion inward and personal.",
  "Hovers without resolution, letting sadness persist.",
],

mystery: [
  "Sets a shadowed but stable reference point.",
  "Shifts the ground slightly, creating uncertainty without threat.",
  "Blurs orientation, leaving the emotion without clear footing.",
  "Returns fully, resolving mystery without explanation.",
],

melancholy: [
  "Begins already softened, reflective rather than neutral.",
  "Turns inward, slowing and thickening the emotional motion.",
  "Reconnects with the original ground, making the memory more defined.",
  "Introduces strained brightness, where the ache comes from contrast, not loss.",
],

wonder: [
  "Establishes a quiet, contained base.",
  "Lifts gently, introducing curiosity without destabilizing the ground.",
  "Continues upward, expanding the emotional horizon.",
  "Shines briefly above the center, where wonder feels like elevation rather than tension.",
],

tension: [
  "Establishes an apparently neutral starting point.",
  "Introduces contained instability, where something feels wrong but held.",
  "Compresses inward, sharply increasing pressure.",
  "Returns to the start, resetting tension rather than resolving it.",
],

anger: [
  "Establishes a restrained but tense baseline.",
  "Adds pressure, turning restraint into resistance.",
  "Grinds upward, pushing forcefully against limits.",
  "Forces forward motion, leaving anger active and unresolved.",
],

fear: [
  "Establishes a fragile but recognizable emotional ground.",
  "Drops into instability, making the ground feel unsafe.",
  "Surges upward abruptly, triggering a panic response.",
  "Falls back uneasily, where safety feels temporary and unreliable.",
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
          autoPlayKey={autoPlayKey}
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