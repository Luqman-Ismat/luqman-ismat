

export type WbsKind = 'unit' | 'phase' | 'task' | 'sub_task';

export interface WbsItemLite {
  id: string;
  name: string;
  wbs_code: string | null;
  kind: WbsKind;

  start: string | null;

  finish: string | null;
  percent_complete: number;
}

export interface ItemChange {
  id: string;
  name: string;
  wbs_code: string | null;
  kind: WbsKind;
  fields: string[];
  renamedFrom?: string;
  start_shift_days: number;
  finish_shift_days: number;
  progress_delta: number;
  significance: number;
}

export interface WbsDiff {
  hasPrevious: boolean;
  summary: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
    project_finish_shift_days: number;
    prev_project_finish: string | null;
    curr_project_finish: string | null;
  };
  added: WbsItemLite[];
  removed: WbsItemLite[];
  changed: ItemChange[];
  topChanges: ItemChange[];
}

type Raw = Record<string, unknown>;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return v == null ? '' : String(v).trim();
}

function isoDate(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}


function dayDiff(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return 0;
  return Math.round((db - da) / 86_400_000);
}

function toLite(row: Raw, kind: WbsKind): WbsItemLite {
  return {
    id: str(row.id),
    name: str(row.name),
    wbs_code: str(row.wbs_code) || null,
    kind,
    // The current schedule lives on actual_* (the parser fills actual_end
    // from the live finish date when a task has not actually finished).
    // Fall back to baseline_* only when actual is absent.
    start: isoDate(row.actual_start) ?? isoDate(row.baseline_start),
    finish: isoDate(row.actual_end) ?? isoDate(row.baseline_end),
    percent_complete: num(row.percent_complete ?? row.progress),
  };
}


export interface WbsTree {
  units?: Raw[];
  phases?: Raw[];
  tasks?: Raw[];
  sub_tasks?: Raw[];
}


export function flattenTree(tree: WbsTree | null | undefined): WbsItemLite[] {
  if (!tree) return [];
  const out: WbsItemLite[] = [];
  for (const r of tree.units ?? []) out.push(toLite(r as Raw, 'unit'));
  for (const r of tree.phases ?? []) out.push(toLite(r as Raw, 'phase'));
  for (const r of tree.tasks ?? []) out.push(toLite(r as Raw, 'task'));
  for (const r of tree.sub_tasks ?? []) out.push(toLite(r as Raw, 'sub_task'));
  return out.filter((i) => i.id);
}


function matchKeys(item: WbsItemLite): string[] {
  const keys: string[] = [];
  if (item.wbs_code) keys.push(`${item.kind}:wbs:${item.wbs_code}`);
  if (item.id) keys.push(`${item.kind}:id:${item.id}`);
  return keys;
}

function latestFinish(items: WbsItemLite[]): string | null {
  let max: string | null = null;
  for (const it of items) {
    if (it.finish && (!max || it.finish > max)) max = it.finish;
  }
  return max;
}


function significance(c: Omit<ItemChange, 'significance'>): number {
  return (
    Math.abs(c.finish_shift_days) * 3 +
    Math.abs(c.start_shift_days) * 1.5 +
    Math.abs(c.progress_delta) * 0.3 +
    (c.fields.includes('name') ? 5 : 0)
  );
}

export function buildWbsDiff(
  prev: WbsTree | null | undefined,
  curr: WbsTree | null | undefined,
): WbsDiff {
  const prevItems = flattenTree(prev);
  const currItems = flattenTree(curr);
  const hasPrevious = prevItems.length > 0;

  const prevByKey = new Map<string, WbsItemLite>();
  for (const it of prevItems) {
    for (const k of matchKeys(it)) {
      if (!prevByKey.has(k)) prevByKey.set(k, it);
    }
  }

  const matchedPrevIds = new Set<string>();
  const added: WbsItemLite[] = [];
  const changed: ItemChange[] = [];
  let unchanged = 0;

  for (const cur of currItems) {
    let prevMatch: WbsItemLite | undefined;
    for (const k of matchKeys(cur)) {
      const hit = prevByKey.get(k);
      if (hit && !matchedPrevIds.has(hit.id)) {
        prevMatch = hit;
        break;
      }
    }

    if (!prevMatch) {
      added.push(cur);
      continue;
    }
    matchedPrevIds.add(prevMatch.id);

    const startShift = dayDiff(prevMatch.start, cur.start);
    const finishShift = dayDiff(prevMatch.finish, cur.finish);
    const pDelta = cur.percent_complete - prevMatch.percent_complete;

    const fields: string[] = [];
    if (cur.name !== prevMatch.name) fields.push('name');
    if (startShift !== 0) fields.push('start');
    if (finishShift !== 0) fields.push('finish');
    if (Math.abs(pDelta) > 0.01) fields.push('percent_complete');

    if (fields.length === 0) {
      unchanged++;
      continue;
    }

    const partial: Omit<ItemChange, 'significance'> = {
      id: cur.id,
      name: cur.name,
      wbs_code: cur.wbs_code,
      kind: cur.kind,
      fields,
      renamedFrom: fields.includes('name') ? prevMatch.name : undefined,
      start_shift_days: startShift,
      finish_shift_days: finishShift,
      progress_delta: Math.round(pDelta * 100) / 100,
    };
    changed.push({ ...partial, significance: significance(partial) });
  }

  const removed = prevItems.filter((it) => !matchedPrevIds.has(it.id));

  const prevFinish = latestFinish(prevItems);
  const currFinish = latestFinish(currItems);

  const topChanges = [...changed]
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 12);

  return {
    hasPrevious,
    summary: {
      added: added.length,
      removed: removed.length,
      changed: changed.length,
      unchanged,
      project_finish_shift_days: dayDiff(prevFinish, currFinish),
      prev_project_finish: prevFinish,
      curr_project_finish: currFinish,
    },
    added,
    removed,
    changed,
    topChanges,
  };
}
