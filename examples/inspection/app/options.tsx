'use client';
// Options carried over from the first website: task-type effects, renewal / category / engineering defaults, chain limits,
// the check-engine summary and the per-assessment detail drawer.
import { useState } from 'react';
import { Collapsible } from './rankings';
type Any = Record<string, any>;
const short = (c: string) => (c || '').split(' | ').slice(1).join(' · ') || c;
const money = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? '–' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
const SEVERITY_COLOR: Record<string, string> = { error: 'red', warn: 'amber', info: 'blue' };

const EFFECTS: [string, string, string][] = [
  ['measured', 'Measured', "Model's own transform: the β, η and γ change its stored curves show after this task type"],
  ['inspection', 'Inspection', 'Inspection script: pins the curve at the inspection threshold and raises β'],
  ['renewal', 'Renewal', 'Restarts the base Weibull at the task date (as new)'],
  ['none', 'No credit', 'The task stays in the plan but does not change the curve'],
];
const ADV_TABS = ['Task types', 'Category defaults', 'Engineering scope', 'Rules & limits', 'Definition map'] as const;

export function AdvancedDefaults({ options, settings, set, bundles, setBundles }: { options: Any; settings: Any; set: (k: string, v: any) => void; bundles: Any; setBundles: (b: Any) => void }) {
  const [tab, setTab] = useState<(typeof ADV_TABS)[number]>('Task types');
  const [query, setQuery] = useState('');
  const [only, setOnly] = useState<'all' | 'used' | 'changed'>('used');
  if (!options) return null;
  const names: string[] = [...options.bundles, 'Unlisted repair date'];
  const base = (n: string) => options.effective[n] || { execution: 'outage', effect: 'none' };
  const eff = (n: string) => bundles[n] || base(n);
  const setBundle = (n: string, k: string, v: string) => { const next = { ...eff(n), [k]: v }; const b = base(n); const rest = { ...bundles }; if (next.execution === b.execution && next.effect === b.effect) delete rest[n]; else rest[n] = next; setBundles(rest); };
  const resetBundle = (n: string) => { const rest = { ...bundles }; delete rest[n]; setBundles(rest); };
  const defs: [string, string][] = options.definitions;
  const engineering: string[] = options.categories.filter((c: Any) => !c.eligible.length).map((c: Any) => c.category);
  const planning: Any[] = options.categories.filter((c: Any) => c.eligible.length);
  const d = options.defaults;
  const byCat = settings.defaultByCategory || d.defaultByCategory || {};
  const defByCat = settings.definitionByCategory || {};
  const engByCat = settings.engineeringByCategory || {};
  const num = (k: string) => settings[k] ?? d[k];
  const limitChanged = (k: string) => settings[k] != null && settings[k] !== d[k];
  const catChanged = (c: string) => !!defByCat[c] || (byCat[c] && byCat[c] !== (d.defaultByCategory || {})[c]);
  const changes = Object.keys(bundles).length + ['maxBeta', 'maxSteps', 'minLife'].filter(limitChanged).length + planning.filter((c: Any) => catChanged(c.category)).length
    + Object.keys(engByCat).length + (settings.renewalDefinition || (settings.renewalBundle && settings.renewalBundle !== d.renewalBundle) ? 1 : 0);
  const shown = names.filter(n => (!query || n.toLowerCase().includes(query.toLowerCase())) && (only === 'all' || (only === 'used' ? (options.eventCounts[n] || 0) > 0 || bundles[n] : !!bundles[n])));
  const counts: Record<string, number> = { 'Task types': Object.keys(bundles).length, 'Category defaults': planning.filter((c: Any) => catChanged(c.category)).length, 'Engineering scope': Object.keys(engByCat).length, 'Rules & limits': ['maxBeta', 'maxSteps', 'minLife'].filter(limitChanged).length + (settings.renewalDefinition || (settings.renewalBundle && settings.renewalBundle !== d.renewalBundle) ? 1 : 0), 'Definition map': 0 };
  const taskSelect = (value: string, onChange: (v: string) => void, filter?: (b: string) => boolean) => <select value={value} onChange={e => onChange(e.target.value)}>
    <optgroup label="Task types">{names.filter(n => !filter || filter(n)).map(n => <option key={n} value={n}>{n}</option>)}</optgroup>
    <optgroup label="Exact Model task definitions">{defs.filter(([, b]) => !filter || filter(b)).map(([def]) => <option key={def} value={'sample:' + def}>{def}</option>)}</optgroup>
  </select>;
  const resetAll = () => { setBundles({}); for (const k of ['maxBeta', 'maxSteps', 'minLife', 'renewalBundle']) set(k, d[k]); set('renewalDefinition', null); set('defaultByCategory', d.defaultByCategory); set('definitionByCategory', {}); set('engineeringByCategory', {}); };

  return <Collapsible id="advanced" title="Advanced task defaults" sub={changes ? `${changes} change${changes === 1 ? '' : 's'} from the defaults · task types, category defaults, engineering scope, rules and limits` : 'All defaults · task types, category defaults, engineering scope, rules and limits'} defaultOpen={false}>
    <div className="adv">
      <div className="adv-head">
        <div className="segments adv-tabs" role="tablist">{ADV_TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}{counts[t] ? <span className="adv-count">{counts[t]}</span> : null}</button>)}</div>
        <button className="chart-reset" onClick={resetAll} disabled={!changes}>Reset all to defaults</button>
      </div>

      {tab === 'Task types' && <>
        <div className="adv-filter">
          <input type="search" placeholder="Find a task type" value={query} onChange={e => setQuery(e.target.value)} aria-label="Find a task type" />
          <div className="segments">{([['used', 'In this scenario'], ['changed', 'Changed'], ['all', 'All']] as const).map(([k, l]) => <button key={k} aria-pressed={only === k} onClick={() => setOnly(k)}>{l}</button>)}</div>
          <span className="panel-note">How each task type is carried out and what it does to the risk curve when the optimizer keeps, shifts or copies it.</span>
        </div>
        <div className="adv-cards">{shown.map(n => {
          const b = eff(n), t = options.transforms[n], changed = !!bundles[n], events = options.eventCounts[n] || 0, e = EFFECTS.find(x => x[0] === b.effect);
          return <div key={n} className={'adv-card' + (changed ? ' changed' : '')}>
            <div className="adv-card-head"><strong>{n}</strong><span>{events ? `${events.toLocaleString()} Model events` : 'not in this scenario'}</span>{changed && <button className="link" onClick={() => resetBundle(n)}>Reset</button>}</div>
            <div className="adv-field"><span>Execution</span><div className="segments small">
              <button aria-pressed={b.execution === 'outage'} onClick={() => setBundle(n, 'execution', 'outage')} title="Needs the asset down: placed in a turnaround window">Outage</button>
              <button aria-pressed={b.execution === 'online'} onClick={() => setBundle(n, 'execution', 'online')} title="Done in service: placed at the deadline, joining a TAR only when one is close">Online</button>
            </div></div>
            <div className="adv-field"><span>Effect on the curve</span><div className="segments small">{EFFECTS.map(([k, l, tip]) => <button key={k} aria-pressed={b.effect === k} onClick={() => setBundle(n, 'effect', k)} title={tip}>{l}</button>)}</div></div>
            <p className="adv-explain">{e?.[2]}{b.effect === 'inspection' ? ` (pin ${Math.round((settings.inspectionThreshold || .9) * 100)} %)` : ''}</p>
            {b.effect === 'measured' && (t ? <div className="adv-chips"><span title="β after ÷ β before">β × {t.rb.toFixed(2)}</span><span title="η after ÷ η before">η × {t.re.toFixed(2)}</span><span title="share of the distance to the task day by which γ moves">γ shift {t.gs.toFixed(2)}</span><span>{t.n} measured events</span></div> : <div className="adv-chips warn"><span>No Model event to measure: falls back to the inspection script</span></div>)}
          </div>;
        })}{!shown.length && <p className="empty">No task types match.</p>}</div>
      </>}

      {tab === 'Category defaults' && <div className="adv-rows">
        <p className="panel-note">Used only when no task in the current plan credits an assessment. Preferred types are the mechanism's own inspection types; the optimizer copies those first.</p>
        {planning.map((c: Any) => {
          const value = defByCat[c.category] ? 'sample:' + defByCat[c.category] : byCat[c.category] || d.defaultBundle;
          return <div key={c.category} className={'adv-row' + (catChanged(c.category) ? ' changed' : '')}>
            <div><strong>{c.category}</strong><div className="adv-chips">{c.eligible.map((b: string) => <span key={b}>{b}</span>)}</div></div>
            <label>Default task{taskSelect(value, v => { if (v.startsWith('sample:')) { const def = v.slice(7); set('definitionByCategory', { ...defByCat, [c.category]: def }); set('defaultByCategory', { ...byCat, [c.category]: defs.find(x => x[0] === def)?.[1] }); } else { const { [c.category]: _, ...rest } = defByCat; set('definitionByCategory', rest); set('defaultByCategory', { ...byCat, [c.category]: v }); } })}</label>
            {catChanged(c.category) ? <button className="link" onClick={() => { const { [c.category]: _, ...rest } = defByCat; set('definitionByCategory', rest); set('defaultByCategory', { ...byCat, [c.category]: (d.defaultByCategory || {})[c.category] }); }}>Reset</button> : <span />}
          </div>;
        })}
      </div>}

      {tab === 'Engineering scope' && <div className="adv-rows">
        <p className="panel-note">Categories without a mechanism-specific inspection type go to engineering review. Choosing a Model task here lets the optimizer propose it; those changes stay unverified until Model supplies an assessment-specific effect.</p>
        {engineering.map(c => <div key={c} className={'adv-row' + (engByCat[c] ? ' changed' : '')}>
          <div><strong>{c}</strong><small>{engByCat[c] ? `Candidate scope: ${engByCat[c].definition} (${engByCat[c].bundle})` : 'Engineering review · no scope selected'}</small></div>
          <label>Candidate scope<select value={engByCat[c]?.definition || ''} onChange={e => { const v = e.target.value; const next = { ...engByCat }; if (v) next[c] = { definition: v, bundle: defs.find(x => x[0] === v)?.[1] }; else delete next[c]; set('engineeringByCategory', next); }}><option value="">Engineering review · no scope</option>{defs.map(([def]) => <option key={def} value={def}>{def}</option>)}</select></label>
          {engByCat[c] ? <button className="link" onClick={() => { const next = { ...engByCat }; delete next[c]; set('engineeringByCategory', next); }}>Reset</button> : <span />}
        </div>)}
      </div>}

      {tab === 'Rules & limits' && <div className="adv-rules">
        <div className="adv-rule">
          <div><strong>Which task types affect which mechanisms</strong><small>Set in the Task pool section (✎ Edit rules). Defaults: Replace and Clean & inspect credit every group · Thinning also Spot UT, RT, API internal · CUI also API external · Cracking also API internal and Inspect + conditional repair · other groups: all types except Inspect + conditional repair · Planned TAR tasks credit nothing.</small></div>
          <small>{settings.poolRules ? 'Rules edited in the task pool' : 'Default rules'}</small>
        </div>
        <div className={'adv-rule' + (settings.renewalDefinition || (settings.renewalBundle && settings.renewalBundle !== d.renewalBundle) ? ' changed' : '')}>
          <div><strong>Renewal task</strong><small>The task used when an assessment needs a restart (repair or replacement).</small></div>
          {taskSelect(settings.renewalDefinition ? 'sample:' + settings.renewalDefinition : settings.renewalBundle || d.renewalBundle, v => { if (v.startsWith('sample:')) { const def = v.slice(7); set('renewalDefinition', def); set('renewalBundle', defs.find(x => x[0] === def)?.[1]); } else { set('renewalDefinition', null); set('renewalBundle', v); } })}
        </div>
        {([['minLife', 'Minimum useful life', 'days', 'A task that buys less life than this gets no credit; if nothing in the plan buys more, the assessment goes to engineering scope.', 0, 3650, 30],
           ['maxSteps', 'Chain steps', 'tasks', 'The most tasks the optimizer places per assessment.', 1, 30, 1],
           ['maxBeta', 'Max β after inspection', '', 'Cap on the Weibull shape after an inspection (MAX_BETA in weibull_inspection.py).', 2, 200, 1]] as const).map(([k, label, unit, help, min, maxv, step]) => <div key={k} className={'adv-rule' + (limitChanged(k) ? ' changed' : '')}>
          <div><strong>{label}</strong><small>{help}</small></div>
          <div className="adv-number"><input type="number" min={min} max={maxv} step={step} value={num(k)} onChange={e => set(k, Number(e.target.value))} aria-label={label} /><span>{unit}</span><small>default {d[k]}</small>{limitChanged(k) && <button className="link" onClick={() => set(k, d[k])}>Reset</button>}</div>
        </div>)}
      </div>}

      {tab === 'Definition map' && <DefinitionMap defs={defs} />}
    </div>
  </Collapsible>;
}

function DefinitionMap({ defs }: { defs: [string, string][] }) {
  const [q, setQ] = useState('');
  const rows = defs.filter(([d, b]) => !q || (d + ' ' + b).toLowerCase().includes(q.toLowerCase()));
  const byType = rows.reduce((m: Record<string, string[]>, [d, b]) => { (m[b] ||= []).push(d); return m; }, {});
  return <div className="adv-map">
    <div className="adv-filter"><input type="search" placeholder="Find a Model task definition" value={q} onChange={e => setQ(e.target.value)} aria-label="Find a Model task definition" /><span className="panel-note">{rows.length} of {defs.length} Model task definitions, grouped by the task type the optimizer treats them as.</span></div>
    <div className="adv-map-grid">{Object.entries(byType).sort((a, b) => b[1].length - a[1].length).map(([b, ds]) => <div key={b} className="adv-map-group"><strong>{b} <small>{ds.length}</small></strong><ul>{ds.map(x => <li key={x}>{x}</li>)}</ul></div>)}</div>
  </div>;
}

export function EngineChecks({ summary, solved, active, onPick }: { summary: Any; solved?: Any; active: string; onPick: (code: string) => void }) {
  if (!summary) return null;
  const all = Object.values(summary) as Any[], hit = all.filter(c => c.assessments || c.before), passed = all.filter(c => !c.assessments && !c.before);
  const remaining = hit.filter(c => c.assessments), resolved = all.reduce((s, c) => s + (c.resolved || 0), 0);
  const order = ['error', 'warn', 'info'];
  return <Collapsible id="checks" title="Check engine" sub={`${all.length} checks · ${passed.length} passed · ${remaining.length} still flagged${solved ? ` · solver re-planned ${solved.improved.toLocaleString()} of ${solved.tried.toLocaleString()} flagged assessments (${resolved.toLocaleString()} findings cleared)` : ''}`}>
    <div className="card-row holds">{hit.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || b.assessments - a.assessments).map(c => <button key={c.code} aria-pressed={active === c.code} className={'glass kpi-card ' + (c.assessments ? SEVERITY_COLOR[c.severity] : 'green') + (active === c.code ? ' active' : '')} onClick={() => onPick(active === c.code ? '' : c.code)}>
      <span className="kpi-label">{c.label}</span>
      <strong>{c.assessments.toLocaleString()}<small>{c.assessments ? 'left' : 'solved'}</small></strong>
      <small>{c.solvable ? (c.before ? `${c.before.toLocaleString()} found · ${c.resolved.toLocaleString()} solved` : 'Solvable') : 'Data finding · flagged only'}</small>
      <small className={c.severity === 'error' && c.assessments ? 'red-text' : ''}>{c.severity === 'error' ? 'Error · held from export' : c.severity === 'warn' ? 'Warning · review' : 'Information'}</small>
    </button>)}</div>
    <p className="panel-note check-passed">Passed everywhere: {passed.map(c => c.label).join(' · ') || 'none'}</p>
  </Collapsible>;
}

// Model's own data, as the optimizer found it: findings to fix in Model. They never change a result (filter code prefix "nd:").
export function ModelData({ summary, active, onPick }: { summary: Any; active: string; onPick: (code: string) => void }) {
  if (!summary) return null;
  const all = Object.values(summary) as Any[], hit = all.filter(c => c.assessments).sort((a, b) => b.assessments - a.assessments), clean = all.filter(c => !c.assessments);
  return <Collapsible id="sample-data" title="Model data" sub={`${hit.length} of ${all.length} data findings present · results reflect Model as it is; fix these in Model`}>
    <div className="card-row holds">{hit.map(c => <button key={c.code} aria-pressed={active === 'nd:' + c.code} className={'glass kpi-card blue' + (active === 'nd:' + c.code ? ' active' : '')} onClick={() => onPick(active === 'nd:' + c.code ? '' : 'nd:' + c.code)}>
      <span className="kpi-label">{c.label}</span>
      <strong>{c.assessments.toLocaleString()}<small>{c.assessments === 1 ? 'assessment' : 'assessments'}</small></strong>
      <small>Model data · no effect on results</small>
    </button>)}</div>
    {clean.length > 0 && <p className="panel-note check-passed">Not found: {clean.map(c => c.label).join(' · ')}</p>}
  </Collapsible>;
}

export function AssessmentDrawer({ r, today, settings, colSpan }: { r: Any; today: string; settings: Any; colSpan: number }) {
  const a = r.a, w = r.worstCml, f = a.fit;
  return <tr className="drawer-row"><td colSpan={colSpan}><div className="drawer">
    <p><b>{a.asset?.name}</b> · {a.component} · {a.mechanism} · CoF HSE {money(a.cofHse)} / ECON {money(a.cofEcon)} · {a.scope === 'fixed' ? 'fixed equipment / piping' : 'interval-driven'}{a.url && <> · <a href={a.url} target="_blank" rel="noopener noreferrer">Open in Model</a></>}</p>
    <p>Risk limits: {(r.gov?.all || []).map((x: Any) => `${x.m.toUpperCase()} ${money(settings[x.m])} (PoF ${(x.L * 100).toFixed(3)} %)`).join(' · ') || 'no HSE or ECON risk curve'}{r.gov?.measure ? ` → governing ${r.gov.measure.toUpperCase()}` : ''}. Breach {r.b0Date || 'none in horizon'}{r.alreadyBreached ? ' (already breached)' : ''}. Model stored critical date {a.sampleCritical?.unmitEarliest || '–'}; Model mitigated crossing {r.storedMitBreach || '–'}.</p>
    {r.a.cofSource && Object.keys(r.a.cofSource).length > 0 && <p className="panel-note">Consequence from Model&apos;s risk curve: {(Object.entries(r.a.cofSource) as [string, Any][]).map(([k, c]) => `${k.toUpperCase()} ${money(c.sample)}${c.missing ? ' (none in the model)' : c.varies ? ` (Model ${money(c.min)}–${money(c.max)} over time)` : ` (model ${money(c.model)})`}`).join(' · ')}</p>}
    {w ? <p className="mono">Governing CML {w.clientId}: β {w.beta?.toFixed?.(3)} · η {Math.round(w.eta).toLocaleString()} d · γ {Math.round(w.gamma).toLocaleString()} d{w.readings != null ? ` · ${w.readings} readings` : ''}{w.thickness != null ? ` · ${w.thickness} → ${w.limit} in` : ''}{w.medianRateMpy != null ? ` · ${w.medianRateMpy} mpy` : ''} · of {r.cmlCount} CMLs</p>
      : f ? <p className="mono">Assessment Weibull fit: β {f.beta} · η {f.eta} d · γ {f.gamma} d · R² {f.r2}</p> : <p className="amber">No Weibull fit.</p>}
    {r.bucket === 'Engineering scope' && <p className="purple">Engineering scope · why: {r.reason}</p>}
    {r.resolution && <p className="teal-text">Check engine re-planned this assessment ({r.resolution.label}): cleared {r.resolution.fixed.join(', ') || 'lower-severity findings'}; days above the limit {r.resolution.daysAboveBefore} → {r.resolution.daysAboveAfter}.</p>}
    {(r.checks || []).length > 0 && <div className="drawer-checks">{r.checks.map((c: Any, i: number) => <span key={i} className={'badge ' + SEVERITY_COLOR[c.severity]} title={c.detail}>{c.label}: {c.detail}</span>)}</div>}
    {(r.sampleData || []).length > 0 && <div className="drawer-checks">{r.sampleData.map((c: Any, i: number) => <span key={i} className="badge blue" title={c.detail}>Model data · {c.label}: {c.detail}</span>)}</div>}
    {(r.notes || []).length > 0 && <p className="panel-note">{r.notes.join(' · ')}</p>}
    <div className="drawer-tables">
      <div><h4>Current plan · credited tasks</h4>{(r.current?.events || []).length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Task</th><th>Window</th><th>Slack</th><th>Class</th><th>Life (model)</th><th>Life (Model)</th><th>Next breach</th></tr></thead><tbody>{r.current.events.map((e: Any, i: number) => <tr key={i}><td className="numeric">{e.date}</td><td>{e.definitions?.[0] || e.bundle}<small>{(e.taskNumbers || []).join(', ')}</small></td><td>{e.window || 'between TARs'}</td><td className="numeric">{e.slack ?? '–'}</td><td>{e.class}</td><td className="numeric">{e.life ?? '–'}</td><td className="numeric">{e.sampleLife == null ? '–' : e.sampleLife === Infinity ? '> ' + e.censoredDays : e.sampleLife}</td><td className="numeric">{e.breachAfter || '–'}</td></tr>)}</tbody></table></div> : <p className="panel-note">No credited task after today.</p>}</div>
      <div><h4>Proposed chain · margin {settings.margin} d</h4>{r.proposed.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Status</th><th>Task</th><th>Window</th><th>Breach it precedes</th><th>Exposure</th><th>Life after</th><th>Next breach</th><th>β · η · γ after</th></tr></thead><tbody>{r.proposed.map((p: Any, i: number) => <tr key={i} className={p.kept ? 'muted-row' : ''}><td className="numeric">{p.date}</td><td>{p.kept ? 'kept' : p.moved ? `shifted from ${p.movedFrom}` : 'copy'}</td><td>{p.definitions?.[0] || p.bundle}<small>{(p.taskNumbers || []).join(', ') || (p.copyOf?.taskNumbers || []).join(', ')}</small><small>{p.evidence}</small></td><td>{p.window} · {p.execution}</td><td className="numeric">{p.breachBefore || '–'}</td><td className={'numeric ' + (p.exposureDays ? 'red-text' : '')}>{p.exposureDays || 0}</td><td className="numeric">{p.life ?? '–'}</td><td className="numeric">{p.breachAfter || '–'}</td><td className="numeric">{p.params ? `${p.params.beta?.toFixed(2)} · ${Math.round(p.params.eta)} · ${Math.round(p.params.gamma || 0)}` : '–'}</td></tr>)}</tbody></table></div> : <p className="panel-note">Nothing to schedule.</p>}</div>
    </div>
  </div></td></tr>;
}
export { short };
