"use client";

import { useEffect, useState } from "react";

function getCookieTheme(): "light" | "dark" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)petralian-theme=([^;]+)/);
  return m ? (m[1] as "light" | "dark") : null;
}

function setCookieTheme(theme: "light" | "dark") {
  document.cookie = `petralian-theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
}

/** Batman bat silhouette */
function BatIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor" aria-hidden>
      <path d="M9 0.5C7.8 0.5 6 2 5 3.5C3.6 2.6 1.2 3 0.3 5C-0.3 7 1 8.5 2.8 8C3.8 7.7 4.9 8.8 5.4 10C6.3 11.6 7.5 12.5 9 12.5C10.5 12.5 11.7 11.6 12.6 10C13.1 8.8 14.2 7.7 15.2 8C17 8.5 18.3 7 17.7 5C16.8 3 14.4 2.6 13 3.5C12 2 10.2 0.5 9 0.5Z" />
    </svg>
  );
}

/** Superman pentagon shield */
function ShieldIcon() {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="currentColor" aria-hidden>
      <path d="M6.5 0.5L12.5 3.5V10L6.5 14.5L0.5 10V3.5Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const cookie = getCookieTheme();
    if (cookie) {
      setIsDark(cookie === "dark");
      document.documentElement.setAttribute("data-theme", cookie);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      // No cookie yet — follow system, don't lock it in
    }
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    setCookieTheme(theme);
  }

  if (!mounted) return <div className="theme-switch-placeholder" />;

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      className={`theme-switch${isDark ? " theme-switch--dark" : ""}`}
      title={isDark ? "Switch to light mode (Superman)" : "Switch to dark mode (Batman)"}
    >
      <span className="theme-switch-icon theme-switch-icon--light">
        <ShieldIcon />
      </span>
      <span className="theme-switch-thumb" aria-hidden />
      <span className="theme-switch-icon theme-switch-icon--dark">
        <BatIcon />
      </span>
    </button>
  );
}

