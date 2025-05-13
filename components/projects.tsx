import { AnimatedHeader } from "./animated-header"
import { SchemaImage } from "./schema-image"

export function Projects() {
  const projects = [
    {
      title: "Process Engineering",
      description: "Innovative solutions in process design and optimization.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/csm_process-engineering_5a65fa437e.jpg-UorLEDHen5nkM9sltLfbnaoXWvxR3Z.jpeg",
    },
    {
      title: "Piping Systems",
      description: "Leading piping design initiatives and system optimization.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mykyta-martynenko-6TIMIpsYOws-unsplash.jpg-eqP9bWkt92uNo276ujTbAItJDvOHsY.jpeg",
    },
    {
      title: "Process Safety",
      description: "Revolutionizing safety management systems through data analytics.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tesoroexplosion.jpg-DONlhtKbFuVRbpOCafyTSkjlGnl2kS.jpeg",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <p className="text-muted-foreground text-sm md:text-base">(What I've done)</p>
          <p className="text-muted-foreground text-sm md:text-base">(01)</p>
        </div>

        <AnimatedHeader>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12">
            ENGINEERING
            <br />
            EXPERIENCE
          </h2>
        </AnimatedHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {projects.map((project) => (
            <div key={project.title} className="group relative aspect-[4/3] bg-muted overflow-hidden rounded-lg">
              <SchemaImage
                src={project.image}
                alt={`Luqman Ismat - ${project.title} Engineering Project`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center">
                <h3 className="text-white text-lg font-medium mb-2">{project.title}</h3>
                <p className="text-gray-300 text-sm text-center px-4">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
