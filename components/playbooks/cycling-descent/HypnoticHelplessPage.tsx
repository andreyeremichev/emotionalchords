"use client";

import React, { useMemo, useState } from "react";

// TODO: replace with your actual keyboard component import
// This should be the SAME keyboard you use for the 10 emotions.
// It must support:
// - rendering C2..C6
// - highlighting keys
// - showing a fixed label on C4
import KeyboardPlaybook from "@/components/playbooks/KeyboardPlaybook";

import { buildStep1Timeline, type TimelineEvent } from "./step1Timeline";
import Step1AutoPlayer from "./Step1AutoPlayer";
import PracticeDemoPlayer from "@/components/playbooks/cycling-descent/PracticeDemoPlayer";
import Step2AutoPlayer from "@/components/playbooks/cycling-descent/Step2AutoPlayer";
type StepId = "STEP_1" | "STEP_2";

import MotionCellsExplorer from "@/components/playbooks/cycling-descent/MotionCellsExplorer";

export default function HypnoticHelplessPage() {
  const [step, setStep] = useState<StepId>("STEP_1");

  const timeline = useMemo(() => buildStep1Timeline(), []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Hypnotic Piano Loop</h1>
        <div className="mt-2 text-sm opacity-80">Cycling Descent</div>
      </header>

      {/* SECTION 1 — Demo (we'll wire later; keep placeholder) */}
      <section className="mb-10 rounded-2xl border p-4">
  <div className="mb-3 text-lg font-medium">Demo: LH once, then with RH once. Outro. Replay.</div>
  <PracticeDemoPlayer />
</section>

      {/* SECTION 2 — Fingering reminder (wire image later) */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="mb-3 text-lg font-medium">Fingering reminder</div>
        <div className="text-sm opacity-80">
          Upload your left-hand fingering image and we’ll render it here.
        </div>
      </section>

      {/* SECTION 3 — Steps */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <StepPill active={step === "STEP_1"} onClick={() => setStep("STEP_1")}>
            LH
          </StepPill>
          <StepPill active={step === "STEP_2"} onClick={() => setStep("STEP_2")}>
            RH
          </StepPill>
          

          <div className="ml-2 text-sm opacity-80">
            {step === "STEP_1" && "Set the left hand. Start in the D3 octave."}
            {step === "STEP_2" && "Now the right hand."}
            
          </div>
        </div>

     <div className="mt-6">
  {step === "STEP_1" ? (
    <Step1AutoPlayer
      timeline={timeline}
      renderKeyboard={({ highlightedKeys, activeKey, labelMapOverride, headerRight }) => (
        <KeyboardPlaybook
          activeChordSymbol={null}
          emotion={{
            gradientTop: "#2b2f36",
            gradientBottom: "#0f1115",
            trailColor: "#8fa3bf",
          }}
          emotionLabel="Cycling Descent"
          // Primary = active note (brighter)
          highlightNotesPrimary={activeKey ? [activeKey] : []}
          // Secondary = full chord (darker)
          highlightNotesSecondary={highlightedKeys}
          highlightColorSecondary="rgba(0,0,0,0.25)"
          // Labels only layer (B♭ / C♯) comes from Step1AutoPlayer
          noteLabelMapOverride={labelMapOverride}
          hideHeaderTitle
          // show Step text next to the keyboard title area
          headerRight={headerRight}
        />
      )}
    />
  ) : (
    <Step2AutoPlayer />
  )}
</div>
 
      </section>
     

      {/* SECTION 4 — Ending */}
      <section className="rounded-2xl border p-4">
  <div className="text-sm leading-6 opacity-90 space-y-2">
    <p>The left hand is the engine. Keep it even.</p>
    <div className="-mt-3">
  <MotionCellsExplorer />
</div>
    <p>
      Add the right hand only when the left hand is automatic.
      Use anything you explored above:
      single notes, two-note blocks, or light arpeggios.
    </p>

    <p>
      If unsure, play less.
      Never interrupt the left hand.
    </p>

    <p>
      You can use all the white keys (except C)
      and the two black keys (B♭ and C♯)
      in any combination that feels right.
    </p>

    <p>
      There is no ending.
      Close the page.
      Play.
    </p>
  </div>
</section>
    </main>
  );
}

function StepPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 text-sm transition",
        active ? "border bg-white/10" : "border opacity-70 hover:opacity-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}