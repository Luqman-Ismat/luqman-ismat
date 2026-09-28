// Search for the optimizer: one query language for the quick search (Ctrl+K), the assessments table and the asset picker.
//
//   60035 cui              every word must match somewhere (any order; punctuation and case ignored)
//   "primary pipe"         exact phrase
//   -thinning              exclude
//   unit:200  asset:201b  cat:cui  mech:hic  bucket:pull  decision:rejected  action:add  task:TMLC  cml:87502  check:exposure  window:2027
//   breach<2030  breach>=2028-06  exposure>180  life<365  risk>1m
//
// Field names can be shortened to any unambiguous prefix (buc:, dec:, ...).

const norm = s => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.]+/g, ' ').trim();
const compact = s => norm(s).replace(/[\s.]+/g, '');

export const FIELDS = {
  asset: 'Asset name or client ID', unit: 'Unit / train', assessment: 'Assessment (component)', cat: 'Category or CUI', mech: 'Damage mechanism',
  bucket: 'Bucket', decision: 'Decision', action: 'Engine action', task: 'Task number or definition (current or proposed)', cml: 'Governing CML',
  check: 'Check or Model data finding', window: 'TAR window', status: 'Hold or note',
  breach: 'First breach date (compare: breach<2030)', exposure: 'Exposure days (compare)', life: 'Life after first change, days (compare)', risk: 'Risk today $ (compare)',
};
const NUMERIC = new Set(['breach', 'exposure', 'life', 'risk']);
const fieldOf = name => { const n = name.toLowerCase(); if (FIELDS[n]) return n; const hits = Object.keys(FIELDS).filter(f => f.startsWith(n)); return hits.length === 1 ? hits[0] : n === 'category' ? 'cat' : n === 'mechanism' ? 'mech' : n === 'cmls' ? 'cml' : null; };

// query → terms [{ field, value, neg, op, phrase }]
export function parseQuery(q) {
  const terms = [];
  const re = /(-)?(?:([a-z]+)(:|<=|>=|<|>|=))?(?:"([^"]*)"|(\S+))/gi;
  let m;
  while ((m = re.exec(String(q || '')))) {
    const [, neg, rawField, op, quoted, bare] = m;
    const value = quoted ?? bare ?? '';
    if (!value) continue;
    const field = rawField ? fieldOf(rawField) : null;
    if (rawField && !field) { terms.push({ field: null, value: `${rawField}${op}${value}`, neg: !!neg, op: ':', phrase: quoted != null }); continue; }
    terms.push({ field, value, neg: !!neg, op: op || ':', phrase: quoted != null });
  }
  return terms;
}

const moneyValue = v => { const s = String(v).toLowerCase().replace(/[$,\s]/g, ''); const k = s.endsWith('k') ? 1e3 : s.endsWith('m') ? 1e6 : s.endsWith('b') ? 1e9 : 1; return parseFloat(s) * k; };
const compare = (a, op, b) => op === '<' ? a < b : op === '<=' ? a <= b : op === '>' ? a > b : op === '>=' ? a >= b : a === b;

// searchable text per field for one optimizer result (built once per run)
export function indexResult(r) {
  const a = r.a || {}, first = (r.proposed || []).find(p => !p.kept);
  const tasks = [...(r.current?.events || []), ...(r.proposed || [])].flatMap(e => [...(e.taskNumbers || []), ...(e.definitions || []), e.bundle, e.copyOf?.taskNumbers?.join(' ')]).filter(Boolean);
  const cui = /\bcui\b|corrosion under insulation/i.test(`${a.component} ${a.mechanism}`) ? 'CUI' : '';
  const f = {
    asset: [a.asset?.name, a.asset?.clientId].join(' '), unit: [a.asset?.unit, a.asset?.system].join(' '), assessment: [a.component, a.clientId].join(' '),
    cat: [a.category || 'No category', cui].join(' '), mech: a.mechanism || '', bucket: r.bucket || '', decision: r.decision || '', action: r.action || '',
    task: tasks.join(' '), cml: r.worstCml?.clientId || '', check: [...(r.checks || []).map(c => `${c.code} ${c.label}`), ...(r.sampleData || []).map(c => `${c.code} ${c.label}`)].join(' '),
    window: (r.proposed || []).map(p => p.window).filter(Boolean).join(' '), status: [...(r.holds || []).map(h => h.label), ...(r.notes2 || []).map(n => n.label)].join(' '),
  };
  const norms = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, norm(v)]));
  const all = Object.values(norms).join(' ') + ' ' + norm(r.reason);
  return {
    r, norms, all, allCompact: compact(all),
    nums: { breach: r.alreadyBreached ? '0000-00-00' : r.b0Date || '9999-99-99', exposure: (r.proposed || []).reduce((s, p) => s + (p.exposureDays || 0), 0), life: first?.life ?? null,
      risk: r.gov?.measure ? a.today?.[r.gov.measure === 'hse' ? 'mitHse' : 'mitEcon'] ?? null : null },
    // ranking: matches in these fields weigh more
    strong: norm([a.asset?.name, a.asset?.clientId, a.component].join(' ')),
  };
}

function termMatch(entry, t) {
  if (t.field && NUMERIC.has(t.field)) {
    const v = entry.nums[t.field];
    if (v == null) return false;
    if (t.field === 'breach') { const want = String(t.value).padEnd(10, t.op === '<' || t.op === '>=' ? '-' : '~'); return t.op === ':' ? String(v).startsWith(t.value) : compare(String(v), t.op, want); }
    const n = t.field === 'risk' ? moneyValue(t.value) : parseFloat(t.value);
    return Number.isFinite(n) && compare(v, t.op === ':' ? '=' : t.op, n);
  }
  const hay = t.field ? entry.norms[t.field] ?? '' : entry.all;
  const want = norm(t.value);
  if (!want) return true;
  if (t.phrase) return (' ' + hay + ' ').includes(' ' + want + ' ') || hay.includes(want);
  if (hay.includes(want)) return true;
  // "60035cui" or "202-F" against "202f": compare without spaces
  const cw = compact(t.value);
  return cw.length > 2 && (t.field ? compact(entry.norms[t.field] ?? '') : entry.allCompact).includes(cw);
}

export function matches(entry, terms) {
  return terms.every(t => termMatch(entry, t) !== t.neg);
}
// higher is better: whole-word and name/component hits first
export function score(entry, terms) {
  let s = 0;
  for (const t of terms) {
    if (t.neg || (t.field && NUMERIC.has(t.field))) continue;
    const w = norm(t.value); if (!w) continue;
    if ((' ' + entry.strong + ' ').includes(' ' + w + ' ')) s += 6; else if (entry.strong.includes(w)) s += 4;
    else if ((' ' + entry.all + ' ').includes(' ' + w + ' ')) s += 2; else s += 1;
  }
  return s;
}
export function search(index, query) {
  const terms = parseQuery(query);
  if (!terms.length) return index.map(e => e.r);
  return index.filter(e => matches(e, terms)).map(e => [e, score(e, terms)]).sort((x, y) => y[1] - x[1]).map(([e]) => e.r);
}
// plain words of a query, for highlighting
export function highlightWords(query) {
  return parseQuery(query).filter(t => !t.neg && !(t.field && NUMERIC.has(t.field))).map(t => norm(t.value)).filter(w => w.length > 1);
}
export { norm };
