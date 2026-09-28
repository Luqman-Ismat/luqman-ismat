import { calculators } from "@/lib/engivault/calculator-data";
import { getArticles } from "@/lib/articles";
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...[
      "",
      "/about",
      "/portfolio",
      "/demos/project-controls",
      "/demos/inspection-planning",
      "/demos/connected-operations",
      "/consulting",
      "/consulting/project-controls",
      "/consulting/dashboards",
      "/consulting/integrations",
      "/engivault",
      "/engivault/unit-converter",
      ...Object.keys(calculators).map(
        (slug) => `/engivault/calculators/${slug}`,
      ),
      "/engineering",
      "/indus-blue",
      "/projects",
      "/projects/engivault",
      "/projects/field-01",
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
