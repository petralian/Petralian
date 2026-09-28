import Image from "next/image";
import { ENZO_GALLERY, ENZO_HK_BEST_ROWS, ENZO_SITE_URL } from "@/lib/enzo-site";

function SunglassesSeal() {
  return (
    <svg
      className="enzo-hero__seal"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Cool sunglasses doodle"
    >
      <circle cx="60" cy="60" r="54" fill="#ffe566" stroke="#1a0f2e" strokeWidth="4" />
      <ellipse cx="42" cy="58" rx="22" ry="16" fill="#1a0f2e" />
      <ellipse cx="78" cy="58" rx="22" ry="16" fill="#1a0f2e" />
      <path d="M64 58 H56" stroke="#1a0f2e" strokeWidth="3" />
      <path
        d="M18 52 Q8 58 18 64"
        fill="none"
        stroke="#1a0f2e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M102 52 Q112 58 102 64"
        fill="none"
        stroke="#1a0f2e"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M38 82 Q60 98 82 82"
        fill="none"
        stroke="#1a0f2e"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const MARQUEE_TEXT =
  " ★ CERTIFIED HANDSOME ★ HONG KONG REGISTRY ★ ENZO!!! ★ NO APPEALS ★ ";

export default function EnzoPage() {
  return (
    <>
      <div className="enzo-marquee" aria-hidden="true">
        <span className="enzo-marquee__track">
          {MARQUEE_TEXT.repeat(4)}
        </span>
      </div>

      <header className="enzo-hero">
        <span className="enzo-sparkle enzo-sparkle--1" aria-hidden="true" />
        <span className="enzo-sparkle enzo-sparkle--2" aria-hidden="true" />
        <span className="enzo-sparkle enzo-sparkle--3" aria-hidden="true" />
        <SunglassesSeal />
        <p className="enzo-hero__badge">Hong Kong&apos;s Best · Challenge Question ★</p>
        <h1>Most Handsome Man in Hong Kong</h1>
        <p className="enzo-hero__subtitle">
          Primary source: Enzo&apos;s own homework. Peer review pending since forever.
          This is a family glamour board — not an actual government registry (obviously).
        </p>
      </header>

      <section className="enzo-worksheet" aria-labelledby="worksheet-heading">
        <div className="enzo-worksheet__frame">
          <h2 id="worksheet-heading">Exhibit A — The Original Filing</h2>
          <Image
            src="/images/enzo/worksheet-translated.png"
            alt="School worksheet listing Hong Kong superlatives with Enzo named most handsome man"
            width={897}
            height={1200}
            className="enzo-worksheet__img"
            priority
          />
          <table className="enzo-table">
            <thead>
              <tr>
                <th scope="col">The best in Hong Kong</th>
                <th scope="col">Name</th>
              </tr>
            </thead>
            <tbody>
              {ENZO_HK_BEST_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="enzo-gallery" aria-labelledby="gallery-heading">
        <h2 id="gallery-heading">Glamour Board · Evidence Locker</h2>
        <div className="enzo-gallery__grid">
          {ENZO_GALLERY.map((item) => (
            <article key={item.src} className="enzo-card">
              <div className="enzo-card__ribbon">{item.award}</div>
              <div className="enzo-card__photo-wrap">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={800}
                  height={1000}
                  className="enzo-card__photo"
                />
              </div>
              <div className="enzo-card__body">
                <p>{item.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="enzo-footer">
        <p>
          *Not affiliated with the HKSAR, ICC, or any real beauty contest. Made with love by
          Dad.
        </p>
        <p>
          <a href="https://petralian.com/">petralian.com</a>
          {" · "}
          <a href={ENZO_SITE_URL}>{ENZO_SITE_URL}</a>
        </p>
      </footer>
    </>
  );
}
