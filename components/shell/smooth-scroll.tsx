"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { scroller, scrollToSection } from "@/lib/scroll";

export function SmoothScroll() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, allowNestedScroll: true });
    scroller.lenis = lenis;
    document.documentElement.classList.add("has-lenis");
    // Lenis caches the scroll limit and only re-measures when the root box
    // resizes, which it doesn't here; live components mounting would leave
    // the bottom of a chapter unreachable. Re-measure when the height changes.
    let height = document.documentElement.scrollHeight;
    const watch = window.setInterval(() => {
      const h = document.documentElement.scrollHeight;
      if (h !== height) { height = h; lenis.resize(); }
    }, 250);
    return () => {
      clearInterval(watch);
      lenis.destroy();
      scroller.lenis = null;
      document.documentElement.classList.remove("has-lenis");
    };
  }, []);

  /* Same-page section links (chapter index, 3D part tags, dock, menu) scroll
     smoothly and replace the hash, so Back leaves the page instead of
     stepping through every section visited. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      // prevent the jump but let the link's own handlers (menu close) run
      e.preventDefault();
      history.replaceState(history.state, "", url.hash);
      const menuOpen = document.documentElement.classList.contains("menu-open");
      if (menuOpen) setTimeout(() => scrollToSection(el), 500);
      else scrollToSection(el);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // new page: start at the top, or settle on the section the URL targets
  useEffect(() => {
    if (!location.hash) {
      scroller.lenis?.scrollTo(0, { immediate: true, force: true });
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) scrollToSection(el);
    }, 120);
    return () => clearTimeout(t);
  }, [path]);
  return null;
}
