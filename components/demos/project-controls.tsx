"use client";
import { useState } from "react";
import { projectForecast, demoCsv } from "@/lib/demos/models";
import { DemoNotice, DemoMetrics, downloadDemo } from "./shared";
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export function ProjectControlsDemo() {
  const [team, setTeam] = useState("All teams");
  const [extra, setExtra] = useState(0);
  const [view, setView] = useState("Schedule");
  const [selected, setSelected] = useState("design");
  const p = projectForecast(team, extra);
  const row = p.rows.find((r) => r.id === selected);
  return (
    <div className="demo-app">
      <DemoNotice />
      <div className="demo-toolbar">
        <div>
          <p className="eyebrow">Sample program / Delivery workspace</p>
          <h2>Project control room</h2>
        </div>
        <label>
          Team
          <select
            value={team}
            onChange={(e) => {
              setTeam(e.target.value);
              setSelected("");
            }}
          >
            {["All teams", "Delivery", "Engineering", "Operations"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setTeam("All teams");
            setExtra(0);
            setSelected("design");
            setView("Schedule");
          }}
        >
          Reset demo
        </button>
      </div>
      <DemoMetrics
        items={[
          ["Baseline", money(p.baseline), "Planned hours × role rates"],
          ["Actual to date", money(p.actual), "Fictional approved hours"],
          [
            "Forecast at completion",
            money(p.forecast),
            "Actual + remaining work",
          ],
          [
            "Forecast variance",
            (p.variance > 0 ? "+" : "") + money(p.variance),
            "Compared with baseline",
          ],
        ]}
      />
      <div className="demo-scenario">
        <label htmlFor="extra-hours">
          What if design needs more time?{" "}
          <strong>{extra} additional hours</strong>
        </label>
        <input
          id="extra-hours"
          type="range"
          min="0"
          max="160"
          step="8"
          value={extra}
          onChange={(e) => setExtra(Number(e.target.value))}
        />
        <p>
          Adjust remaining effort to recalculate the forecast. Filters apply to
          every cost total; schedule dates stay fixed in this scenario.
        </p>
      </div>
      <div className="demo-tabs" role="group" aria-label="Project view">
        {["Schedule", "Cost detail"].map((t) => (
          <button key={t} aria-pressed={view === t} onClick={() => setView(t)}>
            {t}
          </button>
        ))}
      </div>
      {view === "Schedule" ? (
        <div
          className="demo-table-scroll"
          role="region"
          aria-label="Project schedule, scroll horizontally on small screens"
          tabIndex={0}
        >
          <div className="demo-schedule">
            <div className="demo-schedule-head">
              <span>Workstream</span>
              <div>
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i}>W{i + 1}</span>
                ))}
              </div>
            </div>
            {p.rows.map((r) => (
              <div className="demo-schedule-row" key={r.id}>
                <button
                  onClick={() => setSelected(r.id)}
                  aria-pressed={selected === r.id}
                >
                  {r.name}
                  <small>{r.progress}% complete</small>
                </button>
                <div className="demo-schedule-track">
                  <button
                    aria-label={`Inspect ${r.name}`}
                    onClick={() => setSelected(r.id)}
                    className="demo-schedule-bar"
                    style={{
                      left: `${(r.start / 12) * 100}%`,
                      width: `${(r.weeks / 12) * 100}%`,
                    }}
                  >
                    <span style={{ width: `${r.progress}%` }} />
                    <b>{r.progress}%</b>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="demo-table-scroll"
          role="region"
          aria-label="Cost detail"
          tabIndex={0}
        >
          <table>
            <caption>
              Invented hours and rates; costs are calculated from these rows.
            </caption>
            <thead>
              <tr>
                <th>Workstream</th>
                <th>Rate / hour</th>
                <th>Actual hours</th>
                <th>Remaining hours</th>
                <th>Forecast cost</th>
              </tr>
            </thead>
            <tbody>
              {p.rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row">
                    <button onClick={() => setSelected(r.id)}>
                      {r.name} ↗
                    </button>
                  </th>
                  <td>{money(r.rate)}</td>
                  <td>{r.actual}</td>
                  <td>{r.remaining}</td>
                  <td>{money((r.actual + r.remaining) * r.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="demo-detail" aria-live="polite">
        {row ? (
          <>
            <p className="eyebrow">Workstream detail</p>
            <h3>{row.name}</h3>
            <p>
              {row.team} · Weeks {row.start + 1}–{row.start + row.weeks} ·{" "}
              {row.progress}% complete
            </p>
            <p>
              {row.actual} actual hours + {row.remaining} remaining hours at{" "}
              {money(row.rate)}/hour ={" "}
              <strong>
                {money((row.actual + row.remaining) * row.rate)} forecast cost.
              </strong>
            </p>
          </>
        ) : (
          <p>
            Select a workstream to trace its forecast back to hours and rate.
          </p>
        )}
      </div>
      <div className="demo-bottom">
        <p>
          Demonstrates schedule visibility, filtered cost rollups, scenario
          planning, and traceable calculations.
        </p>
        <button
          onClick={() =>
            downloadDemo(
              "sample-project-forecast.csv",
              demoCsv(
                p.rows.map((r) => ({
                  workstream: r.name,
                  team: r.team,
                  actual_hours: r.actual,
                  remaining_hours: r.remaining,
                  hourly_rate: r.rate,
                  forecast_cost: (r.actual + r.remaining) * r.rate,
                })),
                [
                  "workstream",
                  "team",
                  "actual_hours",
                  "remaining_hours",
                  "hourly_rate",
                  "forecast_cost",
                ],
              ),
            )
          }
        >
          Export sample forecast ↓
        </button>
      </div>
    </div>
  );
}
