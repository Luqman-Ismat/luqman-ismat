/* Site map, derived from the chapters. Four chapters of work, the EngiVault
   tool, the journal and About. Each chapter page lists its own components. */
import { workChapters } from "./chapters";
import { pieces } from "./ten21/collection";

export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = {
  label: string;
  href: string;
  blurb: string;
  image: string;
  matches: string[];
  links: NavLink[];
  /** Links resolve to sections on the group page itself. */
  spy?: boolean;
};

const chapterGroups: NavGroup[] = workChapters.map((c) => ({
  label: c.nav,
  href: c.href,
  blurb: c.lede,
  image: c.id === "controls" ? "/images/work/project-controls.webp" : c.id === "integrations" ? "/images/work/connected-operations.webp" : c.id === "engineering" ? "/images/work/inspection-planning.webp" : "",
  matches: [c.href],
  spy: true,
  links: c.components.map((x) => ({
    label: x.title,
    href: c.id === "ten21" ? `/ten21/${x.id}` : `${c.href}#${x.id}`,
    note: c.id === "ten21" ? pieces.find((p) => p.slug === x.id)?.code : undefined,
  })),
}));

export const navigationGroups: NavGroup[] = [
  ...chapterGroups,
  {
    label: "EngiVault",
    href: "/engivault",
    blurb: "45 engineering calculations with explicit units, a written method and cited sources.",
    image: "/images/consulting/engivault-calculator.png",
    matches: ["/engivault"],
    links: [
      { label: "Calculator library", href: "/engivault" },
      { label: "Unit converter", href: "/engivault/unit-converter" },
    ],
  },
  {
    label: "Journal",
    href: "/blog",
    blurb: "Methods, decisions and lessons from engineering and delivery.",
    image: "/images/fel-stages-blog.jpeg",
    matches: ["/blog"],
    links: [],
  },
  {
    label: "About",
    href: "/about",
    blurb: "Industrial engineer, risk analyst, builder. Based in Houston.",
    image: "/images/luqman-portrait-blue.jpeg",
    matches: ["/about"],
    links: [],
  },
];

export function navigationGroup(path: string) {
  return navigationGroups.find((group) => group.matches.some((prefix) => path === prefix || path.startsWith(prefix + "/")));
}

/* The path through the site: each page points to the next. */
const flow = ["/", ...workChapters.map((c) => c.href), "/engivault", "/blog", "/about", "/contact"];
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
  if (exact && group && exact !== group.links[0]?.label) return `${group.label} · ${exact}`;
  if (group) return group.label;
  return path === "/" ? "Home" : path === "/contact" ? "Contact" : path === "/privacy" ? "Privacy" : "Page";
}
