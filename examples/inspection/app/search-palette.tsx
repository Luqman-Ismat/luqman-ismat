'use client';
// Quick search (Ctrl+K or /): one box across assets, assessments, tasks, buckets and checks, with the table's query language.
import { useEffect, useMemo, useRef, useState } from 'react';
import { FIELDS, highlightWords, matches, norm, parseQuery, score } from '../lib/search.mjs';
type Any = Record<string, any>;
type Item = { kind: 'assessment' | 'asset' | 'task' | 'filter' | 'table'; key: string; title: string; sub: string; badge?: string; run: () => void };

export function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length || !text) return <>{text}</>;
  // mark every occurrence of any word, case-insensitively, on the original text
  const lower = text.toLowerCase(), marks: [number, number][] = [];
  for (const w of words) { let i = lower.indexOf(w); while (i >= 0 && w) { marks.push([i, i + w.length]); i = lower.indexOf(w, i + w.length); } }
  if (!marks.length) return <>{text}</>;
  marks.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = []; for (const m of marks) { const l = merged.at(-1); if (l && m[0] <= l[1]) l[1] = Math.max(l[1], m[1]); else merged.push([...m]); }
  const out: React.ReactNode[] = []; let at = 0;
  merged.forEach(([s, e], i) => { if (s > at) out.push(text.slice(at, s)); out.push(<mark key={i}>{text.slice(s, e)}</mark>); at = e; });
  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}

export default function SearchPalette({ index, results, assets, checkSummary, sampleDataSummary, onAssessment, onAsset, onTable, onBucket, onCheck }: {
  index: Any[]; results: Any[]; assets: Any[]; checkSummary: Any; sampleDataSummary: Any;
  onAssessment: (r: Any) => void; onAsset: (id: string) => void; onTable: (q: string) => void; onBucket: (b: string) => void; onCheck: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement | null>(null), list = useRef<HTMLDivElement | null>(null);

  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem('portfolio.inspection.search.recent') || '[]')); } catch { /* ignore */ } }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.('input, textarea, select, [contenteditable="true"]');
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); setOpen(true); }
      else if (e.key === 'Escape') setOpen(false);
    };
    const opener = () => setOpen(true);
    window.addEventListener('keydown', key); window.addEventListener('portfolio.inspection:open-search', opener);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('portfolio.inspection:open-search', opener); };
  }, []);
  useEffect(() => { if (open) { setActive(0); setTimeout(() => input.current?.select(), 0); } }, [open]);
  const remember = (text: string) => { const t = text.trim(); if (!t) return; const next = [t, ...recent.filter(x => x !== t)].slice(0, 8); setRecent(next); try { localStorage.setItem('portfolio.inspection.search.recent', JSON.stringify(next)); } catch { /* ignore */ } };

  const terms = useMemo(() => parseQuery(q), [q]);
  const words = useMemo(() => highlightWords(q), [q]);
  const items: { group: string; items: Item[] }[] = useMemo(() => {
    if (!terms.length) return [];
    const done = (fn: () => void) => () => { remember(q); setOpen(false); fn(); };
    const hits = index.filter(e => matches(e, terms)).map(e => [e, score(e, terms)] as [Any, number]).sort((a, b) => b[1] - a[1]);
    const groups: { group: string; items: Item[] }[] = [];
    // assessments
    groups.push({ group: `Assessments · ${hits.length.toLocaleString()}`, items: hits.slice(0, 8).map(([e]) => { const r = e.r; return { kind: 'assessment', key: 'a' + r.id, title: r.a.component, sub: `${r.a.asset?.name || ''} · ${r.a.asset?.unit || ''}${r.b0Date ? ` · breach ${r.alreadyBreached ? 'today' : r.b0Date}` : ''}`, badge: r.bucket, run: done(() => onAssessment(r)) }; }) });
    // assets: matched by their own name / client ID / unit, or holding matched assessments
    const plain = terms.filter(t => !t.field || ['asset', 'unit'].includes(t.field));
    const byAsset = new Map<string, number>(); for (const [e] of hits) byAsset.set(String(e.r.a.assetId), (byAsset.get(String(e.r.a.assetId)) || 0) + 1);
    const inRun = new Set(results.map(r => String(r.a.assetId)));
    const assetHits = assets.filter(a => inRun.has(String(a.id)) && (byAsset.has(String(a.id)) || (plain.length && plain.every(t => norm([a.name, a.clientId, a.unit, a.type].join(' ')).includes(norm(t.value)) !== t.neg))))
      .map(a => [a, (byAsset.get(String(a.id)) || 0) + (plain.some(t => norm(a.name).includes(norm(t.value))) ? 100 : 0)] as [Any, number]).sort((x, y) => y[1] - x[1]).slice(0, 6);
    groups.push({ group: 'Assets', items: assetHits.map(([a]) => { const n = results.filter(r => String(r.a.assetId) === String(a.id)).length, m = byAsset.get(String(a.id)); return { kind: 'asset', key: 's' + a.id, title: a.name, sub: `${a.unit || ''}${a.type ? ' · ' + a.type : ''} · ${n} assessment${n === 1 ? '' : 's'}${m ? ` · ${m} match` : ''}`, run: done(() => onAsset(String(a.id))) }; }) });
    // tasks: task numbers / definitions containing every plain word
    const taskWords = terms.filter(t => !t.neg && (!t.field || t.field === 'task')).map(t => norm(t.value)).filter(Boolean);
    if (taskWords.length) {
      const seen = new Map<string, Item>();
      for (const r of results) for (const p of [...(r.current?.events || []).map((e: Any) => ({ ...e, _status: 'current plan' })), ...(r.proposed || []).filter((p: Any) => !p.kept).map((p: Any) => ({ ...p, _status: p.moved ? `shifted from ${p.movedFrom}` : 'copied' }))]) {
        for (const n of p.taskNumbers?.length ? p.taskNumbers : p.copyOf?.taskNumbers || []) {
          const hay = norm(`${n} ${(p.definitions || []).join(' ')}`);
          if (!taskWords.every(w => hay.includes(w))) continue;
          const key = `t${n}|${p.date}|${p._status}`;
          if (!seen.has(key)) seen.set(key, { kind: 'task', key, title: n, sub: `${p.definitions?.[0] || p.bundle} · ${p.date} · ${p._status} · ${r.a.component}`, run: done(() => onAssessment(r)) });
          if (seen.size >= 8) break;
        }
        if (seen.size >= 8) break;
      }
      groups.push({ group: 'Tasks', items: [...seen.values()] });
    }
    // buckets, checks and Model data findings by name
    const filterWords = terms.filter(t => !t.neg && !t.field).map(t => norm(t.value));
    if (filterWords.length) {
      const f: Item[] = [];
      for (const b of [...new Set(results.map(r => r.bucket))]) if (filterWords.every(w => norm(b).includes(w))) f.push({ kind: 'filter', key: 'b' + b, title: `Bucket: ${b}`, sub: `${results.filter(r => r.bucket === b).length} assessments`, run: done(() => onBucket(b)) });
      for (const c of Object.values(checkSummary || {}) as Any[]) if (c.assessments && filterWords.every(w => norm(`${c.label} ${c.code}`).includes(w))) f.push({ kind: 'filter', key: 'c' + c.code, title: `Check: ${c.label}`, sub: `${c.assessments} assessments`, run: done(() => onCheck(c.code)) });
      for (const c of Object.values(sampleDataSummary || {}) as Any[]) if (c.assessments && filterWords.every(w => norm(`${c.label} ${c.code}`).includes(w))) f.push({ kind: 'filter', key: 'n' + c.code, title: `Model data: ${c.label}`, sub: `${c.assessments} assessments`, run: done(() => onCheck('nd:' + c.code)) });
      groups.push({ group: 'Filters', items: f.slice(0, 6) });
    }
    groups.push({ group: '', items: [{ kind: 'table', key: 'table', title: `Show all ${hits.length.toLocaleString()} matching assessments in the table`, sub: 'Applies this search to the assessments table', run: done(() => onTable(q)) }] });
    return groups.filter(g => g.items.length);
  }, [terms, q, index, results, assets, checkSummary, sampleDataSummary]); // eslint-disable-line react-hooks/exhaustive-deps
  const flat = items.flatMap(g => g.items);
  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => { list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }); }, [active]);

  if (!open) return null;
  return <div className="search-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
    <div className="search-palette glass" role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-input"><span aria-hidden="true">⌕</span>
        <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search assets, assessments, task numbers, checks…  (unit:200  breach<2030  -thinning)" aria-label="Search" aria-controls="search-results"
          onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); } else if (e.key === 'Enter') { e.preventDefault(); flat[active]?.run(); } }} />
        <kbd>Esc</kbd>
      </div>
      <div className="search-results" id="search-results" ref={list} role="listbox">
        {!terms.length && <div className="search-empty">
          {recent.length > 0 && <><span className="search-group">Recent</span>{recent.map(t => <button key={t} className="search-chip" onClick={() => setQ(t)}>{t}</button>)}</>}
          <span className="search-group">Filters you can type</span>
          <div className="search-fields">{Object.entries(FIELDS).map(([k, v]) => <button key={k} onClick={() => { setQ((q ? q + ' ' : '') + k + (['breach', 'exposure', 'life', 'risk'].includes(k) ? '>' : ':')); input.current?.focus(); }}><code>{k}{['breach', 'exposure', 'life', 'risk'].includes(k) ? '<>' : ':'}</code><small>{v}</small></button>)}</div>
          <p className="panel-note">Every word must match (any order). Use quotes for a phrase and a minus sign to exclude. Examples: <code>60035 cui</code> · <code>unit:200 bucket:pull</code> · <code>task:TMLC-2026</code> · <code>breach&lt;2030 exposure&gt;180</code></p>
        </div>}
        {terms.length > 0 && !flat.length && <div className="search-empty"><p>No matches for “{q}”.</p></div>}
        {items.map(g => <div key={g.group || 'all'}>
          {g.group && <span className="search-group">{g.group}</span>}
          {g.items.map(it => { const i = flat.indexOf(it); return <button key={it.key} role="option" aria-selected={i === active} data-active={i === active} className={'search-item ' + it.kind} onMouseEnter={() => setActive(i)} onClick={it.run}>
            <span className="search-kind" aria-hidden="true">{it.kind === 'asset' ? '▣' : it.kind === 'task' ? '◆' : it.kind === 'filter' ? '⚑' : it.kind === 'table' ? '↳' : '●'}</span>
            <span className="search-text"><strong><Highlight text={it.title} words={words} /></strong><small><Highlight text={it.sub} words={words} /></small></span>
            {it.badge && <span className="search-badge">{it.badge}</span>}
          </button>; })}
        </div>)}
      </div>
      <div className="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>/</kbd> anywhere</span></div>
    </div>
  </div>;
}
