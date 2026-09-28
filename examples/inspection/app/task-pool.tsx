'use client';
// Task pool: which Model tasks exist, per damage-mechanism group and task type, that the optimizer can keep, shift or copy.
// Heatmap (one hue, light → dark = more) with a per-cell tooltip, a detail panel for the selected cell and a table view.
import { Fragment, useMemo, useState } from 'react';
import { Collapsible } from './rankings';
type Any = Record<string, any>;
const money = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? '–' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
const METRICS: Record<string, { label: string; value: (c: Any) => number | null; fmt: (v: number) => string; note: string }> = {
  tasks: { label: 'Model tasks', value: c => c.tasks, fmt: v => v.toLocaleString(), note: 'Tasks credited to in-scope assessments of the group' },
  assessments: { label: 'Assessments credited', value: c => c.assessments, fmt: v => v.toLocaleString(), note: 'In-scope assessments at least one of these tasks credits' },
  changes: { label: 'Proposed changes', value: c => c.moved + c.copied || null, fmt: v => v.toLocaleString(), note: 'Shifts and copies the optimizer proposes with this task type' },
  cost: { label: 'Median task cost', value: c => c.medianCost, fmt: v => money(v), note: 'Median Model cost of the priced tasks' },
};
const GROUP_ORDER = ['Thinning', 'External Thinning', 'CUI', 'Cracking/Metallurgical', 'Creep', 'Overheating'];

export default function TaskPool({ gates, bundles, settings, set }: { gates: Any; bundles: string[]; settings: Any; set: (k: string, v: any) => void }) {
  const [edit, setEdit] = useState(false);
  const [metric, setMetric] = useState('tasks');
  const [view, setView] = useState<'map' | 'table'>('map');
  const [pick, setPick] = useState<string>('');
  const [hover, setHover] = useState<{ key: string; x: number; y: number } | null>(null);
  const cells: Any[] = gates?.poolCells || [];
  const M = METRICS[metric];
  const byKey = useMemo(() => new Map(cells.map(c => [c.group + '|' + c.bundle, c])), [cells]);
  const groups: Any[] = useMemo(() => [...(gates?.poolGroups || [])].sort((a, b) => (GROUP_ORDER.indexOf(a.group) + 1 || 99) - (GROUP_ORDER.indexOf(b.group) + 1 || 99) || b.assessments - a.assessments), [gates]);
  const cols = useMemo(() => bundles.filter(b => edit ? b !== 'Other' : cells.some(c => c.bundle === b)), [bundles, cells, edit]);
  // task pool rules: which task types may affect each group (engine setting poolRules; groups without a rule allow every type but poolDefaultDeny)
  const rules: Any = gates?.poolRules || {};
  const allowed = (g: string, b: string) => { const r = rules[g]; return !r ? true : r.explicit ? r.allowed.includes(b) : !r.denied.includes(b); };
  const explicitMap = () => Object.fromEntries(Object.entries(rules).filter(([, r]: [string, Any]) => r.explicit).map(([g, r]: [string, Any]) => [g, r.allowed]));
  function toggle(g: string, b: string) {
    const r = rules[g], list: string[] = r?.explicit ? r.allowed : bundles.filter(x => x !== 'Other' && !(r?.denied || []).includes(x));
    const next = list.includes(b) ? list.filter(x => x !== b) : [...list, b];
    set('poolRules', { ...(settings.poolRules || explicitMap()), [g]: bundles.filter(x => next.includes(x)) });
  }
  const customised = !!settings.poolRules;
  const max = useMemo(() => Math.max(1, ...cells.map(c => M.value(c) || 0)), [cells, M]);
  if (!cells.length) return null;
  // Sequential scale on a square-root of the share of the largest cell: 5 visible steps of the accent mixed into
  // --heat-base, the theme's own surface, so the ramp runs dark → bright on black and pale → deep on white.
  // A cell past the midpoint gets data-strong, which picks the contrasting text colour for that theme in CSS.
  const shade = (v: number | null) => { if (!v) return null; const s = Math.sqrt(v / max); return Math.round(14 + s * 70); };
  const selected = pick ? byKey.get(pick) : null;
  const hovered = hover ? byKey.get(hover.key) : null;
  const total = (g: string) => cells.filter(c => c.group === g).reduce((s, c) => s + (M.value(c) || 0), 0);
  const colTotal = (b: string) => cells.filter(c => c.bundle === b).reduce((s, c) => s + (M.value(c) || 0), 0);
  const blockedTasks = cells.filter(c => c.blocked).reduce((s, c) => s + c.tasks, 0);

  return <Collapsible id="task-pool" title="Task pool" sub={`${cells.reduce((s, c) => s + c.tasks, 0).toLocaleString()} Model tasks credited to in-scope assessments · ${groups.length} mechanism groups · ${cols.length} task types${blockedTasks ? ` · ${blockedTasks.toLocaleString()} Model tasks blocked by the rules` : ''}${customised ? ' · rules edited' : ''}`} defaultOpen={false}>
    <div className="pool-toolbar">
      <div className="segments" aria-label="Measure">{Object.entries(METRICS).map(([k, m]) => <button key={k} aria-pressed={metric === k} onClick={() => setMetric(k)}>{m.label}</button>)}</div>
      <div className="segments" aria-label="View"><button aria-pressed={view === 'map'} onClick={() => setView('map')}>Heatmap</button><button aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button></div>
      <button className={'chart-reset' + (edit ? ' accent' : '')} aria-pressed={edit} onClick={() => { setEdit(!edit); setView('map'); }}>{edit ? 'Done editing' : '✎ Edit rules'}</button>
      {customised && <button className="chart-reset" onClick={() => set('poolRules', undefined)}>Reset rules to defaults</button>}
      <span className="pool-note">{edit ? 'Click a cell to allow or block that task type for the group.' : M.note}</span>
    </div>
    {edit && <p className="panel-note pool-edit-note">A blocked task type stays in the plan where Model has it, but gives the assessment no credit and is never shifted or copied for it. Defaults: Replace and Clean &amp; inspect credit every group · Thinning also Spot UT, RT, API internal · CUI also API external · Cracking also API internal and Inspect + conditional repair (placeholder for Model&apos;s upgraded Weibull γ) · other groups: all types except Inspect + conditional repair · Planned TAR tasks credit nothing.</p>}
    {view === 'map' ? <div className="pool-wrap">
      <div className="pool-grid" style={{ gridTemplateColumns: `minmax(170px,1.2fr) repeat(${cols.length}, minmax(76px,1fr)) minmax(80px,.8fr)` }} role="grid" aria-label={`Task pool heatmap: ${M.label} by mechanism group and task type`} onMouseLeave={() => setHover(null)}>
        <div className="pool-corner">Mechanism group ↓ · task type →</div>
        {cols.map(b => <div key={b} className="pool-col" title={b}>{b}</div>)}
        <div className="pool-col total">Total</div>
        {groups.map(g => <Fragment key={g.group}>
          <div className="pool-row"><strong>{g.group}</strong><small>{g.assessments.toLocaleString()} assessments</small><small className="pool-rule">{rules[g.group]?.explicit ? 'Only ' + rules[g.group].allowed.join(', ') : 'All types' + (rules[g.group]?.denied?.length ? ' except ' + rules[g.group].denied.join(', ') : '')}</small></div>
          {cols.map(b => {
            const key = g.group + '|' + b, c = byKey.get(key), v = c ? M.value(c) : null, pct = shade(v);
            const ok = allowed(g.group, b);
            const cls = ['pool-cell', pct != null && ok ? 'shaded' : '', !ok ? 'blocked' : '', ok && rules[g.group]?.explicit ? 'preferred' : '', pick === key && !edit ? 'active' : '', !c ? 'empty' : '', edit ? 'editing' : ''].join(' ');
            return <button key={key} className={cls} disabled={!c && !edit} aria-pressed={edit ? ok : undefined} aria-label={`${g.group}, ${b}: ${c ? (v == null ? 'none' : M.fmt(v)) + ' ' + M.label : 'no tasks'}, ${ok ? 'allowed' : 'blocked'}${edit ? ' (click to ' + (ok ? 'block' : 'allow') + ')' : ''}`}
              style={pct != null && ok ? ({ '--heat-pct': pct } as React.CSSProperties) : undefined}
              data-strong={pct != null && ok && pct > 52 ? '1' : undefined}
              onMouseMove={e => c && setHover({ key, x: e.clientX, y: e.clientY })} onFocus={e => { const r = (e.target as HTMLElement).getBoundingClientRect(); c && setHover({ key, x: r.right, y: r.top }); }} onBlur={() => setHover(null)}
              onClick={() => edit ? toggle(g.group, b) : setPick(pick === key ? '' : key)}>
              {c ? <><b>{v == null ? '–' : M.fmt(v)}</b>{!ok ? <small>blocked</small> : c.moved + c.copied ? <small>{c.moved + c.copied} used</small> : null}</> : edit ? <small>{ok ? 'allowed' : 'blocked'}</small> : null}
            </button>;
          })}
          <div className="pool-total">{M.fmt(total(g.group))}</div>
        </Fragment>)}
        <div className="pool-row total"><strong>Total</strong></div>
        {cols.map(b => <div key={b} className="pool-total">{M.fmt(colTotal(b))}</div>)}
        <div className="pool-total">{M.fmt(cells.reduce((s, c) => s + (M.value(c) || 0), 0))}</div>
      </div>
      <div className="pool-legend" aria-hidden="true">
        <span>Fewer</span>{[18, 38, 58, 80].map(v => <i key={v} className="shaded" style={{ '--heat-pct': v } as React.CSSProperties} />)}<span>More</span>
        <span className="sep" /><i className="legend-preferred" /><span>Allowed by an explicit rule</span>
        <span className="sep" /><i className="legend-blocked" /><span>Blocked: no effect on the group</span>
        <span className="sep" /><span>“used” = shifts + copies proposed</span>
      </div>
      {hovered && hover && <div className="pool-tooltip" style={{ left: Math.min(hover.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1600) - 300), top: hover.y + 14 }} role="tooltip">
        <strong>{hovered.group} · {hovered.bundle}</strong>
        <span>{hovered.tasks.toLocaleString()} Model tasks · {hovered.future.toLocaleString()} planned ahead</span>
        <span>{hovered.assessments.toLocaleString()} assessments · {hovered.assets.toLocaleString()} assets</span>
        <span>Median cost {money(hovered.medianCost)} · evidence {hovered.support}</span>
        <span>Proposed: {hovered.moved} shifted · {hovered.copied} copied</span>
        {!allowed(hovered.group, hovered.bundle) ? <em>Blocked for {hovered.group}: kept in the plan without credit</em> : <em>Allowed for {hovered.group}</em>}
        <small>{edit ? 'Click to ' + (allowed(hovered.group, hovered.bundle) ? 'block' : 'allow') : 'Click for the task definitions'}</small>
      </div>}
      {selected && <div className="pool-detail">
        <div className="subhead"><h3>{selected.group} · {selected.bundle}</h3><button className="chart-reset" onClick={() => setPick('')}>Close</button></div>
        <div className="pool-facts">
          <div><span>Model tasks</span><strong>{selected.tasks.toLocaleString()}</strong><small>{selected.future.toLocaleString()} planned ahead</small></div>
          <div><span>Assessments credited</span><strong>{selected.assessments.toLocaleString()}</strong><small>{selected.assets.toLocaleString()} assets</small></div>
          <div><span>Median cost</span><strong>{money(selected.medianCost)}</strong><small>evidence {selected.support}</small></div>
          <div><span>Proposed changes</span><strong>{(selected.moved + selected.copied).toLocaleString()}</strong><small>{selected.moved} shifted · {selected.copied} copied</small></div>
        </div>
        {!allowed(selected.group, selected.bundle) && <p className="panel-note amber">The task pool blocks {selected.bundle} for {selected.group}: Model credits these tasks, but the optimizer gives them no effect on these assessments and never shifts or copies them (Edit rules to change).</p>}
        <div className="pool-defs">{selected.definitions.map(([d, n]: [string, number]) => <div key={d}><span>{d}</span><i style={{ width: `${Math.max(2, n / selected.definitions[0][1] * 100)}%` }} /><b>{n.toLocaleString()}</b></div>)}</div>
      </div>}
    </div> : <div className="table-wrap"><table><thead><tr><th>Mechanism group</th><th>Task type</th><th>Tasks</th><th>Planned ahead</th><th>Assessments</th><th>Assets</th><th>Median cost</th><th>Proposed shifts</th><th>Proposed copies</th><th>Rule</th><th>Top definitions</th></tr></thead><tbody>
      {[...cells].sort((a, b) => a.group.localeCompare(b.group) || b.tasks - a.tasks).map(c => <tr key={c.group + c.bundle}><td>{c.group}</td><td>{c.bundle}</td><td className="numeric">{c.tasks.toLocaleString()}</td><td className="numeric">{c.future.toLocaleString()}</td><td className="numeric">{c.assessments.toLocaleString()}</td><td className="numeric">{c.assets.toLocaleString()}</td><td className="numeric">{money(c.medianCost)}</td><td className="numeric">{c.moved}</td><td className="numeric">{c.copied}</td><td>{allowed(c.group, c.bundle) ? 'Allowed' : 'Blocked'}</td><td><small>{c.definitions.slice(0, 3).map(([d, n]: [string, number]) => `${d} (${n})`).join(' · ')}</small></td></tr>)}
    </tbody></table></div>}
  </Collapsible>;
}
