"use client"

import { useEffect, useRef } from "react"

/**
 * Soft radial spotlight that follows the cursor on desktop.
 * Sticks behind everything (z-0) and respects prefers-reduced-motion + coarse pointers.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    const el = ref.current
    if (!el) return
    el.style.opacity = "1"

    let raf = 0
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
    }
    const tick = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      el.style.transform = `translate3d(${cx - 250}px, ${cy - 250}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener("mousemove", onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle at center, hsl(var(--foreground) / 0.06), transparent 60%)",
        mixBlendMode: "plus-lighter",
      }}
    />
  )
}
