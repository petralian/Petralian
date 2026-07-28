import Link from "next/link";
import OrbitRushPowerUpsSection from "@/components/orbit/OrbitRushPowerUpsSection";
import { ORBIT_RUSH_FAQ } from "@/lib/orbit-rush-guide-content";

export default function OrbitRushGuide() {
  return (
    <section
      className="orbit-game-page-chrome orbit-rush-guide"
      aria-label="How to play Orbit Rush"
    >
      <div className="orbit-rush-guide__inner">
        <div className="orbit-guide-grid">
          <article className="orbit-guide-card">
            <h2 className="orbit-guide-card__title">How to play</h2>
            <p className="orbit-guide-card__lede">
              Widen your orbit to scoop pickups, tighten to dodge the star and debris, and
              survive as long as you can.
            </p>
            <div className="orbit-guide-controls">
              <div className="orbit-guide-control">
                <span className="orbit-guide-control__label">Desktop</span>
                <p>
                  Hold <kbd>mouse</kbd> or <kbd>space</kbd> to expand; release to contract.
                </p>
              </div>
              <div className="orbit-guide-control">
                <span className="orbit-guide-control__label">Touch</span>
                <p>Press and hold the playfield; release to contract.</p>
              </div>
            </div>
          </article>

          <article className="orbit-guide-card">
            <h2 className="orbit-guide-card__title">Tips</h2>
            <ul className="orbit-guide-tips">
              <li>Rhythm beats panic — alternate wide and tight orbits.</li>
              <li>Grab MAGNET before dense pickup clusters.</li>
              <li>Save SHIELD or PHANTOM for crowded waves.</li>
              <li>Submit your name after a qualifying run for the leaderboard.</li>
            </ul>
          </article>
        </div>

        <OrbitRushPowerUpsSection />

        <article className="orbit-guide-card orbit-guide-card--wide">
          <h2 className="orbit-guide-card__title">FAQ</h2>
          <dl className="orbit-guide-faq">
            {ORBIT_RUSH_FAQ.map(({ question, answer }) => (
              <div key={question} className="orbit-guide-faq__item">
                <dt>{question}</dt>
                <dd>{answer}</dd>
              </div>
            ))}
          </dl>
        </article>

        <p className="orbit-rush-guide__footer">
          Built as a lab project on Petralian. Share{" "}
          <Link href="/lost-in-space">petralian.com/lost-in-space</Link> and see if you can beat
          the top score.
        </p>
      </div>
    </section>
  );
}
