"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ScrollAnimation } from "./scroll-animation"
import { Technologies } from "./technologies"

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="md:w-1/2 h-[50vh] md:h-auto relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/justin-wolff-4wjsEDOwapo-unsplash.jpg-yqBchAIp3OP880B9Dw59UUVSIZWt1W.jpeg"
            alt="Water wall with trees"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right side - Hero Content */}
        <div className="md:w-1/2 flex items-center p-8 md:p-16">
          <div className="max-w-2xl">
            <ScrollAnimation>
              <div className="flex items-start gap-1">
                <span className="text-sm mt-2">©</span>
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter">
                  LUQMAN
                  <br />
                  ISMAT
                </h1>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={0.2}>
              <p className="text-muted-foreground mt-4">(Based in Houston, TX)</p>
            </ScrollAnimation>

            <ScrollAnimation delay={0.4}>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-8">Optimizing Engineering</h2>
            </ScrollAnimation>
          </div>
        </div>
      </div>

      {/* About Me Section */}
      <div className="bg-background p-8 md:p-16">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation>
            <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">(About Me)</p>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12">
              PUSHING
              <br />
              ENGINEERING
              <br />
              INTO
              <br />
              THE (FUTURE).
            </h2>
          </ScrollAnimation>

          <ScrollAnimation delay={0.4}>
            <div className="space-y-4 md:space-y-6 text-base md:text-lg text-muted-foreground">
              <p>
                With years of experience in{" "}
                <span className="text-foreground font-medium">EPC (Engineering, Procurement, and Construction)</span>, I
                have worked on projects as a{" "}
                <span className="text-foreground font-medium">
                  Process Engineer, Piping Systems Engineer, and a Process Safety Lead
                </span>
                .
              </p>
              <p>
                I am working on developing <span className="text-foreground font-medium">AI-driven tools</span> that
                will revolutionize how projects are designed, planned, and executed.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      {/* Technologies Section */}
      <Technologies />
    </motion.div>
  )
}
