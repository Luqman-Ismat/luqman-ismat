import Link from "next/link";
import { LiveClock } from "@/components/redesign/interactive";
import { NextStep } from "@/components/shell/next-step";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-next">
        <NextStep />
      </div>
      <div className="site-container footer-lead">
        <p className="footer-kicker">Have a process to fix or something to build?</p>
        <Link href="/contact" className="footer-cta" data-cursor="Write">
          <span>Start a project</span>
          <span className="footer-cta-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="site-container footer-grid">
        <div className="footer-about">
          <p>
            Independent consulting and product development.
            <br />
            Based in Houston. Working with teams everywhere.
          </p>
          <LiveClock />
        </div>
        <nav aria-label="Footer consulting">
          <p className="eyebrow">Consulting</p>
          <Link href="/consulting">Services & packages</Link>
          <Link href="/consulting/project-controls">
            Project management & controls
          </Link>
          <Link href="/consulting/dashboards">Dashboards & integrations</Link>
          <Link href="/engineering">Engineering systems</Link>
        </nav>
        <nav aria-label="Footer studio">
          <p className="eyebrow">Products & work</p>
          <Link href="/indus-blue">Indus Blue</Link>
          <Link href="/indus-blue#development">Apparel for your brand</Link>
          <Link href="/engivault">EngiVault tools</Link>
          <Link href="/indus-blue#pieces">Collection 01 tech packs</Link>
          <Link href="/projects">Work & interactive demos</Link>
        </nav>
        <nav aria-label="Footer contact">
          <p className="eyebrow">Connect</p>
          <a href="mailto:Luqman.ismat@gmail.com">Email ↗</a>
          <a
            href="https://www.linkedin.com/in/luqman-ismat/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://github.com/Luqman-Ismat"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About me</Link>
          <Link href="/portfolio">Experience timeline</Link>
        </nav>
      </div>
      <div className="footer-giant" aria-hidden="true">
        <span>Luqman</span>
        <span>Ismat</span>
      </div>
      <div className="site-container footer-bottom">
        <span>© {new Date().getFullYear()} Luqman Ismat</span>
        <Link href="/privacy">Privacy</Link>
        <span>Clear scope. Useful work.</span>
      </div>
    </footer>
  );
}
