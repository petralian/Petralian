import type { Metadata } from "next";
import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nathan Petralia — twenty years closing deals, building high-performance teams, and delivering complex digital programmes across APAC. Writing on enterprise AI, commercial growth, and the work behind transformation.",
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
              Twenty years closing deals, building teams, and delivering<br />
              complex programmes on time and on margin.
            </p>

            <div className="about-hero-bio">
              <p>
                Twenty years inside APAC&apos;s most demanding digital programs — Est&eacute;e
                Lauder, Shiseido, Microsoft, Merkle — where I served as Managing
                Director, Hong Kong, building their CXM practice across the Dentsu network.
              </p>
              <p>
                In 2024 I started building software with AI as the primary engineer.
                What I learned is the gap between AI programs that get funded and ones
                that actually deliver &mdash; and most of it isn&apos;t in the mainstream conversation.
              </p>
              <p>
                I write about where strategy meets delivery: the sales motion, the GTM,
                the team-build, the programme. Not theory. The work.
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
          <p className="about-pillar-label">Capability</p>
          <h2 className="about-pillar-title">Commercial &amp; GTM</h2>
          <p className="about-pillar-text">
            Building bespoke propositions and taking them to market. Closing
            enterprise deals across retail, finance, and professional services
            in APAC. The full cycle from pitch to contract.
          </p>
        </div>
        <div className="about-pillar">
          <p className="about-pillar-label">Capability</p>
          <h2 className="about-pillar-title">Teams &amp; Delivery</h2>
          <p className="about-pillar-text">
            Building and running high-performance practitioner teams. Delivering
            large, complex programmes within margin and metrics. Twenty years
            of P&amp;L accountability across the Dentsu network and beyond.
          </p>
        </div>
        <div className="about-pillar">
          <p className="about-pillar-label">Capability</p>
          <h2 className="about-pillar-title">Enterprise AI</h2>
          <p className="about-pillar-text">
            Technical depth to lead AI programs credibly &mdash; not just sponsor
            them. The governance, the change management, and the real gap
            between a funded pilot and production at scale.
          </p>
        </div>
      </div>
    </>
  );
}
