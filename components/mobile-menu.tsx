"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const menuItems: Array<[string, string]> = [
  ["Projects", "/projects"],
  ["Portfolio", "/portfolio"],
  ["About", "/about"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
]

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-md text-foreground transition hover:bg-foreground/5"
      >
        <span className="relative block h-[14px] w-[30px]">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-0 h-[2px] w-full origin-center bg-current transition-transform duration-200 ease-out ${isOpen ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`absolute bottom-0 left-0 h-[2px] w-full origin-center bg-current transition-transform duration-200 ease-out ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-3 top-16 z-40 w-56 overflow-hidden rounded-xl border border-border/60 bg-background/90 shadow-lg backdrop-blur-md"
            role="menu"
            aria-label="Mobile navigation"
          >
            <nav className="flex flex-col py-2">
              {menuItems.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-sm transition-colors hover:bg-foreground/5"
                  role="menuitem"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
