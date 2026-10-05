"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { animate } from "animejs";
import { calculators } from "@/lib/engivault/calculator-data";
import type { CatalogItem } from "./catalog";

type Out = Record<string, number | string>;
const fmt = (v: number | string, sig = 8) =>
  typeof v === "number" ? v.toLocaleString("en-US", { maximumSignificantDigits: Math.min(sig, 6) }) : v;

function run(slug: string, values: Record<string, string>): { out: Out | null; error: string } {
  const config = calculators[slug];
  try {
    const x = Object.fromEntries(
      config.inputs.map((i) => {
        if (!values[i.id]?.toString().trim() || !Number.isFinite(Number(values[i.id]))) throw new Error(`Enter a finite value for ${i.label}.`);
        return [i.id, Number(values[i.id])];
      }),
    );
    const out = config.calculate(x);
    if (Object.values(out).some((v) => typeof v === "number" && !Number.isFinite(v))) throw new Error("Inputs exceed the numerical range.");
    return { out, error: "" };
  } catch (e) {
    return { out: null, error: e instanceof Error ? e.message : "Check your inputs and try again." };
  }
}

/* A number that eases from its previous value instead of jumping. */
function Readout({ value, sig }: { value: number | string; sig?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof value !== "number" || matchMedia("(prefers-reduced-motion: reduce)").matches || last.current === null || !Number.isFinite(last.current)) {
      el.textContent = String(fmt(value, sig));
      last.current = typeof value === "number" ? value : null;
      return;
    }
    const state = { v: last.current };
    const a = animate(state, { v: value, duration: 420, ease: "outQuart", onUpdate: () => { el.textContent = String(fmt(state.v, sig)); }, onComplete: () => { el.textContent = String(fmt(value, sig)); } });
    last.current = value;
    return () => { a.pause(); };
  }, [value, sig]);
  return <span ref={ref}>{fmt(value, sig)}</span>;
}

/* Sweep one input from 50% to 150% of its value and plot a numeric result. */
function Sensitivity({ slug, values }: { slug: string; values: Record<string, string> }) {
  const config = calculators[slug];
  const numericIns = config.inputs.filter((i) => !i.options && Number(values[i.id]) !== 0);
  const [inId, setInId] = useState(numericIns[0]?.id ?? "");
  const base = run(slug, values).out;
  const numericOuts = config.results.filter((r) => base && typeof base[r.id] === "number");
  const [outId, setOutId] = useState(numericOuts[0]?.id ?? "");
  const pts = useMemo(() => {
    if (!inId || !outId) return [];
    const v0 = Number(values[inId]);
    const out: [number, number][] = [];
    for (let k = 0; k <= 40; k++) {
      const v = v0 * (0.5 + k / 40);
      const r = run(slug, { ...values, [inId]: String(v) }).out;
      const y = r?.[outId];
      if (typeof y === "number" && Number.isFinite(y)) out.push([v, y]);
    }
    return out;
  }, [slug, values, inId, outId]);
  if (!numericIns.length || !numericOuts.length) return null;
  const W = 520, H = 200, P = 34;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  let [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  if (y0 === y1) { y0 -= 1; y1 += 1; }
  const sx = (x: number) => P + ((x - x0) / (x1 - x0 || 1)) * (W - P * 2);
  const sy = (y: number) => H - P + -((y - y0) / (y1 - y0)) * (H - P * 2);
  const cur = Number(values[inId]);
  const curY = base?.[outId];
  const inField = config.inputs.find((i) => i.id === inId);
  const outField = config.results.find((r) => r.id === outId);
  return (
    <section className="vault-sense" aria-label="Sensitivity">
      <header>
        <p className="eyebrow">Sensitivity · ±50%</p>
        <div className="vault-sense-pick">
          <label>
            <span>Vary</span>
            <select value={inId} onChange={(e) => setInId(e.target.value)}>
              {numericIns.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
          </label>
          <label>
            <span>Watch</span>
            <select value={outId} onChange={(e) => setOutId(e.target.value)}>
              {numericOuts.map((r) => <option key={r.id} value={r.id}>{r.label}{r.unit ? ` (${r.unit})` : ""}</option>)}
            </select>
          </label>
        </div>
      </header>
      {pts.length > 1 ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="vault-sense-chart" role="img" aria-label={`${outField?.label} as ${inField?.label} varies from 50% to 150% of its value`}>
          <path className="vs-grid" d={`M${P} ${H - P}H${W - P}M${P} ${P}V${H - P}`} />
          <path className="vs-line" d={"M" + pts.map((p) => `${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join("L")} />
          {typeof curY === "number" && (
            <g>
              <path className="vs-cross" d={`M${sx(cur)} ${H - P}V${sy(curY)}H${P}`} />
              <circle className="vs-dot" cx={sx(cur)} cy={sy(curY)} r="5" />
            </g>
          )}
          <text className="vs-label" x={P} y={H - 10}>{fmt(x0, 3)}</text>
          <text className="vs-label" x={W - P} y={H - 10} textAnchor="end">{fmt(x1, 3)} {inField?.unit}</text>
          <text className="vs-label" x={P + 6} y={P - 10}>{fmt(y1, 4)} {outField?.unit}</text>
        </svg>
      ) : (
        <p className="vault-sense-empty">This range leaves the model’s valid domain. Try another input.</p>
      )}
    </section>
  );
}

export function Calculator({ slug, prev, next, related }: { slug: string; prev: CatalogItem; next: CatalogItem; related: CatalogItem[] }) {
  const config = calculators[slug];
  const defaults = useMemo(() => Object.fromEntries(config.inputs.map((i) => [i.id, i.defaultValue])), [config]);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [settled, setSettled] = useState(defaults);
  const [copied, setCopied] = useState(false);

  // compute shortly after typing pauses, so partial numbers do not flash errors
  useEffect(() => {
    const t = setTimeout(() => setSettled(values), 160);
    return () => clearTimeout(t);
  }, [values]);
  const { out, error } = useMemo(() => run(slug, settled), [slug, settled]);
  const steps = useMemo(() => {
    if (!out || !config.generateDynamicSteps) return config.steps;
    try {
      return config.generateDynamicSteps(Object.fromEntries(config.inputs.map((i) => [i.id, Number(settled[i.id])])), out);
    } catch {
      return config.steps;
    }
  }, [config, out, settled]);
  // headline the first result that is not simply an echo of an input
  const inputLabels = new Set(config.inputs.map((i) => i.label.toLowerCase()));
  const primary = config.results.find((r) => !inputLabels.has(r.label.toLowerCase())) ?? config.results[0];
  const rest = config.results.filter((r) => r !== primary);
  const dirty = config.inputs.some((i) => values[i.id] !== defaults[i.id]);

  const report = () => ({
    tool: config.title,
    inputs: config.inputs.map((i) => ({ label: i.label, value: settled[i.id], unit: i.unit })),
    results: config.results.map((r) => ({ label: r.label, value: out?.[r.id], unit: r.unit })),
    method: steps,
    sources: config.sources ?? [],
  });
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report(), null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `engivault-${slug}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copy = async () => {
    if (!out) return;
    const text = config.results.map((r) => `${r.label}: ${fmt(out[r.id], r.significantDigits)} ${r.unit}`.trim()).join("\n");
    try { await navigator.clipboard.writeText(`${config.title}\n${text}`); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="site-container vault-tool">
      <nav className="vault-crumbs" aria-label="Breadcrumb">
        <Link href="/engivault">EngiVault</Link>
        <span aria-hidden="true">/</span>
        <span>{config.category}</span>
      </nav>
      <header className="vault-tool-head">
        <div>
          <p className="section-label"><span>({config.category})</span>{config.inputs.length} inputs → {config.results.length} results</p>
          <h1 className="vault-tool-title">{config.title}</h1>
        </div>
        <div className="vault-step">
          <Link href={`/engivault/calculators/${prev.slug}`} aria-label={`Previous: ${prev.title}`}>←</Link>
          <Link href={`/engivault/calculators/${next.slug}`} aria-label={`Next: ${next.title}`}>→</Link>
        </div>
      </header>

      <div className="vault-work">
        <form className="vault-inputs-panel" onSubmit={(e) => e.preventDefault()} aria-label="Inputs">
          <div className="vault-panel-head">
            <h2>Inputs</h2>
            {dirty && <button type="button" className="vault-link" onClick={() => setValues(defaults)}>Reset example</button>}
          </div>
          {config.inputs.map((i) => (
            <label key={i.id} htmlFor={i.id} className="vault-field">
              <span className="vault-field-label">{i.label}</span>
              <span className="vault-field-control">
                {i.options ? (
                  <select id={i.id} value={values[i.id]} onChange={(e) => setValues({ ...values, [i.id]: e.target.value })}>
                    {i.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input id={i.id} type="number" step="any" inputMode="decimal" value={values[i.id]} onChange={(e) => setValues({ ...values, [i.id]: e.target.value })} />
                )}
                {i.unit && <span className="vault-unit">{i.unit}</span>}
              </span>
            </label>
          ))}
          <p className="vault-hint">Results update as you type. Example values are loaded so you can explore the method.</p>
        </form>

        <section className={error ? "vault-readout is-error" : "vault-readout"} aria-live="polite" aria-label="Results">
          <div className="vault-readout-head">
            <span className="vault-live"><i aria-hidden="true" />{error ? "Check inputs" : "Live"}</span>
            <div className="vault-readout-actions">
              <button type="button" onClick={copy} disabled={!out}>{copied ? "Copied" : "Copy"}</button>
              <button type="button" onClick={download} disabled={!out}>Download</button>
            </div>
          </div>
          {error ? (
            <p className="vault-error" role="alert">{error}</p>
          ) : out ? (
            <>
              <div className="vault-primary">
                <span className="vault-primary-label">{primary.label}</span>
                <span className="vault-primary-value">
                  <Readout value={out[primary.id]} sig={primary.significantDigits} />
                  {primary.unit && <small>{primary.unit}</small>}
                </span>
              </div>
              <dl className="vault-results-list">
                {rest.map((r) => (
                  <div key={r.id}>
                    <dt>{r.label}</dt>
                    <dd><Readout value={out[r.id]} sig={r.significantDigits} />{r.unit && <small>{r.unit}</small>}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}
        </section>
      </div>

      <Sensitivity slug={slug} values={settled} />

      <section className="vault-method">
        <div>
          <p className="section-label"><span>(01)</span>Method & assumptions</p>
          <ol>{steps.map((s, i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{s}</p></li>)}</ol>
        </div>
        {config.sources && config.sources.length > 0 && (
          <aside>
            <p className="section-label"><span>(02)</span>Sources</p>
            <ul>
              {config.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a><small>Accessed {s.accessed}</small></li>
              ))}
            </ul>
          </aside>
        )}
      </section>

      {related.length > 0 && (
        <section className="vault-related">
          <p className="section-label"><span>(03)</span>More in {config.category}</p>
          <div>
            {related.map((r) => (
              <Link key={r.slug} href={`/engivault/calculators/${r.slug}`} className="vault-card">
                <span className="vault-card-cat">{r.category}</span>
                <h3>{r.title}</h3>
                <span className="vault-card-io"><b>{r.inputs}</b> in <i aria-hidden="true">→</i> <b>{r.results}</b> out</span>
                <span className="vault-card-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
