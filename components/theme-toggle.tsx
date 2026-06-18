"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-sm backdrop-blur-md transition hover:scale-105 hover:border-border focus-visible:scale-105"
    >
      <Sun
        className="h-4 w-4 transition-all"
        style={{
          opacity: mounted ? (isDark ? 0 : 1) : 1,
          transform: mounted && isDark ? "rotate(-90deg) scale(0)" : "rotate(0) scale(1)",
          position: mounted && isDark ? "absolute" : "static",
        }}
      />
      {mounted && (
        <Moon
          className="h-4 w-4 transition-all"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0) scale(1)" : "rotate(90deg) scale(0)",
            position: isDark ? "static" : "absolute",
          }}
        />
      )}
    </button>
  )
}
