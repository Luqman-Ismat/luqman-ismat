"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Chapter } from "@/lib/chapters";
import { hotspots } from "@/lib/engivault/catalog";
import { pieces } from "@/lib/ten21/collection";
import { ComponentSection } from "./component-section";
import { BrandFrame } from "./brand-frame";
import { GarmentSection } from "@/components/ten21/garment-section";
import { Ten21Extras } from "@/components/ten21/ten21-extras";

const n = (i: number) => String(i + 1).padStart(2, "0");

/* Scroll the sheet to a component and keep it there while live components
   above it mount and change height, until the reader scrolls themselves. */
function scrollSheet(box: HTMLElement, el: HTMLElement, smooth = true) {
  const head = (box.querySelector(".sheet-parts") as HTMLElement | null)?.offsetHeight ?? 0;
  const target = () => box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - head - 16;
  box.scrollTo({ top: target(), behavior: smooth ? "smooth" : "auto" });
  const until = performance.now() + 3200;
  let raf = 0;
  const stop = () => { cancelAnimationFrame(raf); box.removeEventListener("wheel", stop); box.removeEventListener("touchstart", stop); };
  box.addEventListener("wheel", stop, { passive: true });
  box.addEventListener("touchstart", stop, { passive: true });
  let last = -1;
  const check = () => {
    const t = target();
    // once the smooth scroll has stopped moving, correct any drift instantly
    if (box.scrollTop === last && Math.abs(t - box.scrollTop) > 4) box.scrollTo({ top: t, behavior: "auto" });
    last = box.scrollTop;
    if (performance.now() < until) raf = requestAnimationFrame(check);
    else stop();
  };
  raf = requestAnimationFrame(check);
}

/* A chapter as a frosted-glass sheet over the exploded station. The glass
   and the content reveal from the Explore button as an expanding aperture. */
export default function ChapterSheet({
  chapter, focus, origin, closing, onClose,
}: {
  chapter: Chapter; focus: string | null; origin: { x: number; y: number }; closing: boolean; onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const [retract, setRetract] = useState(false);
  const [spy, setSpy] = useState<string | null>(null);
  const parts = chapter.components.map((c, i) => ({ id: c.id, n: n(i), title: c.title }));
  const live = chapter.components.some((c) => c.kind === "project-view" || c.kind === "inspection");

  // reveal on the next frame so the aperture transition runs
  useEffect(() => {
    const r = requestAnimationFrame(() => setOpen(true));
    closeBtn.current?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(r);
  }, []);

  // closing: put the aperture back on first, then retract it on the next frame
  useEffect(() => {
    if (!closing) return;
    const r = requestAnimationFrame(() => setRetract(true));
    return () => cancelAnimationFrame(r);
  }, [closing]);

  // once revealed, drop the aperture (cheaper to scroll) and nudge visibility
  // observers, which do not re-check when a clip-path finishes animating
  const onRevealed = (e: React.TransitionEvent) => {
    if (e.target !== box.current || e.propertyName !== "clip-path" || !open || closing) return;
    setSettled(true);
    const el = box.current;
    el.scrollTop += 1;
    el.scrollTop -= 1;
  };

  // switching chapters (menu) starts at the top; a target component scrolls into place
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!focus) { el.scrollTo({ top: 0 }); return; }
    const t = setTimeout(() => {
      const target = document.getElementById(focus);
      if (target) scrollSheet(el, target, false);
    }, 450);
    return () => clearTimeout(t);
  }, [chapter.id, focus]);

  // which component is being read
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const els = parts.map((p) => document.getElementById(p.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) setSpy(en.target.id);
    }, { root, rootMargin: "-35% 0px -60% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.documentElement.classList.contains("menu-open")) onClose();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el && box.current) scrollSheet(box.current, el);
  };

  const body = chapter.id === "ten21" ? (
    <div className="cmp-list">
      {pieces.map((p, i) => <GarmentSection key={p.slug} piece={p} n={n(i)} />)}
      <Ten21Extras />
    </div>
  ) : (
    <div className="cmp-list">
      {chapter.components.map((c, i) => (
        <ComponentSection key={c.id} c={c} n={n(i)} hotspots={c.kind === "calculators" ? hotspots : undefined} />
      ))}
    </div>
  );

  const style = { "--ox": `${origin.x}px`, "--oy": `${origin.y}px` } as CSSProperties;
  return (
    <div
      className={`sheet${open && !retract ? " is-open" : ""}${settled && !closing ? " is-settled" : ""}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
    >
      <div className="sheet-glass" aria-hidden="true" />
      <div ref={box} className="sheet-scroll" data-lenis-prevent onTransitionEnd={onRevealed}>
        <header className="sheet-head">
          <p className="sheet-kicker">{chapter.kicker}</p>
          <h2 id="sheet-title" className="sheet-title">{chapter.title}{chapter.accent && <> <em>{chapter.accent}</em></>}</h2>
          <p className="sheet-lede">{chapter.lede}</p>
          {live && <p className="sheet-note">Sample data. Everything runs in your browser.</p>}
        </header>

        <nav className="sheet-parts" aria-label={`${chapter.nav} components`}>
          <ol>
            {parts.map((p) => (
              <li key={p.id}>
                <button type="button" aria-current={spy === p.id ? "location" : undefined} onClick={() => go(p.id)}>
                  {p.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {live ? <BrandFrame>{body}</BrandFrame> : body}

        {chapter.packages && (
          <section className="ch-engage">
            <div className="ch-engage-grid">
              <h2 className="x-title">Pricing</h2>
              {chapter.packages.map((p) => (
                <article key={p.name} className="ch-package">
                  <p className="eyebrow">{p.label}</p>
                  <h3>{p.name}</h3>
                  <p className="ch-price">{p.price}</p>
                  <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </article>
              ))}
            </div>
            <div className="ch-engage-foot">
              <p>Starting prices in USD. No work begins without written deliverables, timing and price.</p>
              <Link href={`/contact?service=${chapter.service}`} className="pill pill-accent"><span className="pill-text">Start a project</span><span className="pill-icon" aria-hidden="true">↗</span></Link>
            </div>
          </section>
        )}
      </div>
      <button ref={closeBtn} type="button" className="sheet-close" onClick={onClose}>
        <span>Close</span><kbd>Esc</kbd><i aria-hidden="true"><X size={16} strokeWidth={2} /></i>
      </button>
    </div>
  );
}
