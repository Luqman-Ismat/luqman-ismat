import { getArticles } from "@/lib/articles";
import { PageShell } from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
import { InsightsIndex } from "@/components/insights-index";
export const metadata = {
  title: "Blog | Engineering, Projects & Systems",
  description:
    "Practical articles on engineering workflows, project delivery, technical tools, and operations.",
  alternates: { canonical: "/blog" },
};
export default function Blog() {
  return (
    <PageShell>
      <PageIntro
        label="Blog / Engineering, projects & systems"
        title={
          <>
            Ideas worth
            <br />
            <span>putting to work.</span>
          </>
        }
        text="Engineering methods, project delivery, and better ways to organize technical work. Browse the archive or find a topic."
      />
      <InsightsIndex articles={getArticles()} />
    </PageShell>
  );
}
