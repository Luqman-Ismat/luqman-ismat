'use client';
/**
 * /risk — Synthesis surface for every signal source on the platform (Forecast,
 * Productivity, Cost, Quality, Resourcing, RAID, Schedule). Reads materialized
 * snapshots from `risk_signals`; the visual answers Q1–Q5 of the legacy lens
 * inline plus the new live signal feed.
 *
 * Q1 (matrix)        → <RiskMatrix>: bubble per project, x = signal count,
 *                       y = P1 count, bubble size = $ exposure. Click → filter.
 * Q2 (detection lag) → "Median age" KPI tile (and p95 sub). Age = days since
 *                       a (source, kind, project, external_id) was first seen
 *                       in any snapshot. Replaces schedule_alerts-only lag.
 * Q3 (effectiveness) → "New today · cleared" KPI tile. "cleared" = yesterday's
 *                       signals that didn't repeat today. Replaces the
 *                       improved/unchanged/worsened buckets.
 * Q4 (top-N risk)    → <TopProjectsTable>: scored P1×4 + P2×2 + others +
 *                       max-age bonus. Sources firing chips visible per row.
 * Q5 (posture)       → "Posture" KPI tile (in_control / at_risk / out_of_control)
 *                       + <TrendChart>: stacked-area daily signal counts by
 *                       severity over the last 30 days.
 *
 * Two cross-project lenses added on top (the legacy lens had nothing here):
 *   <KindGroups>     — every signal kind grouped across the projects firing it
 *                       ("29 projects all have a cost overrun"). Click → feed.
 *   <ClustersPanel>  — projects with ≥3 sources firing ("where to focus first").
 *   <CoOccurrencePanel> — source-pairs that travel together across projects.
 *
 * RAID auto-correlator (lib/risk/correlate.ts) ties each open RAID to today's
 * related signals; each row has Keep/Dismiss so users curate the suggestions.
 */
import { riskFetch as fetch, resetRisk } from './risk-data';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SectionShell from '@project/components/lens/SectionShell';
import EmptyState from '@project/components/ui/EmptyState';
import Skeleton from '@project/components/ui/Skeleton';
import { useGlobalFilters, globalFiltersToQuery } from '@project/lib/global-filters';

type Severity = 'p1' | 'p2' | 'p3' | 'info';
type Signal = {
  id: string; source: string; kind: string; severity: Severity;
  project_id: string; project_name: string; customer_name: string | null;
  title: string; detail: string | null;
  metric_value: number | null; metric_unit: string | null;
  drill_href: string | null;
  observed_on: string; first_seen: string; age_days: number;
};
type ProjAgg = {
  project_id: string; project_name: string; customer_name: string | null;
  n: number; p1: number; p2: number; sources: string[]; exposure: number; max_age_days: number;
};
type TopProject = ProjAgg & { score: number };
type TrendPoint = { day: string; p1: number; p2: number; p3: number; info: number; total: number };
type RaidCorrelation = {
  raid_id: string; raid_type: string; raid_title: string; raid_severity: string | null;
  project_id: string; project_name: string;
  links: { signal_id: string; source: string; kind: string; severity: Severity; title: string; detail: string | null; drill_href: string | null; match_kind: string; confidence: number }[];
};
type Cluster = ProjAgg & { source_count: number };
type CoOcc = { source_a: string; source_b: string; projects: number };
type KindGroup = {
  source: string; kind: string;
  n_signals: number; n_projects: number; n_p1: number; exposure: number;
  sample_title: string;
  top_projects: { project_id: string; project_name: string }[];
};
type Payload = {
  success: boolean;
  observed_on: string;
  kpis: {
    total: number; p1: number; p2: number; p3: number;
    projects_affected: number;
    posture: 'in_control' | 'at_risk' | 'out_of_control';
    posture_banner: string;
    median_age_days: number | null;
    p75_age_days: number | null;
    p95_age_days: number | null;
  };
  lifecycle: { new_today: number; cleared_yesterday: number };
  trend: TrendPoint[];
  by_source: { source: string; n: number; p1: number }[];
  top_projects: TopProject[];
  projects: ProjAgg[];
  signals: Signal[];
  raid_correlations: RaidCorrelation[];
  clusters: Cluster[];
  co_occurrence: CoOcc[];
  kind_groups: KindGroup[];
};

const SOURCE_COLOR: Record<string, string> = {
  raid:        '#f5b14a',
  cost:        '#e5484d',
  quality:     '#7c3aed',
  resourcing:  '#2ec4b6',
  schedule:    '#3b82f6',
  forecast:    '#3ecf8e',
  productivity:'#f59e0b',
};
const SOURCE_LABEL: Record<string, string> = {
  raid: 'RAID', cost: 'Cost', quality: 'Quality', resourcing: 'Resourcing',
  schedule: 'Schedule', forecast: 'Forecast', productivity: 'Productivity',
};
const SEV_COLOR: Record<Severity, string> = { p1: '#e5484d', p2: '#f5b14a', p3: 'var(--fg-2)', info: 'var(--fg-3)' };
const SEV_LABEL: Record<Severity, string> = { p1: 'P1', p2: 'P2', p3: 'P3', info: 'info' };
const POSTURE_TONE = {
  in_control:     { label: 'In control',     color: '#3ecf8e', bg: 'rgba(62,207,142,0.12)' },
  at_risk:        { label: 'At risk',        color: '#f5b14a', bg: 'rgba(245,177,74,0.14)' },
  out_of_control: { label: 'Out of control', color: '#e5484d', bg: 'rgba(229,72,77,0.14)' },
} as const;

/* Every section uses the same chrome so the eye groups them by content, not style. */
const PANEL: React.CSSProperties = {
  padding: 18,
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
  background: 'var(--glass-bg)',
  marginBottom: 20,
};
const PANEL_TITLE: React.CSSProperties = {
  margin: '0 0 14px',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
  color: 'var(--fg-3)',
  fontWeight: 600,
};
const PANEL_TITLE_SUB: React.CSSProperties = {
  fontWeight: 400,
  textTransform: 'none',
  letterSpacing: 'normal',
  color: 'var(--fg-3)',
  marginLeft: 8,
};

export default function RiskPage() {
  const { filters, isHydrated } = useGlobalFilters();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string | null>(null); // 'source|kind' or null

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = globalFiltersToQuery(filters);
      const r = await fetch(qs ? `/api/section/risk?${qs}` : '/api/section/risk', { cache: 'no-store' });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || 'load failed');
      setData(j);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { if (isHydrated) void load(); }, [load, isHydrated]);

  if (!isHydrated || loading) return <SectionShell title="Risk" subtitle="Cross-section signal feed"><Skeleton height={420} /></SectionShell>;
  if (error)                   return <SectionShell title="Risk" subtitle="Cross-section signal feed"><EmptyState title="Failed to load" body={error} /></SectionShell>;
  if (!data || data.signals.length === 0) {
    return (
      <SectionShell title="Risk" subtitle="Cross-section signal feed">
        <EmptyState
          title="No signals on the latest snapshot"
          body="The fictional portfolio has no signals matching this selection."
        />
      </SectionShell>
    );
  }

  const k = data.kpis;
  const posture = POSTURE_TONE[k.posture];

  const feed = data.signals.filter((s) =>
    (sourceFilter === 'all' || s.source === sourceFilter) &&
    (severityFilter === 'all' || s.severity === severityFilter) &&
    (!projectFilter || s.project_id === projectFilter) &&
    (!kindFilter || `${s.source}|${s.kind}` === kindFilter),
  );

  return (
    <SectionShell title="Risk intelligence" subtitle={`Fictional portfolio · snapshot ${data.observed_on}`}>
      <p>Review the combined evidence across six sample projects. Selecting a project filters response timing and the signal feed. Related-view links open the corresponding demonstration; they do not represent a connected client record.</p>
      <nav className="risk-jump" aria-label="Risk sections"><a href="#risk-matrix">Schedule × cost</a><a href="#risk-response">Response timing</a><a href="#risk-projects">Project ranking</a><a href="#risk-correlations">Related records</a><a href="#risk-feed">Signal feed</a><button onClick={()=>{resetRisk();void load()}}>Reset review choices</button></nav>
      {projectFilter&&<div className="risk-selection" role="status">Selected project: <strong>{data.projects.find(p=>p.project_id===projectFilter)?.project_name}</strong><a href="#risk-feed">View matching signals ↓</a><button onClick={()=>setProjectFilter(null)}>Clear project</button></div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <Kpi label="Posture" value={posture.label} accent={posture.color} sub={k.posture_banner} />
        <Kpi label="Open signals" value={k.total.toLocaleString()} sub={`${k.projects_affected} project${k.projects_affected === 1 ? '' : 's'} affected`} />
        <Kpi label="P1 · P2 · P3" value={`${k.p1} · ${k.p2} · ${k.p3}`} accent={k.p1 > 0 ? '#e5484d' : undefined} sub="by severity" />
        <Kpi label="Median age" value={k.median_age_days != null ? `${k.median_age_days}d` : '—'} sub={k.p95_age_days != null ? `p95 ${k.p95_age_days}d` : undefined} />
        <Kpi label="New today · cleared" value={`${data.lifecycle.new_today} · ${data.lifecycle.cleared_yesterday}`} accent={data.lifecycle.cleared_yesterday >= data.lifecycle.new_today && data.lifecycle.new_today + data.lifecycle.cleared_yesterday > 0 ? '#3ecf8e' : undefined} sub="net change vs yesterday" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16, marginBottom: 20 }}>
        <TrendChart trend={data.trend} />
        <SourceBreakdown by_source={data.by_source} total={k.total} />
      </div>

      <div id="risk-matrix" /><ScheduleCostMatrix
        signals={data.signals} projects={data.projects}
        onPickProject={setProjectFilter} highlighted={projectFilter}
      />

      <div id="risk-response" /><ResponseTimingSection projectFilter={projectFilter} onPickProject={setProjectFilter} />

      <KindGroups groups={data.kind_groups} activeKey={kindFilter} onPick={(key) => setKindFilter(activeKey => activeKey === key ? null : key)} onPickProject={setProjectFilter} />

      {(data.clusters.length > 0 || data.co_occurrence.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16, marginBottom: 20 }}>
          <ClustersPanel clusters={data.clusters} onPickProject={setProjectFilter} highlighted={projectFilter} />
          <CoOccurrencePanel co={data.co_occurrence} />
        </div>
      )}

      <div id="risk-projects" /><TopProjectsTable projects={data.top_projects} onPickProject={setProjectFilter} highlighted={projectFilter} />

      <div id="risk-correlations" /><RaidCorrelations correlations={data.raid_correlations} onPickProject={setProjectFilter} onChanged={load} />

      <div id="risk-feed" /><LiveFeed
        signals={feed}
        totalCount={data.signals.length}
        source={sourceFilter} onSource={setSourceFilter}
        severity={severityFilter} onSeverity={setSeverityFilter}
        project={projectFilter} onProject={setProjectFilter}
        kind={kindFilter} onKind={setKindFilter}
      />
    </SectionShell>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      padding: '14px 16px',
      border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)',
      background: 'var(--glass-bg)',
      borderTop: accent ? `2px solid ${accent}` : '1px solid var(--glass-border)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: accent || 'var(--fg-1)', marginTop: 6, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 4, lineHeight: 1.35 }}>{sub}</div>}
    </div>
  );
}

function TrendChart({ trend }: { trend: TrendPoint[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver((e) => { const cw = e[0]?.contentRect.width; if (cw) setW(Math.max(360, cw)); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const H = 200, m = { top: 16, right: 16, bottom: 28, left: 36 };
  const plotW = w - m.left - m.right, plotH = H - m.top - m.bottom;
  if (trend.length === 0) {
    return (
      <section style={{ ...PANEL, marginBottom: 0 }}>
        <h4 style={PANEL_TITLE}>Posture trend (30 days)</h4>
        <div style={{ padding: '24px 0', color: 'var(--fg-3)', fontSize: 12 }}>Building up — daily snapshots accumulate over time.</div>
      </section>
    );
  }
  const maxY = Math.max(1, ...trend.map((t) => t.total)) * 1.1;
  const xFor = (i: number) => m.left + (trend.length === 1 ? plotW / 2 : (i / (trend.length - 1)) * plotW);
  const yFor = (v: number) => m.top + plotH - (v / maxY) * plotH;
  function bandPath(getter: (t: TrendPoint) => { lo: number; hi: number }): string {
    const upper = trend.map((t, i) => [xFor(i), yFor(getter(t).hi)] as [number, number]);
    const lower = trend.map((t, i) => [xFor(i), yFor(getter(t).lo)] as [number, number]).reverse();
    return [...upper, ...lower].map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
  }
  const p1Band = bandPath((t) => ({ lo: 0,           hi: t.p1 }));
  const p2Band = bandPath((t) => ({ lo: t.p1,        hi: t.p1 + t.p2 }));
  const p3Band = bandPath((t) => ({ lo: t.p1 + t.p2, hi: t.p1 + t.p2 + t.p3 }));
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxY / ticks) * i);
  return (
    <section ref={wrap} style={{ ...PANEL, marginBottom: 0 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <h4 style={PANEL_TITLE}>Posture trend (30 days)</h4>
        <span style={{ flex: 1 }} />
        <Legend items={[{ color: SEV_COLOR.p1, label: 'P1' }, { color: SEV_COLOR.p2, label: 'P2' }, { color: SEV_COLOR.p3, label: 'P3' }]} />
      </header>
      <svg width={w} height={H} style={{ display: 'block' }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={m.left} x2={m.left + plotW} y1={yFor(v)} y2={yFor(v)} stroke="var(--glass-border)" />
            <text x={m.left - 8} y={yFor(v) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={10} fill="var(--fg-3)">{Math.round(v)}</text>
          </g>
        ))}
        <path d={p3Band} fill={SEV_COLOR.p3} opacity={0.35} />
        <path d={p2Band} fill={SEV_COLOR.p2} opacity={0.55} />
        <path d={p1Band} fill={SEV_COLOR.p1} opacity={0.75} />
        {trend.length > 6 && trend.map((t, i) => (i % Math.ceil(trend.length / 6) === 0 || i === trend.length - 1) ? (
          <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill="var(--fg-3)">{t.day.slice(5)}</text>
        ) : null)}
      </svg>
    </section>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {items.map((i) => (
        <span key={i.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-2)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: i.color }} />{i.label}
        </span>
      ))}
    </span>
  );
}

function SourceBreakdown({ by_source, total }: { by_source: { source: string; n: number; p1: number }[]; total: number }) {
  if (total === 0) return null;
  return (
    <section style={{ ...PANEL, marginBottom: 0 }}>
      <h4 style={PANEL_TITLE}>Where signals come from</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {by_source.map((s) => {
          const wf = total > 0 ? (s.n / total) * 100 : 0;
          const wP1 = s.n > 0 ? (s.p1 / s.n) * wf : 0;
          return (
            <div key={s.source}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)', marginBottom: 2 }}>
                <span>{SOURCE_LABEL[s.source] || s.source}</span>
                <span style={{ color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{s.n}{s.p1 > 0 ? ` · ${s.p1} P1` : ''}</span>
              </div>
              <div style={{ height: 8, background: 'hsl(var(--foreground) / 0.04)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${wf}%`, background: SOURCE_COLOR[s.source] || 'var(--accent)', opacity: 0.55 }} />
                {wP1 > 0 && (
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${wP1}%`, background: SEV_COLOR.p1, opacity: 0.9 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Schedule×Cost quadrant matrix.
 *
 * Axes: schedule_score on X, cost_score on Y. Each project's score for an
 * axis is sum-of-severity-weights over open signals from that family
 * (schedule/slip on X, cost/overrun+thin_margin on Y). Quadrants split at
 * the median of plotted projects so we don't get an empty top-right when
 * the whole portfolio is calm.
 *
 *   BL Stable        TL Cost only       — watch
 *   BR Schedule only TR Critical (both) — fix first
 *
 * Per product decision: only projects with a current schedule or cost
 * signal are plotted; the rest sit off-board.
 */
function ScheduleCostMatrix({ signals, projects: aggregates, onPickProject, highlighted }: {
  signals: Signal[]; projects: ProjAgg[];
  onPickProject: (id: string | null) => void; highlighted: string | null;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver((e) => { const cw = e[0]?.contentRect.width; if (cw) setW(Math.max(420, cw)); });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  // Build per-project scores from the raw signal list.
  type Pt = { project_id: string; project_name: string; sched: number; cost: number; exposure: number };
  const sevWeight = (s: string) => s === 'p1' ? 4 : s === 'p2' ? 2 : s === 'p3' ? 1 : 0.5;
  const byProj = new Map<string, Pt>();
  const exposureBy = new Map(aggregates.map((p) => [p.project_id, p.exposure]));
  for (const s of signals) {
    const onSched = s.source === 'schedule' && s.kind === 'slip';
    const onCost  = s.source === 'cost' && (s.kind === 'overrun' || s.kind === 'thin_margin');
    if (!onSched && !onCost) continue;
    const cur = byProj.get(s.project_id) || {
      project_id: s.project_id, project_name: s.project_name,
      sched: 0, cost: 0, exposure: exposureBy.get(s.project_id) || 0,
    };
    if (onSched) cur.sched += sevWeight(s.severity);
    else         cur.cost  += sevWeight(s.severity);
    byProj.set(s.project_id, cur);
  }
  const pts = [...byProj.values()];

  if (pts.length === 0) {
    return (
      <section style={PANEL}>
        <h4 style={PANEL_TITLE}>Schedule × Cost matrix</h4>
        <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>
          No projects have a schedule slip or cost overrun signal on the latest snapshot.
        </p>
      </section>
    );
  }

  const H = 360, m = { top: 30, right: 24, bottom: 56, left: 56 };
  const plotW = w - m.left - m.right, plotH = H - m.top - m.bottom;
  const maxSched = Math.max(2, ...pts.map((p) => p.sched));
  const maxCost  = Math.max(2, ...pts.map((p) => p.cost));
  const maxExp   = Math.max(1, ...pts.map((p) => p.exposure));

  // Quadrant split = median, but clipped so a single-point chart still draws sensible lines.
  const median = (xs: number[]) => { const s = [...xs].sort((a,b)=>a-b); return s.length % 2 ? s[(s.length-1)>>1] : (s[s.length/2-1]+s[s.length/2])/2; };
  const xMid = Math.max(1, median(pts.map((p) => p.sched)));
  const yMid = Math.max(1, median(pts.map((p) => p.cost)));

  const xFor = (v: number) => m.left + (v / maxSched) * plotW;
  const yFor = (v: number) => m.top + plotH - (v / maxCost) * plotH;
  const rFor = (exp: number) => 5 + Math.sqrt((exp || 0) / maxExp) * 14;

  const qx = xFor(xMid), qy = yFor(yMid);

  // Quadrant fills (very subtle).
  const QUADS = [
    { x: m.left, y: m.top,        w: qx - m.left,           h: qy - m.top,             label: 'Cost only',     tone: 'rgba(245,177,74,0.06)' },
    { x: qx,     y: m.top,        w: m.left + plotW - qx,   h: qy - m.top,             label: 'Critical',      tone: 'rgba(229,72,77,0.10)' },
    { x: m.left, y: qy,           w: qx - m.left,           h: m.top + plotH - qy,     label: 'Stable',        tone: 'rgba(62,207,142,0.05)' },
    { x: qx,     y: qy,           w: m.left + plotW - qx,   h: m.top + plotH - qy,     label: 'Schedule only', tone: 'rgba(59,130,246,0.07)' },
  ];

  // Group dots by quadrant for the legend chips.
  const labelOf = (p: Pt) => {
    const hi_s = p.sched >= xMid, hi_c = p.cost >= yMid;
    return hi_s && hi_c ? 'Critical' : hi_s ? 'Schedule only' : hi_c ? 'Cost only' : 'Stable';
  };
  const buckets = pts.reduce((acc, p) => { (acc[labelOf(p)] ||= []).push(p); return acc; }, {} as Record<string, Pt[]>);

  return (
    <section ref={wrap} style={PANEL}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h4 style={PANEL_TITLE}>
          Schedule × Cost matrix
          <span style={PANEL_TITLE_SUB}>{pts.length} project{pts.length === 1 ? '' : 's'} · bubble = $ exposure · click to drill in</span>
        </h4>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
          {(['Critical', 'Schedule only', 'Cost only', 'Stable'] as const).map((q) => (
            <span key={q}>{q}: <b style={{ color: 'var(--fg-1)' }}>{(buckets[q] || []).length}</b></span>
          ))}
        </div>
      </header>
      <svg width={w} height={H} style={{ display: 'block' }}>
        {QUADS.map((q) => (
          <g key={q.label}>
            <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={q.tone} />
            <text x={q.x + 8} y={q.y + 14} fontSize={10} fontFamily="var(--font-mono)"
              fill="hsl(var(--foreground) / 0.40)" textAnchor="start" style={{ textTransform: 'uppercase', letterSpacing: '0.10em' }}>
              {q.label}
            </text>
          </g>
        ))}
        <line x1={qx} y1={m.top} x2={qx} y2={m.top + plotH} stroke="hsl(var(--foreground) / 0.18)" strokeDasharray="3,3" />
        <line x1={m.left} y1={qy} x2={m.left + plotW} y2={qy} stroke="hsl(var(--foreground) / 0.18)" strokeDasharray="3,3" />

        {/* axis ticks */}
        {[0.5, 1].map((f) => (
          <g key={`x${f}`}>
            <text x={m.left + plotW * f} y={m.top + plotH + 16} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="hsl(var(--foreground) / 0.40)">{(maxSched * f).toFixed(0)}</text>
          </g>
        ))}
        {[0.5, 1].map((f) => (
          <g key={`y${f}`}>
            <text x={m.left - 8} y={m.top + plotH * (1 - f) + 3} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="hsl(var(--foreground) / 0.40)">{(maxCost * f).toFixed(0)}</text>
          </g>
        ))}

        {pts.map((p) => {
          const cx = xFor(p.sched), cy = yFor(p.cost), r = rFor(p.exposure);
          const isHi = !highlighted || highlighted === p.project_id;
          const fill = labelOf(p) === 'Critical' ? '#e5484d'
                      : labelOf(p) === 'Schedule only' ? '#3b82f6'
                      : labelOf(p) === 'Cost only'     ? '#f5b14a'
                                                       : '#3ecf8e';
          return (
            <g key={p.project_id} tabIndex={0} role="button" onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onPickProject(highlighted === p.project_id ? null : p.project_id)}}} onClick={() => onPickProject(highlighted === p.project_id ? null : p.project_id)} style={{ cursor: 'pointer' }}>
              <circle cx={cx} cy={cy} r={r}
                fill={fill}
                opacity={isHi ? 0.65 : 0.18}
                stroke={highlighted === p.project_id ? '#fff' : 'rgba(0,0,0,0.5)'}
                strokeWidth={highlighted === p.project_id ? 2 : 1}
              >
                <title>{`${p.project_name} · schedule ${p.sched.toFixed(1)} · cost ${p.cost.toFixed(1)} · $${p.exposure.toLocaleString()} exposure`}</title>
              </circle>
            </g>
          );
        })}

        <text x={m.left + plotW / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="hsl(var(--foreground) / 0.70)">
          Schedule slip severity →
        </text>
        <text x={16} y={m.top + plotH / 2} textAnchor="middle" fontSize={11} fill="hsl(var(--foreground) / 0.70)"
          transform={`rotate(-90 16 ${m.top + plotH / 2})`}>
          Cost overrun severity →
        </text>
      </svg>
    </section>
  );
}

/* ----------------------------------------------------------------- *
 *  Response timing                                                   *
 * ----------------------------------------------------------------- */

type AckKind    = 'raid_comment' | 'raid_change' | 'new_raid' | null;
type ActionKind = 'raid_status_change' | 'mitigation_set' | 'new_corrective_raid' | null;
type TrendAfter = 'improved' | 'stable' | 'worsened' | 'unknown';
type Incident = {
  project_id: string; project_name: string;
  source: string; kind: string;
  detected_on: string; latest_on: string;
  latest_severity: Severity; count_latest: number;
  metric_at_detection: number | null; metric_latest: number | null;
  first_ack_at: string | null; first_ack_kind: AckKind; days_to_ack: number | null;
  first_action_at: string | null; first_action_kind: ActionKind; days_to_action: number | null;
  trend_after: TrendAfter;
  open_raid_count: number;
};
type TimingResp = {
  success: boolean;
  incidents: Incident[];
  kpis: {
    n_detections: number; n_acknowledged: number; n_actioned: number;
    pct_acknowledged: number; pct_actioned: number; pct_improved_after_action: number;
    avg_days_to_ack: number | null; median_days_to_ack: number | null;
    avg_days_to_action: number | null; median_days_to_action: number | null;
  };
};

const ACK_LABEL: Record<NonNullable<AckKind>, string> = {
  raid_comment: 'comment',
  raid_change:  'edit',
  new_raid:     'new RAID',
};
const ACTION_LABEL: Record<NonNullable<ActionKind>, string> = {
  raid_status_change:     'status change',
  mitigation_set:         'mitigation set',
  new_corrective_raid:    'corrective RAID',
};
const TREND_TONE: Record<TrendAfter, { label: string; color: string }> = {
  improved:  { label: '↘ improved', color: '#3ecf8e' },
  stable:    { label: '→ stable',   color: 'var(--fg-3)' },
  worsened:  { label: '↗ worsened', color: '#e5484d' },
  unknown:   { label: '—',          color: 'var(--fg-3)' },
};

function ResponseTimingSection({ projectFilter, onPickProject }: {
  projectFilter: string | null;
  onPickProject: (id: string | null) => void;
}) {
  const { filters, isHydrated } = useGlobalFilters();
  const [data, setData]     = useState<TimingResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    let alive = true;
    setLoading(true);
    const qs = globalFiltersToQuery(filters);
    fetch(qs ? `/api/risk/timing?${qs}` : '/api/risk/timing', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((j: TimingResp) => alive && setData(j))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [filters, isHydrated]);

  if (loading) return <section style={PANEL}><h4 style={PANEL_TITLE}>Response timing</h4><Skeleton height={120} /></section>;
  if (error)   return <section style={PANEL}><h4 style={PANEL_TITLE}>Response timing</h4><p style={{ fontSize: 13, color: 'var(--color-error)' }}>Failed: {error}</p></section>;
  if (!data || data.incidents.length === 0) {
    return (
      <section style={PANEL}>
        <h4 style={PANEL_TITLE}>Response timing</h4>
        <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0 }}>
          No schedule-slip or cost-overrun incidents in scope.
        </p>
      </section>
    );
  }

  const k = data.kpis;
  const incidents = projectFilter
    ? data.incidents.filter((i) => i.project_id === projectFilter)
    : data.incidents;

  const cellL: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', color: 'var(--fg-2)', fontSize: 12, verticalAlign: 'top' };
  const cellR: React.CSSProperties = { padding: '8px 12px', textAlign: 'right', color: 'var(--fg-2)', fontSize: 12, fontFamily: 'var(--font-mono)', verticalAlign: 'top' };
  const headL: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', color: 'var(--fg-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 600 };
  const headR: React.CSSProperties = { padding: '8px 12px', textAlign: 'right', color: 'var(--fg-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 600 };

  return (
    <section style={PANEL}>
      <h4 style={PANEL_TITLE}>
        Response timing
        <span style={PANEL_TITLE_SUB}>
          schedule slip + cost overrun · detection → ack → corrective action → outcome
        </span>
      </h4>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
        <KpiTile label="Detections" value={String(k.n_detections)} />
        <KpiTile label="Acknowledged"
          value={`${k.n_acknowledged} (${Math.round(k.pct_acknowledged * 100)}%)`}
          accent={k.pct_acknowledged >= 0.8 ? '#3ecf8e' : k.pct_acknowledged < 0.5 ? '#e5484d' : undefined} />
        <KpiTile label="Action taken"
          value={`${k.n_actioned} (${Math.round(k.pct_actioned * 100)}%)`}
          accent={k.pct_actioned >= 0.7 ? '#3ecf8e' : k.pct_actioned < 0.4 ? '#e5484d' : undefined} />
        <KpiTile label="Avg days → ack"
          value={k.avg_days_to_ack != null ? `${k.avg_days_to_ack.toFixed(1)}d` : '—'}
          sub={k.median_days_to_ack != null ? `med ${k.median_days_to_ack.toFixed(1)}d` : undefined} />
        <KpiTile label="Avg days → action"
          value={k.avg_days_to_action != null ? `${k.avg_days_to_action.toFixed(1)}d` : '—'}
          sub={k.median_days_to_action != null ? `med ${k.median_days_to_action.toFixed(1)}d` : undefined} />
        <KpiTile label="Improved after action"
          value={`${Math.round(k.pct_improved_after_action * 100)}%`}
          accent={k.pct_improved_after_action >= 0.5 ? '#3ecf8e' : k.pct_improved_after_action === 0 ? 'var(--fg-3)' : undefined} />
      </div>

      {/* Incident table */}
      <div style={{ border: '1px solid var(--glass-border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'hsl(var(--foreground) / 0.02)' }}>
              <th style={headL}>Project</th>
              <th style={headL}>Signal</th>
              <th style={headR}>Detected</th>
              <th style={headR}>Acked</th>
              <th style={headR}>Action</th>
              <th style={headR}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((it) => {
              const key = `${it.project_id}|${it.source}|${it.kind}`;
              const open = expanded === key;
              return (
                <Fragment key={key}>
                  <tr
                    tabIndex={0} aria-expanded={open} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setExpanded(open?null:key);onPickProject(it.project_id)}}} onClick={() => { setExpanded(open ? null : key); onPickProject(it.project_id); }}
                    style={{
                      cursor: 'pointer',
                      borderTop: '1px solid var(--glass-border)',
                      background: projectFilter === it.project_id ? 'color-mix(in oklab, var(--accent) 4%, transparent)' : 'transparent',
                    }}
                  >
                    <td style={cellL}>
                      <div style={{ color: 'var(--fg-1)', fontWeight: 500 }}>{it.project_name}</div>
                      <div style={{ fontSize: 10, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {it.open_raid_count} open RAID · latest {it.latest_on}
                      </div>
                    </td>
                    <td style={cellL}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SrcPill src={it.source} />
                        <span style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{it.kind}</span>
                        <SevPill s={it.latest_severity} />
                      </div>
                    </td>
                    <td style={cellR}>{it.detected_on}</td>
                    <td style={cellR}>
                      {it.days_to_ack != null ? (
                        <>
                          <div>{it.days_to_ack.toFixed(1)}d</div>
                          <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>{it.first_ack_kind ? ACK_LABEL[it.first_ack_kind] : ''}</div>
                        </>
                      ) : <span style={{ color: '#e5484d' }}>none</span>}
                    </td>
                    <td style={cellR}>
                      {it.days_to_action != null ? (
                        <>
                          <div>{it.days_to_action.toFixed(1)}d</div>
                          <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>{it.first_action_kind ? ACTION_LABEL[it.first_action_kind] : ''}</div>
                        </>
                      ) : <span style={{ color: '#f5b14a' }}>pending</span>}
                    </td>
                    <td style={{ ...cellR, color: TREND_TONE[it.trend_after].color }}>
                      {TREND_TONE[it.trend_after].label}
                    </td>
                  </tr>
                  {open && (
                    <tr style={{ background: 'hsl(var(--foreground) / 0.015)' }}>
                      <td colSpan={6} style={{ padding: '14px 20px', fontSize: 12, color: 'var(--fg-2)' }}>
                        <IncidentTimeline it={it} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function KpiTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      padding: '10px 12px', border: '1px solid var(--glass-border)', borderRadius: 8,
      background: 'hsl(var(--foreground) / 0.015)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, color: accent || 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function IncidentTimeline({ it }: { it: Incident }) {
  const steps: { when: string | null; kind: 'detect' | 'ack' | 'action' | 'latest'; label: string; sub?: string }[] = [
    { when: it.detected_on,    kind: 'detect', label: `Detected — ${it.source}/${it.kind}`, sub: it.metric_at_detection != null ? `metric ${it.metric_at_detection}` : undefined },
    { when: it.first_ack_at,    kind: 'ack',    label: it.first_ack_at ? `Acknowledged — ${ACK_LABEL[it.first_ack_kind || 'raid_change']}` : 'No ack yet', sub: it.days_to_ack != null ? `${it.days_to_ack.toFixed(1)}d after detection` : undefined },
    { when: it.first_action_at, kind: 'action', label: it.first_action_at ? `Action — ${ACTION_LABEL[it.first_action_kind || 'mitigation_set']}` : 'No corrective action yet', sub: it.days_to_action != null ? `${it.days_to_action.toFixed(1)}d after detection` : undefined },
    { when: it.latest_on,       kind: 'latest', label: `Latest snapshot — ${TREND_TONE[it.trend_after].label}`, sub: it.metric_latest != null ? `metric ${it.metric_latest}` : undefined },
  ];
  const STEP_TONE: Record<'detect'|'ack'|'action'|'latest', string> = {
    detect: '#e5484d',
    ack:    '#f5b14a',
    action: '#3ecf8e',
    latest: 'var(--fg-3)',
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 5, background: s.when ? STEP_TONE[s.kind] : 'hsl(var(--foreground) / 0.20)',
              flexShrink: 0, marginTop: 2,
            }} />
            <div>
              <div style={{ color: s.when ? 'var(--fg-1)' : 'var(--fg-3)', fontSize: 12 }}>{s.label}</div>
              <div style={{ color: 'var(--fg-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                {s.when ? new Date(s.when).toLocaleDateString() : '—'}{s.sub ? ` · ${s.sub}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--fg-3)' }}>
        {it.open_raid_count} open RAID item{it.open_raid_count === 1 ? '' : 's'} on this project.
        {' '}<a href="#risk-correlations" style={{ color: 'var(--accent)' }}>Review related records ↓</a>
      </div>
    </div>
  );
}

function TopProjectsTable({ projects, onPickProject, highlighted }: { projects: TopProject[]; onPickProject: (id: string | null) => void; highlighted: string | null }) {
  if (projects.length === 0) return null;
  const cellL: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', color: 'var(--fg-2)', fontSize: 12 };
  const cellR: React.CSSProperties = { padding: '8px 12px', textAlign: 'right', color: 'var(--fg-2)', fontSize: 12, fontFamily: 'var(--font-mono)' };
  return (
    <section style={PANEL}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={PANEL_TITLE}>Top projects by risk (click to filter the feed)</h4>
      </header>
      <div style={{ overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'hsl(var(--foreground) / 0.03)', color: 'var(--fg-3)' }}>
              <th style={{ ...cellL, fontWeight: 500 }}>Project</th>
              <th style={{ ...cellL, fontWeight: 500 }}>Sources firing</th>
              <th style={{ ...cellR, fontWeight: 500 }}>P1</th>
              <th style={{ ...cellR, fontWeight: 500 }}>P2</th>
              <th style={{ ...cellR, fontWeight: 500 }}>Total</th>
              <th style={{ ...cellR, fontWeight: 500 }}>Max age</th>
              <th style={{ ...cellR, fontWeight: 500 }}>Exposure</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const active = highlighted === p.project_id;
              return (
                <tr key={p.project_id}
                    tabIndex={0} role="button" onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onPickProject(active ? null : p.project_id)}}} onClick={() => onPickProject(active ? null : p.project_id)}
                    style={{
                      borderTop: '1px solid var(--glass-border)',
                      background: active ? 'color-mix(in oklab, var(--accent) 6%, transparent)' : 'transparent',
                      cursor: 'pointer',
                    }}>
                  <td style={{ ...cellL, color: 'var(--fg-1)' }}>
                    <div style={{ fontWeight: 500 }}>{p.project_name}</div>
                    {p.customer_name && <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>{p.customer_name}</div>}
                  </td>
                  <td style={cellL}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {p.sources.map((s) => <SrcPill key={s} src={s} />)}
                    </div>
                  </td>
                  <td style={{ ...cellR, color: p.p1 > 0 ? SEV_COLOR.p1 : 'var(--fg-3)', fontWeight: p.p1 > 0 ? 600 : 400 }}>{p.p1}</td>
                  <td style={{ ...cellR, color: p.p2 > 0 ? SEV_COLOR.p2 : 'var(--fg-3)' }}>{p.p2}</td>
                  <td style={cellR}>{p.n}</td>
                  <td style={cellR}>{p.max_age_days}d</td>
                  <td style={cellR}>{p.exposure > 0 ? `$${p.exposure.toLocaleString()}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ── Risk clusters (projects with ≥3 sources firing) ───────────────────── */

function ClustersPanel({ clusters, onPickProject, highlighted }: { clusters: Cluster[]; onPickProject: (id: string | null) => void; highlighted: string | null }) {
  return (
    <section style={{ ...PANEL, marginBottom: 0 }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={PANEL_TITLE}>
          Risk clusters · {clusters.length} project{clusters.length === 1 ? '' : 's'} with ≥3 sources firing
        </h4>
      </header>
      {clusters.length === 0 ? (
        <div style={{ padding: '8px 0', fontSize: 12, color: 'var(--fg-3)' }}>No multi-source clusters today.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
          {clusters.map((c) => {
            const active = highlighted === c.project_id;
            return (
              <div key={c.project_id}
                tabIndex={0} role="button" onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onPickProject(active ? null : c.project_id)}}} onClick={() => onPickProject(active ? null : c.project_id)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                  gap: 10, padding: '8px 10px', alignItems: 'center', cursor: 'pointer',
                  border: '1px solid var(--glass-border)', borderRadius: 6,
                  background: active ? 'color-mix(in oklab, var(--accent) 6%, transparent)' : 'hsl(var(--foreground) / 0.015)',
                }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'var(--fg-1)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.project_name}</div>
                  {c.customer_name && <div style={{ fontSize: 10, color: 'var(--fg-3)' }}>{c.customer_name}</div>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 240 }}>
                  {c.sources.map((s) => <SrcPill key={s} src={s} />)}
                </div>
                <span style={{ fontSize: 11, color: 'var(--fg-2)', fontFamily: 'var(--font-mono)' }}>
                  {c.n} signal{c.n === 1 ? '' : 's'}
                </span>
                {c.p1 > 0 && (
                  <span style={{ fontSize: 11, color: SEV_COLOR.p1, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{c.p1} P1</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Source co-occurrence patterns ─────────────────────────────────────── */

function CoOccurrencePanel({ co }: { co: CoOcc[] }) {
  return (
    <section style={{ ...PANEL, marginBottom: 0 }}>
      <h4 style={PANEL_TITLE}>Sources that fire together<span style={PANEL_TITLE_SUB}>how often each pair co-occurs on the same project</span></h4>
      {co.length === 0 ? (
        <div style={{ padding: '8px 0', fontSize: 12, color: 'var(--fg-3)' }}>No source pairs co-fire on ≥2 projects.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {co.map((c) => (
            <div key={`${c.source_a}|${c.source_b}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{
                padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                background: `${SOURCE_COLOR[c.source_a] || 'var(--accent)'}22`, color: SOURCE_COLOR[c.source_a] || 'var(--fg-2)',
                border: `1px solid ${SOURCE_COLOR[c.source_a] || 'var(--glass-border)'}55`,
              }}>{SOURCE_LABEL[c.source_a] || c.source_a}</span>
              <span style={{ color: 'var(--fg-3)' }}>+</span>
              <span style={{
                padding: '1px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                background: `${SOURCE_COLOR[c.source_b] || 'var(--accent)'}22`, color: SOURCE_COLOR[c.source_b] || 'var(--fg-2)',
                border: `1px solid ${SOURCE_COLOR[c.source_b] || 'var(--glass-border)'}55`,
              }}>{SOURCE_LABEL[c.source_b] || c.source_b}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: 'var(--fg-2)', fontFamily: 'var(--font-mono)' }}>{c.projects} proj.</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── RAID ↔ signal auto-correlations ──────────────────────────────────── */

function RaidCorrelations({ correlations, onPickProject, onChanged }: { correlations: RaidCorrelation[]; onPickProject: (id: string | null) => void; onChanged: () => void }) {
  if (correlations.length === 0) {
    return (
      <section style={PANEL}>
        <header style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <h4 style={PANEL_TITLE}>RAID ↔ related signals</h4>
        </header>
        <div style={{ padding: '8px 0', fontSize: 12, color: 'var(--fg-3)' }}>
          No open RAID items are correlated with today&apos;s signals. Once a Risk / Assumption / Issue / Dependency is logged on a project that has firing signals (and shares scope or keywords), it surfaces here.
        </div>
      </section>
    );
  }
  return (
    <section style={PANEL}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={PANEL_TITLE}>
          RAID ↔ related signals · {correlations.length} RAID item{correlations.length === 1 ? '' : 's'} with auto-detected correlations
        </h4>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {correlations.map((c) => {
          const raidSev: Severity = (c.raid_severity?.toLowerCase() as Severity) || 'p3';
          return (
            <div key={c.raid_id} style={{ border: '1px solid var(--glass-border)', borderRadius: 6, padding: '10px 12px', background: 'hsl(var(--foreground) / 0.015)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(245,177,74,0.18)', color: '#f5b14a',
                  fontSize: 10, fontWeight: 700,
                }}>{c.raid_type}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                  background: `${SEV_COLOR[raidSev]}24`, color: SEV_COLOR[raidSev],
                }}>{SEV_LABEL[raidSev]}</span>
                <span style={{ color: 'var(--fg-1)', fontSize: 13, fontWeight: 500 }}>{c.raid_title}</span>
                <span style={{ flex: 1 }} />
                <button onClick={() => onPickProject(c.project_id)} title="Filter the feed to this project"
                  style={{ padding: '2px 8px', fontSize: 10, borderRadius: 999, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--fg-2)', cursor: 'pointer' }}>
                  {c.project_name} ↗
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 4 }}>
                {c.links.slice(0, 8).map((l) => (
                  <CorrelationRow key={l.signal_id} raidId={c.raid_id} link={l} onChanged={onChanged} />
                ))}
                {c.links.length > 8 && (
                  <span style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>+ {c.links.length - 8} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CorrelationRow({ raidId, link, onChanged }: { raidId: string; link: RaidCorrelation['links'][number]; onChanged: () => void }) {
  const [busy, setBusy] = useState<null | 'confirm' | 'dismiss'>(null);
  async function act(action: 'confirm' | 'dismiss') {
    setBusy(action);
    try {
      const r = await fetch('/api/risk/correlations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raid_item_id: raidId, signal_id: link.signal_id, action }),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || 'failed');
      onChanged();
    } catch { /* silent — could toast */ } finally { setBusy(null); }
  }
  const confirmed = link.match_kind === 'manual';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '54px minmax(70px, 100px) minmax(90px, 1fr) 50px auto',
      gap: 10, alignItems: 'center', padding: '8px 12px',
      borderRadius: 6,
      background: confirmed ? 'color-mix(in oklab, var(--accent) 5%, transparent)' : 'transparent',
      border: confirmed ? '1px solid color-mix(in oklab, var(--accent) 30%, transparent)' : '1px solid var(--glass-border)',
    }}>
      <SevPill s={link.severity} />
      <SrcPill src={link.source} />
      <a href={link.drill_href || '#'} onClick={(e) => { if (!link.drill_href) e.preventDefault(); }}
        title={link.detail || link.title}
        style={{ color: 'var(--fg-1)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}>
        {link.title}
      </a>
      <span title={`${link.match_kind} match`}
        style={{ fontSize: 10, color: confirmed ? 'var(--accent)' : 'var(--fg-3)', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: confirmed ? 700 : 400 }}>
        {(link.confidence * 100).toFixed(0)}%
      </span>
      <span style={{ display: 'inline-flex', gap: 4 }}>
        <button onClick={() => act('confirm')} disabled={busy !== null || confirmed}
          aria-label={confirmed ? "Relationship confirmed" : "Confirm relationship"} title={confirmed ? 'Confirmed as related' : 'Mark as related'}
          style={{
            width: 24, height: 24, padding: 0, borderRadius: 4,
            cursor: busy || confirmed ? 'default' : 'pointer',
            border: `1px solid ${confirmed ? 'var(--color-success)' : 'var(--glass-border)'}`,
            background: confirmed ? 'rgba(62,207,142,0.18)' : 'transparent',
            color: confirmed ? 'var(--color-success)' : 'var(--fg-3)',
            fontSize: 12, fontWeight: 700, opacity: busy === 'confirm' ? 0.5 : 1,
          }}>✓</button>
        <button onClick={() => act('dismiss')} disabled={busy !== null}
          aria-label="Dismiss relationship" title="Not related: hide this correlation in this demo"
          style={{
            width: 24, height: 24, padding: 0, borderRadius: 4,
            cursor: busy ? 'default' : 'pointer',
            border: '1px solid var(--glass-border)', background: 'transparent',
            color: 'var(--fg-3)', fontSize: 14, fontWeight: 500,
            opacity: busy === 'dismiss' ? 0.5 : 1,
          }}>✕</button>
      </span>
    </div>
  );
}

/* ── Common issues across projects ─────────────────────────────────────── */

function KindGroups({ groups, activeKey, onPick, onPickProject }: {
  groups: KindGroup[]; activeKey: string | null;
  onPick: (key: string) => void;
  onPickProject: (id: string | null) => void;
}) {
  if (groups.length === 0) return null;
  return (
    <section style={PANEL}>
      <h4 style={PANEL_TITLE}>
        Common issues across projects
        <span style={PANEL_TITLE_SUB}>same signal kind firing on multiple projects — click to filter the feed</span>
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {groups.map((g) => {
          const key = `${g.source}|${g.kind}`;
          const active = activeKey === key;
          return (
            <div key={key}
              tabIndex={0} role="button" onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onPick(key)}}} onClick={() => onPick(key)}
              style={{
                display: 'grid', gridTemplateColumns: '100px 1fr auto auto',
                gap: 12, alignItems: 'center', padding: '10px 12px',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
                borderRadius: 6, cursor: 'pointer',
                background: active ? 'color-mix(in oklab, var(--accent) 5%, transparent)' : 'hsl(var(--foreground) / 0.015)',
                transition: 'background 80ms ease',
              }}>
              <SrcPill src={g.source} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'var(--fg-1)', fontSize: 13, fontWeight: 500 }}>
                  {kindLabel(g.kind)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {g.top_projects.map((p) => (
                    <button key={p.project_id}
                      onClick={(e) => { e.stopPropagation(); onPickProject(p.project_id); }}
                      title={`Filter feed to ${p.project_name}`}
                      style={{
                        padding: '1px 8px', borderRadius: 999, fontSize: 10,
                        border: '1px solid var(--glass-border)', background: 'transparent',
                        color: 'var(--fg-2)', cursor: 'pointer', maxWidth: 220,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{p.project_name}</button>
                  ))}
                  {g.n_projects > g.top_projects.length && (
                    <span style={{ fontSize: 10, color: 'var(--fg-3)', padding: '1px 4px' }}>+{g.n_projects - g.top_projects.length} more</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1.1 }}>{g.n_projects}</div>
                <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>projects</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 56 }}>
                {g.n_p1 > 0 ? (
                  <>
                    <div style={{ fontSize: 18, fontWeight: 700, color: SEV_COLOR.p1, lineHeight: 1.1 }}>{g.n_p1}</div>
                    <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>P1</div>
                  </>
                ) : (
                  <span style={{ fontSize: 10, color: 'var(--fg-3)' }}>no P1</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const KIND_LABELS: Record<string, string> = {
  overrun: 'Cost overrun (actual vs forecast)',
  thin_margin: 'Thin or negative margin',
  unmapped_workday: 'Timesheet cost not mapped to WBS',
  open_defects: 'Open QC defects',
  low_pass_rate: 'Low QC pass rate',
  cards_in_qc: 'Cards parked in QC',
  allocation_gap: 'Resourcing gap over next 6 months',
  slip: 'Tasks slipping past baseline',
  pending_sprint_delta: 'Pending sprint deltas',
  open_item: 'Open RAID item',
};
function kindLabel(k: string): string {
  return KIND_LABELS[k] || k.replace(/_/g, ' ');
}

function LiveFeed({ signals, totalCount, source, onSource, severity, onSeverity, project, onProject, kind, onKind }: {
  signals: Signal[]; totalCount: number;
  source: string; onSource: (s: string) => void;
  severity: 'all' | Severity; onSeverity: (s: 'all' | Severity) => void;
  project: string | null; onProject: (p: string | null) => void;
  kind: string | null; onKind: (k: string | null) => void;
}) {
  const sources = useMemo(() => ['all', 'raid', 'cost', 'quality', 'resourcing', 'schedule', 'forecast', 'productivity'], []);
  return (
    <section style={{ ...PANEL, marginBottom: 0 }}>
      <header style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <h4 style={PANEL_TITLE}>
          Signal feed ({signals.length} of {totalCount})
        </h4>
        <span style={{ flex: 1 }} />
        <FilterChips
          options={sources.map((s) => ({ value: s, label: s === 'all' ? 'All' : (SOURCE_LABEL[s] || s), dot: s === 'all' ? undefined : SOURCE_COLOR[s] }))}
          value={source} onChange={onSource}
        />
        <FilterChips
          options={[
            { value: 'all', label: 'All' },
            { value: 'p1', label: 'P1', dot: SEV_COLOR.p1 },
            { value: 'p2', label: 'P2', dot: SEV_COLOR.p2 },
            { value: 'p3', label: 'P3', dot: SEV_COLOR.p3 },
          ]}
          value={severity} onChange={(v) => onSeverity(v as 'all' | Severity)}
        />
        {project && (
          <button onClick={() => onProject(null)}
            style={{ padding: '4px 10px', fontSize: 11, borderRadius: 999, border: '1px solid var(--accent)', background: 'color-mix(in oklab, var(--accent) 12%, transparent)', color: 'var(--accent)', cursor: 'pointer' }}>
            project filter ✕
          </button>
        )}
        {kind && (
          <button onClick={() => onKind(null)} title="Clear kind filter"
            style={{ padding: '4px 10px', fontSize: 11, borderRadius: 999, border: '1px solid var(--accent)', background: 'color-mix(in oklab, var(--accent) 12%, transparent)', color: 'var(--accent)', cursor: 'pointer' }}>
            kind: {kindLabel(kind.split('|')[1] || '')} ✕
          </button>
        )}
      </header>
      {signals.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12 }}>No signals match these filters.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 520, overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: 8 }}>
          {signals.map((s, i) => (
            <a key={s.id} href={s.drill_href || '#'} onClick={(e) => { if (!s.drill_href) e.preventDefault(); }}
              title={s.detail || s.title}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 102px 1fr 130px',
                gap: 14, padding: '12px 14px', alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid var(--glass-border)',
                background: 'transparent',
                textDecoration: 'none', color: 'inherit',
                transition: 'background 80ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'hsl(var(--foreground) / 0.025)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
              <SevPill s={s.severity} />
              <SrcPill src={s.source} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'var(--fg-1)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                <div style={{ color: 'var(--fg-3)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.project_name}{s.detail ? ` — ${s.detail}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ color: 'var(--fg-2)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  {s.metric_unit === '$' ? `$${Math.round(s.metric_value || 0).toLocaleString()}` :
                   s.metric_value != null ? `${Math.round(s.metric_value).toLocaleString()}${s.metric_unit || ''}` : '—'}
                </span>
                <span style={{ color: 'var(--fg-3)', fontSize: 10 }}>
                  {s.age_days === 0 ? 'new today' : `${s.age_days}d old`}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChips({ options, value, onChange }: { options: { value: string; label: string; dot?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{
              padding: '4px 10px', fontSize: 11, borderRadius: 999, cursor: 'pointer',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
              background: active ? 'color-mix(in oklab, var(--accent) 12%, transparent)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--fg-2)',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
            {o.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.dot }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* Tiny shared pill helpers — keeps the row markup readable. */
function SevPill({ s }: { s: Severity }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 999,
      background: `${SEV_COLOR[s]}22`, color: SEV_COLOR[s],
      fontSize: 10, fontWeight: 700, textAlign: 'center', letterSpacing: '0.06em',
    }}>{SEV_LABEL[s]}</span>
  );
}
function SrcPill({ src }: { src: string }) {
  const c = SOURCE_COLOR[src] || 'var(--accent)';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 999, textAlign: 'center',
      background: `${c}1f`, color: c, border: `1px solid ${c}55`,
      fontSize: 10, fontWeight: 600,
    }}>{SOURCE_LABEL[src] || src}</span>
  );
}
