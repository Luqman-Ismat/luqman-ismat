import { AnimatedHeader } from "./animated-header"
import { OptimizedImage } from "./optimized-image"
import Link from "next/link"
import { getBlogImageUrl, getBlogAltText } from "@/app/blog/blog-pinterest-mapping"
import { format } from "date-fns"

export function RecentBlogs() {
  // Get the 6 most recent blog posts with their actual dates
  const recentBlogs = [
    {
      title: "Quantifying Service Profitability: A CVP Analysis of Mobile Service Operations in Houston, TX",
      category: "PROJECT MANAGEMENT",
      href: "/blog/cvp-analysis-mobile-service-operations",
      slug: "cvp-analysis-mobile-service-operations",
      date: "2025-01-15T03:00:00.000Z",
    },
    {
      title: "Process Safety Management in Industrial Settings",
      category: "PROCESS ENGINEERING",
      href: "/blog/process-safety-management",
      slug: "process-safety-management",
      date: "2025-10-11T12:00:00.000Z",
    },
    {
      title: "The Role of Digital Twins in Modern Engineering",
      category: "ENGINEERING TECHNOLOGY",
      href: "/blog/digital-twins",
      slug: "digital-twins",
      date: "2025-10-11T13:00:00.000Z",
    },
    {
      title: "Heat Exchanger Design and Selection Guide",
      category: "PROCESS ENGINEERING",
      href: "/blog/heat-exchanger-design",
      slug: "heat-exchanger-design",
      date: "2025-10-11T14:00:00.000Z",
    },
    {
      title: "Project Management Best Practices for Engineers",
      category: "PROJECT MANAGEMENT",
      href: "/blog/project-management-engineers",
      slug: "project-management-engineers",
      date: "2025-10-11T15:00:00.000Z",
    },
    {
      title: "Understanding Process Piping Systems",
      category: "PROCESS ENGINEERING",
      href: "/blog/process-piping-systems",
      slug: "process-piping-systems",
      date: "2025-10-11T16:00:00.000Z",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <p className="text-muted-foreground text-sm md:text-base">(Latest insights)</p>
          <p className="text-muted-foreground text-sm md:text-base">(02)</p>
        </div>

        <AnimatedHeader>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              RECENT
              <br />
              BLOGS
            </h2>
            <Link
              href="/blog"
              className="text-foreground underline-offset-4 hover:underline font-medium mt-4 md:mt-0 text-lg md:text-xl"
            >
              View All Posts →
            </Link>
          </div>
        </AnimatedHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {recentBlogs.map((blog) => {
            const imageUrl = getBlogImageUrl(blog.slug) || "/placeholder.svg"
            const altText = getBlogAltText(blog.slug)
            
            return (
              <Link
                key={blog.href}
                href={blog.href}
                className="group block"
              >
                <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg">
                  <OptimizedImage
                    src={imageUrl}
                    alt={altText}
                    fill
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute bottom-4 right-4 bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div className="text-xs text-muted-foreground mb-2">[{blog.category}]</div>
                <h3 className="text-lg font-bold mb-2 group-hover:underline line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(blog.date), "MMMM d, yyyy")}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

