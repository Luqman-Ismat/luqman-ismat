"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function Technologies() {
  const technologies = [
    { name: "Aspen Tech", logo: "/placeholder.svg?height=60&width=180" },
    { name: "Oracle Primavera", logo: "/placeholder.svg?height=60&width=180" },
    { name: "Power BI", logo: "/placeholder.svg?height=60&width=180" },
    { name: "Autodesk", logo: "/placeholder.svg?height=60&width=180" },
    { name: "AutoPIPE", logo: "/placeholder.svg?height=60&width=180" },
    { name: "Python", logo: "/placeholder.svg?height=60&width=180" },
  ]

  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container px-4">
        <div className="max-w-4xl">
          <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">(Technologies)</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12">
            TOOLS &
            <br />
            EXPERTISE
          </h2>
          <motion.div
            className="flex gap-8"
            animate={{
              x: [0, -1920],
            }}
            transition={{
              x: {
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {[...technologies, ...technologies].map((tech, index) => (
              <div key={`${tech.name}-${index}`} className="flex-shrink-0 w-[180px]">
                <Image
                  src={tech.logo || "/placeholder.svg"}
                  alt={tech.name}
                  width={180}
                  height={60}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

