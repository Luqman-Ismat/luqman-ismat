import { VaultCatalog } from "@/components/engivault/catalog";
import { catalogItems, disciplines } from "@/lib/engivault/catalog";
import { Title } from "@/components/site/title";

export const metadata = {
  title: "EngiVault: free engineering calculators",
  description:
    "Free engineering calculators for fluids, heat transfer and piping. Inputs, units, method and sources shown, checked against reference cases.",
  alternates: { canonical: "/engivault" },
};

export default function Page() {
  return (
    <>
      <header className="vault-head">
        <p className="label">(EngiVault)</p>
        <div className="copy">
          <Title as="h1" text="Calculations, worked in the open." pos="tl" className="page-title" />
          <p className="body" data-fade>
            <b>Explicit inputs and units, the method written out, and the sources cited.</b> Results update as you type. No account needed. Designed, built and maintained by Luqman Ismat at TEN21.
          </p>
        </div>
        <dl className="stats" data-fade>
          <div>
            <dt>Calculations</dt>
            <dd>{catalogItems.length}</dd>
          </div>
          <div>
            <dt>Disciplines</dt>
            <dd>{disciplines.length}</dd>
          </div>
          <div>
            <dt>Methods</dt>
            <dd>All</dd>
          </div>
        </dl>
      </header>
      <VaultCatalog items={catalogItems} />
    </>
  );
}
