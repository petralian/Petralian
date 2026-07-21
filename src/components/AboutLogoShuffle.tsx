"use client";

import Image from "next/image";
import { useState } from "react";

export type ClientLogo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  maxHeight?: number;
  darkBlend?: boolean;
};

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

type AboutLogoShuffleProps = {
  logos: ClientLogo[];
  perView?: number;
  heading: string;
};

export default function AboutLogoShuffle({
  logos,
  perView = 12,
  heading,
}: AboutLogoShuffleProps) {
  const [rows] = useState(() => {
    const picked = shuffle(logos).slice(0, perView);
    const half = Math.ceil(picked.length / 2);
    return [picked.slice(0, half), picked.slice(half)];
  });

  if (logos.length === 0) return null;

  return (
    <div className="about-trust-logos">
      <h2 className="about-trust-heading">{heading}</h2>
      <div className="about-logo-rows">
        {rows.map((row, rowIndex) => (
          <ul
            key={`logo-row-${rowIndex}`}
            className="about-logo-row"
            aria-label={`Client logos row ${rowIndex + 1}`}
          >
            {row.map((logo) => (
              <li key={logo.src}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width ?? 160}
                  height={logo.height ?? 64}
                  className={
                    logo.darkBlend
                      ? "about-logo-image about-logo-image--dark-blend"
                      : "about-logo-image"
                  }
                  style={
                    logo.maxHeight
                      ? { maxHeight: `${logo.maxHeight}px` }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
