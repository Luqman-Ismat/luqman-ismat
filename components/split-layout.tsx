"use client"

import Image from "next/image"
import type React from "react"

interface SplitLayoutProps {
  children: React.ReactNode
}

export function SplitLayout({ children }: SplitLayoutProps) {
  return (
    <div className="relative flex flex-col md:flex-row min-h-screen">
      {/* Left side - Image */}
      <div className="hidden md:block md:w-1/2 md:fixed md:left-0 md:top-0 md:bottom-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/justin-wolff-4wjsEDOwapo-unsplash.jpg-yqBchAIp3OP880B9Dw59UUVSIZWt1W.jpeg"
          alt="Water wall with trees"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Content */}
      <div className="w-full md:w-1/2 md:ml-[50%] bg-background">{children}</div>
    </div>
  )
}
