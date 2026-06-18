"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Hand-drawn-style signature. Renders an SVG whose strokes draw in via
 * stroke-dasharray when the element enters the viewport.
 * Decorative — a visually-hidden span carries the spoken name.
 */
export function Signature({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [draw, setDraw] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDraw(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDraw(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <span className={className}>
      <span className="sr-only">Luqman Ismat</span>
      <svg
        ref={ref}
        viewBox="0 0 480 110"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="block h-14 md:h-16 w-auto text-foreground"
      >
        {/* The path data is a stylized cursive of "Luqman Ismat". */}
        <path
          className={draw ? "sig-draw" : ""}
          style={{ ["--sig-len" as string]: "1100" } as React.CSSProperties}
          d="M16 70
             c 6 -22, 14 -42, 22 -42
             c 6 0, 4 28, 8 28
             c 4 0, 6 -18, 10 -18
             c 4 0, 6 24, 10 24
             c 6 0, 14 -24, 22 -24
             c 6 0, 4 26, 12 26
             c 6 0, 8 -10, 8 -20
             c 0 -8, -6 -4, -6 6
             c 0 8, 12 16, 22 16
             m 0 0
             c 6 0, 14 -18, 20 -28
             c 6 -8, 6 4, 6 14
             c 0 6, -4 14, -4 14
             c 8 -2, 14 -18, 22 -18
             c 6 0, 6 22, 12 22
             c 6 0, 12 -18, 20 -18
             c 6 0, 4 18, 10 18
             m 12 -2
             c -8 14, -22 6, -14 -8
             c 6 -10, 22 -8, 28 6
             m 24 4
             c -6 -16, 12 -28, 18 -8
             m 12 -10
             c 8 -16, 10 6, 14 6
             c 6 0, 10 -22, 16 -22
             c 6 0, 4 22, 12 22
             c 6 0, 10 -10, 12 -18
             c 2 -8, 4 8, 12 8
             m 14 -2
             c -8 14, -22 6, -14 -8
             c 6 -10, 22 -8, 28 6
             m 14 6
             c -2 -16, 4 -24, 12 -24
             c 6 0, 4 24, 10 24
             m 14 0
             l 16 -34
             m -8 16
             h 18"
          pathLength={1100}
          strokeDasharray={1100}
          strokeDashoffset={1100}
        />
      </svg>
      <style jsx>{`
        .sig-draw {
          animation: sig-draw 2200ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        @keyframes sig-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </span>
  )
}
