'use client';
/**
 * WBS tree column definitions. Each column has a key, header, default width,
 * align, render fn, and a `defaultVisible` flag (so the user can show/hide
 * less-used columns from a Columns dropdown without losing their settings).
 *
 * Mirrors the legacy `lib/wbs-columns.tsx` field set as closely as the v3 schema
 * permits — see comments per column for legacy → v3 mapping.
 */
import type { ReactNode } from 'react';

export type WbsRowLite = {
  id: string;
  parent_id: string | null;
  type: 'portfolio' | 'customer' | 'site' | 'project' | 'unit' | 'phase' | 'task' | 'sub_task';
  level: number;
  /** Real tree depth (post wbs_code re-parenting); drives indentation. Falls back to level. */
  depth?: number;
  name: string;
  has_children: boolean;
  start_date: string | null;
  end_date: string | null;
  baseline_start: string | null;
  baseline_end: string | null;
  days_required: number;
  baseline_hours: number;
  actual_hours: number;
  remaining_hours: number;
  total_hours: number;
  baseline_cost: number;
  actual_cost: number;
  remaining_cost: number;
  schedule_cost: number;
  percent_complete: number;
  is_critical: boolean;
  is_milestone: boolean;
  total_float: number;
  resource: string | null;
  predecessor_task_id: string | null;
  predecessor_name: string | null;
  relationship: string | null;
  lag_days: number;
  comments: string | null;
  /** Rolled-up count of milestones in this row's subtree (incl. self if milestone). */
  milestone_count: number;
  wbs_code: string | null;
  baseline_count: number;
  baseline_metric: string | null;
  baseline_uom: string | null;
  actual_count: number;
  actual_metric: string | null;
  actual_uom: string | null;
  completed_count: number;
  projected_finish: string | null;
  /** Set client-side when a resourcing-scenario overlay adjusted this row. */
  _scenario_adjusted?: boolean;
};

export type WbsCol = {
  key: string;
  header: string;
  width: number;
  minWidth: number;
  align?: 'left' | 'right';
  defaultVisible: boolean;
  cell: (r: WbsRowLite) => ReactNode;
};

const TYPE_GLYPH: Record<WbsRowLite['type'], string> = {
  portfolio: '◉', customer: '◎', site: '◇', project: '⬢',
  unit: '▣', phase: '▤', task: '▪', sub_task: '▫',
};

const TYPE_COLOR: Record<WbsRowLite['type'], string> = {
  portfolio: '#7c92ff', customer: '#9b8cff', site: '#c08cff',
  project: '#2ec4b6',  unit: '#b7d336',     phase: '#5fd1d8',
  task: '#7adc8e',     sub_task: '#cfd6e3',
};

function fmtNum(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
function fmtMoney(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtDate(v: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString("en-US", {timeZone:"UTC"});
}

function num(value: number, money = false): ReactNode {
  if (!Number.isFinite(value) || value === 0) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
  return <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-2)' }}>{money ? fmtMoney(value) : fmtNum(value)}</span>;
}

export function makeWbsColumns(args: {
  toggle: (id: string) => void;
  expanded: Set<string>;
}): WbsCol[] {
  const { toggle, expanded } = args;
  return [
    {
      key: 'name', header: 'Name', width: 320, minWidth: 200, defaultVisible: true,
      cell: (r) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
          <span style={{ display: 'inline-block', width: (r.depth ?? r.level) * 14, flexShrink: 0 }} />
          {r.has_children ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggle(r.id); }}
              aria-label={expanded.has(r.id) ? 'Collapse' : 'Expand'}
              style={{ all: 'unset', cursor: 'pointer', width: 14, height: 14,
                fontSize: 10, color: 'var(--fg-3)', textAlign: 'center', flexShrink: 0 }}
            >{expanded.has(r.id) ? '▾' : '▸'}</button>
          ) : <span style={{ display: 'inline-block', width: 14, flexShrink: 0 }} />}
          {r.is_milestone ? (
            <span
              aria-hidden
              title="Milestone"
              style={{
                display: 'inline-block', width: 8, height: 8,
                background: 'var(--color-warning)',
                transform: 'rotate(45deg)',
                flexShrink: 0,
              }}
            />
          ) : (
            <span aria-hidden style={{ color: TYPE_COLOR[r.type], flexShrink: 0, fontSize: 11 }}>
              {TYPE_GLYPH[r.type]}
            </span>
          )}
          {r.is_critical && <span aria-hidden title="Critical" style={{ color: 'var(--color-error)', fontWeight: 600 }}>!</span>}
          <span title={r.name} style={{
            color: r.level <= 3 ? 'var(--fg-1)' : 'var(--fg-2)',
            fontWeight: r.level <= 3 ? 'var(--fw-medium)' : 'var(--fw-regular)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{r.name}</span>
        </span>
      ),
    },
    { key: 'milestones', header: 'MS', width: 64, minWidth: 56, align: 'right', defaultVisible: true,
      cell: (r) => {
        if (!r.milestone_count) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        return (
          <span title={`${r.milestone_count} milestone${r.milestone_count === 1 ? '' : 's'} under this row`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums', color: 'var(--fg-1)' }}>
            <span
              aria-hidden
              style={{
                display: 'inline-block', width: 7, height: 7,
                background: 'var(--color-warning)',
                transform: 'rotate(45deg)',
              }}
            />
            {r.milestone_count}
          </span>
        );
      } },
    { key: 'type', header: 'Type', width: 80, minWidth: 60, defaultVisible: true,
      cell: (r) => <span style={{ color: 'var(--fg-3)', textTransform: 'capitalize' }}>{r.type.replace('_', '-')}</span> },
    { key: 'resource', header: 'Resource', width: 140, minWidth: 80, defaultVisible: true,
      cell: (r) => <span style={{ color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.resource || '—'}</span> },
    { key: 'fte', header: 'FTE', width: 60, minWidth: 50, defaultVisible: false, align: 'right',
      cell: (r) => num(r.days_required > 0 ? r.baseline_hours / (r.days_required * 8) : 0) },
    { key: 'pct', header: '% Done', width: 70, minWidth: 56, align: 'right', defaultVisible: true,
      cell: (r) => <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-2)' }}>{Math.round(r.percent_complete)}%</span> },
    { key: 'days', header: 'Days', width: 56, minWidth: 50, align: 'right', defaultVisible: true,
      cell: (r) => num(r.days_required) },
    { key: 'baseline_start', header: 'BL Start', width: 96, minWidth: 80, defaultVisible: true,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{fmtDate(r.baseline_start)}</span> },
    { key: 'baseline_end', header: 'BL End', width: 96, minWidth: 80, defaultVisible: true,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{fmtDate(r.baseline_end)}</span> },
    { key: 'start', header: 'Start', width: 96, minWidth: 80, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{fmtDate(r.start_date)}</span> },
    { key: 'end', header: 'End', width: 96, minWidth: 80, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{fmtDate(r.end_date)}</span> },
    { key: 'proj_end', header: 'Proj End', width: 108, minWidth: 80, defaultVisible: false,
      cell: (r) => {
        if (r.percent_complete >= 100) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        // Prefer DB projected_finish from schedule engine; fall back to FTE-adjusted formula.
        let projMs: number;
        if (r.projected_finish) {
          projMs = new Date(r.projected_finish).getTime();
        } else {
          if (!(r.remaining_hours > 0)) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
          // Count resources (FTE) to adjust remaining duration.
          const fteCount = r.resource ? r.resource.split(',').map(s => s.trim()).filter(Boolean).length || 1 : 1;
          projMs = Date.now() + (r.remaining_hours / (fteCount * 8)) * 86_400_000;
        }
        const be = r.baseline_end ? new Date(r.baseline_end) : null;
        const slipDays = be ? Math.round((projMs - be.getTime()) / 86_400_000) : null;
        const color = slipDays == null ? 'var(--fg-3)'
          : slipDays <= 0 ? 'var(--color-success)'
          : slipDays <= 14 ? 'var(--color-warning)'
          : 'var(--color-error)';
        const projDate = new Date(projMs);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'rgba(139,92,246,0.9)', fontVariantNumeric: 'tabular-nums' }}>{fmtDate(projDate.toISOString().slice(0, 10))}</span>
            {slipDays !== null && <span style={{ fontSize: 10, color, fontWeight: 600 }}>{slipDays > 0 ? `+${slipDays}d` : slipDays < 0 ? `${slipDays}d` : '✓'}</span>}
          </span>
        );
      } },
    { key: 'baseline_hours', header: 'BL h', width: 70, minWidth: 60, align: 'right', defaultVisible: true,
      cell: (r) => num(r.baseline_hours) },
    { key: 'actual_hours', header: 'Act h', width: 70, minWidth: 60, align: 'right', defaultVisible: true,
      cell: (r) => num(r.actual_hours) },
    { key: 'remaining_hours', header: 'Rem h', width: 70, minWidth: 60, align: 'right', defaultVisible: true,
      cell: (r) => num(r.remaining_hours) },
    { key: 'total_hours', header: 'Total h', width: 80, minWidth: 60, align: 'right', defaultVisible: true,
      cell: (r) => num(r.total_hours) },
    { key: 'baseline_cost', header: 'BL $', width: 92, minWidth: 70, align: 'right', defaultVisible: true,
      cell: (r) => num(r.baseline_cost, true) },
    { key: 'actual_cost', header: 'Act $', width: 92, minWidth: 70, align: 'right', defaultVisible: true,
      cell: (r) => num(r.actual_cost, true) },
    { key: 'remaining_cost', header: 'Rem $', width: 92, minWidth: 70, align: 'right', defaultVisible: false,
      cell: (r) => num(r.remaining_cost, true) },
    { key: 'schedule_cost', header: 'Sched $', width: 96, minWidth: 70, align: 'right', defaultVisible: false,
      cell: (r) => num(r.schedule_cost, true) },
    { key: 'cost_eff', header: 'CPI', width: 60, minWidth: 50, align: 'right', defaultVisible: true,
      cell: (r) => {
        // CPI = BCWP / ACWP = (BAC × %complete) / actual_cost
        const pct = Math.max(0, Math.min(100, r.percent_complete)) / 100;
        const ev = r.baseline_cost * pct;
        if (!(r.actual_cost > 0 && ev > 0)) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const cpi = ev / r.actual_cost;
        const color = cpi < 0.9 ? 'var(--color-error)' : cpi > 1.1 ? 'var(--color-success)' : 'var(--fg-2)';
        return <span style={{ fontVariantNumeric: 'tabular-nums', color }} title={`EV $${Math.round(ev).toLocaleString()} / AC $${Math.round(r.actual_cost).toLocaleString()}`}>{cpi.toFixed(2)}</span>;
      } },
    { key: 'spi', header: 'SPI', width: 60, minWidth: 50, align: 'right', defaultVisible: true,
      cell: (r) => {
        // SPI = BCWP / BCWS = EV_hours / PV_hours
        // PV = baseline_hours × elapsed% where elapsed% = (today − baseline_start) / (baseline_end − baseline_start)
        const pct = Math.max(0, Math.min(100, r.percent_complete)) / 100;
        const ev = r.baseline_hours * pct; // earned hours
        const bs = r.baseline_start ? new Date(r.baseline_start).getTime() : null;
        const be = r.baseline_end ? new Date(r.baseline_end).getTime() : null;
        let pv = 0;
        if (bs && be && be > bs) {
          const elapsedPct = Math.min(1, Math.max(0, (Date.now() - bs) / (be - bs)));
          pv = r.baseline_hours * elapsedPct;
        }
        if (!(pv > 0 && ev >= 0)) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const spi = ev / pv;
        const color = spi < 0.9 ? 'var(--color-error)' : spi > 1.1 ? 'var(--color-success)' : 'var(--fg-2)';
        return <span style={{ fontVariantNumeric: 'tabular-nums', color }} title={`EV ${fmtNum(ev)}h / PV ${fmtNum(pv)}h`}>{spi.toFixed(2)}</span>;
      } },
    { key: 'hrs_var', header: 'Hrs Var', width: 76, minWidth: 60, align: 'right', defaultVisible: false,
      cell: (r) => {
        // Hours Variance = BCWP_h − ACWP_h = (baseline_hours × %complete) − actual_hours
        const pct = Math.max(0, Math.min(100, r.percent_complete)) / 100;
        const ev = r.baseline_hours * pct;
        if (!(r.actual_hours > 0 || ev > 0)) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const hv = ev - r.actual_hours;
        const color = hv < -8 ? 'var(--color-error)' : hv < 0 ? 'var(--color-warning)' : 'var(--color-success)';
        return <span style={{ fontVariantNumeric: 'tabular-nums', color }} title={`EV ${fmtNum(ev)}h − AC ${fmtNum(r.actual_hours)}h`}>{hv >= 0 ? '+' : ''}{fmtNum(hv)}h</span>;
      } },
    { key: 'cost_var', header: 'Cost Var', width: 88, minWidth: 70, align: 'right', defaultVisible: false,
      cell: (r) => {
        // Cost Variance = BCWP − ACWP = (baseline_cost × %complete) − actual_cost
        const pct = Math.max(0, Math.min(100, r.percent_complete)) / 100;
        const ev = r.baseline_cost * pct;
        if (!(r.actual_cost > 0 || ev > 0)) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const cv = ev - r.actual_cost;
        const color = cv < -1000 ? 'var(--color-error)' : cv < 0 ? 'var(--color-warning)' : 'var(--color-success)';
        return <span style={{ fontVariantNumeric: 'tabular-nums', color }} title={`EV $${Math.round(ev).toLocaleString()} − AC $${Math.round(r.actual_cost).toLocaleString()}`}>{cv >= 0 ? '+' : ''}${Math.round(Math.abs(cv)).toLocaleString()}{cv < 0 ? ' over' : ''}</span>;
      } },
    { key: 'tf', header: 'TF', width: 56, minWidth: 40, align: 'right', defaultVisible: true,
      cell: (r) => {
        // Show "—" only for non-task levels where TF is conceptually meaningless.
        if (r.type !== 'task' && r.type !== 'sub_task') return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const c = r.total_float <= 0 ? 'var(--color-error)' : r.total_float <= 5 ? 'var(--color-warning)' : 'var(--fg-2)';
        return <span style={{ fontVariantNumeric: 'tabular-nums', color: c }}>{r.total_float}d</span>;
      } },
    { key: 'pred', header: 'Pred', width: 110, minWidth: 80, defaultVisible: true,
      cell: (r) => <span style={{ color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} title={r.predecessor_name || ''}>{r.predecessor_name || '—'}</span> },
    { key: 'rel', header: 'Rel', width: 58, minWidth: 40, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{r.relationship || '—'}</span> },
    { key: 'lag', header: 'Lag', width: 60, minWidth: 50, align: 'right', defaultVisible: false,
      cell: (r) => r.lag_days ? <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-2)' }}>{r.lag_days}d</span> : <span style={{ color: 'var(--fg-3)' }}>—</span> },
    { key: 'comments', header: 'Comments', width: 220, minWidth: 80, defaultVisible: false,
      cell: (r) => <span title={r.comments || ''} style={{ color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.comments || '—'}</span> },
    { key: 'wbs_code', header: 'WBS', width: 110, minWidth: 60, defaultVisible: true,
      cell: (r) => <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{r.wbs_code || '—'}</span> },
    { key: 'cp', header: 'CP', width: 50, minWidth: 40, align: 'right', defaultVisible: false,
      cell: (r) => r.is_critical ? <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>CP</span> : <span style={{ color: 'var(--fg-3)' }}>—</span> },
    { key: 'eff_pct', header: 'Eff%', width: 60, minWidth: 50, align: 'right', defaultVisible: true,
      cell: (r) => {
        if (!r.baseline_hours || !r.actual_hours) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const eff = r.baseline_hours > 0 && r.actual_hours > 0 ? (r.baseline_hours / r.actual_hours) * 100 : 0;
        if (eff === 0) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const c = eff < 70 ? 'var(--color-error)' : eff < 90 ? 'var(--color-warning)' : 'var(--color-success)';
        return <span style={{ fontVariantNumeric: 'tabular-nums', color: c }}>{Math.round(eff)}%</span>;
      } },
    { key: 'baseline_count', header: 'BL Count', width: 84, minWidth: 60, align: 'right', defaultVisible: false,
      cell: (r) => num(r.baseline_count) },
    { key: 'baseline_metric', header: 'BL Metric', width: 110, minWidth: 70, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{r.baseline_metric || '—'}</span> },
    { key: 'baseline_uom', header: 'BL UOM', width: 80, minWidth: 60, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{r.baseline_uom || '—'}</span> },
    { key: 'actual_count', header: 'Act Count', width: 84, minWidth: 60, align: 'right', defaultVisible: false,
      cell: (r) => num(r.actual_count) },
    { key: 'actual_metric', header: 'Act Metric', width: 110, minWidth: 70, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{r.actual_metric || '—'}</span> },
    { key: 'actual_uom', header: 'Act UOM', width: 80, minWidth: 60, defaultVisible: false,
      cell: (r) => <span style={{ color: 'var(--fg-3)' }}>{r.actual_uom || '—'}</span> },
    { key: 'completed_count', header: 'Done Count', width: 96, minWidth: 70, align: 'right', defaultVisible: false,
      cell: (r) => num(r.completed_count) },
    { key: 'performing_metric', header: 'Perf', width: 70, minWidth: 56, align: 'right', defaultVisible: true,
      cell: (r) => {
        // Performing Metric = Actual Hours / (Actual Count − Done Count).
        // "Hours we've already burned for each work unit still on the floor."
        // Bigger = more hours hanging over remaining scope. Undefined when
        // there's no remaining count (we either finished, or there's no
        // count tracking on this row).
        const remaining = r.actual_count - r.completed_count;
        if (!(r.actual_hours > 0 && remaining > 0)) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
        const val = r.actual_hours / remaining;
        return <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--fg-2)' }} title={`${fmtNum(r.actual_hours)} h ÷ (${r.actual_count} − ${r.completed_count}) remaining`}>{fmtNum(val)}</span>;
      } },
  ];
}
