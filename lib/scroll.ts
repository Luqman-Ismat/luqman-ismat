import type Lenis from "lenis";

/* One Lenis instance for the whole site, shared with the menu (which pauses
   it) and the homepage journey (which reads its scroll position). */
export const scroller: { lenis: Lenis | null } = { lenis: null };

export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  if (scroller.lenis) scroller.lenis.scrollTo(target, { immediate, offset: 0, force: true });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
}

/* Scroll to a section and stay on it while the page settles. Live
   components mount as they near the viewport and change height, which would
   push the target away; for a short window after landing the section is
   re-pinned each frame, until the reader scrolls on their own. Targets
   are numeric so CSS scroll-padding/scroll-margin are not added twice. */
let unpin: (() => void) | null = null;
export function scrollToSection(el: HTMLElement, offset = 96) {
  unpin?.();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = () => window.scrollY + el.getBoundingClientRect().top - offset;
  const jump = (smooth: boolean, onComplete?: () => void) => {
    if (scroller.lenis) {
      scroller.lenis.resize();
      scroller.lenis.scrollTo(target(), { immediate: !smooth, force: true, onComplete });
    }
    else {
      window.scrollTo({ top: target(), behavior: smooth && !reduced ? "smooth" : "auto" });
      if (onComplete) setTimeout(onComplete, smooth && !reduced ? 900 : 0);
    }
  };
  const pin = () => {
    const until = performance.now() + 3000;
    let raf = 0;
    const stop = () => { cancelAnimationFrame(raf); removeEventListener("wheel", stop); removeEventListener("touchstart", stop); removeEventListener("keydown", stop); unpin = null; };
    const check = () => {
      if (Math.abs(el.getBoundingClientRect().top - offset) > 4) jump(false);
      if (performance.now() < until) raf = requestAnimationFrame(check);
      else stop();
    };
    addEventListener("wheel", stop, { passive: true });
    addEventListener("touchstart", stop, { passive: true });
    addEventListener("keydown", stop);
    unpin = stop;
    check();
  };
  jump(true, pin);
}
