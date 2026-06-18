import { SchemaImage } from "./schema-image"
import Link from "next/link"

export function Hero() {
  return (
    <section
      className="relative bg-background w-full"
      aria-label="Hero section introducing Luqman Ismat"
    >
      <div
        className="md:absolute md:left-0 md:top-0 md:w-1/2 h-[50vh] md:h-full relative"
        role="img"
        aria-label="Engineering innovation background image"
      >
        <SchemaImage
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/justin-wolff-4wjsEDOwapo-unsplash.jpg-yqBchAIp3OP880B9Dw59UUVSIZWt1W.jpeg"
          alt="Luqman Ismat, Engineering Consultant, Houston TX — modern engineering facility with industrial equipment representing innovation and technology"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 md:bg-gradient-to-r md:from-transparent md:to-background/30" />
      </div>

      <div className="relative md:w-1/2 md:ml-[50%] flex flex-col">
        {/* Animated gradient blobs behind the hero copy */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="blob -right-10 top-24 h-[420px] w-[420px]"
            style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--foreground) / 0.18), transparent 60%)" }}
          />
          <div
            className="blob -left-10 bottom-10 h-[360px] w-[360px]"
            style={{ animationDelay: "-6s", background: "radial-gradient(circle at 70% 70%, hsl(var(--foreground) / 0.12), transparent 60%)" }}
          />
        </div>

        <div className="relative min-h-[70vh] md:min-h-screen flex flex-col p-8 md:p-16 pt-24 md:pt-32">
          <div className="flex-1 flex items-start">
            <div className="flex items-start gap-1">
              <span className="text-sm mt-2 text-muted-foreground" aria-hidden="true">©</span>
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter leading-[0.95]">
                <span className="block rise" style={{ ["--rise-delay" as string]: "80ms" } as React.CSSProperties}>
                  LUQMAN
                </span>
                <span className="block rise" style={{ ["--rise-delay" as string]: "200ms" } as React.CSSProperties}>
                  ISMAT
                </span>
              </h1>
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <p
              className="text-muted-foreground rise"
              style={{ ["--rise-delay" as string]: "340ms" } as React.CSSProperties}
            >
              (Based in Houston, TX)
            </p>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold rise"
              style={{ ["--rise-delay" as string]: "440ms" } as React.CSSProperties}
            >
              Engineering Consultant
            </h2>
          </div>
        </div>

        <div className="relative min-h-[40vh] md:min-h-[50vh] flex items-center p-8 md:p-16">
          <div className="space-y-12 md:space-y-16">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05]">
              PUSHING
              <br />
              ENGINEERING
              <br />
              INTO
              <br />
              THE <span className="text-primary">[FUTURE]</span>.
            </h2>

            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-prose">
              <p>
                With years of experience in{" "}
                <strong className="text-foreground font-medium">EPC (Engineering, Procurement, and Construction)</strong>, I
                have worked on projects as a{" "}
                <strong className="text-foreground font-medium">
                  Process Engineer, Piping Systems Engineer, and a Process Safety Lead
                </strong>
                . My expertise spans the complete{" "}
                <Link href="/blog/epc-lifecycle" className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground font-medium transition-colors">
                  EPC lifecycle
                </Link>
                {" "}from concept to operation, with a focus on{" "}
                <Link href="/blog/detailed-engineering" className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground font-medium transition-colors">
                  detailed engineering
                </Link>
                {" "}and{" "}
                <Link href="/blog/process-piping-systems" className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground font-medium transition-colors">
                  systems engineering
                </Link>
                .
              </p>
              <p>
                I am working on developing{" "}
                <strong className="text-foreground font-medium">AI-driven tools & software</strong> that will revolutionize
                how engineering projects are designed, planned, and executed. My approach emphasizes{" "}
                <Link href="/blog/epc-estimating" className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground font-medium transition-colors">
                  cost management
                </Link>
                {" "}and{" "}
                <Link href="/blog/epc-communication" className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground font-medium transition-colors">
                  effective communication
                </Link>
                {" "}throughout the project lifecycle, ensuring successful delivery for clients in Houston, Pasadena, and across Texas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
