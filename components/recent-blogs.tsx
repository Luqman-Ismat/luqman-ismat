import { OptimizedImage } from "./optimized-image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getBlogImageUrl, getBlogAltText } from "@/app/blog/blog-pinterest-mapping"
import { Tilt } from "./tilt"
import { SpotlightCard } from "./spotlight-card"
import { StaggerOnView } from "./stagger-on-view"

type RecentBlog = {
  title: string
  category: string
  href: string
  slug: string
  date: string
  readMinutes: number
}

const RECENT_BLOGS: RecentBlog[] = [
  {
    title: "Quantifying Service Profitability: A CVP Analysis of Mobile Service Operations in Houston, TX",
    category: "PROJECT MANAGEMENT",
    href: "/blog/cvp-analysis-mobile-service-operations",
    slug: "cvp-analysis-mobile-service-operations",
    date: "2025-01-15T03:00:00.000Z",
    readMinutes: 9,
  },
  {
    title: "Process Safety Management in Industrial Settings",
    category: "PROCESS ENGINEERING",
    href: "/blog/process-safety-management",
    slug: "process-safety-management",
    date: "2025-10-11T12:00:00.000Z",
    readMinutes: 7,
  },
  {
    title: "The Role of Digital Twins in Modern Engineering",
    category: "ENGINEERING TECHNOLOGY",
    href: "/blog/digital-twins",
    slug: "digital-twins",
    date: "2025-10-11T13:00:00.000Z",
    readMinutes: 6,
  },
  {
    title: "Heat Exchanger Design and Selection Guide",
    category: "PROCESS ENGINEERING",
    href: "/blog/heat-exchanger-design",
    slug: "heat-exchanger-design",
    date: "2025-10-11T14:00:00.000Z",
    readMinutes: 8,
  },
  {
    title: "Project Management Best Practices for Engineers",
    category: "PROJECT MANAGEMENT",
    href: "/blog/project-management-engineers",
    slug: "project-management-engineers",
    date: "2025-10-11T15:00:00.000Z",
    readMinutes: 6,
  },
  {
    title: "Understanding Process Piping Systems",
    category: "PROCESS ENGINEERING",
    href: "/blog/process-piping-systems",
    slug: "process-piping-systems",
    date: "2025-10-11T16:00:00.000Z",
    readMinutes: 7,
  },
]

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})

export function RecentBlogs() {
  return (
    <section
      className="py-16 md:py-24 bg-background"
      aria-labelledby="recent-blogs-heading"
    >
      <div className="container px-4">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <p className="text-muted-foreground text-sm md:text-base">(Latest insights)</p>
          <p className="text-muted-foreground text-sm md:text-base font-mono">02</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12">
          <h2
            id="recent-blogs-heading"
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter"
          >
            RECENT
            <br />
            BLOGS
          </h2>
          <Link
            href="/blog"
            className="group mt-4 md:mt-0 inline-flex items-center gap-1.5 text-lg md:text-xl font-medium underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            View All Posts
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <StaggerOnView as="ul" role="list" step={80} selector=":scope > li" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {RECENT_BLOGS.map((blog) => {
            const imageUrl = getBlogImageUrl(blog.slug) || "/placeholder.svg"
            const altText = getBlogAltText(blog.slug)
            return (
              <li key={blog.href} className="list-none">
                <Link href={blog.href} className="group block focus:outline-none">
                  <SpotlightCard className="rounded-xl">
                  <Tilt maxTilt={4} className="relative aspect-[4/3] mb-4 overflow-hidden rounded-xl ring-1 ring-border/40 transition-shadow group-hover:ring-border group-focus-visible:ring-2 group-focus-visible:ring-ring">
                    <OptimizedImage
                      src={imageUrl}
                      alt={altText}
                      fill
                      className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Tilt>
                  </SpotlightCard>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-mono">[{blog.category}]</span>
                    <span aria-hidden="true">·</span>
                    <span>{blog.readMinutes} min read</span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                    {blog.title}
                  </h3>
                  <time className="text-sm text-muted-foreground" dateTime={blog.date}>
                    {DATE_FMT.format(new Date(blog.date))}
                  </time>
                </Link>
              </li>
            )
          })}
        </StaggerOnView>
      </div>
    </section>
  )
}
