import Link from "next/link";
import { Page } from "@/components/site/footer";
import { SectionIndex } from "@/components/site/section-index";
import { SocialShare } from "./social-share";
import { RelatedArticles } from "./related-articles";
import { formatArticleDate } from "@/lib/articles";
import { Title } from "@/components/site/title";
import { ReadProgress } from "@/components/site/read-progress";
import { ArticleFigure } from "@/components/site/article-figure";

interface BlogPostLayoutProps {
  title: string;
  description: string;
  image?: string;
  content: { sections: { title: string; content: string[] }[] };
  date?: string;
  category?: string;
  slug?: string;
  sources?: { title: string; url: string }[];
}

export function BlogPostLayout({ title, description, content, date, category = "EPC LIFECYCLE", slug = "", sources }: BlogPostLayoutProps) {
  const url = `https://www.luqmanismat.com/blog/${slug}`;
  const words = content.sections.reduce((t, s) => t + s.content.join(" ").split(/\s+/).length, 0);
  const index = content.sections.map((s, i) => ({ id: `section-${i + 1}`, no: String(i + 1).padStart(2, "0"), label: s.title }));
  return (
    <Page>
      <ReadProgress />
      <article>
        <header className="art-head">
          <div className="crumbs">
            <Link className="label" href="/blog">
              ← Journal
            </Link>
            <span className="label">({category.toLowerCase()})</span>
          </div>
          <Title as="h1" text={title} pos="tl" className="art-title" />
          <p className="body lede" data-fade>
            {description}
          </p>
          <div className="art-meta">
            <span className="label">
              By <b>Luqman Ismat</b>
            </span>
            <span className="label">{date ? <time dateTime={date}>{formatArticleDate(date)}</time> : "From the archive"}</span>
            <span className="label">{Math.max(1, Math.ceil(words / 220))} min read</span>
            <div className="share">
              <SocialShare url={url} title={title} description={description} />
            </div>
          </div>
        </header>
        <figure className="art-figure af-figure" data-fade style={{ marginBottom: 0 }}>
          <ArticleFigure category={category} sections={content.sections.map((s) => ({ title: s.title, words: s.content.join(" ").split(/\s+/).length }))} />
        </figure>
        <div className="art-body">
          <SectionIndex items={index} title="(In this article)" />
          <div className="art-text">
            {content.sections.map((s, i) => (
              <section key={i} id={`section-${i + 1}`}>
                <p className="label art-no">
                  ({String(i + 1).padStart(2, "0")}) / {String(content.sections.length).padStart(2, "0")}
                </p>
                <h2>{s.title}</h2>
                {s.content.map((p, j) => (
                  <p key={j} data-fade>
                    {p}
                  </p>
                ))}
              </section>
            ))}
            {sources && (
              <section className="art-sources">
                <p className="label">(References)</p>
                <ul>
                  {sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <aside className="art-author" data-fade>
              <p className="label">(Written by)</p>
              <p className="h-m">Luqman Ismat</p>
              <p className="body">Industrial engineer, founder of TEN21 Consulting. Process engineering, process safety and project controls, then the software around them.</p>
              <div className="action-row">
                <Link className="btn ghost" href="/about">About</Link>
                <Link className="btn" href="/contact">Need this done? <span className="arrow" aria-hidden="true">↗</span></Link>
              </div>
            </aside>
          </div>
        </div>
      </article>
      {slug && <RelatedArticles currentCategory={category} currentSlug={slug} />}
      <div style={{ height: "clamp(110px, 14vw, 200px)" }} />
    </Page>
  );
}
