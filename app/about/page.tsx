import type { Metadata } from "next"
import AboutContent from "./about-content"
import { PinterestSEOSchema } from "@/components/pinterest-seo-schema"
import { personSchema, breadcrumbSchema } from "@/lib/schema"

export const metadata: Metadata = {
  title: "About Luqman Ismat — Engineering Consultant in Houston, Katy & The Woodlands",
  description:
    "Meet Luqman Ismat: process engineer, EPC consultant, and creator of AI-driven engineering tools, based in Katy and serving Houston and The Woodlands, Texas.",
  keywords: [
    "Luqman Ismat",
    "Luqman Ismat biography",
    "Luqman Ismat engineer",
    "Engineering Consultant Houston",
    "Process Engineer Katy TX",
    "EPC consultant Texas",
    "Chemical Engineer Houston",
    "Process Safety Lead",
    "AI in engineering",
    "Piping Systems Engineer",
  ],
  alternates: { canonical: "https://www.luqmanismat.com/about" },
  openGraph: {
    type: "profile",
    url: "https://www.luqmanismat.com/about",
    title: "About Luqman Ismat — Engineering Consultant",
    description:
      "Process engineer and EPC consultant Luqman Ismat — building AI-driven tools to reshape how engineering projects are designed, planned, and delivered.",
    images: [
      {
        url: "https://www.luqmanismat.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luqman Ismat — Engineering Consultant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Luqman Ismat — Engineering Consultant",
    description: "Process engineer, EPC consultant, AI builder. Houston, TX.",
    images: ["https://www.luqmanismat.com/og-image.jpg"],
  },
}

export default function AboutPage() {
  // Define the images for SEO (reordered with second one first)
  const pinterestImages = [
    {
      src: "https://i.pinimg.com/736x/de/d1/da/ded1da222ee31e40ad985513ffb35799.jpg",
      alt: "Luqman Ismat, Engineering Consultant, Katy Texas - Professional Portrait",
      pinterestUrl: "https://pin.it/2bRrLGaUT",
    },
    {
      src: "https://i.pinimg.com/736x/65/2d/16/652d1620792c085900cf03ecb6c362f3.jpg",
      alt: "Luqman Ismat, Process Engineering Consultant, Houston TX - Professional in Parking Garage",
      pinterestUrl: "https://pin.it/71KvIu9pj",
    },
    {
      src: "https://i.pinimg.com/736x/e0/17/3e/e0173ed925f2030d28ac349117d2ab83.jpg",
      alt: "Luqman Ismat, Engineering Consultant, Houston Texas - Professional Headshot",
      pinterestUrl: "https://pin.it/6t0Wpvt9g",
    },
    {
      src: "https://i.pinimg.com/736x/f5/97/e3/f597e3806878f2a071ad41662e9b6497.jpg",
      alt: "Luqman Ismat, Engineering Consultant, Katy TX - Professional Photo",
      pinterestUrl: "https://pin.it/5xVidZ3Af",
    },
    {
      src: "https://i.pinimg.com/736x/e8/50/c2/e850c2bf57e24a459a32da6789c0b40d.jpg",
      alt: "Luqman Ismat, Process Engineering Consultant, Houston TX - Professional Image",
      pinterestUrl: "https://pin.it/5xVidZ3Af",
    },
  ]

  const person = personSchema()
  const crumbs = breadcrumbSchema([
    { name: "Home", url: "https://www.luqmanismat.com" },
    { name: "About Luqman Ismat", url: "https://www.luqmanismat.com/about" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <PinterestSEOSchema
        images={pinterestImages}
        name="Luqman Ismat"
        description="Engineering consultant from Houston, TX specializing in process engineering and AI-driven solutions for the EPC industry."
      />
      <AboutContent />
    </>
  )
}
