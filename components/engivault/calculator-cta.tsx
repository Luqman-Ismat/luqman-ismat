import Link from "next/link";

/* After every calculator: the same method, built into a team's workflow. */
export function CalculatorCta({ title }: { title: string }) {
  const href = `/contact?service=engineering&package=${encodeURIComponent(`Built into our workflow: ${title}`)}`;
  return (
    <section className="site-container calc-cta" aria-labelledby="calc-cta-title">
      <div>
        <p className="section-label"><span>(→)</span>For your team</p>
        <h2 id="calc-cta-title">Need this calculation <em className="accent-serif">built into your workflow?</em></h2>
        <p>
          I build engineering calculations into the tools teams already use: spreadsheets, internal apps and
          reporting, with the same explicit units, written method and verification against reference cases.
        </p>
      </div>
      <Link href={href} className="pill pill-accent">
        <span className="pill-text">Discuss a tool</span>
        <span className="pill-icon" aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
