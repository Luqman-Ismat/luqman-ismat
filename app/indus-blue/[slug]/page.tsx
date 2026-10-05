import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/consulting";
import { MotifSwatch, type MotifName } from "@/components/indus/garment-flat";
import { TechPackViewer, SpecTable, PrintButton } from "@/components/indus/tech-pack-viewer";
import { pieces, pieceBySlug, colourways, colourwayById } from "@/lib/indus/collection";
import { Accent } from "@/components/redesign/primitives";

export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const piece = pieceBySlug((await params).slug);
  if (!piece) return {};
  return {
    title: `${piece.name} tech pack · Indus Blue`,
    description: `${piece.code} ${piece.name}: ${piece.type.toLowerCase()}. Technical flats, construction notes, graded measurements and materials for Indus Blue Collection 01.`,
    alternates: { canonical: `/indus-blue/${piece.slug}` },
  };
}

const motifFor = (motif: string): MotifName =>
  motif.toLowerCase().includes("setareh") ? "setareh" : motif.toLowerCase().includes("gol") ? "gol" : motif.toLowerCase().startsWith("kap") ? "kap" : "toi";

export default async function TechPack({ params }: { params: Promise<{ slug: string }> }) {
  const piece = pieceBySlug((await params).slug);
  if (!piece) notFound();
  const i = pieces.indexOf(piece);
  const prev = pieces[(i - 1 + pieces.length) % pieces.length];
  const next = pieces[(i + 1) % pieces.length];
  const cw = colourwayById(piece.defaultColourway);
  return (
    <PageShell>
      <div className="indus-scope tech-pack">
        <header className="site-container tp-head">
          <nav className="tp-crumbs" aria-label="Breadcrumb">
            <Link href="/indus-blue">Indus Blue</Link>
            <span aria-hidden="true">/</span>
            <Link href="/indus-blue#pieces">Collection 01</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{piece.code}</span>
          </nav>
          <div className="tp-title-row">
            <div>
              <p className="section-label"><span>({piece.code})</span>{piece.type}</p>
              <h1 className="tp-title">{piece.name.split(" ")[0]} <Accent>{piece.name.split(" ").slice(1).join(" ") || "·"}</Accent></h1>
            </div>
            <dl className="tp-meta">
              <div><dt>Collection</dt><dd>01 · Pado</dd></div>
              <div><dt>Revision</dt><dd>Rev A</dd></div>
              <div><dt>Status</dt><dd>Development · not sampled</dd></div>
              <div><dt>Base size</dt><dd>M</dd></div>
            </dl>
          </div>
          <p className="tp-line">{piece.line}</p>
        </header>

        <section className="site-container">
          <TechPackViewer piece={piece} />
        </section>

        <section className="site-container tp-grid">
          <div className="tp-block">
            <p className="section-label"><span>(01)</span>Design intent</p>
            <p className="tp-story">{piece.story}</p>
          </div>
          <div className="tp-block">
            <p className="section-label"><span>(02)</span>Silhouette</p>
            <ul className="tp-list">
              {piece.silhouette.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </section>

        <section className="site-container tp-section">
          <p className="section-label"><span>(03)</span>Embroidery · pakka doch</p>
          <div className="emb-grid">
            {piece.embroidery.map((e) => (
              <article key={e.panel}>
                <MotifSwatch className="emb-swatch" name={motifFor(e.motif)} colourway={cw} size={180} />
                <div>
                  <h3>{e.panel}</h3>
                  <p>{e.motif}</p>
                  <p className="mono">{e.area}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="tp-note">Hand embroidery, counted geometric stitching with the ground fully covered. Stitch blocks ≈ 2.2 mm. Mirror (shisha) work where specified.</p>
        </section>

        <section className="site-container tp-section">
          <p className="section-label"><span>(04)</span>Measurement specification</p>
          <SpecTable piece={piece} />
        </section>

        <section className="site-container tp-section">
          <p className="section-label"><span>(05)</span>Bill of materials</p>
          <div className="table-scroll">
            <table className="spec-table bom-table">
              <thead>
                <tr><th>Item</th><th>Specification</th><th>Placement</th><th>Quantity</th></tr>
              </thead>
              <tbody>
                {piece.bom.map((b) => (
                  <tr key={b.item + b.placement}><td>{b.item}</td><td>{b.spec}</td><td>{b.placement}</td><td className="mono">{b.qty}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="site-container tp-section">
          <p className="section-label"><span>(06)</span>Colourways</p>
          <div className="table-scroll">
            <table className="spec-table cw-table">
              <thead>
                <tr><th>Colourway</th><th>Ground</th><th>Thread A (base)</th><th>Thread B</th><th>Thread C (rule)</th><th>Thread D</th></tr>
              </thead>
              <tbody>
                {colourways.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.name}</b> · {c.meaning}</td>
                    {[c.ground, c.threadA, c.threadB, c.threadC, c.threadD].map((h, k) => (
                      <td key={k} className="mono"><i className="hex" style={{ background: h }} />{h}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


        <section className="site-container tp-actions">
          <PrintButton />
          <p>Development specification, Rev A. Not yet sampled or approved for production. Dimensions in centimetres unless noted.</p>
        </section>

        <nav className="site-container tp-pager" aria-label="Other pieces">
          <Link href={`/indus-blue/${prev.slug}`}><span>← {prev.code}</span>{prev.name}</Link>
          <Link href="/indus-blue#pieces" className="tp-pager-all">All pieces</Link>
          <Link href={`/indus-blue/${next.slug}`}><span>{next.code} →</span>{next.name}</Link>
        </nav>
      </div>
    </PageShell>
  );
}
