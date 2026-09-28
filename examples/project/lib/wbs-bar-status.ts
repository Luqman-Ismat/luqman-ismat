/**
 * Bar status — derived from a row's schedule + progress vs today.
 * Mirrors the legacy `lib/gantt-bar-status.ts` palette.
 */

export type BarStatus =
  | 'complete' | 'overdue' | 'not_started' | 'behind'
  | 'at_risk' | 'on_track' | 'ahead' | 'no_schedule';

export const BAR_COLOR: Record<BarStatus, string> = {
  complete:    '#10b981',
  overdue:     '#dc2626',
  not_started: '#475569',
  behind:      '#f97316',
  at_risk:     '#eab308',
  on_track:    '#22c55e',
  ahead:       '#34d399',
  no_schedule: '#6366f1',
};
export const BAR_LABEL: Record<BarStatus, string> = {
  complete: 'Complete', overdue: 'Overdue', not_started: 'Not started',
  behind: 'Behind', at_risk: 'At risk', on_track: 'On track',
  ahead: 'Ahead', no_schedule: 'No schedule',
};

const DAY_MS = 86_400_000;

export function getBarStatus(opts: {
  baseline_start: string | null;
  baseline_end: string | null;
  start_date: string | null;
  end_date: string | null;
  percent_complete: number;
  is_milestone?: boolean;
}): BarStatus {
  const pc = Number(opts.percent_complete) || 0;
  const today = Date.now();
  const bs = opts.baseline_start ? Date.parse(opts.baseline_start) : null;
  const be = opts.baseline_end   ? Date.parse(opts.baseline_end)   : null;
  const as = opts.start_date     ? Date.parse(opts.start_date)     : null;
  const ae = opts.end_date       ? Date.parse(opts.end_date)       : null;

  if (pc >= 100) return 'complete';
  if (!bs || !be) {
    if (!as || !ae) return 'no_schedule';
  }
  // Milestone: complete | overdue | at_risk | not_started.
  if (opts.is_milestone) {
    const date = bs ?? as;
    if (date == null) return 'no_schedule';
    if (date < today) return 'overdue';
    if (date - today < 7 * DAY_MS) return 'at_risk';
    return 'not_started';
  }
  // Bars.
  const start = bs ?? as!;
  const end   = be ?? ae!;
  const elapsed = today - start;
  const total = end - start;
  if (today > end && pc < 100) return 'overdue';
  if (today < start) return pc > 0 ? 'ahead' : 'not_started';
  const expected = total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;
  const drift = pc - expected;
  if (drift >= 5)  return 'ahead';
  if (drift >= -5) return 'on_track';
  if (drift >= -15) return 'at_risk';
  return 'behind';
}
