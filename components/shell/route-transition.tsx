"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { animate, stagger } from "animejs";
import { locationLabel } from "@/lib/navigation";

const COLS = 10;
const ROWS = 6;

/* Tile curtain between pages: tiles close in from where you clicked, the
   destination's name shows, and they open again once the new page renders. */
export function RouteTransition() {
  const router = useRouter();
  const path = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const covering = useRef(false);
  const origin = useRef(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/\.(pdf|zip|dxf|step|stl|csv|png|jpe?g|webp|svg)$/i.test(url.pathname)) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current) return;
      e.preventDefault();
      const col = Math.min(COLS - 1, Math.floor((e.clientX / innerWidth) * COLS));
      const row = Math.min(ROWS - 1, Math.floor((e.clientY / innerHeight) * ROWS));
      origin.current = row * COLS + col;
      if (label.current) label.current.textContent = locationLabel(url.pathname);
      covering.current = true;
      root.current.hidden = false;
      const tiles = root.current.querySelectorAll(".curtain-tile");
      animate(tiles, { scale: [0, 1.02], opacity: [0, 1], duration: 380, delay: stagger(16, { grid: [COLS, ROWS], from: origin.current }), ease: "inOutQuad" });
      animate(label.current!, { opacity: [0, 1], y: [24, 0], duration: 420, delay: 220, ease: "outExpo" });
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), 430);
      // never leave the curtain down if navigation stalls
      window.setTimeout(() => covering.current && reveal(), 5000);
    };
    const reveal = () => {
      const el = root.current;
      if (!el || el.hidden) return;
      covering.current = false;
      animate(label.current!, { opacity: 0, duration: 200, ease: "outQuad" });
      animate(el.querySelectorAll(".curtain-tile"), {
        scale: 0,
        opacity: 0,
        duration: 420,
        delay: stagger(14, { grid: [COLS, ROWS], from: origin.current }),
        ease: "inOutQuad",
        onComplete: () => { el.hidden = true; },
      });
    };
    (root.current as HTMLDivElement & { reveal?: () => void }).reveal = reveal;
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  useEffect(() => {
    const el = root.current as (HTMLDivElement & { reveal?: () => void }) | null;
    if (el && covering.current) requestAnimationFrame(() => el.reveal?.());
  }, [path]);

  return (
    <div ref={root} className="route-curtain" aria-hidden="true" hidden>
      <div className="curtain-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => <i key={i} className="curtain-tile" />)}
      </div>
      <span ref={label} className="curtain-label" />
    </div>
  );
}
