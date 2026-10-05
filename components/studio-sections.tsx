/* Shared page intro used by the journal, privacy and 404 pages. */
export function PageIntro({
  label,
  title,
  text,
  children,
}: {
  label: string;
  title: React.ReactNode;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="site-container page-intro">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      <div className="intro-bottom">
        <p>{text}</p>
        {children}
      </div>
    </section>
  );
}
