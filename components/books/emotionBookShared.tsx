"use client";

import React from "react";

export type NoteName =
  | "A2"
  | "A#2"
  | "B2"
  | "C2"
  | "C#2"
  | "D2"
  | "D#2"
  | "E2"
  | "F2"
  | "F#2"
  | "G2"
  | "G#2"
  | "A3"
  | "A#3"
  | "B3"
  | "C3"
  | "C#3"
  | "D3"
  | "D#3"
  | "E3"
  | "F3"
  | "F#3"
  | "G3"
  | "G#3"
  | "A4"
  | "A#4"
  | "B4"
  | "C4"
  | "C#4"
  | "D4"
  | "D#4"
  | "E4"
  | "F4"
  | "F#4"
  | "G4"
  | "G#4"
  | "A5"
  | "A#5"
  | "B5"
  | "C5"
  | "C#5"
  | "D5"
  | "D#5"
  | "E5"
  | "F5"
  | "F#5"
  | "G5"
  | "G#5";

export type KeyboardBarData = {
  chordName?: string;
  activeNotes: NoteName[];
  lhLabel: string;
};


export type RhythmPattern = {
  beats: string[];
  rh: string[];
  lh: string[];
};

export type ProgressionLines = {
  flowRh?: string;
  flowLh?: string;
  flowExtra?: string[];
  colorRh?: string;
  colorLh?: string;
  colorExtra?: string[];
};

export type VariationData = {
  title: string;
  pattern: RhythmPattern;
  progressionLines?: ProgressionLines;
  playerFeel?: string[];
  ruleNote?: string;
  watchNote?: string;
};

export type TransitionData = {
  title: string;
  transitionLabel: string;
  pattern: RhythmPattern;
  progressionLines?: ProgressionLines;
  playerFeel?: string[];
  resultText?: string[];
};
export type KeyboardSliceSpec = {
  start: NoteName;
  end: NoteName;
};

export type EmotionPageData = {
  emotionTitle: string;
  coreDefinition: {
    main: string;
    lines: string[];
  };
  workingVoicing: {
    flowRh: string;
    flowLh: string;
    colorRh: string;
    colorLh: string;
  };
  flowBars: KeyboardBarData[];
  colorBars: KeyboardBarData[];
  basePattern: RhythmPattern;
  flowPlayerFeel: string[];
  colorPlayerFeel: string[];
  safeVariations: {
    title: string;
    intro?: string;
    items: VariationData[];
  };
  keyboardSlice: KeyboardSliceSpec;
  hardBreak: {
    title: string;
    patternTitle?: string;
    pattern: RhythmPattern;
    progressionLines?: ProgressionLines;
    playerFeel?: string[];
    resultText?: string[];
    handPriority?: {
      keeper: string;
      breaker: string;
    };
  };
    performanceNotes: {
    microVariations?: string[];
    loopTolerance?: string[];
    mixingNotes?: string[];
    liveCue?: string;
    pedalTips?: {
      flow: string;
      color: string;
    };
    summary?: {
      stay: string[];
      break: string[];
    };
  };
  transition?: TransitionData;
};

type KeySpec = {
  id: string;
  label: NoteName;
  pitchClass: string;
  type: "white" | "black";
  x: number;
  width: number;
};

const WHITE_KEY_W = 42;
const BLACK_KEY_W = 26;
const WHITE_KEY_H = 210;
const BLACK_KEY_H = 110;
const TOP_STRIP_H = 14;

const ALL_NOTES: NoteName[] = [
  "C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2",
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
];

function pitchClassOf(note: NoteName) {
  return note.replace(/[0-9]/g, "");
}

function isBlack(note: NoteName) {
  return pitchClassOf(note).includes("#");
}

function buildKeyboardSlice(start: NoteName, end: NoteName): KeySpec[] {
  const startIdx = ALL_NOTES.indexOf(start);
  const endIdx = ALL_NOTES.indexOf(end);

  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    throw new Error(`Invalid keyboard slice: ${start} → ${end}`);
  }

  const slice = ALL_NOTES.slice(startIdx, endIdx + 1);

  let whiteIndex = 0;
  const whiteKeys: KeySpec[] = [];
  const blackKeys: KeySpec[] = [];

  for (const note of slice) {
    if (!isBlack(note)) {
      whiteKeys.push({
        id: note,
        label: note,
        pitchClass: pitchClassOf(note),
        type: "white",
        x: whiteIndex * WHITE_KEY_W,
        width: WHITE_KEY_W,
      });
      whiteIndex += 1;
    }
  }

  for (const note of slice) {
    if (!isBlack(note)) continue;

    const prevWhite = slice
      .slice(0, slice.indexOf(note))
      .filter((n) => !isBlack(n)).length - 1;

    blackKeys.push({
      id: note,
      label: note,
      pitchClass: pitchClassOf(note),
      type: "black",
      x: prevWhite * WHITE_KEY_W + (WHITE_KEY_W - BLACK_KEY_W / 2),
      width: BLACK_KEY_W,
    });
  }

  return [...whiteKeys, ...blackKeys];
}

/**
 * Fixed print-safe slice for Calm/system pages:
 * A3 B3 C4 D4 E4 F4 G4 A4
 * black: A#3 C#4 D#4 F#4 G#4
 *
 * Same rendered slice for all bars inside one emotion page.
 * Highlighting is octave-specific and only lights the canonical notes passed in.
 */
const KEYS: KeySpec[] = [
  { id: "A3", label: "A3", pitchClass: "A", type: "white", x: 0, width: WHITE_KEY_W },
  { id: "B3", label: "B3", pitchClass: "B", type: "white", x: 42, width: WHITE_KEY_W },
  { id: "C4", label: "C4", pitchClass: "C", type: "white", x: 84, width: WHITE_KEY_W },
  { id: "D4", label: "D4", pitchClass: "D", type: "white", x: 126, width: WHITE_KEY_W },
  { id: "E4", label: "E4", pitchClass: "E", type: "white", x: 168, width: WHITE_KEY_W },
  { id: "F4", label: "F4", pitchClass: "F", type: "white", x: 210, width: WHITE_KEY_W },
  { id: "G4", label: "G4", pitchClass: "G", type: "white", x: 252, width: WHITE_KEY_W },
  { id: "A4", label: "A4", pitchClass: "A", type: "white", x: 294, width: WHITE_KEY_W },

  { id: "A#3", label: "A#3", pitchClass: "A#", type: "black", x: 29, width: BLACK_KEY_W },
  { id: "C#4", label: "C#4", pitchClass: "C#", type: "black", x: 113, width: BLACK_KEY_W },
  { id: "D#4", label: "D#4", pitchClass: "D#", type: "black", x: 155, width: BLACK_KEY_W },
  { id: "F#4", label: "F#4", pitchClass: "F#", type: "black", x: 239, width: BLACK_KEY_W },
  { id: "G#4", label: "G#4", pitchClass: "G#", type: "black", x: 281, width: BLACK_KEY_W },
];

const SVG_W = 336;
const SVG_H = 224;

function normalizeNote(n: NoteName): string {
  return n;
}

function normalizeDisplayNote(n: string): string {
  return n.replace("#", "♯");
}
function normalizeDisplayText(s: string) {
  return s.replace(/#/g, "♯");
}

function isExactActive(keyLabel: NoteName, activeNotes: NoteName[]) {
  return activeNotes.some((n) => normalizeNote(n) === normalizeNote(keyLabel));
}

function displayPitchOnly(n: NoteName) {
  return normalizeDisplayNote(n.replace(/[0-9]/g, ""));
}
function formatBarRhNotes(activeNotes: NoteName[]) {
  return activeNotes.map((n) => displayPitchOnly(n)).join("");
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-[1400px] bg-[#F6F6F6] px-6 py-8 text-neutral-900 md:px-10 md:py-10 print:max-w-none print:bg-white print:px-0 print:py-0">
      {children}
    </section>
  );
}

export function PrintPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="print-page print:min-h-[calc(9in-1in)] print:break-after-page print:flex print:flex-col print:justify-start print:pt-[0.1in]">
      {children}
    </div>
  );
}
export function PageCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-white p-5 ring-1 ring-neutral-200 print:p-4">
      {children}
    </div>
  );
}

export function PrintPageLast({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="print-page print:min-h-[calc(9in-1in)] print:flex print:flex-col print:justify-start print:pt-[0.1in]">
      {children}
    </div>
  );
}

export function EmotionTitleBlock({ title }: { title: string }) {
  return (
    <div className="mb-4 text-[30px] font-bold tracking-tight md:text-[42px] print:mb-3 print:text-[24px] print:leading-[1.15]">
  {title}
</div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] bg-[#ECE8E8] p-8 print:rounded-none print:bg-white print:p-0">
      {title ? (
        <div className="mb-4 text-[22px] font-bold tracking-tight text-neutral-900 print:mb-3 print:text-[16px] print:leading-[1.2]">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function CoreDefinitionBlock({
  main,
  lines,
}: {
  main: string;
  lines: string[];
}) {
return (
  <div className="rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
    <SectionCard title="Core Definition">
      <div className="text-[28px] leading-tight font-bold text-neutral-900 print:text-[18px] print:leading-[1.2]">
        {main}
      </div>

      <div className="mt-3 space-y-1 text-[20px] leading-[1.45] text-neutral-900 print:mt-2 print:text-[12px] print:leading-[1.35]">
        {lines.map((line) => (
          <p key={line} className="font-normal">
            {line}
          </p>
        ))}
      </div>
    </SectionCard>
  </div>
);
}

export function WorkingVoicingBlock({
  flowRh,
  flowLh,
  colorRh,
  colorLh,
}: {
  flowRh: string;
  flowLh: string;
  colorRh: string;
  colorLh: string;
}) {
  return (
  <div className="rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
    <SectionCard title="Chord Shapes to Play">
      <div className="space-y-2 text-[24px] leading-[1.45] text-neutral-900 print:space-y-1 print:text-[12px] print:leading-[1.22]">
        <div>
          <span className="font-semibold">Flow — Right Hand:</span>{" "}
          {normalizeDisplayText(flowRh)}
        </div>
        <div>
          <span className="font-semibold">Flow — Left Hand:</span>{" "}
          {normalizeDisplayText(flowLh)}
        </div>

        <div className="my-3 border-t border-neutral-300 print:my-2" />

        <div>
          <span className="font-semibold">Color — Right Hand:</span>{" "}
          {normalizeDisplayText(colorRh)}
        </div>
        <div>
          <span className="font-semibold">Color — Left Hand:</span>{" "}
          {normalizeDisplayText(colorLh)}
        </div>
      </div>
    </SectionCard>
  </div>
);
}

export function ProgressionLinesBlock({
  lines,
}: {
  lines: ProgressionLines;
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-6 text-left ring-1 ring-neutral-200 print:p-4">
      <div className="space-y-2 text-[20px] leading-[1.6] text-neutral-800 print:text-[11px] print:leading-[1.3]">

        {/* FLOW */}
        {lines.flowRh && (
          <div>
            <span className="font-semibold">Flow RH:</span>{" "}
            {normalizeDisplayText(lines.flowRh)}
          </div>
        )}

        {lines.flowExtra?.map((line) => (
          <div key={`flow-extra-${line}`}>
            {normalizeDisplayText(line)}
          </div>
        ))}

        {lines.flowLh && (
          <div>
            <span className="font-semibold">Flow LH:</span>{" "}
            {normalizeDisplayText(lines.flowLh)}
          </div>
        )}

        {/* GAP BETWEEN FLOW AND COLOR */}
        <div className="pt-3 print:pt-2" />

        {/* COLOR */}
        {lines.colorRh && (
          <div>
            <span className="font-semibold">Color RH:</span>{" "}
            {normalizeDisplayText(lines.colorRh)}
          </div>
        )}

        {lines.colorExtra?.map((line) => (
          <div key={`color-extra-${line}`}>
            {normalizeDisplayText(line)}
          </div>
        ))}

        {lines.colorLh && (
          <div>
            <span className="font-semibold">Color LH:</span>{" "}
            {normalizeDisplayText(lines.colorLh)}
          </div>
        )}

      </div>
    </div>
  );
}

export function KeyboardBar({
  chordName,
  activeNotes,
  lhLabel,
  keyboardSlice,
  showBottomLabels = true,
}: KeyboardBarData & {
  keyboardSlice: KeyboardSliceSpec;
  showBottomLabels?: boolean;
}) {
  const keys = buildKeyboardSlice(keyboardSlice.start, keyboardSlice.end);
  const whiteKeys = keys.filter((k) => k.type === "white");
  const blackKeys = keys.filter((k) => k.type === "black");
  const svgW =
    (whiteKeys[whiteKeys.length - 1]?.x ?? 0) + WHITE_KEY_W;
  const svgH = 224;

  return (
    <div className="flex flex-col items-center print:min-w-0">
      {chordName ? (
        <div className="mb-2 text-sm font-semibold tracking-wide text-neutral-700">
          {chordName}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-t-md border border-neutral-400 bg-white shadow-sm">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="h-auto w-full"
          aria-label={`Keyboard diagram ${chordName ?? ""}`}
        >
          {/* removed for print clarity */}

          {whiteKeys.map((key) => {
            const active = isExactActive(key.label, activeNotes);

            return (
              <g key={key.id}>
                <rect
                  x={key.x}
                  y={TOP_STRIP_H}
                  width={key.width}
                  height={WHITE_KEY_H}
                  fill={active ? "#D0D0D0" : "#FFFFFF"}
                  stroke="#313131"
                  strokeWidth="1.2"
                />

                {active ? (
                  <text
                    x={key.x + key.width / 2}
                    y={170}
                    textAnchor="middle"
                    fontSize="18"
                    fill="#1F1F1F"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    {displayPitchOnly(key.label)}
                  </text>
                ) : null}

                {key.label === "C4" ? (
                  <text
                    x={key.x + key.width / 2}
                    y={195}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#9A9A9A"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    C4
                  </text>
                ) : null}
              </g>
            );
          })}

          {blackKeys.map((key) => {
            const active = isExactActive(key.label, activeNotes);

            return (
              <g key={key.id}>
                <rect
                  x={key.x}
                  y={TOP_STRIP_H}
                  rx="1.5"
                  ry="1.5"
                  width={key.width}
                  height={BLACK_KEY_H}
                  fill={active ? "#D0D0D0" : "#000000"}
                  stroke={active ? "#2F3A56" : "#000000"}
                  strokeWidth="1"
                />

                {active ? (
                  <text
                    x={key.x + key.width / 2}
                    y={148}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#1F1F1F"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    {displayPitchOnly(key.label)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {showBottomLabels ? (
  <div className="mt-2 text-[14px] leading-[1.35] text-neutral-800 print:mt-1 print:text-[10px]">
    <div>RH: {formatBarRhNotes(activeNotes)}</div>
    <div>{lhLabel}</div>
  </div>
) : null}
    </div>
  );
}

export function RhythmPatternTable({ pattern }: { pattern: RhythmPattern }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-neutral-300 bg-white print:rounded-none">
      <table className="w-full table-fixed border-collapse text-center text-[16px] md:text-[18px] print:text-[10px]">
        <tbody>
          <tr className="bg-[#F4F4F4]">
            <td className="w-[120px] border-b border-r border-neutral-300 px-3 py-3 text-left font-semibold print:w-[72px] print:px-1.5 print:py-1">
              Beats per Bar
            </td>
            {pattern.beats.map((cell, idx) => (
              <td
                key={`beats-${idx}`}
                className="border-b border-neutral-300 px-2 py-3 font-medium print:px-1 print:py-1"
              >
                {cell}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border-b border-r border-neutral-300 px-3 py-3 text-left font-semibold print:px-1.5 print:py-1">
              Right Hand
            </td>
            {pattern.rh.map((cell, idx) => (
              <td
                key={`rh-${idx}`}
                className="border-b border-neutral-300 px-2 py-3 print:px-1 print:py-1"
              >
                {cell}
              </td>
            ))}
          </tr>

          <tr>
            <td className="border-r border-neutral-300 px-3 py-3 text-left font-semibold">
              Left Hand
            </td>
            {pattern.lh.map((cell, idx) => (
              <td key={`lh-${idx}`} className="px-2 py-3 print:px-1 print:py-1">
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function PlayerFeelBlock({ items }: { items: string[] }) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
      <div className="mb-4 text-[20px] font-semibold text-neutral-900 print:text-[13px]">
        What it should feel like
      </div>
      <ul className="space-y-2 text-[19px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function RuleNoteBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white px-5 py-4 text-[18px] leading-[1.55] text-neutral-800 ring-1 ring-neutral-200 print:px-4 print:py-3 print:text-[12px] print:leading-[1.4]">
      <span className="font-semibold">{label}: </span>
      {text}
    </div>
  );
}

export function KeyboardProgressionBlock({
  title,
  bars,
  pattern,
  playerFeel,
  keyboardSlice,
}: {
  title: string;
  bars: KeyboardBarData[];
  pattern: RhythmPattern;
  playerFeel: string[];
  keyboardSlice: KeyboardSliceSpec;
}) {
  return (
    <SectionCard title={title}>
            <div className="grid grid-cols-4 gap-3 print:grid-cols-4">
        {bars.map((bar, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <KeyboardBar {...bar} keyboardSlice={keyboardSlice} />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <RhythmPatternTable pattern={pattern} />
        <PatternSequenceHint pattern={pattern} />

        
      </div>

      <PlayerFeelBlock items={playerFeel} />
    </SectionCard>
  );
}

export function VariationBlock({
  title,
  pattern,
  progressionLines,
  playerFeel,
  ruleNote,
  watchNote,
}: VariationData) {
  return (
    <div className="rounded-[22px] bg-white p-6 ring-1 ring-neutral-200">
      <div className="mb-4 text-[22px] font-bold tracking-tight text-neutral-900 print:mb-3 print:text-[16px] print:leading-[1.2]">
  {title}
</div>

      <RhythmPatternTable pattern={pattern} />
<PatternSequenceHint pattern={pattern} />

      {progressionLines ? (
  <div className="text-left">
    <ProgressionLinesBlock lines={progressionLines} />
  </div>
) : null}

      {playerFeel && playerFeel.length > 0 ? (
        <PlayerFeelBlock items={playerFeel} />
      ) : null}

      {ruleNote ? <RuleNoteBlock label="Keep this in mind" text={ruleNote} /> : null}
      {watchNote ? <RuleNoteBlock label="Watch out" text={watchNote} /> : null}
    </div>
  );
}

export function SafeVariationsSection({
  title,
  intro,
  items,
}: {
  title: string;
  intro?: string;
  items: VariationData[];
}) {
  return (
    <SectionCard title={title}>
     {intro ? (
  <div className="mb-4 text-[21px] leading-[1.6] text-neutral-800 print:mb-3 print:text-[11px] print:leading-[1.35]">
    {intro}
  </div>
) : null}

      <div className="space-y-6">
        {items.map((item) => (
          <VariationBlock key={item.title} {...item} />
        ))}
      </div>
    </SectionCard>
  );
}

export function HandPriorityBlock({
  keeper,
  breaker,
}: {
  keeper: string;
  breaker: string;
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-6 ring-1 ring-neutral-200">
      <div className="mb-3 text-[20px] font-semibold text-neutral-900 print:text-[13px]">What Matters Most</div>
      <div className="space-y-2 text-[20px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
        <div>
          <span className="font-semibold">Keep this steady:</span> {keeper}
        </div>
        <div>
          <span className="font-semibold">This breaks it fastest:</span> {breaker}
        </div>
      </div>
    </div>
  );
}

export function HardBreakBlock({
  title,
  patternTitle,
  pattern,
  progressionLines,
  playerFeel,
  resultText,
  handPriority,
}: EmotionPageData["hardBreak"]) {
  return (
    <SectionCard title="">
      <div className="mb-4 text-[22px] font-bold tracking-tight text-neutral-900 print:mb-3 print:text-[16px] print:leading-[1.2]">
  {title}
</div>

      {patternTitle ? (
        <div className="mb-4 text-[24px] font-semibold text-neutral-900 print:mb-3 print:text-[14px] print:leading-[1.25]">
  {patternTitle}
</div>
      ) : null}

      <RhythmPatternTable pattern={pattern} />
<PatternSequenceHint pattern={pattern} />

      {progressionLines ? <ProgressionLinesBlock lines={progressionLines} /> : null}

      {playerFeel && playerFeel.length > 0 ? (
        <PlayerFeelBlock items={playerFeel} />
      ) : null}

      {resultText && resultText.length > 0 ? (
  <div className="mt-2 rounded-[20px] bg-white p-4 ring-1 ring-neutral-200">
    <div className="space-y-2 text-[19px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
      {resultText.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </div>
) : null}

      {handPriority ? (
        <HandPriorityBlock
          keeper={handPriority.keeper}
          breaker={handPriority.breaker}
        />
      ) : null}
    </SectionCard>
  );
}

function isRhActive(cell: string) {
  const v = cell.trim().toLowerCase();
  return v !== "" && v !== "–" && v !== "-" && v !== "hold";
}



function isLhActive(cell: string) {
  const v = cell.trim().toLowerCase();
  return v !== "" && v !== "–" && v !== "-" && v !== "hold";
}



function getPatternSequence(pattern: RhythmPattern): string[] {
  const actions: string[] = [];

  for (let i = 0; i < pattern.beats.length; i += 1) {
    const rhCell = pattern.rh[i] ?? "–";
    const lhCell = pattern.lh[i] ?? "–";

    const rhActive = isRhActive(rhCell);
    const lhActive = isLhActive(lhCell);

    if (rhActive && lhActive) {
      actions.push("Together");
    } else if (rhActive) {
      actions.push("Right");
    } else if (lhActive) {
      actions.push("Left");
    }
  }

  return actions;
}

function PatternSequenceHint({ pattern }: { pattern: RhythmPattern }) {
  const actions = getPatternSequence(pattern);

  if (actions.length === 0) return null;

  return (
    <div className="mt-2 rounded-[20px] bg-white p-4 ring-1 ring-neutral-200 print:mt-2 print:p-3">
      <div className="text-[16px] font-semibold leading-[1.35] text-neutral-900 print:text-[11px] print:leading-[1.25]">
        {actions.join(" → ")}
      </div>
    </div>
  );
}

export function BulletNoteGroup({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-4 ring-1 ring-neutral-200">
      <div className="mb-3 text-[20px] font-semibold text-neutral-900 print:text-[13px]">{title}</div>
      <ul className="space-y-1 text-[19px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function LiveCueBlock({ cue }: { cue: string }) {
  return (
    <div className="rounded-[20px] bg-[#F5F1F1] px-6 py-5 text-[24px] font-semibold italic leading-[1.5] text-neutral-900 print:px-4 print:py-3 print:text-[15px]">
      “{cue}”
    </div>
  );
}

export function PedalTipsBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
      <div className="mb-4 text-[20px] font-semibold text-neutral-900 print:text-[13px]">
        Pedal Tips
      </div>

      <div className="text-[19px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
        <p>
          <span className="font-semibold">{label} = </span>
          {text}
        </p>
      </div>
    </div>
  );
}
export function PlayerSummaryBlock({
  stayItems,
  breakItems,
}: {
  stayItems: string[];
  breakItems: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <BulletNoteGroup title="To stay in this emotion" items={stayItems} />
      <BulletNoteGroup title="To break this emotion" items={breakItems} />
    </div>
  );
}

export function PerformanceNotesSection({
  microVariations,
  loopTolerance,
  mixingNotes,
  liveCue,
  summary,
  title,
}: EmotionPageData["performanceNotes"] & { title?: string }) {
  return (
    <SectionCard title={title ?? "How to Stay in Control"}>
      <div className="space-y-5">
        {microVariations && microVariations.length > 0 ? (
          <BulletNoteGroup title="Micro-variations allowed" items={microVariations} />
        ) : null}

        {loopTolerance && loopTolerance.length > 0 ? (
          <BulletNoteGroup title="Loop Tolerance" items={loopTolerance} />
        ) : null}

       

        

        {summary ? (
          <PlayerSummaryBlock
            stayItems={summary.stay}
            breakItems={summary.break}
          />
        ) : null}
      </div>
    </SectionCard>
  );
}

export function TransitionBlock({ data }: { data: TransitionData }) {
  return (
    <SectionCard title={data.title}>
     <div className="mb-4 text-[22px] font-bold tracking-tight text-neutral-900 print:mb-3 print:text-[16px] print:leading-[1.2]">
  {data.transitionLabel}
</div>

      <RhythmPatternTable pattern={data.pattern} />

      {data.progressionLines ? <ProgressionLinesBlock lines={data.progressionLines} /> : null}

      {data.playerFeel && data.playerFeel.length > 0 ? (
        <PlayerFeelBlock items={data.playerFeel} />
      ) : null}

      {data.resultText && data.resultText.length > 0 ? (
  <div className="mt-2 rounded-[20px] bg-white p-6 ring-1 ring-neutral-200 print:p-4">
    <div className="space-y-2 text-[19px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
      {data.resultText.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </div>
) : null}
    </SectionCard>
  );
}