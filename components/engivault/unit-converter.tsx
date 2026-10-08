"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { unitCategories } from "@/lib/engivault/unit-converter-data";
import { convertQuantity } from "@/lib/engivault/convert";

const show = (n: number) =>
  Math.abs(n) !== 0 && (Math.abs(n) >= 1e9 || Math.abs(n) < 1e-6)
    ? n.toExponential(6).replace(/\.?0+e/, "e")
    : n.toLocaleString("en-US", { maximumSignificantDigits: 10 });

export function UnitConverter() {
  const reduced = useReducedMotion();
  const [category, setCategory] = useState(unitCategories.find((c) => c.id === "length")?.id ?? unitCategories[0].id);
  const c = unitCategories.find((x) => x.id === category)!;
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [value, setValue] = useState("1");
  const [spin, setSpin] = useState(0);
  const chips = useRef<HTMLDivElement>(null);
  // keep the selected quantity in view inside the scrolling chip row
  useEffect(() => {
    const row = chips.current, el = row?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (row && el) row.scrollTo({ left: el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [category]);

  const valid = value.trim() !== "" && Number.isFinite(Number(value));
  let output = "";
  let error = "";
  try {
    if (!valid) throw new Error("Enter a finite number");
    const r = convertQuantity(category, Number(value), from, to);
    if (!Number.isFinite(r)) throw new Error("Value exceeds numerical range");
    output = show(r);
  } catch (e) {
    error = e instanceof Error ? e.message : "Check your value";
  }
  const all = valid && !error
    ? c.units.map((u, i) => { try { return { u, i, v: show(convertQuantity(category, Number(value), from, i)) }; } catch { return { u, i, v: "-" }; } })
    : [];

  return (
    <div className="site-container vault-tool vault-convert">
      <nav className="vault-crumbs" aria-label="Breadcrumb">
        <Link href="/engivault">EngiVault</Link>
        <span aria-hidden="true">/</span>
        <span>Utilities</span>
      </nav>
      <header className="vault-tool-head">
        <div>
          <p className="section-label"><span>(Utilities)</span>{unitCategories.length} quantities</p>
          <h1 className="vault-tool-title">Unit converter</h1>
        </div>
      </header>

      <div ref={chips} className="vault-chips is-scroll" role="radiogroup" aria-label="Quantity">
        {unitCategories.map((q) => (
          <button key={q.id} type="button" role="radio" aria-checked={category === q.id} onClick={() => { setCategory(q.id); setFrom(0); setTo(Math.min(1, q.units.length - 1)); }}>
            {category === q.id && <motion.span layoutId="uc-chip" className="vault-chip-pill" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="vault-chip-label">{q.name}</span>
          </button>
        ))}
      </div>

      <div className="uc-board">
        <div className="uc-side">
          <label htmlFor="convert-value" className="uc-label">From</label>
          <input id="convert-value" className="uc-value" type="number" step="any" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          <label htmlFor="from-unit" className="sr-only">From unit</label>
          <select id="from-unit" value={from} onChange={(e) => setFrom(Number(e.target.value))}>
            {c.units.map((u, i) => <option key={u.id} value={i}>{u.name} ({u.symbol})</option>)}
          </select>
        </div>
        <motion.button
          type="button"
          className="uc-swap"
          aria-label="Swap units"
          animate={{ rotate: spin * 180 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 18 }}
          onClick={() => { setFrom(to); setTo(from); setSpin((s) => s + 1); }}
        >
          ⇄
        </motion.button>
        <div className="uc-side is-out" aria-live="polite">
          <span className="uc-label">To</span>
          <output className={error ? "uc-value is-error" : "uc-value"}>{error || output}</output>
          <label htmlFor="to-unit" className="sr-only">To unit</label>
          <select id="to-unit" value={to} onChange={(e) => setTo(Number(e.target.value))}>
            {c.units.map((u, i) => <option key={u.id} value={i}>{u.name} ({u.symbol})</option>)}
          </select>
        </div>
      </div>

      {all.length > 0 && (
        <section className="uc-all" aria-label={`${value} ${c.units[from].symbol} in every ${c.name.toLowerCase()} unit`}>
          <p className="section-label"><span>(All)</span>{value} {c.units[from].symbol} in every unit</p>
          <ul>
            {all.map(({ u, i, v }) => (
              <li key={u.id} className={i === to ? "is-to" : undefined}>
                <button type="button" onClick={() => setTo(i)}>
                  <span>{u.name}</span>
                  <b>{v}</b>
                  <small>{u.symbol}</small>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(c.note || c.sources?.length) && (
        <aside className="uc-notes">
          {c.note && <p>{c.note}</p>}
          {c.sources?.map((s) => (
            <p key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a></p>
          ))}
        </aside>
      )}
    </div>
  );
}
