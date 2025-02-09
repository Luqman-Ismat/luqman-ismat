import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Technologies } from "@/components/technologies"
import { Projects } from "@/components/projects"
import { Footer } from "@/components/footer"
import { ScrollFadeSection } from "@/components/scroll-fade-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <ScrollFadeSection>
        <Hero />
      </ScrollFadeSection>
      <ScrollFadeSection>
        <About />
      </ScrollFadeSection>
      <ScrollFadeSection>
        <Technologies />
      </ScrollFadeSection>
      <ScrollFadeSection>
        <Projects />
      </ScrollFadeSection>
      <Footer />
    </main>
  )
}

