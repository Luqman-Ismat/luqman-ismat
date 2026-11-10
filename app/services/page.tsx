import Link from "next/link";
import { Page } from "@/components/site/footer";
import { SectionIndex } from "@/components/site/section-index";
import { Glyph } from "@/components/site/glyphs";
import { Roll } from "@/components/site/roll";
import { Title, SectionHead } from "@/components/site/title";
import { services, startingPoints, steps } from "@/lib/services";

export const metadata = {
  title: "Services",
  description:
    "Websites, Stripe payments and booking, AI automation, knowledge bases, dashboards, integrations and engineering tools. Scope and price agreed first.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text="If it runs on a computer, bring it here." pos="tl" className="page-title" />
        <p className="label page-label">(Services) {String(services.length).padStart(2, "0")}</p>
        <p className="body lede" data-fade>
          Eight kinds of work that usually need eight different vendors. <b>Each one starts with a written scope and a fixed price.</b>
        </p>
      </header>

      <div className="sec svc-layout">
        <SectionIndex items={services.map((s) => ({ id: s.id, no: s.no, label: s.short }))} />
        <div className="svc-list">
          {services.map((s) => (
            <section key={s.id} id={s.id} className="svc" aria-labelledby={`${s.id}-title`}>
              <div className="svc-top">
                <p className="label">({s.no}) / {String(services.length).padStart(2, "0")}</p>
                <Title id={`${s.id}-title`} text={s.name} pos="tl" className="svc-title" />
                <Glyph id={s.id} className="svc-glyph" />
                <p className="statement" data-lines>
                  <b>{s.line}</b> {s.detail}
                </p>
              </div>
              <div className="svc-body">
                <ul className="ticks" data-fade>
                  {s.deliverables.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className="svc-meta" data-fade data-delay="0.1">
                  <div>
                    <p className="label">(Starting point)</p>
                    <p className="v">{s.start}</p>
                  </div>
                  <div>
                    <p className="label">(Usually with)</p>
                    <div className="tools">
                      {s.tools.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <Link className="btn" href={`/contact?service=${s.id}`}>
                    <Roll text="Start this" /> <span className="arrow" aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="sec" aria-labelledby="price-title">
        <SectionHead label="(Starting points)" id="price-title" title="Not sure which one you need? Start small." pos="tr" />
        <ul className="rows">
          {startingPoints.map((p, i) => (
            <li key={p.name}>
              <span className="label c-no">({String.fromCharCode(65 + i)})</span>
              <span className="h-m c-name">{p.name}</span>
              <p className="body c-text">{p.text}</p>
              <span className="c-end price">{p.price}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="process-title">
        <SectionHead label="(Process)" id="process-title" title="How a job runs." pos="tl" />
        <ol className="rows">
          {steps.map((s, i) => (
            <li key={s.name}>
              <span className="label c-no">(0{i + 1})</span>
              <span className="h-m c-name">{s.name}</span>
              <p className="body c-text">{s.text}</p>
              <span className="label c-end">
                {i + 1} / {steps.length}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec close" aria-labelledby="close-title">
        <div className="close-row">
          <Title id="close-title" text="Tell me what's slow, broken or missing." pos="tl" className="close-title" />
          <div className="close-side">
            <p className="body">A short call is free. You get a written scope before you pay for anything.</p>
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
