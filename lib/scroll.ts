import type Lenis from "lenis";

/* One Lenis instance for the whole site, shared with the menu (which pauses
   it) and the homepage journey (which reads its scroll position). */
export const scroller: { lenis: Lenis | null } = { lenis: null };

export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  if (scroller.lenis) scroller.lenis.scrollTo(target, { immediate, offset: 0 });
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
}
