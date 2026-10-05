"use client";
import { useMemo } from "react";
import { plateGeometry, PLATE, type PlateKind } from "@/components/journey/geometry";

const kinds: Record<string, PlateKind> = {
  schedule: "gantt", capacity: "heatmap", import: "import", forecast: "forecast", risk: "risk",
  mapping: "mapping", cost: "bars", productivity: "line", quality: "scatter", access: "shield",
  inspection: "curve", calculators: "loop",
};

/* The same line-art plate the part becomes in the exploded 3D view, drawn
   in SVG; it traces itself in when its section enters the viewport. */
export function PartGlyph({ part }: { part: string }) {
  const d = useMemo(() => {
    const g = plateGeometry(kinds[part] ?? "gantt");
    const a = g.attributes.position.array as Float32Array;
    let out = "";
    for (let i = 0; i < a.length; i += 6) out += `M${a[i].toFixed(3)} ${(-a[i + 1]).toFixed(3)}L${a[i + 3].toFixed(3)} ${(-a[i + 4]).toFixed(3)}`;
    g.dispose();
    return out;
  }, [part]);
  const w = PLATE.w / 2 + 0.05, h = PLATE.h / 2 + 0.05;
  return (
    <svg className="part-glyph" viewBox={`${-w} ${-h} ${w * 2} ${h * 2}`} aria-hidden="true">
      <path d={d} pathLength={1} />
    </svg>
  );
}
