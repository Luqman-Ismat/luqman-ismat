"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MobileMenu } from "@/components/mobile-menu"
import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import { Magnetic } from "@/components/magnetic"

const NAV: Array<[string, string]> = [
  ["Projects", "/projects"],
  ["Portfolio", "/portfolio"],
  ["About", "/about"],
  ["Blog", "/blog"],
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50"
          : "bg-background/40 backdrop-blur-sm border-b border-transparent"
      }`}
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container flex h-16 items-center justify-between">
        <AnimatedLogo />

        <nav
          className="hidden md:flex items-center justify-center flex-1"
          role="navigation"
          aria-label="Primary navigation"
        >
          {NAV.map(([label, href]) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={label}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="group relative mx-3 text-sm font-medium rounded-sm px-2 py-1 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="relative z-10">{label}</span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2 -bottom-0.5 h-0.5 origin-left bg-primary transition-transform duration-300 ease-out ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  }`}
                />
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic strength={10} className="hidden md:inline-block">
            <Link
              href="/contact"
              className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              aria-label="Get in touch"
            >
              <Button variant="ghost" className="font-medium hover:bg-foreground/5">
                Let&apos;s Talk →
              </Button>
            </Link>
          </Magnetic>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
