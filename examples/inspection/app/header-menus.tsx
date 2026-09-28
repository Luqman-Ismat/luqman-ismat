'use client';
// Top-bar popovers. Two things used to take a full band of the page each: the check-engine / Model-data
// card strips, and the planning settings. Both are reference material rather than reading material, so they
// live behind a button here and the page itself starts at the analysis.
import { useEffect, useRef, useState } from 'react';
import { HOLDS, holdsOf } from '../lib/labels.mjs';
type Any = Record<string, any>;

export function HeaderMenu({ id, label, badge, badgeColor, wide, title, children }:
  { id: string; label: React.ReactNode; badge?: number; badgeColor?: string; wide?: boolean; title?: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return <div className="header-menu" ref={box}>
    <button className={'header-menu-button' + (open ? ' open' : '')} aria-expanded={open} aria-haspopup="dialog" title={title} onClick={() => setOpen(!open)}>
      {label}{badge ? <span className={'menu-badge ' + (badgeColor || 'teal')}>{badge.toLocaleString()}</span> : null}<span className="chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <div className={'header-panel' + (wide ? ' wide' : '')} role="dialog" aria-label={typeof label === 'string' ? label : id}>{children(() => setOpen(false))}</div>}
  </div>;
}

// Every finding the run produced, as counts only: severity groups from the check engine, Model's own data
// findings, and the review holds. Picking one filters the assessments table, exactly as the old cards did.
export function ChecksMenu({ run, results, check, onPickCheck, hold, onPickHold }:
  { run: Any; results: Any[]; check: string; onPickCheck: (code: string) => void; hold: string; onPickHold: (code: string) => void }) {
  const checks = Object.values(run?.checkSummary || {}) as Any[];
  const sample = Object.values(run?.sampleDataSummary || {}) as Any[];
  const holdCount = (code: string) => results.filter(r => holdsOf(r).some((h: Any) => h.code === code)).length;
  const errors = checks.filter(c => c.severity === 'error' && c.assessments);
  const warns = checks.filter(c => c.severity === 'warn' && c.assessments);
  const infos = checks.filter(c => c.severity === 'info' && c.assessments);
  const data = sample.filter(c => c.assessments).sort((a, b) => b.assessments - a.assessments);
  const holds = HOLDS.map(h => ({ ...h, count: holdCount(h.code) })).filter(h => h.count);
  const passed = checks.filter(c => !c.assessments).length;
  const held = results.filter(r => r.exportHold).length;
  const errorTotal = errors.reduce((s, c) => s + c.assessments, 0);
  const groups: [string, string, Any[]][] = [
    ['Errors', 'Held from the Model import', errors.map(c => ({ key: c.code, label: c.label, count: c.assessments, tone: 'red', pick: () => onPickCheck(check === c.code ? '' : c.code), on: check === c.code }))],
    ['Warnings', 'Review, still exported', warns.map(c => ({ key: c.code, label: c.label, count: c.assessments, tone: 'amber', pick: () => onPickCheck(check === c.code ? '' : c.code), on: check === c.code }))],
    ['Information', 'No action needed', infos.map(c => ({ key: c.code, label: c.label, count: c.assessments, tone: 'blue', pick: () => onPickCheck(check === c.code ? '' : c.code), on: check === c.code }))],
    ['Review holds', `${held.toLocaleString()} assessments held from the import`, holds.map(h => ({ key: h.code, label: h.label, count: h.count, tone: h.color, pick: () => onPickHold(hold === h.code ? '' : h.code), on: hold === h.code }))],
    ['Model data', 'Fix these in Model · no effect on results', data.map(c => ({ key: c.code, label: c.label, count: c.assessments, tone: 'blue', pick: () => onPickCheck(check === 'nd:' + c.code ? '' : 'nd:' + c.code), on: check === 'nd:' + c.code }))],
  ];
  const any = groups.some(g => g[2].length);
  return <HeaderMenu id="checks" label="Checks" badge={errorTotal || undefined} badgeColor="red" title="Check engine, review holds and Model data findings">
    {close => <>
      <div className="panel-head"><strong>Checks and Model data</strong><span>{passed.toLocaleString()} of {checks.length} checks pass everywhere{run?.solved ? ` · solver re-planned ${run.solved.improved.toLocaleString()} of ${run.solved.tried.toLocaleString()}` : ''}</span></div>
      <div className="menu-groups">
        {groups.filter(g => g[2].length).map(([title, sub, items]) => <div className="menu-group" key={title}>
          <div className="menu-group-head"><strong>{title}</strong><small>{sub}</small></div>
          {items.map((i: Any) => <button key={i.key} className={'menu-row' + (i.on ? ' on' : '')} aria-pressed={i.on} onClick={() => { i.pick(); close(); }}>
            <span className={'menu-dot ' + i.tone} aria-hidden="true" /><span className="menu-row-label">{i.label}</span><b>{i.count.toLocaleString()}</b>
          </button>)}
        </div>)}
        {!any && <p className="panel-note">Nothing flagged in this run.</p>}
      </div>
      {(check || hold) && <div className="panel-foot"><button className="link" onClick={() => { onPickCheck(''); onPickHold(''); close(); }}>Clear the filter</button></div>}
    </>}
  </HeaderMenu>;
}

// The scenario on screen. Switching is all most people need here; loading a scenario from Model needs the
// local data service and lives in the settings panel with the rest of the data controls.
export function ScenarioPicker({ sid, run, installed, onOpen }: { sid: string; run: Any | null; installed: Any[]; onOpen: (id: string) => void }) {
  const list = [...installed].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return <label className="header-scenario">
    <span className="sr-only">Scenario</span>
    <select aria-label="Scenario" value={sid} onChange={e => e.target.value !== sid && onOpen(e.target.value)} title={run ? `${run.scenarioName} · data as of ${run.today}` : 'Scenario'}>
      {!list.some(s => String(s.id) === sid) && <option value={sid}>Scenario {sid}</option>}
      {list.map(s => <option key={s.id} value={String(s.id)}>{s.name} · {s.id}</option>)}
    </select>
  </label>;
}
