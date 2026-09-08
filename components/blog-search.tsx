import { getArticles } from "@/lib/articles"
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { OptimizedImage } from "./optimized-image"
import { getBlogImageUrl, getBlogAltText } from "@/app/blog/blog-pinterest-mapping"

const blogPosts = getArticles()

export function BlogSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(blogPosts.map(post => post.category)))

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              !selectedCategory
                ? "bg-foreground text-background"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-foreground text-background"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {filteredPosts.map((post) => {
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
                />
              </div>
            <div className="text-sm text-muted-foreground mb-2">[{post.category}]</div>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-muted-foreground">{post.description}</p>
          </Link>
          )
        })}
      </div>
    </div>
  )
}

