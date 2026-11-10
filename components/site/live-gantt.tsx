"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* A schedule drawn by code: bars build in, dependencies draw, and a today
   line follows the pointer with a readout. Fictional work packages. */
const sets = [
[
  { n: "Front end loading", s: 0, d: 6, done: 1 },
  { n: "Detailed design", s: 4, d: 9, done: 1, dep: 0 },
  { n: "Procurement", s: 8, d: 10, done: 0.8, dep: 1 },
  { n: "Civil works", s: 11, d: 7, done: 0.6, dep: 1 },
  { n: "Mechanical install", s: 15, d: 8, done: 0.25, dep: 3 },
  { n: "Piping and E&I", s: 18, d: 8, done: 0.05, dep: 4 },
  { n: "Commissioning", s: 25, d: 4, done: 0, dep: 5 },
],
[
  { n: "Discovery", s: 0, d: 3, done: 1 },
  { n: "Design", s: 2, d: 5, done: 1, dep: 0 },
  { n: "Build, phase 1", s: 6, d: 8, done: 0.9, dep: 1 },
  { n: "Data migration", s: 9, d: 6, done: 0.5, dep: 2 },
  { n: "Build, phase 2", s: 14, d: 7, done: 0.3, dep: 2 },
  { n: "Training", s: 20, d: 3, done: 0, dep: 4 },
  { n: "Go live", s: 23, d: 2, done: 0, dep: 5 },
  { n: "Care period", s: 25, d: 5, done: 0, dep: 6 },
],
[
  { n: "Permit", s: 0, d: 4, done: 1 },
  { n: "Site prep", s: 3, d: 5, done: 1, dep: 0 },
  { n: "Foundations", s: 7, d: 6, done: 0.7, dep: 1 },
  { n: "Structure", s: 12, d: 8, done: 0.2, dep: 2 },
  { n: "Fit out", s: 19, d: 7, done: 0, dep: 3 },
  { n: "Handover", s: 26, d: 3, done: 0, dep: 4 },
],
];
const W = 760;
const ROW = 30;
const L = 170;
const T = 26;
const weeks = 30;
const xw = (w: number) => L + (w / weeks) * (W - L - 14);

export function LiveGantt({ compact = false, variant = 0 }: { compact?: boolean; variant?: number }) {
  const rows = sets[variant] ?? sets[0];
  const H = T + rows.length * ROW + 12;
  const root = useRef<SVGSVGElement>(null);
  const [today, setToday] = useState(variant === 1 ? 12.5 : variant === 2 ? 10 : 17.5);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top 85%", once: true };
      gsap.from(el.querySelectorAll(".lg-bar"), { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "expo.inOut", stagger: 0.09, scrollTrigger: st });
      gsap.from(el.querySelectorAll(".lg-done"), { scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "expo.out", stagger: 0.09, delay: 0.9, scrollTrigger: st });
      el.querySelectorAll<SVGPathElement>(".lg-dep").forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out", delay: 1.2 + i * 0.1, scrollTrigger: st });
      });
      gsap.from(el.querySelectorAll(".lg-name, .lg-week"), { opacity: 0, x: -8, duration: 1, stagger: 0.04, ease: "expo.out", scrollTrigger: st });
    });
    return () => ctx.revert();
  }, []);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setToday(Math.min(weeks, Math.max(0, ((px - L) / (W - L - 14)) * weeks)));
  };
  const late = rows.filter((r) => r.s + r.d * r.done < Math.min(today, r.s + r.d) - 0.5 && r.done < 1).length;

  return (
    <div className={compact ? "lg lg-compact" : "lg"}>
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} onPointerMove={move} onPointerLeave={() => setToday(17.5)} role="img" aria-label="A fictional project schedule with seven work packages, dependencies and progress.">
        {Array.from({ length: 7 }, (_, i) => i * 5).map((w) => (
          <g key={w}>
            <line className="lg-grid" x1={xw(w)} x2={xw(w)} y1={T - 6} y2={H - 8} />
            <text className="lg-week" x={xw(w)} y={T - 12} textAnchor="middle">
              W{w + 1}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = T + i * ROW + 8;
          return (
            <g key={r.n}>
              <text className="lg-name" x={L - 12} y={y + 11} textAnchor="end">
                {r.n}
              </text>
              <rect className="lg-bar" x={xw(r.s)} y={y} width={xw(r.s + r.d) - xw(r.s)} height={14} />
              <rect className="lg-done" x={xw(r.s)} y={y} width={(xw(r.s + r.d) - xw(r.s)) * r.done} height={14} />
              {r.dep !== undefined && (
                <path className="lg-dep" d={`M${xw(rows[r.dep].s + rows[r.dep].d)} ${T + r.dep * ROW + 15} h6 V${y + 7} H${xw(r.s)}`} />
              )}
            </g>
          );
        })}
        <g className="lg-today" style={{ transform: `translateX(${xw(today)}px)` }}>
          <line y1={T - 6} y2={H - 8} />
          <text y={H - 1} textAnchor="middle">
            W{Math.floor(today) + 1}
          </text>
        </g>
      </svg>
      <div className="lc-read" aria-live="polite">
        <span className="label">
          Status date <b>Week {Math.floor(today) + 1}</b>
        </span>
        <span className="label">
          Packages behind <b>{late}</b>
        </span>
        <span className="label">
          On critical path <b>5</b>
        </span>
      </div>
    </div>
  );
}
