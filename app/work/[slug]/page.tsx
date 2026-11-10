import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { Page } from "@/components/site/footer";
import { Title } from "@/components/site/title";
import { Roll } from "@/components/site/roll";
import { ProductMount } from "@/components/site/product-mount";
import { ProjectVisual } from "@/components/site/project-visual";
import { Calculator } from "@/components/engivault/calculator";
import { UnitConverter } from "@/components/engivault/unit-converter";
import { neighbours } from "@/lib/engivault/catalog";
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
  };
}

/* A panel is the real thing: a view of the mounted application, or one of
   EngiVault's own components. */
function Panel({ kind, view, part }: { kind: "project" | "inspection" | "engivault"; view?: number; part?: string }) {
  if (part === "calculator") {
    const n = neighbours("thermal-transport-numbers");
    return <div className="vault cs-vault"><Calculator slug="thermal-transport-numbers" prev={n.prev} next={n.next} related={[]} /></div>;
  }
  if (part === "converter") return <div className="vault cs-vault"><UnitConverter /></div>;
  if (kind !== "engivault") return <ProductMount kind={kind} label="" view={view} />;
  return null;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const next = products[(products.indexOf(p) + 1) % products.length];
  const accent = { "--accent": p.accent, "--demo-accent": p.accent } as CSSProperties;
  const half = Math.ceil(p.panels.length / 2);
  const bandA = p.panels.slice(0, half);
  const bandB = p.panels.slice(half);

  return (
    <Page className={`cs cs-${p.kind}`}>
      <div style={accent} className="cs-scope">
        <header className="cs-cover" aria-labelledby="cs-title">
          <div className="cs-cover-vis" data-fade>
            <ProjectVisual kind={p.kind} />
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
          {bandA.map((g) => (
            <figure key={g.title} className="cs-fig wide" data-fade>
              <figcaption>
                <span className="label"><b className="acc">(Live)</b> {g.title}</span>
                <span className="label dim">{g.caption}</span>
              </figcaption>
              <Panel kind={p.kind} view={g.view} part={g.part} />
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
          {bandB.map((g) => (
            <figure key={g.title} className="cs-fig wide" data-fade>
              <figcaption>
                <span className="label"><b className="acc">(Live)</b> {g.title}</span>
                <span className="label dim">{g.caption}</span>
              </figcaption>
              <Panel kind={p.kind} view={g.view} part={g.part} />
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
          <div className="cs-next-vis" aria-hidden="true">
            <ProjectVisual kind={next.kind} />
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
