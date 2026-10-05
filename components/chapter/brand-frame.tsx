"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* Presets show the same working components dressed for different clients. */
const presets = [
  { id: "site", name: "This site", accent: "", font: "", corners: 1, compact: false },
  { id: "refinery", name: "Refinery ops", accent: "#0f9d8a", font: "var(--font-geist-mono, ui-monospace)", corners: 0.5, compact: true },
  { id: "utility", name: "Utility", accent: "#2563eb", font: "'Montserrat Variable', system-ui", corners: 1.4, compact: false },
  { id: "build", name: "Construction", accent: "#e8a500", font: "system-ui", corners: 0.15, compact: true },
];

/* Wraps a chapter's live components. One floating control re-brands every
   component on the page at once. */
export function BrandFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("site");
  const [accent, setAccent] = useState("");
  const [corners, setCorners] = useState(1);
  const [compact, setCompact] = useState(false);
  const [font, setFont] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  // the dock only shows while the live components are on screen
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setNear(en.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const apply = (id: string) => {
    const p = presets.find((x) => x.id === id)!;
    setPreset(id); setAccent(p.accent); setFont(p.font); setCorners(p.corners); setCompact(p.compact);
  };
  const style = {
    ...(accent ? { "--demo-accent": accent } : {}),
    ...(font ? { "--demo-font": font } : {}),
    "--demo-radius": corners,
    "--demo-zoom": compact ? 0.92 : 1,
  } as CSSProperties;
  return (
    <div ref={frame} className="brand-frame" style={style}>
      {children}
      <div className={`brand-dock${open ? " is-open" : ""}${near || open ? "" : " is-away"}`}>
        <button type="button" className="brand-dock-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span className="brand-dock-swatch" style={{ background: accent || "hsl(var(--signal))" }} />
          {open ? "Done" : "Re-brand these components"}
        </button>
        {open && (
          <div className="brand-dock-panel">
            <div className="brand-presets" role="radiogroup" aria-label="Brand preset">
              {presets.map((p) => (
                <button key={p.id} type="button" role="radio" aria-checked={preset === p.id} onClick={() => apply(p.id)}>
                  <span style={{ background: p.accent || "hsl(var(--signal))" }} />{p.name}
                </button>
              ))}
            </div>
            <div className="brand-controls">
              <label>Accent<input type="color" value={accent || "#ff4a0a"} onChange={(e) => { setAccent(e.target.value); setPreset("custom"); }} /></label>
              <label>Corners<input type="range" min="0" max="1.8" step="0.1" value={corners} onChange={(e) => { setCorners(Number(e.target.value)); setPreset("custom"); }} /></label>
              <label><input type="checkbox" checked={compact} onChange={(e) => { setCompact(e.target.checked); setPreset("custom"); }} />Compact</label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
