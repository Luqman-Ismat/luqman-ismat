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
      <div className="insight-filters">
        <div>
          <label htmlFor="article-query">Search</label>
          <input id="article-query" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="A topic or a title" />
        </div>
        <div>
          <label htmlFor="article-category">Topic</label>
          <select id="article-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="label result-count" role="status">
        ({String(filtered.length).padStart(2, "0")}) {filtered.length === 1 ? "Article" : "Articles"}
      </p>
      <ul className="jlist">
        {filtered.map((p) => (
          <li key={p.slug}>
            <Link href={p.href}>
              <span className="label j-cat">{p.category}</span>
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
