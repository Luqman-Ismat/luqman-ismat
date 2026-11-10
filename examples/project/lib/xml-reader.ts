/* A browser-side reader for Microsoft Project XML, used when no parser
   service is configured. It produces the same shape the service returns, so
   the hierarchy mapper and the version comparison work unchanged. MPP files
   (binary) still need the service. */
const hours = (iso: string | null) => {
  if (!iso) return 0;
  const m = /PT(\d+)H(\d+)M/.exec(iso);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};
const text = (el: Element, tag: string) => el.getElementsByTagName(tag)[0]?.textContent ?? null;
const date = (v: string | null) => (v ? v.slice(0, 10) : null);

export function parseProjectXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw Error('This is not a Microsoft Project XML file.');
  const tasks: any[] = [];
  let links = 0;
  for (const t of Array.from(doc.getElementsByTagName('Task'))) {
    const uid = text(t, 'UID');
    if (uid === '0') continue;
    const baseline = t.getElementsByTagName('Baseline')[0];
    const preds = Array.from(t.getElementsByTagName('PredecessorLink')).map((p) => text(p, 'PredecessorUID')).filter(Boolean);
    links += preds.length;
    const pc = Number(text(t, 'PercentComplete') || 0);
    tasks.push({
      uid,
      id: text(t, 'ID'),
      name: text(t, 'Name') || '',
      wbsCode: text(t, 'WBS') || text(t, 'OutlineNumber') || '',
      outline_level: Number(text(t, 'OutlineLevel') || 0),
      isSummary: text(t, 'Summary') === '1',
      isMilestone: text(t, 'Milestone') === '1',
      startDate: date(text(t, 'Start')),
      endDate: date(text(t, 'Finish')),
      baselineStart: baseline ? date(text(baseline, 'Start')) : null,
      baselineFinish: baseline ? date(text(baseline, 'Finish')) : null,
      percentComplete: pc,
      baselineHours: baseline ? hours(text(baseline, 'Work')) : hours(text(t, 'Work')),
      actualHours: hours(text(t, 'ActualWork')),
      remainingHours: hours(text(t, 'RemainingWork')),
      baselineCost: baseline ? Number(text(baseline, 'Cost') || 0) / 100 : 0,
      predecessors: preds.join(','),
      assignedResource: '',
    });
  }
  return {
    success: true,
    source: 'browser-xml',
    project: { name: text(doc.documentElement, 'Name'), start: date(text(doc.documentElement, 'StartDate')), finish: date(text(doc.documentElement, 'FinishDate')) },
    tasks,
    summary: { tasks: tasks.length, dependencies: { totalPredecessorLinks: links } },
  };
}
