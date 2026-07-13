import type { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SOCIAL_LINKS, SITE_URL, AUTHOR_NAME, AUTHOR_TITLE, AUTHOR_BIO } from "@/lib/constants";
import aboutContent from "../../../content/pages/about.json";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nathan Petralia — twenty years closing deals, building high-performance teams, and delivering complex digital programs across APAC. Writing on enterprise AI, commercial growth, and the work behind transformation.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: `About ${AUTHOR_NAME}`,
    description:
      "Nathan Petralia — twenty years closing deals, building high-performance teams, and delivering complex digital programs across APAC.",
    type: "profile",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: AUTHOR_NAME,
    url: SITE_URL,
    description: AUTHOR_BIO,
    jobTitle: AUTHOR_TITLE,
    worksFor: {
      "@type": "Organization",
      name: "Petralian",
      url: SITE_URL,
    },
    sameAs: [
      SOCIAL_LINKS.linkedin,
      SOCIAL_LINKS.github,
    ],
    knowsAbout: [
      "Enterprise AI Strategy",
      "Digital Transformation",
      "Commercial Growth",
      "GTM Strategy",
      "Program Delivery",
      "Generative AI in Marketing",
      "APAC Markets",
      "CXM",
    ],
    alumniOf: [
      { "@type": "Organization", name: "Merkle" },
      { "@type": "Organization", name: "Dentsu" },
      { "@type": "Organization", name: "Microsoft" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* ── Dark hero split ─────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          {/* Left: text */}
          <div>
            <Breadcrumbs
              variant="dark"
              items={[
                { label: "Home", href: "/" },
                { label: "About" },
              ]}
            />
            <h1 className="about-hero-name">Nathan Petralia</h1>
            <p className="about-hero-tagline">{aboutContent.hero_tagline}</p>

            <div className="about-hero-bio">
              {aboutContent.bio_paragraphs.flatMap((para, i) =>
                para.split("\n\n").map((block, j) => (
                  <p key={`${i}-${j}`}>
                    {block.split("\n").map((line, k, arr) => (
                      <span key={k}>
                        {line}
                        {k < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))
              )}
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
                Email me directly
              </a>
            </div>
          </div>

          {/* Right: photo */}
          <div className="about-hero-photo-wrap">
            <Image
              src="/images/nathan-petralia-about.jpg"
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
        {aboutContent.pillars.map((pillar) => (
          <div key={pillar.title} className="about-pillar">
            <p className="about-pillar-label">{pillar.label}</p>
            <h2 className="about-pillar-title">{pillar.title}</h2>
            <p className="about-pillar-text">{pillar.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
