"use client"

import Image from "next/image"
import type React from "react" // Added import for React

interface PageLayoutProps {
  children: React.ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Fixed Image */}
      <div className="hidden md:block fixed left-0 top-0 w-1/2 h-screen">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/justin-wolff-4wjsEDOwapo-unsplash.jpg-yqBchAIp3OP880B9Dw59UUVSIZWt1W.jpeg"
          alt="Water wall with trees"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Scrollable Content */}
      <div className="w-full md:w-1/2 md:ml-[50%]">{children}</div>
    </div>
  )
}
