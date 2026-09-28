import { PageShell } from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
  description:
    "How this website handles project inquiries, browser preferences, and external links.",
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
            The brief builder works in your browser. It does not send or save
            your form entries to a website database. Choosing “Open email draft”
            passes your brief to your email application; the message is sent
            only when you send it. Email inquiries are handled through the email
            provider and used to discuss and respond to your project.
          </p>
        </section>
        <section>
          <h2>Browser preferences</h2>
          <p>
            The site stores your chosen light or dark theme locally in your
            browser. The EngiVault calculators, CAD viewers, and example
            dashboard run locally and use no customer data. Calculator inputs
            are not sent to a server or saved to an account. Downloaded
            calculations stay on your device. No advertising trackers or
            analytics scripts are included in this site.
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
