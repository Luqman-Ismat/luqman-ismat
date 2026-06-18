import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Technologies } from "@/components/technologies"
import { Projects } from "@/components/projects"
import { RecentBlogs } from "@/components/recent-blogs"
import { Footer } from "@/components/footer"
import { FadeIn } from "@/components/fade-in"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Luqman Ismat — Engineering Consultant | Houston, Katy & The Woodlands, TX",
  description:
    "Luqman Ismat is an engineering consultant specializing in process engineering, EPC project lifecycle work, process safety, piping systems, and AI-driven tools for the engineering industry. Based in Katy, TX — serving Houston and The Woodlands.",
  keywords: [
    "Luqman Ismat",
    "Luqman Ismat engineer",
    "Luqman Ismat Houston",
    "Engineering Consultant Houston",
    "Process Engineering Texas",
    "EPC consultant",
    "Chemical Engineer Houston",
    "Process Safety Management",
    "Piping Systems Engineer",
    "Heat Exchanger Design",
    "Digital Twins engineer",
    "AI engineering tools",
    "Katy TX engineer",
    "The Woodlands engineer",
  ],
  alternates: { canonical: "https://www.luqmanismat.com" },
}

export default function Home() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
        <h1 className="sr-only">Home | Luqman Ismat</h1>
        <Header />
        <main id="main" className="flex-1 w-full">
          <Hero />
          <FadeIn>
            <Technologies />
          </FadeIn>
          <FadeIn delay={0.1}>
            <Projects />
          </FadeIn>
          <FadeIn delay={0.15}>
            <RecentBlogs />
          </FadeIn>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
