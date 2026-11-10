/* The projects, as case studies. Two run in the browser on fictional records
   (`kind` project | inspection); EngiVault is a live tool with its own pages. */
export type Chapter = {
  id: string;
  title: string;
  question: string;
  text: string;
  steps: string[];
  /** a bare view of the mounted app */
  view?: number;
  /** a site component or a code-drawn visual */
  part?: "calculator" | "converter" | "catalog" | "schematic" | "curves" | "rankings" | "scenarios" | "export";
};
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
  chapters: Chapter[];
  together: { title: string; text: string };
  takeaways: string[];
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
      "Nine connected views over one project: a WBS and Gantt schedule, paired capacity heatmaps, MS Project import with version comparison, hours mapping, a forecast worksheet, quality trends, cost and margin, productivity and a risk page. Each view states the question it answers, and every number can be traced back to the record it came from.",
    challenge:
      "Project controls teams work across a schedule tool, a timesheet export, a cost ledger and a risk register that never agree. Reporting means re-keying the same numbers every week, and by the time a variance shows up in a slide it is already a month old.",
    solution:
      "One workspace with one data model. The schedule is the backbone; hours, cost, forecast and risk hang off its work packages, so a change in one view moves the others. Imports are matched deterministically and every match is reviewable. Charts are drawn by code, not a chart library, so they show exactly what the team needs and nothing else.",
    chapters: [
      { id: "schedule", view: 0, title: "Schedule", question: "What is driving the finish date?", text: "The work breakdown, dates, dependencies, resources and baseline in one schedule. The split panes stay aligned while you scroll, so a project lead can review dates while an analyst reviews hours, cost, float and predecessors in the same rows.", steps: ["Expand a phase, then search for a work package.", "Switch from Months to Weeks and compare baseline against projected finish.", "Turn on Critical, inspect dependencies, and export the schedule."] },
      { id: "capacity", view: 1, title: "Capacity", question: "Where does demand exceed capacity?", text: "The same planning horizon from two sides: the hours the work demands and the hours each role can give. Both grids scroll together. The example uses a 160 hour month; daily and weekly views inherit the monthly values rather than pretending to a daily allocation model.", steps: ["Choose one role and switch between FTE and hours.", "Show capacity gap, then add 1 FTE to test a staffing decision.", "Select a cell to inspect its value."] },
      { id: "import", view: 2, title: "Schedule import", question: "What changed in the latest schedule?", text: "A Project file becomes reviewable rows before anyone accepts a revision. The sample files pass through the real Python and MPXJ parser and the hierarchy mapper; version comparison shows exactly which tasks moved and by how much.", steps: ["Parse sample v1 to inspect hierarchy, resources, costs and dependencies.", "Compare sample v2, then open Version changes to see three shifted tasks.", "Open the imported Gantt and inspect the result."] },
      { id: "mapping", view: 3, title: "Hours mapping", question: "Can every applied hour be traced?", text: "Timesheet labels rarely match the work breakdown. The deterministic matcher proposes a destination for every source bucket, exceptions are shown rather than hidden, and only reviewed mappings enter the applied snapshot. Source hours always equal mapped plus unmapped.", steps: ["Show Unmapped to find the two exceptions.", "Choose a destination for Unclassified support and apply the reviewed mapping.", "Inspect the hours tree, then export a receipt."] },
      { id: "forecast", view: 4, title: "Forecast", question: "What does the remaining work now cost?", text: "Change remaining hours on a work package and the forecast, the variance and the sparkline move with it. Role rates turn hours into cost. Submitting a forecast and approving a snapshot leaves an approval trail, and an earlier snapshot stays frozen when a revision opens.", steps: ["Change remaining hours on a work package.", "Watch the forecast and variance, then submit.", "Approve a snapshot, open a revision, and confirm the earlier one is frozen."] },
      { id: "quality", view: 5, title: "Quality", question: "Is quality improving, or is work accumulating?", text: "Inspection effort, rework and defect counts read together, as periods or cumulative, by week or month. Open defects are a balance at a point in time; defects found are a count for a period. The chart keeps them apart so nobody reads one as the other.", steps: ["Compare Hours, Ratios and Defects.", "Switch between period and cumulative, and month and week.", "Toggle a series and open the source weeks below the chart."] },
      { id: "cost", view: 6, title: "Cost and margin", question: "What is behind the commercial trend?", text: "Revenue, labour cost, forecast and margin on one chart, with the record trail intact. Every plotted amount opens the ledger entries behind it. Cost and productivity share the same 240 entries, and weekly and monthly groupings conserve hours, cost and revenue.", steps: ["Toggle forecast comparison, then switch Bars to Lines.", "Compare period and cumulative totals.", "Click a plotted amount to inspect and export the source entries."] },
      { id: "productivity", view: 7, title: "Productivity", question: "Is effort translating into output?", text: "Labour intensity across phases with explicit denominators: per worker, per unit, per hour. A rising hours per worker figure is not automatically bad; scope, output mix and completion counts sit beside it so the number can be interpreted rather than reacted to.", steps: ["Switch between Worker, Unit and Hours.", "Filter a phase and compare weekly against monthly patterns.", "Open a phase or period to inspect the supporting entries."] },
      { id: "risk", view: 8, title: "Risk intelligence", question: "Where should the portfolio review start?", text: "Schedule, cost, quality, staffing and forecast signals in one review. A matrix places each project, response timing follows detection to action, and suggested relationships between signals can be confirmed or dismissed. It illustrates triage and traceability, not a prediction of failure.", steps: ["Select a project in the schedule and cost matrix.", "Expand a response timing row to follow detection, acknowledgement and action.", "Confirm or dismiss a suggested relationship, then filter the signal feed."] },
    ],
    together: { title: "All of it, in one workspace", text: "This is the complete application: every chapter above is a tab here, on the same fictional project. Edits survive switching tabs and reset on reload." },
    takeaways: ["One data model, so a change in the schedule moves hours, cost, forecast and risk.", "Every number traceable to a record, every import reviewable before it is accepted.", "Charts drawn by code to show exactly what the team needs."],
    tryThis: ["Open Schedule, switch to Weeks and turn on Critical.", "In Capacity, add 1 FTE and watch the gap close.", "In Risk intelligence, review a suggested relationship."],
    built: ["React", "TypeScript", "Python parser (MPXJ)", "PostgreSQL"],
    facts: [
      { k: "Views", v: "9" },
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
      "A task timing workbench for an asset portfolio. It computes a life-cycle cost curve for every inspection task, ranks where a change in interval saves the most, compares scenarios and exports the plan to a workbook.",
    challenge:
      "Inspection intervals are usually inherited: the plan says every three years because it always has. Nobody can see the cost of inspecting too often against the risk of inspecting too late, so the conversation stays about habit rather than money.",
    solution:
      "Make the trade visible. For each task the tool draws inspection cost falling, failure risk rising, and the total with its minimum. The portfolio view ranks the tasks where moving the interval saves the most, settings change the assumptions, and two scenarios can be held side by side before anything is exported.",
    chapters: [
      { id: "curve", part: "curves", title: "The curve", question: "What does an inspection interval really cost?", text: "For each task the engine computes two costs across every interval: the cost of inspecting, which falls as you inspect less often, and the expected cost of failure, which rises. Their sum has a minimum. That minimum is the interval the money argues for, before anyone's habit gets a vote.", steps: ["Move across the chart to read the three costs at any interval.", "Find the optimum, marked on the total.", "Notice how flat or sharp the minimum is; that is how much the interval matters."] },
      { id: "rankings", part: "rankings", title: "The ranking", question: "Which tasks are worth changing first?", text: "Across a portfolio of hundreds of tasks, most intervals are close enough. The ranking sorts by the saving available from moving each task to its optimum, so the review starts where the money is. Top contributors are grouped by train and asset so a decision can be taken at the right level.", steps: ["Hover a bar to read the current interval, the optimum and the saving.", "Read down: the list falls off quickly, and that is the point.", "Group by train or asset in the workbench to decide in context."] },
      { id: "scenarios", part: "scenarios", title: "Scenarios", question: "What if the assumptions were different?", text: "Every assumption is a setting: failure cost, inspection cost, discount rate, minimum life, horizon. A scenario holds one set. Two scenarios are compared side by side with the recalculation running in a background worker, so the interface stays responsive while thousands of curves are recomputed.", steps: ["Compare Baseline planning against Earlier intervention.", "Read the delta per decision type: pull in, defer, keep, add.", "Change a setting in the workbench and recalculate."] },
      { id: "export", part: "export", title: "The handoff", question: "How does a decision leave the tool?", text: "A plan nobody can act on is a chart. The workbench exports the cost and benefit workbook and a model import sheet, so the chosen intervals go straight into the planning system the team already uses. Checks and acceptance gates run before export, and the export says which scenario it came from.", steps: ["Run the checks.", "Export the cost and benefit workbook.", "Export the model import sheet for the planning system."] },
    ],
    together: { title: "The workbench, all together", text: "The complete optimizer: scenario control, checks, the ranked task pool, lifetime curves, assessments and both exports, on a fictional asset portfolio." },
    takeaways: ["Makes the trade between inspecting too often and too late visible as money.", "Starts the review where the saving is, not at the top of a list.", "Hands the decision to the planning system in the format it already reads."],
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
    chapters: [
      { id: "library", part: "catalog", title: "The library", question: "Where do I start?", text: "Forty-five calculations across twelve disciplines, searchable by name and filtered by discipline. Each card says what goes in and what comes out before you open it. Press slash to search from anywhere on the page.", steps: ["Type a few letters of a quantity you need.", "Filter to one discipline.", "Open a card."] },
      { id: "calculation", part: "calculator", title: "A worked calculation", question: "Can I defend this number?", text: "Inputs carry explicit units and convert in place. The result updates as you type. Beside it, the method is written out step by step and the sources are cited, so the number can be checked by the person who has to sign it. Every calculation is verified against reference cases.", steps: ["Change an input and watch the result follow.", "Switch a unit on any input.", "Read the method before you trust the number."] },
      { id: "units", part: "converter", title: "Units", question: "What is that in the units I use?", text: "The unit model behind every calculator, on its own. Quantities, not just units: a pressure stays a pressure whichever unit it is shown in, which is what stops a bar being multiplied by a psi somewhere in a spreadsheet.", steps: ["Pick a quantity.", "Enter a value in one unit and read it in the others.", "Use it beside any calculator."] },
      { id: "map", part: "schematic", title: "The map", question: "Which calculation belongs to this equipment?", text: "An illustrative process loop drawn as a P&ID: vessel, pump, exchanger, control valve and their instruments. Each piece of equipment opens the calculation that describes it, so the library can be entered from the plant rather than from a list.", steps: ["Hover the pump, the exchanger, the valve.", "Read the tag and the calculation it links to.", "Open one."] },
    ],
    together: { title: "Open the library", text: "EngiVault is live and free, with no account. It is also the standard every client tool is held to: explicit inputs, a written method, cited sources, checked results." },
    takeaways: ["A calculation you can defend, not a number from a black box.", "Units handled as quantities, so they cannot be mixed up.", "A map into the library, so you start from the equipment in front of you."],
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
