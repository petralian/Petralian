import Link from "next/link";
import Image from "next/image";
import type homeContent from "../../../content/pages/home.json";

type HomeContent = typeof homeContent;

export default function HomeIntro({ homeContent }: { homeContent: HomeContent }) {
  return (
    <section className="home-intro">
      <div className="home-intro-inner">
        <div className="home-intro-photo-wrap">
          <Image
            src="/images/nathan-petralia.jpg"
            alt="Nathan Petralia at HKU"
            fill
            loading="lazy"
            quality={60}
            className="home-intro-photo"
            sizes="(max-width: 860px) 100vw, 380px"
          />
        </div>
        <div className="home-intro-text">
          <h2 className="home-intro-eyebrow">Nathan Petralia</h2>
          {homeContent.intro_bio.split("\n\n").map((block, i) => (
            <p key={i} className="home-intro-bio">
              {block.split("\n").map((line, k, arr) => (
                <span key={k}>
                  {line}
                  {k < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
          <Link href="/about" className="home-intro-link">
            About me &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
