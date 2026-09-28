import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main-content" className="consulting-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
export function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        secondary ? "consulting-button secondary" : "consulting-button"
      }
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}
export function SectionHeading({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{label}</p>
      <div>
        <h2>{title}</h2>
        {children && <p className="section-intro">{children}</p>}
      </div>
    </div>
  );
}
export function ProjectCTA({
  service,
  title = "Let’s make the next step concrete.",
}: {
  service?: string;
  title?: string;
}) {
  return (
    <section className="consulting-wrap project-cta">
      <p className="eyebrow">Start a conversation</p>
      <h2>{title}</h2>
      <div className="cta-bottom">
        <p>
          Send the problem, the starting point, and the deadline. We’ll define a
          useful first deliverable together.
        </p>
        <Action href={service ? `/contact?service=${service}` : "/contact"}>
          Discuss your project
        </Action>
      </div>
    </section>
  );
}
export function EngivaultPreview() {
  return (
    <section className="consulting-wrap section-space">
      <SectionHeading
        label="Selected work / 01"
        title="Engineering, put to work."
      />
      <Link className="case-preview" href="/projects/engivault">
        <div className="case-preview-copy">
          <p className="eyebrow">Flagship independent project</p>
          <h3>ENGiVAULT</h3>
          <p>
            A practical workspace for engineering calculations, technical
            references, and project organization.
          </p>
          <span className="text-link">
            Explore the case study <ArrowUpRight aria-hidden="true" size={20} />
          </span>
          <div className="case-tags">
            <span>Engineering tools</span>
            <span>Data & workflows</span>
            <span>Web application</span>
          </div>
        </div>
        <div className="case-preview-image">
          <Image
            src="/images/consulting/engivault-calculator.png"
            alt="EngiVault calculator with labeled engineering inputs and calculated results"
            width={1440}
            height={1000}
            sizes="(max-width: 800px) 100vw, 65vw"
          />
        </div>
      </Link>
    </section>
  );
}
export type Package = {
  name: string;
  price: string;
  description: string;
  items: string[];
  service: string;
  label: string;
};
export function Packages({
  packages,
  note,
}: {
  packages: Package[];
  note?: string;
}) {
  return (
    <section id="packages" className="consulting-wrap section-space">
      <SectionHeading
        label="Ways to work together"
        title="Start with a defined scope."
      >
        A useful first project, a clear handoff, and room to grow.
      </SectionHeading>
      <div className="package-grid">
        {packages.map((p, i) => (
          <article className="package" key={p.name}>
            <p className="eyebrow">
              0{i + 1} / {p.label}
            </p>
            <h3>{p.name}</h3>
            <p className="package-price">
              {p.price}
              <span>USD · starting price</span>
            </p>
            <p>{p.description}</p>
            <ul>
              {p.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Action
              href={`/contact?service=${p.service}&package=${encodeURIComponent(p.name)}`}
              secondary
            >
              Discuss this package
            </Action>
          </article>
        ))}
      </div>
      <p className="small-note">
        {note ||
          "Starting prices are for the scope described. Final deliverables, timeline, revision rounds, and price are agreed in writing before work begins."}
      </p>
    </section>
  );
}
export function Process({ apparel = false }: { apparel?: boolean }) {
  const steps = apparel
    ? [
        [
          "Define the garment",
          "Share references, intended fit, materials, target size range, and what your manufacturer needs.",
        ],
        [
          "Develop the details",
          "Review the flats and specifications together before the full package is assembled.",
        ],
        [
          "Prepare the handoff",
          "Receive organized files and a clear revision record. Sample review can be scoped as the next step.",
        ],
      ]
    : [
        [
          "Map the real problem",
          "Walk through the current workflow, the people using it, and the information that gets lost along the way.",
        ],
        [
          "Build a useful first version",
          "Review a working prototype early. Validate it with representative inputs and the people doing the work.",
        ],
        [
          "Hand it over clearly",
          "Receive the agreed files, documentation, and a walkthrough. Scope ongoing support separately if needed.",
        ],
      ];
  return (
    <section className="consulting-wrap section-space">
      <SectionHeading
        label="The process"
        title="Clear from the first conversation."
      />
      <ol className="process-grid">
        {steps.map(([title, text], i) => (
          <li key={title}>
            <span className="process-number">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
export function Capabilities({ items }: { items: [string, string][] }) {
  return (
    <div className="capability-list">
      {items.map(([title, description], i) => (
        <div className="capability" key={title}>
          <span className="eyebrow">0{i + 1}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}
export function ServiceLink({
  href,
  number,
  title,
  description,
  tags,
}: {
  href: string;
  number: string;
  title: string;
  description: string;
  tags: string;
}) {
  return (
    <Link href={href} className="service-link">
      <div className="service-link-top">
        <span className="eyebrow">{number}</span>
        <ArrowUpRight size={28} aria-hidden="true" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="service-tags">{tags}</span>
      <span className="text-link">
        Explore services <ArrowRight size={17} aria-hidden="true" />
      </span>
    </Link>
  );
}
