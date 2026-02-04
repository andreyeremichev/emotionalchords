"use client";

import React, { useEffect, useRef } from "react";
import StepTabs from "@/components/ui/StepTabs";
import type { StepId } from "@/components/ui/StepTabs";

export default function PathPracticeBlock(props: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;

  step: StepId;
  onStepChange: (s: StepId) => void;

  step1: React.ReactNode;
  step2?: React.ReactNode;
  

  disabledSteps?: StepId[];
}) {
  const {
    title,
    subtitle,
    isOpen,
    onToggle,
    step,
    onStepChange,
    step1,
    step2,
   
    disabledSteps = [],
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  // scroll the opened block into view on mobile
  useEffect(() => {
    if (!isOpen) return;
    const el = rootRef.current;
    if (!el) return;
    window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className="rounded-2xl border border-black/10 bg-white shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-2xl px-4 py-3 text-left flex items-start justify-between gap-3"
      >
        <div>
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          {subtitle && (
            <div className="mt-1 text-xs text-neutral-600">{subtitle}</div>
          )}
        </div>
        <div className="mt-0.5 text-neutral-500">
          <span className="text-lg leading-none">{isOpen ? "▾" : "▸"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <StepTabs value={step} onChange={onStepChange} disabledSteps={disabledSteps} />

          <div className="mt-4">
            {step === 1 && step1}
            {step === 2 && (step2 ?? <div className="text-sm text-neutral-600">Coming soon.</div>)}
            
          </div>
        </div>
      )}
    </div>
  );
}