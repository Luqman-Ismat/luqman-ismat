/* Line glyphs for the services. One stroke weight, drawn on a 64 grid. */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };

export function Glyph({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {id === "websites" && (
        <g {...P}>
          <rect x="6" y="12" width="52" height="40" />
          <path d="M6 20h52M11 16h2M15 16h2M19 16h2M12 27h22M12 32h16M40 27h12v19H40zM12 40h22M12 46h14" />
        </g>
      )}
      {id === "payments" && (
        <g {...P}>
          <rect x="6" y="16" width="40" height="26" />
          <path d="M6 23h40M11 35h10M30 35h10" />
          <circle cx="46" cy="44" r="11" />
          <path d="M46 38v12M42.5 41.5c0-1.6 1.6-2.5 3.5-2.5s3.5.9 3.5 2.4c0 3.3-7 1.8-7 5.1 0 1.5 1.6 2.5 3.5 2.5s3.5-.9 3.5-2.5" />
        </g>
      )}
      {id === "automation" && (
        <g {...P}>
          <path d="M14 26a18 18 0 0 1 33-6M50 38a18 18 0 0 1-33 6" />
          <path d="M47 12v8h-8M17 52v-8h8" />
          <rect x="26" y="26" width="12" height="12" />
        </g>
      )}
      {id === "knowledge" && (
        <g {...P}>
          <path d="M8 14h28v36H8zM14 9h28v5M20 4h28v40h-6" />
          <path d="M13 22h18M13 28h18M13 34h12" />
          <circle cx="42" cy="44" r="8" />
          <path d="M48 50l9 9" />
        </g>
      )}
      {id === "dashboards" && (
        <g {...P}>
          <path d="M6 56h52M10 56V40h7v16M23 56V30h7v26M36 56V36h7v20M49 56V22h7v34" />
          <path d="M8 30l14-12 13 8 20-18" />
          <circle cx="55" cy="8" r="2" />
        </g>
      )}
      {id === "integrations" && (
        <g {...P}>
          <rect x="4" y="22" width="18" height="20" />
          <rect x="42" y="22" width="18" height="20" />
          <path d="M22 28h20M22 36h20" />
          <path d="M36 24l6 4-6 4M28 32l-6 4 6 4" />
          <path d="M9 28h8M9 32h8M9 36h5M47 28h8M47 32h8M47 36h5" />
        </g>
      )}
      {id === "engineering" && (
        <g {...P}>
          <circle cx="32" cy="34" r="22" />
          <circle cx="32" cy="34" r="3" />
          <path d="M32 34l12-12M14 34h4M46 34h4M32 16v4M19.3 21.3l2.8 2.8M44.7 21.3l-2.8 2.8" />
          <path d="M22 48h20" />
        </g>
      )}
    </svg>
  );
}
