"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { GarmentFlat } from "./garment-flat";
import { colourways, colourwayById, sizes, gradeFor, type Piece } from "@/lib/indus/collection";

const Garment3D = dynamic(() => import("./garment-3d").then((m) => m.Garment3D), {
  ssr: false,
  loading: () => <div className="tp-3d-loading">Loading 3D model…</div>,
});

type Mode = "rendered" | "technical" | "3d";

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
  const [mode, setMode] = useState<Mode>("rendered");
  const [view, setView] = useState<"front" | "back">("front");
  const [cw, setCw] = useState(piece.defaultColourway);
  const [dims, setDims] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const colourway = colourwayById(cw);
  const visible = piece.callouts.filter((c) => c.view === view);

  return (
    <div className="tp-viewer">
      <div className="tp-toolbar">
        <div className="seg" role="tablist" aria-label="Display">
          {(["rendered", "technical", "3d"] as Mode[]).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
              {m === "3d" ? "3D" : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        {mode !== "3d" && (
          <div className="seg" role="tablist" aria-label="View">
            {(["front", "back"] as const).map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}>
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        )}
        {mode !== "3d" && (
          <label className="tp-toggle">
            <input type="checkbox" checked={dims} onChange={(e) => setDims(e.target.checked)} /> Measurements
          </label>
        )}
        {mode !== "technical" && <ColourwayPicker value={cw} onChange={setCw} />}
      </div>

      <div className="tp-stage-wrap">
        <div className={`tp-stage is-${mode}`}>
          {mode === "3d" ? (
            <Garment3D slug={piece.slug} colourway={colourway} />
          ) : (
            <GarmentFlat
              key={`${view}-${mode}`}
              className="tp-flat"
              slug={piece.slug}
              view={view}
              mode={mode}
              colourway={colourway}
              callouts={piece.callouts}
              activeCallout={active}
              showDims={dims}
              title={`${piece.name}, ${view} ${mode} flat in ${colourway.name}`}
            />
          )}
          <p className="tp-stage-label">
            {piece.code} · {mode === "3d" ? "3D study" : `${view} · ${mode}`} · {mode === "technical" ? "Line" : colourway.name}
          </p>
        </div>

        <aside className="tp-callouts" aria-label="Construction notes">
          <p className="eyebrow">Construction · {mode === "3d" ? "all views" : view}</p>
          <ol>
            {(mode === "3d" ? piece.callouts : visible).map((c) => (
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
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {dims && mode !== "3d" && (
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
                <td className="mono">{p.grade ? fmt(p.grade) : "–"}</td>
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
