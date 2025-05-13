"use client"
import { motion } from "framer-motion"
import { AnimatedHeader } from "./animated-header"
import { SchemaImage } from "./schema-image"

export function Technologies() {
  const technologies = [
    {
      name: "Power BI",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Power%20BI%20Logo-wczqWLVsjSh60FgQ7pgiC73TZ1X2Bs.png",
      width: 140,
      height: 47,
    },
    {
      name: "AutoPIPE",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed-jXrfLUUdMrdTSFeJ5vCfE4n1aNb0CJ.png",
      width: 140,
      height: 47,
    },
    {
      name: "Python",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Python-Logo-BCERK3iX9Zi7nDmdnKB8e5dT0fT81f.png",
      width: 140,
      height: 47,
    },
    {
      name: "Oracle Primavera",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Oracle-Primavera-Logo-QIQmMkyJsGgaiaOKXTVCGrJQEXy30D.png",
      width: 140,
      height: 47,
    },
    {
      name: "Aspen Tech",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/png-transparent-aspen-technology-hd-logo-thumbnail-PLY9xnX1ciZgWQ6uCSSonspZMaIks1.png",
      width: 180,
      height: 47,
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div>
          <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">(Technologies)</p>
          <AnimatedHeader>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12">
              TOOLS &
              <br />
              EXPERTISE
            </h2>
          </AnimatedHeader>
          <div className="overflow-hidden">
            <div className="flex whitespace-nowrap">
              <motion.div
                className="flex gap-12 md:gap-16"
                animate={{
                  x: [0, -1920],
                }}
                transition={{
                  x: {
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 25,
                    ease: "linear",
                  },
                }}
              >
                {[...technologies, ...technologies, ...technologies].map((tech, index) => (
                  <div
                    key={`${tech.name}-${index}`}
                    className="relative flex-shrink-0 w-[140px] md:w-[180px] h-[47px] flex items-center justify-center group"
                  >
                    <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
                    <SchemaImage
                      src={tech.logo}
                      alt={`Luqman Ismat - ${tech.name} Engineering Expertise`}
                      width={tech.width}
                      height={tech.height}
                      className="w-full h-auto object-contain dark:brightness-150 dark:contrast-125 dark:opacity-75 transition-all duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
