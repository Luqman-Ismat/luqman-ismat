import type { CSSProperties } from "react";

/* Letter roll: each letter slides up to an identical copy on hover.
   Screen readers get the plain text once. */
export function Roll({ text }: { text: string }) {
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ "--i": i } as CSSProperties}>
          <span>{ch === " " ? "\u00a0" : ch}</span>
          <span>{ch === " " ? "\u00a0" : ch}</span>
        </span>
      ))}
    </span>
  );
}

export function GridLines() {
  return (
    <div className="grid-lines" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
