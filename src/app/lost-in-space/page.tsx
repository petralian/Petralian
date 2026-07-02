import type { Metadata } from "next";
import Link from "next/link";
import OrbitRushGame from "@/components/OrbitRushGame";
import { SITE_URL } from "@/lib/constants";
import "@/orbit-game/orbit.css";

export const metadata: Metadata = {
  title: "Lost in Space — Orbit Rush",
  description:
    "Hold to widen your orbit, release to fall inward. Dodge debris, grab power-ups, and chase the high score.",
  openGraph: {
    title: "Lost in Space — Petralian",
    description: "Can you beat my score? Orbit survival on Petralian.",
    url: `${SITE_URL}/lost-in-space`,
  },
};

export default function LostInSpacePage() {
  return (
    <div className="orbit-game-page">
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('orbit-game-active');",
        }}
      />
      <OrbitRushGame />

      <div className="orbit-game-title-overlay">
        <p className="orbit-game-title-overlay__eyebrow">ORBIT RUSH</p>
        <h1 className="orbit-game-title-overlay__heading">Lost in Space</h1>
      </div>

      <Link href="/" className="orbit-game-page-home">
        ← HOME
      </Link>
    </div>
  );
}
