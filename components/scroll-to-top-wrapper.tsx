"use client"

import { useScrollToTop } from "@/hooks/useScrollToTop"
import type React from "react"

export function ScrollToTopWrapper({ children }: { children: React.ReactNode }) {
  useScrollToTop()

  return <>{children}</>
}
