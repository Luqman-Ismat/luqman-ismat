import existingArticles from "@/content/articles.json"
import newArticles from "@/content/new-articles.json"

export function getArticles() {
  return [...existingArticles, ...newArticles].sort((a, b) =>
    (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0) || a.slug.localeCompare(b.slug)
  )
}

export function formatArticleDate(date?: string | null) {
  if (!date) return "From the archive"
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(date))
}
