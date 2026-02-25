// lib/flowSpots/bubbleRaster.ts
import { Pt, pointInPolygon, normalize } from "./geom";

export type Bubble = {
  id: number;
  c: Pt;      // center 0..100
  r: number;  // target radius 0..100
  alpha: number;
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function dist2(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Straight divider (half-plane) between i and j:
 * - normal points from i -> j
 * - base is midpoint
 * - shifted by s*(rj - ri) along normal so bigger bubble gets more territory
 * A point belongs to i if dot(p - dividerPoint, n) <= 0
 */
function inHalfPlaneForI(p: Pt, bi: Bubble, bj: Bubble, shiftCoef: number) {
  const v = { x: bj.c.x - bi.c.x, y: bj.c.y - bi.c.y };
  const n = normalize(v);
  const mid = { x: (bi.c.x + bj.c.x) / 2, y: (bi.c.y + bj.c.y) / 2 };

  const shift = shiftCoef * (bj.r - bi.r); // toward smaller bubble
  const divider = { x: mid.x + n.x * shift, y: mid.y + n.y * shift };

  // side test
  const s = (p.x - divider.x) * n.x + (p.y - divider.y) * n.y;
  return s <= 0;
}

/**
 * Rasterize soap-bubble cells:
 * - candidate bubble must be within its disk (dist <= r)
 * - and must satisfy half-plane constraints vs all other bubbles
 * - pick the bubble with smallest normalized distance (dist/r) as winner
 */
export function rasterizeBubbleCells(opts: {
  poly: Pt[];
  bubbles: Bubble[];
  res: number;
  ink: string;
  shiftCoef?: number;
  baseFillAlpha?: number; // NEW: subtle fill inside boundary when no bubble claims a pixel
}): ImageData {
  const { poly, bubbles, res, ink } = opts;
  const shiftCoef = opts.shiftCoef ?? 0.25;
const baseFillAlpha = opts.baseFillAlpha ?? 0.06; // subtle “not empty” fill

  const { r: R, g: G, b: B } = hexToRgb(ink);
  const data = new Uint8ClampedArray(res * res * 4);

  for (let y = 0; y < res; y++) {
    const yy = (y + 0.5) * (100 / res);
    for (let x = 0; x < res; x++) {
      const xx = (x + 0.5) * (100 / res);
      const p = { x: xx, y: yy };
      const idx = (y * res + x) * 4;

      // outside polygon -> transparent
      if (!pointInPolygon(p, poly)) {
        data[idx + 0] = R;
        data[idx + 1] = G;
        data[idx + 2] = B;
        data[idx + 3] = 0;
        continue;
      }

      let best = -1;
let bestScore = Infinity;

for (let i = 0; i < bubbles.length; i++) {
  const bi = bubbles[i];
  if (bi.r <= 0.001) continue;

  const d2i = dist2(p, bi.c);

  // 1) Must be inside bubble disk -> keeps curved arcs
  if (d2i > bi.r * bi.r) continue;

  // 2) Divider constraints only matter where disks overlap:
  //    Only enforce i-vs-j half-plane if p is also inside bubble j's disk.
  let ok = true;
  for (let j = 0; j < bubbles.length; j++) {
    if (j === i) continue;
    const bj = bubbles[j];
    if (bj.r <= 0.001) continue;

    const d2j = dist2(p, bj.c);
    if (d2j > bj.r * bj.r) continue; // no overlap at this pixel -> no divider needed

    if (!inHalfPlaneForI(p, bi, bj, shiftCoef)) {
      ok = false;
      break;
    }
  }
  if (!ok) continue;

  // 3) Winner: normalized closeness
  const di = Math.sqrt(d2i);
  const score = di / (bi.r + 1e-6);
  if (score < bestScore) {
    bestScore = score;
    best = i;
  }
}

// If nobody claims this pixel, fill softly so it never looks “empty”
if (best < 0) {
  data[idx + 0] = R;
  data[idx + 1] = G;
  data[idx + 2] = B;
  data[idx + 3] = Math.round(baseFillAlpha * 255);
  continue;
}

const a = clamp(bubbles[best].alpha, 0.06, 0.45);
data[idx + 0] = R;
data[idx + 1] = G;
data[idx + 2] = B;
data[idx + 3] = Math.round(a * 255);
    }
  }

  return new ImageData(data, res, res);
}

export function imageDataToDataUrl(img: ImageData): string {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}