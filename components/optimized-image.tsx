"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  loading?: "lazy" | "eager"
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  placeholder = "blur",
  blurDataURL,
  loading,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = 
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='none' style='filter: url(%23b);' href='data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='/%3E%3C/svg%3E"

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={fill ? undefined : { width, height }}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  // Determine if we should use lazy loading
  const shouldLazyLoad = !priority && loading !== "eager"
  
  // Check if this is a Pinterest image - Pinterest images may need unoptimized loading
  const isPinterestImage = src.includes("i.pinimg.com")
  
  // For Pinterest images, use unoptimized to avoid CORS/hotlink protection issues
  const useUnoptimized = isPinterestImage

  return (
    <div className={cn("relative overflow-hidden", fill ? "w-full h-full" : "", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted/50 animate-pulse"
          style={fill ? undefined : { width, height }}
          aria-hidden="true"
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={cn(
          "transition-opacity duration-500 ease-in-out",
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder === "blur" && !useUnoptimized ? "blur" : "empty"}
        blurDataURL={blurDataURL || (placeholder === "blur" && !useUnoptimized ? defaultBlurDataURL : undefined)}
        onLoad={handleLoad}
        onError={handleError}
        loading={shouldLazyLoad ? "lazy" : undefined}
        unoptimized={useUnoptimized}
      />
    </div>
  )
}

