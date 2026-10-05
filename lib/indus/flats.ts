/* Collection 01 technical flats, built from base-size (M) measurements in
   millimetres. Each view is a stack of pieces painted back to front; each
   piece owns its fill and the lines drawn on it, so overlaps (wrap fronts,
   sleeves over body, the inside of the back neck) occlude correctly. */
import {
  type P, type Poly, curve, line, join, offset, inset, mirror, reverse, slice, sleeve, sleeveBand, add,
} from "./cad";

export type LineKind = "edge" | "seam" | "stitch" | "fold" | "motion" | "raw" | "cord";
export type Line = { pts: Poly; kind: LineKind; closed?: boolean };
export type FillKind = "body" | "inside" | "band" | "emb-setareh" | "emb-toi" | "emb-gol" | "emb-kap";
export type Piece = { fill?: Poly; kind?: FillKind; lines: Line[] };
export type Mark = { kind: "button" | "snap" | "bartack" | "eyelet" | "knot"; at: P; r?: number; angle?: number };
export type Dim = { code: string; from: P; to: P; side?: 1 | -1 };
export type FlatView = { pieces: Piece[]; marks: Mark[]; dims: Dim[]; anchors: Record<string, P> };
export type Detail = { label: string; view: "front" | "back"; center: P; r: number };
export type GarmentFlats = { viewBox: [number, number, number, number]; front: FlatView; back: FlatView; details: Detail[] };

const L = (pts: Poly, kind: LineKind, closed = false): Line => ({ pts, kind, closed });
const both = (pts: Poly) => [pts, mirror(pts)];
/* Offset that always moves toward the garment interior (ref), whatever the
   direction the seam was drawn in. */
function inward(pts: Poly, d: number, ref: P = [0, 400]): Poly {
  const a = offset(pts, Math.abs(d)), m = pts[Math.floor(pts.length / 2)], ma = a[Math.floor(a.length / 2)];
  const dist = (q: P) => Math.hypot(q[0] - ref[0], q[1] - ref[1]);
  return dist(ma) < dist(m) ? a : offset(pts, -Math.abs(d));
}
const twin = (pts: Poly, a: number, b: number): Line[] => [L(inward(pts, a), "stitch"), L(inward(pts, b), "stitch")];

/* Embroidered panel: fill plus its border seam and edge-stitch. */
function panel(pts: Poly, kind: FillKind): Piece {
  return { fill: pts, kind, lines: [L(pts, "seam", true), L(inset(pts, 6), "stitch", true)] };
}

/* Sleeve as a piece: fill bounded by the armhole seam, plus cuff band and stitching. */
function sleevePiece(s: ReturnType<typeof sleeve>, armhole: Poly, band: number | null, side: 1 | -1, extra: Line[] = []): { piece: Piece; bandPanel?: Piece } {
  const flip = (pts: Poly) => (side === 1 ? pts : mirror(pts));
  const outline = join(s.outer, line(s.cuffOuter, s.cuffInner), reverse(s.inner), reverse(armhole));
  const lines: Line[] = [
    L(flip(s.outer), "edge"),
    L(flip(line(s.cuffOuter, s.cuffInner)), "edge"),
    L(flip(s.inner), "edge"),
    L(flip(sleeveBand(s, 14)), "stitch"),
    ...extra.map((l) => ({ ...l, pts: flip(l.pts) })),
  ];
  const piece: Piece = { fill: flip(outline), kind: "body", lines };
  if (band == null) return { piece };
  const top = sleeveBand(s, band);
  const bandPoly = join([top[0]], line(top[0], s.cuffOuter, s.cuffInner, top[top.length - 1]));
  return { piece, bandPanel: panel(flip(bandPoly), "emb-gol") };
}

/* ======================= IB-01 Pashk Coat ======================= */
function pashk(): GarmentFlats {
  const NW = 96;
  const S: P = [338, 64], U: P = [360, 500];
  const armhole = curve(S, [352, 270], U);
  const sideR = curve(U, [372, 760], [430, 1100], [492, 1400]);
  const sideL = mirror(curve(U, [374, 780], [440, 1120], [506, 1488]));
  const shoulderR = curve([NW, 0], [220, 26], S);
  const sl = sleeve({ shoulder: S, underarm: U, angle: 22, length: 600, cuff: 300, bulge: 26, inner: 10 });
  const sleeveMotion = [L(curve(add(U, [40, 40]), add(U, [120, 90]), add(U, [170, 150])), "motion")];

  /* wrap: the top panel (wearer's right) crosses to close at x=150 */
  const e1 = join(curve([-NW, 0], [-50, 170], [44, 420], [150, 640]), line([150, 640], [150, 1442]));
  const e2 = curve([NW, 0], [50, 170], [-44, 420], [-150, 640]);
  const hemTop = curve([150, 1442], [-170, 1466], [-506, 1488]);
  const hemUnder = curve([492, 1400], [320, 1418], [150, 1430]);
  const backNeck = curve([-NW, 0], [0, 20], [NW, 0]);
  const collarBack = curve([-NW - 26, -4], [0, -24], [NW + 26, -4]);

  const inside: Piece = { fill: join(backNeck, reverse(collarBack)), kind: "inside", lines: [L(backNeck, "seam")] };
  const collarBand: Piece = {
    fill: join(collarBack, reverse(curve([-NW, 0], [0, 4], [NW, 0]))),
    kind: "band",
    lines: [L(collarBack, "edge"), L(offset(collarBack, -7), "stitch")],
  };
  const underBody = join(e2.slice().reverse(), shoulderR, armhole, sideR, hemUnder, line([150, 1430], [-150, 1440], [-150, 640]));
  const under: Piece = {
    fill: underBody,
    kind: "body",
    lines: [
      L(shoulderR, "seam"), L(armhole, "seam"), L(sideR, "edge"), L(hemUnder, "edge"), ...twin(hemUnder, 18, 24),
      L(e2, "edge"), L(offset(e2, -70), "seam"), L(offset(e2, -7), "stitch"),
      L(line([360, 650], [380, 920]), "fold"), L(line([340, 652], [350, 950]), "fold"),
      L(curve([300, 980], [320, 1200], [340, 1390]), "motion"),
    ],
  };
  const topBody = join(e1, hemTop, reverse(sideL), mirror(reverse(armhole)), mirror(reverse(shoulderR)));
  const top: Piece = {
    fill: topBody,
    kind: "body",
    lines: [
      L(mirror(shoulderR), "seam"), L(mirror(armhole), "seam"), L(sideL, "edge"), L(hemTop, "edge"), ...twin(hemTop, -18, -24),
      L(e1, "edge"), L(offset(e1, 74), "seam"), L(offset(e1, 7), "stitch"), L(offset(e1, 80), "stitch"),
      L(line([-362, 650], [-386, 930]), "fold"), L(line([-342, 652], [-354, 960]), "fold"), L(line([-322, 654], [-324, 980]), "fold"),
      L(line([-366, 640], [-318, 640]), "stitch"),
      L(curve([-120, 700], [-110, 1100], [-100, 1450]), "motion"),
    ],
  };
  const pado = panel(line([-300, 720], [-210, 720], [-206, 1400], [-296, 1404], [-300, 720]).slice(0, -1), "emb-toi");
  const sR = sleevePiece(sl, armhole, 140, 1, sleeveMotion);
  const sL = sleevePiece(sl, armhole, 140, -1, sleeveMotion);

  const front: FlatView = {
    pieces: [inside, collarBand, under, top, pado, sR.piece, sR.bandPanel!, sL.piece, sL.bandPanel!],
    marks: [{ kind: "knot", at: [150, 640] }, { kind: "bartack", at: [-342, 640], angle: 0 }],
    dims: [
      { code: "A", from: [-700, 0], to: [-700, 1488] },
      { code: "B", from: [-360, 520], to: [360, 520] },
      { code: "E", from: [-506, 1560], to: [492, 1560] },
    ],
    anchors: { wrap: [60, 430], pado: [-253, 1060], pleats: [-350, 800], cuff: [-sl.cuffOuter[0] + 40, sl.cuffOuter[1] + 20], ties: [150, 640], collar: [0, -14] },
  };

  /* back: mirror of the front silhouette (the long side swaps) */
  const bSideR = mirror(sideL), bSideL = mirror(sideR);
  const bHem = curve([506, 1488], [0, 1450], [-492, 1400]);
  const yoke = curve([-352, 220], [0, 250], [352, 220]);
  const backBody = join(curve([-NW, 0], [0, 8], [NW, 0]), shoulderR, armhole, bSideR, bHem, reverse(bSideL), mirror(reverse(armhole)), mirror(reverse(shoulderR)));
  const backPiece: Piece = {
    fill: backBody,
    kind: "body",
    lines: [
      L(shoulderR, "seam"), L(mirror(shoulderR), "seam"), L(armhole, "seam"), L(mirror(armhole), "seam"),
      L(yoke, "seam"), L(offset(yoke, 7), "stitch"),
      L(line([0, 250], [0, 1450]), "fold"), L(line([-90, 255], [-104, 1446]), "seam"), L(line([90, 255], [104, 1450]), "seam"),
      L(bHem, "edge"), ...twin(bHem, -18, -24), L(bSideR, "edge"), L(bSideL, "edge"),
      L(line([506 - 40, 1120], [506 - 4, 1488]), "seam"), L(line([-492 + 36, 1080], [-492 + 4, 1400]), "seam"),
    ],
  };
  const backCollar: Piece = { fill: join(collarBack, reverse(curve([-NW, 0], [0, 8], [NW, 0]))), kind: "band", lines: [L(collarBack, "edge"), L(offset(collarBack, -7), "stitch")] };
  const back: FlatView = {
    pieces: [backPiece, backCollar, sR.piece, sR.bandPanel!, sL.piece, sL.bandPanel!],
    marks: [{ kind: "bartack", at: [0, 255], angle: 0 }],
    dims: [{ code: "D", from: [0, -60], to: sl.cuffOuter }],
    anchors: { yoke: [200, 236], pleat: [0, 900], vents: [-470, 1260], collar: [0, -12] },
  };
  return {
    viewBox: [-820, -100, 1640, 1700],
    front,
    back,
    details: [
      { label: "Wrap, collar band and tie", view: "front", center: [60, 560], r: 150 },
      { label: "Pado panel, pakka doch", view: "front", center: [-253, 900], r: 120 },
    ],
  };
}

/* ======================= IB-02 Jig Kameez ======================= */
function jig(): GarmentFlats {
  const NW = 86;
  const S: P = [312, 54], U: P = [338, 440];
  const armhole = curve(S, [326, 240], U);
  const slitTop = 760;
  const sideR = curve(U, [352, 600], [362, slitTop]);
  const slitR = curve([362, slitTop], [392, 960], [424, 1156]);
  const slitL = mirror(curve([362, slitTop], [394, 980], [430, 1236]));
  const shoulder = curve([NW, 0], [200, 22], S);
  const sl = sleeve({ shoulder: S, underarm: U, angle: 17, length: 640, cuff: 170, bulge: 16, inner: 8 });
  const hem = curve([424, 1156], [150, 1172], [-150, 1204], [-430, 1236]);

  const neckFront = curve([-NW, 0], [0, 30], [NW, 0]);
  const collarTopF = curve([-NW - 4, -34], [0, -6], [NW + 4, -34]);
  const collarTopB = curve([-NW - 4, -34], [0, -44], [NW + 4, -34]);

  const inside: Piece = { fill: join(collarTopB, reverse(collarTopF)), kind: "inside", lines: [L(collarTopB, "edge")] };
  const bodyFill = join(neckFront, shoulder, armhole, sideR, slitR, hem, reverse(slitL), mirror(reverse(sideR)), mirror(reverse(armhole)), mirror(reverse(shoulder)));
  const yokeLine = curve([-326, 300], [-150, 328], [0, 346], [150, 328], [326, 300]);
  const yokeFill = join(neckFront, shoulder, slice(armhole, 0, 0.66), reverse(yokeLine), mirror(reverse(slice(armhole, 0, 0.66))), mirror(reverse(shoulder)));
  const body: Piece = {
    fill: bodyFill,
    kind: "body",
    lines: [
      L(shoulder, "seam"), L(mirror(shoulder), "seam"), L(armhole, "seam"), L(mirror(armhole), "seam"),
      L(sideR, "edge"), L(mirror(sideR), "edge"), L(slitR, "edge"), L(slitL, "edge"),
      L(hem, "edge"), ...twin(hem, 16, 22),
      L(line([-110, 346], [-110, 410], [-64, 410], [-64, 346]), "seam"), L(line([-102, 350], [-102, 402], [-72, 402]), "stitch"),
      L(line([368, 560], [384, 720]), "fold"), L(line([350, 564], [358, 740]), "fold"),
      L(line([-368, 560], [-384, 720]), "fold"), L(line([-350, 564], [-358, 740]), "fold"),
      L(offset(slitR, 8), "stitch"), L(offset(slitL, -8), "stitch"),
      L(curve([200, 420], [220, 820], [250, 1150]), "motion"), L(curve([-60, 460], [-70, 820], [-80, 1200]), "motion"),
    ],
  };
  const slitShadowR: Piece = { fill: line([362, slitTop], [436, 1166], [424, 1156]), kind: "inside", lines: [L(line([362, slitTop + 8], [436, 1166]), "edge")] };
  const slitShadowL: Piece = { fill: mirror(line([362, slitTop], [442, 1228], [430, 1236])), kind: "inside", lines: [L(mirror(line([362, slitTop + 8], [442, 1228])), "edge")] };
  const yoke: Piece = { fill: yokeFill, kind: "emb-setareh", lines: [L(yokeLine, "seam"), L(offset(yokeLine, -7), "stitch")] };
  const toi = panel(line([-118, 30], [-64, 26], [-64, 346], [-118, 346]), "emb-toi");
  const collar: Piece = {
    fill: join(collarTopF, reverse(neckFront)),
    kind: "band",
    lines: [L(collarTopF, "edge"), L(neckFront, "seam"), L(offset(collarTopF, -6), "stitch"), L(line([-64, -20], [-64, 26]), "edge")],
  };
  const sR = sleevePiece(sl, armhole, 100, 1);
  const sL = sleevePiece(sl, armhole, 100, -1);
  const front: FlatView = {
    pieces: [inside, slitShadowR, slitShadowL, body, yoke, toi, collar, sR.piece, sR.bandPanel!, sL.piece, sL.bandPanel!],
    marks: [
      { kind: "button", at: [-76, -14], r: 8 },
      { kind: "bartack", at: [-87, 412], angle: 0 },
      { kind: "bartack", at: [362, slitTop], angle: 90 }, { kind: "bartack", at: [-362, slitTop], angle: 90 },
    ],
    dims: [
      { code: "A", from: [-700, 0], to: [-700, 1156] },
      { code: "C", from: [-338, 470], to: [338, 470] },
      { code: "B", from: [520, 1156], to: [520, 1236] },
    ],
    anchors: { collar: [30, -20], yoke: [220, 200], toi: [-91, 200], placket: [-87, 390], slit: [380, 900], hem: [-260, 1214], cuff: [-sl.cuffOuter[0] + 30, sl.cuffOuter[1] - 20] },
  };
  const bHem = curve([430, 1236], [150, 1204], [-150, 1172], [-424, 1156]);
  const bYoke = curve([-326, 170], [0, 196], [326, 170]);
  const backBody: Piece = {
    fill: join(curve([-NW, 0], [0, 10], [NW, 0]), shoulder, armhole, sideR, mirror(slitL), bHem, reverse(mirror(slitR)), mirror(reverse(sideR)), mirror(reverse(armhole)), mirror(reverse(shoulder))),
    kind: "body",
    lines: [
      L(shoulder, "seam"), L(mirror(shoulder), "seam"), L(armhole, "seam"), L(mirror(armhole), "seam"),
      L(bYoke, "seam"), L(offset(bYoke, 7), "stitch"), L(sideR, "edge"), L(mirror(sideR), "edge"),
      L(mirror(slitL), "edge"), L(mirror(slitR), "edge"), L(bHem, "edge"), ...twin(bHem, -16, -22),
      L(curve([180, 260], [200, 800], [220, 1180]), "motion"),
    ],
  };
  const backCollar: Piece = { fill: join(collarTopB, reverse(curve([-NW, 0], [0, 10], [NW, 0]))), kind: "band", lines: [L(collarTopB, "edge"), L(offset(collarTopB, -6), "stitch")] };
  const back: FlatView = {
    pieces: [backBody, backCollar, sR.piece, sR.bandPanel!, sL.piece, sL.bandPanel!],
    marks: [{ kind: "bartack", at: [362, slitTop], angle: 90 }, { kind: "bartack", at: [-362, slitTop], angle: 90 }],
    dims: [{ code: "E", from: [0, -70], to: sl.cuffOuter }],
    anchors: { yoke: [160, 186] },
  };
  return {
    viewBox: [-790, -110, 1580, 1420],
    front,
    back,
    details: [
      { label: "Offset collar, toi strip and placket", view: "front", center: [-80, 150], r: 150 },
      { label: "Banzar cuff band", view: "front", center: [425, 650], r: 120 },
    ],
  };
}

/* ======================= IB-03 Chin Shalwar ======================= */
function shalwar(): GarmentFlats {
  const W = 304;
  const outer = curve([W, 52], [372, 190], [418, 430], [440, 680], [430, 860], [392, 962], [352, 1000]);
  const inner = curve([162, 1000], [150, 960], [104, 912], [44, 888], [0, 884]);
  const leg = join(outer, line([352, 1000], [162, 1000]), inner);
  const legFill = join(line([0, 52], [W, 52]), leg);
  const pleatXs = [40, 80, 120, 160, 200, 240, 280];
  const pleats: Line[] = pleatXs.flatMap((x) => [
    L(line([x, 52], [x * 1.06, 112]), "fold"),
    L(curve([x * 1.06, 112], [x * 1.18 + 10, 420], [x * 1.06 + 40, 720], [Math.min(x * 0.62 + 168, 344), 996]), "motion"),
  ]);
  const gathers: Line[] = [176, 200, 224, 248, 272, 296, 320, 344].map((x) => L(line([x, 1000], [x + (x - 260) * 0.12, 952]), "fold"));
  const band = (y0: number, y1: number): Poly => line([-W, y0], [W, y0], [W, y1], [-W, y1]);
  const cuffR = line([162, 1000], [352, 1000], [352, 1080], [162, 1080]);

  const legR: Piece = {
    fill: legFill,
    kind: "body",
    lines: [L(outer, "edge"), L(inner, "edge"), ...pleats, L(line([W - 6, 60], [W - 6, 100]), "stitch"), ...gathers.slice(0, 8)],
  };
  const legL: Piece = { ...legR, fill: mirror(legFill), lines: legR.lines.map((l) => ({ ...l, pts: mirror(l.pts) })) };
  const kali: Piece = { fill: line([0, 760], [64, 830], [0, 884], [-64, 830]), kind: "body", lines: [L(line([0, 760], [64, 830], [0, 884], [-64, 830], [0, 760]), "seam"), L(line([0, 52], [0, 760]), "seam"), L(offset(line([0, 60], [0, 750]), 6), "stitch")] };
  const waistband: Piece = {
    fill: band(0, 52),
    kind: "band",
    lines: [L(band(0, 52), "edge", true), L(line([-W + 4, 8], [W - 4, 8]), "stitch"), L(line([-W + 4, 44], [W - 4, 44]), "stitch")],
  };
  const cuffs = [panel(cuffR, "emb-gol"), panel(mirror(cuffR), "emb-gol")];
  const cord: Piece = {
    lines: [
      L(curve([-14, 26], [-30, 120], [-22, 210], [-34, 260]), "cord"),
      L(curve([14, 26], [24, 130], [44, 200], [40, 250]), "cord"),
    ],
  };
  const front: FlatView = {
    pieces: [legR, legL, kali, waistband, ...cuffs, cord],
    marks: [{ kind: "eyelet", at: [-14, 26] }, { kind: "eyelet", at: [14, 26] }, { kind: "knot", at: [-34, 262] }, { kind: "knot", at: [40, 252] }],
    dims: [
      { code: "A", from: [620, 0], to: [620, 1080] },
      { code: "E", from: [162, 1130], to: [352, 1130] },
      { code: "D", from: [-560, 690], to: [-560, 884] },
    ],
    anchors: { nala: [0, 26], pleats: [-180, 90], kali: [0, 830], cuff: [257, 1040] },
  };
  const shirr: Line[] = Array.from({ length: 29 }, (_, i) => -280 + i * 20).map((x) => L(line([x, 6], [x, 46]), "fold"));
  const backBand: Piece = { fill: band(0, 52), kind: "band", lines: [L(band(0, 52), "edge", true), ...shirr] };
  const pocket = curve([-366, 170], [-404, 300], [-420, 430]);
  const back: FlatView = {
    pieces: [
      { ...legR, lines: [L(outer, "edge"), L(inner, "edge"), ...pleats.filter((_, i) => i % 2 === 1), ...gathers] },
      { fill: mirror(legFill), kind: "body", lines: [L(mirror(outer), "edge"), L(mirror(inner), "edge"), ...pleats.filter((_, i) => i % 2 === 1).map((l) => ({ ...l, pts: mirror(l.pts) })), ...gathers.map((l) => ({ ...l, pts: mirror(l.pts) })), L(pocket, "seam"), L(offset(pocket, -7), "stitch")] },
      { fill: line([0, 760], [64, 830], [0, 884], [-64, 830]), kind: "body", lines: [L(line([0, 52], [0, 884]), "seam")] },
      backBand,
      ...cuffs,
    ],
    marks: [{ kind: "bartack", at: [-366, 170], angle: 0 }, { kind: "bartack", at: [-420, 430], angle: 0 }],
    dims: [{ code: "C", from: [-W, -60], to: [W, -60] }],
    anchors: { pocket: [-400, 300], shirring: [120, 26] },
  };
  return {
    viewBox: [-640, -120, 1280, 1300],
    front,
    back,
    details: [
      { label: "Nala channel, eyelets and pleats", view: "front", center: [0, 70], r: 130 },
      { label: "Banzar band and gathers", view: "front", center: [257, 1010], r: 110 },
    ],
  };
}

/* ========================= IB-04 Sadri ========================= */
function sadri(): GarmentFlats {
  const NW = 92;
  const S: P = [252, 40], U: P = [352, 420];
  const armhole = curve(S, [264, 180], [300, 330], U);
  const sideR = curve(U, [364, 650], [378, 980]);
  const sideL = mirror(curve(U, [362, 620], [372, 880]));
  const shoulder = curve([NW, 0], [170, 18], S);
  const vPoint: P = [60, 380];
  const e1 = join(curve([-NW, 0], [-30, 190], vPoint), line(vPoint, [60, 884]));
  const e2 = curve([NW, 0], [76, 190], vPoint);
  const hemTop = curve([60, 884], [-160, 882], [-372, 880]);
  const hemUnder = curve([378, 980], [220, 982], [60, 984]);
  const backNeck = curve([-NW, 0], [0, 22], [NW, 0]);

  const inside: Piece = { fill: join(backNeck, reverse(e2), reverse(slice(e1, 0, 0.32))), kind: "inside", lines: [L(backNeck, "seam"), L(offset(backNeck, -6), "stitch")] };
  const under: Piece = {
    fill: join(reverse(e2), shoulder, armhole, sideR, hemUnder, line([60, 984], [60, 380])),
    kind: "body",
    lines: [L(shoulder, "seam"), L(armhole, "raw"), L(inward(armhole, 10, [0, 500]), "stitch"), L(sideR, "edge"), L(hemUnder, "raw"), L(inward(hemUnder, 10, [0, 500]), "stitch"), L(e2, "raw"), L(offset(e2, -10), "stitch")],
  };
  const top: Piece = {
    fill: join(e1, hemTop, reverse(sideL), mirror(reverse(armhole)), mirror(reverse(shoulder))),
    kind: "body",
    lines: [
      L(mirror(shoulder), "seam"), L(mirror(armhole), "raw"), L(inward(mirror(armhole), 10, [0, 500]), "stitch"),
      L(sideL, "edge"), L(hemTop, "raw"), L(inward(hemTop, 10, [0, 500]), "stitch"), L(e1, "raw"), L(offset(e1, 10), "stitch"),
      L(curve([-200, 460], [-214, 700], [-230, 880]), "motion"),
    ],
  };
  const mirrorL = panel(line([-232, 110], [-130, 104], [-118, 360], [-282, 368], [-262, 200]), "emb-setareh");
  const mirrorR = panel(line([122, 170], [252, 160], [282, 300], [300, 380], [130, 384]), "emb-setareh");
  const front: FlatView = {
    pieces: [inside, under, top, mirrorL, mirrorR],
    marks: [{ kind: "snap", at: [60, 380], r: 12 }],
    dims: [
      { code: "A", from: [470, 0], to: [470, 984] },
      { code: "B", from: [-470, 880], to: [-470, 984] },
      { code: "C", from: [-352, 460], to: [352, 460] },
    ],
    anchors: { v: [60, 380], mirrors: [-196, 240], raw: [220, 966], hem: [-200, 882] },
  };
  const bHem = curve([378, 980], [0, 984], [-378, 980]);
  const backFill = join(curve([-NW, 0], [0, 12], [NW, 0]), shoulder, armhole, sideR, bHem, reverse(mirror(sideR)), mirror(reverse(armhole)), mirror(reverse(shoulder)));
  const back: FlatView = {
    pieces: [
      {
        fill: backFill,
        kind: "body",
        lines: [L(shoulder, "seam"), L(mirror(shoulder), "seam"), L(armhole, "raw"), L(mirror(armhole), "raw"), L(inward(armhole, 10, [0, 500]), "stitch"), L(inward(mirror(armhole), 10, [0, 500]), "stitch"), L(sideR, "edge"), L(mirror(sideR), "edge"), L(bHem, "raw"), L(inward(bHem, 10, [0, 500]), "stitch"), L(line([0, 760], [0, 984]), "edge"), L(curve([-NW, 0], [0, 12], [NW, 0]), "seam")],
      },
      panel(line([-282, 214], [282, 214], [290, 272], [-290, 272]), "emb-toi"),
    ],
    marks: [{ kind: "bartack", at: [0, 760], angle: 0 }],
    dims: [{ code: "F", from: [44, 760], to: [44, 984] }],
    anchors: { toi: [0, 243], vent: [0, 860] },
  };
  return {
    viewBox: [-560, -90, 1120, 1170],
    front,
    back,
    details: [
      { label: "Off-centre V and concealed snap", view: "front", center: [60, 330], r: 110 },
      { label: "Raw edge, stay-stitched 10 mm", view: "front", center: [250, 960], r: 90 },
    ],
  };
}

export const flats: Record<string, GarmentFlats> = {
  "pashk-coat": pashk(),
  "jig-kameez": jig(),
  "chin-shalwar": shalwar(),
  sadri: sadri(),
};
