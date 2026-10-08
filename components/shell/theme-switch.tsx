"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/* A labelled light/dark switch. The label and knob follow the `.dark` class
   in CSS, so the server render never disagrees with the stored theme. */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      className={`theme-switch ${className}`}
      aria-label="Switch between light and dark theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="theme-switch-track" aria-hidden="true">
        <span className="theme-switch-knob">
          <Sun className="ts-sun" size={15} strokeWidth={1.75} />
          <Moon className="ts-moon" size={15} strokeWidth={1.75} />
        </span>
      </span>
      <span className="theme-switch-label"><span className="ts-light">Light</span><span className="ts-dark">Dark</span></span>
    </button>
  );
}
