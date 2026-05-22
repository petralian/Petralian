import type { Metadata } from "next";
import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nathan Petralia - enterprise AI and digital transformation. Twenty years inside APAC's most demanding programs. Practitioner, not pundit.",
};

export default function AboutPage() {
  return (
    <div className="prose-container">
      <header className="about-header">
        <h1 className="about-title">Nathan Petralia</h1>
        <p className="about-subtitle">
          Enterprise AI and digital transformation. Practitioner, not pundit.
        </p>
      </header>

      <div className="about-body">
        <div className="about-status">
          <span className="about-status-dot" />
          Deep in vibe coding mode
        </div>

        <p>
          Twenty years inside APAC&apos;s most demanding digital programs. Est&eacute;e
          Lauder, Shiseido, Microsoft, Merkle - where I served as Managing
          Director, Hong Kong, building their CXM practice across the Dentsu
          network.
        </p>
        <p>
          In 2024 I started building software with AI as the primary engineer.
          What I learned from that changed how I think about enterprise AI programs,
          and most of it isn&apos;t in the mainstream conversation.
        </p>
        <p>
          I write about the level where strategy meets delivery. Not theory.
          The work.
        </p>

        <div className="about-links">
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="about-link-primary"
          >
            LinkedIn
          </a>
          <a href={SOCIAL_LINKS.email} className="about-link-secondary">
            Email
          </a>
        </div>

        <div className="about-github">
          <p className="about-github-label">GitHub activity</p>
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://ghchart.rshah.org/petralian"
              alt="Nathan Petralia's GitHub contribution graph"
              width={900}
              height={165}
              unoptimized
              className="about-github-chart"
            />
          </a>
        </div>
      </div>
    </div>
  );
}