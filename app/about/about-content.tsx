"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Youtube } from "lucide-react"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import { SchemaImage } from "@/components/schema-image"

export default function AboutContent() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-24 md:pt-32 pb-24">
          <div className="container px-4">
            {/* Hero Section */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-24 items-center">
              <div>
                <AnimatedHeader>
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
                    LUQMAN
                    <br />
                    ISMAT
                  </h1>
                </AnimatedHeader>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  Engineering student, tech enthusiast, and Quran reciter based in Houston, TX.
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/portfolio">View Portfolio</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link
                      href="https://youtube.com/@luqmanmuhammadismat"
                      className="flex items-center gap-2"
                      target="_blank"
                    >
                      <Youtube className="w-4 h-4" />
                      Recitations
                    </Link>
                  </Button>
                </div>
              </div>
              <div>
                <div className="relative aspect-[4/5] md:aspect-square">
                  <SchemaImage
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_1262.JPEG-8IBHMfGSJJgvuREfCofqQVcldYFvVo.jpeg"
                    alt="Luqman Ismat - Engineering Consultant and Tech Enthusiast Professional Portrait"
                    fill
                    className="object-cover rounded-2xl"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Background Section */}
            <section className="mb-24">
              <AnimatedHeader>
                <h2 className="text-3xl font-bold mb-8">Background</h2>
              </AnimatedHeader>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    I grew up in Katy, Texas, and graduated with honors from Tompkins High School before diving into
                    engineering. I started in Chemical Engineering but later realized my real passion was at the
                    intersection of engineering and technology, leading me to switch to Industrial Engineering at the
                    University of Houston.
                  </p>
                  <p>
                    Being the eldest of four younger brothers shaped my leadership skills and sense of responsibility
                    early on. That dynamic has influenced how I approach teamwork and problem-solving, both in school
                    and at work.
                  </p>
                </div>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    At 15, I became a Hafiz, memorizing the entire Quran. For the past nine years, I've led Taraweeh
                    prayers during Ramadan and will continue the tradition this year. That experience has reinforced my
                    discipline, dedication, and commitment to serving my community.
                  </p>
                  <p>
                    Beyond that, I stay active in my local mosque, volunteering for community initiatives and youth
                    programs. These experiences have deepened my understanding of leadership and the importance of
                    giving back.
                  </p>
                </div>
              </div>
            </section>

            {/* Professional Journey Section */}
            <section className="mb-24">
              <AnimatedHeader>
                <h2 className="text-3xl font-bold mb-8">Professional Journey</h2>
              </AnimatedHeader>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6 text-muted-foreground">
                  <div className="space-y-4">
                    <p>
                      My professional experience at{" "}
                      <Link href="/portfolio" className="text-foreground underline-offset-4 hover:underline">
                        Chemex Global
                      </Link>{" "}
                      played a pivotal role in shaping my vision for the future of engineering.
                    </p>
                    <p>
                      Working at a midsize EPC firm exposed me to the full lifecycle of engineering projects, from
                      front-end design to construction and startup. I started as a Process Engineering Intern, later
                      transitioning to a Process Engineer, and eventually moving into Piping Systems Engineering.
                    </p>
                  </div>
                  <p>
                    During my time there, I worked on HAZOP and HAZIP studies, developed P&IDs, ran Aspen HYSYS
                    simulations, and handled equipment sizing for systems ranging from firewater networks to
                    distillation columns. I also took part in startup planning, material selection, and process
                    optimization. Moving into piping systems, I worked on specifying Piping and Instrumentation Diagrams
                    (P&ID) and Piping Material Specifications (PIP) for PTFE-lined piping in acidic water service,
                    gaining insight into material properties and manufacturing processes.
                  </p>
                </div>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    One of the key takeaways from my experience at Chemex was understanding the challenges midsize EPC
                    firms face—tight budgets, rapid project timelines, and the need for flexible yet robust engineering
                    solutions. I saw firsthand how inefficient workflows, outdated software, and a lack of digital
                    integration slowed down processes that could have been automated or optimized. This fueled my belief
                    that engineering technology and innovation are at least a decade behind where they should be.
                  </p>
                  <p>
                    Currently, I&apos;m pursuing my studies full-time at the University of Houston, deepening my
                    understanding of industrial systems and processes. My goal is to be at the forefront of engineering
                    technology, bridging the gap between traditional methodologies and modern digital capabilities. I
                    want to create cutting-edge solutions that streamline workflows, enhance efficiency, and bring
                    engineering into the future.
                  </p>
                </div>
              </div>
            </section>

            {/* Personal Interests Section */}
            <section>
              <AnimatedHeader>
                <h2 className="text-3xl font-bold mb-8">Beyond Engineering</h2>
              </AnimatedHeader>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Culinary Enthusiast</h3>
                  <p className="text-muted-foreground">
                    As a dedicated foodie, I have a deep appreciation for diverse cuisines, especially Pakistani,
                    Afghani, Arab, Italian, and Japanese food. My love for food goes beyond just taste—it's about the
                    craftsmanship, tradition, and culture behind each dish. This passion reflects my broader
                    appreciation for creativity, whether it&apos;s in the kitchen or the engineering lab.
                  </p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Entertainment & Leisure</h3>
                  <p className="text-muted-foreground">
                    I&apos;m a big anime fan, and Gintama is my all-time favorite. When I&apos;m not working on
                    engineering projects or studying, I&apos;m either playing League of Legends or listening to
                    hip-hop—both giving me a creative escape from the technical grind.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
