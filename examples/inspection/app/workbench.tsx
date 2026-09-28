'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import LvcChart from './lvc-chart';
import { Collapsible } from './rankings';
import Contributors from './contributors';
import { TaskLinks, VisitPlan } from './asset-panels';
import { AdvancedDefaults, AssessmentDrawer } from './options';
import ScenarioControl from './scenario-control';
import { ChecksMenu, HeaderMenu, ScenarioPicker } from './header-menus';
import TaskPool from './task-pool';
import SearchPalette, { Highlight } from './search-palette';
import { highlightWords, indexResult, matches, norm, parseQuery, score } from '../lib/search.mjs';
import { curveValue, dateDay, daysAbove } from '../lib/curve-math.mjs';
import { assetAssessments, assetCosts } from '../lib/workbench-data.mjs';
import { BUCKETS, HOLDS, bucketColor, holdsOf } from '../lib/labels.mjs';
import { exportCostBenefitWorkbook, exportModelWorkbook } from '../lib/exports.mjs';
type Any = Record<string, any>;

// main scenario: Planning scenario, the plan taken forward. Optimized Task Plan is 1002, Sample Optimized Plan 1003, Current 1001.
const DEFAULT_SID = '1001';
// Planning scenario is presented as the optimized plan: the optimizer agrees with it on all but a small share of assessments,
// and what it still suggests is shown as optional refinements rather than required changes.
const OPTIMIZED_SID = '1002';
const SCENARIO_KEY = 'portfolio.inspection.scenario.v2';  // new key so browsers that remembered an older default open Planning scenario
const defaults: Any = { hse: 700000, econ: 1000000, margin: 30, onlinePref: 180, inspectionThreshold: .9, horizon: '2034-12-01', keepTolerance: 45, earlyDays: 820, acceptedExposure: 180, negligiblePct: 1, solve: true, showCost: true, scope: 'fixed' };
const SEVERITY_COLOR: Record<string, string> = { error: 'red', warn: 'amber', info: 'blue' };
const money = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? 'Not available' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v);
const DECISION_COLOR: Record<string, string> = { Accepted: 'green', Rejected: 'red', 'Engineering review': 'purple', 'Review · no candidate': 'muted', 'Not cleared': 'pink', 'No change': 'sage', 'Not optimized': 'muted' };
const PAGE = 35;
// one filter for both check-engine findings and Model data findings (codes prefixed "nd:")
const hasFinding = (r: Any, code: string) => code.startsWith('nd:') ? (r.sampleData || []).some((c: Any) => 'nd:' + c.code === code) : (r.checks || []).some((c: Any) => c.code === code);

// retries a dropped request (dev server restarting, HMR reload) before reporting it
async function fetchRetry(url: string, tries = 4): Promise<Response> {
  for (let i = 0; ; i++) {
    try { const r = await fetch(url); if (r.ok || r.status === 404 || i >= tries - 1) return r; } catch (e) { if (i >= tries - 1) throw Error('The local server is not responding (' + (e instanceof Error ? e.message : 'network error') + '). Check that the dev server is running, then reload.'); }
    await new Promise(res => setTimeout(res, 600 * (i + 1)));
  }
}
async function gunzipJson(url: string) {
  const r = await fetchRetry(url); if (!r.ok) throw Error('Could not load ' + url + ' (' + r.status + ').');
  const bytes = await r.arrayBuffer(), stream = new Blob([bytes]).stream();
  return JSON.parse(await new Response(new Uint8Array(bytes)[0] === 31 ? stream.pipeThrough(new DecompressionStream('gzip')) : stream).text());
}
function sortValue(r: Any, key: string): any {
  const first = r.proposed.find((p: Any) => !p.kept);
  switch (key) {
    case 'asset': return r.a.asset?.name; case 'assessment': return r.a.component; case 'category': return r.a.category || '';
    case 'risk': return r.gov?.measure ? r.a.today?.[r.gov.measure === 'hse' ? 'mitHse' : 'mitEcon'] : null;
    case 'breach': return r.b0Date; case 'current': return r.currentNext?.date; case 'proposed': return first?.date;
    case 'exec': return first?.execution; case 'life': return first?.life; case 'exposure': return r.proposed.reduce((s: number, p: Any) => s + (p.exposureDays || 0), 0);
    case 'bucket': return r.bucket; case 'decision': return r.decision; case 'net': return r.costBenefit?.net;
  }
  return null;
}
function Badge({ children, color = 'teal', title }: { children: React.ReactNode; color?: string; title?: string }) { return <span className={'badge ' + color} title={title}>{children}</span>; }

export default function Workbench() {
  const [settings, setSettingsState] = useState<Any>(defaults);
  const [bundles, setBundlesState] = useState<Any>({});
  const [scenarios, setScenarios] = useState<Any[]>([]);
  // the scenario on screen; its data files are public/examples/inspection/models/<sid>.* and public/examples/inspection/curves/<sid>/
  const [SID, setSid] = useState(DEFAULT_SID);
  const installed = useMemo(() => scenarios.filter((s: Any) => s.ready || String(s.id) === DEFAULT_SID), [scenarios]);
  const dataVersion = String(installed.find((s: Any) => String(s.id) === SID)?.snapshotAt || installed.find((s: Any) => String(s.id) === SID)?.today || '');
  async function loadIndex() {
    const i = await fetchRetry('/examples/inspection/models/index.json?t=' + Date.now()).then(r => r.json() as Promise<Any>).catch((): Any => ({ scenarios: [] }));
    setScenarios(i.scenarios || []); return i.scenarios || [];
  }
  function openScenario(id: string) {
    try { localStorage.setItem(SCENARIO_KEY, id); } catch { /* ignore */ }
    curveCache.current.clear(); setCurveData(null); setSelected(''); setAssessment(''); setRun(null); setStatus('Loading scenario ' + id); setSid(id);
  }
  // light / dark: light unless this browser has chosen dark
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  useEffect(() => {
    let t: 'dark' | 'light' = new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light';

    setTheme(t); document.documentElement.dataset.theme = t;
  }, []);
  function toggleTheme() {
    const t = theme === 'light' ? 'dark' : 'light';
    setTheme(t); document.documentElement.dataset.theme = t;
    try { localStorage.setItem('portfolio.inspection.theme', t); } catch { /* ignore */ }
  }
  const [check, setCheck] = useState('');
  const [actionF, setActionF] = useState('');
  const [feasF, setFeasF] = useState('');
  const [execF, setExecF] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: number }>({ key: '', dir: 1 });
  const [openRow, setOpenRow] = useState('');
  const [recalc, setRecalc] = useState(0);
  const setSettings = (next: Any) => setSettingsState((s: Any) => { const v = typeof next === 'function' ? next(s) : next; try { localStorage.setItem('portfolio.inspection.settings.v4', JSON.stringify(v)); } catch { /* ignore */ } return v; });
  const setBundles = (b: Any) => { setBundlesState(b); try { localStorage.setItem('portfolio.inspection.bundles.v4', JSON.stringify(b)); } catch { /* ignore */ } };
  useEffect(() => {
    try { const s = localStorage.getItem('portfolio.inspection.settings.v4'); if (s) setSettingsState({ ...defaults, ...JSON.parse(s) }); const b = localStorage.getItem('portfolio.inspection.bundles.v4'); if (b) setBundlesState(JSON.parse(b)); } catch { /* ignore */ }
    loadIndex().then((list: Any[]) => { try { const s = localStorage.getItem(SCENARIO_KEY); if (s && list.some((x: Any) => String(x.id) === s && (x.ready || s === DEFAULT_SID))) setSid(s); } catch { /* ignore */ } });
  }, []);
  const [links, setLinksState] = useState<Any>({ added: [], addedCredits: {}, removedCredits: {} });
  const [run, setRun] = useState<Any | null>(null);
  const [status, setStatus] = useState('Loading Model source data');
  const [error, setError] = useState('');
  const [bucket, setBucket] = useState('All in scope');
  const [hold, setHold] = useState('');
  const [selected, setSelected] = useState('');
  const [assessment, setAssessment] = useState('');
  const [query, setQuery] = useState('');
  const [assetQuery, setAssetQuery] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [decision, setDecision] = useState('');
  // the table opens on the asset whose curve is on screen: the TAR risk columns are read from that asset's loaded curves
  const [onlyAsset, setOnlyAsset] = useState(true);
  const [tarCols, setTarCols] = useState(true);
  useEffect(() => { try { const v = localStorage.getItem('portfolio.inspection.tarcols'); if (v != null) setTarCols(v === '1'); } catch { /* ignore */ } }, []);
  const toggleTarCols = () => setTarCols(v => { const n = !v; try { localStorage.setItem('portfolio.inspection.tarcols', n ? '1' : '0'); } catch { /* ignore */ } return n; });
  const [page, setPage] = useState(0);
  const [gateTab, setGateTab] = useState('Portfolio');
  const [exportNote, setExportNote] = useState('');
  const [exporting, setExporting] = useState('');
  const [template, setTemplate] = useState<Any | null>(null);
  const worker = useRef<Worker | null>(null), seq = useRef(0);
  const [curveData, setCurveData] = useState<Any | null>(null), [curveError, setCurveError] = useState('');
  const curveCache = useRef(new Map<string, Any>());
  const chartRef = useRef<HTMLElement | null>(null);

  const setLinks = (l: Any) => { setLinksState(l); try { localStorage.setItem('portfolio.inspection.links.' + SID, JSON.stringify(l)); } catch { /* storage unavailable */ } };
  useEffect(() => { try { const s = localStorage.getItem('portfolio.inspection.links.' + SID); setLinksState(s ? JSON.parse(s) : { added: [], addedCredits: {}, removedCredits: {} }); } catch { /* ignore */ } }, [SID]);
  useEffect(() => { fetchRetry('/examples/inspection/models/sample-import-template.json').then(r => r.json() as Promise<Any>).then(t => setTemplate(t)).catch(() => setTemplate(null)); }, []);

  async function curvesFor(assetId: string) {
    let data = curveCache.current.get(assetId);
    if (!data) {
      data = await gunzipJson('/examples/inspection/curves/' + SID + '/' + encodeURIComponent(assetId) + '.json.gz?v=' + encodeURIComponent(dataVersion));
      curveCache.current.set(assetId, data!);
      if (curveCache.current.size > 40) curveCache.current.delete(curveCache.current.keys().next().value!);
    }
    return data!;
  }
  useEffect(() => {
    if (!selected) return; let active = true; setCurveData(null); setCurveError('');
    curvesFor(selected).then(d => { if (active) setCurveData(d); }).catch(e => { if (active) setCurveError(e instanceof Error ? e.message : 'Stored Model curves are unavailable for this asset.'); });
    return () => { active = false; };
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const w = new Worker('/examples/inspection/optimizer.worker.js'); worker.current = w;
    w.onmessage = ({ data: d }) => {
      if (d.type === 'progress') { setStatus(d.message); return; }
      if (d.requestId !== seq.current) return;
      if (d.type === 'error') { setError(d.message); setStatus('Check inputs'); return; }
      setRun(d);
      setSelected(prev => prev || String(d.results.find((r: Any) => r.bucket === 'Pull in')?.a.assetId || d.results[0]?.a.assetId || ''));
      setStatus('Ready'); setError('');
    };
    w.onerror = () => { setError('The calculation worker could not start. Reload to retry.'); setStatus('Check inputs'); };
    return () => w.terminate();
  }, []);
  useEffect(() => {
    const id = ++seq.current; setStatus('Updating'); setExportNote('');
    const t = setTimeout(() => worker.current?.postMessage({ requestId: id, scenario: SID, dataVersion, settings, userLinks: links, bundles }), 180);
    return () => clearTimeout(t);
  }, [settings, links, bundles, recalc, SID, dataVersion]);

  const results: Any[] = useMemo(() => run?.results || [], [run]);
  const units = useMemo(() => [...new Set(results.map(r => r.a.asset?.unit).filter(Boolean))].sort(), [results]);
  const categories = useMemo(() => [...new Set(results.map(r => r.a.category || 'Unknown'))].sort(), [results]);
  const searchIndex = useMemo(() => new Map(results.map(r => [r.id, indexResult(r)])), [results]);
  const queryTerms = useMemo(() => parseQuery(query), [query]);
  const words = useMemo(() => highlightWords(query), [query]);
  const [searchHelp, setSearchHelp] = useState(false);
  const filtered = useMemo(() => results.filter(r =>
    (bucket === 'All in scope' || r.bucket === bucket)
    && (!hold || holdsOf(r).some((h: Any) => h.code === hold))
    && (!onlyAsset || String(r.a.assetId) === selected)
    && (!unit || r.a.asset?.unit === unit)
    && (!category || (r.a.category || 'Unknown') === category)
    && (!decision || r.decision === decision)
    && (!check || hasFinding(r, check))
    && (!actionF || r.action === actionF)
    && (!feasF || r.feasibilityLabel === feasF)
    && (!execF || String(r.proposed.find((p: Any) => !p.kept)?.execution || r.currentNext?.execution || '').startsWith(execF))
    && (!queryTerms.length || matches(searchIndex.get(r.id), queryTerms))
  ).sort((x, y) => { if (!sort.key) return queryTerms.length ? score(searchIndex.get(y.id), queryTerms) - score(searchIndex.get(x.id), queryTerms) : 0; const v = (r: Any) => sortValue(r, sort.key); const a = v(x), b = v(y); if (a == null && b == null) return 0; if (a == null) return 1; if (b == null) return -1; return (typeof a === 'string' ? a.localeCompare(b) : a - b) * sort.dir; }),
  [results, bucket, hold, onlyAsset, selected, unit, category, decision, queryTerms, searchIndex, check, actionF, feasF, execF, sort]);
  const actions = useMemo(() => [...new Set(results.map(r => r.action).filter(Boolean))].sort(), [results]);
  const feasibilities = useMemo(() => [...new Set(results.map(r => r.feasibilityLabel).filter(Boolean))].sort(), [results]);
  const assetRows: Any[] = assetAssessments(results, selected);
  const chosen = assetRows.find(r => String(r.id) === assessment) || assetRows[0];
  const chosenCurve = curveData?.assessments?.find((a: Any) => a.id === chosen?.id);
  const assets = useMemo(() => { const ids = new Set(results.map(r => String(r.a.assetId))); return (run?.assets || []).filter((a: Any) => ids.has(String(a.id))); }, [run, results]);
  const assetOptions = useMemo(() => { const t = parseQuery(assetQuery); return assets.filter((a: Any) => t.every(x => norm([a.name, a.clientId, a.unit, a.type].join(' ')).replace(/ /g, '').includes(norm(x.value).replace(/ /g, '')) !== x.neg)); }, [assets, assetQuery]);
  const busy = status !== 'Ready', num = (v: number) => v.toLocaleString();
  const set = (key: string, value: any) => setSettings((s: Any) => ({ ...s, [key]: value }));
  const totals: Any = assetCosts(assetRows);
  const exposure = useMemo(() => {
    const byId: Record<string, { cur: number; prop: number }> = {}; let cur = 0, prop = 0;
    if (run && curveData) for (const r of assetRows) {
      const src = curveData.assessments?.find((x: Any) => x.id === r.id); if (!src || r.costBenefit?.avoided == null) continue;
      const c = daysAbove(r, src, run.today, settings.horizon, 'current'), p = daysAbove(r, src, run.today, settings.horizon, 'proposed');
      if (c == null || p == null) continue; byId[r.id] = { cur: c, prop: p }; cur += c; prop += p;
    }
    return { byId, cur, prop };
  }, [run, curveData, selected, settings.horizon]); // eslint-disable-line react-hooks/exhaustive-deps
  const assetWindows = (run?.windows || []).filter((w: Any) => w.unitId === chosen?.a.asset?.unitId).sort((a: Any, b: Any) => a.start.localeCompare(b.start));
  // Mitigated and unmitigated risk at the start of each TAR on the selected asset's unit, on that assessment's
  // governing measure. Model's stored curves only come down per asset, so this is available for the asset on
  // screen; rows from any other asset show nothing rather than a guess.
  const tarRisk = useMemo(() => {
    const by: Record<string, ({ mit: number | null; unmit: number | null } | null)[]> = {};
    if (!curveData || !assetWindows.length) return by;
    for (const r of assetRows) {
      const src = curveData.assessments?.find((x: Any) => x.id === r.id);
      const m = r.gov?.measure;
      if (!src || !m) continue;
      by[r.id] = assetWindows.map((w: Any) => {
        const d = dateDay(w.start);
        const mit = curveValue(r, src, d, 'current', m), unmit = curveValue(r, src, d, 'unmit', m);
        return mit == null && unmit == null ? null : { mit, unmit };
      });
    }
    return by;
  }, [curveData, assetRows, assetWindows]);
  const tarSpan = assetWindows.length ? (tarCols ? assetWindows.length * 2 : 1) : 0;
  useEffect(() => { if (results.length && !results.some(r => String(r.a.assetId) === selected)) { setSelected(String(results[0].a.assetId)); setAssessment(''); } }, [results, selected]);
  useEffect(() => setPage(0), [bucket, hold, onlyAsset, unit, category, decision, query, check, actionF, feasF, execF, sort]);

  function choose(r: Any, scroll = true) {
    setSelected(String(r.a.assetId)); setAssessment(String(r.id));
    if (scroll) chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function pickBucket(b: string) {
    const next = bucket === b ? 'All in scope' : b; setBucket(next); setHold('');
    if (next !== 'All in scope' && !assetRows.some(r => r.bucket === next)) { const match = results.find(r => r.bucket === next); if (match) choose(match, false); }
  }
  function pickCheck(code: string) {
    setCheck(code); if (code) { setBucket('All in scope'); setHold(''); }
    if (code && !assetRows.some(r => hasFinding(r, code))) { const match = results.find(r => hasFinding(r, code)); if (match) choose(match, false); }
  }
  function pickHold(code: string) {
    setHold(code); if (code) setBucket('All in scope');
    if (code && !assetRows.some(r => holdsOf(r).some((h: Any) => h.code === code))) { const match = results.find(r => holdsOf(r).some((h: Any) => h.code === code)); if (match) choose(match, false); }
  }
  // clicking outside the cards and the table clears the card filters
  useEffect(() => {
    const onDown = (e: MouseEvent) => { const el = e.target as HTMLElement; if (el.closest('.buckets,.card-strip,.assessments-section,.chart-card,.settings,.topbar,button,select,input,a,summary')) return; setBucket('All in scope'); setHold(''); setCheck(''); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setBucket('All in scope'); setHold(''); setCheck(''); } };
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  async function exportCba() {
    if (!run) return; setExporting('cba');
    try { const r = await exportCostBenefitWorkbook({ run, settings }); setExportNote(`${num(r.assessments)} assessments · ${num(r.tasks)} task rows · ${num(r.assets)} assets → ${r.name}`); }
    catch (e) { setError(e instanceof Error ? e.message : 'Cost-benefit export failed.'); } finally { setExporting(''); }
  }
  async function exportModel(assetOnly = false) {
    if (!run || !template) return; setExporting('sample');
    try {
      const costTasks = await gunzipJson('/examples/inspection/models/costs-' + SID + '.json.gz?v=' + encodeURIComponent(dataVersion));
      const taskRows = await gunzipJson('/examples/inspection/models/taskrows-' + SID + '.json.gz?v=' + encodeURIComponent(dataVersion)).catch(() => null);
      const scoped = assetOnly ? { ...run, results: run.results.filter((x: Any) => String(x.a.assetId) === selected) } : run;
      const r = await exportModelWorkbook({ run: scoped, template, costTasks, taskRows, userLinks: links, fetchCurves: (id: string) => curvesFor(id).catch(() => null), label: assetOnly ? assets.find((a: Any) => String(a.id) === selected)?.name : undefined });
      setExportNote(`${num(r.tasks)} task rows · ${num(r.links)} assessment / CML links · ${num(r.steps)} steps → ${r.name}.${taskRows ? '' : ' Task details were not in this snapshot: refresh it from Model for complete rows and CML links.'} Every proposed task is included; ${num(r.held)} task groups with a flag or review hold have it written in their notes and are listed on the “Flags and holds” sheet.`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Model export failed.'); } finally { setExporting(''); }
  }

  const bucketCount = (b: string) => b === 'All in scope' ? results.length : results.filter(r => r.bucket === b).length;
  const visibleBuckets = BUCKETS.filter(b => b.key !== 'Interval-driven' || settings.scope === 'all');

  return <div className="site-shell">
    <nav className="topbar">
      <div className="brand"><strong>Task Optimizer</strong><span className="divider" /><ScenarioPicker sid={SID} run={run} installed={installed} onOpen={openScenario} /></div>
      <div className="nav-actions">
        <button className="search-open" onClick={() => window.dispatchEvent(new Event('portfolio.inspection:open-search'))} aria-label="Search (Ctrl+K)"><span aria-hidden="true">⌕</span> Search<kbd>Ctrl K</kbd></button>
        {run && <ChecksMenu run={run} results={results} check={check} onPickCheck={pickCheck} hold={hold} onPickHold={pickHold} />}
        <HeaderMenu id="settings" label={<><span aria-hidden="true">⚙</span> Settings</>} wide title="Planning settings, assessment scope and scenario data">{() => <>
          <div className="panel-head"><strong>Planning settings</strong><span>Risk thresholds, timing and assessment scope · changes calculate automatically, nothing is written to Model</span></div>
          <div className="settings-grid">
            {([['hse', 'HSE limit ($)', 10000], ['econ', 'ECON limit ($)', 10000], ['margin', 'Margin (days)', 5], ['onlinePref', 'Pull into TAR within (days)', 30], ['inspectionThreshold', 'Inspection pin', .01]] as const).map(([key, label, step]) => <label key={key}>{label}<input aria-label={label} type="number" min={key === 'inspectionThreshold' ? .5 : 0} max={key === 'inspectionThreshold' ? .99 : undefined} step={step} value={settings[key]} onChange={e => set(key, e.target.value === '' ? '' : Number(e.target.value))} /></label>)}
            <label>Horizon<input aria-label="Horizon" type="date" value={settings.horizon} min={run?.today} onChange={e => set('horizon', e.target.value)} /></label>
            <label>Keep tolerance (days)<input aria-label="Keep tolerance (days)" type="number" min="0" value={settings.keepTolerance} onChange={e => set('keepTolerance', Number(e.target.value))} /></label>
            <label title="A current task more than this many days before its breach is classed as early">Early slack (days)<input aria-label="Early slack (days)" type="number" min="0" step="30" value={settings.earlyDays} onChange={e => set('earlyDays', Number(e.target.value))} /></label>
            <label title="How long a breach may wait for its outage task in the next TAR before the check engine flags it. A breach whose task can be done online is never accepted.">Accepted exposure (days)<input aria-label="Accepted exposure" type="number" min="0" step="30" value={settings.acceptedExposure} onChange={e => set('acceptedExposure', Number(e.target.value))} /></label>
            <label title="An assessment whose unmitigated risk stays below this share of the HSE / ECON limit to the horizon is flagged as negligible">Negligible risk (% of limit)<input aria-label="Negligible risk" type="number" min="0" max="100" step="0.1" value={settings.negligiblePct} onChange={e => set('negligiblePct', Number(e.target.value))} /></label>
            <label>Assessment scope<select value={settings.scope} onChange={e => set('scope', e.target.value)}><option value="fixed">Fixed equipment &amp; piping</option><option value="all">All assessments</option></select></label>
            <label className="check setting-check"><input type="checkbox" checked={settings.showCost} onChange={e => set('showCost', e.target.checked)} />Show costs</label>
            <label className="check setting-check" title="Re-plan flagged assessments with alternative placements and keep the variant that clears the most checks without adding days above the limit"><input type="checkbox" checked={settings.solve !== false} onChange={e => set('solve', e.target.checked)} />Check engine solves plans</label>
            <button className="reset" onClick={() => setSettings({ ...defaults })}>↺ Reset controls</button>
            <button className="reset accent" onClick={() => setRecalc(x => x + 1)} disabled={busy}>Recalculate</button>
          </div>
          <div className="panel-head"><strong>Scenario data</strong><span>Open an installed scenario, or read one from Model with the local data service</span></div>
          <ScenarioControl sid={SID} run={run} installed={installed} onOpen={openScenario} onInstalled={async () => { await loadIndex(); }} />
        </>}</HeaderMenu>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}><span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span> {theme === 'light' ? 'Dark' : 'Light'}</button>
        <Badge color={error ? 'red' : busy ? 'amber' : 'green'}>{error ? 'Check inputs' : busy ? 'Updating' : 'Ready'}</Badge>
        {settings.showCost && <button className="cost-export" onClick={exportCba} disabled={busy || !run || !!exporting}>{exporting === 'cba' ? 'Building…' : '↓ Export cost-benefit (Excel)'}</button>}
        <button className="accent" onClick={() => exportModel(false)} disabled={busy || !run || !template || !!exporting}>{exporting === 'sample' ? 'Building…' : '↓ Export Model import sheet'}</button>
      </div>
    </nav>
    <main><div className="demo-disclosure">Original workbench UI and calculation engine · Fictional assets and scenarios · Browser-only changes</div>
      <header className="page-heading">
        <div><p className="eyebrow">PLANNING WORKBENCH</p><h1>Task Timing Optimizer</h1><p>Model task placement · V2 acceptance gates <span className="meta-divider">/</span> As of {run?.today || '—'}</p></div>
        <span className="snapshot">{run ? num(results.length) + ' assessments' : 'Reading source data'}<small>{run?.scenarioName || 'Scenario'} · {SID}</small></span>
      </header>
      {run && SID === OPTIMIZED_SID && (() => {
        const refined = results.filter(r => r.proposed.some((p: Any) => !p.kept)).length, agree = results.length - refined;
        return <div className="optimized-banner" role="status">
          <strong>{run.scenarioName} comparison scenario.</strong>
          <span>The optimizer re-planned every in-scope assessment against it and agrees on {num(agree)} of {num(results.length)} ({Math.round(agree / Math.max(1, results.length) * 100)}%). {refined ? <>The remaining {num(refined)} carry optional refinements, marked in the assessments table.</> : 'It proposes no further changes.'}</span>
        </div>;
      })()}
      {error &&<div className="error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
      {exportNote && <div className="notice" role="status">{exportNote}<button onClick={() => setExportNote('')} aria-label="Dismiss export notice">×</button></div>}

      {run && <SearchPalette index={[...searchIndex.values()]} results={results} assets={run.assets || []} checkSummary={run.checkSummary} sampleDataSummary={run.sampleDataSummary}
        onAssessment={(r: Any) => { setBucket('All in scope'); setHold(''); choose(r); }}
        onAsset={(id: string) => { setSelected(id); setAssessment(''); chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
        onTable={(q: string) => { setQuery(q); setBucket('All in scope'); setHold(''); setCheck(''); setOnlyAsset(false); document.querySelector('.assessments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
        onBucket={(b: string) => { pickBucket(b); document.querySelector('.assessments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
        onCheck={(c: string) => { pickCheck(c); document.querySelector('.assessments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />}
      <div className="buckets" style={{ gridTemplateColumns: `repeat(${visibleBuckets.length},minmax(0,1fr))` }}>{visibleBuckets.map(b => {
        const rows = b.key === 'All in scope' ? results : results.filter(r => r.bucket === b.key);
        const breached = rows.filter(r => r.alreadyBreached).length, held = rows.filter(r => r.exportHold).length;
        return <button key={b.key} aria-pressed={bucket === b.key} className={'glass bucket ' + b.color + (bucket === b.key ? ' active' : '')} onClick={() => pickBucket(b.key)}>
          <span>{b.key}</span><strong>{run ? num(bucketCount(b.key)) : '—'}</strong><small>{b.hint}</small>
          {run && (held ? <small className="amber">{b.key === 'All in scope' ? `${num(held)} held from export` : `${num(rows.filter(r => r.decision === 'Accepted').length)} accepted · ${num(held)} held`}</small> : breached ? <small className="red-text">{num(breached)} breached today</small> : null)}
        </button>;
      })}</div>

      {run && <Contributors results={results} settings={settings} onSelect={r => choose(r)} />}

      {!run ? <section className="glass loading" role="status"><span className="spinner" /><h2>{status}</h2><p>Loading the source model, task costs and governing CML data.</p></section> : <>
        <section className="glass chart-card" ref={chartRef}>
          <div className="card-heading">
            <div><h2>Lifetime Variability Curve</h2><p>{chosen?.a.asset?.name || 'Select an asset'} <span className="meta-divider">/</span> {chosen?.a.asset?.unit}</p></div>
            <div className="asset-picker"><input aria-label="Search assets" placeholder="Search assets…" value={assetQuery} onChange={e => setAssetQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && assetOptions[0]) { setSelected(String(assetOptions[0].id)); setAssessment(''); } }} title={assetQuery ? `${assetOptions.length} matching assets · Enter opens the first` : 'Name, client ID, unit or type · Enter opens the first match'} /><select aria-label="Select asset" value={selected} onChange={e => { setSelected(e.target.value); setAssessment(''); }}>{!assetOptions.some((a: Any) => String(a.id) === selected) && <option value={selected}>{chosen?.a.asset?.name || 'Select asset'}</option>}{assetOptions.map((a: Any) => <option key={a.id} value={a.id}>{a.name} · {a.unit}</option>)}</select></div>
          </div>
          <div className="assessment-picker">
            <label>Assessment<select aria-label="Chart assessment" value={assessment === 'all' ? 'all' : chosen?.id || ''} onChange={e => setAssessment(e.target.value)}><option value="all">All assessments · compare mechanisms</option>{assetRows.map(r => <option value={r.id} key={r.id}>{r.a.component} · {r.bucket}</option>)}</select></label>
            {chosen && assessment !== 'all' && <><Badge color={bucketColor(chosen.bucket)}>{chosen.bucket}</Badge><Badge color={DECISION_COLOR[chosen.decision]}>{chosen.decision}</Badge>{holdsOf(chosen).map((h: Any) => <Badge key={h.code} color={HOLDS.find(x => x.code === h.code)?.color} title={h.detail}>{h.label}</Badge>)}</>}
          </div>
          {chosen && assessment !== 'all' && <p className="reason-line">{chosen.reason}{holdsOf(chosen).map((h: Any) => ' ' + h.detail).join('')}{chosen.resolution && <span className="teal-text"> Check engine: {chosen.resolution.label.toLowerCase()} cleared {chosen.resolution.fixed.join(', ') || 'lower-severity findings'}.</span>}</p>}
          {chosen && chosenCurve ? <LvcChart row={chosen} source={chosenCurve} rows={assetRows} sources={curveData?.assessments || []} all={assessment === 'all'} windows={assetWindows} today={run.today} horizon={settings.horizon} settings={settings} /> : <p className="empty">{curveError || 'Loading stored Model curves…'}</p>}
          <div className="lvc-panels">
          <Collapsible id="links" title="Task links and credits" sub={`${chosen?.a.asset?.name || 'Selected asset'} · edit which tasks credit which assessments`} defaultOpen={false}>
            <div className="links-actions"><button onClick={() => exportModel(true)} disabled={busy || !template || !!exporting}>↓ Export this asset (Model import)</button></div>
            {curveData ? <TaskLinks rows={assetRows} tasks={curveData.tasks || []} today={run.today} coverage={run.coverage} links={links} setLinks={setLinks} template={template || {}} asset={assets.find((a: Any) => String(a.id) === selected)} /> : <p className="empty">Loading tasks…</p>}
          </Collapsible>
          <TaskPool gates={run.gates} bundles={run.options.bundles} settings={settings} set={set} />
          <AdvancedDefaults options={run.options} settings={settings} set={set} bundles={bundles} setBundles={setBundles} />
          <Collapsible id="gates" title="Acceptance and engineering review" sub="V2 gates on the fresh calculation · selected asset" defaultOpen={false}>
            <div className="gate-content">
              <div className="segments gate-tabs">{['Portfolio', 'Replacement', 'Removal'].map(t => <button key={t} aria-pressed={gateTab === t} onClick={() => setGateTab(t)}>{t}</button>)}</div>
              {gateTab === 'Portfolio' && <><p>Each proposed asset / date / task type / definition group is flagged when a linked assessment gets more expected failures under the proposed plan. The flag is informational: flagged groups are still in the Model import, with the flag written in the task notes.</p>{run.gates.portfolio.filter((g: Any) => String(g.assetId) === selected).map((g: Any) => <div className="gate-row" key={g.key}><div><strong>{g.definition} · {g.bundle}</strong><small>{g.date} · {g.assessmentCount} assessment driver{g.assessmentCount === 1 ? '' : 's'} · {g.uniqueCost == null ? 'not priced' : money(g.uniqueCost)}</small></div><Badge color={g.accepted ? 'green' : 'amber'}>{g.accepted ? 'No-harm passed' : 'Expected failures rise (flag)'}</Badge></div>)}</>}
              {gateTab === 'Replacement' && run.gates.replacements.filter((g: Any) => String(g.assetId) === selected).map((g: Any) => <div className="gate-row" key={g.assessmentId}><div><strong>{assetRows.find(r => r.id === g.assessmentId)?.a.component}</strong><small>{g.trigger} · {g.interventions} prior interventions · {g.rapid} rapid recurrences</small></div><Badge color={g.eligible ? 'purple' : 'muted'}>{g.eligible ? 'Replacement review' : 'Not eligible'}</Badge></div>)}
              {gateTab === 'Removal' && <><p>Screening candidates only. No removals are applied or exported.</p>{run.gates.removals.filter((g: Any) => String(g.assetId) === selected).map((g: Any, i: number) => <div className="gate-row" key={i}><strong>Task {g.taskNumber} · {g.date}</strong><span>{g.reason}</span></div>)}</>}
              {!run.gates[gateTab === 'Portfolio' ? 'portfolio' : gateTab === 'Replacement' ? 'replacements' : 'removals'].some((g: Any) => String(g.assetId) === selected) && <p className="empty">No {gateTab.toLowerCase()} items for this asset.</p>}
            </div>
          </Collapsible>
          </div>
        </section>

        <Collapsible id="visit" title="Asset visit plan" sub={`${chosen?.a.asset?.name || 'Selected asset'} · current plan and proposed tasks on one timeline`}>
          <VisitPlan rows={assetRows} windows={assetWindows} today={run.today} horizon={settings.horizon} />
        </Collapsible>

        <section className="glass assessments-section">
          <div className="card-heading">
            <div><h2>Assessments <span className="count">{num(filtered.length)}</span></h2><p>{onlyAsset ? chosen?.a.asset?.name : 'All assets in scope'} · {bucket}{hold ? ' · ' + HOLDS.find(h => h.code === hold)?.label : ''}</p></div>
            <div className="table-filters">
              <select aria-label="Unit" value={unit} onChange={e => setUnit(e.target.value)}><option value="">All units</option>{units.map(u => <option key={u}>{u}</option>)}</select>
              <select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
              <select aria-label="Decision" value={decision} onChange={e => setDecision(e.target.value)}><option value="">All decisions</option>{Object.keys(DECISION_COLOR).map(d => <option key={d}>{d}</option>)}</select>
              <select aria-label="Engine action" value={actionF} onChange={e => setActionF(e.target.value)}><option value="">All actions</option>{actions.map(x => <option key={x}>{x}</option>)}</select>
              <select aria-label="Feasibility" value={feasF} onChange={e => setFeasF(e.target.value)}><option value="">All feasibility</option>{feasibilities.map(x => <option key={x}>{x}</option>)}</select>
              <select aria-label="Execution" value={execF} onChange={e => setExecF(e.target.value)}><option value="">Any execution</option><option value="outage">Outage</option><option value="online">Online</option></select>
              <select aria-label="Check" value={check} onChange={e => setCheck(e.target.value)}><option value="">All checks</option><optgroup label="Check engine">{(Object.values(run?.checkSummary || {}) as Any[]).filter((c: Any) => c.assessments).map((c: Any) => <option key={c.code} value={c.code}>{c.label}</option>)}</optgroup><optgroup label="Model data">{(Object.values(run?.sampleDataSummary || {}) as Any[]).filter((c: Any) => c.assessments).map((c: Any) => <option key={c.code} value={'nd:' + c.code}>{c.label}</option>)}</optgroup></select>
              <span className="table-search-wrap"><input aria-label="Search assessments" type="search" placeholder="Search… e.g. 60035 cui · unit:200 · breach<2030" className="table-search" value={query} onChange={e => setQuery(e.target.value)} /><button className="search-help-btn" aria-expanded={searchHelp} aria-label="Search syntax" onClick={() => setSearchHelp(!searchHelp)}>?</button>{searchHelp && <span className="search-help" role="note">Every word must match, in any order. <code>&quot;phrase&quot;</code> · <code>-exclude</code> · <code>unit:</code> <code>asset:</code> <code>cat:</code> <code>mech:</code> <code>bucket:</code> <code>decision:</code> <code>action:</code> <code>task:</code> <code>cml:</code> <code>check:</code> <code>window:</code> · <code>breach&lt;2030</code> <code>exposure&gt;180</code> <code>life&lt;365</code> <code>risk&gt;1m</code> · <kbd>Ctrl</kbd>+<kbd>K</kbd> searches everything</span>}</span>
              <label className="check"><input type="checkbox" checked={onlyAsset} onChange={e => setOnlyAsset(e.target.checked)} />Selected asset only</label>
            </div>
          </div>
          <div className="table-wrap"><table><thead><tr><th />{[['asset', 'Asset'], ['assessment', 'Assessment'], ['category', 'Category'], ['risk', 'Risk today'], ['breach', 'Breach'], ['current', 'Current next task'], ['proposed', 'Proposed'], ['exec', 'Execution'], ['life', 'Life after'], ['exposure', 'Exposure'], ['bucket', 'Bucket'], ['decision', 'Decision'], ['', 'Why · checks'], ...(settings.showCost ? [['net', 'Net benefit']] : [])].map(([k, c]) => <th key={c} className={k ? 'sortable' : ''} onClick={() => k && setSort(s => ({ key: k, dir: s.key === k ? -s.dir : 1 }))}>{c}{sort.key === k && k ? (sort.dir > 0 ? ' ▲' : ' ▼') : ''}</th>)}
            {!!assetWindows.length && (tarCols
              ? assetWindows.flatMap((w: Any, i: number) => (['mit', 'unmit'] as const).map(kind => <th key={'tar' + w.id + kind} className={'tar-col' + (i === 0 && kind === 'mit' ? ' tar-first' : '')} title={`${w.name} · ${w.start}${w.end && w.end !== w.start ? ' → ' + w.end : ''} · ${kind === 'mit' ? 'mitigated (current plan)' : 'unmitigated'} risk on the governing measure`}>
                  {i === 0 && kind === 'mit' ? <button className="col-toggle" onClick={toggleTarCols} title="Hide the TAR risk columns">▾</button> : null}
                  {w.name.replace(/_\d+$/, '')}<small>{kind === 'mit' ? 'mitigated' : 'unmitigated'}</small></th>))
              : <th className="tar-col tar-first"><button className="col-toggle" onClick={toggleTarCols} title="Show mitigated and unmitigated risk at each TAR">▸ Risk at TAR</button><small>{assetWindows.length} TARs · mit / unmit</small></th>)}
            </tr></thead><tbody>
            {filtered.slice(page * PAGE, page * PAGE + PAGE).map(r => { const first = r.proposed.find((p: Any) => !p.kept); const expo = r.proposed.reduce((s: number, p: Any) => s + (p.exposureDays || 0), 0); return <Fragment key={r.id}><tr className={String(r.id) === String(chosen?.id) ? 'selected' : ''} onClick={() => choose(r)} onKeyDown={e => { if (e.key === 'Enter') choose(r); }} tabIndex={0} aria-label={'Inspect ' + r.a.component}>
              <td><button className="row-toggle" aria-expanded={openRow === r.id} aria-label="Show details" onClick={e => { e.stopPropagation(); setOpenRow(openRow === r.id ? '' : r.id); }}>{openRow === r.id ? '▾' : '▸'}</button></td>
              <td className="asset-cell"><Highlight text={r.a.asset?.name || ''} words={words} /><small><Highlight text={r.a.asset?.unit || ''} words={words} /></small></td>
              <td><Highlight text={r.a.component} words={words} /><small>{r.feasibilityLabel}</small></td>
              <td>{r.a.category || 'Unknown'}</td>
              <td className="numeric">{r.gov?.measure ? money(r.a.today?.['mit' + (r.gov.measure === 'hse' ? 'Hse' : 'Econ')]) : 'Not available'}<small>{r.gov?.measure?.toUpperCase() || 'No measure'}</small></td>
              <td className={r.alreadyBreached ? 'red-text numeric' : 'numeric'}>{r.b0Date || 'No breach'}{r.alreadyBreached && <small>already breached</small>}</td>
              <td>{r.currentNext?.date || 'None'}<small>{r.currentNext?.bundle}</small></td>
              <td>{first?.date || 'No change'}<small>{first ? (first.definitions?.[0] || first.bundle) : ''}</small>{first?.movedFrom && <small>From {first.movedFrom}</small>}</td>
              <td>{first ? <Badge color={first.execution === 'outage' ? 'amber' : 'purple'}>{first.execution}</Badge> : <small>–</small>}<small>{first?.window}</small></td>
              <td className="numeric">{first?.life != null ? first.life.toLocaleString() + ' d' : '–'}</td>
              <td className={'numeric ' + (expo ? 'red-text' : '')}>{expo ? expo.toLocaleString() + ' d' : '–'}</td>
              <td><Badge color={bucketColor(r.bucket)}>{r.bucket}</Badge></td>
              <td><Badge color={DECISION_COLOR[r.decision]}>{r.decision}</Badge></td>
              <td className="why">{r.reason}{holdsOf(r).map((h: Any) => <small key={h.code} className={HOLDS.find(x => x.code === h.code)?.color || 'red'} title={h.detail}>{h.label}</small>)}{(r.checks || []).filter((c: Any) => c.severity !== 'info').map((c: Any, i: number) => <small key={'c' + i} className={SEVERITY_COLOR[c.severity]} title={c.detail}>{c.label}</small>)}</td>
              {settings.showCost && <td className={'numeric ' + (r.costBenefit.net < 0 ? 'red-text' : r.costBenefit.net > 0 ? 'teal-text' : '')}>{r.costBenefit.net == null ? <small>No risk curve</small> : money(r.costBenefit.net)}</td>}
              {!!assetWindows.length && (tarCols
                ? assetWindows.flatMap((w: Any, i: number) => { const v = tarRisk[r.id]?.[i]; const lim = r.gov?.measure ? settings[r.gov.measure] : null;
                  return (['mit', 'unmit'] as const).map(kind => { const x = v?.[kind];
                    return <td key={'tar' + w.id + kind} className={'numeric tar-col' + (i === 0 && kind === 'mit' ? ' tar-first' : '') + (x != null && lim != null && x >= lim ? ' red-text' : '')}>{x == null ? '–' : money(x)}</td>; }); })
                : <td className="numeric tar-col tar-first">–</td>)}
            </tr>{openRow === r.id && <AssessmentDrawer r={r} today={run.today} settings={settings} colSpan={(settings.showCost ? 15 : 14) + tarSpan} />}</Fragment>; })}
          </tbody></table>{!filtered.length && <p className="empty">No assessments match these filters.</p>}</div>
          <div className="pagination"><span>{filtered.length ? `${page * PAGE + 1}–${Math.min(page * PAGE + PAGE, filtered.length)} of ${num(filtered.length)}` : '0 assessments'}</span><div><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></div></div>
        </section>

        {settings.showCost && <section className="glass cost-benefit-section">
          <div className="card-heading"><div><h2>Cost and Benefit</h2><p>{chosen?.a.asset?.name} · proposed plan to {settings.horizon}</p></div><button onClick={exportCba} disabled={busy || !!exporting}>↓ Export cost-benefit report (Excel)</button></div>
          <div className="metrics">
            <div><span>Task cost to {settings.horizon}</span><strong>{money(totals.current)} <i>→</i> {money(totals.proposed)}</strong><small className={totals.delta > 0 ? 'red-text' : 'teal-text'}>{totals.delta == null ? 'No risk curve on this asset' : (totals.delta > 0 ? '+' : '') + money(totals.delta) + ' change'}{totals.unpriced ? ` · ${totals.unpriced} unpriced task${totals.unpriced === 1 ? '' : 's'}` : ''}</small></div>
            <div><span>Expected failure cost</span><strong>{money(totals.failureCur)} <i>→</i> {money(totals.failureProp)}</strong><small className={totals.avoided != null && totals.avoided < 0 ? 'red-text' : 'teal-text'}>{money(totals.avoided)} avoided</small></div>
            <div><span>Net benefit</span><strong className={totals.net != null && totals.net < 0 ? 'red-text' : 'teal-text'}>{totals.net != null && totals.net > 0 ? '+' : ''}{money(totals.net)}</strong><small>{totals.delta > 0 && totals.avoided != null ? (totals.avoided / totals.delta).toFixed(1) + ' $ avoided per $ spent' : 'Failure cost avoided − task cost change'}</small></div>
            <div><span>Days above the limit</span><strong>{exposure.cur.toLocaleString()} <i>→</i> {exposure.prop.toLocaleString()}</strong><small>All assessments on this asset · today → horizon</small></div>
          </div>
          <div className="table-wrap"><table><thead><tr>{['Assessment', 'Changes', 'Decision', 'Task cost · current', 'Task cost · proposed', 'Δ cost', 'Failure cost · current', 'Failure cost · proposed', 'Avoided', 'Net benefit', 'Days above limit'].map(c => <th key={c}>{c}</th>)}</tr></thead><tbody>{assetRows.map(r => { const cb = r.costBenefit, changes = r.proposed.filter((p: Any) => !p.kept), days = exposure.byId[r.id]; return <tr key={r.id} className={r.id === chosen?.id ? 'selected' : ''} onClick={() => setAssessment(String(r.id))}>
            <td>{r.a.component.split(' | ').slice(1).join(' · ') || r.a.component}<small><Badge color={bucketColor(r.bucket)}>{r.bucket}</Badge></small></td>
            <td>{changes.length ? changes.map((p: Any, i: number) => <small key={i}>{p.moved ? 'shift ' : 'copy '}{p.definitions?.[0] || p.bundle} → {p.date}</small>) : <small>none</small>}</td>
            <td><Badge color={DECISION_COLOR[r.decision]}>{r.decision}</Badge></td>
            {cb.avoided == null ? <td className="numeric" colSpan={8}>No risk curve: nothing to compare</td> : <>
              <td className="numeric">{money(cb.current)}</td>
              <td className="numeric">{money(cb.proposed)}{cb.unpriced ? <small>{cb.unpriced} unpriced</small> : null}</td>
              <td className={'numeric ' + (cb.delta > 0 ? 'red-text' : '')}>{cb.delta > 0 ? '+' : ''}{money(cb.delta)}</td>
              <td className="numeric">{money(cb.failureCur)}<small>{cb.failuresCur?.toFixed(2)} expected failures</small></td>
              <td className="numeric">{money(cb.failureProp)}<small>{cb.failuresProp?.toFixed(2)}</small></td>
              <td className={'numeric ' + (cb.avoided >= 0 ? 'teal-text' : 'red-text')}>{money(cb.avoided)}</td>
              <td className={'numeric ' + (cb.net >= 0 ? 'teal-text' : 'red-text')}>{cb.net > 0 ? '+' : ''}{money(cb.net)}</td>
            </>}
            {cb.avoided != null && <td className="numeric">{days ? `${days.cur.toLocaleString()} → ${days.prop.toLocaleString()}` : '–'}</td>}
          </tr>; })}</tbody></table></div>
          <p className="footnote">Same arithmetic as the previous site. Task cost = Model costs of every task in each plan from today to the horizon (kept and shifted tasks in both, copies only in the proposed plan), so pulled-in and copied tasks show as increases; unpriced tasks count as $0 and are listed. Expected failure cost = expected failure events to the horizon × consequence on the governing measure. Net benefit = failure cost avoided − task cost change. Rejected changes stay visible here and are left out of the Model import file.</p>
        </section>}
      </>}
      <footer><span>Model Task Optimizer</span><span role="status" aria-live="polite">{busy && !error ? status : 'Source snapshot · SQL connection deferred'}</span></footer>
    </main>
  </div>;
}
