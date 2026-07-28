import type { Metadata } from "next";
import Link from "next/link";
import OrbitRushGame from "@/components/OrbitRushGame";
import OrbitRushGuide from "@/components/OrbitRushGuide";
import { SITE_URL } from "@/lib/constants";
import "@/orbit-game/orbit.css";

export const metadata: Metadata = {
  title: "Lost in Space — Orbit Rush",
  description:
    "Free browser game: hold to widen your orbit, release to fall inward. Dodge debris, collect power-ups, and climb the Orbit Rush leaderboard on Petralian.",
  openGraph: {
    title: "Lost in Space — Orbit Rush — Petralian",
    description:
      "Can you beat my score? Free orbit survival game — play in browser, no install.",
    url: `${SITE_URL}/lost-in-space`,
    type: "website",
  },
};

export default function LostInSpacePage() {
  return (
    <div className="orbit-game-page">
      <OrbitRushGame />

      <div className="orbit-game-title-overlay">
        <p className="orbit-game-title-overlay__eyebrow">ORBIT RUSH</p>
        <h1 className="orbit-game-title-overlay__heading">Lost in Space</h1>
        <p className="orbit-game-title-overlay__sub">
          Hold to widen orbit · release to fall inward · chase the high score
        </p>
      </div>

      <OrbitRushGuide />

      <Link href="/" className="orbit-game-page-home">
        ← HOME
      </Link>
    </div>
  );
}
