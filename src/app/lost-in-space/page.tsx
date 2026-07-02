import type { Metadata } from "next";
import Link from "next/link";
import OrbitRushGame from "@/components/OrbitRushGame";
import { SITE_URL } from "@/lib/constants";

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
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100dvh - 64px)",
        overflow: "hidden",
      }}
    >
      <OrbitRushGame />

      <div
        style={{
          position: "absolute",
          top: "6%",
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <p
          style={{
            color: "#4af",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "0.3em",
            margin: "0 0 8px",
            opacity: 0.9,
          }}
        >
          ORBIT RUSH
        </p>
        <h1
          style={{
            color: "#ffffff",
            fontSize: "clamp(28px, 6vw, 52px)",
            fontWeight: 900,
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-0.02em",
            textShadow: "0 0 40px rgba(68,170,255,0.25)",
          }}
        >
          Lost in Space
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            pointerEvents: "auto",
            color: "#4af",
            fontFamily: "monospace",
            fontSize: "12px",
            textDecoration: "none",
            border: "1px solid rgba(68,170,255,0.35)",
            padding: "8px 22px",
            letterSpacing: "0.12em",
          }}
        >
          ← PETRALIAN HOME
        </Link>
        <p
          style={{
            color: "rgba(255,255,255,0.25)",
            fontFamily: "monospace",
            fontSize: "10px",
            marginTop: "10px",
          }}
        >
          HOLD SPACE / TAP — widen orbit · Release — gravity pulls inward
        </p>
      </div>
    </div>
  );
}
