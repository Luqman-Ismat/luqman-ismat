"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { scroller } from "@/lib/scroll";

export function SmoothScroll() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: -96 }, allowNestedScroll: true });
    scroller.lenis = lenis;
    document.documentElement.classList.add("has-lenis");
    return () => {
      lenis.destroy();
      scroller.lenis = null;
      document.documentElement.classList.remove("has-lenis");
    };
  }, []);
  // new page: start at the top unless the URL targets an anchor
  useEffect(() => {
    if (location.hash) return;
    scroller.lenis?.scrollTo(0, { immediate: true, force: true });
  }, [path]);
  return null;
}
