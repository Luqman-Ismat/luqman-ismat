"use client";
import { useState } from "react";
import { inspectionPlan, demoCsv } from "@/lib/demos/models";
import { DemoNotice, DemoMetrics, downloadDemo } from "./shared";
export function InspectionPlanningDemo() {
  const [threshold, setThreshold] = useState(1);
  const [buffer, setBuffer] = useState(1);
  const [selected, setSelected] = useState("asset-a");
  const [filter, setFilter] = useState("All actions");
  const rows = inspectionPlan(threshold, buffer);
  const asset = rows.find((r) => r.id === selected)!;
  const filtered = rows.filter(
    (r) =>
      filter === "All actions" ||
      (filter === "Review hold" ? r.hold : r.action === filter),
  );
  const points = Array.from(
    { length: 13 },
    (_, m) =>
      `${45 + m * 46},${220 - ((asset.start + asset.growth * m) / 2) * 180}`,
  ).join(" ");
  return (
    <div className="demo-app">
      <DemoNotice />
      <div className="demo-toolbar">
        <div>
          <p className="eyebrow">Sample fleet / Scenario comparison</p>
          <h2>Inspection planning workbench</h2>
        </div>
        <button
          onClick={() => {
            setThreshold(1);
            setBuffer(1);
            setSelected("asset-a");
            setFilter("All actions");
          }}
        >
          Reset demo
        </button>
      </div>
      <DemoMetrics
        items={[
          [
            "Assets in scope",
            String(rows.length),
            "Entirely fictional equipment",
          ],
          [
            "Move earlier",
            String(rows.filter((r) => r.action === "Move earlier").length),
            "Compare with the sample plan",
          ],
          [
            "Review holds",
            String(rows.filter((r) => r.hold).length),
            "Held rows excluded from export",
          ],
          ["Planning horizon", "12 months", "Illustrative timing model"],
        ]}
      />
      <div className="demo-two-columns">
        <section className="demo-chart">
          <div className="demo-chart-heading">
            <h3>{asset.name} · Risk trend</h3>
            <span>Illustrative index</span>
          </div>
          <svg
            viewBox="0 0 640 260"
            role="img"
            aria-label={`${asset.name} illustrative risk trend with threshold ${threshold} and proposed month ${asset.proposed ?? "outside horizon"}`}
          >
            <line x1="45" y1="220" x2="610" y2="220" className="chart-grid" />
            {[0, 0.5, 1, 1.5, 2].map((n) => (
              <g key={n}>
                <line
                  x1="45"
                  y1={220 - n * 90}
                  x2="610"
                  y2={220 - n * 90}
                  className="chart-grid"
                />
                <text x="5" y={224 - n * 90}>
                  {n.toFixed(1)}
                </text>
              </g>
            ))}
            <line
              x1="45"
              x2="610"
              y1={220 - threshold * 90}
              y2={220 - threshold * 90}
              className="chart-threshold"
            />
            <polyline points={points} fill="none" className="chart-line" />
            {asset.proposed !== null && (
              <line
                x1={45 + asset.proposed * 46}
                x2={45 + asset.proposed * 46}
                y1="30"
                y2="220"
                className="chart-proposal"
              />
            )}
            {[0, 3, 6, 9, 12].map((m) => (
              <text key={m} x={45 + m * 46} y="246" textAnchor="middle">
                M{m}
              </text>
            ))}
          </svg>
          <div className="chart-legend">
            <span>Solid: illustrative risk</span>
            <span>Dashed: threshold</span>
            <span>Dotted: proposed timing</span>
          </div>
          <p>
            {asset.proposed === null
              ? "No threshold crossing in this horizon."
              : `First threshold crossing: month ${asset.breach}. Proposed intervention: month ${asset.proposed}.`}
            {asset.hold
              ? " This asset has a review hold and cannot be exported."
              : ""}
          </p>
        </section>
        <section className="demo-scenario">
          <h3>Compare a scenario</h3>
          <label htmlFor="risk-threshold">
            Illustrative threshold <strong>{threshold.toFixed(1)}</strong>
          </label>
          <input
            id="risk-threshold"
            type="range"
            min="0.7"
            max="1.3"
            step="0.1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
          <label htmlFor="planning-buffer">
            Lead time before crossing
            <select
              id="planning-buffer"
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
            >
              <option value="1">1 month</option>
              <option value="2">2 months</option>
              <option value="3">3 months</option>
            </select>
          </label>
          <p>
            This demo uses invented linear risk trends to show the review
            workflow. It does not reproduce the production optimization engine
            or provide inspection recommendations.
          </p>
        </section>
      </div>
      <div className="demo-toolbar">
        <h3>Proposed actions</h3>
        <label>
          Action filter
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {[
              "All actions",
              "Move earlier",
              "Defer",
              "Keep planned",
              "Outside horizon",
              "Review hold",
            ].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="demo-table-scroll"
        role="region"
        aria-label="Inspection actions"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th>Asset</th>
              <th>Area</th>
              <th>Current month</th>
              <th>Proposed month</th>
              <th>Action</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} data-selected={r.id === selected}>
                <th scope="row">
                  <button
                    onClick={() => setSelected(r.id)}
                    aria-pressed={r.id === selected}
                  >
                    {r.name} ↗
                  </button>
                </th>
                <td>{r.area}</td>
                <td>M{r.planned}</td>
                <td>
                  {r.proposed === null ? "Outside horizon" : `M${r.proposed}`}
                </td>
                <td>{r.action}</td>
                <td>
                  {r.hold ? (
                    <span className="demo-warning">Review hold</span>
                  ) : (
                    "Ready to review"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="demo-empty">
            No actions match this filter. Change the scenario or choose All
            actions.
          </p>
        )}
      </div>
      <div className="demo-bottom">
        <p>
          Export includes all proposed rows without a hold, regardless of the
          display filter. Review holds are never silently included.
        </p>
        <button
          onClick={() =>
            downloadDemo(
              "sample-inspection-plan.csv",
              demoCsv(
                rows
                  .filter((r) => !r.hold && r.proposed !== null)
                  .map((r) => ({
                    asset: r.name,
                    current_month: r.planned,
                    proposed_month: r.proposed!,
                    action: r.action,
                  })),
                ["asset", "current_month", "proposed_month", "action"],
              ),
            )
          }
        >
          Export unheld sample rows ↓
        </button>
      </div>
    </div>
  );
}
