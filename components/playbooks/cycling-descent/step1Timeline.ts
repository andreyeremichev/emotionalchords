// components/playbook/cycling-descent/step1Timeline.ts

export type KeyId =
  | "A2"
  | "A#2"
  | "B2"
  | "C3"
  | "C#3"
  | "D3"
  | "D#3"
  | "E3"
  | "F3"
  | "F#3"
  | "G3"
  | "G#3"
  | "A3"
  | "A#3"
  | "B3"
  | "C4"
  | "C#4"
  | "D4"
  | "E4"
  | "F4"
  | "G4"
  | "A4"
  | "B4"
  | "C5"
  | "C#5"
  | "D5"
  | "E5"
  | "F5"
  | "G5"
  | "A5"
  | "B5"
  | "C6";

export type Label = string;

export type TimelineEvent = {
  kind: "NOTE" | "GAP";

  // Canonical key identity (sharps-only) for audio + keyboard highlight
  key?: KeyId;

  // What the user sees for the CURRENT note (label layer)
  keyLabel?: Label;

  // Triad to highlight (canonical)
  chord: [KeyId, KeyId, KeyId];

  // Labels for the triad (same order)
  chordLabels: [Label, Label, Label];

  topText?: string;
  bottomText?: string;
  passLabel?: string;

  ms: number;
};

const NOTE_MS = 1000;
const GAP_MS = 500;

type ChordPack = {
  chord: [KeyId, KeyId, KeyId];
  chordLabels: [Label, Label, Label];
};

function chord(
  b: KeyId,
  m: KeyId,
  t: KeyId,
  bl: Label,
  ml: Label,
  tl: Label
): ChordPack {
  return { chord: [b, m, t], chordLabels: [bl, ml, tl] };
}

function pushTriadPass(
  out: TimelineEvent[],
  pack: ChordPack,
  topText: string | undefined,
  repeats: number,
  options?: {
    passCounterPrefix?: string; // e.g. "Pass"
    passStart?: number;
    passSpecialText?: (passNum: number) => string | undefined;
  }
) {
  const { chord, chordLabels } = pack;
  const [b, m, t] = chord;
  const [bl, ml, tl] = chordLabels;

  for (let i = 0; i < repeats; i++) {
    const passNum = (options?.passStart ?? 1) + i;
    const special = options?.passSpecialText?.(passNum);
    const passLabel = options?.passCounterPrefix
      ? `${options.passCounterPrefix} ${passNum}`
      : undefined;

    const effectiveTop = special ?? topText;

    // NOTE bottom
    out.push({
      kind: "NOTE",
      key: b,
      keyLabel: bl,
      chord,
      chordLabels,
      ms: NOTE_MS,
      topText: effectiveTop,
      bottomText: "Bottom",
      passLabel,
    });
    out.push({
      kind: "GAP",
      chord,
      chordLabels,
      ms: GAP_MS,
      topText: effectiveTop,
      bottomText: "",
      passLabel,
    });

    // NOTE middle
    out.push({
      kind: "NOTE",
      key: m,
      keyLabel: ml,
      chord,
      chordLabels,
      ms: NOTE_MS,
      topText: effectiveTop,
      bottomText: "Middle",
      passLabel,
    });
    out.push({
      kind: "GAP",
      chord,
      chordLabels,
      ms: GAP_MS,
      topText: effectiveTop,
      bottomText: "",
      passLabel,
    });

    // NOTE top
    out.push({
      kind: "NOTE",
      key: t,
      keyLabel: tl,
      chord,
      chordLabels,
      ms: NOTE_MS,
      topText: effectiveTop,
      bottomText: "Top",
      passLabel,
    });
    out.push({
      kind: "GAP",
      chord,
      chordLabels,
      ms: GAP_MS,
      topText: effectiveTop,
      bottomText: "",
      passLabel,
    });
  }
}

export function buildStep1Timeline(): TimelineEvent[] {
  const out: TimelineEvent[] = [];

  // PART 1: D–F–A ×4 (D3-F3-A3)
  const DFA = chord("D3", "F3", "A3", "D3", "F3", "A3");
  pushTriadPass(
    out,
    DFA,
    "The left hand always plays three notes — Bottom, Middle, Top. Always.",
    2
  );
  pushTriadPass(out, DFA, "Fingering is 4–2–1", 2);

  // PART 2: C–E–A ×4 (C3-E3-A3)
  const CEA = chord("C3", "E3", "A3", "C3", "E3", "A3");
  pushTriadPass(
    out,
    CEA,
    "Moving downward to C–E–A. You slide the same motion lower.",
    2
  );
  pushTriadPass(out, CEA, "Fingering is 5–3–1", 2);

  // PART 3: B♭–D–F ×4
  // Canonical key for the black key is A#3; label is B♭3 (descending spelling)
  const BbDF = chord("A#2", "D3", "F3", "B♭2", "D3", "F3");
  pushTriadPass(
    out,
    BbDF,
    "Moving downward to B♭–D–F. You slide the same motion lower.",
    2
  );
  pushTriadPass(out, BbDF, "Fingering is 4–2–1", 2);

  // PART 4: A–C–F ×4 (A2-C3-F3)
  const ACF = chord("A2", "C3", "F3", "A2", "C3", "F3");
  pushTriadPass(
    out,
    ACF,
    "Moving downward to A–C–F. You slide the same motion lower.",
    2
  );
  pushTriadPass(out, ACF, "Fingering is 5–3–1", 2);

  // PART 5: A–C–E ×2 (A2-C3-E3)
  const ACE = chord("A2", "C3", "E3", "A2", "C3", "E3");
  pushTriadPass(
    out,
    ACE,
    "Dropping the top note from F to E. Play this two times.",
    2
  );

  // PART 6: A–C♯–E ×6 (A2-C#3-E3), label uses ♯ glyph
  const ACsE = chord("A2", "C#3", "E3", "A2", "C♯3", "E3");
  pushTriadPass(
    out,
    ACsE,
    "Raise the middle note from C to C♯. Stay here for ten passes.",
    6,
    {
      passCounterPrefix: "Pass",
      passStart: 1,
      passSpecialText: (p) => {
        if (p === 8) return "Get ready to loop back to D–F–A";
        if (p === 9 || p === 10)
          return "Next pass is D–F–A with 4–2–1 fingerings";
        return undefined;
      },
    }
  );

  // LOOP BACK: D–F–A ×2 then STOP
  pushTriadPass(out, DFA, "Loop to D–F–A", 2);

  return out;
}