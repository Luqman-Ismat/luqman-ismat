import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Technologies } from "@/components/technologies"
import { Projects } from "@/components/projects"
import { Footer } from "@/components/footer"
import { FadeIn } from "@/components/fade-in"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Luqman Ismat | Innovative Engineering Solutions",
  description:
    "Discover how Luqman Ismat, an engineering consultant from Katy and The Woodlands, TX, is revolutionizing the industry with AI-driven tools and cutting-edge solutions.",
}

export default function Home() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
        <h1 className="sr-only">Home | Luqman Ismat</h1>
        <Header />
        <main className="flex-1 w-full">
          <FadeIn>
            <Hero />
          </FadeIn>
          <FadeIn delay={0.2}>
            <Technologies />
          </FadeIn>
          <FadeIn delay={0.4}>
            <Projects />
          </FadeIn>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
