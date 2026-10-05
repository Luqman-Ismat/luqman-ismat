import Link from "next/link";
import { PageShell, Action, Packages } from "@/components/consulting";
import { GarmentFlat, MotifSwatch, type MotifName } from "@/components/indus/garment-flat";
import { PieceShowcase } from "@/components/indus/piece-showcase";
import { pieces, colourways, colourwayById } from "@/lib/indus/collection";
import { Words, Accent } from "@/components/redesign/primitives";

export const metadata = {
  title: "Indus Blue | Collection 01 & Apparel Development",
  description:
    "Indus Blue Collection 01: oversized, asymmetric garments built on Balochi garment structure and pakka doch embroidery. Full development tech packs, plus apparel development for other brands.",
  alternates: { canonical: "/indus-blue" },
};

const anatomy: { term: string; gloss: string; text: string; motif: MotifName }[] = [
  { term: "Jig", gloss: "Chest yoke", text: "The large embroidered panel that covers the chest, carrying the densest work on the garment.", motif: "setareh" },
  { term: "Toi", gloss: "Central strip", text: "A patterned strip running through the jig. Here it follows the offset placket line.", motif: "toi" },
  { term: "Banzar", gloss: "Cuffs", text: "Two embroidered sleeve bands, worked on a separate cuff piece and joined.", motif: "gol" },
  { term: "Pado", gloss: "Pocket panel", text: "A long, narrow pocket running from just above the waist to the hem.", motif: "kap" },
];

export default function IndusBlue() {
  const hero = colourwayById("shab");
  return (
    <PageShell>
      <div className="indus-scope">
        <section className="ib-hero">
          <div className="ib-hero-copy">
            <p className="section-label"><span>(IB)</span>Indus Blue · Collection 01 · Pado</p>
            <h1 className="ib-title" aria-label="Indus Blue">
              <span className="x-line" data-reveal><span>Indus</span></span>
              <span className="x-line" data-reveal style={{ ["--delay" as string]: "120ms" }}><span><Accent>Blue</Accent></span></span>
            </h1>
            <p className="ib-lede" data-reveal>
              Balochi structure. <Accent>Oversized, asymmetric volume.</Accent>
            </p>
            <p data-reveal>
              Four garments built on the panels of Baloch dress (jig, toi, banzar and pado) and cut long, wide and uneven. Every piece has a full development tech pack.
            </p>
            <div className="x-actions" data-reveal>
              <a className="pill pill-accent" href="#pieces"><span className="pill-text">See the pieces</span><span className="pill-icon" aria-hidden="true">↓</span></a>
              <a className="pill pill-ghost" href="#development"><span className="pill-text">Develop with us</span><span className="pill-icon" aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="ib-hero-art" data-reveal>
            <GarmentFlat className="ib-hero-flat" slug="pashk-coat" view="front" mode="technical" colourway={hero} title="Pashk Coat front technical flat" />
            <div className="ib-hero-tag">
              <span>IB-01 · Pashk Coat</span>
              <span>Technical flat · Rev A</span>
            </div>
          </div>
        </section>

        <section className="site-container ib-section ib-anatomy">
          <header className="x-section-head">
            <p className="section-label"><span>(01)</span>The structure</p>
            <h2 className="x-title" data-reveal>
              <Words text="Four panels," /> <Accent>one grammar.</Accent>
            </h2>
            <p data-reveal>
              A Baloch dress always carries embroidery in four places. Doch is pakka work: the ground cloth disappears under counted geometric stitching. The collection keeps that grammar and moves it onto new cuts.
            </p>
          </header>
          <div className="anatomy-grid">
            {anatomy.map((a, i) => (
              <article key={a.term} data-reveal style={{ ["--delay" as string]: `${i * 80}ms` }}>
                <MotifSwatch className="anatomy-swatch" name={a.motif} colourway={colourways[i % colourways.length]} />
                <p className="piece-code">0{i + 1}</p>
                <h3>{a.term} <span>{a.gloss}</span></h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pieces" className="site-container ib-section">
          <header className="x-section-head">
            <p className="section-label"><span>(02)</span>Collection 01</p>
            <h2 className="x-title" data-reveal>
              <Words text="Cut long, wide" /> <Accent>and uneven.</Accent>
            </h2>
            <p data-reveal>
              Hover a garment to turn it. Change the colourway. Each one opens into its full tech pack: flats, construction, graded measurements and materials.
            </p>
          </header>
          <div className="piece-list">
            {pieces.map((p, i) => <PieceShowcase key={p.slug} piece={p} index={i} />)}
          </div>
        </section>

        <section className="site-container ib-section">
          <header className="x-section-head">
            <p className="section-label"><span>(03)</span>Colourways</p>
            <h2 className="x-title" data-reveal>
              <Words text="Four grounds," /> <Accent>four threads each.</Accent>
            </h2>
          </header>
          <div className="cw-grid">
            {colourways.map((c, i) => (
              <article key={c.id} className="cw-card" data-reveal style={{ ["--delay" as string]: `${i * 70}ms`, background: c.ground, color: i >= 2 ? "#141414" : "#f3ecdb" }}>
                <MotifSwatch className="cw-card-motif" name="setareh" colourway={c} size={160} />
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.meaning}</p>
                </div>
                <ul aria-label={`${c.name} threads`}>
                  {[c.threadA, c.threadB, c.threadC, c.threadD].map((t) => <li key={t} style={{ background: t }} title={t} />)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="site-container ib-status">
          <p className="eyebrow">Status</p>
          <p>
            Collection 01 is in development. The tech packs are development specifications (Rev A): not yet sampled, graded on a fitted body, or approved for production. Pieces are not available to buy yet.
          </p>
        </section>
      </div>

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
              The tech packs above are the deliverable. Bring a sketch, a reference garment, or a brief, and get the drawings and documentation needed for a productive conversation with your manufacturer.
            </p>
          </div>
          <div className="development-rows">
            {[
              ["01", "Define the design", "Front and back technical flats, rendered colourways, construction details, and embroidery or artwork placement."],
              ["02", "Build the specification", "Points of measure with size grading, tolerances, material and trim BOMs, and organised tech packs."],
              ["03", "Prepare the handoff", "Editable files, a PDF drawing set, revision records, and sample-review support scoped to your manufacturer’s process."],
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
            description: "A visual starting point for one straightforward garment.",
            items: ["Front and back technical flats", "Key construction callouts", "One colorway", "One consolidated revision round", "PDF and agreed editable source"],
          },
          {
            name: "Apparel tech pack",
            price: "$400",
            label: "Prepare for sampling",
            service: "apparel",
            description: "An organized development package for one straightforward style.",
            items: ["Technical flats and detail views", "Base-size measurement sheet", "Fabric, trim, and label BOM", "Up to three colorways", "One revision round and editable files"],
          },
        ]}
        note="Starting prices in USD. Patternmaking, grading, sourcing, physical samples, and additional sample reviews are scoped separately. Manufacturer review and sample approval are required before production."
      />
      <section className="site-container future-note">
        <span className="eyebrow">See the format</span>
        <p>
          Open any Collection 01 tech pack, for example the <Link href="/indus-blue/pashk-coat">Pashk Coat</Link>, to see exactly what a development package includes.
        </p>
      </section>
    </PageShell>
  );
}
