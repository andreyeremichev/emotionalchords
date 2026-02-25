// lib/spiral.ts
export type SpiralPt = { x: number; y: number };

export function wrapAngle(a: number): number {
  let x = a;
  while (x <= -Math.PI) x += Math.PI * 2;
  while (x > Math.PI) x -= Math.PI * 2;
  return x;
}

export function angleLerp(a: number, b: number, t: number) {
  const d = wrapAngle(b - a);
  return a + d * t;
}

export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 1000000;
}

export function spiralCurlsForCount(nPlayable: number): number {
  if (nPlayable <= 4) return 2;
  if (nPlayable <= 10) return 3;
  return 4;
}

export function avgAngularJump(angles: number[]): number {
  if (angles.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < angles.length; i++) sum += Math.abs(wrapAngle(angles[i] - angles[i - 1]));
  return sum / (angles.length - 1);
}

export function smoothPath(points: SpiralPt[]): string {
  if (points.length < 2) return "";
  const p0 = points[0];
  let d = `M ${p0.x.toFixed(3)} ${p0.y.toFixed(3)}`;
  for (let i = 1; i < points.length; i++) {
    const pPrev = points[i - 1];
    const p = points[i];
    const mx = (pPrev.x + p.x) / 2;
    const my = (pPrev.y + p.y) / 2;
    if (i === 1) d += ` Q ${pPrev.x.toFixed(3)} ${pPrev.y.toFixed(3)} ${mx.toFixed(3)} ${my.toFixed(3)}`;
    else d += ` T ${mx.toFixed(3)} ${my.toFixed(3)}`;
    if (i === points.length - 1) d += ` T ${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
  }
  return d;
}

/**
 * InkSpiral-feel spiral builder, but with many sub-steps per node
 * so short progressions still look like a real spiral (not spikes).
 */
export function calibratedTurnsForDegree(deg: number): number {
  const d = Math.max(1, Math.min(7, Math.floor(deg)));
  return 1 + Math.floor((d - 1) / 3); // 1..3->1, 4..6->2, 7->3
}

export function buildAlignedSpiralPath(opts: {
  nodeIndices: number[];   // 0..11 per chord
  dir: 1 | -1;             // +1 major CW, -1 minor CCW
  borrowCount: 0 | 1 | 2;  // 0=diatonic, 1=one borrowed, 2=two borrowed
  stepsPerTurn?: number;   // default 42
  ringR?: number;          // default 36
  overshootPct?: number;   // default 0.10 (10%)
}): { points: SpiralPt[]; pathD: string } {
  const nodes = (opts.nodeIndices || []).map((n) => ((n % 12) + 12) % 12);
  if (!nodes.length) return { points: [], pathD: "" };

  const dir = opts.dir;
  const stepsPerTurn = Math.max(18, Math.min(120, opts.stepsPerTurn ?? 42));
  const ringR = opts.ringR ?? 36;
  const overshootPct = opts.overshootPct ?? 0.10;

  // Radius envelope per borrowCount
  // borrow=0: stays tight all the way
  // borrow=1: reaches ring at end
  // borrow=2: reaches ring earlier + subtle overshoot near end
  const rEnd0 = 30;                         // tight end
  const rEnd1 = ringR;                      // touch ring at end
  const rEnd2 = ringR * (1 + overshootPct); // subtle overshoot, e.g. 39.6 at 10%

  function radiusAt(u: number) {
    const x = clamp(u, 0, 1);

    if (opts.borrowCount === 0) {
      // tight all the way
      return rEnd0 * x;
    }

    if (opts.borrowCount === 1) {
      // gradual to ring by end
      return rEnd1 * x;
    }

    // borrow=2: reach ring earlier, then overshoot near end
    const reachAt = 0.72; // reaches ring ~72% through
    if (x <= reachAt) {
      return ringR * (x / reachAt);
    }
    const t = (x - reachAt) / (1 - reachAt); // 0..1
    const eased = Math.pow(t, 1.25);          // subtle elegance
    return ringR + (rEnd2 - ringR) * eased;
  }

  function angleForNode(ni: number) {
    return (ni / 12) * Math.PI * 2 - Math.PI / 2;
  }

  // Directed travel in twelfths (0..11), based on CW/CCW
  function directedSteps(from: number, to: number, dir: 1 | -1) {
    if (dir === 1) return (to - from + 12) % 12;     // clockwise
    return (from - to + 12) % 12;                    // counterclockwise
  }

  const n = nodes.length;
  const pts: SpiralPt[] = [{ x: 50, y: 50 }];

  // start aligned to first node angle
  let theta = angleForNode(nodes[0]);

  for (let i = 0; i < n; i++) {
    const targetNode = nodes[i];
    const targetAngle = angleForNode(targetNode);

    // Option B:
    // travelTurns = m/12 (directed)
    // if travel >= 7/12 => travel-only
    // else => 1 full curl + travel
    let travelTurns = 0;
    if (i > 0) {
      const m = directedSteps(nodes[i - 1], nodes[i], dir); // 0..11
      travelTurns = m / 12;
    }

    const baseTurns = i === 0 ? 1 : (travelTurns >= 7 / 12 ? 0 : 1);
    const turns = baseTurns + travelTurns;

    // Total delta angle for this chord segment
    // (base full turns + directed travel)
    const delta = dir * (Math.PI * 2 * turns);

    // Steps proportional to turns
    const segSteps = Math.max(30, Math.round(stepsPerTurn * Math.max(0.9, turns)));

    const theta0 = theta;

    for (let s = 1; s <= segSteps; s++) {
      const t = s / segSteps; // 0..1
      const chordU = (i + t) / n; // 0..1 across the whole progression

      const a = theta0 + delta * t;
      const r = radiusAt(chordU);

      const x = 50 + Math.cos(a) * r;
      const y = 50 + Math.sin(a) * r;
      pts.push({ x, y });
    }

    // force end exactly on target angle (alignment guarantee)
    theta = targetAngle;
  }

  return { points: pts, pathD: smoothPath(pts) };
}
