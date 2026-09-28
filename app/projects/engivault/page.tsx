import Image from "next/image";
import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
export const metadata = {
  title: "EngiVault | Engineering Software Case Study",
  description:
    "How EngiVault connects engineering calculators, technical references, exports, and project workflows in one working application.",
  alternates: { canonical: "/projects/engivault" },
};
export default function EngiVault() {
  return (
    <PageShell>
      <PageIntro
        label="Selected work / Independent product"
        title={
          <>
            ENGiVAULT<span className="title-period">.</span>
          </>
        }
        text="Engineering calculations, technical references, and project workflows brought into one working product."
      >
        <div className="action-row">
          <Action href="/engivault">Open the engineering workspace</Action>
          <Action href="/contact?service=engineering" secondary>
            Build a system like this
          </Action>
        </div>
      </PageIntro>
      <div className="site-container case-facts">
        <div>
          <span>Discipline</span>
          <strong>Engineering software</strong>
        </div>
        <div>
          <span>Work</span>
          <strong>Product, interface & implementation</strong>
        </div>
        <div>
          <span>Context</span>
          <strong>Independent product</strong>
        </div>
      </div>
      <figure className="site-container product-case-image">
        <Image
          src="/images/consulting/engivault-directory.png"
          alt="EngiVault calculator library organized by category with search"
          width={1440}
          height={1000}
          loading="eager"
          sizes="(max-width:1440px) 100vw, 1320px"
        />
        <figcaption>
          Public product capture / Calculator directory / September 2026
        </figcaption>
      </figure>
      <section className="site-container consulting-domains">
        <article>
          <div>
            <p className="eyebrow">The problem</p>
            <h2>
              A result without
              <br />
              context is hard
              <br />
              to review.
            </h2>
          </div>
          <div>
            <p>
              Engineering calculations often sit apart from the methods, units,
              and reference material that explain them. Moving between
              spreadsheets and separate documents makes repeatable work harder
              to follow.
            </p>
            <p>
              EngiVault puts the calculation and its context in one interface.
              The directory helps users find a tool; the workspace keeps inputs,
              outputs, and references together.
            </p>
          </div>
        </article>
      </section>
      <section className="case-calculator site-container">
        <Image
          src="/images/consulting/engivault-calculator.png"
          alt="Thermal transport calculator with units and Reynolds, Prandtl, and Péclet results"
          width={1440}
          height={1000}
          sizes="(max-width:760px) 100vw, 65vw"
        />
        <div>
          <p className="eyebrow">Inside the workflow</p>
          <h2>
            Inputs. Method.
            <br />
            Result. Handoff.
          </h2>
          <p>
            The thermal transport calculator collects fluid properties, speed,
            and characteristic length. Results retain their units and can be
            reviewed alongside the method.
          </p>
          <p>
            Supported exports turn a calculation into a useful handoff, rather
            than a number copied out of a browser.
          </p>
        </div>
      </section>
      <section className="site-container compact-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">What was built</p>
            <h2>A connected workflow.</h2>
          </div>
        </div>
        <div className="development-rows">
          {[
            [
              "01",
              "Find & calculate",
              "A searchable calculator library, labeled inputs, units, validation, and method references.",
            ],
            [
              "02",
              "Review & export",
              "Browser-local calculation history and supported PDF, Excel, or JSON exports for downstream work.",
            ],
            [
              "03",
              "Organize & integrate",
              "Authenticated project and task persistence, with documented same-origin calculation endpoints.",
            ],
          ].map(([n, title, text]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="case-evidence">
          Capabilities were reviewed against the project source and public
          interface in September 2026. This is an independent product, not a
          client engagement; no client savings or adoption figures are claimed.
        </p>
      </section>
      <ProjectCTA
        service="consulting"
        title="Your workflow could be the next useful tool."
      />
    </PageShell>
  );
}
