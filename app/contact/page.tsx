import { inquiryServices } from "@/lib/site";
import { PageShell } from "@/components/consulting";
import { ProjectInquiry } from "@/components/project-inquiry";
export const metadata = {
  title: "Start a Project: Controls, Data and Tools",
  description:
    "Send a brief for project controls, data integrations, engineering tools or TEN21 apparel work. Based in Houston, working remote. I reply in two business days.",
  alternates: { canonical: "/contact" },
};
export default async function ContactPage(props: {
  searchParams: Promise<{ service?: string; package?: string }>;
}) {
  const searchParams = await props.searchParams;
  const serviceKey =
    typeof searchParams.service === "string" ? searchParams.service : "";
  const service =
    inquiryServices[serviceKey as keyof typeof inquiryServices] ||
    "General inquiry";
  const selectedPackage =
    typeof searchParams.package === "string"
      ? searchParams.package.slice(0, 150)
      : "";
  return (
    <PageShell>
      <section className="consulting-wrap contact-heading">
        <h1>What are you working on?</h1>
        <p>
          Tell me about the process, system or garment. I reply within two
          business days.
        </p>
      </section>
      <section className="consulting-wrap contact-layout">
        <aside>
          <h2>Let’s talk directly.</h2>
          <p>
            You’ll work with me from the first conversation through the handoff.
          </p>
          <a className="contact-email" href="mailto:Luqman.ismat@gmail.com">
            Luqman.ismat@gmail.com ↗
          </a>
          <a className="text-link" href="tel:+18326796731">
            (832) 679-6731
          </a>
          {process.env.NEXT_PUBLIC_BOOKING_URL && (
            <a className="consulting-button secondary contact-book" href={process.env.NEXT_PUBLIC_BOOKING_URL} target="_blank" rel="noopener noreferrer">
              Book a 20-minute call ↗
            </a>
          )}
          <div className="contact-next">
            <p className="eyebrow">What happens next</p>
            <ol>
              <li>Send your project brief.</li>
              <li>We discuss the scope and any open questions.</li>
              <li>
                You receive an agreed deliverable, timeline, and price before
                work begins.
              </li>
            </ol>
          </div>
        </aside>
        <ProjectInquiry
          initialService={service}
          initialPackage={selectedPackage}
          key={`${service}-${selectedPackage}`}
        />
      </section>
    </PageShell>
  );
}
