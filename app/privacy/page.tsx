import { PageShell } from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
  description:
    "How this website handles project inquiries, analytics, browser preferences, and external links.",
};
export default function Privacy() {
  return (
    <PageShell>
      <PageIntro
        label="Website information"
        title="Privacy, plainly."
        text="This website presents consulting services and development work. You can browse without creating an account."
      />
      <div className="site-container policy-content">
        <section>
          <h2>Project inquiries</h2>
          <p>
            When you send a brief from the contact page, the details you enter
            (name, email, company, service, package, timeline and your
            message) are stored in a private database hosted by Supabase in the
            United States, and may be forwarded to my email, so I can reply. The
            submission also records the page you first arrived on, the site
            that referred you and any campaign tags in the link, plus your
            browser type. This information is used only to respond to and
            manage your inquiry. It is not sold or shared for marketing. To
            have your inquiry deleted, email me.
          </p>
          <p>
            If the website cannot send your brief, it offers an email draft
            instead; that message is sent only when you send it from your email
            application.
          </p>
        </section>
        <section>
          <h2>Analytics and browser storage</h2>
          <p>
            The site uses Vercel Web Analytics to count page views and visits
            in aggregate. It does not use cookies or advertising trackers and
            does not identify you personally. Your browser keeps your light or
            dark theme preference, and, for the current visit only, the page
            you arrived on and where you came from, which is sent only if you
            submit an inquiry. The EngiVault calculators, CAD viewers and
            example dashboards run in your browser on fictional data;
            calculator inputs are not sent to a server.
          </p>
        </section>
        <section>
          <h2>Hosting and external services</h2>
          <p>
            The hosting provider may process standard request information,
            including IP addresses and browser details, to serve and protect the
            website. Links to EngiVault, LinkedIn, GitHub, and other sources are
            governed by those services’ own policies.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            For questions about information you have shared, email{" "}
            <a href="mailto:Luqman.ismat@gmail.com">Luqman.ismat@gmail.com</a>.
            Avoid including passwords, access tokens, or confidential documents
            in an initial inquiry.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
