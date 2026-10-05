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
      <div className="site-container footer-row">
        <div className="footer-about">
          <p>Independent consulting and product development. Based in Houston.</p>
          <LiveClock />
        </div>
        <nav aria-label="Footer">
          <Link href="/controls">Controls</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/engineering">Engineering</Link>
          <Link href="/ten21">TEN21</Link>
          <Link href="/engivault">EngiVault</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/about">About</Link>
          <a href="mailto:Luqman.ismat@gmail.com">Email ↗</a>
          <a href="https://www.linkedin.com/in/luqman-ismat/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/Luqman-Ismat" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
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
