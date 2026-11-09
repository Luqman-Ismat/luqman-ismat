import Link from "next/link";
import { Page } from "@/components/site/footer";
import { ServicesFocus } from "@/components/site/services-focus";
import { WorkStrip, type StripItem } from "@/components/site/work-strip";
import { Roll } from "@/components/site/roll";
import { startingPoints, steps, services } from "@/lib/services";
import { getArticles, formatArticleDate } from "@/lib/articles";
import { catalogItems, disciplines } from "@/lib/engivault/catalog";
import { site } from "@/lib/site";
import type { CSSProperties } from "react";

export const metadata = {
  title: { absolute: "TEN21 Consulting | Websites, payments, automation and data in Houston" },
  description:
    "TEN21 Consulting builds websites and apps, payments and booking, AI automation, company knowledge bases, dashboards and integrations. Founded by Luqman Ismat in Houston.",
  alternates: { canonical: "/" },
};

const work: StripItem[] = [
  { src: "/images/consulting/engivault-calculator.png", title: "EngiVault, calculator", note: "Live product", href: "/engivault", alt: "An EngiVault calculator with inputs, results and cited sources" },
  { src: "/images/work/project-controls.webp", title: "Project controls workspace", note: "Demo, synthetic data", href: "/services#dashboards", alt: "A project schedule with a Gantt chart and progress columns" },
  { src: "/images/work/connected-operations.webp", title: "Connected operations", note: "Demo, synthetic data", href: "/services#integrations", alt: "A reconciliation table matching records between two systems" },
  { src: "/images/consulting/engivault-directory.png", title: "EngiVault, library", note: "Live product", href: "/engivault", alt: "The EngiVault library of engineering calculations" },
  { src: "/images/work/inspection-planning.webp", title: "Inspection planning", note: "Demo, synthetic data", href: "/services#engineering", alt: "An inspection planning screen with task counts and filters" },
  { src: "/images/work/risk-workspace.webp", title: "Risk workspace", note: "Demo, synthetic data", href: "/services#dashboards", alt: "A risk dashboard with an exposure chart and a ranked list" },
];

const d = (s: string) => ({ "--d": s }) as CSSProperties;

export default function Home() {
  const articles = getArticles().slice(0, 4);
  return (
    <Page>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-meta" data-intro style={d("0.55s")}>
          <span className="label">(Consulting)</span>
          <span className="label">
            <b>Houston, Texas</b>
          </span>
          <span className="label">Founded by Luqman Ismat</span>
        </div>
        <div className="hero-copy">
          <h1 id="hero-title" className="h-l" data-intro style={d("0.35s")}>
            The technical work your business keeps putting off.
          </h1>
          <p className="body" data-intro style={d("0.6s")}>
            TEN21 is a small shop for <b>websites and apps, payments, AI automation, knowledge bases, dashboards and integrations.</b> Bring the job. You get a written scope and a fixed price before anything is built.
          </p>
          <div className="action-row" data-intro style={d("0.75s")}>
            <Link className="btn" href="/contact">
              <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
            </Link>
            <Link className="btn ghost" href="/services">
              <Roll text="See services" />
            </Link>
          </div>
        </div>
        <figure className="hero-figure" data-intro style={{ ...d("0.9s"), margin: 0 }}>
          <div className="hero-figure-img mono-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/editorial/waterwall-through-trees.webp" alt="The Waterwall in Houston seen through oak branches" data-parallax="6" />
          </div>
          <figcaption className="label">(Houston) Photo: Justin Wolff</figcaption>
        </figure>
        <p className="hero-word" aria-label="TEN21">
          {"TEN21".split("").map((c, i) => (
            <span key={i} className="slot" aria-hidden="true">
              <span style={{ "--i": i } as CSSProperties}>{c}</span>
            </span>
          ))}
        </p>
        <div className="hero-foot">
          <span className="label">TEN21 Consulting</span>
          <span className="label">Websites / Payments / Automation / Data</span>
          <span className="label">({String(services.length).padStart(2, "0")}) Services</span>
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
        <div className="sec-head">
          <p className="label">(Services)</p>
          <h2 id="services-title" className="h-l sec-title" data-lines>
            Seven kinds of work, one point of contact.
          </h2>
        </div>
        <ServicesFocus />
      </section>

      <section className="sec work" id="work" aria-labelledby="work-title">
        <div className="sec-head">
          <p className="label">(Selected work)</p>
          <h2 id="work-title" className="h-l sec-title" data-lines>
            Built and running, or built to show how.
          </h2>
        </div>
        <div data-fade>
          <WorkStrip items={work} />
        </div>
      </section>

      <section className="sec" aria-labelledby="price-title">
        <div className="sec-head">
          <p className="label">(Starting points)</p>
          <h2 id="price-title" className="h-l sec-title" data-lines>
            A clear price before anything is built.
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
        <p className="label after-rows">Websites, payments and larger systems are quoted to scope after a first call.</p>
      </section>

      <section className="sec" aria-labelledby="process-title">
        <div className="sec-head">
          <p className="label">(Process)</p>
          <h2 id="process-title" className="h-l sec-title" data-lines>
            How a job runs.
          </h2>
        </div>
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

      <section className="sec" aria-labelledby="proof-title">
        <div className="proof">
          <div className="proof-img" data-clip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/consulting/engivault-directory.png" alt="The EngiVault calculator library" loading="lazy" />
          </div>
          <div className="proof-copy">
            <p className="label">(Proof of work)</p>
            <h2 id="proof-title" className="h-m" data-lines>
              EngiVault, an engineering calculator library designed, built and run by Luqman.
            </h2>
            <p className="body" data-fade>
              Every calculation shows its inputs and units, writes out the method and cites its sources. It is the standard every client tool is held to.
            </p>
            <dl className="stats" data-fade>
              <div>
                <dt>Calculations</dt>
                <dd>{catalogItems.length}</dd>
              </div>
              <div>
                <dt>Disciplines</dt>
                <dd>{disciplines.length}</dd>
              </div>
              <div>
                <dt>Sign up</dt>
                <dd>None</dd>
              </div>
            </dl>
            <div className="action-row">
              <Link className="btn ghost" href="/engivault">
                <Roll text="Open EngiVault" /> <span className="arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="founder-title">
        <div className="founder">
          <div className="founder-img mono-img" data-clip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/about/luqman-uh-graduation.jpg" alt="Luqman Ismat at the University of Houston" loading="lazy" />
          </div>
          <div className="founder-copy">
            <p className="label" id="founder-title">
              (Founder)
            </p>
            <p className="statement" data-lines>
              <b>Luqman Ismat.</b> Industrial engineer, University of Houston. Process engineering, process safety and project controls, and the software that ties them together. <b>TEN21 is where that work is open to any business.</b>
            </p>
            <Link className="btn ghost" href="/about">
              <Roll text="About Luqman" /> <span className="arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="sec" aria-labelledby="journal-title">
        <div className="sec-head">
          <p className="label">(Journal)</p>
          <h2 id="journal-title" className="h-l sec-title" data-lines>
            Notes from the work.
          </h2>
        </div>
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

      <section className="sec close g12" aria-labelledby="close-title">
        <h2 id="close-title" className="h-xl" data-lines>
          Have a job that needs doing?
        </h2>
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
      </section>
    </Page>
  );
}
