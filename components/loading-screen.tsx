"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingScreen() {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited")
    if (hasVisited) {
      setIsFirstVisit(false)
      setIsLoading(false)
    } else {
      localStorage.setItem("hasVisited", "true")
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setIsLoading(false), 500)
            return 100
          }
          return prev + 2
        })
      }, 20)
      return () => clearInterval(interval)
    }
  }, [])

  if (!isFirstVisit) return null

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-end justify-end bg-black p-8"
        >
          <div className="relative text-4xl md:text-6xl font-bold tracking-tighter">
            <span className="text-gray-500">LUQMAN ISMAT</span>
            <motion.span
              className="absolute inset-0 overflow-hidden text-white"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
            >
              LUQMAN ISMAT
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
