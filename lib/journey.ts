/* Chapter content for the homepage journey. Each chapter is a station in the
   3D scene; copy is the site's existing, verified wording. */
export type Chapter = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  accent: string;
  text: string;
  hold?: { label: string; done: string; note?: string };
  links: { label: string; href: string }[];
};

export const chapters: Chapter[] = [
  {
    id: "intro",
    index: "00",
    kicker: "Independent consulting & product development · Houston",
    title: "Engineering insight. Connected systems.",
    accent: "Useful work.",
    text: "I’m Luqman Ismat. I build the tools, workflows, and products that connect technical thinking with the work people do every day.",
    links: [
      { label: "Start a project", href: "/contact" },
      { label: "All work", href: "/projects" },
    ],
  },
  {
    id: "controls",
    index: "01",
    kicker: "Project management & controls",
    title: "From plan to a",
    accent: "clear next step.",
    text: "Plans, schedules, progress reporting, cost tracking, and clear project handoffs, built so the people running the work can see what is driving the finish date.",
    hold: { label: "Hold to run the schedule", done: "Critical path traced", note: "Illustrative schedule" },
    links: [
      { label: "Project controls", href: "/consulting/project-controls" },
      { label: "Try the control room demo", href: "/demos/project-controls" },
    ],
  },
  {
    id: "integrations",
    index: "02",
    kicker: "APIs, databases & dashboards",
    title: "Systems that",
    accent: "talk to each other.",
    text: "Connect platforms such as Workday to structured databases, traceable reporting, and tools with defined access controls.",
    hold: { label: "Hold to sync the records", done: "Records reconciled", note: "Illustrative data flow" },
    links: [
      { label: "Integrations", href: "/consulting/integrations" },
      { label: "Dashboards", href: "/consulting/dashboards" },
      { label: "Reconciliation demo", href: "/demos/connected-operations" },
    ],
  },
  {
    id: "engineering",
    index: "03",
    kicker: "Engineering & technical systems",
    title: "Calculations you",
    accent: "can review.",
    text: "Calculators, internal applications, technical workflows, and CAD support. EngiVault runs engineering calculations with explicit units and a visible method.",
    hold: { label: "Hold to start the flow", done: "Exchanger running", note: "Drag to rotate the model" },
    links: [
      { label: "Open EngiVault", href: "/engivault" },
      { label: "Engineering services", href: "/engineering" },
      { label: "EngiVault case study", href: "/projects/engivault" },
    ],
  },
  {
    id: "indus",
    index: "04",
    kicker: "Indus Blue · Apparel development",
    title: "Our own line.",
    accent: "Your next collection.",
    text: "Collection 01 builds oversized, asymmetric garments on the panels of Baloch dress, worked in pakka doch embroidery. This is the Pashk Coat's production flat, drawn to its measurements.",
    links: [
      { label: "See Collection 01", href: "/indus-blue" },
      { label: "Pashk Coat tech pack", href: "/indus-blue/pashk-coat" },
      { label: "Contract development", href: "/indus-blue#development" },
    ],
  },
  {
    id: "about",
    index: "05",
    kicker: "The person behind the work",
    title: "Engineering, analysis, and a",
    accent: "builder’s perspective.",
    text: "Industrial engineering graduate. Risk Analyst at Pinnacle. Experience across process engineering, safety, piping, reliability, and project controls. Based in Houston, working with teams everywhere.",
    links: [
      { label: "About me", href: "/about" },
      { label: "Experience timeline", href: "/portfolio" },
      { label: "Read the blog", href: "/blog" },
    ],
  },
  {
    id: "contact",
    index: "06",
    kicker: "Start a conversation",
    title: "What needs to",
    accent: "work better?",
    text: "Send the problem, the starting point, and the deadline. We’ll define a useful first deliverable together.",
    links: [
      { label: "Start a project", href: "/contact" },
      { label: "Email", href: "mailto:Luqman.ismat@gmail.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/luqman-ismat/" },
    ],
  },
];

/* Mutable, render-loop friendly state shared between the DOM overlay and the
   WebGL scene. Written by scroll/pointer handlers, read inside useFrame, so
   no React re-render happens per frame. */
export const journey = {
  /** Continuous position along the chapters: 0 = intro, 1 = controls, … */
  position: 0,
  /** Hold progress per chapter id, 0..1. */
  hold: {} as Record<string, number>,
  /** Normalised pointer, -1..1. */
  pointer: { x: 0, y: 0 },
  /** Accumulated drag rotation for the exchanger, radians. */
  spin: 0,
};
