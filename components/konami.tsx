"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

// ↑ ↑ ↓ ↓ ← → ← → B A
const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const

const STORAGE_KEY = "lab-mode"

/**
 * Konami-code listener — toggles `html.lab-mode`, persists the choice in
 * localStorage, and announces it via a sonner toast. Pure visual flourish.
 */
export function Konami() {
  const [active, setActive] = useState(false)

  // Restore last state on mount.
  useEffect(() => {
    if (typeof window === "undefined") return
    const on = window.localStorage.getItem(STORAGE_KEY) === "1"
    if (on) {
      document.documentElement.classList.add("lab-mode")
      setActive(true)
    }
  }, [])

  // Listen for the sequence.
  useEffect(() => {
    let position = 0
    const onKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[position]
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (k === expected) {
        position += 1
        if (position === SEQUENCE.length) {
          position = 0
          setActive((prev) => {
            const next = !prev
            if (typeof document !== "undefined") {
              document.documentElement.classList.toggle("lab-mode", next)
            }
            if (typeof window !== "undefined") {
              window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
            }
            toast(next ? "Lab mode engaged ✦" : "Back to normal", {
              description: next
                ? "Enjoy the cosmetic flourishes. ↑↑↓↓←→←→BA again to disable."
                : "Standard mode restored.",
            })
            return next
          })
        }
      } else {
        position = k === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return null
}
