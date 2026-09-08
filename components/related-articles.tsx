import { getArticles } from "@/lib/articles"
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
const allBlogPosts = getArticles()

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

