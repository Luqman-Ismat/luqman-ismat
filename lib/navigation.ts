/* Site map. Six destinations, in the order a visitor naturally moves:
   see the work, understand the services, try the tools, meet the label,
   read, then get to know the person. */
export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = {
  label: string;
  href: string;
  blurb: string;
  image: string;
  matches: string[];
  links: NavLink[];
};

export const navigationGroups: NavGroup[] = [
  {
    label: "Work",
    href: "/projects",
    blurb: "Working demos and case studies, themed to fit any client.",
    image: "/images/work/project-controls.webp",
    matches: ["/projects", "/demos"],
    links: [
      { label: "All work", href: "/projects" },
      { label: "Project controls", href: "/demos/project-controls", note: "Demo" },
      { label: "Inspection planning", href: "/demos/inspection-planning", note: "Demo" },
      { label: "Integrations", href: "/demos/connected-operations", note: "Demo" },
      { label: "EngiVault case study", href: "/projects/engivault" },
    ],
  },
  {
    label: "Services",
    href: "/consulting",
    blurb: "Project controls, dashboards, integrations and engineering systems.",
    image: "/images/work/connected-operations.webp",
    matches: ["/consulting", "/engineering"],
    links: [
      { label: "Services & packages", href: "/consulting" },
      { label: "Project controls", href: "/consulting/project-controls" },
      { label: "Dashboards", href: "/consulting/dashboards" },
      { label: "Integrations", href: "/consulting/integrations" },
      { label: "Engineering", href: "/engineering" },
    ],
  },
  {
    label: "EngiVault",
    href: "/engivault",
    blurb: "Engineering calculations with explicit units and a visible method.",
    image: "/images/consulting/engivault-calculator.png",
    matches: ["/engivault"],
    links: [
      { label: "Calculator library", href: "/engivault" },
      { label: "Unit converter", href: "/engivault/unit-converter" },
      { label: "How it was built", href: "/projects/engivault" },
    ],
  },
  {
    label: "Indus Blue",
    href: "/indus-blue",
    blurb: "Collection 01: Balochi structure, oversized silhouettes, full tech packs.",
    image: "",
    matches: ["/indus-blue"],
    links: [
      { label: "The collection", href: "/indus-blue" },
      { label: "Pashk Coat", href: "/indus-blue/pashk-coat", note: "IB-01" },
      { label: "Jig Kameez", href: "/indus-blue/jig-kameez", note: "IB-02" },
      { label: "Chin Shalwar", href: "/indus-blue/chin-shalwar", note: "IB-03" },
      { label: "Sadri", href: "/indus-blue/sadri", note: "IB-04" },
      { label: "Apparel development", href: "/indus-blue#development" },
    ],
  },
  {
    label: "Journal",
    href: "/blog",
    blurb: "Methods, decisions and lessons from engineering and delivery.",
    image: "/images/fel-stages-blog.jpeg",
    matches: ["/blog"],
    links: [{ label: "All articles", href: "/blog" }],
  },
  {
    label: "About",
    href: "/about",
    blurb: "Industrial engineer, risk analyst, builder. Based in Houston.",
    image: "/images/luqman-portrait-blue.jpeg",
    matches: ["/about", "/portfolio"],
    links: [
      { label: "About me", href: "/about" },
      { label: "Experience timeline", href: "/portfolio" },
      { label: "Get in touch", href: "/contact" },
    ],
  },
];

export function navigationGroup(path: string) {
  return navigationGroups.find((group) => group.matches.some((prefix) => path === prefix || path.startsWith(prefix + "/")));
}

/* The path through the site: each page points to the next. */
const flow = ["/", "/projects", "/consulting", "/engivault", "/indus-blue", "/blog", "/about", "/contact"];
const flowLabels: Record<string, string> = { "/": "Home", "/contact": "Start a project" };
export function nextStep(path: string) {
  const group = navigationGroup(path);
  const at = flow.indexOf(group?.href ?? path);
  if (at === -1 || at === flow.length - 1) return null;
  const href = flow[at + 1];
  return { href, label: flowLabels[href] ?? navigationGroups.find((g) => g.href === href)?.label ?? href, index: at + 1 };
}

export function locationLabel(path: string) {
  const group = navigationGroup(path);
  const exact = group?.links.find((link) => link.href === path)?.label;
  if (exact && group && exact !== group.links[0].label) return `${group.label} · ${exact}`;
  if (group) return group.label;
  return path === "/" ? "Home" : path === "/contact" ? "Contact" : path === "/privacy" ? "Privacy" : "Page";
}
