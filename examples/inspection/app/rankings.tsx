'use client';
import { useEffect, useState } from 'react';
import { bucketColor, HOLDS } from '../lib/labels.mjs';
type Any = Record<string, any>;
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n);

export function Collapsible({ id, title, sub, children, defaultOpen = true }: { id: string; title: string; sub: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => { try { const v = localStorage.getItem('portfolio.inspection.open.' + id); if (v != null) setOpen(v === '1'); } catch { /* storage unavailable */ } }, [id]);
  return <details className="glass card-strip" open={open} onToggle={e => { const now = (e.currentTarget as HTMLDetailsElement).open; setOpen(now); try { localStorage.setItem('portfolio.inspection.open.' + id, now ? '1' : '0'); } catch { /* ignore */ } }}>
    <summary><strong>{title}</strong><span>{sub}</span><span className="chevron">⌄</span></summary>
    {children}
  </details>;
}

// Top movers, contributors and savings as KPI-style cards. Card colour = the bucket colour of the driving assessment.
export default function Rankings({ data, onSelect }: { data: Any; onSelect: (row: Any) => void }) {
  const groups = [
    { key: 'movers', title: 'Top 10 movers', sub: 'Largest change to an existing task date · assessments with a risk curve and a Weibull only', items: data.movers.slice(0, 10).map((x: Any) => ({ row: x.row, color: x.shift < 0 ? 'pink' : 'blue', value: Math.abs(x.shift).toLocaleString() + ' d', unit: x.shift < 0 ? 'earlier' : 'later', line1: x.task.definitions?.[0] || x.task.bundle, line2: x.task.movedFrom + ' → ' + x.task.date, held: x.held })) },
    { key: 'contributors', title: 'Top 10 contributors', sub: 'Current-plan risk today ÷ governing limit', items: data.contributors.slice(0, 10).map((x: Any) => ({ row: x.row, color: bucketColor(x.row.bucket), value: x.ratio.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '×', unit: 'limit', line1: x.row.a.component.split(' | ').slice(1).join(' · '), line2: x.measure.toUpperCase() + ' · ' + money(x.risk) + ' today', held: x.row.exportHold })) },
    { key: 'savings', title: 'Top 10 net benefit', sub: 'Per asset: expected failure cost avoided − task cost change', items: data.savings.slice(0, 10).map((x: Any) => ({ row: x.row, color: 'green', value: money(x.net), unit: 'net', line1: money(x.avoided) + ' avoided', line2: (x.delta > 0 ? '+' : '') + money(x.delta) + ' task cost', held: x.held })) },
  ];
  return <Collapsible id="highlights" title="Top movers and portfolio rankings" sub={`${data.movers.length.toLocaleString()} existing task dates change · click a card to open its curve`}>
    {groups.map(g => <div className="strip-group" key={g.key}>
      <div className="strip-head"><h3>{g.title}</h3><p>{g.sub}</p></div>
      {g.items.length ? <div className="card-row">{g.items.map((x: Any, i: number) => <button key={g.key + i} className={'glass kpi-card ' + x.color} onClick={() => onSelect(x.row)} title={x.row.reason}>
        <span className="kpi-label"><b>{i + 1}</b>{x.row.a.asset?.name}</span>
        <strong>{x.value}<small>{x.unit}</small></strong>
        <small>{x.line1}</small><small>{x.line2}</small>
        {x.held && <small className="amber">Review hold</small>}
      </button>)}</div> : <p className="empty small">Nothing to rank in this run.</p>}
    </div>)}
  </Collapsible>;
}

export function ReviewHolds({ results, active, onPick }: { results: Any[]; active: string; onPick: (code: string) => void }) {
  const count = (code: string) => results.filter(r => [...(r.holds || []), ...(r.notes2 || [])].some((h: Any) => h.code === code)).length;
  const held = results.filter(r => r.exportHold).length;
  return <Collapsible id="holds" title="Review holds" sub={`${held.toLocaleString()} assessments held from the Model import · separate from the action buckets`}>
    <div className="card-row holds">{HOLDS.map(h => <button key={h.code} aria-pressed={active === h.code} className={'glass kpi-card ' + h.color + (active === h.code ? ' active' : '')} onClick={() => onPick(active === h.code ? '' : h.code)}>
      <span className="kpi-label">{h.label}</span>
      <strong>{count(h.code).toLocaleString()}</strong>
      <small>{h.hint}</small>
      <small className={h.blocks ? 'red-text' : ''}>{h.blocks ? 'Held from export' : 'Does not hold export'}</small>
    </button>)}</div>
  </Collapsible>;
}
