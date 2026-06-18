import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import { OptimizedImage } from "@/components/optimized-image"
import { LetterStagger } from "@/components/letter-stagger"
import { SpotlightCard } from "@/components/spotlight-card"
import { StaggerOnView } from "@/components/stagger-on-view"
import { Tilt } from "@/components/tilt"
import { ArrowUpRight } from "lucide-react"
import { getBlogImageUrl, getBlogAltText } from "./blog-pinterest-mapping"
import { itemListSchema, breadcrumbSchema } from "@/lib/schema"

export const metadata = {
  title: "Engineering Blog by Luqman Ismat | EPC, Process Safety & AI Insights",
  description:
    "Engineering articles by Luqman Ismat — process engineering, EPC project lifecycle, process safety management, piping systems, heat exchangers, digital twins, and AI-driven engineering tools.",
  keywords: [
    "Luqman Ismat",
    "Luqman Ismat blog",
    "Engineering blog",
    "EPC blog",
    "Process Engineering articles",
    "Process Safety Management",
    "HAZOP",
    "Digital Twins",
    "AI engineering",
    "Piping systems",
    "Heat exchanger design",
    "Houston engineering consultant",
  ],
  alternates: { canonical: "https://www.luqmanismat.com/blog" },
  openGraph: {
    type: "website",
    url: "https://www.luqmanismat.com/blog",
    title: "Engineering Blog by Luqman Ismat",
    description:
      "EPC, process engineering, AI, and digital-twins essays by engineering consultant Luqman Ismat.",
    images: [{ url: "https://www.luqmanismat.com/og-image.jpg", width: 1200, height: 630, alt: "Luqman Ismat — Engineering Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Blog by Luqman Ismat",
    description: "Process engineering, EPC, and AI essays.",
    images: ["https://www.luqmanismat.com/og-image.jpg"],
  },
}

const blogPosts = [
  {
    title: "Quantifying Service Profitability: A CVP Analysis of Mobile Service Operations in Houston, TX",
    category: "PROJECT MANAGEMENT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "An in-depth Cost-Volume-Profit analysis examining revenue drivers, variable costs, and profitability thresholds for mobile service operations in Houston, Texas.",
    href: "/blog/cvp-analysis-mobile-service-operations",
  },
  {
    title: "Process Safety Management in Industrial Settings",
    category: "PROCESS ENGINEERING",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "A comprehensive guide to Process Safety Management, HAZOP, LOPA, and risk assessment methodologies for ensuring safety in industrial facilities.",
    href: "/blog/process-safety-management",
  },
  {
    title: "The Role of Digital Twins in Modern Engineering",
    category: "ENGINEERING TECHNOLOGY",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "Discover how digital twin technology is revolutionizing engineering through virtual replicas, real-time monitoring, and predictive capabilities.",
    href: "/blog/digital-twins",
  },
  {
    title: "Heat Exchanger Design and Selection Guide",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "A comprehensive guide to heat exchanger design principles, types, thermal calculations, and selection criteria for optimal performance.",
    href: "/blog/heat-exchanger-design",
  },
  {
    title: "Project Management Best Practices for Engineers",
    category: "PROJECT MANAGEMENT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "Master the essential project management skills that every engineering professional needs, from planning to stakeholder management.",
    href: "/blog/project-management-engineers",
  },
  {
    title: "Understanding Process Piping Systems",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "Comprehensive guide to process piping design including pipe sizing, materials selection, and pressure drop optimization.",
    href: "/blog/process-piping-systems",
  },
  {
    title: "AI and Machine Learning in Engineering Design",
    category: "ENGINEERING TECHNOLOGY",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "Discover how AI and ML are revolutionizing engineering through optimization algorithms, predictive analytics, and intelligent automation.",
    href: "/blog/ai-machine-learning-engineering",
  },
  {
    title: "Energy Efficiency in Industrial Processes",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "Comprehensive guide to improving energy efficiency through pinch analysis, waste heat recovery, and advanced optimization techniques.",
    href: "/blog/energy-efficiency-industrial",
  },
  {
    title: "Career Development for Engineering Professionals",
    category: "CAREER DEVELOPMENT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "Strategic guidance for advancing your engineering career through certifications, networking, continuous learning, and leadership roles.",
    href: "/blog/career-development-engineers",
  },
  {
    title: "Detailed Engineering: The Backbone of EPC Project Execution",
    category: "EPC LIFECYCLE",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "Exploring the critical role of detailed engineering in ensuring constructability, efficiency, and cost control in EPC projects.",
    href: "/blog/detailed-engineering",
  },
  {
    title: "FEL Stages Explained: The Blueprint for Successful EPC Projects",
    category: "EPC LIFECYCLE",
    image: "/images/fel-stages-blog.jpeg",
    description:
      "Breaking down the Front-End Loading (FEL) stages and their role in minimizing risk and maximizing project success in EPC.",
    href: "/blog/fel-stages",
  },
  {
    title: "The Critical Role of Estimating in EPC: Accuracy, Risk, and Cost Control",
    category: "EPC LIFECYCLE",
    image: "/images/epc-estimating-blog.jpeg",
    description:
      "Understanding why precise estimation is the backbone of successful EPC project execution, from conceptual estimates to detailed cost analysis.",
    href: "/blog/epc-estimating",
  },
  {
    title: "Breaking Down the EPC Lifecycle: From Concept to Operation",
    category: "EPC LIFECYCLE",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thomas-werneken-2hC-ehLJIjg-unsplash%20(2).jpg-fmamlXgtD43e1ssjbkGTKnvFZCKLc7.jpeg",
    description:
      "A comprehensive guide to the Engineering, Procurement, and Construction lifecycle, from initial concept to final operation.",
    href: "/blog/epc-lifecycle",
  },
  {
    title: "The Current State of Engineering Technology: Progress, Gaps, and the Road Ahead",
    category: "ENGINEERING TECHNOLOGY",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "An in-depth analysis of engineering technology's current state, examining progress, challenges, and the path forward in digital transformation.",
    href: "/blog/engineering-technology",
  },
  {
    title: "The Communication Challenge in EPC Projects: Why It's a Make-or-Break Factor",
    category: "EPC LIFECYCLE",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "Explore how effective communication shapes EPC project success, and learn strategies to overcome common communication challenges in complex engineering projects.",
    href: "/blog/epc-communication",
  },
]

export default function BlogPage() {
  const list = itemListSchema(
    blogPosts.map((p) => ({
      name: p.title,
      url: `https://www.luqmanismat.com${p.href}`,
      description: p.description,
    })),
  )
  const crumbs = breadcrumbSchema([
    { name: "Home", url: "https://www.luqmanismat.com" },
    { name: "Blog", url: "https://www.luqmanismat.com/blog" },
  ])
  return (
    <ScrollToTopWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main id="main" className="relative pt-32 pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] dot-grid dot-grid-drift opacity-40"
          />
          <div className="relative container px-4">
            <p className="text-sm text-muted-foreground font-mono mb-3">(Latest insights)</p>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
              <LetterStagger text="BLOG" baseDelay={60} />
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-2xl">
              Insights on EPC, current trends in engineering, and ideas to elevate the field — by Luqman Ismat.
            </p>
            <StaggerOnView
              as="ul"
              role="list"
              step={70}
              selector=":scope > li"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {blogPosts.map((post, index) => {
                const slug = post.href.replace("/blog/", "")
                const imageUrl = getBlogImageUrl(slug) || post.image || "/placeholder.svg"
                const altText = getBlogAltText(slug)
                return (
                  <li key={post.title} className="list-none">
                    <Link href={post.href} className="group block focus:outline-none">
                      <SpotlightCard className="rounded-xl">
                        <Tilt maxTilt={4} className="relative aspect-[4/3] mb-6 overflow-hidden rounded-xl ring-1 ring-border/40 transition-shadow group-hover:ring-border">
                          <OptimizedImage
                            src={imageUrl}
                            alt={altText}
                            fill
                            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index < 3}
                          />
                          <div className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur opacity-0 transition-opacity group-hover:opacity-100">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </Tilt>
                      </SpotlightCard>
                      <div className="text-sm text-muted-foreground mb-2 font-mono">[{post.category}]</div>
                      <h2 className="text-xl font-bold leading-snug mb-2 transition-colors group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground line-clamp-3">{post.description}</p>
                    </Link>
                  </li>
                )
              })}
            </StaggerOnView>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
