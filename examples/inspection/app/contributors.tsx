'use client';
// Top contributors: a train → asset → assessment hierarchy of cards, ranked by the chosen metric, with filters.
import { useMemo, useState } from 'react';
import { Collapsible } from './rankings';
import { BUCKETS, bucketColor } from '../lib/labels.mjs';
import { rankable } from '../lib/workbench-data.mjs';
type Any = Record<string, any>;

const compact = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
const shiftOf = (r: Any) => Math.max(0, ...r.proposed.filter((p: Any) => p.moved && p.movedFrom).map((p: Any) => Math.abs(Math.round((Date.parse(p.date) - Date.parse(p.movedFrom)) / 864e5))));
// value per assessment and how it rolls up (sum for dollars, max for ratios and day shifts)
const METRICS: Record<string, { label: string; unit: (v: number) => string; roll: 'sum' | 'max'; value: (r: Any, m: string) => number | null }> = {
  ratio: { label: 'Risk today ÷ limit', unit: v => v.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '×', roll: 'max', value: (r, m) => { const mm = m === 'gov' ? r.gov?.measure : m; if (!mm) return null; const risk = r.a.today?.[mm === 'hse' ? 'mitHse' : 'mitEcon'], lim = r.settingsLimit?.[mm]; return Number.isFinite(risk) && lim > 0 ? risk / lim : null; } },
  risk: { label: 'Risk today ($)', unit: compact, roll: 'sum', value: (r, m) => { const mm = m === 'gov' ? r.gov?.measure : m; return mm ? r.a.today?.[mm === 'hse' ? 'mitHse' : 'mitEcon'] ?? null : null; } },
  failure: { label: 'Expected failure cost to horizon', unit: compact, roll: 'sum', value: (r, m) => { const x = r.expected, mm = m === 'gov' ? r.gov?.measure : m; return x && mm ? x[mm + 'Cur'] : null; } },
  avoided: { label: 'Failure cost avoided', unit: compact, roll: 'sum', value: r => r.costBenefit?.avoided ?? null },
  net: { label: 'Net benefit', unit: compact, roll: 'sum', value: r => r.costBenefit?.net ?? null },
  shift: { label: 'Largest task date change (d)', unit: v => Math.round(v).toLocaleString() + ' d', roll: 'max', value: r => shiftOf(r) || null },
};

export default function Contributors({ results, settings, onSelect }: { results: Any[]; settings: Any; onSelect: (r: Any) => void }) {
  const [metric, setMetric] = useState('ratio');
  const [measure, setMeasure] = useState('gov');
  const [bucket, setBucket] = useState('');
  const [category, setCategory] = useState('');
  const [decision, setDecision] = useState('');
  const [search, setSearch] = useState('');
  const [hideNegligible, setHideNegligible] = useState(true);
  const [train, setTrain] = useState('');
  const [asset, setAsset] = useState('');
  const [showAll, setShowAll] = useState(false);
  const M = METRICS[metric];

  const rows = useMemo(() => results.filter(r => rankable(r)
    && (!hideNegligible || !(r.checks || []).some((c: Any) => c.code === 'negligibleRisk'))
    && (!bucket || r.bucket === bucket) && (!category || r.a.category === category) && (!decision || r.decision === decision)
    && (!search || [r.a.asset?.unit, r.a.asset?.name, r.a.component].join(' ').toLowerCase().includes(search.toLowerCase())))
    .map(r => ({ r, v: M.value({ ...r, settingsLimit: { hse: settings.hse, econ: settings.econ } }, measure) }))
    .filter((x): x is { r: Any; v: number } => x.v != null && Number.isFinite(x.v) && x.v > 0), [results, metric, measure, bucket, category, decision, search, hideNegligible, settings.hse, settings.econ]); // eslint-disable-line react-hooks/exhaustive-deps

  const roll = (xs: Any[]) => M.roll === 'sum' ? xs.reduce((s, x) => s + x.v, 0) : Math.max(...xs.map(x => x.v));
  const group = (xs: Any[], key: (x: Any) => string) => { const m = new Map<string, Any[]>(); for (const x of xs) { const k = key(x); if (!m.has(k)) m.set(k, []); m.get(k)!.push(x); } return [...m.entries()].map(([k, items]) => ({ key: k, items, v: roll(items) })).sort((a, b) => b.v - a.v); };
  const trains = group(rows, x => x.r.a.asset?.unit || 'Unknown unit');
  const total = M.roll === 'sum' ? roll(rows) : null;
  const trainRows = trains.find(t => t.key === train)?.items || [];
  const assets = train ? group(trainRows, x => String(x.r.a.assetId)) : [];
  const assessmentRows = asset ? (assets.find(a => a.key === asset)?.items || []).slice().sort((a: Any, b: Any) => b.v - a.v) : [];
  const limit = (xs: Any[]) => showAll ? xs : xs.slice(0, 10);
  const share = (v: number, parent: number | null) => parent && M.roll === 'sum' ? Math.max(2, Math.min(100, v / parent * 100)) : null;
  const categories = [...new Set(results.map(r => r.a.category).filter(Boolean))].sort();
  const card = (key: string, title: string, sub: string, v: number, parent: number | null, color: string, active: boolean, onClick: () => void, extra?: string) => {
    const s = share(v, parent);
    return <button key={key} className={'glass kpi-card ' + color + (active ? ' active' : '')} onClick={onClick} title={extra}>
      <span className="kpi-label">{title}</span>
      <strong>{M.unit(v)}</strong>
      <small>{sub}</small>
      {s != null && <span className="share-bar"><i style={{ width: s + '%' }} /></span>}
    </button>;
  };

  return <Collapsible id="contributors" title="Top contributors" sub={`${M.label} · ${rows.length.toLocaleString()} assessments with a risk curve · train → asset → assessment`}>
    <div className="contrib-filters">
      <label>Rank by<select value={metric} onChange={e => { setMetric(e.target.value); setTrain(''); setAsset(''); }}>{Object.entries(METRICS).map(([k, x]) => <option key={k} value={k}>{x.label}</option>)}</select></label>
      {['ratio', 'risk', 'failure'].includes(metric) && <label>Measure<select value={measure} onChange={e => setMeasure(e.target.value)}><option value="gov">Governing</option><option value="hse">HSE</option><option value="econ">ECON</option></select></label>}
      <label>Bucket<select value={bucket} onChange={e => setBucket(e.target.value)}><option value="">All buckets</option>{BUCKETS.filter(b => b.key !== 'All in scope').map(b => <option key={b.key}>{b.key}</option>)}</select></label>
      <label>Category<select value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Decision<select value={decision} onChange={e => setDecision(e.target.value)}><option value="">All decisions</option>{['Accepted', 'Rejected', 'Engineering review', 'Not cleared', 'No change', 'Review · no candidate'].map(d => <option key={d}>{d}</option>)}</select></label>
      <label>Search<input placeholder="Train, asset, assessment…" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label className="check"><input type="checkbox" checked={hideNegligible} onChange={e => setHideNegligible(e.target.checked)} />Hide negligible risk</label>
      <label className="check"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Show all, not top 10</label>
    </div>
    <div className="crumbs">
      <button onClick={() => { setTrain(''); setAsset(''); }} aria-pressed={!train}>All trains{total != null ? ' · ' + M.unit(total) : ''}</button>
      {train && <><span>›</span><button onClick={() => setAsset('')} aria-pressed={!asset}>{train}</button></>}
      {asset && <><span>›</span><button aria-pressed>{assets.find(a => a.key === asset)?.items[0]?.r.a.asset?.name}</button></>}
    </div>
    <div className="strip-group">
      <div className="strip-head"><h3>Trains</h3><p>{trains.length} trains · click to see its assets</p></div>
      {trains.length ? <div className="card-row">{limit(trains).map(t => card(t.key, t.key, `${new Set(t.items.map((x: Any) => x.r.a.assetId)).size} assets · ${t.items.length} assessments`, t.v, total, 'teal', train === t.key, () => { setTrain(train === t.key ? '' : t.key); setAsset(''); }))}</div> : <p className="empty small">No assessments match these filters.</p>}
    </div>
    {train && <div className="strip-group">
      <div className="strip-head"><h3>Assets in {train}</h3><p>{assets.length} assets · click to see its assessments</p></div>
      <div className="card-row">{limit(assets).map(a => { const r0 = a.items[0].r; return card(a.key, r0.a.asset?.name, `${a.items.length} assessment${a.items.length === 1 ? '' : 's'} · ${r0.a.asset?.clientId || ''}`, a.v, trains.find(t => t.key === train)?.v ?? null, 'blue', asset === a.key, () => setAsset(asset === a.key ? '' : a.key)); })}</div>
    </div>}
    {asset && <div className="strip-group">
      <div className="strip-head"><h3>Assessments</h3><p>Click to open the curve</p></div>
      <div className="card-row">{limit(assessmentRows).map((x: Any) => card(x.r.id, x.r.a.component.split(' | ').slice(1).join(' · ') || x.r.a.component, `${x.r.bucket} · ${x.r.decision}`, x.v, assets.find(a => a.key === asset)?.v ?? null, bucketColor(x.r.bucket), false, () => onSelect(x.r), x.r.reason))}</div>
    </div>}
  </Collapsible>;
}
