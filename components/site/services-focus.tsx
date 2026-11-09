"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/services";
import { Glyph } from "./glyphs";

/* A big typographic list. The row nearest the middle of the screen lights
   up and the card beside it swaps to that service. */
export function ServicesFocus() {
  const list = useRef<HTMLOListElement>(null);
  const [on, setOn] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rows = list.current?.querySelectorAll("li");
      if (!rows?.length) return;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let dist = Infinity;
      rows.forEach((r, i) => {
        const b = r.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - mid);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setOn(best);
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
  }, []);

  return (
    <div className="focus">
      <ol className="focus-list" ref={list}>
        {services.map((s, i) => (
          <li key={s.id} className={i === on ? "is-on" : undefined}>
            <Link href={`/services#${s.id}`} onFocus={() => setOn(i)} onMouseEnter={() => setOn(i)}>
              <span className="no">({s.no})</span>
              <span className="nm">{s.name}</span>
              <span className="go arrow" aria-hidden="true">↗</span>
              <span className="line-m">{s.line}</span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="focus-side" aria-hidden="true">
        <div className="focus-card">
          {services.map((s, i) => (
            <article key={s.id} className={i === on ? "is-on" : undefined}>
              <Glyph id={s.id} className="glyph" />
              <p className="label">({s.no}) {s.short}</p>
              <p className="body">{s.line}</p>
              <ul className="ticks">
                {s.deliverables.slice(0, 4).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <span className="label price">From: <b>{s.start}</b></span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
