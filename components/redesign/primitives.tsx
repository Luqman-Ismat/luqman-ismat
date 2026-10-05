import Link from "next/link";
import { Fragment, type ReactNode, type CSSProperties } from "react";

/* Masked word-by-word headline reveal. Pass plain strings; wrap an accent
   phrase in <Accent> to set it in the serif italic. */
export function Reveal({
  as: Tag = "div",
  className,
  delay = 0,
  children,
}: {
  as?: "div" | "section" | "p" | "li" | "article" | "figure" | "header";
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <Tag className={className} data-reveal style={{ "--delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

export function Words({ text, start = 0, step = 45 }: { text: string; start?: number; step?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          <span className="word">
            <span style={{ "--d": `${start + i * step}ms` } as CSSProperties}>{word}</span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <em className="accent-serif">{children}</em>;
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="section-label">
      <span>({index})</span>
      {children}
    </p>
  );
}

export function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = (hidden: boolean) => (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item}>
          {item}
          <i aria-hidden="true">✺</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={reverse ? "marquee is-reverse" : "marquee"}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function PillLink({
  href,
  children,
  variant = "solid",
  cursor,
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost" | "accent";
  cursor?: string;
}) {
  return (
    <Link href={href} className={`pill pill-${variant}`} data-cursor={cursor}>
      <span className="pill-text" data-text={typeof children === "string" ? children : undefined}>
        {children}
      </span>
      <span className="pill-icon" aria-hidden="true">↗</span>
    </Link>
  );
}
