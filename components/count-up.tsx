"use client"

import { useEffect, useRef, useState } from "react"

interface CountUpProps {
  /** Target number to count to. */
  to: number
  /** Decimal places to render. */
  decimals?: number
  /** Duration in ms. */
  duration?: number
  /** Optional suffix (e.g. "+", "%", "k"). */
  suffix?: string
  /** Optional prefix (e.g. "$"). */
  prefix?: string
  className?: string
  /** Locale for number formatting. */
  locale?: string
}

/**
 * Counts from 0 → `to` once the element enters the viewport.
 * No-ops on prefers-reduced-motion (renders the final number immediately).
 */
export function CountUp({
  to,
  decimals = 0,
  duration = 1400,
  suffix = "",
  prefix = "",
  className,
  locale = "en-US",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === "undefined") return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setValue(to)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration)
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3)
              setValue(to * eased)
              if (t < 1) requestAnimationFrame(tick)
              else setValue(to)
            }
            requestAnimationFrame(tick)
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
