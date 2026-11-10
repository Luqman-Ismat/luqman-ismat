import Link from "next/link";
import { Page } from "@/components/site/footer";
import { Title } from "@/components/site/title";
import { Roll } from "@/components/site/roll";
import { products } from "@/lib/products";

export const metadata = {
  title: "Work",
  description: "Complete products built by Luqman Ismat at TEN21: a project controls workspace, an inspection planning optimizer and the EngiVault calculator library. Open and use them.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text="Work you can open and use." pos="tl" className="page-title" />
        <p className="label page-label">(Work)</p>
        <p className="body lede" data-fade>
          These are complete applications, not screenshots. <b>They run in your browser on fictional records</b>, so you can click through every view, change things and see what happens.
        </p>
      </header>
      <section className="sec" style={{ paddingTop: "clamp(56px, 7vw, 110px)" }} aria-label="Products">
        <ul className="products">
          {products.map((p) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`}>
                <span className="label p-no">({p.no})</span>
                <span className="p-img mono-img" data-clip>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.imageAlt} width={1200} height={833} loading="lazy" />
                </span>
                <span className="p-copy">
                  <span className="p-name">{p.name}</span>
                  <span className="body">{p.what}</span>
                  <span className="label">
                    Open the product <span className="arrow" aria-hidden="true">↗</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/engivault">
              <span className="label p-no">(03)</span>
              <span className="p-img mono-img" data-clip>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/consulting/engivault-calculator.png" alt="An EngiVault calculator" width={1440} height={1000} loading="lazy" />
              </span>
              <span className="p-copy">
                <span className="p-name">EngiVault</span>
                <span className="body">A live library of 45 engineering calculations. Inputs and units, the method written out, and the sources cited. Free, no account.</span>
                <span className="label">
                  Open EngiVault <span className="arrow" aria-hidden="true">↗</span>
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
      <section className="sec close" aria-labelledby="close-title">
        <div className="close-row">
          <Title id="close-title" text="Want one of these for your business?" pos="tl" className="close-title" />
          <div className="close-side">
            <p className="body">The same people, data and care, applied to your work.</p>
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
