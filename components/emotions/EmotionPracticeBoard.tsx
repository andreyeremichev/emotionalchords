"use client";

import React, { useState } from "react";
import Step1Practice from "@/components/emotions/Step1Practice";
import Step2RhythmPractice from "@/components/emotions/Step2RhythmPractice";
import PathPracticeBlock from "@/components/ui/PathPracticeBlock";
import type { StepId } from "@/components/ui/StepTabs";
import type { EmotionMeta } from "@/lib/emotions";

import {
  practiceStep2FlowSpeed,
  practiceStep2ColorSpeed,
} from "@/lib/practiceSession";

export default function EmotionPracticeBoard(props: { emotion: EmotionMeta }) {
  const { emotion } = props;

  type PathId = "flow" | "color";
  const [openPath, setOpenPath] = useState<PathId | null>("flow");

  const [flowStep, setFlowStep] = useState<StepId>(1);
  const [colorStep, setColorStep] = useState<StepId>(1);

  const motionLabel = `${emotion.motion} (${emotion.emotion})`;

  return (
    <div className="space-y-3">
      <PathPracticeBlock
        title="🌊 Flow path"
        subtitle="Coherent, readable motion."
        isOpen={openPath === "flow"}
        onToggle={() => setOpenPath((p) => (p === "flow" ? null : "flow"))}
        step={flowStep}
        onStepChange={setFlowStep}
        step1={
          <Step1Practice
  emotionId={emotion.id}
  path="flow"
  emotionLabel={`${motionLabel} · Flow`}
  emotionPalette={emotion.palette}
  chords={emotion.flow.chords}
/>
        }
        step2={
          <Step2RhythmPractice
            emotionLabel={`${motionLabel} · Flow`}
            emotionPalette={emotion.palette}
            chords={emotion.flow.chords}
            pattern={emotion.id}
            path="flow"
            {...practiceStep2FlowSpeed(emotion.id)}
          />
        }
        disabledSteps={[]}
      />

      <PathPracticeBlock
        title="🎨 Color path"
        subtitle="Faster re-alignment. Less guaranteed footing."
        isOpen={openPath === "color"}
        onToggle={() => setOpenPath((p) => (p === "color" ? null : "color"))}
        step={colorStep}
        onStepChange={setColorStep}
        step1={
          <Step1Practice
  emotionId={emotion.id}
  path="color"
  emotionLabel={`${motionLabel} · Color`}
  emotionPalette={emotion.palette}
  chords={emotion.color.chords}
/>
        }
        step2={
          <Step2RhythmPractice
            emotionLabel={`${motionLabel} · Color`}
            emotionPalette={emotion.palette}
            chords={emotion.color.chords}
            pattern={emotion.id}
            path="color"
            {...practiceStep2ColorSpeed(emotion.id)}
          />
        }
        disabledSteps={[]}
      />
    </div>
  );
}