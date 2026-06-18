"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface TiltProps {
  children: ReactNode
  className?: string
  /** Maximum tilt angle in degrees (default 6). */
  maxTilt?: number
  /** Maximum 3D translation along z, px (default 0). */
  perspective?: number
}

/**
 * Subtle perspective tilt that tracks the cursor over the element.
 * Honors prefers-reduced-motion and coarse pointers.
 */
export function Tilt({ children, className, maxTilt = 6, perspective = 700 }: TiltProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    let raf = 0
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      const rx = (0.5 - py) * maxTilt * 2 // up = positive
      const ry = (px - 0.5) * maxTilt * 2
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      })
    }
    const reset = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`
      })
    }
    el.style.transition = "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)"
    el.style.willChange = "transform"
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", reset)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", reset)
      el.style.transform = ""
      el.style.transition = ""
      el.style.willChange = ""
    }
  }, [maxTilt, perspective])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
