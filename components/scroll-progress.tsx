"use client"

import { useEffect, useRef } from "react"

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null)
  const ticking = useRef(false)

  useEffect(() => {
    const update = () => {
      ticking.current = false
      const el = ref.current
      if (!el) return
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      const pct = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      el.style.transform = `scaleX(${pct})`
    }
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
    >
      <div
        ref={ref}
        className="h-full origin-left bg-foreground/80 will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  )
}
