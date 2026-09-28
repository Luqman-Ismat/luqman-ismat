import Link from "next/link";
import { getArticles } from "@/lib/articles";
export function RelatedArticles({
  currentCategory,
  currentSlug,
}: {
  currentCategory: string;
  currentSlug: string;
}) {
  const articles = getArticles()
    .filter((p) => p.slug !== currentSlug)
    .sort(
      (a, b) =>
        Number(b.category === currentCategory) -
        Number(a.category === currentCategory),
    )
    .slice(0, 3);
  return (
    <section className="related-insights">
      <h2>Keep reading</h2>
      {articles.map((p) => (
        <Link key={p.slug} href={p.href}>
          <span>{p.category}</span>
          <h3>{p.title} ↗</h3>
        </Link>
      ))}
    </section>
  );
}
