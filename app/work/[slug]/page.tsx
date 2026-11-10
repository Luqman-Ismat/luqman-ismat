import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { Page } from "@/components/site/footer";
import { Title } from "@/components/site/title";
import { Roll } from "@/components/site/roll";
import { SectionIndex } from "@/components/site/section-index";
import { ProductMount } from "@/components/site/product-mount";
import { ProjectVisual } from "@/components/site/project-visual";
import { CostCurves } from "@/components/site/cost-curves";
import { RankBars, ScenarioCompare, SheetDraw } from "@/components/site/inspection-visuals";
import { Calculator } from "@/components/engivault/calculator";
import { UnitConverter } from "@/components/engivault/unit-converter";
import { VaultCatalog } from "@/components/engivault/catalog";
import { PlantSchematic } from "@/components/engivault/plant-schematic";
import { catalogItems, hotspots, neighbours } from "@/lib/engivault/catalog";
import { products, productBySlug, type Chapter } from "@/lib/products";
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
    description: `${p.line} A ${p.type.toLowerCase()} by TEN21 Consulting, shown chapter by chapter, live.`.slice(0, 158),
    alternates: { canonical: `/work/${p.slug}` },
  };
}

/* A chapter's live piece: a bare view of the mounted app, one of EngiVault's
   own components, or a code-drawn visual. Never a screenshot. */
function Live({ kind, c }: { kind: "project" | "inspection" | "engivault"; c: Chapter }) {
  if (c.view != null && kind !== "engivault") return <ProductMount kind={kind} label={c.title} view={c.view} />;
  switch (c.part) {
    case "curves":
      return <CostCurves variant={1} />;
    case "rankings":
      return <RankBars />;
    case "scenarios":
      return <ScenarioCompare />;
    case "export":
      return <SheetDraw />;
    case "catalog":
      return (
        <div className="vault cs-vault">
          <VaultCatalog items={catalogItems} />
        </div>
      );
    case "calculator": {
      const n = neighbours("thermal-transport-numbers");
      return (
        <div className="vault cs-vault">
          <Calculator slug="thermal-transport-numbers" prev={n.prev} next={n.next} related={[]} />
        </div>
      );
    }
    case "converter":
      return (
        <div className="vault cs-vault">
          <UnitConverter />
        </div>
      );
    case "schematic":
      return <PlantSchematic hotspots={hotspots} initial={hotspots[2]?.id ?? null} />;
  }
  return null;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  const next = products[(products.indexOf(p) + 1) % products.length];
  const accent = { "--accent": p.accent, "--demo-accent": p.accent } as CSSProperties;
  const index = [
    { id: "cs-brief", no: "--", label: "Brief" },
    ...p.chapters.map((c, i) => ({ id: `ch-${c.id}`, no: String(i + 1).padStart(2, "0"), label: c.title })),
    { id: "cs-together", no: "--", label: "All together" },
  ];

  return (
    <Page className={`cs cs-${p.kind}`}>
      <div style={accent} className="cs-scope">
        <header className="cs-cover" aria-labelledby="cs-title">
          <div className="cs-cover-top">
            <Link className="label" href="/work">
              ← Work
            </Link>
            <span className="label">
              ({p.no}) <b className="acc">{p.type}</b> / {p.year}
            </span>
          </div>
          <div className="cs-cover-vis" data-fade>
            <ProjectVisual kind={p.kind} />
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
            <p className="label">(Chapters)</p>
            <p className="cs-v">{p.chapters.length}, shown live</p>
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

        <div className="sec cs-body">
          <SectionIndex items={index} title="(Chapters)" />
          <div className="cs-main">
            <section id="cs-brief" className="cs-brief" aria-label="Brief">
              <p className="label cs-k">
                <span className="spaced">Brief</span>
              </p>
              <p className="statement" data-lines>
                {p.description}
              </p>
              <div className="cs-two">
                <div data-fade>
                  <p className="label acc">(The problem)</p>
                  <p className="body">{p.challenge}</p>
                </div>
                <div data-fade data-delay="0.1">
                  <p className="label acc">(The idea)</p>
                  <p className="body">{p.solution}</p>
                </div>
              </div>
            </section>

            {p.chapters.map((c, i) => (
              <section key={c.id} id={`ch-${c.id}`} className="ch" aria-labelledby={`ch-${c.id}-t`}>
                <div className="ch-head">
                  <p className="label">
                    <b className="acc">({String(i + 1).padStart(2, "0")})</b> / {String(p.chapters.length).padStart(2, "0")}
                  </p>
                  <Title id={`ch-${c.id}-t`} text={c.title} pos="tl" className="ch-title" />
                  <p className="ch-q" data-lines>
                    {c.question}
                  </p>
                </div>
                <div className="ch-live" data-fade>
                  <Live kind={p.kind} c={c} />
                </div>
                <div className="ch-text">
                  <p className="body" data-fade>
                    {c.text}
                  </p>
                  <ol className="ch-steps" data-fade data-delay="0.1">
                    {c.steps.map((s, k) => (
                      <li key={s}>
                        <span className="label acc">0{k + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ))}

            <section id="cs-together" className="cs-together" aria-labelledby="together-t">
              <div className="ch-head">
                <p className="label">
                  <b className="acc">(End)</b> All together
                </p>
                <Title id="together-t" text={p.together.title} pos="tl" className="ch-title" />
                <p className="body" data-fade>
                  {p.together.text}
                </p>
              </div>
              {p.kind !== "engivault" ? (
                <div className="product-app cs-app">
                  <div className="product-app-bar">
                    <span className="label">
                      <b className="acc">(Live application)</b> Fictional data. Try: {p.tryThis[0]}
                    </span>
                    <Link className="label" href={`/examples/${p.kind}/index.html?theme=dark`} target="_blank" data-no-curtain>
                      Open full screen <span className="arrow" aria-hidden="true">↗</span>
                    </Link>
                  </div>
                  <ProductMount kind={p.kind} label={p.name} />
                </div>
              ) : (
                <div className="cs-open">
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
                </div>
              )}
              <ul className="cs-take">
                {p.takeaways.map((t, i) => (
                  <li key={t} data-fade data-delay={i * 0.08}>
                    <span className="label acc">(0{i + 1})</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

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
