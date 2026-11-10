export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "EngiVault", href: "/engivault" },
  { label: "Journal", href: "/blog" },
  { label: "About", href: "/about" },
];

export function isCurrent(path: string, href: string) {
  if (href.includes("#")) return false;
  return path === href || path.startsWith(href + "/");
}
