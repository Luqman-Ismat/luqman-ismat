import { IntegrationStory } from "@/components/integration-story";
import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { PageIntro, DeliveryProcess } from "@/components/studio-sections";
import Link from "next/link";
export const metadata = {
  title: "API integrations, databases & automation",
  description:
    "Custom API integrations, PostgreSQL databases, and connected reporting. Practical experience bringing Workday data into project controls, with access and operational visibility designed into the workflow.",
  alternates: { canonical: "/consulting/integrations" },
};
export default function Page() {
  return (
    <PageShell>
      <PageIntro
        label="API integrations, databases & automation"
        title="Connect the work between your tools."
        text="Custom API integrations, PostgreSQL databases, and connected reporting. Practical experience bringing Workday data into project controls, with access and operational visibility designed into the workflow."
      >
        <Action href="/contact?service=integrations">
          Discuss your project
        </Action>
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
            Start with the manual handoff: exporting a spreadsheet, copying
            records, or reconciling two tools. Integration scope depends on each
            system’s API, access permissions, and update limits. Those are
            checked before implementation.
          </p>
          <div className="service-links">
            <Link href="/consulting">All services & packages</Link>
            <Link href="/demos/connected-operations">
              Try an interactive example ↗
            </Link>
          </div>
        </div>
        <div>
          <h2>What we can deliver</h2>
          <ul>
            <li>
              A map of systems, data ownership, permissions, and the workflow to
              automate.
            </li>
            <li>
              API connections, scheduled syncs, or event-driven updates where
              your systems support them.
            </li>
            <li>
              Validation, duplicate handling, error reporting, and a clear
              recovery process.
            </li>
            <li>
              Documentation, operating instructions, and agreed support
              boundaries.
            </li>
          </ul>
        </div>
      </section>
      <IntegrationStory />
      <section className="site-container consulting-domains">
        <article id="databases"><div><p className="eyebrow">The data foundation</p><h2>Design the database<br />behind the dashboard.</h2></div><div><h3>Database design & data engineering</h3><p>Define how records relate, which system owns each field, and how updates reach the application. The model should support both everyday reporting and the questions that follow it.</p><ul className="deliverables"><li>Relational models, stable identifiers, and source-to-destination mappings</li><li>SQL queries, database migrations, and reporting aggregates</li><li>Import validation, duplicate handling, and reconciliation checks</li><li>Refresh history, error visibility, and documented recovery procedures</li></ul></div></article>
        <article id="security"><div><p className="eyebrow">Access & security</p><h2>Control who can see<br />and change the data.</h2></div><div><h3>Security-conscious application development</h3><p>My application work includes authentication guards and project-scoped access checks. For each engagement, I define access boundaries alongside the API and database design, then test the agreed behavior.</p><ul className="deliverables"><li>Server-side credential handling and least-privilege access design</li><li>Authentication, role permissions, and project-level authorization</li><li>Input validation and parameterized database operations</li><li>Operational logs that support investigation without exposing secrets</li><li>Documented access, retention, and deployment requirements</li></ul><p className="small-note">Application security engineering is part of the implementation scope. Independent penetration testing and formal compliance certification are separate specialist engagements.</p></div></article>
      </section>
      <DeliveryProcess />
      <ProjectCTA service="integrations" />
    </PageShell>
  );
}
