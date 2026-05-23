"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
            setVisible(scrollTop > 400);
        };
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    const r = 18;
    const circ = 2 * Math.PI * r;
    const dash = circ - (progress / 100) * circ;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`scroll-progress-btn${visible ? " scroll-progress-btn--visible" : ""}`}
            aria-label="Back to top"
        >
            <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                className="scroll-progress-svg"
                aria-hidden="true"
            >
                <circle cx="26" cy="26" r={r} className="scroll-progress-track" />
                <circle
                    cx="26"
                    cy="26"
                    r={r}
                    className="scroll-progress-fill"
                    strokeDasharray={circ}
                    strokeDashoffset={dash}
                    transform="rotate(-90 26 26)"
                />
            </svg>
            <span className="scroll-progress-arrow">↑</span>
        </button>
    );
}
