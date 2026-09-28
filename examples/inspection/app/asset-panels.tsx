'use client';
import { useState } from 'react';
import { bucketColor } from '../lib/labels.mjs';
import { proposedTasksForAsset } from '../lib/exports.mjs';
type Any = Record<string, any>;
const DAY = 86400000;
const ms = (s: string) => Date.parse(s.slice(0, 10));
const short = (c: string) => (c || '').split(' | ').slice(1).join(' · ') || c;

// Asset visit plan: current credited tasks and the proposed plan per assessment on one timeline.
export function VisitPlan({ rows, windows, today, horizon }: { rows: Any[]; windows: Any[]; today: string; horizon: string }) {
  if (!rows.length) return <p className="empty">No assessments in scope on this asset.</p>;
  const Wd = 1100, rh = 58, L = 290, R = 20, T = 30, B = 26, Ht = T + rows.length * rh + B;
  const t0 = ms(today) - 200 * DAY, t1 = ms(horizon);
  const X = (t: number) => L + Math.max(0, Math.min(1, (t - t0) / (t1 - t0))) * (Wd - L - R);
  const years: number[] = []; for (let y = new Date(t0).getUTCFullYear(); y <= new Date(t1).getUTCFullYear(); y++) if (Date.UTC(y, 0, 1) >= t0) years.push(y);
  const exposed = rows.filter(r => r.proposed.some((p: Any) => p.exposureDays));
  return <div className="visit-plan">
    <p className="panel-note"><span className="dot-key blue" /> current credited task <span className="dot-key amber tri" /> proposed outage task <span className="dot-key purple dia" /> proposed online task <span className="dot-key pink bar" /> breach · red band = exposure before the task</p>
    <div className="table-wrap"><svg viewBox={`0 0 ${Wd} ${Ht}`} style={{ minWidth: 760, width: '100%' }}>
      {years.filter(y => y % 2 === 0).map(y => <g key={y}><line x1={X(Date.UTC(y, 0, 1))} x2={X(Date.UTC(y, 0, 1))} y1={T - 8} y2={Ht - B} stroke="#2e2e33" /><text x={X(Date.UTC(y, 0, 1))} y={Ht - 8} fill="#969aa3" fontSize="11" textAnchor="middle">{y}</text></g>)}
      {windows.map(w => <rect key={w.id} x={X(ms(w.start))} y={T - 8} width={Math.max(2, X(ms(w.end || w.start)) - X(ms(w.start)))} height={Ht - T - B + 8} fill="#b7a15f" opacity=".18"><title>{w.name} · {w.start} → {w.end}</title></rect>)}
      <line x1={X(ms(today))} x2={X(ms(today))} y1={T - 8} y2={Ht - B} stroke="#d2d2d6" strokeDasharray="4 5" />
      {rows.map((r, i) => {
        const y = T + i * rh + rh / 2 + 8, cy = y - 19;
        return <g key={r.id}>
          <text x={L - 10} y={cy + 4} textAnchor="end" fill="#80bfff" fontSize="11">Current</text>
          {(r.current?.events || []).filter((e: Any) => e.date >= today && e.date <= horizon).map((e: Any, k: number) => <circle key={k} cx={X(ms(e.date))} cy={cy} r="5" fill="#4ea6ff"><title>Current · {e.definitions?.[0] || e.bundle} · {e.date} · {(e.taskNumbers || []).join(', ')}</title></circle>)}
          <text x={L - 10} y={y + 4} textAnchor="end" fill="#dcdde1" fontSize="11.5">{short(r.a.component).slice(0, 30)} <tspan fill="#f0c451">Proposed</tspan></text>
          {r.b0Date && <line x1={X(ms(r.alreadyBreached ? today : r.b0Date))} x2={X(ms(r.alreadyBreached ? today : r.b0Date))} y1={y - 8} y2={y + 8} stroke="#ff4d8f" strokeWidth="2"><title>breach {r.b0Date}</title></line>}
          {r.proposed.filter((p: Any) => !p.kept).map((p: Any, k: number) => {
            const px = X(ms(p.date));
            return <g key={k}>
              {p.exposureDays > 0 && p.breachBefore && <rect x={Math.min(px, X(ms(p.breachBefore)))} y={y - 5} width={Math.max(2, Math.abs(px - X(ms(p.breachBefore))))} height="10" fill="#e0362f" opacity=".45"><title>exposure {p.exposureDays} d</title></rect>}
              {p.execution === 'online'
                ? <polygon points={`${px},${y - 7} ${px + 7},${y} ${px},${y + 7} ${px - 7},${y}`} fill="#c98ff5"><title>{p.definitions?.[0] || p.bundle} · {p.date} · online</title></polygon>
                : <polygon points={`${px},${y - 7} ${px + 7},${y + 5} ${px - 7},${y + 5}`} fill={p.note ? '#f28b2b' : '#f0c451'}><title>{p.definitions?.[0] || p.bundle} · {p.date} · {p.window}</title></polygon>}
            </g>;
          })}
          {(r.bucket === 'Engineering scope' || r.exportHold) && <text x={Wd - R} y={y + 4} textAnchor="end" fontSize="10.5" fill={r.exportHold ? '#f5b14a' : '#c98ff5'}>{r.bucket === 'Engineering scope' ? 'Engineering scope' : 'Review hold'}</text>}
        </g>;
      })}
    </svg></div>
    <p className="panel-note">{exposed.length ? exposed.map(r => `${short(r.a.component)}: ${r.proposed.filter((p: Any) => p.exposureDays).map((p: Any) => `breach ${p.breachBefore} → task ${p.date} (${p.exposureDays} d exposed)`).join(', ')}`).join(' · ') : 'No pre-task exposure among the proposed tasks.'}</p>
  </div>;
}

// Task ↔ assessment credits for the selected asset: Model credits (editable), CML coverage and the proposals.
export function TaskLinks({ rows, tasks, today, coverage, links, setLinks, template, asset }: { rows: Any[]; tasks: Any[]; today: string; coverage: Any; links: Any; setLinks: (l: Any) => void; template: Any; asset: Any }) {
  const [def, setDef] = useState('');
  const [date, setDate] = useState(today);
  const [credit, setCredit] = useState<string[]>([]);
  const future = tasks.filter(t => t.planned && t.planned >= today && ![1, 4, 5].includes(t.statusCode)).sort((a, b) => a.planned.localeCompare(b.planned));
  const added = (links.added || []).filter((t: Any) => t.assetId === asset?.id);
  const proposals = proposedTasksForAsset(rows);
  const toggle = (num: string, aid: string, sample: boolean, on: boolean) => {
    const L = { added: [...(links.added || [])], addedCredits: { ...(links.addedCredits || {}) }, removedCredits: { ...(links.removedCredits || {}) } };
    if (on) { if (!sample) L.addedCredits[num] = [...(L.addedCredits[num] || []), aid]; L.removedCredits[aid] = (L.removedCredits[aid] || []).filter((n: string) => n !== num); }
    else { if (sample) L.removedCredits[aid] = [...(L.removedCredits[aid] || []), num]; L.addedCredits[num] = (L.addedCredits[num] || []).filter((x: string) => x !== aid); }
    setLinks(L);
  };
  const cov = (r: Any, num: string) => { const c = coverage?.[r.id] || {}; const k = c[num] ? num : Object.keys(c).find(x => num.startsWith(x)); return k ? c[k] : null; };
  const defs: string[] = template?.pickLists?.AssetTask_TaskDefinition || Object.keys(template?.definitions || {});
  const bundleOf = (d: string) => { const u = (d || '').toUpperCase(); const map: [string, string][] = [['REPLACE', 'Replace'], ['OVERHAUL', 'Overhaul'], ['CONDITIONAL REPAIR', 'Inspect + conditional repair'], ['REPAIR', 'Inspect + conditional repair'], ['API VISUAL INTERNAL', 'API internal'], ['PLANNED TAR', 'Planned TAR task'], ['CLEAN AND INSPECT', 'Clean & inspect'], ['PRESSURE TEST', 'Pressure test'], ['PIGGING', 'Pigging'], ['RT', 'RT profile'], ['RADIOGRAPH', 'RT profile'], ['UT', 'UT / thickness'], ['GAUGING', 'UT / thickness'], ['API VISUAL EXTERNAL', 'API external']]; return (map.find(([k]) => u.includes(k)) || [null, 'Online inspection'])[1]; };
  const addTask = () => {
    if (!def || !date || !credit.length) return;
    const bundle = bundleOf(def), meta = template?.definitions?.[def] || {};
    setLinks({ ...links, added: [...(links.added || []), { id: 'u' + Date.now().toString(36), number: `TTO-${bundle.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase()}-${date}-${(asset?.clientId || asset?.name || '').replace(/\s+/g, '').slice(-14)}`, assetId: asset?.id, date, bundle, definition: def, credit, downtimeHours: meta.medDowntimeH ?? null, cost: meta.medCost ?? null }] });
    setCredit([]);
  };
  return <div className="links-panel">
    <p className="panel-note">Rows are tasks on {asset?.name}; columns are its assessments. A tick credits the task to the assessment in the planning model and in the import file. <b>Solid</b> = credited by Model · <b>outlined</b> = your edit. CML badges show whether the task covers the assessment&apos;s governing CML.</p>
    <div className="table-wrap"><table className="links-table"><thead><tr><th>Task</th><th>Date</th><th>Type</th><th>Status</th>{rows.map(r => <th key={r.id} title={r.a.component}><span className={'badge ' + bucketColor(r.bucket)}>{short(r.a.component).slice(0, 24)}</span></th>)}<th /></tr></thead><tbody>
      {future.map(t => <tr key={t.id}>
        <td className="mono" title={t.description || ''}>{t.number}{rows.map(r => cov(r, t.number)).filter(Boolean).slice(0, 1).map((c: Any, i) => <small key={i} className={c[0] ? 'teal-text' : 'amber'}>{c[0] ? 'covers governing CML' : `${c[1]} CML${c[1] === 1 ? '' : 's'} · not governing`}</small>)}</td>
        <td className="numeric">{t.planned}</td><td>{t.definition || t.bundle}<small>{t.bundle}</small></td><td><span className="badge muted">{t.status}</span></td>
        {rows.map(r => { const sample = (t.credit || []).includes(r.id), userOn = (links.addedCredits?.[t.number] || []).includes(r.id), userOff = (links.removedCredits?.[r.id] || []).includes(t.number), on = userOn || (sample && !userOff); return <td key={r.id} className={'lk' + (sample ? ' sample' : '') + (userOn || userOff ? ' edited' : '')}><input type="checkbox" aria-label={`Credit ${t.number} to ${r.a.component}`} checked={on} onChange={e => toggle(t.number, r.id, sample, e.target.checked)} /></td>; })}
        <td />
      </tr>)}
      {added.map((t: Any) => <tr key={t.id} className="user-row">
        <td className="mono">{t.number} <span className="badge green">new</span></td><td><input type="date" value={t.date} onChange={e => setLinks({ ...links, added: links.added.map((x: Any) => x.id === t.id ? { ...x, date: e.target.value } : x) })} /></td><td>{t.definition}<small>{t.bundle}</small></td><td><span className="badge amber">to add</span></td>
        {rows.map(r => <td key={r.id} className="lk edited"><input type="checkbox" checked={(t.credit || []).includes(r.id)} onChange={e => setLinks({ ...links, added: links.added.map((x: Any) => x.id === t.id ? { ...x, credit: e.target.checked ? [...x.credit, r.id] : x.credit.filter((c: string) => c !== r.id) } : x) })} /></td>)}
        <td><button className="chart-reset" onClick={() => setLinks({ ...links, added: links.added.filter((x: Any) => x.id !== t.id) })} aria-label="Remove task">✕</button></td>
      </tr>)}
      {proposals.map(g => <tr key={g.key} className="prop-row">
        <td>{g.replaces.size ? <><span className="mono">{[...g.replaces].join(', ')}</span><small>moved from {g.movedFrom} · {g.window}</small></> : <>copy of <span className="mono">{g.copyOf?.taskNumbers?.[0] || g.bundle}</span><small>{g.window}</small></>}</td>
        <td className="numeric">{g.date}</td><td>{g.copyOf?.definitions?.[0] || g.definitions[0] || g.bundle}<small>{g.bundle} · {g.execution}</small></td>
        <td><span className={'badge ' + (g.replaces.size ? 'pink' : 'amber')}>{g.replaces.size ? 'update date' : 'add copy'}</span>{g.drivers.some((d: Any) => d.r.exportHold) && <small className="amber">review hold</small>}</td>
        {rows.map(r => <td key={r.id} className="lk">{g.drivers.some((d: Any) => d.r.id === r.id) ? <span className="teal-text" title="Asked for by this assessment's chain">●</span> : ''}</td>)}
        <td />
      </tr>)}
      {!future.length && !added.length && !proposals.length && <tr><td colSpan={rows.length + 5} className="empty">No future tasks on this asset.</td></tr>}
    </tbody></table></div>
    <div className="links-add">
      <strong>Add a task</strong>
      <select aria-label="Task definition" value={def} onChange={e => setDef(e.target.value)}><option value="">Task definition…</option>{defs.map(d => <option key={d}>{d}</option>)}</select>
      <input aria-label="Task date" type="date" value={date} min={today} onChange={e => setDate(e.target.value)} />
      <span>credits</span>
      {rows.map(r => <label key={r.id} className="check"><input type="checkbox" checked={credit.includes(r.id)} onChange={e => setCredit(c => e.target.checked ? [...c, r.id] : c.filter(x => x !== r.id))} />{short(r.a.component).slice(0, 22)}</label>)}
      <button onClick={addTask} disabled={!def || !date || !credit.length}>Add</button>
      <button onClick={() => setLinks({ added: [], addedCredits: {}, removedCredits: {} })}>Reset edits</button>
    </div>
  </div>;
}
