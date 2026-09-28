/* Web adapter. engine.js (the regression-locked V1 placement engine) is loaded unchanged; V2 gates are translated from the
   supplied Python runner and evaluated on fresh results.

   Classification lives here and only here. Every result carries:
     bucket  – the V1 action bucket (what the plan does), identical to the V1 website's bucketOf()
     reason  – one sentence saying why the assessment is in that bucket
     holds   – review holds that stop the change from being exported (never change the bucket)
     notes   – informational flags that neither change the bucket nor hold the export
   The UI reads these fields and never re-derives them. */
importScripts('/examples/inspection/engine.js');
let model;
async function json(path) {
  let r;
  for (let i = 0; ; i++) {
    try { r = await fetch(path); if (r.ok || i >= 3) break; } catch (e) { if (i >= 3) throw Error('The local server is not responding while loading ' + path + '. Check that the dev server is running, then reload.'); }
    await new Promise(res => setTimeout(res, 600 * (i + 1)));
  }
  if (!r.ok) throw Error('Model source could not be loaded (' + r.status + ').');
  const bytes = await r.arrayBuffer(), stream = new Blob([bytes]).stream();
  return JSON.parse(await new Response(new Uint8Array(bytes)[0] === 31 ? stream.pipeThrough(new DecompressionStream('gzip')) : stream).text());
}
const median = a => { a = [...a].sort((x, y) => x - y); return a.length ? (a[Math.floor(a.length / 2)] + a[Math.floor((a.length - 1) / 2)]) / 2 : null; };
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

const HOLD = {
  portfolio: 'Portfolio no-harm rejected',
  conflict: 'Shared-task date conflict',
};
const FEASIBILITY = {
  'no Weibull fit': 'No Weibull fit',
  'cannot be cleared (engineering scope)': 'Cannot be cleared by a plan task',
  'needs renewal': 'Needs renewal',
  'engineering scope': 'Schedulable · no preferred task type',
  'schedulable': 'Schedulable',
  'uncovered': 'No future task credited',
  'no breach within horizon': 'No breach in horizon',
  'interval-driven': 'Interval-driven',
};
const NOTE = {
  portfolio: 'Expected failures rise (no-harm flag)',
  calendar: 'Plan ends at last TAR on file',
  replacement: 'Replacement review',
  uncleared: 'Breach not cleared',
};

// task pool group: CUI is its own group (its mechanism decides what can mitigate it), otherwise the damage-mechanism category
const poolGroup = a => Engine.poolGroup(a);
function gates(results, M, S) {
  const groups = new Map(), replacements = [], removals = [], pool = new Map(), cells = new Map();
  const cell = (group, bundle) => { const k = group + '|' + bundle; if (!cells.has(k)) cells.set(k, { group, bundle, tasks: new Set(), assets: new Set(), assessments: new Set(), costs: [], definitions: new Map(), future: 0, moved: 0, copied: 0, categories: new Set() }); return cells.get(k); };
  const included = new Map(results.map(r => [r.id, r]));
  for (const t of M.costTasks) for (const id of t.credit || []) {
    const r = included.get(id); if (!r || !t.bundle) continue;
    const key = [r.a.category, t.bundle, t.definition].join('|');
    if (!pool.has(key)) pool.set(key, { category: r.a.category, bundle: t.bundle, definition: t.definition, tasks: new Set(), assets: new Set(), costs: [] });
    const c = pool.get(key); c.tasks.add(t.id); c.assets.add(t.assetId); if (t.cost != null) c.costs.push(t.cost);
    const x = cell(poolGroup(r.a), t.bundle);
    if (!x.tasks.has(t.id)) { x.tasks.add(t.id); if (t.cost != null) x.costs.push(t.cost); if (t.date && t.date >= M.today && [2, 3].includes(t.statusCode)) x.future++; const d = t.definition || t.bundle; x.definitions.set(d, (x.definitions.get(d) || 0) + 1); }
    x.assets.add(t.assetId); x.assessments.add(id); if (r.a.category) x.categories.add(r.a.category);
  }
  for (const r of results) for (const p of r.proposed) if (!p.kept) { const x = cell(poolGroup(r.a), p.bundle); p.moved ? x.moved++ : x.copied++; if (r.a.category) x.categories.add(r.a.category); }
  for (const r of results) {
    let interventions = 0, rapid = 0;
    for (const e of r.a.events) {
      if (e.date < M.today && e.qMitAfter && r.L != null) { interventions++; const b = Engine.storedCrossing(M.levels, e.qMitAfter, r.L); if (b != null && b - e.day <= 1095) rapid++; }
      if (e.date >= M.today && e.date <= S.horizon) for (const n of e.taskNumbers || []) {
        const uncovered = (e.effectTargets || []).includes('CML') && !M.cml[r.id]?.coverage?.[n]?.worst;
        if (uncovered || (e.taskNumbers || []).length > 1) removals.push({ assessmentId: r.id, assetId: r.a.assetId, taskNumber: n, date: e.date, reason: uncovered ? 'Does not cover governing CML' : 'Coincident task group', screening: 'Candidate only; rerun all linked assessments before removal' });
      }
    }
    const recurrence = interventions >= 2 && rapid >= 2;
    replacements.push({ assessmentId: r.id, assetId: r.a.assetId, eligible: !!r.cannotClear || recurrence, interventions, rapid, trigger: r.cannotClear ? 'Engineering scope: no task in the plan clears minimum life' : recurrence ? 'Two or more rapid recurrences after interventions' : 'Not eligible' });
    r.replacementReview = !!r.cannotClear || recurrence;
    for (const p of r.proposed.filter(p => !p.kept)) {
      const definition = p.definitions?.[0] || p.bundle, key = [r.a.assetId, p.date, p.bundle, definition].join('|');
      if (!groups.has(key)) groups.set(key, { key, assetId: r.a.assetId, date: p.date, bundle: p.bundle, definition, drivers: [], costs: [] });
      const g = groups.get(key);
      if (!g.drivers.some(d => d.assessmentId === r.id)) g.drivers.push({ assessmentId: r.id, deltaFailures: r.expected ? r.expected.failuresProp - r.expected.failuresCur : null });
      if (p.cost != null) g.costs.push(p.cost);
      p.groupKey = key;
    }
  }
  const portfolio = [...groups.values()].map(g => ({ ...g, uniqueCost: median(g.costs), missingCost: !g.costs.length, accepted: g.drivers.every(d => d.deltaFailures != null && d.deltaFailures <= 1e-9), assessmentCount: g.drivers.length }));
  const rejected = new Map(portfolio.filter(g => !g.accepted).map(g => [g.key, g]));
  const poolRows = [...pool.values()].map(p => ({ category: p.category, bundle: p.bundle, definition: p.definition, taskCount: p.tasks.size, assetCount: p.assets.size, medianCost: median(p.costs), support: p.tasks.size >= 20 ? 'High' : p.tasks.size >= 5 ? 'Medium' : 'Low' })).sort((a, b) => b.taskCount - a.taskCount);
  const utRt = new Set(['UT / thickness', 'RT profile']);
  const poolCells = [...cells.values()].map(x => ({ group: x.group, bundle: x.bundle, tasks: x.tasks.size, future: x.future, assets: x.assets.size, assessments: x.assessments.size, medianCost: median(x.costs), moved: x.moved, copied: x.copied,
    definitions: [...x.definitions].sort((a, b) => b[1] - a[1]), preferred: [...x.categories].some(c => Engine.eligibleBundles({ category: c }).includes(x.bundle)),
    blocked: !Engine.poolAllows(S, x.group, x.bundle), allowed: Engine.poolAllows(S, x.group, x.bundle), support: x.tasks.size >= 20 ? 'High' : x.tasks.size >= 5 ? 'Medium' : 'Low' }));
  const poolGroups = [...new Set(results.map(r => poolGroup(r.a)))].map(g => ({ group: g, assessments: results.filter(r => poolGroup(r.a) === g).length }));
  const rules = S.poolRules || Engine.DEFAULT_SETTINGS.poolRules;
  const poolRules = Object.fromEntries(poolGroups.map(({ group }) => [group, rules[group] ? { explicit: true, allowed: rules[group] } : { explicit: false, denied: S.poolDefaultDeny || Engine.DEFAULT_SETTINGS.poolDefaultDeny }]));
  return { portfolio, replacements, removals, pool: poolRows, poolCells, poolGroups, poolRules, rejected };
}

// V1 website cost-benefit (planCosts / riskCosts / netBenefit), unchanged:
//   task cost · current   = Model cost of the plan's tasks that stay (kept or shifted), today..horizon
//   task cost · proposed  = the same tasks plus every copied task; unpriced tasks count 0 and are reported as unpriced
//   failure cost          = expected failures × CoF on the governing measure; avoided = current − proposed
//   net benefit           = failure cost avoided − task cost change
function costs(r) {
  const ps = r.proposed || [];
  const current = ps.filter(p => p.kept || p.moved).reduce((s, p) => s + (p.cost || 0), 0);
  const proposed = ps.reduce((s, p) => s + (p.cost || 0), 0);
  const unpriced = ps.filter(p => p.cost == null).length;
  const m = r.gov?.measure, x = r.expected;
  const failureCur = x && m ? x[m + 'Cur'] : null, failureProp = x && m ? x[m + 'Prop'] : null;
  const avoided = failureCur != null ? failureCur - failureProp : null;
  const delta = proposed - current;
  return { current, proposed, delta, unpriced, measure: m || null, failuresCur: x?.failuresCur ?? null, failuresProp: x?.failuresProp ?? null, failureCur, failureProp, avoided, net: avoided != null ? avoided - delta : null };
}

function supplementUnchanged(r, M, S) {
  if (r.expected || r.proposed.some(p => !p.kept) || r.a.scope !== 'fixed') return;
  const a = r.a, today = Engine.daysBetween(a.start, M.today), horizon = Engine.daysBetween(a.start, S.horizon);
  const at = d => { let q = a.q; for (const e of a.events) if (e.day <= d && e.qMitAfter) q = e.qMitAfter; let v = 0; for (let i = 0; i < M.levels.length; i++) if (q?.[i] != null && q[i] <= d) v = M.levels[i]; return v; };
  let failures = 0;
  for (const e of a.events) if (e.day > today && e.day <= horizon && e.qMitAfter) { const before = at(e.day - 1), after = at(e.day); if (after < before - 1e-9) failures += before; }
  failures += at(horizon);
  r.expected = { failuresCur: failures, failuresProp: failures, econCur: failures * (a.cofEcon || 0), econProp: failures * (a.cofEcon || 0), hseCur: failures * (a.cofHse || 0), hseProp: failures * (a.cofHse || 0) };
  r.expectedSupplement = 'Unchanged plan: same stored-curve arithmetic as V1';
}

// V1 bucketOf(), with pull-in and defer shown separately. Order matters and matches V1 exactly.
function bucketOf(r) {
  if (r.a.scope !== 'fixed') return 'Interval-driven';
  if (r.feasibility === 'no breach within horizon') return 'No breach in horizon';
  if (r.action === 'No task in plan') return 'No task/no default';
  if (r.cannotClear || r.action === 'Engineering scope') return 'Engineering scope';
  if (r.action === 'Pull in') return 'Pull in';
  if (r.action === 'Defer') return 'Defer';
  if (r.action === 'Add task' || r.action === 'Add renewal' || r.proposed.some(p => p.newTask)) return 'Add task';
  return 'Keep as planned';
}
const label = p => (p.definitions?.[0] || p.bundle || 'task');
function reasonOf(r, S) {
  const first = r.proposed.find(p => !p.kept), limit = (r.gov?.measure || '').toUpperCase();
  const breach = r.alreadyBreached ? 'already above the ' + limit + ' limit today' : r.b0Date ? 'reaches the ' + limit + ' limit ' + r.b0Date : '';
  switch (r.bucket) {
    case 'Interval-driven': return 'Interval-driven assessment (no Weibull risk curve): the optimizer does not place tasks for it.';
    case 'No breach in horizon': return 'Stays under both risk limits until ' + S.horizon + '; the current plan is kept.';
    case 'No task/no default': return 'No task in the current plan and no settings default credits this assessment' + (breach ? '; it ' + breach : '') + '.';
    case 'Engineering scope': {
      const note = [...(r.notes || [])].reverse().find(n => /engineering scope/.test(n));
      return note ? note.charAt(0).toUpperCase() + note.slice(1) + '.' : 'No task in the current plan holds the assessment under the ' + limit + ' limit for the minimum useful life.';
    }
    case 'Pull in': case 'Defer': {
      const d = first?.movedFrom ? days(first.movedFrom, first.date) : 0;
      return label(first) + ' moves ' + first?.movedFrom + ' → ' + first?.date + ' (' + Math.abs(d) + ' d ' + (d < 0 ? 'earlier' : 'later') + ')' + (breach ? '; the assessment ' + breach : '') + '.';
    }
    case 'Add task': return 'Copy of ' + (first?.copyOf?.taskNumbers?.[0] || label(first || {})) + ' added on ' + (first?.date || '—') + (first?.window ? ' (' + first.window + ')' : '') + (breach ? '; the assessment ' + breach : '') + '.';
    default: return 'Every proposed task is the current-plan task where it already is' + (breach ? '; the assessment ' + breach : '') + '.';
  }
}


// ---- Check engine. Runs on every assessment after the placement engine: plain common-sense checks of the risk, the current
// plan and the proposed plan. A solver then re-plans each flagged assessment with a few alternative placements and keeps a
// variant only when it clears more than it creates; whatever cannot be cleared stays flagged. Error checks hold the export.
const CHECKS = {
  beforeToday: ['error', 'Proposed task dated before today'],
  afterHorizon: ['error', 'Proposed task after the horizon'],
  afterLastTar: ['error', 'Task scheduled after the last TAR on file'],
  unordered: ['error', 'Proposed plan out of date order'],
  duplicate: ['error', 'Same task proposed twice on one date'],
  deferPastBreach: ['error', 'Shift moves a task past the breach it precedes'],
  droppedTask: ['error', 'Current-plan task missing from the proposed plan'],
  crackingGamma: ['error', 'Cracking task reuses a non-zero γ'],
  changeWithoutBreach: ['error', 'Change proposed with no breach in the horizon'],
  outageOutsideTar: ['warn', 'Outage task outside a TAR window'],
  exposureBeyondAccepted: ['warn', 'Proposed plan: breach waits longer than the accepted exposure for its TAR task'],
  onlineExposure: ['warn', 'Proposed plan: breach waits for a task that can be done online'],
  breachUnmitigated: ['warn', 'Proposed plan: breach with no mitigating task'],
  currentExposure: ['info', 'Current plan: breach waits longer than the accepted exposure (what the proposal addresses)'],

  noGovCml: ['warn', 'Proposed task does not cover the governing CML'],
  riseAtTask: ['warn', 'Task raises the curve on its date'],
  shortLife: ['warn', 'Task buys less than the minimum useful life'],
  engineeringWithChange: ['warn', 'Engineering scope assessment still has a proposed change'],
  worseThanCurrent: ['info', 'Proposed plan has more expected failures than the current plan (see the portfolio hold)'],
  breachAccepted: ['info', 'Proposed plan: breach within the accepted exposure before its TAR task'],
  breachAfterLastTar: ['info', 'Breach after the last TAR on file (nothing to schedule yet)'],
  currentExposureAccepted: ['info', 'Current plan: breach within the accepted exposure'],
  earlyTask: ['info', 'Proposed task far earlier than its breach'],
  unpriced: ['info', 'Proposed task has no price'],
  negligibleRisk: ['info', 'Risk stays negligible to the horizon'],
  noRiskCurve: ['info', 'No HSE or ECON risk curve'],
  cofFromModel: ['info', "Consequence taken from Model's risk curve"],
  sharedTaskMoved: ['warn', 'Shifting a shared task opens a breach on another assessment'],
};
const WEIGHT = { error: 100, warn: 10, info: 0 };  // information notes never drive the solver
// Model's consequence as its own stored curves imply it (risk ÷ PoF). Used where the model's CoF is missing, varies over time or
// disagrees with Model: the CoF where Model's unmitigated risk reaches the threshold (else its last value), so breach dates and
// dollar values follow Model's curve. Re-evaluated each run because it depends on the thresholds.
function applyModelCof(M, S) {
  for (const a of M.assessments) {
    const rec = M.cofRanges?.[a.id], none = M.sampleBreach?.a?.[a.id]?.facts?.noDollarRisk;
    if (!rec && !none) continue;
    if (!a._cofOrig) a._cofOrig = { cofHse: a.cofHse, cofEcon: a.cofEcon, hasHse: a.hasHse, hasEcon: a.hasEcon };
    Object.assign(a, a._cofOrig);
    a.cofSource = {}; delete a.cofSeries;
    // the model input has a consequence but Model's current plan stores no dollar risk for it: Model shows no risk on that measure
    for (const n of none || []) { a[n.m === 'hse' ? 'hasHse' : 'hasEcon'] = false; a.cofSource[n.m] = { none: true, model: n.model }; }
    if (!rec) continue;
    for (const k of ['hse', 'econ']) {
      const c = rec[k]; if (!c?.series?.length) continue;
      const hit = c.series.find(([, pof, cof]) => cof > 0 && pof * cof >= S[k]), cof = (hit || c.series.at(-1))[2];
      a[k === 'hse' ? 'cofHse' : 'cofEcon'] = cof; a[k === 'hse' ? 'hasHse' : 'hasEcon'] = true;
      a.cofSource[k] = { sample: cof, model: c.model, missing: !(c.model > 0) || !c.hasModel, varies: c.max / c.min > 1.02, min: c.min, max: c.max };
      // Model's consequence over time (day index from the stored curve start), so dollar curves follow Model where it ramps
      if (c.series.length > 1) (a.cofSeries ||= {})[k] = c.series.map(([day, , v]) => [day, v]);
    }
  }
}
function checkContext(M) {
  const winByUnit = new Map();
  for (const w of M.windows) if (w.start) { if (!winByUnit.has(w.unitId)) winByUnit.set(w.unitId, []); winByUnit.get(w.unitId).push(w); }
  for (const ws of winByUnit.values()) ws.sort((a, b) => a.start.localeCompare(b.start));
  return { winByUnit };
}
// the TARs either side of a date: the last one that has ended before it and the first one starting after it
function tarGap(wins, date) {
  let prev = null, next = null;
  for (const w of wins) { if ((w.end || w.start) < date) prev = w; else if (w.start > date && !next) next = w; }
  const inside = wins.find(w => date >= w.start && date <= (w.end || w.start));
  return inside ? null : { prev, next };
}
function maxRiskToHorizon(r, S) {
  // unmitigated risk only rises: its largest value to the horizon is at the horizon (governing CML Weibull, else the fit, else today)
  const a = r.a, hz = Engine.daysBetween(a.start, S.horizon);
  const seg = r.worstCml ? { origin: Engine.daysBetween(a.start, r.worstCml.start.slice(0, 10)) + 1, beta: r.worstCml.beta, eta: r.worstCml.eta, gamma: r.worstCml.gamma } : a.fit ? { origin: 0, ...a.fit } : null;
  const pof = seg ? Math.max(Engine.F(seg, hz), a.today?.unmitPof || 0) : null;
  const rel = m => { const cof = m === 'hse' ? a.cofHse : a.cofEcon, has = m === 'hse' ? a.hasHse : a.hasEcon; if (!has || !(cof > 0)) return null; const today = a.today?.[m === 'hse' ? 'unmitHse' : 'unmitEcon'] || 0; return Math.max(today, pof == null ? 0 : pof * cof) / S[m]; };
  const vals = ['hse', 'econ'].map(rel).filter(v => v != null);
  return vals.length ? Math.max(...vals) : null;
}
function checkOne(r, M, S, ctx) {
  const out = [], add = (code, detail) => { const [severity, label] = CHECKS[code]; out.push({ code, severity, label, detail }); };
  if (r.a.scope !== 'fixed') return out;
  const bucket = r.bucket || bucketOf(r);
  const wins = (ctx.winByUnit.get(r.a.unitId) || []).filter(w => (w.end || w.start) >= M.today), last = wins.at(-1);
  const minLife = Math.max(S.margin, S.minLife ?? 180);
  const covers = n => M.cml[r.id]?.coverage?.[n]?.worst;
  // governing-CML mode needs a governing-CML task the task pool lets act on this assessment (e.g. not a Spot UT on CUI)
  const allowedHere = e => e.date < M.today || (e.types?.length ? e.types : [e.bundle]).some(x => Engine.poolAllows(S, Engine.poolGroup(r.a), x));
  // (not on Model's calculation rows: there every task re-fits exactly the CMLs it covers, the governing one or not)
  const govMode = !r.rowModel && !!r.worstCml && (r.a.events || []).some(e => (e.taskNumbers || []).some(covers) && allowedHere(e));
  const changes = r.proposed.filter(p => !p.kept);
  if (!r.gov?.measure) add('noRiskCurve', 'Model has no HSE or ECON consequence curve for this assessment.');
  else { const rel = maxRiskToHorizon(r, S); if (rel != null && rel < (S.negligiblePct ?? 1) / 100) add('negligibleRisk', `Unmitigated risk peaks at ${(rel * 100).toFixed(rel < .001 ? 3 : 2)} % of the limit by ${S.horizon} (threshold ${S.negligiblePct ?? 1} %).`); }
  for (const p of changes) {
    const name = p.definitions?.[0] || p.bundle;
    if (p.date < M.today) add('beforeToday', `${name} on ${p.date}.`);
    if (p.date > S.horizon) add('afterHorizon', `${name} on ${p.date}, horizon ${S.horizon}.`);
    if (last && p.date > (last.end || last.start) && !String(p.execution || '').startsWith('online')) add('afterLastTar', `${name} on ${p.date}; last TAR on file ${last.name} (${last.start}).`);
    if (p.execution === 'outage' && !wins.some(w => p.date >= w.start && p.date <= (w.end || w.start))) add('outageOutsideTar', `${name} on ${p.date} is not inside a recorded TAR.`);
    if (p.moved && p.movedFrom && p.date > p.movedFrom && p.breachBefore && p.date > p.breachBefore && p.movedFrom <= p.breachBefore) add('deferPastBreach', `${name} moved ${p.movedFrom} → ${p.date}, after the breach on ${p.breachBefore}.`);
    if (govMode && !(p.taskNumbers || []).concat(p.copyOf?.taskNumbers || []).some(covers)) add('noGovCml', `${name} on ${p.date} is not credited to governing CML ${r.worstCml?.clientId || ''}.`);
    if (r.a.category === 'Cracking/Metallurgical' && p.params && Math.abs(p.params.gamma || 0) > 2 && !p.params.capped) add('crackingGamma', `γ ${Math.round(p.params.gamma)} d on ${p.date}.`);
    if (p.life != null && p.life < minLife && p.date <= S.horizon) add('shortLife', `${name} on ${p.date}: ${p.life} d of life, minimum ${minLife} d.`);
    // a breach the plan only answers after it happens: accepted when the task is outage work in a TAR and the wait is within the
    // accepted exposure; never accepted when the task can be done online (it could simply be done before the breach)
    if (p.exposureDays > 0) {
      const from = p.breachBefore && p.breachBefore > M.today ? p.breachBefore : M.today, lim = S.acceptedExposure ?? 180;
      const w = wins.find(w => p.date >= w.start && p.date <= (w.end || w.start));
      const earliest = Engine.addDays(M.today, 30), avoidable = Engine.daysBetween(from > earliest ? from : earliest, p.date);
      if (String(p.execution || '').startsWith('online') && !w && avoidable > 30) add('onlineExposure', `Breach ${from} waits ${p.exposureDays} d for ${name} on ${p.date}, an online task that could be done ${avoidable} d earlier.`);
      else if (String(p.execution || '').startsWith('online') && !w) add('breachAccepted', `Breach ${from} waits ${p.exposureDays} d for ${name} on ${p.date}; within the 30 d allowed to mobilise online work.`);
      else if (p.exposureDays > lim) add('exposureBeyondAccepted', `Breach ${from} waits ${p.exposureDays} d for ${name} in ${w?.name || 'the next outage'} (${p.date}); accepted exposure ${lim} d.`);
      else add('breachAccepted', `Breach ${from} waits ${p.exposureDays} d for ${name} in ${w?.name || 'the next outage'} (${p.date}); within the accepted ${lim} d.`);
    }
    if (p.breachBefore && p.breachBefore > p.date && Engine.daysBetween(p.date, p.breachBefore) > (S.earlyDays ?? 820)) add('earlyTask', `${name} on ${p.date}, ${Engine.daysBetween(p.date, p.breachBefore)} d before the breach on ${p.breachBefore}.`);
    if (p.cost == null) add('unpriced', `${name} on ${p.date}.`);
  }
  // current plan: Model's own tasks against the breach
  let lateBehind = null;
  for (const e of r.current?.events || []) {
    if (e.slack == null || e.slack >= 0 || e.date > S.horizon) { lateBehind = null; continue; }
    const breachDay = Engine.daysBetween(r.a.start, e.date) + e.slack;
    if (lateBehind != null && Math.abs(breachDay - lateBehind) < 1) continue;  // the same breach: only its first task is judged
    lateBehind = breachDay;
    const lim = S.acceptedExposure ?? 180, name = e.definitions?.[0] || e.bundle;
    if (-e.slack > lim || e.execution === 'online') add('currentExposure', `${name} on ${e.date} comes ${-e.slack} d after the breach${e.execution === 'online' ? ' (online task)' : ''}; accepted exposure ${lim} d.`);
    else add('currentExposureAccepted', `${name} on ${e.date} comes ${-e.slack} d after the breach, within the accepted ${lim} d.`);
  }
  const cs = r.a.cofSource?.[r.gov?.measure];
  if (cs) add('cofFromModel', `${r.gov.measure.toUpperCase()} consequence $${cs.sample.toLocaleString()} from Model's risk curve at the threshold${cs.missing ? ' (the model has no consequence for this measure)' : cs.varies ? ` (Model's consequence runs $${cs.min.toLocaleString()}–$${cs.max.toLocaleString()} over time; model $${(cs.model || 0).toLocaleString()})` : ` (model $${(cs.model || 0).toLocaleString()})`}.`);
  let prev = null;
  for (const p of r.proposed) {
    if (r.expected?.rows) break;  // modelled on Model's calculation rows: a task only ever re-fits its rows (no display segment to compare)
    if (p.params && prev && !p.kept) { const d = Engine.daysBetween(r.a.start, p.date); const before = Engine.F(prev, d - 1), after = Engine.F(p.params, d); if (after > before + 1e-6) add('riseAtTask', `PoF ${(before * 100).toFixed(2)} % → ${(after * 100).toFixed(2)} % on ${p.date}.`); }
    if (p.params) prev = p.params;
  }
  const dates = r.proposed.map(p => p.date);
  if (dates.some((d, i) => i && d < dates[i - 1])) add('unordered', dates.join(', '));
  const keys = changes.map(p => p.date + '|' + ((p.taskNumbers || []).join('+') || p.bundle));
  if (new Set(keys).size < keys.length) add('duplicate', keys.filter((k, i) => keys.indexOf(k) !== i).join(', '));
  const curNums = new Set((r.current?.events || []).filter(e => e.date <= S.horizon).flatMap(e => e.taskNumbers || []));
  const propNums = new Set(r.proposed.filter(p => p.kept || p.moved).flatMap(p => p.taskNumbers || []));
  const dropped = [...curNums].filter(n => !propNums.has(n));
  if (changes.length && dropped.length) add('droppedTask', dropped.slice(0, 4).join(', ') + (dropped.length > 4 ? ` +${dropped.length - 4}` : ''));
  if (changes.length && bucket === 'No breach in horizon') add('changeWithoutBreach', `${changes.length} change(s).`);
  if (changes.length && bucket === 'Engineering scope') add('engineeringWithChange', `${changes.length} change(s) placed before the chain stopped.`);
  if (r.gov?.measure && (r.b0Date || r.proposed.some(p => p.breachAfter && p.breachAfter <= S.horizon))) {
    // the breach still open at the end of the proposed plan: after the last task (or the first breach when nothing is placed)
    // the last task that acts on the assessment (a kept task credited only to other CMLs changes nothing and says nothing)
    const withBreach = r.proposed.filter(p => p.breachAfter !== undefined && !p.noEffect && (p.breachAfter || p.params || !/no effect on the assessment/.test(p.evidence || ''))), lastTask = withBreach.at(-1);
    const open = lastTask ? lastTask.breachAfter : (r.alreadyBreached ? M.today : r.b0Date);
    if (open && open <= S.horizon && !r.proposed.some(p => p.date > open)) {
      const lastEnd = last ? (last.end || last.start) : null;
      if (lastEnd && open > lastEnd) add('breachAfterLastTar', `Breach ${open} is after ${last.name} (${last.start}), the last TAR on file.`);
      else if (!r.cannotClear && bucket !== 'Engineering scope') add('breachUnmitigated', `Breach ${open}${lastTask ? ` after ${lastTask.definitions?.[0] || lastTask.bundle} on ${lastTask.date}` : ''} has no task after it before ${S.horizon}.`);
    }
  }
  if (r.expected && changes.length && r.expected.failuresProp > r.expected.failuresCur + 1e-9) add('worseThanCurrent', `${r.expected.failuresCur.toFixed(3)} → ${r.expected.failuresProp.toFixed(3)} expected failures.`);
  return out;
}
const scoreOf = checks => checks.reduce((s, c) => s + (c.code === 'worseThanCurrent' ? 10 : WEIGHT[c.severity]), 0);  // the solver still works to remove plans that add expected failures
// days above the governing PoF limit from today to the horizon on the modelled plan (same method for every variant, weekly steps):
// the state today (Model's stored post-task fit, else the governing CML / fitted Weibull), then each proposed task's segment
function daysAboveModel(r, M, S) {
  if (r.daysAbove != null) return r.daysAbove;  // counted by the engine on Model's calculation rows (same weekly steps)
  const a = r.a, L = r.L; if (!(L > 0 && L < 1)) return 0;
  let seg = r.worstCml ? { origin: Engine.daysBetween(a.start, r.worstCml.start.slice(0, 10)) + 1, beta: r.worstCml.beta, eta: r.worstCml.eta, gamma: r.worstCml.gamma } : a.fit ? { origin: 0, ...a.fit } : null;
  const lastPast = (a.events || []).filter(e => e.date < M.today && (e.fitAfter || e.qMitAfter)).at(-1);
  if (lastPast?.fitAfter) seg = lastPast.fitAfter;
  if (!seg) return 0;
  const steps = r.proposed.filter(p => p.params).map(p => ({ d: Engine.daysBetween(a.start, p.date), seg: p.params })).sort((x, y) => x.d - y.d);
  const t0 = Engine.daysBetween(a.start, M.today), t1 = Engine.daysBetween(a.start, S.horizon);
  let n = 0, k = 0;
  for (let d = t0; d <= t1; d += 7) { while (k < steps.length && steps[k].d <= d) seg = steps[k++].seg; if (Engine.F(seg, d) >= L) n += 7; }
  return n;
}
// codes a different placement can change; data-only findings (no price, negligible risk, current-plan facts) are never "solved"
const SOLVABLE = new Set(['beforeToday', 'afterHorizon', 'afterLastTar', 'unordered', 'duplicate', 'deferPastBreach', 'droppedTask', 'crackingGamma', 'changeWithoutBreach', 'outageOutsideTar', 'breachBetweenTars', 'riseAtTask', 'shortLife', 'breachUnmitigated', 'exposureBeyondAccepted', 'onlineExposure', 'engineeringWithChange', 'worseThanCurrent', 'earlyTask']);
// A current-plan task is linked in Model to every assessment it credits, so shifting it moves it for all of them. When an assessment's
// plan shifts a task that another assessment still relies on at its date (another assessment Model links it to, drafts aside, or
// another plan shifting it to a different date), the task is pinned and the shifting plans are re-planned: they copy the task to the new
// date and keep the original, still linked. Repeated until no plan shifts an unpinned shared task.
function pinSharedTasks(results, M, S, B) {
  const drafts = new Set((M.drafts || []).map(a => a.id));
  const credits = M._creditsByKey ||= new Map(M.costTasks.map(t => [t.assetId + '|' + t.number, t.credit || []]));
  M._pinned ||= new Map();
  let replanned = 0;
  for (let pass = 0; pass < 6; pass++) {
    const shifts = new Map();
    for (const r of results) for (const p of r.proposed) if (p.moved) for (const n of p.taskNumbers || []) {
      const k = r.a.assetId + '|' + n; if (!shifts.has(k)) shifts.set(k, new Map());
      const byDate = shifts.get(k); if (!byDate.has(p.date)) byDate.set(p.date, new Set()); byDate.get(p.date).add(r.id);
    }
    const pins = new Set();
    for (const [k, byDate] of shifts) {
      const movers = new Set([...byDate.values()].flatMap(s => [...s]));
      const others = (credits.get(k) || []).filter(id => !movers.has(id) && !drafts.has(id)).length;
      if (others || byDate.size > 1) { M._pinned.set(k, others || movers.size - 1); pins.add(k); }
    }
    if (!pins.size) break;
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (!r.proposed.some(p => p.moved && (p.taskNumbers || []).some(n => pins.has(r.a.assetId + '|' + n)))) continue;
      const r2 = Engine.analyseOne(r.a, M, { ...S, ...(r._over || {}) }, B);
      supplementUnchanged(r2, M, S);
      Object.assign(r2, { visitPlan: r.visitPlan, governingMargin: r.governingMargin, _over: r._over, resolution: r.resolution, checksBefore: r.checksBefore, daysAboveModel: r.daysAboveModel });
      results[i] = r2; replanned++;
    }
  }
  return { pinned: M._pinned.size, replanned };
}

function solve(results, M, S, B, ctx) {
  const variants = [
    ['Plan 90 d earlier', { margin: S.margin + 90 }],
    ['Plan 180 d earlier', { margin: S.margin + 180 }],
    ['Plan 365 d earlier', { margin: S.margin + 365 }],
    ['Exact shift (no keep tolerance)', { keepTolerance: 0 }],
    ['Plan 180 d earlier, exact shift', { margin: S.margin + 180, keepTolerance: 0 }],
    ['Wider TAR pull-in (365 d)', { onlinePref: Math.max(365, S.onlinePref) }],
    ['Keep the current plan', { maxSteps: 0 }],
  ];
  let tried = 0, improved = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.a.scope !== 'fixed') continue;
    const base = checkOne(r, M, S, ctx), solvable = base.filter(c => SOLVABLE.has(c.code));
    r.checksBefore = base;
    if (!solvable.length) continue;
    tried++;
    let best = null, bestScore = scoreOf(solvable); const daysBase = daysAboveModel(r, M, S); r.daysAboveModel = daysBase;
    for (const [label, over] of variants) {
      const S2 = { ...S, ...over };
      const r2 = Engine.analyseOne(r.a, M, S2, B);
      supplementUnchanged(r2, M, S);
      const c2 = checkOne(r2, M, S, ctx), s2 = scoreOf(c2.filter(c => SOLVABLE.has(c.code)));
      // a variant never adds an error and must not raise expected failures above the original proposal
      if (c2.some(c => c.severity === 'error') && !solvable.some(c => c.severity === 'error')) continue;
      // never trade a plan for engineering scope or for no plan at all
      if ((r2.cannotClear && !r.cannotClear) || (bucketOf(r2) === 'Engineering scope' && bucketOf(r) !== 'Engineering scope')) continue;
      // nor an engineering-scope finding for "keep the current plan" while the breach stays open (keeping never tries to clear it)
      if (bucketOf(r) === 'Engineering scope' && over.maxSteps === 0 && daysAboveModel(r2, M, S) > 0) continue;
      if (r.expected && r2.expected && r2.expected.failuresProp > Math.max(r.expected.failuresProp, r.expected.failuresCur) + 1e-9) continue;
      // never trade checks for risk: the variant may not leave more days above the limit than the original proposal
      const days2 = daysAboveModel(r2, M, S); if (days2 > daysBase + 7) continue;
      if (s2 < bestScore) { best = { r2, label, c2, days2, over }; bestScore = s2; }
    }
    if (best) {
      const fixed = [...new Set(solvable.map(c => c.code))].filter(code => !best.c2.some(c => c.code === code));
      best.r2.resolution = { label: best.label, fixed: fixed.map(code => CHECKS[code][1]), fixedCodes: fixed, before: scoreOf(solvable), after: bestScore, daysAboveBefore: daysBase, daysAboveAfter: best.days2 }; best.r2.daysAboveModel = best.days2;
      best.r2.checksBefore = base; best.r2._over = best.over;
      Object.assign(best.r2, { visitPlan: r.visitPlan, governingMargin: r.governingMargin });
      results[i] = best.r2; improved++;
    }
  }
  return { tried, improved };
}
// ---- Model data review. The optimizer reflects Model exactly as it is, incomplete data included; these are the places where
// Model's own data does not add up, listed so they can be fixed in Model. They never change a result, bucket, hold or the solver.
const MODEL_DATA = {
  noConsequence: 'No HSE or ECON consequence',
  cofMissing: 'Consequence missing from the input; the risk curve has one',
  cofDiffers: "Risk curve implies a different consequence than the input",
  cofVaries: 'Consequence changes over time on the risk curve',
  noDollarRisk: 'Consequence in the input, but no stored risk',
  noCategory: 'No damage-mechanism category',
  noWeibull: 'Unmitigated curve too short to fit a Weibull',
  noCml: 'Thinning assessment without CML results',
  creditWithoutFit: 'Curve drops at a task with no stored post-task fit',
  creditWithoutTask: 'Curve drops on a date with no credited task',
  riseAtCredit: 'Curve rises at a credited task',
  mitBeforeFirstCredit: 'Mitigated and unmitigated curves differ before any task',
  unpricedTask: 'Current-plan task without a cost',
  utRtOnCui: 'Spot UT / RT credited to a CUI assessment',
};
function sampleDataOf(r, M) {
  const out = [], add = (code, detail) => out.push({ code, label: MODEL_DATA[code], detail });
  const a = r.a; if (a.scope !== 'fixed') return out;
  const f = M.sampleBreach?.a?.[a.id]?.facts || {}, money = v => '$' + Math.round(v).toLocaleString();
  if (!r.gov?.measure && !(f.noDollarRisk || []).length) add('noConsequence', `Neither HSE nor ECON has a consequence${a.today?.unmitPof ? `; unmitigated PoF today ${(a.today.unmitPof * 100).toFixed(2)} %` : ''}.`);
  for (const [k, c] of Object.entries(a.cofSource || {})) {
    const m = k.toUpperCase();
    if (c.none) add('noDollarRisk', `${m} consequence ${money(c.model)} in the input, but the stored current-plan ${m} risk is $0 throughout.`);
    else if (c.missing) add('cofMissing', `${m}: no consequence in the input; the risk curve implies ${money(c.min)}${c.varies ? `–${money(c.max)}` : ''}.`);
    else {
      if (c.varies) add('cofVaries', `${m}: risk ÷ PoF runs ${money(c.min)}–${money(c.max)} over time (input ${money(c.model)}).`);
      if (!c.varies || Math.abs(c.sample / c.model - 1) > .02) add('cofDiffers', `${m}: risk curve ${money(c.sample)} at the limit, input ${money(c.model)}.`);
    }
  }
  if (!a.category) add('noCategory', `${a.mechanism || 'The damage mechanism'} has no category, so no inspection type can be scheduled.`);
  if (!a.fit && !r.worstCml) add('noWeibull', 'Too few points between 0.01 % and 99.99 % PoF to fit the unmitigated curve.');
  if ((a.category === 'Thinning' || a.category === 'External Thinning') && !M.cml?.[a.id]?.worst) add('noCml', 'No governing CML Weibull stored for this assessment.');
  const list = xs => xs.slice(0, 4).join(', ') + (xs.length > 4 ? ` +${xs.length - 4}` : '');
  if (f.creditWithoutFit) add('creditWithoutFit', list(f.creditWithoutFit.map(x => `${x.bundle} ${x.date}`)));
  if (f.creditWithoutTask) add('creditWithoutTask', list(f.creditWithoutTask.map(x => x.date)));
  if (f.riseAtCredit) add('riseAtCredit', list(f.riseAtCredit.map(x => `${x.date}: PoF ${(x.before * 100).toFixed(2)} % → ${(x.after * 100).toFixed(2)} %`)));
  if (f.mitBeforeFirstCredit) add('mitBeforeFirstCredit', `${f.mitBeforeFirstCredit.samples} stored samples differ before the first credited task.`);
  const utRt = /\bCUI\b|corrosion under insulation/i.test(`${a.component} ${a.mechanism || ''}`) ? a.events.filter(e => e.date >= M.today && (e.types?.length ? e.types : [e.bundle]).some(x => x === 'UT / thickness' || x === 'RT profile')) : [];
  if (utRt.length) add('utRtOnCui', `${utRt.length} future task${utRt.length === 1 ? '' : 's'}: ` + list(utRt.map(e => `${e.definitions?.[0] || e.bundle} ${e.date}`)) + (r.poolBlocked?.length ? ' · the optimizer gives them no credit' : ''));
  const unpriced = (r.currentCostTasks || []).filter(t => t.cost == null).map(t => `${t.number} ${t.date}`);
  if (unpriced.length) add('unpricedTask', list(unpriced));
  return out;
}
function sampleDataSummaryOf(results) {
  return Object.fromEntries(Object.entries(MODEL_DATA).map(([code, label]) => [code, { code, label, assessments: results.filter(r => (r.sampleData || []).some(c => c.code === code)).length }]));
}
function checkSummaryOf(results) {
  const summary = {};
  for (const [code, [severity, label]] of Object.entries(CHECKS)) {
    // solved = flagged before the solver and gone now; found = solved + still flagged (so found ≥ left always holds)
    const has = list => (list || []).some(c => c.code === code);
    const remaining = results.filter(r => has(r.checks)).length;
    const resolved = results.filter(r => has(r.checksBefore) && !has(r.checks)).length;
    summary[code] = { code, severity, label, assessments: remaining, before: remaining + resolved, resolved, solvable: SOLVABLE.has(code) };
  }
  return summary;
}

self.onmessage = async ({ data }) => {
  try {
    // one scenario's data at a time; switching scenario reloads it
    const sid = String(data.scenario || '1002').replace(/\D/g, '');
    const version = String(data.dataVersion || '');
    if (!model || model._sid !== sid || model._v !== version) {
      self.postMessage({ type: 'progress', message: 'Loading Model source data · scenario ' + sid });
      const f = name => '/examples/inspection/models/' + name.replace('{sid}', sid) + (version ? '?v=' + encodeURIComponent(version) : '');
      const [m, cost, cml, cof, fineQ, sampleBreach, rows] = await Promise.all([json(f('{sid}.json.gz')), json(f('costs-{sid}.json.gz')), json(f('cml-{sid}.json.gz')).catch(() => ({ assessments: {} })), json(f('cof-{sid}.json')).catch(() => ({})), json(f('fineq-{sid}.json.gz')).catch(() => null), json(f('breach-{sid}.json.gz')).catch(() => null), json(f('rows-{sid}.json.gz')).catch(() => null)]);
      // Model draft assessments (dbo.Assessment.Status 1) are not part of the plan: they are listed, never optimized
      const isDraft = a => a.status === 1;
      const drafts = m.assessments.filter(isDraft);
      model = { ...m, assessments: m.assessments.filter(a => !isDraft(a)), drafts, costTasks: cost, cml: cml.assessments, cofRanges: cof, fineQ, sampleBreach, rows: rows?.rows || null, _sid: sid, _v: version };
    }
    const S = { ...Engine.DEFAULT_SETTINGS, ...data.settings };
    if (!(S.hse > 0 && S.econ > 0 && S.margin >= 0 && S.onlinePref >= 0 && S.keepTolerance >= 0 && S.inspectionThreshold >= .5 && S.inspectionThreshold <= .99 && S.horizon > model.today))
      throw Error('Enter positive risk limits, nonnegative day values, an inspection pin from 0.5 to 0.99, and a horizon after the snapshot date.');
    model.userLinks = data.userLinks || {};
    applyModelCof(model, S);
    self.postMessage({ type: 'progress', message: 'Calculating task timing and acceptance gates' });
    const B = { ...Engine.DEFAULT_BUNDLES, ...(data.bundles || {}) };
    model._pinned = new Map();
    const run = Engine.run(model, S, B);
    const results = run.results.filter(r => S.scope === 'all' || r.a.scope === 'fixed');
    for (const r of results) supplementUnchanged(r, model, S);
    const ctx = checkContext(model);
    const shared = pinSharedTasks(results, model, S, B);
    self.postMessage({ type: 'progress', message: 'Check engine: solving flagged plans' });
    const solved = S.solve === false ? { tried: 0, improved: 0 } : solve(results, model, S, B, ctx);
    const shared2 = pinSharedTasks(results, model, S, B);
    solved.sharedTasks = { pinned: shared2.pinned, replanned: shared.replanned + shared2.replanned };
    const v2 = gates(results, model, S);

    // one task number proposed on different dates by different assessments cannot be exported as one date change
    const movedDates = new Map();
    for (const r of results) for (const p of r.proposed.filter(p => p.moved)) for (const n of p.taskNumbers || []) {
      if (!movedDates.has(n)) movedDates.set(n, new Set()); movedDates.get(n).add(p.date);
    }
    const conflicts = new Map([...movedDates].filter(([, dates]) => dates.size > 1));

    for (const r of results) {
      r.costBenefit = costs(r);
      r.bucket = bucketOf(r);
      // the engine's feasibility text 'engineering scope' means "mechanism with no preferred task type", not the Engineering scope bucket
      r.feasibilityLabel = FEASIBILITY[r.feasibility] || r.feasibility;
      for (const p of r.proposed) if (p.evidence) p.evidence = p.evidence.replace(' · engineering scope', ' · mechanism has no preferred task type');
      r.reason = reasonOf(r, S);
      r.holds = [];
      // Portfolio no-harm is a flag, not a gate (user decision 2026-09-14): expected failures count the cumulative PoF reached before
      // every task that lowers the curve, so adding tasks to an assessment already near 100 % raises the count. Listed, never held.
      const rejectedGroups = r.proposed.map(p => v2.rejected.get(p.groupKey)).filter(Boolean);
      let portfolioFlag = null;
      if (rejectedGroups.length) {
        const g = rejectedGroups[0], worst = g.drivers.filter(d => !(d.deltaFailures != null && d.deltaFailures <= 1e-9));
        portfolioFlag = { code: 'portfolio', label: NOTE.portfolio, detail: 'Expected failures (Model cost-of-risk count) are higher under the proposed plan for ' + worst.length + ' of ' + g.drivers.length + ' assessment' + (g.drivers.length === 1 ? '' : 's') + ' sharing ' + g.bundle + ' on ' + g.date + (r.expected ? ' (this assessment ' + r.expected.failuresCur.toFixed(3) + ' → ' + r.expected.failuresProp.toFixed(3) + ', ' + (r.expected.failuresProp - r.expected.failuresCur >= 0 ? '+' : '') + (r.expected.failuresProp - r.expected.failuresCur).toFixed(3) + ')' : '') + '. Each added task counts the probability reached before it, so this rises when tasks are added to an assessment already at high PoF; review, not a block.' };
      }
      const clash = r.proposed.flatMap(p => (p.moved ? p.taskNumbers || [] : []).filter(n => conflicts.has(n)));
      if (clash.length) r.holds.push({ code: 'conflict', label: HOLD.conflict, detail: clash[0] + ' is proposed on ' + [...conflicts.get(clash[0])].sort().join(' and ') + ' by different assessments.' });
      r.notes2 = [];
      if (portfolioFlag) r.notes2.push(portfolioFlag);
      if (r.beyondCalendar) r.notes2.push({ code: 'calendar', label: NOTE.calendar, detail: (r.notes || []).find(n => n.startsWith('beyond the last turnaround')) || 'Nothing is scheduled after the last turnaround on file.' });
      if (r.replacementReview && r.bucket !== 'Engineering scope') r.notes2.push({ code: 'replacement', label: NOTE.replacement, detail: 'Two or more rapid recurrences after past interventions.' });
      // V1 calls these "Keep" (no proposal), but the breach is inside the horizon and nothing clears it: the V2 workbook rejects them
      const uncleared = r.bucket === 'Keep as planned' && r.b0Date && r.b0Date <= S.horizon && !r.proposed.length;
      if (uncleared) r.notes2.push({ code: 'uncleared', label: NOTE.uncleared, detail: 'Breaches ' + r.b0Date + ' and no task in the plan is placed before it' + (r.beyondCalendar ? ' (after the last TAR on file)' : '') + '.' });
      r.exportHold = r.holds.length > 0;  // check-engine errors are added after runChecks below
      const changed = r.proposed.some(p => !p.kept);
      r.decision = changed ? (r.exportHold ? 'Rejected' : 'Accepted')
        : r.bucket === 'Engineering scope' ? 'Engineering review'
        : r.bucket === 'No task/no default' ? 'Review · no candidate'
        : uncleared ? 'Not cleared' : r.bucket === 'Interval-driven' ? 'Not optimized' : 'No change';
    }
    // a task shifted for one assessment while another assessment keeps relying on it at its current date
    const keptBy = new Map();
    for (const r of results) for (const p of r.proposed) if (p.kept) for (const n of p.taskNumbers || []) { if (!keptBy.has(n)) keptBy.set(n, []); keptBy.get(n).push(r); }
    for (const r of results) {
      r.checks = checkOne(r, model, S, ctx);
      // another assessment keeps relying on a task this one shifts: harmful only if, with the task on its new date, that assessment's
      // breach now comes before its next task (pull-in: its breach after the task moves earlier by the shift; defer: the task lands
      // after the breach it was answering)
      const harmed = [];
      for (const p of r.proposed.filter(p => p.moved && p.movedFrom)) for (const n of p.taskNumbers || []) for (const o of keptBy.get(n) || []) {
        if (o.id === r.id) continue;
        const k = o.proposed.find(x => x.kept && (x.taskNumbers || []).includes(n)); if (!k) continue;
        const shift = Engine.daysBetween(p.date, p.movedFrom), next = o.proposed.find(x => x.date > k.date)?.date || S.horizon;
        if (shift > 0 && k.breachAfter && k.breachAfter >= next && Engine.addDays(k.breachAfter, -shift) < next) harmed.push([n, p, o, `its breach moves to ${Engine.addDays(k.breachAfter, -shift)}, before ${next === S.horizon ? 'the horizon' : 'its next task on ' + next}`]);
        if (shift < 0 && k.breachBefore && p.date > k.breachBefore) harmed.push([n, p, o, `the task now comes after its breach on ${k.breachBefore}`]);
      }
      if (harmed.length) { const [n, p, o, why] = harmed[0]; r.checks.push({ code: 'sharedTaskMoved', severity: 'warn', label: CHECKS.sharedTaskMoved[1], detail: `${n} moves ${p.movedFrom} → ${p.date}; ${o.a.component.split(' | ').slice(1).join(' · ') || o.a.component} also relies on it: ${why}${harmed.length > 1 ? ` (+${harmed.length - 1} more)` : ''}.` }); }
    }
    const checkSummary = checkSummaryOf(results);
    for (const r of results) r.sampleData = sampleDataOf(r, model);
    const sampleDataSummary = sampleDataSummaryOf(results);
    for (const r of results) {
      const errors = (r.checks || []).filter(c => c.severity === 'error' && r.proposed.some(p => !p.kept));
      if (errors.length) { r.holds.push({ code: 'check', label: 'Check engine error', detail: errors.map(c => c.label + ': ' + c.detail).join(' ') }); r.exportHold = true; if (r.decision === 'Accepted') r.decision = 'Rejected'; }
    }
    const bucketCounts = {};
    for (const r of results) bucketCounts[r.bucket] = (bucketCounts[r.bucket] || 0) + 1;
    for (const g of v2.portfolio) g.reason = g.accepted ? 'All linked drivers non-adverse' : 'One or more linked drivers raise expected failures';
    delete v2.rejected;
    self.postMessage({ type: 'result', requestId: data.requestId, settings: S, results, bucketCounts, gates: v2, assets: model.assets, windows: model.windows, today: model.today, snapshotAt: model.snapshotAt, levels: model.levels, scenarioName: model.scenarioName,
      checkSummary, solved, sampleDataSummary,
      drafts: { statusKnown: model.assessments.some(a => a.status != null) || model.drafts.length > 0, count: model.drafts.filter(a => S.scope === 'all' || a.scope === 'fixed').length, total: model.drafts.length, ids: model.drafts.map(a => a.id),
        list: model.drafts.filter(a => S.scope === 'all' || a.scope === 'fixed').map(a => ({ id: a.id, component: a.component, asset: model.assets.find(x => x.id === a.assetId)?.name || '', category: a.category || '', url: a.url || null })) },
      options: {
        bundles: model.bundles, effective: B,
        transforms: Object.fromEntries(Object.entries(run.transforms?.pool || {}).filter(([k]) => k.endsWith('|*')).map(([k, v]) => [k.slice(0, -2), { rb: v.rb, re: v.re, gs: v.gs, n: v.n }])),
        eventCounts: model.assessments.flatMap(a => a.events).reduce((m, e) => { m[e.bundle] = (m[e.bundle] || 0) + 1; return m; }, {}),
        definitions: [...new Map(model.costTasks.filter(t => t.definition).map(t => [t.definition, t.bundle])).entries()].sort((a, b) => a[0].localeCompare(b[0])),
        categories: [...new Set(model.assessments.map(a => a.category).filter(Boolean))].sort().map(c => ({ category: c, eligible: Engine.eligibleBundles({ category: c }) })),
        defaults: Engine.DEFAULT_SETTINGS,
      },
      coverage: Object.fromEntries(results.map(r => [r.id, Object.fromEntries(Object.entries(model.cml[r.id]?.coverage || {}).map(([k, v]) => [k, [v.worst ? 1 : 0, (v.cmls || []).length]]))])) });
  } catch (e) {
    self.postMessage({ type: 'error', requestId: data.requestId, message: e.message || String(e) });
  }
};
