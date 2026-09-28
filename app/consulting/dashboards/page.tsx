import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { PageIntro, DeliveryProcess } from "@/components/studio-sections";
import Link from "next/link";
export const metadata = {
  title: "Custom dashboards & reporting",
  description:
    "Bring scattered project, business, and technical data into one useful view. Built for your team, your measures, and your decisions.",
  alternates: { canonical: "/consulting/dashboards" },
};
export default function Page() {
  return (
    <PageShell>
      <PageIntro
        label="Custom dashboards & reporting"
        title="See what needs your attention."
        text="Bring scattered project, business, and technical data into one useful view. Built for your team, your measures, and your decisions."
      >
        <Action href="/contact?service=dashboards">Discuss your project</Action>
      </PageIntro>
      <section className="site-container service-landing-body">
        <div>
          <p className="eyebrow">A useful starting point</p>
          <h2>
            Define the decision.
            <br />
            Build the right system.
          </h2>
          <p>
            A dashboard should answer a real question. Start with the report you
            assemble repeatedly or the decision that is slowed by disconnected
            data. We will define a focused first version before expanding it.
          </p>
          <div className="service-links">
            <Link href="/consulting">All services & packages</Link>
            <Link href="/demos/project-controls">
              Try an interactive example ↗
            </Link>
          </div>
        </div>
        <div>
          <h2>What we can deliver</h2>
          <ul>
            <li>
              A review of source data, metric definitions, refresh requirements,
              and access needs.
            </li>
            <li>
              Interactive reporting with filters, comparisons, drill-downs, and
              exception views.
            </li>
            <li>
              A documented data model that keeps calculations consistent across
              reports.
            </li>
            <li>
              Clear ownership, refresh behavior, and a handoff your team can
              maintain.
            </li>
          </ul>
        </div>
      </section>
      <DeliveryProcess />
      <ProjectCTA service="dashboards" />
    </PageShell>
  );
}
