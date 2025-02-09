import { MobileMenu } from "@/components/mobile-menu"
import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <AnimatedLogo />
        <nav className="hidden md:flex items-center gap-8">
          {[
            ["Projects", "/projects"],
            ["Services", "/services"],
            ["About", "/about"],
            ["Blog", "/blog"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="text-sm relative group">
              <span className="relative z-10 transition-colors duration-200 group-hover:text-primary">{label}</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
          <Button variant="link" asChild>
            <Link href="/contact" className="font-medium">
              Let&apos;s Talk
            </Link>
          </Button>
        </nav>
        <MobileMenu />
      </div>
    </header>
  )
}

