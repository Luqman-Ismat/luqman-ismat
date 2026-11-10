/* The projects, as case studies. Two run in the browser on fictional records
   (`kind` project | inspection); EngiVault is a live tool with its own pages. */
export type Panel = { view?: number; part?: "calculator" | "converter"; title: string; caption: string };
export type Product = {
  slug: string;
  kind: "project" | "inspection" | "engivault";
  no: string;
  name: string;
  short: string;
  line: string;
  year: string;
  type: string;
  accent: string;
  features: string[];
  description: string;
  challenge: string;
  solution: string;
  panels: Panel[];
  tryThis: string[];
  built: string[];
  facts: { k: string; v: string }[];
  services: string[];
  live?: { href: string; label: string };
};

export const products: Product[] = [
  {
    slug: "project-controls",
    kind: "project",
    no: "01",
    name: "Project controls workspace",
    short: "Project controls",
    line: "Schedule, people, money and risk for one project, traceable from source record to decision.",
    year: "2025 to 2026",
    type: "Web application",
    accent: "#e2b45a",
    features: ["Web application", "WBS and Gantt", "Capacity planning", "Schedule import", "Forecasting", "Cost and productivity", "Risk intelligence", "Data visualisation"],
    description:
      "Ten connected views over one project: a WBS and Gantt schedule, paired capacity heatmaps, MS Project import with version comparison, hours mapping, a forecast worksheet, quality trends, cost and margin, productivity and a risk page. Each view states the question it answers, and every number can be traced back to the record it came from.",
    challenge:
      "Project controls teams work across a schedule tool, a timesheet export, a cost ledger and a risk register that never agree. Reporting means re-keying the same numbers every week, and by the time a variance shows up in a slide it is already a month old.",
    solution:
      "One workspace with one data model. The schedule is the backbone; hours, cost, forecast and risk hang off its work packages, so a change in one view moves the others. Imports are matched deterministically and every match is reviewable. Charts are drawn by code, not a chart library, so they show exactly what the team needs and nothing else.",
    panels: [
      { view: 1, title: "Capacity heatmaps", caption: "Demand and available capacity side by side, by role and month. Add an FTE and watch the gap close." },
      { view: 4, title: "Forecast", caption: "Variance, sparklines and an approval trail on one worksheet." },
      { view: 8, title: "Risk intelligence", caption: "Matrix, trends, clusters and a ranked list, with relationships you can review." },
    ],
    tryThis: ["Open Schedule, switch to Weeks and turn on Critical.", "In Capacity, add 1 FTE and watch the gap close.", "In Risk intelligence, review a suggested relationship."],
    built: ["React", "TypeScript", "Python parser (MPXJ)", "PostgreSQL"],
    facts: [
      { k: "Views", v: "10" },
      { k: "Imports", v: "MS Project" },
      { k: "Records", v: "Fictional" },
      { k: "Runs", v: "In the browser" },
    ],
    services: ["visuals", "dashboards", "integrations"],
  },
  {
    slug: "inspection-planning",
    kind: "inspection",
    no: "02",
    name: "Inspection planning optimizer",
    short: "Inspection planning",
    line: "When each inspection task should happen, decided by cost and risk instead of habit.",
    year: "2025",
    type: "Decision tool",
    accent: "#6cc4b4",
    features: ["Decision tool", "Life-cycle cost", "Optimisation", "Scenario comparison", "Web worker engine", "Excel export", "Data visualisation"],
    description:
      "A task timing workbench for an asset portfolio. It computes a life-cycle cost curve for every inspection task, ranks where a change in interval saves the most, compares scenarios and exports the plan to a workbook. The calculation engine runs in a background worker, so the interface stays responsive while thousands of curves recompute.",
    challenge:
      "Inspection intervals are usually inherited: the plan says every three years because it always has. Nobody can see the cost of inspecting too often against the risk of inspecting too late, so the conversation stays about habit rather than money.",
    solution:
      "Make the trade visible. For each task the tool draws inspection cost falling, failure risk rising, and the total with its minimum. The portfolio view ranks the tasks where moving the interval saves the most, settings change the assumptions, and two scenarios can be held side by side before anything is exported.",
    panels: [],
    tryThis: ["Pick a task in the rankings and read its cost curve.", "Change an interval in the settings and recalculate.", "Export the scenario to Excel."],
    built: ["React", "TypeScript", "Web Worker", "SheetJS"],
    facts: [
      { k: "Engine", v: "Web worker" },
      { k: "Scenarios", v: "Compared live" },
      { k: "Export", v: "Excel" },
      { k: "Records", v: "Fictional" },
    ],
    services: ["engineering", "visuals", "automation"],
  },
  {
    slug: "engivault",
    kind: "engivault",
    no: "03",
    name: "EngiVault",
    short: "EngiVault",
    line: "Forty-five engineering calculations that show their inputs, units, method and sources.",
    year: "2024 to 2026",
    type: "Live product",
    accent: "#8fb0dc",
    features: ["Live product", "Engineering calculators", "Unit handling", "Cited methods", "Interactive schematic", "Free, no account"],
    description:
      "A public library of engineering calculations for fluids, heat transfer, piping and more. Every calculator shows its inputs with explicit units, writes the method out, cites its sources and is checked against reference cases. An interactive process schematic links each piece of equipment to the calculation behind it.",
    challenge:
      "Most online calculators are black boxes: a form, a number, no way to check it. Engineers cannot use a result they cannot defend, so they rebuild the same spreadsheet every time.",
    solution:
      "Treat each calculation like a worked example. Inputs carry units and convert; the method is written out next to the result; sources are cited; the result updates as you type. The schematic gives the library a map, so you can start from the pump or the exchanger rather than a list.",
    panels: [
      { part: "calculator", title: "A worked calculation", caption: "Thermal transport numbers: inputs with units, the method written out, sources cited." },
      { part: "converter", title: "Unit converter", caption: "The library's unit model, on its own." },
    ],
    tryThis: ["Hover the schematic and open the exchanger.", "Change a unit on any input and watch the result follow.", "Read the method before you trust the number."],
    built: ["Next.js", "TypeScript", "SVG", "anime.js"],
    facts: [
      { k: "Calculations", v: "45" },
      { k: "Disciplines", v: "12" },
      { k: "Account", v: "None" },
      { k: "Cost", v: "Free" },
    ],
    services: ["engineering", "visuals", "websites"],
    live: { href: "/engivault", label: "Open EngiVault" },
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
