"use client";

import { useMemo, useState } from "react";
import { parseProgression } from "@/lib/harmony/chords";
import ShortsPreview from "@/components/shorts/ShortsPreview";
import { SHORTS_PRESETS } from "@/lib/shorts/presets";
import { exportShortVideo } from "@/lib/shorts/exportShort";

export default function ShortsRendererClient() {
  const [presetId, setPresetId] = useState(SHORTS_PRESETS[0].id);
  const preset = useMemo(() => SHORTS_PRESETS.find((item) => item.id === presetId) ?? SHORTS_PRESETS[0], [presetId]);

  const [progression, setProgression] = useState(preset.progression);
  const [tempo, setTempo] = useState(preset.tempo);
  const [chordBeats, setChordBeats] = useState(preset.chordBeats);
  const [playMode, setPlayMode] = useState<"chords" | "arpeggio">(preset.playMode);
  const [status, setStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const chords = useMemo(() => parseProgression(progression).filter((c) => c.pcs.length > 0), [progression]);

  function applyPreset(nextId: string) {
    const next = SHORTS_PRESETS.find((item) => item.id === nextId);
    if (!next) return;
    setPresetId(next.id);
    setProgression(next.progression);
    setTempo(next.tempo);
    setChordBeats(next.chordBeats);
    setPlayMode(next.playMode);
    setStatus(null);
  }

  async function onExport() {
    if (!chords.length) {
      setStatus("Enter at least one valid chord before exporting.");
      return;
    }
    try {
      setIsExporting(true);
      setStatus("Rendering short…");
      const blob = await exportShortVideo({
        preset: { ...preset, tempo, chordBeats, playMode },
        chords,
        tempo,
        chordBeats,
        playMode,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${preset.id}-${Date.now()}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setStatus(`Done. Exported ${chords.map((c) => c.label).join(" • ")}`);
    } catch (error) {
      console.error("[shorts export] failed", error);
      setStatus(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 text-slate-900">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Lab · Shorts Renderer V1</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">Render chord progression shorts from the browser</h1>
        <p className="max-w-3xl text-base leading-7 text-slate-700">
          Pick a preset, tweak the progression, then export a vertical short with animated chord cards and sampled piano audio.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Preset</span>
                <select
                  value={presetId}
                  onChange={(e) => applyPreset(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0"
                >
                  {SHORTS_PRESETS.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Chord progression</span>
                <textarea
                  value={progression}
                  onChange={(e) => setProgression(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none"
                  placeholder="Cmaj7 Am7 Fmaj7 G"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Tempo: {tempo} BPM</span>
                <input type="range" min={50} max={120} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Beats per chord</span>
                <select
                  value={chordBeats}
                  onChange={(e) => setChordBeats(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                >
                  {[2, 3, 4, 6].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Playback</span>
                <select
                  value={playMode}
                  onChange={(e) => setPlayMode(e.target.value as "chords" | "arpeggio")}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="chords">Block chords</option>
                  <option value="arpeggio">Arpeggio</option>
                </select>
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Parsed chords</p>
                <p className="mt-2 leading-6">{chords.length ? chords.map((c) => c.label).join(" · ") : "No valid chords yet."}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={onExport}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? "Rendering…" : "Export short"}
            </button>
            <span className="text-sm text-slate-600">Downloads a WebM directly from the browser.</span>
          </div>
          {status ? <p className="mt-4 text-sm text-slate-700">{status}</p> : null}
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Live preview</p>
          <div className="flex justify-center">
            <ShortsPreview preset={{ ...preset, tempo, chordBeats, playMode }} chords={chords} tempo={tempo} chordBeats={chordBeats} />
          </div>
          <ul className="mt-6 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Canvas-based vertical layout (1080×1920 export).</li>
            <li>• Uses existing /public/audio/notes piano samples.</li>
            <li>• Voice-led chord voicings from the repo’s export helpers.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
