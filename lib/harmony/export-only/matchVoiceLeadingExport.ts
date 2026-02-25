// lib/harmony/export-only/matchVoiceLeadingExport.ts
// Minimal-motion voice-leading mapping for Export-only usage

export function circDist(a: number, b: number) {
  const d = Math.abs(a - b) % 12;
  return Math.min(d, 12 - d);
}

export function buildMinimalMotionMapping(A: number[], B: number[]) {
  const shared = A.filter((p) => B.includes(p));
  const locks = shared.map((p) => ({ from: p, to: p }));
  const U = A.filter((p) => !shared.includes(p));
  const V = B.filter((p) => !shared.includes(p));

  const pairs: { from?: number; to?: number }[] = [...locks];
  const usedV = new Set<number>();

  for (const u of U) {
    let best: { to: number; cost: number } | null = null;
    for (const v of V) {
      if (usedV.has(v)) continue;
      const c = circDist(u, v) + (v === B[0] ? -0.05 : 0);
      if (!best || c < best.cost) best = { to: v, cost: c };
    }
    if (best) {
      pairs.push({ from: u, to: best.to });
      usedV.add(best.to!);
    } else pairs.push({ from: u });
  }

  for (const v of V) {
    if (![...pairs.map((p) => p.to)].includes(v)) pairs.push({ to: v });
  }
  return pairs;
}