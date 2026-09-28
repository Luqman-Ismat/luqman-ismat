"use client";
import { useState, useId } from "react";
import geometry from "@/public/cad/field-01/garment-geometry.json";
type Shape = {
  kind: string;
  points?: number[][];
  center?: number[];
  radius?: number;
  layer: string;
  fill?: boolean;
  closed?: boolean;
};
const colorways = [
  { name: "Indigo", fill: "#687eac", shade: "#3d5283" },
  { name: "Moss", fill: "#89917c", shade: "#69765e" },
  { name: "Graphite", fill: "#626969", shade: "#434d4c" },
  { name: "Chalk", fill: "#d8d8cb", shade: "#b6b9a8" },
];
export function GarmentViewer({
  compact = false,
  hero = false,
}: {
  compact?: boolean;
  hero?: boolean;
}) {
  const [view, setView] = useState<"front" | "back">("front");
  const [color, setColor] = useState(0);
  const [dimensions, setDimensions] = useState(false);
  const id = useId();
  const shapes = geometry.views[view] as Shape[];
  return (
    <div
      className={`garment-viewer ${hero ? "hero-garment" : ""} ${compact ? "compact-garment" : ""}`}
    >
      <div className="viewer-topline">
        <span>FIELD / 001</span>
        <span>{view === "front" ? "FRONT ELEVATION" : "BACK ELEVATION"}</span>
      </div>
      <div className="garment-stage">
        <svg
          viewBox="-805 -50 1610 940"
          role="img"
          aria-labelledby={`${id}-title ${id}-description`}
        >
          <title id={`${id}-title`}>
            {`Field 01 utility overshirt, ${view} view in ${colorways[color].name}`}
          </title>
          <desc id={`${id}-description`}>
            Editable technical CAD geometry. Two chest pockets, dropped
            shoulders, a button placket and a back yoke. Sample development
            study.
          </desc>
          <defs>
            <pattern
              id={`${id}-grid`}
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="currentColor"
                strokeWidth=".8"
                opacity=".13"
              />
            </pattern>
          </defs>
          <rect
            x="-805"
            y="-50"
            width="1610"
            height="940"
            fill={`url(#${id}-grid)`}
          />
          <line
            x1="0"
            x2="0"
            y1="-40"
            y2="845"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="12 10"
            opacity=".35"
          />
          {shapes.map((shape, i) =>
            shape.kind === "circle" ? (
              <circle
                key={i}
                cx={shape.center![0]}
                cy={shape.center![1]}
                r={shape.radius}
                fill="#1e2c49"
                stroke="#d4ddea"
                strokeWidth="1.2"
              />
            ) : (
              <polyline
                key={i}
                points={(shape.closed
                  ? [...shape.points!, shape.points![0]]
                  : shape.points!
                )
                  .map((p) => p.join(","))
                  .join(" ")}
                fill={
                  shape.fill
                    ? shape.layer === "COLLAR"
                      ? colorways[color].shade
                      : colorways[color].fill
                    : "none"
                }
                stroke={shape.layer === "STITCH" ? "#c7d2e4" : "#243453"}
                strokeWidth={shape.layer === "OUTLINE" ? 3.5 : 2.3}
                strokeDasharray={shape.layer === "STITCH" ? "8 7" : undefined}
                strokeLinejoin="round"
              />
            ),
          )}
          {dimensions && (
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M-330 770V822 M330 770V822 M-330 805H330 M-330 805l16 -6m-16 6l16 6 M330 805l-16 -6m16 6l-16 6" />
              <path d="M690 70H750 M690 750H750 M730 70V750 M730 70l-6 16m6 -16l6 16 M730 750l-6 -16m6 16l6 -16" />
              <text
                x="0"
                y="846"
                fill="currentColor"
                stroke="none"
                textAnchor="middle"
                fontSize="25"
              >
                660 mm / HALF CHEST
              </text>
              <text
                x="776"
                y="425"
                fill="currentColor"
                stroke="none"
                textAnchor="middle"
                fontSize="24"
                transform="rotate(-90 776 425)"
              >
                680 mm / HPS TO HEM
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="viewer-controls">
        <div className="view-switch" role="group" aria-label="Garment view">
          <button
            type="button"
            aria-pressed={view === "front"}
            onClick={() => setView("front")}
          >
            Front
          </button>
          <button
            type="button"
            aria-pressed={view === "back"}
            onClick={() => setView("back")}
          >
            Back
          </button>
        </div>
        <div className="color-controls" role="group" aria-label="Colorway">
          {colorways.map((c, i) => (
            <button
              type="button"
              key={c.name}
              style={{ backgroundColor: c.fill }}
              aria-label={`${c.name} colorway`}
              aria-pressed={color === i}
              title={c.name}
              onClick={() => setColor(i)}
            />
          ))}
          <span aria-live="polite">{colorways[color].name}</span>
        </div>
        {!compact && (
          <label className="dimension-control">
            <input
              type="checkbox"
              checked={dimensions}
              onChange={(e) => setDimensions(e.target.checked)}
            />{" "}
            Dimensions
          </label>
        )}
      </div>
      {!compact && (
        <div className="viewer-caption">
          <span>Finished-garment CAD · mm · Rev A</span>
          <a href="/cad/field-01/field-01-technical-flats.dxf" download>
            Download DXF ↗
          </a>
        </div>
      )}
    </div>
  );
}
