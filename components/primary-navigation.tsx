"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/site";
export function PrimaryNavigation() {
  const path = usePathname();
  return (
    <nav className="desktop-nav" aria-label="Primary navigation">
      {navigation.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            path === href || path.startsWith(href + "/") ? "page" : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
