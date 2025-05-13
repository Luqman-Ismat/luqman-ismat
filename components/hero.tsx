"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { AnimatedHeader } from "./animated-header"
import { SchemaImage } from "./schema-image"

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<HTMLSpanElement[]>([])

  // Initialize lineRefs with empty array
  const addToLineRefs = (el: HTMLSpanElement | null) => {
    if (el && !lineRefs.current.includes(el)) {
      lineRefs.current.push(el)
    }
  }

  useEffect(() => {
    const lines = lineRefs.current
    const container = containerRef.current
    const image = imageRef.current
    const content = contentRef.current

    const ctx = gsap.context(() => {
      // Initial content animation
      gsap.set(lines, {
        y: 50,
        opacity: 0,
      })

      gsap.to(lines, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      })

      // Scroll animations for the entire hero section
      if (container && image && content) {
        const scrollTrigger = ScrollTrigger.create({
          trigger: container,
          start: "80% top",
          end: "bottom top",
          animation: gsap.to([container, image, content], {
            opacity: 0,
            scale: 0.98,
            duration: 1,
            ease: "power2.inOut",
          }),
          scrub: 1,
        })

        return () => {
          scrollTrigger.kill()
        }
      }

      // Scroll animation for the "PUSHING ENGINEERING" content
      const scrollContent = content?.querySelector(".scroll-content")
      if (scrollContent) {
        gsap.set(scrollContent, {
          opacity: 0,
          y: 50,
        })

        const contentTrigger = ScrollTrigger.create({
          trigger: scrollContent,
          start: "top center+=100",
          end: "center center",
          animation: gsap.to(scrollContent, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }),
        })

        return () => {
          contentTrigger.kill()
        }
      }
    }, containerRef)

    return () => {
      ctx.revert() // Clean up all GSAP animations
    }
  }, []) // Empty dependency array since we're using refs

  return (
    <div ref={containerRef} className="relative bg-background w-full">
      {/* Image section */}
      <div ref={imageRef} className="md:absolute md:left-0 md:top-0 md:w-1/2 h-[50vh] md:h-full relative">
        <SchemaImage
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/justin-wolff-4wjsEDOwapo-unsplash.jpg-yqBchAIp3OP880B9Dw59UUVSIZWt1W.jpeg"
          alt="Luqman Ismat - Engineering Innovation Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content section */}
      <div ref={contentRef} className="md:w-1/2 md:ml-[50%] flex flex-col">
        <div className="min-h-[70vh] md:min-h-screen flex flex-col p-8 md:p-16 pt-24 md:pt-32">
          <div className="flex-1 flex items-start">
            <div className="flex items-start gap-1">
              <span className="text-sm mt-2">©</span>
              <AnimatedHeader>
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter">
                  <span ref={addToLineRefs} className="block">
                    LUQMAN
                  </span>
                  <span ref={addToLineRefs} className="block">
                    ISMAT
                  </span>
                </h1>
              </AnimatedHeader>
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <AnimatedHeader>
              <p ref={addToLineRefs} className="text-muted-foreground">
                (Based in Houston, TX)
              </p>
            </AnimatedHeader>
            <AnimatedHeader>
              <h2 ref={addToLineRefs} className="text-2xl md:text-3xl lg:text-4xl font-bold">
                Engineering Consultant
              </h2>
            </AnimatedHeader>
          </div>
        </div>

        <div className="min-h-[40vh] md:min-h-[50vh] flex items-center p-8 md:p-16">
          <div className="scroll-content space-y-16">
            <AnimatedHeader>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                PUSHING
                <br />
                ENGINEERING
                <br />
                INTO
                <br />
                THE [FUTURE].
              </h2>
            </AnimatedHeader>

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
                I am working on developing{" "}
                <span className="text-foreground font-medium">AI-driven tools & software</span> that will revolutionize
                how engineering projects are designed, planned, and executed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
