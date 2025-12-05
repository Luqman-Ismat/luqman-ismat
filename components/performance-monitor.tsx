"use client"

import { usePerformance } from "@/hooks/usePerformance"
import { useEffect } from "react"

export function PerformanceMonitor() {
  const { metrics, logMetrics } = usePerformance()

  useEffect(() => {
    // Log metrics after a delay to ensure all metrics are collected
    const timer = setTimeout(() => {
      logMetrics()
    }, 3000)

    return () => clearTimeout(timer)
  }, [logMetrics])

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono opacity-50 hover:opacity-100 transition-opacity">
      <div>FCP: {metrics.fcp?.toFixed(0) || "—"}ms</div>
      <div>LCP: {metrics.lcp?.toFixed(0) || "—"}ms</div>
      <div>FID: {metrics.fid?.toFixed(0) || "—"}ms</div>
      <div>CLS: {metrics.cls?.toFixed(3) || "—"}</div>
    </div>
  )
}

