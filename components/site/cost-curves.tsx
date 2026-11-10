"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Life-cycle cost against inspection interval for a few fictional tasks:
   failure cost falls as you inspect more often, inspection cost rises, and
   the sum has a minimum. Drag the interval and read the total. */
const W = 640;
const H = 300;
const PAD = { l: 44, r: 16, t: 18, b: 34 };
const N = 60;
const x = (i: number) => PAD.l + (i / (N - 1)) * (W - PAD.l - PAD.r);
const yv = (v: number, max: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
const ins = (t: number) => 120 / Math.max(0.35, t);
const fail = (t: number) => 18 * t * t * 0.55 + 10;
const tot = (t: number) => ins(t) + fail(t);
const ts = Array.from({ length: N }, (_, i) => 0.5 + (i / (N - 1)) * 7.5);
const MAX = 420;
const line = (f: (t: number) => number) => ts.map((t, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${yv(Math.min(MAX, f(t)), MAX).toFixed(1)}`).join(" ");

export function CostCurves() {
  const root = useRef<SVGSVGElement>(null);
  const [i, setI] = useState(22);
  const best = ts.reduce((b, t, k) => (tot(t) < tot(ts[b]) ? k : b), 0);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      el.querySelectorAll<SVGPathElement>(".cc-line").forEach((p, k) => {
        const len = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, delay: k * 0.25, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
      gsap.from(el.querySelector(".cc-best"), { scale: 0, transformOrigin: "center", duration: 1, delay: 1.8, ease: "elastic.out(1, 0.5)", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    return () => ctx.revert();
  }, []);

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setI(Math.min(N - 1, Math.max(0, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (N - 1)))));
  };
  const t = ts[i];

  return (
    <div className="lc cc">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} onPointerMove={move} onPointerLeave={() => setI(best)} role="img" aria-label="Life-cycle cost against inspection interval. Total cost is lowest at about a 2.6 year interval.">
        <g className="lc-grid">
          {[0, 100, 200, 300, 400].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={yv(v, MAX)} y2={yv(v, MAX)} />
              <text x={PAD.l - 8} y={yv(v, MAX) + 3} textAnchor="end">
                {v}k
              </text>
            </g>
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((yr) => (
            <text key={yr} x={x(((yr - 0.5) / 7.5) * (N - 1))} y={H - 12} textAnchor="middle">
              {yr}y
            </text>
          ))}
        </g>
        <path className="cc-line lc-plan" d={line(ins)} />
        <path className="cc-line lc-plan" d={line(fail)} />
        <path className="cc-line lc-actual" d={line(tot)} />
        <circle className="cc-best" cx={x(best)} cy={yv(tot(ts[best]), MAX)} r="5" />
        <g className="lc-cursor" style={{ transform: `translateX(${x(i)}px)` }}>
          <line y1={PAD.t} y2={H - PAD.b} />
          <circle cy={yv(Math.min(MAX, tot(t)), MAX)} r="3.5" className="lc-dot-actual" />
        </g>
      </svg>
      <div className="lc-read" aria-live="polite">
        <span className="label">
          Interval <b>{t.toFixed(1)} y</b>
        </span>
        <span className="label">
          Inspection <b>{Math.round(ins(t))}k</b>
        </span>
        <span className="label">
          Failure risk <b>{Math.round(fail(t))}k</b>
        </span>
        <span className="label">
          Total <b>{Math.round(tot(t))}k</b>
        </span>
        <span className="label">
          Optimum <b>{ts[best].toFixed(1)} y</b>
        </span>
      </div>
    </div>
  );
}
