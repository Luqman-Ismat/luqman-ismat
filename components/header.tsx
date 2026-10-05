"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SectionNavigation } from "./section-navigation";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";
import { LiveClock } from "./redesign/interactive";
import { navigation } from "@/lib/site";
import { navigationGroup } from "@/lib/navigation";
export function Header() {
  const path = usePathname();
  const reduced = useReducedMotion();
  const group = navigationGroup(path);
  const [hovered, setHovered] = useState<string | null>(null);
  const label = group?.links.find(link => link.href === path)?.label ?? group?.label ?? (path === "/" ? "Home" : path === "/contact" ? "Contact" : "Privacy");
  const current = navigation.find(n => path === n.href || group?.href === n.href)?.href;
  const highlight = hovered ?? current;
  return <header className="site-header">
    <div className="header-enclosure"><div className="header-inner">
      <div className="header-identity">
        <Link href="/" className="wordmark" aria-label="Luqman Ismat home">
          <span className="identity-mark" aria-hidden="true">LI</span>
          <span className="wordmark-name">Luqman Ismat</span>
        </Link>
        <span className="header-divider" aria-hidden="true">/</span>
        <span className="header-current" title={label}>
          <motion.span key={path} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .45, ease: [.22,1,.36,1] }}>{label}</motion.span>
        </span>
      </div>
      <nav className="desktop-nav" aria-label="Primary navigation" onPointerLeave={() => setHovered(null)}>
        {navigation.map(n => <Link key={n.href} href={n.href} onPointerEnter={() => setHovered(n.href)} aria-current={path === n.href ? "page" : group?.href === n.href ? "location" : undefined}>
          {highlight === n.href && <motion.span layoutId="nav-pill" className="nav-pill" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="nav-label">{n.label}</span>
        </Link>)}
      </nav>
      <div className="header-actions"><LiveClock /><ThemeToggle /><Link className="header-contact" href="/contact">Let’s talk <span aria-hidden="true">↗</span></Link><MobileMenu /></div>
    </div><SectionNavigation /></div>
  </header>;
}
