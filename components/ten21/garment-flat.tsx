"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import type { Colourway, Callout } from "@/lib/ten21/collection";
import { flats, type FlatView, type Line, type Piece, type Mark, type Dim } from "@/lib/ten21/flats";
import { toPath, inset, type P } from "@/lib/ten21/cad";
import { setareh, toi, gol, kap, runs } from "@/lib/ten21/motifs";

/* Technical flat renderer, following industry flat conventions:
   white fill, no shading; 2pt silhouette, 1pt edges, 0.75pt seams,
   0.5pt dashed topstitch with round caps, 0.3pt movement lines.
   One "pt" is scaled so every garment prints at the same weights. */

export type FlatMode = "technical" | "rendered";
type View = "front" | "back";

const isDark = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
};

export const technical: Colourway = { id: "tech", name: "Technical", meaning: "Line", ground: "#ffffff", shade: "#e2e2e2", threadA: "#4a4a4a", threadB: "#bcbcbc", threadC: "#ffffff", threadD: "#878787", mirror: "#e4e4e4" };

const CELL = 2.2;
export const motifs = { setareh: setareh(), toi: toi(), gol: gol(), kap: kap() };
export type MotifName = keyof typeof motifs;

/* Filled counted-thread motif (colourway flats and swatches). */
function MotifPattern({ id, name, c }: { id: string; name: MotifName; c: Colourway }) {
  const m = motifs[name];
  const colour = { a: c.threadA, b: c.threadB, c: c.threadC, d: c.threadD, m: c.threadC };
  return (
    <pattern id={`${id}-${name}`} width={m.w * CELL} height={m.h * CELL} patternUnits="userSpaceOnUse">
      {runs(m).map((r, i) => (
        <rect key={i} x={r.x * CELL} y={r.y * CELL} width={r.w * CELL + 0.05} height={CELL + 0.05} fill={colour[r.cell]} />
      ))}
      {name === "setareh" && (
        <g>
          <circle cx={(m.w / 2) * CELL} cy={(m.h / 2) * CELL} r={CELL * 2.6} fill={c.threadC} />
          <circle cx={(m.w / 2) * CELL} cy={(m.h / 2) * CELL} r={CELL * 1.9} fill={c.mirror} />
        </g>
      )}
    </pattern>
  );
}

/* Line-art motifs for technical flats: embroidery placement drawn as
   outline, the way artwork is indicated on a factory flat. */
function LineMotifs({ id, u, ink }: { id: string; u: number; ink: string }) {
  const sw = 0.32 * u;
  return (
    <>
      <pattern id={`${id}-l-setareh`} width="44" height="44" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round">
          <rect x="12" y="12" width="20" height="20" />
          <rect x="12" y="12" width="20" height="20" transform="rotate(45 22 22)" />
          <circle cx="22" cy="22" r="5" />
          <path d="M0 0l5 5M44 0l-5 5M0 44l5-5M44 44l-5-5" />
        </g>
      </pattern>
      <pattern id={`${id}-l-toi`} width="24" height="24" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round">
          <path d="M12 2 22 12 12 22 2 12Z" />
          <path d="M12 7 17 12 12 17 7 12Z" />
        </g>
      </pattern>
      <pattern id={`${id}-l-gol`} width="26" height="26" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round">
          <path d="M13 3 17 9 13 13 9 9ZM23 13 17 17 13 13 17 9ZM13 23 9 17 13 13 17 17ZM3 13 9 9 13 13 9 17Z" />
        </g>
      </pattern>
      <pattern id={`${id}-l-kap`} width="14" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 10 7 1 14 10" fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
      </pattern>
    </>
  );
}

function lineStyle(kind: Line["kind"], u: number, ink: string) {
  const base = { fill: "none", stroke: ink, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "edge": return { ...base, strokeWidth: 1.05 * u };
    case "seam": return { ...base, strokeWidth: 0.75 * u };
    case "stitch": return { ...base, strokeWidth: 0.5 * u, strokeDasharray: `${1.5 * u} ${1.5 * u}` };
    case "fold": return { ...base, strokeWidth: 0.6 * u };
    case "motion": return { ...base, strokeWidth: 0.3 * u, opacity: 0.85 };
    case "raw": return { ...base, strokeWidth: 0.9 * u, strokeDasharray: `${2.4 * u} ${0.8 * u} ${0.5 * u} ${0.8 * u}` };
    case "cord": return { ...base, strokeWidth: 1.6 * u };
  }
}

function PieceArt({ piece, id, idx, c, ink, paper, u, mode }: { piece: Piece; id: string; idx: number; c: Colourway; ink: string; paper: string; u: number; mode: FlatMode }) {
  const d = piece.fill ? toPath(piece.fill, true) : "";
  const kind = piece.kind ?? "body";
  const emb = kind.startsWith("emb-") ? (kind.slice(4) as MotifName) : null;
  const fill: string = mode === "technical" ? paper : kind === "inside" ? c.shade : c.ground;
  const clip = `${id}-c${idx}`;
  return (
    <g>
      {d && !emb && <path d={d} fill={fill} />}
      {d && kind === "inside" && mode === "technical" && <path d={d} fill={ink} opacity={0.14} />}
      {d && emb && mode === "technical" && (
        <>
          <path d={d} fill={paper} />
          <path d={toPath(inset(piece.fill!, 9), true)} fill={`url(#${id}-l-${emb})`} />
          <path d={toPath(inset(piece.fill!, 9), true)} fill="none" stroke={ink} strokeWidth={0.5 * u} />
        </>
      )}
      {d && emb && mode === "rendered" && (
        <>
          <clipPath id={clip}><path d={d} /></clipPath>
          <g clipPath={`url(#${clip})`}>
            <path d={d} fill={c.threadA} />
            <path d={d} fill="none" stroke={`url(#${id}-kap)`} strokeWidth="18" />
            <path d={toPath(inset(piece.fill!, 10), true)} fill={`url(#${id}-${emb === "kap" ? "toi" : emb})`} stroke={c.threadC} strokeWidth="2" />
          </g>
        </>
      )}
      {piece.lines.map((l, i) => {
        const s = lineStyle(l.kind, u, ink);
        if (l.kind === "cord") return (
          <g key={i}>
            <path d={toPath(l.pts)} {...s} />
            <path d={toPath(l.pts)} {...s} stroke={mode === "technical" ? paper : c.ground} strokeWidth={0.7 * u} />
          </g>
        );
        return <path key={i} d={toPath(l.pts, l.closed)} {...s} />;
      })}
    </g>
  );
}

function MarkArt({ m, u, ink, paper }: { m: Mark; u: number; ink: string; paper: string }) {
  const [x, y] = m.at;
  switch (m.kind) {
    case "button": {
      const r = m.r ?? 4 * u;
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={paper} stroke={ink} strokeWidth={0.75 * u} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => <circle key={i} cx={x + dx * r * 0.28} cy={y + dy * r * 0.28} r={r * 0.12} fill={ink} />)}
        </g>
      );
    }
    case "snap": {
      const r = m.r ?? 4 * u;
      return (
        <g fill="none" stroke={ink}>
          <circle cx={x} cy={y} r={r} strokeWidth={0.5 * u} strokeDasharray={`${1.2 * u} ${1 * u}`} />
          <circle cx={x} cy={y} r={r * 0.4} strokeWidth={0.5 * u} strokeDasharray={`${0.8 * u} ${0.8 * u}`} />
        </g>
      );
    }
    case "bartack": {
      const a = ((m.angle ?? 0) * Math.PI) / 180, l = 3.2 * u;
      return <path d={`M${x - Math.cos(a) * l} ${y - Math.sin(a) * l}L${x + Math.cos(a) * l} ${y + Math.sin(a) * l}`} stroke={ink} strokeWidth={1.5 * u} strokeLinecap="butt" />;
    }
    case "eyelet":
      return <g><circle cx={x} cy={y} r={2.6 * u} fill={paper} stroke={ink} strokeWidth={0.75 * u} /><circle cx={x} cy={y} r={1.2 * u} fill={ink} /></g>;
    case "knot":
      return (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${x} ${y}c${-6 * u} ${-4 * u} ${-9 * u} ${2 * u} ${-4 * u} ${4 * u}M${x} ${y}c${6 * u} ${-4 * u} ${9 * u} ${2 * u} ${4 * u} ${4 * u}`} fill={paper} strokeWidth={0.75 * u} />
          <ellipse cx={x} cy={y} rx={2.2 * u} ry={1.8 * u} fill={paper} strokeWidth={0.9 * u} />
          <path d={`M${x - u} ${y + 1.6 * u}l${-2 * u} ${16 * u}M${x + u} ${y + 1.6 * u}l${2.6 * u} ${13 * u}`} fill="none" strokeWidth={0.9 * u} />
        </g>
      );
  }
}

function DimArt({ dim, u, id }: { dim: Dim; u: number; id: string }) {
  const [x1, y1] = dim.from, [x2, y2] = dim.to;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const s = 5.2 * u;
  return (
    <g className="flat-dim">
      <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="currentColor" strokeWidth={0.5 * u} markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`} />
      <rect x={mx - s} y={my - s} width={s * 2} height={s * 2} rx={1.2 * u} fill="currentColor" />
      <text x={mx} y={my} dy={2.6 * u} textAnchor="middle" fontSize={7 * u} fontFamily="var(--font-mono, monospace)" fill="hsl(var(--card))">{dim.code}</text>
    </g>
  );
}

/* The garment drawing as a group, reused by the full flat, detail views and print sheets. */
export function FlatArt({ slug, view, colourway, mode = "technical", id, callouts = [], activeCallout, showDims = false, ink: inkOverride, paper }: {
  slug: string; view: View; colourway: Colourway; mode?: FlatMode; id: string; callouts?: Callout[]; activeCallout?: number | null; showDims?: boolean;
  /** Explicit colours for rasterising; on the page they follow the site theme. */
  ink?: string; paper?: string;
}) {
  const g = flats[slug];
  const v: FlatView = g[view];
  const u = g.viewBox[3] / 430;
  const c = mode === "technical" ? technical : colourway;
  const ink = mode === "technical" ? inkOverride ?? "hsl(var(--foreground))" : isDark(c.ground) ? "#bdb6a8" : "#1c1916";
  const paperC = paper ?? "hsl(var(--card))";
  return (
    <g>
      <defs>
        {(Object.keys(motifs) as MotifName[]).map((n) => <MotifPattern key={n} id={id} name={n} c={c} />)}
        <LineMotifs id={id} u={u} ink={ink} />
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 1 9 5 0 9z" fill="currentColor" />
        </marker>
      </defs>
      {/* silhouette: heavy stroke behind every fill; inner halves get painted over */}
      <g fill="none" stroke={ink} strokeWidth={3.4 * u} strokeLinejoin="round">
        {v.pieces.filter((p) => p.fill).map((p, i) => <path key={i} d={toPath(p.fill!, true)} />)}
      </g>
      {v.pieces.map((p, i) => <PieceArt key={i} piece={p} id={id} idx={i} c={c} ink={ink} paper={paperC} u={u} mode={mode} />)}
      {v.marks.map((m, i) => <MarkArt key={i} m={m} u={u} ink={ink} paper={paperC} />)}
      {showDims && v.dims.map((d) => <DimArt key={d.code} dim={d} u={u} id={id} />)}
      {callouts.filter((co) => co.view === view && v.anchors[co.anchor]).map((co) => {
        const [x, y] = v.anchors[co.anchor];
        return (
          <g key={co.n} className={activeCallout === co.n ? "flat-callout is-active" : "flat-callout"} style={{ ["--u" as string]: u }}>
            <circle cx={x} cy={y} r={7.5 * u} strokeWidth={1.2 * u} />
            <text x={x} y={y} dy={3 * u} textAnchor="middle" fontSize={8.5 * u}>{co.n}</text>
          </g>
        );
      })}
    </g>
  );
}

export function GarmentFlat({ slug, view, colourway, mode = "rendered", callouts = [], showDims = false, activeCallout, className, title, ink, paper }: {
  slug: string; view: View; colourway: Colourway; mode?: FlatMode; callouts?: Callout[]; showDims?: boolean; activeCallout?: number | null; className?: string; title?: string; ink?: string; paper?: string;
}) {
  const [vx, vy, vw, vh] = flats[slug].viewBox;
  const id = `f-${slug}-${view}-${colourway.id}-${mode[0]}`;
  return (
    <svg className={className} viewBox={`${vx} ${vy} ${vw} ${vh}`} role="img" aria-label={title ?? `${slug} ${view} technical flat`} xmlns="http://www.w3.org/2000/svg">
      <FlatArt slug={slug} view={view} colourway={colourway} mode={mode} id={id} callouts={callouts} activeCallout={activeCallout} showDims={showDims} ink={ink} paper={paper} />
    </svg>
  );
}

/* Magnified detail view: the same drawing, clipped to a circle and enlarged. */
export function FlatDetail({ slug, index, colourway, mode = "technical", className }: { slug: string; index: number; colourway: Colourway; mode?: FlatMode; className?: string }) {
  const d = flats[slug].details[index];
  const [cx, cy] = d.center as P;
  const id = `d-${slug}-${index}-${colourway.id}-${mode[0]}`;
  return (
    <svg className={className} viewBox={`${cx - d.r} ${cy - d.r} ${d.r * 2} ${d.r * 2}`} role="img" aria-label={`Detail: ${d.label}`}>
      <clipPath id={`${id}-clip`}><circle cx={cx} cy={cy} r={d.r * 0.98} /></clipPath>
      <circle cx={cx} cy={cy} r={d.r * 0.98} fill="hsl(var(--card))" />
      <g clipPath={`url(#${id}-clip)`}>
        <FlatArt slug={slug} view={d.view} colourway={colourway} mode={mode} id={id} />
      </g>
      <circle cx={cx} cy={cy} r={d.r * 0.98} fill="none" stroke="hsl(var(--foreground))" strokeWidth={d.r * 0.012} />
    </svg>
  );
}

/* A motif shown at study scale, for the motif library and spec tables. */
export function MotifSwatch({ name, colourway: c, size = 220, className }: { name: MotifName; colourway: Colourway; size?: number; className?: string }) {
  const id = `sw-${name}-${c.id}-${size}`;
  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${name} motif in ${c.name}`}>
      <defs>
        <MotifPattern id={id} name={name} c={c} />
      </defs>
      <rect width="110" height="110" fill={`url(#${id}-${name})`} transform={`scale(${size / 110})`} />
    </svg>
  );
}

/* ---------- exploded construction view ---------- */
function centroid(piece: Piece): P {
  const pts = piece.fill ?? piece.lines.flatMap((l) => l.pts);
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
}

/* The production flat as a living drawing: the outline draws itself in,
   then the garment can separate into its pieces, each labelled. Pieces
   highlight on hover. Follows the site theme. */
export function ExplodedFlat({
  slug, view, colourway, mode = "technical", exploded = false, callouts = [], activeCallout, showDims = false, className, title, onPiece,
}: {
  slug: string; view: View; colourway: Colourway; mode?: FlatMode; exploded?: boolean; callouts?: Callout[]; activeCallout?: number | null;
  showDims?: boolean; className?: string; title?: string; onPiece?: (name: string | null) => void;
}) {
  const g = flats[slug];
  const v = g[view];
  const [vx, vy, vw, vh] = g.viewBox;
  const u = vh / 430;
  const c = mode === "technical" ? technical : colourway;
  const ink = mode === "technical" ? "hsl(var(--foreground))" : isDark(c.ground) ? "#bdb6a8" : "#1c1916";
  const paper = "hsl(var(--card))";
  const id = `x-${slug}-${view}-${colourway.id}-${mode[0]}`;
  const root = useRef<SVGSVGElement>(null);
  const layers = useRef<(SVGGElement | null)[]>([]);
  const sils = useRef<(SVGGElement | null)[]>([]);
  const labels = useRef<SVGGElement>(null);
  const details = useRef<SVGGElement>(null);
  const state = useRef({ e: exploded ? 1 : 0 });
  const [hover, setHover] = useState<number | null>(null);

  // where each piece travels: away from the garment centre, further for the
  // outer layers. Labels sit in a column either side of the exploded drawing,
  // spaced so they never overlap, and the view pulls back to fit them.
  const fs = 7.5 * u;
  const geo = useMemo(() => {
    const cx = 0, cy = vy + vh / 2;
    const b = { x0: vx, x1: vx + vw, y0: vy, y1: vy + vh };
    const items = v.pieces.map((p) => {
      const pts = p.fill ?? p.lines.flatMap((l) => l.pts);
      const [x, y] = centroid(p);
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
      const k = 70 + d * 0.32;
      const off: P = [(dx / d) * k * 1.25, (dy / d) * k];
      for (const [px, py] of pts) {
        b.x0 = Math.min(b.x0, px + off[0]); b.x1 = Math.max(b.x1, px + off[0]);
        b.y0 = Math.min(b.y0, py + off[1]); b.y1 = Math.max(b.y1, py + off[1]);
      }
      const at: P = [x + off[0], y + off[1]];
      return { c: [x, y] as P, off, at, side: at[0] >= 0 ? 1 : -1, ly: at[1] };
    });
    const gap = 30 * u;
    const { x0, x1, y0, y1 } = b;
    const col = { [-1]: x0 - gap, [1]: x1 + gap } as Record<number, number>;
    for (const side of [-1, 1]) {
      const list = items.filter((q) => q.side === side).sort((a, b) => a.at[1] - b.at[1]);
      let prev = -Infinity;
      for (const q of list) { q.ly = Math.max(q.at[1], prev + fs * 1.8); prev = q.ly; }
      const over = prev - (y1 + fs);
      if (over > 0) for (const q of list) q.ly -= over;
    }
    const textW = Math.max(...v.names.map((n) => n.length + 3)) * fs * 0.62;
    const asm: [number, number, number, number] = [vx - 260, vy - 140, vw + 520, vh + 280];
    const ex0 = Math.min(asm[0], col[-1] - textW - 12 * u), ex1 = Math.max(asm[0] + asm[2], col[1] + textW + 12 * u);
    const ey0 = Math.min(asm[1], y0 - 24 * u), ey1 = Math.max(asm[1] + asm[3], y1 + 24 * u);
    const exp: [number, number, number, number] = [ex0, ey0, ex1 - ex0, ey1 - ey0];
    return { items, col, asm, exp };
  }, [v, vx, vy, vw, vh, u, fs]);

  const apply = () => {
    const e = state.current.e;
    const t = performance.now() / 1000;
    geo.items.forEach((q, i) => {
      const bob = e > 0.98 ? Math.sin(t * 1.2 + i) * 4 * u : 0;
      const tr = `translate(${(q.off[0] * e).toFixed(1)} ${(q.off[1] * e + bob).toFixed(1)})`;
      layers.current[i]?.setAttribute("transform", tr);
      sils.current[i]?.setAttribute("transform", tr);
    });
    const vb = geo.asm.map((a, k) => (a + (geo.exp[k] - a) * e).toFixed(1)).join(" ");
    root.current?.setAttribute("viewBox", vb);
    if (labels.current) labels.current.style.opacity = String(Math.max(0, (e - 0.55) / 0.45));
    if (details.current) details.current.style.opacity = String(Math.max(0, 1 - e * 2));
  };

  useLayoutEffect(() => {
    apply();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = animate(state.current, { e: exploded ? 1 : 0, duration: reduced ? 0 : 1150, ease: "inOutCubic", onUpdate: apply, onComplete: apply });
    return () => { a.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploded, geo]);

  // gentle float while exploded and on screen
  useEffect(() => {
    if (!exploded || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, on = true;
    const io = new IntersectionObserver(([en]) => { on = en.isIntersecting; });
    if (root.current) io.observe(root.current);
    const loop = () => { if (on && state.current.e > 0.98) apply(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploded, geo]);

  // outline draws itself in the first time the drawing is seen
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let done = false;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting || done) return;
      done = true;
      const paths = el.querySelectorAll(".xf-sil path");
      const drawn = svg.createDrawable(paths);
      const fade = el.querySelectorAll(".xf-art");
      fade.forEach((f) => ((f as SVGElement).style.opacity = "0"));
      const a = animate(drawn, { draw: ["0 0", "0 1"], duration: 1300, delay: stagger(60), ease: "inOutQuad", onComplete: () => a.revert() });
      animate(fade, { opacity: [0, 1], duration: 700, delay: stagger(50, { start: 600 }), ease: "outQuad", onComplete: () => fade.forEach((f) => ((f as SVGElement).style.opacity = "")) });
      io.disconnect();
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [slug, view, mode]);

  return (
    <svg ref={root} className={className ? `xflat ${className}` : "xflat"} viewBox={(exploded ? geo.exp : geo.asm).join(" ")} role="img" aria-label={title ?? `${slug} ${view} technical flat`}>
      <defs>
        {(Object.keys(motifs) as MotifName[]).map((n) => <MotifPattern key={n} id={id} name={n} c={c} />)}
        <LineMotifs id={id} u={u} ink={ink} />
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 1 9 5 0 9z" fill="currentColor" />
        </marker>
      </defs>
      <g className="xf-sil" fill="none" stroke={ink} strokeWidth={3.4 * u} strokeLinejoin="round">
        {v.pieces.map((p, i) => (
          <g key={i} ref={(r) => { sils.current[i] = r; }}>{p.fill && <path d={toPath(p.fill, true)} />}</g>
        ))}
      </g>
      {v.pieces.map((p, i) => (
        <g
          key={i}
          ref={(r) => { layers.current[i] = r; }}
          className={hover === i ? "xf-piece is-active" : "xf-piece"}
          onPointerEnter={() => { setHover(i); onPiece?.(v.names[i]); }}
          onPointerLeave={() => { setHover(null); onPiece?.(null); }}
        >
          <g className="xf-art"><PieceArt piece={p} id={id} idx={i} c={c} ink={ink} paper={paper} u={u} mode={mode} /></g>
          {p.fill && <path className="xf-hit" d={toPath(p.fill, true)} />}
        </g>
      ))}
      <g ref={details} className="xf-details">
        {v.marks.map((m, i) => <MarkArt key={i} m={m} u={u} ink={ink} paper={paper} />)}
        {showDims && v.dims.map((d) => <DimArt key={d.code} dim={d} u={u} id={id} />)}
        {callouts.filter((co) => co.view === view && v.anchors[co.anchor]).map((co) => {
          const [x, y] = v.anchors[co.anchor];
          return (
            <g key={co.n} className={activeCallout === co.n ? "flat-callout is-active" : "flat-callout"}>
              <circle cx={x} cy={y} r={7.5 * u} strokeWidth={1.2 * u} />
              <text x={x} y={y} dy={3 * u} textAnchor="middle" fontSize={8.5 * u}>{co.n}</text>
            </g>
          );
        })}
      </g>
      <g ref={labels} className="xf-labels" style={{ opacity: exploded ? 1 : 0 }}>
        {geo.items.map((q, i) => {
          const lx = geo.col[q.side], ly = q.ly;
          return (
            <g key={i} className={hover === i ? "is-active" : undefined}>
              <circle cx={q.at[0]} cy={q.at[1]} r={2.2 * u} />
              <path d={`M${q.at[0]} ${q.at[1]}L${lx - q.side * 10 * u} ${ly}H${lx}`} />
              <text x={lx + q.side * 4 * u} y={ly} dy={fs * 0.35} textAnchor={q.side > 0 ? "start" : "end"} fontSize={fs}>
                {String(i + 1).padStart(2, "0")} {v.names[i]}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
