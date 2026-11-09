import { getArticles } from "@/lib/articles";
import { Page } from "@/components/site/footer";
import { InsightsIndex } from "@/components/insights-index";

export const metadata = {
  title: "Journal: engineering, projects and systems",
  description: "Practical articles on engineering methods, project delivery, technical tools and operations, by Luqman Ismat.",
  alternates: { canonical: "/blog" },
};

export default function Blog() {
  return (
    <Page>
      <header className="page-head">
        <p className="label">(Journal)</p>
        <h1 className="h-xl" data-lines>
          Notes from the work.
        </h1>
        <p className="statement lede" data-lines data-delay="0.15">
          Engineering methods, project delivery and better ways to organize technical work. <b>Written from practice, not theory.</b>
        </p>
      </header>
      <InsightsIndex articles={getArticles()} />
    </Page>
  );
}
