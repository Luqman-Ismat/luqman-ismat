import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import { OptimizedImage } from "@/components/optimized-image"
import { getBlogImageUrl, getBlogAltText } from "./blog-pinterest-mapping"

export const metadata = {
  title: "Engineering Blog | Luqman Ismat",
  description:
    "Read insightful articles on engineering, EPC projects, and innovative technologies by Luqman Ismat, a leading engineering consultant from Katy and The Woodlands, TX.",
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
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container px-4">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">BLOG</h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-2xl">
              Explore my insights on EPC, current trends in engineering, and my ideas to elevate the field.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => {
                const slug = post.href.replace("/blog/", "")
                const imageUrl = getBlogImageUrl(slug) || post.image || "/placeholder.svg"
                const altText = getBlogAltText(slug)
                return (
                  <Link key={post.title} href={post.href} className="group block">
                    <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-lg w-full">
                      <OptimizedImage
                        src={imageUrl}
                        alt={altText}
                        fill
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 3}
                      />
                    <div className="absolute bottom-4 right-4 bg-black text-white p-2 rounded-full">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7 17L17 7M17 7H7M17 7V17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">[{post.category}]</div>
                  <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-muted-foreground">{post.description}</p>
                </Link>
                )
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
