"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { navigationGroup } from "@/lib/navigation";

/* The current chapter's components in a floating dock. On the chapter page
   it follows the reader (scrollspy); elsewhere it links back in. It steps
   aside while scrolling down and returns on the way back up. */
export function SectionDock() {
  const path = usePathname();
  const group = navigationGroup(path);
  const [hidden, setHidden] = useState(false);
  const [spy, setSpy] = useState<string | null>(null);
  const onChapter = !!group?.spy && group.href === path;
  // on a chapter page the hero already lists the parts
  const [inHero, setInHero] = useState(true);
  // on the chapter page, every link resolves to a section on this page
  const anchors = useMemo(
    () => (group && onChapter ? group.links.map((l) => (l.href.includes("#") ? l.href.split("#")[1] : l.href.split("/").pop() ?? "")) : []),
    [group, onChapter],
  );

  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 240);
      setInHero(y < innerHeight * 0.75);
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = anchors.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setSpy(en.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [anchors]);

  if (!group || group.links.length < 2) return null;
  return (
    <nav className={hidden || (onChapter && inHero) ? "section-dock is-hidden" : "section-dock"} aria-label={`${group.label} components`}>
      <Link href={group.href} className="section-dock-label">{group.label}</Link>
      <div className="section-dock-links">
        {group.links.map((l, i) => {
          const href = onChapter ? `#${anchors[i]}` : l.href;
          const current = onChapter ? spy === anchors[i] : path === l.href;
          return (
            <Link key={l.href} href={href} aria-current={current ? (onChapter ? "location" : "page") : undefined}>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
