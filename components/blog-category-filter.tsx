"use client"

import { useEffect, useState } from "react"

interface BlogCategoryFilterProps {
  categories: string[]
  /** CSS selector for the list whose <li> children carry `data-category`. */
  targetSelector?: string
}

const ALL = "ALL"

/**
 * Chip-style filter. Persists the active category in localStorage and
 * hides/shows posts by toggling a CSS class on each <li data-category>.
 * Lives client-side; the server pre-renders the full list so it works
 * without JS (the filter just becomes a no-op when JS is off).
 */
export function BlogCategoryFilter({
  categories,
  targetSelector = "[data-blog-list]",
}: BlogCategoryFilterProps) {
  const [active, setActive] = useState<string>(ALL)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("blog-filter")
    if (saved) setActive(saved)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("blog-filter", active)
    const list = document.querySelector<HTMLElement>(targetSelector)
    if (!list) return
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-category]"))
    let visible = 0
    for (const item of items) {
      const matches = active === ALL || item.dataset.category === active
      item.hidden = !matches
      if (matches) visible += 1
    }
    setCount(visible)
  }, [active, targetSelector])

  return (
    <div className="mb-8">
      <div role="tablist" aria-label="Filter posts by category" className="flex flex-wrap gap-2">
        <ChipButton active={active === ALL} onClick={() => setActive(ALL)}>
          All
        </ChipButton>
        {categories.map((c) => (
          <ChipButton key={c} active={active === c} onClick={() => setActive(c)}>
            {c}
          </ChipButton>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
        {active === ALL ? `Showing all posts` : `${count} ${count === 1 ? "post" : "posts"} in ${active}`}
      </p>
    </div>
  )
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-mono tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
