import Image from "next/image"
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

export function SchemaImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  fill,
  contentUrl,
  sizes,
}: SchemaImageProps) {
  const schema = imageSchema({ url: src, alt, width, height, contentUrl })
  const isPinterestImage = src.includes("i.pinimg.com")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        fill={fill}
        sizes={sizes}
        unoptimized={isPinterestImage}
      />
    </>
  )
}
