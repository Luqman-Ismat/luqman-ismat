import {
  PageShell,
  Action,
  Packages,
  ProjectCTA,
} from "@/components/consulting";
import { PageIntro, DeliveryProcess } from "@/components/studio-sections";
import { WorkflowDemo } from "@/components/workflow-demo";
export const metadata = {
  title: "Consulting | Projects, Dashboards & Connected Systems",
  description:
    "Project management, project controls, custom dashboards, live integrations, automation, and engineering systems for teams across industries.",
  alternates: { canonical: "/consulting" },
};
export default function Consulting() {
  return (
    <PageShell>
      <nav
        className="site-container service-links"
        aria-label="Consulting services"
      >
        <a href="/consulting/project-controls">Project management & controls</a>
        <a href="/consulting/dashboards">Dashboards & reporting</a>
        <a href="/consulting/integrations">APIs, databases & integrations</a>
        <a href="/engineering">Engineering systems</a>
      </nav>
      <PageIntro
        label="Consulting / From process to working system"
        title={
          <>
            Make the work
            <br />
            <span>easier to run.</span>
          </>
        }
        text="For a growing business, a project team, or a specialist with too much manual work. Get practical support with project delivery, reporting, automation, and the tools that connect it all."
      >
        <Action href="/contact?service=consulting">
          Discuss your workflow
        </Action>
      </PageIntro>
      <section className="site-container consulting-domains">
        <article id="project-delivery">
          <div>
            <p className="eyebrow">01 / Project delivery</p>
            <h2>
              Keep the plan,
              <br />
              cost, and progress
              <br />
              in the same picture.
            </h2>
          </div>
          <div>
            <h3>Project management & project controls</h3>
            <p>
              Build a practical framework for planning, coordinating, and
              reporting the work. Support can focus on a single project or the
              process your team uses across projects.
            </p>
            <ul className="deliverables">
              <li>
                Work breakdowns, schedules, milestones, and action tracking
              </li>
              <li>Cost reports, forecasts, budgets, and change registers</li>
              <li>Progress measurement and management reporting</li>
              <li>Risk, issue, decision, and document registers</li>
              <li>Meeting cadence, ownership, and handoff processes</li>
            </ul>
            <Action href="/contact?service=projects" secondary>
              Discuss project support
            </Action>
          </div>
        </article>
        <article id="connected-systems">
          <div>
            <p className="eyebrow">02 / Connected operations</p>
            <h2>
              Your data.
              <br />
              One useful view.
            </h2>
          </div>
          <div>
            <h3>APIs, databases & connected dashboards</h3>
            <p>
              Replace repetitive exports and disconnected spreadsheets with a
              system designed around the decisions you need to make. My Workday integration connects enterprise records to PostgreSQL, reconciliation workflows, and project reporting.
            </p>
            <ul className="deliverables">
              <li>Custom management, operational, and project dashboards</li>
              <li>
                Connections to approved APIs, databases, and business tools
              </li>
              <li>
                Scheduled refreshes, event-driven updates, and exception alerts
              </li>
              <li>Spreadsheet automation, reporting, and data cleanup</li>
              <li>
                Internal applications, permissions, and documented handoffs
              </li>
            </ul>
            <p className="small-note">
              Refresh frequency and live updates depend on source-system access,
              API limits, and the agreed architecture.
            </p>
            <Action href="/consulting/integrations" secondary>
              Discuss an integration
            </Action>
          </div>
        </article>
        <article id="technical-systems">
          <div>
            <p className="eyebrow">03 / Technical work</p>
            <h2>
              Engineering logic.
              <br />
              Usable tools.
            </h2>
          </div>
          <div>
            <h3>Engineering systems & design support</h3>
            <p>
              Translate recurring calculations and technical methods into
              structured, reviewable tools. Develop CAD and documentation
              alongside your team’s standards and review process.
            </p>
            <ul className="deliverables">
              <li>Engineering calculators and validation workflows</li>
              <li>Technical databases, references, and internal tools</li>
              <li>CAD models, drawings, and design documentation</li>
            </ul>
            <Action href="/engineering" secondary>
              Explore engineering
            </Action>
          </div>
        </article>
      </section>
      <section className="demo-section">
        <div className="site-container">
          <div className="section-top">
            <div>
              <p className="eyebrow">An example of the handoff</p>
              <h2>
                See the decision,
                <br />
                not just the data.
              </h2>
            </div>
            <p>
              An interactive project-controls example. Change the view to see
              how a dashboard can surface exceptions. All data below is
              illustrative.
            </p>
          </div>
          <WorkflowDemo />
        </div>
      </section>
      <Packages
        packages={[
          {
            name: "Workflow review",
            price: "$250",
            label: "Define the first step",
            service: "consulting",
            description:
              "Map one process and identify a useful starting scope.",
            items: [
              "Focused discovery session",
              "Current process and friction points",
              "Prioritized recommendations",
              "A written implementation scope",
            ],
          },
          {
            name: "Dashboard or automation sprint",
            price: "$1,500+",
            label: "Improve one workflow",
            service: "dashboards",
            description:
              "Build a focused dashboard, report, or automation with agreed inputs.",
            items: [
              "One clearly defined workflow",
              "Prototype using representative data",
              "Agreed validation checks",
              "Working files and handoff",
            ],
          },
          {
            name: "Custom system",
            price: "$3,000+",
            label: "Connect the moving parts",
            service: "integrations",
            description:
              "Develop an internal application or connected reporting system.",
            items: [
              "Agreed screens, data model, and integrations",
              "Access and refresh requirements",
              "Core workflow testing",
              "Source files and setup documentation",
            ],
          },
        ]}
        note="Starting prices in USD. Project management and ongoing controls support are quoted to scope. Hosting, third-party subscriptions, data migration, and ongoing maintenance are agreed separately. No work begins without written deliverables, timing, and price."
      />
      <DeliveryProcess />
      <ProjectCTA
        service="consulting"
        title="Start with the process that slows you down."
      />
    </PageShell>
  );
}
