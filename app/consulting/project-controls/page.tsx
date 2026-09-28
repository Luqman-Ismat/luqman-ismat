import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { PageIntro, DeliveryProcess } from "@/components/studio-sections";
import Link from "next/link";
export const metadata = {
  title: "Project management & controls",
  description:
    "Plans, schedules, cost tracking, and reporting systems built around how your team actually delivers.",
  alternates: { canonical: "/consulting/project-controls" },
};
export default function Page() {
  return (
    <PageShell>
      <PageIntro
        label="Project management & controls"
        title="A clear view of the work ahead."
        text="Plans, schedules, cost tracking, and reporting systems built around how your team actually delivers."
      >
        <Action href="/contact?service=projects">Discuss your project</Action>
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
            Start with your current schedule, reporting pack, or a project that
            needs structure. We will agree the decision the system must support,
            the data available, and the first useful deliverable.
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
              A delivery plan with milestones, owners, dependencies, and a
              practical reporting rhythm.
            </li>
            <li>
              Progress and cost reporting with agreed definitions, baseline
              comparisons, and exception views.
            </li>
            <li>
              Risk, change, and action registers that connect decisions to the
              people responsible.
            </li>
            <li>
              Handoff documentation and a walkthrough so your team can run the
              process.
            </li>
          </ul>
        </div>
      </section>
      <DeliveryProcess />
      <ProjectCTA service="projects" />
    </PageShell>
  );
}
