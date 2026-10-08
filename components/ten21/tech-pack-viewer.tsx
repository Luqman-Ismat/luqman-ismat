"use client";
import { useState } from "react";
import { ExplodedFlat, FlatDetail, type FlatMode } from "./garment-flat";
import { flats } from "@/lib/ten21/flats";
import { colourways, colourwayById, sizes, gradeFor, type Piece } from "@/lib/ten21/collection";



export function ColourwayPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="cw-picker" role="radiogroup" aria-label="Colourway">
      {colourways.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          className="cw-chip"
          onClick={() => onChange(c.id)}
          title={`${c.name} · ${c.meaning}`}
        >
          <span style={{ background: c.ground }} />
          <span style={{ background: `linear-gradient(90deg, ${c.threadA} 0 33%, ${c.threadB} 0 66%, ${c.threadD} 0)` }} />
          <b>{c.name}</b>
        </button>
      ))}
    </div>
  );
}

export function TechPackViewer({ piece }: { piece: Piece }) {
  const [mode, setMode] = useState<FlatMode>("technical");
  const [cw, setCw] = useState(piece.defaultColourway);
  const [dims, setDims] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [exploded, setExploded] = useState(false);
  const [pieceName, setPieceName] = useState<string | null>(null);
  const colourway = colourwayById(cw);
  const details = flats[piece.slug].details;
  const sheetLabel = mode === "technical" ? "Line" : `${colourway.name} · ${colourway.meaning}`;

  return (
    <div className="tp-viewer">
      <div className="tp-toolbar">
        <div className="seg" role="tablist" aria-label="Drawing">
          {(["technical", "rendered"] as FlatMode[]).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
              {m === "technical" ? "Technical" : "Colourway"}
            </button>
          ))}
        </div>
        <div className="seg" role="tablist" aria-label="Assembly">
          <button type="button" role="tab" aria-selected={!exploded} onClick={() => setExploded(false)}>Assembled</button>
          <button type="button" role="tab" aria-selected={exploded} onClick={() => setExploded(true)}>Exploded</button>
        </div>
        <label className="tp-toggle">
          <input type="checkbox" checked={dims} onChange={(e) => setDims(e.target.checked)} /> Measurements
        </label>
        {mode === "rendered" && <ColourwayPicker value={cw} onChange={setCw} />}
      </div>

      <div className="tp-stage-wrap">
        <div className={`tp-sheet is-${mode}`}>
          <div className="tp-sheet-flats">
            {(["front", "back"] as const).map((v) => (
              <figure key={v}>
                <ExplodedFlat
                  className="tp-flat"
                  exploded={exploded}
                  onPiece={setPieceName}
                  slug={piece.slug}
                  view={v}
                  mode={mode}
                  colourway={colourway}
                  callouts={piece.callouts}
                  activeCallout={active}
                  showDims={dims}
                  title={`${piece.name}, ${v} ${mode === "technical" ? "technical flat" : "colourway flat in " + colourway.name}`}
                />
                <figcaption>{v === "front" ? "Front" : "Back"}{exploded && pieceName ? ` · ${pieceName}` : ""}</figcaption>
              </figure>
            ))}
          </div>
          <dl className="tp-titleblock">
            <div><dt>Style</dt><dd>{piece.code}</dd></div>
            <div><dt>Description</dt><dd>{piece.name} · {piece.type}</dd></div>
            <div><dt>Colour</dt><dd>{sheetLabel}</dd></div>
            <div><dt>Size</dt><dd>M (base)</dd></div>
            <div><dt>Rev</dt><dd>A · Development</dd></div>
            <div><dt>Scale</dt><dd>NTS · mm</dd></div>
          </dl>
        </div>

        <aside className="tp-callouts" aria-label="Construction notes">
          <p className="eyebrow">Construction</p>
          <ol>
            {piece.callouts.map((c) => (
              <li
                key={c.n}
                className={active === c.n ? "is-active" : undefined}
                onPointerEnter={() => setActive(c.n)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(c.n)}
                onBlur={() => setActive(null)}
                tabIndex={0}
              >
                <span>{c.n}</span>
                <div>
                  <h3>{c.title} <small>{c.view}</small></h3>
                  <p>{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {dims && (
            <div className="tp-dim-legend">
              {piece.poms.map((p) => (
                <span key={p.code}>
                  <b>{p.code}</b> {p.point} · {p.m} cm
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="tp-details">
        {details.map((d, i) => (
          <figure key={d.label} className="tp-detail">
            <FlatDetail slug={piece.slug} index={i} colourway={colourway} mode={mode} />
            <figcaption><span>Detail {String.fromCharCode(65 + i)}</span>{d.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function SpecTable({ piece }: { piece: Piece }) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [size, setSize] = useState<(typeof sizes)[number]>("M");
  const fmt = (v: number) => (unit === "cm" ? v.toFixed(1).replace(/\.0$/, "") : (v / 2.54).toFixed(2).replace(/0$/, ""));
  return (
    <div className="spec-wrap">
      <div className="spec-controls">
        <div className="seg" role="tablist" aria-label="Units">
          {(["cm", "in"] as const).map((u) => (
            <button key={u} type="button" role="tab" aria-selected={unit === u} onClick={() => setUnit(u)}>
              {u}
            </button>
          ))}
        </div>
        <p>Base size M. Click a size to highlight it.</p>
      </div>
      <div className="table-scroll">
        <table className="spec-table">
          <thead>
            <tr>
              <th>POM</th>
              <th>Point of measure</th>
              {sizes.map((s) => (
                <th key={s} className={s === size ? "is-size" : undefined}>
                  <button type="button" onClick={() => setSize(s)} aria-pressed={s === size}>
                    {s}
                  </button>
                </th>
              ))}
              <th>Grade</th>
              <th>Tol ±</th>
            </tr>
          </thead>
          <tbody>
            {piece.poms.map((p) => (
              <tr key={p.code}>
                <td className="mono">{p.code}</td>
                <td>{p.point}</td>
                {sizes.map((s) => (
                  <td key={s} className={s === size ? "is-size mono" : "mono"}>
                    {fmt(gradeFor(p, s))}
                  </td>
                ))}
                <td className="mono">{p.grade ? fmt(p.grade) : "-"}</td>
                <td className="mono">{fmt(p.tol)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="pill pill-ghost tp-print" onClick={() => window.print()}>
      <span className="pill-text">Download tech pack (PDF)</span>
      <span className="pill-icon" aria-hidden="true">↓</span>
    </button>
  );
}
