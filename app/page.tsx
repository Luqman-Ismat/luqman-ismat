import Link from "next/link";
import { Page } from "@/components/site/footer";
import { ServicesFocus } from "@/components/site/services-focus";
import { ProjectVisual } from "@/components/site/project-visual";
import { products } from "@/lib/products";
import { Roll } from "@/components/site/roll";
import { Title, SectionHead } from "@/components/site/title";
import { Visuals } from "@/components/site/visuals";
import { services, startingPoints } from "@/lib/services";
import { getArticles, formatArticleDate } from "@/lib/articles";
import { site } from "@/lib/site";
import type { CSSProperties } from "react";

export const metadata = {
  title: { absolute: "TEN21 Consulting | Websites, payments, automation and data in Houston" },
  description:
    "TEN21 Consulting builds websites and apps, payments and booking, AI automation, company knowledge bases, dashboards and integrations. Founded by Luqman Ismat in Houston.",
  alternates: { canonical: "/" },
};


const d = (s: string) => ({ "--d": s }) as CSSProperties;

export default function Home() {
  const articles = getArticles().slice(0, 3);
  return (
    <Page>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <Title as="h1" id="hero-title" text="The technical work your business keeps putting off." pos="tl" className="hero-title" />
          <p className="body" data-intro style={d("0.9s")}>
            TEN21 is a small shop for <b>websites and apps, custom visuals, payments, AI automation, knowledge bases, dashboards and integrations.</b> Bring the job. You get a written scope and a fixed price before anything is built.
          </p>
          <div className="action-row" data-intro style={d("1.05s")}>
            <Link className="btn" href="/contact">
              <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
            </Link>
            <Link className="btn ghost" href="/work">
              <Roll text="See the work" />
            </Link>
          </div>
        </div>
        <div className="hero-meta" data-intro style={d("0.5s")}>
          <span className="label">(Consulting)</span>
          <span className="label">
            <b>Houston, Texas</b>
          </span>
          <span className="label">Founded by Luqman Ismat</span>
        </div>
        <figure className="hero-figure" data-intro style={{ ...d("0.7s"), margin: 0 }}>
          <div className="hero-figure-img mono-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/editorial/waterwall-through-trees-700.webp" width={700} height={875} alt="The Waterwall in Houston seen through oak branches" data-parallax="6" fetchPriority="high" />
          </div>
          <figcaption className="label">(Houston) Photo: Justin Wolff</figcaption>
        </figure>
        <p className="hero-word" data-word>
          <span className="sr-only">TEN21</span>
          {"TEN21".split("").map((c, i) => (
            <span key={i} className="slot" aria-hidden="true">
              <span style={{ "--i": i } as CSSProperties}>{c}</span>
            </span>
          ))}
        </p>
        <div className="hero-foot">
          <span className="label">TEN21 Consulting</span>
          <span className="label">Websites / Visuals / Payments / Automation / Data</span>
          <span className="label">({String(services.length).padStart(2, "0")}) Services</span>
        </div>
      </section>

      <section className="glance" aria-label="At a glance">
        <ul>
          {[
            ["First reply", "2 days"],
            ["Scope and price", "In writing"],
            ["Services", String(services.length).padStart(2, "0")],
            ["Calculators published", "45"],
            ["Vendors you deal with", "1"],
          ].map(([k, v], i) => (
            <li key={k} data-fade data-delay={i * 0.06}>
              <span className="label">{k}</span>
              <span className="stat-v">{v}</span>
            </li>
          ))}
        </ul>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1].map((k) => (
              <span key={k}>
                {services.map((s) => (
                  <span key={s.id} className="ticker-item">
                    {s.name} <i>/</i>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="sec intro g12" aria-label="Introduction">
        <p className="label">
          <span className="spaced">Introduction</span>
        </p>
        <p className="statement" data-lines>
          Most businesses don&apos;t need an agency, a pile of subscriptions and three contractors who never talk to each other. <b>They need one person who can build the site, set up the payments, automate the paperwork and make the numbers add up.</b> That is what TEN21 does.
        </p>
        <p className="body intro-aside" data-fade>
          Run by <b>Luqman Ismat</b>, an industrial engineer who builds software. Years in process engineering, process safety and project controls taught him how real operations work, and where they lose time.
        </p>
        <p className="body intro-aside2" data-fade data-delay="0.1">
          Every job gets a <b>written scope and a fixed price</b> before work starts. Accounts are set up in your name, and you keep the source files.
        </p>
      </section>

      <section className="sec" id="services" aria-labelledby="services-title">
        <SectionHead label="(Services)" id="services-title" title="Eight kinds of work, one point of contact." pos="tr" />
        <ServicesFocus />
      </section>

      <Visuals />

      <section className="sec" id="work" aria-labelledby="work-title">
        <SectionHead label="(Selected work)" id="work-title" title="Complete products, open to try." pos="tl" />
        <ul className="wk-cards">
          {products.map((p, i) => (
            <li key={p.slug} style={{ "--accent": p.accent } as CSSProperties} data-fade data-delay={i * 0.1}>
              <Link href={`/work/${p.slug}`} className="wk-card">
                <span className="wk-vis">
                  <ProjectVisual kind={p.kind} />
                </span>
                <span className="label">
                  ({p.no}) <b className="acc">{p.type}</b>
                </span>
                <span className="wk-name">{p.name}</span>
                <span className="body">{p.line}</span>
                <span className="label wk-go">
                  Open case study <span className="arrow" aria-hidden="true">↗</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="hold-title">
        <SectionHead label="(Built for the second year)" id="hold-title" title="Launch is the easy part." pos="tr" />
        <p className="statement hold-lede" data-lines>
          Anything can look finished on day one. The question is what happens when the person who built it is not in the room: when a price changes, a vendor sunsets an API, a new hire has to learn the tool, or the numbers need to be defended.
        </p>
        <ul className="how hold">
          {[
            ["Your name on the accounts", "Domain, hosting, Stripe, email and data live in accounts you own. If we part ways, nothing stops working and nothing is held hostage."],
            ["Notes a stranger could follow", "Every build ships with plain-language notes: what it does, where it lives, what to do when it breaks. Written for the next person, not for me."],
            ["Numbers you can trace", "Dashboards open the records behind each figure. Calculators show their method. Automations keep a log. If a result cannot be checked, it is not done."],
            ["Edits without a developer", "Text, prices, hours and photos are yours to change from a simple editor. Structural changes are a message away."],
          ].map(([t, d], i) => (
            <li key={t} data-fade data-delay={i * 0.08}>
              <span className="label">(0{i + 1})</span>
              <span className="h-m">{t}</span>
              <p className="body">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="start-title">
        <SectionHead label="(Three ways to start)" id="start-title" title="Small first, if you like." pos="tl" />
        <ul className="rows">
          {startingPoints.slice(0, 3).map((p, i) => (
            <li key={p.name}>
              <span className="label c-no">({String.fromCharCode(65 + i)})</span>
              <span className="h-m c-name">{p.name}</span>
              <p className="body c-text">{p.text}</p>
              <span className="c-end price">{p.price}</span>
            </li>
          ))}
        </ul>
        <div className="action-row">
          <Link className="btn ghost" href="/services">
            <Roll text="All starting points and the process" /> <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="sec" aria-labelledby="journal-title">
        <SectionHead label="(Journal)" id="journal-title" title="Notes from the work." pos="tl" />
        <ul className="jlist">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={a.href}>
                <span className="label j-cat">{a.category}</span>
                <span className="j-title">{a.title}</span>
                <span className="label j-date">{formatArticleDate(a.date)}</span>
                <span className="j-go arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="action-row">
          <Link className="btn ghost" href="/blog">
            <Roll text="All articles" />
          </Link>
        </div>
      </section>

      <section className="sec close" aria-labelledby="close-title">
        <div className="close-row">
          <Title id="close-title" text="Have a job that needs doing?" pos="tl" className="close-title" />
          <div className="close-side">
            <p className="body" data-fade>
              Send a few lines about it. You&apos;ll hear back within two business days, with questions or a first idea of scope and price.
            </p>
            <div className="action-row">
              <Link className="btn" href="/contact">
                <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
              </Link>
              <a className="btn ghost" href={`mailto:${site.email}`}>
                <Roll text="Email" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}
