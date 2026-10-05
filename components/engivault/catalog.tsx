"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type CatalogItem = { slug: string; title: string; category: string; inputs: number; results: number; lead: string };

const href = (slug: string) => (slug === "unit-converter" ? "/engivault/unit-converter" : `/engivault/calculators/${slug}`);

/* Searchable, keyboard-driven library. "/" or ⌘K focuses search; arrow keys
   move through results; Enter opens the highlighted tool. */
export function VaultCatalog({ items }: { items: CatalogItem[] }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cursor, setCursor] = useState(0);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) m.set(i.category, (m.get(i.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = items.filter((i) => {
    if (category !== "All" && i.category !== category) return false;
    const hay = `${i.title} ${i.category} ${i.slug.replaceAll("-", " ")} ${i.lead}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
  const at = Math.min(cursor, Math.max(0, filtered.length - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, select");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(Math.min(at + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(Math.max(at - 1, 0)); }
    else if (e.key === "Enter" && filtered[at]) { e.preventDefault(); router.push(href(filtered[at].slug)); }
    else if (e.key === "Escape") { setQuery(""); }
  };

  return (
    <section className="vault-library" aria-labelledby="vault-library-title">
      <div className="vault-command">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <label htmlFor="tool-search" className="sr-only">Find a calculation</label>
        <input
          ref={input}
          id="tool-search"
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
          onKeyDown={onSearchKey}
          placeholder={`Search ${items.length} calculations: steam, beam, NPSH, 4–20 mA…`}
          aria-controls="vault-results"
          aria-activedescendant={filtered[at] ? `tool-${filtered[at].slug}` : undefined}
          autoComplete="off"
        />
        <kbd aria-hidden="true">/</kbd>
      </div>

      <div className="vault-chips" role="radiogroup" aria-label="Discipline">
        {[["All", items.length] as const, ...counts].map(([c, n]) => (
          <button key={c} type="button" role="radio" aria-checked={category === c} onClick={() => { setCategory(c); setCursor(0); }}>
            {category === c && <motion.span layoutId="vault-chip" className="vault-chip-pill" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="vault-chip-label">{c}</span>
            <small>{n}</small>
          </button>
        ))}
      </div>

      <div className="vault-count">
        <h2 id="vault-library-title">The library</h2>
        <p role="status">{filtered.length} of {items.length} calculations · ↑ ↓ to move, Enter to open</p>
      </div>

      <motion.ul id="vault-results" className="vault-grid" layout={!reduced}>
        <AnimatePresence initial={false}>
          {filtered.map((i, k) => (
            <motion.li
              key={i.slug}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                id={`tool-${i.slug}`}
                href={href(i.slug)}
                className={k === at && query ? "vault-card is-cursor" : "vault-card"}
                data-cursor="Open"
                onPointerEnter={() => setCursor(k)}
              >
                <span className="vault-card-cat">{i.category}</span>
                <h3>{i.title}</h3>
                <p>{i.lead}</p>
                <span className="vault-card-io">
                  <b>{i.inputs}</b> in <i aria-hidden="true">→</i> <b>{i.results}</b> out
                </span>
                <span className="vault-card-arrow" aria-hidden="true">↗</span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {!filtered.length && (
        <p className="vault-empty">
          No matching calculation. Try another term or <button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>clear the filters</button>.
        </p>
      )}
      <p className="vault-footnote">Review the assumptions and limits supplied with each calculation before applying its results.</p>
    </section>
  );
}
