const SITE = "https://www.luqmanismat.com"
const PERSON_ID = `${SITE}/#person`
const SERVICE_ID = `${SITE}/#service`

export const PERSON = {
  "@type": "Person" as const,
  "@id": PERSON_ID,
  name: "Luqman Ismat",
  alternateName: ["Luqman M. Ismat", "Luqman Mukhtar Ismat"],
  jobTitle: "Engineering Consultant",
  url: SITE,
  image: `${SITE}/og-image.jpg`,
  sameAs: [
    "https://www.linkedin.com/in/luqman-ismat/",
    "https://x.com/LuqmanMIsmat",
    "https://github.com/Luqman-Ismat",
    "https://www.pinterest.com/luqmanismat/",
  ],
  knowsAbout: [
    "Process Engineering",
    "Chemical Engineering",
    "EPC Industry",
    "Oil & Gas",
    "AI-driven Solutions",
    "Process Safety Management",
    "HAZOP Studies",
    "Piping Systems Design",
    "Heat Exchanger Design",
    "Process Simulation",
    "Engineering Innovation",
    "Digital Twins",
  ],
  worksFor: { "@type": "Organization", name: "Independent Consultant" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Katy",
    addressRegion: "TX",
    addressCountry: "US",
  },
}

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
  author: { "@type": "Person", name: "Luqman Ismat", url: SITE },
  copyrightHolder: { "@type": "Person", name: "Luqman Ismat", url: SITE },
  license: SITE,
  acquireLicensePage: `${SITE}/contact`,
})

export const articleSchema = (a: {
  title: string
  description: string
  url: string
  image: string
  datePublished: string
  dateModified?: string
  category?: string
  keywords?: string[]
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  mainEntityOfPage: { "@type": "WebPage", "@id": a.url },
  headline: a.title,
  description: a.description,
  image: [a.image],
  datePublished: a.datePublished,
  dateModified: a.dateModified || a.datePublished,
  articleSection: a.category,
  keywords: a.keywords?.join(", "),
  inLanguage: "en-US",
  isAccessibleForFree: true,
  author: PERSON,
  creator: PERSON,
  publisher: {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Luqman Ismat",
    url: SITE,
    logo: { "@type": "ImageObject", url: `${SITE}/og-image.jpg` },
  },
})

export const breadcrumbSchema = (
  crumbs: Array<{ name: string; url: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: c.url,
  })),
})

export const personSchema = () => ({
  "@context": "https://schema.org",
  ...PERSON,
})

export const professionalServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": SERVICE_ID,
  name: "Luqman Ismat Engineering Consulting",
  founder: PERSON,
  url: SITE,
  image: `${SITE}/og-image.jpg`,
  priceRange: "$$",
  areaServed: [
    { "@type": "City", name: "Houston" },
    { "@type": "City", name: "Katy" },
    { "@type": "City", name: "The Woodlands" },
    { "@type": "State", name: "Texas" },
  ],
  serviceType: [
    "Process Engineering",
    "Chemical Engineering",
    "EPC Consulting",
    "Process Safety Management",
    "Engineering Design",
    "AI Solutions",
  ],
})

export const itemListSchema = (
  items: Array<{ name: string; url: string; description?: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: it.url,
    name: it.name,
    description: it.description,
  })),
})
