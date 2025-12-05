"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section ref={ref} className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-8 py-24 md:py-32">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={variants}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-16"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            PUSHING
            <br />
            ENGINEERING
            <br />
            INTO
            <br />
            THE [FUTURE].
          </h2>

          <div className="space-y-6 text-lg md:text-xl text-muted-foreground">
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
              I am working on developing <span className="text-foreground font-medium">AI-driven tools & software</span>{" "}
              that will revolutionize how engineering projects are designed, planned, and executed.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
