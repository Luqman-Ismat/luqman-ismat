export const navigationGroups = [
  { label: "Work", href: "/projects", matches: ["/projects", "/demos"], links: [
    { label: "All work", href: "/projects" },
    { label: "Project controls", href: "/demos/project-controls" },
    { label: "Inspection planning", href: "/demos/inspection-planning" },
    { label: "Integrations", href: "/demos/connected-operations" },
    { label: "EngiVault case study", href: "/projects/engivault" },
    { label: "Apparel CAD", href: "/projects/field-01" },
  ] },
  { label: "Services", href: "/consulting", matches: ["/consulting", "/engineering"], links: [
    { label: "Services & packages", href: "/consulting" },
    { label: "Project controls", href: "/consulting/project-controls" },
    { label: "Dashboards", href: "/consulting/dashboards" },
    { label: "Integrations", href: "/consulting/integrations" },
    { label: "Engineering", href: "/engineering" },
    { label: "Apparel development", href: "/indus-blue#development" },
  ] },
  { label: "EngiVault", href: "/engivault", matches: ["/engivault"], links: [
    { label: "Calculator library", href: "/engivault" },
    { label: "Unit converter", href: "/engivault/unit-converter" },
    { label: "How it was built", href: "/projects/engivault" },
  ] },
  { label: "Indus Blue", href: "/indus-blue", matches: ["/indus-blue"], links: [
    { label: "The label", href: "/indus-blue" },
    { label: "Contract development", href: "/indus-blue#development" },
    { label: "Explore the CAD", href: "/projects/field-01" },
  ] },
  { label: "Blog", href: "/blog", matches: ["/blog"], links: [
    { label: "All articles", href: "/blog" },
  ] },
  { label: "About", href: "/about", matches: ["/about", "/portfolio"], links: [
    { label: "About me", href: "/about" },
    { label: "Experience timeline", href: "/portfolio" },
    { label: "Get in touch", href: "/contact" },
  ] },
];
export function navigationGroup(path: string) {
  return navigationGroups.find(group => group.matches.some(prefix => path === prefix || path.startsWith(prefix + "/")));
}
