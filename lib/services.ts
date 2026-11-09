/* The services, in one place. Home lists them; /services explains them;
   /contact?service=<id> preselects them. Prices only where the site has
   published one; everything else is quoted to scope. */
export type Service = {
  id: keyof typeof import("./site").inquiryServices;
  no: string;
  name: string;
  short: string;
  line: string;
  detail: string;
  deliverables: string[];
  tools: string[];
  start: string;
};

export const services: Service[] = [
  {
    id: "websites",
    no: "01",
    name: "Websites & apps",
    short: "Websites",
    line: "Marketing sites, booking pages, customer portals and internal tools.",
    detail:
      "Designed, built, hosted and kept running by the same person. You get a site you can edit yourself, on accounts you own, and someone to call when something needs to change.",
    deliverables: [
      "Design and build, desktop and phone",
      "Hosting, domain and business email set up",
      "Editing for your own text and photos",
      "Analytics and search basics",
      "Portals and internal tools behind a login",
    ],
    tools: ["Next.js", "React", "PostgreSQL", "Vercel"],
    start: "Quoted to scope",
  },
  {
    id: "payments",
    no: "02",
    name: "Payments, booking & invoicing",
    short: "Payments",
    line: "Take cards, send invoices, sell online and book appointments.",
    detail:
      "Set up on Stripe and connected to the rest of the business, so a booking turns into a deposit, an invoice, a receipt and a line in your books without anyone retyping it.",
    deliverables: [
      "Checkout, payment links and subscriptions",
      "Online booking with deposits",
      "Invoices, receipts and refunds",
      "Payouts reconciled to your books",
      "The emails customers get at each step",
    ],
    tools: ["Stripe", "Stripe Connect", "Your accounting tool"],
    start: "Quoted to scope",
  },
  {
    id: "automation",
    no: "03",
    name: "AI automation",
    short: "Automation",
    line: "The repetitive work in your inbox, spreadsheets and paperwork.",
    detail:
      "We start by finding the work that eats the week. Then it goes to software that does it the same way every time, with a person checking the parts that need judgement.",
    deliverables: [
      "A workflow review of what is worth automating",
      "Email sorting, drafts and follow ups",
      "Documents read, filed and summarized",
      "Quotes, reports and forms filled from your data",
      "A before and after measure, so you know it worked",
    ],
    tools: ["Claude", "Python", "Your existing apps"],
    start: "Workflow review $250",
  },
  {
    id: "knowledge",
    no: "04",
    name: "Company knowledge base",
    short: "Knowledge base",
    line: "What your company knows, searchable in one place.",
    detail:
      "Email, shared drives, chat and old project folders, connected read only and kept current. Ask a question in plain English and get an answer that shows where it came from.",
    deliverables: [
      "Read only connections to the tools you already use",
      "Search across documents, email and notes",
      "Answers that cite their sources",
      "Access rules so people see only what they should",
      "Runs on your accounts, not mine",
    ],
    tools: ["PostgreSQL", "Search indexing", "Claude"],
    start: "Custom system $3,000+",
  },
  {
    id: "dashboards",
    no: "05",
    name: "Dashboards & reporting",
    short: "Dashboards",
    line: "The numbers you check every week, pulled automatically.",
    detail:
      "We agree on the few numbers that drive decisions first. Then the data is pulled on a schedule and laid out so the answer is obvious at a glance.",
    deliverables: [
      "Power BI or web dashboards",
      "Scheduled reports by email",
      "Measures agreed before anything is built",
      "Cost, schedule and progress reporting for projects",
    ],
    tools: ["Power BI", "SQL", "Python"],
    start: "Sprint $1,500+",
  },
  {
    id: "integrations",
    no: "06",
    name: "Integrations & data",
    short: "Integrations",
    line: "When two systems should talk to each other and don't.",
    detail:
      "APIs, databases and the glue between them. Records move on their own, stay consistent, and are documented well enough that the next person can follow them.",
    deliverables: [
      "System to system syncs, such as Workday to PostgreSQL",
      "Clean, documented databases",
      "APIs for your own tools",
      "Moves off old spreadsheets",
    ],
    tools: ["PostgreSQL", "REST APIs", "Python", "SQL"],
    start: "Custom system $3,000+",
  },
  {
    id: "engineering",
    no: "07",
    name: "Engineering tools & project controls",
    short: "Engineering",
    line: "Calculations, schedules and controls for industrial teams.",
    detail:
      "Built by an industrial engineer who has done process, safety and piping work and run project controls. Calculations show their units, method and sources.",
    deliverables: [
      "Calculators with explicit units and cited methods",
      "Schedules and WBS in Primavera P6 or InEight",
      "Progress, cost and forecast reporting",
      "Estimating and bid tools",
    ],
    tools: ["Primavera P6", "InEight", "Aspen HYSYS", "Python"],
    start: "Engineering tool $1,500+",
  },
];

export const startingPoints = [
  {
    name: "Workflow review",
    price: "$250",
    text: "A focused session on how the work runs today, and a written plan for what to fix first.",
  },
  {
    name: "Build sprint",
    price: "$1,500+",
    text: "One workflow, dashboard or tool, built with your real data and handed over with its files.",
  },
  {
    name: "Custom system",
    price: "$3,000+",
    text: "Apps, integrations and knowledge bases with agreed screens, data and testing.",
  },
];

export const steps = [
  { name: "Talk", text: "A short call about what is slow, broken or missing. No charge." },
  { name: "Scope", text: "A written scope with the deliverable, the timeline and a fixed price before any work starts." },
  { name: "Build", text: "Short cycles you can see and use as they happen, with your real data." },
  { name: "Hand over", text: "Accounts in your name, source files, notes on how it works, and support after launch." },
];
