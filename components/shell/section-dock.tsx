"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { navigationGroup } from "@/lib/navigation";

/* Sibling pages in a floating dock at the bottom of the screen. It steps
   aside while reading (scrolling down) and returns on the way back up. */
export function SectionDock() {
  const path = usePathname();
  const group = navigationGroup(path);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 240);
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  if (!group || group.links.length < 2) return null;
  return (
    <nav className={hidden ? "section-dock is-hidden" : "section-dock"} aria-label={`${group.label} pages`}>
      <span className="section-dock-label">{group.label}</span>
      <div className="section-dock-links">
        {group.links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
