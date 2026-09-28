"use client";
import { useState } from "react";
import Link from "next/link";
type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  href: string;
  date?: string | null;
};
export function InsightsIndex({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const categories = [
    "All topics",
    ...new Set(articles.map((p) => p.category)),
  ];
  const filtered = articles.filter(
    (p) =>
      (category === "All topics" || p.category === category) &&
      `${p.title} ${p.description} ${p.category}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <div className="site-container insights-index">
      <div className="insight-filters">
        <div>
          <label htmlFor="article-query">Search insights</label>
          <input
            id="article-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a topic or title"
          />
        </div>
        <div>
          <label htmlFor="article-category">Topic</label>
          <select
            id="article-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="result-count" role="status">
        {filtered.length} {filtered.length === 1 ? "article" : "articles"}
      </p>
      <div className="insight-list">
        {filtered.map((post) => (
          <Link key={post.slug} href={post.href}>
            <span className="insight-category">
              {post.category}
              <small>
                {post.date
                  ? new Date(post.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      },
                    )
                  : "From the archive"}
              </small>
            </span>
            <div>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <div className="search-empty">
          <h2>No matching articles.</h2>
          <p>Try another term or browse all topics.</p>
          <button
            type="button"
            className="consulting-button secondary"
            onClick={() => {
              setQuery("");
              setCategory("All topics");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
