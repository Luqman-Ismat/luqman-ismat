import * as THREE from "three";

/* Procedural wireframe geometry. Everything is line segments, so the scene
   reads as a technical drawing and stays cheap to render. */

type Seg = number[];

function toGeometry(segs: Seg) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
  return g;
}

function ring(segs: Seg, at: (a: number) => [number, number, number], n = 48) {
  for (let i = 0; i < n; i++) {
    segs.push(...at((i / n) * Math.PI * 2), ...at(((i + 1) / n) * Math.PI * 2));
  }
}

/* Ground drafting grid spanning the whole journey. */
export function gridGeometry(length: number, width = 40, step = 1) {
  const s: Seg = [];
  for (let x = -width / 2; x <= width / 2; x += step) s.push(x, 0, 10, x, 0, -length);
  for (let z = 10; z >= -length; z -= step) s.push(-width / 2, 0, z, width / 2, 0, z);
  return toGeometry(s);
}

/* Intro: nested gyroscope rings around an icosahedral core. */
export function coreGeometry() {
  return new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.9, 1));
}
export function gyroRing(radius: number) {
  const s: Seg = [];
  ring(s, (a) => [Math.cos(a) * radius, Math.sin(a) * radius, 0], 96);
  // tick marks, like a dial
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r2 = radius - (i % 3 === 0 ? 0.14 : 0.07);
    s.push(Math.cos(a) * radius, Math.sin(a) * radius, 0, Math.cos(a) * r2, Math.sin(a) * r2, 0);
  }
  return toGeometry(s);
}

/* Project controls: an illustrative schedule. start/length in weeks. */
export const scheduleBars = [
  { start: 0, len: 3, row: 0, critical: true },
  { start: 2, len: 4, row: 1, critical: false },
  { start: 3, len: 5, row: 2, critical: true },
  { start: 5, len: 3, row: 3, critical: false },
  { start: 8, len: 4, row: 4, critical: true },
  { start: 9, len: 2, row: 5, critical: false },
  { start: 12, len: 3, row: 6, critical: true },
];
export const WEEK = 0.26;
export const ROW = 0.42;
export function scheduleFrame() {
  const s: Seg = [];
  const w = 15 * WEEK;
  const h = scheduleBars.length * ROW;
  // week columns
  for (let i = 0; i <= 15; i++) s.push(i * WEEK, 0, 0, i * WEEK, -h, 0);
  // row lines
  for (let r = 0; r <= scheduleBars.length; r++) s.push(0, -r * ROW, 0, w, -r * ROW, 0);
  // dependency links between consecutive critical bars
  const crit = scheduleBars.filter((b) => b.critical);
  for (let i = 0; i < crit.length - 1; i++) {
    const a = crit[i], b = crit[i + 1];
    const ax = (a.start + a.len) * WEEK, ay = -a.row * ROW - ROW / 2;
    const bx = b.start * WEEK, by = -b.row * ROW - ROW / 2;
    s.push(ax, ay, 0.06, ax + 0.08, ay, 0.06, ax + 0.08, ay, 0.06, ax + 0.08, by, 0.06, ax + 0.08, by, 0.06, bx, by, 0.06);
  }
  return toGeometry(s);
}
export function boxEdges(w: number, h: number, d: number) {
  return new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
}

/* Integrations: source nodes on a shell, curved routes into a database. */
export function integrationLayout() {
  const nodes: THREE.Vector3[] = [];
  const n = 11;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    nodes.push(new THREE.Vector3(-2 + Math.cos(phi) * r * 1.1, y * 1.3, Math.sin(phi) * r * 1.1));
  }
  const db = new THREE.Vector3(2.1, 0, 0);
  const curves = nodes.map(
    (p) => new THREE.QuadraticBezierCurve3(p, new THREE.Vector3((p.x + db.x) / 2, p.y * 0.4 + 1.2 * Math.sign(p.y || 1), p.z * 0.5), db.clone().add(new THREE.Vector3(-0.75, p.y * 0.35, 0))),
  );
  return { nodes, db, curves };
}
export function curvesGeometry(curves: THREE.Curve<THREE.Vector3>[]) {
  const s: Seg = [];
  for (const c of curves) {
    const pts = c.getPoints(40);
    for (let i = 0; i < pts.length - 1; i++) s.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
  }
  return toGeometry(s);
}
export function databaseGeometry() {
  const s: Seg = [];
  const r = 0.75;
  for (let k = 0; k < 4; k++) {
    const y = 0.9 - k * 0.6;
    ring(s, (a) => [Math.cos(a) * r, y, Math.sin(a) * r], 48);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    s.push(Math.cos(a) * r, 0.9, Math.sin(a) * r, Math.cos(a) * r, -0.9, Math.sin(a) * r);
  }
  return toGeometry(s);
}

/* Engineering: shell-and-tube heat exchanger, horizontal along x. */
export const EX = { length: 4.2, shellR: 0.62, tubeR: 0.42 };
export const tubeOffsets: [number, number][] = (() => {
  const out: [number, number][] = [[0, 0]];
  for (let i = 0; i < 6; i++) out.push([Math.cos((i / 6) * Math.PI * 2) * 0.22, Math.sin((i / 6) * Math.PI * 2) * 0.22]);
  for (let i = 0; i < 12; i++) out.push([Math.cos((i / 12) * Math.PI * 2 + 0.26) * 0.44, Math.sin((i / 12) * Math.PI * 2 + 0.26) * 0.44]);
  return out;
})();
/* The exchanger as separable sub-assemblies, so it can be exploded. */
export function exchangerParts() {
  const L = EX.length / 2, R = EX.shellR;
  const shell: Seg = [], heads: Seg = [], baffles: Seg = [], nozzles: Seg = [], saddles: Seg = [], sheets: Seg = [];
  for (let k = 0; k <= 8; k++) {
    const x = -L + (k / 8) * EX.length;
    ring(shell, (a) => [x, Math.cos(a) * R, Math.sin(a) * R], 40);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    shell.push(-L, Math.cos(a) * R, Math.sin(a) * R, L, Math.cos(a) * R, Math.sin(a) * R);
  }
  for (const side of [-1, 1]) {
    for (let k = 1; k <= 4; k++) {
      const t = k / 4;
      const x = side * (L + t * 0.45);
      const r = R * Math.sqrt(1 - t * t * 0.92);
      ring(heads, (a) => [x, Math.cos(a) * r, Math.sin(a) * r], 32);
    }
    for (const [y, z] of tubeOffsets) ring(sheets, (a) => [side * L, y + Math.cos(a) * 0.05, z + Math.sin(a) * 0.05], 10);
  }
  for (let k = 1; k < 6; k++) {
    const x = -L + (k / 6) * EX.length;
    const up = k % 2 === 0 ? 1 : -1;
    baffles.push(x, up * R * 0.98, -R * 0.2, x, -up * R * 0.3, -R * 0.2, x, -up * R * 0.3, -R * 0.2, x, -up * R * 0.3, R * 0.2, x, -up * R * 0.3, R * 0.2, x, up * R * 0.98, R * 0.2);
  }
  const nozzle = (x: number, y0: number, dir: number, r = 0.16, h = 0.45) => {
    for (const yy of [y0, y0 + dir * h]) ring(nozzles, (a) => [x + Math.cos(a) * r, yy, Math.sin(a) * r], 20);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      nozzles.push(x + Math.cos(a) * r, y0, Math.sin(a) * r, x + Math.cos(a) * r, y0 + dir * h, Math.sin(a) * r);
    }
  };
  nozzle(-L + 0.5, R * 0.8, 1);
  nozzle(L - 0.5, -R * 0.8, -1);
  for (const x of [-L + 0.7, L - 0.7]) {
    const y0 = -R, y1 = -R - 0.45;
    saddles.push(x - 0.35, y1, -0.5, x + 0.35, y1, -0.5, x + 0.35, y1, -0.5, x + 0.35, y1, 0.5, x + 0.35, y1, 0.5, x - 0.35, y1, 0.5, x - 0.35, y1, 0.5, x - 0.35, y1, -0.5);
    saddles.push(x, y0, -0.45, x, y1, -0.5, x, y0, 0.45, x, y1, 0.5, x - 0.35, y1, 0, x, y0 - 0.02, 0, x + 0.35, y1, 0, x, y0 - 0.02, 0);
  }
  return { shell: toGeometry(shell), heads: toGeometry(heads), baffles: toGeometry(baffles), nozzles: toGeometry(nozzles), saddles: toGeometry(saddles), sheets: toGeometry(sheets) };
}
export function tubesGeometry() {
  const s: Seg = [];
  const L = EX.length / 2;
  for (const [y, z] of tubeOffsets) s.push(-L, y, z, L, y, z);
  return toGeometry(s);
}

/* About: a wireframe globe with Houston marked. */
export const HOUSTON = { lat: 29.76, lon: -95.37 };
export function latLon(lat: number, lon: number, r: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}
export function globeGeometry(r = 1.5) {
  const s: Seg = [];
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = r * Math.sin(THREE.MathUtils.degToRad(lat));
    const rr = r * Math.cos(THREE.MathUtils.degToRad(lat));
    ring(s, (a) => [Math.cos(a) * rr, y, Math.sin(a) * rr], 64);
  }
  for (let lon = 0; lon < 360; lon += 15) {
    for (let lat = -90; lat < 90; lat += 5) {
      const a = latLon(lat, lon, r), b = latLon(lat + 5, lon, r);
      s.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return toGeometry(s);
}

/* Contact: a portal of concentric tilted rings. */
export function portalGeometry() {
  const s: Seg = [];
  for (let k = 0; k < 7; k++) {
    const r = 1 + k * 0.32;
    ring(s, (a) => [Math.cos(a) * r, Math.sin(a) * r, -k * 0.18], 96);
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    s.push(Math.cos(a), Math.sin(a), 0, Math.cos(a) * 2.92, Math.sin(a) * 2.92, -6 * 0.18);
  }
  return toGeometry(s);
}

/* Flat "plates": small line-art panels that slide out of a station when it
   explodes. Each one stands for a component on the chapter page. Size W×H. */
export const PLATE = { w: 1.9, h: 1.2 };
export type PlateKind = "gantt" | "heatmap" | "import" | "forecast" | "risk" | "mapping" | "bars" | "line" | "scatter" | "shield" | "curve" | "loop";
export function plateGeometry(kind: PlateKind) {
  const s: Seg = [];
  const W = PLATE.w / 2, H = PLATE.h / 2;
  const box = (x0: number, y0: number, x1: number, y1: number) => s.push(x0, y0, 0, x1, y0, 0, x1, y0, 0, x1, y1, 0, x1, y1, 0, x0, y1, 0, x0, y1, 0, x0, y0, 0);
  box(-W, -H, W, H);
  // title strip
  s.push(-W, H - 0.16, 0, W, H - 0.16, 0);
  s.push(-W + 0.08, H - 0.08, 0, -W + 0.5, H - 0.08, 0);
  const iw = W - 0.14, top = H - 0.28, bot = -H + 0.14;
  const X = (f: number) => -iw + f * iw * 2, Y = (f: number) => bot + f * (top - bot);
  switch (kind) {
    case "gantt":
      for (let r = 0; r < 6; r++) { const a = 0.05 + r * 0.12, b = a + 0.25 + (r % 3) * 0.1; box(X(a), Y(0.9 - r * 0.15) - 0.03, X(b), Y(0.9 - r * 0.15) + 0.03); }
      break;
    case "heatmap":
      for (let c = 0; c <= 8; c++) s.push(X(c / 8), Y(0), 0, X(c / 8), Y(1), 0);
      for (let r = 0; r <= 4; r++) s.push(X(0), Y(r / 4), 0, X(1), Y(r / 4), 0);
      break;
    case "import":
      for (let k = 0; k < 3; k++) { const o = k * 0.07; box(X(0.12) + o, Y(0.1) - o, X(0.62) + o, Y(0.95) - o); }
      for (let r = 0; r < 4; r++) s.push(X(0.7), Y(0.8 - r * 0.18), 0, X(0.96), Y(0.8 - r * 0.18), 0);
      break;
    case "forecast": {
      let px = X(0), py = Y(0.1);
      for (let i = 1; i <= 20; i++) { const f = i / 20, x = X(f), y = Y(0.1 + f * 0.7 + Math.sin(f * 7) * 0.05); s.push(px, py, 0, x, y, 0); px = x; py = y; }
      for (let i = 0; i < 20; i += 2) s.push(X(i / 20), Y(0.55), 0, X((i + 1) / 20), Y(0.55), 0);
      break;
    }
    case "risk":
      for (let c = 0; c <= 5; c++) s.push(X(c / 5 * 0.62), Y(0), 0, X(c / 5 * 0.62), Y(1), 0);
      for (let r = 0; r <= 5; r++) s.push(X(0), Y(r / 5), 0, X(0.62), Y(r / 5), 0);
      for (let r = 0; r < 4; r++) s.push(X(0.7), Y(0.85 - r * 0.22), 0, X(0.98 - (r % 2) * 0.1), Y(0.85 - r * 0.22), 0);
      break;
    case "mapping":
      for (let r = 0; r < 4; r++) { box(X(0), Y(0.82 - r * 0.24) - 0.04, X(0.28), Y(0.82 - r * 0.24) + 0.04); box(X(0.72), Y(0.82 - ((r + 1) % 4) * 0.24) - 0.04, X(1), Y(0.82 - ((r + 1) % 4) * 0.24) + 0.04); s.push(X(0.28), Y(0.82 - r * 0.24), 0, X(0.72), Y(0.82 - ((r + 1) % 4) * 0.24), 0); }
      break;
    case "bars":
      s.push(X(0), Y(0), 0, X(1), Y(0), 0);
      for (let i = 0; i < 7; i++) { const h = 0.3 + ((i * 37) % 60) / 100; box(X(0.04 + i * 0.14), Y(0), X(0.1 + i * 0.14), Y(h)); }
      break;
    case "line": {
      s.push(X(0), Y(0), 0, X(1), Y(0), 0, X(0), Y(0), 0, X(0), Y(1), 0);
      let px = X(0), py = Y(0.3);
      for (let i = 1; i <= 16; i++) { const f = i / 16, x = X(f), y = Y(0.3 + Math.sin(f * 5) * 0.2 + f * 0.3); s.push(px, py, 0, x, y, 0); px = x; py = y; }
      break;
    }
    case "scatter":
      s.push(X(0), Y(0), 0, X(1), Y(0), 0, X(0), Y(0), 0, X(0), Y(1), 0);
      for (let i = 0; i < 14; i++) { const x = X(0.05 + ((i * 53) % 90) / 100), y = Y(0.1 + ((i * 29) % 80) / 100); s.push(x - 0.025, y, 0, x + 0.025, y, 0, x, y - 0.025, 0, x, y + 0.025, 0); }
      break;
    case "shield": {
      const cx = 0, cy = Y(0.5), r = (top - bot) * 0.45;
      const pts: [number, number][] = [[0, r], [r * 0.8, r * 0.6], [r * 0.7, -r * 0.3], [0, -r], [-r * 0.7, -r * 0.3], [-r * 0.8, r * 0.6], [0, r]];
      for (let i = 0; i < pts.length - 1; i++) s.push(cx + pts[i][0], cy + pts[i][1], 0, cx + pts[i + 1][0], cy + pts[i + 1][1], 0);
      s.push(cx - r * 0.3, cy, 0, cx - r * 0.05, cy - r * 0.3, 0, cx - r * 0.05, cy - r * 0.3, 0, cx + r * 0.4, cy + r * 0.3, 0);
      break;
    }
    case "curve": {
      s.push(X(0), Y(0), 0, X(1), Y(0), 0, X(0), Y(0), 0, X(0), Y(1), 0);
      let px = X(0), py = Y(0.05);
      for (let i = 1; i <= 24; i++) { const f = i / 24, x = X(f), y = Y(0.05 + Math.pow(f, 2.4) * 0.9); s.push(px, py, 0, x, y, 0); px = x; py = y; }
      for (let i = 0; i < 20; i += 2) s.push(X(i / 20), Y(0.72), 0, X((i + 1) / 20), Y(0.72), 0);
      break;
    }
    case "loop":
      box(X(0.02), Y(0.3), X(0.16), Y(0.95));
      s.push(X(0.09), Y(0.3), 0, X(0.09), Y(0.1), 0, X(0.09), Y(0.1), 0, X(0.4), Y(0.1), 0);
      ring(s, (a) => [X(0.45) + Math.cos(a) * 0.08, Y(0.1) + Math.sin(a) * 0.08, 0], 20);
      s.push(X(0.45), Y(0.18), 0, X(0.45), Y(0.6), 0, X(0.45), Y(0.6), 0, X(0.62), Y(0.6), 0);
      box(X(0.62), Y(0.5), X(0.9), Y(0.7));
      s.push(X(0.9), Y(0.6), 0, X(1), Y(0.6), 0);
      break;
  }
  return toGeometry(s);
}
