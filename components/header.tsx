import { MobileMenu } from "@/components/mobile-menu"
import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container flex items-center justify-between h-16">
        <AnimatedLogo />

        <nav 
          className="hidden md:flex items-center justify-center flex-1"
          role="navigation"
          aria-label="Primary navigation"
        >
          {[
            ["Projects", "/projects"],
            ["Portfolio", "/portfolio"],
            ["About", "/about"],
            ["Blog", "/blog"],
          ].map(([label, href]) => (
            <Link 
              key={label} 
              href={href} 
              className="text-sm relative group mx-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
              aria-label={`Navigate to ${label} page`}
            >
              <span className="relative z-20 transition-colors duration-200 group-hover:text-primary group-focus:text-primary">
                {label}
              </span>
              <span 
                className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary scale-x-0 transition-transform duration-200 group-hover:scale-x-100 group-focus:scale-x-100" 
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <Link 
            href="/contact" 
            className="hidden md:inline-flex focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
            aria-label="Navigate to contact page"
          >
            <Button
              variant="ghost"
              className="font-medium hover:bg-transparent transition-transform duration-300 hover:scale-110 focus:scale-110"
              aria-label="Get in touch with Luqman Ismat"
            >
              Let&apos;s Talk
            </Button>
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
