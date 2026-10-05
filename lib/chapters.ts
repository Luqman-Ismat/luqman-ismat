/* One content model for the site. Each chapter is a station in the homepage
   scene; "Explore" explodes the station and opens the chapter page, where
   every exploded part is a live, explained component. */
import { guides } from "./work/guides";

export type StationId = "core" | "schedule" | "network" | "exchanger" | "garment" | "globe" | "portal";

export type Explain = { purpose: string; how: string; steps: string[] };

export type Component =
  | { id: string; part: string; title: string; kind: "project-view"; view: number; explain: Explain }
  | { id: string; part: string; title: string; kind: "inspection"; explain: Explain; areas: { name: string; text: string }[] }
  | { id: string; part: string; title: string; kind: "calculators"; explain: Explain }
  | { id: string; part: string; title: string; kind: "garment"; slug: string; explain: Explain }
  | { id: string; part: string; title: string; kind: "text"; explain: Explain; bullets: string[] };

export type Package = { name: string; price: string; label: string; items: string[] };

export type Chapter = {
  id: string;
  index: string;
  /** Short name used in navigation. */
  nav: string;
  station: StationId;
  href: string;
  kicker: string;
  title: string;
  accent: string;
  lede: string;
  explore?: string;
  components: Component[];
  service?: string;
  packages?: Package[];
};

const fromGuide = (view: number): Explain => ({
  purpose: guides[view].purpose,
  how: guides[view].detail,
  steps: guides[view].steps,
});

export const chapters: Chapter[] = [
  {
    id: "intro",
    nav: "Home",
    index: "00",
    station: "core",
    href: "/",
    kicker: "Independent consulting & product development · Houston",
    title: "Engineering insight. Connected systems.",
    accent: "Useful work.",
    lede: "I build the tools, workflows, and products that connect technical thinking with the work people do every day.",
    components: [],
  },
  {
    id: "controls",
    nav: "Project controls",
    index: "01",
    station: "schedule",
    href: "/controls",
    kicker: "Project management & controls",
    title: "From plan to a",
    accent: "clear next step.",
    lede: "Schedules, capacity, imports, forecasts and portfolio risk, built so the people running the work can see what drives the finish date.",
    explore: "Explore project controls",
    service: "projects",
    components: [
      { id: "schedule", part: "schedule", title: "Schedule", kind: "project-view", view: 0, explain: fromGuide(0) },
      { id: "capacity", part: "capacity", title: "Capacity heatmaps", kind: "project-view", view: 1, explain: fromGuide(1) },
      { id: "import", part: "import", title: "MS Project import", kind: "project-view", view: 2, explain: fromGuide(2) },
      { id: "forecast", part: "forecast", title: "Forecast & approval", kind: "project-view", view: 4, explain: fromGuide(4) },
      { id: "risk", part: "risk", title: "Portfolio risk", kind: "project-view", view: 8, explain: fromGuide(8) },
    ],
    packages: [
      { name: "Workflow review", price: "$250", label: "Define the first step", items: ["Focused discovery session", "Current process and friction points", "Prioritized recommendations", "A written implementation scope"] },
      { name: "Controls setup", price: "Quoted to scope", label: "Schedules, reporting, handoff", items: ["Schedule and WBS structure", "Progress and cost reporting", "Forecast and review cadence", "Documented handoff"] },
    ],
  },
  {
    id: "integrations",
    nav: "Integrations",
    index: "02",
    station: "network",
    href: "/integrations",
    kicker: "APIs, databases & dashboards",
    title: "Systems that",
    accent: "talk to each other.",
    lede: "Connect platforms such as Workday to structured databases, then report on the data with every number traceable to its source record.",
    explore: "Explore integrations",
    service: "integrations",
    components: [
      { id: "mapping", part: "mapping", title: "Hours mapping & reconciliation", kind: "project-view", view: 3, explain: fromGuide(3) },
      { id: "cost", part: "cost", title: "Cost & margin", kind: "project-view", view: 6, explain: fromGuide(6) },
      { id: "productivity", part: "productivity", title: "Productivity", kind: "project-view", view: 7, explain: fromGuide(7) },
      { id: "quality", part: "quality", title: "Quality trend", kind: "project-view", view: 5, explain: fromGuide(5) },
      {
        id: "access",
        part: "access",
        title: "Data model & access",
        kind: "text",
        explain: {
          purpose: "Define how records relate, which system owns each field, and how updates reach the application.",
          how: "My application work includes authentication guards and project-scoped access checks. Access boundaries are defined alongside the API and database design, then tested. Independent penetration testing and formal compliance certification are separate specialist engagements.",
          steps: [],
        },
        bullets: [
          "Relational models, stable identifiers and source-to-destination mappings",
          "Import validation, duplicate handling and reconciliation checks",
          "Server-side credential handling and least-privilege access",
          "Authentication, role permissions and project-level authorization",
          "Refresh history, error visibility and documented recovery",
        ],
      },
    ],
    packages: [
      { name: "Dashboard or automation sprint", price: "$1,500+", label: "Improve one workflow", items: ["One clearly defined workflow", "Prototype using representative data", "Agreed validation checks", "Working files and handoff"] },
      { name: "Custom system", price: "$3,000+", label: "Connect the moving parts", items: ["Agreed screens, data model and integrations", "Access and refresh requirements", "Core workflow testing", "Source files and setup documentation"] },
    ],
  },
  {
    id: "engineering",
    nav: "Engineering",
    index: "03",
    station: "exchanger",
    href: "/engineering",
    kicker: "Engineering & reliability",
    title: "Calculations you",
    accent: "can review.",
    lede: "Inspection planning for process equipment, and EngiVault: engineering calculations with explicit units, a written method and cited sources.",
    explore: "Explore engineering",
    service: "engineering",
    components: [
      {
        id: "inspection",
        part: "inspection",
        title: "Inspection planning workbench",
        kind: "inspection",
        explain: {
          purpose: "Decide when each inspection task should happen, using lifetime curves and acceptance checks instead of fixed intervals.",
          how: "The original workbench and calculation engine run in your browser on fictional assets and scenarios. Recalculation happens in a web worker; changes stay in this browser.",
          steps: ["Switch scenario between Baseline and Optimized planning.", "Pick a contributor, then read its lifetime variability curve.", "Open Checks and export the cost-benefit workbook."],
        },
        areas: [
          { name: "Scenario & checks", text: "Choose the planning scenario, search assets, and review acceptance-gate warnings." },
          { name: "Decision buckets", text: "Every assessment lands in one bucket: pull in, defer, keep, add, engineering scope, or no change." },
          { name: "Top contributors", text: "Ranks trains, assets and assessments by risk against their limits." },
          { name: "Lifetime variability curve", text: "Risk over time with current and proposed task placement, limits and today’s date." },
          { name: "Cost and benefit", text: "The proposed plan’s cost against avoided risk to the horizon, exportable to Excel." },
        ],
      },
      {
        id: "calculators",
        part: "calculators",
        title: "EngiVault calculations",
        kind: "calculators",
        explain: {
          purpose: "Every item in this loop opens the calculation that describes it: vessel head, NPSH, pump duty, pipe loss, heat transfer, valve sizing.",
          how: "45 calculations across 12 disciplines. Inputs carry explicit units, results update as you type, and each method lists its assumptions and sources.",
          steps: ["Select the pump to open Pump Duty.", "Change an input and watch the sensitivity curve.", "Browse the full library from EngiVault."],
        },
      },
    ],
    packages: [
      { name: "Engineering tool", price: "$1,500+", label: "One calculation, done properly", items: ["Agreed method and sources", "Unit-aware inputs and validation", "Verification against reference cases", "Source files and handoff"] },
    ],
  },
  {
    id: "ten21",
    nav: "TEN21",
    index: "04",
    station: "garment",
    href: "/ten21",
    kicker: "TEN21 · Apparel development",
    title: "Our own line.",
    accent: "Your next collection.",
    lede: "Collection 01 builds oversized, asymmetric garments on the panels of Baloch dress. Every piece is drawn as a production flat with a full tech pack.",
    explore: "Explore TEN21",
    service: "apparel",
    components: [
      { id: "pashk-coat", part: "pashk-coat", title: "Pashk Coat", kind: "garment", slug: "pashk-coat", explain: { purpose: "", how: "", steps: [] } },
      { id: "jig-kameez", part: "jig-kameez", title: "Jig Kameez", kind: "garment", slug: "jig-kameez", explain: { purpose: "", how: "", steps: [] } },
      { id: "chin-shalwar", part: "chin-shalwar", title: "Chin Shalwar", kind: "garment", slug: "chin-shalwar", explain: { purpose: "", how: "", steps: [] } },
      { id: "sadri", part: "sadri", title: "Sadri", kind: "garment", slug: "sadri", explain: { purpose: "", how: "", steps: [] } },
    ],
    packages: [
      { name: "CAD & technical flats", price: "$150", label: "One style, clearly defined", items: ["Front and back technical flats", "Key construction callouts", "One colorway", "PDF and agreed editable source"] },
      { name: "Apparel tech pack", price: "$400", label: "Prepare for sampling", items: ["Flats, detail views and exploded construction", "Graded measurement sheet", "Fabric, trim and label BOM", "Up to three colorways"] },
    ],
  },
  {
    id: "about",
    nav: "About",
    index: "05",
    station: "globe",
    href: "/about",
    kicker: "The person behind the work",
    title: "Engineering, analysis, and a",
    accent: "builder’s perspective.",
    lede: "Industrial engineering graduate. Risk Analyst at Pinnacle. Experience across process engineering, safety, piping, reliability and project controls.",
    explore: "About me",
    components: [],
  },
  {
    id: "contact",
    nav: "Contact",
    index: "06",
    station: "portal",
    href: "/contact",
    kicker: "Start a conversation",
    title: "What needs to",
    accent: "work better?",
    lede: "Send the problem, the starting point, and the deadline. We’ll define a useful first deliverable together.",
    explore: "Start a project",
    components: [],
  },
];

export const chapterById = (id: string) => chapters.find((c) => c.id === id)!;
export const workChapters = chapters.filter((c) => c.components.length > 0);
