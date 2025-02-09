"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="relative z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8 text-lg">
              <Link href="/projects" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Projects
              </Link>
              <Link href="/services" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Services
              </Link>
              <Link href="/about" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                About
              </Link>
              <Link href="/blog" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                Blog
              </Link>
              <Button variant="link" asChild>
                <Link href="/contact" className="font-medium" onClick={() => setIsOpen(false)}>
                  Let&apos;s Talk
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

