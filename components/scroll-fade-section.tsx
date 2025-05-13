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

  const opacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0.3, 0.8], [1, 0.98])

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className={className}>
      {children}
    </motion.div>
  )
}
