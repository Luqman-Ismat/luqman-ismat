import { getArticles } from "@/lib/articles";
import { Page } from "@/components/site/footer";
import { InsightsIndex } from "@/components/insights-index";
import { Title } from "@/components/site/title";

export const metadata = {
  title: "Journal: engineering, projects and systems",
  description: "Practical articles on engineering methods, project delivery, technical tools and operations, by Luqman Ismat.",
  alternates: { canonical: "/blog" },
};

export default function Blog() {
  return (
    <Page>
      <header className="page-head">
        <Title as="h1" text="Notes from the work." pos="tl" className="page-title" />
        <p className="label page-label">(Journal)</p>
        <p className="body lede" data-fade>
          Engineering methods, project delivery and better ways to organize technical work. <b>Written from practice, not theory.</b>
        </p>
      </header>
      <InsightsIndex articles={getArticles()} />
    </Page>
  );
}
