import type { Metadata } from "next";
import Link from "next/link";
import OrbitRushGame from "@/components/OrbitRushGame";
import NotFoundAnalytics from "@/components/NotFoundAnalytics";
import "@/orbit-game/orbit.css";

export const metadata: Metadata = {
    title: "404 — Page Not Found",
    description: "This page does not exist.",
};

export default function NotFound() {
    return (
        <div className="orbit-game-page">
            <NotFoundAnalytics />
            <OrbitRushGame />

            <div className="orbit-game-title-overlay">
                <p className="orbit-game-title-overlay__eyebrow">ERROR 404</p>
                <h1 className="orbit-game-title-overlay__heading">Lost in Space</h1>
                <p className="orbit-game-title-overlay__sub">
                    Page not found. Hold to widen orbit — release to survive.
                </p>
            </div>

            <Link href="/" className="orbit-game-page-home">
                ← HOME
            </Link>
        </div>
    );
}
