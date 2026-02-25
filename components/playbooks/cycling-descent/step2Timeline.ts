// components/playbooks/cycling-descent/step2Timeline.ts

export type ChordId = "DFA" | "CEA" | "BbDF" | "ACF" | "ACE" | "ACsE";

export type Step2Event = {
  kind: "NOTE" | "GAP";
  chordId: ChordId;

  // UI
  ruleText: string;

  // What is played NOW (and therefore what must be highlighted NOW)
  lhKey: string | null;
  rhKeys: string[]; // 0..n

  ms: number;
};

const NOTE_MS = 1000;
const GAP_MS = 250;

const LH: Record<ChordId, [string, string, string]> = {
  DFA: ["D3", "F3", "A3"],
  CEA: ["C3", "E3", "A3"],
  BbDF: ["A#2", "D3", "F3"], // B♭2–D3–F3 (audio identity uses A#2)
  ACF: ["A2", "C3", "F3"],
  ACE: ["A2", "C3", "E3"],
  ACsE: ["A2", "C#3", "E3"],
};

const RULE_SINGLE = "play any note of the current chord";
const RULE_DYAD = "play any two notes of the current chord";
const RULE_ARP =
  "on this last chord play arpeggios using two black keys (B♭ and C♯) and all white keys (except C)";

function pushGap(out: Step2Event[], chordId: ChordId, ruleText: string) {
  out.push({
    kind: "GAP",
    chordId,
    ruleText,
    lhKey: null,
    rhKeys: [],
    ms: GAP_MS,
  });
}

function pushLHStep(
  out: Step2Event[],
  chordId: ChordId,
  stepIndex: 0 | 1 | 2,
  ruleText: string,
  rhKeysNow: string[]
) {
  const lhKey = LH[chordId][stepIndex];

  out.push({
    kind: "NOTE",
    chordId,
    ruleText,
    lhKey,
    rhKeys: rhKeysNow,
    ms: NOTE_MS,
  });

  pushGap(out, chordId, ruleText);
}

export function buildStep2Timeline(): Step2Event[] {
  const out: Step2Event[] = [];

  // -----------------------------
  // Section A: Single RH notes
  // DFA ×4 ; CEA ×4 ; BbDF ×4
  // Rule: play any note of current chord
  // RH plays ONLY at pass start (step 0) to avoid misleading highlight
  // -----------------------------

  const singleRhFor = (chordId: ChordId, passIndex0: number): string => {
    if (chordId === "DFA") return (["D4", "F4", "A4", "F4"][passIndex0] ?? "D4");
    if (chordId === "CEA") return (["C4", "E4", "A4", "E4"][passIndex0] ?? "C4");
    // BbDF
    return (["A#4", "D5", "F4", "D5"][passIndex0] ?? "A#4");
  };

  const pushChordSingle = (chordId: "DFA" | "CEA" | "BbDF", repeats: number) => {
    for (let pass = 0; pass < repeats; pass++) {
      // step 0 (bottom): play LH + one RH note
      pushLHStep(out, chordId, 0, RULE_SINGLE, [singleRhFor(chordId, pass)]);
      // step 1 (middle): LH only
      pushLHStep(out, chordId, 1, RULE_SINGLE, []);
      // step 2 (top): LH only
      pushLHStep(out, chordId, 2, RULE_SINGLE, []);
    }
  };

  pushChordSingle("DFA", 4);
  pushChordSingle("CEA", 4);
  pushChordSingle("BbDF", 4);

  // -----------------------------
  // Section B: Two-note blocks (dyads)
  // ACF ×4 ; ACE ×2
  // Rule: play any two notes of current chord
  // RH dyad plays ONLY at pass start (step 0); other steps LH only
  // -----------------------------

  const dyadsACF: Array<[string, string]> = [
    ["A4", "C5"],
    ["C5", "F5"],
    ["A4", "F5"],
    ["C5", "A5"],
  ];

  for (let pass = 0; pass < 4; pass++) {
    const d = dyadsACF[pass] ?? dyadsACF[0];
    pushLHStep(out, "ACF", 0, RULE_DYAD, [d[0], d[1]]);
    pushLHStep(out, "ACF", 1, RULE_DYAD, []);
    pushLHStep(out, "ACF", 2, RULE_DYAD, []);
  }

  const dyadsACE: Array<[string, string]> = [
    ["A4", "E5"],
    ["C5", "E5"],
  ];

  for (let pass = 0; pass < 2; pass++) {
    const d = dyadsACE[pass] ?? dyadsACE[0];
    pushLHStep(out, "ACE", 0, RULE_DYAD, [d[0], d[1]]);
    pushLHStep(out, "ACE", 1, RULE_DYAD, []);
    pushLHStep(out, "ACE", 2, RULE_DYAD, []);
  }

  // -----------------------------
  // Section C: Arpeggios on ACsE
  // 10 passes (like your Step 2 spec)
  // Rule: arpeggios using B♭ and C♯ + all white keys (except C)
  // Here RH plays on EVERY LH step (so highlight stays honest)
  // -----------------------------

  // 10 passes × 3 steps = 30 RH notes
  const rhSteps: string[] = [];

  // Passes 1–3: inside chord arpeggio per step
  for (let p = 0; p < 3; p++) rhSteps.push("A4", "C#5", "E5");

  // Passes 4–7: AA#C#D forward/back repeating across steps
  const cycle = ["A4", "A#4", "C#5", "D5", "D5", "C#5", "A#4", "A4"];
  while (rhSteps.length < 9 + 12) rhSteps.push(...cycle);
  rhSteps.length = 21;

  // Passes 8–10 (9 steps): full run A4 A#4 C#5 D5 E5 F5 G5 A5 A#5
  rhSteps.push("A4", "A#4", "C#5", "D5", "E5", "F5", "G5", "A5", "A#5");
  rhSteps.length = 30;

  let k = 0;
  for (let pass = 0; pass < 10; pass++) {
    // step 0
    pushLHStep(out, "ACsE", 0, RULE_ARP, [rhSteps[k++]]);
    // step 1
    pushLHStep(out, "ACsE", 1, RULE_ARP, [rhSteps[k++]]);
    // step 2
    pushLHStep(out, "ACsE", 2, RULE_ARP, [rhSteps[k++]]);
  }

  return out;
}