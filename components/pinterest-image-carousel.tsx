"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface PinterestImageCarouselProps {
  images: {
    src: string
    alt: string
    pinterestUrl: string
  }[]
  interval?: number
  className?: string
}

export function PinterestImageCarousel({ images, interval = 5000, className = "" }: PinterestImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Set up automatic rotation
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)

    // Clean up timer on unmount
    return () => clearInterval(timer)
  }, [images.length, interval])

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex].src || "/placeholder.svg"}
            alt={images[currentIndex].alt}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />

          {/* Hidden link for SEO purposes */}
          <Link
            href={images[currentIndex].pinterestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-0 right-0 opacity-0 pointer-events-none"
            aria-hidden="true"
          >
            View Luqman Ismat on Pinterest
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* SEO-friendly hidden section with Pinterest links */}
      <div className="sr-only">
        <p>Professional photos of Luqman Ismat, Engineering Consultant from Houston, TX</p>
        {images.map((image, index) => (
          <Link key={index} href={image.pinterestUrl} target="_blank" rel="noopener noreferrer">
            Luqman Ismat Professional Photo {index + 1} on Pinterest
          </Link>
        ))}
      </div>
    </div>
  )
}
