"use client"

import { useTheme } from "@/components/theme-provider"
import Image from "next/image"

interface ThemeAwareImageProps {
  lightSrc: string
  darkSrc: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
}

export function ThemeAwareImage({
  lightSrc,
  darkSrc,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false,
}: ThemeAwareImageProps) {
  const { theme } = useTheme()
  const src = theme === "dark" ? darkSrc : lightSrc

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
    />
  )
}
