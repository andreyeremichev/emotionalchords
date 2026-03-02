// lib/audio/liveAudio.ts
// Minimal live-audio stabilizer for HTMLAudioElement playback.
// - caches Audio objects (reduces jitter + network churn)
// - provides warmup() to satisfy browser audio policies
// - safe for repeated calls

const cache = new Map<string, HTMLAudioElement>();

function toSafeFilename(noteName: string) {
  // Encode '#' for browser-safe URL
  return noteName.replace("#", "%23");
}

export function warmupLiveAudio() {
  // Call on first user gesture (click/tap) before playback starts.
  // This pre-creates a silent audio element so the browser "unlocks" audio.
  try {
    const a = new Audio();
    a.muted = true;
    a.play().catch(() => {});
    a.pause();
  } catch {
    // ignore
  }
}

export function primeNotes(noteNames: string[]) {
  // Preload a small set of notes you know you'll use often.
  for (const n of noteNames) {
    getAudio(n);
  }
}

export function playLiveNote(noteName: string) {
  const a = getAudio(noteName);

  try {
    // Restart immediately
    a.pause();
    a.currentTime = 0;
  } catch {}

  a.play().catch(() => {});
  return a;
}

function getAudio(noteName: string) {
  const safe = toSafeFilename(noteName);
  const key = safe;

  const existing = cache.get(key);
  if (existing) return existing;

  const a = new Audio(`/audio/notes/${safe}.wav`);
  a.preload = "auto";
  cache.set(key, a);
  return a;
}

export function stopLiveAudios(audios: HTMLAudioElement[]) {
  for (const a of audios) {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  }
}