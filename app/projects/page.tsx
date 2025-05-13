import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import Link from "next/link"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Projects | Luqman Ismat Engineering",
  description:
    "Explore innovative engineering projects by Luqman Ismat, including iNNOVARi and ENGiVAULT, showcasing cutting-edge solutions in the EPC industry from Katy, TX.",
}

export default function ProjectsPage() {
  const projects = [
    {
      title: "iNNOVARi",
      description: "Revolutionizing EPC project management through integrated software solutions.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-09%20223633-L5Zp9zeIRxUhc7GlhYDAi36HqEzNNR.png",
      link: "/projects/innovari",
    },
    {
      title: "ENGiVAULT",
      description: "The next generation of engineering knowledge sharing and collaboration.",
      image: "/images/engivault-logo-mark.png",
      link: "/projects/engivault",
    },
  ]

  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-16">
          <section className="py-20 md:py-28">
            <div className="container px-4">
              <AnimatedHeader>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8">PROJECTS</h1>
              </AnimatedHeader>
              <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground max-w-4xl mb-20">
                Innovative solutions reshaping the future of engineering technology.
              </p>
            </div>
          </section>

          <section className="relative">
            {projects.map((project, index) => (
              <Link key={project.title} href={project.link} className="block relative group">
                <div className="relative h-[70vh] md:h-screen overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 transition-opacity duration-700 group-hover:bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute inset-0 flex items-center">
                    <div className="container px-4">
                      <div className="max-w-4xl">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                          {project.title}
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">{project.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-8 bg-white/80 backdrop-blur-md rounded-full p-4 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
