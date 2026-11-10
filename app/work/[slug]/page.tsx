import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { Page } from "@/components/site/footer";
import { Title } from "@/components/site/title";
import { Roll } from "@/components/site/roll";
import { ProductMount } from "@/components/site/product-mount";
import { LiveGantt } from "@/components/site/live-gantt";
import { CostCurves } from "@/components/site/cost-curves";
import { PlantSchematic } from "@/components/engivault/plant-schematic";
import { hotspots } from "@/lib/engivault/catalog";
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
    description: `${p.line} A ${p.type.toLowerCase()} by TEN21 Consulting.`.slice(0, 158),
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { images: [{ url: p.cover }] },
  };
}

/* Each project's own live visual, drawn by code. */
function HeroVisual({ kind }: { kind: string }) {
  if (kind === "project") return <LiveGantt />;
  if (kind === "inspection") return <CostCurves />;
  return <PlantSchematic hotspots={hotspots} />;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const next = products[(products.indexOf(p) + 1) % products.length];
  const accent = { "--accent": p.accent, "--demo-accent": p.accent } as CSSProperties;
  const half = Math.ceil(p.gallery.length / 2);
  const bandA = p.gallery.slice(0, half);
  const bandB = p.gallery.slice(half);

  return (
    <Page className={`cs cs-${p.kind}`}>
      <div style={accent} className="cs-scope">
        <header className="cs-cover" aria-labelledby="cs-title">
          <div className="cs-cover-img" data-clip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.cover} alt={p.coverAlt} width={1200} height={833} data-parallax="8" fetchPriority="high" />
          </div>
          <div className="cs-cover-top">
            <Link className="label" href="/work">
              ← Work
            </Link>
            <span className="label">
              ({p.no}) <b className="acc">{p.type}</b>
            </span>
          </div>
          <div className="cs-cover-bottom">
            <Title as="h1" id="cs-title" text={p.name} pos="tl" className="cs-title" />
            <p className="cs-line" data-fade>
              {p.line}
            </p>
          </div>
        </header>

        <section className="sec cs-spec" aria-label="Project details">
          <div className="cs-meta" data-fade>
            <p className="label">(Year)</p>
            <p className="cs-v">{p.year}</p>
            <p className="label">(Built with)</p>
            <p className="cs-v">{p.built.join(", ")}</p>
          </div>
          <div className="cs-features">
            <p className="label">(Features)</p>
            <ul>
              {p.features.map((f) => (
                <li key={f} data-fade>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <dl className="cs-facts">
            {p.facts.map((f, i) => (
              <div key={f.k} data-fade data-delay={i * 0.06}>
                <dt className="label">{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="sec cs-desc" aria-label="Description">
          <p className="label cs-k">
            <span className="spaced">Description</span>
          </p>
          <p className="statement" data-lines>
            {p.description}
          </p>
          <figure className="cs-live" data-fade>
            <HeroVisual kind={p.kind} />
            <figcaption className="label">
              {p.kind === "project" && "A schedule drawn by code. Move the status date."}
              {p.kind === "inspection" && "Life-cycle cost against interval. Move across it."}
              {p.kind === "engivault" && "The library's map. Each item opens its calculation."}
            </figcaption>
          </figure>
        </section>

        <section className="sec cs-cs" aria-label="Challenge">
          <p className="label cs-k">
            <span className="spaced">Challenge</span>
          </p>
          <p className="statement" data-lines>
            {p.challenge}
          </p>
        </section>
        <div className="cs-band">
          {bandA.map((g, i) => (
            <figure key={g.src} className={i === 0 ? "cs-fig wide" : "cs-fig"} data-clip data-delay={i * 0.08}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.alt} width={1200} height={833} loading="lazy" />
              <figcaption className="label">{g.caption}</figcaption>
            </figure>
          ))}
        </div>

        <section className="sec cs-cs" aria-label="Solution">
          <p className="label cs-k">
            <span className="spaced">Solution</span>
          </p>
          <p className="statement" data-lines>
            {p.solution}
          </p>
        </section>
        <div className="cs-band">
          {bandB.map((g, i) => (
            <figure key={g.src} className={i === bandB.length - 1 ? "cs-fig wide" : "cs-fig"} data-clip data-delay={i * 0.08}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.alt} width={1200} height={833} loading="lazy" />
              <figcaption className="label">{g.caption}</figcaption>
            </figure>
          ))}
        </div>

        {p.kind !== "engivault" ? (
          <section className="product-app" aria-label={`${p.name}, working application`}>
            <div className="product-app-bar">
              <span className="label">
                <b className="acc">(Live application)</b> Fictional data. Try: {p.tryThis[0]}
              </span>
              <Link className="label" href={`/examples/${p.kind}/index.html?theme=dark`} target="_blank" data-no-curtain>
                Open full screen <span className="arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
            <ProductMount kind={p.kind} label={p.name} />
          </section>
        ) : (
          <section className="sec cs-open" aria-label="Open the product">
            <p className="label">
              <b className="acc">(Live product)</b> Free, no account
            </p>
            <ol className="cs-try">
              {p.tryThis.map((t, i) => (
                <li key={t}>
                  <span className="label">0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <Link className="btn" href={p.live!.href}>
              <Roll text={p.live!.label} /> <span className="arrow" aria-hidden="true">↗</span>
            </Link>
          </section>
        )}

        <section className="sec cs-end" aria-label="Related services">
          <p className="label">(Related services)</p>
          <ul className="cs-related">
            {p.services.map((id) => {
              const s = services.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  <Link href={`/services#${id}`}>
                    <span className="label">({s.no})</span>
                    <Roll text={s.name} />
                    <span className="arrow" aria-hidden="true">↗</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link className="btn" href={`/contact?service=${p.services[0]}&package=${encodeURIComponent(p.name)}`}>
            <Roll text="Start a project like this" /> <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </section>

        <Link href={`/work/${next.slug}`} className="cs-next" style={{ "--accent": next.accent } as CSSProperties}>
          <div className="cs-next-img" data-clip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={next.cover} alt="" width={1200} height={833} loading="lazy" data-parallax="6" />
          </div>
          <div className="cs-next-copy">
            <span className="label">(Next project)</span>
            <span className="cs-next-name">
              <Roll text={next.name} />
            </span>
            <span className="label acc">
              ({next.no}) {next.type} <span className="arrow" aria-hidden="true">↗</span>
            </span>
          </div>
        </Link>
      </div>
    </Page>
  );
}
