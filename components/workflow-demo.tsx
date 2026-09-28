"use client";
import { useState } from "react";
const workstreams = [
  {
    name: "Design & approvals",
    owner: "Design",
    budget: 28000,
    forecast: 28000,
    progress: 85,
    plan: 90,
    status: "Attention",
  },
  {
    name: "Procurement",
    owner: "Supply",
    budget: 42000,
    forecast: 45500,
    progress: 62,
    plan: 60,
    status: "Attention",
  },
  {
    name: "Implementation",
    owner: "Delivery",
    budget: 24000,
    forecast: 23000,
    progress: 35,
    plan: 35,
    status: "On track",
  },
  {
    name: "Testing & handoff",
    owner: "Quality",
    budget: 6000,
    forecast: 6000,
    progress: 10,
    plan: 10,
    status: "On track",
  },
];
const money = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
export function WorkflowDemo() {
  const [mode, setMode] = useState<"Progress" | "Cost">("Progress");
  const [exceptions, setExceptions] = useState(false);
  const rows = workstreams.filter(
    (r) => !exceptions || r.status === "Attention",
  );
  return (
    <div className="workflow-demo">
      <div className="demo-toolbar">
        <div>
          <strong>Project overview</strong>
          <span>Example project / Sample data</span>
        </div>
        <div className="demo-switch" role="group" aria-label="Dashboard view">
          {(["Progress", "Cost"] as const).map((v) => (
            <button
              type="button"
              key={v}
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="demo-summary">
        <p>
          {mode === "Progress"
            ? "Design approvals need attention."
            : "Forecast is $2,500 above budget."}
        </p>
        <span>
          {mode === "Progress"
            ? "85% complete against a 90% plan. Review open approvals before the next handoff."
            : "Procurement's $3,500 increase is partly offset by a $1,000 reduction in implementation."}
        </span>
      </div>
      <label className="demo-filter">
        <input
          type="checkbox"
          checked={exceptions}
          onChange={(e) => setExceptions(e.target.checked)}
        />{" "}
        Show items needing attention
      </label>
      <div
        className="demo-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Example project data"
      >
        <table>
          <caption className="sr-only">
            Illustrative project {mode.toLowerCase()} data
          </caption>
          <thead>
            <tr>
              <th scope="col">Workstream</th>
              <th scope="col">
                {mode === "Progress" ? "Complete / planned" : "Budget"}
              </th>
              <th scope="col">{mode === "Progress" ? "Owner" : "Forecast"}</th>
              <th scope="col">{mode === "Progress" ? "Status" : "Variance"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                <td>
                  {mode === "Progress" ? (
                    <div className="demo-progress">
                      <span>
                        {r.progress}% <small>/ {r.plan}%</small>
                      </span>
                      <div>
                        <i style={{ width: r.progress + "%" }} />
                      </div>
                    </div>
                  ) : (
                    money(r.budget)
                  )}
                </td>
                <td>{mode === "Progress" ? r.owner : money(r.forecast)}</td>
                <td>
                  {mode === "Progress" ? (
                    <span
                      className={`status-chip ${r.status === "Attention" ? "attention" : ""}`}
                    >
                      {r.status}
                    </span>
                  ) : (
                    <span className={r.forecast > r.budget ? "cost-over" : ""}>
                      {r.forecast === r.budget
                        ? "On budget"
                        : `${r.forecast > r.budget ? "+" : "−"}${money(Math.abs(r.forecast - r.budget))}`}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="demo-foot">
        <span aria-live="polite">{rows.length} workstreams shown</span>
        <span>Illustrative data · no live connection</span>
      </div>
    </div>
  );
}
