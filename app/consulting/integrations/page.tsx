import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { PageIntro, DeliveryProcess } from "@/components/studio-sections";
import Link from "next/link";
export const metadata = {
  title: "Automation & live integrations",
  description:
    "Reduce repetitive entry, connect data sources, and build dependable workflows between the systems your business uses.",
  alternates: { canonical: "/consulting/integrations" },
};
export default function Page() {
  return (
    <PageShell>
      <PageIntro
        label="Automation & live integrations"
        title="Connect the work between your tools."
        text="Reduce repetitive entry, connect data sources, and build dependable workflows between the systems your business uses."
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
      <DeliveryProcess />
      <ProjectCTA service="integrations" />
    </PageShell>
  );
}
