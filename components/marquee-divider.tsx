interface MarqueeDividerProps {
  /** Words to scroll. Defaults to an EPC/process engineering set. */
  items?: string[]
  /** Animation duration string (e.g. "40s"). */
  duration?: string
  /** Direction of travel. */
  direction?: "left" | "right"
  /** Optional className applied to the outer section. */
  className?: string
}

const DEFAULT_ITEMS = [
  "PROCESS ENGINEERING",
  "EPC",
  "DIGITAL TWINS",
  "HAZOP",
  "AI-DRIVEN TOOLS",
  "PIPING SYSTEMS",
  "HEAT EXCHANGERS",
  "PROCESS SAFETY",
  "AspenTech",
  "PYTHON",
  "P&ID",
  "RELIABILITY",
]

/**
 * Infinite horizontal marquee used as a divider between page sections.
 * Pure CSS — the `.marquee` utilities live in globals.css.
 */
export function MarqueeDivider({
  items = DEFAULT_ITEMS,
  duration = "60s",
  direction = "left",
  className,
}: MarqueeDividerProps) {
  // Tile a few copies so the wrap is invisible at scaleX(1).
  const tiled = Array.from({ length: 4 }).flatMap(() => items)
  return (
    <section
      aria-hidden="true"
      className={`relative overflow-hidden border-y border-border/50 bg-background/40 py-6 ${className ?? ""}`.trim()}
    >
      {/* Fade-out masks at both edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div
        className={`marquee ${direction === "left" ? "marquee-left" : "marquee-right"} gap-10 md:gap-14`}
        style={{ animationDuration: duration }}
      >
        {tiled.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="shrink-0 text-xl md:text-2xl font-mono tracking-tight text-muted-foreground"
          >
            {word}
            <span className="mx-6 md:mx-10 text-muted-foreground/40" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}
