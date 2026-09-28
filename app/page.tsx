import { getArticles, formatArticleDate } from "@/lib/articles";
import Link from "next/link";
import Image from "next/image";
import { HomeWorkbench } from "@/components/home-workbench";
import { DemoGallery } from "@/components/demo-gallery";
import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { WorkShowcase, IndusCallout } from "@/components/studio-sections";
export const metadata = {
  title: {
    absolute: "Luqman Ismat | Consulting, Connected Systems & Indus Blue",
  },
  description:
    "Consulting for engineering, project management, project controls, dashboards, and integrations. Apparel collections and contract development through Indus Blue.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Luqman Ismat | Consulting & Product Development",
    description: "Engineering insight, connected systems, and useful work. Based in Houston.",
    url: "/",
    images: [{ url: "/images/editorial/waterwall-social.jpg", width: 1200, height: 630, alt: "Cascading water framed by oak branches in warm evening light" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/editorial/waterwall-social.jpg"] },
};
export default function Home() {
  return (
    <PageShell>
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">
            Independent consulting & product development
          </p>
          <h1>
            Engineering insight.
            <br />
            <span>
              Connected systems.
              <br />
              Useful work.
            </span>
          </h1>
          <p>
            I’m Luqman Ismat. I build the tools, workflows, and products that
            connect technical thinking with the work people do every day.
          </p>
          <div className="action-row">
            <Action href="/projects">Explore the work</Action>
            <Action href="/consulting" secondary>
              Consulting services
            </Action>
          </div>
          <div className="hero-disciplines">
            <span>Systems & software</span>
            <span>Projects & controls</span>
            <span>Apparel & CAD</span>
          </div>
        </div>
        <figure className="home-waterwall">
          <Image src="/images/editorial/waterwall-through-trees.webp"
            alt="A tall cascading waterwall framed by oak branches and warm evening light"
            fill sizes="(max-width: 1024px) 100vw, 50vw" preload />
          <figcaption><span>Rooted in Houston.<br />Built for what’s next.</span><small>Photography by Justin Wolff</small></figcaption>
        </figure>
      </section>
      <section className="site-container home-interactive-intro">
        <div><p className="eyebrow">From ideas to working systems</p><h2>The details make<br />the difference.</h2><p>Explore a schedule, inspect a risk model, or work through a technical calculation. These are the kinds of tools I build around real decisions.</p><Action href="/projects" secondary>Explore the interactive examples</Action></div>
        <HomeWorkbench />
      </section>
      <DemoGallery />
      <section className="site-container services-overview">
        <div className="section-top">
          <div>
            <p className="eyebrow">Built around your work</p>
            <h2>Where I can help.</h2>
          </div>
          <p>
            For teams, founders, and businesses with a process to improve or
            something new to build.
          </p>
        </div>
        <div className="service-index">
          {[
            [
              "01",
              "Project management & controls",
              "Plans, schedules, progress reporting, cost tracking, and clear project handoffs.",
              "/consulting/project-controls",
            ],
            [
              "02",
              "APIs, databases & dashboards",
              "Connect platforms such as Workday to structured databases, traceable reporting, and tools with defined access controls.",
              "/consulting/integrations",
            ],
            [
              "03",
              "Engineering & technical systems",
              "Calculators, internal applications, technical workflows, and CAD support.",
              "/engineering",
            ],
            [
              "04",
              "Indus Blue · Apparel development",
              "An independent label and a development partner for other clothing brands.",
              "/indus-blue",
            ],
          ].map(([n, title, text, href]) => (
            <Link href={href} key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="site-container home-about">
        <div>
          <p className="eyebrow">The person behind the work</p>
          <h2>
            Engineering, analysis,
            <br />
            and a builder’s perspective.
          </h2>
        </div>
        <div>
          <p>
            Industrial engineering graduate. Risk Analyst at Pinnacle.
            Experience across process engineering, safety, piping, reliability,
            and project controls.
          </p>
          <div className="action-row">
            <Action href="/about" secondary>
              About me
            </Action>
            <Action href="/portfolio" secondary>
              Experience timeline
            </Action>
          </div>
        </div>
      </section>
      <WorkShowcase />
      <section className="site-container library-banner">
        <div>
          <p className="eyebrow">ENGiVAULT / Now part of this site</p>
          <h2>Your engineering workspace.</h2>
          <p>
            Run calculations with explicit units, review the method, and convert
            engineering quantities. The actual EngiVault calculation library,
            right here.
          </p>
        </div>
        <div className="action-row">
          <Action href="/engivault">Open EngiVault</Action>
          <Action href="/projects/engivault" secondary>
            Read the case study
          </Action>
        </div>
      </section>
      <IndusCallout />
      <section className="site-container journal-section">
        <div className="section-top">
          <div>
            <p className="eyebrow">From the blog</p>
            <h2>Methods. Decisions. Lessons.</h2>
          </div>
          <Link href="/blog" className="inline-link">
            Browse all {getArticles().length} articles ↗
          </Link>
        </div>
        <div className="journal-grid">
          {getArticles()
            .slice(0, 3)
            .map((article) => (
              <Link key={article.slug} href={article.href}>
                <p className="eyebrow">{article.category}</p>
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <span>{formatArticleDate(article.date)} ↗</span>
              </Link>
            ))}
        </div>
      </section>
      <ProjectCTA title="What needs to work better?" />
    </PageShell>
  );
}
