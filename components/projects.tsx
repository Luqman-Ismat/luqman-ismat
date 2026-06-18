import { SchemaImage } from "./schema-image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Tilt } from "./tilt"

type Project = { title: string; description: string; image: string; href?: string }

const PROJECTS: Project[] = [
  {
    title: "Process Engineering",
    description: "Innovative solutions in process design and optimization.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/csm_process-engineering_5a65fa437e.jpg-UorLEDHen5nkM9sltLfbnaoXWvxR3Z.jpeg",
    href: "/portfolio",
  },
  {
    title: "Piping Systems",
    description: "Leading piping design initiatives and system optimization.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mykyta-martynenko-6TIMIpsYOws-unsplash.jpg-eqP9bWkt92uNo276ujTbAItJDvOHsY.jpeg",
    href: "/portfolio",
  },
  {
    title: "Process Safety",
    description: "Revolutionizing safety management through data analytics.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tesoroexplosion.jpg-DONlhtKbFuVRbpOCafyTSkjlGnl2kS.jpeg",
    href: "/portfolio",
  },
  {
    title: "Reliability Data Analyst",
    description: "Data-driven reliability optimization and analytics.",
    image: "https://i.pinimg.com/736x/e9/bf/45/e9bf455e42cbb5c763a897ba3b5f98b1.jpg",
    href: "/portfolio",
  },
]

export function Projects() {
  return (
    <section
      className="py-16 md:py-24 bg-background"
      aria-labelledby="projects-heading"
    >
      <div className="container px-4">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <p className="text-muted-foreground text-sm md:text-base">(What I&rsquo;ve done)</p>
          <p className="text-muted-foreground text-sm md:text-base font-mono">01</p>
        </div>

        <h2
          id="projects-heading"
          className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12"
        >
          ENGINEERING
          <br />
          EXPERIENCE
        </h2>

        <ul
          role="list"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {PROJECTS.map((project) => (
            <li key={project.title}>
              <Tilt className="h-full">
              <Link
                href={project.href ?? "/portfolio"}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted ring-1 ring-border/40 transition-shadow hover:ring-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${project.title} — ${project.description}`}
              >
                <SchemaImage
                  src={project.image}
                  alt={`Luqman Ismat — ${project.title} engineering project`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Always-visible gradient + label so the card is readable on touch devices */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-white text-lg md:text-xl font-semibold leading-tight">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/75 max-w-sm">
                        {project.description}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all group-hover:bg-white group-hover:text-black"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
