"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { animate, stagger, splitText } from "animejs";
import { navigationGroups, navigationGroup } from "@/lib/navigation";
import { scroller } from "@/lib/scroll";
import { ThemeSwitch } from "./theme-switch";
import { LiveClock } from "@/components/redesign/interactive";
import { GarmentFlat } from "@/components/ten21/garment-flat";
import { colourwayById } from "@/lib/ten21/collection";

/* Full-screen menu. Opens as a circle from the menu button, then the six
   destinations rise in letter by letter. Hovering or focusing one shows its
   pages and a preview. */
export function MenuOverlay({ open, onClose, origin }: { open: boolean; onClose: () => void; origin: RefObject<HTMLButtonElement | null> }) {
  const path = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const current = navigationGroup(path);
  const [focus, setFocus] = useState(0);
  const [wasOpen, setWasOpen] = useState(false);

  // mount on first open and start on the current section (derived in render)
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMounted(true);
      setFocus(Math.max(0, navigationGroups.findIndex((g) => g.href === current?.href)));
    }
  }

  useEffect(() => {
    const el = panel.current;
    if (!el || !mounted) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = origin.current?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : innerWidth - 40;
    const cy = r ? r.top + r.height / 2 : 40;
    const radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    if (open) {
      scroller.lenis?.stop();
      document.documentElement.classList.add("menu-open");
      el.hidden = false;
      const split = reduced ? null : splitText(el.querySelectorAll(".menu-word"), { chars: { wrap: "clip" } });
      if (reduced) {
        el.style.clipPath = "none";
      } else {
        el.animate([{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }], { duration: 720, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
        animate(split!.chars, { y: ["110%", "0%"], duration: 900, delay: stagger(18, { start: 220 }), ease: "outExpo" });
        animate(el.querySelectorAll(".menu-fade"), { opacity: [0, 1], y: [18, 0], duration: 700, delay: stagger(60, { start: 420 }), ease: "outQuart" });
      }
      el.querySelector<HTMLAnchorElement>(".menu-item.is-focus a")?.focus({ preventScroll: true });
      return () => { split?.revert(); };
    }
    scroller.lenis?.start();
    document.documentElement.classList.remove("menu-open");
    if (reduced || el.hidden) {
      el.hidden = true;
      return;
    }
    const anim = el.animate([{ clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }, { clipPath: `circle(0px at ${cx}px ${cy}px)` }], { duration: 560, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    anim.onfinish = () => { el.hidden = true; };
  }, [open, mounted, origin]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocus((f) => {
          const n = (f + (e.key === "ArrowDown" ? 1 : -1) + navigationGroups.length) % navigationGroups.length;
          panel.current?.querySelectorAll<HTMLAnchorElement>(".menu-item > a")[n]?.focus();
          return n;
        });
      }
      if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>("a, button")].filter((n) => n.offsetParent);
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  const group = navigationGroups[focus];
  return (
    <div ref={panel} id="site-menu" className="menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu" hidden>
      <div className="menu-grid">
        <nav className="menu-primary" aria-label="Primary">
          <ol>
            {navigationGroups.map((g, i) => (
              <li key={g.href} className={i === focus ? "menu-item is-focus" : "menu-item"} onPointerEnter={() => setFocus(i)}>
                <Link href={g.href} onFocus={() => setFocus(i)} aria-current={current?.href === g.href ? "page" : undefined} onClick={onClose}>
                  <span className="menu-n">0{i + 1}</span>
                  <span className="menu-word">{g.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <aside className="menu-detail menu-fade" aria-live="polite">
          <div className="menu-preview" key={group.href}>
            {group.label === "TEN21" || !group.image ? (
              <GarmentFlat className="menu-preview-flat" slug="pashk-coat" view="front" colourway={colourwayById("shab")} title="Pashk Coat" />
            ) : (
              <Image src={group.image} alt="" fill sizes="(max-width: 900px) 0px, 30vw" />
            )}
          </div>
          <p className="menu-blurb">{group.blurb}</p>
          <ul className="menu-sub">
            {group.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={onClose} aria-current={path === l.href ? "page" : undefined}>
                  {l.label}
                  {l.note && <small>{l.note}</small>}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <div className="menu-foot menu-fade">
        <Link href="/contact" onClick={onClose} className="menu-cta">Start a project ↗</Link>
        <a href="mailto:Luqman.ismat@gmail.com">Email</a>
        <a href="https://www.linkedin.com/in/luqman-ismat/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/Luqman-Ismat" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span className="menu-spacer" />
        <LiveClock />
        <ThemeSwitch />
        <span className="menu-hint">Press <kbd>M</kbd> to toggle · <kbd>Esc</kbd> to close</span>
      </div>
    </div>
  );
}
