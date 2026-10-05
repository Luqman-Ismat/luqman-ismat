import { calculators } from "@/lib/engivault/calculator-data";
import { getArticles } from "@/lib/articles";
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { pieces } from "@/lib/ten21/collection";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...[
      "",
      "/controls",
      "/integrations",
      "/engineering",
      "/ten21",
      ...pieces.map((p) => `/ten21/${p.slug}`),
      "/engivault",
      "/engivault/unit-converter",
      ...Object.keys(calculators).map(
        (slug) => `/engivault/calculators/${slug}`,
      ),
      "/about",
      "/blog",
      "/contact",
      "/privacy",
    ].map((path) => ({
      url: site.url + path,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...getArticles().map((p) => ({
      url: site.url + p.href,
      ...(p.date ? { lastModified: p.date } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
