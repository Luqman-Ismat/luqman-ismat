import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SocialShare } from "./social-share"
import { RelatedArticles } from "./related-articles"
import { OptimizedImage } from "./optimized-image"
import { formatArticleDate } from "@/lib/articles"
import Link from "next/link"

interface BlogPostLayoutProps {
  title: string
  description: string
  image: string
  content: { sections: { title: string; content: string[] }[] }
  date?: string
  category?: string
  slug?: string
  sources?: { title: string; url: string }[]
}

export function BlogPostLayout({ title, description, image, content, date, category = "EPC LIFECYCLE", slug = "", sources }: BlogPostLayoutProps) {
  const currentUrl = `https://www.luqmanismat.com/blog/${slug}`
  const words = content.sections.reduce((total, section) => total + section.content.join(" ").split(/\s+/).length, 0)
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main id="article" className="pt-28 md:pt-36 pb-20">
        <article className="container px-5">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-block mb-10 text-base underline underline-offset-4">← All articles</Link>
            <p className="text-sm font-medium tracking-wider text-muted-foreground mb-5">{category}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] break-words">{title}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-6 leading-relaxed">{description}</p>
            <div className="flex flex-wrap items-center justify-between gap-5 py-6 my-8 border-y border-border">
              <div><p className="font-medium">Luqman Ismat</p><p className="text-sm text-muted-foreground mt-1">{date ? <time dateTime={date}>{formatArticleDate(date)}</time> : "From the archive"} · {Math.max(1, Math.ceil(words / 220))} min read</p></div>
              <SocialShare url={currentUrl} title={title} description={description} />
            </div>
            {image && <div className="relative aspect-[2/1] rounded-lg overflow-hidden mb-12"><OptimizedImage src={image} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" /></div>}
            <nav aria-label="Article contents" className="border-l-2 border-foreground pl-5 mb-12">
              <p className="font-semibold mb-3">In this article</p>
              <ol className="space-y-2">{content.sections.map((section, index) => <li key={index}><a className="text-muted-foreground hover:text-foreground underline underline-offset-4" href={`#section-${index + 1}`}>{section.title}</a></li>)}</ol>
            </nav>
            <div className="space-y-12">{content.sections.map((section, index) => (
              <section key={index} id={`section-${index + 1}`} className="scroll-mt-28">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5">{section.title}</h2>
                <div className="space-y-5">{section.content.map((paragraph, pIndex) => <p key={pIndex} className="text-lg leading-[1.85]">{paragraph}</p>)}</div>
              </section>
            ))}</div>
            {sources && <section className="border-t border-border mt-12 pt-8"><h2 className="text-2xl font-bold mb-4">References</h2><ul className="space-y-3">{sources.map(source => <li key={source.url}><a href={source.url} className="underline underline-offset-4">{source.title}</a></li>)}</ul></section>}
            <div className="mt-16">{slug && <RelatedArticles currentCategory={category} currentSlug={slug} />}</div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
