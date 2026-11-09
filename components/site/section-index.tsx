"use client";
import { useEffect, useRef, useState } from "react";

export type IndexItem = { id: string; no: string; label: string };

/* Sticky section index. Each entry's hairline fills as you read through its
   section; the current one is lit. */
export function SectionIndex({ items, title = "(Index)" }: { items: IndexItem[]; title?: string }) {
  const nav = useRef<HTMLElement>(null);
  const [on, setOn] = useState(items[0]?.id);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      let current = items[0]?.id;
      items.forEach((it) => {
        const el = document.getElementById(it.id);
        const a = nav.current?.querySelector<HTMLElement>(`a[href="#${it.id}"]`);
        if (!el || !a) return;
        const b = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.35 - b.top) / Math.max(1, b.height)));
        a.style.setProperty("--p", String(p));
        if (b.top < vh * 0.4) current = it.id;
      });
      setOn(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <aside className="idx">
      <nav ref={nav} aria-label="On this page">
        <p className="label">{title}</p>
        <ol>
          {items.map((it) => (
            <li key={it.id}>
              <a href={`#${it.id}`} className={on === it.id ? "is-on" : undefined} aria-current={on === it.id ? "true" : undefined}>
                <span className="label">{it.no}</span>
                <span>{it.label}</span>
                <i aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
