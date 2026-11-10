import { inquiryServices, site } from "@/lib/site";
import { Page } from "@/components/site/footer";
import { ProjectInquiry } from "@/components/project-inquiry";
import { Roll } from "@/components/site/roll";
import { Title } from "@/components/site/title";

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
    </Page>
  );
}
