import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: "https://www.luqmanismat.com/sitemap.xml",
    host: "https://www.luqmanismat.com",
  }
}
