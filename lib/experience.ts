export const experience = [
  {
    id: "process",
    role: "Process Engineering",
    employer: "Chemex Global",
    start: "2022-05",
    end: "2024-03",
    kind: "Engineering",
    summary: "Process design, simulation, and engineering documentation.",
    details: [
      "Piping and instrumentation diagrams, process flow diagrams, and equipment specifications.",
      "Aspen HYSYS simulation and heat-and-material-balance workflows.",
      "Equipment sizing, technical reviews, and startup planning.",
    ],
  },
  {
    id: "safety",
    role: "Process Safety Lead",
    employer: "Chemex Global",
    start: "2023-01",
    end: "2024-08",
    kind: "Engineering",
    summary:
      "Safety workflows, change management, and cross-team coordination.",
    details: [
      "Design change and management-of-change tracking.",
      "Safety review documentation, action follow-up, and reporting.",
      "Coordination between process, piping, and delivery teams.",
    ],
  },
  {
    id: "piping",
    role: "Piping Systems Engineering",
    employer: "Chemex Global",
    start: "2024-03",
    end: "2024-08",
    kind: "Engineering",
    summary:
      "Piping specifications, material selection, and technical documentation.",
    details: [
      "Piping material specifications and component documentation.",
      "Technical review of piping systems and equipment interfaces.",
      "Templates and workflow improvements for engineering deliverables.",
    ],
  },
  {
    id: "reliability",
    role: "Reliability Data Analyst",
    employer: "Pinnacle",
    start: "2025-05",
    end: "2025-11",
    kind: "Analytics",
    summary: "Reliability data, analysis, and reporting.",
    details: [
      "Reliability data analysis and technical reporting.",
      "Data preparation, quality review, and analytical workflows.",
    ],
  },
  {
    id: "controls",
    role: "Project Controls Consultant",
    employer: "Pinnacle",
    start: "2025-11",
    end: "2026-05",
    kind: "Project controls",
    summary: "Project controls consulting.",
    details: [
      "Project Controls Consultant, November 2025 through May 2026.",
      "Explore neutral examples of project visibility, forecasting, and integration workflows in the demo library.",
    ],
  },
  {
    id: "risk",
    role: "Risk Analyst",
    employer: "Pinnacle",
    start: "2026-05",
    end: null,
    kind: "Analytics",
    summary: "Risk analysis and decision support.",
    details: [
      "Current role: Risk Analyst at Pinnacle.",
      "Client-specific assignments and operational information are not included in this portfolio.",
    ],
  },
];
export const toolGroups = [
  {
    label: "Engineering & CAD",
    items: ["AutoCAD", "Aspen HYSYS", "AutoPIPE", "SolidWorks", "CAD/CAM"],
  },
  {
    label: "Software & automation",
    items: ["Python", "JavaScript", "React", "Next.js", "SQL"],
  },
  {
    label: "Analysis & reporting",
    items: ["Power BI", "Excel automation", "R", "Jupyter"],
  },
  {
    label: "Project delivery",
    items: [
      "Primavera P6",
      "InEight",
      "Technical documentation",
      "Project controls",
    ],
  },
];
export function monthNumber(date: string) {
  const [year, month] = date.split("-").map(Number);
  return year * 12 + month - 1;
}
export function experiencePosition(
  start: string,
  end: string | null,
  asOf: string,
) {
  const origin = monthNumber("2022-01");
  const span = monthNumber(asOf) - origin + 1;
  return {
    left: ((monthNumber(start) - origin) / span) * 100,
    width: ((monthNumber(end ?? asOf) - monthNumber(start) + 1) / span) * 100,
  };
}
