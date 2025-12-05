"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LoadingScreen() {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  const handleProgressUpdate = useCallback(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        setTimeout(() => setIsLoading(false), 500)
        return 100
      }
      return prev + 2
    })
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Only run on client side
    if (typeof window === "undefined") {
      setIsFirstVisit(false)
      setIsLoading(false)
      return
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setIsFirstVisit(false)
      setIsLoading(false)
      return
    }

    const hasVisited = localStorage.getItem("hasVisited")
    if (hasVisited) {
      setIsFirstVisit(false)
      setIsLoading(false)
      return
    }

    // First visit - show loading animation
    localStorage.setItem("hasVisited", "true")
    const interval = setInterval(handleProgressUpdate, 20)
    
    // Safety timeout to ensure loading screen doesn't get stuck
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [handleProgressUpdate])

  // Don't render until mounted to avoid hydration issues
  if (!mounted || !isFirstVisit) return null

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-end justify-end bg-black p-8"
          role="status"
          aria-label="Loading website"
        >
          <div className="relative text-4xl md:text-6xl font-bold tracking-tighter">
            <span className="text-gray-500" aria-hidden="true">LUQMAN ISMAT</span>
            <motion.span
              className="absolute inset-0 overflow-hidden text-white"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              aria-hidden="true"
            >
              LUQMAN ISMAT
            </motion.span>
          </div>
          <div className="sr-only">Loading website content...</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
