"use client";

import React from "react";
import {
  PageShell,
  PrintPage,
  PrintPageLast,
  PageCard,
  EmotionTitleBlock,
  CoreDefinitionBlock,
  WorkingVoicingBlock,
  KeyboardProgressionBlock,
  SafeVariationsSection,
  HardBreakBlock,
  PerformanceNotesSection,
  TransitionBlock,
  PedalTipsBlock,
} from "./emotionBookShared";

import type { EmotionPageData } from "./emotionBookShared";

export default function EmotionPrintPage({
  data,
}: {
  data: EmotionPageData;
}) {
  const variationA = data.safeVariations.items[0];
  const variationB = data.safeVariations.items[1];

  const shortEmotion = data.emotionTitle
    .replace(/^[^\p{L}]*?/u, "")
    .split(" · ")[0]
    .split(" — ")[0]
    .trim();

  return (
    <div className="print:break-before-page">
      <PageShell>
        <PrintPage>
          <PageCard>
            <div className="space-y-8 print:space-y-6">
              <EmotionTitleBlock title={data.emotionTitle} />

              <CoreDefinitionBlock
                main={data.coreDefinition.main}
                lines={data.coreDefinition.lines}
              />

              <div className="pt-3 print:pt-2">
                <WorkingVoicingBlock
                  flowRh={data.workingVoicing.flowRh}
                  flowLh={data.workingVoicing.flowLh}
                  colorRh={data.workingVoicing.colorRh}
                  colorLh={data.workingVoicing.colorLh}
                />

                {data.performanceNotes.mixingNotes &&
data.performanceNotes.mixingNotes.length > 0 ? (
  <div className="pt-6 print:pt-4">
    <div className="rounded-[20px] bg-white p-5 ring-1 ring-neutral-200 print:p-3">
      <div className="mb-4 text-[22px] font-bold tracking-tight text-neutral-900 print:text-[16px] print:leading-[1.2]">
        Flow / Color Mixing
      </div>

      <ul className="space-y-1 text-[20px] leading-[1.45] text-neutral-800 print:text-[12px] print:leading-[1.3]">
        {data.performanceNotes.mixingNotes.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  </div>
) : null}
              </div>
             <div className="mt-6 pt-4 border-t border-black/10">
  <p className="text-sm font-semibold text-neutral-900">
    🎧 Companion Mode
  </p>

  <p className="mt-2 text-sm text-neutral-700">
    Play this emotion in real time.
  </p>

  <p className="mt-3 text-sm text-neutral-800">
    {data.transition
      ? "Canonical · Variations · Break & Restore · Transition"
      : "Canonical · Variations · Break & Restore"}
  </p>

  <p className="mt-3 text-sm font-medium text-neutral-900">
    emotionalchords.app/b1
  </p>
</div>
            </div>
          </PageCard>
        </PrintPage>

        <PrintPage>
          <PageCard>
            <KeyboardProgressionBlock
              title={`${shortEmotion} · Flow`}
              bars={data.flowBars}
              pattern={data.basePattern}
              playerFeel={data.flowPlayerFeel}
              keyboardSlice={data.keyboardSlice}
            />
            
  {data.performanceNotes.pedalTips ? (
  <PedalTipsBlock
    label="Flow"
    text={data.performanceNotes.pedalTips.flow}
  />
) : null}
          </PageCard>
        </PrintPage>

        <PrintPage>
          <PageCard>
            <KeyboardProgressionBlock
              title={`${shortEmotion} · Color`}
              bars={data.colorBars}
              pattern={data.basePattern}
              playerFeel={data.colorPlayerFeel}
              keyboardSlice={data.keyboardSlice}
            />
            {data.performanceNotes.pedalTips ? (
  <PedalTipsBlock
    label="Color"
    text={data.performanceNotes.pedalTips.color}
  />
) : null}
          </PageCard>
        </PrintPage>

        {variationA ? (
          <PrintPage>
            <PageCard>
              <SafeVariationsSection
                title={`${shortEmotion} · Variation A — ${(variationA.title.split("—")[1] ?? "").trim()}`}
                intro={data.safeVariations.intro}
                items={[variationA]}
              />
            </PageCard>
          </PrintPage>
        ) : null}

        {variationB ? (
          <PrintPage>
            <PageCard>
              <SafeVariationsSection
                title={`${shortEmotion} · Variation B — ${(variationB.title.split("—")[1] ?? "").trim()}`}
                items={[variationB]}
              />
            </PageCard>
          </PrintPage>
        ) : null}

        <PrintPage>
          <PageCard>
            <HardBreakBlock
              {...data.hardBreak}
              title={`${shortEmotion} · Break the Emotion (On Purpose)`}
            />
          </PageCard>
        </PrintPage>

        <PrintPage>
  <PageCard>
    <div className="space-y-2 print:break-inside-avoid">
      <PerformanceNotesSection
        {...data.performanceNotes}
        title={`${shortEmotion} · How to Stay in Control`}
      />
    </div>
  </PageCard>
</PrintPage>

        {data.transition ? (
          <PrintPageLast>
            <PageCard>
              <TransitionBlock data={data.transition} />
            </PageCard>
          </PrintPageLast>
        ) : null}
      </PageShell>
    </div>
  );
}