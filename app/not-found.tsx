import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Home } from "lucide-react"

export const metadata = {
  title: "Page not found",
  description: "The page you’re looking for doesn’t exist. Head back to the homepage.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <Header />
      <main id="main" className="flex-1 w-full flex items-center">
        <div className="container px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground font-mono mb-4">[404]</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95]">
              <span className="block rise" style={{ ["--rise-delay" as string]: "60ms" } as React.CSSProperties}>LOST</span>
              <span className="block rise" style={{ ["--rise-delay" as string]: "180ms" } as React.CSSProperties}>SIGNAL.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-prose leading-relaxed">
              That page didn&rsquo;t make it through the build. It might have moved, or it
              may never have existed. Let&rsquo;s get you somewhere useful.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Home className="h-4 w-4" /> Back to home
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="h-4 w-4" /> Read the blog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
