import { getArticles, formatArticleDate } from "@/lib/articles";
import Link from "next/link";
import Image from "next/image";
import { HomeWorkbench } from "@/components/home-workbench";
import { GarmentViewer } from "@/components/garment-viewer";
import { PageShell } from "@/components/consulting";
import { Reveal, Words, Accent, SectionLabel, Marquee, PillLink } from "@/components/redesign/primitives";
import { ServiceIndex, SpotlightGrid, Magnetic } from "@/components/redesign/interactive";
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

const services = [
  {
    n: "01",
    title: "Project management & controls",
    text: "Plans, schedules, progress reporting, cost tracking, and clear project handoffs.",
    href: "/consulting/project-controls",
    tags: ["Schedules", "Cost & progress", "Handoffs"],
    image: "/images/work/project-controls.webp",
  },
  {
    n: "02",
    title: "APIs, databases & dashboards",
    text: "Connect platforms such as Workday to structured databases, traceable reporting, and tools with defined access controls.",
    href: "/consulting/integrations",
    tags: ["Integrations", "Data models", "Reporting"],
    image: "/images/work/connected-operations.webp",
  },
  {
    n: "03",
    title: "Engineering & technical systems",
    text: "Calculators, internal applications, technical workflows, and CAD support.",
    href: "/engineering",
    tags: ["Calculators", "Internal tools", "CAD"],
    image: "/images/consulting/engivault-calculator.png",
  },
  {
    n: "04",
    title: "Indus Blue · Apparel development",
    text: "An independent label and a development partner for other clothing brands.",
    href: "/indus-blue",
    tags: ["Garment CAD", "Tech packs", "Development"],
    image: "/images/consulting/hoodie-flat.svg",
  },
];

export default function Home() {
  const articles = getArticles();
  return (
    <PageShell>
      <section className="x-hero">
        <div className="site-container x-hero-meta" data-reveal>
          <span>Independent consulting & product development</span>
          <span>Houston, TX · 29.76° N, 95.37° W</span>
          <span>Engineering → Systems → Products</span>
        </div>
        <div className="x-hero-stage">
          <h1 className="x-hero-name" aria-label="Luqman Ismat">
            <span className="x-line" data-reveal><span>Luqman</span></span>
            <span className="x-line x-line-indent" data-reveal style={{ ["--delay" as string]: "120ms" }}>
              <span>
                <Accent>Ismat</Accent>
                <span className="x-hero-asterisk" aria-hidden="true">✺</span>
              </span>
            </span>
          </h1>
          <Reveal className="x-hero-copy" delay={420}>
            <p className="x-hero-statement">
              Engineering insight. Connected systems. <Accent>Useful work.</Accent>
            </p>
            <p>
              I build the tools, workflows, and products that connect technical
              thinking with the work people do every day.
            </p>
            <div className="x-actions">
              <PillLink href="/projects" cursor="View">Explore the work</PillLink>
              <PillLink href="/consulting" variant="ghost">Consulting services</PillLink>
            </div>
          </Reveal>
        </div>
        <div className="site-container x-hero-grid">
          <Reveal as="figure" className="x-hero-figure" delay={360}>
            <Image
              src="/images/editorial/waterwall-through-trees.webp"
              alt="A tall cascading waterwall framed by oak branches and warm evening light"
              fill
              sizes="(max-width: 900px) 100vw, 75vw"
              preload
            />
            <figcaption>
              <span>Rooted in Houston. Built for what’s next.</span>
              <small>Photo · Justin Wolff</small>
            </figcaption>
          </Reveal>
          <Reveal className="x-hero-index" delay={460}>
            <p className="eyebrow">Index</p>
            <ol>
              <li><Link href="#services">Services <span>01</span></Link></li>
              <li><Link href="#work">Selected work <span>02</span></Link></li>
              <li><Link href="#lab">Interactive lab <span>03</span></Link></li>
              <li><Link href="#about">About <span>04</span></Link></li>
              <li><Link href="#journal">Journal <span>05</span></Link></li>
            </ol>
          </Reveal>
        </div>
      </section>

      <Marquee
        items={[
          "Project controls",
          "Schedules & cost",
          "Dashboards",
          "Workday → database",
          "System integrations",
          "Engineering calculators",
          "Process safety",
          "Reliability",
          "Apparel CAD",
        ]}
      />

      <section id="services" className="site-container x-section">
        <header className="x-section-head">
          <SectionLabel index="01">Where I can help</SectionLabel>
          <h2 data-reveal className="x-title">
            <Words text="Built around the way" /> <Accent>your work</Accent> <Words text="actually runs." start={200} />
          </h2>
          <p data-reveal>
            For teams, founders, and businesses with a process to improve or
            something new to build.
          </p>
        </header>
        <ServiceIndex services={services} />
      </section>

      <section id="work" className="site-container x-section">
        <header className="x-section-head">
          <SectionLabel index="02">Selected work</SectionLabel>
          <h2 data-reveal className="x-title">
            <Words text="Built, not just" /> <Accent>proposed.</Accent>
          </h2>
          <p data-reveal>
            Working examples adapted from my original applications. Every
            record and result in the demos is fictional.
          </p>
        </header>
        <SpotlightGrid className="bento">
          <Link href="/demos/project-controls" className="spot bento-card bento-a" data-reveal data-cursor="Try it">
            <div className="bento-media"><Image src="/images/work/project-controls.webp" alt="Project control room demo with schedule and capacity views" fill sizes="(max-width: 900px) 100vw, 60vw" /></div>
            <div className="bento-meta"><span>01 / Project delivery</span><h3>Project control room</h3><p>Gantt, capacity heatmaps, MS Project import, cost and productivity reporting.</p></div>
          </Link>
          <Link href="/demos/inspection-planning" className="spot bento-card bento-b" data-reveal data-cursor="Try it" style={{ ["--delay" as string]: "80ms" }}>
            <div className="bento-media"><Image src="/images/work/inspection-planning.webp" alt="Inspection planning demo with risk assessments" fill sizes="(max-width: 900px) 100vw, 40vw" /></div>
            <div className="bento-meta"><span>02 / Decision support</span><h3>Inspection planning</h3></div>
          </Link>
          <Link href="/demos/connected-operations" className="spot bento-card bento-c" data-reveal data-cursor="Try it" style={{ ["--delay" as string]: "160ms" }}>
            <div className="bento-media"><Image src="/images/work/connected-operations.webp" alt="Reconciliation layer for connected operations data" fill sizes="(max-width: 900px) 100vw, 40vw" /></div>
            <div className="bento-meta"><span>03 / Connected systems</span><h3>API data & reconciliation</h3></div>
          </Link>
          <Link href="/projects/engivault" className="spot bento-card bento-d" data-reveal data-cursor="Read">
            <div className="bento-media is-contain"><Image src="/images/consulting/engivault-calculator.png" alt="EngiVault calculator with engineering inputs and results" fill sizes="(max-width: 900px) 100vw, 40vw" /></div>
            <div className="bento-meta"><span>Engineering software</span><h3>ENGiVAULT</h3><p>Calculations, references, and project workflows in one product.</p></div>
          </Link>
          <div className="spot bento-card bento-e" data-reveal style={{ ["--delay" as string]: "80ms" }}>
            <div className="bento-garment"><GarmentViewer compact /></div>
            <Link href="/projects/field-01" className="bento-meta"><span>Indus Blue / Development study</span><h3>FIELD 01 ↗</h3></Link>
          </div>
          <Link href="/blog" className="spot bento-card bento-f" data-reveal data-cursor="Read" style={{ ["--delay" as string]: "160ms" }}>
            <span className="bento-count">{articles.length}</span>
            <div className="bento-meta"><span>Journal</span><h3>Articles on methods, decisions & lessons</h3></div>
          </Link>
        </SpotlightGrid>
        <div className="x-row-end"><PillLink href="/projects" variant="ghost">View all work</PillLink></div>
      </section>

      <section id="lab" className="x-lab">
        <div className="site-container x-lab-grid">
          <div>
            <SectionLabel index="03">Interactive lab</SectionLabel>
            <h2 data-reveal className="x-title">
              <Words text="The details make" /> <Accent>the difference.</Accent>
            </h2>
            <p data-reveal>
              Explore a schedule, inspect a risk model, or work through a
              technical calculation. These are the kinds of tools I build
              around real decisions.
            </p>
            <PillLink href="/projects" variant="accent">Open the examples</PillLink>
          </div>
          <Reveal className="x-lab-frame"><HomeWorkbench /></Reveal>
        </div>
      </section>

      <section className="x-vault">
        <div className="site-container x-vault-grid">
          <div className="x-vault-copy">
            <p className="section-label"><span>(✦)</span>ENGiVAULT · Now part of this site</p>
            <h2 data-reveal className="x-title">
              <Words text="Your engineering" /> <Accent>workspace.</Accent>
            </h2>
            <p data-reveal>
              Run calculations with explicit units, review the method, and
              convert engineering quantities. The actual EngiVault calculation
              library, right here.
            </p>
            <div className="x-actions">
              <PillLink href="/engivault" variant="accent">Open EngiVault</PillLink>
              <PillLink href="/projects/engivault" variant="ghost">Read the case study</PillLink>
            </div>
          </div>
          <Reveal className="x-vault-screens">
            <div><Image src="/images/consulting/engivault-calculator.png" alt="EngiVault calculator screen" width={1440} height={1000} sizes="(max-width: 900px) 90vw, 45vw" /></div>
            <div><Image src="/images/consulting/engivault-directory.png" alt="EngiVault calculator directory screen" width={1440} height={1000} sizes="(max-width: 900px) 90vw, 35vw" /></div>
          </Reveal>
        </div>
        <Marquee reverse items={["Explicit units", "Reviewable methods", "Unit conversion", "Fluid mechanics", "Heat transfer", "Psychrometrics"]} />
      </section>

      <section className="site-container x-section x-process">
        <header className="x-section-head">
          <SectionLabel index="✦">How we work</SectionLabel>
          <h2 data-reveal className="x-title">
            <Words text="A clear scope." /> <Accent>A working result.</Accent>
          </h2>
        </header>
        <ol className="process-steps">
          {[
            ["Understand", "Map the current process, the people involved, and the result you need."],
            ["Build & review", "Test a useful first version with your real inputs. Resolve the details together."],
            ["Handoff", "Receive the agreed files, documentation, and walkthrough. Define support before launch."],
          ].map(([title, text], i) => (
            <Reveal as="li" key={title} delay={i * 90}>
              <span className="process-n">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="about" className="site-container x-section x-about">
        <Reveal as="figure" className="x-about-figure">
          <Image src="/images/luqman-portrait-blue.jpeg" alt="Portrait of Luqman Ismat" fill sizes="(max-width: 900px) 100vw, 34vw" />
        </Reveal>
        <div className="x-about-copy">
          <SectionLabel index="04">The person behind the work</SectionLabel>
          <h2 data-reveal className="x-title">
            <Words text="Engineering, analysis, and a" /> <Accent>builder’s perspective.</Accent>
          </h2>
          <p data-reveal>
            Industrial engineering graduate. Risk Analyst at Pinnacle.
            Experience across process engineering, safety, piping, reliability,
            and project controls.
          </p>
          <div className="x-actions">
            <PillLink href="/about" variant="ghost">About me</PillLink>
            <PillLink href="/portfolio" variant="ghost">Experience timeline</PillLink>
          </div>
        </div>
      </section>

      <section className="x-indus">
        <div className="site-container x-indus-grid">
          <div>
            <p className="section-label"><span>(✦)</span>The apparel practice</p>
            <h2 className="x-indus-title" data-reveal>
              Indus <Accent>Blue</Accent>
            </h2>
          </div>
          <div className="x-indus-copy" data-reveal>
            <p className="x-indus-lede">Our own line. Your next collection.</p>
            <p>
              An independent apparel label in development, with CAD and
              technical development services for other brands.
            </p>
            <Magnetic>
              <Link href="/indus-blue" className="round-cta" data-cursor="Enter">
                Explore
                <br />
                Indus Blue
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      <section id="journal" className="site-container x-section">
        <header className="x-section-head x-head-row">
          <div>
            <SectionLabel index="05">From the journal</SectionLabel>
            <h2 data-reveal className="x-title">
              <Words text="Methods. Decisions." /> <Accent>Lessons.</Accent>
            </h2>
          </div>
          <PillLink href="/blog" variant="ghost">{`All ${articles.length} articles`}</PillLink>
        </header>
        <div className="journal-list">
          {articles.slice(0, 4).map((article, i) => (
            <Reveal key={article.slug} delay={i * 70}>
              <Link href={article.href} className="journal-row" data-cursor="Read">
                <span className="journal-cat">{article.category}</span>
                <h3>{article.title}</h3>
                <time>{formatArticleDate(article.date)}</time>
                <span className="journal-arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
