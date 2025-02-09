import Image from "next/image"

export function Projects() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <p className="text-muted-foreground text-sm md:text-base">(What I&apos;ve done)</p>
            <p className="text-muted-foreground text-sm md:text-base">(01)</p>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12">
            ENGINEERING
            <br />
            EXPERIENCE
          </h2>

          <p className="text-xl md:text-2xl lg:text-3xl font-light mb-12 md:mb-16 max-w-3xl">
            What I&apos;ve learned in my different roles at Chemex Global, LLC, and where I think Engineering can
            improve.
          </p>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            <div className="group relative aspect-[4/3] bg-muted overflow-hidden rounded-lg">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nbGWNTQanPfj8YDpaBERHv9LJXKkdd.png"
                alt="Project Acme"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=40&width=120"
                  alt="Acme logo"
                  width={120}
                  height={40}
                  className="w-24 md:w-32"
                />
              </div>
            </div>
            <div className="group relative aspect-[4/3] bg-muted overflow-hidden rounded-lg">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nbGWNTQanPfj8YDpaBERHv9LJXKkdd.png"
                alt="Project Kanba"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=40&width=120"
                  alt="Kanba logo"
                  width={120}
                  height={40}
                  className="w-24 md:w-32"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

