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
            <script
                dangerouslySetInnerHTML={{
                    __html: "document.documentElement.classList.add('orbit-game-active');",
                }}
            />
            <NotFoundAnalytics />
            <OrbitRushGame />

            {/* Top overlay */}
            <div
                className="orbit-game-title-overlay"
                style={{
                    position: "absolute",
                    top: "8%",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    pointerEvents: "none",
                }}
            >
                <p
                    style={{
                        color: "#4af",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        letterSpacing: "0.3em",
                        margin: "0 0 10px",
                        opacity: 0.9,
                    }}
                >
                    ERROR 404
                </p>
                <h1
                    style={{
                        color: "#ffffff",
                        fontSize: "clamp(38px, 9vw, 86px)",
                        fontWeight: 900,
                        lineHeight: 1,
                        margin: 0,
                        letterSpacing: "-0.02em",
                        textShadow: "0 0 40px rgba(68,170,255,0.25)",
                    }}
                >
                    Lost in Space
                </h1>
                <p
                    style={{
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        marginTop: "12px",
                    }}
                >
                    Page not found. Hold to widen orbit — release to survive.
                </p>
            </div>

            {/* Bottom overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: "7%",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zIndex: 10,
                }}
            >
                <Link
                    href="/"
                    style={{
                        display: "inline-block",
                        color: "#4af",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        textDecoration: "none",
                        border: "1px solid rgba(68,170,255,0.35)",
                        padding: "10px 28px",
                        letterSpacing: "0.12em",
                    }}
                >
                    ← RETURN HOME
                </Link>
                <p
                    style={{
                        color: "rgba(255,255,255,0.2)",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        marginTop: "14px",
                    }}
                >
                    HOLD SPACE / TAP — widen orbit &nbsp;·&nbsp; Release — fall inward
                </p>
            </div>
        </div>
    );
}
