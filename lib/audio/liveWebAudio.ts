// lib/audio/liveWebAudio.ts
// WebAudio live sampler for iOS-stable playback (no HTMLAudioElement).
// - single AudioContext singleton
// - buffer cache
// - "unlock" helper for first gesture
// - playNotes() for chords

let _ctx: AudioContext | null = null;
const _buffers = new Map<string, AudioBuffer>();

function getCtx(): AudioContext {
  if (_ctx) return _ctx;
  const AC: any = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  _ctx = new AC({ latencyHint: "interactive" });
  return _ctx!;
}

function safeName(note: string) {
  return note.replace("#", "%23");
}

export async function unlockLiveAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {}
  }

  // iOS: play a tiny silent buffer to fully unlock
  try {
    const b = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = b;
    src.connect(ctx.destination);
    src.start(0);
    src.stop(0);
  } catch {}
}

async function loadBuffer(note: string): Promise<AudioBuffer> {
  const key = note;
  const existing = _buffers.get(key);
  if (existing) return existing;

  const ctx = getCtx();
  const res = await fetch(`/audio/notes/${safeName(note)}.wav`);
  if (!res.ok) throw new Error(`fetch failed: ${note}`);
  const buf = await ctx.decodeAudioData(await res.arrayBuffer());
  _buffers.set(key, buf);
  return buf;
}

export async function primeLiveNotes(notes: string[]) {
  // Best-effort preload; failures are ignored.
  await unlockLiveAudio();
  await Promise.all(
    notes.map((n) => loadBuffer(n).catch(() => null))
  );
}

export async function playLiveNotes(notes: string[]) {
  if (!notes.length) return;

  const ctx = getCtx();
  if (ctx.state === "suspended") {
    // If user didn’t gesture yet, this may still fail silently on iOS.
    // That’s why we add unlockLiveAudio() on first pointerdown.
    try { await ctx.resume(); } catch {}
  }

  // Schedule “now” with a tiny lead to reduce jitter
  const t0 = ctx.currentTime + 0.01;

  await Promise.all(
    notes.map(async (n) => {
      const buf = await loadBuffer(n);
      const src = ctx.createBufferSource();
      src.buffer = buf;

      // conservative gain to avoid clipping when stacking notes
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9, t0);

      src.connect(g);
      g.connect(ctx.destination);

      try {
        src.start(t0);
        src.stop(t0 + 1.2);
      } catch {}
    })
  );
}