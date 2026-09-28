/** Invented demonstration records. No operational source data is imported. */
export const workstreams = [
  {
    id: "discovery",
    name: "Discovery & scope",
    team: "Delivery",
    start: 0,
    weeks: 3,
    baseline: 180,
    actual: 165,
    remaining: 0,
    rate: 90,
    progress: 100,
  },
  {
    id: "design",
    name: "System design",
    team: "Engineering",
    start: 2,
    weeks: 5,
    baseline: 320,
    actual: 210,
    remaining: 145,
    rate: 110,
    progress: 62,
  },
  {
    id: "connect",
    name: "Data connections",
    team: "Engineering",
    start: 5,
    weeks: 4,
    baseline: 240,
    actual: 80,
    remaining: 180,
    rate: 105,
    progress: 30,
  },
  {
    id: "review",
    name: "Quality review",
    team: "Delivery",
    start: 8,
    weeks: 3,
    baseline: 160,
    actual: 24,
    remaining: 136,
    rate: 85,
    progress: 15,
  },
  {
    id: "handoff",
    name: "Handoff & training",
    team: "Operations",
    start: 10,
    weeks: 2,
    baseline: 100,
    actual: 0,
    remaining: 100,
    rate: 80,
    progress: 0,
  },
];
export function projectForecast(team: string, extraHours: number) {
  const rows = workstreams
    .filter((r) => team === "All teams" || r.team === team)
    .map((r) => ({
      ...r,
      remaining: r.remaining + (r.id === "design" ? extraHours : 0),
    }));
  const baseline = rows.reduce((s, r) => s + r.baseline * r.rate, 0);
  const actual = rows.reduce((s, r) => s + r.actual * r.rate, 0);
  const remaining = rows.reduce((s, r) => s + r.remaining * r.rate, 0);
  return {
    rows,
    baseline,
    actual,
    remaining,
    forecast: actual + remaining,
    variance: actual + remaining - baseline,
  };
}
export const assets = [
  {
    id: "asset-a",
    name: "Asset A",
    area: "Process area",
    start: 0.25,
    growth: 0.115,
    planned: 9,
    cost: 2400,
    hold: false,
  },
  {
    id: "asset-b",
    name: "Asset B",
    area: "Utilities",
    start: 0.17,
    growth: 0.052,
    planned: 8,
    cost: 1800,
    hold: false,
  },
  {
    id: "asset-c",
    name: "Asset C",
    area: "Process area",
    start: 0.45,
    growth: 0.09,
    planned: 5,
    cost: 3200,
    hold: false,
  },
  {
    id: "asset-d",
    name: "Asset D",
    area: "Utilities",
    start: 0.22,
    growth: 0.08,
    planned: 10,
    cost: 2100,
    hold: true,
  },
  {
    id: "asset-e",
    name: "Asset E",
    area: "Storage",
    start: 0.1,
    growth: 0.025,
    planned: 6,
    cost: 1400,
    hold: false,
  },
];
export function inspectionPlan(threshold: number, buffer: number) {
  return assets.map((a) => {
    const breach = Math.ceil((threshold - a.start) / a.growth);
    const proposed = Math.max(1, Math.min(12, breach - buffer));
    const action =
      breach > 12
        ? "Outside horizon"
        : proposed < a.planned
          ? "Move earlier"
          : proposed > a.planned
            ? "Defer"
            : "Keep planned";
    return { ...a, breach, proposed: breach > 12 ? null : proposed, action };
  });
}
export const incoming = [
  {
    id: "record-01",
    source: "Scope workshop",
    target: "discovery",
    hours: 12,
    team: "Delivery",
  },
  {
    id: "record-02",
    source: "System design",
    target: "design",
    hours: 24,
    team: "Engineering",
  },
  {
    id: "record-03",
    source: "Data connection",
    target: "connect",
    hours: 18,
    team: "Engineering",
  },
  {
    id: "record-04",
    source: "Review session",
    target: "unmapped",
    hours: 6,
    team: "Delivery",
  },
  {
    id: "record-05",
    source: "Training material",
    target: "handoff",
    hours: 8,
    team: "Operations",
  },
];
export function reconcile(mapped: boolean) {
  return incoming.map((r) => ({
    ...r,
    target: r.target === "unmapped" && mapped ? "review" : r.target,
    status: r.target === "unmapped" && !mapped ? "Needs mapping" : "Ready",
  }));
}
export function demoCsv(
  rows: Record<string, string | number>[],
  columns: string[],
) {
  const quote = (v: unknown) =>
    '"' + String(v ?? "").replaceAll('"', '""') + '"';
  return [columns, ...rows.map((r) => columns.map((c) => r[c]))]
    .map((r) => r.map(quote).join(","))
    .join("\r\n");
}
