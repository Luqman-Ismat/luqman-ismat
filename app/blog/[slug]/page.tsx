import type { Metadata } from "next";
import { notFound } from "next/navigation";
import articles from "@/content/new-articles.json";
import { BlogPostLayout } from "@/components/blog-post-layout";

export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const article = articles.find((article) => article.slug === params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://www.luqmanismat.com/blog/${article.slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      url: `https://www.luqmanismat.com/blog/${article.slug}`,
    },
  };
}
export default async function ArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const article = articles.find((article) => article.slug === params.slug);
  if (!article) notFound();
  return (
    <BlogPostLayout {...article} content={{ sections: article.sections }} />
  );
}
