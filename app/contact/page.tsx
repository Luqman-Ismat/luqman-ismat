import { inquiryServices, site } from "@/lib/site";
import { Page } from "@/components/site/footer";
import { ProjectInquiry } from "@/components/project-inquiry";
import { Roll } from "@/components/site/roll";
import { Title, SectionHead } from "@/components/site/title";
import { startingPoints } from "@/lib/services";
import Link from "next/link";

export const metadata = {
  title: "Start a project",
  description:
    "Send TEN21 Consulting a few lines about your website, payments, automation, knowledge base, dashboard or integration. Based in Houston. Replies within two business days.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage(props: { searchParams: Promise<{ service?: string; package?: string }> }) {
  const searchParams = await props.searchParams;
  const key = typeof searchParams.service === "string" ? searchParams.service : "";
  const service = inquiryServices[key as keyof typeof inquiryServices] || "General inquiry";
  const pkg = typeof searchParams.package === "string" ? searchParams.package.slice(0, 150) : "";
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text="What needs doing?" pos="tl" className="page-title" />
        <p className="label page-label">(Start a project)</p>
        <p className="body lede" data-fade>
          A few lines is enough. <b>You&apos;ll hear back within two business days.</b>
        </p>
      </header>
      <section className="sec contact-grid" style={{ paddingTop: "clamp(56px, 7vw, 110px)" }}>
        <aside className="contact-aside">
          <div>
            <p className="label">(Email)</p>
            <a className="big" href={`mailto:${site.email}`}>
              <Roll text={site.email} />
            </a>
          </div>
          <div>
            <p className="label">(Phone)</p>
            <a className="big" href={site.phoneHref}>
              <Roll text={site.phone} />
            </a>
          </div>
          {process.env.NEXT_PUBLIC_BOOKING_URL && (
            <a className="btn ghost" href={process.env.NEXT_PUBLIC_BOOKING_URL} target="_blank" rel="noopener noreferrer">
              <Roll text="Book a 20 minute call" /> <span className="arrow" aria-hidden="true">↗</span>
            </a>
          )}
          <div>
            <p className="label">(What happens next)</p>
            <ol>
              <li>You send the brief.</li>
              <li>We talk through scope and open questions.</li>
              <li>You get the deliverable, timeline and price in writing before work begins.</li>
            </ol>
          </div>
        </aside>
        <div className="contact-form">
          <ProjectInquiry initialService={service} initialPackage={pkg} />
        </div>
      </section>
      <section className="sec" aria-labelledby="sp-title">
        <SectionHead label="(Not sure what to ask for)" id="sp-title" title="Pick a starting point." pos="tr" />
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
      <section className="sec" aria-labelledby="exp-title">
        <SectionHead label="(What to expect)" id="exp-title" title="No surprises, in either direction." pos="tl" />
        <ul className="how">
          {[
            ["A reply within two business days", "Usually sooner. If the job is not a fit, you will hear that too, with a suggestion of who to ask instead."],
            ["A written scope before any money", "What will be delivered, by when, for how much. Fixed price where the scope is fixed; a day rate where it is not."],
            ["Accounts in your name", "Domain, hosting, Stripe, email: set up under your ownership from day one. Nothing is held hostage."],
            ["A handoff you can keep", "Notes, logins and a walkthrough. Care plans are available, never required."],
          ].map(([t, d], i) => (
            <li key={t} data-fade data-delay={i * 0.08}>
              <span className="label">(0{i + 1})</span>
              <span className="h-m">{t}</span>
              <p className="body">{d}</p>
            </li>
          ))}
        </ul>
        <div className="action-row" style={{ marginTop: 32 }}>
          <Link className="btn ghost" href="/work">
            <Roll text="See the work first" /> <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </Page>
  );
}
