"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { isAfterSunset } from "@/utils/isAfterSunset"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage or based on time of day
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      // Check if there's a user preference in localStorage
      const savedTheme = localStorage.getItem("theme") as Theme | null
      if (savedTheme) {
        return savedTheme
      }
      // If no saved preference, set based on time of day
      return isAfterSunset() ? "dark" : "light"
    }
    return "light" // Default to light theme on the server
  })

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  // Check time of day periodically and update theme if no user preference
  useEffect(() => {
    const checkTime = () => {
      // Only update theme automatically if there's no user preference
      if (!localStorage.getItem("userPreference")) {
        const newTheme = isAfterSunset() ? "dark" : "light"
        setTheme(newTheme)
      }
    }

    // Check time every minute
    const interval = setInterval(checkTime, 60000)

    // Initial check
    checkTime()

    return () => clearInterval(interval)
  }, [])

  // Modified setTheme function to track user preference
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    // When user manually changes theme, store that preference
    localStorage.setItem("userPreference", "true")
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
