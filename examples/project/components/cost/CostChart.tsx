'use client';
/**
 * Financials over time — the cost page's signal instrument.
 *
 * Revenue + cost + forecast + margin %, per period (month or week), with the
 * interaction kit carried over from the legacy cost graph, fitted to the new
 * Timesheet financials: clickable-legend series toggles, Bars↔Lines with smooth
 * curves + markers, Cost $ / Hours mode, a "today" marker, period/cumulative.
 * Hover for the full readout; click a revenue/cost bar to trace its source.
 *
 * Custom SVG (app convention, no chart lib). Responsive via ResizeObserver.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

export type ChartRow = {
  period: string;
  actual_revenue: number;
  actual_cost: number;
  actual_hours: number;
  forecast_revenue: number;
  forecast_cost: number;
};
type Granularity = 'month' | 'week';
type View = 'period' | 'cumulative';
type Mode = 'cost' | 'hours';
type ChartType = 'bars' | 'lines';
type SeriesKey = 'revenue' | 'cost' | 'fcst_rev' | 'fcst_cost' | 'margin';

const TEAL = '#2ec4b6';
const COST = 'var(--fg-2)';
const GREEN = '#3ecf8e';
const RED = '#e5484d';
const AMBER = '#f5b14a';
const MUTED = 'var(--fg-3)';
const GRID = 'var(--glass-border)';
const FG2 = 'var(--fg-2)';
const MONO = 'var(--font-mono, "JetBrains Mono", monospace)';

const SERIES: Record<SeriesKey, { label: string; color: string; axis: '$' | '%'; bar: boolean }> = {
  revenue:   { label: 'Revenue',       color: TEAL,  axis: '$', bar: true },
  cost:      { label: 'Cost',          color: COST,  axis: '$', bar: true },
  fcst_rev:  { label: 'Forecast rev',  color: TEAL,  axis: '$', bar: false },
  fcst_cost: { label: 'Forecast cost', color: COST,  axis: '$', bar: false },
  margin:    { label: 'Margin %',      color: FG2,   axis: '%', bar: false },
};
const SERIES_ORDER: SeriesKey[] = ['revenue', 'cost', 'fcst_rev', 'fcst_cost', 'margin'];

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compact = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1000) return `${v < 0 ? '−' : ''}$${(a / 1000).toFixed(a >= 100000 ? 0 : 1)}K`;
  return `${v < 0 ? '−' : ''}$${Math.round(a)}`;
};
const hrsFmt = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${Math.round(v)}`);
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
const weekFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
function periodLabel(p: string, g: Granularity) {
  const d = new Date(`${p}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return p;
  return g === 'week' ? weekFmt.format(d) : monthFmt.format(d);
}
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}
/** Smooth path through points (monotone-ish Catmull-Rom → cubic bezier). */
function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0][0]} ${pts[0][1]}` : '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const linePath = (pts: Array<[number, number]>) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--glass-border)', borderRadius: 6, overflow: 'hidden' }}>
      {options.map((o) => (
        <button key={o.v} aria-pressed={value === o.v} onClick={() => onChange(o.v)}
          style={{
            padding: '4px 11px', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
            transition: 'background 120ms ease, color 120ms ease',
            background: value === o.v ? TEAL : 'transparent', color: value === o.v ? '#0a0b0c' : FG2, fontWeight: value === o.v ? 600 : 500,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button aria-pressed={on} onClick={onClick}
      style={{
        padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
        border: `1px solid ${on ? 'rgba(46,196,182,0.55)' : 'var(--glass-border)'}`,
        background: on ? 'rgba(46,196,182,0.14)' : 'transparent', color: on ? TEAL : FG2,
        transition: 'all 120ms ease',
      }}>
      {label}
    </button>
  );
}


function chartButton(label:string,activate:()=>void){return {role:'button',tabIndex:0,'aria-label':label,onKeyDown:(e:import('react').KeyboardEvent<SVGElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}}}}
export default function CostChart({
  rows, granularity, onGranularity, onTraceCost, onTraceRevenue,
}: {
  rows: ChartRow[];
  granularity: Granularity;
  onGranularity: (g: Granularity) => void;
  onTraceCost: (period: string, label: string, cumulative?: boolean) => void;
  onTraceRevenue: (period: string, label: string, cumulative?: boolean) => void;
}) {
  const [view, setView] = useState<View>('period');
  const [mode, setMode] = useState<Mode>('cost');
  const [type, setType] = useState<ChartType>('bars');
  const [smooth, setSmooth] = useState(true);
  const [markers, setMarkers] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [compare, setCompare] = useState(false);
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(760);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((e) => { const cw = e[0]?.contentRect.width; if (cw) setW(Math.max(360, cw)); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    let ar = 0, ac = 0, fr = 0, fc = 0, ah = 0;
    return rows.map((r) => {
      ar += r.actual_revenue; ac += r.actual_cost; fr += r.forecast_revenue; fc += r.forecast_cost; ah += r.actual_hours;
      const cum = view === 'cumulative';
      const rev = cum ? ar : r.actual_revenue;
      const cost = cum ? ac : r.actual_cost;
      const frev = cum ? fr : r.forecast_revenue;
      const fcost = cum ? fc : r.forecast_cost;
      const hours = cum ? ah : r.actual_hours;
      return { period: r.period, rev, cost, frev, fcost, hours, margin: rev > 0 ? ((rev - cost) / rev) * 100 : null };
    });
  }, [rows, view]);

  const vis = (k: SeriesKey) => !hidden.has(k);
  const toggle = (k: SeriesKey) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const H = 360;
  const m = { top: 18, right: mode === 'cost' ? 52 : 16, bottom: 46, left: 60 };
  const plotW = Math.max(1, w - m.left - m.right);
  const plotH = H - m.top - m.bottom;
  const n = data.length || 1;
  const slot = plotW / n;
  const cx = (i: number) => m.left + slot * i + slot / 2;

  // $ / hours axis
  const dollarVals = data.flatMap((d) => [vis('revenue') ? d.rev : 0, vis('cost') ? d.cost : 0, vis('fcst_rev') ? d.frev : 0, vis('fcst_cost') ? d.fcost : 0]);
  const maxVal = mode === 'cost' ? niceMax(Math.max(1, ...dollarVals)) : niceMax(Math.max(1, ...data.map((d) => d.hours)));
  const yVal = (v: number) => m.top + plotH - (v / maxVal) * plotH;
  // margin axis
  const mMax = Math.max(10, ...data.map((d) => (d.margin == null ? 0 : Math.abs(d.margin))));
  const yPct = (v: number) => m.top + plotH / 2 - (v / mMax) * (plotH / 2);

  const yTicks = 4;
  const gridVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);
  const axisFmt = mode === 'cost' ? compact : hrsFmt;

  // today marker index
  const todayIdx = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let idx = -1;
    for (let i = 0; i < data.length; i++) {
      const start = data[i].period;
      const end = data[i + 1]?.period ?? '9999-12-31';
      if (today >= start && today < end) { idx = i; break; }
    }
    return idx;
  }, [data]);

  const hd = hover != null ? data[hover] : null;
  const tipLeft = hover != null ? Math.min(Math.max(cx(hover) - 92, 4), w - 188) : 0;

  // line points for a $-series accessor
  const linePts = (acc: (d: typeof data[number]) => number) => data.map((d, i) => [cx(i), yVal(acc(d))] as [number, number]);
  const pathFor = (pts: Array<[number, number]>) => (smooth ? smoothPath(pts) : linePath(pts));

  return (
    <section style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg, 14px)', background: 'var(--glass-bg, rgba(255,255,255,0.04))', overflow: 'hidden' }}>
      {/* toolbar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>Financials over time</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Seg<Mode> value={mode} options={[{ v: 'cost', label: 'Cost $' }, { v: 'hours', label: 'Hours' }]} onChange={setMode} />
          <Seg<ChartType> value={type} options={[{ v: 'bars', label: 'Bars' }, { v: 'lines', label: 'Lines' }]} onChange={setType} />
          {type === 'lines' && <Chip on={smooth} label="Smooth" onClick={() => setSmooth((s) => !s)} />}
          {type === 'lines' && <Chip on={markers} label="Markers" onClick={() => setMarkers((s) => !s)} />}
          {mode === 'cost' && <Chip on={compare} label="Compare vs fcst" onClick={() => setCompare((s) => !s)} />}
          <Chip on={showToday} label="Today" onClick={() => setShowToday((s) => !s)} />
          <Seg<View> value={view} options={[{ v: 'period', label: 'Period' }, { v: 'cumulative', label: 'Cum.' }]} onChange={setView} />
          <Seg<Granularity> value={granularity} options={[{ v: 'month', label: 'Month' }, { v: 'week', label: 'Week' }]} onChange={onGranularity} />
        </div>
      </div>

      {/* clickable legend */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {mode === 'cost' ? SERIES_ORDER.map((k) => {
          const s = SERIES[k];
          const off = !vis(k);
          const dash = k === 'fcst_rev' || k === 'fcst_cost';
          return (
            <button key={k} onClick={() => toggle(k)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: off ? 0.4 : 1, transition: 'opacity 120ms ease' }}>
              <span style={{ width: dash ? 14 : 10, height: dash ? 0 : 10, borderRadius: dash ? 0 : 2, background: dash ? 'transparent' : s.color, borderTop: dash ? `2px dashed ${s.color}` : undefined }} />
              <span style={{ fontSize: 12, color: FG2, textDecoration: off ? 'line-through' : 'none' }}>{s.label}</span>
            </button>
          );
        }) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: AMBER }} />
            <span style={{ fontSize: 12, color: FG2 }}>Labor hours</span>
          </span>
        )}
      </div>

      <div ref={wrapRef} style={{ position: 'relative', padding: '4px 0' }}>
        <svg width={w} height={H} style={{ display: 'block' }} onMouseLeave={() => setHover(null)}>
          {/* gridlines + left axis */}
          {gridVals.map((v, i) => (
            <g key={i}>
              <line x1={m.left} x2={m.left + plotW} y1={yVal(v)} y2={yVal(v)} stroke={GRID} />
              <text x={m.left - 8} y={yVal(v) + 3} textAnchor="end" fontFamily={MONO} fontSize={10} fill={MUTED}>{axisFmt(v)}</text>
            </g>
          ))}
          {/* right % axis (cost mode + margin visible) */}
          {mode === 'cost' && vis('margin') && (
            <>
              {[mMax, 0, -mMax].map((v, i) => (
                <text key={i} x={m.left + plotW + 8} y={yPct(v) + 3} textAnchor="start" fontFamily={MONO} fontSize={10} fill={MUTED}>{Math.round(v)}%</text>
              ))}
              <line x1={m.left} x2={m.left + plotW} y1={yPct(0)} y2={yPct(0)} stroke={GRID} strokeDasharray="1 4" />
            </>
          )}

          {/* hover guide */}
          {hover != null && <rect x={m.left + slot * hover} y={m.top} width={slot} height={plotH} fill="rgba(46,196,182,0.06)" />}

          {/* today marker */}
          {showToday && todayIdx >= 0 && (
            <g>
              <line x1={cx(todayIdx)} x2={cx(todayIdx)} y1={m.top} y2={m.top + plotH} stroke={AMBER} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
              <text x={cx(todayIdx)} y={m.top - 5} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={AMBER}>today</text>
            </g>
          )}

          {/* hover hit areas */}
          {data.map((d, i) => <rect key={`hit-${i}`} x={m.left + slot * i} y={m.top} width={slot} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />)}

          {mode === 'hours' ? (
            type === 'bars' ? (
              data.map((d, i) => {
                const h = (d.hours / maxVal) * plotH;
                const bw = Math.min(slot * 0.6, 48);
                return <rect key={d.period} x={cx(i) - bw / 2} y={m.top + plotH - h} width={bw} height={Math.max(0, h)} rx={1.5} fill={AMBER} />;
              })
            ) : (
              <>
                <path d={pathFor(linePts((d) => d.hours))} fill="none" stroke={AMBER} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {markers && data.map((d, i) => <circle key={i} cx={cx(i)} cy={yVal(d.hours)} r={2.5} fill={AMBER} />)}
              </>
            )
          ) : type === 'bars' ? (
            <>
              {data.map((d, i) => {
                const gx = cx(i);
                const showRev = vis('revenue'), showCost = vis('cost');
                const bothW = Math.min(slot * 0.62, 64);
                const bw = (showRev && showCost) ? bothW / 2 - 1 : Math.min(bothW, 28);
                const base = m.top + plotH;
                const revH = (d.rev / maxVal) * plotH;
                const costH = (d.cost / maxVal) * plotH;
                const revX = showRev && showCost ? gx - bw - 1 : gx - bw / 2;
                const costX = showRev && showCost ? gx + 1 : gx - bw / 2;
                const frevH = (d.frev / maxVal) * plotH;
                const fcostH = (d.fcost / maxVal) * plotH;
                return (
                  <g key={d.period}>
                    {showRev && (
                      <rect {...chartButton('Trace revenue '+d.period,()=>onTraceRevenue(d.period,periodLabel(d.period,granularity),view==='cumulative'))} x={revX} y={base - revH} width={bw} height={Math.max(0, revH)} rx={1.5} fill={TEAL} style={{ cursor: 'pointer' }}
                        onClick={() => d.rev && onTraceRevenue(d.period, periodLabel(d.period, granularity), view === 'cumulative')}><title>Revenue {usd0.format(Math.round(d.rev))}</title></rect>
                    )}
                    {showCost && (
                      <rect {...chartButton('Trace cost '+d.period,()=>onTraceCost(d.period,periodLabel(d.period,granularity),view==='cumulative'))} x={costX} y={base - costH} width={bw} height={Math.max(0, costH)} rx={1.5} fill={COST} style={{ cursor: 'pointer' }}
                        onClick={() => d.cost && onTraceCost(d.period, periodLabel(d.period, granularity), view === 'cumulative')}><title>Cost {usd0.format(Math.round(d.cost))}</title></rect>
                    )}
                    {/* compare: forecast as ghost outline behind each actual bar */}
                    {compare && showRev && d.frev > 0 && (
                      <rect x={revX} y={base - frevH} width={bw} height={Math.max(0, frevH)} fill="none" stroke={TEAL} strokeWidth={1} strokeDasharray="2 2" opacity={0.8} />
                    )}
                    {compare && showCost && d.fcost > 0 && (
                      <rect x={costX} y={base - fcostH} width={bw} height={Math.max(0, fcostH)} fill="none" stroke={COST} strokeWidth={1} strokeDasharray="2 2" opacity={0.9} />
                    )}
                  </g>
                );
              })}
              {!compare && vis('fcst_rev') && data.length > 1 && <path d={pathFor(linePts((d) => d.frev))} fill="none" stroke={TEAL} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.55} />}
              {!compare && vis('fcst_cost') && data.length > 1 && <path d={pathFor(linePts((d) => d.fcost))} fill="none" stroke={COST} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.75} />}
            </>
          ) : (
            // lines mode (cost)
            <>
              {vis('revenue') && <path d={pathFor(linePts((d) => d.rev))} fill="none" stroke={TEAL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
              {vis('cost') && <path d={pathFor(linePts((d) => d.cost))} fill="none" stroke={COST} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
              {vis('fcst_rev') && <path d={pathFor(linePts((d) => d.frev))} fill="none" stroke={TEAL} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.6} />}
              {vis('fcst_cost') && <path d={pathFor(linePts((d) => d.fcost))} fill="none" stroke={COST} strokeWidth={1.5} strokeDasharray="2 3" opacity={0.8} />}
              {markers && vis('revenue') && data.map((d, i) => <circle {...chartButton('Trace revenue '+d.period,()=>onTraceRevenue(d.period,periodLabel(d.period,granularity),view==='cumulative'))} key={`r${i}`} cx={cx(i)} cy={yVal(d.rev)} r={2.5} fill={TEAL} style={{ cursor: 'pointer' }} onClick={() => d.rev && onTraceRevenue(d.period, periodLabel(d.period, granularity), view === 'cumulative')} />)}
              {markers && vis('cost') && data.map((d, i) => <circle {...chartButton('Trace cost '+d.period,()=>onTraceCost(d.period,periodLabel(d.period,granularity),view==='cumulative'))} key={`c${i}`} cx={cx(i)} cy={yVal(d.cost)} r={2.5} fill={COST} style={{ cursor: 'pointer' }} onClick={() => d.cost && onTraceCost(d.period, periodLabel(d.period, granularity), view === 'cumulative')} />)}
            </>
          )}

          {/* margin % line (cost mode) */}
          {mode === 'cost' && vis('margin') && (
            <>
              <path d={pathFor(data.map((d, i) => [cx(i), yPct(d.margin ?? 0)] as [number, number]))} fill="none" stroke={FG2} strokeWidth={1.5} opacity={0.85} />
              {data.map((d, i) => d.margin == null ? null : <circle key={`m${i}`} cx={cx(i)} cy={yPct(d.margin)} r={3} fill={d.margin >= 0 ? GREEN : RED} stroke="#0a0b0c" strokeWidth={1} />)}
            </>
          )}

          {/* x labels */}
          {data.map((d, i) => (n <= 14 || i % Math.ceil(n / 14) === 0) ? (
            <text key={`x${i}`} x={cx(i)} y={H - 26} textAnchor="middle" fontFamily={MONO} fontSize={10} fill={MUTED}>{periodLabel(d.period, granularity)}</text>
          ) : null)}
        </svg>

        {hd && (
          <div style={{ position: 'absolute', top: 8, left: tipLeft, width: 184, pointerEvents: 'none', background: 'var(--glass-bg-solid)', backdropFilter: 'blur(18px)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', zIndex: 5 }}>
            <div style={{ fontSize: 11, color: FG2, marginBottom: 6 }}>{periodLabel(hd.period, granularity)}{view === 'cumulative' ? ' · cum.' : ''}</div>
            {mode === 'hours' ? (
              <TipRow color={AMBER} label="Labor hours" value={`${hrsFmt(hd.hours)} h`} />
            ) : (
              <>
                {vis('revenue') && <TipRow color={TEAL} label="Revenue" value={usd0.format(Math.round(hd.rev))} />}
                {vis('cost') && <TipRow color={COST} label="Cost" value={usd0.format(Math.round(hd.cost))} />}
                <TipRow color={hd.rev - hd.cost >= 0 ? GREEN : RED} label="Profit" value={usd0.format(Math.round(hd.rev - hd.cost))} />
                {vis('margin') && <TipRow color={hd.margin != null && hd.margin >= 0 ? GREEN : RED} label="Margin" value={hd.margin == null ? '—' : `${hd.margin.toFixed(1)}%`} />}
                {(vis('fcst_rev') || vis('fcst_cost')) && <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />}
                {vis('fcst_rev') && <TipRow color={MUTED} label="Fcst rev" value={usd0.format(Math.round(hd.frev))} dim />}
                {vis('fcst_cost') && <TipRow color={MUTED} label="Fcst cost" value={usd0.format(Math.round(hd.fcost))} dim />}
                {compare && (
                  <>
                    <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                    <TipRow color={hd.rev - hd.frev >= 0 ? GREEN : RED} label="Δ rev vs fcst" value={usd0.format(Math.round(hd.rev - hd.frev))} />
                    <TipRow color={hd.cost - hd.fcost <= 0 ? GREEN : RED} label="Δ cost vs fcst" value={usd0.format(Math.round(hd.cost - hd.fcost))} />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TipRow({ color, label, value, dim }: { color: string; label: string; value: string; dim?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, lineHeight: 1.7 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: dim ? MUTED : FG2 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />{label}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: dim ? MUTED : 'rgba(255,255,255,0.96)' }}>{value}</span>
    </div>
  );
}
