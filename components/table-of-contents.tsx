"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TableOfContentsProps {
  sections: {
    title: string
  }[]
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h2")
      let current = 0

      headings.forEach((heading, index) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 150) {
          current = index
        }
      })

      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (index: number) => {
    const headings = document.querySelectorAll("h2")
    const heading = headings[index]
    if (heading) {
      heading.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="sticky top-32 hidden lg:block">
      <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4">
        <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">Table of Contents</h3>
        <nav>
          <ul className="space-y-2">
            {sections.map((section, index) => (
              <li key={index}>
                <button
                  onClick={() => scrollToSection(index)}
                  className={cn(
                    "text-sm text-left hover:text-foreground transition-colors w-full",
                    activeSection === index
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

