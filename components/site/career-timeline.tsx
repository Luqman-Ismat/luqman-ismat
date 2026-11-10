"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Role = { id: string; role: string; employer: string; start: string; end: string | null; kind: string };
const ym = (s: string | null) => {
  if (!s) return new Date().getFullYear() + (new Date().getMonth() + 0.5) / 12;
  const [y, m] = s.split("-").map(Number);
  return y + (m - 0.5) / 12;
};

/* Overlapping roles drawn as a timeline. The point: engineering and software
   ran in parallel, not in sequence. */
export function CareerTimeline({ roles }: { roles: Role[] }) {
  const root = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState<string | null>(null);
  const sorted = [...roles].sort((a, b) => a.start.localeCompare(b.start));
  const y0 = Math.floor(Math.min(...sorted.map((r) => ym(r.start))));
  const y1 = Math.ceil(Math.max(...sorted.map((r) => ym(r.end))));
  const W = 760, L = 20, T = 30, ROW = 40, H = T + sorted.length * ROW + 14;
  const x = (y: number) => L + ((y - y0) / (y1 - y0)) * (W - L - 20);
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: "top 80%", once: true as const };
      gsap.from(el.querySelectorAll(".ct-bar"), { scaleX: 0, transformOrigin: "left center", duration: 1.5, ease: "expo.inOut", stagger: 0.07, scrollTrigger: st });
      gsap.from(el.querySelectorAll(".ct-lbl"), { opacity: 0, x: -6, duration: 0.9, stagger: 0.06, ease: "expo.out", delay: 0.4, scrollTrigger: st });
      gsap.from(el.querySelectorAll(".ct-year"), { opacity: 0, y: -4, duration: 0.8, stagger: 0.08, scrollTrigger: st });
    });
    return () => ctx.revert();
  }, []);
  const cur = sorted.find((r) => r.id === on);
  return (
    <div className="lc ct">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Roles since 2022 drawn as overlapping bars on a timeline: engineering and software in parallel.">
        {Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i).map((y) => (
          <g key={y}>
            <line className="lg-grid" x1={x(y)} x2={x(y)} y1={T - 8} y2={H - 10} />
            <text className="lg-week ct-year" x={x(y)} y={T - 14} textAnchor="middle">{y}</text>
          </g>
        ))}
        {sorted.map((r, i) => {
          const y = T + i * ROW;
          const xs = x(ym(r.start)), xe = x(ym(r.end));
          return (
            <g key={r.id} className={`ct-row k-${r.kind.toLowerCase()}${on === r.id ? " is-on" : ""}`} onPointerEnter={() => setOn(r.id)} onPointerLeave={() => setOn(null)}>
              <rect className="rb-hit" x={0} y={y - 4} width={W} height={ROW} />
              <rect className="ct-bar" x={xs} y={y} width={Math.max(4, xe - xs)} height={12} rx={1} />
              <text className="ct-lbl" x={xs} y={y + 24}>{r.role}</text>
            </g>
          );
        })}
      </svg>
      <div className="lc-read" aria-live="polite">
        <span className="label">{cur ? `${cur.role}, ${cur.employer}` : "Hover or tap a bar"}</span>
        <span className="label">{cur ? cur.kind : `${sorted.filter((r) => r.kind === "Engineering").length} engineering, ${sorted.filter((r) => r.kind !== "Engineering").length} data and controls`}</span>
      </div>
    </div>
  );
}
