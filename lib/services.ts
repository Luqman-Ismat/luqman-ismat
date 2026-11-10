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
  /** what the first week of this work looks like */
  week: string[];
  /** questions people ask before they buy */
  faq: { q: string; a: string }[];
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
    week: ["Day 1: a call about what the site has to do, who edits it, what it links to.", "Day 2: a written scope and price. Nothing starts until you say yes.", "Days 3 to 5: first pages on a private link, on your phone and mine.", "By Friday: hosting, domain and email on accounts in your name."],
    faq: [
      { q: "Do I own it?", a: "Yes. The code, the domain, the hosting account and the email are yours. If we stop working together you keep everything and it keeps running." },
      { q: "Can I edit it myself?", a: "Text, photos, prices and hours, yes, from a simple editor. Layout changes are a message to me." },
      { q: "What about my current site?", a: "I move it, keep the addresses that matter so search results do not break, and redirect the rest." },
    ],
  },
  {
    id: "visuals",
    no: "02",
    name: "Custom visuals",
    short: "Visuals",
    line: "Interactive diagrams, live charts, 3D and motion, built for your data.",
    detail:
      "Off the shelf charts make every company look the same. A custom visual shows your process, your schedule or your numbers the way your team already thinks about them, and it moves. Live diagrams you can click into, charts that redraw as data changes, WebGL scenes and animated interfaces like this site.",
    deliverables: [
      "Interactive process diagrams and schematics",
      "Live charts and data visuals that update from your data",
      "3D and WebGL scenes for the web",
      "Animated interfaces, launches and product pages",
      "Maps, timelines and Gantt views",
      "Runs in the browser, embeds in your site or app",
    ],
    tools: ["SVG", "WebGL / three.js", "GSAP", "D3", "React"],
    start: "Quoted to scope",
    week: ["Day 1: you show me the thing you want people to understand: the process, the schedule, the data.", "Day 2: a sketch of the visual and what moves. Scope and price in writing.", "Days 3 to 5: a first live version, drawn by code, on a private link.", "By Friday: it runs in your site, your deck or your app, from your data."],
    faq: [
      { q: "What do you mean by custom?", a: "No chart library templates. The visual is drawn to show your thing the way your team already pictures it, and it reacts: hover, click, scroll, live data." },
      { q: "Does it work on phones?", a: "Yes. SVG and WebGL both run on phones; the design is made for a thumb as well as a mouse." },
      { q: "Can it use live data?", a: "Yes. It can read from a spreadsheet, a database or an API and redraw when the numbers change." },
    ],
  },
  {
    id: "payments",
    no: "03",
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
    week: ["Day 1: what you sell, how people pay today, what breaks.", "Day 2: Stripe account in your name, fees explained, scope in writing.", "Days 3 to 5: checkout, booking or invoicing wired to your site and tested with real cards.", "By Friday: first payment lands in your bank account."],
    faq: [
      { q: "What are the fees?", a: "Stripe's published card fees. I do not add a percentage on top; you pay me for the build and any care plan." },
      { q: "Can customers book themselves?", a: "Yes: a booking page with your hours, deposits if you want them, reminders by text or email." },
      { q: "Will it talk to my accounting?", a: "Payouts, invoices and refunds can post to QuickBooks or Xero automatically." },
    ],
  },
  {
    id: "automation",
    no: "04",
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
    week: ["Day 1: I watch the job as it is done today and write down every step.", "Day 2: which steps a computer should do, which stay with a person. Scope and price.", "Days 3 to 5: the automation runs beside the old way, with a log of every action.", "By Friday: the old way stops, the log stays."],
    faq: [
      { q: "Where does AI fit?", a: "Reading, sorting and drafting: an email, a PDF, a form. A person still approves anything that goes to a customer or moves money." },
      { q: "What if it makes a mistake?", a: "Every run is logged with what came in, what it did and why. Anything uncertain stops and asks." },
      { q: "Do I need new software?", a: "Usually not. It works with the email, spreadsheets and tools you already have." },
    ],
  },
  {
    id: "knowledge",
    no: "05",
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
    week: ["Day 1: where your knowledge lives: drive folders, email, SOPs, people's heads.", "Day 2: what questions it must answer and who may ask. Scope and price.", "Days 3 to 5: your documents indexed, a first version answering with sources on a private link.", "By Friday: your team asks it ten real questions and we fix what it got wrong."],
    faq: [
      { q: "Is my data sent to the public internet?", a: "No. Documents stay in your own storage. The model sees only the pieces needed to answer a question, and vendors with no-training terms are used." },
      { q: "What if it does not know?", a: "It says so. Every answer cites the documents it used; an answer with no source is not given." },
      { q: "Can I control who sees what?", a: "Yes. Access follows the permissions on the source folders." },
    ],
  },
  {
    id: "dashboards",
    no: "06",
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
    week: ["Day 1: the five numbers you look at every Monday, and where they come from.", "Day 2: a sketch of the page and the data plumbing. Scope and price.", "Days 3 to 5: live numbers on a private link, updating from your systems.", "By Friday: it is on the office screen and in your phone."],
    faq: [
      { q: "Where does the data come from?", a: "Spreadsheets, QuickBooks, Stripe, your CRM, a database. Anything with an export or an API." },
      { q: "Does it need a BI licence?", a: "No. It is a web page you own, with no per-seat fees." },
      { q: "Can I drill into a number?", a: "Yes. Any figure can open the records behind it." },
    ],
  },
  {
    id: "integrations",
    no: "07",
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
    week: ["Day 1: the systems you use and the records that get typed twice.", "Day 2: a map of what flows where and what owns what. Scope and price.", "Days 3 to 5: the first connection running with a log of every record it moves.", "By Friday: no one re-types that record again."],
    faq: [
      { q: "What if a system has no API?", a: "Scheduled exports, email parsing or a browser automation, in that order of preference. Something always works." },
      { q: "What happens when a sync fails?", a: "It retries, then tells a person with the exact record and reason. Nothing is silently lost." },
      { q: "Can you build the API for my own product?", a: "Yes, with documentation your customers can use." },
    ],
  },
  {
    id: "engineering",
    no: "08",
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
    week: ["Day 1: the spreadsheet or method you use today, and the standards it follows.", "Day 2: inputs, units, outputs and the cases it must match. Scope and price.", "Days 3 to 5: a first version with units handled, the method written out, checked against your cases.", "By Friday: your team uses it on a real job."],
    faq: [
      { q: "Will it match my spreadsheet?", a: "It must. Reference cases from your spreadsheet or the standard are part of the scope, and the tool is checked against them." },
      { q: "Can it cite the standard?", a: "Yes. Each result shows the equation, the clause and the assumptions." },
      { q: "Can it be private?", a: "Yes. Behind a login, on your own domain." },
    ],
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
