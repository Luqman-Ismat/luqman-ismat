"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* A live chart drawn by code, not a chart library: weekly plan against
   actual for a fictional project, with a pointer-driven readout. */
const W = 640;
const H = 300;
const PAD = { l: 44, r: 16, t: 18, b: 34 };
const weeks = 26;
const plan = Array.from({ length: weeks }, (_, i) => Math.round(1000 * (1 - Math.exp(-i / 9))));
const actual = Array.from({ length: weeks }, (_, i) => {
  const base = 1000 * (1 - Math.exp(-(i - 1.2) / 10.5));
  const wobble = Math.sin(i * 1.7) * 28 + Math.cos(i * 0.6) * 18;
  return Math.max(0, Math.round(base + wobble));
});
const max = 1000;
const x = (i: number) => PAD.l + (i / (weeks - 1)) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

export function LiveChart() {
  const root = useRef<SVGSVGElement>(null);
  const [at, setAt] = useState(weeks - 1);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const lines = el.querySelectorAll<SVGPathElement>(".lc-line");
      lines.forEach((p) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.2, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
      gsap.from(el.querySelectorAll(".lc-grid line"), { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      gsap.from(el.querySelector(".lc-area"), { opacity: 0, duration: 1.6, delay: 1.2, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    return () => ctx.revert();
  }, []);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (weeks - 1));
    setAt(Math.min(weeks - 1, Math.max(0, i)));
  };
  const diff = actual[at] - plan[at];

  return (
    <div className="lc">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} onPointerMove={move} onPointerLeave={() => setAt(weeks - 1)} role="img" aria-label="Weekly progress against plan for a fictional project. Actual finishes 3 percent behind plan.">
        <g className="lc-grid">
          {[0, 250, 500, 750, 1000].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
              <text x={PAD.l - 8} y={y(v) + 3} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25].map((i) => (
            <text key={i} x={x(i)} y={H - 12} textAnchor="middle">
              W{i + 1}
            </text>
          ))}
        </g>
        <path className="lc-area" d={`${path(actual)} L${x(weeks - 1)} ${y(0)} L${x(0)} ${y(0)} Z`} />
        <path className="lc-line lc-plan" d={path(plan)} />
        <path className="lc-line lc-actual" d={path(actual)} />
        <g className="lc-cursor" style={{ transform: `translateX(${x(at)}px)` }}>
          <line y1={PAD.t} y2={H - PAD.b} />
          <circle cy={y(plan[at])} r="3.5" className="lc-dot-plan" />
          <circle cy={y(actual[at])} r="3.5" className="lc-dot-actual" />
        </g>
      </svg>
      <div className="lc-read" aria-live="polite">
        <span className="label">Week {at + 1}</span>
        <span className="label">
          Plan <b>{plan[at]}</b>
        </span>
        <span className="label">
          Actual <b>{actual[at]}</b>
        </span>
        <span className="label">
          Variance <b>{diff > 0 ? "+" : ""}{diff}</b>
        </span>
      </div>
    </div>
  );
}
