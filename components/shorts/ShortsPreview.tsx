"use client";

import { useEffect, useRef } from "react";
import type { ParsedChord } from "@/lib/harmony/chords";
import type { ShortsPreset } from "@/lib/shorts/presets";
import { hexToRgba } from "@/lib/shorts/format";

type Props = {
  preset: ShortsPreset;
  chords: ParsedChord[];
  tempo: number;
  chordBeats: number;
};

export default function ShortsPreview({ preset, chords, tempo, chordBeats }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const chordDurSec = (60 / Math.max(1, tempo)) * Math.max(1, chordBeats);

    const frame = () => {
      const now = (performance.now() - start) / 1000;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, preset.palette.background);
      bg.addColorStop(1, hexToRgba(preset.palette.accent, 0.2));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const orbY = height * (0.24 + 0.07 * Math.sin(now * 0.9));
      const orb = ctx.createRadialGradient(width / 2, orbY, 16, width / 2, orbY, width * 0.34);
      orb.addColorStop(0, hexToRgba(preset.palette.accent, 0.8));
      orb.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, width, height);

      const activeIndex = chords.length ? Math.floor(now / chordDurSec) % chords.length : 0;
      const chord = chords[activeIndex];

      ctx.fillStyle = preset.palette.text;
      ctx.textAlign = "center";
      ctx.font = "700 28px Arial";
      ctx.fillText(preset.title, width / 2, 54);
      ctx.font = "500 14px Arial";
      ctx.fillStyle = hexToRgba(preset.palette.text, 0.82);
      ctx.fillText(preset.subtitle, width / 2, 76);

      const cardX = width * 0.1;
      const cardY = height * 0.47;
      const cardW = width * 0.8;
      const cardH = height * 0.26;
      ctx.fillStyle = "rgba(15,23,42,0.45)";
      roundRect(ctx, cardX, cardY, cardW, cardH, 18);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(preset.palette.accent, 0.78);
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = preset.palette.text;
      ctx.font = "700 58px Arial";
      ctx.fillText(chord?.label ?? "—", width / 2, cardY + 92);
      ctx.font = "500 14px Arial";
      ctx.fillStyle = hexToRgba(preset.palette.text, 0.84);
      ctx.fillText(`${tempo} BPM • ${preset.playMode === "arpeggio" ? "Arpeggio" : "Block chords"}`, width / 2, cardY + 122);

      const chipY = height - 96;
      const chipW = Math.min(62, (width * 0.75) / Math.max(chords.length, 1));
      const gap = 6;
      const totalW = chords.length * chipW + Math.max(0, chords.length - 1) * gap;
      let x = (width - totalW) / 2;
      ctx.font = "600 10px Arial";
      chords.forEach((item, idx) => {
        ctx.fillStyle = idx === activeIndex ? hexToRgba(preset.palette.accent, 0.96) : "rgba(255,255,255,0.1)";
        roundRect(ctx, x, chipY, chipW, 28, 999);
        ctx.fill();
        ctx.fillStyle = idx === activeIndex ? preset.palette.background : preset.palette.text;
        ctx.fillText(item.label, x + chipW / 2, chipY + 18);
        x += chipW + gap;
      });

      raf = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(raf);
  }, [preset, chords, tempo, chordBeats]);

  return (
    <canvas
      ref={ref}
      width={270}
      height={480}
      className="w-[270px] max-w-full rounded-[28px] border border-white/20 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
    />
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
