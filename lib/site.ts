import { navigationGroups } from "./navigation";
export const site = {
  name: "Luqman Ismat",
  url: "https://www.luqmanismat.com",
  email: "Luqman.ismat@gmail.com",
  description:
    "Independent consulting for engineering, project delivery, dashboards, and connected operations. Apparel and product development through Indus Blue.",
};
export const navigation = [{ label: "Home", href: "/" }, ...navigationGroups.map(({label, href}) => ({label, href}))];
export const inquiryServices = {
  consulting: "Consulting & operations",
  engineering: "Engineering systems",
  projects: "Project management & controls",
  dashboards: "Dashboards & reporting",
  integrations: "Automation & integrations",
  apparel: "Indus Blue · Contract development",
  "indus-blue": "Indus Blue · Collection inquiry",
};
