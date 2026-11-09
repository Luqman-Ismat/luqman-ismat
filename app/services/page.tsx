import Link from "next/link";
import { Page } from "@/components/site/footer";
import { SectionIndex } from "@/components/site/section-index";
import { Glyph } from "@/components/site/glyphs";
import { Roll } from "@/components/site/roll";
import { services, startingPoints } from "@/lib/services";

export const metadata = {
  title: "Services: websites, payments, automation, knowledge bases, dashboards, integrations",
  description:
    "What TEN21 Consulting builds: websites and apps, Stripe payments and booking, AI automation, company knowledge bases, dashboards, integrations and engineering tools. Scope and price agreed first.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <Page>
      <header className="page-head">
        <p className="label">(Services)</p>
        <h1 className="h-xl" data-lines>
          If it runs on a computer, bring it here.
        </h1>
        <p className="statement lede" data-lines data-delay="0.15">
          Seven kinds of work that usually need seven different vendors. <b>Each one starts with a written scope and a fixed price.</b>
        </p>
      </header>

      <div className="sec svc-layout">
        <SectionIndex items={services.map((s) => ({ id: s.id, no: s.no, label: s.short }))} />
        <div className="svc-list">
          {services.map((s) => (
            <section key={s.id} id={s.id} className="svc" aria-labelledby={`${s.id}-title`}>
              <div className="svc-top">
                <p className="label">({s.no}) / 07</p>
                <h2 id={`${s.id}-title`} className="h-l" data-lines>
                  {s.name}
                </h2>
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
        <div className="sec-head">
          <p className="label">(Starting points)</p>
          <h2 id="price-title" className="h-l sec-title" data-lines>
            Not sure which one you need? Start small.
          </h2>
        </div>
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

      <section className="sec close g12" aria-labelledby="close-title">
        <h2 id="close-title" className="h-xl" data-lines>
          Tell me what&apos;s slow, broken or missing.
        </h2>
        <div className="close-side">
          <p className="body">A short call is free. You get a written scope before you pay for anything.</p>
          <Link className="btn" href="/contact">
            <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </Page>
  );
}
