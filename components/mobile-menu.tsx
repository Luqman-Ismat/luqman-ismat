"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuIconRef = useRef<HTMLDivElement>(null)
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([])

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)

    const spans = spanRefs.current
    if (spans.length === 2) {
      if (!isOpen) {
        gsap.to(spans[0], { rotation: 45, y: 6, duration: 0.15 })
        gsap.to(spans[1], { rotation: -45, y: -6, duration: 0.15 })
      } else {
        gsap.to(spans[0], { rotation: 0, y: 0, duration: 0.15 })
        gsap.to(spans[1], { rotation: 0, y: 0, duration: 0.15 })
      }
    }
  }

  const menuItems = [
    ["Projects", "/projects"],
    ["Portfolio", "/portfolio"],
    ["About", "/about"],
    ["Blog", "/blog"],
    ["Contact", "/contact"],
  ]

  useEffect(() => {
    const menuIcon = menuIconRef.current
    const spans = spanRefs.current

    if (!menuIcon || spans.length !== 2) return

    const hoverIn = () => {
      gsap.to(spans, { opacity: 0, x: -30, duration: 0.15, stagger: 0.05 })
      setTimeout(() => {
        gsap.to(spans, { opacity: 1, x: 0, duration: 0.15, stagger: 0.05 })
      }, 150)
    }

    const hoverOut = () => {
      gsap.to(spans, { opacity: 0, x: 30, duration: 0.15, stagger: 0.05 })
      setTimeout(() => {
        gsap.to(spans, { opacity: 1, x: 0, duration: 0.15, stagger: 0.05 })
      }, 150)
    }

    menuIcon.addEventListener("mouseenter", hoverIn)
    menuIcon.addEventListener("mouseleave", hoverOut)

    return () => {
      menuIcon.removeEventListener("mouseenter", hoverIn)
      menuIcon.removeEventListener("mouseleave", hoverOut)
    }
  }, [])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className={`relative z-50 bg-transparent hover:bg-transparent ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        ref={menuIconRef}
      >
        <div className="flex flex-col justify-between w-[30px] h-[14px]">
          <span
            ref={(el) => (spanRefs.current[0] = el)}
            className="w-full h-[2px] bg-current transition-all duration-300"
          ></span>
          <span
            ref={(el) => (spanRefs.current[1] = el)}
            className="w-full h-[2px] bg-current transition-all duration-300"
          ></span>
        </div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.15 }}
            className="absolute top-16 right-0 z-40 w-56 rounded-md overflow-hidden"
          >
            <div className="bg-background/80 backdrop-blur-sm">
              <nav className="flex flex-col py-2 text-center">
                {menuItems.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="px-4 py-2 text-sm transition-all duration-300 hover:translate-x-2 hover:scale-110"
                    onClick={toggleMenu}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
