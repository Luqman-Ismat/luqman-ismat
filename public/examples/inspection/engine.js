/* Task-timing engine: everything is derived from the unmitigated curve.
 *   - breach dates: the stored unmitigated curve (quantile table) for the governing POF-equivalent limit;
 *   - task effects: Model's WeibullInspectionTask.fit (pin the 90 % quantile, raise beta) for inspections,
 *     a restart of the base Weibull for renewals (repair / replace), nothing for tasks with no credit;
 *   - the renewal chain t_k = last TAR <= b_{k-1} - margin (outage) / online rule, b_k from the new parameters.
 * Pure functions; no DOM. */
'use strict';
const Engine = (() => {
  const DAY = 86400000;
  const ms = iso => Date.parse(iso.slice(0, 10) + 'T00:00:00Z');
  const iso = t => new Date(t).toISOString().slice(0, 10);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const addDays = (isoDate, d) => iso(ms(isoDate) + d * DAY);
  const daysBetween = (a, b) => Math.round((ms(b) - ms(a)) / DAY);

  // effect defaults follow what Model's own mitigated curves show at the assessment level (Diagnostics → measured transforms):
  // conditional repair / replace / pigging restart the base Weibull (renewal); inspections translate or re-shape it (measured)
  const DEFAULT_BUNDLES = {
    'Replace': { execution: 'outage', effect: 'renewal' },
    'Overhaul': { execution: 'outage', effect: 'renewal' },
    'Inspect + conditional repair': { execution: 'outage', effect: 'renewal' },
    'API internal': { execution: 'outage', effect: 'measured' },
    'Planned TAR task': { execution: 'outage', effect: 'measured' },
    'Clean & inspect': { execution: 'outage', effect: 'measured' },
    'Pressure test': { execution: 'outage', effect: 'measured' },
    'Pigging': { execution: 'outage', effect: 'renewal' },
    'RT profile': { execution: 'online', effect: 'inspection' },
    'UT / thickness': { execution: 'online', effect: 'inspection' },
    'API external': { execution: 'online', effect: 'measured' },
    'Online inspection': { execution: 'online', effect: 'none' },
    'Other': { execution: 'online', effect: 'none' },
    'Unlisted repair date': { execution: 'outage', effect: 'renewal' },
  };
  const DEFAULT_SETTINGS = {
    hse: 700000, econ: 1000000, margin: 30, onlinePref: 180, horizon: '2045-12-01', inspectionThreshold: 0.9, maxBeta: 50,
    renewalBundle: 'Inspect + conditional repair', defaultByCategory: { 'Thinning': 'UT / thickness', 'External Thinning': 'API external', 'Cracking/Metallurgical': 'API internal', 'Creep': 'API internal', 'Overheating': 'API internal' },
    defaultBundle: 'API internal', maxSteps: 12, keepTolerance: 45, minLife: 180,
    // Task pool rules: the task types that can affect an assessment of each mechanism group. A future task of any other type stays in
    // the plan but gives no credit, and is never shifted or copied. Groups without a rule allow every type except poolDefaultDeny.
    // Replace and Clean & inspect credit every group; Planned TAR tasks credit nothing.
    poolRules: {
      'Thinning': ['Replace', 'Clean & inspect', 'API internal', 'RT profile', 'UT / thickness'],
      'CUI': ['Replace', 'Clean & inspect', 'API external'],
      // Inspect + conditional repair is the placeholder for Model's upgraded Weibull (gamma) after a cracking inspection
      'Cracking/Metallurgical': ['Replace', 'Inspect + conditional repair', 'API internal', 'Clean & inspect'],
    },
    poolDefaultDeny: ['Inspect + conditional repair', 'Planned TAR task'],
  };

  // ---- Weibull segment: F(day) = 1 - exp(-(((day + 1 - origin) - gamma) / eta) ^ beta), day = index from the curve start.
  //      origin = 0 for the fitted unmitigated curve; origin = task day for a renewal restart.
  function F(seg, day) { const t = day + 1 - seg.origin - seg.gamma; return t <= 0 ? 0 : 1 - Math.exp(-Math.pow(t / seg.eta, seg.beta)); }
  function crossing(seg, L) { if (!(L > 0 && L < 1)) return null; return seg.origin - 1 + seg.gamma + seg.eta * Math.pow(-Math.log(1 - L), 1 / seg.beta); }
  function quantileDay(seg, p) { return seg.origin - 1 + seg.gamma + seg.eta * Math.pow(-Math.log(1 - p), 1 / seg.beta); }
  // Model WeibullInspectionTask.fit (weibull_inspection.py), applied to the assessment-level fit
  function inspect(seg, applDay, pth = 0.9, maxBeta = 50) {
    const { beta, eta, gamma } = seg, app = applDay + 1 - seg.origin;
    const kLo = -Math.log(pth), kHi = -Math.log(1 - pth);
    const earliest = eta * Math.pow(kLo, 1 / beta) + gamma, median = eta * Math.pow(-Math.log(0.5), 1 / beta) + gamma, latest = eta * Math.pow(kHi, 1 / beta) + gamma;
    if (app >= latest - 10) return { ...seg, unchanged: true, reason: 'application within 10 d of the latest-failure quantile: inspection has no effect' };
    let eStar = earliest + Math.max(3 * (median - earliest) / 4, app - earliest); eStar = Math.min(latest - 10, eStar);
    let bStar = Math.log(kHi / kLo) / Math.log((latest - gamma) / (eStar - gamma)); bStar = clamp(bStar, beta, maxBeta);
    let etaStar = (latest - gamma) / Math.pow(kHi, 1 / bStar); if (etaStar < 1) etaStar = 1;
    return { origin: seg.origin, beta: bStar, eta: etaStar, gamma, detail: { earliest, median, latest, earliestStar: eStar, app } };
  }
  function renewal(base, day) { return { origin: day + 1, beta: base.beta, eta: base.eta, gamma: base.gamma }; }
  // a task never raises PoF on the day it is done: if the effect's curve sits above the current level at day d, slide it (gamma) so it
  // continues from the current level; if it already sits below, keep it (that is the credit)
  function continuity(seg2, seg, day) {
    if (!seg2 || !seg) return seg2;
    const v0 = F(seg, day), v1 = F(seg2, day);
    if (v1 <= v0 + 1e-9) return seg2;
    const tNew = v0 > 0 ? seg2.eta * Math.pow(-Math.log(1 - v0), 1 / seg2.beta) : 0;
    return { ...seg2, gamma: day + 1 - seg2.origin - tNew, continued: true };
  }
  // Model-measured transform: ratios of beta and eta and the fraction of the distance (task day - gamma) by which gamma moves,
  // back-fitted from Model's own mitigated segment after a credited event of the same type (see measureTransforms)
  // the transform was measured against the unmitigated (base) Weibull, so it is always applied to the base, never compounded on a
  // previous task's parameters: beta_k = r_b * beta0, eta_k = r_e * eta0, gamma_k = gamma0 + s * (task day - gamma0)
  // The current segment's origin (the last renewal, or the curve start) is the installation date; the base shape is transformed from there.
  function measured(base, seg, day, tr) {
    const origin = seg.origin, gAbs = origin - 1 + base.gamma, dist = day - gAbs;
    const gNew = gAbs + (dist > 0 ? tr.gs * dist : 0);
    return { origin, beta: base.beta * tr.rb, eta: base.eta * tr.re, gamma: gNew - origin + 1, measured: tr.source };
  }
  // cracking has no incubation once the curve is reused: a restart for a cracking assessment starts with gamma = 0
  const NO_GAMMA = new Set(['Cracking/Metallurgical']);
  function applyEffect(base, seg, effect, day, S, tr, category) {
    if (effect === 'renewal') { const r = renewal(base, day); if (NO_GAMMA.has(category)) r.gamma = 0; return r; }
    if (effect === 'inspection') return inspect(seg, day, S.inspectionThreshold, S.maxBeta);
    if (effect === 'measured') { if (tr) return measured(base, seg, day, tr); return inspect(seg, day, S.inspectionThreshold, S.maxBeta); }
    return { ...seg, unchanged: true, reason: 'task type carries no credit' };
  }
  // transforms observed in Model's stored mitigated curves: per assessment+bundle (own), then per bundle+category, then per bundle
  function measureTransforms(M) {
    const own = {}, pool = {};
    for (const a of M.assessments) {
      if (!a.fit) continue;
      for (const e of a.events) {
        // A combined event cannot identify any one task's individual effect.
        if (!e.types || e.types.length !== 1 || e.types[0] !== e.bundle) continue;
        const f = e.fitAfter; if (!f || !f.beta) continue;
        const gAbs = a.fit.gamma - 1, dist = e.day - gAbs; if (dist < 30) continue;
        const tr = { rb: f.beta / a.fit.beta, re: f.eta / a.fit.eta, gs: (f.origin - 1 + f.gamma - gAbs) / dist, r2: f.r2 };
        if (!(tr.rb > 0 && tr.re > 0 && isFinite(tr.gs))) continue;
        (own[a.id + '|' + e.bundle] ||= []).push(tr);
        (pool[e.bundle + '|' + (a.category || 'n/a')] ||= []).push(tr); (pool[e.bundle + '|*'] ||= []).push(tr);
      }
    }
    const med = xs => { const s = [...xs].sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
    const summarise = (xs, source) => ({ rb: med(xs.map(t => t.rb)), re: med(xs.map(t => t.re)), gs: med(xs.map(t => t.gs)), n: xs.length, source });
    const out = { own: {}, pool: {} };
    for (const k in own) out.own[k] = summarise(own[k], 'this assessment');
    for (const k in pool) out.pool[k] = summarise(pool[k], k.endsWith('|*') ? 'all ' + k.split('|')[0] + ' events' : k.split('|')[0] + ' on ' + k.split('|')[1]);
    return out;
  }
  // own event of the same type first (Model's own answer for this assessment), then the category pool, then all events of the type
  // pooled estimates need a few events behind them (a 2-event pool is not a model); below that the inspection script is used
  const MIN_POOL = 5;
  function transformFor(T, a, bundle) { if (!T) return null; const ok = t => t && t.n >= MIN_POOL ? t : null; return T.own[a.id + '|' + bundle] || ok(T.pool[bundle + '|' + (a.category || 'n/a')]) || ok(T.pool[bundle + '|*']) || null; }
  function evidenceOf(T, a, bundle, effect) {
    if (effect === 'renewal') return 'renewal (restart of the base Weibull)';
    if (effect === 'inspection') return 'Model inspection script';
    if (effect !== 'measured') return 'no credit';
    if (T?.own[a.id + '|' + bundle]) return 'own Model event';
    const pc = T?.pool[bundle + '|' + (a.category || 'n/a')], pa = T?.pool[bundle + '|*'];
    if (pc && pc.n >= MIN_POOL) return `${a.category || 'n/a'} estimate (${pc.n} events)`;
    if (pa && pa.n >= MIN_POOL) return `type estimate (${pa.n} events)`;
    return 'Model inspection script';
  }

  // ---- stored-curve crossing for an arbitrary limit (interpolated in log-level between the quantile ladder)
  function storedCrossing(levels, q, L) {
    if (!q || !q.length) return null;
    let i = levels.findIndex(l => l >= L - 1e-12);
    if (i < 0) return null;
    if (q[i] == null) return null;
    if (i === 0 || q[i - 1] == null || Math.abs(levels[i] - L) < 1e-12) return q[i];
    const f = (Math.log(L) - Math.log(levels[i - 1])) / (Math.log(levels[i]) - Math.log(levels[i - 1]));
    return q[i - 1] + (q[i] - q[i - 1]) * f;
  }

  // ---- breach day to the day: the ladder only pins Model's curve at 22 PoF levels, so between two levels its log interpolation can
  // be weeks off. When the Weibull behind that stored curve is known (the governing CML's, or Model's stored post-task fit), its exact
  // crossing is used - but only when it falls inside the bracket of the two ladder levels Model itself stored, so it can never
  // contradict the stored curve. Otherwise the ladder value stands.
  function refinedCrossing(levels, q, L, seg) {
    const ladder = storedCrossing(levels, q, L);
    if (ladder == null || !seg || !(seg.beta > 0 && seg.eta > 0)) return ladder;
    const i = levels.findIndex(l => l >= L - 1e-12);
    const lower = i > 0 && q[i - 1] != null ? q[i - 1] : -Infinity, upper = q[i];
    const c = crossing(seg, L);
    return c != null && Number.isFinite(c) && c >= lower - 1 && c <= upper + 1 ? c : ladder;
  }

  // ---- Model row model (models/rows-<sid>.json.gz, verified day for day on every fixed-equipment assessment of 1003).
  // Model's assessment PoF is the series system of its calculation rows (one per CML, or one per failure mode for cracking / creep):
  // PoF = 1 - prod(1 - F_row). A row starts on its base Weibull (days since its installation); after each of its tasks it switches to that
  // task's Weibull counted from the end of the task's downtime, with PoF 0 during the downtime. A plan decides WHEN each task happens:
  // `apps` = [{ from, to, day, upgrade? }] applies the row tasks Model dated in [from, to] (one plan event) at `day` (their day offset
  // within the event kept); row tasks outside every controlled event range (the past, credits without a plan event) stay where Model
  // has them. A moved task keeps its own re-fit; a conditional-reliability segment keeps its absolute curve (it continues the curve before
  // it); `upgrade` adds Model's upgraded Weibull (Repair Cracks If Found) to every row the day after, when the event has none of its own.
  function rowModelOf(rows, controlled) {
    if (!rows?.length) return null;
    const inCtl = d => controlled.some(([f, t]) => d >= f && d <= t);
    const R = rows.map(r => {
      const tasks = r.tasks.map(([day, type, beta, eta, gamma, dt]) => ({ day, type, beta, eta, gamma, dt: Math.ceil((dt || 0) - 1e-9) }));
      return { install: r.install, base: r.base, tasks, fixed: tasks.filter(x => !inCtl(x.day)).map(x => ({ at: x.day, x })) };
    });
    return { rows: R, controlled };
  }
  const wbF = (t, beta, eta, gamma) => { const x = t - gamma; return x > 0 ? 1 - Math.exp(-Math.pow(x / eta, beta)) : 0; };
  // per row: the segments of a plan, in time order (a later task on the same day wins, as in Model's task order)
  function rowSegments(rm, apps) {
    return rm.rows.map(r => {
      const segs = r.fixed.slice();
      for (const ap of apps) {
        let own = false;
        // an application brings the row tasks Model dated in its range to its day (a copy of a past task duplicates it)
        for (const x of r.tasks) if (x.day >= ap.from && x.day <= ap.to) { segs.push({ at: ap.day + (x.day - ap.from), x }); if (x.type === 'upgrade') own = true; }
        if (ap.upgrade && !own) segs.push({ at: ap.day + ap.upgrade.offset, x: { type: 'upgrade', beta: ap.upgrade.beta, eta: ap.upgrade.eta, gamma: ap.upgrade.gamma, dt: 0, day: ap.day + ap.upgrade.offset } });
      }
      segs.sort((p, q) => p.at - q.at);
      return { r, segs };
    });
  }
  function rowPof(rs, t) {
    let surv = 1;
    for (const { r, segs } of rs) {
      let s = null; for (let i = segs.length - 1; i >= 0; i--) if (segs[i].at <= t) { s = segs[i]; break; }
      let f;
      if (!s) f = wbF(t - r.install, r.base[0], r.base[1], r.base[2]);
      else if (t < s.at + s.x.dt) f = 0;
      else f = wbF(t - (s.at + s.x.dt), s.x.beta, s.x.eta, s.x.type === 'conditional_reliability' ? s.x.gamma - (s.at - s.x.day) : s.x.gamma);
      surv *= 1 - f;
    }
    return 1 - surv;
  }
  // first breach from day `from`: the first day PoF >= limit(day) (limit = the lowest threshold / consequence of the measures), returned as
  // Model's continuous crossing (floored = the last day below); `from` itself when already above; null when never before `until`
  function rowBreach(rs, from, limitAt, limitBreaks, until) {
    if (until <= Math.floor(from)) { const L = limitAt(from); return L > 0 && rowPof(rs, Math.floor(from)) >= L ? from : null; }
    const bps = new Set([Math.floor(from), until]);
    for (const { segs } of rs) for (const s of segs) if (s.at > from && s.at < until) { bps.add(s.at); if (s.x.dt) bps.add(s.at + s.x.dt); }
    for (const b of limitBreaks) if (b > from && b < until) bps.add(b);
    const pts = [...bps].sort((x, y) => x - y);
    for (let k = 0; k + 1 < pts.length; k++) {
      const lo = pts[k], hi = pts[k + 1] - 1, L = limitAt(lo);   // PoF is non-decreasing and the limit constant inside a piece
      if (!(L > 0) || hi < lo) continue;
      if (rowPof(rs, hi) < L) continue;
      if (rowPof(rs, lo) >= L) { if (lo === Math.floor(from)) return from; const p = rowPof(rs, lo - 1); return p < L ? lo - 1 + (L - p) / Math.max(1e-300, rowPof(rs, lo) - p) : lo; }
      let a = lo, b = hi;                                          // P(a) < L <= P(b)
      while (b - a > 1) { const m = (a + b) >> 1; if (rowPof(rs, m) >= L) b = m; else a = m; }
      const pa = rowPof(rs, a), pb = rowPof(rs, b);
      return a + Math.min(1 - 1e-9, (L - pa) / Math.max(1e-300, pb - pa));
    }
    return null;
  }

  // ---- governing limit in POF terms
  // governing limit = the earlier of the HSE and ECON risk thresholds, expressed as a PoF level (risk = PoF x CoF).
  // The PoF critical level is NOT a breach criterion; it is only shown for reference.
  function governing(a, S) {
    const c = [];
    if (a.hasHse && a.cofHse > 0) c.push({ m: 'hse', L: S.hse / a.cofHse });
    if (a.hasEcon && a.cofEcon > 0) c.push({ m: 'econ', L: S.econ / a.cofEcon });
    c.sort((x, y) => x.L - y.L);
    if (!c.length) return { measure: null, L: null, all: c, note: 'no HSE or ECON risk curve for this assessment' };
    return { measure: c[0].m, L: c[0].L, all: c };
  }
  // task type the chain schedules for an assessment: the type Model already credits on it (future first, else latest),
  // otherwise the category default; engineering categories (creep, overheating, unclassified) fall back to the renewal bundle
  function planBundle(a, S, today) {
    const eng = S.engineeringByCategory?.[a.category]?.bundle; if (eng) return eng;
    const fut = a.events.find(e => e.date >= today && e.bundle !== 'Unlisted repair date'); if (fut) return fut.bundle;
    const last = [...a.events].reverse().find(e => e.bundle !== 'Unlisted repair date'); if (last) return last.bundle;
    const allowed = eligibleBundles(a), configured = S.defaultByCategory[a.category];
    if (configured && (!allowed.length || allowed.includes(configured))) return configured;
    return allowed[0] || S.renewalBundle;
  }
  function eligibleBundles(a) {
    if (a.category === 'Thinning') return ['UT / thickness', 'RT profile'];
    if (a.category === 'External Thinning') return ['API external'];
    if (a.category === 'Cracking/Metallurgical' || a.category === 'Creep') return ['API internal'];
    return [];  // overheating, unclassified: engineering scope
  }
  const isEngineering = a => !eligibleBundles(a).length;
  function windowAt(windows, isoDate, tol = 45) {
    if (!isoDate) return null; const d = ms(isoDate);
    return windows.find(w => ms(w.start) - tol * DAY <= d && d <= ms(w.end || w.start) + tol * DAY) || null;
  }

  // ---- one assessment
  // task pool group of an assessment: CUI (its mechanism decides what can mitigate it), else its damage-mechanism category
  const poolGroup = a => /\bCUI\b|corrosion under insulation/i.test(`${a.component || ''} ${a.mechanism || ''}`) ? 'CUI' : a.category || 'No category';
  // may a task type affect an assessment of this group? ('Unlisted repair date' is Model's own credit without a task: always kept)
  function poolAllows(S, group, bundle) {
    if (bundle === 'Unlisted repair date') return true;
    const rules = S.poolRules || DEFAULT_SETTINGS.poolRules, rule = rules[group];
    return rule ? rule.includes(bundle) : !(S.poolDefaultDeny || DEFAULT_SETTINGS.poolDefaultDeny).includes(bundle);
  }
  function analyse(a, M, S, windowsByUnit, bundles, T) {
    const today = M.today, start = a.start, tIdx = daysBetween(start, today), horizonIdx = daysBetween(start, S.horizon);
    // Task pool rules: a future task whose types the assessment's group does not allow stays where it is but has no effect on it
    // (Model may credit it; the optimizer does not). An event that also carries an allowed type keeps its credit (Model's drop
    // cannot be split between the tasks of one date).
    const group = poolGroup(a), allows = b => poolAllows(S, group, b);
    const events = a.events.map(e => e.date >= today && (e.types?.length ? e.types : [e.bundle]).every(x => !allows(x))
      ? { ...e, noCredit: true, fixedInPlace: true, fitAfter: null, qMitAfter: null, segEnd: null, poolBlocked: true }
      // a date that also carries an allowed type is that type for this assessment (e.g. API external + repair on CUI → API external)
      : e.date >= today && !allows(e.bundle) ? { ...e, bundle: (e.types || []).find(allows) || e.bundle } : e);
    const poolBlocked = events.filter(e => e.poolBlocked);
    const windows = windowsByUnit[a.unitId] || [];
    const gov = governing(a, S), L = gov.L;
    // CML layer (models/cml-<sid>.json.gz): Model's assessment curve is the worst CML's Weibull, so when the CML results are
    // available the base is Model's own beta / eta / gamma for that CML (no back-fit needed), and only tasks that cover the worst CML
    // can move the assessment
    const cm = M.cml?.[a.id] || null;
    // Model row model (models/rows-<sid>.json.gz): every CML / failure-mode row of this assessment. When present it replaces the
    // governing-CML shortcut: a task changes exactly the rows Model re-fits for it, wherever the plan puts it. A plan controls the
    // future events; past tasks and credits without an event stay where Model has them.
    const rm = M.rows?.[a.id]?.length ? rowModelOf(M.rows[a.id], events.filter(e => e.date >= today).map(e => [e.day, daysBetween(start, e.endDate || e.date)])) : null;
    const worstCml = cm?.worst && cm.worst.beta > 0 && cm.worst.eta > 0 && cm.worst.gamma != null && cm.worst.start ? cm.worst : null;
    const coversWorst = e => !!cm && (e.taskNumbers || []).some(tn => cm.coverage?.[tn]?.worst);
    // Governing-CML mode: the assessment curve is the governing CML's Weibull and Model records which tasks cover that CML.
    // Only those tasks are shifted or copied (with their own task numbers and type); every other task stays exactly where it is
    // (never moved, copied or removed) and, once the plan changes, has no effect on the assessment.
    const govMode = !rm && !!worstCml && events.some(e => coversWorst(e));
    const taskInfo = n => M._taskByNumber?.get(a.assetId + '|' + n) || null;  // task numbers repeat across assets
    // Model's upgraded Weibull on a task (Rate After Replacement = Upgrade; Upgrade Eta / Beta / Gamma in years): after that task the
    // curve is exactly that Weibull, starting at the task. Of several upgraded tasks on one date, the one named for this mechanism.
    const upgradeOf = e => {
      const ups = (e?.taskNumbers || []).map(n => ({ n, t: taskInfo(n) })).filter(x => x.t?.upgrade && x.t.upgrade.etaYears > 0 && x.t.upgrade.beta > 0);
      if (!ups.length) {
        // a cracking assessment: every API internal / inspect + conditional repair carries Model's upgraded Weibull for it, the
        // assessment's own Stage1 Eta / Beta (what Model's "Repair Cracks If Found" tasks hold), gamma blank
        const w = a.upgradeWeibull, types = e?.types?.length ? e.types : [e?.bundle];
        // Model's repair task is dated the day after its inspection (182 of 182 pairs): the Weibull restarts on that day
        if (w && w.etaYears > 0 && w.beta > 0 && types.some(b => b === 'API internal' || b === 'Inspect + conditional repair')) return { number: 'Repair Cracks If Found (' + (a.mechanism || 'cracking') + ')', etaYears: w.etaYears, beta: w.beta, gammaYears: w.gammaYears, fromAssessment: true, offset: types.includes('API internal') ? 1 : 0 };
        return null;
      }
      const mech = (a.mechanism || a.component.split(' | ').at(-1) || '').toLowerCase();
      const pick = ups.find(x => mech && x.n.toLowerCase().includes(mech)) || ups[0];
      // the upgrade restarts the curve on the upgraded task's own date (its day within the event, e.g. the repair the day after the internal)
      const offset = pick.t.date && e.date ? Math.max(0, daysBetween(e.date, pick.t.date)) : 0;
      return { number: pick.n, ...pick.t.upgrade, offset };
    };
    const upgradeSeg = (u, d) => ({ origin: d + (u.offset || 0) + 1, beta: u.beta, eta: u.etaYears * 365.25, gamma: (u.gammaYears || 0) * 365.25, upgrade: true });
    const upgradeEvidence = u => `Model upgraded Weibull of ${u.number} (β ${u.beta}, η ${u.etaYears} y, γ ${u.gammaYears ?? 0} y)`;
    const cmlOnly = e => !rm && !!cm && !e.synthetic && (govMode ? !coversWorst(e) : (e.effectTargets || []).includes('CML') && !coversWorst(e));
    // Model stores, per task credited to the governing CML, the re-fitted Weibull of that CML (mitigated arrays: index k+1 after repair k)
    const cmlRefit = e => {
      const mit = cm?.worst?.mit; if (!mit || !mit.repairs?.length || !coversWorst(e) || !e.date) return null;
      const k = mit.repairs.findIndex(r => r.slice(0, 10) >= e.date && r.slice(0, 10) <= (e.endDate || e.date));
      if (k < 0) return null; const b = mit.beta?.[k + 1], et = mit.eta?.[k + 1], g = mit.gamma?.[k + 1];
      return b > 0 && et > 0 && g != null ? { beta: b, eta: et, gamma: g } : null;
    };
    const base = worstCml ? { origin: daysBetween(a.start, worstCml.start.slice(0, 10)) + 1, beta: worstCml.beta, eta: worstCml.eta, gamma: worstCml.gamma, source: 'Model CML Weibull' } : a.fit ? { origin: 0, beta: a.fit.beta, eta: a.fit.eta, gamma: a.fit.gamma } : null;
    // state today: the unmitigated curve, unless Model credits a task dated before today - then the stored curve after that task
    const past = a.events.filter(e => e.date < today && (e.fitAfter || e.qMitAfter));
    const lastPast = past.length ? past[past.length - 1] : null;
    // first breach on the unmitigated curve: Model's stored series via the fine ladder (240 levels) when available, else the model ladder refined by the Weibull
    const fineQ = M.fineQ?.q?.[a.id];
    let b0 = L == null ? null : fineQ ? storedCrossing(M.fineQ.levels, fineQ, L) : refinedCrossing(M.levels, a.q, L, base);
    let b0Censored = false;
    if (lastPast && L != null) { const q = lastPast.qMitAfter ? refinedCrossing(M.levels, lastPast.qMitAfter, L, lastPast.fitAfter) : lastPast.fitAfter ? crossing(lastPast.fitAfter, L) : null; b0 = q; b0Censored = q == null; }
    // Model's own current plan (models/breach-*.json.gz): the periods its stored MITIGATED risk is at/above the limit, at Model's
    // thresholds. While the thresholds are Model's, every breach date on the current plan is read from it; the model only answers
    // where Model has nothing stored (user-linked tasks, a changed plan, other thresholds).
    // Model's consequence over time (a.cofSeries, day index from the assessment start = the stored curve start): the modelled breach
    // is the first day PoF(day) x consequence(day) reaches the threshold, the same curve the chart draws
    const cofSer = gov.measure ? a.cofSeries?.[gov.measure] || null : null, thrM = gov.measure ? S[gov.measure] : null;
    const cofOn = d => { let v = cofSer[0][1]; for (const [x, c] of cofSer) { if (x <= d) v = c; else break; } return v; };
    const crossAt = seg => {
      if (!cofSer) return crossing(seg, L);
      for (let i = 0; i < cofSer.length; i++) {
        const c = cofSer[i][1]; if (!(c > 0)) continue;
        const d0 = i === 0 ? -Infinity : cofSer[i][0], d1 = i + 1 < cofSer.length ? cofSer[i + 1][0] : Infinity;
        const x = crossing(seg, thrM / c);
        if (x != null && x < d1) return Math.max(x, d0);
      }
      return null;
    };
    // row model helpers: the limit on a day (lowest threshold / consequence of the measures, Model's consequence over time where it
    // varies), one plan event applied on a day, and the first breach from a day for a list of applications
    const limitOf = L == null ? null : (() => {
      const parts = gov.all.map(c => ({ thr: S[c.m], ser: a.cofSeries?.[c.m] || null, cof: c.m === 'hse' ? a.cofHse : a.cofEcon }));
      const breaks = [...new Set(parts.flatMap(p => (p.ser || []).map(x => x[0])))];
      const at = d => Math.min(...parts.map(p => { let c = p.cof; if (p.ser?.length) { c = p.ser[0][1]; for (const [x, v] of p.ser) { if (x <= d) c = v; else break; } } return c > 0 ? p.thr / c : Infinity; }));
      return { at, breaks };
    })();
    const rmRange = e => e.day == null ? [Infinity, -Infinity] : [e.day, e.endDate ? daysBetween(start, e.endDate) : e.day];
    const rmRows = e => { if (!rm || e?.day == null) return 0; const [f, t] = rmRange(e); return rm.rows.filter(r => r.tasks.some(x => x.day >= f && x.day <= t)).length; };
    const rmApp = (e, day) => { const [f, t] = rmRange(e), u = e.noCredit ? null : upgradeOf(e); return { from: f, to: t, day, upgrade: u?.fromAssessment ? { offset: u.offset || 0, beta: u.beta, eta: u.etaYears * 365.25, gamma: (u.gammaYears || 0) * 365.25 } : null }; };
    // a task the row model can place: a Model task (its own rows), or a default cracking inspection (Model's Stage1 upgrade on every row)
    const rmModels = e => !!rm && !!limitOf && !e.userAdded && (e.day != null ? !e.synthetic : !!upgradeOf(e)?.fromAssessment);
    const rmBreachOf = (apps, from) => rowBreach(rowSegments(rm, apps), from, limitOf.at, limitOf.breaks, horizonIdx + 36525);
    // the day a placed event is complete: its last re-fit (a repair the day after the inspection, an upgrade) plus that task's downtime;
    // the breach after the event is searched from there (the curve before it is the old one)
    const rmEnd = app => {
      let end = app.day;
      if (Number.isFinite(app.from)) for (const r of rm.rows) for (const x of r.tasks) if (x.day >= app.from && x.day <= app.to) end = Math.max(end, app.day + (x.day - app.from) + x.dt);
      if (app.upgrade) end = Math.max(end, app.day + app.upgrade.offset);
      return end;
    };
    if (rm && limitOf) {
      // first breach with no further task: every row from its last task before today, Model's own curve continued
      const rs0 = rowSegments(rm, []); let from0 = 0;
      for (const { segs } of rs0) for (const s of segs) if (s.at <= tIdx) from0 = Math.max(from0, s.at + s.x.dt);
      b0 = rowBreach(rs0, Math.min(from0, tIdx), limitOf.at, limitOf.breaks, horizonIdx + 36525); b0Censored = false;
    }
    const NB = M.sampleBreach;
    // Model's stored curve is the current plan exactly unless the task pool takes away a credit Model gives: a blocked task Model
    // does not credit on its date (e.g. an API external on a cracking assessment) leaves Model's curve as it is. Any credit counts
    // (an inspection credit changes the curve's slope without a step, so a drop test would miss it)
    const nbRaw = L != null && NB && S.hse === NB.thresholds.hse && S.econ === NB.thresholds.econ ? NB.a?.[a.id] || null : null;
    const nbBlockedCredit = !!nbRaw && poolBlocked.some(e => (nbRaw.credits || []).some(c => c >= e.day && c <= daysBetween(start, e.endDate || e.date)));
    const nbRec = nbRaw && !nbBlockedCredit ? nbRaw : null;
    // a breach is Model's curve above EITHER limit the assessment has a consequence for: the periods of both measures, merged
    const nbIv = nbRec ? gov.all.flatMap(c => nbRec[c.m] || []).sort((x, y) => x[0] - y[0]).reduce((acc, [s, e]) => {
      const last = acc[acc.length - 1];
      if (last && (last[1] == null || s <= last[1])) { if (last[1] != null) last[1] = e == null ? null : Math.max(last[1], e); } else acc.push([s, e]);
      return acc;
    }, []) : null, nbCredits = nbRec?.credits || [];
    // first day at/above the limit on Model's curve from day `from` on (a period already open counts from its own start), before
    // Model's next credited task after day `after`: null = no breach in that stretch, undefined = Model does not store it
    const nbBreach = (from, after) => {
      if (!nbIv) return undefined;
      const until = nbCredits.find(c => c > after) ?? Infinity, p = nbIv.find(([s, e]) => (e == null || e > from) && s < until);
      if (p) return p[0];
      return until === Infinity && nbRec.end < horizonIdx ? undefined : null;
    };
    const endDay = e => daysBetween(start, e.endDate || e.date);
    const nbCredited = e => !!nbRec && !e.userAdded && nbCredits.some(c => c >= e.day && c <= endDay(e));
    // breach after a current-plan task on Model's curve (the day after it when the curve stays above), else the stored ladder
    // the curve after a stored task whose stored segment was cut short by a blocked Spot UT / RT: its own post-task fit, else a restart of the base curve
    const afterBlocked = e => e.fitAfter ? { ...e.fitAfter } : (() => { const r = renewal(base, e.day); if (NO_GAMMA.has(a.category)) r.gamma = 0; return r; })();
    // true when Model's stored segment after e cannot be used as-is: the next credited task is a blocked Spot UT / RT, or (CUI rule in force) e has no stored fit to carry the curve
    const blockedAfter = e => { if (poolBlocked.length && !e.fitAfter && !e.poolBlocked && e.day >= tIdx) return true; const nx = events.find(x => x.day > e.day && (x.fitAfter || x.qMitAfter || x.poolBlocked)); return !!nx?.poolBlocked; };
    const storedAfter = e => {
      if (nbRec && !e.userAdded) { if (!nbCredited(e)) return null; const v = nbBreach(endDay(e), endDay(e)); if (v !== undefined) return v == null ? null : Math.max(v, e.day); }
      const q = e.qMitAfter ? refinedCrossing(M.levels, e.qMitAfter, L, e.fitAfter) : null;
      // Model's stored segment ends at the next credited task; when that task is a Spot UT / RT that gives CUI no credit, the
      // stored post-task fit runs on past it
      if (q == null && blockedAfter(e) && (e.fitAfter || base)) { const c = crossAt(afterBlocked(e)); return c == null ? null : Math.max(c, e.day); }
      return q;
    };
    const isStored = e => !!(e.fitAfter || e.qMitAfter) || nbCredited(e);
    if (nbIv && L != null) {
      const v = nbBreach(tIdx, tIdx - 1), firstCredit = nbCredits.find(c => c >= tIdx);
      if (v != null) { b0 = v; b0Censored = false; }
      else if (v === null) {
        // Model shows no breach before its next credited task: the model's extrapolation beyond that task stands only if it agrees
        if (firstCredit == null || b0 == null || b0 < firstCredit) { b0Censored = b0 != null && firstCredit != null; b0 = null; }
      }
    }
    const state0 = lastPast?.fitAfter ? { ...lastPast.fitAfter } : base;
    const b0Mit = L == null ? null : storedCrossing(M.levels, a.qMit, L);
    const out = { id: a.id, gov, L, b0, b0Date: b0 == null ? null : addDays(start, Math.floor(b0)), b0Fit: base ? crossing(base, L) : null, alreadyBreached: b0 != null && b0 < tIdx, storedMitBreach: b0Mit == null ? null : addDays(start, Math.floor(b0Mit)),
                  notes: [], current: null, proposed: [], feasibility: null, action: null, stateFrom: lastPast ? `${lastPast.bundle} on ${lastPast.date}` : null, worstCml, cmlCount: cm ? cm.cmls.length : null, rowModel: rm ? rm.rows.length : 0 };
    if (lastPast || b0Censored) out.notes.push(lastPast ? `state today from Model's curve after the ${lastPast.bundle} credited on ${lastPast.date}${b0Censored ? ' (no breach before the next credited task)' : ''}` : "Model's curve shows no breach before the next credited task");
    if (nbIv) out.notes.push("breach dates on the current plan read from Model's stored risk curve");
    const markNoEffect = () => { for (const p of out.proposed) if (poolBlocked.some(e => e.date === p.date && (e.taskNumbers || []).join() === (p.taskNumbers || []).join())) { p.noEffect = true; p.evidence = `${p.bundle} does not affect ${group} assessments (task pool rule; Model credits it)`; } };
    if (poolBlocked.length) { out.poolBlocked = poolBlocked.map(e => e.date); out.notes.push(`${poolBlocked.length} task${poolBlocked.length === 1 ? '' : 's'} credited by Model (${[...new Set(poolBlocked.map(e => e.bundle))].join(', ')}) give no credit here: the task pool allows only ${(S.poolRules || DEFAULT_SETTINGS.poolRules)[group]?.join(', ') || 'other task types'} for ${group}; both plans are modelled without them`); }
    if (b0 != null && b0 > horizonIdx) { out.b0 = null; out.b0Date = null; out.notes.push('breach after the horizon'); }
    if (gov.note) out.notes.push(gov.note);
    // ---- current plan, modelled with the same effects (future credited events only: the unmitigated curve already carries the past)
    const bundleOf = b => bundles[b] || DEFAULT_BUNDLES[b] || { execution: 'outage', effect: 'none' };
    // current plan = Model's credited events (stored post-event curves), minus credits the user removed, plus tasks the user linked
    const links = M.userLinks || {};
    const removed = links.removedCredits?.[a.id] || [];
    const sampleEvents = events.filter(e => e.date >= today && !(e.taskNumbers?.length && e.taskNumbers.every(n => removed.includes(n))));
    const userEvents = (links.added || []).filter(t => t.assetId === a.assetId && t.date >= today && (t.credit || []).includes(a.id)).map(t => ({ date: t.date, endDate: t.date, day: daysBetween(start, t.date), bundle: t.bundle, types: [t.bundle], downtime: (t.downtimeHours || 0) > 0, taskNumbers: [t.number], definitions: [t.definition], userAdded: true, taskId: t.id }));
    const splitGov = e => {
      if (!govMode || e.userAdded || !(e.taskNumbers || []).length) return [e];
      const cov = e.taskNumbers.filter(n => cm.coverage?.[n]?.worst), rest = e.taskNumbers.filter(n => !cm.coverage?.[n]?.worst);
      const part = (nums, extra) => { const info = nums.map(taskInfo).filter(Boolean); const bundle = info.map(x => x.bundle).find(Boolean) || e.bundle; return { ...e, ...extra, _src: e, taskNumbers: nums, definitions: [...new Set(info.map(x => x.definition).filter(Boolean))].length ? [...new Set(info.map(x => x.definition).filter(Boolean))] : e.definitions, bundle, types: [...new Set(info.map(x => x.bundle).filter(Boolean))].length ? [...new Set(info.map(x => x.bundle).filter(Boolean))] : e.types }; };
      if (!cov.length) return [{ ...e, _src: e, fixedInPlace: true }];
      if (!rest.length) return [part(cov, { govTask: true })];
      // the stored Model event state stays with the governing-CML task; the other tasks on that date are kept without credit
      return [part(cov, { govTask: true }), part(rest, { fixedInPlace: true, noCredit: true, fitAfter: null, qMitAfter: null, segEnd: null })];
    };
    const future = [...sampleEvents.flatMap(splitGov), ...userEvents].sort((x, y) => x.date.localeCompare(y.date) || (x.fixedInPlace ? 1 : 0) - (y.fixedInPlace ? 1 : 0));
    const cur = { events: [], segments: [] };
    const curApps = [];  // the current plan's credited events for the row model (a pool-blocked task takes its re-fits away)
    {
      let seg = state0, b = out.b0;
      for (const e of future) {
        const day = daysBetween(start, e.date), bd = bundleOf(e.bundle);
        if (rmModels(e) && !e.noCredit) curApps.push(rmApp(e, day));
        const slack = b == null ? null : Math.round(b - day);
        // Model's own answer where it exists (stored post-event fit + crossing); the effect model where it does not (user-linked tasks)
        const tr = transformFor(T, a, e.bundle);
        // a task Model does not credit on its date leaves Model's curve unchanged: no effect on the current plan
        const sampleSilent = !!nbRec && !e.userAdded && !nbCredited(e);
        const upE = !e.noCredit && !sampleSilent ? upgradeOf(e) : null;
        const modelSeg = upE ? upgradeSeg(upE, day) : base && seg && !e.noCredit && !sampleSilent ? applyEffect(base, seg, bd.effect, day, S, tr, a.category) : null;
        const modelB = modelSeg && !modelSeg.unchanged ? crossAt(modelSeg) : null;
        const stored = !e.noCredit && isStored(e);
        const seg2 = sampleSilent ? null : e.fitAfter ? { ...e.fitAfter } : stored && blockedAfter(e) && base ? afterBlocked(e) : modelSeg && !modelSeg.unchanged ? modelSeg : null;
        const qn = !e.noCredit && isStored(e) ? storedAfter(e) : null;
        // Model's stored curve when it holds this plan; otherwise the row model on the current plan (exact: the same rows and re-fits,
        // minus the credits the task pool takes away); the effect model only for tasks Model has no rows for (user-linked tasks)
        const rmB = rmModels(e) && !e.noCredit ? rmBreachOf(curApps, rmEnd(curApps.at(-1))) : undefined;
        const b2 = stored && nbRec ? qn : rmB !== undefined ? rmB : stored ? qn : modelB;
        const life = b2 == null ? null : Math.round(b2 - day);
        const censoredDays = e.segEnd != null ? e.segEnd - day : null;
        const sampleLife = qn == null ? (stored ? Infinity : null) : Math.round(qn - day);
        const modelLife = modelB == null ? null : Math.round(modelB - day);
        const agree = sampleLife == null ? null : sampleLife === Infinity ? (modelLife == null || (censoredDays != null && modelLife >= censoredDays - 1)) : (modelLife != null && Math.abs(modelLife - sampleLife) <= 90);
        cur.events.push({ ...e, execution: bd.execution, effect: bd.effect, evidence: stored ? 'Model stored event' : rmB !== undefined ? (rmRows(e) || rmApp(e, day).upgrade ? `Model calculation rows (${rmRows(e)} of ${rm.rows.length} re-fitted)` : 'no Model re-fit (no effect)') : e.userAdded ? 'user-linked task · ' + evidenceOf(T, a, e.bundle, bd.effect) : evidenceOf(T, a, e.bundle, bd.effect), window: windowAt(windows, e.date)?.name || null, slack, class: slack == null ? 'no breach before task' : slack < 0 ? 'late' : slack < S.margin ? 'tight' : slack > (S.earlyDays ?? 820) ? 'early' : 'ok', life, modelLife, unchanged: !stored && !!modelSeg?.unchanged, breachAfter: b2 == null ? null : addDays(start, Math.floor(b2)), sampleLife, censoredDays, agree, sampleBreachAfter: qn == null ? null : addDays(start, Math.floor(qn)), params: seg2 });
        cur.segments.push({ from: day, seg: seg2, breach: b2 });
        seg = seg2 || seg; b = b2 == null ? (stored || rmB !== undefined ? null : b) : Math.max(b2, day);
      }
      cur.finalBreach = b == null ? null : addDays(start, Math.floor(b));
    }
    out.current = cur; out.currentNext = cur.events[0] || null;
    // ---- renewal chain
    if (a.scope !== 'fixed') { out.feasibility = 'interval-driven'; out.action = 'Interval-driven'; return out; }
    // no breach before the horizon: nothing to plan. When the breach after today is unknown (Model's segment censored, or the task
    // pool took a credited task away) a breach after a later current task still needs the chain
    if (out.b0 == null && !((b0Censored || poolBlocked.length) && cur.events.some(e => e.breachAfter && e.breachAfter <= S.horizon))) {
      // no breach before the horizon: the current plan stands as it is (its tasks are kept, nothing is added)
      out.feasibility = 'no breach within horizon'; out.action = out.currentNext ? 'Keep' : 'No action';
      out.proposed = cur.events.map(e => ({ date: e.date, window: e.window || (e.execution === 'online' ? 'Online' : 'Scheduled outage'), execution: e.execution, bundle: e.bundle, kept: true, driverAssessmentId: a.id, creditedAssessmentIds: [a.id], evidence: e.evidence, scope: e.types || [e.bundle], breachBefore: null, exposureDays: 0, life: e.life, breachAfter: e.breachAfter, params: e.params, note: null, taskNumbers: e.taskNumbers }));
      return out;
    }
    if (!base) { out.feasibility = 'no Weibull fit'; out.notes.push('the unmitigated curve has too few points between 0.01 % and 99.99 % to fit; only the first task can be placed'); }
    // ---- The chain may only use tasks Model already credits on this assessment (its current plan): keep one where it is, shift one,
    //      or copy one to a new date with that task's own measured effect.  Nothing is invented; if none of them holds the assessment
    //      under the limit, the assessment is flagged for engineering scope.
    // life Model's stored mitigated curve shows after an event: the first crossing after it, looking across the following events
    // (a task whose segment never rises before the next task gets the life the whole stored plan showed after it, not more)
    const storedLife = e => {
      if (nbIv && nbCredited(e)) { const d = endDay(e), p = nbIv.find(([s, en]) => en == null || en > d); return p ? Math.max(p[0], e.day) - e.day : Math.max(0, nbRec.end - e.day); }
      if (!e.qMitAfter) return null;
      const idx = events.indexOf(e._src || e);
      for (let i = idx; i < events.length; i++) { const q = events[i].qMitAfter ? storedCrossing(M.levels, events[i].qMitAfter, L) : null; if (q != null) return q - e.day; }
      const last = events[events.length - 1]; return (last.segEnd != null ? last.segEnd : a.n - 1) - e.day;
    };
    const isCensored = e => nbIv && nbCredited(e) ? nbBreach(endDay(e), endDay(e)) === null : !!(e.qMitAfter && storedCrossing(M.levels, e.qMitAfter, L) == null && !(blockedAfter(e) && (e.fitAfter || base)));
    const templates = [];
    for (const e0 of events) {
      const e = govMode ? splitGov(e0).find(x => x.govTask) : e0;
      if (!e || e.poolBlocked) continue;
      if (e.bundle === 'Unlisted repair date') continue;
      if (cmlOnly(e)) continue;  // a CML-credited task that does not cover the governing CML cannot move the assessment: not a template
      const life = storedLife(e), prev = templates.find(x => x.bundle === e.bundle);
      if (!prev) templates.push({ bundle: e.bundle, event: e, life, censored: isCensored(e) });
      else if ((life ?? -1) > (prev.life ?? -1)) Object.assign(prev, { event: e, life, censored: isCensored(e) });
    }
    for (const u of (links.added || []).filter(x => x.assetId === a.assetId && (x.credit || []).includes(a.id) && allows(x.bundle))) if (!templates.some(x => x.bundle === u.bundle)) templates.push({ bundle: u.bundle, event: { bundle: u.bundle, day: daysBetween(start, u.date), taskNumbers: [u.number], definitions: [u.definition], userAdded: true }, life: null, censored: false });
    // no task in the current plan credits this assessment (or this damage mechanism): the default task type for its category from the
    // settings is used, with the modelled effect for that type
    let usedDefault = null;
    if (!templates.length) {
      const catDefault = S.defaultByCategory?.[a.category] || (isEngineering(a) ? null : S.defaultBundle);
      // the default must be a task type the group allows (e.g. CUI → API external); otherwise the first type the group allows
      const firstAllowed = (S.poolRules || DEFAULT_SETTINGS.poolRules)[group]?.[0];
      const dBundle = catDefault && allows(catDefault) ? catDefault : (catDefault || !isEngineering(a)) ? firstAllowed || null : group === 'CUI' ? firstAllowed || null : null;
      // the current plan's tasks (e.g. a Spot UT on a CUI assessment, which gives no credit) stay in the plan as they are
      if (!dBundle) { out.proposed = cur.events.filter(e => e.date <= S.horizon).map(e => ({ date: e.date, window: e.window || (e.execution === 'online' ? 'Online' : 'Scheduled outage'), execution: e.execution, bundle: e.bundle, kept: true, driverAssessmentId: a.id, creditedAssessmentIds: [a.id], evidence: e.evidence, scope: e.types || [e.bundle], breachBefore: null, exposureDays: 0, life: e.life, breachAfter: e.breachAfter, params: e.params, note: null, taskNumbers: e.taskNumbers, definitions: e.definitions || [] }));
        markNoEffect(); out.feasibility = 'uncovered'; out.action = 'No task in plan'; out.notes.push(poolBlocked.length && !events.some(e => e.date >= today && !e.poolBlocked) ? `the only tasks in the current plan are types the task pool does not allow for ${group} (${[...new Set(poolBlocked.map(e => e.bundle))].join(', ')}): a ${(S.poolRules || DEFAULT_SETTINGS.poolRules)[group]?.join(' or ') || 'permitted'} task is needed` :'no task in the current plan credits this assessment and no default task type is set for its category: link a task in the editor below or set a default in the settings.'); return out; }
      usedDefault = dBundle;
      templates.push({ bundle: dBundle, event: { bundle: dBundle, day: null, taskNumbers: [], definitions: S.definitionByCategory?.[a.category] ? [S.definitionByCategory[a.category]] : [], synthetic: true }, life: null, censored: false });
      out.notes.push(`no task in the current plan credits this assessment: default task type ${dBundle} from the settings is used`);
    }
    const engineering = isEngineering(a);
    const minLife = Math.max(S.margin, S.minLife ?? 180);
    let seg = state0, b = out.b0, lastPlaced = null, step = 0;
    const consumed = new Set(); let diverged = false;
    // the events the chain has placed so far (kept on their date, shifted, or copied), for the row model
    const rmApps = [], rmAdd = (e, day) => { if (e && rmModels(e) && !e.noCredit) rmApps.push(rmApp(e, day)); };
    // Shared tasks (M._pinned, set by the worker): a task Model also links to other assessments that still need it on its date cannot
    // be shifted for this one (Model would move it for all of them). The chain copies it to its date instead and the original stays
    // in this plan too, still linked to this assessment. Value = how many other assessments rely on it.
    const pinOf = e => e.userAdded || !M._pinned?.size ? undefined : (e.taskNumbers || []).map(n => M._pinned.get(a.assetId + '|' + n)).find(v => v != null);
    const pinnedUsed = new Set();
    // Placement. Outage work (API internals, TAR tasks) ALWAYS goes into a turnaround window: the last TAR on file at or before the
    // deadline, pulled in as far as needed. Only when the TAR calendar has run out does the 180 d rule apply: a deadline within
    // `onlinePref` days after the last TAR on file still goes into that TAR, anything later is a turnaround to be planned at the
    // deadline. If the breach comes before the next possible TAR, the task goes into that next TAR with the exposure recorded.
    // Online work runs at the deadline (breach minus the margin), joining a TAR only when one starts within the same window.
    const usable = windows.filter(w => w.start >= today);
    const lastOnFile = usable.length ? usable[usable.length - 1] : null;
    const placeFor = (bundle, deadline) => {
      const exec = bundleOf(bundle).execution;
      // a window the chain has already placed a task in is not reused; a window that merely holds a kept current-plan task can host one
      const usedStarts = new Set(out.proposed.filter(p => !p.kept).map(p => p.date));
      const cands = usable.filter(w => !usedStarts.has(w.start) && w.start <= deadline && (!lastPlaced || w.start > lastPlaced || (lastPlaced >= w.start && lastPlaced <= (w.end || addDays(w.start, 45)))));
      const last = cands.length ? cands[cands.length - 1] : null;
      // nothing is scheduled past the last turnaround on file: the chain stops there and the curves are shown as they run on
      const toPlan = () => null;
      if (exec === 'online') {
        if (last && daysBetween(last.start, deadline) <= S.onlinePref) return { t: last.start, place: last.name, execution: 'online (in TAR)' };
        if (lastOnFile && deadline > lastOnFile.start && daysBetween(lastOnFile.start, deadline) > S.onlinePref) return null;
        let t = deadline > addDays(today, 30) ? deadline : addDays(today, 30); if (lastPlaced && t <= lastPlaced) t = addDays(lastPlaced, 30);
        return { t, place: 'Online', execution: 'online' };
      }
      if (!usable.length) return toPlan();
      if (deadline > lastOnFile.start) {
        // past the last turnaround on file: the 180 d rule - still that TAR when the deadline is within reach of it, otherwise a TAR to be planned
        if (daysBetween(lastOnFile.start, deadline) <= S.onlinePref && cands.includes(lastOnFile)) return { t: lastOnFile.start, place: lastOnFile.name, execution: 'outage' };
        return toPlan();
      }
      if (last) return { t: last.start, place: last.name, execution: 'outage' };
      // no free TAR between the last placement and the deadline while the calendar still runs: the next TAR, with the exposure it implies
      const nxt = usable.filter(w => !usedStarts.has(w.start) && (!lastPlaced || w.start > lastPlaced));
      return nxt.length ? { t: nxt[0].start, place: nxt[0].name, execution: 'outage' } : toPlan();
    };
    // effect of an existing task applied at day d: its own stored post-task fit translated to d; a task whose stored curve never rose
    // again before the next event (censored) is modelled as a restart of the base Weibull with at least its observed life
    const effectAt = (e, d, censored, life) => {
      let seg2 = null;
      if (e.noCredit) return { seg: null, b: null, evidence: e.poolBlocked ? `${e.bundle} does not affect ${group} assessments (task pool rule)` : 'kept without credit' };
      if (cmlOnly(e)) return { seg: null, b: null, evidence: `credited to CMLs that are not the governing CML${worstCml ? ' (' + worstCml.clientId + ')' : ''}: no effect on the assessment` };
      if (rmModels(e)) {
        // Model's calculation rows: this task's own re-fits (and its upgraded Weibull) on the rows it covers, at day d, on top of every
        // event the chain has placed so far; the other rows keep ageing
        const n = rmRows(e), app = rmApp(e, d), up = upgradeOf(e);
        if (!n && !app.upgrade) return { seg: null, b: null, evidence: 'Model re-fits none of this assessment\'s rows for this task: no effect' };
        const bb = rmBreachOf([...rmApps, app], rmEnd(app));
        const segDisp = up ? upgradeSeg(up, d) : e.fitAfter ? { ...e.fitAfter, origin: e.fitAfter.origin + (d - e.day) } : null;
        return { seg: segDisp, b: bb, evidence: `Model calculation rows (${n} of ${rm.rows.length} re-fitted by this task${app.upgrade ? ', plus ' + upgradeEvidence(up) : ''})${e.day != null && d !== e.day ? `, applied ${d > e.day ? '+' : ''}${Math.round(d - e.day)} d from its Model date` : ''}` };
      }
      const up = upgradeOf(e);
      if (up) { const s2 = upgradeSeg(up, d); return { seg: s2, b: crossAt(s2), evidence: upgradeEvidence(up) + (d !== e.day ? ', applied at the new date' : '') }; }
      const cmlFit = cmlRefit(e);
      if (cmlFit) { seg2 = { origin: d + 1, beta: cmlFit.beta, eta: cmlFit.eta, gamma: NO_GAMMA.has(a.category) ? 0 : cmlFit.gamma, cmlRefit: true }; seg2 = continuity(seg2, seg, d); return { seg: seg2, b: crossAt(seg2), evidence: `Model's CML re-fit after this task on the governing CML ${worstCml.clientId} (β ${cmlFit.beta.toFixed(2)}, η ${Math.round(cmlFit.eta)} d, γ ${Math.round(cmlFit.gamma)} d from the task)${d !== e.day ? ', reused at the new date' : ''}` }; }
      if (e.fitAfter) seg2 = { ...e.fitAfter, origin: e.fitAfter.origin + (d - e.day) };
      else if (base && seg) { const eff = bundleOf(e.bundle).effect; seg2 = applyEffect(base, seg, censored || eff === 'renewal' ? 'renewal' : eff, d, S, transformFor(T, a, e.bundle), a.category); }
      if (!seg2 || seg2.unchanged) return { seg: null, b: null, evidence: 'no measured effect' };
      // cracking: a reused Weibull (shifted own fit, restart or re-shape) always starts at the task day with gamma = 0
      if (NO_GAMMA.has(a.category)) seg2 = { ...seg2, origin: d + 1, gamma: 0, noGamma: true };
      seg2 = continuity(seg2, seg, d);
      let bb = crossAt(seg2);
      if (censored && life != null && !e.fitAfter && !NO_GAMMA.has(a.category)) {
        // a task whose stored curve stayed flat can only claim the life Model actually showed after it: the restart shape is slid so
        // that it reaches the limit exactly `life` days after the task (never later than that, never earlier than the restart says)
        const target = d + life;
        const Lt = cofSer ? thrM / cofOn(target) : L;
        if ((bb == null || bb > target) && Lt > 0 && Lt < 1) { const tNew = seg2.eta * Math.pow(-Math.log(1 - Lt), 1 / seg2.beta); seg2 = { ...seg2, gamma: target + 1 - seg2.origin - tNew, capped: true }; bb = target; }
      }
      return { seg: seg2, b: bb, evidence: e.fitAfter ? 'own Model event' + (d !== e.day ? `, shifted ${Math.round(d - e.day)} d` : '') : censored ? `own Model event (curve stayed under the limit ${Math.round(life)} d after it; that life is claimed, no more)` : (e.synthetic ? 'default task type from settings · ' : '') + evidenceOf(T, a, e.bundle, bundleOf(e.bundle).effect) };
    };
    // a task must move the breach by at least a day (a fraction of a day is the same breach date) and hold the minimum life
    const okGain = (bb, bIdx, d) => bb != null && Math.floor(bb) > Math.floor(bIdx) && bb - d >= minLife;
    // when the plan holds a task of the type this mechanism calls for (thinning → UT / RT, cracking and creep → API internal,
    // external thinning → API external), only those types are copied; otherwise any task of the plan
    const eligible = eligibleBundles(a), pool = govMode ? templates : templates.some(t => eligible.includes(t.bundle)) ? templates.filter(t => eligible.includes(t.bundle)) : templates;
    const bestCopy = (deadline, bIdx, exclude) => {
      // preferred types first (the mechanism's own inspection type); any other task of the plan only when none of those clears it
      const first = bestCopyFrom(pool, deadline, bIdx, exclude);
      return first || (govMode || pool.length === templates.length ? null : bestCopyFrom(templates, deadline, bIdx, exclude));
    };
    const bestCopyFrom = (from, deadline, bIdx, exclude) => {
      let best = null;
      for (const tpl of from) {
        if (tpl.bundle === exclude) continue;
        const pl = placeFor(tpl.bundle, deadline); if (!pl) continue;
        const d = daysBetween(start, pl.t), eff = effectAt(tpl.event, d, tpl.censored, tpl.life);
        if (!okGain(eff.b, bIdx, d)) continue;
        if (!best || eff.b > best.b2) best = { t: pl.t, place: pl.place, execution: pl.execution, seg2: eff.seg, b2: eff.b, bundle: tpl.bundle, copyOf: tpl.event, evidence: tpl.event.synthetic ? eff.evidence : `copy of ${tpl.event.taskNumbers?.[0] || tpl.bundle} · ${eff.evidence}` };
      }
      return best;
    };
    const keepInPlace = (e, bIdx, bDate) => {
      const changeFrom = p => p.movedFrom && p.movedFrom < p.date ? p.movedFrom : p.date;
      const priorChange = out.proposed.some(p => !p.kept && changeFrom(p) <= e.date), laterChange = out.proposed.some(p => !p.kept && changeFrom(p) > e.date);
      const cIdx = daysBetween(start, e.date), stored = !priorChange && !e.noCredit && isStored(e);
      let segK = null, bK = null, ev = 'Model stored event';
      if (stored && !e.userAdded) { segK = e.fitAfter ? { ...e.fitAfter } : blockedAfter(e) && base ? afterBlocked(e) : null; bK = storedAfter(e); }
      else { const eff = effectAt(e, cIdx, isCensored(e), storedLife(e)); segK = eff.seg; bK = eff.b; ev = (priorChange ? 'kept task, modelled on the changed plan · ' : '') + eff.evidence; if (bK != null && bIdx != null && bK <= bIdx) { segK = null; bK = null; } }
      out.proposed.push({ date: e.date, window: windowAt(windows, e.date)?.name || (bundleOf(e.bundle).execution === 'online' ? 'Online' : 'Scheduled outage'), execution: bundleOf(e.bundle).execution, bundle: e.bundle, kept: true, targets: e.effectTargets || [], driverAssessmentId: a.id, creditedAssessmentIds: [a.id], evidence: ev, scope: e.types || [e.bundle], breachBefore: bDate, exposureDays: 0, life: bK == null ? null : Math.round(bK - cIdx), breachAfter: bK == null ? null : addDays(start, Math.floor(bK)), params: segK, note: null, taskNumbers: e.taskNumbers || [], definitions: e.definitions || [] });
      rmAdd(e, e.day);
      if (laterChange) return;
      if (e.date > (lastPlaced || '')) lastPlaced = e.date; if (segK) seg = segK;
      if (bK != null) b = b == null ? bK : Math.max(b, bK); else if (stored) b = null;  // Model's stored curve after this task never reaches the limit before the next task
    };
    let guard = 0;
    while (step < S.maxSteps && guard++ < 400) {
      if (b == null) {
        // no breach known yet (censored by the next credited task): that task stays, and its own stored curve says what comes after
        const nxt = future.find(e => !consumed.has(e)); if (!nxt) break;  // fixed-in-place tasks included: nothing is breached yet
        consumed.add(nxt); keepInPlace(nxt, null, null); continue;
      }
      step++;
      const bIdx = b, bDate = addDays(start, Math.floor(bIdx));
      if (bIdx > horizonIdx) break;
      const deadline = bIdx < tIdx ? today : addDays(start, Math.floor(bIdx) - S.margin);
      // a shared task this chain has already copied stays where it is, like a fixed task
      const fixedDue = future.find(e => !consumed.has(e) && (e.fixedInPlace || pinnedUsed.has(e)));
      const remaining = future.filter(e => !consumed.has(e) && !e.fixedInPlace && !pinnedUsed.has(e)), cand = remaining[0] || null;
      let bundle = cand ? cand.bundle : templates[0].bundle;
      const pl = placeFor(bundle, deadline);
      if (fixedDue && (!pl || fixedDue.date <= pl.t) && (!cand || fixedDue.date <= cand.date)) { consumed.add(fixedDue); keepInPlace(fixedDue, bIdx, bDate); step--; continue; }
      if (!pl) { out.notes.push(`beyond the last turnaround on file${lastOnFile ? ' (' + lastOnFile.name + ', ' + lastOnFile.start + ')' : ''}: nothing further is scheduled; the curves run on from the last task`); out.beyondCalendar = true; break; }
      // 1. a credited task dated before the chain's date stays where it is (chronological order)
      if (cand && daysBetween(cand.date, pl.t) > S.keepTolerance) { consumed.add(cand); keepInPlace(cand, bIdx, bDate); step--; continue; }
      let t = pl.t, place = pl.place, execution = pl.execution, seg2 = null, b2 = null, evidence = '', retained = null, moved = null, copyOf = null, note = null, shared = null;
      if (cand) {
        // 2. keep the next credited task (within the keep tolerance) or shift it to the chain's date (a shared task: copy it there)
        consumed.add(cand);
        if (Math.abs(daysBetween(cand.date, t)) <= S.keepTolerance) { retained = cand; t = cand.date; place = windowAt(windows, t)?.name || (execution === 'online' ? 'Online' : 'Scheduled outage'); }
        else if (pinOf(cand) != null) { shared = cand; consumed.delete(cand); pinnedUsed.add(cand); }
        else moved = cand;
        const d = daysBetween(start, t);
        if (retained && !retained.userAdded && !diverged && isStored(retained)) { seg2 = retained.fitAfter ? { ...retained.fitAfter } : null; b2 = storedAfter(retained); evidence = 'Model stored event'; }
        else { const eff = effectAt(cand, d, isCensored(cand), storedLife(cand)); seg2 = eff.seg; b2 = eff.b; evidence = (retained && diverged ? 'kept task, modelled on the changed plan · ' : '') + eff.evidence; }
        // a kept Model task after which Model's curve stays under the limit until its next credited task has cleared the breach
        const storedClear = !!retained && evidence === 'Model stored event' && b2 == null && isCensored(retained);
        if (!storedClear && !okGain(b2, bIdx, d)) {
          // this task does not buy enough life here. A kept task stays in the plan as it is (no credit); a shifted one goes back where it
          // was (kept when the chain passes its date). Either way the breach is still open: the best other task in the plan is copied.
          if (retained) { consumed.delete(cand); const saved = diverged; keepInPlace(cand, bIdx, bDate); diverged = saved; consumed.add(cand); if (b !== bIdx) { b = bIdx; } }
          else if (!shared) consumed.delete(cand);
          retained = null; moved = null; shared = null;
          // a candidate that failed only because it is credited to other CMLs says nothing about its type: same-type copies stay allowed
          const best = bestCopy(deadline, bIdx, cmlOnly(cand) ? null : cand.bundle);
          if (!best) { out.notes.push(`${cand.bundle} at ${t} would not hold the assessment under the ${(gov.measure || '').toUpperCase()} limit for ${minLife} d, and no other task in the current plan does: engineering scope required`); out.cannotClear = true; break; }
          ({ t, place, execution, seg2, b2, bundle, copyOf, evidence } = best); note = `${cand.bundle} would not clear the breach; ${best.bundle} copied instead`;
        }
      } else {
        // 3. nothing left to shift: copy the best task of the current plan to the chain's date
        const best = bestCopy(deadline, bIdx, null);
        if (!best) { out.notes.push(`no task in the current plan (${templates.map(x => x.bundle).join(', ')}) holds the assessment under the ${(gov.measure || '').toUpperCase()} limit for ${minLife} d when copied to ${pl.t}: engineering scope required`); out.cannotClear = true; break; }
        ({ t, place, execution, seg2, b2, bundle, copyOf, evidence } = best);
      }
      if (shared) { copyOf = shared; const n = pinOf(shared); evidence = `copy of shared task ${shared.taskNumbers?.[0] || shared.bundle} · ${evidence}`; note = `${shared.taskNumbers?.[0] || shared.bundle} is also linked to ${n} other assessment${n === 1 ? '' : 's'} that need${n === 1 ? 's' : ''} it on ${shared.date}: copied to ${t}; the original stays on ${shared.date}, still linked to this assessment`; }
      if (t > S.horizon) break;
      const tIdx2 = daysBetween(start, t), exposure = Math.max(0, daysBetween(bDate > today ? bDate : today, t));
      const src = retained || moved || copyOf;
      out.proposed.push({ date: t, window: place, execution, bundle, kept: !!retained, moved: !!moved, movedFrom: moved?.date || null, newTask: !!copyOf, targets: src?.effectTargets || [], copyOf: copyOf ? { taskNumbers: copyOf.taskNumbers || [], definitions: copyOf.definitions || [], date: copyOf.date || null, shared: !!shared, sharedWith: shared ? pinOf(shared) : null } : null, driverAssessmentId: a.id, creditedAssessmentIds: [a.id], evidence: evidence + (engineering ? ' · engineering scope' : ''), scope: src?.types || [bundle],
                          breachBefore: bDate, exposureDays: exposure, life: b2 == null ? null : Math.round(b2 - tIdx2), breachAfter: b2 == null ? null : addDays(start, Math.floor(b2)), params: seg2, note, taskNumbers: src?.taskNumbers || [], definitions: src?.definitions || [] });
      if (seg2 && seg2.origin - 1 + seg2.gamma > horizonIdx) {
        out.proposed.at(-1).modelWarning = `Modelled PoF starts rising ${addDays(start, Math.ceil(seg2.origin - 1 + seg2.gamma))}, beyond the horizon.`;
        if (!out.notes.some(n => n.startsWith('Flat projection'))) out.notes.push(`Flat projection: the post-task curve stays under the limit beyond ${S.horizon}.`);
      }
      rmAdd(retained || moved || copyOf, tIdx2);
      lastPlaced = t; seg = seg2 || seg; b = b2;
      if (!retained) diverged = true;
      if (retained && b == null && !diverged) {
        if (nbIv && nbCredited(retained)) { const d = endDay(retained), p = nbIv.find(([s, en]) => (en == null || en > d) && s > d); b = p ? p[0] : null; }
        else for (const e of remaining.slice(1)) { const q = e.qMitAfter ? storedCrossing(M.levels, e.qMitAfter, L) : null; if (q != null) { b = q; break; } }
      }
      if (note) out.notes.push(note);
      if (!base) break;
    }
    // credited tasks the chain never reached (after the horizon or after its last step) stay in the plan as they are, modelled on the
    // state the chain left (Model's stored curve only while the history is unchanged)
    for (const e of future) if (!consumed.has(e) && e.date <= S.horizon) { consumed.add(e); keepInPlace(e, b, b == null ? null : addDays(start, Math.floor(b))); }
    out.proposed.sort((x, y) => x.date.localeCompare(y.date)); markNoEffect();
    if (cm) for (const p of out.proposed) { p.coversWorst = (p.taskNumbers || []).some(tn => cm.coverage?.[tn]?.worst); if (rm) continue; if (p.coversWorst && !/governing CML/.test(p.evidence)) p.evidence += ` · covers the governing CML ${worstCml?.clientId || ''}`.trimEnd(); else if (!p.coversWorst && (p.targets || []).includes('CML') && !/governing CML/.test(p.evidence)) p.evidence += ' · does not cover the governing CML: no effect on the assessment'; }
    // Expected failures to the horizon for both plans, Model's own cost-of-risk metric (expected failure events × consequence).
    // Each task that lowers the curve restarts the count: the cumulative failure probability reached just before such a drop is
    // one expected-failure fraction, plus what is reached at the horizon. The current plan reads Model's stored curve (level
    // ladders per event); the proposed plan reads the chain's Weibull segments. Both are reported; nothing is rejected on it.
    if (base) {
      const levelAt = (ladder, d) => { let v = 0; if (ladder) for (let i = 0; i < M.levels.length; i++) if (ladder[i] != null && ladder[i] <= d) v = M.levels[i]; return v; };
      const ladderAt = d => { let ladder = a.q; for (const e of events) if (e.day <= d && e.qMitAfter) ladder = e.qMitAfter; return ladder; };
      const expectedStored = () => { let sum = 0; const days = events.filter(e => e.day > tIdx && e.day <= horizonIdx && e.qMitAfter).map(e => e.day); for (const d of days) { const before = levelAt(ladderAt(d - 1), d - 1), after = levelAt(ladderAt(d), d); if (after < before - 1e-9) sum += before; } return sum + levelAt(ladderAt(horizonIdx), horizonIdx); };
      const expectedModelled = segs => { let sum = 0, seg = state0; const sorted = segs.filter(x => x.seg && x.from >= tIdx && x.from <= horizonIdx).sort((x, y) => x.from - y.from); for (const x of sorted) { const before = F(seg, x.from - 1), after = F(x.seg, x.from); if (after < before - 1e-9) sum += before; seg = x.seg; } return sum + F(seg, horizonIdx); };
      const propSegs = out.proposed.map(p => ({ from: daysBetween(start, p.date), seg: p.params }));
      // both plans are counted on the same modelled curve (Model's stored post-task fits for the current plan, the chain's segments for the proposed plan), which are identical until the first change; the stored ladder is only the fallback when the current plan has no fitted segment
      const curSegs = (out.current?.segments || []).map(x => ({ from: x.from, seg: x.seg }));
      const eCur = expectedModelled(curSegs), eProp = out.proposed.some(p => !p.kept) ? expectedModelled(propSegs) : eCur;
      out.expected = { failuresCur: eCur, failuresProp: eProp, econCur: eCur * (a.cofEcon || 0), econProp: eProp * (a.cofEcon || 0), hseCur: eCur * (a.cofHse || 0), hseProp: eProp * (a.cofHse || 0) };
    }
    // (only when every change of the proposed plan is on the rows; a task the rows cannot place keeps the whole plan on the effect model)
    if (rm && limitOf && !out.proposed.some(p => !p.kept && !/Model calculation rows/.test(p.evidence || ''))) {
      // on Model's calculation rows, for both plans: expected failures (PoF just before each drop at a task, plus PoF at the horizon)
      // and days above the limit from today to the horizon (weekly steps, as the solver compares them)
      const measure = apps => {
        const rs = rowSegments(rm, apps), drops = new Set();
        for (const { segs } of rs) for (const s of segs) if (s.at > tIdx && s.at <= horizonIdx) drops.add(s.at);
        let failures = 0;
        for (const d of drops) { const before = rowPof(rs, d - 1), after = rowPof(rs, d); if (after < before - 1e-9) failures += before; }
        failures += rowPof(rs, horizonIdx);
        let days = 0; for (let d = tIdx; d <= horizonIdx; d += 7) if (rowPof(rs, d) >= limitOf.at(d)) days += 7;
        return { failures, days };
      };
      const mc = measure(curApps), mp = out.proposed.some(p => !p.kept) ? measure(rmApps) : mc;
      out.expected = { failuresCur: mc.failures, failuresProp: mp.failures, econCur: mc.failures * (a.cofEcon || 0), econProp: mp.failures * (a.cofEcon || 0), hseCur: mc.failures * (a.cofHse || 0), hseProp: mp.failures * (a.cofHse || 0), rows: true };
      out.daysAbove = mp.days; out.daysAboveCurrent = mc.days;
    }
    const subst = out.proposed.some(p => p.substituted);
    out.feasibility = !base ? 'no Weibull fit' : out.cannotClear ? 'cannot be cleared (engineering scope)' : subst ? 'needs renewal' : engineering ? 'engineering scope' : future.length ? 'schedulable' : 'uncovered';
    const n = out.currentNext, p = out.proposed.find(x => !x.kept) || null;
    if (out.cannotClear && !out.proposed.some(x => !x.kept)) out.action = 'Engineering scope';
    else if (!p) out.action = n ? 'Keep' : 'No action';
    else if (p.kept) out.action = 'Keep';
    // a shifted task is a pull-in / defer measured against its own current date; a copy is an added task, never a shift
    else if (p.moved && p.movedFrom) { const d = daysBetween(p.movedFrom, p.date); out.deltaDays = d; out.action = Math.abs(d) <= S.keepTolerance ? 'Keep' : d < 0 ? 'Pull in' : 'Defer'; }
    else out.action = subst ? 'Add renewal' : 'Add task';
    if (subst && !p?.kept && out.action === 'Keep') out.action = 'Add renewal';
    return out;
  }

  // ---- whole model
  function run(M, S, bundles) {
    const windowsByUnit = {};
    for (const w of M.windows) if (w.start) (windowsByUnit[w.unitId] ||= []).push(w);
    for (const k in windowsByUnit) windowsByUnit[k].sort((a, b) => a.start.localeCompare(b.start));
    const assets = Object.fromEntries(M.assets.map(a => [a.id, a]));
    const T = M._transforms || (M._transforms = measureTransforms(M));
    if (!M._taskByNumber) M._taskByNumber = new Map((M.costTasks || []).map(t => [t.assetId + '|' + t.number, t]));
    const results = [];
    const costsByAssessment={};
    for(const t of M.costTasks||[])for(const id of t.credit||[])(costsByAssessment[id]||=[]).push(t);
    const pricedByBundle={}; for(const t of M.costTasks||[]) if(t.bundle&&t.cost!=null&&t.cost>0&&t.statusCode!==5) (pricedByBundle[t.bundle]||=[]).push(t.cost);
    const medianByBundle=Object.fromEntries(Object.entries(pricedByBundle).map(([b,xs])=>{xs.sort((x,y)=>x-y);return [b,{cost:xs[Math.floor(xs.length/2)],n:xs.length}];}));
    M._ctx = { windowsByUnit, T, costsByAssessment, medianByBundle };
    for (const a of M.assessments) {
      a.unitId = assets[a.assetId]?.unitId; a.asset = assets[a.assetId];
      results.push(analyseOne(a, M, S, bundles));
    }
    // asset visit plan: outage placements are visits; an outage-type proposal with exposure > 0 is a breach that no visit covers in time
    const byAsset = {};
    for (const r of results) (byAsset[r.a.assetId] ||= []).push(r);
    for (const id in byAsset) {
      const rs = byAsset[id];
      // Co-located scopes share a visit, never a pooled risk effect.
      const jobs=new Map();
      for(const r of rs)for(const p of r.proposed){const key=p.date; if(!jobs.has(key))jobs.set(key,[]);jobs.get(key).push({assessmentId:r.id,scope:p.scope,evidence:p.evidence,creditedAssessmentIds:p.creditedAssessmentIds});}
      for(const r of rs)for(const p of r.proposed)p.visitScopes=jobs.get(p.date);
      const visits = [...new Set(rs.flatMap(r => r.proposed.filter(p => p.execution !== 'online').map(p => p.date)))].sort();
      for (const r of rs) r.visitPlan = { visits, exposures: r.proposed.filter(p => p.exposureDays > 0), online: r.proposed.filter(p => p.execution === 'online').map(p => p.date) };
      // governing margin among assessment-grain future breaches
      const fut = rs.filter(r => r.a.grain === 'Assessment' && r.b0Date && !r.alreadyBreached).sort((x, y) => x.b0Date.localeCompare(y.b0Date));
      for (const r of rs) {
        if (r.alreadyBreached) r.governingMargin = { alreadyBreached: true };
        else if (!r.b0Date) r.governingMargin = null;
        else if (r.a.grain !== 'Assessment') r.governingMargin = { fallback: true, governingAssessment: fut[0]?.a.component, governingBreach: fut[0]?.b0Date };
        else if (fut[0] === r) r.governingMargin = { governs: true, runnerUp: fut[1]?.a.component, runnerUpBreach: fut[1]?.b0Date, marginDays: fut[1] ? daysBetween(r.b0Date, fut[1].b0Date) : null };
        else r.governingMargin = { governs: false, governingAssessment: fut[0].a.component, governingBreach: fut[0].b0Date, marginDays: daysBetween(fut[0].b0Date, r.b0Date) };
      }
    }
    return { results, windowsByUnit, assets, byAsset, transforms: T };
  }

  // one assessment with task prices, reusing the context of the last run(): used by run() and by the check engine's re-planning
  function analyseOne(a, M, S, bundles) {
    const { windowsByUnit, T, costsByAssessment } = M._ctx;
    const r = analyse(a, M, S, windowsByUnit, bundles, T); r.a = a;
    const costs=costsByAssessment[a.id]||[];
    r.currentCostTasks=costs.filter(t=>t.date>=M.today&&t.date<=S.horizon&&![1,4,5].includes(t.statusCode));
    // price each proposed task from its own Model task(s): a kept or shifted task by its task numbers (a kept event without numbers by
    // its date range), a copy by the task it copies; a type estimate only when neither exists. A Model task is priced once per
    // assessment even when a date is split into the governing-CML task and the other tasks.
    const used=new Set(), byNumbers=nums=>costs.filter(t=>(nums||[]).includes(t.number)&&!used.has(t.id));
    for(const p of r.proposed){
      const event=a.events.find(e=>e.date===p.date);
      let matches, basis;
      if(p.kept||p.moved){ matches=p.taskNumbers?.length?byNumbers(p.taskNumbers):r.currentCostTasks.filter(t=>t.date>=p.date&&t.date<=(event?.endDate||p.date)&&!used.has(t.id)); basis=p.moved?'Stored cost of the shifted task':'Stored task cost'; }
      else if(p.copyOf?.taskNumbers?.length){ matches=costs.filter(t=>p.copyOf.taskNumbers.includes(t.number)); basis='Stored cost of the copied task'; }
      else {
        // a new task of a type this assessment has no task of: Model has no price for it, so it is estimated from Model's prices of that
        // type: the assessment's latest, else the asset's latest, else the facility median (labelled as such)
        const latest=xs=>xs.filter(t=>t.bundle===p.bundle&&t.cost!=null&&t.statusCode!==5).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,1);
        matches=latest(costs); basis='Estimate from the latest task of the same type';
        if(!matches.length){ matches=latest(M.costTasks.filter(t=>t.assetId===a.assetId)); basis='Estimate from the latest task of the same type on this asset'; }
        if(!matches.length){ const med=M._ctx.medianByBundle?.[p.bundle]; if(med){ matches=[{id:'median:'+p.bundle,cost:med.cost}]; basis=`Estimate: median Model price of ${p.bundle} (${med.n} priced tasks)`; } }
      }
      if(p.kept||p.moved)for(const t of matches)used.add(t.id);
      p.costItems=matches.map(t=>({key:p.date+'|'+t.id,value:t.cost}));
      // Model's price of every task on the date that has one (e.g. an API internal with its unpriced conditional-repair tasks is the
      // internal's price); null only when none of them is priced. The unpriced tasks are listed, never counted as a price.
      const priced=matches.filter(t=>t.cost!=null);
      p.unpricedTasks=matches.filter(t=>t.cost==null).map(t=>t.number);
      p.cost=priced.length?priced.reduce((s,t)=>s+t.cost,0):null;
      p.costBasis=matches.length?(p.cost==null?basis+' (no price in Model)':p.unpricedTasks.length?basis+` (${p.unpricedTasks.length} of ${matches.length} tasks have no price in Model)`:basis):(p.kept||p.moved)&&p.taskNumbers?.length&&(p.taskNumbers||[]).every(n=>!costs.some(t=>t.number===n))?'Task not priced in Model':'No matching task price';
    }
    return r;
  }

  // ---- analytic curve sampled at the LVC x days (index from curve start) for a list of segments [{from, seg}]
  function sampleSegments(days, base, segments, untilIdx) {
    const out = new Array(days.length).fill(null);
    for (let i = 0; i < days.length; i++) {
      const d = days[i]; let seg = base;
      for (const s of segments) if (d >= s.from) seg = s.seg; else break;
      if (!seg) continue;
      if (untilIdx != null && d > untilIdx) break;
      out[i] = F(seg, d);
    }
    return out;
  }
  return { rowModelOf, rowSegments, rowPof, rowBreach, analyseOne, refinedCrossing, poolGroup, poolAllows, DAY, ms, iso, addDays, daysBetween, F, crossing, quantileDay, inspect, renewal, measured, applyEffect, measureTransforms, transformFor, storedCrossing, governing, analyse, run, sampleSegments, eligibleBundles, planBundle, DEFAULT_BUNDLES, DEFAULT_SETTINGS, windowAt };
})();
