'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { chartPoints, curveValue, sampleCap, weibull } from '../lib/curve-math.mjs';
type Any = Record<string, any>;

const DAY = 86400000;
const dayOf = (s: string) => Date.parse(s.slice(0, 10)) / DAY;
const iso = (d: number) => new Date(Math.round(d) * DAY).toISOString().slice(0, 10);
const SERIES: Record<string, string> = { unmit: 'Unmitigated', current: 'Current plan', proposed: 'Proposed' };
const COLORS: Record<string, string> = { unmit: '#ed6468', current: 'var(--accent)', proposed: '#f5b14a' };
const NO_EFFECT = '#8a93a3';
const PALETTE =['#59cfc1', '#f391b4', '#b89af7', '#78b7f5', '#d4cc68', '#f8a077', '#97c891', '#d8a3d1'];
const usd = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? 'Not priced' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const pct = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? '–' : (v * 100).toFixed(v < .01 ? 3 : 2) + '%';
// geometry in viewBox units: TAR labels, current-task lane, plot, proposed-task lane, x axis
const H = 480, X0 = 84, Y0 = 58, PH = 340;
const LANE_TOP = Y0 - 12, LANE_BOTTOM = Y0 + PH + 12;

type Props = { row: Any; source: Any; rows: Any[]; sources: Any[]; all: boolean; today: string; horizon: string; settings: Any; windows: Any[] };

// first day of every upward crossing of the limit on one series (day by day, so a short breach between two tasks is not missed)
function crossings(row: Any, source: Any, series: string, limit: number, from: number, to: number) {
  const out: number[] = [];
  const val = (d: number) => curveValue(row, source, d, series, 'pof');
  let prev = val(from);
  if (prev != null && prev >= limit) out.push(from);
  for (let d = from + 1; d <= to; d++) { const v = val(d); if (prev != null && v != null && prev < limit && v >= limit) out.push(d); prev = v; }
  return out;
}

export default function LvcChart({ row, source, rows, sources, all, today, horizon, settings, windows }: Props) {
  const [measure, setMeasure] = useState(row.gov?.measure || 'pof');
  const [range, setRange] = useState('now');
  const [show, setShow] = useState<Record<string, boolean>>({ unmit: true, current: true, proposed: true });
  const [showTar, setShowTar] = useState(true);
  const [view, setView] = useState<[number, number] | null>(null);
  const [yZoom, setYZoom] = useState(1);
  const [cursor, setCursor] = useState<number | null>(null);
  const [task, setTask] = useState<{ date: string; lane: string } | null>(null);
  const [tarId, setTarId] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [opt, setOpt] = useState<Record<string, boolean>>({ lanes: true, breaches: true, fit: false, critical: false });
  const [expanded, setExpanded] = useState(false);
  const overview = useRef<{ x: number; lo: number; hi: number } | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  // the drawing is as wide as its container (1 unit = 1 px), so the chart fills the page without growing taller
  const [W, setW] = useState(1200);
  const box = (el: HTMLDivElement | null) => {
    observer.current?.disconnect(); observer.current = null;
    if (!el) return;
    const measure = () => setW(Math.max(640, Math.round(el.clientWidth - 34)));
    measure(); observer.current = new ResizeObserver(measure); observer.current.observe(el);
  };
  useEffect(() => () => observer.current?.disconnect(), []);
  const PW = W - X0 - 24;
  const drag = useRef<{ x: number; lo: number; hi: number; moved: boolean } | null>(null);

  useEffect(() => { setView(null); setYZoom(1); setCursor(null); setTask(null); setTarId(null); }, [row.a.assetId, all, range, horizon]);
  useEffect(() => { setHidden([]); }, [row.a.assetId]);
  useEffect(() => { setMeasure(row.gov?.measure || 'pof'); }, [row.id]);

  const curves = useMemo(() => (all ? rows : [row])
    .map((r, i) => ({ row: r, source: all ? sources.find(s => s.id === r.id) : source, color: PALETTE[i % PALETTE.length] }))
    .filter((c): c is { row: Any; source: Any; color: string } => !!c.source && !hidden.includes(c.row.id)), [all, rows, sources, row, source, hidden]);

  const first = Math.min(...curves.map(c => dayOf(c.source.start) + c.source.days[0]));
  const last = Math.max(...curves.map(c => dayOf(c.source.start) + c.source.days.at(-1)));
  const initial: [number, number] = range === 'full' ? [Number.isFinite(first) ? first : dayOf(today) - 3652, Number.isFinite(last) ? last : dayOf(horizon)]
    : range === 'ten' ? [dayOf(today) - 3652, dayOf(today) + 3652] : [dayOf(today) - 180, dayOf(horizon)];
  const [lo, hi] = view || initial;
  // the chart's top is Model's cap: the highest value its stored curves reach for the assessments shown (all curves are capped there)
  const autoMax = useMemo(() => {
    const cap = Math.max(0, ...curves.map(c => sampleCap(c.source, measure)));
    if (cap > 0) return cap * 1.04;
    return (measure === 'pof' ? Math.max(...curves.map(c => c.row.L || .01)) : settings[measure]) * 1.3;
  }, [curves, measure, settings]); // eslint-disable-line react-hooks/exhaustive-deps
  const yMax = autoMax * yZoom;
  const X = (d: number) => X0 + (d - lo) / (hi - lo) * PW;
  const Y = (v: number) => Y0 + PH - v / yMax * PH;
  const inPlot = (d: number) => d >= lo && d <= hi;

  const paths = useMemo(() => curves.flatMap(c => {
    const pts = chartPoints(c.row, c.source, lo, hi);
    return Object.keys(show).filter(k => show[k]).map(series => {
      let gap = true;
      const d = pts.map(({ d, before }: Any) => {
        const v = curveValue(c.row, c.source, d, series, measure, before);
        if (v == null) { gap = true; return ''; }
        const cmd = gap ? 'M' : 'L'; gap = false;
        return `${cmd}${X(d).toFixed(2)},${Y(Math.min(v, yMax * 1.05)).toFixed(2)}`;
      }).join(' ');
      return { id: c.row.id, series, color: all ? c.color : COLORS[series], d };
    });
  }), [curves, lo, hi, measure, yMax, show, all, W]); // eslint-disable-line react-hooks/exhaustive-deps

  // breach dates (PoF ≥ governing PoF limit ⇔ risk ≥ threshold) from today to the horizon, per curve and series
  const breaches = useMemo(() => curves.flatMap(c => c.row.L > 0 && c.row.L < 1 ? Object.keys(SERIES).map(series => ({
    id: c.row.id, series, color: all ? c.color : COLORS[series], label: all ? (c.row.a.component.split(' | ').slice(1).join(' · ') || c.row.a.component) : SERIES[series],
    days: crossings(c.row, c.source, series, c.row.L, dayOf(today), dayOf(horizon)),
  })) : []), [curves, today, horizon, all]);

  const fmt = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? 'Unavailable' : measure === 'pof' ? pct(v) : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(v);

  // task lanes: current plan above the plot, proposed plan below; a shifted task appears in both, joined by a connector (a copied shared
  // task too: the original stays in both lanes and a dotted connector leads to its copy). Every task Model links to the assessment is
  // drawn, including linked tasks the optimizer gives no effect (e.g. Planned TAR tasks), which stay in both plans.
  const marks = useMemo(() => {
    const top = new Map<string, Any>(), bottom = new Map<string, Any>();
    const add = (map: Map<string, Any>, date: string, item: Any, r: Any) => { if (!map.has(date)) map.set(date, { date, items: [], drivers: new Set<Any>() }); const m = map.get(date)!; m.items.push(item); m.drivers.add(r); };
    for (const c of curves) {
      const inPlan = new Set<string>((c.row.current?.events || []).flatMap((e: Any) => e.taskNumbers || []));
      const linkedOnly = (c.row.currentCostTasks || []).filter((t: Any) => t.date && !inPlan.has(t.number)).map((t: Any) => ({ date: t.date, bundle: t.bundle || 'Task', definitions: [t.definition].filter(Boolean), taskNumbers: [t.number], cost: t.cost, kept: true, linkedOnly: true,
        evidence: 'Linked to this assessment in Model. The optimizer gives it no effect on this curve (task pool rule or no modelled effect); it stays in both plans and in Model.' }));
      const copiedTo = (date: string, nums: string[]) => (c.row.proposed || []).filter((p: Any) => p.copyOf?.shared && p.copyOf.date === date && (p.copyOf.taskNumbers || []).some((n: string) => nums.includes(n))).map((p: Any) => p.date);
      if (show.current) {
        for (const e of c.row.current?.events || []) add(top, e.date, { ...e, lane: 'current', shiftedTo: (c.row.proposed || []).find((p: Any) => p.moved && p.movedFrom === e.date && p.bundle === e.bundle)?.date, copiedTo: copiedTo(e.date, e.taskNumbers || []) }, c.row);
        for (const t of linkedOnly) add(top, t.date, { ...t, lane: 'current' }, c.row);
      }
      if (show.proposed) {
        for (const p of c.row.proposed || []) add(bottom, p.date, { ...p, lane: 'proposed' }, c.row);
        for (const t of linkedOnly) if (t.date <= horizon) add(bottom, t.date, { ...t, lane: 'proposed' }, c.row);
      }
    }
    const link = [...bottom.values()].flatMap(m => m.items.flatMap((p: Any) => p.moved && p.movedFrom ? [{ from: p.movedFrom, to: p.date, copy: false }] : p.copyOf?.shared && p.copyOf.date ? [{ from: p.copyOf.date, to: p.date, copy: true }] : []));
    return { top: [...top.values()], bottom: [...bottom.values()], link };
  }, [curves, show, horizon]);
  // every assessment on the asset linked to a task: for a Model task (kept, shifted, or with no effect) the assessments Model links it
  // to; for a copy, the plans that copy the same task to the same date (the loadsheet links the copy to exactly these)
  const linkedRows = (t: Any) => {
    if (t.lane === 'proposed' && t.newTask) return rows.filter((r: Any) => (r.proposed || []).some((p: Any) => p.newTask && p.date === t.date && p.bundle === t.bundle && (p.copyOf?.taskNumbers || []).join('+') === (t.copyOf?.taskNumbers || []).join('+')));
    const nums = new Set<string>(t.taskNumbers || []);
    if (!nums.size) return [row];
    return rows.filter((r: Any) => (r.current?.events || []).some((e: Any) => (e.taskNumbers || []).some((n: string) => nums.has(n))) || (r.currentCostTasks || []).some((x: Any) => nums.has(x.number)) || (r.proposed || []).some((p: Any) => (p.taskNumbers || []).some((n: string) => nums.has(n))));
  };
  const rowName = (r: Any) => (r.a.component.split(' | ').slice(1).join(' · ') || r.a.component) + (r.id === row.id && !all ? ' (this)' : '') + (r.exportHold ? ' · held' : '');
  const railDates = [...new Set([...marks.top, ...marks.bottom].map(m => m.date))].filter(d => inPlot(dayOf(d)));
  const tar = windows.find(w => w.id === tarId);
  const visibleTars = windows.filter(w => dayOf(w.end || w.start) >= lo && dayOf(w.start) <= hi);
  const readDay = cursor ?? dayOf(today);
  const tarAtCursor = windows.find(w => readDay >= dayOf(w.start) && readDay <= dayOf(w.end || w.start));

  const svgPoint = (e: React.PointerEvent) => { const b = e.currentTarget.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width * W, y: (e.clientY - b.top) / b.height * H }; };
  const pickTask = (date: string, lane: string) => { setTask({ date, lane }); setTarId(null); setCursor(dayOf(date)); };

  useEffect(() => {
    const el = svg.current; if (!el) return;
    const node: SVGSVGElement = el;
    // A plain wheel scrolls the page: the chart is tall and full width, and swallowing every wheel event over it
    // made it impossible to scroll past. Zooming is deliberate — Ctrl / ⌘ (also what a trackpad pinch sends) for
    // the date axis, Shift for the value axis.
    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) return;
      e.preventDefault();
      const f = e.deltaY > 0 ? 1.15 : 0.87;
      if (e.shiftKey) { setYZoom(z => Math.max(1e-4, Math.min(100, z * f))); return; }
      const b = node.getBoundingClientRect(), p = Math.max(0, Math.min(1, ((e.clientX - b.left) / b.width * W - X0) / PW));
      const at = lo + (hi - lo) * p, span = Math.max(14, Math.min(80000, (hi - lo) * f));
      setView([at - span * p, at + span * (1 - p)]);
    }
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [lo, hi, W, PW]);

  const limits = (measure === 'pof'
    ? curves.map(c => ({ limit: c.row.L, color: all ? c.color : '#f5b14a', label: all ? c.row.a.category + ' limit' : (c.row.gov?.measure || '').toUpperCase() + ' limit (PoF)' }))
    : [{ limit: settings[measure], color: '#f5b14a', label: measure.toUpperCase() + ' limit' }]).filter(l => l.limit != null && Number.isFinite(l.limit));
  const limitFor = (id: string) => measure === 'pof' ? curves.find(c => c.row.id === id)?.row.L : settings[measure];
  const tick = (hi - lo) < 400;
  const zoomX = (f: number) => { const c = (lo + hi) / 2, s = Math.max(14, (hi - lo) * f); setView([c - s / 2, c + s / 2]); };
  const focusThresholds = () => { const top = Math.max(...limits.map(l => l.limit)); if (Number.isFinite(top) && top > 0) setYZoom(top * 1.3 / autoMax); };
  const fullRange: [number, number] = [Number.isFinite(first) ? first : dayOf(today) - 3652, Math.max(Number.isFinite(last) ? last : dayOf(horizon), dayOf(horizon))];
  const OW = W, OH = 44, OX = (d: number) => X0 + (d - fullRange[0]) / (fullRange[1] - fullRange[0]) * PW;
  const overviewPath = useMemo(() => {
    const c = curves[0]; if (!c) return '';
    let m = 0; const pts: [number, number][] = [];
    for (let i = 0; i <= 300; i++) { const d = fullRange[0] + (fullRange[1] - fullRange[0]) * i / 300, v = curveValue(c.row, c.source, d, 'unmit', 'pof'); if (v != null) { pts.push([d, v]); m = Math.max(m, v); } }
    return pts.map(([d, v], i) => `${i ? 'L' : 'M'}${OX(d).toFixed(1)},${(OH - 4 - v / (m || 1) * (OH - 8)).toFixed(1)}`).join(' ');
  }, [curves, W, fullRange[0], fullRange[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const fitSegment = (r: Any) => r.worstCml ? { origin: dayOf(r.worstCml.start) - dayOf(r.a.start) + 1, beta: r.worstCml.beta, eta: r.worstCml.eta, gamma: r.worstCml.gamma } : r.a.fit ? { ...r.a.fit, origin: 0 } : null;

  const tri = (x: number, y: number, down: boolean) => down ? `${x - 6},${y - 7} ${x + 6},${y - 7} ${x},${y + 3}` : `${x - 6},${y + 7} ${x + 6},${y + 7} ${x},${y - 3}`;
  const markColor = (m: Any, lane: string) => {
    if (m.items.every((e: Any) => e.linkedOnly)) return NO_EFFECT;
    if (lane === 'current') return m.items.some((e: Any) => e.shiftedTo) ? '#ff4d8f' : COLORS.current;
    if (m.items.some((p: Any) => p.moved)) return '#ff4d8f';
    if (m.items.some((p: Any) => p.newTask)) return p_color(m);
    return COLORS.current;
  };
  const p_color = (m: Any) => m.items.some((p: Any) => p.execution === 'online') ? '#c98ff5' : COLORS.proposed;

  return <div className={expanded ? 'lvc-expanded' : 'lvc-inline'}>
    <div className="chart-toolbar">
      <div className="segments" aria-label="Risk measure">{['pof', 'econ', 'hse'].map(m => <button key={m} aria-pressed={measure === m} onClick={() => setMeasure(m)}>{m.toUpperCase()}</button>)}</div>
      <div className="segments" aria-label="Chart range">{[['full', 'Full'], ['ten', '±10y'], ['now', 'Now → horizon']].map(([k, l]) => <button key={k} aria-pressed={range === k && !view} onClick={() => { setRange(k); setView(null); }}>{l}</button>)}</div>
      <div className="legend">
        {Object.keys(show).map(k => <label className="check" key={k}><input type="checkbox" checked={show[k]} onChange={e => setShow(s => ({ ...s, [k]: e.target.checked }))} /><span style={{ background: COLORS[k] }} />{SERIES[k]}</label>)}
        <label className="check"><input type="checkbox" checked={showTar} onChange={e => setShowTar(e.target.checked)} />TAR windows</label>
        {([['lanes', 'Task lanes'], ['breaches', 'Breach dots'], ['fit', 'Weibull fit'], ['critical', 'Model critical dates']] as const).map(([k, l]) => <label className="check" key={k}><input type="checkbox" checked={opt[k]} onChange={e => setOpt(o => ({ ...o, [k]: e.target.checked }))} />{l}</label>)}
      </div>
      <div className="icon-group">
        <button className="chart-reset" onClick={focusThresholds} title="Scale the Y axis to the limit lines">Focus thresholds</button>
        <button className="icon-btn" onClick={() => zoomX(.7)} title="Zoom in (dates)">+</button>
        <button className="icon-btn" onClick={() => zoomX(1 / .7)} title="Zoom out (dates)">−</button>
        <button className="icon-btn" onClick={() => setYZoom(z => z * .7)} title="Zoom in (risk axis)">Y+</button>
        <button className="icon-btn" onClick={() => setYZoom(z => z / .7)} title="Zoom out (risk axis)">Y−</button>
        <button className="icon-btn" onClick={() => setYZoom(1)} title="Reset the risk axis">Y↺</button>
        <button className="chart-reset" onClick={() => { setView(null); setYZoom(1); }}>Reset view</button>
        <button className="icon-btn" onClick={() => setExpanded(x => !x)} title={expanded ? 'Close full screen' : 'Full screen'}>{expanded ? '✕' : '⤢'}</button>
      </div>
    </div>
    {all && <div className="assessment-legend">{rows.map((r, i) => <button key={r.id} aria-pressed={!hidden.includes(r.id)} onClick={() => setHidden(h => h.includes(r.id) ? h.filter(x => x !== r.id) : [...h, r.id])}><span style={{ background: PALETTE[i % PALETTE.length] }} />{r.a.component.split(' | ').slice(1).join(' · ') || r.a.component}</button>)}</div>}
    <div className="chart-note">
      <span>{all ? `${curves.length} assessment curves · solid: unmitigated / dashed: current / dotted: proposed` : (row.gov?.measure?.toUpperCase() || 'No measure') + ' governs · ' + (row.worstCml ? 'Governing CML ' + (row.worstCml.clientId || row.worstCml.id) : 'Stored Model curve')}</span>
      <span>▼ current plan (top) · ▲ proposed plan (bottom) · pink = shifted · dotted link = copy of a shared task (original stays) · grey = linked, no effect ·Ctrl + scroll to zoom · Shift + scroll for Y · Drag to pan · Double-click to reset · plain scroll moves the page</span>
    </div>
    <div className="chart-container" ref={box}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={all ? 'All assessment lifetime curves' : `Lifetime variability for ${row.a.component}, ${measure.toUpperCase()}`}
        onDoubleClick={() => { setView(null); setYZoom(1); }}
        onPointerDown={e => { drag.current = { x: svgPoint(e).x, lo, hi, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerUp={() => { drag.current = null; }}
        onPointerLeave={() => { if (!drag.current) setCursor(null); }}
        onPointerMove={e => {
          const { x, y } = svgPoint(e);
          if (drag.current) { const shift = (x - drag.current.x) / PW * (drag.current.hi - drag.current.lo); if (Math.abs(x - drag.current.x) > 2) drag.current.moved = true; setView([drag.current.lo - shift, drag.current.hi - shift]); return; }
          const d = Math.round(Math.max(lo, Math.min(hi, lo + (x - X0) / PW * (hi - lo))));
          // snap to a task rail within 6 px and select that lane's task(s)
          const near = railDates.reduce<string | null>((best, rd) => !best || Math.abs(X(dayOf(rd)) - x) < Math.abs(X(dayOf(best)) - x) ? rd : best, null);
          if (near && Math.abs(X(dayOf(near)) - x) < 6) {
            const lane = y > Y0 + PH / 2 ? (marks.bottom.some(m => m.date === near) ? 'proposed' : 'current') : (marks.top.some(m => m.date === near) ? 'current' : 'proposed');
            setTask({ date: near, lane }); setTarId(null); setCursor(dayOf(near));
          } else setCursor(d);
        }}>
        <defs><clipPath id="plot-clip"><rect x={X0} y={Y0} width={PW} height={PH} /></clipPath></defs>
        <rect x={X0} y={Y0} width={PW} height={PH} fill="var(--chart-plot)" />
        <rect x={X0} y={LANE_TOP - 13} width={PW} height={20} fill="var(--chart-lane)" />
        <rect x={X0} y={LANE_BOTTOM - 7} width={PW} height={20} fill="var(--chart-lane)" />
        <text x={X0 - 8} y={LANE_TOP} textAnchor="end" className="lane-label">Current</text>
        <text x={X0 - 8} y={LANE_BOTTOM + 7} textAnchor="end" className="lane-label">Proposed</text>
        {Array.from({ length: 6 }, (_, i) => { const v = yMax * i / 5; return <g key={'y' + i}><line x1={X0} x2={X0 + PW} y1={Y(v)} y2={Y(v)} stroke="var(--chart-grid)" /><text x={X0 - 10} y={Y(v) + 4} textAnchor="end">{fmt(v)}</text></g>; })}
        {Array.from({ length: 7 }, (_, i) => { const d = lo + (hi - lo) * i / 6; return <g key={'x' + i}><line x1={X(d)} x2={X(d)} y1={Y0} y2={Y0 + PH} stroke="var(--chart-grid)" /><text x={X(d)} y={H - 18} textAnchor="middle">{tick ? iso(d) : iso(d).slice(0, 7)}</text></g>; })}
        <g clipPath="url(#plot-clip)">
          {showTar && visibleTars.map(w => <g key={w.id} className="tar-window" onPointerEnter={() => { setTarId(w.id); setTask(null); }}>
            <rect x={X(dayOf(w.start))} width={Math.max(3, X(dayOf(w.end || w.start) + 1) - X(dayOf(w.start)))} y={Y0} height={PH} fill="#c8ba63" opacity=".12" />
            <line x1={X(dayOf(w.start))} x2={X(dayOf(w.start))} y1={Y0} y2={Y0 + PH} stroke="#c8ba63" opacity=".6" strokeDasharray="3 5" />
          </g>)}
          {limits.map((l, i) => l.limit > yMax ? (!all || measure !== 'pof') && <text key={'l' + i} x={X0 + PW - 8} y={Y0 + 15} textAnchor="end" className="limit-above">▲ {l.label} {fmt(l.limit)} is above Model&apos;s curve</text> : <g key={'l' + i}><line x1={X0} x2={X0 + PW} y1={Y(l.limit)} y2={Y(l.limit)} stroke={l.color} strokeDasharray="6 5" opacity=".55" />{(!all || measure !== 'pof') && <text x={X0 + PW - 8} y={Math.max(Y0 + 15, Y(l.limit) - 8)} textAnchor="end">{l.label} {fmt(l.limit)}</text>}</g>)}
          {inPlot(dayOf(today)) && <line x1={X(dayOf(today))} x2={X(dayOf(today))} y1={Y0} y2={Y0 + PH} stroke="var(--chart-today)" strokeDasharray="4 5" />}
          {railDates.map(rd => { const sel = task?.date === rd, isProp = marks.bottom.some(m => m.date === rd), isCur = marks.top.some(m => m.date === rd); return <line key={'rail' + rd} data-task-rail={rd} x1={X(dayOf(rd))} x2={X(dayOf(rd))} y1={Y0} y2={Y0 + PH} stroke={isProp && !isCur ? COLORS.proposed : COLORS.current} strokeWidth={sel ? 2.4 : 1.2} strokeDasharray={isProp && !isCur ? '3 4' : undefined} opacity={sel ? .95 : .35} />; })}
          {opt.fit && curves.map(c => { const seg = fitSegment(c.row); if (!seg) return null; const cof = measure === 'pof' ? 1 : measure === 'hse' ? c.row.a.cofHse : c.row.a.cofEcon; const d = Array.from({ length: 241 }, (_, i) => lo + (hi - lo) * i / 240).map((dd, i) => { const v = weibull(seg, dd - dayOf(c.row.a.start)); const cap = sampleCap(c.source, measure) || Infinity; return v == null ? '' : `${i ? 'L' : 'M'}${X(dd).toFixed(1)},${Y(Math.min(v * cof, cap, yMax * 1.05)).toFixed(1)}`; }).join(' '); return <path key={'fit' + c.row.id} d={d} fill="none" stroke="var(--chart-fit)" strokeWidth="1.3" strokeDasharray="1 4" opacity=".8" pointerEvents="none" />; })}
          {opt.critical && curves.flatMap(c => [['unmitEarliest', '#ff9ab8', 'Earliest unmitigated critical'], ['unmitLatest', '#ff9ab8', 'Latest unmitigated critical'], ['mitEarliest', '#7fe0d3', 'Earliest mitigated critical'], ['mitLatest', '#7fe0d3', 'Latest mitigated critical']].map(([k, col, l]) => { const dt = c.source.critical?.[k]; if (!dt || !inPlot(dayOf(dt))) return null; return <g key={c.row.id + k}><line x1={X(dayOf(dt))} x2={X(dayOf(dt))} y1={Y0} y2={Y0 + PH} stroke={col} strokeDasharray="1 3" opacity=".9" /><circle cx={X(dayOf(dt))} cy={Y0 + 6} r="3.5" fill={col}><title>{l} · {String(dt).slice(0, 10)}</title></circle></g>; }))}
          {paths.map(p => <path key={p.id + p.series} data-curve={p.id + ':' + p.series} d={p.d} fill="none" stroke={p.color} strokeWidth="2.2" strokeDasharray={p.series === 'unmit' ? undefined : p.series === 'current' ? '9 5' : '2 5'} pointerEvents="none" />)}
          {opt.breaches && (measure === 'pof' || all || measure === row.gov?.measure) && breaches.filter(b => show[b.series]).flatMap(b => b.days.filter(inPlot).map(d => { const lim = limitFor(b.id); if (lim == null || lim > yMax) return null; return <circle key={b.id + b.series + d} cx={X(d)} cy={Y(lim)} r="4.5" fill={b.color} stroke="var(--chart-halo)" strokeWidth="1.5"><title>{b.label} breach {iso(d)}</title></circle>; }))}
        </g>
        {opt.lanes && marks.link.filter(l => inPlot(dayOf(l.from)) || inPlot(dayOf(l.to))).map((l, i) => <path key={'lk' + i} d={`M${X(Math.max(lo, Math.min(hi, dayOf(l.from))))},${LANE_TOP + 4} C${X(Math.max(lo, Math.min(hi, dayOf(l.from))))},${Y0 + PH / 2} ${X(Math.max(lo, Math.min(hi, dayOf(l.to))))},${Y0 + PH / 2} ${X(Math.max(lo, Math.min(hi, dayOf(l.to))))},${LANE_BOTTOM - 4}`} fill="none" stroke={l.copy ? COLORS.proposed : '#ff4d8f'} strokeWidth="1.2" strokeDasharray={l.copy ? '1 4' : '4 4'} opacity={task && (task.date === l.from || task.date === l.to) ? .9 : .3} pointerEvents="none" />)}
        {opt.lanes && marks.top.filter(m => inPlot(dayOf(m.date))).map(m => <polygon key={'t' + m.date} className="task-mark" points={tri(X(dayOf(m.date)), LANE_TOP, true)} fill={markColor(m, 'current')} stroke={task?.date === m.date && task?.lane === 'current' ? 'var(--chart-cursor)' : 'var(--chart-halo)'} strokeWidth="1.2" onPointerEnter={() => pickTask(m.date, 'current')} onClick={() => pickTask(m.date, 'current')}><title>{m.date} · current · {m.items.map((e: Any) => e.definitions?.[0] || e.bundle).join(', ')}</title></polygon>)}
        {opt.lanes && marks.bottom.filter(m => inPlot(dayOf(m.date))).map(m => <polygon key={'b' + m.date} className="task-mark" points={tri(X(dayOf(m.date)), LANE_BOTTOM, false)} fill={markColor(m, 'proposed')} stroke={task?.date === m.date && task?.lane === 'proposed' ? 'var(--chart-cursor)' : 'var(--chart-halo)'} strokeWidth="1.2" onPointerEnter={() => pickTask(m.date, 'proposed')} onClick={() => pickTask(m.date, 'proposed')}><title>{m.date} · proposed · {m.items.map((p: Any) => (p.linkedOnly ? 'linked, no effect ' : p.kept ? 'kept ' : p.moved ? 'shifted ' : 'copy ') +(p.definitions?.[0] || p.bundle)).join(', ')}</title></polygon>)}
        {showTar && visibleTars.map((w, i) => <text key={w.id} x={Math.max(X0, Math.min(X0 + PW - 40, X(dayOf(w.start))))} y={i % 2 ? 26 : 13} className="tar-label">{w.name.replace(/_\d+$/, '')}</text>)}
        {cursor != null && inPlot(cursor) && <g pointerEvents="none">
          <line x1={X(cursor)} x2={X(cursor)} y1={Y0} y2={Y0 + PH} stroke="var(--chart-cursor)" opacity=".45" />
          {curves.flatMap(c => Object.keys(show).filter(k => show[k]).map(k => { const v = curveValue(c.row, c.source, cursor, k, measure); return v == null ? null : <circle key={c.row.id + k} cx={X(cursor)} cy={Y(Math.min(v, yMax))} r="3.5" fill={all ? c.color : COLORS[k]} stroke="#0b0d0f" strokeWidth="1.2" />; }))}
          <rect x={Math.min(X0 + PW - 84, Math.max(X0, X(cursor) - 42))} y={Y0 + 4} width="84" height="18" rx="4" fill="var(--chart-chip)" stroke="var(--chart-chip-border)" />
          <text x={Math.min(X0 + PW - 42, Math.max(X0 + 42, X(cursor)))} y={Y0 + 17} textAnchor="middle" className="cursor-label">{iso(cursor)}</text>
        </g>}
      </svg>
      <svg className="overview" viewBox={`0 0 ${OW} ${OH}`} style={{ height: OH }}
        onPointerDown={e => { const b = e.currentTarget.getBoundingClientRect(); overview.current = { x: (e.clientX - b.left) / b.width * OW, lo, hi }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerUp={() => { overview.current = null; }}
        onPointerMove={e => { if (!overview.current) return; const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * OW, shift = (x - overview.current.x) / PW * (fullRange[1] - fullRange[0]); setView([overview.current.lo + shift, overview.current.hi + shift]); }}
        onDoubleClick={e => { const b = e.currentTarget.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * OW, c = fullRange[0] + (x - X0) / PW * (fullRange[1] - fullRange[0]), s = hi - lo; setView([c - s / 2, c + s / 2]); }}>
        <rect x={X0} y={0} width={PW} height={OH} fill="var(--chart-plot)" rx="4" />
        <path d={overviewPath} fill="none" stroke="#ed6468" strokeWidth="1" />
        <rect x={OX(Math.max(fullRange[0], lo))} y={1} width={Math.max(3, OX(Math.min(fullRange[1], hi)) - OX(Math.max(fullRange[0], lo)))} height={OH - 2} fill="#4ea6ff" opacity=".18" stroke="#4ea6ff" style={{ cursor: 'grab' }} />
        <text x={X0 + 6} y={13} className="lane-label">{iso(fullRange[0])}</text>
        <text x={X0 + PW - 6} y={13} textAnchor="end" className="lane-label">{iso(fullRange[1])}</text>
      </svg>
    </div>
    <div className="chart-details" aria-label="Chart details">
      <div className="detail-card measure-card">
        <div className="readout-heading"><span>{measure.toUpperCase()} at cursor</span><strong>{iso(readDay)}</strong></div>
        {!curves.length ? <p>Choose an assessment above.</p> : curves.map(c => <div className="readout-assessment" key={c.row.id}>
          {all && <strong style={{ color: c.color }}>{c.row.a.component.split(' | ').slice(1).join(' · ')}</strong>}
          {Object.keys(show).filter(k => show[k]).map(k => { const v = curveValue(c.row, c.source, readDay, k, measure), lim = limitFor(c.row.id); return <div className="readout-value" key={k}><span style={{ color: all ? c.color : COLORS[k] }}>{SERIES[k]}</span><b className={v != null && lim != null && v >= lim ? 'red-text' : ''}>{fmt(v)}{measure !== 'pof' && <small>PoF {pct(curveValue(c.row, c.source, readDay, k, 'pof'))}</small>}</b></div>; })}
        </div>)}
        {(() => { const w = tar || tarAtCursor; return w ? <p className="readout-note">{tar ? 'TAR window' : 'In'} {w.name} · {w.start} → {w.end} · {w.durationDays} d · lockdown {w.lockdown || 'not supplied'}</p> : null; })()}
        <div className="breach-list">
          <span className="readout-sub">Breach dates · today → {horizon}</span>
          {breaches.filter(b => all ? b.series === 'unmit' || show[b.series] : true).map(b => <div className="readout-value" key={b.id + b.series}>
            <span style={{ color: b.color }}>{all ? b.label + ' · ' + SERIES[b.series] : b.label}</span>
            <b>{b.days.length ? b.days.map(d => <button key={d} className="date-chip" onClick={() => { setCursor(d); setView([d - 180, d + 180]); }}>{d === dayOf(today) ? 'above today' : iso(d)}</button>) : 'none'}</b>
          </div>)}
        </div>
      </div>
      {(['proposed', 'current'] as const).map(lane => { const m = task ? (lane === 'current' ? marks.top : marks.bottom).find(x => x.date === task.date) : null; return <div className={'detail-card task-card ' + lane} key={lane}>
        <div className="readout-heading"><span style={{ color: lane === 'current' ? COLORS.current : COLORS.proposed }}>{lane === 'current' ? '▼ Current plan task' : '▲ Proposed task'}</span><strong>{task?.date || ''}</strong></div>
        <div className="task-body">
          {!task ? <p className="blank">Hover a triangle or rail on the chart.</p> : !m ? <p className="blank">No {lane === 'current' ? 'current-plan' : 'proposed'} task on {task.date}.</p> : m.items.map((t: Any, i: number) => <div className="task-item" key={i}>
            <span className="task-status" style={{ color: t.linkedOnly ? NO_EFFECT : t.lane === 'current' ? (t.shiftedTo ? '#ff4d8f' : COLORS.current) : t.moved ? '#ff4d8f' : t.kept ? COLORS.current : COLORS.proposed }}>{t.linkedOnly ? 'Linked in Model · no effect here' : t.lane === 'current' ? (t.shiftedTo ? 'Shifted to ' + t.shiftedTo : t.copiedTo?.length ? 'Stays · copied to ' + t.copiedTo.join(', ') : 'In the current plan') : t.kept ? 'Kept as planned' : t.moved ? 'Shifted from ' + t.movedFrom : t.copyOf?.shared ? 'Copy of a shared task (original stays)' : t.copyOf?.taskNumbers?.length ? 'Copy of a current-plan task' : 'New task (' + t.bundle + ', no current task of this type)'}</span>
            <h3>{t.definitions?.[0] || t.bundle}</h3>
            <dl>
              <dt>Date</dt><dd>{t.date}{t.endDate && t.endDate !== t.date ? ' → ' + t.endDate : ''}{t.movedFrom ? ` (${Math.round(dayOf(t.date) - dayOf(t.movedFrom))} d)` : ''}</dd>
              {t.copyOf && <><dt>Copy of</dt><dd>{t.copyOf.taskNumbers?.join('\n') || t.bundle}{t.copyOf.date ? ' (' + t.copyOf.date + ')' : ''}</dd></>}
              <dt>Task numbers</dt><dd>{t.taskNumbers?.join('\n') || (t.newTask ? 'New task (copy)' : '—')}</dd>
              <dt>Task type</dt><dd>{t.bundle}{t.execution ? ' · ' + t.execution : ''}</dd>
              <dt>Window</dt><dd>{t.window || windows.find(w => t.date >= w.start && t.date <= (w.end || w.start))?.name || 'Outside recorded TAR'}</dd>
              {t.breachBefore && <><dt>Breach it precedes</dt><dd>{t.breachBefore}{t.exposureDays ? ` · ${t.exposureDays} d exposed` : ''}</dd></>}
              {t.breachAfter !== undefined && <><dt>Next breach</dt><dd>{t.breachAfter || 'none in horizon'}{t.life != null ? ` (${t.life.toLocaleString()} d life)` : ''}</dd></>}
              {t.slack != null && <><dt>Slack to breach</dt><dd>{t.slack.toLocaleString()} d · {t.class}</dd></>}
              {t.params && <><dt>Weibull after</dt><dd>β {t.params.beta?.toFixed(2)} · η {Math.round(t.params.eta).toLocaleString()} d · γ {Math.round(t.params.gamma || 0).toLocaleString()} d</dd></>}
              {t.lane === 'proposed' && <><dt>Cost</dt><dd>{usd(t.cost)}{t.costBasis ? ' · ' + t.costBasis : ''}</dd></>}
              {(() => { const lr = linkedRows(t); return <><dt>Linked assessments ({lr.length})</dt><dd>{lr.map(rowName).join('\n')}</dd></>; })()}
            </dl>
            {t.evidence && <p className="evidence">{t.evidence}</p>}
            {t.note && <p className="amber">{t.note}</p>}
          </div>)}
          {m && lane === 'proposed' && [...m.drivers].some((d: Any) => d.exportHold) && <p className="amber">{[...new Set([...m.drivers].flatMap((d: Any) => (d.holds || []).map((h: Any) => h.label)))].join(' · ')}</p>}
        </div>
      </div>; })}
    </div>
    <details className="tar-schedule">
      <summary>TAR calendar · {row.a.asset?.unit} · {windows.length} source windows{windows.length ? ' · last start ' + windows.at(-1)?.start : ''}</summary>
      {windows.length ? <div className="tar-list">{windows.map(w => <button key={w.id} onClick={() => { setTarId(w.id); setTask(null); setCursor(dayOf(w.start)); setView([dayOf(w.start) - 120, dayOf(w.end || w.start) + 180]); }}><strong>{w.name}</strong><span>{w.start} → {w.end}</span><small>{w.durationDays} days · lockdown {w.lockdown || 'not supplied'}</small></button>)}</div> : <p>No TAR windows are recorded for this unit.</p>}
    </details>
  </div>;
}
