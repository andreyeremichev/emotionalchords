"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  polygonFromNodeIndices,
  nodePos,
  minDistToPolygonEdges,
  type Pt,
} from "@/lib/flowSpots/geom";
import {
  rasterizeBubbleCells,
  imageDataToDataUrl,
  type Bubble,
} from "@/lib/flowSpots/bubbleRaster";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function norm(vx: number, vy: number) {
  const L = Math.sqrt(vx * vx + vy * vy) + 1e-12;
  return { x: vx / L, y: vy / L };
}

function circleFitsInPolygonBySampling(
  poly: Pt[],
  center: Pt,
  r: number,
  samples = 36
) {
  // quick reject: if center is outside polygon, fail
  // (pointInPolygon is in geom.ts, but we avoid importing to keep it simple)
  // We'll assume center stays inside in our growth; sampling is main guard.

  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const x = center.x + Math.cos(a) * r;
    const y = center.y + Math.sin(a) * r;

    // inline point-in-polygon (ray casting)
    let inside = false;
    for (let p = 0, q = poly.length - 1; p < poly.length; q = p++) {
      const xi = poly[p].x, yi = poly[p].y;
      const xj = poly[q].x, yj = poly[q].y;
      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) inside = !inside;
    }

    if (!inside) return false;
  }
  return true;
}

// order-weighted target radius multipliers (locked)
const ORDER_MULT = [1.0, 0.92, 0.86, 0.82];

export default function FlowBubbleSpots(props: {
  seedKey: string;

  // chord nodes
  chordNodeIndices: number[];       // current slice (unfold)
  fullChordNodeIndices: number[];   // full set (hold during Color)

  // boundary nodes (7)
  boundaryNodeIndices: number[];
  // nodes outside boundary (for bulge)
  borrowedNodeIndices: number[];
  borrowCount: 0 | 1 | 2;

  // visuals
  ink: string;
  ringClipR?: number;   // default 36 (inside ring)
  boundaryR?: number;   // where boundary nodes lie (default 33)
  centerR?: number;     // where chord centers lie (default 33)
  res?: number;         // default 256 live
  shiftCoef?: number;   // divider shift (default 0.25)
  stepIndex: number | null; // null => hold final
}) {
  const ringClipR = props.ringClipR ?? 36;
  const boundaryR = props.boundaryR ?? 33;
  // Bubble centers sit on the polygon node ring (same as boundaryR)
const centerR = boundaryR;
  const res = props.res ?? 256;
  const shiftCoef = props.shiftCoef ?? 0.25;

  // hold final during Color (stepIndex null)
  const effectiveNodes = useMemo(() => {
    if (props.stepIndex == null) return props.fullChordNodeIndices;
    return props.chordNodeIndices;
  }, [props.stepIndex, props.chordNodeIndices, props.fullChordNodeIndices]);

  // boundary bulge (subtle + elegant)
  const bulgeR = useMemo(() => {
    if (props.borrowCount === 0) return 0;
    if (props.borrowCount === 1) return ringClipR;       // touch
    return ringClipR * 1.10;                              // +10% overshoot
  }, [props.borrowCount, ringClipR]);

  const poly: Pt[] = useMemo(() => {
    const bulge: Record<number, number> = {};
    if (props.borrowCount > 0) {
      for (const ni of props.borrowedNodeIndices) bulge[((ni % 12) + 12) % 12] = bulgeR;
    }
    return polygonFromNodeIndices({
      nodeIndices: props.boundaryNodeIndices,
      rDefault: boundaryR,
      bulge,
    });
  }, [props.boundaryNodeIndices, boundaryR, props.borrowedNodeIndices, props.borrowCount, bulgeR]);

  // Sequential tangent growth radii (centers fixed on node ring)
  const bubbles: Bubble[] = useMemo(() => {
  const out: Bubble[] = [];

  for (let i = 0; i < effectiveNodes.length; i++) {
    const ni = effectiveNodes[i];

    // Anchor point ON the ring (where the chord node is)
    for (let i = 0; i < effectiveNodes.length; i++) {
  const ni = effectiveNodes[i];

  // Center is on the polygon node ring (what you currently see as octagon nodes)
  const c = nodePos(ni, centerR);

  // Base radius: distance from this node-center to the circle center.
  // This makes the visible part a “cap” growing inward and able to fill the interior.
  const dx0 = 50 - c.x;
  const dy0 = 50 - c.y;
  const rToCenter = Math.sqrt(dx0 * dx0 + dy0 * dy0);

  // Order-weighted target radii (locked)
  const mult = ORDER_MULT[i] ?? ORDER_MULT[ORDER_MULT.length - 1];

  // Borrowed chords can be allowed slightly stronger growth (subtle)
  const borrowBoost = props.borrowCount === 2 ? 1.10 : props.borrowCount === 1 ? 1.05 : 1.0;

  // Target radius (this may extend outside polygon; clipping will shape it)
  const r = rToCenter * mult * borrowBoost;

  // Subtle alpha variation per bubble
  const alpha = clamp(0.28 + (i % 2 === 0 ? 0.05 : -0.05), 0.14, 0.36);

  out.push({ id: i, c, r, alpha });
}
  }

  return out;
}, [effectiveNodes, centerR, props.borrowCount]);

  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!poly.length || !bubbles.length) {
      setDataUrl("");
      return;
    }

    const key = `${props.seedKey}|k=${bubbles.length}|b=${props.borrowCount}|res=${res}|shift=${shiftCoef}`;
    const cache = ((window as any).__flowBubbleCache ??= new Map<string, string>()) as Map<string, string>;
    const hit = cache.get(key);
    if (hit) {
      setDataUrl(hit);
      return;
    }

    const img = rasterizeBubbleCells({
  poly,
  bubbles,
  res,
  ink: props.ink,
  shiftCoef,
  baseFillAlpha: 0.06, // subtle fill so the circle isn’t empty
});

    const url = imageDataToDataUrl(img);
    cache.set(key, url);
    setDataUrl(url);
  }, [props.seedKey, props.borrowCount, props.ink, poly, bubbles, res, shiftCoef]);

  const clipId = useMemo(() => {
    return `clip-flowbubbles-${props.seedKey.replace(/[^a-z0-9]+/gi, "-")}`;
  }, [props.seedKey]);

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx={50} cy={50} r={ringClipR} />
        </clipPath>
      </defs>

      {dataUrl ? (
        <image
          href={dataUrl}
          x={50 - ringClipR}
          y={50 - ringClipR}
          width={ringClipR * 2}
          height={ringClipR * 2}
          preserveAspectRatio="none"
          clipPath={`url(#${clipId})`}
          opacity={1}
        />
      ) : null}
    </>
  );
}