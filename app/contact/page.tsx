import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import Link from "next/link"
import { FadeIn } from "@/components/fade-in"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Contact Luqman Ismat — Engineering Consultant | Houston, Katy & The Woodlands",
  description:
    "Get in touch with Luqman Ismat, engineering consultant in Katy and The Woodlands, TX. Discuss EPC projects, process engineering scope, or AI-driven engineering solutions.",
  keywords: [
    "Contact Luqman Ismat",
    "Hire Luqman Ismat",
    "Engineering Consultant Houston",
    "Process Engineer Texas",
    "EPC consultant contact",
    "Luqman Ismat email",
  ],
  alternates: { canonical: "https://www.luqmanismat.com/contact" },
  openGraph: {
    type: "website",
    url: "https://www.luqmanismat.com/contact",
    title: "Contact Luqman Ismat — Engineering Consultant",
    description: "Reach engineering consultant Luqman Ismat in Houston, Katy & The Woodlands, TX.",
    images: [{ url: "https://www.luqmanismat.com/og-image.jpg", width: 1200, height: 630, alt: "Contact Luqman Ismat" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Luqman Ismat",
    description: "Reach engineering consultant Luqman Ismat in Houston, TX.",
    images: ["https://www.luqmanismat.com/og-image.jpg"],
  },
}

export default function ContactPage() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main id="main" className="flex-1 pt-32 pb-24">
          <div className="container px-4">
            <FadeIn>
              <p className="text-sm text-muted-foreground font-mono mb-3">(Get in touch)</p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">Let&rsquo;s Talk</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Whether it&rsquo;s an EPC project, a process question, or an AI-driven idea —
                tell me what you&rsquo;re working on.
              </p>
            </FadeIn>

            <div className="max-w-3xl mx-auto space-y-12 mt-16">
              <FadeIn delay={0.05}>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground">
                  <Link
                    href="mailto:Luqman.ismat@gmail.com"
                    className="underline-offset-4 hover:text-foreground hover:underline transition-colors"
                  >
                    Luqman.ismat@gmail.com
                  </Link>
                  <span className="hidden md:inline" aria-hidden="true">|</span>
                  <Link
                    href="tel:+18326796731"
                    className="underline-offset-4 hover:text-foreground hover:underline transition-colors"
                  >
                    (832)-679-6731
                  </Link>
                  <span className="hidden md:inline" aria-hidden="true">|</span>
                  <Link
                    href="https://www.linkedin.com/in/luqman-ismat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:text-foreground hover:underline transition-colors"
                  >
                    linkedin.com/in/luqmanismat
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <ContactForm />
              </FadeIn>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
