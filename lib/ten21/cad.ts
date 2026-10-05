/* A small 2D CAD kernel for garment technical flats. Units are millimetres,
   origin at centre back neck / HPS line, y increasing downward. Geometry is
   authored as segments (straight or spline) and sampled into dense
   polylines, so offsets for topstitching and mirrored halves stay exact. */

export type P = [number, number];
export type Poly = P[];

export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
export const len = (a: P) => Math.hypot(a[0], a[1]);
export const norm = (a: P): P => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const mirror = (pts: Poly): Poly => pts.map(([x, y]) => [-x, y] as P);
export const reverse = (pts: Poly): Poly => [...pts].reverse();

/* Centripetal Catmull-Rom through the points, sampled densely. */
export function curve(...pts: P[]): Poly {
  if (pts.length < 3) return line(...pts);
  const out: Poly = [];
  const ext = [sub(mul(pts[0], 2), pts[1]), ...pts, sub(mul(pts[pts.length - 1], 2), pts[pts.length - 2])];
  for (let i = 1; i < ext.length - 2; i++) {
    const [p0, p1, p2, p3] = [ext[i - 1], ext[i], ext[i + 1], ext[i + 2]];
    const t0 = 0;
    const t1 = t0 + Math.sqrt(len(sub(p1, p0))) || 1e-4;
    const t2 = t1 + Math.sqrt(len(sub(p2, p1))) || t1 + 1e-4;
    const t3 = t2 + Math.sqrt(len(sub(p3, p2))) || t2 + 1e-4;
    const steps = Math.max(6, Math.ceil(len(sub(p2, p1)) / 6));
    for (let s = i === 1 ? 0 : 1; s <= steps; s++) {
      const t = t1 + ((t2 - t1) * s) / steps;
      const A1 = add(mul(p0, (t1 - t) / (t1 - t0)), mul(p1, (t - t0) / (t1 - t0)));
      const A2 = add(mul(p1, (t2 - t) / (t2 - t1)), mul(p2, (t - t1) / (t2 - t1)));
      const A3 = add(mul(p2, (t3 - t) / (t3 - t2)), mul(p3, (t - t2) / (t3 - t2)));
      const B1 = add(mul(A1, (t2 - t) / (t2 - t0)), mul(A2, (t - t0) / (t2 - t0)));
      const B2 = add(mul(A2, (t3 - t) / (t3 - t1)), mul(A3, (t - t1) / (t3 - t1)));
      out.push(add(mul(B1, (t2 - t) / (t2 - t1)), mul(B2, (t - t1) / (t2 - t1))));
    }
  }
  return out;
}

/* Straight segments, subdivided so offsets and clipping behave. */
export function line(...pts: P[]): Poly {
  const out: Poly = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const n = Math.max(1, Math.ceil(len(sub(pts[i + 1], pts[i])) / 40));
    for (let s = i === 0 ? 0 : 1; s <= n; s++) out.push(lerp(pts[i], pts[i + 1], s / n));
  }
  if (pts.length === 1) out.push(pts[0]);
  return out;
}

/* Concatenate segments, dropping duplicated joints. */
export function join(...segs: Poly[]): Poly {
  const out: Poly = [];
  for (const s of segs) for (const p of s) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(last[0] - p[0], last[1] - p[1]) > 0.01) out.push(p);
  }
  return out;
}

/* Parallel offset of an open polyline (positive = left of travel when y is down, i.e. visually right-hand normal flipped). */
export function offset(pts: Poly, d: number): Poly {
  const n = pts.length;
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const t = norm(sub(b, a));
    return [p[0] - t[1] * d, p[1] + t[0] * d] as P;
  });
}

/* Inset for closed polygons (mitred), independent of winding. */
export function inset(points: Poly, d: number): Poly {
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
    return { p: [p[0] + (-dy / l) * sign * d, p[1] + (dx / l) * sign * d] as P, dir: [dx, dy] as P };
  });
  return lines.map((a, i) => {
    const b = lines[(i - 1 + n) % n];
    const den = a.dir[0] * b.dir[1] - a.dir[1] * b.dir[0];
    if (Math.abs(den) < 1e-6) return a.p;
    const t = ((b.p[0] - a.p[0]) * b.dir[1] - (b.p[1] - a.p[1]) * b.dir[0]) / den;
    return [a.p[0] + a.dir[0] * t, a.p[1] + a.dir[1] * t] as P;
  });
}

/* Portion of a polyline between two arc-length fractions. */
export function slice(pts: Poly, from: number, to: number): Poly {
  const segs = pts.slice(1).map((p, i) => len(sub(p, pts[i])));
  const total = segs.reduce((a, b) => a + b, 0);
  const at = (f: number) => {
    let d = f * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i]) return { i, p: lerp(pts[i], pts[i + 1], segs[i] ? d / segs[i] : 0) };
      d -= segs[i];
    }
    return { i: segs.length - 1, p: pts[pts.length - 1] };
  };
  const a = at(from), b = at(to);
  return [a.p, ...pts.slice(a.i + 1, b.i + 1), b.p];
}

/* Point along a polyline at an arc-length fraction. */
export const pointAt = (pts: Poly, f: number): P => slice(pts, 0, f).slice(-1)[0];

/* x of a monotonic-in-y polyline at a given y (for placing details on seams). */
export function xAt(pts: Poly, y: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
  }
  return pts[pts.length - 1][0];
}

export const toPath = (pts: Poly, closed = false) =>
  pts.length ? "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + (closed ? "Z" : "") : "";

/* Sleeve hanging from a dropped shoulder point at an angle from vertical.
   Returns outer (overarm) and inner (underarm) seams and the cuff line,
   all running shoulder → cuff, for the wearer's left side (x > 0). */
export function sleeve(o: { shoulder: P; underarm: P; angle: number; length: number; cuff: number; bulge?: number; inner?: number }) {
  const a = (o.angle * Math.PI) / 180;
  const d: P = [Math.sin(a), Math.cos(a)];
  const n: P = [-Math.cos(a), Math.sin(a)];
  const cuffOuter = add(o.shoulder, mul(d, o.length));
  const cuffInner = add(cuffOuter, mul(n, o.cuff));
  const bulge = o.bulge ?? 18;
  const outer = curve(o.shoulder, add(lerp(o.shoulder, cuffOuter, 0.5), mul(n, -bulge)), cuffOuter);
  const innerMid = add(lerp(o.underarm, cuffInner, 0.5), mul(n, -(o.inner ?? 6)));
  const inner = curve(o.underarm, innerMid, cuffInner);
  return { outer, inner, cuffOuter, cuffInner, axis: d, across: n };
}

/* A line across the sleeve parallel to the cuff, `up` mm above it. */
export function sleeveBand(s: ReturnType<typeof sleeve>, up: number): Poly {
  const a = add(s.cuffOuter, mul(s.axis, -up));
  const b = add(s.cuffInner, mul(s.axis, -up));
  return line(add(a, mul(s.across, -2)), add(b, mul(s.across, 2)));
}
