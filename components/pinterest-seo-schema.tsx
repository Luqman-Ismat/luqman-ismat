"use client"

import Script from "next/script"

interface PinterestSEOSchemaProps {
  images: {
    src: string
    alt: string
    pinterestUrl: string
  }[]
  name: string
  description: string
}

export function PinterestSEOSchema({ images, name, description }: PinterestSEOSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    description: description,
    image: images.map((img) => img.src),
    sameAs: images.map((img) => img.pinterestUrl),
  }

  return (
    <Script id="pinterest-schema" type="application/ld+json">
      {JSON.stringify(schema)}
    </Script>
  )
}
