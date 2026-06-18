import { NextResponse } from "next/server"
import { BLOG_POSTS } from "@/app/blog/blog-posts"

const SITE = "https://www.luqmanismat.com"

function escape(s: string) {
  return s.replace(/[&<>'"]/g, (c) => {
    switch (c) {
      case "&": return "&amp;"
      case "<": return "&lt;"
      case ">": return "&gt;"
      case "'": return "&apos;"
      case '"': return "&quot;"
      default: return c
    }
  })
}

export const dynamic = "force-static"
export const revalidate = 3600

export async function GET() {
  const items = [...BLOG_POSTS]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((p) => {
      const url = `${SITE}${p.href}`
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <description><![CDATA[${p.description}]]></description>
      <author>noreply@luqmanismat.com (Luqman Ismat)</author>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Luqman Ismat — Engineering Blog</title>
    <link>${SITE}/blog</link>
    <description>EPC, process engineering, AI, and digital-twin essays by engineering consultant Luqman Ismat.</description>
    <language>en-US</language>
    <copyright>© Luqman Ismat</copyright>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
