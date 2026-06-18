"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** Spotlight color expressed as `<H> <S>% <L>%` (HSL) or any CSS color. */
  color?: string
  /** Spotlight radius in pixels. */
  size?: number
}

/**
 * Wraps a card so a soft radial glow tracks the cursor while it's inside.
 * Pure CSS animation driven by CSS custom properties — JS only updates --x/--y.
 * No-op on coarse pointers and prefers-reduced-motion.
 */
export function SpotlightCard({
  children,
  className,
  color = "hsl(var(--foreground) / 0.12)",
  size = 320,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--spot-x", `${x}px`)
        el.style.setProperty("--spot-y", `${y}px`)
        el.style.setProperty("--spot-opacity", "1")
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--spot-opacity", "0")
      })
    }

    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className ?? ""}`.trim()}
      style={
        {
          ["--spot-size"]: `${size}px`,
          ["--spot-color"]: color,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
