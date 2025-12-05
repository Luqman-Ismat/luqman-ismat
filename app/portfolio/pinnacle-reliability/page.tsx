import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import Link from "next/link"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Portfolio Projects | Pinnacle Reliability - Luqman Ismat",
  description:
    "Explore reliability data analysis projects by Luqman Ismat at Pinnacle Reliability, showcasing data-driven solutions and analytical methodologies from Katy, TX.",
  alternates: {
    canonical: "https://www.luqmanismat.com/portfolio/pinnacle-reliability",
  },
}

export default function PinnacleReliabilityPortfolioPage() {
  const portfolioItems = [
    {
      title: "Predictive Reliability Analysis",
      description: "Advanced statistical modeling and predictive analytics for asset reliability optimization.",
      image: "/images/pinnacle-logo.png",
      link: "/portfolio/pinnacle-reliability/predictive-reliability-analysis",
      darkBackground: true,
    },
    {
      title: "Data-Driven Maintenance Optimization",
      description: "Comprehensive analysis and optimization of maintenance strategies using reliability data.",
      image: "/images/pinnacle-logo.png",
      link: "/portfolio/pinnacle-reliability/maintenance-optimization",
      darkBackground: true,
    },
  ]

  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-16 w-full">
          <section className="py-20 md:py-28 w-full">
            <div className="container px-4">
              <AnimatedHeader>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8">
                  PINNACLE RELIABILITY
                </h1>
              </AnimatedHeader>
              <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground max-w-4xl mb-20">
                Data-driven reliability solutions and analytical insights.
              </p>
            </div>
          </section>

          <section className="relative w-full">
            {portfolioItems.map((item) => (
              <Link key={item.title} href={item.link} className="block relative group w-full">
                <div className="relative h-[70vh] md:h-screen overflow-hidden w-full">
                  <div className={`absolute inset-0 ${item.darkBackground ? "bg-black" : ""}`}>
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 transition-opacity duration-700 group-hover:bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="absolute inset-0 flex items-center">
                    <div className="container px-4">
                      <div className="max-w-4xl">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg mb-4">
                          {item.title}
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">{item.description}</p>
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

