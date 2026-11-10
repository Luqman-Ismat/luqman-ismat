"use client";
import { useState } from "react";
import Link from "next/link";

type Article = { slug: string; title: string; description: string; category: string; href: string; date?: string | null };

const date = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "Archive";

export function InsightsIndex({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const categories = ["All topics", ...new Set(articles.map((p) => p.category))];
  const q = query.toLowerCase().trim();
  const filtered = articles.filter(
    (p) => (category === "All topics" || p.category === category) && `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(q),
  );
  return (
    <div className="sec" style={{ paddingTop: "clamp(56px, 7vw, 110px)" }}>
      {!q && category === "All topics" && articles[0] && (
        <Link href={articles[0].href} className="j-feature" data-fade>
          <span className="label">(Latest) {articles[0].category}</span>
          <span className="j-feature-title">{articles[0].title}</span>
          <span className="body">{articles[0].description}</span>
          <span className="label">
            {date(articles[0].date)} <span className="arrow" aria-hidden="true">↗</span>
          </span>
        </Link>
      )}
      <div className="insight-filters">
        <div className="topics" role="group" aria-label="Topic">
          {categories.map((c) => {
            const n = c === "All topics" ? articles.length : articles.filter((a) => a.category === c).length;
            return (
              <button key={c} type="button" className={c === category ? "topic is-on" : "topic"} aria-pressed={c === category} onClick={() => setCategory(c)}>
                {c} <span>{String(n).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
        <div>
          <label htmlFor="article-query" className="sr-only">Search</label>
          <input id="article-query" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a topic or a title" />
        </div>
      </div>
      <p className="label result-count" role="status">
        ({String(filtered.length).padStart(2, "0")}) {filtered.length === 1 ? "Article" : "Articles"}
      </p>
      <ul className="jlist">
        {filtered.map((p, i) => (
          <li key={p.slug}>
            <Link href={p.href}>
              <span className="label j-cat">
                <b>{String(i + 1).padStart(2, "0")}</b> {p.category}
              </span>
              <span className="j-title">
                {p.title}
                <span className="j-desc">{p.description}</span>
              </span>
              <span className="label j-date">{date(p.date)}</span>
              <span className="j-go arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
      {!filtered.length && (
        <div className="search-empty">
          <p className="h-m">Nothing matches that.</p>
          <div className="action-row">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setQuery("");
                setCategory("All topics");
              }}
            >
              Clear search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
