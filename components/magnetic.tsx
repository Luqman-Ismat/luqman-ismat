"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface MagneticProps {
  children: ReactNode
  className?: string
  /** Maximum pixel offset toward the cursor (default 12). */
  strength?: number
}

/**
 * Wraps an element so it nudges toward the cursor on hover.
 * Becomes a no-op for users with prefers-reduced-motion or coarse pointers.
 */
export function Magnetic({ children, className, strength = 12 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    let raf = 0
    const child = el.firstElementChild as HTMLElement | null
    if (!child) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      // clamp by the larger of half-width/height so very wide buttons don't shoot
      const max = Math.max(rect.width, rect.height) / 2
      const tx = (dx / max) * strength
      const ty = (dy / max) * strength
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        child.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
      })
    }
    const reset = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        child.style.transform = "translate3d(0,0,0)"
      })
    }
    child.style.transition = "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)"
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", reset)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", reset)
      child.style.transform = ""
      child.style.transition = ""
    }
  }, [strength])

  return (
    <span ref={ref} className={`inline-block ${className ?? ""}`.trim()}>
      {children}
    </span>
  )
}
