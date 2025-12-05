import Link from "next/link"
import { OptimizedImage } from "./optimized-image"
import { getBlogImageUrl, getBlogAltText } from "@/app/blog/blog-pinterest-mapping"

interface RelatedArticle {
  title: string
  category: string
  image: string
  href: string
  description: string
}

interface RelatedArticlesProps {
  currentCategory: string
  currentSlug: string
}

// All blog posts
const allBlogPosts: RelatedArticle[] = [
  {
    title: "Quantifying Service Profitability: A CVP Analysis of Mobile Service Operations in Houston, TX",
    category: "PROJECT MANAGEMENT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description: "An in-depth Cost-Volume-Profit analysis examining revenue drivers, variable costs, and profitability thresholds for mobile service operations in Houston, Texas.",
    href: "/blog/cvp-analysis-mobile-service-operations",
  },
  {
    title: "Process Safety Management in Industrial Settings",
    category: "PROCESS ENGINEERING",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description: "A comprehensive guide to Process Safety Management, HAZOP, LOPA, and risk assessment methodologies.",
    href: "/blog/process-safety-management",
  },
  {
    title: "The Role of Digital Twins in Modern Engineering",
    category: "ENGINEERING TECHNOLOGY",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description: "Discover how digital twin technology is revolutionizing engineering through virtual replicas and predictive capabilities.",
    href: "/blog/digital-twins",
  },
  {
    title: "Heat Exchanger Design and Selection Guide",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description: "A comprehensive guide to heat exchanger design principles, types, and thermal calculations.",
    href: "/blog/heat-exchanger-design",
  },
  {
    title: "Project Management Best Practices for Engineers",
    category: "PROJECT MANAGEMENT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description: "Master essential project management skills from planning to stakeholder management.",
    href: "/blog/project-management-engineers",
  },
  {
    title: "Understanding Process Piping Systems",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description: "Comprehensive guide to process piping design including pipe sizing and materials selection.",
    href: "/blog/process-piping-systems",
  },
  {
    title: "AI and Machine Learning in Engineering Design",
    category: "ENGINEERING TECHNOLOGY",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description: "Discover how AI and ML are revolutionizing engineering through optimization and predictive analytics.",
    href: "/blog/ai-machine-learning-engineering",
  },
  {
    title: "Energy Efficiency in Industrial Processes",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description: "Comprehensive guide to improving energy efficiency through pinch analysis and waste heat recovery.",
    href: "/blog/energy-efficiency-industrial",
  },
  {
    title: "Career Development for Engineering Professionals",
    category: "CAREER DEVELOPMENT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description: "Strategic guidance for advancing your engineering career through certifications and networking.",
    href: "/blog/career-development-engineers",
  },
  {
    title: "Detailed Engineering: The Backbone of EPC Project Execution",
    category: "EPC LIFECYCLE",
    image: "/images/detailed-engineering-blog.jpeg",
    description: "Exploring the critical role of detailed engineering in ensuring constructability, efficiency, and cost control in EPC projects.",
    href: "/blog/detailed-engineering",
  },
  {
    title: "FEL Stages Explained: The Blueprint for Successful EPC Projects",
    category: "EPC LIFECYCLE",
    image: "/images/fel-stages-blog.jpeg",
    description: "Breaking down the Front-End Loading (FEL) stages and their role in minimizing risk and maximizing project success in EPC.",
    href: "/blog/fel-stages",
  },
  {
    title: "The Critical Role of Estimating in EPC: Accuracy, Risk, and Cost Control",
    category: "EPC LIFECYCLE",
    image: "/images/epc-estimating-blog.jpeg",
    description: "Understanding why precise estimation is the backbone of successful EPC project execution.",
    href: "/blog/epc-estimating",
  },
  {
    title: "Breaking Down the EPC Lifecycle: From Concept to Operation",
    category: "EPC LIFECYCLE",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thomas-werneken-2hC-ehLJIjg-unsplash%20(2).jpg-fmamlXgtD43e1ssjbkGTKnvFZCKLc7.jpeg",
    description: "A comprehensive guide to the Engineering, Procurement, and Construction lifecycle.",
    href: "/blog/epc-lifecycle",
  },
  {
    title: "The Current State of Engineering Technology: Progress, Gaps, and the Road Ahead",
    category: "ENGINEERING TECHNOLOGY",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description: "An in-depth analysis of engineering technology's current state and the path forward.",
    href: "/blog/engineering-technology",
  },
  {
    title: "The Communication Challenge in EPC Projects: Why It's a Make-or-Break Factor",
    category: "EPC LIFECYCLE",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description: "Explore how effective communication shapes EPC project success.",
    href: "/blog/epc-communication",
  },
]

export function RelatedArticles({ currentCategory, currentSlug }: RelatedArticlesProps) {
  // Filter and get related articles
  const relatedArticles = allBlogPosts
    .filter((post) => post.href !== `/blog/${currentSlug}`)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === currentCategory && b.category !== currentCategory) return -1
      if (b.category === currentCategory && a.category !== currentCategory) return 1
      return 0
    })
    .slice(0, 3)

  if (relatedArticles.length === 0) return null

  return (
    <div className="mt-16 pt-16 border-t border-black/10 dark:border-white/10">
      <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => {
          const slug = article.href.replace("/blog/", "")
          const imageUrl = getBlogImageUrl(slug) || article.image
          const altText = getBlogAltText(slug)
          return (
            <Link
              key={article.href}
              href={article.href}
              className="group block space-y-4"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg w-full">
                <OptimizedImage
                  src={imageUrl}
                  alt={altText}
                  fill
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">[{article.category}]</p>
              <h3 className="font-bold mb-2 group-hover:underline">{article.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
            </div>
          </Link>
          )
        })}
      </div>
    </div>
  )
}

