"use client";

import React, { useMemo } from "react";

/** Minimal palette we need from the emotion */
export type EmotionPalette = {
  gradientTop: string;
  gradientBottom: string;
  trailColor: string; // key highlight color
};

export type KeyboardMotionControlProps = {
  activeChordSymbol: string | null;
  emotion: EmotionPalette;
  emotionLabel: string;
  highlightColorOverride?: string;

  // NEW: explicit highlighting (used by Step 2 / Step 3)
  highlightNotesPrimary?: string[]; // typically RH
  highlightNotesSecondary?: string[]; // typically LH
  highlightColorSecondary?: string;
// NEW: label visibility controls (needed for Held Pressure)
  // Default behavior stays the same (primary labels ON, secondary labels OFF).
  showPrimaryLabels?: boolean;
  showSecondaryLabels?: boolean;
  /**
   * Label-layer override:
   * Use when audio/highlight uses sharps (A#3) but UI must display flats (Bb / B♭).
   * Map full note names including octave, e.g. "A#3" -> "Bb" or "B♭".
   * (Base only — octave comes from the key itself visually, but we render base labels.)
   */
  noteLabelMapOverride?: Record<string, string> | null;
  headerRight?: React.ReactNode;
  hideHeaderTitle?: boolean;
};
/* =========================
   Chord symbol → triad notes
   ========================= */

const PITCHES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const PITCHES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

function midiToNoteName(midi: number): string {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

function chordPrefersFlats(chord: string) {
  // Prefer spelling based on the chord symbol itself.
  // 1) Explicit accidental on root decides
  // 2) Otherwise: minor/dim chords prefer flats (Cm => Eb, Gm => Bb)
  // 3) Major chords without accidentals default to sharps (safe fallback)

  const m = /^([A-G])([b#♭♯]?)(m|°|dim)?/i.exec(chord);
  if (!m) return false;

  const acc = m[2] || "";
  const qual = (m[3] || "").toLowerCase();

  if (acc === "b" || acc === "♭") return true;
  if (acc === "#" || acc === "♯") return false;

  // No root accidental:
  if (qual === "m" || qual === "°" || qual === "dim") return true;

  return false;
}

function chordToPitchClassesOnly(name: string): number[] {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(name);
  if (!m) return [];
  const letter = m[1].toUpperCase();
  const acc = (m[2] || "").toLowerCase();
  const qual = (m[3] || "").toLowerCase();

  const basePCMap: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };
  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps =
    quality === "M" ? [0, 4, 7] : quality === "m" ? [0, 3, 7] : [0, 3, 6];
  return steps.map((s) => (pc + s) % 12);
}

function buildDisplayMapForChord(chord: string) {
  const pcs = chordToPitchClassesOnly(chord);
  const preferFlats = chordPrefersFlats(chord);
  const preferred = preferFlats ? PITCHES_FLAT : PITCHES;

  const map: Record<string, string> = {};

  // map both sharp and flat spellings (all octaves we render) to the preferred base label
  for (const pc of pcs) {
    const preferredName = preferred[pc]; // e.g. Eb, Bb, F#
    for (const oct of [2, 3, 4, 5, 6]) {
      map[`${PITCHES[pc]}${oct}`] = preferredName; // D#4 -> Eb
      map[`${PITCHES_FLAT[pc]}${oct}`] = preferredName; // Eb4 -> Eb
    }
  }

  return map;
}

function triadFromChordName(name: string): string[] {
  const m = /^([A-G])(b|#)?(m|°|dim)?$/i.exec(name);
  if (!m) return [];
  const letter = m[1].toUpperCase();
  const acc = (m[2] || "").toLowerCase();
  const qual = (m[3] || "").toLowerCase();

  const basePCMap: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  let pc = basePCMap[letter] ?? 0;
  if (acc === "#") pc = (pc + 1) % 12;
  if (acc === "b") pc = (pc + 11) % 12;

  let quality: "M" | "m" | "dim" = "M";
  if (qual === "m") quality = "m";
  if (qual === "°" || qual === "dim") quality = "dim";

  const steps =
    quality === "M" ? [0, 4, 7] : quality === "m" ? [0, 3, 7] : [0, 3, 6];

  // Close-range triad: keep all notes in the same C4..B4 bucket (no octave jumps).
  const baseMidi = 60; // C4
  return steps.map((semi) => midiToNoteName(baseMidi + ((pc + semi) % 12)));
}

/* =========================
   Static keyboard C2–C6 (visual only)
   ========================= */

type Oct = 2 | 3 | 4 | 5 | 6;
type WhiteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

type NoteName =
  | `${"C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B"}${Oct}`
  | `${"Db" | "Eb" | "Gb" | "Ab" | "Bb"}${Oct}`;

const WHITE_W = 30;
const WHITE_H = 145; // ~20% taller
const BLACK_W = 18;
const BLACK_H = 92;

type WhiteKey = { note: NoteName; x: number };
type BlackKey = { noteSharp: NoteName; noteFlat: NoteName; x: number };

function buildKeyboard() {
  const whiteCycle: WhiteLetter[] = ["C", "D", "E", "F", "G", "A", "B"];
  const hasBlackAfter = (wIdx: number) => ![2, 6].includes(wIdx); // no black after E or B

  const whites: WhiteKey[] = [];
  const blacks: BlackKey[] = [];

  let x = 0;
  for (let oct = 2 as Oct; oct <= 6; oct = (oct + 1) as Oct) {
    for (let wi = 0; wi < whiteCycle.length; wi++) {
      const letter = whiteCycle[wi];

      // only C6 in the top octave
      if (oct === 6 && letter !== "C") break;

      const note = `${letter}${oct}` as NoteName;
      whites.push({ note, x });

      if (hasBlackAfter(wi) && !(oct === 6 && letter === "C")) {
        const center = x + WHITE_W;
        const bx = center - BLACK_W / 2;

        const sharpMap: Record<WhiteLetter, string> = {
          C: "C#",
          D: "D#",
          E: "", // unused
          F: "F#",
          G: "G#",
          A: "A#",
          B: "", // unused
        };

        const flatPair: Record<string, string> = {
          "C#": "Db",
          "D#": "Eb",
          "F#": "Gb",
          "G#": "Ab",
          "A#": "Bb",
        };

        const sharpBase = sharpMap[letter];
        if (sharpBase && flatPair[sharpBase]) {
          const sharp = `${sharpBase}${oct}` as NoteName;
          const flat = `${flatPair[sharpBase]}${oct}` as NoteName;
          blacks.push({ noteSharp: sharp, noteFlat: flat, x: bx });
        }
      }

      x += WHITE_W;
    }
  }

  const width = whites.length * WHITE_W;
  return { whites, blacks, width };
}

const { whites: WHITE_KEYS, blacks: BLACK_KEYS, width: KEYBOARD_W } =
  buildKeyboard();

/* =========================
   Helpers
   ========================= */

function stripOct(note: string) {
  return note.slice(0, -1);
}

function prettyBase(name: string) {
  return name.replace(/#/g, "♯").replace(/b/g, "♭");
}

/* =========================
   Component
   ========================= */

export default function KeyboardMotionControl({
  activeChordSymbol,
  emotion,
  emotionLabel,
  highlightColorOverride,
  highlightNotesPrimary,
  highlightNotesSecondary,
  highlightColorSecondary,
  noteLabelMapOverride,
  headerRight,
  hideHeaderTitle,
  showPrimaryLabels = true,
  showSecondaryLabels = false,
}: KeyboardMotionControlProps) {
  const chordNotes = useMemo(
    () => (activeChordSymbol ? triadFromChordName(activeChordSymbol) : []),
    [activeChordSymbol]
  );

  const primaryNotes = useMemo(() => {
    // Important: if the caller provides an array (even empty), it is authoritative.
    if (highlightNotesPrimary !== undefined) return highlightNotesPrimary;
    return chordNotes;
  }, [highlightNotesPrimary, chordNotes]);

  const secondaryNotes = useMemo(() => {
    // Authoritative if provided (even empty)
    if (highlightNotesSecondary !== undefined) return highlightNotesSecondary;
    return [];
  }, [highlightNotesSecondary]);

  const highlightedPrimary = useMemo(() => new Set(primaryNotes), [primaryNotes]);
  const highlightedSecondary = useMemo(
    () => new Set(secondaryNotes),
    [secondaryNotes]
  );

  const keyColor = highlightColorOverride ?? emotion.trailColor;
  const keyColorSecondary = highlightColorSecondary ?? "rgba(0,0,0,0.25)";

  // Label-layer mapping:
  // - First priority: explicit override (used by Cycling Descent playbook)
  // - Otherwise: chord-symbol derived display map (used by emotions)
  const displayMap = useMemo(() => {
    if (noteLabelMapOverride) return noteLabelMapOverride;
    if (!activeChordSymbol) return null;
    return buildDisplayMapForChord(activeChordSymbol);
  }, [noteLabelMapOverride, activeChordSymbol]);

  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      {/* Dynamic label: emotion name */}
      <div
  style={{
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  }}
>
  {!hideHeaderTitle ? (
  <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 600 }}>
    {emotionLabel}
  </div>
) : (
  <div />
)}

  {headerRight ? (
  <div
    style={{
      fontSize: 14,          // match text-sm
      opacity: 0.85,
      textAlign: "center",   // center text
      maxWidth: 520,
      marginLeft: "auto",
      marginRight: "auto",   // true centering inside the header row
    }}
  >
    {headerRight}
  </div>
) : null}
</div>

      <div
        style={{
          borderRadius: 12,
          padding: 8,
          background: `linear-gradient(135deg, ${emotion.gradientTop}, ${emotion.gradientBottom})`,
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.08), 0 12px 30px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            borderRadius: 10,
            padding: 6,
            background: "rgba(255,255,255,0.96)",
          }}
        >
          <svg
            viewBox={`0 0 ${KEYBOARD_W} ${WHITE_H}`}
            preserveAspectRatio="xMidYMid meet"
            aria-label="Emotion Keyboard C2–C6"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            {/* White keys */}
            {WHITE_KEYS.map((k) => {
              const isPrimary = highlightedPrimary.has(k.note);
              const isSecondary = highlightedSecondary.has(k.note);

              const fill = isPrimary
                ? keyColor
                : isSecondary
                ? keyColorSecondary
                : "#ffffff";

              // base label: override map -> chord map -> fallback stripOct
              const baseLabel =
                displayMap?.[k.note] ?? stripOct(k.note);

              const labelText = prettyBase(baseLabel);

              return (
                <g key={k.note}>
                  <rect
                    x={k.x}
                    y={0}
                    width={WHITE_W}
                    height={WHITE_H}
                    fill={fill}
                    stroke="#000"
                    strokeWidth={1}
                  />

                  {/* Always-visible orientation label */}
                  {k.note === "C4" && (
                    <text
                      x={k.x + WHITE_W / 2}
                      y={WHITE_H - 4}
                      textAnchor="middle"
                      fontSize={10}
                    >
                      C4
                    </text>
                  )}

                  {/* Show note label when highlighted (configurable) */}
                  {( (isPrimary && showPrimaryLabels) || (isSecondary && showSecondaryLabels) ) && (
                    <text
                      x={k.x + WHITE_W / 2}
                      y={WHITE_H - 20}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#111827"
                    >
                      {labelText}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Black keys */}
            {BLACK_KEYS.map((k) => {
              const isPrimary =
                highlightedPrimary.has(k.noteSharp) ||
                highlightedPrimary.has(k.noteFlat);

              const isSecondary =
                highlightedSecondary.has(k.noteSharp) ||
                highlightedSecondary.has(k.noteFlat);

              const fill = isPrimary
                ? keyColor
                : isSecondary
                ? keyColorSecondary
                : "#000000";

              // Choose which "note string" to use for label lookup:
              // - If caller highlighted the flat spelling explicitly, treat it as the shown note.
              // - Otherwise default to sharp.
              // This keeps legacy behavior intact.
              const shownNote = highlightedPrimary.has(k.noteFlat)
                ? k.noteFlat
                : k.noteSharp;

              // base label: override map -> chord map -> fallback stripOct
              const baseLabel =
                displayMap?.[shownNote] ?? stripOct(shownNote);

              const labelText = prettyBase(baseLabel);

              return (
                <g key={k.noteSharp}>
                  <rect
                    x={k.x}
                    y={0}
                    width={BLACK_W}
                    height={BLACK_H}
                    rx={2}
                    ry={2}
                    fill={fill}
                    stroke="#000"
                    strokeWidth={1}
                  />

                                   {( (isPrimary && showPrimaryLabels) || (isSecondary && showSecondaryLabels) ) && (
                    <text
                      x={k.x + BLACK_W / 2}
                      y={BLACK_H + 10}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#111827"
                    >
                      {labelText}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}