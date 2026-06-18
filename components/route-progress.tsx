"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

/**
 * Top-of-page progress bar that runs from 0 → 80% while navigation is in
 * flight, then snaps to 100% on the next paint after the route changes.
 * Listens for clicks on internal next/link anchors as the "navigation start"
 * signal — App Router doesn't expose a navigation observable in 14.x.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const interval = useRef<number | null>(null)
  const hideTimer = useRef<number | null>(null)

  // When the path/search changes, finish the bar.
  useEffect(() => {
    if (!visible) return
    setProgress(100)
    if (interval.current) {
      window.clearInterval(interval.current)
      interval.current = null
    }
    hideTimer.current = window.setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 280)
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Start the bar on same-origin link clicks (capture phase so we precede Next's handler).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const a = target?.closest("a") as HTMLAnchorElement | null
      if (!a || !a.href) return
      if (a.target && a.target !== "_self") return
      if (a.hasAttribute("download")) return
      try {
        const url = new URL(a.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
      } catch {
        return
      }
      start()
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  const start = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    setVisible(true)
    setProgress(8)
    if (interval.current) window.clearInterval(interval.current)
    interval.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 80) return p
        // ease toward 80
        const next = p + Math.max(0.5, (80 - p) * 0.08)
        return Math.min(80, next)
      })
    }, 100)
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease-out" }}
    >
      <div
        className="h-full origin-left bg-foreground"
        style={{
          transform: `scaleX(${progress / 100})`,
          transition: "transform 200ms ease-out",
          boxShadow: "0 0 12px hsl(var(--foreground) / 0.5)",
        }}
      />
    </div>
  )
}
