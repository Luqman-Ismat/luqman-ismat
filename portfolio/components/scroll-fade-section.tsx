"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type React from "react"

interface ScrollFadeSectionProps {
  children: React.ReactNode
  className?: string
}

export function ScrollFadeSection({ children, className = "" }: ScrollFadeSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 1], [0, 50])

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        scale,
        y,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

