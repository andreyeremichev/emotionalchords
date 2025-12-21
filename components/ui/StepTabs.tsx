"use client";

import React from "react";

export type StepId = 1 | 2 | 3;

export default function StepTabs(props: {
  value: StepId;
  onChange: (v: StepId) => void;
  disabledSteps?: StepId[];
}) {
  const { value, onChange, disabledSteps = [] } = props;
  const disabled = new Set(disabledSteps);

  const btn = (id: StepId, label: string) => {
    const isActive = value === id;
    const isDisabled = disabled.has(id);

    return (
      <button
        key={id}
        type="button"
        disabled={isDisabled}
        onClick={() => onChange(id)}
        className={[
          "rounded-full px-3 py-1 text-xs font-semibold transition",
          isActive ? "bg-black text-white" : "bg-black/5 text-neutral-800 hover:bg-black/10",
          isDisabled ? "opacity-40 cursor-not-allowed hover:bg-black/5" : "",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {btn(1, "Step 1 · Smooth chords")}
{btn(2, "Step 2 · Play with feeling")}
{btn(3, "Step 3 · Lift the emotion")}
    </div>
  );
}