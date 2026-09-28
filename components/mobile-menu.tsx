"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { navigation } from "@/lib/site";
import { navigationGroup } from "@/lib/navigation";
import { Menu, X } from "lucide-react";
export function MobileMenu() {
  const [openedPath, setOpenedPath] = useState<string | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const open = openedPath === pathname;
  const setOpen = useCallback(
    (value: boolean) => setOpenedPath(value ? pathname : null),
    [pathname],
  );
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setOpen]);
  return (
    <div ref={wrapper} className="mobile-navigation">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile navigation">
          {[...navigation, { label: "Start a project", href: "/contact" }].map(
            ({ label, href }) => (
              <Link key={href} href={href} aria-current={pathname === href ? "page" : navigationGroup(pathname)?.href === href ? "location" : undefined} onClick={() => setOpen(false)}>
                {label}
                <span aria-hidden="true">↗</span>
              </Link>
            ),
          )}
        </nav>
      )}
    </div>
  );
}
