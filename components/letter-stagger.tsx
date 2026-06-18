import type { CSSProperties } from "react"

interface LetterStaggerProps {
  text: string
  /** Base delay added before the first letter, in ms. */
  baseDelay?: number
  /** Optional className applied to the outer wrapping span. */
  className?: string
}

/**
 * Renders text where each visible character rises into place with a stagger.
 * Server-renderable — the animation is pure CSS keyed by `--letter-i`.
 * The whole word is exposed to screen readers via aria-label.
 */
export function LetterStagger({ text, baseDelay = 0, className }: LetterStaggerProps) {
  const chars = Array.from(text)
  return (
    <span className={`letters ${className ?? ""}`.trim()} aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="letter"
          aria-hidden="true"
          style={
            {
              "--letter-i": i,
              "--letter-base": `${baseDelay}ms`,
            } as CSSProperties
          }
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  )
}
