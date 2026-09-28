"use client";
import { useState } from "react";
import Link from "next/link";
export function VaultCatalog({
  items,
}: {
  items: { slug: string; title: string; category: string }[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = items.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      `${i.title} ${i.category} ${i.slug.replaceAll("-", " ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="vault-search">
        <label htmlFor="tool-search">Find a calculation</label>
        <input
          id="tool-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search beam, steam, pressure…"
        />
        <label htmlFor="tool-category">Discipline</label>
        <select
          id="tool-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["All", ...new Set(items.map((i) => i.category))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="vault-catalog-heading">
        <p role="status">{filtered.length} calculators</p>
        <Link href="/engivault/unit-converter">Open unit converter ↗</Link>
      </div>
      <div className="vault-catalog">
        {filtered.map((i) => (
          <Link
            href={
              i.slug === "unit-converter"
                ? "/engivault/unit-converter"
                : `/engivault/calculators/${i.slug}`
            }
            key={i.slug}
          >
            <span>{i.category}</span>
            <h2>{i.title}</h2>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </div>
      {!filtered.length && (
        <p className="vault-empty">
          No matching tools. Try another term or choose All disciplines.
        </p>
      )}
      <p className="vault-footnote">
        Review the assumptions and limits supplied with each calculation before
        applying its results.
      </p>
    </>
  );
}
