"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExplodedFlat } from "./garment-flat";
import { ColourwayPicker } from "./tech-pack-viewer";
import { colourwayById, type Piece } from "@/lib/ten21/collection";
import { PartGlyphGarment } from "./part-glyph-garment";

/* A garment as a component: the production flat draws itself in, then
   separates into its construction pieces. Toggle views and colourways. */
export function GarmentSection({ piece }: { piece: Piece; n?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [touched, setTouched] = useState(false);
  const [view, setView] = useState<"front" | "back">("front");
  const [mode, setMode] = useState<"technical" | "rendered">("technical");
  const [cw, setCw] = useState(piece.defaultColourway);
  const [pieceName, setPieceName] = useState<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // once drawn in, separate the pieces to show how the garment is built
  useEffect(() => {
    if (!inView || touched || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setExploded(true), 2100);
    return () => clearTimeout(t);
  }, [inView, touched]);
  const act = <T,>(fn: (v: T) => void) => (v: T) => { setTouched(true); fn(v); };
  return (
    <section ref={ref} id={piece.slug} className={inView ? "cmp gs is-in" : "cmp gs"} aria-labelledby={`${piece.slug}-title`}>
      <div className="gs-copy">
        <div className="cmp-glyph"><PartGlyphGarment /></div>
        <p className="gs-code">{piece.code}</p>
        <h2 id={`${piece.slug}-title`}>{piece.name}</h2>
        <p className="gs-type">{piece.type}</p>
        <p className="gs-line">{piece.line}</p>
        <ul className="gs-sil">{piece.silhouette.slice(0, 4).map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="gs-controls">
          <div className="seg" role="tablist" aria-label="Assembly">
            <button type="button" role="tab" aria-selected={!exploded} onClick={() => act(setExploded)(false)}>Assembled</button>
            <button type="button" role="tab" aria-selected={exploded} onClick={() => act(setExploded)(true)}>Exploded</button>
          </div>
          <div className="seg" role="tablist" aria-label="View">
            {(["front", "back"] as const).map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => act(setView)(v)}>{v === "front" ? "Front" : "Back"}</button>
            ))}
          </div>
          <div className="seg" role="tablist" aria-label="Drawing">
            <button type="button" role="tab" aria-selected={mode === "technical"} onClick={() => act(setMode)("technical")}>Line</button>
            <button type="button" role="tab" aria-selected={mode === "rendered"} onClick={() => act(setMode)("rendered")}>Colour</button>
          </div>
        </div>
        {mode === "rendered" && <ColourwayPicker value={cw} onChange={act(setCw)} />}
        <Link href={`/ten21/${piece.slug}`} className="pill pill-solid"><span className="pill-text">Open the tech pack</span><span className="pill-icon" aria-hidden="true">↗</span></Link>
      </div>
      <div className="gs-stage">
        <ExplodedFlat className="gs-flat" slug={piece.slug} view={view} mode={mode} colourway={colourwayById(cw)} exploded={exploded} onPiece={setPieceName} title={`${piece.name} ${view} flat`} />
        <p className="gs-readout" aria-live="polite">{pieceName ?? (exploded ? "Hover a piece" : `${view} · ${mode === "technical" ? "technical flat" : colourwayById(cw).name}`)}</p>
      </div>
    </section>
  );
}
