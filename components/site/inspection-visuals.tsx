"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useReveal = (root: React.RefObject<SVGSVGElement | null>, fn: (el: SVGSVGElement) => void) => {
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => fn(el));
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
const st = (el: Element) => ({ trigger: el, start: "top 85%", once: true as const });

/* Saving available per task from moving it to its optimum interval. Fictional. */
const tasks = [
  ["T-104 Exchanger E-101 tubes", 2.0, 3.6, 142],
  ["T-220 Vessel V-101 shell", 3.0, 4.8, 97],
  ["T-311 Pump P-101 bearings", 1.0, 1.4, 61],
  ["T-087 Valve FV-104 trim", 2.0, 2.6, 38],
  ["T-142 Piping loop A", 5.0, 6.2, 24],
  ["T-199 Relief PSV-12", 1.0, 1.2, 15],
  ["T-233 Instrument loop", 2.0, 2.1, 6],
  ["T-260 Drain header", 4.0, 4.0, 0],
] as const;
export function RankBars() {
  const root = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(0);
  useReveal(root, (el) => {
    gsap.from(el.querySelectorAll(".rb-bar"), { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "expo.inOut", stagger: 0.08, scrollTrigger: st(el) });
    gsap.from(el.querySelectorAll(".rb-name, .rb-val"), { opacity: 0, x: -6, duration: 0.9, stagger: 0.06, ease: "expo.out", scrollTrigger: st(el) });
  });
  const W = 640, ROW = 30, L = 210, T = 14;
  const H = T + tasks.length * ROW + 6;
  const max = tasks[0][3];
  const t = tasks[on];
  return (
    <div className="lc">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Eight fictional inspection tasks ranked by the saving available from moving to their optimum interval.">
        {tasks.map((r, i) => {
          const y = T + i * ROW;
          const w = ((W - L - 70) * r[3]) / max;
          return (
            <g key={r[0]} className={i === on ? "rb is-on" : "rb"} onPointerEnter={() => setOn(i)}>
              <rect className="rb-hit" x={0} y={y - 4} width={W} height={ROW} />
              <text className="rb-name" x={L - 12} y={y + 12} textAnchor="end">{r[0]}</text>
              <rect className="rb-bar" x={L} y={y} width={Math.max(2, w)} height={14} />
              <text className="rb-val" x={L + w + 8} y={y + 12}>{r[3]}k</text>
            </g>
          );
        })}
      </svg>
      <div className="lc-read" aria-live="polite">
        <span className="label">{t[0]}</span>
        <span className="label">Now <b>{t[1].toFixed(1)} y</b></span>
        <span className="label">Optimum <b>{t[2].toFixed(1)} y</b></span>
        <span className="label">Saving <b>{t[3]}k</b></span>
      </div>
    </div>
  );
}

/* Two scenarios compared by decision type. Fictional. */
const kinds = ["Pull in", "Defer", "Keep", "Add task", "Eng. scope"];
const A = [15, 0, 8, 7, 6];
const Bv = [21, 2, 4, 7, 6];
export function ScenarioCompare() {
  const root = useRef<SVGSVGElement>(null);
  useReveal(root, (el) => {
    gsap.from(el.querySelectorAll(".sc-bar"), { scaleY: 0, transformOrigin: "bottom", duration: 1.3, ease: "expo.inOut", stagger: 0.06, scrollTrigger: st(el) });
    gsap.from(el.querySelectorAll(".sc-delta"), { opacity: 0, y: 6, duration: 0.8, delay: 1, stagger: 0.08, scrollTrigger: st(el) });
  });
  const W = 640, H = 300, L = 40, base = 250, max = 24, gw = (W - L - 20) / kinds.length;
  const yv = (v: number) => base - (v / max) * 200;
  return (
    <div className="lc">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Decision counts for two fictional scenarios: baseline planning and earlier intervention.">
        {[0, 8, 16, 24].map((v) => (
          <g key={v} className="lc-grid">
            <line x1={L} x2={W - 20} y1={yv(v)} y2={yv(v)} />
            <text x={L - 8} y={yv(v) + 3} textAnchor="end">{v}</text>
          </g>
        ))}
        {kinds.map((k, i) => {
          const x0 = L + i * gw + gw * 0.2;
          const bw = gw * 0.25;
          const d = Bv[i] - A[i];
          return (
            <g key={k}>
              <rect className="sc-bar sc-a" x={x0} y={yv(A[i])} width={bw} height={base - yv(A[i])} />
              <rect className="sc-bar sc-b" x={x0 + bw + 6} y={yv(Bv[i])} width={bw} height={base - yv(Bv[i])} />
              <text className="lc-grid sc-k" x={x0 + bw + 3} y={base + 18} textAnchor="middle">{k}</text>
              <text className="sc-delta" x={x0 + bw + 3} y={yv(Math.max(A[i], Bv[i])) - 8} textAnchor="middle">{d > 0 ? "+" : ""}{d}</text>
            </g>
          );
        })}
      </svg>
      <div className="lc-read">
        <span className="label"><i className="sw sw-a" /> Baseline planning · 1001</span>
        <span className="label"><i className="sw sw-b" /> Earlier intervention · 1002</span>
        <span className="label">Delta <b>+6 pulled in, 4 fewer kept</b></span>
      </div>
    </div>
  );
}

/* A workbook drawing itself: the shape of the export. */
export function SheetDraw() {
  const root = useRef<SVGSVGElement>(null);
  useReveal(root, (el) => {
    gsap.from(el.querySelectorAll(".sd-row"), { scaleX: 0, transformOrigin: "left", duration: 1, ease: "expo.inOut", stagger: 0.07, scrollTrigger: st(el) });
    gsap.from(el.querySelectorAll(".sd-cell"), { opacity: 0, duration: 0.6, stagger: 0.012, delay: 0.5, scrollTrigger: st(el) });
  });
  const cols = ["Task", "Train", "Asset", "Now", "Optimum", "Saving", "Decision"];
  const rows = tasks.slice(0, 7).map((t, i) => [t[0].split(" ")[0], ["TR-1", "TR-2", "TR-1", "TR-3", "TR-2", "TR-1", "TR-3"][i], t[0].split(" ")[1], `${t[1].toFixed(1)} y`, `${t[2].toFixed(1)} y`, `${t[3]}k`, t[3] > 20 ? "Pull in" : "Keep"]);
  const W = 640, H = 300, L = 12, T = 30, RH = 32, cw = (W - 24) / cols.length;
  return (
    <div className="lc">
      <svg ref={root} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The shape of the exported cost and benefit workbook: one row per task with its current and optimum interval, saving and decision.">
        <g className="sd-row" style={{ transformOrigin: "left" }}>
          <line x1={L} x2={W - 12} y1={T + 8} y2={T + 8} className="sd-rule strong" />
        </g>
        {cols.map((c, i) => (
          <text key={c} className="sd-cell sd-head" x={L + i * cw + 6} y={T}>{c}</text>
        ))}
        {rows.map((r, ri) => (
          <g key={ri}>
            <line className="sd-row sd-rule" x1={L} x2={W - 12} y1={T + 8 + (ri + 1) * RH} y2={T + 8 + (ri + 1) * RH} />
            {r.map((v, ci) => (
              <text key={ci} className={ci === 6 && v === "Pull in" ? "sd-cell acc-fill" : "sd-cell"} x={L + ci * cw + 6} y={T + 8 + ri * RH + 21}>{v}</text>
            ))}
          </g>
        ))}
      </svg>
      <div className="lc-read">
        <span className="label">cost-benefit.xlsx <b>7 of 312 rows</b></span>
        <span className="label">model-import.xlsx <b>Ready</b></span>
        <span className="label">Scenario <b>1002</b></span>
      </div>
    </div>
  );
}
