import { Fragment, type ElementType } from "react";

/* Small, placed titles. Each letter sits in two wrappers: the outer one is
   assembled on entry, the inner one is scattered as the section leaves, so
   the two motions never fight. The plain text is there once for assistive
   technology and search. */
export function Title({
  as: Tag = "h2",
  text,
  id,
  className,
  pos = "tr",
}: {
  as?: ElementType;
  text: string;
  id?: string;
  className?: string;
  pos?: "tl" | "tr";
}) {
  const words = text.split(" ");
  return (
    <Tag id={id} className={className ? `ttl ${className}` : "ttl"} data-ttl data-pos={pos}>
      <span className="sr-only">{text}</span>
      <span className="ttl-v" aria-hidden="true">
        {words.map((w, wi) => (
          <Fragment key={wi}>
            <span className="ttl-w">
              {Array.from(w).map((c, ci) => (
                <span key={ci} className="ttl-c">
                  <span className="ttl-i">{c}</span>
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/* A section head: the label in one corner, the title in the other. */
export function SectionHead({
  label,
  title,
  id,
  pos = "tr",
}: {
  label: string;
  title: string;
  id?: string;
  pos?: "tl" | "tr";
}) {
  return (
    <div className={`sh sh-${pos}`}>
      <p className="label sh-label">{label}</p>
      <Title text={title} id={id} pos={pos} className="sh-title" />
    </div>
  );
}
