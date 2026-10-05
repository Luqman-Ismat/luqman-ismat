/* TEN21 · Collection 01 "Pado".
   Oversized, asymmetric silhouettes built on Balochi garment structure and
   pakka doch embroidery. These are development specifications (Rev A): not
   yet sampled, graded or approved for production. Measurements are in cm. */

export type Colourway = {
  id: string;
  name: string;
  meaning: string;
  ground: string;
  shade: string;
  threadA: string;
  threadB: string;
  threadC: string;
  threadD: string;
  mirror: string;
};

export const colourways: Colourway[] = [
  { id: "shab", name: "Shab", meaning: "Night", ground: "#161514", shade: "#060606", threadA: "#8e1f19", threadB: "#e2a12f", threadC: "#efe8d6", threadD: "#1f5c48", mirror: "#c9ccd1" },
  { id: "neel", name: "Neel", meaning: "Indigo", ground: "#1f2a52", shade: "#111a38", threadA: "#b9481c", threadB: "#efe5ce", threadC: "#171717", threadD: "#e0ae3a", mirror: "#d4d7dc" },
  { id: "khak", name: "Khak", meaning: "Earth", ground: "#b4a383", shade: "#8f7f62", threadA: "#191919", threadB: "#b3271b", threadC: "#f1ead8", threadD: "#d6982a", mirror: "#cfd2d6" },
  { id: "shir", name: "Shir", meaning: "Milk", ground: "#ebe5d6", shade: "#cfc7b4", threadA: "#1d2b5a", threadB: "#b3261e", threadC: "#f3ecdb", threadD: "#d99a2b", mirror: "#c3c6cb" },
];

export type Callout = { n: number; title: string; text: string; view: "front" | "back"; anchor: string };
export type Pom = { code: string; point: string; m: number; grade: number; tol: number };
export type BomLine = { item: string; spec: string; placement: string; qty: string };

export type Piece = {
  code: string;
  slug: string;
  name: string;
  type: string;
  line: string;
  story: string;
  silhouette: string[];
  embroidery: { panel: string; motif: string; area: string }[];
  callouts: Callout[];
  poms: Pom[];
  bom: BomLine[];
  defaultColourway: string;
};

export const sizes = ["S", "M", "L", "XL"] as const;
export const gradeFor = (pom: Pom, size: (typeof sizes)[number]) => {
  const step = sizes.indexOf(size) - 1;
  return Math.round((pom.m + step * pom.grade) * 10) / 10;
};

export const pieces: Piece[] = [
  {
    code: "T21-01",
    slug: "pashk-coat",
    name: "Pashk Coat",
    type: "Ankle-length wrap robe",
    line: "The old Balochi robe, cut as an asymmetric wrap.",
    story:
      "Before the present shalwar kameez, Baloch men wore a robe to the ankles. The Pashk Coat returns to that length and cuts it as an off-centre wrap: dropped shoulders, a deep overlap and chin pleats releasing volume at the waist. One full-length pado panel runs from the waist to the hem, worked in pakka doch so the ground cloth disappears under the stitching.",
    silhouette: ["Dropped shoulder, 8 cm below natural", "Off-centre wrap, 14 cm overlap, internal and external ties", "Chin pleats at side waist release 18 cm each side", "Inverted box pleat at centre back from yoke to hem", "Side vents 32 cm"],
    embroidery: [
      { panel: "Pado (pocket panel)", motif: "Toi stepped-diamond chain with kap border", area: "9 × 74 cm, left front" },
      { panel: "Banzar (cuffs)", motif: "Gol rosette band between kap borders", area: "12 cm deep, full cuff circumference" },
    ],
    callouts: [
      { n: 1, title: "Wrap front", text: "Right front overlaps left by 14 cm. Edge faced 6 cm, topstitched 0.6 cm.", view: "front", anchor: "wrap" },
      { n: 2, title: "Pado panel", text: "Functional pocket, opening at top, bagged in cotton lawn. Pakka doch, fully covered ground.", view: "front", anchor: "pado" },
      { n: 3, title: "Chin pleats", text: "Three knife pleats each side at waist, stitched down 4 cm, released below.", view: "front", anchor: "pleats" },
      { n: 4, title: "Banzar cuffs", text: "Embroidered band worked on a separate cuff piece, joined and faced.", view: "front", anchor: "cuff" },
      { n: 5, title: "Ties", text: "Two 1 cm self-fabric ties at waist: one internal, one external.", view: "front", anchor: "ties" },
      { n: 6, title: "Back yoke", text: "Dropped yoke, 22 cm at CB, double layer.", view: "back", anchor: "yoke" },
      { n: 7, title: "Box pleat", text: "Inverted box pleat 16 cm deep at CB, from yoke seam to hem.", view: "back", anchor: "pleat" },
      { n: 8, title: "Side vents", text: "32 cm vents, mitred hem corners.", view: "back", anchor: "vents" },
    ],
    poms: [
      { code: "A", point: "Body length, HPS to hem", m: 142, grade: 2, tol: 1.5 },
      { code: "B", point: "1/2 chest, 2.5 cm below armhole", m: 72, grade: 3, tol: 1 },
      { code: "C", point: "Shoulder width, dropped", m: 66, grade: 2, tol: 1 },
      { code: "D", point: "Sleeve length from CB", m: 89, grade: 1.5, tol: 1 },
      { code: "E", point: "1/2 hem sweep", m: 98, grade: 3, tol: 1.5 },
      { code: "F", point: "Cuff opening, relaxed", m: 23, grade: 1, tol: 0.5 },
      { code: "G", point: "Front overlap", m: 14, grade: 0, tol: 0.5 },
      { code: "H", point: "Pado panel length (width fixed 9 cm)", m: 74, grade: 1, tol: 0.5 },
    ],
    bom: [
      { item: "Shell", spec: "Heavy cotton khaddar, 380 gsm, handloom", placement: "Body, sleeves, ties", qty: "4.6 m @ 140 cm" },
      { item: "Facing", spec: "Shell fabric, self", placement: "Front edge, neck", qty: "incl." },
      { item: "Pocket bag", spec: "Cotton lawn, 90 gsm", placement: "Pado pocket", qty: "0.4 m" },
      { item: "Embroidery thread", spec: "Silk-finish cotton floss, 6-strand", placement: "Pado, banzar", qty: "3 colours per colourway" },
      { item: "Embroidery", spec: "Hand pakka doch, satin and interlaced stitch", placement: "Pado 9 × 74 cm, cuffs 12 cm", qty: "≈ 1,100 cm²" },
      { item: "Main label", spec: "Woven, TEN21", placement: "Back neck facing", qty: "1" },
      { item: "Care label", spec: "Printed cotton tape", placement: "Left side seam, 15 cm above hem", qty: "1" },
    ],
    defaultColourway: "shab",
  },
  {
    code: "T21-02",
    slug: "jig-kameez",
    name: "Jig Kameez",
    type: "Long kameez, asymmetric hem",
    line: "A full jig yoke on a kameez cut wide and uneven.",
    story:
      "The jig is the large embroidered yoke that covers the chest of a Baloch dress, with a central toi strip running through it. Here it sits on a long, loose kameez with an offset placket and a hem that falls 8 cm longer on one side. Deep side slits keep the volume moving.",
    silhouette: ["Dropped shoulder, 6 cm", "Offset band collar and hidden 5-button placket, 9 cm left of CF", "Asymmetric curved hem: right side 8 cm longer", "Side slits 45 cm", "Chin pleats at side waist"],
    embroidery: [
      { panel: "Jig (chest yoke)", motif: "Setareh stars with mirrors, gol infill", area: "≈ 52 × 30 cm" },
      { panel: "Toi (central strip)", motif: "Toi stepped-diamond chain", area: "6 × 30 cm, on placket line" },
      { panel: "Banzar (cuffs)", motif: "Kap triangles and toi chain", area: "10 cm deep" },
    ],
    callouts: [
      { n: 1, title: "Band collar", text: "3.5 cm stand, offset opening aligned to placket.", view: "front", anchor: "collar" },
      { n: 2, title: "Jig yoke", text: "Separate embroidered yoke, joined at a shaped seam and lined in lawn.", view: "front", anchor: "yoke" },
      { n: 3, title: "Toi strip", text: "Runs on the placket line through the yoke.", view: "front", anchor: "toi" },
      { n: 4, title: "Hidden placket", text: "Five 15 mm horn buttons under a fly, ending 38 cm below HPS.", view: "front", anchor: "placket" },
      { n: 5, title: "Side slits", text: "45 cm, faced, bar-tacked at top.", view: "front", anchor: "slit" },
      { n: 6, title: "Asymmetric hem", text: "Curved hem, right side 8 cm longer. 1.5 cm double-turned.", view: "front", anchor: "hem" },
      { n: 7, title: "Back yoke", text: "Plain shaped back yoke, double layer.", view: "back", anchor: "yoke" },
    ],
    poms: [
      { code: "A", point: "Body length, HPS to hem (short side)", m: 112, grade: 2, tol: 1.5 },
      { code: "B", point: "Hem step, long side", m: 8, grade: 0, tol: 0.5 },
      { code: "C", point: "1/2 chest", m: 66, grade: 3, tol: 1 },
      { code: "D", point: "Shoulder width, dropped", m: 60, grade: 2, tol: 1 },
      { code: "E", point: "Sleeve length from CB", m: 86, grade: 1.5, tol: 1 },
      { code: "F", point: "Collar stand height", m: 3.5, grade: 0, tol: 0.2 },
      { code: "G", point: "Side slit length", m: 45, grade: 1, tol: 1 },
      { code: "H", point: "Jig yoke depth at CF", m: 30, grade: 1, tol: 0.5 },
    ],
    bom: [
      { item: "Shell", spec: "Cotton poplin or fine khaddar, 160 gsm", placement: "Body, sleeves, collar", qty: "3.4 m @ 140 cm" },
      { item: "Yoke lining", spec: "Cotton lawn, 90 gsm", placement: "Jig yoke", qty: "0.5 m" },
      { item: "Buttons", spec: "Horn, 15 mm, 4-hole", placement: "Placket", qty: "5 + 1 spare" },
      { item: "Mirrors", spec: "Shisha glass, 8 mm round", placement: "Setareh centres in jig", qty: "≈ 28" },
      { item: "Embroidery", spec: "Hand pakka doch with mirror work", placement: "Jig, toi, cuffs", qty: "≈ 1,900 cm²" },
      { item: "Main label", spec: "Woven, TEN21", placement: "Back neck", qty: "1" },
    ],
    defaultColourway: "shir",
  },
  {
    code: "T21-03",
    slug: "chin-shalwar",
    name: "Chin Shalwar",
    type: "Wide pleated shalwar",
    line: "The Balochi shalwar at full volume.",
    story:
      "A traditional Balochi shalwar runs about 2.2 m wide; older versions took far more. The Chin Shalwar keeps that width, folds it into deep pleats at a drawstring waist, drops the crotch with a kali gusset, and draws the volume into an embroidered banzar band at the ankle.",
    silhouette: ["220 cm total width at hip line, before pleating", "Drawstring (nala) channel with internal elastic back", "Dropped crotch, kali gusset", "Deep pleats (chin) radiating from waistband", "Tapered embroidered cuff band"],
    embroidery: [
      { panel: "Banzar (ankle bands)", motif: "Toi chain between kap borders", area: "8 cm deep, full circumference" },
    ],
    callouts: [
      { n: 1, title: "Nala channel", text: "4 cm channel, cotton nala cord, elastic across back only.", view: "front", anchor: "nala" },
      { n: 2, title: "Chin pleats", text: "Eight 6 cm pleats per leg, stitched 6 cm from waist.", view: "front", anchor: "pleats" },
      { n: 3, title: "Kali gusset", text: "Diamond gusset drops the crotch 22 cm below natural.", view: "front", anchor: "kali" },
      { n: 4, title: "Banzar band", text: "Embroidered 8 cm band, faced; leg volume gathered into it.", view: "front", anchor: "cuff" },
      { n: 5, title: "Side pocket", text: "Deep in-seam pocket, right side only.", view: "back", anchor: "pocket" },
    ],
    poms: [
      { code: "A", point: "Outseam incl. band", m: 104, grade: 1.5, tol: 1 },
      { code: "B", point: "Total width at hip line, flat pattern", m: 220, grade: 6, tol: 2 },
      { code: "C", point: "Waist relaxed (nala open)", m: 120, grade: 6, tol: 2 },
      { code: "D", point: "Crotch drop below natural", m: 22, grade: 0.5, tol: 1 },
      { code: "E", point: "Ankle band circumference", m: 38, grade: 1, tol: 0.5 },
      { code: "F", point: "Ankle band depth", m: 8, grade: 0, tol: 0.3 },
    ],
    bom: [
      { item: "Shell", spec: "Cotton lawn or light khaddar, 120–160 gsm", placement: "Legs, gusset, bands", qty: "4.2 m @ 140 cm" },
      { item: "Nala", spec: "Braided cotton cord, 1 cm", placement: "Waist channel", qty: "1.6 m" },
      { item: "Elastic", spec: "Woven, 3 cm", placement: "Back waist only", qty: "0.45 m" },
      { item: "Embroidery", spec: "Hand pakka doch", placement: "Ankle bands", qty: "≈ 610 cm²" },
      { item: "Main label", spec: "Woven, TEN21", placement: "Back waist channel", qty: "1" },
    ],
    defaultColourway: "khak",
  },
  {
    code: "T21-04",
    slug: "sadri",
    name: "Sadri",
    type: "Longline asymmetric waistcoat",
    line: "Mirror work, raw edges, uneven length.",
    story:
      "The sadri is the waistcoat worn over a kameez. This one is long, wide in the armhole and longer on the left front. Both chest panels carry setareh stars set around mirrors, a motif associated with light. Edges are left raw and stitched back so they soften with wear.",
    silhouette: ["Longline, to upper thigh", "Asymmetric front: left 10 cm longer", "Off-centre V with single concealed closure", "Wide armholes, dropped 8 cm", "Raw edges, stitched 1 cm from edge"],
    embroidery: [
      { panel: "Chest panels", motif: "Setareh stars around 8 mm mirrors", area: "2 × (18 × 24 cm)" },
      { panel: "Back strip", motif: "Toi chain", area: "6 × 44 cm across back yoke" },
    ],
    callouts: [
      { n: 1, title: "Off-centre V", text: "Neck opening offset 6 cm; one concealed snap at the point.", view: "front", anchor: "v" },
      { n: 2, title: "Mirror panels", text: "Setareh with shisha mirrors, worked on the garment front.", view: "front", anchor: "mirrors" },
      { n: 3, title: "Raw edge", text: "Unfinished edge, stay-stitched 1 cm in, washed to soften.", view: "front", anchor: "raw" },
      { n: 4, title: "Asymmetric hem", text: "Left front 10 cm longer, angled into side seam.", view: "front", anchor: "hem" },
      { n: 5, title: "Back toi strip", text: "Embroidered strip across the back yoke line.", view: "back", anchor: "toi" },
      { n: 6, title: "CB vent", text: "20 cm centre back vent.", view: "back", anchor: "vent" },
    ],
    poms: [
      { code: "A", point: "Body length, HPS to hem (short side)", m: 82, grade: 1.5, tol: 1 },
      { code: "B", point: "Hem step, left front", m: 10, grade: 0, tol: 0.5 },
      { code: "C", point: "1/2 chest", m: 64, grade: 3, tol: 1 },
      { code: "D", point: "Armhole depth, straight", m: 32, grade: 1, tol: 0.5 },
      { code: "E", point: "Neck opening offset from CF", m: 6, grade: 0, tol: 0.3 },
      { code: "F", point: "CB vent length", m: 20, grade: 0.5, tol: 0.5 },
    ],
    bom: [
      { item: "Shell", spec: "Boiled wool or felted cotton, 420 gsm", placement: "Body", qty: "1.4 m @ 150 cm" },
      { item: "Mirrors", spec: "Shisha glass, 8 mm round", placement: "Chest panels", qty: "≈ 34" },
      { item: "Closure", spec: "Concealed snap, 15 mm, antique brass", placement: "V point", qty: "1" },
      { item: "Embroidery", spec: "Hand pakka doch with mirror work", placement: "Chest panels, back strip", qty: "≈ 1,130 cm²" },
      { item: "Main label", spec: "Woven, TEN21", placement: "Inside back neck", qty: "1" },
    ],
    defaultColourway: "neel",
  },
];

export const pieceBySlug = (slug: string) => pieces.find((p) => p.slug === slug);
export const colourwayById = (id: string) => colourways.find((c) => c.id === id) ?? colourways[0];
