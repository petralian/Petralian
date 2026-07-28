import Link from "next/link";
import {
  ORBIT_RUSH_FAQ,
  ORBIT_RUSH_POWERUPS,
  type OrbitRushPowerUpRow,
} from "@/lib/orbit-rush-guide-content";

function kindLabel(kind: OrbitRushPowerUpRow["kind"]) {
  if (kind === "up") return "Boost";
  if (kind === "down") return "Risk";
  return "Wild";
}

export default function OrbitRushGuide() {
  return (
    <section
      className="orbit-game-page-chrome orbit-rush-guide"
      aria-label="How to play Orbit Rush"
    >
      <div className="orbit-rush-guide__inner">
        <p className="orbit-rush-guide__eyebrow">FREE BROWSER GAME</p>
        <h2 className="orbit-rush-guide__title">How to play Lost in Space — Orbit Rush</h2>
        <p className="orbit-rush-guide__lede">
          <strong>Orbit Rush</strong> is a one-thumb survival game built for Petralian:
          widen your orbit to scoop pickups, tighten to dodge the star and debris, and chase a
          higher score on the live leaderboard. No download — play at{" "}
          <Link href="/lost-in-space">petralian.com/lost-in-space</Link>.
        </p>

        <h3 className="orbit-rush-guide__h3">Controls</h3>
        <ul className="orbit-rush-guide__list">
          <li>
            <strong>Desktop:</strong> hold <kbd>mouse</kbd> or <kbd>space</kbd> to expand orbit;
            release to contract.
          </li>
          <li>
            <strong>Mobile / tablet:</strong> touch and hold anywhere on the playfield to expand;
            release to contract.
          </li>
          <li>
            <strong>Goal:</strong> collect objects, chain score multipliers, avoid the star and
            screen edge, survive as long as you can.
          </li>
        </ul>

        <h3 className="orbit-rush-guide__h3">Power-ups</h3>
        <p className="orbit-rush-guide__note">
          Pickups spawn on a timer. Green-tinted boosts help; red-tinted effects raise difficulty;
          <strong> ???</strong> is random.
        </p>
        <div className="orbit-rush-guide__table-wrap">
          <table className="orbit-rush-guide__table">
            <thead>
              <tr>
                <th scope="col">Pickup</th>
                <th scope="col">Type</th>
                <th scope="col">Effect</th>
              </tr>
            </thead>
            <tbody>
              {ORBIT_RUSH_POWERUPS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{kindLabel(row.kind)}</td>
                  <td>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="orbit-rush-guide__h3">Tips for a higher score</h3>
        <ul className="orbit-rush-guide__list">
          <li>Rhythm beats panic — alternate wide and tight orbits instead of holding constantly.</li>
          <li>Grab <strong>MAGNET</strong> before dense pickup clusters.</li>
          <li>Save <strong>SHIELD</strong> or <strong>PHANTOM</strong> for crowded waves.</li>
          <li>Submit your name after a qualifying run to appear on the leaderboard.</li>
        </ul>

        <h3 className="orbit-rush-guide__h3">FAQ</h3>
        <dl className="orbit-rush-guide__faq">
          {ORBIT_RUSH_FAQ.map(({ question, answer }) => (
            <div key={question}>
              <dt>{question}</dt>
              <dd>{answer}</dd>
            </div>
          ))}
        </dl>

        <p className="orbit-rush-guide__footer">
          Built as a lab project on Petralian — share the link and see if you can beat the top
          score. Site performance notes:{" "}
          <Link href="/posts/getting-to-lighthouse-100-on-nextjs-16">
            how this stack hits Lighthouse targets
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
