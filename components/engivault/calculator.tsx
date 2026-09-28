"use client";
import { useState } from "react";
import Link from "next/link";
import { calculators } from "@/lib/engivault/calculator-data";
export function Calculator({ slug }: { slug: string }) {
  const config = calculators[slug];
  const defaults = Object.fromEntries(
    config.inputs.map((i) => [i.id, i.defaultValue]),
  );
  const [values, setValues] = useState(defaults);
  const [result, setResult] = useState<Record<string, number | string> | null>(
    null,
  );
  const [error, setError] = useState("");
  const [steps, setSteps] = useState(config.steps);
  function calculate(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setError("");
    try {
      const x = Object.fromEntries(
        config.inputs.map((i) => {
          if (!values[i.id]?.trim() || !Number.isFinite(Number(values[i.id])))
            throw new Error(`Enter a finite value for ${i.label}.`);
          return [i.id, Number(values[i.id])];
        }),
      );
      const output = config.calculate(x);
      if (
        Object.values(output).some(
          (v) => typeof v === "number" && !Number.isFinite(v),
        )
      )
        throw new Error("Inputs exceed the numerical range.");
      setResult(output);
      setSteps(config.generateDynamicSteps?.(x, output) ?? config.steps);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Check your inputs and try again.",
      );
    }
  }
  function edit(id: string, value: string) {
    setValues({ ...values, [id]: value });
    setResult(null);
    setError("");
    setSteps(config.steps);
  }
  function download() {
    if (!result) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            tool: config.title,
            inputs: config.inputs.map((i) => ({
              label: i.label,
              value: values[i.id],
              unit: i.unit,
            })),
            results: config.results.map((i) => ({
              label: i.label,
              value: result[i.id],
              unit: i.unit,
            })),
            method: steps,
            sources: config.sources ?? [],
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engivault-${slug}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="site-container vault-content">
      <Link href="/engivault" className="inline-link">
        ← All calculators
      </Link>
      <div className="vault-tool-heading">
        <p className="eyebrow">{config.category}</p>
        <h1>{config.title}</h1>
        <p>
          Enter values in the stated units. Example inputs are provided to help
          you explore the method.
        </p>
      </div>
      <div className="vault-tool-grid">
        <form onSubmit={calculate} className="vault-panel">
          <h2>Inputs</h2>
          <div className="vault-inputs">
            {config.inputs.map((i) => (
              <label key={i.id} htmlFor={i.id}>
                <span>
                  {i.label}
                  <small>{i.unit}</small>
                </span>
                {i.options ? (
                  <select
                    id={i.id}
                    value={values[i.id]}
                    onChange={(e) => edit(i.id, e.target.value)}
                  >
                    {i.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={i.id}
                    type="number"
                    step="any"
                    required
                    value={values[i.id]}
                    onChange={(e) => edit(i.id, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          {error && (
            <p role="alert" className="vault-error">
              {error}
            </p>
          )}
          <div className="action-row">
            <button className="consulting-button" type="submit">
              Calculate →
            </button>
            <button
              className="consulting-button secondary"
              type="button"
              onClick={() => {
                setValues(defaults);
                setResult(null);
                setError("");
                setSteps(config.steps);
              }}
            >
              Reset example
            </button>
          </div>
        </form>
        <section className="vault-panel vault-results" aria-live="polite">
          <h2>Results</h2>
          {result ? (
            <>
              <dl>
                {config.results.map((i) => (
                  <div key={i.id}>
                    <dt>{i.label}</dt>
                    <dd>
                      {typeof result[i.id] === "number"
                        ? Number(result[i.id]).toLocaleString("en-US", {
                            maximumSignificantDigits: i.significantDigits ?? 8,
                          })
                        : result[i.id]}{" "}
                      <small>{i.unit}</small>
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                onClick={download}
                className="consulting-button secondary"
              >
                Download calculation
              </button>
            </>
          ) : (
            <p>
              Your results will appear here after calculation. Changing an input
              clears the previous result.
            </p>
          )}
        </section>
      </div>
      <section className="vault-method">
        <h2>Method & assumptions</h2>
        <ol>
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        {config.sources && (
          <>
            <h3>Sources</h3>
            <ul>
              {config.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
