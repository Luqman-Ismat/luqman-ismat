import Link from "next/link";
import { Page } from "@/components/site/footer";
import { Roll } from "@/components/site/roll";
import { experience, toolGroups } from "@/lib/experience";

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
        <p className="label">(About)</p>
        <h1 className="h-xl" data-lines>
          Luqman Ismat
        </h1>
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

      <section className="sec exp" id="experience" aria-labelledby="exp-title">
        <div className="sec-head">
          <p className="label">(Experience)</p>
          <h2 id="exp-title" className="h-l sec-title" data-lines>
            Where the work comes from.
          </h2>
        </div>
        <ol className="rows">
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
              <p className="body c-text">{r.summary}</p>
              <span className="label c-end">{r.kind}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec" aria-labelledby="tools-title">
        <div className="sec-head">
          <p className="label">(Tools)</p>
          <h2 id="tools-title" className="h-l sec-title" data-lines>
            What I work in.
          </h2>
        </div>
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

      <section className="sec close g12" aria-labelledby="close-title">
        <h2 id="close-title" className="h-xl" data-lines>
          Let&apos;s talk about the job.
        </h2>
        <div className="close-side">
          <p className="body">You&apos;ll work with me from the first call to the handoff.</p>
          <Link className="btn" href="/contact">
            <Roll text="Start a project" /> <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </Page>
  );
}
