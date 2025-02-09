"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

export function AnimatedLogo() {
  const logoRef = useRef<HTMLDivElement>(null)
  const restOfNameRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const restOfName = restOfNameRef.current

    if (!restOfName) return

    gsap.set(restOfName, { width: 0, opacity: 0 })

    const tl = gsap.timeline({ paused: true })
    tl.to(restOfName, {
      width: "auto",
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    })

    const logo = logoRef.current
    if (!logo) return

    logo.addEventListener("mouseenter", () => tl.play())
    logo.addEventListener("mouseleave", () => tl.reverse())

    return () => {
      if (logo) {
        logo.removeEventListener("mouseenter", () => tl.play())
        logo.removeEventListener("mouseleave", () => tl.reverse())
      }
    }
  }, [])

  return (
    <Link href="/" className="text-xl font-bold tracking-tight">
      <div ref={logoRef} className="overflow-hidden whitespace-nowrap">
        <span className="inline-block">L</span>
        <span ref={restOfNameRef} className="inline-block">
          UQMAN ISMAT
        </span>
      </div>
    </Link>
  )
}

