"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface StaggerOnViewProps {
  children: ReactNode
  className?: string
  /** Delay between children in ms. */
  step?: number
  /** Additional offset before any child starts, in ms. */
  baseDelay?: number
  /** Selector for the staggered children inside the wrapper. Default ">*". */
  selector?: string
  /** Only animate once per page load (default true). */
  once?: boolean
  /** IntersectionObserver root margin. */
  rootMargin?: string
  /** Render element. Defaults to "div"; use "ul"/"ol" when children are <li>. */
  as?: "div" | "ul" | "ol" | "section"
  /** Forwarded role (e.g. "list" when as="ul" semantically). */
  role?: string
}

/**
 * Wraps a grid or list so its direct children fade/rise into view with a
 * stagger, driven by IntersectionObserver. No JS animation loop, no framer.
 * Children must accept the `.reveal` utility (defined in globals.css) — which
 * keys off the `--reveal-delay` custom property.
 */
export function StaggerOnView({
  children,
  className,
  step = 90,
  baseDelay = 0,
  selector = ":scope > *",
  once = true,
  rootMargin = "-80px",
  as: Tag = "div",
  role,
}: StaggerOnViewProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = Array.from(el.querySelectorAll<HTMLElement>(selector))
    if (!targets.length) return

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Prime each child as hidden + assign its stagger delay.
    targets.forEach((t, i) => {
      t.style.setProperty("--reveal-delay", `${baseDelay + i * step}ms`)
      if (!prefersReduced) {
        t.style.opacity = "0"
        t.style.transform = "translate3d(0, 16px, 0)"
        t.style.willChange = "opacity, transform"
      }
    })

    if (prefersReduced) {
      targets.forEach((t) => {
        t.style.opacity = ""
        t.style.transform = ""
      })
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal")
            // Reset inline opacity/transform so the .reveal animation owns them
            ;(entry.target as HTMLElement).style.opacity = ""
            ;(entry.target as HTMLElement).style.transform = ""
            if (once) io.unobserve(entry.target)
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [step, baseDelay, selector, once, rootMargin])

  return (
    <Tag
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      className={className}
      role={role}
    >
      {children}
    </Tag>
  )
}
