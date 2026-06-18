const ROWS = [
  {
    items: ["AspenTech", "PowerBI"],
    duration: "20s",
    direction: "left" as const,
    size: "text-3xl md:text-4xl lg:text-5xl",
    gradient: "from-foreground/30 via-foreground to-foreground/30",
  },
  {
    items: ["AutoPipe", "Python"],
    duration: "25s",
    direction: "right" as const,
    size: "text-4xl md:text-5xl lg:text-6xl",
    gradient: "from-foreground/10 via-foreground/80 to-foreground/10",
  },
  {
    items: ["Next.js", "Oracle"],
    duration: "22s",
    direction: "left" as const,
    size: "text-2xl md:text-3xl lg:text-4xl",
    gradient: "from-foreground/40 via-foreground to-foreground/40",
  },
  {
    items: ["Primavera P6", "Wrike"],
    duration: "28s",
    direction: "right" as const,
    size: "text-5xl md:text-6xl lg:text-7xl",
    gradient: "from-foreground via-foreground/50 to-foreground",
  },
  {
    items: ["Jupyter", "AspenTech"],
    duration: "24s",
    direction: "left" as const,
    size: "text-3xl md:text-4xl lg:text-5xl",
    gradient: "from-foreground/20 via-foreground/90 to-foreground/20",
  },
  {
    items: ["PowerBI", "Python"],
    duration: "26s",
    direction: "right" as const,
    size: "text-4xl md:text-5xl lg:text-6xl",
    gradient: "from-foreground/60 via-foreground to-foreground/60",
  },
]

export function Technologies() {
  return (
    <section
      className="py-16 md:py-24 bg-background"
      aria-labelledby="technologies-heading"
    >
      <div className="container px-4">
        <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">(Technologies)</p>
        <h2
          id="technologies-heading"
          className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12"
        >
          TOOLS &amp;
          <br />
          EXPERTISE
        </h2>

        <div
          className="relative space-y-3 md:space-y-4"
          aria-hidden="true"
        >
          {ROWS.map((row, rowIndex) => {
            const tiled = Array.from({ length: 6 }).flatMap(() => row.items)
            return (
              <div key={rowIndex} className="relative overflow-hidden">
                <div
                  className={`marquee ${row.direction === "left" ? "marquee-left" : "marquee-right"} gap-8 md:gap-12 lg:gap-16`}
                  style={{ animationDuration: row.duration }}
                >
                  {tiled.map((tech, index) => (
                    <span
                      key={`${tech}-${index}`}
                      className={`${row.size} shrink-0 font-bold bg-gradient-to-r ${row.gradient} bg-clip-text text-transparent shimmer-text`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Accessible flat list for screen readers */}
        <ul className="sr-only">
          {Array.from(new Set(ROWS.flatMap((r) => r.items))).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
