import { notFound } from "next/navigation";
import { calculators } from "@/lib/engivault/calculator-data";
import { Calculator } from "@/components/engivault/calculator";
import { neighbours } from "@/lib/engivault/catalog";
export function generateStaticParams() {
  return Object.keys(calculators).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: calculators[slug]?.title ?? "Calculator",
    alternates: { canonical: `/engivault/calculators/${slug}` },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!Object.hasOwn(calculators, slug)) notFound();
  const n = neighbours(slug);
  return <Calculator key={slug} slug={slug} prev={n.prev} next={n.next} related={n.related} />;
}
