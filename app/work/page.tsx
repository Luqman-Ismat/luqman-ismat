import Link from "next/link";
import type { CSSProperties } from "react";
import { Page } from "@/components/site/footer";
import { Title } from "@/components/site/title";
import { Roll } from "@/components/site/roll";
import { products } from "@/lib/products";
import { ProjectVisual } from "@/components/site/project-visual";

export const metadata = {
  title: "Work",
  description: "Projects by Luqman Ismat at TEN21: a project controls workspace, an inspection planning optimizer and the EngiVault calculator library. Open and use them.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text="Work you can open and use." pos="tl" className="page-title" />
        <p className="label page-label">(Work) {String(products.length).padStart(2, "0")}</p>
        <p className="body lede" data-fade>
          Complete applications, not screenshots. <b>Two run in your browser on fictional records</b>; one is a live public tool. Click through, change things, see what happens.
        </p>
      </header>
      <section className="sec" style={{ paddingTop: "clamp(56px, 7vw, 110px)" }} aria-label="Projects">
        <ul className="wk">
          {products.map((p, i) => (
            <li key={p.slug} style={{ "--accent": p.accent } as CSSProperties}>
              <Link href={`/work/${p.slug}`} className={i % 2 ? "wk-item flip" : "wk-item"}>
                <span className="wk-vis" data-fade>
                  <ProjectVisual kind={p.kind} />
                </span>
                <span className="wk-copy">
                  <span className="label">
                    ({p.no}) <b className="acc">{p.type}</b> / {p.year}
                  </span>
                  <span className="wk-name">
                    <Roll text={p.name} />
                  </span>
                  <span className="body">{p.line}</span>
                  <span className="wk-tags">
                    {p.features.slice(1, 5).map((f) => (
                      <span key={f}>{f}</span>
                    ))}
                  </span>
                  <span className="label wk-go">
                    Open case study <span className="arrow" aria-hidden="true">↗</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="sec close" aria-labelledby="close-title">
        <div className="close-row">
          <Title id="close-title" text="Want one of these for your business?" pos="tl" className="close-title" />
          <div className="close-side">
            <p className="body">The same care, applied to your process, your data and your people.</p>
            <div className="action-row">
              <Link className="btn" href="/contact">
                <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
