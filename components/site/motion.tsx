"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* One motion system for the whole site.
   Lenis smooth scroll on the GSAP ticker, one easing family (expo),
   and a handful of data attributes:
   data-lines   masked line reveal (SplitText)
   data-rule    hairline draws in
   data-clip    image unclips from the bottom while settling from 1.15
   data-parallax  slow drift with scroll
   data-fade    rise and fade
   .rows        each row's top hairline draws in
   data-ftr     footer rises from underneath
   Content is visible without JavaScript; motion only adds. */
export function Motion() {
  const path = usePathname();
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);

  // smooth scroll, once
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    document.documentElement.classList.add("js-motion");
    if (reduced()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // curtain on internal navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target || a.hasAttribute("download") || a.dataset.noCurtain !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.startsWith("/api") || url.pathname.startsWith("/examples")) return;
      // same page: hash or no-op
      if (url.pathname === location.pathname && url.search === location.search) {
        if (url.hash) {
          const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (el) {
            e.preventDefault();
            e.stopPropagation();
            const l = (window as unknown as { __lenis?: Lenis }).__lenis;
            if (l) l.scrollTo(el, { offset: -70, duration: 1.4 });
            else el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
            history.replaceState(null, "", url.hash);
          }
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (navigating.current) return;
      const href = url.pathname + url.search + url.hash;
      if (reduced() || !curtain.current) {
        router.push(href);
        return;
      }
      navigating.current = true;
      gsap.fromTo(
        curtain.current,
        { yPercent: 100, y: 0 },
        {
          yPercent: 0,
          y: 0,
          duration: 0.6,
          ease: "expo.inOut",
          onComplete: () => router.push(href),
        },
      );
      // never leave the curtain down
      window.setTimeout(() => {
        if (navigating.current) router.push(href);
      }, 1800);
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  // per page: reset scroll, lift curtain, wire reveals
  useIso(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    const hash = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (hash) {
      if (l) l.scrollTo(hash, { offset: -70, immediate: true, force: true });
      else hash.scrollIntoView();
    } else if (navigating.current) {
      l ? l.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0);
    }
    if (navigating.current && curtain.current) {
      navigating.current = false;
      gsap.to(curtain.current, {
        yPercent: -100,
        y: 0,
        duration: 0.8,
        ease: "expo.inOut",
        delay: 0.05,
        onComplete: () => {
          gsap.set(curtain.current, { yPercent: 100, y: 0 });
        },
      });
    }
    if (reduced()) return;

    const ctx = gsap.context(() => {
      const st = (el: Element, start = "top 88%") => ({ trigger: el, start, once: true });

      gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "ln",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.5,
              ease: "expo.out",
              stagger: 0.085,
              delay: Number(el.dataset.delay || 0),
              scrollTrigger: st(el, "top 90%"),
            }),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((el) => {
        gsap.from(el, { scaleX: 0, transformOrigin: "left center", duration: 1.6, ease: "expo.inOut", scrollTrigger: st(el, "top 92%") });
      });

      gsap.utils.toArray<HTMLElement>(".rows > li").forEach((el, i) => {
        gsap.fromTo(
          el,
          { "--drawn": 0 },
          { "--drawn": 1, duration: 1.6, ease: "expo.inOut", delay: (i % 4) * 0.06, scrollTrigger: st(el, "top 94%") },
        );
        const kids = el.querySelectorAll(":scope > *");
        gsap.from(kids, { y: 18, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.2, scrollTrigger: st(el, "top 94%") });
      });

      gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
        const img = el.querySelector("img, canvas");
        const tl = gsap.timeline({ scrollTrigger: st(el, "top 90%") });
        tl.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", delay: Number(el.dataset.delay || 0) });
        if (img) tl.from(img, { scale: 1.18, duration: 1.9, ease: "expo.out" }, "<0.15");
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = Number(el.dataset.parallax || 10);
        gsap.fromTo(
          el,
          { yPercent: -amt },
          { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((el) => {
        gsap.from(el, { y: 26, opacity: 0, duration: 1.3, ease: "expo.out", delay: Number(el.dataset.delay || 0), scrollTrigger: st(el, "top 92%") });
      });

    });

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [path]);

  return (
    <div ref={curtain} className="curtain" aria-hidden="true">
      <span className="label">TEN21 Consulting</span>
    </div>
  );
}
