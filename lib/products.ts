/* The complete products on the site. Both run in the browser on fictional
   records; nothing connects to a client system. */
export type Product = {
  slug: string;
  kind: "project" | "inspection";
  no: string;
  name: string;
  short: string;
  line: string;
  image: string;
  imageAlt: string;
  what: string;
  features: string[];
  tryThis: string[];
  built: string[];
  services: string[];
};

export const products: Product[] = [
  {
    slug: "project-controls",
    kind: "project",
    no: "01",
    name: "Project controls workspace",
    short: "Project controls",
    line: "Schedule, people, money and risk for one project, traceable from source record to decision.",
    image: "/images/work/project-controls.webp",
    imageAlt: "The project controls workspace with a Gantt schedule and progress columns",
    what:
      "Ten connected views over one fictional project: a WBS and Gantt schedule, capacity heatmaps, MS Project import, hours mapping, forecast, quality, cost and margin, productivity and risk intelligence. Each view explains the question it answers.",
    features: [
      "WBS and Gantt with dependencies, baseline and critical path",
      "Paired demand and capacity heatmaps",
      "MS Project import with version comparison",
      "Hours mapping with a deterministic matcher",
      "Forecast worksheet with an approval trail",
      "Cost, margin and productivity from one ledger",
      "Risk matrix, trends, clusters and ranking",
    ],
    tryThis: [
      "Open Schedule, switch to Weeks and turn on Critical.",
      "In Capacity, add 1 FTE and watch the gap close.",
      "In Risk intelligence, review a suggested relationship.",
    ],
    built: ["React", "TypeScript", "Python parser (MPXJ)", "PostgreSQL in production"],
    services: ["visuals", "dashboards", "integrations"],
  },
  {
    slug: "inspection-planning",
    kind: "inspection",
    no: "02",
    name: "Inspection planning optimizer",
    short: "Inspection planning",
    line: "Decide when each inspection task should happen, by cost and risk instead of habit.",
    image: "/images/work/inspection-planning.webp",
    imageAlt: "The inspection planning optimizer with life-cycle cost curves and task rankings",
    what:
      "A task timing workbench for an asset portfolio. It computes life-cycle cost curves for every task, ranks where a change saves the most, compares scenarios and exports the plan to a workbook. The calculation engine runs in a background worker in your browser.",
    features: [
      "Life-cycle cost curves per task",
      "Rankings and top contributors across the portfolio",
      "Asset panels and a searchable task pool",
      "Scenario comparison with recalculation",
      "Excel export of the whole plan",
    ],
    tryThis: [
      "Pick a task in the rankings and read its cost curve.",
      "Change an interval in the settings and recalculate.",
      "Export the scenario to Excel.",
    ],
    built: ["React", "TypeScript", "Web Worker engine", "SheetJS export"],
    services: ["engineering", "visuals", "automation"],
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
