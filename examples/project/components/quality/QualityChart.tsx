'use client';
/**
 * Quality over time — same chart family as components/cost/CostChart and
 * components/productivity/ProductivityChart. Three modes:
 *   Hours   — charge-code mix (Execution / QC / Rework / Setup / Other),
 *             stacked bars or lines, period or cumulative
 *   Ratios  — QC ratio % and Rework ratio % (lines, % axis)
 *   Defects — defects found / open (bars or lines)
 *
 * Interaction kit carried over: in-card Seg/Chip toolbar, clickable-legend
 * series toggles, Bars↔Lines with smooth curves + markers, Today + QMP markers,
 * Month/Week (re-bucketed client-side from the weekly series), hover readout,
 * and click a bar / point / x-label to trace the underlying Timesheet rows.
 *
 * Custom SVG (app convention). Responsive via ResizeObserver.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

export type QualityWeek = {
  week: string;
  ex_hours: number; qc_hours: number; rework_hours: number; sc_hours: number; other_hours: number;
  qc_ratio_pct: number; rework_ratio_pct: number;
  defects_found: number; defects_open: number; qc_logs_created: number;
};
type Granularity = 'month' | 'week';
type View = 'period' | 'cumulative';
type ChartType = 'bars' | 'lines';
type Mode = 'hours' | 'ratios' | 'defects';

export type QualityTraceArg = { key: string; label: string; month?: string; granularity?: Granularity };

const MUTED = 'var(--fg-3)';
const GRID = 'var(--glass-border)';
const FG2 = 'var(--fg-2)';
const AMBER = '#f5b14a';
const TEAL = 'var(--accent)';
const MONO = 'var(--font-mono, "JetBrains Mono", monospace)';

type SeriesDef = { id: string; label: string; color: string; field: keyof QualityWeek; traceKey: string; bar: boolean };
const HOURS_SERIES: SeriesDef[] = [
  { id: 'ex', label: 'Execution', color: '#4f9cf9', field: 'ex_hours', traceKey: 'ex_hours', bar: true },
  { id: 'qc', label: 'QC', color: TEAL, field: 'qc_hours', traceKey: 'qc_hours', bar: true },
  { id: 'cr', label: 'Rework', color: '#e5484d', field: 'rework_hours', traceKey: 'rework_hours', bar: true },
  { id: 'sc', label: 'Setup', color: '#a855f7', field: 'sc_hours', traceKey: 'sc_hours', bar: true },
  { id: 'other', label: 'Other', color: 'hsl(var(--foreground) / 0.4)', field: 'other_hours', traceKey: 'other_hours', bar: true },
];
const RATIO_SERIES: SeriesDef[] = [
  { id: 'qcr', label: 'QC ratio %', color: TEAL, field: 'qc_ratio_pct', traceKey: 'qc_ratio', bar: false },
  { id: 'rwr', label: 'Rework ratio %', color: '#e5484d', field: 'rework_ratio_pct', traceKey: 'rework_ratio', bar: false },
];
const DEFECT_SERIES: SeriesDef[] = [
  { id: 'found', label: 'Defects found', color: '#f97316', field: 'defects_found', traceKey: 'qc_logs_created', bar: true },
  { id: 'open', label: 'Defects open', color: '#e5484d', field: 'defects_open', traceKey: 'defects_open', bar: false },
];

const hrsFmt = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${Math.round(v)}`);
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
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const linePath = (pts: Array<[number, number]>) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--glass-border)', borderRadius: 6, overflow: 'hidden' }}>
      {options.map((o) => (
        <button key={o.v} aria-pressed={value === o.v} onClick={() => onChange(o.v)} style={{ padding: '4px 11px', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: value === o.v ? TEAL : 'transparent', color: value === o.v ? '#0a0b0c' : FG2, fontWeight: value === o.v ? 600 : 500 }}>{o.label}</button>
      ))}
    </div>
  );
}
function Chip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button aria-pressed={on} onClick={onClick} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer', border: `1px solid ${on ? 'color-mix(in oklab, var(--accent) 55%, transparent)' : 'var(--glass-border)'}`, background: on ? 'color-mix(in oklab, var(--accent) 14%, transparent)' : 'transparent', color: on ? TEAL : FG2 }}>{label}</button>
  );
}

/** Re-bucket weekly rows into months (additive fields; ratios recomputed). */
function toMonths(weekly: QualityWeek[]): QualityWeek[] {
  const m = new Map<string, QualityWeek>();
  for (const w of weekly) {
    const key = `${w.week.slice(0, 7)}-01`;
    const cur = m.get(key) ?? { week: key, ex_hours: 0, qc_hours: 0, rework_hours: 0, sc_hours: 0, other_hours: 0, qc_ratio_pct: 0, rework_ratio_pct: 0, defects_found: 0, defects_open: 0, qc_logs_created: 0 };
    cur.ex_hours += w.ex_hours; cur.qc_hours += w.qc_hours; cur.rework_hours += w.rework_hours; cur.sc_hours += w.sc_hours; cur.other_hours += w.other_hours;
    cur.defects_found += w.defects_found; cur.defects_open = Math.max(cur.defects_open, w.defects_open); cur.qc_logs_created += w.qc_logs_created;
    m.set(key, cur);
  }
  for (const c of m.values()) {
    const total = c.ex_hours + c.qc_hours + c.rework_hours + c.sc_hours + c.other_hours;
    c.qc_ratio_pct = c.ex_hours > 0 ? Math.round((c.qc_hours / c.ex_hours) * 1000) / 10 : 0;
    c.rework_ratio_pct = total > 0 ? Math.round((c.rework_hours / total) * 1000) / 10 : 0;
  }
  return [...m.values()].sort((a, b) => a.week.localeCompare(b.week));
}

export default function QualityChart({ weekly, qmpDates, todayIso, onTrace }: {
  weekly: QualityWeek[];
  qmpDates: string[];
  todayIso: string;
  onTrace: (a: QualityTraceArg) => void;
}) {
  const [mode, setMode] = useState<Mode>('hours');
  const [view, setView] = useState<View>('period');
  const [type, setType] = useState<ChartType>('bars');
  const [granularity, setGranularity] = useState<Granularity>('week');
  const [smooth, setSmooth] = useState(true);
  const [markers, setMarkers] = useState(false);
  const [showToday, setShowToday] = useState(true);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(760);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver((e) => { const cw = e[0]?.contentRect.width; if (cw) setW(Math.max(360, cw)); });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const seriesDefs = mode === 'hours' ? HOURS_SERIES : mode === 'ratios' ? RATIO_SERIES : DEFECT_SERIES;
  const isHours = mode === 'hours';
  const isRatio = mode === 'ratios';
  const stackable = isHours;            // only the charge-code mix stacks
  const effType: ChartType = isRatio ? 'lines' : type;
  const effView: View = isRatio ? 'period' : view;
  const unit = isHours ? 'h' : isRatio ? '%' : '';

  const rows = useMemo(() => (granularity === 'month' ? toMonths(weekly) : weekly), [weekly, granularity]);
  const vis = (id: string) => !hidden.has(id);
  const toggle = (id: string) => setHidden((h) => { const n = new Set(h); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const visDefs = seriesDefs.filter((s) => vis(s.id));

  // value per row per series (cumulative for additive modes when view=cum)
  const data = useMemo(() => {
    const run = new Map<string, number>();
    return rows.map((r) => {
      const vals = new Map<string, number>();
      let stackTotal = 0;
      for (const s of seriesDefs) {
        const raw = Number(r[s.field]) || 0;
        const acc = (!isRatio && effView === 'cumulative') ? (run.get(s.id) ?? 0) + raw : raw;
        if (!isRatio && effView === 'cumulative') run.set(s.id, acc);
        vals.set(s.id, acc);
        if (vis(s.id) && stackable) stackTotal += acc;
      }
      return { week: r.week, vals, stackTotal };
    });
  }, [rows, seriesDefs, isRatio, effView, hidden, stackable]);

  const H = 340;
  const m = { top: 18, right: 16, bottom: 46, left: 52 };
  const plotW = Math.max(1, w - m.left - m.right);
  const plotH = H - m.top - m.bottom;
  const n = data.length || 1;
  const slot = plotW / n;
  const cx = (i: number) => m.left + slot * i + slot / 2;

  const maxVal = useMemo(() => {
    let mx = 1;
    if (stackable && effType === 'bars') { for (const d of data) mx = Math.max(mx, d.stackTotal); }
    else { for (const d of data) for (const s of visDefs) mx = Math.max(mx, d.vals.get(s.id) ?? 0); }
    return niceMax(mx);
  }, [data, visDefs, stackable, effType]);
  const yVal = (v: number) => m.top + plotH - (v / maxVal) * plotH;
  const gridVals = Array.from({ length: 5 }, (_, i) => (maxVal / 4) * i);

  const periodIdx = (iso: string) => {
    if (!iso) return -1;
    for (let i = 0; i < data.length; i++) { const s = data[i].week; const e = data[i + 1]?.week ?? '9999-12-31'; if (iso >= s && iso < e) return i; }
    return -1;
  };
  const todayIdx = useMemo(() => periodIdx(todayIso || new Date().toISOString().slice(0, 10)), [data, todayIso]);
  const qmpIdxs = useMemo(() => (qmpDates || []).map(periodIdx).filter((i) => i >= 0), [data, qmpDates]);

  const hd = hover != null ? data[hover] : null;
  const tipLeft = hover != null ? Math.min(Math.max(cx(hover) - 100, 4), w - 210) : 0;
  const linePts = (id: string) => data.map((d, i) => [cx(i), yVal(d.vals.get(id) ?? 0)] as [number, number]);
  const pathFor = (pts: Array<[number, number]>) => (smooth ? smoothPath(pts) : linePath(pts));
  const fire = (s: SeriesDef, week: string) => onTrace({ key: s.traceKey, label: `${s.label} · ${periodLabel(week, granularity)}`, month: week, granularity });

  return (
    <section style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg, 14px)', background: 'var(--glass-bg, hsl(var(--foreground) / 0.04))', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>
          {isHours ? 'Charge-code hours over time' : isRatio ? 'QC + rework ratios over time' : 'Defects over time'}
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Seg<Mode> value={mode} options={[{ v: 'hours', label: 'Hours' }, { v: 'ratios', label: 'Ratios' }, { v: 'defects', label: 'Defects' }]} onChange={setMode} />
          {!isRatio && <Seg<ChartType> value={type} options={[{ v: 'bars', label: 'Bars' }, { v: 'lines', label: 'Lines' }]} onChange={setType} />}
          {effType === 'lines' && <Chip on={smooth} label="Smooth" onClick={() => setSmooth((s) => !s)} />}
          {effType === 'lines' && <Chip on={markers} label="Markers" onClick={() => setMarkers((s) => !s)} />}
          <Chip on={showToday} label="Today" onClick={() => setShowToday((s) => !s)} />
          {!isRatio && <Seg<View> value={view} options={[{ v: 'period', label: 'Period' }, { v: 'cumulative', label: 'Cum.' }]} onChange={setView} />}
          <Seg<Granularity> value={granularity} options={[{ v: 'month', label: 'Month' }, { v: 'week', label: 'Week' }]} onChange={setGranularity} />
        </div>
      </div>

      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {seriesDefs.map((s) => {
          const off = !vis(s.id);
          return (
            <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => toggle(s.id)} title="Show / hide" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: off ? 0.4 : 1 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                <span style={{ fontSize: 12, color: FG2, textDecoration: off ? 'line-through' : 'none' }}>{s.label}</span>
              </button>
            </span>
          );
        })}
      </div>

      <div ref={wrapRef} style={{ position: 'relative', padding: '4px 0' }}>
        <svg width={w} height={H} style={{ display: 'block' }} onMouseLeave={() => setHover(null)}>
          {gridVals.map((v, i) => (
            <g key={i}>
              <line x1={m.left} x2={m.left + plotW} y1={yVal(v)} y2={yVal(v)} stroke={GRID} />
              <text x={m.left - 8} y={yVal(v) + 3} textAnchor="end" fontFamily={MONO} fontSize={10} fill={MUTED}>{isRatio ? `${Math.round(v)}%` : hrsFmt(v)}</text>
            </g>
          ))}
          {hover != null && <rect x={m.left + slot * hover} y={m.top} width={slot} height={plotH} fill="color-mix(in oklab, var(--accent) 6%, transparent)" />}

          {/* QMP upload markers */}
          {qmpIdxs.map((i, k) => (
            <line key={`qmp${k}`} x1={cx(i)} x2={cx(i)} y1={m.top} y2={m.top + plotH} stroke={TEAL} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
          ))}
          {showToday && todayIdx >= 0 && (
            <g>
              <line x1={cx(todayIdx)} x2={cx(todayIdx)} y1={m.top} y2={m.top + plotH} stroke={AMBER} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
              <text x={cx(todayIdx)} y={m.top - 5} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={AMBER}>today</text>
            </g>
          )}

          {data.map((d, i) => <rect key={`hit-${i}`} x={m.left + slot * i} y={m.top} width={slot} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} />)}

          {effType === 'bars' ? (
            data.map((d, i) => {
              const bw = Math.min(slot * (stackable ? 0.66 : 0.5), 42);
              const base = m.top + plotH;
              let acc = 0;
              return (
                <g key={d.week}>
                  {visDefs.map((s, si) => {
                    const v = d.vals.get(s.id) ?? 0;
                    if (v <= 0) return null;
                    const h = (v / maxVal) * plotH;
                    const grouped = !stackable;
                    const gw = grouped ? bw / Math.max(1, visDefs.length) : bw;
                    const x = grouped ? cx(i) - bw / 2 + si * gw : cx(i) - bw / 2;
                    const y = stackable ? base - acc - h : base - h;
                    if (stackable) acc += h;
                    return (
                      <rect key={s.id} x={x} y={y} width={Math.max(1, gw - (grouped ? 1 : 0))} height={Math.max(0, h)} fill={s.color} style={{ cursor: 'pointer' }} onClick={() => fire(s, d.week)}>
                        <title>{s.label}: {isHours ? `${hrsFmt(v)} h` : v}</title>
                      </rect>
                    );
                  })}
                </g>
              );
            })
          ) : (
            <>
              {visDefs.map((s) => (
                <path key={s.id} d={pathFor(linePts(s.id))} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {markers && visDefs.map((s) => data.map((d, i) => {
                const v = d.vals.get(s.id) ?? 0;
                return v > 0 ? <circle key={`${s.id}-${i}`} cx={cx(i)} cy={yVal(v)} r={2.5} fill={s.color} style={{ cursor: 'pointer' }} onClick={() => fire(s, d.week)} /> : null;
              }))}
            </>
          )}

          {data.map((d, i) => (n <= 14 || i % Math.ceil(n / 14) === 0) ? (
            <text key={`x${i}`} x={cx(i)} y={H - 26} textAnchor="middle" fontFamily={MONO} fontSize={10} fill={TEAL} style={{ cursor: 'pointer' }}
              onClick={() => onTrace({ key: isRatio ? 'qc_ratio' : isHours ? 'qc_hours' : 'qc_logs_created', label: `Week of ${periodLabel(d.week, granularity)}`, month: d.week, granularity })}>
              {periodLabel(d.week, granularity)}
            </text>
          ) : null)}
        </svg>

        {hd && (
          <div style={{ position: 'absolute', top: 8, left: tipLeft, width: 206, pointerEvents: 'none', background: 'var(--glass-bg-solid)', backdropFilter: 'blur(18px)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', zIndex: 5 }}>
            <div style={{ fontSize: 11, color: FG2, marginBottom: 6 }}>{periodLabel(hd.week, granularity)}{effView === 'cumulative' ? ' · cum.' : ''}</div>
            {visDefs.map((s) => {
              const v = hd.vals.get(s.id) ?? 0;
              if (v <= 0) return null;
              return <TipRow key={s.id} color={s.color} label={s.label} value={isHours ? `${hrsFmt(v)} h` : isRatio ? `${v.toFixed(1)}%` : `${v}`} />;
            })}
            {stackable && (
              <>
                <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />
                <TipRow color="hsl(var(--foreground) / 0.85)" label="Total" value={`${hrsFmt(hd.stackTotal)} h`} />
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
      <span style={{ fontFamily: MONO, fontSize: 11, color: 'hsl(var(--foreground) / 0.96)', flexShrink: 0 }}>{value}</span>
    </div>
  );
}
