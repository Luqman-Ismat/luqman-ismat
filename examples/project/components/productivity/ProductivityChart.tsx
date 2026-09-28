'use client';
/**
 * Productivity over time by Timesheet phase — the page's hero chart.
 *
 * Three modes (default Worker):
 *   Worker — hrs / worker (Timesheet: hours ÷ distinct workers), per phase
 *   Unit   — hrs / unit (Timesheet hours-to-date ÷ forecast actual_count), per
 *            phase; populates only where PLs have entered counts on /forecast
 *   Hours  — raw labor hours (stacked bars / lines, period or cumulative)
 *
 * Metric modes draw a dashed portfolio-baseline reference line. Same
 * interaction kit as the cost graph (CostChart): smooth/markers, Today, month/
 * week, clickable-legend phase toggles, hover readout, click → trace.
 *
 * Custom SVG (app convention, no chart lib). Responsive via ResizeObserver.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

export type PhaseSeries = {
  phase: string; total_hours: number; actual_count: number; baseline_count: number;
  weekly: { week: string; hours: number; metric: number | null }[];
};
type Granularity = 'month' | 'week';
type View = 'period' | 'cumulative';
type ChartType = 'bars' | 'lines';
type Mode = 'worker' | 'unit' | 'hours';

const PHASE_COLORS = ['#2ec4b6', '#a855f7', '#f5b14a', '#4f9cf9', '#3ecf8e', '#ec4899', '#eab308', '#06b6d4'];
const TOTAL = 'var(--fg-1)';
const MUTED = 'var(--fg-3)';
const GRID = 'var(--glass-border)';
const FG2 = 'var(--fg-2)';
const AMBER = '#f5b14a';
const MONO = 'var(--font-mono, "JetBrains Mono", monospace)';

const hrsFmt = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${Math.round(v)}`);
const metFmt = (v: number) => (Math.abs(v) >= 100 ? `${Math.round(v)}` : `${v.toFixed(1)}`);
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

export type ProdTraceArg = {
  kind: 'phase_hours' | 'period_hours';
  cumulative?: boolean;
  label: string;
  phase?: string;
  period?: string;
  granularity?: Granularity;
};

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--glass-border)', borderRadius: 6, overflow: 'hidden' }}>
      {options.map((o) => (
        <button key={o.v} aria-pressed={value === o.v} onClick={() => onChange(o.v)}
          style={{
            padding: '4px 11px', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
            transition: 'background 120ms ease, color 120ms ease',
            background: value === o.v ? PHASE_COLORS[0] : 'transparent', color: value === o.v ? '#0a0b0c' : FG2, fontWeight: value === o.v ? 600 : 500,
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
        background: on ? 'rgba(46,196,182,0.14)' : 'transparent', color: on ? PHASE_COLORS[0] : FG2,
        transition: 'all 120ms ease',
      }}>
      {label}
    </button>
  );
}

export default function ProductivityChart({
  phases, blMetric, blUnit, granularity, onGranularity, onTrace,
}: {
  phases: PhaseSeries[];
  blMetric: number | null;
  blUnit: number | null;
  granularity: Granularity;
  onGranularity: (g: Granularity) => void;
  onTrace: (t: ProdTraceArg) => void;
}) {
  const [mode, setMode] = useState<Mode>('worker');
  const [view, setView] = useState<View>('period');
  const [type, setType] = useState<ChartType>('lines');
  const [smooth, setSmooth] = useState(true);
  const [markers, setMarkers] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [showTotal, setShowTotal] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
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

  const isHours = mode === 'hours';
  const isMetric = !isHours;            // worker or unit → line metric with baseline
  const baseline = mode === 'worker' ? blMetric : mode === 'unit' ? blUnit : null;
  const effType: ChartType = isMetric ? 'lines' : type;
  const effView: View = isMetric ? 'period' : view;
  const unitName = mode === 'worker' ? 'hrs/worker' : mode === 'unit' ? 'hrs/unit' : 'h';

  const colorOf = useMemo(() => {
    const m = new Map<string, string>();
    phases.forEach((p, i) => m.set(p.phase, PHASE_COLORS[i % PHASE_COLORS.length]));
    return m;
  }, [phases]);

  const periods = useMemo(() => {
    const s = new Set<string>();
    for (const p of phases) for (const pt of p.weekly) s.add(pt.week);
    return Array.from(s).sort();
  }, [phases]);

  type Cell = { value: number | null; hours: number; metric: number | null };
  const data = useMemo(() => {
    const runHours = new Map<string, number>();
    const countOf = new Map(phases.map((p) => [p.phase, p.actual_count] as const));
    return periods.map((period) => {
      const byPhase = new Map<string, Cell>();
      let total = 0;
      for (const p of phases) {
        const pt = p.weekly.find((x) => x.week === period);
        const hours = pt?.hours ?? 0;
        const metric = pt?.metric ?? null;
        const cumH = (runHours.get(p.phase) ?? 0) + hours;
        runHours.set(p.phase, cumH);
        let value: number | null;
        if (mode === 'worker') value = metric;
        else if (mode === 'unit') { const c = countOf.get(p.phase) ?? 0; value = c > 0 ? cumH / c : null; }
        else value = effView === 'cumulative' ? cumH : hours;
        byPhase.set(p.phase, { value, hours, metric });
        if (!hidden.has(p.phase) && isHours && value != null) total += value;
      }
      return { period, byPhase, total };
    });
  }, [periods, phases, mode, effView, hidden, isHours]);

  const vis = (p: string) => !hidden.has(p);
  const toggle = (p: string) => setHidden((h) => { const n = new Set(h); n.has(p) ? n.delete(p) : n.add(p); return n; });

  const H = 360;
  const m = { top: 18, right: isMetric ? 44 : 16, bottom: 46, left: 56 };
  const plotW = Math.max(1, w - m.left - m.right);
  const plotH = H - m.top - m.bottom;
  const n = data.length || 1;
  const slot = plotW / n;
  const cx = (i: number) => m.left + slot * i + slot / 2;

  const maxVal = useMemo(() => {
    if (isMetric) {
      let mx = baseline ?? 0;
      for (const d of data) for (const p of phases) if (vis(p.phase)) { const v = d.byPhase.get(p.phase)?.value; if (v != null && v > mx) mx = v; }
      return niceMax(Math.max(1, mx));
    }
    if (effType === 'bars') return niceMax(Math.max(1, ...data.map((d) => d.total)));
    let mx = 1;
    for (const d of data) for (const p of phases) if (vis(p.phase)) { const v = d.byPhase.get(p.phase)?.value; if (v != null) mx = Math.max(mx, v); }
    return niceMax(mx);
  }, [data, phases, isMetric, effType, hidden, baseline]);
  const yVal = (v: number) => m.top + plotH - (v / maxVal) * plotH;

  const yTicks = 4;
  const gridVals = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);
  const axisFmt = isHours ? hrsFmt : metFmt;

  const todayIdx = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < data.length; i++) {
      const start = data[i].period;
      const end = data[i + 1]?.period ?? '9999-12-31';
      if (today >= start && today < end) return i;
    }
    return -1;
  }, [data]);

  const hd = hover != null ? data[hover] : null;
  const tipLeft = hover != null ? Math.min(Math.max(cx(hover) - 100, 4), w - 214) : 0;
  const visPhases = phases.filter((p) => vis(p.phase));
  const unitEmpty = mode === 'unit' && phases.every((p) => p.actual_count <= 0);

  const linePts = (phase: string) => data
    .map((d, i) => { const v = d.byPhase.get(phase)?.value; return v == null ? null : [cx(i), yVal(v)] as [number, number]; })
    .filter((x): x is [number, number] => x != null);
  const pathFor = (pts: Array<[number, number]>) => (smooth ? smoothPath(pts) : linePath(pts));
  const fmtCell = (c: Cell | undefined) => {
    if (c == null) return '—';
    if (mode === 'worker') return c.metric != null ? `${metFmt(c.metric)} hrs/wkr` : '—';
    if (mode === 'unit') return c.value != null ? `${metFmt(c.value)} hrs/unit` : '—';
    return `${hrsFmt(c.hours)} h`;
  };

  return (
    <section style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg, 14px)', background: 'var(--glass-bg, rgba(255,255,255,0.04))', overflow: 'hidden' }}>
      {/* toolbar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>
          {mode === 'worker' ? 'Productivity · hrs / worker' : mode === 'unit' ? 'Productivity · hrs / unit (forecast count)' : 'Hours over time · by phase'}
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Seg<Mode> value={mode} options={[{ v: 'worker', label: 'Worker' }, { v: 'unit', label: 'Unit' }, { v: 'hours', label: 'Hours' }]} onChange={setMode} />
          {isHours && <Seg<ChartType> value={type} options={[{ v: 'bars', label: 'Bars' }, { v: 'lines', label: 'Lines' }]} onChange={setType} />}
          {effType === 'lines' && <Chip on={smooth} label="Smooth" onClick={() => setSmooth((s) => !s)} />}
          {effType === 'lines' && <Chip on={markers} label="Markers" onClick={() => setMarkers((s) => !s)} />}
          {isHours && <Chip on={showTotal} label="Total" onClick={() => setShowTotal((s) => !s)} />}
          <Chip on={showToday} label="Today" onClick={() => setShowToday((s) => !s)} />
          {isHours && <Seg<View> value={view} options={[{ v: 'period', label: 'Period' }, { v: 'cumulative', label: 'Cum.' }]} onChange={setView} />}
          <Seg<Granularity> value={granularity} options={[{ v: 'month', label: 'Month' }, { v: 'week', label: 'Week' }]} onChange={onGranularity} />
        </div>
      </div>

      {/* clickable legend */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {phases.map((p) => {
          const off = !vis(p.phase);
          return (
            <span key={p.phase} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => toggle(p.phase)} title="Show / hide"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: off ? 0.4 : 1 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: colorOf.get(p.phase) }} />
                <span style={{ fontSize: 12, color: FG2, textDecoration: off ? 'line-through' : 'none' }}>{p.phase}</span>
              </button>
              <button onClick={() => onTrace({ kind: 'phase_hours', phase: p.phase, label: `Phase · ${p.phase}` })} aria-label={`Trace ${p.phase} hours`} title="Trace timesheet hours"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 11, padding: 0 }}>↗</button>
            </span>
          );
        })}
      </div>

      <div ref={wrapRef} style={{ position: 'relative', padding: '4px 0' }}>
        {unitEmpty && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6, pointerEvents: 'none' }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: MUTED, textAlign: 'center', maxWidth: 360 }}>
              No forecast unit counts yet — enter <b>actual count</b> on the Forecast worksheet for these tasks and hrs/unit will populate here.
            </div>
          </div>
        )}
        <svg width={w} height={H} style={{ display: 'block', opacity: unitEmpty ? 0.25 : 1 }} onMouseLeave={() => setHover(null)}>
          {gridVals.map((v, i) => (
            <g key={i}>
              <line x1={m.left} x2={m.left + plotW} y1={yVal(v)} y2={yVal(v)} stroke={GRID} />
              <text x={m.left - 8} y={yVal(v) + 3} textAnchor="end" fontFamily={MONO} fontSize={10} fill={MUTED}>{axisFmt(v)}</text>
            </g>
          ))}

          {hover != null && <rect x={m.left + slot * hover} y={m.top} width={slot} height={plotH} fill="rgba(46,196,182,0.06)" />}

          {/* baseline reference (metric modes) */}
          {isMetric && baseline != null && baseline <= maxVal && (
            <g>
              <line x1={m.left} x2={m.left + plotW} y1={yVal(baseline)} y2={yVal(baseline)} stroke={FG2} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6} />
              <text x={m.left + plotW + 5} y={yVal(baseline) + 3} fontFamily={MONO} fontSize={9} fill={FG2}>BL {metFmt(baseline)}</text>
            </g>
          )}

          {showToday && todayIdx >= 0 && (
            <g>
              <line x1={cx(todayIdx)} x2={cx(todayIdx)} y1={m.top} y2={m.top + plotH} stroke={AMBER} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
              <text x={cx(todayIdx)} y={m.top - 5} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={AMBER}>today</text>
            </g>
          )}

          {data.map((d, i) => <rect key={`hit-${i}`} x={m.left + slot * i} y={m.top} width={slot} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />)}

          {effType === 'bars' ? (
            data.map((d, i) => {
              const bw = Math.min(slot * 0.66, 42);
              const base = m.top + plotH;
              let acc = 0;
              return (
                <g key={d.period}>
                  {visPhases.map((p) => {
                    const v = d.byPhase.get(p.phase)?.value ?? 0;
                    if (v <= 0) return null;
                    const h = (v / maxVal) * plotH;
                    const y = base - acc - h;
                    acc += h;
                    return (
                      <rect key={p.phase} x={cx(i) - bw / 2} y={y} width={bw} height={Math.max(0, h)} fill={colorOf.get(p.phase)} style={{ cursor: 'pointer' }}
                        onClick={() => onTrace({ kind: 'phase_hours', phase: p.phase, period: d.period, granularity, cumulative: effView === 'cumulative', label: `${p.phase} · ${periodLabel(d.period, granularity)}` })}>
                        <title>{p.phase}: {hrsFmt(v)} h</title>
                      </rect>
                    );
                  })}
                </g>
              );
            })
          ) : (
            <>
              {visPhases.map((p) => (
                <path key={p.phase} d={pathFor(linePts(p.phase))} fill="none" stroke={colorOf.get(p.phase)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {markers && visPhases.map((p) => data.map((d, i) => {
                const v = d.byPhase.get(p.phase)?.value;
                return v != null && v > 0 ? (
                  <circle key={`${p.phase}-${i}`} cx={cx(i)} cy={yVal(v)} r={2.5} fill={colorOf.get(p.phase)} style={{ cursor: 'pointer' }}
                    onClick={() => onTrace({ kind: 'phase_hours', phase: p.phase, period: d.period, granularity, cumulative: effView === 'cumulative', label: `${p.phase} · ${periodLabel(d.period, granularity)}` })} />
                ) : null;
              }))}
            </>
          )}

          {/* total overlay (hours mode) */}
          {isHours && showTotal && data.length > 1 && (
            <>
              <path d={pathFor(data.map((d, i) => [cx(i), yVal(d.total)] as [number, number]))} fill="none" stroke={TOTAL} strokeWidth={1.5} strokeDasharray="4 3" opacity={0.8} />
              {data.map((d, i) => (
                <circle key={`t${i}`} cx={cx(i)} cy={yVal(d.total)} r={2.5} fill={TOTAL} style={{ cursor: 'pointer' }}
                  onClick={() => onTrace({ kind: 'period_hours', period: d.period, granularity, cumulative: effView === 'cumulative', label: `All phases · ${periodLabel(d.period, granularity)}` })} />
              ))}
            </>
          )}

          {data.map((d, i) => (n <= 14 || i % Math.ceil(n / 14) === 0) ? (
            <text key={`x${i}`} x={cx(i)} y={H - 26} textAnchor="middle" fontFamily={MONO} fontSize={10} fill={MUTED}>{periodLabel(d.period, granularity)}</text>
          ) : null)}
        </svg>

        {hd && !unitEmpty && (
          <div style={{ position: 'absolute', top: 8, left: tipLeft, width: 210, pointerEvents: 'none', background: 'var(--glass-bg-solid)', backdropFilter: 'blur(18px)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', zIndex: 5 }}>
            <div style={{ fontSize: 11, color: FG2, marginBottom: 6 }}>{periodLabel(hd.period, granularity)}{effView === 'cumulative' ? ' · cum.' : ''}{mode === 'unit' ? ' · to date' : ''}</div>
            {visPhases.map((p) => {
              const c = hd.byPhase.get(p.phase);
              if (!c || (isHours ? c.hours <= 0 : c.value == null)) return null;
              return <TipRow key={p.phase} color={colorOf.get(p.phase) ?? FG2} label={p.phase} value={fmtCell(c)} />;
            })}
            {isMetric && baseline != null && (
              <>
                <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                <TipRow color={FG2} label="Baseline" value={`${metFmt(baseline)} ${unitName}`} />
              </>
            )}
            {isHours && (
              <>
                <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                <TipRow color={TOTAL} label="Total" value={`${hrsFmt(hd.total)} h`} />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, lineHeight: 1.7 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: FG2, overflow: 'hidden' }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.96)', flexShrink: 0 }}>{value}</span>
    </div>
  );
}
