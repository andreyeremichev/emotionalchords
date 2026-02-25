// lib/flowSpots/rasterPowerDiagram.ts
import { Pt, pointInPolygon } from "./geom";

export type Seed = {
  id: number;         // 0..k
  c: Pt;              // center in 0..100 space
  r: number;          // radius in same space
  alpha: number;      // per-seed alpha
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Rasterize a weighted Voronoi (power diagram):
 * region i minimizes ||x-ci||^2 - ri^2, clipped to polygon.
 * Returns ImageData at res x res for a 0..100 coordinate space.
 */
export function rasterizePowerDiagram(opts: {
  poly: Pt[];
  seeds: Seed[];
  res: number;     // e.g. 256 live, 512 export
  ink: string;     // hex, e.g. emotion.trailColor
  bgAlpha?: number; // outside polygon alpha (default 0)
}): ImageData {
  const { poly, seeds, res, ink } = opts;
  const bgAlpha = opts.bgAlpha ?? 0;

  const { r: R, g: G, b: B } = hexToRgb(ink);

  const data = new Uint8ClampedArray(res * res * 4);

  for (let y = 0; y < res; y++) {
    const yy = (y + 0.5) * (100 / res);
    for (let x = 0; x < res; x++) {
      const xx = (x + 0.5) * (100 / res);
      const p = { x: xx, y: yy };

      const idx = (y * res + x) * 4;

      if (!pointInPolygon(p, poly)) {
        data[idx + 0] = R;
        data[idx + 1] = G;
        data[idx + 2] = B;
        data[idx + 3] = Math.round(bgAlpha * 255);
        continue;
      }

      // pick region by minimal power distance
      let best = 0;
      let bestD = Infinity;

      for (let i = 0; i < seeds.length; i++) {
        const s = seeds[i];
        const dx = p.x - s.c.x;
        const dy = p.y - s.c.y;
        const d = dx * dx + dy * dy - s.r * s.r;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }

      const a = Math.max(0, Math.min(1, seeds[best]?.alpha ?? 0.22));

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