import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
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
              <div className="absolute inset-0 rounded-full bg-white overflow-hidden flex items-center justify-center">
                <div className="w-4/5 h-4/5 relative">
                  <Image
                    src="/images/engivault-logo-mark.png"
                    alt="ENGiVAULT"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
            <AnimatedHeader>
              <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
                The Future of Engineering Knowledge Sharing
              </h1>
            </AnimatedHeader>
            <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-3xl mx-auto">
              A comprehensive platform connecting engineers worldwide, combining technical resources with
              community-driven knowledge sharing.
            </p>
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
          <section>
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
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
