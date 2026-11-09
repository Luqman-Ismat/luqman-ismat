import Link from "next/link";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { Roll } from "./roll";

export function Footer() {
  return (
    <div className="ftr-shell">
      <footer className="ftr" data-ftr>
        <div className="ftr-cols">
          <div className="ftr-col wide">
            <p className="label">(Start a project)</p>
            <ul>
              <li>
                <a className="big" href={`mailto:${site.email}`}>
                  <Roll text={site.email} />
                </a>
              </li>
              <li>
                <a className="big" href={site.phoneHref}>
                  <Roll text={site.phone} />
                </a>
              </li>
            </ul>
          </div>
          <div className="ftr-col">
            <p className="label">(Services)</p>
            <ul>
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/services#${s.id}`}>
                    <Roll text={s.short} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="ftr-col">
            <p className="label">(Navigation)</p>
            <ul>
              {[
                ["Home", "/"],
                ["Services", "/services"],
                ["EngiVault", "/engivault"],
                ["Journal", "/blog"],
                ["About", "/about"],
                ["Contact", "/contact"],
              ].map(([l, h]) => (
                <li key={h}>
                  <Link href={h}>
                    <Roll text={l} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="ftr-col">
            <p className="label">(Elsewhere)</p>
            <ul>
              <li>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  <Roll text="LinkedIn" />
                </a>
              </li>
              <li>
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  <Roll text="GitHub" />
                </a>
              </li>
              <li>
                <span>Houston, Texas</span>
              </li>
            </ul>
          </div>
        </div>
        <p className="ftr-word" aria-hidden="true" role="presentation">
          <span>T</span>
          <span>E</span>
          <span>N</span>
          <span>2</span>
          <span>1</span>
        </p>
        <div className="ftr-base">
          <span className="label">TEN21 Consulting, by Luqman Ismat</span>
          <span className="label">77010 / 77021</span>
          <Link className="label" href="/privacy">
            Privacy
          </Link>
          <span className="label">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <main id="main-content" className={className ? `page-main ${className}` : "page-main"}>
        {children}
      </main>
      <Footer />
    </>
  );
}
