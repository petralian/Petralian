import type { Metadata } from "next";
import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nathan Petralia — thinking at the intersection of technology, transformation, and how people and organisations actually navigate change.",
};

export default function AboutPage() {
  return (
    <>
      {/* ── Dark hero split ─────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          {/* Left: text */}
          <div>
            <p className="about-hero-eyebrow">About</p>
            <h1 className="about-hero-name">Nathan Petralia</h1>
            <p className="about-hero-tagline">
              Thinking at the intersection of technology, transformation,<br />
              and how people and organisations actually navigate change.
            </p>

            <div className="about-hero-bio">
              <p>
                Twenty years inside APAC&apos;s most demanding digital programs — Est&eacute;e
                Lauder, Shiseido, Microsoft, Merkle — where I served as Managing
                Director, Hong Kong, building their CXM practice across the Dentsu network.
              </p>
              <p>
                In 2024 I started building software with AI as the primary engineer.
                What I learned changed how I think about enterprise AI programs, and most
                of it isn&apos;t in the mainstream conversation.
              </p>
              <p>
                I write about the level where strategy meets delivery. Not theory. The work.
              </p>
            </div>

            <div className="about-hero-links">
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="about-link-primary"
              >
                Connect on LinkedIn
              </a>
              <a href={SOCIAL_LINKS.email} className="about-link-secondary">
                Send an email
              </a>
            </div>
          </div>

          {/* Right: photo */}
          <div className="about-hero-photo-wrap">
            <Image
              src="https://petralian.com/wp-content/uploads/2024/12/DSC01892-980x655.jpg.webp"
              alt="Nathan Petralia"
              fill
              priority
              className="about-hero-photo"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── Pillars ─────────────────────────────────────────────── */}
      <div className="about-body">
        <div className="about-pillar">
          <p className="about-pillar-label">Focus area</p>
          <h2 className="about-pillar-title">Enterprise AI</h2>
          <p className="about-pillar-text">
            How large organisations deploy AI at scale — the governance, the change
            management, the real gaps between pilot and production.
          </p>
        </div>
        <div className="about-pillar">
          <p className="about-pillar-label">Focus area</p>
          <h2 className="about-pillar-title">Digital Transformation</h2>
          <p className="about-pillar-text">
            Two decades leading complex programmes across retail, finance, and
            professional services in APAC. Pattern recognition is the asset.
          </p>
        </div>
        <div className="about-pillar">
          <p className="about-pillar-label">Writing</p>
          <h2 className="about-pillar-title">Practitioner Perspective</h2>
          <p className="about-pillar-text">
            No punditry. Ideas that come from doing the work — from inside the
            program, not from the conference stage.
          </p>
        </div>
      </div>
    </>
  );
}
