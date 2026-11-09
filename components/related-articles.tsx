import Link from "next/link";
import { getArticles } from "@/lib/articles";

export function RelatedArticles({ currentCategory, currentSlug }: { currentCategory: string; currentSlug: string }) {
  const articles = getArticles()
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => Number(b.category === currentCategory) - Number(a.category === currentCategory))
    .slice(0, 3);
  return (
    <section className="sec related" aria-labelledby="related-title">
      <div className="sec-head">
        <p className="label">(Keep reading)</p>
        <h2 id="related-title" className="h-l sec-title" data-lines>
          More from the journal.
        </h2>
      </div>
      <ul className="jlist">
        {articles.map((p) => (
          <li key={p.slug}>
            <Link href={p.href}>
              <span className="label j-cat">{p.category}</span>
              <span className="j-title">{p.title}</span>
              <span className="label j-date" />
              <span className="j-go arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
