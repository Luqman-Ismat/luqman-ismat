import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { FadeIn } from "@/components/fade-in"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Contact Luqman Ismat | Engineering Consultant in Katy, TX",
  description:
    "Get in touch with Luqman Ismat, an innovative engineering consultant based in Katy and The Woodlands, TX. Discuss your EPC projects or engineering solutions.",
}

export default function ContactPage() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="flex-1 pt-32 pb-24">
          <div className="container px-4">
            <FadeIn>
              <AnimatedHeader>
                <h1 className="text-4xl md:text-6xl font-bold mb-12">Let's Talk</h1>
              </AnimatedHeader>
            </FadeIn>

            <div className="max-w-3xl mx-auto space-y-12">
              <FadeIn delay={0.2}>
                {/* Contact Information */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground">
                  <Link href="mailto:Luqman.ismat@gmail.com" className="hover:text-foreground transition-colors">
                    Luqman.ismat@gmail.com
                  </Link>
                  <span className="hidden md:inline">|</span>
                  <Link href="tel:+18326796731" className="hover:text-foreground transition-colors">
                    (832)-679-6731
                  </Link>
                  <span className="hidden md:inline">|</span>
                  <Link
                    href="https://www.linkedin.com/in/luqman-ismat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    linkedin.com/in/luqmanismat
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                {/* Contact Form */}
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input type="text" placeholder="Your Name" />
                    <Input type="email" placeholder="Your Email" />
                  </div>
                  <Textarea placeholder="Your Message" rows={12} className="min-h-[300px] resize-y" />
                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    Send Message
                  </Button>
                </form>
              </FadeIn>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
