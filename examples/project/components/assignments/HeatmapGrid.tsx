'use client';
/**
 * HeatmapGrid — shared role × period grid for the By Role lens.
 *
 *   - granularity 'month' renders one cell per month directly from the source data.
 *   - granularity 'week' / 'day' takes the monthly source and inherits the
 *     parent month's value for each derived period (no over-precise spread —
 *     the underlying data is monthly).
 *
 *   - unit decides how the cell value is colored + formatted: 'hours' | 'fte' | 'pct'.
 *
 *   - syncId — when two HeatmapGrids share a syncId on the page, scrolling
 *     either one (vertical or horizontal) drives the other. Implemented with
 *     a registry keyed by id; uses the user-driven scroll only.
 */
import { useEffect, useRef, type ReactNode } from 'react';

export type Granularity = 'day' | 'week' | 'month';
export type HeatmapUnit = 'hours' | 'fte' | 'pct' | 'cost';

export type HeatmapCell = {
  value: number;
  /** ISO period start (YYYY-MM-DD). Always month-first in PR 3 source data. */
  period: string;
  tooltip?: string;
  badge?: string;
  /** Mark this cell as the row's projected-end period (last month with demand). */
  markEnd?: boolean;
};

export type HeatmapRow = {
  /** First column label, e.g. resource_type */
  label: string;
  cells: HeatmapCell[];
};

/* ── Cross-grid scroll-sync registry ─────────────────────────────────── */
type Scroller = { el: HTMLDivElement; suppress: number };
const SCROLL_REGISTRY = new Map<string, Set<Scroller>>();

function registerScroller(syncId: string, el: HTMLDivElement) {
  if (!SCROLL_REGISTRY.has(syncId)) SCROLL_REGISTRY.set(syncId, new Set());
  const entry: Scroller = { el, suppress: 0 };
  SCROLL_REGISTRY.get(syncId)!.add(entry);
  return () => { SCROLL_REGISTRY.get(syncId)?.delete(entry); };
}
function broadcastScroll(syncId: string, source: HTMLDivElement) {
  const set = SCROLL_REGISTRY.get(syncId);
  if (!set) return;
  for (const peer of set) {
    if (peer.el === source) continue;
    peer.suppress = 1;
    peer.el.scrollLeft = source.scrollLeft;
    peer.el.scrollTop  = source.scrollTop;
  }
}

export default function HeatmapGrid({
  rows, periods, mode, unit = 'fte',
  emptyMessage = 'No demand data available yet.',
  onCellClick, granularity = 'month',
  syncId,
}: {
  rows: HeatmapRow[];
  periods: string[];
  mode: 'demand' | 'allocated' | 'gap';
  unit?: HeatmapUnit;
  emptyMessage?: ReactNode;
  onCellClick?: (row: HeatmapRow, cell: HeatmapCell) => void;
  granularity?: Granularity;
  syncId?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!syncId || !scrollRef.current) return;
    const el = scrollRef.current;
    const unregister = registerScroller(syncId, el);
    let suppressTimer: ReturnType<typeof setTimeout> | null = null;
    function onScroll() {
      const set = SCROLL_REGISTRY.get(syncId!);
      if (!set) return;
      const me = Array.from(set).find((s) => s.el === el);
      if (me?.suppress) {
        me.suppress = 0;
        if (suppressTimer) clearTimeout(suppressTimer);
        suppressTimer = setTimeout(() => {}, 0);
        return;
      }
      broadcastScroll(syncId!, el);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      unregister();
      if (suppressTimer) clearTimeout(suppressTimer);
    };
  }, [syncId]);

  // For non-monthly granularity, derive the displayed periods + per-row cells
  // from the source month data. Source `cells` are 1:1 with `periods`.
  const view = granularity === 'month'
    ? { periods, rows }
    : deriveGranular(periods, rows, granularity);
  if (rows.length === 0) {
    return (
      <div className="ppm-hm-empty">{emptyMessage}</div>
    );
  }
  return (
    <div className="ppm-hm-wrap" ref={scrollRef}>
      <table className="ppm-hm" role="grid">
        <thead>
          <tr>
            <th className="ppm-hm-corner" />
            {view.periods.map((p) => (
              <th key={p} className="ppm-hm-period">{formatPeriod(p, granularity)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row) => (
            <tr key={row.label}>
              <th className="ppm-hm-row-label">{row.label}</th>
              {row.cells.map((c, i) => {
                const tone = toneFor(mode, unit, c.value);
                return (
                  <td
                    key={`${row.label}-${i}`}
                    className={`ppm-hm-cell tone-${tone}`}
                    title={c.markEnd ? `${c.tooltip || ''} · projected end — cumulative allocation covers total demand here` : (c.tooltip || `${row.label} · ${formatPeriod(c.period, granularity)}: ${formatValue(c.value, unit)}`)}
                    onClick={() => onCellClick?.(row, c)}
                    tabIndex={onCellClick ? 0 : undefined}
                    onKeyDown={e => { if(onCellClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onCellClick(row,c); } }}
                    style={{ cursor: onCellClick ? 'pointer' : 'default', boxShadow: c.markEnd ? 'inset 0 0 0 2px rgba(139,92,246,0.85)' : undefined }}
                  >
                    <span className="ppm-hm-cell-value">{formatValue(c.value, unit)}</span>
                    {c.markEnd && <span className="ppm-hm-cell-badge" title="Projected end" style={{ background: 'rgba(139,92,246,0.9)', color: '#fff' }}>⟂</span>}
                    {c.badge && !c.markEnd && <span className="ppm-hm-cell-badge">{c.badge}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Granularity derivation ───────────────────────────────────────────── */

function deriveGranular(periods: string[], rows: HeatmapRow[], granularity: Granularity): { periods: string[]; rows: HeatmapRow[] } {
  if (periods.length === 0) return { periods, rows };
  // Build a map: month-first → index
  const monthIdx = new Map<string, number>();
  periods.forEach((p, i) => monthIdx.set(p, i));

  const allDerived: string[] = [];
  // For each month, generate the days/weeks belonging to it (clamped to month boundaries)
  // and remember which derived period belongs to which source month.
  const sourceMonthFor: Map<string, string> = new Map();

  for (const monthStart of periods) {
    const start = parseISO(monthStart);
    if (!start) continue;
    const next = nextMonth(start);
    if (granularity === 'day') {
      for (let d = new Date(start); d < next; d = addDays(d, 1)) {
        const k = fmtISO(d);
        allDerived.push(k);
        sourceMonthFor.set(k, monthStart);
      }
    } else { // week — Mon-anchored ISO weeks, clamped per month
      const firstWeekStart = startOfWeek(start);
      let cur = firstWeekStart;
      while (cur < next) {
        const weekKey = fmtISO(cur < start ? start : cur);
        if (!sourceMonthFor.has(weekKey)) {
          allDerived.push(weekKey);
          sourceMonthFor.set(weekKey, monthStart);
        }
        cur = addDays(cur, 7);
      }
    }
  }

  const derivedRows: HeatmapRow[] = rows.map((r) => ({
    label: r.label,
    cells: allDerived.map((p) => {
      const month = sourceMonthFor.get(p)!;
      const idx = monthIdx.get(month);
      const monthCell = idx !== undefined ? r.cells[idx] : undefined;
      return {
        value: monthCell?.value ?? 0,
        period: p,
        tooltip: monthCell?.tooltip,
        badge: monthCell?.badge,
        markEnd: monthCell?.markEnd,
      };
    }),
  }));

  return { periods: allDerived, rows: derivedRows };
}

function parseISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}
function nextMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}
function addDays(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));
}
function startOfWeek(d: Date): Date {
  // Monday = 1
  const day = d.getUTCDay() || 7;
  return addDays(d, -(day - 1));
}
function fmtISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Tone classifier — interprets the cell value in context of the heatmap's mode
 * AND its unit. The two heatmaps share unit semantics so users can compare
 * apples-to-apples.
 *
 *   demand mode:    higher value = more demand. Color hotter as it grows.
 *   allocated mode: same direction — higher means heavier load.
 *   gap mode:       signed (capacity − allocated): positive bench (green), negative overload (red).
 */
function toneFor(mode: 'demand' | 'allocated' | 'gap', unit: HeatmapUnit, v: number): 'overload' | 'hot' | 'balanced' | 'bench' | 'short' {
  if (!Number.isFinite(v)) return 'balanced';
  if (mode === 'gap') {
    // Bench/overload framing.
    if (unit === 'pct') {
      if (v <= -50) return 'bench';
      if (v < 0)    return 'short';
      if (v < 25)   return 'balanced';
      if (v < 50)   return 'hot';
      return 'overload';
    }
    if (v <= -0.5 || v <= -100) return 'overload';
    if (v < 0)    return 'short';
    if (v <= 0.5) return 'balanced';
    return 'bench';
  }
  // demand / allocated — single-direction load.
  if (unit === 'pct') {
    if (v > 100)  return 'overload';
    if (v >= 85)  return 'hot';
    if (v >= 50)  return 'balanced';
    return 'bench';
  }
  if (unit === 'fte') {
    if (v > 5)    return 'overload';
    if (v > 2)    return 'hot';
    if (v > 0.5)  return 'balanced';
    if (v > 0)    return 'short';
    return 'bench';
  }
  if (unit === 'cost') {
    // $ thresholds — same shape as hours but at higher magnitudes.
    if (v > 200000) return 'overload';
    if (v > 80000)  return 'hot';
    if (v > 16000)  return 'balanced';
    if (v > 0)      return 'short';
    return 'bench';
  }
  // hours
  if (v > 1000) return 'overload';
  if (v > 400)  return 'hot';
  if (v > 80)   return 'balanced';
  if (v > 0)    return 'short';
  return 'bench';
}

function formatValue(v: number, unit: HeatmapUnit): string {
  if (!Number.isFinite(v)) return '—';
  if (unit === 'pct')   return `${Math.round(v)}%`;
  if (unit === 'fte')   return Math.round(v * 10) / 10 === 0 ? '0' : (Math.round(v * 10) / 10).toFixed(1);
  if (unit === 'cost') {
    if (!v) return '$0';
    if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000).toLocaleString()}k`;
    return `$${Math.round(v).toLocaleString()}`;
  }
  // hours
  if (v === 0) return '0';
  return Math.round(v).toLocaleString();
}

function formatPeriod(p: string, granularity: Granularity = 'month'): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(p);
  if (!m) return p;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (granularity === 'day') return `${months[Number(m[2]) - 1]} ${Number(m[3])}`;
  if (granularity === 'week') return `${months[Number(m[2]) - 1]} ${Number(m[3])}`;
  return `${months[Number(m[2]) - 1]} '${m[1].slice(2)}`;
}
