"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SectionNavigation } from "./section-navigation";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";
import { navigation } from "@/lib/site";
import { navigationGroup } from "@/lib/navigation";
export function Header() {
  const path = usePathname();
  const reduced = useReducedMotion();
  const group = navigationGroup(path);
  const label = group?.links.find(link => link.href === path)?.label ?? group?.label ?? (path === "/" ? "Home" : path === "/contact" ? "Contact" : "Privacy");
  return <header className="site-header">
    <div className="header-enclosure"><div className="header-inner">
      <div className="header-identity">
        <Link href="/" className="wordmark" aria-label="Luqman Ismat home">LUQMAN ISMAT</Link>
        <span className="header-divider" aria-hidden="true">/</span>
        <span className="header-current" title={label}>
          <motion.span key={path} initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : .3, ease: [.22,1,.36,1] }}>{label}</motion.span>
        </span>
      </div>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map(n => <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : group?.href === n.href ? "location" : undefined}>{n.label}</Link>)}
      </nav>
      <div className="header-actions"><ThemeToggle /><Link className="header-contact" href="/contact">Contact <span aria-hidden="true">↗</span></Link><MobileMenu /></div>
    </div><SectionNavigation /></div>
  </header>;
}
