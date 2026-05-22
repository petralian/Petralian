"use client";

import { useEffect, useState } from "react";
import { Monitor, Sun, Moon } from "lucide-react";

type Theme = "system" | "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("petralian-theme") as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
    else setTheme("system");
  }, []);

  function apply(t: Theme) {
    setTheme(t);
    if (t === "system") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("petralian-theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("petralian-theme", t);
    }
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      <button
        onClick={() => apply("system")}
        className={`theme-btn${theme === "system" ? " theme-btn--active" : ""}`}
        title="System theme"
        aria-pressed={theme === "system"}
      >
        <Monitor size={13} strokeWidth={1.75} />
      </button>
      <button
        onClick={() => apply("light")}
        className={`theme-btn${theme === "light" ? " theme-btn--active" : ""}`}
        title="Light theme"
        aria-pressed={theme === "light"}
      >
        <Sun size={13} strokeWidth={1.75} />
      </button>
      <button
        onClick={() => apply("dark")}
        className={`theme-btn${theme === "dark" ? " theme-btn--active" : ""}`}
        title="Dark theme"
        aria-pressed={theme === "dark"}
      >
        <Moon size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
}
