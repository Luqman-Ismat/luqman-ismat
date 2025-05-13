import type { Metadata } from "next"
import AboutContent from "./about-content"

export const metadata: Metadata = {
  title: "About Luqman Ismat | Engineering Consultant from Katy, TX",
  description:
    "Learn about Luqman Ismat, an innovative engineering consultant from Katy and The Woodlands, TX, with expertise in process engineering, AI-driven solutions, and a passion for technology.",
}

export default function AboutPage() {
  return <AboutContent />
}
