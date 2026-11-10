export const experience = [
  {
    id: "process",
    role: "Process Engineering",
    employer: "Chemex Global",
    start: "2022-05",
    end: "2024-03",
    kind: "Engineering",
    summary: "Process design for chemical plant packages: PFDs, P&IDs, simulation and the equipment specs that came out of them.",
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
      "Ran the process safety reviews and the change log for a multi-discipline design team, so every change was traced to a decision.",
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
      "Piping specs and material selection, plus the templates that cut the time to issue a deliverable.",
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
    summary: "Turned plant reliability records into analyses and reports that engineers could act on, with the data cleaning that made them trustworthy.",
    details: [
      "Failure and maintenance data preparation and quality review.",
      "Analyses and reports for reliability engineers.",
    ],
  },
  {
    id: "controls",
    role: "Project Controls Consultant",
    employer: "Pinnacle",
    start: "2025-11",
    end: "2026-05",
    kind: "Project controls",
    summary: "Schedule, cost and forecast reporting for capital projects; the work that became the project controls workspace in the portfolio.",
    details: [
      "Schedule reviews, hours mapping and forecast worksheets for client projects.",
      "Reporting that traced every number back to its source record.",
    ],
  },
  {
    id: "risk",
    role: "Risk Analyst",
    employer: "Pinnacle",
    start: "2026-05",
    end: null,
    kind: "Analytics",
    summary: "Inspection and failure risk analysis for asset-intensive plants, which shaped the inspection planning optimizer.",
    details: [
      "Risk-based inspection analysis and decision support.",
      "Life-cycle cost and interval optimisation methods.",
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
