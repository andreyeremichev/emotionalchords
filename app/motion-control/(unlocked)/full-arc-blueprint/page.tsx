// app/motion-control/full-arc-blueprint/page.tsx
import Link from "next/link";

type ArcId =
  | "FULL_ARC"
  | "P_TO_E"
  | "P_TO_D"
  | "P_TO_A"
  | "E_TO_D"
  | "D_TO_A"
  | "P_TO_E_TO_D";

const ROOT = "C";
const CHARACTER = "Structural";

// Root=C reference (same as your system copy)
const STATES = [
  {
    name: "Containment",
    icon: "🔴",
    bullets: ["Fixed floor", "Internal rotation", "Controlled friction", "No release"],
    lhEngine: "Pulse Octaves",
    otherModes: [
      { k: "Elastic", v: "LH: upper floor (beat 1 & 3). RH: block strike. Arrival: A–D–F." },
      { k: "Interwoven", v: "LH: upper floor (beat 1 & 3). RH: staggered entry. Arrival: D–A (transparent)." },
      { k: "Atmospheric", v: "LH: upper floor (beat 1 only). RH: sparse strike. Arrival: A–D / D–A shift (final grounding)." },
    ],
    collapseHard: [
      "Break the floor timing (uneven LH destroys compression immediately).",
      "Turn the top into a melody (continuous top-line phrasing releases pressure immediately).",
      "Change density mid-loop (adding/removing notes breaks identity immediately).",
    ],
    collapseSoft: [
      "Over-pedal (friction blurs; state weakens).",
      "Rush cell changes (pressure never settles; state weakens).",
    ],
  },
  {
    name: "Expansion",
    icon: "🔵",
    bullets: ["Floor shift", "Vertical widening", "Span increase"],
    lhEngine: "Breath Floor",
    otherModes: [
      { k: "Elastic", v: "LH: upper floor (beat 1 & 3). RH: block strike. Arrival: A–D–F." },
      { k: "Interwoven", v: "LH: upper floor (beat 1 & 3). RH: staggered entry. Arrival: D–A (transparent)." },
      { k: "Atmospheric", v: "LH: upper floor (beat 1 only). RH: sparse strike. Arrival: A–D / D–A shift (final grounding)." },
    ],
    collapseHard: [
      "Keep pounding LH like a motor (expansion collapses into containment immediately).",
      "Widen too fast (jump to extremes; expansion logic breaks immediately).",
      "Shift floor early (floor moves before the frame is full; expansion breaks immediately).",
    ],
    collapseSoft: [
      "Overfill inner voice (width becomes thick; openness weakens).",
      "Over-pedal (edges blur; widening becomes less readable).",
    ],
  },
  {
    name: "Dissolve",
    icon: "🟣",
    bullets: ["Structural thinning", "Note removal", "Compression toward anchor"],
    lhEngine: "Anchor Pulse",
    otherModes: [
      { k: "Elastic", v: "LH: upper floor (beat 1 & 3). RH: density alternates (triad ↔ dyad). Arrival: A–D–F." },
      { k: "Interwoven", v: "LH: upper floor (beat 1 & 3). RH: staggered entry makes drift audible. Arrival: D–A (transparent)." },
      { k: "Atmospheric", v: "LH: upper floor (beat 1 only). RH: sparse strike. Arrival: A–D / D–A shift (final grounding)." },
    ],
    collapseHard: [
      "Keep adding notes (thinning stops; dissolve breaks immediately).",
      "Move the floor (bottom starts shifting; dissolve becomes a different state immediately).",
      "Release everything at once (no gradual thinning; dissolve becomes an abrupt cut immediately).",
    ],
    collapseSoft: [
      "Make the inner too dramatic (big leaps; drift starts reading like melody).",
      "Over-pedal (thinning becomes unclear; state weakens).",
    ],
  },
  {
    name: "Arrival",
    icon: "🟢",
    bullets: ["Stable stack", "Open width", "Vertical clarity"],
    lhEngine: "Single Anchor Strike",
    otherModes: [
      { k: "Elastic", v: "Arrival voicing: A–D–F (warm bloom without stretch)." },
      { k: "Interwoven", v: "Arrival feel: staggered entry; transparent D–A landing." },
      { k: "Atmospheric", v: "Arrival feel: A–D / D–A shift with final grounding." },
    ],
    collapseHard: [
      "Restart a motor pulse (arrival collapses into containment immediately).",
      "Move the floor (any stepwise LH motion turns landing into drift immediately).",
      "Change density mid-bar (extra notes or removals during the bar break stability immediately).",
    ],
    collapseSoft: [
      "Overfill inner tones (width shrinks; arrival becomes thick).",
      "Rush the landing (stability never forms; arrival feels accidental).",
      "Add chromatic movement (destination clarity weakens; starts feeling like dissolve).",
    ],
  },
] as const;

const CHARACTER_PHILOSOPHY = [
  {
    name: "Structural",
    bullets: ["LH: octave pulse (4 beats)", "RH: block strike (simultaneous)", "Arrival: D–A–D (stable stack)"],
    useWhen: "You want clarity and architectural authority.",
  },
  {
    name: "Elastic",
    bullets: ["LH: upper floor (beat 1 & 3)", "RH: block strike (simultaneous)", "Arrival: A–D–F (warm bloom)"],
    useWhen: "You want lift without losing control.",
  },
  {
    name: "Interwoven",
    bullets: ["LH: upper floor (beat 1 & 3)", "RH: staggered entry (bottom → inner → top)", "Arrival: D–A (transparent landing)"],
    useWhen: "You want voice separation and space.",
  },
  {
    name: "Atmospheric",
    bullets: ["LH: upper floor (beat 1 only)", "RH: sparse strike (fewer attacks)", "Arrival: A–D / D–A shift (final grounding)"],
    useWhen: "You want suspended weight.",
  },
] as const;

const ARRIVAL_VARIATIONS = [
  { k: "Structural", v: "D–A–D" },
  { k: "Elastic", v: "A–D–F" },
  { k: "Interwoven", v: "D–A" },
  { k: "Atmospheric", v: "A–D / D–A shift" },
] as const;

const ARCS: Array<{ id: ArcId; label: string; sequence: string[] }> = [
  { id: "FULL_ARC", label: "1. Containment → Expansion → Dissolve → Arrival", sequence: ["Containment", "Expansion", "Dissolve", "Arrival"] },
  { id: "P_TO_E", label: "2. Containment → Expansion", sequence: ["Containment", "Expansion"] },
  { id: "P_TO_D", label: "3. Containment → Dissolve", sequence: ["Containment", "Dissolve"] },
  { id: "P_TO_A", label: "4. Containment → Arrival", sequence: ["Containment", "Arrival"] },
  { id: "E_TO_D", label: "5. Expansion → Dissolve", sequence: ["Expansion", "Dissolve"] },
  { id: "D_TO_A", label: "6. Dissolve → Arrival", sequence: ["Dissolve", "Arrival"] },
  { id: "P_TO_E_TO_D", label: "7. Containment → Expansion → Dissolve", sequence: ["Containment", "Expansion", "Dissolve"] },
];

// Architecture map (Root C, Structural) — show compact “cells” per state.
// This is intentionally concise for print.
const MAP_C_STRUCTURAL: Record<string, { lh: string; rhCells: string[] }> = {
  Containment: {
    lh: "LH: CC ×4 | DD ×4 | EbEb ×4 | DD ×4 | DD ×4 | DD ×4",
    rhCells: ["DEbG", "DFAb", "DEbAb", "DGBb", "DABb", "DGBb"],
  },
  Expansion: {
    lh: "LH: CC ×4 (floor stays until full)",
    rhCells: ["CEbG", "CFAb", "CGBb", "CAbC", "CBbD", "CBD", "EbGC"],
  },
  Dissolve: {
    lh: "LH: D (1&3) anchor",
    rhCells: ["FAbD", "FGD", "FAD", "FBbD", "FCD", "FC#D"],
  },
  Arrival: {
    lh: "LH: D (1) anchor",
    rhCells: ["DAD", "DEA", "DFA", "DGB", "DAD"],
  },
};
type ArchCell = { lh: string[]; rh: string[] };
type ArchChunk = { label: string; blockTitle: string; cells: ArchCell[] };

function toFlatBase(note: string) {
  // input like "D#4" -> "Eb" (no octave)
  const m = /^([A-G])(#)?(\d)$/.exec(note);
  if (!m) return note.replace(/\d$/, "");
  const base = `${m[1]}${m[2] ?? ""}`;
  const sharpToFlat: Record<string, string> = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  };
  return sharpToFlat[base] ?? base;
}

function triadNoOct(notes: string[]) {
  return notes.map(toFlatBase).join("");
}

function lhPairNoOct(lh: string[]) {
  return lh.map(toFlatBase).join(""); // e.g. ["C2","C3"] -> "CC"
}

function lhStructuralLabel(blockTitle: string, lh: string[]) {
  const pair = lhPairNoOct(lh);               // "CC"
  const upper = lh[1] ? toFlatBase(lh[1]) : toFlatBase(lh[0] ?? "");

  if (blockTitle === "Containment") return `${pair} ×4`;
  if (blockTitle === "Expansion") return `${pair} ×4`;
  if (blockTitle === "Dissolve") return `${upper} (1&3)`;
  if (blockTitle === "Arrival") return `${pair} (1)`;
  if (blockTitle === "Transition") return `${pair}`; // transitions are short; keep simple
  return pair;
}

function ArchChunkGrid({ chunk }: { chunk: ArchChunk }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-medium opacity-90">{chunk.label}</div>

      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${chunk.cells.length}, minmax(0, 1fr))` }}
      >
        {chunk.cells.map((c, i) => (
          <div
            key={`${chunk.label}-${i}`}
            className="px-2 py-2 text-center text-sm border-l border-r opacity-90"
          >
            <div className="text-xs opacity-60">RH</div>
            <div className="font-medium">{triadNoOct(c.rh)}</div>
            <div className="mt-2 text-xs opacity-60">LH</div>
            <div className="font-medium">{lhStructuralLabel(chunk.blockTitle, c.lh)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Root = C reference architecture (Structural)
 * This duplicates the locked system definitions intentionally for a printable blueprint.
 */
const ARCH_C: Record<string, ArchChunk> = {
  // ----- Containment (aka Held Pressure in earlier notes, now named Containment in Full Arc) -----
  C_L1: {
    label: "Containment — Loop 1",
    blockTitle: "Containment",
    cells: [
      { lh: ["C2", "C3"], rh: ["D4", "Eb4", "G4"] },
      { lh: ["D2", "D3"], rh: ["D4", "F4", "Ab4"] },
      { lh: ["Eb2", "Eb3"], rh: ["D4", "Eb4", "Ab4"] },
      { lh: ["D2", "D3"], rh: ["D4", "G4", "Bb4"] },
      { lh: ["D2", "D3"], rh: ["D4", "A4", "Bb4"] },
      { lh: ["D2", "D3"], rh: ["D4", "G4", "Bb4"] },
    ],
  },
  C_L2: {
    label: "Containment — Loop 2",
    blockTitle: "Containment",
    cells: [
      { lh: ["C2", "C3"], rh: ["Eb4", "G4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
      { lh: ["Eb2", "Eb3"], rh: ["Eb4", "Ab4", "D5"] },
      { lh: ["D2", "D3"], rh: ["G4", "Bb4", "D5"] },
      { lh: ["D2", "D3"], rh: ["A4", "Bb4", "D5"] },
      { lh: ["D2", "D3"], rh: ["A4", "C5", "Eb5"] },
    ],
  },

  // ----- Expansion loops -----
  E_L1: {
    label: "Expansion — Loop 1",
    blockTitle: "Expansion",
    cells: [
      { lh: ["C2", "C3"], rh: ["C4", "Eb4", "G4"] },
      { lh: ["C2", "C3"], rh: ["C4", "F4", "Ab4"] },
      { lh: ["C2", "C3"], rh: ["C4", "G4", "Bb4"] },
      { lh: ["C2", "C3"], rh: ["C4", "Ab4", "C5"] },
      { lh: ["C2", "C3"], rh: ["C4", "Bb4", "D5"] },
      { lh: ["C2", "C3"], rh: ["C4", "B4", "D5"] },
      { lh: ["C2", "C3"], rh: ["Eb4", "G4", "C5"] },
    ],
  },
  E_L2: {
    label: "Expansion — Loop 2",
    blockTitle: "Expansion",
    cells: [
      { lh: ["D2", "D3"], rh: ["D4", "F4", "Ab4"] },
      { lh: ["D2", "D3"], rh: ["D4", "G4", "Bb4"] },
      { lh: ["D2", "D3"], rh: ["D4", "A4", "C5"] },
      { lh: ["D2", "D3"], rh: ["D4", "Bb4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
    ],
  },
  E_L3: {
    label: "Expansion — Loop 3",
    blockTitle: "Expansion",
    cells: [
      { lh: ["Eb2", "Eb3"], rh: ["Eb4", "G4", "Bb4"] },
      { lh: ["Eb2", "Eb3"], rh: ["Eb4", "Ab4", "C5"] },
      { lh: ["Eb2", "Eb3"], rh: ["Eb4", "Bb4", "D5"] },
      { lh: ["Eb2", "Eb3"], rh: ["Eb4", "Bb4", "Eb5"] },
      { lh: ["Eb2", "Eb3"], rh: ["G4", "Bb4", "Eb5"] },
    ],
  },
  E_L4: {
    label: "Expansion — Loop 4",
    blockTitle: "Expansion",
    cells: [
      { lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
      { lh: ["D2", "D3"], rh: ["G4", "Bb4", "D5"] },
      { lh: ["D2", "D3"], rh: ["A4", "C5", "D5"] },
      { lh: ["D2", "D3"], rh: ["Bb4", "C5", "D5"] },
    ],
  },

  // ----- Dissolve loops -----
  D_L1: {
    label: "Dissolve — Loop 1",
    blockTitle: "Dissolve",
    cells: [
      { lh: ["D2", "D3"], rh: ["F4", "Ab4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "G4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "A4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "Bb4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "C5", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "C#5", "D5"] },
    ],
  },
  D_L2: {
    label: "Dissolve — Loop 2",
    blockTitle: "Dissolve",
    cells: [
      { lh: ["D2", "D3"], rh: ["F4", "C5", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "C#5", "D5"] },
      { lh: ["D2", "D3"], rh: ["C5", "D5"] },
      { lh: ["D2", "D3"], rh: ["D5"] },
    ],
  },

  // ----- Arrival loop -----
  A_L1: {
    label: "Arrival — Loop 1",
    blockTitle: "Arrival",
    cells: [
      { lh: ["D2", "D3"], rh: ["D4", "A4", "D5"] },
      { lh: ["D2", "D3"], rh: ["D4", "E4", "A4"] },
      { lh: ["D2", "D3"], rh: ["D4", "F4", "A4"] },
      { lh: ["D2", "D3"], rh: ["D4", "G4", "B4"] },
      { lh: ["D2", "D3"], rh: ["D4", "A4", "D5"] },
    ],
  },

  // ----- Transitions (short bridges) -----
  T_P_E: {
    label: "Transition: Containment → Expansion",
    blockTitle: "Transition",
    cells: [
      { lh: ["D2", "D3"], rh: ["A4", "C5", "Eb5"] },
      { lh: ["D2", "D3"], rh: ["G4", "Bb4", "D5"] },
      { lh: ["C2", "C3"], rh: ["C4", "Eb4", "G4"] },
    ],
  },
  T_E_D: {
    label: "Transition: Expansion → Dissolve",
    blockTitle: "Transition",
    cells: [
      { lh: ["D2", "D3"], rh: ["D4", "A4", "C5"] },
      { lh: ["D2", "D3"], rh: ["F4", "A4", "D5"] },
      { lh: ["D2", "D3"], rh: ["F4", "C5", "D5"] },
    ],
  },
  T_D_A: {
    label: "Transition: Dissolve → Arrival",
    blockTitle: "Transition",
    cells: [{ lh: ["D2", "D3"], rh: ["A4", "D5", "F5"] }],
  },
};

function arcChunksForCStructural(arc: ArcId): ArchChunk[] {
  const out: ArchChunk[] = [];

  const addContainment = () => out.push(ARCH_C.C_L1, ARCH_C.C_L2);
  const addExpansion = () => out.push(ARCH_C.E_L1, ARCH_C.E_L2, ARCH_C.E_L3, ARCH_C.E_L4);
  const addDissolve = () => out.push(ARCH_C.D_L1, ARCH_C.D_L2);
  const addArrival = () => out.push(ARCH_C.A_L1);

  const addTPE = () => out.push(ARCH_C.T_P_E);
  const addTED = () => out.push(ARCH_C.T_E_D);
  const addTDA = () => out.push(ARCH_C.T_D_A);

  if (arc === "FULL_ARC") {
    addContainment();
    addTPE();
    addExpansion();
    addTED();
    addDissolve();
    addTDA();
    addArrival();
  } else if (arc === "P_TO_E") {
    addContainment();
    addTPE();
    addExpansion();
  } else if (arc === "P_TO_D") {
    addContainment();
    addDissolve();
  } else if (arc === "P_TO_A") {
    addContainment();
    addArrival();
  } else if (arc === "E_TO_D") {
    addExpansion();
    addTED();
    addDissolve();
  } else if (arc === "D_TO_A") {
    addDissolve();
    addTDA();
    addArrival();
  } else if (arc === "P_TO_E_TO_D") {
    addContainment();
    addTPE();
    addExpansion();
    addTED();
    addDissolve();
  }

  return out;
}

export default function MotionControlFullArcBlueprintPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Cover */}
      <section className="rounded-2xl border p-6">
        <div className="text-sm uppercase tracking-wide opacity-70">Motion Control</div>
        <h1 className="mt-2 text-3xl font-semibold">Full Arc</h1>
        <div className="mt-2 text-sm opacity-80">A Finite System for Controlled Harmonic Motion</div>
        <div className="mt-4 text-lg font-medium">Four states. Seven arcs. One architecture.</div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <div className="rounded-full border px-3 py-1 opacity-80">Root: {ROOT}</div>
          <div className="rounded-full border px-3 py-1 opacity-80">Character: {CHARACTER}</div>
          <div className="ml-auto flex gap-3">
            <Link href="/motion-control" className="underline opacity-80">
              Back to system
            </Link>
            <Link href="/motion-control/full-arc" className="underline opacity-80">
              Open Full Arc
            </Link>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Why This Works</h2>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-4">
            <div className="text-sm uppercase tracking-wide opacity-70">State defines</div>
            <ul className="mt-3 space-y-1 leading-6 opacity-90">
              <li>• Harmonic motion</li>
              <li>• Compression / widening</li>
              <li>• Dissolve thinning</li>
            </ul>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm uppercase tracking-wide opacity-70">Character defines</div>
            <ul className="mt-3 space-y-1 leading-6 opacity-90">
              <li>• LH density</li>
              <li>• RH articulation feel</li>
              <li>• Arrival voicing</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 leading-7 opacity-90">
          Nothing overlaps. Nothing collides. No cognitive explosion.
          <br />
          The harmonic skeleton remains stable. Only the motion engine changes.
        </div>
      </section>

      {/* Four States */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">The Four States</h2>

        <div className="mt-6 grid gap-6">
          {STATES.map((s) => (
            <div key={s.name} className="rounded-xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-lg font-medium">
                  <span className="mr-2">{s.icon}</span>
                  {s.name}
                </div>
                <div className="text-sm opacity-80">LH Engine: <span className="font-medium">{s.lhEngine}</span></div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm uppercase tracking-wide opacity-70">Mechanical identity</div>
                  <ul className="mt-2 space-y-1 leading-6 opacity-90">
                    {s.bullets.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-sm uppercase tracking-wide opacity-70">Other characters</div>
                  <ul className="mt-2 space-y-1 leading-6 opacity-90">
                    {s.otherModes.map((m) => (
                      <li key={m.k}>
                        <span className="font-medium">{m.k}:</span> {m.v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-sm uppercase tracking-wide opacity-70">
  Bonus: how to collapse it on purpose
</div>

<div className="mt-3 space-y-3 text-sm leading-6 opacity-90">

  <div>
    <div className="font-medium opacity-80">Hard Collapse (immediate)</div>
    <ul className="mt-1 list-disc pl-5 space-y-1">
      {s.collapseHard.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  </div>

  <div>
    <div className="font-medium opacity-80">Soft Degradation (weakens state)</div>
    <ul className="mt-1 list-disc pl-5 space-y-1">
      {s.collapseSoft.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  </div>

</div>
            </div>
          ))}
        </div>

        {/* LH Engine table */}
        <div className="mt-8 rounded-xl border p-5">
          <div className="text-sm uppercase tracking-wide opacity-70">LH Engine per State</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="opacity-70">
                <tr>
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2">LH Engine Type</th>
                </tr>
              </thead>
              <tbody className="opacity-90">
                <tr className="border-t">
                  <td className="py-2 pr-4">Containment</td>
                  <td className="py-2">Pulse Octaves</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 pr-4">Expansion</td>
                  <td className="py-2">Breath Floor</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 pr-4">Dissolve</td>
                  <td className="py-2">Anchor Pulse</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2 pr-4">Arrival</td>
                  <td className="py-2">Single Anchor Strike</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 leading-6 opacity-90">
            Simple. Mechanical. Deterministic.
          </div>
        </div>
      </section>

      {/* Character System */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Character System</h2>

        <div className="mt-4 leading-7 opacity-90">
          Character does not change harmony.
          <br />
          Character changes density, timing feel, and Arrival identity.
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CHARACTER_PHILOSOPHY.map((c) => (
            <div key={c.name} className="rounded-xl border p-5">
              <div className="text-lg font-medium">{c.name}</div>
              <ul className="mt-2 space-y-1 leading-6 opacity-90">
                {c.bullets.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
              <div className="mt-4 text-sm opacity-80">
                <span className="font-medium">Use when:</span> {c.useWhen}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Arrival Variations */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Arrival Variations</h2>

        <div className="mt-4 rounded-xl border p-5">
          <div className="text-sm uppercase tracking-wide opacity-70">Visual comparison</div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="opacity-70">
                <tr>
                  <th className="py-2 pr-4">Character</th>
                  <th className="py-2">Arrival RH Shape</th>
                </tr>
              </thead>
              <tbody className="opacity-90">
                {ARRIVAL_VARIATIONS.map((r) => (
                  <tr key={r.k} className="border-t">
                    <td className="py-2 pr-4">{r.k}</td>
                    <td className="py-2">{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 leading-7 opacity-90">
            Arrival is the only place where vertical identity changes dramatically.
            <br />
            This is intentional.
          </div>
        </div>
      </section>

      {/* Seven Arcs + Architecture Map */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">The Seven Arcs</h2>

        <div className="mt-4 space-y-6">
  {ARCS.map((a) => (
    <div key={a.id} className="rounded-2xl border p-5">
      <div className="font-medium">{a.label}</div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm opacity-90">
        {a.sequence.map((s, i) => (
          <span key={`${a.id}-${s}-${i}`} className="rounded-full border px-3 py-1">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-xl border p-4">
        <div className="text-sm uppercase tracking-wide opacity-70">
          Architecture (Root {ROOT}, {CHARACTER})
        </div>
        <div className="mt-2 text-sm opacity-85">
          Full chunk map. Same ordering as the system page.
        </div>

        <div className="mt-4 space-y-4">
          {arcChunksForCStructural(a.id as ArcId).map((ch) => (
            <ArchChunkGrid key={ch.label} chunk={ch} />
          ))}
        </div>
      </div>
    </div>
  ))}
</div>
      </section>

      {/* How to practice */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">How to Practice</h2>

        <ul className="mt-4 space-y-2 leading-7 opacity-90">
          <li>• Never change state mid-loop.</li>
          <li>• Character only modifies articulation.</li>
          <li>• Practice each state independently before running arcs.</li>
          <li>• Run arcs only once per repetition.</li>
        </ul>
      </section>

      {/* Closure */}
      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">System Closure</h2>
        <div className="mt-4 leading-7 opacity-90">
          Motion Control is finite.
          <br />
          There are no hidden states.
          <br />
          Mastering density and release inside a fixed architecture is the point.
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
  <a
    href="/motion-control/Motion-Control-Full-Arc-Blueprint.pdf"
    download
    className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium hover:bg-black/5"
  >
    Download PDF Version
  </a>

  <div className="text-sm opacity-70">
    Static reference. Same structure. Print-ready.
  </div>
</div>
      </section>

      
    </main>
  );
}