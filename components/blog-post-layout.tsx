import Link from "next/link";
import { Page } from "@/components/site/footer";
import { SectionIndex } from "@/components/site/section-index";
import { SocialShare } from "./social-share";
import { RelatedArticles } from "./related-articles";
import { formatArticleDate } from "@/lib/articles";

interface BlogPostLayoutProps {
  title: string;
  description: string;
  image: string;
  content: { sections: { title: string; content: string[] }[] };
  date?: string;
  category?: string;
  slug?: string;
  sources?: { title: string; url: string }[];
}

export function BlogPostLayout({ title, description, image, content, date, category = "EPC LIFECYCLE", slug = "", sources }: BlogPostLayoutProps) {
  const url = `https://www.luqmanismat.com/blog/${slug}`;
  const words = content.sections.reduce((t, s) => t + s.content.join(" ").split(/\s+/).length, 0);
  const index = content.sections.map((s, i) => ({ id: `section-${i + 1}`, no: String(i + 1).padStart(2, "0"), label: s.title }));
  return (
    <Page>
      <article>
        <header className="art-head">
          <div className="crumbs">
            <Link className="label" href="/blog">
              ← Journal
            </Link>
            <span className="label">({category.toLowerCase()})</span>
          </div>
          <h1 data-lines>{title}</h1>
          <p className="statement lede" data-lines data-delay="0.1">
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
        {image && (
          <figure className="art-figure" data-clip style={{ marginBottom: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
          </figure>
        )}
        <div className="art-body">
          <SectionIndex items={index} title="(In this article)" />
          <div className="art-text">
            {content.sections.map((s, i) => (
              <section key={i} id={`section-${i + 1}`}>
                <h2>{s.title}</h2>
                {s.content.map((p, j) => (
                  <p key={j}>{p}</p>
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
          </div>
        </div>
      </article>
      {slug && <RelatedArticles currentCategory={category} currentSlug={slug} />}
      <div style={{ height: "clamp(110px, 14vw, 200px)" }} />
    </Page>
  );
}
