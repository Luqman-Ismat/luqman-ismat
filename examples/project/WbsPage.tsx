import { demoFetch as fetch } from "./data";
'use client';
/**
 * WBS Gantt — two synced panes, no AG Grid, no Konva.
 *
 *   ┌─ container (overflow: hidden, flex) ──────────────────────────────┐
 *   │ ┌─ tree pane ─┐ │ ┌─ timeline pane ──────────────────────────┐   │
 *   │ │ header      │ │ │ header (h-scrolls with body)             │   │
 *   │ │ ┌─ scroll ─┐│S││ ┌─ scroll: vertical + horizontal ────────┐ │   │
 *   │ │ │ rows     ││P││ │  bars + dependency arrows (one SVG)    │ │   │
 *   │ │ │ (resize  ││L││ │                                        │ │   │
 *   │ │ │ cols)    ││I││ │                                        │ │   │
 *   │ │ └──────────┘│T││ └────────────────────────────────────────┘ │   │
 *   │ └─────────────┘ │ │ status legend strip                       │   │
 *   │                 │ └──────────────────────────────────────────┘   │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 *   - Each pane has its own scroller; vertical scroll is mirrored both ways
 *     via onScroll handlers (with a small re-entrancy guard).
 *   - Tree column widths are individually resizable; pane-split is draggable.
 *   - All bars + dependency arrows render in ONE SVG (cheap at 10k+ rows).
 *   - Visible row range is computed from scrollTop ± OVERSCAN; only those rows
 *     mount in the DOM and only their bars draw.
 *   - "Today" button (and one-time auto-center on first paint) jumps the
 *     timeline to the current date.
 *   - Bar fill color reflects `BarStatus` (complete/overdue/behind/at-risk/...)
 *     using the legacy palette in `lib/wbs-bar-status.ts`.
 *   - Ancestor rows show hollow milestone diamonds for descendant milestones.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import FilterBar from '@project/components/ui/FilterBar';
import ActiveFiltersBar from '@project/components/ui/ActiveFiltersBar';
import EmptyState from '@project/components/ui/EmptyState';
import Skeleton from '@project/components/ui/Skeleton';
import Dropdown, { type Option } from '@project/components/ui/Dropdown';
import { useGlobalFilters, globalFiltersToQuery } from '@project/lib/global-filters';
import IETrigger from '@project/components/import-export/IETrigger';
import { makeWbsColumns, type WbsRowLite, type WbsCol } from '@project/lib/wbs-columns';
import { BAR_COLOR, BAR_LABEL, getBarStatus, type BarStatus } from '@project/lib/wbs-bar-status';

type Row = WbsRowLite;
type Zoom = 'day' | 'week' | 'month' | 'quarter' | 'year';

const ROW_H = 32;
const HEADER_H = 56;
const DAY_MS = 86_400_000;
const OVERSCAN = 14;
const SPLIT_HANDLE_W = 6;
const ZOOM_PX_PER_DAY: Record<Zoom, number> = {
  day: 28, week: 8, month: 2.4, quarter: 0.85, year: 0.24,
};
const TYPE_COLOR: Record<Row['type'], string> = {
  portfolio: '#7c92ff', customer: '#9b8cff', site: '#c08cff',
  project: '#2ec4b6',  unit: '#b7d336',     phase: '#5fd1d8',
  task: '#7adc8e',     sub_task: '#cfd6e3',
};

/* persistent state keys */
const LS_COLS    = 'portfolio.project.wbs.cols';
const LS_WIDTHS  = 'portfolio.project.wbs.colWidths';
const LS_SPLIT   = 'portfolio.project.wbs.split';

/* ---------- page -------------------------------------------------------- */

export default function WbsPage() {
  const { filters, isHydrated } = useGlobalFilters();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState<Zoom>('month');
  const [showBaseline, setShowBaseline] = useState(true);
  const [showProjected, setShowProjected] = useState(false);
  const [showDeps, setShowDeps] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'tasks' | 'phases' | 'milestones'>('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'not_started' | 'in_progress' | 'done'>('all');

  const [hover, setHover] = useState<{ rowIdx: number; row: Row; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  /* ----- resourcing scenario overlay (W5) ----- */
  type Scenario = { id: string; name: string; status: string };
  type TaskAdj = { start_date?: string; end_date?: string; remaining_hours?: number };
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioId, setScenarioId] = useState<string>('');
  const [scenarioAdj, setScenarioAdj] = useState<Record<string, TaskAdj>>({});
  useEffect(() => {
    fetch('/api/scenarios', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setScenarios(((j.scenarios || j.rows || []) as any[])
        .filter((s) => ['draft', 'submitted', 'accepted'].includes(s.status))
        .map((s) => ({ id: s.id, name: s.name, status: s.status }))))
      .catch(() => setScenarios([]));
  }, []);
  useEffect(() => {
    if (!scenarioId) { setScenarioAdj({}); return; }
    fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}/changes`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        const map: Record<string, TaskAdj> = {};
        for (const ch of (j.changes || [])) {
          if (ch.change_type !== 'adjust_task') continue;
          const tid = ch.payload?.task_id || ch.target_id_before;
          if (tid) map[String(tid)] = (ch.payload?.after || {}) as TaskAdj;
        }
        setScenarioAdj(map);
      })
      .catch(() => setScenarioAdj({}));
  }, [scenarioId]);

  /* persistent UI state */
  const [colVisible, setColVisible] = useState<Set<string>>(new Set());
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [splitPx, setSplitPx] = useState<number | null>(null);
  const [splitDragging, setSplitDragging] = useState(false);
  const [colDragging, setColDragging] = useState<string | null>(null);

  /* refs for scroll sync */
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const tlScrollRef = useRef<HTMLDivElement>(null);
  const tlHeaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<'tree' | 'tl' | null>(null);
  const hasAutoCenteredRef = useRef(false);

  /* viewport tracking */
  const [scrollTop, setScrollTop] = useState(0);
  const [containerH, setContainerH] = useState(600);
  const [containerW, setContainerW] = useState(1200);

  /* ----- toggle helper ----- */
  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ----- columns ----- */
  const allCols: WbsCol[] = useMemo(() => makeWbsColumns({ toggle, expanded }), [expanded]);

  /* hydrate persistent state once.
   * Important: union the user's saved set with current defaultVisible columns so
   * any newly-added defaults appear (without forcing the user to reset). */
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(LS_COLS) || 'null') as string[] | null;
      const defaults = new Set(allCols.filter((c) => c.defaultVisible).map((c) => c.key));
      if (v) {
        const merged = new Set<string>([...v, ...defaults]);
        setColVisible(merged);
      } else {
        setColVisible(defaults);
      }
      const w = JSON.parse(localStorage.getItem(LS_WIDTHS) || 'null');
      if (w) setColWidths(w);
      const s = Number(localStorage.getItem(LS_SPLIT));
      if (Number.isFinite(s) && s > 0) setSplitPx(s);
    } catch {
      setColVisible(new Set(allCols.filter((c) => c.defaultVisible).map((c) => c.key)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleCols = useMemo(
    () => allCols.filter((c) => colVisible.has(c.key)),
    [allCols, colVisible],
  );
  const treeContentW = useMemo(
    () => visibleCols.reduce((s, c) => s + (colWidths[c.key] ?? c.width), 0),
    [visibleCols, colWidths],
  );

  /* ----- fetch ----- */
  useEffect(() => {
    if (!isHydrated) return;
    setRows(null); setError(null); hasAutoCenteredRef.current = false;
    const qs = globalFiltersToQuery(filters);
    fetch(qs ? `/api/wbs?${qs}` : '/api/wbs', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error || 'wbs failed');
        setRows(j.rows || []);
        const next = new Set<string>();
        (j.rows as Row[]).forEach((r) => { if (r.level <= 2) next.add(r.id); });
        setExpanded(next);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [filters, isHydrated]);

  /* ----- container/viewport tracking ----- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      setContainerH(el.clientHeight);
      setContainerW(el.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ----- scenario overlay: clone leaf tasks with adjusted dates/remaining ----- */
  const effRows = useMemo(() => {
    if (!rows) return rows;
    if (!scenarioId || Object.keys(scenarioAdj).length === 0) return rows;
    return rows.map((r) => {
      if (r.type !== 'task') return r;
      const rawId = r.id.replace(/^task-/, '');
      const adj = scenarioAdj[rawId];
      if (!adj) return r;
      return {
        ...r,
        start_date: adj.start_date ?? r.start_date,
        end_date: adj.end_date ?? r.end_date,
        remaining_hours: adj.remaining_hours ?? r.remaining_hours,
        projected_finish: null, // recompute from the scenario's dates/remaining
        _scenario_adjusted: true,
      } as Row;
    });
  }, [rows, scenarioId, scenarioAdj]);

  /* ----- visible rows after expand/collapse + filters ----- */
  const visible = useMemo(() => {
    const rows = effRows;
    if (!rows) return [];
    const byParent = new Map<string | null, Row[]>();
    rows.forEach((r) => {
      const k = r.parent_id;
      if (!byParent.has(k)) byParent.set(k, []);
      byParent.get(k)!.push(r);
    });
    const q = search.trim().toLowerCase();
    function passType(r: Row): boolean {
      if (typeFilter === 'all') return true;
      if (typeFilter === 'tasks') return r.type === 'task' || r.type === 'sub_task';
      if (typeFilter === 'phases') return r.type === 'phase';
      if (typeFilter === 'milestones') return r.is_milestone;
      return true;
    }
    function passProgress(r: Row): boolean {
      if (progressFilter === 'all') return true;
      if (progressFilter === 'not_started') return r.percent_complete === 0;
      if (progressFilter === 'in_progress') return r.percent_complete > 0 && r.percent_complete < 100;
      if (progressFilter === 'done') return r.percent_complete >= 100;
      return true;
    }
    function passCritical(r: Row): boolean {
      if (!criticalOnly) return true;
      return r.is_critical || (r.percent_complete < 100 && r.total_float === 0);
    }
    function passSearch(r: Row): boolean {
      if (!q) return true;
      return r.name.toLowerCase().includes(q)
        || (r.resource || '').toLowerCase().includes(q)
        || (r.predecessor_name || '').toLowerCase().includes(q);
    }
    const out: Row[] = [];
    function walk(parent: string | null) {
      const children = byParent.get(parent) || [];
      for (const c of children) {
        if (passSearch(c) && passType(c) && passProgress(c) && passCritical(c)) out.push(c);
        if (c.has_children && expanded.has(c.id)) walk(c.id);
      }
    }
    walk(null);
    return out;
  }, [effRows, expanded, search, typeFilter, progressFilter, criticalOnly]);

  /* ----- projected end helper ----- */
  function projectedEnd(r: Row): number | null {
    if (r.percent_complete >= 100) return null;
    // Prefer DB-stored projected_finish from the schedule engine.
    if (r.projected_finish) {
      const ms = new Date(r.projected_finish).getTime();
      if (!Number.isNaN(ms)) return ms;
    }
    if (r.remaining_hours <= 0) return null;
    // Fall back: remaining_hours ÷ (FTE × 8 hrs/day).
    const fte = r.resource ? r.resource.split(',').map(s => s.trim()).filter(Boolean).length || 1 : 1;
    return Date.now() + (r.remaining_hours / (fte * 8)) * DAY_MS;
  }

  /* ----- ancestor milestone map ----- */
  /* ----- timeline window ----- */
  const window_ = useMemo(() => {
    const rows = effRows;
    if (!rows || rows.length === 0) return null;
    let minMs = Infinity, maxMs = -Infinity;
    rows.forEach((r) => {
      const s = r.baseline_start || r.start_date;
      const e = r.baseline_end || r.end_date;
      if (s) { const t = Date.parse(s); if (!Number.isNaN(t)) minMs = Math.min(minMs, t); }
      if (e) { const t = Date.parse(e); if (!Number.isNaN(t)) maxMs = Math.max(maxMs, t); }
      if (showProjected) {
        const pe = projectedEnd(r);
        if (pe != null) maxMs = Math.max(maxMs, pe);
      }
    });
    if (!Number.isFinite(minMs) || !Number.isFinite(maxMs) || maxMs <= minMs) return null;
    return { min: minMs - DAY_MS * 28, max: maxMs + DAY_MS * 28 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effRows, showProjected]);
  const pxPerDay = ZOOM_PX_PER_DAY[zoom];
  const totalDays = window_ ? Math.ceil((window_.max - window_.min) / DAY_MS) : 0;
  const timelineW = Math.max(800, totalDays * pxPerDay + 140);
  const xFor = (ms: number) => window_ ? ((ms - window_.min) / DAY_MS) * pxPerDay : 0;

  /* ----- virtualization window ----- */
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN);
  const endIdx = Math.min(visible.length, Math.ceil((scrollTop + containerH) / ROW_H) + OVERSCAN);
  const totalH = visible.length * ROW_H;
  const sliceVisible = visible.slice(startIdx, endIdx);

  /* index visible rows by raw task id (for dep arrows) */
  const visIdxByTaskId = useMemo(() => {
    const m = new Map<string, number>();
    visible.forEach((r, i) => {
      if (r.type === 'task') m.set(r.id.replace(/^task-/, ''), i);
    });
    return m;
  }, [visible]);

  /* ----- ticks ----- */
  const ticks = useMemo(() => buildTicks(window_, zoom, pxPerDay), [window_, zoom, pxPerDay]);

  /* ----- scroll sync ----- */
  function onTreeScroll(e: React.UIEvent<HTMLDivElement>) {
    if (syncingRef.current === 'tl') { syncingRef.current = null; return; }
    syncingRef.current = 'tree';
    const top = e.currentTarget.scrollTop;
    if (tlScrollRef.current && tlScrollRef.current.scrollTop !== top) {
      tlScrollRef.current.scrollTop = top;
    }
    setScrollTop(top);
  }
  function onTlScroll(e: React.UIEvent<HTMLDivElement>) {
    // Vertical sync (bidirectional).
    if (syncingRef.current !== 'tree') {
      syncingRef.current = 'tl';
      const top = e.currentTarget.scrollTop;
      if (treeScrollRef.current && treeScrollRef.current.scrollTop !== top) {
        treeScrollRef.current.scrollTop = top;
      }
      setScrollTop(top);
    } else {
      syncingRef.current = null;
    }
    // Horizontal: drive the header's translate.
    const left = e.currentTarget.scrollLeft;
    if (tlHeaderRef.current) tlHeaderRef.current.style.transform = `translateX(${-left}px)`;
  }

  /* ----- scroll-to-today ----- */
  function scrollToToday(behavior: ScrollBehavior = 'smooth') {
    const tl = tlScrollRef.current;
    if (!tl || !window_) return;
    const todayX = xFor(Date.now());
    const target = Math.max(0, todayX - tl.clientWidth / 2);
    tl.scrollTo({ left: target, behavior });
  }
  useLayoutEffect(() => {
    if (!rows || rows.length === 0 || hasAutoCenteredRef.current) return;
    requestAnimationFrame(() => {
      scrollToToday('auto');
      hasAutoCenteredRef.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, zoom]);

  /* ----- splitter drag ----- */
  useEffect(() => {
    if (!splitDragging) return;
    function move(e: MouseEvent) {
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const next = Math.max(280, Math.min(rect.width - 320, e.clientX - rect.left));
      setSplitPx(next);
    }
    function up() {
      setSplitDragging(false);
      if (splitPx != null) localStorage.setItem(LS_SPLIT, String(splitPx));
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [splitDragging, splitPx]);

  /* ----- column-resize drag ----- */
  useEffect(() => {
    if (!colDragging) return;
    const startX = (window as any).__ppmColStartX as number;
    const startW = (window as any).__ppmColStartW as number;
    function move(e: MouseEvent) {
      const col = allCols.find((c) => c.key === colDragging);
      const minW = col?.minWidth ?? 60;
      const next = Math.max(minW, startW + (e.clientX - startX));
      setColWidths((w) => ({ ...w, [colDragging!]: next }));
    }
    function up() {
      setColDragging(null);
      try { localStorage.setItem(LS_WIDTHS, JSON.stringify(colWidths)); } catch { /* ignore */ }
    }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [colDragging, colWidths, allCols]);

  function persistColVisible(next: Set<string>) {
    setColVisible(next);
    localStorage.setItem(LS_COLS, JSON.stringify(Array.from(next)));
  }

  /* ----- compute split ----- */
  const treeWidth = splitPx ?? Math.max(containerW < 700 ? 150 : 560, Math.min(treeContentW + 24, Math.floor(containerW * 0.45)));

  /* ----- render --------------------------------------------------------- */

  return (
    <main className="page-shell full">
      <ActiveFiltersBar />
      <div data-tour="wbs-toolbar">
      <FilterBar
        actions={
          <>
            <Dropdown width={140} placeholder="Type" value={typeFilter}
              onChange={(v) => setTypeFilter((v as any) || 'all')}
              options={[
                { value: 'all', label: 'All types' },
                { value: 'tasks', label: 'Tasks only' },
                { value: 'phases', label: 'Phases only' },
                { value: 'milestones', label: 'Milestones only' },
              ] as Option[]} />
            <Dropdown width={150} placeholder="Progress" value={progressFilter}
              onChange={(v) => setProgressFilter((v as any) || 'all')}
              options={[
                { value: 'all', label: 'All progress' },
                { value: 'not_started', label: 'Not started' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'done', label: 'Done' },
              ] as Option[]} />
            <Dropdown width={130} placeholder="Zoom" value={zoom}
              onChange={(v) => setZoom((v as Zoom) || 'month')}
              options={[
                { value: 'day', label: 'Days' },
                { value: 'week', label: 'Weeks' },
                { value: 'month', label: 'Months' },
                { value: 'quarter', label: 'Quarters' },
                { value: 'year', label: 'Years' },
              ] as Option[]} />
            {scenarios.length > 0 && (
              <Dropdown width={190} placeholder="Scenario overlay" value={scenarioId}
                onChange={(v) => setScenarioId(v || '')}
                options={[{ value: '', label: 'No scenario' }, ...scenarios.map((s) => ({ value: s.id, label: `${s.name} · ${s.status}` }))] as Option[]} />
            )}
            <button className="btn btn-ghost" onClick={() => scrollToToday('smooth')} title="Scroll to today">Today</button>
            <button className="btn btn-ghost" onClick={() => {
              if (!rows) return;
              const next = new Set<string>();
              rows.forEach((r) => { if (r.has_children && r.level <= 3) next.add(r.id); });
              setExpanded(next);
            }}>L3</button>
            <button className="btn btn-ghost" onClick={() => {
              if (!rows) return;
              const next = new Set<string>();
              rows.forEach((r) => { if (r.has_children) next.add(r.id); });
              setExpanded(next);
            }}>Expand</button>
            <button className="btn btn-ghost" onClick={() => setExpanded(new Set())}>Collapse</button>
            <Dropdown multi width={150} placeholder="Columns"
              value={Array.from(colVisible)}
              onChange={(v) => persistColVisible(new Set(v))}
              options={allCols.map((c) => ({ value: c.key, label: c.header })) as Option[]} />
            <label className="row" style={{ gap: 6, fontSize: 'var(--fs-sm)', color: 'var(--fg-2)' }}>
              <input type="checkbox" checked={showBaseline} onChange={(e) => setShowBaseline(e.target.checked)} /> Baseline
            </label>
            <label className="row" style={{ gap: 6, fontSize: 'var(--fs-sm)', color: 'var(--fg-2)' }}>
              <input type="checkbox" checked={showProjected} onChange={(e) => setShowProjected(e.target.checked)} /> Projected
            </label>
            <label className="row" style={{ gap: 6, fontSize: 'var(--fs-sm)', color: 'var(--fg-2)' }}>
              <input type="checkbox" checked={showDeps} onChange={(e) => setShowDeps(e.target.checked)} /> Deps
            </label>
            <label className="row" style={{ gap: 6, fontSize: 'var(--fs-sm)', color: 'var(--fg-2)' }}>
              <input type="checkbox" checked={criticalOnly} onChange={(e) => setCriticalOnly(e.target.checked)} /> Critical
            </label>
            <span className="t-small" style={{ color: 'var(--fg-3)' }}>{visible.length.toLocaleString()} rows</span>
          </>
        }
      >
        <input className="input" placeholder="Search WBS by name, resource, predecessor…"
          value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320, maxWidth: "100%" }} />
        <span className="t-small" style={{ color: 'var(--fg-3)' }}>
          Fictional schedule · local changes only
        </span>
        <IETrigger tableKey="wbs" canImport={false} canExport={true}
          filters={filters.projectId ? { projectId: filters.projectId } : {}} />
      </FilterBar>
      </div>

      {/* Bar status legend — always visible above the gantt. */}
      <div data-tour="wbs-legend" className="glass" style={{
        padding: '8px 12px', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        fontSize: 11, color: 'var(--fg-2)',
      }}>
        <span className="t-label" style={{ marginRight: 4 }}>Bar status</span>
        {(Object.keys(BAR_COLOR) as BarStatus[]).map((s) => (
          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ width: 14, height: 9, background: BAR_COLOR[s], borderRadius: 2, boxShadow: '0 0 0 1px rgba(0,0,0,0.4)' }} />
            <span>{BAR_LABEL[s]}</span>
          </span>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="9"><polygon points="9,1 17,4.5 9,8 1,4.5" fill="var(--color-warning)" /></svg>
          <span>Milestone</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 9, border: '1.5px solid var(--color-error)', borderRadius: 2 }} />
          <span>Critical path</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 9, border: '1.5px dashed rgba(139,92,246,0.65)', borderRadius: 2, background: 'rgba(139,92,246,0.08)' }} />
          <span>Projected end</span>
        </span>
      </div>

      {scenarioId && (
        <div className="glass" style={{
          padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: 'var(--fg-2)', borderLeft: '3px solid rgba(139,92,246,0.7)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(139,92,246,0.9)' }} />
          <span>Viewing scenario <b>{scenarios.find((s) => s.id === scenarioId)?.name || scenarioId}</b> — {Object.keys(scenarioAdj).length} task adjustment{Object.keys(scenarioAdj).length === 1 ? '' : 's'} overlaid. Dates and projected ends reflect the proposed schedule (not yet live).</span>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={() => setScenarioId('')}>Clear</button>
        </div>
      )}

      {error && <p className="t-small" style={{ color: 'var(--color-error)' }}>{error}</p>}

      {!rows ? (
        <Skeleton height={500} />
      ) : visible.length === 0 ? (
        <EmptyState title="No rows" body="Pick a project from ⌘K → Hierarchy filter, or check that the WBS tables are populated." />
      ) : (
        <div
          ref={containerRef}
          data-tour="wbs-gantt"
          className="glass"
          style={{
            position: 'relative', padding: 0,
            display: 'flex',
            height: 'calc(100vh - var(--nav-height) - 96px)',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden',
            userSelect: splitDragging || colDragging ? 'none' : 'auto',
            cursor: splitDragging ? 'col-resize' : (colDragging ? 'col-resize' : 'default'),
          }}
        >
          {/* ───── tree pane ────────────────────────────────────────────
               Single scroll container so the header scrolls horizontally
               with the body (sticky-top inside the same scroller) and
               vertical scroll syncs with the timeline pane via onScroll. */}
          <div
            ref={treeScrollRef}
            onScroll={onTreeScroll}
            style={{
              width: treeWidth, flexShrink: 0,
              overflow: 'auto', position: 'relative',
              height: '100%',
            }}
          >
            <div style={{ position: 'relative', width: treeContentW, minHeight: '100%' }}>
              {/* sticky-top header that scrolls horizontally with the body */}
              <div style={{
                position: 'sticky', top: 0, zIndex: 3,
                height: HEADER_H, width: treeContentW,
                background: 'hsl(var(--card) / 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'flex-end',
                fontSize: 11, color: 'var(--fg-3)',
                textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)',
              }}>
                {visibleCols.map((c) => {
                  const w = colWidths[c.key] ?? c.width;
                  return (
                    <div key={c.key} style={{
                      width: w, padding: '0 10px 8px', textAlign: c.align || 'left',
                      flexShrink: 0, position: 'relative', height: HEADER_H,
                      display: 'flex', alignItems: 'flex-end',
                    }}>
                      <span style={{ width: '100%', textAlign: c.align || 'left' }}>{c.header}</span>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          (window as any).__ppmColStartX = e.clientX;
                          (window as any).__ppmColStartW = w;
                          setColDragging(c.key);
                        }}
                        style={{
                          position: 'absolute', right: 0, top: 8, height: HEADER_H - 12,
                          width: 6, cursor: 'col-resize',
                          background: colDragging === c.key ? 'var(--accent)' : 'transparent',
                          opacity: colDragging === c.key ? 0.4 : 1,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-border-hover)'; }}
                        onMouseLeave={(e) => { if (colDragging !== c.key) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* body — absolute-positioned virtualized rows */}
              <div style={{ position: 'relative', width: treeContentW, height: totalH }}>
                {sliceVisible.map((r, i) => {
                  const idx = startIdx + i;
                  const isSelected = selected === r.id;
                  const isHovered = hover?.rowIdx === idx;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        if (r.has_children) toggle(r.id);
                        setSelected(r.id);
                      }}
                      style={{
                        position: 'absolute', top: idx * ROW_H, left: 0,
                        width: treeContentW, height: ROW_H,
                        display: 'flex', alignItems: 'center',
                        background: isSelected ? 'color-mix(in oklab, var(--accent) 8%, transparent)' : (r as any)._scenario_adjusted ? 'rgba(139,92,246,0.10)' : isHovered ? 'hsl(var(--foreground) / 0.025)' : 'transparent',
                        borderBottom: '1px solid hsl(var(--foreground) / 0.04)',
                        fontSize: 'var(--fs-sm)',
                        cursor: r.has_children ? 'pointer' : 'default',
                      }}
                    >
                      {visibleCols.map((c) => {
                        const w = colWidths[c.key] ?? c.width;
                        return (
                          <div key={c.key} style={{
                            width: w, padding: '0 10px',
                            textAlign: c.align || 'left',
                            flexShrink: 0, overflow: 'hidden',
                          }}>{c.cell(r)}</div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ───── splitter ───────────────────────────────────────────── */}
          <div
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onMouseDown={() => setSplitDragging(true)}
            style={{
              width: SPLIT_HANDLE_W, cursor: 'col-resize', flexShrink: 0,
              borderLeft: '1px solid var(--glass-border)',
              borderRight: '1px solid var(--glass-border)',
              background: splitDragging ? 'var(--accent)' : 'transparent',
              opacity: splitDragging ? 0.4 : 1,
              transition: 'background 80ms',
            }}
          />

          {/* ───── timeline pane ──────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* header strip — translateX'd to follow body's horizontal scroll */}
            <div style={{
              height: HEADER_H,
              background: 'hsl(var(--card) / 0.95)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--glass-border)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div ref={tlHeaderRef} style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform' }}>
                <svg width={timelineW} height={HEADER_H} style={{ display: 'block' }}>
                  <TimelineHeader ticks={ticks} width={timelineW} height={HEADER_H} />
                </svg>
              </div>
            </div>
            <div
              ref={tlScrollRef}
              onScroll={onTlScroll}
              style={{ flex: 1, overflow: 'auto', position: 'relative' }}
            >
              <div style={{ position: 'relative', width: timelineW, height: totalH }}>
                <svg width={timelineW} height={totalH} style={{ position: 'absolute', top: 0, left: 0 }}>
                  {/* sub guides */}
                  {ticks.sub.map((t, i) => (
                    <line key={`g-${i}`} x1={t.x} x2={t.x} y1={0} y2={totalH}
                          stroke="hsl(var(--foreground) / 0.04)" strokeWidth={1} />
                  ))}
                  {/* year boundary lines */}
                  {ticks.year.map((t, i) => (
                    <line key={`y-${i}`} x1={t.x} x2={t.x} y1={0} y2={totalH}
                          stroke="hsl(var(--foreground) / 0.10)" strokeWidth={1} />
                  ))}
                  {/* today line */}
                  {window_ && (() => {
                    const x = xFor(Date.now());
                    if (x < 0 || x > timelineW) return null;
                    return (
                      <line x1={x} x2={x} y1={0} y2={totalH}
                            stroke="color-mix(in oklab, var(--accent) 55%, transparent)" strokeDasharray="4 4" strokeWidth={1} />
                    );
                  })()}

                  <defs>
                    <marker id="dep-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--foreground) / 0.45)" />
                    </marker>
                    <marker id="dep-arrow-crit" viewBox="0 0 10 10" refX="9" refY="5"
                            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-error)" />
                    </marker>
                  </defs>

                  {/* Bars (visible window only). */}
                  {sliceVisible.map((r, i) => (
                    <BarRow key={r.id} row={r}
                            y={(startIdx + i) * ROW_H}
                            pxPerDay={pxPerDay}
                            window={window_}
                            showBaseline={showBaseline}
                            showProjected={showProjected}
                            projectedEndMs={projectedEnd(r)}
                            rowH={ROW_H}
                    />
                  ))}

                  {/* Dependency arrows. */}
                  {showDeps && window_ && (
                    sliceVisible.flatMap((r, i) => {
                      if (r.type !== 'task' || !r.predecessor_task_id) return [];
                      const fromIdx = visIdxByTaskId.get(r.predecessor_task_id);
                      if (fromIdx === undefined) return [];
                      const toIdx = startIdx + i;
                      return [<DependencyArrow
                        key={`${r.id}-${r.predecessor_task_id}`}
                        from={visible[fromIdx]} to={r}
                        fromY={fromIdx * ROW_H} toY={toIdx * ROW_H}
                        pxPerDay={pxPerDay} windowMin={window_.min} rowH={ROW_H}
                        critical={visible[fromIdx].is_critical || r.is_critical}
                      />];
                    })
                  )}
                </svg>

                {/* Per-row hover overlays — only the timeline body fires the
                    tooltip, never the tree (per spec). pointer-events: auto
                    on these divs only; SVG underneath is read-only. */}
                {sliceVisible.map((r, i) => {
                  const idx = startIdx + i;
                  return (
                    <div
                      key={`hover-${r.id}`}
                      onMouseEnter={() => setHover({ rowIdx: idx, row: r, y: idx * ROW_H })}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        position: 'absolute', top: idx * ROW_H, left: 0,
                        width: timelineW, height: ROW_H,
                        cursor: 'default',
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* hover tooltip — anchored to top-right of container */}
          {hover && window_ && (
            <BarTooltip row={hover.row} top={Math.min(containerH - 280, Math.max(8, hover.y - scrollTop + HEADER_H + 12))} projectedEndMs={projectedEnd(hover.row)} />
          )}
        </div>
      )}
    </main>
  );
}

/* ---------- subcomponents --------------------------------------------- */

function TimelineHeader({ ticks, width, height }: {
  ticks: { year: { x: number; label: string }[]; sub: { x: number; label: string }[] };
  width: number; height: number;
}) {
  const yBand = 24;
  return (
    <>
      <rect x={0} y={0} width={width} height={yBand} fill="hsl(var(--foreground) / 0.025)" />
      {ticks.year.map((t, i) => (
        <line key={`yl-${i}`} x1={t.x} x2={t.x} y1={0} y2={height}
              stroke="hsl(var(--foreground) / 0.10)" strokeWidth={1} />
      ))}
      {ticks.year.map((t, i) => (
        <text key={`yt-${i}`} x={t.x + 6} y={16} fontSize={11} fontFamily="Inter, system-ui"
              fontWeight={600} fill="hsl(var(--foreground) / 0.78)">{t.label}</text>
      ))}
      <line x1={0} x2={width} y1={yBand} y2={yBand} stroke="hsl(var(--foreground) / 0.08)" strokeWidth={1} />
      {ticks.sub.map((t, i) => (
        <line key={`sl-${i}`} x1={t.x} x2={t.x} y1={yBand} y2={height}
              stroke="hsl(var(--foreground) / 0.05)" strokeWidth={1} />
      ))}
      {ticks.sub.map((t, i) => (
        <text key={`st-${i}`} x={t.x + 4} y={yBand + 18} fontSize={10}
              fontFamily="Inter, system-ui" fill="hsl(var(--foreground) / 0.50)">{t.label}</text>
      ))}
      <line x1={0} x2={width} y1={height - 1} y2={height - 1}
            stroke="hsl(var(--foreground) / 0.10)" strokeWidth={1} />
    </>
  );
}

function BarRow({ row, y, pxPerDay, window: w, showBaseline, showProjected, projectedEndMs, rowH }: {
  row: Row; y: number; pxPerDay: number;
  window: { min: number; max: number } | null;
  showBaseline: boolean; showProjected: boolean; projectedEndMs: number | null; rowH: number;
}) {
  if (!w) return null;
  const win = w;
  const bs = row.baseline_start ? Date.parse(row.baseline_start) : null;
  const be = row.baseline_end ? Date.parse(row.baseline_end) : null;
  const as = row.start_date ? Date.parse(row.start_date) : null;
  const ae = row.end_date ? Date.parse(row.end_date) : null;
  const start = (as && !Number.isNaN(as)) ? as : bs;
  const end = (ae && !Number.isNaN(ae)) ? ae : be;
  const isMilestone = row.is_milestone || (bs && be && bs === be);
  const xFor = (ms: number) => ((ms - win.min) / DAY_MS) * pxPerDay;
  const status = getBarStatus({
    baseline_start: row.baseline_start, baseline_end: row.baseline_end,
    start_date: row.start_date, end_date: row.end_date,
    percent_complete: row.percent_complete, is_milestone: !!row.is_milestone,
  });
  const fill = BAR_COLOR[status];
  const typeColor = TYPE_COLOR[row.type];

  // Milestone diamond.
  if (isMilestone) {
    const x = xFor(bs ?? start ?? win.min);
    const cy = y + rowH / 2;
    const s = 7;
    return (
      <polygon
        points={`${x},${cy - s} ${x + s},${cy} ${x},${cy + s} ${x - s},${cy}`}
        fill={fill} stroke="rgba(0,0,0,0.5)" strokeWidth={1}
      />
    );
  }

  const projBarStart = end ?? Date.now();
  const projBarEnd = projectedEndMs;

  return (
    <g>
      {/* baseline rail */}
      {showBaseline && bs && be && be > bs && (
        <rect
          x={xFor(bs)} y={y + rowH * 0.18}
          width={Math.max(2, xFor(be) - xFor(bs))} height={rowH * 0.24}
          fill="hsl(var(--foreground) / 0.04)" stroke="hsl(var(--foreground) / 0.16)" strokeWidth={1}
          rx={3} ry={3}
        />
      )}
      {/* actual bar */}
      {start && end && end > start && (
        <>
          <rect
            x={xFor(start)} y={y + rowH * 0.5}
            width={Math.max(2, xFor(end) - xFor(start))} height={rowH * 0.36}
            fill={`${fill}22`} stroke={row.is_critical ? 'var(--color-error)' : `${fill}aa`}
            strokeWidth={row.is_critical ? 1.5 : 1}
            rx={3} ry={3}
          />
          {/* progress fill */}
          <rect
            x={xFor(start)} y={y + rowH * 0.5}
            width={Math.max(0, (xFor(end) - xFor(start)) * Math.min(1, Math.max(0, row.percent_complete / 100)))}
            height={rowH * 0.36}
            fill={fill} opacity={0.92}
            rx={3} ry={3}
          />
          {/* type-color dot at the start */}
          <circle cx={xFor(start)} cy={y + rowH * 0.5 + rowH * 0.18} r={2.5} fill={typeColor} />
        </>
      )}
      {/* projected end bar — dashed outline from today/end to projected finish */}
      {showProjected && projBarEnd && projBarEnd > projBarStart && (
        <rect
          x={xFor(projBarStart)} y={y + rowH * 0.5}
          width={Math.max(2, xFor(projBarEnd) - xFor(projBarStart))} height={rowH * 0.36}
          fill="rgba(139,92,246,0.08)"
          stroke="rgba(139,92,246,0.65)"
          strokeWidth={1}
          strokeDasharray="4 3"
          rx={3} ry={3}
        />
      )}
    </g>
  );
}

function DependencyArrow({ from, to, fromY, toY, pxPerDay, windowMin, rowH, critical }: {
  from: Row; to: Row; fromY: number; toY: number;
  pxPerDay: number; windowMin: number; rowH: number; critical: boolean;
}) {
  const xFor = (ms: number) => ((ms - windowMin) / DAY_MS) * pxPerDay;
  const fromEnd = (from.baseline_end ? Date.parse(from.baseline_end) : null)
                ?? (from.end_date ? Date.parse(from.end_date) : null);
  const toStart = (to.baseline_start ? Date.parse(to.baseline_start) : null)
                ?? (to.start_date ? Date.parse(to.start_date) : null);
  if (!fromEnd || !toStart || Number.isNaN(fromEnd) || Number.isNaN(toStart)) return null;
  const x1 = xFor(fromEnd);
  const y1 = fromY + rowH * 0.5 + rowH * 0.18;
  const x2 = xFor(toStart);
  const y2 = toY + rowH * 0.5 + rowH * 0.18;
  const isReverse = x2 < x1;
  const elbow = isReverse ? Math.max(12, x2 - 12) : Math.max(x1 + 8, x2 - 8);
  const path = isReverse
    ? `M ${x1} ${y1} L ${x1 + 10} ${y1} L ${x1 + 10} ${(y1 + y2) / 2} L ${elbow} ${(y1 + y2) / 2} L ${elbow} ${y2} L ${x2} ${y2}`
    : `M ${x1} ${y1} L ${elbow} ${y1} L ${elbow} ${y2} L ${x2} ${y2}`;
  return (
    <path d={path} fill="none"
          stroke={critical ? 'var(--color-error)' : 'hsl(var(--foreground) / 0.40)'}
          strokeWidth={critical ? 1.5 : 1}
          markerEnd={critical ? 'url(#dep-arrow-crit)' : 'url(#dep-arrow)'} />
  );
}

function BarTooltip({ row, top, projectedEndMs }: { row: Row; top: number; projectedEndMs: number | null }) {
  const bs = row.baseline_start ? new Date(row.baseline_start) : null;
  const be = row.baseline_end ? new Date(row.baseline_end) : null;
  const as = row.start_date ? new Date(row.start_date) : null;
  const ae = row.end_date ? new Date(row.end_date) : null;
  const cpi = row.actual_cost > 0 && row.baseline_cost > 0 ? row.actual_cost / row.baseline_cost : 0;

  // Start slip: actual_start − baseline_start (positive = late)
  const startSlipDays = bs && as ? Math.round((as.getTime() - bs.getTime()) / DAY_MS) : null;
  // End slip: actual_end − baseline_end (positive = late)
  const endSlipDays = be && ae ? Math.round((ae.getTime() - be.getTime()) / DAY_MS) : null;

  function fmtSlip(days: number | null): string {
    if (days === null) return '—';
    if (days === 0) return 'on schedule';
    const sign = days > 0 ? '+' : '';
    return `${sign}${days}d`;
  }
  function slipColor(days: number | null): string {
    if (days === null) return 'var(--fg-3)';
    if (days <= 0) return 'var(--color-success)';
    if (days <= 7) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  return (
    <div style={{
      position: 'absolute', right: 16, top,
      zIndex: 30, pointerEvents: 'none',
      background: 'rgba(10,12,16,0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      padding: '10px 12px',
      width: 320,
      color: 'var(--fg-1)', fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: TYPE_COLOR[row.type] }} />
        <span style={{ fontWeight: 'var(--fw-semibold)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
        {row.is_critical && <span className="badge badge-error" style={{ height: 16 }}>CP</span>}
        {row.is_milestone && <span className="badge badge-warning" style={{ height: 16 }}>MS</span>}
      </div>
      <div className="t-small" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>
        {row.type}{row.resource ? ` · ${row.resource}` : ''}
      </div>

      {/* Schedule dates — baseline vs actual with slip callout */}
      <Field label="BL Start" value={bs ? bs.toLocaleDateString("en-US", {timeZone:"UTC"}) : '—'} />
      <Field label="Act Start" value={as ? as.toLocaleDateString("en-US", {timeZone:"UTC"}) : '—'}
             extra={startSlipDays !== null ? { text: fmtSlip(startSlipDays), color: slipColor(startSlipDays) } : undefined} />
      <Field label="BL End" value={be ? be.toLocaleDateString("en-US", {timeZone:"UTC"}) : '—'} />
      <Field label="Act End" value={ae ? ae.toLocaleDateString("en-US", {timeZone:"UTC"}) : '—'}
             extra={endSlipDays !== null ? { text: fmtSlip(endSlipDays), color: slipColor(endSlipDays) } : undefined} />
      {projectedEndMs != null && (
        <Field label="Proj End" value={new Date(projectedEndMs).toLocaleDateString("en-US", {timeZone:"UTC"})}
               extra={{ text: 'forecast', color: 'rgba(139,92,246,0.85)' }} />
      )}

      <div style={{ borderTop: '1px solid var(--glass-border)', margin: '6px 0' }} />
      <Field label="Days" value={row.days_required > 0 ? `${row.days_required}d` : '—'} />
      <Field label="Hours" value={`${fmtNum(row.actual_hours)} / ${fmtNum(row.baseline_hours)}  (rem ${fmtNum(row.remaining_hours)})`} />
      {(row.actual_cost > 0 || row.baseline_cost > 0) &&
        <Field label="Cost" value={`$${Math.round(row.actual_cost).toLocaleString()} / $${Math.round(row.baseline_cost).toLocaleString()}`} />}
      {cpi > 0 && <Field label="CPI" value={cpi.toFixed(2)} />}
      <Field label="TF" value={row.total_float ? `${row.total_float}d` : '—'} />
      <Field label="% complete" value={`${Math.round(row.percent_complete)}%`} />
      {row.predecessor_name &&
        <Field label="Pred" value={`${row.predecessor_name}${row.relationship ? ` · ${row.relationship}` : ''}${row.lag_days ? ` · lag ${row.lag_days}d` : ''}`} />}
      {row.comments && <div style={{ marginTop: 6, color: 'var(--fg-2)', fontStyle: 'italic' }}>"{row.comments.length > 80 ? row.comments.slice(0, 80) + '…' : row.comments}"</div>}
    </div>
  );
}

function Field({ label, value, extra }: { label: string; value: string; extra?: { text: string; color: string } }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 8, padding: '2px 0' }}>
      <span className="t-small" style={{ color: 'var(--fg-3)' }}>{label}</span>
      <span style={{ color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {value}
        {extra && <span style={{ fontSize: 10, color: extra.color, fontWeight: 600 }}>{extra.text}</span>}
      </span>
    </div>
  );
}

function fmtNum(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function buildTicks(window_: { min: number; max: number } | null, zoom: Zoom, pxPerDay: number) {
  if (!window_) return { year: [], sub: [] };
  const w = window_;
  const years: { x: number; label: string }[] = [];
  const subs: { x: number; label: string }[] = [];
  const xFor = (ms: number) => ((ms - w.min) / DAY_MS) * pxPerDay;

  const c = new Date(new Date(w.min).getFullYear(), 0, 1);
  while (c.getTime() <= w.max) {
    years.push({ x: xFor(c.getTime()), label: `${c.getFullYear()}` });
    c.setFullYear(c.getFullYear() + 1);
  }

  if (zoom === 'day' || zoom === 'week') {
    const cur = new Date(w.min); cur.setHours(0, 0, 0, 0);
    while (cur.getTime() <= w.max) {
      if (cur.getDay() === 1) subs.push({ x: xFor(cur.getTime()), label: `${cur.getMonth() + 1}/${cur.getDate()}` });
      cur.setDate(cur.getDate() + 1);
    }
  } else if (zoom === 'month') {
    const start = new Date(w.min);
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur.getTime() <= w.max) {
      subs.push({ x: xFor(cur.getTime()), label: cur.toLocaleString(undefined, { month: 'short' }) });
      cur.setMonth(cur.getMonth() + 1);
    }
  } else if (zoom === 'quarter') {
    const start = new Date(w.min);
    const cur = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
    while (cur.getTime() <= w.max) {
      subs.push({ x: xFor(cur.getTime()), label: `Q${Math.floor(cur.getMonth() / 3) + 1}` });
      cur.setMonth(cur.getMonth() + 3);
    }
  }
  return { year: years, sub: subs };
}
