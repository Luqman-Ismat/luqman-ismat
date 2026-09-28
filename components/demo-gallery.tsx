import Image from "next/image";
import Link from "next/link";
export const demos = [
  {
    slug: "project-controls",
    label: "01 / Project delivery",
    title: "Project control room",
    text: "Explore the Gantt, capacity heatmaps, MS Project import, cost and productivity reporting, and portfolio risk.",
    kind: "schedule",
  },
  {
    slug: "inspection-planning",
    label: "02 / Decision support",
    title: "Inspection planning",
    text: "Run the inspection engine across 36 assessments, compare lifetime curves, and explore task pools and exports.",
    kind: "curve",
  },
  {
    slug: "connected-operations",
    label: "03 / Connected systems",
    title: "Data reconciliation",
    text: "Match sample time entries to a project hierarchy, resolve exceptions, and review applied hours.",
    kind: "flow",
  },
];
export function DemoGallery({ compact = false }: { compact?: boolean }) {
  return (
    <section className="site-container demo-gallery">
      <div className="section-top">
        <div>
          {!compact && <p className="eyebrow">Explore the work</p>}
          <h2>{compact ? "Interactive demos" : "Open it. Change it. See how it works."}</h2>
        </div>
        <p>
          Working examples adapted from my original applications. Every record
          and result shown here is fictional.
        </p>
      </div>
      <div className="demo-gallery-grid">
        {demos.map((d) => (
          <Link href={`/demos/${d.slug}`} key={d.slug}>
            <div className="demo-real-preview"><Image src={`/images/work/${d.slug}.webp`} alt={`${d.title} running with fictional data`} width={1200} height={833} sizes="(max-width: 760px) 100vw, 33vw" /></div>
            <p className="eyebrow">{d.label}</p>
            <h3>
              {d.title}
              <span aria-hidden="true">↗</span>
            </h3>
            <p>{d.text}</p>
            <span className="demo-link-label">Try the demo</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
