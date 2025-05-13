"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import type React from "react" // Added import for React

interface ScrollAnimationProps {
  children: React.ReactNode
  delay?: number
}

export function ScrollAnimation({ children, delay = 0 }: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start bottom", "end top"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <motion.div ref={ref} initial={{ y: 100, opacity: 0 }} style={{ y, opacity }} transition={{ delay }}>
      {children}
    </motion.div>
  )
}
