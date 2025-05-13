"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

export function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fullNameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const letters = fullNameRef.current?.querySelectorAll(".letter")
    if (!letters) return

    // Initial state
    gsap.set(fullNameRef.current, { width: 0 })
    gsap.set(letters, {
      x: -20,
      opacity: 0,
    })

    const tl = gsap.timeline({ paused: true })

    // Animation for hover
    tl.to(fullNameRef.current, {
      width: "auto",
      duration: 0.3,
      ease: "power2.out",
    }).to(
      letters,
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
      },
      "-=0.2",
    )

    // Hover events
    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", () => tl.play())
      container.addEventListener("mouseleave", () => tl.reverse())
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", () => tl.play())
        container.removeEventListener("mouseleave", () => tl.reverse())
      }
    }
  }, [])

  return (
    <Link href="/" className="text-xl font-bold tracking-tight">
      <div ref={containerRef} className="flex overflow-hidden whitespace-nowrap">
        <span className="inline-block">L </span>
        <div ref={fullNameRef} className="inline-block overflow-hidden">
          {"UQMAN  ISMAT".split("").map((letter, index) => (
            <span key={index} className="letter inline-block">
              {letter}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
