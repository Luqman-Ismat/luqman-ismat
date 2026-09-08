import { getArticles, formatArticleDate } from "@/lib/articles"
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

const blogPosts = getArticles()

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
                  <p className="text-sm text-muted-foreground mb-3">{formatArticleDate(post.date)}</p>
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
