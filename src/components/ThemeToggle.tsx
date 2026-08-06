"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme =
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
      (localStorage.getItem("7h_theme") as "light" | "dark") ||
      "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("7h_theme", nextTheme);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Light and Dark Mode"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
      className="relative flex items-center justify-between w-14 h-7 p-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors duration-300 hover:scale-105 shadow-sm cursor-pointer"
    >
      <span className="text-[11px] leading-none select-none z-10 pl-0.5">☀️</span>
      <span className="text-[11px] leading-none select-none z-10 pr-0.5">🌙</span>
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-[var(--accent-color)] shadow-md transition-transform duration-300 ${
          theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default ThemeToggle;
