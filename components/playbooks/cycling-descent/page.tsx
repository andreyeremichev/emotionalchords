"use client";

import React, { useMemo, useState } from "react";

// TODO: replace with your actual keyboard component import
// This should be the SAME keyboard you use for the 10 emotions.
// It must support:
// - rendering C2..C6
// - highlighting keys
// - showing a fixed label on C4
import KeyboardPlaybook from "@/components/playbooks/KeyboardPlaybook";

import { buildStep1Timeline } from "./step1Timeline";
import Step1AutoPlayer from "./Step1AutoPlayer";

type StepId = "STEP_1" | "STEP_2" | "STEP_3";

export default function HypnoticHelplessPage() {
  const [step, setStep] = useState<StepId>("STEP_1");

  const timeline = useMemo(() => buildStep1Timeline(), []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Hypnotic Piano Loop</h1>
        <div className="mt-2 text-sm opacity-80">Emotion: Helpless</div>
      </header>

      {/* SECTION 1 — Demo  */}
      <section className="mb-10 rounded-2xl border p-4">
        <div className="mb-3 text-lg font-medium">Demo: LH then with RH</div>
        <div className="text-sm opacity-80">
          (Next) Full progression twice, slow and steady, Replay button under it.
        </div>
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
            Step 1
          </StepPill>
          <StepPill active={step === "STEP_2"} onClick={() => setStep("STEP_2")}>
            Step 2
          </StepPill>
          <StepPill active={step === "STEP_3"} onClick={() => setStep("STEP_3")}>
            Step 3
          </StepPill>

          <div className="ml-2 text-sm opacity-80">
            {step === "STEP_1" && "Set the left hand. Start in the D3 octave."}
            {step === "STEP_2" && "Now the right hand."}
            {step === "STEP_3" && "Play along with both hands."}
          </div>
        </div>

        <div className="mt-6">
          {step === "STEP_1" ? (
            <Step1AutoPlayer
              timeline={timeline}
              // We reuse your existing keyboard. We render ONE keyboard for Step 1.
              renderKeyboard={(props) => (
                <KeyboardPlaybook
  activeChordSymbol={null}
  emotion={{
    gradientTop: "#2b2f36",
    gradientBottom: "#0f1115",
    trailColor: "#8fa3bf",
  }}
  emotionLabel="Cycling Descent"
  hideHeaderTitle
  headerRight={props.headerRight}
  // No labels unless you want them (primary is what triggers labels)
  highlightNotesPrimary={props.activeKey ? [props.activeKey] : []}
  highlightNotesSecondary={props.highlightedKeys}
  highlightColorSecondary="rgba(0,0,0,0.25)"
  noteLabelMapOverride={props.labelMapOverride}
/>
              )}
            />
          ) : (
            <div className="text-sm opacity-80">
              (Next) Step 2 and Step 3 will reuse the same player engine + keyboard.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4 — Ending */}
      <section className="rounded-2xl border p-4">
        <div className="whitespace-pre-line text-sm leading-6 opacity-90">
{`There is no ending.
• Let the descent cycle
• Do not plan when to stop
• Do not aim for resolution

The long dwell on the last position is intentional.

A note for later

If, at some point, the left hand wants to pause or change on its own, let it.
Do not force it.

If it never happens, that is fine.

Done

You are done when:
• the left hand moves without attention
• the descent feels continuous
• time matters less

Close the page.
Play on your own.`}
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