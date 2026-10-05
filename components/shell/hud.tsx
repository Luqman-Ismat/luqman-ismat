"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { animate, scrambleText } from "animejs";
import { locationLabel } from "@/lib/navigation";
import { LiveClock } from "@/components/redesign/interactive";
import { MenuOverlay } from "./menu-overlay";
import { SectionDock } from "./section-dock";
import { ThemeSwitch } from "./theme-switch";

/* Corner chips in place of a header bar: identity and location top-left,
   conversation and menu top-right. */
export function Hud() {
  const path = usePathname();
  const label = locationLabel(path);
  const where = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) {
    setLastPath(path);
    setOpen(false);
  }

  useEffect(() => {
    const el = where.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = label;
      return;
    }
    const a = animate(el, { textContent: scrambleText({ text: label, chars: "uppercase" }), duration: 700, ease: "outQuad" });
    return () => {
      a.revert();
      el.textContent = label;
    };
  }, [label]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select, [contenteditable]");
      if (!typing && e.key.toLowerCase() === "m" && !e.metaKey && !e.ctrlKey && !e.altKey) setOpen((v) => !v);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="hud" data-open={open || undefined}>
        <div className="hud-chip hud-identity">
          <Link href="/" className="hud-mark" aria-label="Luqman Ismat, home">
            <span aria-hidden="true">LI</span>
          </Link>
          <div className="hud-where">
            <Link href="/" className="hud-name">Luqman Ismat</Link>
            <span className="hud-location" aria-live="polite">
              <span ref={where}>{label}</span>
            </span>
          </div>
        </div>
        <div className="hud-actions">
          <div className="hud-chip hud-clock"><LiveClock /></div>
          <ThemeSwitch className="hud-chip" />
          <Link href="/contact" className="hud-chip hud-talk">
            Let’s talk <span aria-hidden="true">↗</span>
          </Link>
          <button
            ref={button}
            type="button"
            className="hud-chip hud-menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="hud-menu-label">{open ? "Close" : "Menu"}</span>
            <span className="hud-burger" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>
      <MenuOverlay open={open} onClose={() => { setOpen(false); button.current?.focus(); }} origin={button} />
      <SectionDock />
    </>
  );
}
