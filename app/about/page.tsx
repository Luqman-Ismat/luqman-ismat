import type { Metadata } from "next"
import AboutContent from "./about-content"
import { PinterestSEOSchema } from "@/components/pinterest-seo-schema"

export const metadata: Metadata = {
  title: "About Luqman Ismat | Engineering Consultant from Katy, TX",
  description:
    "Learn about Luqman Ismat, an innovative engineering consultant from Katy and The Woodlands, TX, with expertise in process engineering, AI-driven solutions, and a passion for technology.",
}

export default function AboutPage() {
  // Define the images for SEO (reordered with second one first)
  const pinterestImages = [
    {
      src: "https://i.pinimg.com/736x/de/d1/da/ded1da222ee31e40ad985513ffb35799.jpg",
      alt: "Luqman Ismat - Professional Engineering Consultant Portrait",
      pinterestUrl: "https://pin.it/2bRrLGaUT",
    },
    {
      src: "https://i.pinimg.com/736x/65/2d/16/652d1620792c085900cf03ecb6c362f3.jpg",
      alt: "Luqman Ismat - Houston Engineering Professional in Parking Garage",
      pinterestUrl: "https://pin.it/71KvIu9pj",
    },
    {
      src: "https://i.pinimg.com/736x/e0/17/3e/e0173ed925f2030d28ac349117d2ab83.jpg",
      alt: "Luqman Ismat - Engineering Consultant Professional Headshot",
      pinterestUrl: "https://pin.it/6t0Wpvt9g",
    },
    {
      src: "https://i.pinimg.com/736x/f5/97/e3/f597e3806878f2a071ad41662e9b6497.jpg",
      alt: "Luqman Ismat - Katy TX Engineering Professional",
      pinterestUrl: "https://pin.it/5xVidZ3Af",
    },
    {
      src: "https://i.pinimg.com/736x/e8/50/c2/e850c2bf57e24a459a32da6789c0b40d.jpg",
      alt: "Luqman Ismat - Process Engineering Specialist Houston",
      pinterestUrl: "https://pin.it/5xVidZ3Af",
    },
  ]

  return (
    <>
      <PinterestSEOSchema
        images={pinterestImages}
        name="Luqman Ismat"
        description="Engineering consultant from Houston, TX specializing in process engineering and AI-driven solutions for the EPC industry."
      />
      <AboutContent />
    </>
  )
}
