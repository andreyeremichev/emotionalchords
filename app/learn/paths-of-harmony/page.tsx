// app/learn/paths-of-harmony/page.tsx
import type { Metadata } from "next";
import TwoPathsEmotionCompare from "./TwoPathsEmotionCompare";
import FlowKeyboard from "./FlowKeyboard";
import ColorKeyboard from "./ColorKeyboard";

export const metadata: Metadata = {
  title: "Paths of Harmony – Flow vs Color • EmotionalChords",
  description:
    "Learn why some chord moves feel familiar and others feel surprising. Explore Flow vs Color with simple demos and emotion recipes.",
  alternates: { canonical: "/learn/paths-of-harmony" },
  openGraph: {
    type: "article",
    url: "https://emotionalchords.app/learn/paths-of-harmony",
    title: "Paths of Harmony – Flow vs Color",
    description:
      "Learn why some chord moves feel familiar and others feel surprising. Explore Flow vs Color with simple demos and emotion recipes.",
    images: ["/og/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paths of Harmony – Flow vs Color",
    description:
      "Learn why some chord moves feel familiar and others feel surprising.",
    images: ["/og/og-image.png"],
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
          <span>Emotional Harmony</span>
        </div>

        <h1 className="gradient-title">Paths of Harmony: Flow vs Color ✨</h1>

        <p className="lead lead-colored">
          Harmony isn&apos;t just “music theory” — it&apos;s a language of{" "}
          <strong>emotion</strong>. This page shows why the same feeling (like 😢
          sadness, 😡 anger, or 🕵️‍♀️ mystery) can move in two different ways:
          <strong> Flow</strong> (familiar and smooth) and <strong>Color</strong>{" "}
          (surprising and intense).
          <br />
          <br />
          You don&apos;t need to memorize terms. Just listen, compare, and notice
          what your hands feel.
        </p>
      </header>

      {/* Demo: side-by-side */}
      <section>
        <h2>Compare Flow and Color side by side</h2>

        <div className="highlight-box">
          <p>
            <strong>Pick any emotion below.</strong> You’ll see and hear two
            versions of the same feeling:
          </p>
          <ul>
            <li>
              <strong>Flow</strong> feels natural and “expected.”
            </li>
            <li>
              <strong>Color</strong> adds a twist — small moves that change the
              mood fast.
            </li>
          </ul>
          <p style={{ marginTop: 8 }}>
            <strong>Try this:</strong> listen once, then listen again and ask:
            “Which one feels calmer?” “Which one feels sharper?”
          </p>

          <TwoPathsEmotionCompare />
        </div>
      </section>

      {/* Table / Map */}
      <section>
        <h2>Emotion Map — Flow &amp; Color side by side</h2>

        <p style={{ fontSize: 13, marginBottom: 8 }}>
          This map shows the ten emotions used on EmotionalChords. The{" "}
          <strong>Flow</strong> column is the “home feeling” version. Some stay
          fully inside the key; some add one or two “spice” chords that sharpen
          the emotion. The <strong>Color</strong> column shows the more
          surprising route — where the harmony steps outside the home key more
          aggressively.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Emotion</th>
                <th>Flow (degrees → example)</th>
                <th>Color (local steps → example)</th>
                <th>
                  ⭐ “Spice” chords
                  <br />
                  <span style={{ fontWeight: 400 }}>
                    (the biggest feeling change)
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
                    <span>Calm / Peace</span>
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
                  <span>a gentle “exhale” away from C.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🎈</span>
                    <span>Playful</span>
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
                  <span>the playful “hop” that changes the color instantly.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">✨</span>
                    <span>Magic / Fantasy</span>
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
                  <span>a sudden flash of brightness in the harmony.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😢</span>
                    <span>Sadness</span>
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
                  <span>one bright, outside chord before falling back.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🕵️‍♀️</span>
                    <span>Mystery</span>
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
                  <span>the “fog chord” — it blurs the key for a moment.</span>
                </td>
              </tr>

              {/* GROUP 2 – ONE “SPICE” FLOW CHORD */}

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🌧️</span>
                    <span>Melancholy</span>
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
                  <span>bright, off-key, and strangely nostalgic.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">🌌</span>
                    <span>Wonder</span>
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
                  <span>a “halo chord” — very bright above the home key.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😬</span>
                    <span>Tension / Suspense</span>
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
                  <span>the “collapse inward” chord before the push.</span>
                </td>
              </tr>

              {/* GROUP 3 – TWO “SPICE” FLOW CHORDS */}

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😡</span>
                    <span>Anger</span>
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
                  <span>after Cm, everything rises chromatically and grinds.</span>
                </td>
              </tr>

              <tr>
                <td>
                  <span className="emotion-label">
                    <span className="emotion-emoji">😱</span>
                    <span>Fear / Horror</span>
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
                  <span>classic horror instability — tense and ungrounded.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 13, marginTop: 6 }}>
          In the <strong>Flow</strong> column, chords marked with{" "}
          <span style={{ fontSize: "90%" }}>⭐</span> are the “spice” chords — they
          step slightly outside the plain home key and sharpen the feeling.
        </p>

        <h3 style={{ marginTop: 18 }}>How the “spice” increases</h3>

        <p>
          You can think of Flow like a ladder:
          <strong> clean</strong> → <strong>one twist</strong> →{" "}
          <strong>two twists</strong>.
        </p>

        <ul>
          <li>
            <strong>0 spice chords</strong> — <em>Calm, Playful, Magic, Sadness, Mystery</em>.
            <br />
            The feeling is stable and clear — great for learning the baseline.
          </li>
          <li>
            <strong>1 spice chord</strong> — <em>Melancholy, Wonder, Tension</em>.
            <br />
            One chord steps outside the plain home key to add light, ache, or pressure.
          </li>
          <li>
            <strong>2 spice chords</strong> — <em>Anger, Fear / Horror</em>.
            <br />
            Two outside chords make the emotion sharper, heavier, or more intense.
          </li>
        </ul>

        <p>
          You don&apos;t need to remember chord names. It&apos;s enough to feel the
          ladder: as Flow adds more “spice,” the emotion gets more vivid.
        </p>
      </section>

      {/* Flow explanation */}
      <section>
        <h2>Flow: the smooth, familiar path</h2>

        <p>
          <strong>Flow</strong> is the path that feels like a song. Chords connect
          in a way your ear expects — grounded, calm, and “going somewhere.”
        </p>

        <p>
          Flow is great for stable emotions and easy-to-remember progressions.
          If you&apos;re new, start here: it gives your hands a clean emotional baseline.
        </p>
      </section>

      {/* Color explanation */}
      <section>
        <h2>Color: the surprising, expressive path</h2>

        <p>
          <strong>Color</strong> takes smaller, sharper moves. You&apos;ll notice
          tiny steps up or down, sudden brightness, and tension that snaps into place.
        </p>

        <p>
          That&apos;s why Color can make emotions feel more intense right away —
          sharper anger, closer fear, brighter wonder, stranger magic.
          It&apos;s not “harder.” It&apos;s just more concentrated.
        </p>

        <div className="highlight-box">
          <p>
            <strong>Simple idea:</strong> Flow is the “home recipe.” Color is the “twist.”
            Try both for the same emotion and notice what changes.
          </p>
        </div>
      </section>

      {/* Flow keyboard demo */}
      <section>
        <h2>🎹 Try Flow on the keyboard</h2>
        <p>Press play and follow along. This is the emotional baseline.</p>
        <FlowKeyboard />
      </section>

      {/* Color keyboard demo */}
      <section>
        <h2>🎹 Now try Color</h2>
        <p>
          Same emotion — different feeling. Color adds the twist: small moves that
          change the mood quickly.
        </p>
        <ColorKeyboard />
      </section>

      {/* Closing */}
      <section>
        <h2>A simple takeaway</h2>
        <div className="highlight-box">
          <ul>
            <li>
              <strong>Flow</strong> = smooth, familiar, story-like.
            </li>
            <li>
              <strong>Color</strong> = surprise, intensity, emotional twist.
            </li>
          </ul>
          <p style={{ marginTop: 8 }}>
            Try both paths for the same emotion — you&apos;ll feel the difference instantly.
          </p>
        </div>
      </section>
    </main>
  );
}