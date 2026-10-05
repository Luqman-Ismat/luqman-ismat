import type { Colourway, Callout } from "@/lib/indus/collection";
import { flats, type FlatView, type Line, type Piece, type Mark, type Dim } from "@/lib/indus/flats";
import { toPath, inset, type P } from "@/lib/indus/cad";
import { setareh, toi, gol, kap, runs } from "@/lib/indus/motifs";

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

function PieceArt({ piece, id, idx, c, ink, u, mode }: { piece: Piece; id: string; idx: number; c: Colourway; ink: string; u: number; mode: FlatMode }) {
  const d = piece.fill ? toPath(piece.fill, true) : "";
  const kind = piece.kind ?? "body";
  const emb = kind.startsWith("emb-") ? (kind.slice(4) as MotifName) : null;
  let fill: string = c.ground;
  if (kind === "inside") fill = mode === "technical" ? "#dcdcdc" : c.shade;
  const clip = `${id}-c${idx}`;
  return (
    <g>
      {d && !emb && <path d={d} fill={fill} />}
      {d && emb && mode === "technical" && (
        <>
          <path d={d} fill="#fff" />
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
            <path d={toPath(l.pts)} {...s} stroke={c.ground} strokeWidth={0.7 * u} />
          </g>
        );
        return <path key={i} d={toPath(l.pts, l.closed)} {...s} />;
      })}
    </g>
  );
}

function MarkArt({ m, u, ink, c }: { m: Mark; u: number; ink: string; c: Colourway }) {
  const [x, y] = m.at;
  switch (m.kind) {
    case "button": {
      const r = m.r ?? 4 * u;
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill={c.ground} stroke={ink} strokeWidth={0.75 * u} />
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
      return <g><circle cx={x} cy={y} r={2.6 * u} fill={c.ground} stroke={ink} strokeWidth={0.75 * u} /><circle cx={x} cy={y} r={1.2 * u} fill={ink} /></g>;
    case "knot":
      return (
        <g stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${x} ${y}c${-6 * u} ${-4 * u} ${-9 * u} ${2 * u} ${-4 * u} ${4 * u}M${x} ${y}c${6 * u} ${-4 * u} ${9 * u} ${2 * u} ${4 * u} ${4 * u}`} fill={c.ground} strokeWidth={0.75 * u} />
          <ellipse cx={x} cy={y} rx={2.2 * u} ry={1.8 * u} fill={c.ground} strokeWidth={0.9 * u} />
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
      <text x={mx} y={my} dy={2.6 * u} textAnchor="middle" fontSize={7 * u} fontFamily="var(--font-mono, monospace)" fill="var(--flat-bg, #fff)">{dim.code}</text>
    </g>
  );
}

/* The garment drawing as a group, reused by the full flat, detail views and print sheets. */
export function FlatArt({ slug, view, colourway, mode = "technical", id, callouts = [], activeCallout, showDims = false }: {
  slug: string; view: View; colourway: Colourway; mode?: FlatMode; id: string; callouts?: Callout[]; activeCallout?: number | null; showDims?: boolean;
}) {
  const g = flats[slug];
  const v: FlatView = g[view];
  const u = g.viewBox[3] / 430;
  const c = mode === "technical" ? technical : colourway;
  const ink = mode === "technical" ? "#151515" : isDark(c.ground) ? "#bdb6a8" : "#1c1916";
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
      {v.pieces.map((p, i) => <PieceArt key={i} piece={p} id={id} idx={i} c={c} ink={ink} u={u} mode={mode} />)}
      {v.marks.map((m, i) => <MarkArt key={i} m={m} u={u} ink={ink} c={c} />)}
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

export function GarmentFlat({ slug, view, colourway, mode = "rendered", callouts = [], showDims = false, activeCallout, className, title }: {
  slug: string; view: View; colourway: Colourway; mode?: FlatMode; callouts?: Callout[]; showDims?: boolean; activeCallout?: number | null; className?: string; title?: string;
}) {
  const [vx, vy, vw, vh] = flats[slug].viewBox;
  const id = `f-${slug}-${view}-${colourway.id}-${mode[0]}`;
  return (
    <svg className={className} viewBox={`${vx} ${vy} ${vw} ${vh}`} role="img" aria-label={title ?? `${slug} ${view} technical flat`} xmlns="http://www.w3.org/2000/svg">
      <FlatArt slug={slug} view={view} colourway={colourway} mode={mode} id={id} callouts={callouts} activeCallout={activeCallout} showDims={showDims} />
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
      <circle cx={cx} cy={cy} r={d.r * 0.98} fill="#fff" />
      <g clipPath={`url(#${id}-clip)`}>
        <FlatArt slug={slug} view={d.view} colourway={colourway} mode={mode} id={id} />
      </g>
      <circle cx={cx} cy={cy} r={d.r * 0.98} fill="none" stroke="#151515" strokeWidth={d.r * 0.012} />
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
