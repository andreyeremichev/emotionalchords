"use client";

import React from "react";
import {
  PageShell,
  PrintPage,
  PrintPageLast,
  PageCard,
  EmotionTitleBlock,
  SectionCard,
  KeyboardBar,
} from "./emotionBookShared";
import type { NoteName } from "./emotionBookShared";

function SimpleCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
      {title ? (
        <div className="mb-4 text-[20px] font-semibold text-neutral-900 print:text-[13px]">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function PhaseCard({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="mt-2 rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
      <div className="mb-3 text-[20px] font-semibold text-neutral-900 print:text-[13px]">
        {title}
      </div>
      <div className="space-y-2 text-[19px] leading-[1.6] text-neutral-800 print:text-[12px] print:leading-[1.4]">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}
type LoveCanonicalBar = {
  label: string;
  activeNotes: ("A3" | "C4" | "D4" | "E4" | "F4" | "G4" | "A4" | "B4" | "C5")[];
  rhLabel: string;
  lhLabel: string;
};

const LOVE_CANONICAL_BARS: LoveCanonicalBar[] = [
  {
    label: "ACE ×2",
    activeNotes: ["A3", "C4", "E4"],
    rhLabel: "RH: E E A –",
    lhLabel: "LH: A C E",
  },
  {
    label: "ACF ×2",
    activeNotes: ["A3", "C4", "F4"],
    rhLabel: "RH: F F C –",
    lhLabel: "LH: A C F",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C4", "E4", "G4"],
    rhLabel: "RH: E E G –",
    lhLabel: "LH: C E G",
  },
  {
    label: "CEA ×2",
    activeNotes: ["C4", "E4", "A4"],
    rhLabel: "RH: E A E –",
    lhLabel: "LH: C E A",
  },
  {
    label: "DFA ×2",
    activeNotes: ["D4", "F4", "A4"],
    rhLabel: "RH: D D F –",
    lhLabel: "LH: D F A",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C4", "E4", "G4"],
    rhLabel: "RH: G G E –",
    lhLabel: "LH: C E G",
  },
  {
    label: "CEA ×2",
    activeNotes: ["C4", "E4", "A4"],
    rhLabel: "RH: E E A –",
    lhLabel: "LH: C E A",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C4", "E4", "G4"],
    rhLabel: "RH: E (G) E –",
    lhLabel: "LH: C E G",
  },
  {
    label: "ACE ×2",
    activeNotes: ["A3", "C4", "E4"],
    rhLabel: "RH: E",
    lhLabel: "LH: A C E",
  },
];

type LoveCanonicalKeyboardBar = {
  label: string;
  activeNotes: NoteName[];
  rhLabel: string;
  lhLabel: string;
};

const LOVE_CANONICAL_KEYBOARD_BARS: LoveCanonicalKeyboardBar[] = [
  {
    label: "ACE ×2",
    activeNotes: ["A2", "C3", "E3", "E4", "A4"],
    rhLabel: "RH: E4 A4",
    lhLabel: "LH: A2 C3 E3",
  },
  {
    label: "ACF ×2",
    activeNotes: ["A2", "C3", "F3", "F4", "C5"],
    rhLabel: "RH: F4 C5",
    lhLabel: "LH: A2 C3 F3",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C3", "E3", "G3", "E4", "G4"],
    rhLabel: "RH: E4 G4",
    lhLabel: "LH: C3 E3 G3",
  },
  {
    label: "CEA ×2",
    activeNotes: ["C3", "E3", "A3", "E4", "A4"],
    rhLabel: "RH: E4 A4",
    lhLabel: "LH: C3 E3 A3",
  },
  {
    label: "DFA ×2",
    activeNotes: ["D3", "F3", "A3", "D4", "F4"],
    rhLabel: "RH: D4 F4",
    lhLabel: "LH: D3 F3 A3",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C3", "E3", "G3", "E4", "G4"],
    rhLabel: "RH: G4 E4",
    lhLabel: "LH: C3 E3 G3",
  },
  {
    label: "CEA ×2",
    activeNotes: ["C3", "E3", "A3", "E4", "A4"],
    rhLabel: "RH: E4 A4",
    lhLabel: "LH: C3 E3 A3",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C3", "E3", "G3", "E4", "G4"],
    rhLabel: "RH: E4 (G4) E4",
    lhLabel: "LH: C3 E3 G3",
  },
  
];

function LoveCanonicalKeyboardSliceBlock({
  start,
  end,
}: {
  start: number;
  end: number;
}) {
  const bars = LOVE_CANONICAL_KEYBOARD_BARS.slice(start, end);

  return (
    <div className="mt-4 space-y-4 print:mt-3 print:space-y-3">
      {bars.map((bar, idx) => (
        <div
          key={`${bar.label}-${start + idx}`}
          className="rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3"
        >
          <div className="mb-3 text-[20px] font-semibold text-neutral-900 print:mb-2 print:text-[13px]">
            {bar.label}
          </div>

          <KeyboardBar
            chordName=""
            activeNotes={bar.activeNotes}
            lhLabel=""
            keyboardSlice={{ start: "A2", end: "F5" }}
            showBottomLabels={false}
          />

          <div className="mt-2 flex justify-center text-[18px] leading-[1.5] text-neutral-800 print:text-[12px] print:leading-[1.35]">
            <p>
              {bar.lhLabel}
              <span className="inline-block w-12" />
              {bar.rhLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
type LoveVariationBKeyboardBar = {
  label: string;
  activeNotes: NoteName[];
  rhLabel: string;
  lhLabel: string;
};

const LOVE_VARIATION_B_KEYBOARD_BARS: LoveVariationBKeyboardBar[] = [
  {
    label: "DFA ×2",
    activeNotes: ["D3", "F3", "A3", "D4", "A4", "D5"],
    rhLabel: "RH: D4 A4 D5",
    lhLabel: "LH: D3 F3 A3",
  },
  {
    label: "EGC ×2",
    activeNotes: ["E3", "G3", "C4", "G4", "C5", "E5"],
    rhLabel: "RH: G4 C5 E5",
    lhLabel: "LH: E3 G3 C4",
  },
  {
    label: "EAC ×2",
    activeNotes: ["E3", "A3", "C4", "A4", "C5", "E5"],
    rhLabel: "RH: A4 C5 E5",
    lhLabel: "LH: E3 A3 C4",
  },
  {
    label: "CEG ×2",
    activeNotes: ["C3", "E3", "G3", "E4", "G4", "C5"],
    rhLabel: "RH: E4 G4 C5",
    lhLabel: "LH: C3 E3 G3",
  },
];

function LoveVariationBKeyboardSliceBlock() {
  return (
    <div className="mt-4 space-y-4 print:mt-3 print:space-y-3">
      {LOVE_VARIATION_B_KEYBOARD_BARS.map((bar, idx) => (
        <div
          key={`${bar.label}-${idx}`}
          className="rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3"
        >
          <div className="mb-3 text-[20px] font-semibold text-neutral-900 print:mb-2 print:text-[13px]">
            {bar.label}
          </div>

          <KeyboardBar
            chordName=""
            activeNotes={bar.activeNotes}
            lhLabel=""
            keyboardSlice={{ start: "A2", end: "F5" }}
            showBottomLabels={false}
          />

          <div className="mt-2 flex justify-center text-[18px] leading-[1.5] text-neutral-800 print:text-[12px] print:leading-[1.35]">
            <p>
              {bar.lhLabel}
              <span className="inline-block w-12" />
              {bar.rhLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
export default function LoveArcPrintChapter() {
  return (
    <div className="print:break-before-page">
      <PageShell>
        <PrintPage>
          <PageCard>
            <div className="space-y-5 print:space-y-4">
              <EmotionTitleBlock title="💛 LOVE · Wings, Roots, and Reason to Stay" />

              <div className="rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
                <SectionCard title="Core Idea">
                  <div className="text-[28px] leading-tight font-bold text-neutral-900 print:text-[18px] print:leading-[1.2]">
                    Love is motion that opens, stretches, and returns safely.
                  </div>

                  <div className="mt-3 space-y-1 text-[20px] leading-[1.45] text-neutral-900 print:mt-2 print:text-[12px] print:leading-[1.35]">
                    <p>Something stays (roots).</p>
                    <p>Something opens (wings).</p>
                    <p>Something brings you back (reason to stay).</p>
                    <p className="mt-3">Nothing forces movement.</p>
                    <p>Nothing collapses.</p>
                    <p>Everything expands — and returns.</p>
                  </div>
                </SectionCard>
              </div>

              

              <SimpleCard title="Engine">
                <p>Left Hand:</p>
                <p className="mt-2 font-semibold">
                  Bottom → Middle → Top → Bottom → Middle → Top
                </p>
                <p className="mt-2">(6 beats per bar)</p>
                 <p className="mt-3">2 Bars per chord (BMT→BMT→BMT→BMT)</p>
                <p className="mt-3">Even.</p>
                <p>No accents.</p>
                <p>No breaks.</p>
              </SimpleCard>

              <SimpleCard title="Rhythm Grid">
                <p className="font-semibold">1 &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; 5 &nbsp; 6</p>
                <p className="mt-2">Count evenly.</p>
              </SimpleCard>
            </div>
          </PageCard>
        </PrintPage>

               <PrintPage>
          <PageCard>
            <div className="space-y-5 print:space-y-4">
              <SimpleCard title="Canonical Right Hand Rule">
              <p className="font-semibold">X &nbsp; X &nbsp; Y &nbsp; –</p>
              <p className="mt-2">X = hold</p>
              <p>Y = release</p>
                <p>– = silence</p>
                <p className="mt-3">Do not add notes.</p>
                <p>Do not fill the silence.</p>
              </SimpleCard>
              <SimpleCard title="Why This Is Easier Than It Looks">
                <p>This page may look like it has many chords.</p>
                <p className="mt-2">But the motion is mostly stepwise or near-stepwise.</p>
                <p>Very little jumps far.</p>
                <p className="mt-3">That means:</p>
                <p>your hands mostly move by small changes,</p>
                <p>so it is easier to play than it looks on paper.</p>
                <p className="mt-3">Think:</p>
                <p>small motion, steady pulse, soft control.</p>
              </SimpleCard>
              <SimpleCard title="How to Use the Next Pages">
  <p>The next pages show the exact keys to play on a large keyboard.</p>
  <p className="mt-2">Use them first to find the correct LH and RH notes safely.</p>

  <p className="mt-3">
    After the keyboard pages, you will see the same progression again in a shorter text version.
  </p>

  <p className="mt-3">Once the keys feel familiar, use the shorter version to play:</p>

  <p className="mt-3 font-mono text-[22px] leading-[1.5] text-neutral-900 print:text-[12px]">
    ACE ×2 → E E A –
  </p>

  <p className="mt-3">
    So:
  </p>
  <p>first learn the shape on the keyboard,</p>
  <p>then use the short version to play more freely.</p>
</SimpleCard>
            </div>
          </PageCard>
        </PrintPage>
        
               <PrintPage>
          <PageCard>
            
              <LoveCanonicalKeyboardSliceBlock start={0} end={4} />
            
          </PageCard>
        </PrintPage>

        <PrintPage>
          <PageCard>
            
              <LoveCanonicalKeyboardSliceBlock start={4} end={8} />
           
          </PageCard>
        </PrintPage>

             <PrintPage>
             <PageCard>
               <SimpleCard title="LOVE · Canonical Progression">
  <div className="font-mono text-[22px] leading-[1.7] text-neutral-900 print:text-[12px] print:leading-[1.45]">
    
    {/* Header row */}
    <div className="grid grid-cols-[110px_70px_1fr] gap-x-4 mb-2">
      <div className="font-semibold text-neutral-500">LH:</div>
      <div></div>
      <div className="font-semibold text-neutral-500">RH:</div>
    </div>

    {/* Data rows */}
    <div className="grid grid-cols-[110px_70px_1fr] gap-x-4">
      <div>ACE</div>
      <div className="text-neutral-500">×2 →</div>
      <div>E E A -</div>

      <div>ACF</div>
      <div className="text-neutral-500">×2 →</div>
      <div>F F C -</div>

      <div>CEG</div>
      <div className="text-neutral-500">×2 →</div>
      <div>E E G -</div>

      <div>CEA</div>
      <div className="text-neutral-500">×2 →</div>
      <div>E A E -</div>

      <div>DFA</div>
      <div className="text-neutral-500">×2 →</div>
      <div>D D F -</div>

      <div>CEG</div>
      <div className="text-neutral-500">×2 →</div>
      <div>G G E -</div>

      <div>CEA</div>
      <div className="text-neutral-500">×2 →</div>
      <div>E E A -</div>

      <div>CEG</div>
      <div className="text-neutral-500">×2 →</div>
      <div>E (G) E -</div>

      <div>ACE</div>
      <div className="text-neutral-500">×2 →</div>
      <div>E</div>
    </div>
  </div>
</SimpleCard>
            
                 <SimpleCard title="What Each Part Does">
                 <p className="font-semibold mt-2">Roots</p>
                 <p>ACE, ACF → safety, stability</p>

                 <p className="font-semibold mt-4">Wings</p>
                 <p>CEG, DFA → expansion, lift, stretch</p>

                 <p className="font-semibold mt-4">Reason to Stay</p>
                 <p>CEA → ACE → return without force</p>
               </SimpleCard>

               <SimpleCard title="How It Should Feel">
                 <ul className="space-y-2">
                   <li>• Nothing pushes.</li>
                   <li>• Nothing collapses.</li>
                   <li>• Movement is allowed, not required.</li>
                   <li>• The center never disappears.</li>
                 </ul>
               </SimpleCard>

             </PageCard>
           </PrintPage>
 <PrintPage>
               <PageCard>
                 <SectionCard title="LOVE · Variation A — Declared Love">
                   <SimpleCard title="RH Rule">
                     <p>Right Hand octaves only.</p>
                     <p className="mt-2">One octave hit on beat 1 of each bar.</p>
                     <p>No other RH notes inside the bar.</p>
                     <p className="mt-3">Effect:</p>
                     <p>more visible,</p>
                     <p>more declared,</p>
                     <p>still the same emotion.</p>
                   </SimpleCard>

                   <SimpleCard title="LOVE · Variation A — Declared Love">
                     <div className="font-mono text-[22px] leading-[1.7] text-neutral-900 print:text-[12px] print:leading-[1.45]">
                       {/* Header row */}
    <div className="grid grid-cols-[110px_70px_1fr] gap-x-4 mb-2">
      <div className="font-semibold text-neutral-500">LH:</div>
      <div></div>
      <div className="font-semibold text-neutral-500">RH:</div>
    </div>

    {/* Data rows */}
                       <div className="grid grid-cols-[110px_70px_1fr] gap-x-4">
                         <div>ACE</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave C</div>

                         <div>ACF</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave C</div>

                         <div>CEG</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave C</div>

                         <div>CEA</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave D</div>

                         <div>DFA</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave E</div>

                         <div>CEG</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave E</div>

                         <div>CEA</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave G</div>

                         <div>CEG</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave E</div>

                         <div>ACE</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>octave E or silence</div>
                       </div>
                     </div>
                   </SimpleCard>

                   <SimpleCard title="Why It Still Works">
                     <p>Only the RH surface changes.</p>
                     <p className="mt-2">The LH arc stays the same.</p>
                     <p>That means Love stays Love.</p>
                   </SimpleCard>
                 </SectionCard>
               </PageCard>
             </PrintPage>
             <PrintPage>
               <PageCard>
                 <SectionCard title="LOVE · Variation B — Singing Love">
                   <SimpleCard title="RH Rule">
                     <p>One single RH note on each Bottom hit.</p>
                     <p className="mt-2">Three notes, then rest.</p>
                     <p>No fills between hits.</p>
                     <p className="mt-3">Effect:</p>
                     <p>more lyrical,</p>
                     <p>more interesting to loop,</p>
                     <p>still stable.</p>
                   </SimpleCard>

                   <SimpleCard title="LOVE · Variation B — Singing Love">
                     <div className="font-mono text-[22px] leading-[1.7] text-neutral-900 print:text-[12px] print:leading-[1.45]">
                        {/* Header row */}
    <div className="grid grid-cols-[110px_70px_1fr] gap-x-4 mb-2">
      <div className="font-semibold text-neutral-500">LH:</div>
      <div></div>
      <div className="font-semibold text-neutral-500">RH:</div>
    </div>

    {/* Data rows */}
                       <div className="grid grid-cols-[110px_70px_1fr] gap-x-4">
                         <div>ACE</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>E A C5 -</div>

                         <div>ACF</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>F A C5 -</div>

                         <div>CEG</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>E G C5 -</div>

                         <div>CEA</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>E A C5 -</div>

                         <div>DFA</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>D A D5 -</div>

                         <div>EGC</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>G C E5 -</div>

                         <div>EAC</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>A C E5 -</div>

                         <div>CEG</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>E G C5 -</div>

                         <div>ACE</div>
                         <div className="text-neutral-500">×2 →</div>
                         <div>E</div>
                       </div>
                     </div>
                   </SimpleCard>

                   <SimpleCard>
  <p>The RH line looks richer.</p>
  <p className="mt-2">But it is still one note at a time.</p>
  <p>And the note motion is mostly small and stepwise.</p>
  <p className="mt-3">This makes it easier under the fingers than it looks in text.</p>
  <p className="mt-4">
    In the later bars, some LH shapes are shown in playing order:
  </p>
  <p className="mt-2 font-mono text-[20px] text-neutral-900 print:text-[12px]">
    EGC instead of CEG
  </p>
  <p className="font-mono text-[20px] text-neutral-900 print:text-[12px]">
    EAC instead of CEA
  </p>
  <p className="mt-3">
    This is the same harmony, just giving a slightly more open, lifted feel.
  </p>
  
</SimpleCard>
                 </SectionCard>
               </PageCard>
             </PrintPage>
                     <PrintPage>
          <PageCard>
            <LoveVariationBKeyboardSliceBlock />
          </PageCard>
        </PrintPage>
             <PrintPage>
               <PageCard>
                 <SectionCard title="LOVE · Hard Break (Breaks It 100%)">
                   <SimpleCard title="Break Pattern">
                     <p>Keep the same LH chords.</p>
                     <p className="mt-2">But play RH octaves on every Bottom hit.</p>
                     <p>That means 4 strong RH octave hits per LH shape (2 bars).</p>
                     <p className="mt-3">No silence.</p>
                     <p>Strong attack.</p>
                   </SimpleCard>

                   <SimpleCard title="Result">
                     <p>This breaks Love immediately.</p>
                     <p className="mt-2">Why:</p>
                     <p>breath disappears,</p>
                     <p>insistence appears,</p>
                     <p>the arc becomes pressure.</p>
                     <p className="mt-3">Emotion shifts toward:</p>
                     <p>Tension</p>
                     <p>or Drama</p>
                   </SimpleCard>

                   <SimpleCard title="Rule to Remember">
                     <p>Love needs breath.</p>
                     <p className="mt-2">If you remove breath, you remove Love.</p>
                   </SimpleCard>
                   <SimpleCard title="One-Line Summary">
                     <p>
                       Love = you can expand, stretch, and still have a place to return to.
                     </p>
                   </SimpleCard>
                 </SectionCard>
               </PageCard>
             </PrintPage>
             <PrintPage>
               <PageCard>
                 <SectionCard title="LOVE · Switch the Same Progression into Sadness">
                   <SimpleCard title="How Sadness Changes the Motion">
                     <p>Reduce lift.</p>
                     <p className="mt-2">Let F matter more.</p>
                     <p>Let return feel weaker.</p>
                     <p className="mt-3">Love says:</p>
                     <p>I can stretch and come back.</p>
                     <p className="mt-3">Sadness says:</p>
                     <p>I stay near it, but I do not rise.</p>
                   </SimpleCard>

                   <SimpleCard title="Sadness Switch Pattern">
  <div className="font-mono text-[22px] leading-[1.7] text-neutral-900 print:text-[12px] print:leading-[1.45]">
    
    {/* Header */}
    <div className="grid grid-cols-[110px_1fr] gap-x-6 mb-2">
      <div className="font-semibold text-neutral-600">LH:</div>
      <div className="font-semibold text-neutral-600">RH:</div>
    </div>

    {/* Rows */}
    <div className="grid grid-cols-[110px_1fr] gap-x-6">
      <div>ACE</div><div>E</div>
      <div>ACF</div><div>F</div>
      <div>CEG</div><div>E</div>
      <div>CEA</div><div>C</div>
      <div>DFA</div><div>F</div>
      <div>CEG</div><div>E</div>
      <div>CEA</div><div>C</div>
      <div>CEG</div><div>E</div>
      <div>ACE</div><div>E</div>
    </div>

  </div>
</SimpleCard>

                   <SimpleCard title="Effect">
                     <p>One Bar per chord (BMTBMT)</p>
                     <p>G retreats.</p>
                     <p className="mt-2">F becomes emotionally central.</p>
                     <p>Return loses confidence.</p>
                   </SimpleCard>
                 </SectionCard>
               </PageCard>
             </PrintPage><PrintPageLast>
               <PageCard>
                 <SectionCard title="LOVE · Switch the Same Progression into Melancholy">
                   <SimpleCard title="How Melancholy Changes the Motion">
                     <p>Keep some light.</p>
                     <p className="mt-2">Do not let it fully rise.</p>
                     <p>Return becomes softer and more memory-like.</p>
                     <p className="mt-3">Melancholy is not collapse.</p>
                     <p>It is altered return.</p>
                   </SimpleCard>

                   <SimpleCard title="Melancholy Switch Pattern">
  <div className="font-mono text-[22px] leading-[1.7] text-neutral-900 print:text-[12px] print:leading-[1.45]">
    <div className="grid grid-cols-[110px_1fr] gap-x-6 mb-2">
      <div className="font-semibold text-neutral-600">LH:</div>
      <div className="font-semibold text-neutral-600">RH:</div>
    </div>

    <div className="grid grid-cols-[110px_1fr] gap-x-6">
      <div>ACE</div><div>E</div>
      <div>ACF</div><div>C</div>
      <div>CEG</div><div>G</div>
      <div>CEA</div><div>A</div>
      <div>DFA</div><div>F</div>
      <div>CEG</div><div>G</div>
      <div>CEA</div><div>E</div>
      <div>CEG</div><div>E</div>
      <div>ACE</div><div>E</div>
    </div>
  </div>
</SimpleCard>
 
                   <SimpleCard title="Effect">
                     <p>One Bar per chord (BMTBMT)</p>
                     <p>Some air remains.</p>
                     <p className="mt-2">But the confidence of Love is gone.</p>
                     <p>What remains is warmth mixed with distance.</p>
                   </SimpleCard>

                   <SimpleCard title="Critical Rules">
                     <p>Do not accent top notes (G, F).</p>
                     <p className="mt-2">Keep tempo steady.</p>
                     <p>Silence is part of the phrase.</p>
                     <p>If it feels crowded — remove notes.</p>
                   </SimpleCard>

                   
                 </SectionCard>
               </PageCard>
             </PrintPageLast>
      </PageShell>
    </div>
  );
}