import Link from "next/link";
import {
  PageShell,
  Action,
  Packages,
  ProjectCTA,
} from "@/components/consulting";
import { GarmentViewer } from "@/components/garment-viewer";
export const metadata = {
  title: "Indus Blue | Apparel & Product Development",
  description:
    "Indus Blue is Luqman Ismat's independent apparel label in development, offering technical flats, CAD, tech packs, and product development for other clothing brands.",
  alternates: { canonical: "/indus-blue" },
};
export default function IndusBlue() {
  return (
    <PageShell>
      <section className="indus-hero">
        <div className="indus-hero-copy">
          <p className="eyebrow">
            An independent apparel label by Luqman Ismat
          </p>
          <h1>
            INDUS
            <br />
            BLUE<span className="indus-period">.</span>
          </h1>
          <p className="indus-tagline">
            Considered clothing.
            <br />
            Every detail, developed.
          </p>
          <p>
            Our own line is taking shape. Alongside it, we help other brands
            turn garment ideas into clear, editable development packages.
          </p>
          <div className="action-row">
            <a className="consulting-button" href="#collection">
              Explore the line ↓
            </a>
            <a className="consulting-button secondary" href="#development">
              Develop with us ↗
            </a>
          </div>
        </div>
        <div className="indus-hero-art">
          <GarmentViewer hero compact />
          <div className="indus-study-caption">
            <span>FIELD 01 / DEVELOPMENT STUDY</span>
            <span>CAD / REV A</span>
          </div>
        </div>
      </section>
      <section id="collection" className="site-container indus-collection">
        <div>
          <p className="eyebrow">The label</p>
          <h2>
            A line of our own.
            <br />
            <span>A foundation in the details.</span>
          </h2>
        </div>
        <div>
          <p>
            Indus Blue is an apparel label in development. Field 01 is an early
            exploration of utility, proportion, and construction: a relaxed
            overshirt with a practical pocket layout and a clean button front.
          </p>
          <p>
            Explore the drawings and source files as the work develops. The
            study is not a finished collection, and products are not available
            to purchase yet.
          </p>
          <Link href="/projects/field-01" className="inline-link">
            Explore Field 01 and download the CAD ↗
          </Link>
        </div>
      </section>
      <section id="development" className="indus-development">
        <div className="site-container">
          <div className="section-top">
            <div>
              <p className="eyebrow">For other brands</p>
              <h2>
                Your collection.
                <br />
                Our development support.
              </h2>
            </div>
            <p>
              Bring a sketch, a reference garment, or a brief. Get the drawings
              and documentation needed for a more productive conversation with
              your manufacturer.
            </p>
          </div>
          <div className="development-rows">
            {[
              [
                "01",
                "Define the design",
                "Front and back technical flats, apparel CAD, construction details, colorways, and artwork placement.",
              ],
              [
                "02",
                "Build the specification",
                "Base-size points of measure, target dimensions, material and trim BOMs, and organized tech packs.",
              ],
              [
                "03",
                "Prepare the handoff",
                "Editable files, a PDF drawing set, revision records, and sample-review support scoped to your manufacturer’s process.",
              ],
            ].map(([n, title, text]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <Action href="/contact?service=apparel">Discuss your garment</Action>
        </div>
      </section>
      <Packages
        packages={[
          {
            name: "CAD & technical flats",
            price: "$150",
            label: "One style, clearly defined",
            service: "apparel",
            description:
              "A visual starting point for one straightforward garment.",
            items: [
              "Front and back technical flats",
              "Key construction callouts",
              "One colorway",
              "One consolidated revision round",
              "PDF and agreed editable source",
            ],
          },
          {
            name: "Apparel tech pack",
            price: "$400",
            label: "Prepare for sampling",
            service: "apparel",
            description:
              "An organized development package for one straightforward style.",
            items: [
              "Technical flats and detail views",
              "Base-size measurement sheet",
              "Fabric, trim, and label BOM",
              "Up to three colorways",
              "One revision round and editable files",
            ],
          },
        ]}
        note="Starting prices in USD. Patternmaking, grading, sourcing, physical samples, and additional sample reviews are scoped separately. Manufacturer review and sample approval are required before production."
      />
      <section className="site-container future-note">
        <span className="eyebrow">In development</span>
        <p>
          CLO and 3D garment visualization are planned future capabilities.
          Current apparel packages focus on 2D CAD and technical documentation.
        </p>
      </section>
      <ProjectCTA service="apparel" title="Let’s develop your next garment." />
    </PageShell>
  );
}
