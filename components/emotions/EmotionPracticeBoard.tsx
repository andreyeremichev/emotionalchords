// components/emotions/EmotionPracticeBoard.tsx
"use client";

import React, { useState } from "react";
import Step1Practice from "@/components/emotions/Step1Practice";
import Step2RhythmPractice from "@/components/emotions/Step2RhythmPractice";
import PathPracticeBlock from "@/components/ui/PathPracticeBlock";
import type { StepId } from "@/components/ui/StepTabs";
import type { EmotionMeta } from "@/lib/emotions";

import {
  practicePatternForEmotion,
  practiceStep2FlowSpeed,
  practiceStep2ColorSpeed,
} from "@/lib/practiceSession";

export default function EmotionPracticeBoard(props: { emotion: EmotionMeta }) {
  const { emotion } = props;

  type PathId = "flow" | "color";
  const [openPath, setOpenPath] = useState<PathId | null>("flow");

  const [flowStep, setFlowStep] = useState<StepId>(1);
  const [colorStep, setColorStep] = useState<StepId>(1);

  // Motion-first label used throughout the board
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
            pattern={practicePatternForEmotion(emotion.id)}
            {...practiceStep2FlowSpeed(emotion.id)}
          />
        }
        
        disabledSteps={[3]}
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
            pattern={practicePatternForEmotion(emotion.id)}
            {...practiceStep2ColorSpeed(emotion.id)}
          />
        }
        
        disabledSteps={[3]}
      />
    </div>
  );
}