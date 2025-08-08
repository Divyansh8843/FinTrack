"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    toggleClass(dark);
  }, []);

  function toggleClass(dark: boolean) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }

  function onToggle() {
    const next = !isDark;
    setIsDark(next);
    toggleClass(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      aria-label="Toggle theme"
      onClick={onToggle}
      className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
