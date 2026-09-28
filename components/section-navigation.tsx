"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationGroup } from "@/lib/navigation";
export function SectionNavigation() {
  const path = usePathname();
  const group = navigationGroup(path);
  if (!group) return null;
  return <div className="section-navigation-wrap">
    <nav className="section-navigation" aria-label={`${group.label} pages`}>
      {group.links.map(link => <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined}>{link.label}</Link>)}
    </nav>
  </div>;
}
