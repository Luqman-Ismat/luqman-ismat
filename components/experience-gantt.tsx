"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { experience, monthNumber } from "@/lib/experience";

type Row = (typeof experience)[number];
const START = "2022-01";
const fmt = (s: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(s + "-01T00:00:00Z"));
const span = (a: string, b: string) => {
  const m = monthNumber(b) - monthNumber(a) + 1;
  const y = Math.floor(m / 12), r = m % 12;
  return [y && `${y} yr`, r && `${r} mo`].filter(Boolean).join(" ");
};
const kinds = ["Engineering", "Analytics", "Project controls"] as const;
const kindClass = (k: string) => `k-${k.toLowerCase().replace(/\s+/g, "-")}`;

/* Experience as a schedule: lanes per employer, bars that build themselves
   in when the chart enters, a live "today" line and the graduation
   milestone. Select a bar (or arrow through the rows) to read the role. */
export function ExperienceGantt({ asOf }: { asOf: string }) {
  const ref = useRef<HTMLElement>(null);
  const [today, setToday] = useState(asOf);
  const [inView, setInView] = useState(false);
  const [sel, setSel] = useState(experience[experience.length - 1].id);
  const [hover, setHover] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    // The page is static; move "today" to the visitor's month after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // axis: from Jan 2022 to a quarter past today, one tick per year
  const axis = useMemo(() => {
    const from = monthNumber(START), to = monthNumber(today) + 4;
    const total = to - from;
    const x = (s: string) => ((monthNumber(s) - from) / total) * 100;
    const years: { label: string; left: number }[] = [];
    for (let y = 2022; (y - 2022) * 12 < total; y++) years.push({ label: String(y), left: x(`${y}-01`) });
    return { x, years };
  }, [today]);

  const groups = useMemo(() => {
    const out: { employer: string; rows: Row[]; from: string; to: string | null }[] = [];
    for (const r of experience) {
      let g = out.find((x) => x.employer === r.employer);
      if (!g) { g = { employer: r.employer, rows: [], from: r.start, to: r.end }; out.push(g); }
      g.rows.push(r);
      if (r.start < g.from) g.from = r.start;
      if (!r.end || (g.to && r.end > g.to)) g.to = r.end;
    }
    return out;
  }, []);

  const role = experience.find((r) => r.id === sel)!;
  const order = experience.map((r) => r.id);
  const onKey = (e: KeyboardEvent) => {
    const i = order.indexOf(sel);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setSel(order[Math.min(order.length - 1, i + 1)]); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setSel(order[Math.max(0, i - 1)]); }
  };
  let k = 0;

  return (
    <section ref={ref} className={`site-container xg${inView ? " is-in" : ""}`} id="experience" aria-labelledby="xg-title">
      <div className="xg-top">
        <div>
          <h2 id="xg-title" className="x-title">Experience</h2>
        </div>
        <div className="xg-legend" role="group" aria-label="Highlight by discipline">
          {kinds.map((kd) => (
            <button key={kd} type="button" className={kindClass(kd)} aria-pressed={kind === kd} onClick={() => setKind(kind === kd ? null : kd)}>
              <i aria-hidden="true" />{kd}
            </button>
          ))}
        </div>
      </div>

      <div className="xg-body">
        <div className="xg-chart" role="listbox" aria-label="Roles over time" aria-activedescendant={`xg-${sel}`} tabIndex={0} onKeyDown={onKey}>
          <div className="xg-axis" aria-hidden="true">
            {axis.years.map((y) => <span key={y.label} style={{ left: `${y.left}%` }}>{y.label}</span>)}
          </div>
          <div className="xg-plot">
            <div className="xg-grid" aria-hidden="true">
              {axis.years.map((y) => <i key={y.label} style={{ left: `${y.left}%` }} />)}
              <b className="xg-today" style={{ left: `${axis.x(today)}%` }}><span>Today</span></b>
            </div>
            {groups.map((g) => (
              <div key={g.employer} className="xg-group">
                <div className="xg-employer">
                  <b>{g.employer}</b>
                  <span>{fmt(g.from)} - {g.to ? fmt(g.to) : "present"}</span>
                </div>
                {g.rows.map((r) => {
                  const left = axis.x(r.start), right = axis.x(r.end ?? today);
                  const i = k++;
                  const dim = (kind && r.kind !== kind) || (hover && hover !== r.id);
                  return (
                    <div
                      key={r.id}
                      id={`xg-${r.id}`}
                      role="option"
                      aria-selected={sel === r.id}
                      className={`xg-row${sel === r.id ? " is-sel" : ""}${dim ? " is-dim" : ""}`}
                      onClick={() => setSel(r.id)}
                      onPointerEnter={() => setHover(r.id)}
                      onPointerLeave={() => setHover(null)}
                    >
                      <div className="xg-label">
                        <strong>{r.role}</strong>
                        <span>{fmt(r.start)} - {r.end ? fmt(r.end) : "Present"}</span>
                      </div>
                      <div className="xg-track">
                        <span
                          className={`xg-bar ${kindClass(r.kind)}${r.end ? "" : " is-current"}`}
                          style={{ left: `${left}%`, width: `${Math.max(1.2, right - left)}%`, transitionDelay: `${200 + i * 110}ms` }}
                        >
                          <em>{span(r.start, r.end ?? today)}</em>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="xg-group xg-edu">
              <div className="xg-employer"><b>University of Houston</b><span>B.S. Industrial Engineering</span></div>
              <div className="xg-row xg-milestone-row" aria-hidden="true">
                <div className="xg-label"><strong>Graduated</strong><span>May 2026</span></div>
                <div className="xg-track">
                  <span className="xg-milestone" style={{ left: `${axis.x("2026-05")}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="xg-detail" aria-live="polite">
          <p className={`xg-kind ${kindClass(role.kind)}`}><i aria-hidden="true" />{role.kind}</p>
          <h3 key={role.id}>{role.role}</h3>
          <p className="xg-meta">{role.employer}<br />{fmt(role.start)} - {role.end ? fmt(role.end) : "Present"} ({span(role.start, role.end ?? today)})</p>
          <p className="xg-summary">{role.summary}</p>
          <ul>{role.details.map((d) => <li key={d}>{d}</li>)}</ul>
          <p className="xg-hint">Select a bar to read that role.</p>
        </aside>
      </div>
    </section>
  );
}
