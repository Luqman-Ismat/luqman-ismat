import { inquiryServices } from "@/lib/site";
import { PageShell } from "@/components/consulting";
import { ProjectInquiry } from "@/components/project-inquiry";
export const metadata = {
  title: "Start a Project",
  description:
    "Discuss consulting, project controls, dashboards, integrations, or Indus Blue apparel development with Luqman Ismat. Share your starting point and prepare a project brief.",
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
        <p className="eyebrow">Start a conversation</p>
        <h1>
          What are you
          <br />
          <span className="muted-title">working on?</span>
        </h1>
        <p>
          Share the process you want to improve, the system you need, or the
          garment you have in mind. We’ll define the first useful step.
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
