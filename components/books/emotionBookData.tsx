import type { EmotionPageData } from "./emotionBookShared";

const BASE_BEATS = ["1", "&", "2", "&", "3", "&", "4", "&"];


export const calmBookData: EmotionPageData = {
  emotionTitle: "🌿 CALM · Emotional Piano Pattern",

  coreDefinition: {
    main: "Nothing becomes important",
    lines: ["No hand should speak.", "No moment should feel like a landing."],
  },

  workingVoicing: {
    flowRh: "C E G | B D G | C E A | C F A",
    flowLh: "C | G | A | F",
    colorRh: "C E G | A D F♯ | A C F | A♯ D♯ G",
    colorLh: "C | D | F | D♯",
  },
keyboardSlice: { start: "A3", end: "A#4" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["B3", "D4", "G4"], lhLabel: "LH: G" },
    { chordName: "Bar 3", activeNotes: ["C4", "E4", "A4"], lhLabel: "LH: A" },
    { chordName: "Bar 4", activeNotes: ["C4", "F4", "A4"], lhLabel: "LH: F" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["A3", "D4", "F#4"], lhLabel: "LH: D" },
    { chordName: "Bar 3", activeNotes: ["A3", "C4", "F4"], lhLabel: "LH: F" },
    { chordName: "Bar 4", activeNotes: ["A#3", "D#4", "G4"], lhLabel: "LH: D♯" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
    lh: ["Root", "", "", "Root", "", "", "", "Root"],
  },

  flowPlayerFeel: ["steady", "even", "nothing stands out"],
  colorPlayerFeel: ["steady", "even", "nothing stands out"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Calm while playing both Flow and Color.",
    items: [
      {
        title: "Variation A — LH 1–3–5 Spread",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
          lh: ["Root", "", "3rd", "", "5th", "", "", "Root"],
        },
        progressionLines: {
          flowRh: "C E G | B D G | C E A | C F A",
          flowLh: "C E G | G B D | A C E | F A C (root-3rd-5th)",
          colorRh: "C E G | A D F♯ | A C F | A♯ D♯ G",
          colorLh: "C E G | D F♯ A | F A C | D♯ G A♯ (root-3rd-5th)",
        },
        playerFeel: ["slightly more movement", "still background"],
        ruleNote: "LH may move, but must not draw attention.",
      },
      {
        title: "Variation B — RH Top 2 → Bottom",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "Top 2", "", "Bottom", "", "Chord", ""],
          lh: ["Root", "", "", "Root", "", "", "", "Root"],
        },
        progressionLines: {
          flowRh: "C E G | B D G | C E A | C F A",
          flowExtra: ["RH split: E G | D G | E A | F A, then bottom note"],
          flowLh: "C | G | A | F",
          colorRh: "C E G | A D F♯ | A C F | A♯ D♯ G",
          colorExtra: ["RH split: E G | D F♯ | C F | D♯ G, then bottom note"],
          colorLh: "C | D | F | D♯",
        },
        playerFeel: ["slight reshaping inside RH", "still calm if soft"],
        watchNote: "If RH starts outlining a shape, Calm weakens.",
      },
    ],
  },

  hardBreak: {
    title: "LH Octave Pulse",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
      lh: ["Oct", "", "Oct", "", "Oct", "", "Oct", ""],
    },
    progressionLines: {
      flowRh: "C E G | B D G | C E A | C F A",
      flowLh: "C2 C3 | G2 G3 | A2 A3 | F2 F3",
      colorRh: "C E G | A D F♯ | A C F | A♯ D♯ G",
      colorLh: "C2 C3 | D2 D3 | F2 F3 | D♯2 D♯3",
      footnote: "(octaves)",
    } as any,
    playerFeel: ["Left hand starts pushing / marching"],
    resultText: [
      "Immediate break.",
      "Does NOT become another emotion cleanly.",
      "It just destroys Calm.",
    ],
    handPriority: {
      keeper: "RH (must stay neutral, non-melodic)",
      breaker: "LH (if it becomes physical or patterned)",
    },
  },

  performanceNotes: {
    microVariations: [
      "slightly shift LH timing between 2& and 4&",
      "make RH slightly softer on beat 4",
      "alternate Flow / Color every bar",
      "reduce RH density slightly, but do not create pattern",
      "as long as no clear shape appears in either hand",
    ],
    loopTolerance: [
      "High",
      "very easy to loop for long time",
      "but only if pattern stays minimal",
      "if pattern density increases, fatigue appears quickly",
    ],
    mixingNotes: [
      "Very safe",
      "you can alternate freely",
      "keep the same register",
      "keep the same low pattern density",
    ],
    
    liveCue: "Don’t let either hand speak.",
    pedalTips: {
  flow: "light half-pedal with tiny carry.",
  color: "lighter and cleaner, with almost no blur.",
},
    summary: {
      stay: [
        "keep RH compact and neutral",
        "keep LH quiet and simple",
        "avoid patterns in both hands",
        "avoid any moment that feels like arrival",
      ],
      break: [
        "LH starts pushing",
        "RH starts outlining",
        "both hands gain identity",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Calm → Playful (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "", "Chord", "", "Chord", "", "Chord"],
      lh: ["Root", "", "Root", "", "Root", "", "Root", ""],
    },
    progressionLines: {
      flowRh: "C E G | B D G | C E A | C F A",
      flowLh: "C | G | A | F",
      colorRh: "C E G | A D F♯ | A C F | A♯ D♯ G",
      colorLh: "C | D | F | D♯",
    },
    playerFeel: ["Now it bounces"],
    resultText: ["instantly becomes Playful"],
  },
};

export const playfulBookData: EmotionPageData = {
  emotionTitle: "🎈 PLAYFUL · Emotional Piano Pattern",

  coreDefinition: {
    main: "Things move, bounce, and return lightly",
    lines: [
      "Motion is allowed to be noticeable.",
      "Nothing should feel heavy, dramatic, or final.",
    ],
  },

  workingVoicing: {
    flowRh: "C E G | D F A | B D G | C E G",
    flowLh: "C | D | G | C",
    colorRh: "C E G | D♯ G A♯ | C♯ F♯ A♯ | C D♯ G♯",
    colorLh: "C | D♯ | F♯ | G♯",
  },
keyboardSlice: { start: "B3", end: "B4" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["D4", "F4", "A4"], lhLabel: "LH: D" },
    { chordName: "Bar 3", activeNotes: ["B3", "D4", "G4"], lhLabel: "LH: G" },
    { chordName: "Bar 4", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["D#4", "G4", "A#4"], lhLabel: "LH: D♯" },
    { chordName: "Bar 3", activeNotes: ["C#4", "F#4", "A#4"], lhLabel: "LH: F♯" },
    { chordName: "Bar 4", activeNotes: ["C4", "D#4", "G#4"], lhLabel: "LH: G♯" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
    lh: ["Root", "", "", "Root", "", "Root", "Root", ""],
  },

  flowPlayerFeel: ["light", "bouncy", "easy return"],
  colorPlayerFeel: ["light", "hoppy", "still playful"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Playful while changing texture.",
    items: [
      {
        title: "Variation A — LH 1–3–5 Support",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
          lh: ["Root", "", "3rd", "", "5th", "", "Root", ""],
        },
        progressionLines: {
          flowRh: "C E G | D F A | B D G | C E G",
          flowLh: "C E G | D F A | G B D | C E G (root-3rd-5th)",
          colorRh: "C E G | D♯ G A♯ | C♯ F♯ A♯ | C D♯ G♯",
          colorLh: "C E G | D♯ G A♯ | F♯ A♯ C♯ | G♯ C D♯ (root-3rd-5th)",
        },
        playerFeel: ["a bit more movement", "still playful"],
        ruleNote: "Pattern is allowed here, but it must stay light.",
      },
      {
        title: "Variation B — RH Top Repeat",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "Top", "", "Top", "", "Chord", ""],
          lh: ["Root", "", "", "Root", "", "Root", "Root", ""],
        },
        progressionLines: {
          flowRh: "C E G | D F A | B D G | C E G",
          flowExtra: ["RH top: G | A | G | G"],
          flowLh: "C | D | G | C",
          colorRh: "C E G | D♯ G A♯ | C♯ F♯ A♯ | C D♯ G♯",
          colorExtra: ["RH top: G | A♯ | A♯ | G♯"],
          colorLh: "C | D♯ | F♯ | G♯",
        },
        playerFeel: ["small sparkle", "light return stays intact"],
        ruleNote: "Top note may sparkle, but landing must stay easy.",
      },
    ],
  },

  hardBreak: {
    title: "Heavy Landing on 4",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", "Chord"],
      lh: ["Root", "", "", "Root", "", "Root", "Root", "Root"],
    },
    progressionLines: {
      flowRh: "C E G | D F A | B D G | C E G",
      flowLh: "C | D | G | C",
      colorRh: "C E G | D♯ G A♯ | C♯ F♯ A♯ | C D♯ G♯",
      colorLh: "C | D♯ | F♯ | G♯",
    },
    playerFeel: ["The landing becomes serious"],
    resultText: [
      "Immediate break.",
      "Playful collapses as soon as bar 4 feels heavy.",
    ],
    handPriority: {
      keeper: "Time interaction between both hands",
      breaker: "Beat 4 landing (especially if LH and RH both lean into it)",
    },
  },

  performanceNotes: {
    microVariations: [
      "switch between RH block and RH top repeat",
      "switch between LH root-only and LH 1–3–5",
      "keep bar 4 light, never important",
      "alternate Flow / Color freely if bounce stays light",
    ],
    loopTolerance: [
      "Medium-High",
      "easy to loop because bounce feels alive",
      "can become cute or overdesigned if you over-pattern it",
    ],
    mixingNotes: [
      "Safe",
      "Flow and Color mix well",
      "keep the same light touch",
      "avoid making Color too dramatic",
    ],
    liveCue: "Let it bounce, don’t let it land.",
    pedalTips: {
  flow: "dry.",
  color: "dry, or only a tiny touch on beat 1 if the piano is very dry.",
},
    summary: {
      stay: [
        "keep voicings compact and light",
        "let rhythm bounce",
        "let return feel easy",
        "allow small pattern identity",
        "avoid heavy landing",
      ],
      break: [
        "make bar 4 important",
        "make LH too square and heavy",
        "turn the return into a statement",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Playful → Calm (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
      lh: ["Root", "", "", "Root", "", "", "", "Root"],
    },
    progressionLines: {
      flowRh: "C E G | D F A | B D G | C E G",
      flowLh: "C | D | G | C",
      colorRh: "C E G | D♯ G A♯ | C♯ F♯ A♯ | C D♯ G♯",
      colorLh: "C | D♯ | F♯ | G♯",
    },
    playerFeel: ["Bounce disappears", "it settles"],
    resultText: ["becomes Calm"],
  },
};

export const sadnessBookData: EmotionPageData = {
  emotionTitle: "😢 SADNESS · Emotional Piano Pattern",

  coreDefinition: {
    main: "Each moment gives less than the previous one",
    lines: [
      "Energy decreases across the bar.",
      "Nothing restores strength.",
    ],
  },

  workingVoicing: {
    flowRh: "G C D♯ | G♯ C D♯ | G A♯ D♯ | F A♯ D",
    flowLh: "C | G♯ | D♯ | A♯",
    colorRh: "G C D♯ | G♯ C D♯ | G♯ C F | G B E",
    colorLh: "C | G♯ | F | E",
  },
keyboardSlice: { start: "F3", end: "F4" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["G#3", "C4", "D#4"], lhLabel: "LH: G♯" },
    { chordName: "Bar 3", activeNotes: ["G3", "A#3", "D#4"], lhLabel: "LH: D♯" },
    { chordName: "Bar 4", activeNotes: ["F3", "A#3", "D4"], lhLabel: "LH: A♯" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["G#3", "C4", "D#4"], lhLabel: "LH: G♯" },
    { chordName: "Bar 3", activeNotes: ["G#3", "C4", "F4"], lhLabel: "LH: F" },
    { chordName: "Bar 4", activeNotes: ["G#3", "B3", "E4"], lhLabel: "LH: E" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Chord", "", "Chord", "", "", "–"],
    lh: ["Root", "", "", "", "", "", "", "–"],
  },

  flowPlayerFeel: ["falling", "weaker", "nothing comes back"],
  colorPlayerFeel: ["falling", "fragile", "still no recovery"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Sadness while reducing support and weight.",
    items: [
      {
        title: "Variation A — RH Thinning",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Full", "", "Partial", "", "Top", "", "", "–"],
          lh: ["Root", "", "", "", "", "", "", "–"],
        },
        progressionLines: {
          flowRh: "full chord → thinner chord → top note only",
          flowLh: "C | G♯ | D♯ | A♯",
          colorRh: "full chord → thinner chord → top note only",
          colorLh: "C | G♯ | F | E",
        },
        playerFeel: ["the bar keeps giving less", "very strong sadness"],
        ruleNote: "Reduce sound over the bar. Do not restore it.",
      },
     {
  title: "Variation B — RH BMT ×2 with LH Root Hold",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Bottom", "Middle", "Top", "Bottom", "Middle", "Top", "", "–"],
    lh: ["Root", "", "", "", "", "", "", "–"],
  },
  progressionLines: {
    flowRh: "G C D# | G# C D# | G A# D# | F A# D",
    flowExtra: ["RH split: Bottom → Middle → Top → Bottom → Middle → Top"],
    flowLh: "C (hold) | G# (hold) | D# (hold) | A# (hold)",
    colorRh: "G C D# | G# C D# | G# C F | G B E",
    colorExtra: ["RH split: Bottom → Middle → Top → Bottom → Middle → Top"],
    colorLh: "C (hold) | G# (hold) | F (hold) | E (hold)",
  },
  playerFeel: ["still sad", "more flowing under the fingers", "moonlight-like sadness"],
  ruleNote: "Keep the root held and let RH unfold without adding weight.",
},
    ],
  },

  hardBreak: {
    title: "Continuous LH Support",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "", ""],
      lh: ["Root", "3rd", "5th", "3rd", "Root", "3rd", "5th", "3rd"],
    },
    progressionLines: {
      flowRh: "G C D♯ | G♯ C D♯ | G A♯ D♯ | F A♯ D",
      flowLh: "C D♯ G | G♯ C D♯ | D♯ G A♯ | A♯ D F (continuous support)",
      colorRh: "G C D♯ | G♯ C D♯ | G♯ C F | G B E",
      colorLh: "C D♯ G | G♯ C D♯ | F G♯ C | E G♯ B (continuous support)",
    },
    playerFeel: ["The bar stops falling", "support becomes too strong"],
resultText: [
  "Immediate break.",
  "Too much continuous support breaks Sadness.",
  "Repeated Together attacks also break it by restoring weight.",
],
    handPriority: {
      keeper: "Time shape of decay",
      breaker: "Late or continuous LH support",
    },
  },

  performanceNotes: {
    microVariations: [
      "remove notes from RH as the bar goes on",
      "let LH disappear after beat 1 or beat 2",
      "keep chord 3 weaker than chord 2",
      "mix Flow and Color only if the end does not brighten or recover",
    ],
    loopTolerance: [
      "Medium",
      "beautiful to loop, but can flatten if every bar is equally sad",
      "small physical reductions keep it alive",
    ],
    mixingNotes: [
      "Safe with care",
      "Flow and Color can alternate",
      "do not let Color brighten the last chord too much",
      "keep the same sense of loss across the bar",
    ],
    liveCue: "Each touch gives less.",
pedalTips: {
  flow: "shallow half-pedal.",
  color: "shallow half-pedal; release into beat 4.",
},
    summary: {
      stay: [
        "start with support",
        "reduce everything",
        "remove beat 4",
        "avoid lift in voicing",
        "avoid continuous LH support",
      ],
      break: [
        "keep LH carrying the bar",
        "restore energy late",
        "stop the bar from falling",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Sadness → Melancholy (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "", "", "Chord", ""],
      lh: ["Root", "", "", "", "", "", "", ""],
    },
    progressionLines: {
      flowRh: "G C D♯ | G♯ C D♯ | G A♯ D♯ | F A♯ D",
      flowLh: "C | G♯ | D♯ | A♯",
      colorRh: "G C D♯ | G♯ C D♯ | G♯ C F | G B E",
      colorLh: "C | G♯ | F | E",
    },
    playerFeel: ["A soft return appears"],
    resultText: ["becomes Melancholy if beat 4 returns softly"],
  },
};

export const melancholyBookData: EmotionPageData = {
  emotionTitle: "🌧️ MELANCHOLY · Emotional Piano Pattern",

  coreDefinition: {
    main: "Something comes back, but not as it was",
    lines: [
      "There is return, but not healing.",
      "Beat 4 must return softly, not cleanly.",
    ],
  },

  workingVoicing: {
    flowRh: "C D♯ G♯ | C F G♯ | C D♯ G | B D G",
    flowLh: "G♯ | F | C | G",
    colorRh: "G C D♯ | A C♯ E | G♯ C♯ E | F A♯ D",
    colorLh: "C | A | C♯ | A♯",
  },
keyboardSlice: { start: "F3", end: "A4" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "D#4", "G#4"], lhLabel: "LH: G♯" },
    { chordName: "Bar 2", activeNotes: ["C4", "F4", "G#4"], lhLabel: "LH: F" },
    { chordName: "Bar 3", activeNotes: ["C4", "D#4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 4", activeNotes: ["B3", "D4", "G4"], lhLabel: "LH: G" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["A3", "C#4", "E4"], lhLabel: "LH: A" },
    { chordName: "Bar 3", activeNotes: ["G#3", "C#4", "E4"], lhLabel: "LH: C♯" },
    { chordName: "Bar 4", activeNotes: ["F3", "A#3", "D4"], lhLabel: "LH: A♯" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Chord", "", "", "", "Chord", ""],
    lh: ["Root", "", "", "", "", "", "", ""],
  },

  flowPlayerFeel: ["inward", "space before return", "return feels changed"],
  colorPlayerFeel: ["altered", "remembered", "not healed"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Melancholy while changing how the return is felt.",
    items: [
     {
  title: "Variation A — RH BMT on 1–2, then Chord on 4",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Bottom", "Middle", "Top", "", "", "", "Chord", ""],
    lh: ["Root", "", "", "", "", "", "", ""],
  },
  progressionLines: {
    flowRh: "C D# G# | C F G# | C D# G | B D G",
    flowExtra: ["RH split on 1–2: Bottom → Middle → Top, then full chord on 4"],
    flowLh: "G# (hold) | F (hold) | C (hold) | G",
    colorRh: "G C D# | A C# E | G# C# E | F A# D",
    colorExtra: ["RH split on 1–2: Bottom → Middle → Top, then full chord on 4"],
    colorLh: "C (hold) | A (hold) | C# (hold) | A#",
  },
  playerFeel: ["memory-like motion", "return still feels changed"],
  ruleNote: "Let the line unfold early, then return softly on 4.",
},
      {
  title: "Variation B — LH Support on 4",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Top", "", "", "", "Chord", ""],
    lh: ["Root", "", "", "", "", "", "Root", ""],
  },
  progressionLines: {
    flowRh: "C D# G# | C F G# | C D# G | B D G",
    flowExtra: ["RH keeps one remembered top tone before the return chord"],
    flowLh: "G# (hold) | F (hold) | C | G (support on 4)",
    colorRh: "G C D# | A C# E | G# C# E | F A# D",
    colorExtra: ["RH keeps one remembered top tone before the return chord"],
    colorLh: "C (hold) | A (hold) | C# | A# (support on 4)",
  },
  playerFeel: ["soft support", "return is audible but not healed"],
  ruleNote: "Support on 4 is allowed only if it stays tender.",
},
    ],
  },

  hardBreak: {
  title: "RH Top 2 → Bottom ×4",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Top 2", "Bottom", "Top 2", "Bottom", "Top 2", "Bottom", "Top 2", "Bottom"],
    lh: ["Root", "", "", "", "", "", "", ""],
  },
  progressionLines: {
    flowRh: "C D# G# | C F G# | C D# G | B D G",
    flowExtra: ["RH: Top 2 → Bottom repeated through the bar"],
    flowLh: "G# (hold) | F (hold) | C (hold) | G (hold)",
    colorRh: "G C D# | A C# E | G# C# E | F A# D",
    colorExtra: ["RH: Top 2 → Bottom repeated through the bar"],
    colorLh: "C (hold) | A (hold) | C# (hold) | A# (hold)",
  },
  playerFeel: ["beautiful", "patterned", "no longer melancholy"],
  resultText: [
    "Immediate break.",
    "The progression still sounds good, but the melancholy disappears.",
  ],
  handPriority: {
    keeper: "soft altered return on beat 4",
    breaker: "patterning RH into something too beautiful or too even",
  },
},

  performanceNotes: {
    microVariations: [
      "change how full beat 2 is",
      "leave beat 3 very open",
      "bring beat 4 back softly",
      "allow light LH support on beat 4 only if it stays tender",
    ],
    loopTolerance: [
      "Medium-High",
      "very satisfying to loop if return stays altered",
      "becomes ordinary if beat 4 grows too stable",
    ],
    mixingNotes: [
      "Safe",
      "Flow and Color can alternate well",
      "keep the same inward touch",
      "do not let Color feel triumphant",
    ],
    liveCue: "Come back, but don’t heal.",
    pedalTips: {
  flow: "light-to-mid half-pedal with slight carry across bars.",
  color: "same, with the deepest pedal on chord 4.",
},
    summary: {
      stay: [
        "keep voicings compact and inward",
        "leave space before beat 4",
        "bring back beat 4 softly",
        "let return feel changed, not repaired",
      ],
      break: [
        "remove beat 4 return",
        "make beat 4 too strong",
        "turn the return into ordinary closure",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Melancholy → Sadness (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "", "", "", ""],
      lh: ["Root", "", "", "", "", "", "", ""],
    },
    progressionLines: {
      flowRh: "C D♯ G♯ | C F G♯ | C D♯ G | B D G",
      flowLh: "G♯ | F | C | G",
      colorRh: "G C D♯ | A C♯ E | G♯ C♯ E | F A♯ D",
      colorLh: "C | A | C♯ | A♯",
    },
    playerFeel: ["The return vanishes"],
    resultText: ["becomes Sadness"],
  },
};

export const magicBookData: EmotionPageData = {
  emotionTitle: "✨ MAGIC · Emotional Piano Pattern",

  coreDefinition: {
    main: "A clear change, followed by suspended presence",
    lines: ["Something shifts.", "Then time opens and lingers."],
  },

  workingVoicing: {
    flowRh: "C G A | C E G | B D G | B C E A",
    flowLh: "F | C | G | A",
    colorRh: "C E G | C D♯ G♯ | B E G♯ | B D G",
    colorLh: "C | G♯ | E | G",
  },
keyboardSlice: { start: "B3", end: "A4" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "G4", "A4"], lhLabel: "LH: F" },
    { chordName: "Bar 2", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 3", activeNotes: ["B3", "D4", "G4"], lhLabel: "LH: G" },
    { chordName: "Bar 4", activeNotes: ["B3","C4", "E4", "A4"], lhLabel: "LH: A" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "E4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["C4", "D#4", "G#4"], lhLabel: "LH: G♯" },
    { chordName: "Bar 3", activeNotes: ["B3", "E4", "G#4"], lhLabel: "LH: E" },
    { chordName: "Bar 4", activeNotes: ["B3", "D4", "G4"], lhLabel: "LH: G" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "–", "Chord", "–", "–", "–", "Chord", "–"],
    lh: ["Root", "", "", "", "", "", "", ""],
  },

  flowPlayerFeel: ["clear shift", "space after change", "hovering"],
  colorPlayerFeel: ["frame changes", "time opens", "it glows"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Magic while varying how the changed space lingers.",
    items: [
      {
  title: "Variation A — Chord → Hold → Top → Hold → Chord",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Top", "", "", "", "Chord", "–"],
    lh: ["Root", "", "", "", "", "", "", ""],
  },
  progressionLines: {
    flowRh: "C G A | C E G | B D G | B C E A",
    flowExtra: ["RH: Chord → Hold → Top → Hold → Chord"],
    flowLh: "F (hold) | C | G | A",
    colorRh: "C E G | C D# G# | B E G# | B D G",
    colorExtra: ["RH: Chord → Hold → Top → Hold → Chord"],
    colorLh: "C (hold) | G# | E | G",
  },
  playerFeel: ["shimmer after the change", "clearer magic gesture"],
  ruleNote: "Let the change ring, then touch only the top before the final chord.",
},
      {
  title: "Variation B — Chord → Top → Top → Chord",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Top", "", "Top", "", "Chord", "–"],
    lh: ["Root", "", "", "", "", "", "", ""],
  },
  progressionLines: {
    flowRh: "C G A | C E G | B D G | B C E A",
    flowExtra: ["RH: Chord → Top → Top → Chord"],
    flowLh: "F (hold) | C | G | A",
    colorRh: "C E G | C D# G# | B E G# | B D G",
    colorExtra: ["RH: Chord → Top → Top → Chord"],
    colorLh: "C (hold) | G# | E | G",
  },
  playerFeel: ["more visible shimmer", "still clearly magic"],
  ruleNote: "Top notes should glow, not turn into melody.",
},
    ],
  },

  hardBreak: {
    title: "No Space After Change",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", "–"],
      lh: ["Root", "", "Root", "", "Root", "", "Root", ""],
    },
    progressionLines: {
      flowRh: "C G A | C E G | B D G | B C E A",
      flowLh: "F | C | G | A",
      colorRh: "C E G | C D♯ G♯ | B E G♯ | B D G",
      colorLh: "C | G♯ | E | G",
    },
    playerFeel: ["The bar keeps moving instead of hovering"],
    resultText: [
      "Immediate break.",
      "Without space after the change, Magic disappears.",
    ],
    handPriority: {
      keeper: "Beat 2 change + the space after it",
      breaker: "Filling the bar too continuously",
    },
  },

  performanceNotes: {
    microVariations: [
      "change how long beat 2 lingers",
      "keep beat 3 empty or almost empty",
      "bring beat 4 back softly",
      "mix Flow and Color if the change stays clear and the space stays open",
    ],
    loopTolerance: [
      "Medium",
      "very strong when looped with space",
      "fatigues fast if every bar is too explicit",
    ],
    mixingNotes: [
      "Safe with care",
      "Flow and Color mix well",
      "keep the changed space clear",
      "do not make every change theatrical",
    ],
    liveCue: "Change, then wait.",
    pedalTips: {
  flow: "half-pedal each bar, slightly deeper on bar 4.",
  color: "cleaner on bars 1–3, deeper on bar 4.",
},
    summary: {
      stay: [
        "keep voicing compact",
        "let beat 2 change clearly",
        "leave space after the change",
        "let beat 4 glow, not resolve",
      ],
      break: [
        "remove the space",
        "fill the bar too evenly",
        "turn the change into ordinary motion",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Magic → Mystery (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "", "Chord", "Chord", "", "", ""],
      lh: ["Root", "", "", "", "", "", "Root", ""],
    },
    progressionLines: {
      flowRh: "C G A | C E G | B D G | B C E A",
      flowLh: "F | C | G | A",
      colorRh: "C E G | C D♯ G♯ | B E G♯ | B D G",
      colorLh: "C | G♯ | E | G",
    },
    playerFeel: ["The cause becomes less obvious"],
    resultText: ["becomes Mystery when explanation is delayed"],
  },
};

export const mysteryBookData: EmotionPageData = {
  emotionTitle: "🕵️‍♀️ MYSTERY · Emotional Piano Pattern",

  coreDefinition: {
    main: "The harmony makes sense, but its cause stays hidden",
    lines: [
      "There is structure.",
      "You never fully get the answer when you expect it.",
    ],
  },

  workingVoicing: {
    flowRh: "G C D♯ | G♯ C F | A♯ D F | G C D D♯",
    flowLh: "C | F | A♯ | C",
    colorRh: "G C D♯ | A D F♯ | G♯ B F | A♯ C♯ F♯",
    colorLh: "C | D | F | F♯",
  },
keyboardSlice: { start: "G3", end: "G4" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["G#3", "C4", "F4"], lhLabel: "LH: F" },
    { chordName: "Bar 3", activeNotes: ["A#3", "D4", "F4"], lhLabel: "LH: A♯" },
    { chordName: "Bar 4", activeNotes: ["G3", "C4", "D4", "D#4"] as any, lhLabel: "LH: C" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["A3", "D4", "F#4"], lhLabel: "LH: D" },
    { chordName: "Bar 3", activeNotes: ["G#3", "B3", "F4"], lhLabel: "LH: F" },
    { chordName: "Bar 4", activeNotes: ["A#3", "C#4", "F#4"], lhLabel: "LH: F♯" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "", "Chord", "Chord", "", "", ""],
    lh: ["Root", "", "", "", "", "", "Root", ""],
  },

  flowPlayerFeel: ["delayed", "half-explained", "still structured"],
  colorPlayerFeel: ["strange but legible", "answer delayed", "never fully revealed"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Mystery while keeping structure but delaying explanation.",
    items: [
     {
  title: "Variation A — RH Chord → Top → Chord, LH Root → 3rd",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Top", "", "Chord", "", "", ""],
    lh: ["Root", "", "3rd", "", "", "", "Root", ""],
  },
  progressionLines: {
    flowRh: "G C D# | G# C F | A# D F | G C D D#",
    flowExtra: ["RH: Chord → Top → Chord"],
    flowLh: "C → D# | F → G# | A# → D | C → D#",
    colorRh: "G C D# | A D F# | G# B F | A# C# F#",
    colorExtra: ["RH: Chord → Top → Chord"],
    colorLh: "C → D# | D → F# | F → G# | F# → A#",
  },
  playerFeel: ["more shaped", "still obscured"],
  ruleNote: "Let the bar suggest direction without fully explaining it.",
},
      {
  title: "Variation B — RH Chord → Hold → Top, LH Late Root",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "", "", "Top", "", "", ""],
    lh: ["Root", "", "", "", "", "", "Root", ""],
  },
  progressionLines: {
    flowRh: "G C D# | G# C F | A# D F | G C D D#",
    flowExtra: ["RH: Chord → Hold → Top"],
    flowLh: "C (hold) | F | A# | C (late root return)",
    colorRh: "G C D# | A D F# | G# B F | A# C# F#",
    colorExtra: ["RH: Chord → Hold → Top"],
    colorLh: "C (hold) | D | F | F# (late root return)",
  },
  playerFeel: ["more suspended", "the answer stays delayed"],
  ruleNote: "Let the top note appear after the harmony is already established.",
},
    ],
  },

  hardBreak: {
    title: "Strongly Explained Return",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
      lh: ["Root", "", "Root", "", "Root", "", "Root", ""],
    },
    progressionLines: {
      flowRh: "G C D♯ | G♯ C F | A♯ D F | G C D D♯",
      flowLh: "C | F | A♯ | C",
      colorRh: "G C D♯ | A D F♯ | G♯ B F | A♯ C♯ F♯",
      colorLh: "C | D | F | F♯",
    },
    playerFeel: ["Everything becomes too clear"],
    resultText: [
      "Immediate break.",
      "No hidden cause remains.",
    ],
    handPriority: {
      keeper: "Delayed RH explanation",
      breaker: "Over-supporting the bar with regularity",
    },
  },

  performanceNotes: {
    microVariations: [
      "delay the second RH event a little",
      "use top note instead of full chord for the late RH event",
      "let LH support return late and lightly",
      "keep voicings compact so the harmony stays half-hidden",
    ],
    loopTolerance: [
      "Medium",
      "interesting to loop because the answer keeps slipping",
      "breaks quickly if rhythm becomes too regular",
    ],
    mixingNotes: [
      "Safe with care",
      "Flow and Color can alternate well",
      "keep the voicing compact",
      "do not over-expose strange chords",
    ],
    liveCue: "Delay the answer.",
    pedalTips: {
  flow: "mid half-pedal with slightly late changes.",
  color: "a little deeper on chord 3, slightly cleaner on chord 4.",
},
    summary: {
      stay: [
        "keep voicings compact",
        "delay one important event",
        "let support return late and lightly",
        "keep structure present but never fully explanatory",
      ],
      break: [
        "regularize the rhythm",
        "over-support the bass",
        "make the strange chord too visible",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Mystery → Magic (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "", "", "Chord", ""],
      lh: ["Root", "", "", "", "", "", "", ""],
    },
    progressionLines: {
      flowRh: "G C D♯ | G♯ C F | A♯ D F | G C D D♯",
      flowLh: "C | F | A♯ | C",
      colorRh: "G C D♯ | A D F♯ | G♯ B F | A♯ C♯ F♯",
      colorLh: "C | D | F | F♯",
    },
    playerFeel: ["Now the change is clear"],
    resultText: ["becomes Magic"],
  },
};

export const wonderBookData: EmotionPageData = {
  emotionTitle: "🌌 WONDER · Emotional Piano Pattern",

  coreDefinition: {
    main: "The sound opens and stays open",
    lines: [
      "The bar should feel like widening space.",
      "Not reveal. Not problem. Not closure.",
    ],
  },

  workingVoicing: {
    flowRh: "C D♯ G | C D♯ G♯ | D♯ G A♯ | F A C",
    flowLh: "C | G♯ | D♯ | F",
    colorRh: "C D♯ G | C F A | D G B | D♯ F♯ B",
    colorLh: "C | F | G | B",
  },
keyboardSlice: { start: "C4", end: "C5" },
  flowBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "D#4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["C4", "D#4", "G#4"], lhLabel: "LH: G♯" },
    { chordName: "Bar 3", activeNotes: ["D#4", "G4", "A#4"], lhLabel: "LH: D♯" },
    { chordName: "Bar 4", activeNotes: ["F4", "A4", "C5"] as any, lhLabel: "LH: F" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "D#4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["C4", "F4", "A4"], lhLabel: "LH: F" },
    { chordName: "Bar 3", activeNotes: ["D4", "G4", "B4"] as any, lhLabel: "LH: G" },
    { chordName: "Bar 4", activeNotes: ["D#4", "F#4", "B4"] as any, lhLabel: "LH: B" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "", "", "Chord", "", "Chord", ""],
    lh: ["Root", "", "", "", "", "", "", ""],
  },

  flowPlayerFeel: ["air", "opening", "more space by the end"],
  colorPlayerFeel: ["brightening", "upward opening", "still not heavy"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Wonder while opening the bar in different ways.",
    items: [
      {
  title: "Variation A — RH Chord → Top → Chord, LH Root → Root",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Top", "", "Chord", "", "Chord", ""],
    lh: ["Root", "", "", "", "Root", "", "", ""],
  },
  progressionLines: {
    flowRh: "C D# G | C D# G# | D# G A# | F A C",
    flowExtra: ["RH: Chord → Top → Chord"],
    flowLh: "C (hold) | G# | D# (root return) | F",
    colorRh: "C D# G | C F A | D G B | D# F# B",
    colorExtra: ["RH: Chord → Top → Chord"],
    colorLh: "C (hold) | F | G (root return) | B",
  },
  playerFeel: ["clear opening", "still spacious"],
  ruleNote: "Let the top note point upward, then reopen into the chord.",
},
      {
  title: "Variation B — RH Top → Chord → Top",
  pattern: {
    beats: BASE_BEATS,
    rh: ["Top", "", "Chord", "", "Top", "", "Chord", ""],
    lh: ["Root", "", "", "", "", "", "Root", ""],
  },
  progressionLines: {
    flowRh: "C D# G | C D# G# | D# G A# | F A C",
    flowExtra: ["RH: Top → Chord → Top → Chord"],
    flowLh: "C (hold) | G# | D# | F (light support)",
    colorRh: "C D# G | C F A | D G B | D# F# B",
    colorExtra: ["RH: Top → Chord → Top → Chord"],
    colorLh: "C (hold) | F | G | B (light support)",
  },
  playerFeel: ["more skyward", "still open rather than dramatic"],
  ruleNote: "The top note should open the space, not turn into a melody line.",
},
    ],
  },

  hardBreak: {
    title: "Full Bar Filled Evenly",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
      lh: ["Root", "", "Root", "", "Root", "", "Root", ""],
    },
    progressionLines: {
      flowRh: "C D♯ G | C D♯ G♯ | D♯ G A♯ | F A C",
      flowLh: "C | G♯ | D♯ | F",
      colorRh: "C D♯ G | C F A | D G B | D♯ F♯ B",
      colorLh: "C | F | G | B",
    },
    playerFeel: ["The space closes", "the bar becomes ordinary motion"],
    resultText: [
      "Immediate break.",
      "Without air, Wonder disappears.",
    ],
    handPriority: {
      keeper: "RH opening after space",
      breaker: "Over-filling the bar and over-grounding with LH",
    },
  },

  performanceNotes: {
    microVariations: [
      "leave beat 2 very open",
      "use top note only on beat 3 before full chord on 4",
      "allow LH support on 4 only if it stays very light",
      "mix Flow and Color if the sense of widening stays intact",
    ],
    loopTolerance: [
      "Medium-High",
      "very rewarding to loop when the air is real",
      "breaks fast if you over-fill the bar",
    ],
    mixingNotes: [
      "Safe",
      "Flow and Color can alternate beautifully",
      "keep the same sense of air",
      "do not let the last chord become a declaration",
    ],
    liveCue: "Leave air, then open.",
    pedalTips: {
  flow: "half-pedal per bar with clean after-attack changes, slightly more bloom on chord 4.",
  color: "same, but slightly cleaner on chord 4.",
},
    summary: {
      stay: [
        "keep voicings bright but not grand",
        "leave space early in the bar",
        "let the later part of the bar open upward",
        "avoid heavy support",
      ],
      break: [
        "fill the bar too evenly",
        "add heavy LH pulse",
        "make beat 4 a declaration",
      ],
    },
  },

  transition: {
    title: "Switch Emotion (Same Chords)",
    transitionLabel: "Wonder → Magic (same chords, same voicing — change pattern)",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "", "", "Chord", ""],
      lh: ["Root", "", "", "", "", "", "", ""],
    },
    progressionLines: {
      flowRh: "C D♯ G | C D♯ G♯ | D♯ G A♯ | F A C",
      flowLh: "C | G♯ | D♯ | F",
      colorRh: "C D♯ G | C F A | D G B | D♯ F♯ B",
      colorLh: "C | F | G | B",
    },
    playerFeel: ["The opening becomes a clear change"],
    resultText: ["becomes Magic"],
  },
};

export const tensionBookData: EmotionPageData = {
  emotionTitle: "😬 TENSION · Emotional Piano Pattern",

  coreDefinition: {
    main: "Pressure builds, but does not release",
    lines: [
      "The bar tightens toward beat 3.",
      "Beat 4 must not feel like relief.",
    ],
  },

  workingVoicing: {
    flowRh: "G C D♯ | A♯ D F | B D F | G C D D♯",
    flowLh: "C | D | G | C",
    colorRh: "G C E | G♯ C♯ E | G A♯ E | A♯ C♯ E",
    colorLh: "C | C♯ | E | F♯",
  },

  keyboardSlice: { start: "G3", end: "F4" },

  flowBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["A#3", "D4", "F4"], lhLabel: "LH: D" },
    { chordName: "Bar 3", activeNotes: ["B3", "D4", "F4"], lhLabel: "LH: G" },
    { chordName: "Bar 4", activeNotes: ["G3", "C4", "D4", "D#4"], lhLabel: "LH: C" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "E4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["G#3", "C#4", "E4"], lhLabel: "LH: C♯" },
    { chordName: "Bar 3", activeNotes: ["G3", "A#3", "E4"], lhLabel: "LH: E" },
    { chordName: "Bar 4", activeNotes: ["A#3", "C#4", "E4"], lhLabel: "LH: F♯" },
  ],

  // CANONICAL — based on Practice session (corrected)
  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
    lh: ["Root", "", "", "Root", "Root", "", "", "Root"],
  },

  flowPlayerFeel: ["contained", "tightening", "no release"],
  colorPlayerFeel: ["pressure", "compressed", "still unresolved"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Tension while changing how pressure is carried.",
    items: [
      {
        title: "Variation A — LH Continuous Pulse (8 subdivisions)",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
          lh: ["Root", "Root", "Root", "Root", "Root", "Root", "Root", "Root"],
        },
        progressionLines: {
          flowRh: "G C D♯ | A♯ D F | B D F | G C D D♯",
          flowLh: "C | D | G | C (continuous pulse)",
          colorRh: "G C E | G♯ C♯ E | G A♯ E | A♯ C♯ E",
          colorLh: "C | C♯ | E | F♯ (continuous pulse)",
        },
        playerFeel: ["driven", "pressurized", "still no release"],
        ruleNote: "Pulse is allowed, but the bar must still feel compressed, not flowing.",
      },
    ],
  },

  hardBreak: {
    title: "LH 1–3–5 Continuous Pattern",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "Chord", "", "Chord", "", "Chord", ""],
      lh: ["Root", "3rd", "5th", "3rd", "Root", "3rd", "5th", "3rd"],
    },
    progressionLines: {
      flowRh: "G C D♯ | A♯ D F | B D F | G C D D♯",
      flowLh: "C E G | D F A | G B D | C E G",
      colorRh: "G C E | G♯ C♯ E | G A♯ E | A♯ C♯ E",
      colorLh: "C E G | C♯ E G♯ | E G A♯ | F♯ A♯ C♯",
    },
    playerFeel: ["The bar starts flowing instead of tightening"],
    resultText: [
      "Immediate break.",
      "The squeeze disappears as soon as LH becomes smooth.",
    ],
    handPriority: {
      keeper: "Beat 3 squeeze and unresolved beat 4",
      breaker: "LH becoming smooth or flowing",
    },
  },

  performanceNotes: {
    microVariations: [
      "hold RH slightly longer before beat 3",
      "make beat 3 feel like the tightest point",
      "keep beat 4 sharp, never relaxed",
    ],
    loopTolerance: [
      "Medium",
      "strong if the squeeze stays alive",
      "fatigues quickly if pattern becomes regular",
    ],
    mixingNotes: [
      "Safe with care",
      "Flow and Color can alternate",
      "keep pressure shape consistent",
    ],
    liveCue: "Squeeze, don’t release.",
    pedalTips: {
  flow: "shallow half-pedal; catch after beat 1 and refresh on beat 3.",
  color: "same, but keep it even cleaner.",
},
    summary: {
      stay: [
        "tighten toward beat 3",
        "keep RH contained",
        "avoid smooth LH motion",
      ],
      break: [
        "make LH flow",
        "turn bar into even motion",
        "let beat 4 relax",
      ],
    },
  },
};

export const angerBookData: EmotionPageData = {
  emotionTitle: "😡 ANGER · Emotional Piano Pattern",

  coreDefinition: {
    main: "Push through. Do not smooth it out.",
    lines: [
      "The right hand stays clenched.",
      "The left hand keeps shoving forward.",
    ],
  },

  workingVoicing: {
    flowRh: "C D♯ G | C F G♯ | C♯ F G♯ | B D G G♯",
    flowLh: "C | F | C♯ | G",
    colorRh: "C D♯ G | C♯ E G♯ | A♯ E G | A♯ C♯ F♯ G",
    colorLh: "C | C♯ | E | F♯",
  },

  keyboardSlice: { start: "A3", end: "A4" },

  flowBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "D#4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["C4", "F4", "G#4"], lhLabel: "LH: F" },
    { chordName: "Bar 3", activeNotes: ["C#4", "F4", "G#4"], lhLabel: "LH: C♯" },
    { chordName: "Bar 4", activeNotes: ["B3", "D4", "G4", "G#4"], lhLabel: "LH: G" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["C4", "D#4", "G4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["C#4", "E4", "G#4"], lhLabel: "LH: C♯" },
    { chordName: "Bar 3", activeNotes: ["A#3", "E4", "G4"], lhLabel: "LH: E" },
    { chordName: "Bar 4", activeNotes: ["A#3", "C#4", "F#4", "G4"], lhLabel: "LH: F♯" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "", "", "", "", "", ""],
    lh: ["Oct", "", "Oct", "", "Oct", "", "Oct", ""],
  },

  flowPlayerFeel: ["blunt", "pushing", "no smoothness"],
  colorPlayerFeel: ["biting", "grinding", "still pushing forward"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Anger while changing where the bite is felt.",
    items: [
      {
        title: "Variation A — RH Re-attack on 3",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "", "", "Chord", "", "", ""],
          lh: ["Oct", "", "Oct", "", "Oct", "", "Oct", ""],
        },
        progressionLines: {
          flowRh: "C D♯ G | C F G♯ | C♯ F G♯ | B D G G♯",
          flowLh: "C | F | C♯ | G",
          colorRh: "C D♯ G | C♯ E G♯ | A♯ E G | A♯ C♯ F♯ G",
          colorLh: "C | C♯ | E | F♯",
        },
        playerFeel: ["extra shove in the middle", "still clenched"],
        ruleNote: "Re-hit RH only to harden the push, not to decorate it.",
      },
      {
        title: "Variation B — RH Top Bite on 2 and 4",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "Top", "", "Chord", "", "Top", ""],
          lh: ["Oct", "", "Oct", "", "Oct", "", "Oct", ""],
        },
        progressionLines: {
          flowRh: "C D♯ G | C F G♯ | C♯ F G♯ | B D G G♯",
          flowExtra: ["RH top on 2 and 4: G | G♯ | G♯ | G♯"],
          flowLh: "C | F | C♯ | G",
          colorRh: "C D♯ G | C♯ E G♯ | A♯ E G | A♯ C♯ F♯ G",
          colorExtra: ["RH top on 2 and 4: G | G♯ | G | G"],
          colorLh: "C | C♯ | E | F♯",
        },
        playerFeel: ["more bite", "still blunt, not lyrical"],
        ruleNote: "Top notes may stab, but they must not turn into a line.",
      },
    ],
  },

  hardBreak: {
    title: "Smooth LH 1–3–5 Pattern",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "", "", "", "", "", ""],
      lh: ["Root", "3rd", "5th", "3rd", "Root", "3rd", "5th", "3rd"],
    },
    progressionLines: {
      flowRh: "C D♯ G | C F G♯ | C♯ F G♯ | B D G G♯",
      flowLh: "C D♯ G | F A C | C♯ F G♯ | G B D (smoothed out)",
      colorRh: "C D♯ G | C♯ E G♯ | A♯ E G | A♯ C♯ F♯ G",
      colorLh: "C D♯ G | C♯ E G♯ | E G A♯ | F♯ A♯ C♯ (smoothed out)",
    },
    playerFeel: ["The shove disappears", "LH starts flowing instead of pushing"],
    resultText: [
      "Immediate break.",
      "Anger collapses as soon as the left hand becomes smooth.",
    ],
    handPriority: {
      keeper: "LH shove through octave pulses",
      breaker: "LH smoothness; RH becoming too expressive",
    },
  },

  performanceNotes: {
    microVariations: [
      "re-attack RH on beat 3 if you need more force",
      "let LH octaves stay dry and blunt",
      "keep the bar physically simple",
      "alternate Flow and Color if the shove remains direct",
    ],
    loopTolerance: [
      "Medium",
      "easy to feel physically",
      "fatigues if you add too much detail or too much sustain",
    ],
    mixingNotes: [
      "Safe",
      "Flow and Color can alternate",
      "keep the same dry attack",
      "do not let Color become flashy",
    ],
    liveCue: "Keep shoving.",
    pedalTips: {
  flow: "dry.",
  color: "dry.",
},
    summary: {
      stay: [
        "keep RH clenched",
        "keep LH pulsing in octaves",
        "avoid smoothness",
        "avoid decorative motion",
      ],
      break: [
        "smooth out the left hand",
        "let RH become lyrical",
        "turn the shove into flow",
      ],
    },
  },
};

export const fearBookData: EmotionPageData = {
  emotionTitle: "😱 FEAR · Emotional Piano Pattern",

  coreDefinition: {
    main: "Support disappears, but the bar keeps going",
    lines: [
      "Ground is present only at the start.",
      "What returns later is too little and too late.",
    ],
  },

  workingVoicing: {
    flowRh: "G C D♯ | G♯ C♯ F | G♯ B D | G D D♯",
    flowLh: "C | C♯ | G | C",
    colorRh: "G C D♯ | A C F♯ | G♯ B D | G C♯ E",
    colorLh: "C | F♯ | G | A♯",
  },

  keyboardSlice: { start: "G3", end: "F#4" },

  flowBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["G#3", "C#4", "F4"], lhLabel: "LH: C♯" },
    { chordName: "Bar 3", activeNotes: ["G#3", "B3", "D4"], lhLabel: "LH: G" },
    { chordName: "Bar 4", activeNotes: ["G3", "D4", "D#4"], lhLabel: "LH: C" },
  ],

  colorBars: [
    { chordName: "Bar 1", activeNotes: ["G3", "C4", "D#4"], lhLabel: "LH: C" },
    { chordName: "Bar 2", activeNotes: ["A3", "C4", "F#4"], lhLabel: "LH: F♯" },
    { chordName: "Bar 3", activeNotes: ["G#3", "B3", "D4"], lhLabel: "LH: G" },
    { chordName: "Bar 4", activeNotes: ["G3", "C#4", "E4"], lhLabel: "LH: A♯" },
  ],

  basePattern: {
    beats: BASE_BEATS,
    rh: ["Chord", "", "", "", "", "", "", ""],
    lh: ["Oct", "–", "Upper", "–", "–", "–", "Upper", "–"],
  },

  flowPlayerFeel: ["unstable", "ground disappears", "no safety"],
  colorPlayerFeel: ["unsteady", "disconnected", "still unsupported"],

  safeVariations: {
    title: "Ways to Play It (Without Changing the Feeling)",
    intro: "Stay 100% Fear while changing how support returns.",
    items: [
      {
        title: "Variation A — Bottom Octave Return Instead of Upper",
        pattern: {
          beats: BASE_BEATS,
          rh: ["Chord", "", "", "", "", "", "", ""],
          lh: ["Oct", "–", "Bottom", "–", "–", "–", "Oct", "–"],
        },
        progressionLines: {
          flowRh: "G C D♯ | G♯ C♯ F | G♯ B D | G D D♯",
          flowLh: "C | C♯ | G | C (octave returns)",
          colorRh: "G C D♯ | A C F♯ | D G♯ B | C♯ E G",
          colorLh: "C | F♯ | G | A♯ (octave returns)",
        },
        playerFeel: ["more physical", "still unstable"],
        ruleNote: "Return may use octave, but must still feel late and insufficient.",
      },
    ],
  },

  hardBreak: {
    title: "Full LH Root Pulse",
    pattern: {
      beats: BASE_BEATS,
      rh: ["Chord", "", "", "", "", "", "", ""],
      lh: ["Root", "", "Root", "", "Root", "", "Root", ""],
    },
    progressionLines: {
      flowRh: "G C D♯ | G♯ C♯ F | G♯ B D | G D D♯",
      flowLh: "C | C♯ | G | C",
      colorRh: "G C D♯ | A C F♯ | D G♯ B | C♯ E G",
      colorLh: "C | F♯ | G | A♯",
    },
    playerFeel: ["The ground becomes reliable"],
    resultText: [
      "Immediate break.",
      "Fear disappears as soon as bass becomes stable.",
    ],
    handPriority: {
      keeper: "Loss of support after beat 1",
      breaker: "Consistent LH grounding",
    },
  },

  performanceNotes: {
    microVariations: [
      "delay LH support as much as possible",
      "keep RH holding unstable harmony",
      "use less LH, not more",
    ],
    loopTolerance: [
      "Medium",
      "effective if instability is real",
      "breaks if support becomes predictable",
    ],
    mixingNotes: [
      "Safe with care",
      "Flow and Color can alternate",
      "keep instability consistent",
    ],
    liveCue: "Let the ground disappear.",
    pedalTips: {
  flow: "dry.",
  color: "dry.",
},
    summary: {
      stay: [
        "start grounded, then remove support",
        "keep RH sustaining instability",
        "bring back only weak, late support",
      ],
      break: [
        "restore steady bass",
        "make LH predictable",
        "turn instability into structure",
      ],
    },
  },
};

export const emotionalBookDataMap = {
  calm: calmBookData,
  playful: playfulBookData,
  sadness: sadnessBookData,
  melancholy: melancholyBookData,
  magic: magicBookData,
  mystery: mysteryBookData,
  wonder: wonderBookData,
  tension: tensionBookData,
  anger: angerBookData,
  fear: fearBookData,
} as const;