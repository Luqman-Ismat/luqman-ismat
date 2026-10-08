import { VaultCatalog } from "@/components/engivault/catalog";
import { catalogItems, disciplines } from "@/lib/engivault/catalog";
import { Accent, Words } from "@/components/redesign/primitives";
export const metadata = {
  title: "EngiVault: Free Engineering Calculators",
  description:
    "Engineering calculators for fluids, heat transfer and piping that show their inputs, units, method and sources, checked against reference cases. Free to use.",
  alternates: { canonical: "/engivault" },
};
export default function Page() {
  const sourced = catalogItems.length;
  return (
    <>
      <section className="site-container vault-hero">
        <div className="vault-hero-copy">
          <p className="section-label"><span>(EV)</span>EngiVault · Engineering workspace</p>
          <h1 className="vault-title" data-reveal>
            <span className="vault-wordmark-xl">ENGi<Accent>Vault</Accent></span>
          </h1>
          <p className="vault-lede" data-reveal>
            <Words text="Engineering calculations," /> <Accent>worked in the open.</Accent>
          </p>
          <p data-reveal>
            Explicit inputs and units, the method written out, and the sources cited. Results update as you type. No account needed.
          </p>
        </div>
        <dl className="vault-stats" data-reveal>
          <div><dt>Calculations</dt><dd>{sourced}</dd></div>
          <div><dt>Disciplines</dt><dd>{disciplines.length}</dd></div>
          <div><dt>Methods shown</dt><dd>All</dd></div>
        </dl>
      </section>
      <div className="site-container">
        <VaultCatalog items={catalogItems} />
      </div>
    </>
  );
}
