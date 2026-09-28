import Link from "next/link";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <Link href="/" className="footer-wordmark">
            LUQMAN ISMAT<span>Consulting & product development</span>
          </Link>
          <p>
            Based in Houston.
            <br />
            Working with teams everywhere.
          </p>
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
          <Link href="/projects/field-01">Field 01 CAD study</Link>
          <Link href="/projects">Work & interactive demos</Link>
        </nav>
        <nav aria-label="Footer contact">
          <p className="eyebrow">Connect</p>
          <Link href="/contact">Start a project ↗</Link>
          <a href="mailto:Luqman.ismat@gmail.com">Email Luqman ↗</a>
          <a
            href="https://www.linkedin.com/in/luqman-ismat/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About me</Link>
          <Link href="/portfolio">Experience timeline</Link>
        </nav>
      </div>
      <div className="site-container footer-bottom">
        <span>© {new Date().getFullYear()} Luqman Ismat</span>
        <Link href="/privacy">Privacy</Link>
        <span>Clear scope. Useful work.</span>
      </div>
    </footer>
  );
}
