"use client"

import Image from "next/image"
import Script from "next/script"
import { imageSchema } from "@/lib/schema"

interface SchemaImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  contentUrl?: string
  sizes?: string
}

export function SchemaImage({ src, alt, width, height, className, priority, fill, contentUrl, sizes }: SchemaImageProps) {
  const schema = imageSchema({
    url: src,
    alt,
    width,
    height,
    contentUrl,
  })

  // Check if this is a Pinterest image - Pinterest images may need unoptimized loading
  const isPinterestImage = src.includes("i.pinimg.com")
  const useUnoptimized = isPinterestImage

  return (
    <>
      <Script id={`schema-${alt}`} type="application/ld+json">
        {JSON.stringify(schema)}
      </Script>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        fill={fill}
        sizes={sizes}
        unoptimized={useUnoptimized}
      />
    </>
  )
}
