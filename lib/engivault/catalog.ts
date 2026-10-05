import { calculators } from "./calculator-data";
import type { CatalogItem } from "@/components/engivault/catalog";
import type { Hotspot } from "@/components/engivault/plant-schematic";

/* Serializable summaries for client components (calculator configs hold functions). */
export const catalogItems: CatalogItem[] = Object.entries(calculators).map(([slug, c]) => ({
  slug,
  title: c.title,
  category: c.category,
  inputs: c.inputs.length,
  results: c.results.length,
  lead: [...new Set(c.results.map((r) => r.label))].slice(0, 3).join(" · "),
}));

export const disciplines = [...new Set(catalogItems.map((i) => i.category))];

/* Which calculation describes each item on the illustrative plant schematic. */
const plant: [id: string, slug: string, tag: string][] = [
  ["vessel", "hydrostatic-pressure", "V-101"],
  ["level", "current-loop-scale", "LT 101"],
  ["suction", "npsh-calculator", "SUCTION"],
  ["pump", "pump-duty", "P-101"],
  ["shaft", "shaft-torsion", "SHAFT"],
  ["motor", "ac-power", "M-101"],
  ["discharge", "water-pipe-loss", "DISCH."],
  ["flow", "pipe-sizing", "FT 102"],
  ["exchanger", "thermal-transport-numbers", "E-101"],
  ["steam", "wet-steam-properties", "STEAM"],
  ["temperature", "first-order-response", "TT 103"],
  ["valve", "liquid-valve", "FV-104"],
  ["insulation", "insulated-pipe", "INSUL."],
];
export const hotspots: Hotspot[] = plant.map(([id, slug, tag]) => ({ id, slug, tag, title: calculators[slug].title, category: calculators[slug].category }));

/* Neighbours within the same discipline, wrapping across the library. */
export function neighbours(slug: string) {
  const list = catalogItems.filter((i) => i.slug !== "unit-converter");
  const i = list.findIndex((x) => x.slug === slug);
  const cat = list[i]?.category;
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
    related: list.filter((x) => x.category === cat && x.slug !== slug).slice(0, 4),
  };
}
