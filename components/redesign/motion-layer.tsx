"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Site-wide motion: scroll reveals and a reading-progress hairline (CSS
   scroll-driven animation, no scroll listener). Reveals stand down when the
   visitor prefers reduced motion. */
export function MotionLayer() {
  const path = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("motion-ready");
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
    </>
  );
}
