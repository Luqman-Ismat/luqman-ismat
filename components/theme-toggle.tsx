"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      className="theme-control"
      aria-label="Toggle color theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun size={18} className="theme-sun" aria-hidden="true" />
      <Moon size={18} className="theme-moon" aria-hidden="true" />
    </button>
  );
}
