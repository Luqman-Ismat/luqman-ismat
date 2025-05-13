import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Luqman Ismat | Projects - ENGiVAULT",
  description:
    "ENGiVAULT is a comprehensive platform connecting engineers worldwide, combining technical resources with community-driven knowledge sharing.",
  openGraph: {
    title: "Luqman Ismat | Projects - ENGiVAULT",
    description:
      "ENGiVAULT is a comprehensive platform connecting engineers worldwide, combining technical resources with community-driven knowledge sharing.",
    url: "https://www.luqmanismat.com/projects/engivault",
    type: "article",
  },
  alternates: {
    canonical: "https://www.luqmanismat.com/projects/engivault",
  },
}

export default function EngivaultPage() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-32 pb-24">
          {/* Hero Section */}
          <div className="mb-24">
            <div className="relative w-64 h-64 mx-auto mb-16">
              <div className="absolute inset-0 rounded-full bg-black overflow-hidden flex items-center justify-center">
                <div className="w-full h-full relative">
                  <Image
                    src="/images/engivault-logo-mark-dark.png"
                    alt="ENGiVAULT"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">ENGiVAULT</h2>
            </div>
            <AnimatedHeader>
              <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
                The Future of Engineering Knowledge Sharing
              </h1>
            </AnimatedHeader>
            <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
              A comprehensive platform connecting engineers worldwide, combining technical resources with
              community-driven knowledge sharing.
            </p>

            {/* Launch Banner */}
            <div className="bg-gradient-to-r from-green-500/10 via-green-500/20 to-green-500/10 p-4 rounded-lg max-w-3xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="font-medium text-green-600 dark:text-green-400">Now Live</p>
                </div>
                <p className="text-center md:text-left">
                  ENGiVAULT has officially launched! Visit the platform to start exploring.
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                  <Link
                    href="https://www.engivault.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Visit ENGiVAULT <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-24">
            <AnimatedHeader className="ml-10">
              <h2 className="text-3xl font-bold mb-8">Overview</h2>
            </AnimatedHeader>
            <div className="prose prose-lg dark:prose-invert max-w-none ml-10">
              <p>
                ENGiVAULT is reimagining how engineers access and share technical knowledge. By combining the
                accessibility of modern social platforms with rigorous technical resources, we're creating a space where
                both experienced and emerging engineers can find reliable information, share insights, and build
                professional connections.
              </p>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="mb-24">
            <AnimatedHeader className="ml-10">
              <h2 className="text-3xl font-bold mb-8">Key Features</h2>
            </AnimatedHeader>
            <div className="grid md:grid-cols-2 gap-8 ml-10">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Technical Resources</h3>
                <p className="text-muted-foreground">
                  Comprehensive database of equipment sizing guidelines, industry rules of thumb, and technical
                  standards, all verified and regularly updated by industry experts.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Community Interaction</h3>
                <p className="text-muted-foreground">
                  Professional networking features allowing engineers to create profiles, share experiences, and
                  participate in technical discussions within their specific fields.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Interactive Tools</h3>
                <p className="text-muted-foreground">
                  Built-in calculators, conversion tools, and interactive diagrams that help engineers quickly solve
                  common problems and validate their work.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Knowledge Validation</h3>
                <p className="text-muted-foreground">
                  Peer review system ensuring the accuracy and reliability of shared information, with contributions
                  ranked by experienced professionals in the field.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-24">
            <AnimatedHeader className="ml-10">
              <h2 className="text-3xl font-bold mb-8">Benefits</h2>
            </AnimatedHeader>
            <div className="grid md:grid-cols-3 gap-8 ml-10">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Knowledge Access</h3>
                <p className="text-muted-foreground">
                  Instant access to verified technical information, reducing research time and improving decision-making
                  accuracy.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Professional Growth</h3>
                <p className="text-muted-foreground">
                  Opportunities for mentorship, knowledge sharing, and professional development through community
                  interaction.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Industry Innovation</h3>
                <p className="text-muted-foreground">
                  Platform for sharing new ideas, discussing emerging technologies, and collaborating on solutions to
                  industry challenges.
                </p>
              </div>
            </div>
          </section>

          {/* Vision Section */}
          <section className="mb-24">
            <AnimatedHeader className="ml-10">
              <h2 className="text-3xl font-bold mb-8">Vision</h2>
            </AnimatedHeader>
            <div className="prose prose-lg dark:prose-invert max-w-none ml-10">
              <p>
                ENGiVAULT aims to become the definitive platform for engineering knowledge sharing and professional
                development. By combining technical expertise with community engagement, we're creating an ecosystem
                that supports innovation, facilitates learning, and promotes collaboration across all engineering
                disciplines.
              </p>
            </div>
          </section>

          {/* Call to Action Section */}
          <section>
            <div className="bg-black text-white rounded-lg p-8 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Experience ENGiVAULT Today</h3>
                  <p className="text-white/80">
                    Join the growing community of engineers sharing knowledge and solving problems together.
                  </p>
                </div>
                <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                  <Link
                    href="https://www.engivault.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Visit www.engivault.com <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
