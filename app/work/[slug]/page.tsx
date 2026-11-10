import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/components/site/footer";
import { Title } from "@/components/site/title";
import { Roll } from "@/components/site/roll";
import { ProductMount } from "@/components/site/product-mount";
import { products, productBySlug } from "@/lib/products";
import { services } from "@/lib/services";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.line} A complete working application by TEN21 Consulting, running on fictional data.`.slice(0, 158),
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { images: [{ url: p.image }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const next = products[(products.indexOf(p) + 1) % products.length];
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text={p.name} pos="tl" className="page-title" />
        <p className="label page-label">({p.no}) Complete product</p>
        <p className="body lede" data-fade>
          {p.line} <b>Everything below is the working application.</b> All names, dates, amounts and records are fictional.
        </p>
      </header>

      <section className="sec product-facts" style={{ paddingTop: "clamp(48px, 6vw, 90px)" }} aria-label="About this product">
        <div data-fade>
          <p className="label">(What it is)</p>
          <p className="body" style={{ marginTop: 10 }}>{p.what}</p>
        </div>
        <div data-fade data-delay="0.05">
          <p className="label">(Inside)</p>
          <ul>
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div data-fade data-delay="0.1">
          <p className="label">(Try this)</p>
          <ol>
            {p.tryThis.map((f, i) => (
              <li key={f}>
                <span className="label">0{i + 1}</span> {f}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="product-app" aria-label={`${p.name}, working application`}>
        <div className="product-app-bar">
          <span className="label">(Live application) Fictional data</span>
          <span className="label">Built with {p.built.join(", ")}</span>
          <Link className="label" href={`/examples/${p.kind}/index.html?theme=dark`} target="_blank" data-no-curtain>
            Open full screen <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
        <ProductMount kind={p.kind} label={p.name} />
      </section>

      <section className="sec close" aria-labelledby="close-title">
        <div className="close-row">
          <Title id="close-title" text="Want something like this, built around your data?" pos="tl" className="close-title" />
          <div className="close-side">
            <p className="body">
              Related services:{" "}
              {p.services.map((id, i) => {
                const s = services.find((x) => x.id === id)!;
                return (
                  <span key={id}>
                    <Link className="text-link" href={`/services#${id}`}>{s.short}</Link>
                    {i < p.services.length - 1 ? ", " : "."}
                  </span>
                );
              })}
            </p>
            <div className="action-row">
              <Link className="btn" href={`/contact?service=${p.services[0]}&package=${encodeURIComponent(p.name)}`}>
                <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
              </Link>
              <Link className="btn ghost" href={`/work/${next.slug}`}>
                <Roll text={`Next: ${next.short}`} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
