import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import { OptimizedImage } from "@/components/optimized-image"
import { LetterStagger } from "@/components/letter-stagger"
import { SpotlightCard } from "@/components/spotlight-card"
import { StaggerOnView } from "@/components/stagger-on-view"
import { Tilt } from "@/components/tilt"
import { BlogCategoryFilter } from "@/components/blog-category-filter"
import { ArrowUpRight, Rss } from "lucide-react"
import { getBlogImageUrl, getBlogAltText } from "./blog-pinterest-mapping"
import { itemListSchema, breadcrumbSchema } from "@/lib/schema"
import { BLOG_POSTS, BLOG_CATEGORIES } from "./blog-posts"

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

const blogPosts = BLOG_POSTS

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
            <p className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-2xl">
              Insights on EPC, current trends in engineering, and ideas to elevate the field — by Luqman Ismat.
            </p>
            <div className="mb-10 flex items-center gap-3">
              <Link
                href="/feed.xml"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition hover:border-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="RSS feed for Luqman Ismat's blog"
              >
                <Rss className="h-3.5 w-3.5" /> RSS
              </Link>
            </div>
            <BlogCategoryFilter categories={BLOG_CATEGORIES} />
            <StaggerOnView
              as="ul"
              role="list"
              step={70}
              selector=":scope > li"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-blog-list
            >
              {blogPosts.map((post, index) => {
                const slug = post.href.replace("/blog/", "")
                const imageUrl = getBlogImageUrl(slug) || post.image || "/placeholder.svg"
                const altText = getBlogAltText(slug)
                return (
                  <li key={post.title} data-category={post.category} className="list-none">
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
