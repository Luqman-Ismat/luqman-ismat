import Link from "next/link";
import { PageShell } from "@/components/consulting";
import type { Chapter } from "@/lib/chapters";
import { hotspots } from "@/lib/engivault/catalog";
import { StageClient } from "./stage-client";
import { ComponentSection } from "./component-section";
import { BrandFrame } from "./brand-frame";
import { Accent } from "@/components/redesign/primitives";

const n = (i: number) => String(i + 1).padStart(2, "0");

/* A chapter: the exploded station, then each of its parts as a live,
   explained component, then how to engage. */
export function ChapterPage({ chapter, children }: { chapter: Chapter; children?: React.ReactNode }) {
  const parts = chapter.components.map((c, i) => ({ id: c.id, n: n(i), title: c.title }));
  const live = chapter.components.some((c) => c.kind === "project-view" || c.kind === "inspection");
  const body = (
    <div className="site-container cmp-list">
      {chapter.components.map((c, i) => (
        <ComponentSection key={c.id} c={c} n={n(i)} hotspots={c.kind === "calculators" ? hotspots : undefined} />
      ))}
    </div>
  );
  return (
    <PageShell>
      <section className="ch-hero">
        <div className="ch-stage" aria-hidden="true"><StageClient station={chapter.station} parts={parts} /></div>
        <div className="site-container ch-copy">
          <p className="section-label"><span>({chapter.index})</span>{chapter.kicker}</p>
          <h1 className="ch-title">{chapter.title} <Accent>{chapter.accent}</Accent></h1>
          <p className="ch-lede">{chapter.lede}</p>
        </div>
        <nav className="site-container ch-index" aria-label={`${chapter.nav} components`}>
          <ol>
            {parts.map((p) => (
              <li key={p.id}><a href={`#${p.id}`}><span>{p.n}</span>{p.title}</a></li>
            ))}
          </ol>
          <p>{live ? "Working components with fictional data. Everything runs in your browser." : "Select a part to jump to it."}</p>
        </nav>
      </section>

      {chapter.components.length > 0 && (live ? <BrandFrame>{body}</BrandFrame> : children ?? body)}

      {chapter.packages && (
        <section className="site-container ch-engage" id="engage">
          <p className="section-label"><span>(→)</span>Work together</p>
          <div className="ch-engage-grid">
            <h2 className="x-title">Start with a <Accent>defined scope.</Accent></h2>
            {chapter.packages.map((p) => (
              <article key={p.name} className="ch-package">
                <p className="eyebrow">{p.label}</p>
                <h3>{p.name}</h3>
                <p className="ch-price">{p.price}</p>
                <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="ch-engage-foot">
            <p>Starting prices in USD. No work begins without written deliverables, timing and price.</p>
            <Link href={`/contact?service=${chapter.service}`} className="pill pill-accent"><span className="pill-text">Discuss your project</span><span className="pill-icon" aria-hidden="true">↗</span></Link>
          </div>
        </section>
      )}
    </PageShell>
  );
}
