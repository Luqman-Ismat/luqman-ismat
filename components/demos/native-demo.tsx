"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type Kind = "project" | "inspection";
type Registry = Record<string, { mount: (el: HTMLElement, options?: { view?: number }) => () => void }>;
declare global {
  interface Window { __demos?: Registry }
}

/* Brand presets show the same working tool dressed for different clients. */
const presets = [
  { id: "site", name: "This site", accent: "", font: "", corners: 1, density: 1 },
  { id: "refinery", name: "Refinery ops", accent: "#0f9d8a", font: "var(--font-geist-mono, ui-monospace)", corners: 0.5, density: 0.94 },
  { id: "utility", name: "Utility", accent: "#2563eb", font: "'Montserrat Variable', system-ui", corners: 1.4, density: 1 },
  { id: "build", name: "Construction", accent: "#e8a500", font: "system-ui", corners: 0.15, density: 0.94 },
];
const fonts = [
  { label: "Geist", value: "" },
  { label: "Montserrat", value: "'Montserrat Variable', system-ui" },
  { label: "System UI", value: "system-ui" },
  { label: "Mono", value: "var(--font-geist-mono, ui-monospace)" },
];

const loading: Partial<Record<Kind, Promise<void>>> = {};
function loadBundle(kind: Kind) {
  if (window.__demos?.[kind]) return Promise.resolve();
  loading[kind] ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `/examples/${kind}/app.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Could not load the ${kind} demo`));
    document.body.appendChild(s);
  });
  return loading[kind]!;
}

/* Mounts a working application directly in the page (no iframe). Its CSS is
   scoped to .demo-scope and bridged to the site's tokens, so it follows the
   site theme, and visitors can re-brand it live. */
export function NativeDemo({ kind, title, view }: { kind: Kind; title: string; view?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [preset, setPreset] = useState("site");
  const [accent, setAccent] = useState("");
  const [font, setFont] = useState("");
  const [corners, setCorners] = useState(1);
  const [density, setDensity] = useState(1);

  useEffect(() => {
    let unmount: (() => void) | undefined;
    let live = true;
    loadBundle(kind)
      .then(() => {
        if (!live || !host.current) return;
        unmount = window.__demos![kind].mount(host.current, { view });
        setReady(true);
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
      unmount?.();
    };
  }, [kind, view]);

  const apply = (id: string) => {
    const p = presets.find((x) => x.id === id)!;
    setPreset(id);
    setAccent(p.accent);
    setFont(p.font);
    setCorners(p.corners);
    setDensity(p.density);
  };

  const style = {
    ...(accent ? { "--demo-accent": accent } : {}),
    ...(font ? { "--demo-font": font } : {}),
    "--demo-radius": corners,
    zoom: density,
  } as CSSProperties;

  return (
    <section className="native-demo" aria-label={title}>
      <link rel="stylesheet" href={`/examples/${kind}/scoped.css`} precedence="demo" />
      <div className="brand-bar">
        <div className="brand-bar-intro">
          <p className="eyebrow">Working application · Fictional data</p>
          <p className="brand-bar-title">Re-brand this tool</p>
        </div>
        <div className="brand-presets" role="radiogroup" aria-label="Brand preset">
          {presets.map((p) => (
            <button key={p.id} type="button" role="radio" aria-checked={preset === p.id} onClick={() => apply(p.id)}>
              <span style={{ background: p.accent || "hsl(var(--signal))" }} />
              {p.name}
            </button>
          ))}
        </div>
        <div className="brand-controls">
          <label>
            Accent
            <input type="color" value={accent || "#ff4a0a"} onChange={(e) => { setAccent(e.target.value); setPreset("custom"); }} />
          </label>
          <label>
            Type
            <select value={font} onChange={(e) => { setFont(e.target.value); setPreset("custom"); }}>
              {fonts.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          <label>
            Corners
            <input type="range" min="0" max="1.8" step="0.1" value={corners} onChange={(e) => { setCorners(Number(e.target.value)); setPreset("custom"); }} />
          </label>
          <label className="brand-density">
            <input type="checkbox" checked={density < 1} onChange={(e) => { setDensity(e.target.checked ? 0.92 : 1); setPreset("custom"); }} />
            Compact
          </label>
        </div>
      </div>
      <div ref={host} className={ready ? "demo-scope is-ready" : "demo-scope"} style={style} />
      {!ready && !error && <p className="native-demo-status">Loading the working application…</p>}
      {error && <p className="native-demo-status" role="alert">{error}. <a href={`/examples/${kind}/index.html`}>Open it on its own page</a>.</p>}
    </section>
  );
}
