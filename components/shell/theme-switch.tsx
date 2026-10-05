"use client";
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
          <svg className="ts-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></svg>
          <svg className="ts-moon" viewBox="0 0 24 24"><path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" /></svg>
        </span>
      </span>
      <span className="theme-switch-label"><span className="ts-light">Light</span><span className="ts-dark">Dark</span></span>
    </button>
  );
}
