"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Translation range in pixels at the extremes of the scroll window. Positive
   *  values mean the content moves UP as the user scrolls down. */
  range?: number
  /** Direction: "y" (default) translates vertically; "x" horizontally. */
  axis?: "x" | "y"
}

/**
 * Scroll-driven parallax. Computes a progress value (0→1) based on where the
 * element sits in the viewport, then translates the inner element accordingly.
 * Uses requestAnimationFrame + a single IntersectionObserver so the listener
 * is dormant when off-screen. No-op on prefers-reduced-motion.
 */
export function Parallax({ children, className, range = 60, axis = "y" }: ParallaxProps) {
  const outerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    let active = false

    const update = () => {
      raf = 0
      const rect = outer.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      // Progress: 0 when element bottom is at viewport top, 1 when top at bottom.
      const centerOffset = rect.top + rect.height / 2 - vh / 2
      const denom = (vh + rect.height) / 2
      const progress = Math.max(-1, Math.min(1, -centerOffset / denom))
      const offset = progress * range
      inner.style.transform =
        axis === "y"
          ? `translate3d(0, ${offset.toFixed(2)}px, 0)`
          : `translate3d(${offset.toFixed(2)}px, 0, 0)`
    }

    const schedule = () => {
      if (!active || raf) return
      raf = requestAnimationFrame(update)
    }

    const onScroll = () => schedule()
    const onResize = () => schedule()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          active = entry.isIntersecting
          if (active) schedule()
        }
      },
      { threshold: 0 },
    )
    io.observe(outer)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [range, axis])

  return (
    <div ref={outerRef} className={className}>
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  )
}
