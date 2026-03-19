// app/learn/paths-of-harmony/page.tsx
import type { Metadata } from "next";
import TwoPathsEmotionCompare from "./TwoPathsEmotionCompare";

import TextColorKeyboardSection from "./TextColorKeyboardSection";
import TextFlowKeyboardSection from "./TextFlowKeyboardSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Paths of Harmony – Flow vs Color: Motion Behind Emotion",
  description:
    "Why do some chords feel calm, tense, or emotional? This page explores how harmonic motion creates emotion — and how Flow and Color are two ways that motion behaves.",
  alternates: { canonical: "/learn/paths-of-harmony" },

  openGraph: {
    type: "article",
    url: "https://emotionalchords.app/learn/paths-of-harmony",
    title: "Paths of Harmony – Flow vs Color: Motion Behind Emotion",
    description:
      "Emotion emerges from motion. Flow and Color show how harmony moves — and why it feels the way it does.",
    images: ["/og/emotionalchords.jpg"],
  },

  twitter: {
    card: "summary_large_image",
    title: "Paths of Harmony – Flow vs Color: Motion Behind Emotion",
    description:
      "Emotion emerges from motion. Flow and Color show how harmony moves — and why it feels the way it does.",
    images: ["/og/emotionalchords.jpg"],
  },

  robots: { index: true, follow: true },
};

export default function PathsOfHarmonyPage() {
  return (
    <main className="two-paths">
      <style>{`
        .two-paths {
          max-width: 820px;
          margin: 0 auto;
          padding: 16px;
          color: #111;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
        }

        /* Fancy gradient title */
        .two-paths h1.gradient-title {
          background: linear-gradient(90deg, #e7c86e, #a687ff 40%, #5fc3ff 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        /* Highlighted description paragraph */
        .two-paths .lead-colored {
          padding: 10px 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fff7d4, #f3ecff 70%);
          border: 1px solid rgba(0,0,0,0.06);
          font-size: 16px;
        }

        .two-paths h1 {
          margin: 0 0 8px;
          font-size: 32px;
          line-height: 1.2;
          letter-spacing: .2px;
        }
        .two-paths h2 {
          margin: 26px 0 8px;
          font-size: 22px;
          line-height: 1.3;
        }
        .two-paths h3 {
          margin: 20px 0 6px;
          font-size: 18px;
          line-height: 1.4;
        }
        .two-paths p {
          margin: 6px 0 10px;
          font-size: 15px;
          line-height: 1.7;
          color: #222;
        }
        .two-paths .lead {
          margin-top: 4px;
          font-size: 16px;
        }
        .two-paths strong {
          font-weight: 700;
        }
        .two-paths em {
          font-style: italic;
        }
        .two-paths ul {
          padding-left: 20px;
          margin: 4px 0 10px;
          font-size: 15px;
          line-height: 1.7;
        }
        .two-paths li { margin: 2px 0; }

        .highlight-box {
          margin: 16px 0;
          padding: 12px 14px;
          border-radius: 10px;
          background: #faf5e5;
          border: 1px solid #ebcf7a;
          font-size: 14px;
        }

        .table-wrapper {
          margin: 18px 0 22px;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        table th:first-child,
        table td:first-child {
          width: 130px;
          max-width: 130px;
          white-space: normal;
          word-break: break-word;
        }
        thead {
          background: #f7f7f7;
        }
        th, td {
          padding: 8px 10px;
          border: 1px solid #ddd;
          vertical-align: top;
          text-align: left;
        }
        th {
          font-weight: 700;
          font-size: 13px;
        }
        td code {
          font-size: 12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .2px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f1f1f1;
          color: #444;
          margin-bottom: 6px;
        }

        .emotion-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          white-space: normal;
        }
        .emotion-emoji {
          font-size: 16px;
        }
        tbody tr:nth-child(odd) { background: #fafafa; }
        tbody tr:nth-child(even) { background: #fefbf4; }

        @media (max-width: 640px) {
          .two-paths h1 { font-size: 26px; }
          .two-paths h2 { font-size: 19px; }
        }
      `}</style>

      <header>
        <div className="section-label">
          <span>✨</span>
          <span>Motion (Emotion): how harmony creates feeling</span>
        </div>

        <h1 className="gradient-title">Paths of Harmony: Flow vs Color ✨</h1>

        <p className="lead lead-colored">
  Harmony isn&apos;t just “music theory” — it&apos;s motion that produces{" "}
  <strong>emotion</strong>. This page shows two motion behaviors for the same
  motion:
  <strong> Flow</strong> (coherent, readable motion) and <strong>Color</strong>{" "}
  (motion with sharper re-alignment).
  <br />
  <br />
  You don&apos;t need to memorize terms. Just listen, compare, and notice
  what changes step by step.
</p>
      </header>

      {/* Demo: side-by-side */}
      <section>
        <h2>Flow vs Color — two paths for the same motion</h2>

        <div className="highlight-box">
         <p>
  <strong>Pick any motion below.</strong> You’ll see and hear two paths for the same motion:
</p>
<ul>
  <li>
    <strong>Flow</strong> keeps motion coherent and readable.
  </li>
  <li>
    <strong>Color</strong> re-aligns faster and breaks orientation sooner.
  </li>
</ul>
         <p style={{ marginTop: 8 }}>
  <strong>This explains why some chords feel emotional on piano.</strong>
</p>

          <TwoPathsEmotionCompare />
        </div>
      </section>

<section style={{ marginTop: 18 }}>
  <h2>Keyboard view — Flow motion</h2>
  <p style={{ fontSize: 13, marginTop: 4 }}>
    This is the same motion rendered as coherent steps. Don’t label it. Track what changes.
  </p>
  <TextFlowKeyboardSection />
</section>

<section style={{ marginTop: 18 }}>
  <h2>Keyboard view — Color motion</h2>
  <p style={{ fontSize: 13, marginTop: 4 }}>
    This is the same motion under faster re-alignment. Track where orientation breaks and reforms.
  </p>
  <TextColorKeyboardSection />
</section>

      {/* Table / Map */}
      <section>
        <h2>Motion (Emotion) Map — Flow &amp; Color side by side</h2>

        <p style={{ fontSize: 13, marginBottom: 8 }}>
  This map pairs each emotion with a motion label: <strong>Motion (Emotion)</strong>.
  Flow and Color are two different motion behaviors that can produce the same emotion.
  Flow stays coherent and readable; Color re-aligns faster and breaks orientation more aggressively.
</p>
<p style={{ fontSize: 12, marginBottom: 6, color: "#555" }}>
  Each row names the <strong>motion</strong> first, with the resulting <strong>emotion</strong> shown in parentheses.
</p>

        <div className="table-wrapper">
          <table>
            <thead>
  <tr>
    <th>Motion (Emotion)</th>
    <th>Flow (degrees → example)</th>
    <th>Color (local steps → example)</th>
    <th>
      ⭐ Contrast points
      <br />
      <span style={{ fontWeight: 400 }}>
        (where motion changes most)
      </span>
    </th>
  </tr>
</thead>

            <tbody>
              {/* GROUP 1 – FULLY DIATONIC FLOW */}

              <tr>
                <td>
  <span className="emotion-label">
    <span className="emotion-emoji">🌿</span>
    <span>Settled Circulation (Calm)</span>
  </span>
</td>
                <td>
                  <code>1, 5, 6, 4</code>
                  <br />
                  <span>B♭ major example: </span>
                  <code>Bb → F → Gm → Eb</code>
                </td>
                <td>
                  <code>M → M(+2) → M(+3) → M(–2)</code>
                  <br />
                  <span>C example: </span>
                  <code>C → D → F → Eb</code>
                </td>
                <td>
                  <code>Eb</code>
                  <br />
                  <span>a gentle downward settle away from the reference.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🎈</span>
                    <span>Light Return (Playful)</span>
                  </span>
                </td>
                <td>
                  <code>1, 2, 5, 1</code>
                  <br />
                  <span>B♭ major example: </span>
                  <code>Bb → Cm → F → Bb</code>
                </td>
                <td>
                  <code>M → M(+3) → M(+3) → M(+2)</code>
                  <br />
                  <span>C example: </span>
                  <code>C → Eb → F# → G#</code>
                </td>
                <td>
                  <code>F#</code>
                  <br />
                  <span>a quick deviation that shifts alignment instantly.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">✨</span>
                    <span>Guided Departure (Magic)</span>
                  </span>
                </td>
                <td>
                  <code>4, 1, 5, 6</code>
                  <br />
                  <span>B♭ major example: </span>
                  <code>Eb → Bb → F → Gm</code>
                </td>
                <td>
                  <code>M → M(+8) → M(–4) → M(+3)</code>
                  <br />
                  <span>C example: </span>
                  <code>C → Ab → E → G</code>
                </td>
                <td>
                  <code>E</code>
                  <br />
                  <span>a sudden re-framing event that changes orientation fast.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😢</span>
                    <span>Unresolved Descent (Sadness)</span>
                  </span>
                </td>
                <td>
                  <code>1, 6b, 3b, 7b</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Cm → Ab → Eb → Bb</code>
                </td>
                <td>
                  <code>m → M(–4) → m(–3) → m(–1)</code>
                  <br />
                  <span>C example: </span>
                  <code>Cm → Ab → Fm → Em</code>
                </td>
                <td>
                  <code>Em</code>
                  <br />
                  <span>a brief contrast event before the descent continues.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🕵️‍♀️</span>
                    <span>Obscured Orientation (Mystery)</span>
                  </span>
                </td>
                <td>
                  <code>1, 4, 7b, 1</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Cm → Fm → Bb → Cm</code>
                </td>
                <td>
                  <code>m → M(+2) → dim(+3) → M(+1)</code>
                  <br />
                  <span>C example: </span>
                  <code>Cm → D → F° → F#</code>
                </td>
                <td>
                  <code>F°</code>
                  <br />
                  <span>a fog event — positional clarity drops briefly.</span>
                </td>
              </tr>

              {/* GROUP 2 – ONE “SPICE” FLOW CHORD */}

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🌧️</span>
                    <span>Altered Return (Melancholy)</span>
                  </span>
                </td>
                <td>
                  <code>6b, 4, 1, 5</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Ab → Fm → Cm → G⭐</code>
                </td>
                <td>
                  <code>m → M(–3) → m(+4) → M(–3)</code>
                  <br />
                  <span>C example: </span>
                  <code>Cm → A → C#m → A#</code>
                </td>
                <td>
                  <code>A</code>
                  <br />
                  <span>a contrast event that alters the return.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🌌</span>
                    <span>Upward Opening (Wonder)</span>
                  </span>
                </td>
                <td>
                  <code>1, 6b, 3b, 4</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Cm → Ab → Eb → F⭐</code>
                </td>
                <td>
                  <code>m → M(+5) → M(+2) → M(+4)</code>
                  <br />
                  <span>C example: </span>
                  <code>Cm → F → G → B</code>
                </td>
                <td>
                  <code>B</code>
                  <br />
                  <span>an elevated event that opens the frame upward.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😬</span>
                    <span>Held Pressure (Tension)</span>
                  </span>
                </td>
                <td>
                  <code>1, 2, 5, 1</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Cm → D° → G⭐ → Cm</code>
                </td>
                <td>
                  <code>M → m(+1) → dim(+3) → M(+2)</code>
                  <br />
                  <span>C example: </span>
                  <code>C → C#m → E° → F#</code>
                </td>
                <td>
                  <code>E°</code>
                  <br />
                  <span>a compression event before the pressure holds.</span>
                </td>
              </tr>

              {/* GROUP 3 – TWO “SPICE” FLOW CHORDS */}

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😡</span>
                    <span>Grinding Advance (Anger)</span>
                  </span>
                </td>
                <td>
                  <code>1, 4, 2b, 5</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Cm → Fm → Db⭐ → G⭐</code>
                </td>
                <td>
                  <code>m → m(+1) → dim(+3) → M(+2)</code>
                  <br />
                  <span>C example: </span>
                  <code>Cm → C#m → E° → F#</code>
                </td>
                <td>
                  <code>C#m, E°, F#</code>
                  <br />
                  <span>after the reference, motion forces upward through resistance.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😱</span>
                    <span>Loss of Ground (Fear)</span>
                  </span>
                </td>
                <td>
                  <code>1, 2b, 5, 1</code>
                  <br />
                  <span>C minor example: </span>
                  <code>Cm → Db⭐ → G⭐ → Cm</code>
                </td>
                <td>
                  <code>m → dim(+6) → M(+1) → dim(+3)</code>
                  <br />
                  <span>C example: </span>
                  <code>Cm → F#° → G → A#°</code>
                </td>
                <td>
                  <code>F#°, A#°</code>
                  <br />
                  <span>instability events that remove secure footing.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 13, marginTop: 6 }}>
  In the <strong>Flow</strong> column, chords marked with{" "}
  <span style={{ fontSize: "90%" }}>⭐</span> are contrast points — moments where the motion deviates most from the baseline.
  They don&apos;t add “more emotion” by themselves; they change the motion, and emotion emerges from that change.
</p>

        <h3 style={{ marginTop: 18 }}>How the “spice” increases</h3>

        <p>
  You can think of Flow like a ladder of motion contrast:
  <strong> baseline</strong> → <strong>one deviation</strong> →{" "}
  <strong>two deviations</strong>.
</p>

        <ul>
          <li>
  <strong>0 contrast points</strong> — <em>Calm, Playful, Magic, Sadness, Mystery</em>.
  <br />
  Motion stays coherent and readable — great for learning the baseline.
</li>
          <li>
  <strong>1 contrast point</strong> — <em>Melancholy, Wonder, Tension</em>.
  <br />
  One step deviates strongly from the baseline, changing the motion noticeably.
</li>
          <li>
  <strong>2 contrast points</strong> — <em>Anger, Fear / Horror</em>.
  <br />
  Two deviation events reshape the motion more aggressively.
</li>
        </ul>

        <p>
  You don&apos;t need to remember chord names. It&apos;s enough to feel the ladder:
  as Flow includes more contrast points, the motion changes more sharply — and the emotion becomes clearer.
</p>
      </section>

      {/* Flow explanation */}
      <section>
        <h2>Flow: coherent motion</h2>

        <p>
  <strong>Flow</strong> is coherent motion. Chords connect in a readable way:
  orientation stays intact, and returns make sense when they arrive.
</p>

<p>
  Flow is ideal for learning the baseline motion. It gives your hands a clean reference
  before you explore sharper re-alignment.
</p>
      </section>

      {/* Color explanation */}
      <section>
        <h2>Color: re-aligned motion</h2>

        <p>
  <strong>Color</strong> is motion with faster re-alignment. Orientation breaks sooner,
  the frame shifts more aggressively, and returns are less guaranteed.
</p>

<p>
  That&apos;s why Color often feels vivid quickly: not because it&apos;s “more emotional,”
  but because the motion changes more per step.
</p>

        
      </section>


      {/* Closing */}
      <section>
        <h2>A simple takeaway</h2>
        <div className="highlight-box">
          <ul>
  <li>
    <strong>Flow</strong> = coherent motion: readable steps and meaningful returns.
  </li>
  <li>
    <strong>Color</strong> = re-aligned motion: faster frame shifts and less guaranteed footing.
  </li>
</ul>
<p style={{ marginTop: 8 }}>
  Try both paths for the same emotion — then listen again and track the motion.
</p>
        </div>
      </section>
      <Link href="/learn/emotional-piano-chord-progressions">
  Understand chord progressions and patterns for each Emotion →
</Link>
    </main>
  );
}