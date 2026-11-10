"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/* The article's own shape, drawn by code: one bar per section, length by
   word count, in place of a stock photograph. */
export function ArticleFigure({ sections, category }: { sections: { title: string; words: number }[]; category: string }) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll(".af-bar"), { scaleX: 0, transformOrigin: "left center", duration: 1.6, ease: "expo.inOut", stagger: 0.09, delay: 0.3 });
      gsap.from(el.querySelectorAll(".af-t, .af-n"), { opacity: 0, x: -8, duration: 1, ease: "expo.out", stagger: 0.07, delay: 0.6 });
      gsap.from(el.querySelector(".af-rule"), { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "expo.out" });
    });
    return () => ctx.revert();
  }, []);
  const W = 1200, L = 40, T = 70, ROW = 34;
  const H = T + sections.length * ROW + 30;
  const max = Math.max(...sections.map((s) => s.words), 1);
  const total = sections.reduce((t, s) => t + s.words, 0);
  return (
    <div className="af">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`The article's ${sections.length} sections, drawn as bars by length.`}>
        <text className="af-h" x={L} y={34}>{category}</text>
        <text className="af-h" x={W - L} y={34} textAnchor="end">{sections.length} sections · {total.toLocaleString()} words</text>
        <line className="af-rule" x1={L} x2={W - L} y1={46} y2={46} />
        {sections.map((s, i) => {
          const y = T + i * ROW;
          const w = ((W - L - 420) * s.words) / max;
          return (
            <g key={i}>
              <text className="af-n" x={L} y={y + 12}>{String(i + 1).padStart(2, "0")}</text>
              <text className="af-t" x={L + 40} y={y + 12}>{s.title.length > 44 ? s.title.slice(0, 42) + "…" : s.title}</text>
              <rect className="af-bar" x={L + 380} y={y} width={Math.max(3, w)} height={12} />
              <text className="af-n" x={L + 380 + w + 10} y={y + 11}>{s.words}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
