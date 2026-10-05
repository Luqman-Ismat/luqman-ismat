/* Flat geometry for Collection 01, in millimetres. Origin at the high point
   of the shoulder (HPS) on the centre line; y runs down. The same points
   drive the SVG technical flats and the 3D garment viewer. */

export type Pt = [number, number];
export type View = "front" | "back";

export type Panel = {
  kind: "pado" | "banzar" | "jig" | "toi" | "setareh" | "band" | "collar";
  points: Pt[];
};

export type Line = { points: Pt[]; style: "seam" | "stitch" | "fold" | "drape" | "edge" | "raw"; curve?: boolean };

export type FlatView = {
  outline: Pt[];
  panels: Panel[];
  lines: Line[];
  ties?: Pt[];
  dims: { code: string; from: Pt; to: Pt }[];
};

export type Shape = { viewBox: [number, number, number, number]; front: FlatView; back: FlatView };

const mirrorX = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [-x, y] as Pt);
/* Builds a closed outline from a right half traced from the neck point,
   clockwise to the hem, then mirrored back up the left side. */
const symmetric = (right: Pt[], hem: Pt[] = []): Pt[] => [...right, ...hem, ...mirrorX(right).reverse()];

/* Sleeve band (banzar) running a set depth up the sleeve from the cuff. */
function cuffBand(shoulder: Pt, cuffOuter: Pt, cuffInner: Pt, underarm: Pt, depth: number): Pt[] {
  const unit = (a: Pt, b: Pt): Pt => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return [dx / l, dy / l];
  };
  const u1 = unit(shoulder, cuffOuter), u2 = unit(underarm, cuffInner);
  return [
    [cuffOuter[0] - u1[0] * depth, cuffOuter[1] - u1[1] * depth],
    cuffOuter,
    cuffInner,
    [cuffInner[0] - u2[0] * depth, cuffInner[1] - u2[1] * depth],
  ];
}
const both = (pts: Pt[]) => [pts, mirrorX(pts)];

/* ---------- IB-01 Pashk Coat ---------- */
const pashkShoulder: Pt = [446, 132];
const pashkCuffO: Pt = [770, 870];
const pashkCuffI: Pt = [468, 972];
const pashkUnder: Pt = [392, 520];
const pashkRight: Pt[] = [[100, 0], [340, 58], pashkShoulder, pashkCuffO, pashkCuffI, pashkUnder, [470, 900], [596, 1380]];
const pashkLeft: Pt[] = [[100, 0], [340, 58], pashkShoulder, pashkCuffO, pashkCuffI, pashkUnder, [480, 920], [616, 1500]];
const pashkCuff = cuffBand(pashkShoulder, pashkCuffO, pashkCuffI, pashkUnder, 140);
/* Wrap: the right front crosses the body and closes off-centre. */
const wrapEdge: Pt[] = [[100, 0], [30, 200], [-70, 420], [-128, 600], [-150, 1000], [-160, 1474]];
const shawlInner: Pt[] = [[214, 26], [138, 230], [40, 440], [-14, 610], [-36, 1000], [-46, 1462]];

const pashk: Shape = {
  viewBox: [-830, -80, 1660, 1640],
  front: {
    outline: [...pashkRight, [300, 1412], [0, 1452], [-300, 1480], ...mirrorX(pashkLeft).reverse(), [0, -6]],
    panels: [
      { kind: "collar", points: [...wrapEdge, ...shawlInner.slice().reverse()] },
      { kind: "pado", points: [[236, 700], [322, 704], [334, 1396], [248, 1402]] },
      ...both(pashkCuff).map((points) => ({ kind: "banzar" as const, points })),
    ],
    lines: [
      { points: wrapEdge, style: "edge", curve: true },
      { points: shawlInner, style: "seam", curve: true },
      { points: wrapEdge.map(([x, y]) => [x + 22, y + 4] as Pt), style: "stitch", curve: true },
      { points: [[-100, 0], [-60, 60], [-6, 120]], style: "seam", curve: true },
      // chin pleats release volume at the side waist
      { points: [[418, 640], [452, 900]], style: "fold" },
      { points: [[398, 644], [418, 930]], style: "fold" },
      { points: [[378, 648], [384, 950]], style: "fold" },
      { points: [[-418, 640], [-458, 910]], style: "fold" },
      { points: [[-398, 644], [-424, 940]], style: "fold" },
      { points: [[-378, 648], [-388, 960]], style: "fold" },
      // dropped shoulder seams
      { points: [[340, 58], [392, 520]], style: "seam" },
      { points: [[-340, 58], [-392, 520]], style: "seam" },
      // drape: the wrap pulls diagonal folds across the body
      { points: [[160, 300], [60, 760], [10, 1440]], style: "drape", curve: true },
      { points: [[330, 260], [320, 820], [380, 1400]], style: "drape", curve: true },
      { points: [[-300, 160], [-290, 820], [-380, 1470]], style: "drape", curve: true },
      { points: [[-200, 640], [-240, 1050], [-250, 1470]], style: "drape", curve: true },
      { points: [[560, 320], [640, 600], [690, 860]], style: "drape", curve: true },
      { points: [[-560, 320], [-640, 600], [-690, 860]], style: "drape", curve: true },
      { points: [[500, 440], [540, 700], [560, 900]], style: "drape", curve: true },
      { points: [[-500, 440], [-540, 700], [-560, 900]], style: "drape", curve: true },
      // hem stitch and side vents
      { points: [[588, 1362], [300, 1394], [0, 1434], [-160, 1448]], style: "stitch", curve: true },
      { points: [[-160, 1456], [-300, 1462], [-608, 1482]], style: "stitch", curve: true },
      { points: [[560, 1080], [596, 1380]], style: "seam" },
      { points: [[-572, 1150], [-616, 1500]], style: "seam" },
    ],
    ties: [[-128, 640], [-180, 800], [-128, 640], [-90, 812]],
    dims: [
      { code: "A", from: [-780, 0], to: [-780, 1500] },
      { code: "B", from: [-392, 550], to: [392, 550] },
      { code: "E", from: [-616, 1540], to: [596, 1540] },
    ],
  },
  back: {
    outline: [...pashkLeft.map(([x, y]) => [x, y] as Pt), [300, 1480], [0, 1452], [-300, 1412], ...mirrorX(pashkRight).reverse(), [0, 18]],
    panels: both(pashkCuff).map((points) => ({ kind: "banzar" as const, points })),
    lines: [
      { points: [[-360, 210], [0, 244], [360, 210]], style: "seam", curve: true },
      { points: [[-360, 224], [0, 258], [360, 224]], style: "stitch", curve: true },
      { points: [[0, 244], [0, 1452]], style: "fold" },
      { points: [[-90, 250], [-110, 1440]], style: "seam" },
      { points: [[90, 250], [110, 1462]], style: "seam" },
      { points: [[340, 58], [392, 520]], style: "seam" },
      { points: [[-340, 58], [-392, 520]], style: "seam" },
      { points: [[572, 1150], [616, 1500]], style: "seam" },
      { points: [[-560, 1080], [-596, 1380]], style: "seam" },
      { points: [[606, 1482], [0, 1436], [-588, 1362]], style: "stitch", curve: true },
      { points: [[250, 300], [270, 900], [330, 1470]], style: "drape", curve: true },
      { points: [[-250, 300], [-270, 900], [-320, 1400]], style: "drape", curve: true },
      { points: [[40, 300], [50, 900], [60, 1440]], style: "drape", curve: true },
      { points: [[560, 320], [640, 600], [690, 860]], style: "drape", curve: true },
      { points: [[-560, 320], [-640, 600], [-690, 860]], style: "drape", curve: true },
    ],
    dims: [{ code: "D", from: [0, -50], to: [770, 870] }],
  },
};

/* ---------- IB-02 Jig Kameez ---------- */
const jigShoulder: Pt = [392, 96];
const jigCuffO: Pt = [690, 790];
const jigCuffI: Pt = [452, 872];
const jigUnder: Pt = [362, 450];
const jigRight: Pt[] = [[86, 0], [312, 44], jigShoulder, jigCuffO, jigCuffI, jigUnder, [420, 720], [480, 1236]];
const jigCuff = cuffBand(jigShoulder, jigCuffO, jigCuffI, jigUnder, 110);
const jigHemFront: Pt[] = [[300, 1228], [150, 1210], [0, 1192], [-150, 1176], [-300, 1162]];

const jig: Shape = {
  viewBox: [-800, -70, 1600, 1360],
  front: {
    outline: [...jigRight, ...jigHemFront, [-480, 1156], [-420, 720], ...mirrorX(jigRight.slice(0, 6)).reverse(), [0, 26]],
    panels: [
      { kind: "jig", points: [[-90, 40], [-304, 48], [-334, 130], [-306, 316], [-116, 340], [0, 356], [116, 340], [306, 316], [334, 130], [304, 48], [90, 40]] },
      { kind: "toi", points: [[-118, 40], [-66, 40], [-66, 350], [-118, 344]] },
      ...both(jigCuff).map((points) => ({ kind: "banzar" as const, points })),
    ],
    lines: [
      // offset band collar
      { points: [[-88, 0], [0, -16], [88, 0]], style: "seam", curve: true },
      { points: [[-88, 38], [0, 22], [88, 38]], style: "seam", curve: true },
      { points: [[-88, 0], [-88, 38]], style: "seam" },
      { points: [[88, 0], [88, 38]], style: "seam" },
      { points: [[-66, -8], [-66, 34]], style: "edge" },
      // placket below the yoke
      { points: [[-118, 344], [-118, 410]], style: "seam" },
      { points: [[-66, 350], [-66, 410]], style: "seam" },
      { points: [[-118, 410], [-66, 410]], style: "seam" },
      { points: [[-108, 356], [-108, 400], [-76, 400]], style: "stitch" },
      { points: [[-306, 330], [-116, 354], [0, 370], [116, 354], [306, 330]], style: "stitch", curve: true },
      { points: [[312, 44], [362, 450]], style: "seam" },
      { points: [[-312, 44], [-362, 450]], style: "seam" },
      // chin pleats
      { points: [[392, 560], [420, 760]], style: "fold" },
      { points: [[374, 564], [388, 780]], style: "fold" },
      { points: [[-392, 560], [-420, 760]], style: "fold" },
      { points: [[-374, 564], [-388, 780]], style: "fold" },
      // side slits open below the bar tack
      { points: [[420, 720], [400, 740]], style: "edge" },
      { points: [[-420, 720], [-400, 740]], style: "edge" },
      { points: [[466, 1220], [150, 1194], [0, 1176], [-150, 1160], [-466, 1140]], style: "stitch", curve: true },
      { points: [[220, 380], [250, 820], [300, 1210]], style: "drape", curve: true },
      { points: [[-220, 380], [-240, 820], [-290, 1160]], style: "drape", curve: true },
      { points: [[40, 440], [60, 820], [90, 1190]], style: "drape", curve: true },
      { points: [[-120, 470], [-130, 840], [-140, 1170]], style: "drape", curve: true },
      { points: [[520, 330], [590, 580], [640, 760]], style: "drape", curve: true },
      { points: [[-520, 330], [-590, 580], [-640, 760]], style: "drape", curve: true },
    ],
    dims: [
      { code: "A", from: [-750, 0], to: [-750, 1156] },
      { code: "C", from: [-362, 480], to: [362, 480] },
      { code: "B", from: [530, 1156], to: [530, 1236] },
    ],
  },
  back: {
    outline: [...jigRight.slice(0, 6), [420, 720], [480, 1156], [300, 1162], [150, 1176], [0, 1192], [-150, 1210], [-300, 1228], ...mirrorX(jigRight).reverse(), [0, 18]],
    panels: both(jigCuff).map((points) => ({ kind: "banzar" as const, points })),
    lines: [
      { points: [[-312, 160], [0, 184], [312, 160]], style: "seam", curve: true },
      { points: [[-312, 172], [0, 196], [312, 172]], style: "stitch", curve: true },
      { points: [[312, 44], [362, 450]], style: "seam" },
      { points: [[-312, 44], [-362, 450]], style: "seam" },
      { points: [[466, 1140], [0, 1176], [-466, 1220]], style: "stitch", curve: true },
      { points: [[190, 240], [220, 820], [250, 1170]], style: "drape", curve: true },
      { points: [[-190, 240], [-220, 820], [-260, 1210]], style: "drape", curve: true },
      { points: [[520, 330], [590, 580], [640, 760]], style: "drape", curve: true },
      { points: [[-520, 330], [-590, 580], [-640, 760]], style: "drape", curve: true },
    ],
    dims: [{ code: "E", from: [0, -40], to: [690, 790] }],
  },
};

/* ---------- IB-03 Chin Shalwar ---------- */
/* Width falls rather than balloons: full at the hip, heavy vertical folds,
   drawn into the ankle band below a dropped crotch. */
const shalwarRight: Pt[] = [[330, 52], [392, 110], [452, 240], [500, 430], [528, 640], [538, 800], [508, 916], [430, 984], [352, 1000], [352, 1080], [150, 1080], [150, 1000], [118, 972], [84, 930], [46, 896], [0, 880]];
const shalwarFolds: Line[] = [
  ...[-300, -240, -180, -120, -60, 60, 120, 180, 240, 300].map((x) => ({ points: [[x, 56], [x * 1.12, 240], [x * 1.2, 620], [x * 0.8 + Math.sign(x) * 120, 990]] as Pt[], style: "fold" as const, curve: true })),
  ...[170, 205, 240, 275, 310, 340, -170, -205, -240, -275, -310, -340].map((x) => ({ points: [[x, 1000], [x * 1.08, 950]] as Pt[], style: "fold" as const })),
];
const shalwarDrape = (side: 1 | -1): Line[] =>
  [
    [[500, 260], [512, 700], [420, 990]],
    [[410, 200], [430, 660], [350, 996]],
    [[310, 230], [320, 700], [280, 996]],
    [[210, 250], [220, 720], [215, 996]],
    [[120, 300], [110, 640], [70, 880]],
  ].map((pts) => ({ points: pts.map(([x, y]) => [x * side, y] as Pt), style: "drape" as const, curve: true }));

const shalwar: Shape = {
  viewBox: [-700, -70, 1400, 1250],
  front: {
    outline: [[0, 0], [330, 0], ...shalwarRight, ...mirrorX(shalwarRight).reverse(), [-330, 0]],
    panels: [
      { kind: "band", points: [[-330, 0], [330, 0], [330, 52], [-330, 52]] },
      { kind: "banzar", points: [[150, 1000], [352, 1000], [352, 1080], [150, 1080]] },
      { kind: "banzar", points: [[-150, 1000], [-352, 1000], [-352, 1080], [-150, 1080]] },
    ],
    lines: [
      { points: [[-330, 52], [330, 52]], style: "seam" },
      { points: [[-322, 10], [322, 10]], style: "stitch" },
      { points: [[-322, 44], [322, 44]], style: "stitch" },
      { points: [[-12, 30], [-30, 120], [-18, 220]], style: "edge", curve: true },
      { points: [[12, 30], [26, 130], [44, 216]], style: "edge", curve: true },
      { points: [[0, 730], [70, 810], [0, 890], [-70, 810], [0, 730]], style: "seam" },
      ...shalwarFolds,
      ...shalwarDrape(1),
      ...shalwarDrape(-1),
    ],
    dims: [
      { code: "A", from: [660, 0], to: [660, 1080] },
      { code: "E", from: [150, 1120], to: [352, 1120] },
      { code: "D", from: [-620, 680], to: [-620, 880] },
    ],
  },
  back: {
    outline: [[0, 0], [330, 0], ...shalwarRight, ...mirrorX(shalwarRight).reverse(), [-330, 0]],
    panels: [
      { kind: "band", points: [[-330, 0], [330, 0], [330, 52], [-330, 52]] },
      { kind: "banzar", points: [[150, 1000], [352, 1000], [352, 1080], [150, 1080]] },
      { kind: "banzar", points: [[-150, 1000], [-352, 1000], [-352, 1080], [-150, 1080]] },
    ],
    lines: [
      { points: [[-330, 52], [330, 52]], style: "seam" },
      ...[-300, -260, -220, -180, -140, -100, -60, -20, 20, 60, 100, 140, 180, 220, 260, 300].map((x) => ({ points: [[x, 6], [x, 46]] as Pt[], style: "fold" as const })),
      { points: [[0, 52], [0, 872]], style: "seam" },
      { points: [[-440, 110], [-510, 240], [-526, 380]], style: "edge", curve: true },
      ...shalwarDrape(1),
      ...shalwarDrape(-1),
    ],
    dims: [{ code: "C", from: [-330, -40], to: [330, -40] }],
  },
};

/* ---------- IB-04 Sadri ---------- */
const sadriLapelEdge: Pt[] = [[-90, 0], [-20, 180], [60, 372], [64, 960]];
const sadriLapelInner: Pt[] = [[-170, 26], [-96, 200], [-14, 384], [-12, 958]];
const sadri: Shape = {
  viewBox: [-560, -70, 1120, 1120],
  front: {
    outline: [[90, 0], [254, 36], [266, 140], [300, 310], [356, 430], [376, 870], [64, 880], [64, 960], [-376, 980], [-356, 430], [-300, 310], [-266, 140], [-254, 36], [-90, 0], [60, 372]],
    panels: [
      { kind: "collar", points: [...sadriLapelEdge, ...sadriLapelInner.slice().reverse()] },
      { kind: "setareh", points: [[-226, 92], [-168, 70], [-128, 250], [-150, 400], [-292, 400], [-300, 320], [-262, 190]] },
      { kind: "setareh", points: [[118, 150], [244, 140], [266, 230], [292, 320], [304, 400], [118, 400]] },
    ],
    lines: [
      { points: sadriLapelEdge, style: "edge" },
      { points: sadriLapelInner, style: "seam", curve: true },
      { points: [[90, 0], [60, 372]], style: "edge" },
      { points: [[80, 26], [56, 330]], style: "stitch" },
      { points: [[376, 870], [64, 880]], style: "raw" },
      { points: [[64, 960], [-376, 980]], style: "raw" },
      { points: [[362, 856], [76, 866]], style: "stitch" },
      { points: [[52, 946], [-362, 964]], style: "stitch" },
      { points: [[254, 36], [266, 140], [300, 310], [356, 430]], style: "raw" },
      { points: [[-254, 36], [-266, 140], [-300, 310], [-356, 430]], style: "raw" },
      { points: [[220, 460], [240, 680], [260, 860]], style: "drape", curve: true },
      { points: [[-220, 460], [-230, 720], [-260, 960]], style: "drape", curve: true },
      { points: [[-100, 480], [-110, 740], [-120, 960]], style: "drape", curve: true },
    ],
    dims: [
      { code: "A", from: [440, 0], to: [440, 870] },
      { code: "B", from: [-440, 870], to: [-440, 980] },
      { code: "C", from: [-356, 470], to: [356, 470] },
    ],
  },
  back: {
    outline: [[90, 0], [254, 36], [266, 140], [300, 310], [356, 430], [376, 880], [-376, 880], [-356, 430], [-300, 310], [-266, 140], [-254, 36], [-90, 0], [0, 16]],
    panels: [{ kind: "toi", points: [[-276, 210], [276, 210], [284, 268], [-284, 268]] }],
    lines: [
      { points: [[0, 670], [0, 880]], style: "edge" },
      { points: [[-14, 670], [14, 670]], style: "seam" },
      { points: [[376, 880], [-376, 880]], style: "raw" },
      { points: [[362, 866], [-362, 866]], style: "stitch" },
      { points: [[254, 36], [266, 140], [300, 310], [356, 430]], style: "raw" },
      { points: [[-254, 36], [-266, 140], [-300, 310], [-356, 430]], style: "raw" },
      { points: [[190, 320], [210, 620], [230, 866]], style: "drape", curve: true },
      { points: [[-190, 320], [-210, 620], [-230, 866]], style: "drape", curve: true },
    ],
    dims: [{ code: "F", from: [44, 670], to: [44, 880] }],
  },
};

export const shapes: Record<string, Shape> = {
  "pashk-coat": pashk,
  "jig-kameez": jig,
  "chin-shalwar": shalwar,
  sadri,
};
