export type PracticeEmotionId =
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

export type PracticePathId = "flow" | "color";

type LockedVoicingSet = {
  flow: {
    rh: string[][];
    lh: string[];
  };
  color: {
    rh: string[][];
    lh: string[];
  };
};

export const LOCKED_PRACTICE_VOICINGS: Record<PracticeEmotionId, LockedVoicingSet> = {
  calm: {
    flow: {
      rh: [
        ["C", "E", "G"],
        ["B", "D", "G"],
        ["C", "E", "A"],
        ["C", "F", "A"],
      ],
      lh: ["C", "G", "A", "F"],
    },
    color: {
      rh: [
        ["C", "E", "G"],
        ["A", "D", "F#"],
        ["A", "C", "F"],
        ["Bb", "Eb", "G"],
      ],
      lh: ["C", "D", "F", "Eb"],
    },
  },

  playful: {
    flow: {
      rh: [
        ["C", "E", "G"],
        ["D", "F", "A"],
        ["B", "D", "G"],
        ["C", "E", "G"],
      ],
      lh: ["C", "D", "G", "C"],
    },
    color: {
      rh: [
        ["C", "E", "G"],
        ["Eb", "G", "Bb"],
        ["C#", "F#", "A#"],
        ["C", "Eb", "Ab"],
      ],
      lh: ["C", "Eb", "F#", "Ab"],
    },
  },

  magic: {
    flow: {
      rh: [
        ["C", "G", "A"],
        ["C", "E", "G"],
        ["B", "D", "G"],
        ["B", "C", "E", "A"],
      ],
      lh: ["F", "C", "G", "A"],
    },
    color: {
      rh: [
        ["C", "E", "G"],
        ["C", "Eb", "Ab"],
        ["B", "E", "G#"],
        ["B", "D", "G"],
      ],
      lh: ["C", "Ab", "E", "G"],
    },
  },

  sadness: {
    flow: {
      rh: [
        ["G", "C", "Eb"],
        ["Ab", "C", "Eb"],
        ["G", "Bb", "Eb"],
        ["F", "Bb", "D"],
      ],
      lh: ["C", "Ab", "Eb", "Bb"],
    },
    color: {
      rh: [
        ["G", "C", "Eb"],
        ["Ab", "C", "Eb"],
        ["Ab", "C", "F"],
        ["G", "B", "E"],
      ],
      lh: ["C", "Ab", "F", "E"],
    },
  },

  mystery: {
    flow: {
      rh: [
        ["G", "C", "Eb"],
        ["Ab", "C", "F"],
        ["Bb", "D", "F"],
        ["G", "C", "D", "Eb"],
      ],
      lh: ["C", "F", "Bb", "C"],
    },
    color: {
      rh: [
        ["G", "C", "Eb"],
        ["A", "D", "F#"],
        ["Ab", "B", "F"],
        ["A#", "C#", "F#"],
      ],
      lh: ["C", "D", "F", "F#"],
    },
  },

  melancholy: {
    flow: {
      rh: [
        ["C", "Eb", "Ab"],
        ["C", "F", "Ab"],
        ["C", "Eb", "G"],
        ["B", "D", "G"],
      ],
      lh: ["Ab", "F", "C", "G"],
    },
    color: {
      rh: [
        ["G", "C", "Eb"],
        ["A", "C#", "E"],
        ["G#", "C#", "E"],
        ["F", "Bb", "D"],
      ],
      lh: ["C", "A", "C#", "Bb"],
    },
  },

  wonder: {
    flow: {
      rh: [
        ["C", "Eb", "G"],
        ["C", "Eb", "Ab"],
        ["Eb", "G", "Bb"],
        ["F", "A", "C"],
      ],
      lh: ["C", "Ab", "Eb", "F"],
    },
    color: {
      rh: [
        ["C", "Eb", "G"],
        ["C", "F", "A"],
        ["D", "G", "B"],
        ["D#", "F#", "B"],
      ],
      lh: ["C", "F", "G", "B"],
    },
  },

  tension: {
    flow: {
      rh: [
        ["G", "C", "Eb"],
        ["Ab", "D", "F"],
        ["B", "D", "F"],
        ["G", "C", "D", "Eb"],
      ],
      lh: ["C", "D", "G", "C"],
    },
    color: {
      rh: [
        ["G", "C", "E"],
        ["G#", "C#", "E"],
        ["G", "Bb", "E"],
        ["A#", "C#", "E"],
      ],
      lh: ["C", "C#", "E", "F#"],
    },
  },

  anger: {
    flow: {
      rh: [
        ["C", "Eb", "G"],
        ["C", "F", "Ab"],
        ["Db", "F", "Ab"],
        ["B", "D", "G", "Ab"],
      ],
      lh: ["C", "F", "Db", "G"],
    },
    color: {
      rh: [
        ["C", "Eb", "G"],
        ["C#", "E", "G#"],
        ["Bb", "E", "G"],
        ["A#", "C#", "F#", "G"],
      ],
      lh: ["C", "C#", "E", "F#"],
    },
  },

  fear: {
    flow: {
      rh: [
        ["G", "C", "Eb"],
        ["Ab", "Db", "F"],
        ["Ab", "B", "D"],
        ["G", "D", "Eb"],
      ],
      lh: ["C", "Db", "G", "C"],
    },
    color: {
      rh: [
        ["G", "C", "Eb"],
        ["A", "C", "F#"],
        ["D", "Ab", "B"],
        ["Db", "E", "G"],
      ],
      lh: ["C", "F#", "G", "Bb"],
    },
  },
};

const NOTE_TO_PC: Record<string, number> = {
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

const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function midiToName(midi: number) {
  const pc = PITCHES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${pc}${oct}`;
}

function noteTokenToPc(token: string): number {
  return NOTE_TO_PC[token] ?? 0;
}

export function buildAscendingRhVoicing(tokens: string[]): string[] {
  if (tokens.length === 0) return [];

  const firstPc = noteTokenToPc(tokens[0]);
  let firstMidi = 48 + firstPc; // around C3/B3
  while (firstMidi < 55) firstMidi += 12;
  if (Math.abs(firstMidi + 12 - 60) < Math.abs(firstMidi - 60)) {
    firstMidi += 12;
  }

  const midis = [firstMidi];

  for (let i = 1; i < tokens.length; i++) {
    const pc = noteTokenToPc(tokens[i]);
    let midi = 48 + pc;
    while (midi <= midis[i - 1]) midi += 12;
    midis.push(midi);
  }

  return midis.map(midiToName);
}

export function lhRootToNote(token: string): string {
  const pc = noteTokenToPc(token);
  return midiToName(36 + pc); // C2 bucket
}

export function prettyNote(s: string) {
  return s.replace(/b/g, "♭").replace(/#/g, "♯");
}

export function getLockedPracticeVoicing(
  emotionId: PracticeEmotionId,
  path: PracticePathId
) {
  return LOCKED_PRACTICE_VOICINGS[emotionId][path];
}