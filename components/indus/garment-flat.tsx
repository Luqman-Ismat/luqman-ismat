import type { Colourway, Callout } from "@/lib/indus/collection";
import { shapes, type Pt, type View, type Panel, type Line } from "@/lib/indus/shapes";
import { setareh, toi, gol, kap, runs } from "@/lib/indus/motifs";

/* Technical flat renderer. Corners sharper than ~55° stay crisp; everything
   else is smoothed with a Catmull-Rom spline so seams read as cloth. */
function path(points: Pt[], closed: boolean, smooth = true) {
  const n = points.length;
  if (!smooth || n < 3) return "M" + points.map((p) => p.join(" ")).join("L") + (closed ? "Z" : "");
  const at = (i: number) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  const corner = (i: number) => {
    if (!closed && (i === 0 || i === n - 1)) return true;
    const a = at(i - 1), b = at(i), c = at(i + 1);
    const v1 = [b[0] - a[0], b[1] - a[1]], v2 = [c[0] - b[0], c[1] - b[1]];
    const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1);
    return cos < Math.cos((55 * Math.PI) / 180);
  };
  let d = `M${at(0).join(" ")}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const t = 1 / 6;
    const c1 = corner(i) ? p1 : [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = corner(i + 1) ? p2 : [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${c1.join(" ")} ${c2.join(" ")} ${p2.join(" ")}`;
  }
  return d + (closed ? "Z" : "");
}

const isDark = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
};

/* Offsets a polygon inward by d (mitred), used to compose embroidery
   borders the way pakka panels are built: border, rule, field. */
function inset(points: Pt[], d: number): Pt[] {
  const n = points.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  const sign = area > 0 ? 1 : -1;
  const lines = points.map((p, i) => {
    const q = points[(i + 1) % n];
    const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    const nx = (-dy / l) * sign, ny = (dx / l) * sign;
    return { p: [p[0] + nx * d, p[1] + ny * d] as Pt, dir: [dx, dy] as Pt };
  });
  return lines.map((a, i) => {
    const b = lines[(i - 1 + n) % n];
    const den = a.dir[0] * b.dir[1] - a.dir[1] * b.dir[0];
    if (Math.abs(den) < 1e-6) return a.p;
    const t = ((b.p[0] - a.p[0]) * b.dir[1] - (b.p[1] - a.p[1]) * b.dir[0]) / den;
    return [a.p[0] + a.dir[0] * t, a.p[1] + a.dir[1] * t] as Pt;
  });
}

export const technical: Colourway = { id: "tech", name: "Technical", meaning: "Line", ground: "#ffffff", shade: "#ececec", threadA: "#4a4a4a", threadB: "#bcbcbc", threadC: "#ffffff", threadD: "#878787", mirror: "#e4e4e4" };

const CELL = 2.2;
export const motifs = { setareh: setareh(), toi: toi(), gol: gol(), kap: kap() };
export type MotifName = keyof typeof motifs;

function MotifPattern({ id, name, c }: { id: string; name: keyof typeof motifs; c: Colourway }) {
  const m = motifs[name];
  const colour = { a: c.threadA, b: c.threadB, c: c.threadC, d: c.threadD, m: c.threadC };
  const mirrors: [number, number][] = [];
  if (name === "setareh") mirrors.push([(m.w / 2) * CELL, (m.h / 2) * CELL]);
  return (
    <pattern id={`${id}-${name}`} width={m.w * CELL} height={m.h * CELL} patternUnits="userSpaceOnUse">
      {runs(m).map((r, i) => (
        <rect key={i} x={r.x * CELL} y={r.y * CELL} width={r.w * CELL + 0.05} height={CELL + 0.05} fill={colour[r.cell]} />
      ))}
      {mirrors.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={CELL * 2.6} fill={c.threadC} />
          <circle cx={x} cy={y} r={CELL * 1.9} fill={c.mirror} />
          <path d={`M${x - CELL} ${y - CELL * 0.4}a${CELL * 1.2} ${CELL * 1.2} 0 0 1 ${CELL * 1.4} -${CELL}`} stroke="#fff" strokeWidth=".7" fill="none" opacity=".9" />
        </g>
      ))}
    </pattern>
  );
}

function Patterns({ id, c }: { id: string; c: Colourway }) {
  return (
    <defs>
      {(Object.keys(motifs) as (keyof typeof motifs)[]).map((name) => <MotifPattern key={name} id={id} name={name} c={c} />)}
      <radialGradient id={`${id}-volume`} cx="50%" cy="34%" r="70%">
        <stop offset="0" stopColor="#fff" stopOpacity={isDark(c.ground) ? 0.09 : 0.22} />
        <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={isDark(c.ground) ? 0.35 : 0.16} />
      </radialGradient>
      <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
      {/* plain-weave texture */}
      <pattern id={`${id}-weave`} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 1.5h6M0 4.5h6" stroke={isDark(c.ground) ? "#fff" : "#000"} strokeWidth=".6" opacity=".07" />
        <path d="M1.5 0v6M4.5 0v6" stroke={isDark(c.ground) ? "#fff" : "#000"} strokeWidth=".6" opacity=".045" />
      </pattern>
    </defs>
  );
}

/* Pakka panels are built in layers: kap border, thread rule, a toi chain
   band on large panels, then the central field. */
function PanelShape({ panel, id, idx, c, ink }: { panel: Panel; id: string; idx: number; c: Colourway; ink: string }) {
  const d = path(panel.points, true, false);
  if (panel.kind === "band") return <path d={d} fill={c.shade} stroke={ink} strokeWidth="3" strokeLinejoin="round" />;
  if (panel.kind === "collar")
    return (
      <g>
        <path d={d} fill={isDark(c.ground) ? "#fff" : "#000"} opacity=".05" />
        <path d={d} fill="none" stroke={isDark(c.ground) ? "#fff" : "#000"} strokeWidth="1" opacity=".12" />
      </g>
    );
  const clip = `${id}-p${idx}`;
  const narrow = panel.kind === "toi" || panel.kind === "pado";
  const large = panel.kind === "jig" || panel.kind === "setareh";
  const field = panel.kind === "banzar" ? "gol" : narrow ? "toi" : "setareh";
  const k = narrow ? 7 : 11;
  const ring = (dd: number) => path(inset(panel.points, dd), true, false);
  return (
    <g>
      <clipPath id={clip}>
        <path d={d} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <path d={d} fill={c.threadA} />
        <path d={d} fill="none" stroke={`url(#${id}-kap)`} strokeWidth={k * 2} />
        <path d={ring(k + 1)} fill="none" stroke={c.threadC} strokeWidth="2.4" />
        {large ? (
          <>
            <path d={ring(k + 16)} fill="none" stroke={`url(#${id}-toi)`} strokeWidth="26" />
            <path d={ring(k + 30)} fill="none" stroke={c.threadC} strokeWidth="2.4" />
            <path d={ring(k + 31)} fill={`url(#${id}-${field})`} />
          </>
        ) : (
          <path d={ring(k + 2.2)} fill={`url(#${id}-${field})`} />
        )}
      </g>
      <path d={d} fill="none" stroke={ink} strokeWidth="2" strokeLinejoin="round" opacity=".8" />
    </g>
  );
}

function LineShape({ line, ink, c, filter }: { line: Line; ink: string; c: Colourway; filter?: string }) {
  const d = path(line.points, false, !!line.curve);
  switch (line.style) {
    case "seam":
      return <path d={d} fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />;
    case "edge":
      return <path d={d} fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />;
    case "stitch":
      return <path d={d} fill="none" stroke={ink} strokeWidth="1.6" strokeDasharray="7 6" opacity=".85" />;
    case "fold":
      return <path d={d} fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" opacity=".55" />;
    case "drape":
      return (
        <g filter={filter}>
          <path d={d} fill="none" stroke="#000" strokeWidth="26" strokeLinecap="round" opacity={isDark(c.ground) ? 0.4 : 0.14} transform="translate(14 0)" />
          <path d={d} fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" opacity={isDark(c.ground) ? 0.07 : 0.3} />
        </g>
      );
    case "raw":
      return <path d={d} fill="none" stroke={ink} strokeWidth="2.4" strokeDasharray="2 3 5 2" strokeLinecap="round" />;
  }
}

export function GarmentFlat({
  slug,
  view,
  colourway,
  mode = "rendered",
  callouts = [],
  showDims = false,
  activeCallout,
  className,
  title,
}: {
  slug: string;
  view: View;
  colourway: Colourway;
  mode?: "rendered" | "technical";
  callouts?: Callout[];
  showDims?: boolean;
  activeCallout?: number | null;
  className?: string;
  title?: string;
}) {
  const c = mode === "technical" ? technical : colourway;
  const shape = shapes[slug];
  const v = shape[view];
  const id = `g-${slug}-${view}-${c.id}-${mode[0]}`;
  const ink = mode === "technical" ? "#141414" : isDark(c.ground) ? "#a29c92" : "#2a2622";
  const rendered = mode === "rendered";
  const outline = path(v.outline, true);
  const [vx, vy, vw, vh] = shape.viewBox;
  return (
    <svg className={className} viewBox={`${vx} ${vy} ${vw} ${vh}`} role="img" aria-label={title ?? `${slug} ${view} technical flat`} xmlns="http://www.w3.org/2000/svg">
      <Patterns id={id} c={c} />
      <clipPath id={`${id}-clip`}>
        <path d={outline} />
      </clipPath>
      <path d={outline} fill={c.ground} />
      {rendered && <path d={outline} fill={`url(#${id}-weave)`} />}
      <g clipPath={`url(#${id}-clip)`}>
        {rendered && <path d={outline} fill={`url(#${id}-volume)`} />}
        {rendered && v.lines.filter((l) => l.style === "drape").map((l, i) => <LineShape key={i} line={l} ink={ink} c={c} filter={`url(#${id}-soft)`} />)}
        {v.panels.map((p, i) => <PanelShape key={i} idx={i} panel={p} id={id} c={c} ink={ink} />)}
        {v.lines.filter((l) => l.style !== "drape").map((l, i) => <LineShape key={i} line={l} ink={ink} c={c} />)}
      </g>
      {v.ties && (
        <g stroke={ink} strokeWidth="5" strokeLinecap="round" fill="none">
          {Array.from({ length: v.ties.length / 2 }, (_, i) => (
            <path key={i} d={path([v.ties![i * 2], v.ties![i * 2 + 1]], false)} />
          ))}
        </g>
      )}
      <path d={outline} fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      {showDims && (
        <g className="flat-dims">
          {v.dims.map((dim) => {
            const [x1, y1] = dim.from, [x2, y2] = dim.to;
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            return (
              <g key={dim.code}>
                <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="currentColor" strokeWidth="2" markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`} />
                <circle cx={mx} cy={my} r="22" fill="currentColor" />
                <text x={mx} y={my} dy="8" textAnchor="middle" fontSize="24" fontFamily="var(--font-mono)" fill="var(--flat-bg, #fff)">{dim.code}</text>
              </g>
            );
          })}
          <defs>
            <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" fill="currentColor" />
            </marker>
          </defs>
        </g>
      )}
      {callouts.filter((co) => co.view === view).map((co) => (
        <g key={co.n} className={activeCallout === co.n ? "flat-callout is-active" : "flat-callout"}>
          <circle cx={co.x} cy={co.y} r="26" />
          <text x={co.x} y={co.y} dy="9" textAnchor="middle">{co.n}</text>
        </g>
      ))}
    </svg>
  );
}

/* A motif shown at study scale, for the motif library and spec tables. */
export function MotifSwatch({ name, colourway: c, size = 220, className }: { name: keyof typeof motifs; colourway: Colourway; size?: number; className?: string }) {
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
