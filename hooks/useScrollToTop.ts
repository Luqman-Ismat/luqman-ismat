"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Scroll to top on every client-side route change. Next.js does this
 * automatically for top-level navigations, but pages that render under a
 * persistent layout (e.g. when state survives a transition) can miss the
 * reset — this hook makes the behavior deterministic.
 */
export function useScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.hash) return // honor in-page anchors
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [pathname])
}
