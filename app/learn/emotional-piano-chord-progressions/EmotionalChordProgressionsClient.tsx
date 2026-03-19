"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type EmotionRecipe = {
  id:
    | "calm"
    | "playful"
    | "magic"
    | "sadness"
    | "mystery"
    | "melancholy"
    | "wonder"
    | "tension"
    | "anger"
    | "fear";
  emoji: string;
  emotion: string;
  motion: string;
  focus: string;
  intro: string[];
  feelsLike: string[];
  whilePlaying: string;
  breaksIt: string;
  flowRh: string;
  flowLh: string;
  colorRh: string;
  colorLh: string;
  rhythm: string;
  pedal: string;
  whyItWorks: string;
  breaks100: string;
};


// ---- ROOT LOGIC ----
const ROOT_OPTIONS = ["C", "D", "Eb", "F", "G", "A", "Bb"] as const;

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const SHARP_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLAT_NAMES  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

function prefersFlats(root: string) {
  return ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(root);
}

function normalize(note: string) {
  return note.replace(/♭/g, "b").replace(/♯/g, "#");
}

function display(note: string) {
  return note.replace(/b/g, "♭").replace(/#/g, "♯");
}

function transposeSingle(note: string, offset: number, flats: boolean) {
  const n = normalize(note);
  const s = NOTE_TO_SEMITONE[n];
  if (s === undefined) return note;
  const next = (s + offset + 12) % 12;
  const out = flats ? FLAT_NAMES[next] : SHARP_NAMES[next];
  return display(out);
}

function transpose(input: string, root: string) {
  const offset = NOTE_TO_SEMITONE[normalize(root)];
  const flats = prefersFlats(root);
  if (offset === undefined) return input;

  return input
    .split(" ")
    .map((t) => (t === "|" ? t : transposeSingle(t, offset, flats)))
    .join(" ");
}
const RECIPES: EmotionRecipe[] = [
  {
    id: "calm",
    emoji: "🌿",
    emotion: "Calm",
    motion: "Settled Circulation",
    focus: "keep it flowing",
    intro: [
      "Calm is not empty, and it is not sleepy.",
      "It is motion that keeps going without asking for attention.",
    ],
    feelsLike: [
      "there is a center",
      "the music moves away smoothly",
      "nothing pushes",
      "and it returns gently",
    ],
    whilePlaying:
      "Keep the bar alive, but do not let anything stand out.",
    breaksIt: "The moment one chord feels important.",
    flowRh: "C E G | B D G | C E A | C F A",
    flowLh: "C | G | A | F",
    colorRh: "C E G | A D F# | A C F | B♭ E♭ G",
    colorLh: "C | D | F | E♭",
    rhythm:
      "1 T | 1& hold / nothing | 2 R | 2& L | 3 R | 4 R | 4& L",
    pedal:
      "Flow = light half-pedal with tiny carry; Color = lighter, cleaner, no real blur.",
    whyItWorks:
      "Both paths keep the bar alive without making any one chord become the event. Flow stays smooth and low-pressure. Color stays calm because the top contour G–F#–F–G feels like a soft change of light, not a reveal.",
    breaks100:
      "The instant any chord behaves like an event, Calm is gone. Strong top-note accents, cadential beat 4, heavy bass, or blurred pedal break it immediately.",
  },
  {
    id: "playful",
    emoji: "🎈",
    emotion: "Playful",
    motion: "Light Return",
    focus: "bounce and come back",
    intro: [
      "Playful is not deep joy.",
      "It is light movement with no consequences.",
    ],
    feelsLike: ["step away", "step again", "easy landing", "reset"],
    whilePlaying:
      "Make everything light and quick. The landing should feel effortless.",
    breaksIt: "If the landing feels heavy or meaningful.",
    flowRh: "C E G | D F A | B D G | C E G",
    flowLh: "C | D | G | C",
    colorRh: "C E G | E♭ G B♭ | C# F# A# | C E♭ A♭",
    colorLh: "C | E♭ | F# | A♭",
    rhythm: "1 T | 2 R | 2& L | 3 R | 3& L | 4 T",
    pedal:
      "Dry, or only a tiny touch on beat 1 if the piano is very dry.",
    whyItWorks:
      "Both paths feel like light deviation plus easy landing. The rhythm skips through the bar. In the Color path, chord 3 feels like a hop instead of a magical flash, so the whole loop stays playful.",
    breaks100:
      "The moment the harmony lingers or gains consequence, Playful is gone. Long legato, pedal, heavy LH, or a serious beat-4 landing kills it immediately.",
  },
  {
    id: "magic",
    emoji: "✨",
    emotion: "Magic",
    motion: "Guided Departure",
    focus: "change the frame, then let it glow",
    intro: [
      "Magic is not empty, and it is not mysterious.",
      "It is the moment the space changes — and then lingers.",
    ],
    feelsLike: [
      "clear start",
      "sudden shift",
      "new direction",
      "soft suspension",
    ],
    whilePlaying:
      "Let one moment feel like the world changed, then don’t over-explain it.",
    breaksIt: "If the change feels either ordinary or overdone.",
    flowRh: "C G A | C E G | B D G | B C E A",
    flowLh: "F | C | G | A",
    colorRh: "C E G | C E♭ A♭ | B E G# | B D G",
    colorLh: "C | A♭ | E | G",
    rhythm: "1 T | 2 R | 4 R",
    pedal:
      "Flow = half-pedal each bar, slightly deeper on bar 4; Color = cleaner on bars 1–3, deeper on bar 4.",
    whyItWorks:
      "Beat 2 is the frame-change, and beat 4 is the shimmer that lets the new frame linger. In Flow, the added B in the last chord is what turns plain lift into actual magic.",
    breaks100:
      "If the reframe is too dry, Magic disappears. If it is too blurred, it becomes Mystery. Hammering the pivot or making bar 4 too openly expansive also breaks it.",
  },
  {
    id: "sadness",
    emoji: "😢",
    emotion: "Sadness",
    motion: "Unresolved Descent",
    focus: "move away and don’t recover",
    intro: [
      "Sadness is quiet withdrawal.",
      "It does not collapse dramatically. It simply keeps moving away.",
    ],
    feelsLike: [
      "moving away",
      "continuing away",
      "no repair",
      "no real return",
    ],
    whilePlaying: "Each touch should feel weaker than the previous one.",
    breaksIt: "If the music sounds healed or supported.",
    flowRh: "G C E♭ | A♭ C E♭ | G B♭ E♭ | F B♭ D",
    flowLh: "C | A♭ | E♭ | B♭",
    colorRh: "G C E♭ | A♭ C E♭ | A♭ C F | G B E",
    colorLh: "C | A♭ | F | E",
    rhythm: "1 T | 2 R | 3 R | 4 –",
    pedal: "Shallow half-pedal; release during beat 4.",
    whyItWorks:
      "Each re-attack has less life than the one before it, and the bar fades before the next one begins. The Color path gives a brief ache at F → E, but it never redirects the descent.",
    breaks100:
      "Any sign of recovery breaks Sadness. A new beat-4 attack, extra LH motion, or pedal that turns the end of the bar into return destroys it.",
  },
  {
    id: "mystery",
    emoji: "🕵️‍♀️",
    emotion: "Mystery",
    motion: "Obscured Orientation",
    focus: "hide the explanation",
    intro: [
      "Mystery is not empty, and it is not magical.",
      "Something is there — but you do not fully understand how.",
    ],
    feelsLike: [
      "the frame exists",
      "alignment slips",
      "clarity drops",
      "structure returns without explanation",
    ],
    whilePlaying:
      "Don’t explain the harmony. Don’t highlight the strange parts.",
    breaksIt: "The moment everything makes perfect sense.",
    flowRh: "G C E♭ | A♭ C F | B♭ D F | G C D E♭",
    flowLh: "C | F | B♭ | C",
    colorRh: "G C E♭ | A D F# | A♭ B F | A# C# F#",
    colorLh: "C | D | F | F#",
    rhythm: "1 T | 2& R | 3 R | 4& L",
    pedal:
      "Mid half-pedal with slightly late changes; a little deeper on chord 3; in Color, chord 4 slightly cleaner than chord 3.",
    whyItWorks:
      "The harmony stays legible, but its cause stays hidden. The Flow path returns to tonic without fully explaining itself because of the added D in the final chord. The Color path drops clarity most strongly in bar 3, then regains structure without explanation.",
    breaks100:
      "The moment the harmony explains itself, Mystery is gone. Plain arrivals, bright emphasized strange chords, or a fully clarified return break it immediately.",
  },
  {
    id: "melancholy",
    emoji: "🌧️",
    emotion: "Melancholy",
    motion: "Altered Return",
    focus: "come back, but changed",
    intro: [
      "Melancholy is not the same as sadness.",
      "Sadness leaves. Melancholy returns — but not unchanged.",
    ],
    feelsLike: [
      "inward start",
      "deepening",
      "return",
      "but not the same return",
    ],
    whilePlaying: "Let the ending feel like memory, not closure.",
    breaksIt: "If the return feels clean or fresh.",
    flowRh: "C E♭ A♭ | C F A♭ | C E♭ G | B D G",
    flowLh: "A♭ | F | C | G",
    colorRh: "G C E♭ | A C# E | G# C# E | F B♭ D",
    colorLh: "C | A | C# | B♭",
    rhythm: "1 T | 2 R | 3 – | 4 R",
    pedal:
      "Light-to-mid half-pedal with slight barline carry; deepest on the loop’s 4th chord.",
    whyItWorks:
      "Beat 4 returns as memory, not as closure. Flow changes the home from inside. Color lets brightness appear, but keeps it tethered to an inward center.",
    breaks100:
      "Either removing the late recolor or turning the altered bars into obvious events breaks Melancholy immediately.",
  },
  {
    id: "wonder",
    emoji: "🌌",
    emotion: "Wonder",
    motion: "Upward Opening",
    focus: "make space bigger",
    intro: ["Wonder is not surprise.", "It is expansion."],
    feelsLike: [
      "contained start",
      "opening upward",
      "opening further",
      "staying open",
    ],
    whilePlaying:
      "Keep widening the space. Don’t turn it into a moment.",
    breaksIt: "If the sound becomes heavy or closed.",
    flowRh: "C E♭ G | C E♭ A♭ | E♭ G B♭ | F A C",
    flowLh: "C | A♭ | E♭ | F",
    colorRh: "C E♭ G | C F A | D G B | D# F# B",
    colorLh: "C | F | G | B",
    rhythm: "1 T | 2 – | 3 R | 4 R",
    pedal:
      "Half-pedal per bar with clean after-attack changes; slightly more bloom on Flow chord 4, slightly cleaner on Color chord 4.",
    whyItWorks:
      "Both paths enlarge the frame upward rather than changing it. Beat 2 leaves air, then beats 3 and 4 keep the space open instead of closing it.",
    breaks100:
      "Closing the hand, thickening the middle register, or making bar 4 feel like a reveal instead of an opening breaks Wonder instantly.",
  },
  {
    id: "tension",
    emoji: "😬",
    emotion: "Tension",
    motion: "Held Pressure",
    focus: "squeeze without release",
    intro: [
      "Tension is pressure that stays contained.",
      "It tightens, but it does not let go.",
    ],
    feelsLike: [
      "stable start",
      "tightening",
      "more tightening",
      "still no release",
    ],
    whilePlaying: "Build pressure, but don’t let it escape.",
    breaksIt: "The moment the listener feels relief.",
    flowRh: "G C E♭ | A♭ D F | B D F | G C D E♭",
    flowLh: "C | D | G | C",
    colorRh: "G C E | G# C# E | G B♭ E | A# C# E",
    colorLh: "C | C# | E | F#",
    rhythm:
      "1 T | 1& hold / nothing | 2 R | 2& L | 3 T | 4 R | 4& L",
    pedal:
      "Shallow half-pedal; catch after 1; refresh on 3; change just after next beat 1.",
    whyItWorks:
      "Beat 3 is the squeeze-point, and beat 4 still does not release. In Color, the fixed upper E is crucial: the harmony tightens underneath a held ceiling.",
    breaks100:
      "Any emotional exhale on beat 4 breaks Tension immediately. If the bar starts driving instead of compressing, it is no longer Tension.",
  },
  {
    id: "anger",
    emoji: "😡",
    emotion: "Anger",
    motion: "Grinding Advance",
    focus: "push through",
    intro: ["Anger is simple.", "Not delicate. Not subtle."],
    feelsLike: ["resistance", "push", "more push", "still pushing"],
    whilePlaying:
      "Keep it direct and forceful. Less detail usually gives more anger.",
    breaksIt: "If the push becomes smooth or soft.",
    flowRh: "C E♭ G | C F A♭ | D♭ F A♭ | B D G A♭",
    flowLh: "C | F | D♭ | G",
    colorRh: "C E♭ G | C# E G# | B♭ E G | A# C# F# G",
    colorLh: "C | C# | E | F#",
    rhythm:
      "LH root-octave pulses on 1–2–3–4, RH attack on beat 1 and hold",
    pedal: "Dry.",
    whyItWorks:
      "The RH stays like a clenched block while the LH keeps shoving. The last-bar added notes — A♭ in Flow and G in Color — keep the ending snarling instead of releasing.",
    breaks100:
      "The instant the shove becomes smooth, Anger is gone. Legato, pedal, or soft/equal LH pulses break it immediately.",
  },
  {
    id: "fear",
    emoji: "😱",
    emotion: "Fear",
    motion: "Loss of Ground",
    focus: "remove support",
    intro: ["Fear is not just dark.", "It is unstable."],
    feelsLike: [
      "fragile start",
      "ground disappears",
      "motion continues anyway",
      "no safety returns",
    ],
    whilePlaying: "Let support come too late — or not at all.",
    breaksIt: "The moment the ground feels reliable again.",
    flowRh: "G C E♭ | A♭ D♭ F | A♭ B D | G D E♭",
    flowLh: "C | D♭ | G | C",
    colorRh: "G C E♭ | A C F# | D A♭ B | D♭ E G",
    colorLh: "C | F# | G | B♭",
    rhythm:
      "1 T (LH octave + RH chord, RH holds) | 2 LH upper note only | 3 – | 4 LH upper note only",
    pedal: "Dry.",
    whyItWorks:
      "Support comes late and inadequately, and there is no beat-3 center to stabilize the bar. In Flow, the last chord returns to C without ever feeling safe. In Color, the final diminished shape keeps the floor gone.",
    breaks100:
      "The moment the bass feels reliable, Fear is broken. Full LH pulses, equal support on beats 2 and 4, or any pedal that reconnects the bar destroys it.",
  },
];
// ---- COMPONENT ----

export default function EmotionalChordProgressionsClient() {
  const [selectedRoot, setSelectedRoot] =
    useState<(typeof ROOT_OPTIONS)[number]>("C");

  const shownRecipes = useMemo(
    () =>
      RECIPES.map((item) => ({
        ...item,
        flowRh: transpose(item.flowRh, selectedRoot),
        flowLh: transpose(item.flowLh, selectedRoot),
        colorRh: transpose(item.colorRh, selectedRoot),
        colorLh: transpose(item.colorLh, selectedRoot),
      })),
    [selectedRoot]
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Learn
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          <span className="bg-gradient-to-r from-[#87a8ff] via-[#c68bfe] to-[#ff80b5] bg-clip-text text-transparent">
            Emotional piano chord progressions
          </span>
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-700">
          Piano chord progressions can create clear feelings like calm, sadness,
          tension, wonder, or mystery. But the feeling does not come from the
          chords alone. It comes from how they move, which notes stand out, how
          the bar unfolds, and how long the sound stays.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-700">
          So emotion on piano is not something you paste on top later. It grows
          out of motion. This page is a feeling guide first. The full playbooks
          are the hands guide.
        </p>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm font-medium text-neutral-900">Choose root</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {ROOT_OPTIONS.map((root) => {
              const active = root === selectedRoot;
              return (
                <button
                  key={root}
                  type="button"
                  onClick={() => setSelectedRoot(root)}
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-black text-white"
                      : "bg-[#faf7f3] text-neutral-800 ring-1 ring-black/10 hover:ring-black/30",
                  ].join(" ")}
                >
                  {root}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            All examples are transposed from the same motion recipe, so the
            feeling stays the same while the root changes.
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm leading-relaxed text-neutral-800">
            Each emotion below includes:
          </p>

          <ul className="mt-2 space-y-1 text-sm text-neutral-700">
            <li>• what the feeling actually is</li>
            <li>• the motion description behind it</li>
            <li>• what to focus on while playing</li>
            <li>• Flow and Color chord progressions</li>
            <li>• what breaks the emotion instantly</li>
          </ul>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
          <p className="text-sm text-neutral-700">
            All examples use <strong>4 beats per bar</strong>. In rhythm lines:{" "}
            <strong>T</strong> = LH + RH together, <strong>R</strong> = RH only,{" "}
            <strong>L</strong> = LH only.
          </p>
        </div>
      </header>

      <section className="space-y-6">
        {shownRecipes.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Emotion recipe
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
                  {item.emoji} {item.emotion}
                </h2>
              </div>

              <Link
                href={`/emotions/${item.id}`}
                className="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-black"
              >
                Open {item.emotion} playbook →
              </Link>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#faf7f3] p-4 ring-1 ring-black/5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Motion description
                </div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">
                  {item.motion}
                </div>

                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Focus while playing
                </div>
                <div className="mt-1 text-sm text-neutral-800">
                  {item.focus}
                </div>
              </div>

              <div className="rounded-xl bg-[#faf7f3] p-4 ring-1 ring-black/5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Playable chord progressions
                </div>

                <div className="mt-2 text-sm text-neutral-800">
                  <span className="font-medium">Flow RH:</span> {item.flowRh}
                </div>
                <div className="mt-1 text-sm text-neutral-700">
                  <span className="font-medium">Flow LH:</span> {item.flowLh}
                </div>

                <div className="mt-3 text-sm text-neutral-800">
                  <span className="font-medium">Color RH:</span> {item.colorRh}
                </div>
                <div className="mt-1 text-sm text-neutral-700">
                  <span className="font-medium">Color LH:</span> {item.colorLh}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-700">
              {item.intro.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              <div>
                <div className="font-medium text-neutral-900">
                  It should feel like:
                </div>
                <ul className="mt-2 space-y-1">
                  {item.feelsLike.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>

              <p>
                <span className="font-medium text-neutral-900">
                  While playing:
                </span>{" "}
                {item.whilePlaying}
              </p>

              <p>
                <span className="font-medium text-neutral-900">
                  Rhythm:
                </span>{" "}
                {item.rhythm}
              </p>

              <p>
                <span className="font-medium text-neutral-900">
                  Pedal:
                </span>{" "}
                {item.pedal}
              </p>

              <p>
                <span className="font-medium text-neutral-900">
                  Why it works:
                </span>{" "}
                {item.whyItWorks}
              </p>

              <p>
                <span className="font-medium text-neutral-900">
                  What breaks it instantly:
                </span>{" "}
                {item.breaksIt}
              </p>

              <p>
                <span className="font-medium text-neutral-900">
                  What breaks it 100%:
                </span>{" "}
                {item.breaks100}
              </p>
            </div>

            <div className="mt-5 text-sm">
              <Link
                href={`/emotions/${item.id}`}
                className="underline underline-offset-2 hover:text-black"
              >
                Go to the {item.emotion} playbook
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          How to use this
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
          When you sit at the piano, don’t ask, “What emotion should I play?”
          Ask what the motion is — and what must not happen.
        </p>

        <ol className="mt-3 space-y-1 text-sm text-neutral-700">
          <li>1. Play the progression</li>
          <li>2. Apply the right rhythm</li>
          <li>3. Apply the right touch</li>
          <li>4. Protect the emotion</li>
        </ol>

        <p className="mt-3 text-sm leading-relaxed text-neutral-700">
          If it doesn’t feel right, you probably didn’t “miss the emotion.” You
          changed the motion.
        </p>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/10">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
          The core map
        </h2>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="text-sm text-neutral-700">Calm → flow</div>
          <div className="text-sm text-neutral-700">Playful → bounce</div>
          <div className="text-sm text-neutral-700">Magic → reframe</div>
          <div className="text-sm text-neutral-700">Sadness → recede</div>
          <div className="text-sm text-neutral-700">Mystery → obscure</div>
          <div className="text-sm text-neutral-700">
            Melancholy → return changed
          </div>
          <div className="text-sm text-neutral-700">Wonder → open</div>
          <div className="text-sm text-neutral-700">Tension → compress</div>
          <div className="text-sm text-neutral-700">Anger → push</div>
          <div className="text-sm text-neutral-700">Fear → lose ground</div>
        </div>

        <p className="mt-4 text-sm text-neutral-700">
          If you want the full explanation of why these two harmonic paths feel
          different, go next to{" "}
          <Link
            href="/learn/paths-of-harmony"
            className="underline underline-offset-2 hover:text-black"
          >
            Paths of Harmony
          </Link>
          .
        </p>
      </section>
    </main>
  );
}