"use client"

import { useEffect, useState } from "react"

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  })

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return
    }

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find((entry) => entry.name === "first-contentful-paint")
      if (fcpEntry) {
        setMetrics((prev) => ({ ...prev, fcp: fcpEntry.startTime }))
      }
    })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }))
      }
    })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime
          setMetrics((prev) => ({ ...prev, fid }))
        }
      })
    })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      setMetrics((prev) => ({ ...prev, cls: clsValue }))
    })

    try {
      fcpObserver.observe({ entryTypes: ["paint"] })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
      fidObserver.observe({ entryTypes: ["first-input"] })
      clsObserver.observe({ entryTypes: ["layout-shift"] })
    } catch (error) {
      console.warn("Performance Observer not supported:", error)
    }

    // Time to First Byte
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart
      setMetrics((prev) => ({ ...prev, ttfb }))
    }

    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  const logMetrics = () => {
    if (process.env.NODE_ENV === "development") {
      console.group("🚀 Performance Metrics")
      console.log("First Contentful Paint:", metrics.fcp?.toFixed(2) + "ms")
      console.log("Largest Contentful Paint:", metrics.lcp?.toFixed(2) + "ms")
      console.log("First Input Delay:", metrics.fid?.toFixed(2) + "ms")
      console.log("Cumulative Layout Shift:", metrics.cls?.toFixed(4))
      console.log("Time to First Byte:", metrics.ttfb?.toFixed(2) + "ms")
      console.groupEnd()
    }
  }

  return { metrics, logMetrics }
}

