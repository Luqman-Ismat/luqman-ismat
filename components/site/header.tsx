"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNav, isCurrent } from "@/lib/nav";
import { site } from "@/lib/site";
import { Roll } from "./roll";

type LenisLike = { stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

export function Header() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setOpen(false);
  }

  // the links step aside while reading down the page and return on the way up
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const check = () => {
      raf = 0;
      const y = window.scrollY;
      if (y < 160) setCompact(false);
      else if (y > last + 6) setCompact(true);
      else if (y < last - 6) setCompact(false);
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("a");
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const items = [button.current!, ...panel.current.querySelectorAll<HTMLElement>("a")];
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && i === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis()?.start();
    };
  }, [open]);

  const groups = [
    { label: "(Navigation)", items: [{ label: "Home", href: "/" }, ...primaryNav, { label: "Start a project", href: "/contact" }] },
    {
      label: "(Contact)",
      small: true,
      items: [
        { label: site.email, href: `mailto:${site.email}` },
        { label: site.phone, href: site.phoneHref },
      ],
    },
    {
      label: "(Elsewhere)",
      small: true,
      items: [
        { label: "LinkedIn", href: site.linkedin },
        { label: "GitHub", href: site.github },
      ],
    },
  ];

  return (
    <>
      <header className={compact && !open ? "hdr is-hidden" : "hdr"}>
        <Link href="/" className="hdr-mark" aria-label="TEN21 Consulting, home">
          <span>TEN21</span>
          <span className="label">(Consulting)</span>
        </Link>
        <nav className="hdr-nav" aria-label="Primary">
          {primaryNav.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isCurrent(path, l.href) ? "page" : undefined}>
              <Roll text={l.label} />
              <span className="dots" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="hdr-cta" aria-current={path === "/contact" ? "page" : undefined}>
          <Roll text="Start a project" />
          <span className="arrow" aria-hidden="true">↗</span>
        </Link>
        <button
          ref={button}
          type="button"
          className="hdr-menu"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? ":: Close" : ":: Menu"}
        </button>
      </header>
      <div
        id="site-menu"
        ref={panel}
        className={open ? "menu is-open" : "menu"}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
      >
        {groups.map((g) => (
          <div key={g.label} className={g.small ? "menu-group small" : "menu-group"}>
            <p className="label">{g.label}</p>
            <ul>
              {g.items.map((l, i) => {
                const external = l.href.startsWith("http");
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      style={{ "--i": i } as React.CSSProperties}
                      aria-current={isCurrent(path, l.href) || (l.href === "/" && path === "/") ? "page" : undefined}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      onClick={() => setOpen(false)}
                    >
                      <span>{l.label}</span>
                      <span className="arrow" aria-hidden="true">↗</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
