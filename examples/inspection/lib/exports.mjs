// Excel exports: Model task import workbook (every asset) and the granular cost-benefit report (every assessment).
// Both read the worker's classification (bucket, reason, holds) so the files say exactly what the page says.
import { holdsOf } from './labels.mjs';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const short = c => (c || '').split(' | ').slice(1).join(' · ') || c || '';
const dt = d => d + ' 09:00:00';
const plusDays = (d, n) => new Date(Date.parse(d.slice(0, 10) + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((Date.parse(b.slice(0, 10)) - Date.parse(a.slice(0, 10))) / 864e5);
// a task's day within its event (e.g. Model's conditional repair the day after the inspection) is kept when the event is copied or moved
const offsetIn = (eventDate, taskDate) => eventDate && taskDate ? Math.max(0, Math.min(7, dayDiff(eventDate, taskDate))) : 0;

function loadJsZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  return new Promise((resolve, reject) => { const s = document.createElement('script'); s.src = '/examples/inspection/jszip.min.js'; s.onload = () => resolve(window.JSZip); s.onerror = () => reject(Error('The spreadsheet library could not be loaded.')); document.head.appendChild(s); });
}
const colName = c => { let s = ''; c++; while (c) { const m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = Math.floor((c - 1) / 26); } return s; };
function cell(v, r, c) {
  if (v == null || v === '' || (typeof v === 'number' && !Number.isFinite(v))) return '';
  const ref = colName(c) + r, style = r === 1 ? ' s="1"' : '';
  if (typeof v === 'number') return `<c r="${ref}"${style}><v>${v}</v></c>`;
  if (typeof v === 'boolean') return `<c r="${ref}" t="inlineStr"${style}><is><t>${v ? 'TRUE' : 'FALSE'}</t></is></c>`;
  return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
}
const sheetXml = (rows, header) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${header ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' : ''}<sheetData>${rows.map((row, i) => `<row r="${i + 1}">${row.map((v, c) => cell(v, i + 1, c)).join('')}</row>`).join('')}</sheetData>${header && rows[0]?.length ? `<autoFilter ref="A1:${colName(rows[0].length - 1)}${Math.max(1, rows.length)}"/>` : ''}</worksheet>`;
export async function buildXlsx(sheets) {
  const JSZip = await loadJsZip(), zip = new JSZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`);
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`);
  sheets.forEach((s, i) => zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml(s.rows, s.header !== false)));
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
export function saveBlob(blob, name) { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); }

// one task per (asset, date, task or type): the union of the assessments whose chains asked for it
export function proposedTasksForAsset(results) {
  const groups = new Map();
  for (const r of results) for (const p of r.proposed) {
    if (p.kept) continue;
    // a shift is one task; a copy is one per source task (each copy carries its own source's CMLs, so two plans copying different tasks
    // of the same type on one date are two tasks); a new task of a type with no source is one per type
    const key = p.date + '|' + (p.moved && p.taskNumbers?.length ? p.taskNumbers.join('+') : p.copyOf?.taskNumbers?.length ? p.bundle + '<' + p.copyOf.taskNumbers.join('+') : p.bundle);
    if (!groups.has(key)) groups.set(key, { key, date: p.date, bundle: p.bundle, window: p.window, execution: p.execution, drivers: [], evidence: new Set(), cost: null, exposure: 0, replaces: new Set(), movedFrom: p.movedFrom || null, definitions: p.definitions || [], copyOf: p.copyOf || null, params: p.params });
    const g = groups.get(key);
    g.drivers.push({ r, p }); if (p.evidence) g.evidence.add(p.evidence); if (p.cost != null && g.cost == null) g.cost = p.cost; g.exposure = Math.max(g.exposure, p.exposureDays || 0);
    if (p.moved) for (const n of p.taskNumbers || []) g.replaces.add(n);
    if (!g.copyOf && p.copyOf) g.copyOf = p.copyOf;
  }
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function exportModelWorkbook({ run, template, costTasks, userLinks, fetchCurves, label, taskRows }) {
  const T = template, H = T.headers, tasks = [], links = [], steps = [], held = [];
  // every Model task as a complete import row with its CML links and steps (models/taskrows-<sid>.json.gz), keyed "<asset id>|<task number>"
  const full = (aid, num) => taskRows?.tasks?.[`${aid}|${num}`] || null;
  const noteOf = (...parts) => parts.filter(Boolean).join(' | ');
  // a task with an upgraded Weibull (Upgrade - Eta / Beta / Gamma) is imported with Rate After Replacement = Upgrade
  const pushRow = row => { if (!row['Failure Mode'] && / - Repair Cracks If Found/.test(row['Task Number'] || '')) row['Failure Mode'] = 'Cracking/Metallurgical'; if (!row['Rate After Replacement'] && ['Upgrade - Eta (years)', 'Upgrade - Beta', 'Upgrade - Gamma (years)'].some(k => row[k] != null)) row['Rate After Replacement'] = 'Upgrade'; tasks.push(H.Tasks.map(c => row[c])); };
  const draftIds = new Set(run.drafts?.ids || (run.drafts?.list || []).map(d => d.id));
  // Model tasks by asset and number: task numbers repeat across assets (e.g. "REPLACE" on 1,191 assets)
  const byKey = new Map((costTasks || []).map(t => [t.assetId + '|' + t.number, t])), taskOf = (aid, num) => byKey.get(aid + '|' + num);
  // a new task has no source to copy: its Task Definition is Model's own definition name for that task type (the most used one on
  // the asset, else in the scenario), never the optimizer's type label ("API internal" is not a Model definition)
  const defCount = (tasks, bundle) => { const n = new Map(); for (const t of tasks) if (t.bundle === bundle && t.definition) n.set(t.definition, (n.get(t.definition) || 0) + 1); return [...n].sort((a, b) => b[1] - a[1])[0]?.[0] || null; };
  const scenarioDef = new Map();
  const definitionFor = (aid, bundle) => defCount((costTasks || []).filter(t => t.assetId === aid), bundle) || (scenarioDef.has(bundle) ? scenarioDef.get(bundle) : scenarioDef.set(bundle, defCount(costTasks || [], bundle)).get(bundle));
  const byAsset = new Map();
  for (const r of run.results) if (r.a.scope === 'fixed') { if (!byAsset.has(r.a.assetId)) byAsset.set(r.a.assetId, []); byAsset.get(r.a.assetId).push(r); }
  const assets = new Map(run.assets.map(a => [a.id, a]));
  const scenario = run.scenarioName || 'Current', note = `Task Timing Optimizer (${scenario}, as of ${run.today})`;
  for (const [aid, rs] of byAsset) {
    const asset = assets.get(aid), aById = Object.fromEntries(rs.map(r => [r.id, r.a]));
    // a task crediting a cracking assessment is imported with Failure Mode = Model's "Cracking/Metallurgical" when it has none
    const crackingFailureMode = (row, ids) => { if (!row['Failure Mode'] && ids.some(id => aById[id]?.category === 'Cracking/Metallurgical')) row['Failure Mode'] = 'Cracking/Metallurgical'; };
    const groups = proposedTasksForAsset(rs);
    let curveCache = null;
    const curveTasks = async () => curveCache ||= new Map(fetchCurves ? ((await fetchCurves(aid))?.tasks || []).map(t => [t.number, t]) : []);
    const made = new Map(); // copy task number → assessments already linked (one row per number)
    const updatedNums = new Set(groups.flatMap(g => [...g.replaces])); // Model tasks this sheet moves to another date
    // a new task at g.date copied from current-plan task srcNum (null = a new task of g's type), credited to `credited`
    const pushCopy = async (g, srcNum, credited, what, evidence, tail) => {
      const src = srcNum ? { ...(taskOf(aid, srcNum) || {}), ...((await curveTasks()).get(srcNum) || {}) } : {};
      const def = src.definition || g.copyOf?.definitions?.[0] || g.definitions[0] || definitionFor(aid, g.bundle) || g.bundle, meta = T.definitions?.[def] || {};
      // the whole source number (Model's TaskNumber holds 255 characters): cut short, "... - Repair Cracks If Found - <mechanism>" tasks collided
      let number = `${srcNum ? srcNum.replace(/\s+/g, ' ').slice(0, 230) + ' - COPY' :'TTO-' + g.bundle.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase()}-${g.date}`;
      const base = srcNum ? full(aid, srcNum) : null;
      const when = plusDays(g.date, srcNum ? offsetIn(g.copyOf?.date || g.movedFrom, src.date) : 0);
      // the sheet is built from the scenario as extracted, as if nothing had been imported since; reconciling with what is in Model now
      // is done outside the optimizer. Only a clash inside this sheet (a task this sheet moves has the same number) gets " #2".
      if (!made.has(number) && updatedNums.has(number)) { const stem = number; let i = 2; while (updatedNums.has(`${stem} #${i}`) || made.has(`${stem} #${i}`)) i++; number = `${stem} #${i}`; }
      const linkCredits = ids => {
        // Spot UT / RT and other CML tasks: the copy covers the CMLs its source covers, on the component of each assessment it credits
        for (const id of ids) {
          const own = (base?.cmls || []).filter(c => !aById[id]?.componentId || !c.componentId || c.componentId === String(aById[id].componentId).toLowerCase());
          if (own.length) for (const c of own) links.push(['Add', asset?.clientId, aById[id]?.clientId || aById[id]?.component, number, c.type || 'Thickness', c.clientId]);
          else links.push(['Add', asset?.clientId, aById[id]?.clientId || aById[id]?.component, number, null, null]);
        }
      };
      if (made.has(number)) { const seen = made.get(number), extra = credited.filter(id => !seen.has(id)); extra.forEach(id => seen.add(id)); linkCredits(extra); return number; }
      made.set(number, new Set(credited));
      const row = Object.fromEntries(H.Tasks.map(c => [c, null]));
      Object.assign(row, { 'Action': 'Add', 'Asset Client ID': asset?.clientId, 'Task Number': number, 'Task Definition': def, 'Task Description': src.description || `${def} · ${g.bundle} · ${g.window}`,
        'Task Type': src.taskType || meta.taskType || 'Predictive - Condition Monitoring', 'Regulatory?': src.regulatory ? 'TRUE' : 'FALSE', 'Target': 'Assessment', 'Damage Mode': 'N/A', 'Damage Location': 'N/A', 'Implementation Status': 'Planned', 'Start Date': dt(when), 'Prevent Task Optimization Override?': 'FALSE',
        'Total Duration Hours': src.durationHours ?? meta.medDurationH ?? null, 'Total Downtime Hours': src.downtimeHours ?? (g.execution === 'outage' ? meta.medDowntimeH ?? null : 0), 'Total Cost ($)': srcNum ? src.cost ?? null : g.cost ?? meta.medCost ?? null,
        'Notes': `${note}: ${what}; ${g.execution}, window ${g.window}; credits ${credited.length} assessment(s); effect ${evidence}${tail}` });
      if (base) {
        // a copy is the source task as Model has it, as a new planned task: its own ID, dates, work-order numbers and audit fields cleared
        const keepNote = row['Notes'];
        Object.assign(row, base.row, { 'Action': 'Add', 'Asset Client ID': asset?.clientId || base.row['Asset Client ID'], 'Task CRS ID': null, 'Task Number': number, 'Start Date': dt(when), 'Completion Date': null,
          'Implementation Status': 'Planned', 'CMMS Number': null, 'IDMS Number': null, 'Created': null, 'Created By': null, 'Benefit Cost Ratio': null, 'Notes': keepNote });
        if (row['Total Cost ($)'] == null) row['Total Cost ($)'] = src.cost ?? null;  // Model's own price of the source; an unpriced source (e.g. a conditional repair) stays unpriced
      }
      crackingFailureMode(row, credited);
      pushRow(row);
      linkCredits(credited);
      if (base?.steps?.length) for (const st of base.steps) steps.push(['Add', asset?.clientId, number, null, st.critical ? 'TRUE' : 'FALSE', st.description, st.durationHours, st.downtimeHours, st.laborCost, st.materialCost, st.executor, st.notes, st.sortOrder]);
      else steps.push(['Add', asset?.clientId, number, null, 'FALSE', def, src.durationHours ?? meta.medDurationH ?? null, src.downtimeHours ?? (g.execution === 'outage' ? meta.medDowntimeH ?? null : 0), srcNum ? src.cost ?? null : g.cost ?? meta.medCost ?? null, 0, null, null, 0]);
      return number;
    };
    // Cracking: Model credits an inspection's repair through a separate "<inspection> - Repair Cracks If Found" task the day after it
    // (Inspection and Conditional Repair If Damage Found, Rate After Replacement = Upgrade, Upgrade Eta / Beta = the assessment's Stage1
    // Weibull, Gamma blank). An API internal this sheet adds or moves for a cracking assessment without such a task gets one, exactly so.
    const addRepairs = (g, credited, mainNumber, srcNums) => {
      if (!mainNumber || g.bundle !== 'API internal') return;
      const need = credited.map(id => rs.find(r => r.id === id)).filter(r => r && r.a.category === 'Cracking/Metallurgical' && r.a.upgradeWeibull?.etaYears > 0 && r.a.upgradeWeibull?.beta > 0)
        .filter(r => !srcNums.some(n => n && taskOf(aid, n)?.upgrade && (taskOf(aid, n).credit || []).includes(r.id)));
      const byW = new Map();
      for (const r of need) { const w = r.a.upgradeWeibull, k = [w.etaYears, w.beta, w.gammaYears ?? ''].join('|'); if (!byW.has(k)) byW.set(k, []); byW.get(k).push(r); }
      for (const group of byW.values()) {
        const w = group[0].a.upgradeWeibull, mechs = [...new Set(group.map(r => r.a.mechanism).filter(Boolean))];
        const number = (mainNumber + ' - Repair Cracks If Found' + (byW.size > 1 ? ' - ' + mechs.join(', ') : '')).slice(0, 255);
        if (made.has(number)) { const seen = made.get(number); for (const r of group) if (!seen.has(r.id)) { seen.add(r.id); links.push(['Add', asset?.clientId, r.a.clientId || r.a.component, number, null, null]); } continue; }
        made.set(number, new Set(group.map(r => r.id)));
        const row = Object.fromEntries(H.Tasks.map(c => [c, null]));
        Object.assign(row, { 'Action': 'Add', 'Asset Client ID': asset?.clientId, 'Task Number': number, 'Task Definition': 'Inspection and Conditional Repair If Damage Found', 'Task Description': 'Task created to give credit for repairs if cracking is identified.',
          'Task Type': 'Corrective - Replacement', 'Regulatory?': 'FALSE', 'Target': 'Assessment', 'Failure Mode': 'Cracking/Metallurgical', 'Damage Mode': 'N/A', 'Damage Location': 'N/A', 'Implementation Status': 'Planned', 'Start Date': dt(plusDays(g.date, 1)), 'Prevent Task Optimization Override?': 'FALSE',
          'Rate After Replacement': 'Upgrade', 'Upgrade - Eta (years)': w.etaYears, 'Upgrade - Beta': w.beta, 'Upgrade - Gamma (years)': w.gammaYears ?? null,
          'Notes': `${note}: conditional repair for ${mainNumber} on the day after it; upgraded Weibull = Model's Stage1 Weibull of ${mechs.join(', ')} (β ${w.beta}, η ${w.etaYears} y, γ blank)` });
        pushRow(row);
        for (const r of group) links.push(['Add', asset?.clientId, r.a.clientId || r.a.component, number, null, null]);
      }
    };
    for (const g of groups) {
      // every proposed task is imported, the plan exactly as the page shows it; a review hold is written into the task's notes and listed
      // on the "Flags and holds" sheet to check, it no longer leaves the task out
      const exportable = g.drivers;
      // review holds and the no-harm flag of every assessment this task serves, written out in full in the task's notes
      const flagged = [...new Map(g.drivers.map(d => [d.r.id, d.r])).values()].flatMap(r => [...(r.holds || []), ...(r.notes2 || []).filter(n => n.code === 'portfolio' && r.expected && r.expected.failuresProp > r.expected.failuresCur + 1e-9)].map(h => ({ r, h })));
      const holdText = [...new Set(flagged.map(({ h }) => h.label))].join('; ');
      if (holdText) held.push({ asset: asset?.name, date: g.date, bundle: g.bundle, holds: holdText, assessments: [...new Set(flagged.map(({ r }) => short(r.a.component)))].join('; ') });
      const flagNotes = flagged.map(({ r, h }) => `${h.code === 'portfolio' ? 'FLAG' : 'REVIEW HOLD'} (${short(r.a.component)}): ${h.label}. ${h.detail || ''}`.trim()).join(' | ');
      const credited = [...new Set(exportable.map(d => d.r.id))], p0 = exportable[0].p, evidence = [...g.evidence].join('; ');
      const tail = (p0.breachBefore ? `; precedes breach ${p0.breachBefore}` : '') + (p0.life != null ? `; modelled life after ${p0.life} d` : '') + (g.exposure ? `; exposure ${g.exposure} d` : '') + (flagNotes ? ` || ${flagNotes}` : '');
      if (g.replaces.size) {
        const movers = new Set(credited);
        let shiftMain = null;
        for (const num of g.replaces) {
          const existing = taskOf(aid, num) || (await curveTasks()).get(num);
          // Who else relies on the task where it is now: every other assessment Model credits it to (kept by its own plan, held for review,
          // shifted elsewhere by another assessment, or not optimized, e.g. interval assessments), drafts aside, plus any plan here that keeps it.
          const stays = new Set((existing?.credit || []).filter(id => !movers.has(id) && !draftIds.has(id)));
          for (const r of rs) if (!movers.has(r.id) && r.proposed.some(p => p.kept && (p.taskNumbers || []).includes(num))) stays.add(r.id);
          if (stays.size) {
            // shifting it would take the task away from those assessments: keep the original (with every link, the shifting assessments'
            // included) and add a copy on the new date. The engine does this itself for shared tasks, so this only catches a plan whose
            // co-shifting assessment is held for review.
            const copied = await pushCopy(g, num, credited, `copy of shared task ${num} (${g.movedFrom}; the original stays, linked to ${stays.size} other assessment(s) that need it)`, evidence, tail);
            shiftMain ||= copied;
            continue;
          }
          shiftMain ||= num;
          const row = Object.fromEntries(H.Tasks.map(c => [c, null])), base = full(aid, num);
          if (base) Object.assign(row, base.row);
          Object.assign(row, { 'Action': 'Update', 'Asset Client ID': asset?.clientId || row['Asset Client ID'], 'Task CRS ID': row['Task CRS ID'] || existing?.id || null, 'Task Number': num, 'Task Definition': row['Task Definition'] || existing?.definition || g.definitions[0] || g.bundle, 'Start Date': dt(plusDays(g.date, offsetIn(g.movedFrom, existing?.date))), 'Notes': noteOf(base?.row?.Notes, `${note}: moved from ${g.movedFrom} to ${g.date} (${g.window}, ${g.execution}); credits ${credited.length} assessment(s); effect ${evidence}${tail}`) });
          crackingFailureMode(row, credited);
          pushRow(row);
          for (const id of credited) if (!(existing?.credit || []).includes(id)) links.push(['Add', asset?.clientId, aById[id]?.clientId || aById[id]?.component, num, null, null]);
        }
        addRepairs(g, credited, shiftMain, [...g.replaces]);
        continue;
      }
      const srcNums = g.copyOf?.taskNumbers?.length ? g.copyOf.taskNumbers : [null];
      let mainNumber = null;
      for (const srcNum of srcNums) { const made1 = await pushCopy(g, srcNum, credited, srcNum ? 'copy of current-plan task ' + srcNum + (g.copyOf?.date ? ' (' + g.copyOf.date + ')' : '') : 'new task', evidence, tail); mainNumber ||= made1; }
      addRepairs(g, credited, mainNumber, srcNums);
    }
    for (const t of (userLinks?.added || []).filter(t => t.assetId === aid)) {
      const meta = T.definitions?.[t.definition] || {}, row = Object.fromEntries(H.Tasks.map(c => [c, null]));
      Object.assign(row, { 'Action': 'Add', 'Asset Client ID': asset?.clientId, 'Task Number': t.number, 'Task Definition': t.definition, 'Task Description': t.definition, 'Task Type': meta.taskType || 'Predictive - Condition Monitoring', 'Regulatory?': 'FALSE', 'Target': 'Assessment', 'Damage Mode': 'N/A', 'Damage Location': 'N/A', 'Implementation Status': 'Planned', 'Start Date': dt(t.date), 'Prevent Task Optimization Override?': 'FALSE', 'Total Duration Hours': meta.medDurationH ?? null, 'Total Downtime Hours': t.downtimeHours ?? meta.medDowntimeH ?? null, 'Total Cost ($)': t.cost ?? null, 'Notes': 'Added in the Task Timing Optimizer' });
      pushRow(row);
      for (const id of t.credit || []) if (aById[id]) links.push(['Add', asset?.clientId, aById[id].clientId || aById[id].component, t.number, null, null]);
      steps.push(['Add', asset?.clientId, t.number, null, 'FALSE', t.definition, meta.medDurationH ?? null, t.downtimeHours ?? null, t.cost ?? null, 0, null, null, 0]);
    }
    for (const [num, ids] of Object.entries(userLinks?.addedCredits || {})) { const t = taskOf(aid, num); if (!t) continue; for (const id of ids) if (aById[id]) links.push(['Add', asset?.clientId, aById[id].clientId || aById[id].component, num, null, null]); }
    for (const [id, nums] of Object.entries(userLinks?.removedCredits || {})) { if (!aById[id]) continue; for (const num of nums) links.push(['Delete', asset?.clientId, aById[id].clientId || aById[id].component, num, null, null]); }
  }
  const pl = T.pickLists || {}, keys = Object.keys(pl), plRows = [keys], plMax = Math.max(0, ...keys.map(k => pl[k].length));
  for (let i = 0; i < plMax; i++) plRows.push(keys.map(k => pl[k][i] ?? null));
  const downtime = run.windows.map(w => [null, w.unitClientId, w.id, w.name, w.type === 1 ? 'Turnaround' : 'Planned Outage', w.description || null, w.start ? dt(w.start) : null, w.productionImpact ?? null, w.durationRaw ?? w.durationDays ?? null, 'Days', w.lockdown ? dt(w.lockdown) : null]);
  const heldRows = [['Asset', 'Date', 'Task type', 'Flags and holds', 'Assessments', 'Imported'], ...held.map(h => [h.asset, h.date, h.bundle, h.holds, h.assessments, 'yes (listed in full in the task notes)'])];
  const blob = await buildXlsx([{ name: 'Tasks', rows: [H.Tasks, ...tasks] }, { name: 'Assessments & CMLs', rows: [H['Assessments & CMLs'], ...links] }, { name: 'Steps', rows: [H.Steps, ...steps] }, { name: 'Prerequisite Tasks', rows: [H['Prerequisite Tasks']] }, { name: 'Planned Downtime', rows: [H['Planned Downtime'], ...downtime] }, { name: 'Pick Lists', rows: plRows }, { name: 'Flags and holds', rows: heldRows }]);
  const name = `Model task import - ${scenario} - ${label ? String(label).replace(/[^\w-]+/g, '_').slice(0, 40) : 'all assets'} - ${run.today}.xlsx`;
  saveBlob(blob, name);
  return { name, tasks: tasks.length, links: links.length, steps: steps.length, held: held.length };
}

export async function exportCostBenefitWorkbook({ run, settings }) {
  const rs = run.results, rowsA = [], rowsT = [], rowsN = [], byAsset = new Map(), byUnit = new Map(), byBucket = new Map();
  for (const r of rs) {
    for (const c of r.sampleData || []) rowsN.push([r.a.asset?.unit, r.a.asset?.name, r.a.asset?.clientId, short(r.a.component), r.a.category || '', r.a.mechanism || '', c.label, c.detail, r.bucket, r.a.url || '']);
    const cb = r.costBenefit || {}, x = r.expected || {}, w = r.worstCml, m = r.gov?.measure, changes = r.proposed.filter(p => !p.kept), first = changes[0];
    const delta = cb.current != null && cb.proposed != null ? cb.proposed - cb.current : null;
    const holds = holdsOf(r);
    rowsA.push([r.a.asset?.unit, r.a.asset?.name, r.a.asset?.clientId, short(r.a.component), r.a.category || '', r.a.mechanism || '', r.bucket, r.action, r.reason, r.feasibilityLabel || r.feasibility,
      (r.holds || []).map(h => h.label).join('; '), [...(r.notes2 || []).map(h => h.label), ...(r.checks || []).map(c => c.severity + ': ' + c.label)].join('; '), r.exportHold ? 'held' : changes.length ? 'exported' : 'no change',
      (m || '').toUpperCase(), m ? settings[m] : null, r.L ?? null, r.a.cofHse, r.a.cofEcon, r.a.today?.unmitHse, r.a.today?.unmitEcon, r.a.today?.mitHse, r.a.today?.mitEcon, r.b0Date || '', r.alreadyBreached ? 'yes' : 'no',
      w?.clientId || '', w?.beta ?? null, w?.eta ?? null, w?.gamma ?? null,
      x.failuresCur ?? null, x.failuresProp ?? null, x.failuresCur != null ? x.failuresCur - x.failuresProp : null, x.hseCur ?? null, x.hseProp ?? null, x.econCur ?? null, x.econProp ?? null,
      cb.current, cb.proposed, delta, cb.avoided, cb.net, r.proposed.filter(p => p.cost == null).length, cb.avoided != null && delta > 0 ? cb.avoided / delta : null,
      changes.length, first?.date || '', first ? (first.definitions?.[0] || first.bundle) : '', first ? (first.moved ? 'shift' : 'copy') : '', first?.movedFrom || '', (r.notes || []).join(' | ')]);
    const agg = (map, key, label) => {
      if (!map.has(key)) map.set(key, { label, n: 0, changed: 0, held: 0, eng: 0, cur: 0, opt: 0, avoided: 0, net: 0, unpricedRows: 0, fCur: 0, fOpt: 0 });
      const g = map.get(key); g.n++; g.changed += changes.length ? 1 : 0; g.held += r.exportHold ? 1 : 0; g.eng += r.bucket === 'Engineering scope' ? 1 : 0;
      g.cur += cb.current || 0; g.opt += cb.proposed || 0; g.unpricedRows += cb.unpriced || 0;
      g.avoided += cb.avoided || 0; g.net += cb.net || 0; g.fCur += x.failuresCur || 0; g.fOpt += x.failuresProp || 0;
    };
    agg(byAsset, r.a.assetId, [r.a.asset?.unit, r.a.asset?.name, r.a.asset?.clientId]); agg(byUnit, r.a.asset?.unit || '', [r.a.asset?.unit || '']); agg(byBucket, r.bucket, [r.bucket]);
    for (const p of r.proposed) rowsT.push([r.a.asset?.unit, r.a.asset?.name, short(r.a.component), r.bucket, (p.taskNumbers || []).join(', '), p.definitions?.[0] || p.bundle, p.bundle, p.kept ? 'kept as planned' : p.moved ? 'shifted' : 'copied (new task)', p.copyOf?.taskNumbers?.join(', ') || '', p.movedFrom || (p.kept ? p.date : ''), p.date, p.movedFrom ? Math.round((Date.parse(p.date) - Date.parse(p.movedFrom)) / 864e5) : null, p.window, p.execution, p.cost ?? null, p.costBasis || '', p.coversWorst === true ? 'yes' : (p.targets || []).includes('CML') ? 'no' : '', p.breachBefore || '', p.life ?? null, p.breachAfter || '', p.exposureDays || 0, p.params?.beta ?? null, p.params?.eta ?? null, p.params?.gamma ?? null, p.evidence || '', p.note || '', (r.holds || []).map(h => h.label).join('; ')]);
  }
  const G = ['Assessments', 'With changes', 'Held from export', 'Engineering scope', 'Task cost · current ($)', 'Task cost · proposed ($)', 'Task cost change ($)', 'Failure cost avoided ($)', 'Net benefit ($)', 'Unpriced proposed tasks', 'Expected failures · current', 'Expected failures · proposed'];
  const aggRows = map => [...map.values()].map(g => [...g.label, g.n, g.changed, g.held, g.eng, g.cur, g.opt, g.opt - g.cur, g.avoided, g.net, g.unpricedRows, g.fCur, g.fOpt]);
  const total = [...byUnit.values()].reduce((t, g) => { for (const k in g) if (typeof g[k] === 'number') t[k] = (t[k] || 0) + g[k]; return t; }, { label: ['All assessments in scope'] });
  const HA = ['Unit', 'Asset', 'Asset client ID', 'Assessment', 'Category', 'Mechanism', 'Bucket', 'Engine action', 'Why', 'Feasibility', 'Review holds (block export)', 'Notes and check engine', 'Export status', 'Governing measure', 'Risk threshold ($)', 'PoF limit (threshold ÷ CoF)', 'CoF HSE ($)', 'CoF ECON ($)', 'Unmitigated HSE risk today ($)', 'Unmitigated ECON risk today ($)', 'Current-plan HSE risk today ($)', 'Current-plan ECON risk today ($)', 'Breach date', 'Already breached', 'Governing CML', 'CML β', 'CML η (d)', 'CML γ (d)', 'Expected failures · current', 'Expected failures · proposed', 'Expected failures avoided', 'HSE failure cost · current ($)', 'HSE failure cost · proposed ($)', 'ECON failure cost · current ($)', 'ECON failure cost · proposed ($)', 'Task cost · current ($)', 'Task cost · proposed ($)', 'Task cost change ($)', 'Failure cost avoided (governing $)', 'Net benefit ($)', 'Unpriced proposed tasks', 'Avoided per extra $', 'Changes', 'First change date', 'First change task', 'First change type', 'First change moved from', 'Engine notes'];
  const HT = ['Unit', 'Asset', 'Assessment', 'Bucket', 'Task number(s)', 'Definition', 'Task type', 'Status in proposed plan', 'Copy of', 'Current date', 'Proposed date', 'Shift (d)', 'Window', 'Execution', 'Cost ($)', 'Cost basis', 'Covers governing CML', 'Breach before task', 'Life after task (d)', 'Breach after task', 'Exposure (d)', 'β after', 'η after (d)', 'γ after (d)', 'Effect evidence', 'Note', 'Review holds'];
  const method = [['Cost-benefit report · Task Timing Optimizer'], [`Scenario ${run.scenarioName || 'Current'} · as of ${run.today} · horizon ${settings.horizon} · HSE ${settings.hse} / ECON ${settings.econ} · margin ${settings.margin} d · scope ${settings.scope} · exported ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`], [],
    ['Bucket', 'What the proposed plan does (V1 engine): Pull in / Defer = an existing task moves; Add task = a current-plan task is copied; Keep = nothing changes; Engineering scope = no plan task clears the limit for the minimum useful life; No breach = under both limits to the horizon; No task/no default = nothing credits the assessment.'],
    ['Review holds', 'Expected failures rise (no-harm flag; informational since 2026-09-14: the proposed plan counts more expected failures on a linked assessment) and Shared-task date conflict (one task number proposed on different dates). Holds never change the bucket; they keep the change out of the Model import file.'],
    ['Notes', 'Plan ends at last TAR on file and Replacement review are informational only.'],
    ['Task cost', 'Current = Model costs of the kept and shifted tasks in the proposed plan (today..horizon). Proposed = the same tasks plus every copied task. Each task carries its own Model price (Task.TotalCostDollars, the sum of its steps); a date with several tasks costs the sum of the priced ones, and tasks Model has no price for (mostly Inspection and Conditional Repair If Damage Found) count $0 and are named in the cost basis. A copy costs the Model price of its source task. Asset and unit totals count each Model task once and each copy once.'],
    ['Expected failures', 'Sum of cumulative PoF just before each task that lowers the curve, plus PoF at the horizon, on the modelled curve: Model\'s stored post-task fits for the current plan and the chain\'s Weibull segments for the proposed plan (identical until the first change).'],
    ['Failure cost avoided', 'Expected failures avoided × consequence on the governing measure.'],
    ['Net benefit', 'Failure cost avoided − task cost change.'],
    ['Current plan', "Every breach date on the current plan is read from Model's stored mitigated risk curve at Model's thresholds (a breach = above either the HSE or the ECON limit). The model only answers where Model stores nothing: a changed plan, user-linked tasks, or other thresholds."],
    ['Model data', 'Places where Model\'s own data does not add up (missing or inconsistent consequence, no category, no stored post-task fit, unpriced tasks, ...). Results reflect Model as it is; these findings never change a result and are listed to be fixed in Model.']];
  const blob = await buildXlsx([
    { name: 'Summary', rows: [['Scope', ...G], aggRows(new Map([['all', total]]))[0], [], ['By bucket', ...G], ...aggRows(byBucket), [], ['By unit', ...G], ...aggRows(byUnit)] },
    { name: 'By asset', rows: [['Unit', 'Asset', 'Asset client ID', ...G], ...aggRows(byAsset)] },
    { name: 'By assessment', rows: [HA, ...rowsA] },
    { name: 'Tasks', rows: [HT, ...rowsT] },
    { name: 'Model data', rows: [['Unit', 'Asset', 'Asset client ID', 'Assessment', 'Category', 'Mechanism', 'Finding', 'Detail', 'Bucket', 'Model link'], ...rowsN] },
    { name: 'Method', rows: method, header: false }]);
  const name = `Cost-benefit report - ${run.scenarioName || 'Current'} - ${run.today}.xlsx`;
  saveBlob(blob, name);
  return { name, assessments: rowsA.length, tasks: rowsT.length, assets: byAsset.size };
}
