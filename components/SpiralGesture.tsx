"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildAlignedSpiralPath, clamp } from "@/lib/spiral";

type Props = {
  seed: string;
  nodeIndices: number[];
  fullCount: number; // total chord count for the full spiral
  progress: number;
  dir: 1 | -1;
  passId: string | number;
  borrowCount: 0 | 1 | 2;
  stroke: string;
  strokeWidth?: number;
  glow?: boolean;
  previousOpacity?: number;
  currentOpacity?: number;
};

export default function SpiralGesture({
  seed,
  nodeIndices,
  progress,
  fullCount,
  dir,
  passId,
  borrowCount,
  stroke,
  strokeWidth = 1.4,
  glow = true,
  previousOpacity = 0.25,
  currentOpacity = 0.85,
}: Props) {
  const clamped = clamp(progress, 0, 1);
const isPartial = nodeIndices.length < fullCount;

  const currentPathD = useMemo(() => {
  const { pathD } = buildAlignedSpiralPath({
  nodeIndices: nodeIndices ?? [],
  dir,
  borrowCount,
  stepsPerTurn: 42,
  ringR: 36,
  overshootPct: 0.10,
});
  return pathD;
}, [nodeIndices, dir, borrowCount]);

  // measure current path length for dash animation
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLen, setPathLen] = useState<number>(0);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    try {
      const len = el.getTotalLength();
      if (Number.isFinite(len) && len > 0) setPathLen(len);
    } catch {}
  }, [currentPathD]);

  // previous memory layer
  const lastCurrentRef = useRef<string>("");
  useEffect(() => {
    lastCurrentRef.current = currentPathD || "";
  }, [currentPathD]);

  const [prevPathD, setPrevPathD] = useState<string>("");

  useEffect(() => {
    setPrevPathD(lastCurrentRef.current || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passId]);

  return (
    <>
      {/* previous (memory) — only after current spiral is complete */}
{prevPathD && !isPartial ? (
  <>
    <path
      d={prevPathD}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={previousOpacity}
    />
    {glow ? (
      <path
        d={prevPathD}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={previousOpacity * 0.18}
        style={{ filter: "blur(0.2px)" }}
      />
    ) : null}
  </>
) : null}

      {/* current (InkSpiral reveal) */}
      {currentPathD ? (
        <>
          <path
            ref={pathRef}
            d={currentPathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={currentOpacity}
            style={{
  strokeDasharray: pathLen ? pathLen : undefined,
  strokeDashoffset: pathLen ? pathLen * (1 - clamped) : undefined,
  filter: glow ? "blur(0.1px)" : undefined,
}}
          />
          {glow ? (
            <path
              d={currentPathD}
              fill="none"
              stroke={stroke}
              strokeWidth={strokeWidth * 2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={currentOpacity * 0.18}
              style={{
  strokeDasharray: pathLen ? pathLen : undefined,
  strokeDashoffset: pathLen ? pathLen * (1 - clamped) : undefined,
  filter: "blur(0.35px)",
}}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}