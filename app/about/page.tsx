import Link from "next/link";
import { Page } from "@/components/site/footer";
import { Roll } from "@/components/site/roll";
import { Title, SectionHead } from "@/components/site/title";
import { experience, toolGroups } from "@/lib/experience";
import { CareerTimeline } from "@/components/site/career-timeline";

export const metadata = {
  title: "About Luqman Ismat",
  description:
    "Luqman Ismat is an industrial engineer in Houston and the founder of TEN21 Consulting. Process engineering, process safety, project controls and the software around them.",
  alternates: { canonical: "/about" },
};

const fmt = (ym: string | null) => {
  if (!ym) return "Now";
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
};

export default function About() {
  const roles = [...experience].sort((a, b) => b.start.localeCompare(a.start));
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text="Luqman Ismat" pos="tl" className="page-title" />
        <p className="label page-label">(About) Founder, TEN21 Consulting</p>
      </header>

      <section className="sec about-hero" style={{ paddingTop: "clamp(48px, 6vw, 96px)" }}>
        <div className="portrait mono-img" data-clip>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/about/luqman-uh-graduation.jpg" width={1132} height={2000} alt="Luqman Ismat at the University of Houston" />
        </div>
        <div className="copy">
          <p className="statement" data-lines>
            Industrial engineer from the University of Houston. <b>I started in process engineering and process safety, moved into reliability data and project controls, and kept writing software to make that work less tedious.</b>
          </p>
          <p className="body" data-fade>
            TEN21 Consulting is that habit turned outward. The same care that goes into a safety review or a cost forecast goes into a booking page, a payment flow or a dashboard: know what the result has to be, check it, and leave notes the next person can follow.
          </p>
          <div className="action-row">
            <Link className="btn" href="/contact">
              <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
            </Link>
            <a className="btn ghost" href="https://www.linkedin.com/in/luqman-ismat/" target="_blank" rel="noopener noreferrer">
              <Roll text="LinkedIn" />
            </a>
          </div>
        </div>
      </section>

      <section className="sec about-nums" aria-label="In numbers">
        <dl className="cs-facts about-facts">
          {[
            ["Based", "Houston"],
            ["Engineering since", "2022"],
            ["Disciplines worked", "Process, safety, piping, reliability, controls, risk"],
            ["Products in the portfolio", "3"],
            ["Degree", "Industrial engineering, UH"],
            ["Works with", "Businesses anywhere"],
          ].map(([k, v], i) => (
            <div key={k} data-fade data-delay={i * 0.06}>
              <dt className="label">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sec exp" id="experience" aria-labelledby="exp-title">
        <SectionHead label="(Experience)" id="exp-title" title="Where the work comes from." pos="tr" />
        <div className="exp-vis" data-fade>
          <CareerTimeline roles={roles} />
        </div>
        <ol className="rows exp-rows">
          {roles.map((r) => (
            <li key={r.id}>
              <span className="label c-no">
                {fmt(r.start)} / {fmt(r.end)}
              </span>
              <span className="h-m c-name">
                {r.role}
                <span className="label" style={{ display: "block", marginTop: 8 }}>
                  {r.employer}
                </span>
              </span>
              <div className="c-text">
                <p className="body">{r.summary}</p>
                <ul className="ticks exp-details">
                  {r.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <span className="label c-end">{r.kind}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec" aria-labelledby="how-title">
        <SectionHead label="(How I work)" id="how-title" title="Habits from the plant, kept for the keyboard." pos="tl" />
        <ul className="how">
          {[
            ["Know the answer before you build", "A safety review starts by stating what must be true at the end. So does a booking page. The scope says what done looks like, in writing, before a line is written."],
            ["Check it against something", "Every calculator on EngiVault is checked against reference cases. Every integration logs what it moved. If a result cannot be checked, it is not finished."],
            ["Leave notes the next person can follow", "Procedures outlive the people who wrote them. Your site, your automation and your dashboard come with notes plain enough that someone else could pick them up."],
            ["One person, start to handoff", "You talk to the person who designs it, builds it and fixes it. Nothing is handed off blind between a salesperson, a designer and a developer."],
          ].map(([t, d], i) => (
            <li key={t} data-fade data-delay={i * 0.08}>
              <span className="label">(0{i + 1})</span>
              <span className="h-m">{t}</span>
              <p className="body">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="sec" aria-labelledby="tools-title">
        <SectionHead label="(Tools)" id="tools-title" title="What I work in." pos="tl" />
        <div className="tools-grid">
          {toolGroups.map((g) => (
            <div key={g.label} data-fade>
              <p className="label">{g.label}</p>
              <ul>
                {g.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="sec name-note" aria-labelledby="name-title">
        <p className="zips" aria-hidden="true">
          770<span>10</span>
          <br />
          770<span>21</span>
        </p>
        <div className="body">
          <p className="label" id="name-title" style={{ marginBottom: 12 }}>
            (The name)
          </p>
          TEN21 comes from two Houston ZIP codes: 77010, downtown, and 77021, just southeast of it. It is a Houston shop first, working with businesses anywhere.
        </div>
      </section>

      <section className="sec close" aria-labelledby="close-title">
        <div className="close-row">
          <Title id="close-title" text="Let's talk about the job." pos="tl" className="close-title" />
          <div className="close-side">
            <p className="body">You&apos;ll work with me from the first call to the handoff.</p>
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
