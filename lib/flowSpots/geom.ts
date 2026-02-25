// lib/flowSpots/geom.ts
export type Pt = { x: number; y: number };

export function nodePos(nodeIndex: number, r: number): Pt {
  const i = ((nodeIndex % 12) + 12) % 12;
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
}

export function sortNodesAroundCircle(nodeIndices: number[]): number[] {
  const uniq = Array.from(new Set(nodeIndices.map((n) => ((n % 12) + 12) % 12)));
  return uniq.sort((a, b) => a - b);
}

export function polygonFromNodeIndices(opts: {
  nodeIndices: number[]; // 7 scale nodes
  rDefault: number;
  bulge: Record<number, number>; // nodeIndex -> radius override
}): Pt[] {
  const ordered = sortNodesAroundCircle(opts.nodeIndices);
  return ordered.map((ni) => nodePos(ni, opts.bulge[ni] ?? opts.rDefault));
}

export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function dot(a: Pt, b: Pt) {
  return a.x * b.x + a.y * b.y;
}
function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y };
}
function len(v: Pt) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
export function normalize(v: Pt): Pt {
  const L = len(v) + 1e-12;
  return { x: v.x / L, y: v.y / L };
}

export function distPointToSegment(p: Pt, a: Pt, b: Pt): number {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const denom = dot(ab, ab) + 1e-12;
  let t = dot(ap, ab) / denom;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  const dx = p.x - proj.x;
  const dy = p.y - proj.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function minDistToPolygonEdges(center: Pt, poly: Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const d = distPointToSegment(center, a, b);
    if (d < best) best = d;
  }
  return best;
}