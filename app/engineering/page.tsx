import Image from "next/image";
import {
  PageShell,
  Action,
  Capabilities,
  ProjectCTA,
} from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
export const metadata = {
  title: "Engineering Systems & CAD Support",
  description:
    "Engineering calculators, technical workflows, CAD support, and internal applications designed around reviewable inputs and useful outputs.",
  alternates: { canonical: "/engineering" },
};
export default function Engineering() {
  return (
    <PageShell>
      <PageIntro
        label="Consulting / Engineering systems"
        title={
          <>
            Technical knowledge.
            <br />
            <span>Practical tools.</span>
          </>
        }
        text="Turn repeatable engineering work into calculators, connected records, and internal applications. Keep the assumptions visible and the handoff clear."
      >
        <Action href="/contact?service=engineering">
          Discuss your technical workflow
        </Action>
      </PageIntro>
      <section className="site-container engineering-proof">
        <div>
          <p className="eyebrow">Flagship independent product</p>
          <h2>ENGiVAULT</h2>
          <p>
            A working example of engineering methods translated into software,
            with labeled inputs, calculation results, references, and project
            workflows.
          </p>
          <Action href="/projects/engivault" secondary>
            Inside the system
          </Action>
        </div>
        <Image
          src="/images/consulting/engivault-calculator.png"
          width={1440}
          height={1000}
          alt="EngiVault calculator with engineering inputs and results"
          loading="eager"
          sizes="(max-width:760px) 100vw, 65vw"
        />
      </section>
      <section className="site-container compact-section">
        <Capabilities
          items={[
            [
              "Calculations & technical workflows",
              "Structured inputs, explicit units, reviewable assumptions, and output formats that fit your team's process.",
            ],
            [
              "Internal applications & databases",
              "Connect technical records, project information, and reusable methods in an application built around the work.",
            ],
            [
              "CAD & design documentation",
              "Models, drawings, and technical documentation developed to an agreed scope and your team's design standards.",
            ],
            [
              "Validation & handoff",
              "Check the agreed examples with your technical reviewer and deliver source files, setup notes, and a walkthrough.",
            ],
          ]}
        />
        <p className="small-note">
          Engineering assumptions and outputs require review by your designated
          technical authority before operational use. Professional sign-off and
          regulated design services are not included unless separately agreed
          with an appropriately qualified provider.
        </p>
        <div className="action-row">
          <Action href="/consulting#packages" secondary>
            Consulting packages
          </Action>
          <Action href="/consulting">Project controls & integrations</Action>
        </div>
      </section>
      <ProjectCTA
        service="engineering"
        title="What is your team still doing by hand?"
      />
    </PageShell>
  );
}
