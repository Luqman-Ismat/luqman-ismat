"use client";
import Link from "next/link";
import { useState } from "react";
import { GarmentFlat } from "./garment-flat";
import { ColourwayPicker } from "./tech-pack-viewer";
import { colourwayById, type Piece } from "@/lib/indus/collection";

export function PieceShowcase({ piece, index }: { piece: Piece; index: number }) {
  const [cw, setCw] = useState(piece.defaultColourway);
  const [view, setView] = useState<"front" | "back">("front");
  const colourway = colourwayById(cw);
  return (
    <article className={index % 2 ? "piece-row is-flipped" : "piece-row"} data-reveal>
      <div className="piece-stage" onPointerEnter={() => setView("back")} onPointerLeave={() => setView("front")}>
        <GarmentFlat className="piece-flat" slug={piece.slug} view={view} colourway={colourway} title={`${piece.name} ${view} in ${colourway.name}`} />
        <span className="piece-stage-hint">{view === "front" ? "Hover for back" : "Back"}</span>
      </div>
      <div className="piece-copy">
        <p className="piece-code">{piece.code} · {piece.type}</p>
        <h3>{piece.name}</h3>
        <p className="piece-line">{piece.line}</p>
        <ul>
          {piece.silhouette.slice(0, 4).map((s) => <li key={s}>{s}</li>)}
        </ul>
        <ColourwayPicker value={cw} onChange={setCw} />
        <Link href={`/indus-blue/${piece.slug}`} className="pill pill-solid" data-cursor="Open">
          <span className="pill-text">Open the tech pack</span>
          <span className="pill-icon" aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
