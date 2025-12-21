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
  practiceStep3Speed,
} from "@/lib/practiceSession";

export default function EmotionPracticeBoard(props: { emotion: EmotionMeta }) {
  const { emotion } = props;

  type PathId = "flow" | "color";
  const [openPath, setOpenPath] = useState<PathId | null>("flow");

  const [flowStep, setFlowStep] = useState<StepId>(1);
  const [colorStep, setColorStep] = useState<StepId>(1);

  return (
    <div className="space-y-3">
      <PathPracticeBlock
        title="🌊 Flow recipe"
        subtitle="Familiar, smooth, song-like movement."
        isOpen={openPath === "flow"}
        onToggle={() => setOpenPath((p) => (p === "flow" ? null : "flow"))}
        step={flowStep}
        onStepChange={setFlowStep}
        step1={
          <Step1Practice
            emotionLabel={`${emotion.label} (Flow)`}
            emotionPalette={emotion.palette}
            chords={emotion.flow.chords}
          />
        }
        step2={
          <Step2RhythmPractice
            emotionLabel={`${emotion.label} (Flow)`}
            emotionPalette={emotion.palette}
            chords={emotion.flow.chords}
            pattern={practicePatternForEmotion(emotion.id)}
            {...practiceStep2FlowSpeed(emotion.id)}
          />
        }
        step3={
          <Step2RhythmPractice
            emotionLabel={`${emotion.label} (Flow · lifted)`}
            emotionPalette={emotion.palette}
            chords={emotion.flow.chords}
            pattern={practicePatternForEmotion(emotion.id)}
            {...practiceStep3Speed(emotion.id)}
            rhOctaveShift={12}
          />
        }
        disabledSteps={[]}
      />

      <PathPracticeBlock
        title="🎨 Color recipe"
        subtitle="Surprising steps. Same feeling — sharper and more intense."
        isOpen={openPath === "color"}
        onToggle={() => setOpenPath((p) => (p === "color" ? null : "color"))}
        step={colorStep}
        onStepChange={setColorStep}
        step1={
          <Step1Practice
            emotionLabel={`${emotion.label} (Color)`}
            emotionPalette={emotion.palette}
            chords={emotion.color.chords}
          />
        }
        step2={
          <Step2RhythmPractice
            emotionLabel={`${emotion.label} (Color)`}
            emotionPalette={emotion.palette}
            chords={emotion.color.chords}
            pattern={practicePatternForEmotion(emotion.id)}
            {...practiceStep2ColorSpeed(emotion.id)}
          />
        }
        step3={
          <Step2RhythmPractice
            emotionLabel={`${emotion.label} (Color · lifted)`}
            emotionPalette={emotion.palette}
            chords={emotion.color.chords}
            pattern={practicePatternForEmotion(emotion.id)}
            {...practiceStep3Speed(emotion.id)}
            rhOctaveShift={12}
          />
        }
        disabledSteps={[]}
      />
    </div>
  );
}