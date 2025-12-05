export const imageSchema = (image: {
  url: string
  alt: string
  width?: number
  height?: number
  contentUrl?: string
}) => ({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  name: image.alt,
  description: image.alt,
  contentUrl: image.contentUrl || image.url,
  url: image.url,
  width: image.width || "auto",
  height: image.height || "auto",
  author: {
    "@type": "Person",
    name: "Luqman Ismat",
    url: "https://www.luqmanismat.com",
  },
  copyrightHolder: {
    "@type": "Person",
    name: "Luqman Ismat",
    url: "https://www.luqmanismat.com",
  },
  license: "https://www.luqmanismat.com",
  acquireLicensePage: "https://www.luqmanismat.com/contact",
})
