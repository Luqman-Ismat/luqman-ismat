"use client";
import { useState } from "react";
import { experience, experiencePosition, monthNumber } from "@/lib/experience";
const dateLabel = (s: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(s + "-01T00:00:00Z"));
export function ExperienceTimeline({ asOf = "2026-09" }: { asOf?: string }) {
  const [filter, setFilter] = useState("All experience");
  const [zoom, setZoom] = useState("Years");
  const [open, setOpen] = useState<string | null>("risk");
  const rows = experience.filter(
    (r) => filter === "All experience" || r.employer === filter,
  );
  const months = monthNumber(asOf) - monthNumber("2022-01") + 1;
  const step = zoom === "Years" ? 12 : 3;
  const ticks = Array.from({ length: Math.ceil(months / step) }, (_, i) => {
    const m = i * step;
    return {
      left: (m / months) * 100,
      label:
        zoom === "Years"
          ? String(2022 + Math.floor(m / 12))
          : `Q${Math.floor((m % 12) / 3) + 1} ${String(2022 + Math.floor(m / 12)).slice(2)}`,
    };
  });
  return (
    <section className="site-container experience-section" id="experience">
      <div className="section-top">
        <div>
          <p className="eyebrow">Experience, over time</p>
          <h2>One career. Connected disciplines.</h2>
        </div>
        <p>
          Explore the overlapping roles that connect engineering, analysis, and
          project delivery. Select a role to read more.
        </p>
      </div>
      <div className="experience-toolbar">
        <label>
          Employer
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setOpen(null);
            }}
          >
            {["All experience", "Chemex Global", "Pinnacle"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <div role="group" aria-label="Timeline scale">
          {["Years", "Quarters"].map((v) => (
            <button
              key={v}
              aria-pressed={v === zoom}
              onClick={() => setZoom(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div
        className="experience-scroll"
        role="region"
        aria-label="Experience Gantt chart, horizontally scrollable"
        tabIndex={0}
      >
        <div
          className="experience-chart"
          style={{ minWidth: zoom === "Years" ? 850 : 1450 }}
        >
          <div className="experience-axis">
            <span>Role & organization</span>
            <div>
              {ticks.map((t) => (
                <span key={t.label} style={{ left: `${t.left}%` }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          {rows.map((r) => {
            const pos = experiencePosition(r.start, r.end, asOf);
            return (
              <div key={r.id} className="experience-group">
                <div className="experience-row">
                  <button
                    className="experience-label"
                    aria-expanded={open === r.id}
                    aria-controls={`experience-${r.id}`}
                    onClick={() => setOpen(open === r.id ? null : r.id)}
                  >
                    <strong>{r.role}</strong>
                    <span>{r.employer}</span>
                    <small>
                      {dateLabel(r.start)} –{" "}
                      {r.end ? dateLabel(r.end) : "Present"}{" "}
                      <b aria-hidden="true">{open === r.id ? "−" : "+"}</b>
                    </small>
                  </button>
                  <div className="experience-track">
                    {ticks.map((t) => (
                      <i key={t.label} style={{ left: `${t.left}%` }} />
                    ))}
                    <button
                      className={`experience-bar experience-${r.kind.toLowerCase().replace(" ", "-")}`}
                      style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
                      aria-label={`Read about ${r.role} at ${r.employer}`}
                      aria-expanded={open === r.id}
                      aria-controls={`experience-${r.id}`}
                      onClick={() => setOpen(open === r.id ? null : r.id)}
                    >
                      <span>{r.kind}</span>
                    </button>
                  </div>
                </div>
                {open === r.id && (
                  <div
                    id={`experience-${r.id}`}
                    className="experience-expanded"
                  >
                    <h3>{r.role}</h3>
                    <p>{r.summary}</p>
                    <ul>
                      {r.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="experience-note">
        Dates shown by month. Overlapping bars reflect concurrent
        responsibilities. On smaller screens, scroll within the chart to explore
        the timeline.
      </p>
    </section>
  );
}
