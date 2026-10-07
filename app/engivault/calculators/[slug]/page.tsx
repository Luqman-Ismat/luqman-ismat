import { notFound } from "next/navigation";
import { calculators } from "@/lib/engivault/calculator-data";
import { Calculator } from "@/components/engivault/calculator";
import { neighbours } from "@/lib/engivault/catalog";
import { CalculatorCta } from "@/components/engivault/calculator-cta";
export function generateStaticParams() {
  return Object.keys(calculators).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = calculators[slug];
  return {
    title: c?.title ?? "Calculator",
    description: c
      ? `${c.title}: a free ${c.category.toLowerCase()} calculator with explicit units, the method written out and cited sources. Results update as you type.`
      : undefined,
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
  return (
    <>
      <Calculator key={slug} slug={slug} prev={n.prev} next={n.next} related={n.related} />
      <CalculatorCta title={calculators[slug].title} />
    </>
  );
}
