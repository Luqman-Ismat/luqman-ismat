import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Luqman Ismat | Projects - iNNOVARi",
  description:
    "iNNOVARi is a comprehensive, modular software solution designed to transform how Engineering, Procurement, and Construction projects are managed and executed.",
  openGraph: {
    title: "Luqman Ismat | Projects - iNNOVARi",
    description:
      "iNNOVARi is a comprehensive, modular software solution designed to transform how Engineering, Procurement, and Construction projects are managed and executed.",
    url: "https://www.luqmanismat.com/projects/innovari",
    type: "article",
  },
  alternates: {
    canonical: "https://www.luqmanismat.com/projects/innovari",
  },
}

export default function InnovariPage() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-32 pb-24">
          {/* Hero Section */}
          <div className="mb-24">
            <div className="relative w-64 h-64 mx-auto mb-16">
              <div className="absolute inset-0 rounded-full bg-black overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-09%20223633-L5Zp9zeIRxUhc7GlhYDAi36HqEzNNR.png"
                  alt="iNNOVARi"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </div>
            <AnimatedHeader>
              <h1 className="text-4xl md:text-6xl font-bold text-center mb-8">
                Revolutionizing EPC Project Management
              </h1>
            </AnimatedHeader>
            <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-3xl mx-auto">
              A comprehensive, modular software solution designed to transform how Engineering, Procurement, and
              Construction projects are managed and executed.
            </p>
          </div>

          {/* Overview Section */}
          <section className="mb-24">
            <AnimatedHeader className="ml-10">
              <h2 className="text-3xl font-bold mb-8">Overview</h2>
            </AnimatedHeader>
            <div className="prose prose-lg dark:prose-invert max-w-none ml-10">
              <p>
                iNNOVARi is an innovative all-in-one EPC project management platform that addresses the fundamental
                challenges faced by modern engineering projects. By integrating every aspect of the EPC lifecycle, from
                initial estimating to detailed engineering and construction team communication, iNNOVARi streamlines
                workflows and eliminates redundancies that have historically plagued the industry.
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
                <h3 className="text-xl font-semibold">Unified Database Architecture</h3>
                <p className="text-muted-foreground">
                  A centralized database that seamlessly integrates with industry-standard tools like Aspen HYSYS and
                  Primavera P6, ensuring data consistency and eliminating the need for multiple data entry points.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Intelligent Document Management</h3>
                <p className="text-muted-foreground">
                  Advanced document control system that tracks revisions, manages approvals, and ensures all team
                  members are working with the latest information, reducing errors and rework.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Real-time Collaboration</h3>
                <p className="text-muted-foreground">
                  Integrated communication tools that connect engineering, procurement, and construction teams,
                  facilitating instant feedback and decision-making.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Automated Workflow Management</h3>
                <p className="text-muted-foreground">
                  Smart workflows that automate routine tasks, track deliverables, and ensure compliance with project
                  requirements and industry standards.
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
                <h3 className="text-xl font-semibold">Cost Reduction</h3>
                <p className="text-muted-foreground">
                  Minimize redundant work and optimize resource allocation through intelligent project tracking and
                  automated workflows.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Time Optimization</h3>
                <p className="text-muted-foreground">
                  Accelerate project timelines by streamlining communication, automating routine tasks, and eliminating
                  bottlenecks.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Quality Improvement</h3>
                <p className="text-muted-foreground">
                  Enhance deliverable quality through standardized processes, automated checks, and improved
                  collaboration.
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
                iNNOVARi represents the future of EPC project execution. By bridging the gap between traditional
                engineering practices and modern technology, we're creating a platform that not only solves today's
                challenges but also adapts to tomorrow's needs. Our goal is to establish a new standard in project
                management efficiency, where seamless collaboration and data-driven decision-making are the norm.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
