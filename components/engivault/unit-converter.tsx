"use client";
import { useState } from "react";
import { unitCategories } from "@/lib/engivault/unit-converter-data";
import { convertQuantity } from "@/lib/engivault/convert";
export function UnitConverter() {
  const [category, setCategory] = useState(
    unitCategories.find((c) => c.id === "length")?.id ?? unitCategories[0].id,
  );
  const c = unitCategories.find((c) => c.id === category)!;
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [value, setValue] = useState("1");
  let output = "Enter a finite number";
  try {
    if (value.trim() && Number.isFinite(Number(value))) {
      const result = convertQuantity(category, Number(value), from, to);
      output = Number.isFinite(result)
        ? result.toLocaleString("en-US", { maximumSignificantDigits: 12 })
        : "Value exceeds numerical range";
    }
  } catch (e) {
    output = e instanceof Error ? e.message : "Check your value";
  }
  return (
    <div className="site-container vault-content">
      <div className="vault-tool-heading">
        <p className="eyebrow">ENGiVAULT / Everyday essentials</p>
        <h1>Unit converter.</h1>
        <p>
          Convert engineering quantities with explicit definitions and reference
          conditions.
        </p>
      </div>
      <div className="vault-panel unit-panel">
        <label htmlFor="quantity">Quantity</label>
        <select
          id="quantity"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setFrom(0);
            setTo(1);
          }}
        >
          {unitCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="vault-inputs">
          <label htmlFor="convert-value">
            Value
            <input
              id="convert-value"
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <label htmlFor="from-unit">
            From
            <select
              id="from-unit"
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
            >
              {c.units.map((u, i) => (
                <option key={u.id} value={i}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="to-unit">
            To
            <select
              id="to-unit"
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
            >
              {c.units.map((u, i) => (
                <option key={u.id} value={i}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="consulting-button secondary"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          Swap units ⇄
        </button>
        <output className="unit-output" aria-live="polite">
          {output} <small>{c.units[to].symbol}</small>
        </output>
        {c.note && <p>{c.note}</p>}
        {c.sources?.map((s) => (
          <p key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title} ↗
            </a>
          </p>
        ))}
      </div>
    </div>
  );
}
