"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingScreen() {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited")
    if (hasVisited) {
      setIsFirstVisit(false)
      setIsLoading(false)
    } else {
      localStorage.setItem("hasVisited", "true")
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }
  }, [])

  if (!isFirstVisit) return null

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <span className="text-4xl md:text-6xl font-bold tracking-tighter text-white">LUQMAN ISMAT</span>
            <span className="text-2xl md:text-3xl font-bold text-white">©</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

